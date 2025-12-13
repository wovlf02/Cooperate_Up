/**
 * 알림 헤더 컴포넌트
 */
import styles from './NotificationHeader.module.css';

export default function NotificationHeader({
  stats,
  onMarkAllRead,
  onDeleteRead
}) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>알림</h1>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <span className={styles.dot} style={{ background: '#3b82f6' }} />
            전체 {stats.total}
          </span>
          {stats.unreadCount > 0 && (
            <span className={styles.stat}>
              <span className={styles.dot} style={{ background: '#ef4444' }} />
              읽지 않음 {stats.unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        {stats.unreadCount > 0 && (
          <button
            className={styles.button}
            onClick={onMarkAllRead}
          >
            <span className={styles.icon}>✓</span>
            모두 읽음
          </button>
        )}
        {stats.readCount > 0 && (
          <button
            className={`${styles.button} ${styles.danger}`}
            onClick={onDeleteRead}
          >
            <span className={styles.icon}>🗑</span>
            읽은 알림 삭제
          </button>
        )}
      </div>
    </header>
  );
}

