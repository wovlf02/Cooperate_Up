'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

/**
 * 좌측 네비게이션 사이드바
 * - 일반 사용자: 대시보드, 스터디 탐색, 내 스터디, 할일, 알림, 마이페이지
 * - 폭: 15% (Desktop), 12% (Tablet), 햄버거 메뉴 (Mobile)
 */
export default function Sidebar({ isAdmin = false, isOpen = false, onClose }) {
  const pathname = usePathname()

  // 일반 사용자 메뉴
  const userMenuItems = [
    { id: 'dashboard', name: '대시보드', icon: '🏠', path: '/dashboard' },
    { id: 'explore', name: '스터디 탐색', icon: '🔍', path: '/studies' },
    { id: 'my-studies', name: '내 스터디', icon: '👥', path: '/my-studies' },
    { id: 'tasks', name: '할 일', icon: '📋', path: '/tasks' },
    { id: 'notifications', name: '알림', icon: '🔔', path: '/notifications' },
    { id: 'my-page', name: '마이페이지', icon: '👤', path: '/me' }
  ]

  // 관리자 메뉴
  const adminMenuItems = [
    { id: 'admin-dashboard', name: '대시보드', icon: '📊', path: '/admin' },
    { id: 'admin-users', name: '사용자 관리', icon: '👥', path: '/admin/users' },
    { id: 'admin-studies', name: '스터디 관리', icon: '📚', path: '/admin/studies' },
    { id: 'admin-reports', name: '신고 관리', icon: '⚠️', path: '/admin/reports' },
    { id: 'admin-analytics', name: '통계 분석', icon: '📈', path: '/admin/analytics' },
    { id: 'admin-settings', name: '시스템 설정', icon: '⚙️', path: '/admin/settings' }
  ]

  const menuItems = isAdmin ? adminMenuItems : userMenuItems

  const isActive = (path) => {
    if (path === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(path)
  }

  return (
    <aside className={`${styles.sidebar} ${isAdmin ? styles.admin : ''} ${isOpen ? styles.open : ''}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <Link href={isAdmin ? '/admin' : '/dashboard'} onClick={onClose}>
          <Image
            src="/mainlogo.png"
            alt="CoUp"
            width={140}
            height={46}
            className={styles.logoImage}
            priority
          />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className={styles.nav}>
        {menuItems.map(item => (
          <Link
            key={item.id}
            href={item.path}
            className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
            onClick={onClose}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navText}>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className={styles.bottom}>
        {isAdmin && (
          <Link href="/dashboard" className={styles.navItem} onClick={onClose}>
            <span className={styles.navIcon}>🏠</span>
            <span className={styles.navText}>메인으로</span>
          </Link>
        )}
        <Link href="/settings" className={styles.navItem} onClick={onClose}>
          <span className={styles.navIcon}>⚙️</span>
          <span className={styles.navText}>설정</span>
        </Link>
        <button className={`${styles.navItem} ${styles.logoutButton}`} onClick={onClose}>
          <span className={styles.navIcon}>🚪</span>
          <span className={styles.navText}>로그아웃</span>
        </button>
      </div>
    </aside>
  )
}
