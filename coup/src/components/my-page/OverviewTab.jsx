'use client'

import Link from 'next/link'
import { getRelativeTime } from '@/utils/time'
import { getRoleText } from '@/utils/format'
import styles from './OverviewTab.module.css'

// 활동 통계 아이템 컴포넌트
function ActivityItem({ icon, label, value, color }) {
  return (
    <div className={`${styles.activityItem} ${styles[color]}`}>
      <span className={styles.activityIcon}>{icon}</span>
      <span className={styles.activityValue}>{value}</span>
      <span className={styles.activityLabel}>{label}</span>
    </div>
  )
}

// 스터디 카드 컴포넌트
function StudyCard({ study, role }) {
  const getRoleBadgeClass = (role) => {
    const classMap = {
      OWNER: styles.roleOwner,
      ADMIN: styles.roleAdmin,
      MEMBER: styles.roleMember,
      PENDING: styles.rolePending,
    }
    return classMap[role] || styles.roleMember
  }

  // 새 활동 표시 (메시지 + 공지)
  const newMessages = study.newMessages || 0
  const newNotices = study.newNotices || 0
  const hasNewActivity = newMessages > 0 || newNotices > 0

  return (
    <Link href={`/my-studies/${study.id}`} className={styles.studyCard}>
      <div className={styles.studyCardTop}>
        <span className={styles.studyEmoji}>{study.emoji || '📚'}</span>
        <span className={`${styles.roleBadge} ${getRoleBadgeClass(role)}`}>
          {getRoleText(role)}
        </span>
      </div>
      <h4 className={styles.studyName}>{study.name}</h4>
      <div className={styles.studyMeta}>
        <span className={styles.memberCount}>
          👥 {study.currentMembers || 0}/{study.maxMembers || 20}
        </span>
        {hasNewActivity && (
          <span className={styles.newActivity}>
            {newMessages > 0 && `💬 ${newMessages}`}
            {newMessages > 0 && newNotices > 0 && ' '}
            {newNotices > 0 && `📢 ${newNotices}`}
          </span>
        )}
      </div>
    </Link>
  )
}

export default function OverviewTab({ stats, studies }) {
  const thisWeekStats = [
    { icon: '✅', label: '완료 할 일', value: stats?.thisWeek?.completedTasks || 0, color: 'green' },
    { icon: '📢', label: '작성 공지', value: stats?.thisWeek?.createdNotices || 0, color: 'blue' },
    { icon: '📁', label: '업로드 파일', value: stats?.thisWeek?.uploadedFiles || 0, color: 'purple' },
    { icon: '💬', label: '채팅 참여', value: stats?.thisWeek?.chatMessages || 0, color: 'orange' },
  ]

  return (
    <div className={styles.container}>
      {/* 이번 주 활동 */}
      <section className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.titleIcon}>📈</span>
          이번 주 활동
        </h3>
        <div className={styles.activityGrid}>
          {thisWeekStats.map((stat, index) => (
            <ActivityItem key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* 참여 중인 스터디 */}
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.titleIcon}>📚</span>
            참여 중인 스터디
          </h3>
          <Link href="/my-studies" className={styles.viewAllLink}>
            전체보기 →
          </Link>
        </div>

        {studies.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📭</span>
            <p className={styles.emptyText}>참여 중인 스터디가 없습니다</p>
            <Link href="/studies" className={styles.exploreBtn}>
              스터디 탐색하기
            </Link>
          </div>
        ) : (
          <div className={styles.studiesGrid}>
            {studies.slice(0, 4).map((item) => {
              const study = item.study || item
              const role = item.role || study.role
              return <StudyCard key={study.id} study={study} role={role} />
            })}
          </div>
        )}
      </section>
    </div>
  )
}

