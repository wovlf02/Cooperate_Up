'use client'

import { useRouter } from 'next/navigation'
import styles from './Widget.module.css'

export default function UrgentTasksWidget({ studyId }) {
  const router = useRouter()
  
  // TODO: 실제 데이터는 API에서 가져오기
  const urgentTasks = [
    {
      id: 1,
      title: '백준 1234번 풀이',
      dueDate: '11/7',
      dDay: 2,
      urgency: 'danger' // danger, warning
    },
    {
      id: 2,
      title: '코드 리뷰 준비',
      dueDate: '11/10',
      dDay: 3,
      urgency: 'warning'
    }
  ]

  const handleComplete = (taskId) => {
    // TODO: 할일 완료 처리
    alert(`할일 ${taskId} 완료 처리`)
  }

  if (urgentTasks.length === 0) return null

  return (
    <div className={styles.widget}>
      <div className={styles.widgetTitle}>
        ✅ 급한 할일 ({urgentTasks.length})
      </div>
      <div className={styles.widgetContent}>
        {urgentTasks.map(task => (
          <div key={task.id} className={styles.taskItem}>
            <div className={styles.taskHeader}>
              <span className={styles.taskIcon}>
                {task.urgency === 'danger' ? '🔴' : '🟡'}
              </span>
              <div className={styles.taskContent}>
                <div className={styles.taskTitle}>
                  {task.title}
                </div>
                <div className={styles.taskMeta}>
                  D-{task.dDay} ({task.dueDate})
                </div>
              </div>
            </div>
            <button
              onClick={() => handleComplete(task.id)}
              className={`${styles.actionButton} ${styles.secondary} ${styles.completeButton}`}
            >
              완료하기
            </button>
          </div>
        ))}

        <a 
          href={`/studies/${studyId}/tasks`}
          className={styles.linkButton}
        >
          할일 전체보기 →
        </a>
      </div>
    </div>
  )
}
