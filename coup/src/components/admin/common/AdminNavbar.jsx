'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  NotificationDropdown,
  ProfileDropdown,
  MobileMenu,
  DesktopMenu
} from './navbar'
import styles from './AdminNavbar.module.css'

const menuItems = [
  { label: '대시보드', href: '/admin', exact: true },
  { label: '사용자', href: '/admin/users' },
  { label: '스터디', href: '/admin/studies' },
  { label: '신고', href: '/admin/reports' },
  { label: '분석', href: '/admin/analytics' },
  { label: '설정', href: '/admin/settings', superAdminOnly: true },
  { label: '감사 로그', href: '/admin/audit-logs', superAdminOnly: true }
]

export default function AdminNavbar({ user, adminRole }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showProfile, setShowProfile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [notifications] = useState([
    { id: 1, type: 'report', message: '새로운 신고가 접수되었습니다', time: '5분 전', unread: true },
    { id: 2, type: 'user', message: '새로운 사용자가 가입했습니다', time: '1시간 전', unread: true },
    { id: 3, type: 'system', message: '시스템 업데이트가 완료되었습니다', time: '2시간 전', unread: false },
  ])

  const isSuperAdmin = adminRole.role === 'SUPER_ADMIN'
  const unreadCount = notifications.filter(n => n.unread).length

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ESC 키로 드롭다운 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowProfile(false)
        setShowNotifications(false)
        setShowMobileMenu(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const isActive = (item) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  const filteredMenuItems = menuItems.filter(item =>
    !item.superAdminOnly || isSuperAdmin
  )

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href="/admin" className={styles.logo}>
            <Image src="/mainlogo.png" alt="CoUp" width={120} height={40} />
          </Link>

          <DesktopMenu
            menuItems={filteredMenuItems}
            isActive={isActive}
          />
        </div>

        <div className={styles.right}>
          {/* 알림 버튼 */}
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            setShowProfile={setShowProfile}
          />

          {/* 사이트 이동 버튼 */}
          <button
            className={styles.iconButton}
            onClick={() => router.push('/dashboard')}
            title="사이트로 이동"
            aria-label="사이트로 이동"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3L3 9V17H7V13H13V17H17V9L10 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 프로필 */}
          <ProfileDropdown
            user={user}
            adminRole={adminRole}
            showProfile={showProfile}
            setShowProfile={setShowProfile}
            setShowNotifications={setShowNotifications}
          />

          {/* 모바일 메뉴 버튼 */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => {
              setShowMobileMenu(!showMobileMenu)
              setShowProfile(false)
              setShowNotifications(false)
            }}
            aria-label="메뉴"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {showMobileMenu ? (
                <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <MobileMenu
        menuItems={filteredMenuItems}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        isActive={isActive}
      />
    </nav>
  )
}

