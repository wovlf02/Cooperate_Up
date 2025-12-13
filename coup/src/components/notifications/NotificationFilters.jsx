import styles from './NotificationFilters.module.css'

export default function NotificationFilters({ filter, onFilterChange, onMarkAllAsRead, unreadCount }) {
  return (
    <div className={styles.container}>
      <div className={styles.filterButtons}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => onFilterChange('all')}
        >
          전체
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'unread' ? styles.active : ''}`}
          onClick={() => onFilterChange('unread')}
        >
          읽지않음 {unreadCount > 0 && <span className={styles.count}>({unreadCount})</span>}
        </button>
      </div>

      <button
        className={styles.markAllButton}
        onClick={onMarkAllAsRead}
        disabled={unreadCount === 0}
      >
        모두 읽음
      </button>
    </div>
  )
}

