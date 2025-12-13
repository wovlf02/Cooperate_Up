'use client'

import { useRouter } from 'next/navigation'
import styles from './Widget.module.css'

export default function PinnedNoticeWidget({ studyId }) {
  const router = useRouter()
  
  // TODO: 실제 데이터는 API에서 가져오기
  const pinnedNotice = {
    id: 1,
    title: '이번 주 스터디 일정 안내',
    author: '김철수',
    createdAt: '2시간 전'
  }

  if (!pinnedNotice) return null

  return (
    <div className={styles.widget}>
      <div className={styles.widgetTitle}>
        📌 고정 공지
      </div>
      <div className={styles.widgetContent}>
        <div onClick={() => router.push(`/studies/${studyId}/notices/${pinnedNotice.id}`)}>
          <div className={styles.noticeTitle}>
            {pinnedNotice.title}
          </div>
          <div className={styles.noticeMeta}>
            {pinnedNotice.author} · {pinnedNotice.createdAt}
          </div>
          <a 
            href={`/studies/${studyId}/notices/${pinnedNotice.id}`}
            className={styles.linkButton}
          >
            자세히 보기 →
          </a>
        </div>
      </div>
    </div>
  )
}
