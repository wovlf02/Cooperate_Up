'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import styles from '../AdminNavbar.module.css'

export default function MobileMenu({
  menuItems,
  showMobileMenu,
  setShowMobileMenu,
  isActive
}) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (!showMobileMenu) return null

  return (
    <>
      <div
        className={styles.backdrop}
        onClick={() => setShowMobileMenu(false)}
      />
      <div className={styles.mobileMenu}>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.mobileMenuItem} ${
              isActive(item) ? styles.active : ''
            }`}
            onClick={() => setShowMobileMenu(false)}
          >
            {item.label}
          </Link>
        ))}
        <div className={styles.divider} />
        <button
          className={styles.mobileMenuItem}
          onClick={() => {
            setShowMobileMenu(false)
            router.push('/dashboard')
          }}
        >
          사용자 페이지로
        </button>
        <button
          className={styles.mobileMenuItem}
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>
    </>
  )
}

