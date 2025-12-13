/**
 * UrgentTasks.jsx
 *
 * 급한 할일 위젯 (메모이제이션)
 * - 3일 이내 마감 할일 표시
 * - D-day 계산
 * - 긴급도 색상 표시
 *
 * @module components/dashboard/widgets/UrgentTasks
 */

'use client'

import { memo, useMemo } from 'react'
import styles from './Widget.module.css'
import Link from 'next/link'
import { UrgentTasksSkeleton } from './WidgetSkeleton'

/**
 * 안전한 D-day 계산
 */
function calculateDaysUntilDue(dueDateString) {
  try {
    const dueDate = new Date(dueDateString)
    const now = new Date()
    
    if (isNaN(dueDate.getTime())) {
      return null
    }
    
    dueDate.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
    
    const diffTime = dueDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  } catch (error) {
    return null
  }
}

/**
 * 날짜 포맷팅
 */
function formatDueDate(dateString) {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '날짜 오류'
    
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    })
  } catch (error) {
    return '날짜 오류'
  }
}

/**
 * 긴급도 색상 가져오기
 */
function getUrgencyColor(daysUntilDue) {
  if (daysUntilDue === 0) return '🔴'
  if (daysUntilDue === 1) return '🟠'
  if (daysUntilDue <= 3) return '🟡'
  return '🟢'
}

/**
 * 급한 할일 위젯 컴포넌트
 */
function UrgentTasksComponent({ tasks = [], isLoading = false }) {
  if (isLoading) {
    return <UrgentTasksSkeleton />
  }

  const urgentTasks = useMemo(() => {
    return (tasks || [])
      .filter(task => {
        if (task.completed) return false
        const daysUntilDue = calculateDaysUntilDue(task.dueDate)
        if (daysUntilDue === null) return false
        return daysUntilDue >= 0 && daysUntilDue <= 3
      })
      .sort((a, b) => {
        const aDays = calculateDaysUntilDue(a.dueDate)
        const bDays = calculateDaysUntilDue(b.dueDate)
        return aDays - bDays
      })
      .slice(0, 3)
  }, [tasks])

  if (urgentTasks.length === 0) {
    return null
  }

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>✅ 급한 할일</h3>
        <span className={styles.badge}>{urgentTasks.length}</span>
      </div>

      <div className={styles.tasksList}>
        {urgentTasks.map((task) => {
          const daysUntilDue = calculateDaysUntilDue(task.dueDate)
          
          return (
            <Link 
              key={task.id} 
              href={`/tasks/${task.id}`}
              className={styles.taskItem}
            >
              <div className={styles.taskHeader}>
                <span className={styles.urgencyIndicator}>
                  {getUrgencyColor(daysUntilDue)}
                </span>
                <span className={styles.taskTitle}>
                  {task.title || '제목 없음'}
                </span>
              </div>
              <div className={styles.taskMeta}>
                <span className={styles.taskDue}>
                  {daysUntilDue === 0 ? '오늘' : `D-${daysUntilDue}`}
                  {' '}
                  ({formatDueDate(task.dueDate)})
                </span>
              </div>
              {task.studyName && (
                <div className={styles.taskStudy}>
                  {task.studyEmoji} {task.studyName}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      <Link href="/tasks" className={styles.widgetLink}>
        할일 전체보기 →
      </Link>
    </div>
  )
}

/**
 * Props 비교 함수
 */
const arePropsEqual = (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false

  const prevTasks = prevProps.tasks || []
  const nextTasks = nextProps.tasks || []

  if (prevTasks.length !== nextTasks.length) return false

  for (let i = 0; i < prevTasks.length; i++) {
    const prev = prevTasks[i]
    const next = nextTasks[i]

    if (
      prev?.id !== next?.id ||
      prev?.completed !== next?.completed ||
      prev?.dueDate !== next?.dueDate ||
      prev?.title !== next?.title
    ) {
      return false
    }
  }

  return true
}

export default memo(UrgentTasksComponent, arePropsEqual)
