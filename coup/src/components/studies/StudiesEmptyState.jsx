import styles from './StudiesEmptyState.module.css'

export default function StudiesEmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.icon}>🔍</div>
      <h3 className={styles.title}>검색 결과가 없습니다</h3>
      <p className={styles.description}>다른 키워드로 검색해보세요</p>
      <button className={styles.resetButton}>
        필터 초기화
      </button>
    </div>
  )
}
