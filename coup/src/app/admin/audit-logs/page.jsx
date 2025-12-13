import LogFilters from './_components/LogFilters'
import LogTable from './_components/LogTable'
import styles from './page.module.css'

export const metadata = {
  title: '감사 로그 | CoUp 관리자',
  description: '관리자 활동 감사 로그'
}

export default function AuditLogsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>📋 감사 로그</h1>
        <p className={styles.description}>
          관리자의 모든 활동이 기록됩니다.
        </p>
      </div>

      <div className={styles.content}>
        <LogFilters />
        <LogTable />
      </div>
    </div>
  )
}

