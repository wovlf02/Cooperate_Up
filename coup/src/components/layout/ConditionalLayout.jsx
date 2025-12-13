'use client'

import { usePathname } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'

/**
 * 조건부 레이아웃 래퍼
 * - 로그인/회원가입/랜딩/법적/관리자 페이지: 네비게이션 없음
 * - 나머지 모든 페이지: MainLayout (네비게이션 + 헤더) 적용
 */
export default function ConditionalLayout({ children }) {
  const pathname = usePathname()

  // 네비게이션을 표시하지 않을 경로들
  const noLayoutPaths = [
    '/', // 랜딩 페이지
    '/sign-in',
    '/sign-up',
    '/privacy',
    '/terms',
    '/admin' // 관리자 페이지 (AdminLayout 사용)
  ]

  // 현재 경로가 제외 목록에 있는지 확인
  const shouldShowLayout = !noLayoutPaths.some(path => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  })

  if (!shouldShowLayout) {
    return <>{children}</>
  }

  return <MainLayout>{children}</MainLayout>
}

