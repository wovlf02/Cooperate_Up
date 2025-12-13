import styles from './TaskEmpty.module.css'

export default function TaskEmpty({ type }) {
  if (type === 'all-completed') {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🎉</div>
        <h3 className={styles.emptyTitle}>모든 할 일을 완료했어요!</h3>
        <p className={styles.emptyDescription}>
          정말 멋져요! 계속해서 달성해나가보세요! 💪
        </p>
      </div>
    )
  }

  if (type === 'no-results') {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3 className={styles.emptyTitle}>검색 결과가 없습니다</h3>
        <p className={styles.emptyDescription}>
          다른 필터를 선택해보세요
        </p>
      </div>
    )
  }

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>✅</div>
      <h3 className={styles.emptyTitle}>아직 할 일이 없어요!</h3>
      <p className={styles.emptyDescription}>
        스터디에 참여하고 할 일을 함께 달성해보세요!
      </p>
    </div>
  )
}

