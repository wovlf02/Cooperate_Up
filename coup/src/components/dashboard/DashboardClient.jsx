'use client'

import Link from 'next/link'
import styles from '@/app/dashboard/page.module.css'
import DashboardSkeleton from './DashboardSkeleton'
import EmptyState from './EmptyState'
import { useDashboard, useMe } from '@/lib/hooks/useApi'

// ErrorBoundary import
import DashboardErrorBoundary from './ErrorBoundary'
import WidgetErrorBoundary from './widgets/WidgetErrorBoundary'

// 위젯 컴포넌트 import
import StudyStatus from './widgets/StudyStatus'
import OnlineMembers from './widgets/OnlineMembers'
import QuickActions from './widgets/QuickActions'
import UrgentTasks from './widgets/UrgentTasks'
import PinnedNotice from './widgets/PinnedNotice'

export default function DashboardClient({ user: initialUser }) {
  // 실제 API Hook 사용 - 최신 사용자 정보를 가져옴
  const { data: dashboardData, isLoading } = useDashboard()
  const { data: userData, isLoading: userLoading } = useMe()

  // 최신 사용자 정보 사용 (API에서 가져온 데이터가 있으면 그것을 사용, 없으면 초기 데이터 사용)
  const user = userData?.user || initialUser

  if (isLoading || userLoading) {
    return <DashboardSkeleton />
  }

  if (!dashboardData?.data) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <EmptyState
            icon="⚠️"
            title="데이터를 불러올 수 없습니다"
            description="잠시 후 다시 시도해주세요"
          />
        </div>
      </div>
    )
  }

  const { stats, myStudies, recentActivities, upcomingEvents, widgetData } = dashboardData.data

  // 통계 카드 데이터 - useMemo로 최적화
  const statsCards = useMemo(() => [
    {
      icon: '📚',
      label: '활성 스터디',
      value: stats.activeStudies,
      color: 'blue'
    },
    {
      icon: '✅',
      label: '진행 중인 할일',
      value: stats.pendingTasks,
      color: 'green'
    },
    {
      icon: '🔔',
      label: '읽지 않은 알림',
      value: stats.unreadNotifications,
      color: 'yellow'
    },
    {
      icon: '🎯',
      label: '이번 달 완료',
      value: stats.completedThisMonth,
      color: 'purple'
    }
  ], [
    stats.activeStudies,
    stats.pendingTasks,
    stats.unreadNotifications,
    stats.completedThisMonth
  ])

  // useMemo로 위젯 통계 데이터 최적화
  const widgetStats = useMemo(() => widgetData?.stats || {
    attendanceRate: stats.attendanceRate || 0,
    attendedCount: stats.attendedCount || 0,
    totalAttendance: stats.totalAttendance || 0,
    taskCompletionRate: stats.taskCompletionRate || 0,
    completedTasks: stats.completedTasks || 0,
    totalTasks: stats.totalTasks || stats.pendingTasks || 0,
    streakDays: stats.streakDays || 0
  }, [widgetData?.stats, stats])

  // useMemo로 다음 이벤트 데이터 최적화
  const nextEvent = useMemo(() => {
    if (widgetData?.nextEvent) return widgetData.nextEvent

    if (upcomingEvents && upcomingEvents.length > 0) {
      return {
        dday: calculateDday(upcomingEvents[0].date),
        date: formatEventDate(upcomingEvents[0].date),
        title: upcomingEvents[0].title
      }
    }

    return null
  }, [widgetData?.nextEvent, upcomingEvents])

  return (
    <DashboardErrorBoundary userId={user?.id}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
        {/* 페이지 헤더 */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>📊 대시보드</h1>
            <p className={styles.subtitle}>
              나의 활동을 한눈에 확인하세요
            </p>
          </div>
        </header>

        {/* 환영 메시지 */}
        <div className={styles.welcomeSection}>
          <p className={styles.welcomeMessage}>안녕하세요, {user.name}님! 👋</p>
        </div>

        {/* 통계 카드 */}
        <div className={styles.statsGrid}>
          {statsCards.map((stat, index) => (
            <div key={index} className={`${styles.statCard} ${styles[stat.color]}`}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* 내 스터디 섹션 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>내 스터디</h2>
            <Link href="/my-studies" className={styles.sectionLink}>
              전체 보기 →
            </Link>
          </div>

          {myStudies.length === 0 ? (
            <EmptyState
              icon="📚"
              title="참여 중인 스터디가 없습니다"
              description="새로운 스터디를 찾아보세요!"
              actionText="스터디 탐색하기"
              actionHref="/studies"
            />
          ) : (
            <div className={styles.studiesGrid}>
              {myStudies.map((study) => (
                <Link
                  key={study.id}
                  href={`/my-studies/${study.id}`}
                  className={styles.studyCard}
                >
                  <div className={styles.studyEmoji}>{study.emoji}</div>
                  <h3 className={styles.studyName}>{study.name}</h3>
                  <p className={styles.studyCategory}>{study.category}</p>
                  <div className={styles.studyMeta}>
                    <span className={styles.studyRole}>
                      {study.role === 'OWNER' ? '👑 스터디장' : '👤 멤버'}
                    </span>
                    <span className={styles.studyMembers}>
                      {study.memberCount}명
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 알림 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>알림</h2>
            <Link href="/notifications" className={styles.sectionLink}>
              전체 보기 →
            </Link>
          </div>

          {recentActivities.length === 0 ? (
            <EmptyState
              icon="📭"
              title="알림이 없습니다"
              description="새로운 알림이 오면 여기에 표시됩니다"
            />
          ) : (
            <div className={styles.activitiesList}>
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`${styles.activityItem} ${!activity.isRead ? styles.unread : ''}`}
                >
                  <div className={styles.activityIcon}>
                    {activity.studyEmoji || '📢'}
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityMessage}>{activity.message}</p>
                    {activity.studyName && (
                      <p className={styles.activityStudy}>{activity.studyName}</p>
                    )}
                  </div>
                  <div className={styles.activityTime}>
                    {formatRelativeTime(activity.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 다가오는 일정 */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>다가오는 일정</h2>
            </div>

            <div className={styles.eventsList}>
              {upcomingEvents.map((event) => (
                <div key={event.id} className={styles.eventItem}>
                  <div className={styles.eventDate}>
                    <div className={styles.eventDay}>
                      {new Date(event.date).getDate()}
                    </div>
                    <div className={styles.eventMonth}>
                      {new Date(event.date).getMonth() + 1}월
                    </div>
                  </div>
                  <div className={styles.eventContent}>
                    <h4 className={styles.eventTitle}>
                      {event.studyEmoji} {event.title}
                    </h4>
                    <p className={styles.eventStudy}>{event.studyName}</p>
                    <p className={styles.eventTime}>
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 우측 사이드바 위젯 */}
      <aside className={styles.sidebar}>
        {/* 스터디 현황 */}
        <WidgetErrorBoundary widgetName="스터디 현황">
          <StudyStatus stats={widgetStats} nextEvent={nextEvent} />
        </WidgetErrorBoundary>

        {/* 온라인 멤버 */}
        <WidgetErrorBoundary widgetName="온라인 멤버">
          <OnlineMembers
            members={widgetData?.onlineMembers || []}
            totalMembers={widgetData?.totalMembers || 0}
          />
        </WidgetErrorBoundary>

        {/* 빠른 액션 */}
        <WidgetErrorBoundary widgetName="빠른 액션">
          <QuickActions />
        </WidgetErrorBoundary>

        {/* 고정 공지 */}
        {widgetData?.pinnedNotice && (
          <WidgetErrorBoundary widgetName="고정 공지">
            <PinnedNotice notice={widgetData.pinnedNotice} />
          </WidgetErrorBoundary>
        )}

        {/* 급한 할일 */}
        <WidgetErrorBoundary widgetName="급한 할일">
          <UrgentTasks tasks={widgetData?.urgentTasks || []} />
        </WidgetErrorBoundary>
      </aside>
    </div>
    </DashboardErrorBoundary>
  )
}

// 상대 시간 포맷팅
function formatRelativeTime(dateString) {
  try {
    const date = new Date(dateString)
    const now = new Date()

    // Invalid Date 체크
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString)
      return '날짜 오류'
    }

    const diff = now - date

    // 음수 방지 (미래 날짜)
    if (diff < 0) {
      return '방금 전'
    }

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`

    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return '날짜 오류'
  }
}

// D-day 계산
function calculateDday(dateString) {
  try {
    const eventDate = new Date(dateString)
    const now = new Date()

    // Invalid Date 체크
    if (isNaN(eventDate.getTime())) {
      console.error('Invalid event date:', dateString)
      return 0
    }

    // 자정 기준으로 계산
    eventDate.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)

    const diffTime = eventDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // 음수 방지 (과거 일정)
    return Math.max(0, diffDays)
  } catch (error) {
    console.error('Error calculating D-day:', error)
    return 0
  }
}

// 이벤트 날짜 포맷팅
function formatEventDate(dateString) {
  try {
    const date = new Date(dateString)

    if (isNaN(date.getTime())) {
      return '날짜 오류'
    }

    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return '날짜 오류'
  }
}
