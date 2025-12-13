'use client'

import { useState, useMemo } from 'react'
import { logChatError, logChatWarning } from '@/lib/utils/chat-logger'

/**
 * 에러 처리 훅
 * 에러 상태 관리 및 토스트 표시
 *
 * @returns {Object} - { error, showError, clearError, handleError }
 */
export function useErrorHandler() {
  const [error, setError] = useState(null)

  return useMemo(() => ({
    error,

    /**
     * 에러 표시
     */
    showError: (err, context = {}) => {
      const errorInfo = {
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || '알 수 없는 오류가 발생했습니다',
        retryable: err.retryable !== false,
        timestamp: new Date().toISOString(),
        ...context
      }

      setError(errorInfo)
      logChatError('Error displayed to user', errorInfo)
    },

    /**
     * 에러 초기화
     */
    clearError: () => {
      setError(null)
    },

    /**
     * 에러 핸들링 (try-catch에서 사용)
     */
    handleError: (err, options = {}) => {
      const { silent = false, context = {}, onError } = options

      if (onError) {
        onError(err)
      }

      if (err.retryable === false) {
        logChatError('Non-retryable error occurred', { error: err, context })
      } else {
        logChatWarning('Retryable error occurred', { error: err, context })
      }

      if (!silent) {
        const errorInfo = {
          code: err.code || 'UNKNOWN_ERROR',
          message: err.message || '알 수 없는 오류가 발생했습니다',
          retryable: err.retryable !== false,
          timestamp: new Date().toISOString(),
          ...context
        }
        setError(errorInfo)
        logChatError('Error displayed to user', errorInfo)
      }
    }
  }), [error])
}

