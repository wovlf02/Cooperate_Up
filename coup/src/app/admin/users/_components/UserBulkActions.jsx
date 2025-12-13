'use client'

import Button from '@/components/admin/ui/Button'
import styles from './UserList.module.css'

/**
 * 사용자 대량 작업 바
 */
export default function UserBulkActions({ selectedRows, onClearSelection }) {
  if (selectedRows.length === 0) return null

  return (
    <div className={styles.bulkActions}>
      <span>{selectedRows.length}명 선택됨</span>
      <Button size="sm" variant="outline" onClick={onClearSelection}>
        선택 해제
      </Button>
      <Button size="sm" variant="danger">일괄 정지</Button>
    </div>
  )
}

