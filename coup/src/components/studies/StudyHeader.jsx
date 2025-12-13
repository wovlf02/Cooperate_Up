'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './StudyHeader.module.css'

export default function StudyHeader({ studyId, study }) {
  const router = useRouter()
  const pathname = usePathname()

  const tabs = [
    { label: '개요', path: `/my-studies/${studyId}` },
    { label: '채팅', path: `/my-studies/${studyId}/chat` },
    { label: '공지', path: `/my-studies/${studyId}/notices` },
    { label: '파일', path: `/my-studies/${studyId}/files` },
    { label: '캘린더', path: `/my-studies/${studyId}/calendar` },
    { label: '할일', path: `/my-studies/${studyId}/tasks` },
    { label: '화상 스터디', path: `/my-studies/${studyId}/video-call` },
  ]

  // 스터디장만 설정 탭 표시
  if (study?.role === 'OWNER') {
    tabs.push({ label: '설정', path: `/my-studies/${studyId}/settings` })
  }

  return (
    <div className={styles.headerContainer}>
      {/* 뒤로가기 버튼 */}
      <button onClick={() => router.back()} className={styles.backButton}>
        ← 스터디 목록으로
      </button>

      {/* 스터디 헤더 카드 */}
      <div className={styles.studyCard}>
        <div className={styles.studyInfo}>
          <div className={styles.studyMain}>
            {study?.emoji && <span className={styles.emoji}>{study.emoji}</span>}
            <div>
              <h1 className={styles.studyName}>{study?.name || '스터디'}</h1>
              <div className={styles.studyMeta}>
                <span>OWNER: {study?.owner?.name || '그룹장'}</span>
                <span>•</span>
                <span>{study?.currentMembers || 0}/{study?.maxMembers || 0}명</span>
                <span>•</span>
                <span>{study?.category || '카테고리'}</span>
              </div>
            </div>
          </div>

          {study?.role && (
            <div className={styles.actions}>
              <button className={styles.primaryButton}>
                💬 채팅하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <nav className={styles.tabs}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || 
            (tab.path === `/my-studies/${studyId}` && pathname === `/my-studies/${studyId}`)
          
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`${styles.tab} ${isActive ? styles.active : ''}`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
