import styles from './NotificationEmpty.module.css'

export default function NotificationEmpty({ filter }) {
  if (filter === 'unread') {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>✅</div>
        <h3 className={styles.emptyTitle}>읽지 않은 알림이 없습니다</h3>
        <p className={styles.emptyDescription}>
          모든 알림을 확인했어요! 🎉
        </p>
      </div>
    )
  }

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>🔔</div>
      <h3 className={styles.emptyTitle}>알림이 없습니다</h3>
      <p className={styles.emptyDescription}>
        새로운 알림이 오면 여기에 표시됩니다
      </p>
    </div>
  )
}

