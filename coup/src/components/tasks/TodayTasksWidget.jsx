import { isToday } from '@/utils/time'
import { getTimeLeft } from '@/utils/time'
import styles from './TodayTasksWidget.module.css'

export default function TodayTasksWidget({ tasks }) {
  const todayTasks = tasks
    .filter(task => isToday(task.dueDate) && !task.completed)
    .slice(0, 5)

  if (todayTasks.length === 0) {
    return (
      <div className={styles.widget}>
        <h3 className={styles.widgetHeader}>📅 오늘의 할 일</h3>
        <p className={styles.emptyText}>오늘 마감인 할 일이 없습니다</p>
      </div>
    )
  }

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetHeader}>📅 오늘의 할 일</h3>
      <div className={styles.taskList}>
        {todayTasks.map(task => {
          const timeLeft = getTimeLeft(task.dueDate)
          return (
            <div key={task.id} className={styles.taskItem}>
              <div className={styles.taskTitle}>• {task.title}</div>
              <div className={styles.taskTime}>
                {timeLeft.text}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

