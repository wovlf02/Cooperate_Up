'use client'

import styles from './ReportList.module.css'

/**
 * 빈 상태 표시 컴포넌트
 */
export default function ReportEmptyState() {
  return (
    <div className={styles.empty}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" width="48" height="48">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p>신고가 없습니다</p>
    </div>
  )
}

