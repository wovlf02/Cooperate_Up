import { useMemo } from 'react'
import styles from './NotificationStats.module.css'

export default function NotificationStats({ notifications }) {
  // 클라이언트에서 통계 계산
  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())

    const todayCount = notifications.filter(n => {
      const createdAt = new Date(n.createdAt)
      return createdAt >= today
    }).length

    const thisWeekCount = notifications.filter(n => {
      const createdAt = new Date(n.createdAt)
      return createdAt >= weekStart
    }).length

    const unreadCount = notifications.filter(n => !n.isRead).length

    return {
      today: todayCount,
      thisWeek: thisWeekCount,
      unread: unreadCount,
      total: notifications.length
    }
  }, [notifications])

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetHeader}>📊 알림 통계</h3>
      <div className={styles.statsList}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>오늘</span>
          <span className={styles.statValue}>{stats.today}건</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>이번 주</span>
          <span className={styles.statValue}>{stats.thisWeek}건</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>읽지않음</span>
          <span className={`${styles.statValue} ${styles.unread}`}>{stats.unread}건</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>전체</span>
          <span className={styles.statValue}>{stats.total}건</span>
        </div>
      </div>
    </div>
  )
}
