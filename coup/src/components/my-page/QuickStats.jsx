'use client'

import styles from './QuickStats.module.css'

function StatCard({ icon, value, label, color, trend }) {
  // NaN 방지
  const safeValue = (typeof value === 'number' && !isNaN(value)) ? value : 0

  return (
    <div className={`${styles.statCard} ${styles[color]}`}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={styles.content}>
        <span className={styles.value}>{safeValue}</span>
        <span className={styles.label}>{label}</span>
      </div>
      {trend && (
        <span className={`${styles.trend} ${trend > 0 ? styles.positive : styles.negative}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  )
}

export default function QuickStats({ stats, user }) {
  // 안전한 날짜 계산 (NaN 방지)
  const calculateDaysJoined = () => {
    if (!user?.createdAt) return 0
    const createdDate = new Date(user.createdAt)
    if (isNaN(createdDate.getTime())) return 0
    const diff = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24))
    return isNaN(diff) ? 0 : Math.max(0, diff)
  }

  const daysJoined = calculateDaysJoined()

  const quickStats = [
    {
      icon: '📚',
      value: stats?.total?.studyCount ?? 0,
      label: '참여 스터디',
      color: 'blue'
    },
    {
      icon: '✅',
      value: stats?.total?.completedTasks ?? 0,
      label: '완료한 할 일',
      color: 'green'
    },
    {
      icon: '🔥',
      value: stats?.streak ?? 0,
      label: '연속 출석',
      color: 'orange'
    },
    {
      icon: '📅',
      value: daysJoined,
      label: '함께한 날',
      color: 'purple'
    },
  ]

  return (
    <section className={styles.container}>
      {quickStats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </section>
  )
}

