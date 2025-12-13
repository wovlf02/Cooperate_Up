'use client'

import Link from 'next/link'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import styles from './ReportList.module.css'

/**
 * 신고 테이블 컬럼 정의
 */
export function getReportColumns() {
  return [
    {
      key: 'type',
      label: '유형',
      sortable: true,
      width: '120px',
      render: (type) => (
        <Badge variant="default" style={{
          backgroundColor: getTypeColor(type).bg,
          color: getTypeColor(type).fg,
        }}>
          {getTypeLabel(type)}
        </Badge>
      ),
    },
    {
      key: 'targetName',
      label: '대상',
      sortable: true,
      width: '200px',
      render: (targetName, report) => (
        <div className={styles.targetCell}>
          <div className={styles.targetTitle}>
            {targetName || report.targetId?.substring(0, 8) || '알 수 없음'}
          </div>
          <div className={styles.targetType}>
            {getTargetTypeLabel(report.targetType)}
          </div>
        </div>
      ),
    },
    {
      key: 'reporter',
      label: '신고자',
      sortable: true,
      width: '150px',
      render: (_, report) => (
        <div className={styles.reporterName}>
          {report.reporter?.name || '알 수 없음'}
        </div>
      ),
    },
    {
      key: 'reason',
      label: '사유',
      width: '250px',
      render: (reason) => (
        <div className={styles.reason}>
          {reason ? (reason.length > 50 ? reason.substring(0, 50) + '...' : reason) : '-'}
        </div>
      ),
    },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      width: '100px',
      render: (status) => (
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      ),
    },
    {
      key: 'priority',
      label: '우선순위',
      sortable: true,
      width: '100px',
      render: (priority) => (
        <Badge variant={getPriorityVariant(priority)}>
          {getPriorityLabel(priority)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: '신고일',
      sortable: true,
      width: '120px',
      render: (date) => date ? new Date(date).toLocaleDateString('ko-KR') : '-',
    },
    {
      key: 'actions',
      label: '액션',
      width: '120px',
      render: (_, report) => (
        <Link href={`/admin/reports/${report.id}`}>
          <Button size="sm" variant="outline">처리하기</Button>
        </Link>
      ),
    },
  ]
}

// 헬퍼 함수들
export function getStatusVariant(status) {
  const variants = {
    PENDING: 'warning',
    IN_PROGRESS: 'primary',
    RESOLVED: 'success',
    REJECTED: 'danger',
  }
  return variants[status] || 'default'
}

export function getStatusLabel(status) {
  const labels = {
    PENDING: '대기중',
    IN_PROGRESS: '처리중',
    RESOLVED: '해결됨',
    REJECTED: '거부됨',
  }
  return labels[status] || status
}

export function getTypeLabel(type) {
  const labels = {
    SPAM: '스팸',
    HARASSMENT: '괴롭힘',
    INAPPROPRIATE: '부적절',
    COPYRIGHT: '저작권',
    OTHER: '기타',
  }
  return labels[type] || type
}

export function getTypeColor(type) {
  const colors = {
    SPAM: { bg: 'var(--warning-50)', fg: 'var(--warning-700)' },
    HARASSMENT: { bg: 'var(--danger-50)', fg: 'var(--danger-700)' },
    INAPPROPRIATE: { bg: 'var(--danger-100)', fg: 'var(--danger-600)' },
    COPYRIGHT: { bg: 'var(--info-50)', fg: 'var(--info-700)' },
    OTHER: { bg: 'var(--gray-100)', fg: 'var(--gray-600)' },
  }
  return colors[type] || { bg: 'var(--gray-100)', fg: 'var(--gray-600)' }
}

export function getTargetTypeLabel(targetType) {
  const labels = {
    USER: '사용자',
    STUDY: '스터디',
    MESSAGE: '메시지',
  }
  return labels[targetType] || targetType
}

export function getPriorityVariant(priority) {
  const variants = {
    LOW: 'default',
    MEDIUM: 'info',
    HIGH: 'warning',
    URGENT: 'danger',
  }
  return variants[priority] || 'default'
}

export function getPriorityLabel(priority) {
  const labels = {
    LOW: '낮음',
    MEDIUM: '보통',
    HIGH: '높음',
    URGENT: '긴급',
  }
  return labels[priority] || priority
}

