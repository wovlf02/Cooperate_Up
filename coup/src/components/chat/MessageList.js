'use client'

import { useRef, useEffect, useState } from 'react'
import { MessageBubble } from './MessageBubble'
import { EmptyState, LoadingSpinner } from '@/components/ui'
import { ChevronDown } from 'lucide-react'

/**
 * 메시지 리스트 컴포넌트
 *
 * @param {Array} messages - 메시지 목록
 * @param {Object} currentUser - 현재 사용자
 * @param {Function} onRetry - 메시지 재시도 콜백
 * @param {Function} onDelete - 메시지 삭제 콜백
 * @param {boolean} isLoading - 로딩 상태
 * @param {Array} typingUsers - 타이핑 중인 사용자
 */
export function MessageList({
  messages = [],
  currentUser,
  onRetry,
  onDelete,
  isLoading = false,
  typingUsers = []
}) {
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // 스크롤 위치 감지
  const handleScroll = () => {
    const container = messagesContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const atBottom = scrollHeight - scrollTop - clientHeight < 100
    setIsAtBottom(atBottom)
    setShowScrollButton(!atBottom && messages.length > 0)
  }

  // 아래로 스크롤
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  // 새 메시지 시 자동 스크롤 (아래에 있을 때만)
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom()
    }
  }, [messages, isAtBottom])

  // 초기 로드 시 즉시 스크롤
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('auto')
    }
  }, []) // 빈 배열: 마운트 시에만

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner message="메시지를 불러오는 중..." />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          type="messages"
          title="메시지가 없습니다"
          message="첫 메시지를 보내보세요!"
        />
      </div>
    )
  }

  return (
    <div className="relative flex-1 flex flex-col">
      {/* 메시지 목록 */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMyMessage={message.userId === currentUser?.id}
            onRetry={onRetry}
            onDelete={onDelete}
          />
        ))}

        {/* 타이핑 인디케이터 */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>
              {typingUsers.map(u => u.user?.name || u.name).join(', ')}님이 입력 중...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 최신 메시지로 이동 버튼 */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-4 right-4 bg-indigo-600 text-white rounded-full p-2 shadow-lg hover:bg-indigo-700 transition-colors"
          title="최신 메시지로"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

