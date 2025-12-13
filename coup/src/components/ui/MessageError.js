'use client'

import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react'

/**
 * 메시지 에러 인라인 표시 컴포넌트
 * 메시지 전송 실패 시 메시지 버블 내부에 표시
 *
 * @param {Object} error - 에러 객체 { code, message, retryable }
 * @param {Function} onRetry - 재시도 콜백
 * @param {Function} onDelete - 삭제 콜백
 */
export function MessageError({ error, onRetry, onDelete }) {
  if (!error) return null

  return (
    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />

        <div className="flex-1 min-w-0">
          <p className="text-xs text-red-800 font-medium">
            전송 실패
          </p>
          <p className="text-xs text-red-600 mt-0.5">
            {error.message}
          </p>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className="p-1 text-red-700 hover:text-red-900 hover:bg-red-100 rounded transition-colors"
              title="재시도"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-red-700 hover:text-red-900 hover:bg-red-100 rounded transition-colors"
              title="삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

