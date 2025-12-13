'use client'

import { useEffect, useState } from 'react'
import { useChatSocket, useStudySocket } from '@/lib/hooks/useStudySocket'
import { useSocket } from '@/contexts/SocketContext'
import { useErrorHandler } from '@/lib/hooks/useErrorHandler'
import { useOptimisticMessage } from '@/lib/hooks/useOptimisticMessage'
import { MessageList, MessageInput } from '@/components/chat'
import { ErrorToast, ConnectionBanner } from '@/components/ui'
import { ChatMessageException } from '@/lib/exceptions/chat-exceptions'
import { logChatError, logChatInfo } from '@/lib/utils/chat-logger'

/**
 * 실시간 채팅 컴포넌트 (예외 처리 통합)
 * Phase 4: 컴포넌트 레벨 예외 처리 적용
 *
 * @param {string} studyId - 스터디 ID
 * @param {Array} initialMessages - 초기 메시지 목록
 */
export default function RealtimeChat({ studyId, initialMessages = [] }) {
  const { user, connectionState, connectionError, reconnect } = useSocket()
  const [serverMessages, setServerMessages] = useState(initialMessages)
  const [isSending, setIsSending] = useState(false)

  // 에러 처리 훅
  const { error, showError, clearError, handleError } = useErrorHandler()

  // 낙관적 업데이트 훅
  const {
    allMessages,
    addOptimisticMessage,
    confirmMessage,
    failMessage,
    retryMessage,
    removeFailedMessage
  } = useOptimisticMessage(serverMessages)

  // Socket 훅
  const { onlineUsers } = useStudySocket(studyId)
  const {
    newMessage,
    typingUsers,
    sendMessage: socketSendMessage,
    markAsRead,
    setTyping,
    isConnected,
    error: socketError
  } = useChatSocket(studyId)

  // 새 메시지 수신 처리
  useEffect(() => {
    if (newMessage) {
      setServerMessages(prev => {
        // 중복 방지
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev
        }
        return [...prev, newMessage]
      })

      // 자동 읽음 처리 (본인 메시지가 아닌 경우)
      if (newMessage.userId !== user?.id) {
        setTimeout(() => {
          try {
            markAsRead(newMessage.id)
          } catch (err) {
            logChatError('Failed to mark message as read', { messageId: newMessage.id, error: err })
          }
        }, 500)
      }

      logChatInfo('New message received', { messageId: newMessage.id })
    }
  }, [newMessage, user?.id, markAsRead])

  // Socket 에러 처리
  useEffect(() => {
    if (socketError) {
      handleError(socketError, {
        context: { studyId, component: 'RealtimeChat' }
      })
    }
  }, [socketError, handleError, studyId])

  /**
   * 메시지 전송
   */
  const handleSendMessage = async (content) => {
    if (!content.trim()) {
      return
    }

    if (!isConnected) {
      showError(
        ChatMessageException.sendWhileDisconnected({ studyId }),
        { action: 'send_message' }
      )
      return
    }

    if (!user) {
      showError(
        ChatMessageException.unauthorized({ studyId }),
        { action: 'send_message' }
      )
      return
    }

    // 낙관적 업데이트: 즉시 UI에 표시
    const tempId = addOptimisticMessage({ content }, user)
    setIsSending(true)

    try {
      // Socket으로 메시지 전송
      const result = await socketSendMessage(content)

      if (result.success) {
        // 성공: 임시 메시지 제거 (서버 메시지로 대체됨)
        confirmMessage(tempId, result.message)
        logChatInfo('Message sent successfully', {
          tempId,
          messageId: result.message?.id
        })
      } else {
        throw new Error(result.error || '메시지 전송 실패')
      }
    } catch (err) {
      // 실패: 에러 표시 및 실패 목록에 추가
      const exception = ChatMessageException.sendFailed(
        err.message,
        { studyId, content, tempId }
      )

      failMessage(tempId, exception)
      handleError(exception, {
        silent: true, // 메시지 버블에 인라인으로 표시되므로 토스트는 표시 안 함
        context: { tempId }
      })
    } finally {
      setIsSending(false)
    }
  }

  /**
   * 실패한 메시지 재시도
   */
  const handleRetryMessage = async (messageId) => {
    const retryData = retryMessage(messageId)
    if (!retryData) {
      return
    }

    setIsSending(true)

    try {
      const result = await socketSendMessage(retryData.content)

      if (result.success) {
        confirmMessage(retryData.tempId, result.message)
        logChatInfo('Message retry successful', {
          originalId: messageId,
          newId: result.message?.id
        })
      } else {
        throw new Error(result.error || '메시지 재전송 실패')
      }
    } catch (err) {
      const exception = ChatMessageException.sendFailed(
        err.message,
        { studyId, content: retryData.content, tempId: retryData.tempId }
      )

      failMessage(retryData.tempId, exception)
      showError(exception, { action: 'retry_message' })
    } finally {
      setIsSending(false)
    }
  }

  /**
   * 실패한 메시지 삭제
   */
  const handleDeleteMessage = (messageId) => {
    removeFailedMessage(messageId)
    logChatInfo('Failed message deleted', { messageId })
  }

  /**
   * 타이핑 상태 전송
   */
  const handleTyping = (isTyping) => {
    if (isConnected) {
      try {
        setTyping(isTyping)
      } catch (err) {
        logChatError('Failed to send typing status', { error: err })
      }
    }
  }

  /**
   * 재연결 시도
   */
  const handleReconnect = () => {
    try {
      reconnect()
      logChatInfo('Manual reconnection initiated', { studyId })
    } catch (err) {
      showError(
        ChatMessageException.sendFailed(
          '재연결에 실패했습니다',
          { studyId, error: err }
        )
      )
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 연결 상태 배너 */}
      <ConnectionBanner
        connectionState={connectionState}
        error={connectionError}
        onRetry={handleReconnect}
        reconnectAttempt={0}
      />

      {/* 온라인 사용자 정보 */}
      {isConnected && (
        <div className="px-4 py-2 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">
                실시간 연결됨
              </span>
            </div>
            <div className="text-sm text-gray-600">
              온라인: {onlineUsers.length}명
            </div>
          </div>
        </div>
      )}

      {/* 메시지 목록 */}
      <MessageList
        messages={allMessages}
        currentUser={user}
        onRetry={handleRetryMessage}
        onDelete={handleDeleteMessage}
        isLoading={false}
        typingUsers={typingUsers}
      />

      {/* 메시지 입력 */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
        isSending={isSending}
        onTyping={handleTyping}
      />

      {/* 에러 토스트 */}
      {error && (
        <ErrorToast
          error={error}
          onRetry={error.retryable ? handleReconnect : undefined}
          onDismiss={clearError}
          duration={5000}
        />
      )}
    </div>
  )
}
