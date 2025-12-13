import styles from './NotificationTypeFilter.module.css'

export default function NotificationTypeFilter({ stats }) {
  const typeLabels = {
    NOTICE: '공지',
    FILE: '파일',
    EVENT: '일정',
    TASK: '할일',
    MEMBER: '멤버',
    JOIN_APPROVED: '가입승인',
    KICK: '강퇴',
  }

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetHeader}>📋 유형별</h3>
      <div className={styles.typeList}>
        {Object.entries(stats.byType).map(([type, count]) => (
          count > 0 && (
            <div key={type} className={styles.typeItem}>
              <span className={styles.typeLabel}>• {typeLabels[type] || type}</span>
              <span className={styles.typeCount}>{count}건</span>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

