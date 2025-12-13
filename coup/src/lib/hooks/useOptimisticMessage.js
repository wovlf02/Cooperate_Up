'use client'

import { useState, useMemo } from 'react'
import { nanoid } from 'nanoid'

/**
 * 낙관적 업데이트 메시지 훅
 * 메시지 전송 시 즉시 UI에 표시하고, 실패 시 롤백
 *
 * @param {Array} serverMessages - 서버에서 받은 메시지 목록
 * @returns {Object}
 */
export function useOptimisticMessage(serverMessages = []) {
  // 임시 메시지 (전송 중인 메시지)
  const [pendingMessages, setPendingMessages] = useState([])
  // 실패한 메시지
  const [failedMessages, setFailedMessages] = useState([])

  /**
   * 전체 메시지 목록 (서버 + 대기 + 실패)
   */
  const allMessages = useMemo(() =>
    [
      ...serverMessages,
      ...pendingMessages,
      ...failedMessages
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [serverMessages, pendingMessages, failedMessages]
  )

  // API 함수들을 useMemo로 메모이제이션
  return useMemo(() => ({
    allMessages,
    pendingMessages,
    failedMessages,

    /**
     * 낙관적 메시지 추가
     */
    addOptimisticMessage: (messageData, user) => {
      const tempId = `temp-${nanoid()}`

      const optimisticMessage = {
        id: tempId,
        content: messageData.content,
        userId: user.id,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        createdAt: new Date().toISOString(),
        status: 'sending',
        ...messageData
      }

      setPendingMessages(prev => [...prev, optimisticMessage])
      return tempId
    },

    /**
     * 메시지 전송 성공 처리
     */
    confirmMessage: (tempId) => {
      setPendingMessages(prev =>
        prev.filter(msg => msg.id !== tempId)
      )
    },

    /**
     * 메시지 전송 실패 처리
     */
    failMessage: (tempId, error) => {
      setPendingMessages(prev => {
        const failedMsg = prev.find(msg => msg.id === tempId)
        if (failedMsg) {
          setFailedMessages(prevFailed => [
            ...prevFailed,
            {
              ...failedMsg,
              status: 'failed',
              error: {
                code: error.code,
                message: error.message,
                retryable: error.retryable
              }
            }
          ])
        }
        return prev.filter(msg => msg.id !== tempId)
      })
    },

    /**
     * 실패한 메시지 재시도
     */
    retryMessage: (messageId) => {
      const message = failedMessages.find(msg => msg.id === messageId)
      if (!message) return null

      setFailedMessages(prev => prev.filter(msg => msg.id !== messageId))

      const newTempId = `temp-${nanoid()}`
      const retryMessage = {
        ...message,
        id: newTempId,
        status: 'sending',
        error: undefined
      }

      setPendingMessages(prev => [...prev, retryMessage])

      return {
        tempId: newTempId,
        content: message.content
      }
    },

    /**
     * 실패한 메시지 삭제
     */
    removeFailedMessage: (messageId) => {
      setFailedMessages(prev => prev.filter(msg => msg.id !== messageId))
    },

    /**
     * 모든 임시/실패 메시지 초기화
     */
    clearOptimisticMessages: () => {
      setPendingMessages([])
      setFailedMessages([])
    }
  }), [allMessages, pendingMessages, failedMessages])
}

