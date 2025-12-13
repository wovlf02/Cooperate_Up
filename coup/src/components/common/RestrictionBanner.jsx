'use client'

import { useRestriction } from '@/hooks/useRestriction'
import styles from './RestrictionBanner.module.css'

/**
 * 활동 제한 배너
 * 사용자에게 현재 적용된 제한 사항을 알림
 */
export default function RestrictionBanner() {
  const { isRestricted, restrictedActions, restrictedUntil } = useRestriction()

  if (!isRestricted) return null

  const getRestrictionLabel = (action) => {
    const labels = {
      STUDY_CREATE: '스터디 생성',
      STUDY_JOIN: '스터디 가입',
      MESSAGE: '메시지 전송',
    }
    return labels[action] || action
  }

  const formattedUntil = restrictedUntil
    ? new Date(restrictedUntil).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '영구'

  return (
    <div className={styles.banner}>
      <div className={styles.icon}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </div>
      <div className={styles.content}>
        <div className={styles.title}>계정에 활동 제한이 적용되어 있습니다</div>
        <div className={styles.details}>
          <span className={styles.restrictions}>
            제한된 활동: {restrictedActions.map(getRestrictionLabel).join(', ')}
          </span>
          <span className={styles.until}>
            해제 예정: {formattedUntil}
          </span>
        </div>
      </div>
    </div>
  )
}

