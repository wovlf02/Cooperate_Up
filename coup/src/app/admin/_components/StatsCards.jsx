import styles from './StatsCards.module.css'

export default function StatsCards({ stats }) {
  if (!stats) {
    return (
      <div className={styles.grid}>
        <StatsCard title="사용자" value="0" change="+0" loading />
        <StatsCard title="스터디" value="0" change="+0" loading />
        <StatsCard title="신고" value="0" urgent={0} loading />
        <StatsCard title="경고" value="0" change="+0" loading />
      </div>
    )
  }

  const { users, studies, reports, moderation } = stats

  return (
    <div className={styles.grid}>
      <StatsCard
        title="사용자"
        value={users.total.toLocaleString()}
        subtitle={`활성: ${users.active.toLocaleString()}`}
        change={`+${users.newToday}`}
        changeLabel="오늘"
        color="blue"
      />

      <StatsCard
        title="스터디"
        value={studies.total.toLocaleString()}
        subtitle={`활성: ${studies.active.toLocaleString()}`}
        change={`+${studies.newToday}`}
        changeLabel="오늘"
        color="purple"
      />

      <StatsCard
        title="신고"
        value={reports.pending.toLocaleString()}
        subtitle={`처리 대기중`}
        urgent={reports.urgent}
        color="red"
      />

      <StatsCard
        title="제재"
        value={moderation.activeSanctions.toLocaleString()}
        subtitle={`활성 제재`}
        change={`${moderation.totalWarnings}건`}
        changeLabel="전체 경고"
        color="orange"
      />
    </div>
  )
}

function StatsCard({ title, value, subtitle, change, changeLabel, urgent, color = 'blue', loading }) {
  const colorClasses = {
    blue: styles.blue,
    purple: styles.purple,
    red: styles.red,
    orange: styles.orange,
  }

  return (
    <div className={`${styles.card} ${loading ? styles.loading : ''}`}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <div className={`${styles.icon} ${colorClasses[color]}`}>
          {getIcon(title)}
        </div>
      </div>

      <div className={styles.value}>{value}</div>

      {subtitle && (
        <div className={styles.subtitle}>{subtitle}</div>
      )}

      {change && (
        <div className={styles.footer}>
          <span className={styles.change}>{change}</span>
          {changeLabel && <span className={styles.changeLabel}>{changeLabel}</span>}
        </div>
      )}

      {urgent > 0 && (
        <div className={styles.urgent}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2L9.5 6H14L10.5 9L12 13L8 10L4 13L5.5 9L2 6H6.5L8 2Z"/>
          </svg>
          긴급 {urgent}건
        </div>
      )}
    </div>
  )
}

function getIcon(title) {
  switch (title) {
    case '사용자':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10ZM10 12.5C6.66667 12.5 0 14.175 0 17.5V20H20V17.5C20 14.175 13.3333 12.5 10 12.5Z"/>
        </svg>
      )
    case '스터디':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 0L0 5V7H20V5L10 0ZM2 9V18C2 19.1 2.9 20 4 20H16C17.1 20 18 19.1 18 18V9H16V18H4V9H2ZM8 9V18H12V9H8Z"/>
        </svg>
      )
    case '신고':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 0L11.5 6.5L18 5L14 10.5L20 13L13 14.5L14.5 20L10 16L5.5 20L7 14.5L0 13L6 10.5L2 5L8.5 6.5L10 0Z"/>
        </svg>
      )
    case '제재':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18ZM9 5H11V11H9V5ZM9 13H11V15H9V13Z"/>
        </svg>
      )
    default:
      return null
  }
}

