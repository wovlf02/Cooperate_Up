'use client'

import { useRouter } from 'next/navigation'
import styles from '@/styles/landing/cta-section.module.css'

export default function CTASection() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/sign-up')
  }

  return (
    <section className={styles.cta}>
      <div className={styles.container}>
        <h2 className={styles.title}>지금 바로 시작하세요!</h2>
        <p className={styles.description}>
          수천 명의 학습자가 CoUp과 함께 성장하고 있어요
        </p>

        <button className={styles.ctaButton} onClick={handleGetStarted}>
          무료로 시작하기
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <p className={styles.subtitle}>신용카드 필요 없음 · 언제든 무료</p>
      </div>
    </section>
  )
}
