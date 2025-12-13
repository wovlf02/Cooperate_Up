'use client'

import { MessageSquare, AlertCircle, Search, Inbox } from 'lucide-react'

/**
 * 빈 상태 표시 컴포넌트
 *
 * @param {string} type - 타입 (messages, error, search, empty)
 * @param {string} title - 제목
 * @param {string} message - 메시지
 * @param {ReactNode} action - 액션 버튼 또는 요소
 */
export function EmptyState({
  type = 'empty',
  title,
  message,
  action
}) {
  const getIcon = () => {
    switch (type) {
      case 'messages':
        return <MessageSquare className="h-12 w-12 text-gray-400" />
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-400" />
      case 'search':
        return <Search className="h-12 w-12 text-gray-400" />
      case 'empty':
      default:
        return <Inbox className="h-12 w-12 text-gray-400" />
    }
  }

  const getDefaultContent = () => {
    switch (type) {
      case 'messages':
        return {
          title: '메시지가 없습니다',
          message: '첫 메시지를 보내보세요!'
        }
      case 'error':
        return {
          title: '오류가 발생했습니다',
          message: '잠시 후 다시 시도해주세요'
        }
      case 'search':
        return {
          title: '검색 결과가 없습니다',
          message: '다른 키워드로 검색해보세요'
        }
      case 'empty':
      default:
        return {
          title: '내용이 없습니다',
          message: ''
        }
    }
  }

  const defaults = getDefaultContent()

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        {getIcon()}
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || defaults.title}
      </h3>

      {(message || defaults.message) && (
        <p className="text-sm text-gray-500 max-w-sm mb-4">
          {message || defaults.message}
        </p>
      )}

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}

