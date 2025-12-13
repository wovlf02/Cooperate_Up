'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { InlineSpinner } from '@/components/ui'

/**
 * 메시지 입력 컴포넌트
 *
 * @param {Function} onSendMessage - 메시지 전송 콜백
 * @param {boolean} isConnected - 연결 상태
 * @param {boolean} isSending - 전송 중 상태
 * @param {Function} onTyping - 타이핑 상태 변경 콜백
 */
export function MessageInput({
  onSendMessage,
  isConnected = false,
  isSending = false,
  onTyping
}) {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)
  const inputRef = useRef(null)

  // 입력 변경 핸들러
  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)

    if (!isConnected) return

    // 타이핑 시작
    if (!isTyping && value.trim()) {
      setIsTyping(true)
      onTyping?.(true)
    }

    // 타이핑 상태 자동 해제 (3초)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        onTyping?.(false)
      }, 3000)
    } else {
      // 입력값이 비었으면 즉시 타이핑 해제
      setIsTyping(false)
      onTyping?.(false)
    }
  }

  // 메시지 전송
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!inputValue.trim() || !isConnected || isSending) return

    onSendMessage(inputValue.trim())
    setInputValue('')

    // 타이핑 상태 해제
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    setIsTyping(false)
    onTyping?.(false)

    // 포커스 유지
    inputRef.current?.focus()
  }

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const canSend = inputValue.trim() && isConnected && !isSending

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={
            !isConnected
              ? "연결 중..."
              : isSending
                ? "전송 중..."
                : "메시지를 입력하세요..."
          }
          disabled={!isConnected || isSending}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!canSend}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-w-[100px] justify-center"
        >
          {isSending ? (
            <>
              <InlineSpinner />
              <span>전송 중</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>전송</span>
            </>
          )}
        </button>
      </div>

      {/* 글자 수 표시 */}
      {inputValue.length > 800 && (
        <div className="mt-2 text-xs text-gray-500 text-right">
          {inputValue.length} / 1000
        </div>
      )}
    </form>
  )
}

