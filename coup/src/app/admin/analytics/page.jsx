/**
 * 관리자 - 통계 분석 대시보드
 */

import OverviewCharts from './_components/OverviewCharts'
import UserAnalytics from './_components/UserAnalytics'
import StudyAnalytics from './_components/StudyAnalytics'
import styles from './page.module.css'

export const metadata = {
  title: '통계 분석 - CoUp Admin',
  description: '플랫폼 통계 및 분석 대시보드'
}

export default function AnalyticsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>통계 분석</h1>
        <p>플랫폼의 주요 지표와 트렌드를 확인하세요</p>
      </header>

      {/* 전체 통계 개요 */}
      <section className={styles.section}>
        <OverviewCharts />
      </section>

      {/* 사용자 분석 */}
      <section className={styles.section}>
        <UserAnalytics />
      </section>

      {/* 스터디 분석 */}
      <section className={styles.section}>
        <StudyAnalytics />
      </section>
    </div>
  )
}

