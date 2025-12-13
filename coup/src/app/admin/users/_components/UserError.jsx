'use client'

import Button from '@/components/admin/ui/Button'
import { Card } from '@/components/admin/ui/Card'
import styles from './UserList.module.css'

/**
 * 에러 상태 표시 컴포넌트
 */
export default function UserError({ error, onRetry }) {
  return (
    <Card>
      <div className={styles.error}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
        <p>⚠️ 사용자 목록을 불러올 수 없습니다.</p>
        <p>{error}</p>
        <Button onClick={onRetry} variant="primary">다시 시도</Button>
      </div>
    </Card>
  )
}

