'use client'

import { useState } from 'react'
import { useMe, useMyStudies, useUserStats } from '@/lib/hooks/useApi'
import HeroProfile from '@/components/my-page/HeroProfile'
import QuickStats from '@/components/my-page/QuickStats'
import TabNavigation from '@/components/my-page/TabNavigation'
import OverviewTab from '@/components/my-page/OverviewTab'
import StudiesTab from '@/components/my-page/StudiesTab'
import SettingsTab from '@/components/my-page/SettingsTab'
import LoadingState from '@/components/my-page/LoadingState'
import ErrorState from '@/components/my-page/ErrorState'
import styles from './page.module.css'

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // API 호출
  const { data: userData, isLoading: userLoading } = useMe()
  const { data: studiesData, isLoading: studiesLoading } = useMyStudies({ limit: 20 })
  const { data: statsData, isLoading: statsLoading } = useUserStats()

  const user = userData?.user || null
  const userStudies = studiesData?.data?.studies || []
  const userStats = statsData?.stats || null

  // 로딩 상태
  if (userLoading || studiesLoading || statsLoading) {
    return (
      <div className={styles.container}>
        <LoadingState />
      </div>
    )
  }

  // 에러 상태
  if (!user) {
    return (
      <div className={styles.container}>
        <ErrorState
          message="사용자 정보를 불러올 수 없습니다."
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  // 탭 콘텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={userStats} studies={userStudies} />
      case 'studies':
        return <StudiesTab studies={userStudies} />
      case 'settings':
        return <SettingsTab />
      default:
        return <OverviewTab stats={userStats} studies={userStudies} />
    }
  }

  return (
    <div className={styles.container}>
      {/* 히어로 프로필 섹션 */}
      <HeroProfile user={user} />

      {/* 퀵 스탯 */}
      <QuickStats stats={userStats} user={user} />

      {/* 탭 네비게이션 */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 탭 콘텐츠 */}
      <main className={styles.tabContent}>
        {renderTabContent()}
      </main>
    </div>
  )
}

