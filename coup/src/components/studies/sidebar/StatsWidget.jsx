'use client'

import styles from './Widget.module.css'

export default function StatsWidget({ studyId }) {
  // TODO: 실제 데이터는 API에서 가져오기
  const stats = {
    nextEvent: {
      title: '주간 회의',
      date: '2025.11.13',
      day: '수',
      time: '14:00',
      dDay: 7
    },
    attendance: {
      rate: 85,
      current: 10,
      total: 12
    },
    taskCompletion: {
      rate: 60,
      completed: 12,
      total: 20
    },
    streak: 7
  }

  return (
    <div className={styles.widget}>
      <div className={styles.widgetTitle}>
        📊 스터디 현황
      </div>
      <div className={styles.widgetContent}>
        {/* 다음 일정 */}
        <div className={styles.statItem}>
          <div className={styles.statLabel}>
            🎯 다음 일정
          </div>
          <div className={styles.statValue}>
            D-{stats.nextEvent.dDay} {stats.nextEvent.date} ({stats.nextEvent.day}) {stats.nextEvent.time}
          </div>
          <div className={styles.statTime}>
            {stats.nextEvent.title}
          </div>
        </div>

        {/* 출석률 */}
        <div className={styles.statItem}>
          <div className={styles.statMeta}>
            <span className={styles.statMetaLabel}>👥 출석률</span>
            <span className={styles.statMetaValue}>{stats.attendance.rate}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${stats.attendance.rate}%` }}
            />
          </div>
          <div className={styles.statDetail}>
            {stats.attendance.current}/{stats.attendance.total}명 (이번 주)
          </div>
        </div>

        {/* 할일 완료율 */}
        <div className={styles.statItem}>
          <div className={styles.statMeta}>
            <span className={styles.statMetaLabel}>✅ 할일</span>
            <span className={styles.statMetaValue}>{stats.taskCompletion.rate}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${stats.taskCompletion.rate}%` }}
            />
          </div>
          <div className={styles.statDetail}>
            {stats.taskCompletion.completed}/{stats.taskCompletion.total}개 완료
          </div>
        </div>

        {/* 연속 참여 */}
        <div className={styles.streakInfo}>
          <span className={styles.statMetaLabel}>🔥 연속</span>
          <span className={styles.statValue}>
            {stats.streak}일 🔥🔥🔥
          </span>
        </div>
      </div>
    </div>
  )
}
