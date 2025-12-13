import { Suspense } from 'react'
import ReportList from './_components/ReportList'
import ReportFilters from './_components/ReportFilters'
import styles from './page.module.css'

export const metadata = {
  title: '신고 관리 - CoUp Admin',
}

export default function ReportsPage({ searchParams }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>신고 관리</h1>
          <p className={styles.subtitle}>신고 접수, 처리 및 모니터링</p>
        </div>
      </div>

      <ReportFilters />

      <Suspense fallback={<ReportListSkeleton />}>
        <ReportList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

function ReportListSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonCards}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    </div>
  )
}

