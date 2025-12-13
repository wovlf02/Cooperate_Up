/**
 * PinnedNotice.jsx
 *
 * 고정 공지 위젯 (메모이제이션)
 * - 고정된 공지사항 표시
 * - 상대 시간 표시
 * - 내용 미리보기
 *
 * @module components/dashboard/widgets/PinnedNotice
 */

'use client'

import { memo } from 'react'
import styles from './Widget.module.css'
import Link from 'next/link'
import { PinnedNoticeSkeleton } from './WidgetSkeleton'

/**
 * 안전한 상대 시간 포맷팅
 */
function formatRelativeTime(dateString) {
  try {
    const date = new Date(dateString)
    const now = new Date()
    
    if (isNaN(date.getTime())) {
      return '날짜 오류'
    }
    
    const diff = now - date
    
    if (diff < 0) {
      return '방금 전'
    }

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    const weeks = Math.floor(diff / 604800000)
    const months = Math.floor(diff / 2592000000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    if (weeks < 4) return `${weeks}주 전`
    if (months < 12) return `${months}개월 전`

    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    })
  } catch (error) {
    return '날짜 오류'
  }
}

/**
 * 안전한 텍스트 자르기
 */
function truncateText(text, maxLength = 80) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * 고정 공지 위젯 컴포넌트
 */
function PinnedNoticeComponent({ notice, isLoading = false }) {
  if (isLoading) {
    return <PinnedNoticeSkeleton />
  }

  if (!notice) {
    return null
  }

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>📌 고정 공지</h3>
      
      <div className={styles.noticeContent}>
        <h4 className={styles.noticeTitle}>
          {notice.title || '제목 없음'}
        </h4>
        <div className={styles.noticeMeta}>
          <span>{notice.authorName || '알 수 없음'}</span>
          <span>·</span>
          <span>{formatRelativeTime(notice.createdAt)}</span>
        </div>
        {notice.content && (
          <p className={styles.noticePreview}>
            {truncateText(notice.content, 80)}
          </p>
        )}
      </div>

      <Link 
        href={`/notices/${notice.id}`} 
        className={styles.widgetLink}
      >
        자세히 보기 →
      </Link>
    </div>
  )
}

/**
 * Props 비교 함수
 */
const arePropsEqual = (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false

  const prevNotice = prevProps.notice
  const nextNotice = nextProps.notice

  if (prevNotice === null && nextNotice === null) return true
  if (prevNotice === null || nextNotice === null) return false

  return (
    prevNotice.id === nextNotice.id &&
    prevNotice.title === nextNotice.title &&
    prevNotice.content === nextNotice.content &&
    prevNotice.authorName === nextNotice.authorName &&
    prevNotice.createdAt === nextNotice.createdAt
  )
}

export default memo(PinnedNoticeComponent, arePropsEqual)
