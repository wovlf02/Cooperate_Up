'use client'

import { useEffect, useCallback, useState } from 'react'
import { useSocket } from '@/contexts/SocketContext'
import { ChatMessageException, ChatSyncException } from '@/lib/exceptions/chat'
import { handleChatError } from '@/lib/utils/chat'
import { logChatError, logChatWarning, logChatInfo } from '@/lib/utils/chat/errorLogger'

/**
 * 스터디 소켓 훅
 * 
 * @param {string} studyId - 스터디 ID
 * @returns {Object} 온라인 사용자 목록 및 연결 상태
 */
export function useStudySocket(studyId) {
  const { socket, isConnected, connectionState, connectionError } = useSocket()
  const [onlineUsers, setOnlineUsers] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!socket || !isConnected || !studyId) {
      if (studyId && !isConnected) {
        logChatInfo('Study socket: Waiting for connection', { studyId })
      }
      return
    }

    try {
      // 스터디 룸 참여
      logChatInfo('Study socket: Joining study room', { studyId })
      socket.emit('study:join', studyId)

      // 온라인 사용자 목록 수신
      socket.on('study:online-users', (data) => {
        try {
          if (data.studyId === studyId) {
            logChatInfo('Study socket: Received online users', { 
              studyId, 
              count: data.users?.length 
            })
            setOnlineUsers(data.users || [])
            setError(null)
          }
        } catch (err) {
          const error = ChatSyncException.eventLost('study:online-users', {
            studyId,
            originalError: err.message
          })
          setError(handleChatError(error))
          logChatError(err, { event: 'study:online-users', studyId })
        }
      })

      // 사용자 온라인
      socket.on('user:online', (data) => {
        try {
          if (!data?.userId) {
            logChatWarning('Study socket: Invalid user:online data', { studyId })
            const error = ChatSyncException.eventLost('user:online', {
              studyId,
              originalError: 'Missing userId'
            })
            setError(handleChatError(error))
            return
          }

          logChatInfo('Study socket: User came online', { 
            userId: data.userId 
          })

          setOnlineUsers(prev => {
            if (prev.find(u => u.userId === data.userId)) {
              return prev
            }
            return [...prev, { userId: data.userId, ...data.user }]
          })
        } catch (err) {
          const error = ChatSyncException.eventLost('user:online', {
            studyId,
            userId: data?.userId,
            originalError: err.message
          })
          setError(handleChatError(error))
          logChatError(err, { event: 'user:online', studyId })
        }
      })

      // 사용자 오프라인
      socket.on('user:offline', (data) => {
        try {
          if (!data?.userId) {
            logChatWarning('Study socket: Invalid user:offline data', { studyId })
            const error = ChatSyncException.eventLost('user:offline', {
              studyId,
              originalError: 'Missing userId'
            })
            setError(handleChatError(error))
            return
          }

          logChatInfo('Study socket: User went offline', { 
            userId: data.userId 
          })

          setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId))
        } catch (err) {
          const error = ChatSyncException.eventLost('user:offline', {
            studyId,
            userId: data?.userId,
            originalError: err.message
          })
          setError(handleChatError(error))
          logChatError(err, { event: 'user:offline', studyId })
        }
      })

      // 에러 처리
      socket.on('error', (errorData) => {
        logChatError(new Error(errorData.message || 'Socket error'), {
          event: 'study socket error',
          studyId
        })
      })

    } catch (err) {
      logChatError(err, { component: 'useStudySocket', studyId })
      // setState를 비동기로 호출
      Promise.resolve().then(() => {
        setError(handleChatError(err))
      })
    }

    return () => {
      try {
        logChatInfo('Study socket: Leaving study room', { studyId })
        socket.emit('study:leave', studyId)
        socket.off('study:online-users')
        socket.off('user:online')
        socket.off('user:offline')
        socket.off('error')
      } catch (err) {
        logChatError(err, { 
          component: 'useStudySocket cleanup', 
          studyId 
        })
      }
    }
  }, [socket, isConnected, studyId])

  return {
    onlineUsers,
    isConnected,
    connectionState,
    connectionError,
    error,
  }
}

/**
 * 채팅 소켓 훅
 * 
 * @param {string} studyId - 스터디 ID
 * @returns {Object} 채팅 관련 기능 및 상태
 */
export function useChatSocket(studyId) {
  const { socket, isConnected, connectionState } = useSocket()
  const [newMessage, setNewMessage] = useState(null)
  const [typingUsers, setTypingUsers] = useState([])
  const [error, setError] = useState(null)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!socket || !isConnected || !studyId) {
      if (studyId && !isConnected) {
        logChatInfo('Chat socket: Waiting for connection', { studyId })
      }
      return
    }

    try {
      // 새 메시지 수신
      socket.on('chat:new-message', (message) => {
        try {
          if (!message?.id) {
            logChatWarning('Chat socket: Invalid message data', { studyId })
            const error = ChatSyncException.eventLost('chat:new-message', {
              studyId,
              originalError: 'Missing message id'
            })
            setError(handleChatError(error))
            return
          }

          logChatInfo('Chat socket: New message received', {
            messageId: message.id,
            studyId: message.studyId
          })

          setNewMessage(message)
          setError(null)
        } catch (err) {
          const error = ChatSyncException.eventLost('chat:new-message', {
            studyId,
            originalError: err.message
          })
          setError(handleChatError(error))
          logChatError(err, { event: 'chat:new-message', studyId })
        }
      })

      // 메시지 읽음 상태 업데이트
      socket.on('chat:message-read', (data) => {
        try {
          if (!data?.messageId) {
            logChatWarning('Chat socket: Invalid message-read data', { studyId })
            const error = ChatSyncException.markAsReadFailed(null, {
              studyId,
              originalError: 'Missing messageId'
            })
            setError(handleChatError(error))
            return
          }

          logChatInfo('Chat socket: Message read', {
            messageId: data.messageId
          })
          
          // 부모 컴포넌트에서 처리하도록 이벤트 전달
          // (newMessage state로 전달할 수 있음)
        } catch (err) {
          const error = ChatSyncException.markAsReadFailed(data?.messageId, {
            studyId,
            originalError: err.message
          })
          setError(handleChatError(error))
          logChatError(err, { event: 'chat:message-read', studyId })
        }
      })

      // 타이핑 상태 수신
      socket.on('chat:user-typing', (data) => {
        try {
          if (!data?.userId || typeof data?.isTyping !== 'boolean') {
            logChatWarning('Chat socket: Invalid typing data', { studyId, data })
            const error = ChatSyncException.typingSyncFailed({
              studyId,
              userId: data?.userId,
              originalError: 'Invalid typing data format'
            })
            setError(handleChatError(error))
            return
          }

          if (data.isTyping) {
            setTypingUsers(prev => {
              if (prev.find(u => u.userId === data.userId)) return prev
              return [...prev, data]
            })
          } else {
            setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
          }
        } catch (err) {
          const error = ChatSyncException.typingSyncFailed({
            studyId,
            userId: data?.userId,
            originalError: err.message
          })
          setError(handleChatError(error))
          logChatError(err, { event: 'chat:user-typing', studyId })
        }
      })

      // 에러 처리
      socket.on('error', (errorData) => {
        logChatError(new Error(errorData.message || 'Socket error'), {
          event: 'chat socket error',
          studyId
        })
      })

    } catch (err) {
      logChatError(err, { component: 'useChatSocket', studyId })
      // setState를 비동기로 호출
      Promise.resolve().then(() => {
        setError(handleChatError(err))
      })
    }

    return () => {
      try {
        socket.off('chat:new-message')
        socket.off('chat:message-read')
        socket.off('chat:user-typing')
        socket.off('error')
      } catch (err) {
        logChatError(err, { 
          component: 'useChatSocket cleanup', 
          studyId 
        })
      }
    }
  }, [socket, isConnected, studyId])

  /**
   * 메시지 전송
   */
  const sendMessage = useCallback(async (content, fileId = null) => {
    if (!socket || !isConnected) {
      const error = ChatMessageException.sendFailedNetwork({
        reason: 'Socket not connected',
        studyId
      })
      setError(handleChatError(error))
      return { success: false, error }
    }

    // 빈 메시지 검증
    if (!content || content.trim().length === 0) {
      const error = ChatMessageException.emptyContent({ studyId })
      setError(handleChatError(error))
      return { success: false, error }
    }

    // 길이 검증
    if (content.length > 2000) {
      const error = ChatMessageException.contentTooLong(content.length, 2000, { studyId })
      setError(handleChatError(error))
      return { success: false, error }
    }

    try {
      setIsSending(true)
      setError(null)

      logChatInfo('Chat socket: Sending message', {
        studyId,
        contentLength: content.length,
        hasFile: !!fileId
      })

      // 타임아웃과 함께 메시지 전송
      const sendPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Message send timeout'))
        }, 10000) // 10초 타임아웃

        socket.emit('chat:message', {
          studyId,
          content,
          fileId
        }, (response) => {
          clearTimeout(timeout)
          if (response?.error) {
            reject(new Error(response.error))
          } else {
            resolve(response)
          }
        })
      })

      await sendPromise
      
      logChatInfo('Chat socket: Message sent successfully', { studyId })
      setIsSending(false)
      return { success: true }

    } catch (err) {
      logChatError(err, { 
        component: 'sendMessage', 
        studyId,
        contentLength: content.length 
      })

      const error = err.message.includes('timeout')
        ? ChatMessageException.sendFailedNetwork({ 
            reason: 'Timeout', 
            studyId 
          })
        : ChatMessageException.sendFailedServer({ 
            reason: err.message, 
            studyId 
          })

      setError(handleChatError(error))
      setIsSending(false)
      return { success: false, error }
    }
  }, [socket, isConnected, studyId])

  /**
   * 메시지 읽음 처리
   */
  const markAsRead = useCallback((messageId) => {
    if (!socket || !isConnected) {
      logChatWarning('Chat socket: Cannot mark as read - not connected', {
        messageId,
        studyId
      })
      return { success: false }
    }

    if (!messageId) {
      logChatWarning('Chat socket: Invalid messageId for markAsRead')
      return { success: false }
    }

    try {
      logChatInfo('Chat socket: Marking message as read', {
        messageId,
        studyId
      })

      socket.emit('chat:read', {
        messageId
      })

      return { success: true }
    } catch (err) {
      logChatError(err, { 
        component: 'markAsRead', 
        messageId,
        studyId 
      })

      const error = ChatSyncException.markAsReadFailed(messageId, {
        studyId,
        originalError: err.message
      })
      setError(handleChatError(error))
      return { success: false, error }
    }
  }, [socket, isConnected, studyId])

  /**
   * 타이핑 상태 전송
   */
  const setTyping = useCallback((isTyping) => {
    if (!socket || !isConnected) {
      // 타이핑 상태는 중요하지 않으므로 에러 로깅만
      return
    }

    if (typeof isTyping !== 'boolean') {
      logChatWarning('Chat socket: Invalid isTyping value', { isTyping })
      return
    }

    try {
      socket.emit('chat:typing', {
        studyId,
        isTyping
      })
    } catch (err) {
      // 타이핑 상태는 실패해도 괜찮으므로 경고만
      logChatWarning('Chat socket: Failed to send typing status', {
        isTyping,
        studyId,
        error: err.message
      })
    }
  }, [socket, isConnected, studyId])

  return {
    newMessage,
    typingUsers,
    sendMessage,
    markAsRead,
    setTyping,
    isConnected,
    connectionState,
    isSending,
    error,
  }
}

