'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from '@/styles/landing/landing-header.module.css'

export default function LandingHeader() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogin = () => {
    router.push('/sign-in')
  }

  const handleSignup = () => {
    router.push('/sign-up')
  }

  return (
    <header className={`${styles.header} ${isScrolled ? styles.solid : styles.transparent}`}>
      <div className={styles.headerContainer}>
        <div className={styles.logo} onClick={scrollToTop}>
          <Image
            src="/mainlogo.png"
            alt="CoUp"
            width={120}
            height={40}
            className={styles.logoImage}
            priority
          />
        </div>

        <nav className={styles.nav}>
          <button className={styles.loginBtn} onClick={handleLogin}>로그인</button>
          <button className={styles.signupBtn} onClick={handleSignup}>시작하기</button>
        </nav>

        <button className={styles.mobileMenuBtn} aria-label="메뉴">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  )
}
