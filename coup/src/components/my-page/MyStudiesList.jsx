'use client'

import Link from 'next/link'
import { getRelativeTime } from '@/utils/time'
import { getRoleText } from '@/utils/format'
import styles from './MyStudiesList.module.css'

export default function MyStudiesList({ studies }) {
  const getRoleBadgeClass = (role) => {
    const classMap = {
      OWNER: styles.roleOwner,
      ADMIN: styles.roleAdmin,
      MEMBER: styles.roleMember,
      PENDING: styles.rolePending,
    }
    return classMap[role] || styles.roleMember
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeaderWrapper}>
        <h2 className={styles.sectionHeader}>
          3. 참여 중인 스터디 ({studies.length}개)
        </h2>
        <Link href="/my-studies" className={styles.viewAllButton}>
          전체보기
        </Link>
      </div>

      {studies.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>참여 중인 스터디가 없습니다</p>
        </div>
      ) : (
        <div className={styles.studyList}>
          {studies.map((item) => {
            // study 객체 추출 (API 응답 구조에 맞춰)
            const study = item.study || item
            const role = item.role || study.role

            return (
              <div key={study.id} className={styles.studyItem}>
                <div className={styles.studyHeader}>
                  <span className={styles.studyEmoji}>{study.emoji}</span>
                  <h3 className={styles.studyName}>{study.name}</h3>
                </div>

                <div className={styles.studyMeta}>
                  <span className={`${styles.roleBadge} ${getRoleBadgeClass(role)}`}>
                    {getRoleText(role)}
                  </span>
                  <span className={styles.memberCount}>
                    👥 {study.currentMembers || study.members?.current || 0}명
                  </span>
                  <span className={styles.lastActivity}>
                    마지막 활동: {getRelativeTime(study.lastActivity || item.joinedAt)}
                  </span>
                </div>

                <Link
                  href={`/my-studies/${study.id}`}
                  className={styles.goToButton}
                >
                  이동하기 →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
