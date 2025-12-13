'use client'

import Link from 'next/link'
import { getRelativeTime } from '@/utils/time'
import { getRoleText } from '@/utils/format'
import styles from './StudiesTab.module.css'

// 스터디 카드 컴포넌트
function StudyCard({ study, role, joinedAt }) {
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
      <div className={styles.studyLeft}>
        <span className={styles.studyEmoji}>{study.emoji || '📚'}</span>
        <div className={styles.studyInfo}>
          <h4 className={styles.studyName}>{study.name}</h4>
          <div className={styles.studyMeta}>
            <span className={styles.memberCount}>
              👥 {study.currentMembers || 0}/{study.maxMembers || 20}명
            </span>
            {hasNewActivity && (
              <>
                <span className={styles.dot}>•</span>
                <span className={styles.newActivity}>
                  {newMessages > 0 && <span className={styles.badge}>💬 {newMessages}</span>}
                  {newNotices > 0 && <span className={styles.badge}>📢 {newNotices}</span>}
                </span>
              </>
            )}
            {joinedAt && (
              <>
                <span className={styles.dot}>•</span>
                <span className={styles.joinedAt}>가입 {getRelativeTime(joinedAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className={styles.studyRight}>
        <span className={`${styles.roleBadge} ${getRoleBadgeClass(role)}`}>
          {getRoleText(role)}
        </span>
        <span className={styles.arrow}>→</span>
      </div>
    </Link>
  )
}

export default function StudiesTab({ studies }) {
  // 역할별로 그룹화
  const ownedStudies = studies.filter(item => (item.role || item.study?.role) === 'OWNER')
  const adminStudies = studies.filter(item => (item.role || item.study?.role) === 'ADMIN')
  const memberStudies = studies.filter(item => (item.role || item.study?.role) === 'MEMBER')

  const renderStudyList = (studyList, emptyMessage) => {
    if (studyList.length === 0) {
      return <p className={styles.emptyMessage}>{emptyMessage}</p>
    }
    return (
      <div className={styles.studyList}>
        {studyList.map((item) => {
          const study = item.study || item
          const role = item.role || study.role
          const joinedAt = item.joinedAt
          return <StudyCard key={study.id} study={study} role={role} joinedAt={joinedAt} />
        })}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.titleIcon}>📚</span>
            내 스터디
            <span className={styles.countBadge}>{studies.length}</span>
          </h3>
          <Link href="/studies" className={styles.createBtn}>
            + 새 스터디 만들기
          </Link>
        </div>

        {studies.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📭</span>
            <p className={styles.emptyText}>참여 중인 스터디가 없습니다</p>
            <p className={styles.emptySubtext}>스터디를 탐색하거나 직접 만들어보세요!</p>
            <div className={styles.emptyActions}>
              <Link href="/studies" className={styles.exploreBtn}>
                스터디 탐색
              </Link>
              <Link href="/studies/create" className={styles.createNewBtn}>
                스터디 만들기
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.groupedList}>
            {ownedStudies.length > 0 && (
              <div className={styles.studyGroup}>
                <h4 className={styles.groupTitle}>
                  <span className={styles.groupIcon}>👑</span>
                  내가 만든 스터디
                  <span className={styles.groupCount}>{ownedStudies.length}</span>
                </h4>
                {renderStudyList(ownedStudies, '')}
              </div>
            )}

            {adminStudies.length > 0 && (
              <div className={styles.studyGroup}>
                <h4 className={styles.groupTitle}>
                  <span className={styles.groupIcon}>⚡</span>
                  관리자로 참여
                  <span className={styles.groupCount}>{adminStudies.length}</span>
                </h4>
                {renderStudyList(adminStudies, '')}
              </div>
            )}

            {memberStudies.length > 0 && (
              <div className={styles.studyGroup}>
                <h4 className={styles.groupTitle}>
                  <span className={styles.groupIcon}>🙋</span>
                  멤버로 참여
                  <span className={styles.groupCount}>{memberStudies.length}</span>
                </h4>
                {renderStudyList(memberStudies, '')}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

