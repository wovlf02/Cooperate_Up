/**
 * StudyStatus.jsx
 *
 * 스터디 현황 위젯 (메모이제이션)
 * - 다음 일정 D-day
 * - 출석률
 * - 할일 완료율
 * - 연속 일수
 *
 * @module components/dashboard/widgets/StudyStatus
 */

'use client'

import { memo } from 'react'
import styles from './Widget.module.css'
import { StudyStatusSkeleton } from './WidgetSkeleton'

/**
 * 안전한 퍼센트 계산
 */
function safePercentage(numerator, denominator) {
  if (!denominator || denominator === 0) return 0
  const result = (numerator / denominator) * 100
  return Math.min(Math.max(result, 0), 100)
}

/**
 * 스터디 현황 위젯 컴포넌트
 */
function StudyStatusComponent({ stats = {}, nextEvent = null, isLoading = false }) {
  if (isLoading) {
    return <StudyStatusSkeleton />
  }

  const attendanceRate = safePercentage(
    stats?.attendedCount || 0,
    stats?.totalAttendance || 0
  )

  const taskCompletionRate = safePercentage(
    stats?.completedTasks || 0,
    stats?.totalTasks || 0
  )

  const streakDays = stats?.streakDays || 0

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>📊 스터디 현황</h3>
      
      {/* 다음 일정 */}
      {nextEvent ? (
        <div className={styles.nextEvent}>
          <div className={styles.eventLabel}>🎯 다음 일정</div>
          <div className={styles.eventDday}>D-{nextEvent.dday}</div>
          <div className={styles.eventDate}>{nextEvent.date}</div>
          <div className={styles.eventTitle}>{nextEvent.title}</div>
        </div>
      ) : (
        <div className={styles.emptyEvent}>
          📅 다가오는 일정이 없습니다
        </div>
      )}

      {/* 출석률 */}
      <div className={styles.statItem}>
        <div className={styles.statLabel}>
          <span>👥 출석률</span>
          <span className={styles.statValue}>
            {attendanceRate.toFixed(1)}%
          </span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
        <div className={styles.statDetail}>
          {stats?.attendedCount || 0}/{stats?.totalAttendance || 0}명 (이번 주)
        </div>
      </div>

      {/* 할일 완료율 */}
      <div className={styles.statItem}>
        <div className={styles.statLabel}>
          <span>✅ 할일</span>
          <span className={styles.statValue}>
            {taskCompletionRate.toFixed(1)}%
          </span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${taskCompletionRate}%` }}
          />
        </div>
        <div className={styles.statDetail}>
          {stats?.completedTasks || 0}/{stats?.totalTasks || 0}개 완료
        </div>
      </div>

      {/* 연속 일수 */}
      {streakDays > 0 && (
        <div className={styles.streak}>
          <span>🔥 연속</span>
          <span className={styles.streakDays}>{streakDays}일</span>
          <span className={styles.streakEmoji}>
            {'🔥'.repeat(Math.min(streakDays, 5))}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Props 비교 함수
 */
const arePropsEqual = (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false

  const prevStats = prevProps.stats || {}
  const nextStats = nextProps.stats || {}

  if (
    prevStats.attendedCount !== nextStats.attendedCount ||
    prevStats.totalAttendance !== nextStats.totalAttendance ||
    prevStats.completedTasks !== nextStats.completedTasks ||
    prevStats.totalTasks !== nextStats.totalTasks ||
    prevStats.streakDays !== nextStats.streakDays
  ) {
    return false
  }

  const prevEvent = prevProps.nextEvent
  const nextEvent = nextProps.nextEvent

  if (prevEvent === null && nextEvent === null) return true
  if (prevEvent === null || nextEvent === null) return false

  if (
    prevEvent.dday !== nextEvent.dday ||
    prevEvent.date !== nextEvent.date ||
    prevEvent.title !== nextEvent.title
  ) {
    return false
  }

  return true
}

export default memo(StudyStatusComponent, arePropsEqual)
