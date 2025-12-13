'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import StatCard from '@/components/admin/ui/Stats'
import { Card, CardContent } from '@/components/admin/ui/Card'
import Button from '@/components/admin/ui/Button'
import RecentActivity from './_components/RecentActivity'
import QuickActions from './_components/QuickActions'
import api from '@/lib/api'
import styles from './page.module.css'

export default function AdminDashboardPage() {
  const { status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in?callbackUrl=/admin')
      return
    }

    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status, router])

  async function fetchStats() {
    try {
      setLoading(true)
      const result = await api.get('/api/admin/stats')
      setStats(result.success ? result.data : null)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setError(err.message || '통계를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1 className={styles.title}>대시보드</h1>
          <p className={styles.subtitle}>플랫폼 현황을 한눈에 확인하세요</p>
        </div>
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <StatCard key={i} title="로딩 중..." value={0} loading />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1 className={styles.title}>대시보드</h1>
          <p className={styles.subtitle}>플랫폼 현황을 한눈에 확인하세요</p>
        </div>
        <Card variant="outlined">
          <CardContent>
            <div className={styles.error}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              <h3>통계를 불러올 수 없습니다</h3>
              <p>{error}</p>
              <Button onClick={fetchStats} variant="primary">다시 시도</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const summary = stats?.summary || {}

  // API 응답 구조에 맞게 데이터 추출
  const totalUsers = summary.users?.total || 0
  const activeStudies = summary.studies?.active || 0
  const pendingReports = summary.reports?.pending || 0
  const newUsersThisWeek = summary.users?.newThisWeek || 0

  // 최근 활동 데이터
  const recentActivity = stats?.recentActivity || {}

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>대시보드</h1>
        <p className={styles.subtitle}>플랫폼 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <StatCard
          title="총 사용자"
          value={totalUsers}
          unit="명"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
            </svg>
          }
          iconColor="primary"
          countUp
          onClick={() => router.push('/admin/users')}
        />

        <StatCard
          title="활성 스터디"
          value={activeStudies}
          unit="개"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z" clipRule="evenodd" />
              <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 01-9.274 0C3.985 17.585 3 16.402 3 15.055z" />
            </svg>
          }
          iconColor="success"
          countUp
          onClick={() => router.push('/admin/studies')}
        />

        <StatCard
          title="처리 대기"
          value={pendingReports}
          unit="건"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          }
          iconColor="warning"
          countUp
          onClick={() => router.push('/admin/reports')}
        />

        <StatCard
          title="신규 가입"
          value={newUsersThisWeek}
          unit="명"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          }
          iconColor="info"
          countUp
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <RecentActivity activity={recentActivity} />
        </div>

        <div className={styles.sideColumn}>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}

