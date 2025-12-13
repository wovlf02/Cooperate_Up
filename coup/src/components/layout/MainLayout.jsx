'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import styles from './MainLayout.module.css'

/**
 * 메인 레이아웃
 * - 좌측 네비게이션 + 상단 헤더 + 콘텐츠 영역
 * - 인증된 사용자용 레이아웃
 */
export default function MainLayout({ children, isAdmin = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <Sidebar isAdmin={isAdmin} isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={handleCloseSidebar}
          aria-label="닫기"
        />
      )}

      {/* Header */}
      <Header onMenuToggle={handleMenuToggle} />

      {/* Main Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
