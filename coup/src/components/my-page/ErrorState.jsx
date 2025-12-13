'use client'

import styles from './ErrorState.module.css'

export default function ErrorState({ message, onRetry }) {
  return (
    <div className={styles.container}>
      <span className={styles.icon}>😕</span>
      <h2 className={styles.title}>오류가 발생했습니다</h2>
      <p className={styles.message}>{message || '사용자 정보를 불러올 수 없습니다.'}</p>
      {onRetry && (
        <button onClick={onRetry} className={styles.retryBtn}>
          🔄 다시 시도
        </button>
      )}
    </div>
  )
}

