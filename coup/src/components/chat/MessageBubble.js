'use client'

import { MessageError } from '@/components/ui'
import { Loader2 } from 'lucide-react'

/**
 * 메시지 버블 컴포넌트
 *
 * @param {Object} message - 메시지 객체
 * @param {boolean} isMyMessage - 내 메시지 여부
 * @param {Function} onRetry - 재시도 콜백
 * @param {Function} onDelete - 삭제 콜백
 */
export function MessageBubble({ message, isMyMessage, onRetry, onDelete }) {
  const isSending = message.status === 'sending'
  const isFailed = message.status === 'failed'

  return (
    <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* 발신자 정보 (다른 사람의 메시지만) */}
        {!isMyMessage && (
          <div className="flex items-center gap-2">
            <img
              src={message.user.avatar || '/cat.png'}
              alt={message.user.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium text-gray-700">
              {message.user.name}
            </span>
          </div>
        )}

        {/* 메시지 내용 */}
        <div className="relative">
          <div className={`px-4 py-2 rounded-lg ${
            isMyMessage 
              ? isFailed 
                ? 'bg-red-100 text-gray-900' 
                : 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-900'
          } ${isSending ? 'opacity-70' : ''}`}>
            <p className="whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* 전송 중 표시 */}
            {isSending && (
              <div className="flex items-center gap-1 mt-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs opacity-75">전송 중...</span>
              </div>
            )}
          </div>

          {/* 에러 표시 */}
          {isFailed && message.error && (
            <MessageError
              error={message.error}
              onRetry={() => onRetry?.(message.id)}
              onDelete={() => onDelete?.(message.id)}
            />
          )}
        </div>

        {/* 메타 정보 */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>
            {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {isMyMessage && message.readers && message.readers.length > 0 && (
            <span>읽음 {message.readers.length}</span>
          )}
        </div>
      </div>
    </div>
  )
}

