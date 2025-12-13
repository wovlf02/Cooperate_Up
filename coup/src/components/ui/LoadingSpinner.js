'use client'

import { Loader2 } from 'lucide-react'

/**
 * 로딩 스피너 컴포넌트
 *
 * @param {string} size - 크기 (sm, md, lg)
 * @param {string} message - 로딩 메시지
 * @param {boolean} fullScreen - 전체 화면 오버레이 여부
 */
export function LoadingSpinner({
  size = 'md',
  message,
  fullScreen = false
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-600`} />
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

/**
 * 인라인 로딩 스피너
 * 버튼 등에 사용
 */
export function InlineSpinner({ size = 'sm' }) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin`} />
  )
}

