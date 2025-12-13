'use client'

import { useEffect } from 'react'
import { X, AlertCircle, Wifi, RefreshCw } from 'lucide-react'

/**
 * 에러 토스트 컴포넌트
 *
 * @param {Object} error - 에러 객체 { code, message, retryable }
 * @param {Function} onRetry - 재시도 콜백
 * @param {Function} onDismiss - 닫기 콜백
 * @param {number} duration - 자동 닫기 시간 (ms, 기본 5000)
 */
export function ErrorToast({ error, onRetry, onDismiss, duration = 5000 }) {
  useEffect(() => {
    if (duration && onDismiss) {
      const timer = setTimeout(onDismiss, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onDismiss])

  if (!error) return null

  // 에러 유형별 아이콘
  const getIcon = () => {
    if (error.code?.startsWith('CHAT-CONN-')) {
      return <Wifi className="h-5 w-5" />
    }
    return <AlertCircle className="h-5 w-5" />
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4 max-w-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-red-500">
            {getIcon()}
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              {error.message}
            </p>

            {error.code && (
              <p className="text-xs text-red-600 mt-1">
                코드: {error.code}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {error.retryable && onRetry && (
              <button
                onClick={onRetry}
                className="text-red-700 hover:text-red-900 p-1 rounded hover:bg-red-100"
                title="재시도"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-700 hover:text-red-900 p-1 rounded hover:bg-red-100"
                title="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

