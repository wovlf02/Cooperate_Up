import { calculatePercentage } from '@/utils/format'
import styles from './TaskProgressWidget.module.css'

export default function TaskProgressWidget({ stats }) {
  // stats 구조: { summary: { completed, pending, total, completionRate } }
  const summary = stats?.summary || { completed: 0, pending: 0, total: 0 }
  const totalTasks = summary.total
  const completed = summary.completed
  const incomplete = summary.pending
  const progressPercent = summary.completionRate || 0

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetHeader}>📊 진행 상황</h3>

      <div className={styles.progressInfo}>
        <span className={styles.progressText}>
          {totalTasks}건 중 {completed}건 완료
        </span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className={styles.progressStats}>
        <div className={styles.statItem}>
          <span>✅ 완료</span>
          <span>{completed}건</span>
        </div>
        <div className={styles.statItem}>
          <span>⏳ 진행중</span>
          <span>{incomplete}건</span>
        </div>
        <div className={styles.statItem}>
          <span>📅 전체</span>
          <span>{totalTasks}건</span>
        </div>
      </div>
    </div>
  )
}
