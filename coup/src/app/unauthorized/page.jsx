import Link from 'next/link'
import styles from './unauthorized.module.css'

export const metadata = {
  title: '접근 권한 없음 - CoUp',
}

export default function UnauthorizedPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="#EF4444" strokeWidth="3"/>
            <path d="M32 20V36M32 44V48" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 className={styles.title}>접근 권한이 없습니다</h1>
        <p className={styles.message}>
          관리자 페이지에 접근하려면 관리자 권한이 필요합니다.
        </p>

        <div className={styles.actions}>
          <Link href="/dashboard" className={styles.button}>
            대시보드로 이동
          </Link>
        </div>
      </div>
    </div>
  )
}

