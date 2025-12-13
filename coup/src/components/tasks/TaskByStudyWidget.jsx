import { useMemo } from 'react'
import styles from './TaskByStudyWidget.module.css'

export default function TaskByStudyWidget({ tasks }) {
  const studyStats = useMemo(() => {
    const stats = {}

    tasks.forEach(task => {
      if (!task.study) return

      const studyId = task.study.id
      if (!stats[studyId]) {
        stats[studyId] = {
          id: studyId,
          name: task.study.name,
          emoji: task.study.emoji,
          incomplete: 0,
          completed: 0,
        }
      }

      if (task.completed) {
        stats[studyId].completed++
      } else {
        stats[studyId].incomplete++
      }
    })

    return Object.values(stats)
  }, [tasks])

  if (studyStats.length === 0) {
    return (
      <div className={styles.widget}>
        <h3 className={styles.widgetHeader}>📊 스터디별 할 일</h3>
        <p className={styles.emptyText}>스터디별 할일이 없습니다</p>
      </div>
    )
  }

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetHeader}>📊 스터디별 할 일</h3>
      <div className={styles.studyList}>
        {studyStats.map((study) => (
          <div key={study.id} className={styles.studyItem}>
            <div className={styles.studyHeader}>
              <span>{study.emoji} {study.name}</span>
            </div>
            <div className={styles.studyStats}>
              미완료 {study.incomplete} / 완료 {study.completed}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
