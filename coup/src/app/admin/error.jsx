'use client'

import styles from './error.module.css'

export default function AdminError({ error, reset }) {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <h2 className={styles.errorTitle}>문제가 발생했습니다</h2>
        <p className={styles.errorMessage}>
          {error.message || '알 수 없는 오류가 발생했습니다.'}
        </p>
        <button onClick={reset} className={styles.retryButton}>
          다시 시도
        </button>
      </div>
    </div>
  )
}

