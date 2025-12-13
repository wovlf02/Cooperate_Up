import styles from './loading.module.css'

export default function AdminLoading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>로딩 중...</p>
    </div>
  )
}

