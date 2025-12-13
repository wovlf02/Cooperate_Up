import { getTimeLeft, formatDateTimeKST } from '@/utils/time'
import styles from './TaskCard.module.css'

export default function TaskCard({ task, onToggleComplete, onDeleteTask, onCardClick, onEdit }) {
  const timeLeft = getTimeLeft(task.dueDate)

  const getDeadlineClass = () => {
    if (timeLeft.expired) return styles.deadlineExpired
    if (timeLeft.urgent) return styles.deadlineUrgent
    return styles.deadlineNormal
  }

  const getCardClass = () => {
    let classes = [styles.taskCard]
    if (task.completed) classes.push(styles.completed)
    if (timeLeft.urgent && !task.completed) classes.push(styles.urgent)
    return classes.join(' ')
  }

  return (
    <div className={getCardClass()} onClick={() => onCardClick && onCardClick(task)}>
      <div className={styles.taskHeader}>
        <div className={styles.leftSection}>
          <div
            className={`${styles.checkbox} ${task.completed ? styles.checked : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task.id);
            }}
          >
            {task.completed && '✓'}
          </div>
          <div className={styles.titleSection}>
            <h3 className={styles.taskTitle}>{task.title}</h3>
            {task.dueDate && (
              <div className={`${styles.deadlineInfo} ${getDeadlineClass()}`}>
                <div className={styles.deadlineText}>
                  📅 {formatDateTimeKST(task.dueDate)}
                </div>
                <div className={styles.timeLeftBadge}>
                  {timeLeft.text}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button
            className={styles.editButton}
            onClick={(e) => {
              e.stopPropagation()
              onEdit && onEdit(task)
            }}
            title="수정"
          >
            수정
          </button>
          <button
            className={styles.deleteButton}
            onClick={(e) => {
              e.stopPropagation()
              onDeleteTask(task.id)
            }}
            title="삭제"
          >
            삭제
          </button>
        </div>
      </div>

      <div className={styles.taskMeta}>
        {task.study && (
          <div className={styles.studyInfo}>
            <span>{task.study.emoji || '📚'}</span>
            <span>{task.study.name}</span>
          </div>
        )}

        {task.priority && (
          <div className={styles.priorityBadge}>
            {task.priority === 'URGENT' && '🔥 긴급'}
            {task.priority === 'HIGH' && '⚠️ 높음'}
            {task.priority === 'MEDIUM' && '📌 보통'}
            {task.priority === 'LOW' && '📎 낮음'}
          </div>
        )}
      </div>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}
    </div>
  )
}
