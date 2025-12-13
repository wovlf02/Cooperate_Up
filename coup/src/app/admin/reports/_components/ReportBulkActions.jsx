'use client'

import Button from '@/components/admin/ui/Button'
import styles from './ReportList.module.css'

/**
 * 신고 대량 작업 바
 */
export default function ReportBulkActions({ selectedRows, onClearSelection }) {
  if (selectedRows.length === 0) return null

  return (
    <div className={styles.bulkActions}>
      <span>{selectedRows.length}개 선택됨</span>
      <Button size="sm" variant="outline" onClick={onClearSelection}>
        선택 해제
      </Button>
      <Button size="sm" variant="success">일괄 승인</Button>
      <Button size="sm" variant="danger">일괄 거부</Button>
    </div>
  )
}

