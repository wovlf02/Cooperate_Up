import TaskCard from './TaskCard'
import styles from './TaskGroup.module.css'

export default function TaskGroup({ title, tasks, onToggleComplete, onDeleteTask, onCardClick, onEdit }) {
  return (
    <div className={styles.taskGroup}>
      <div className={styles.groupHeader}>
        <h2 className={styles.groupTitle}>{title}</h2>
        <span className={styles.groupCount}>{tasks.length}건</span>
      </div>

      <div className={styles.taskList}>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDeleteTask={onDeleteTask}
            onCardClick={onCardClick}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  )
}
