'use client'

import { useState, useEffect } from 'react'
import styles from './ActivityStats.module.css'

/**
 * 숫자 카운팅 애니메이션 훅
 */
function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) {
      // requestAnimationFrame을 사용하여 비동기적으로 setState 호출
      const frame = requestAnimationFrame(() => setCount(0))
      return () => cancelAnimationFrame(frame)
    }

    let startTime = null
    let animationId = null

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * target))

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      }
    }
    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [target, duration])

  return count
}

/**
 * 통계 카드 컴포넌트
 */
function StatCard({ icon, label, value, unit, color, delay = 0 }) {
  const animatedValue = useCountUp(value, 800)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`${styles.statCard} ${styles[color]} ${isVisible ? styles.visible : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statContent}>
        <span className={styles.statValue}>
          {animatedValue}
          <span className={styles.statUnit}>{unit}</span>
        </span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </div>
  )
}

/**
 * 원형 진행률 표시 컴포넌트
 */
function CircularProgress({ value, label, icon }) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 300)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className={styles.circularContainer}>
      <div className={styles.circularWrapper}>
        <svg className={styles.circularSvg} viewBox="0 0 100 100">
          <circle
            className={styles.circularBg}
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="8"
          />
          <circle
            className={styles.circularProgress}
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className={styles.circularContent}>
          <span className={styles.circularIcon}>{icon}</span>
          <span className={styles.circularValue}>{animatedValue}%</span>
        </div>
      </div>
      <span className={styles.circularLabel}>{label}</span>
    </div>
  )
}

/**
 * 가입 기간 타임라인 컴포넌트
 */
function JoinedTimeline({ days }) {
  const milestones = [
    { day: 7, label: '1주', icon: '🌱' },
    { day: 30, label: '1달', icon: '🌿' },
    { day: 90, label: '3달', icon: '🌳' },
    { day: 180, label: '6달', icon: '🏆' },
    { day: 365, label: '1년', icon: '👑' },
  ]

  const currentMilestone = milestones.filter(m => days >= m.day).pop()
  const nextMilestone = milestones.find(m => days < m.day) || milestones[milestones.length - 1]
  const progress = Math.min((days / nextMilestone.day) * 100, 100)

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineHeader}>
        <span className={styles.timelineIcon}>{currentMilestone?.icon || '🌱'}</span>
        <div className={styles.timelineInfo}>
          <span className={styles.timelineDays}>{days}일차</span>
          <span className={styles.timelineLabel}>함께한 시간</span>
        </div>
      </div>
      <div className={styles.timelineBar}>
        <div
          className={styles.timelineProgress}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className={styles.timelineMilestones}>
        {milestones.slice(0, 4).map((milestone) => (
          <span
            key={milestone.day}
            className={`${styles.milestone} ${days >= milestone.day ? styles.achieved : ''}`}
          >
            {milestone.icon}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ActivityStats({ stats }) {
  if (!stats) return null

  const thisWeekStats = [
    { icon: '✅', label: '완료한 할 일', value: stats.thisWeek?.completedTasks || 0, unit: '개', color: 'green' },
    { icon: '📢', label: '작성한 공지', value: stats.thisWeek?.createdNotices || 0, unit: '개', color: 'blue' },
    { icon: '📁', label: '업로드한 파일', value: stats.thisWeek?.uploadedFiles || 0, unit: '개', color: 'purple' },
    { icon: '💬', label: '참여한 채팅', value: stats.thisWeek?.chatMessages || 0, unit: '회', color: 'orange' },
  ]

  const totalStats = [
    { icon: '📚', label: '참여 스터디', value: stats.total?.studyCount || 0, unit: '개', color: 'cyan' },
    { icon: '🎯', label: '완료한 할 일', value: stats.total?.completedTasks || 0, unit: '개', color: 'pink' },
  ]

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>
        <span className={styles.headerIcon}>📊</span>
        활동 통계
      </h2>

      <div className={styles.statsWrapper}>
        {/* 이번 주 활동 */}
        <div className={styles.statsSection}>
          <h3 className={styles.statsSectionTitle}>
            <span className={styles.titleDot} />
            이번 주 활동
          </h3>
          <div className={styles.statsGrid}>
            {thisWeekStats.map((stat, index) => (
              <StatCard
                key={stat.label}
                {...stat}
                delay={index * 100}
              />
            ))}
          </div>
        </div>

        {/* 전체 통계 */}
        <div className={styles.statsSection}>
          <h3 className={styles.statsSectionTitle}>
            <span className={styles.titleDot} />
            전체 성과
          </h3>

          <div className={styles.overallStats}>
            {/* 왼쪽: 카드 통계 */}
            <div className={styles.overallCards}>
              {totalStats.map((stat, index) => (
                <StatCard
                  key={stat.label}
                  {...stat}
                  delay={400 + index * 100}
                />
              ))}
            </div>

            {/* 중앙: 출석률 원형 차트 */}
            <CircularProgress
              value={stats.total?.averageAttendance || 0}
              label="평균 출석률"
              icon="📅"
            />

            {/* 오른쪽: 가입 기간 타임라인 */}
            <JoinedTimeline days={stats.total?.joinedDays || 1} />
          </div>
        </div>

        {/* 달성 배지 */}
        {stats.badges && stats.badges.length > 0 && (
          <div className={styles.statsSection}>
            <h3 className={styles.statsSectionTitle}>
              <span className={styles.titleDot} />
              달성 배지
            </h3>
            <div className={styles.badgesGrid}>
              {stats.badges.map((badge, index) => (
                <div
                  key={badge.id}
                  className={styles.badgeCard}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className={styles.badgeIcon}>{badge.icon}</span>
                  <span className={styles.badgeName}>{badge.name}</span>
                  <span className={styles.badgeDesc}>{badge.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

