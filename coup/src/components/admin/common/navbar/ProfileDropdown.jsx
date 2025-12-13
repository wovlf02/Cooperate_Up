'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useQueryClient } from '@tanstack/react-query'
import Badge from '@/components/admin/ui/Badge'
import styles from '../AdminNavbar.module.css'

const getRoleLabel = (role) => {
  const labels = {
    SUPER_ADMIN: '슈퍼 관리자',
    ADMIN: '관리자',
    MODERATOR: '모더레이터',
    VIEWER: '뷰어'
  }
  return labels[role] || '관리자'
}

export default function ProfileDropdown({
  user,
  adminRole,
  showProfile,
  setShowProfile,
  setShowNotifications
}) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    // React Query 캐시 전체 초기화 (이전 유저 데이터 제거)
    queryClient.clear()
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className={styles.profileContainer}>
      <button
        className={styles.profileButton}
        onClick={() => {
          setShowProfile(!showProfile)
          setShowNotifications(false)
        }}
        aria-label="프로필 메뉴"
      >
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name || '관리자'}
            width={32}
            height={32}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {(user.name || 'A')[0].toUpperCase()}
          </div>
        )}
        <svg
          className={styles.profileArrow}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {showProfile && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setShowProfile(false)}
          />
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <div className={styles.profileInfo}>
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || '관리자'}
                    width={48}
                    height={48}
                    className={styles.dropdownAvatar}
                  />
                ) : (
                  <div className={styles.dropdownAvatarPlaceholder}>
                    {(user.name || 'A')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className={styles.userName}>{user.name || '관리자'}</p>
                  <span className={styles.userEmail}>{user.email}</span>
                </div>
              </div>
              <Badge variant="info" size="sm">
                {getRoleLabel(adminRole.role)}
              </Badge>
            </div>
            <div className={styles.divider} />
            <button
              className={styles.dropdownItem}
              onClick={() => {
                setShowProfile(false)
                router.push('/dashboard')
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L2 7V14H6V11H10V14H14V7L8 2Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              사용자 페이지로
            </button>
            <button
              className={styles.dropdownItem}
              onClick={() => {
                setShowProfile(false)
                router.push('/admin/settings')
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13.5 8C13.5 8.28 13.48 8.56 13.45 8.83L14.84 9.85C14.96 9.94 15 10.11 14.92 10.25L13.6 12.24C13.52 12.38 13.36 12.43 13.21 12.38L11.58 11.72C11.26 11.96 10.91 12.16 10.53 12.3L10.28 14.04C10.26 14.19 10.13 14.3 9.98 14.3H7.34C7.19 14.3 7.06 14.19 7.04 14.04L6.79 12.3C6.41 12.16 6.06 11.96 5.74 11.72L4.11 12.38C3.96 12.43 3.8 12.38 3.72 12.24L2.4 10.25C2.32 10.11 2.36 9.94 2.48 9.85L3.87 8.83C3.84 8.56 3.82 8.28 3.82 8C3.82 7.72 3.84 7.44 3.87 7.17L2.48 6.15C2.36 6.06 2.32 5.89 2.4 5.75L3.72 3.76C3.8 3.62 3.96 3.57 4.11 3.62L5.74 4.28C6.06 4.04 6.41 3.84 6.79 3.7L7.04 1.96C7.06 1.81 7.19 1.7 7.34 1.7H9.98C10.13 1.7 10.26 1.81 10.28 1.96L10.53 3.7C10.91 3.84 11.26 4.04 11.58 4.28L13.21 3.62C13.36 3.57 13.52 3.62 13.6 3.76L14.92 5.75C15 5.89 14.96 6.06 14.84 6.15L13.45 7.17C13.48 7.44 13.5 7.72 13.5 8Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              설정
            </button>
            <div className={styles.divider} />
            <button
              className={`${styles.dropdownItem} ${styles.danger}`}
              onClick={handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11 12L15 8L11 4M15 8H6M6 2H4C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  )
}

