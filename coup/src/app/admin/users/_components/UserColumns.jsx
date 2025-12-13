'use client'

import Image from 'next/image'
import Link from 'next/link'
import Badge from '@/components/admin/ui/Badge'
import Button from '@/components/admin/ui/Button'
import styles from './UserList.module.css'

/**
 * 사용자 테이블 컬럼 정의
 */
export function getUserColumns() {
  return [
    {
      key: 'user',
      label: '사용자',
      sortable: true,
      width: '300px',
      render: (_, user) => (
        <div className={styles.userCell}>
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || 'User'}
              width={40}
              height={40}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className={styles.userName}>{user.name || '이름 없음'}</div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      width: '120px',
      render: (status) => (
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      ),
    },
    {
      key: 'provider',
      label: '가입방식',
      sortable: true,
      width: '100px',
      render: (provider) => (
        <Badge variant="default">
          {getProviderLabel(provider)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: '가입일',
      sortable: true,
      width: '140px',
      render: (date) => date ? new Date(date).toLocaleDateString('ko-KR') : '-',
    },
    {
      key: 'stats',
      label: '활동',
      width: '150px',
      render: (stats) => (
        <div className={styles.statsCell}>
          <span>스터디 {(stats?.studiesOwned || 0) + (stats?.studiesJoined || 0)}</span>
          <span>메시지 {stats?.messagesCount || 0}</span>
        </div>
      ),
    },
    {
      key: 'warnings',
      label: '경고',
      sortable: true,
      width: '100px',
      render: (_, user) => (
        (user.stats?.warningsCount || 0) > 0 ? (
          <Badge variant="warning">{user.stats.warningsCount}회</Badge>
        ) : (
          <span className={styles.noWarning}>없음</span>
        )
      ),
    },
    {
      key: 'actions',
      label: '액션',
      width: '120px',
      render: (_, user) => (
        <Link href={`/admin/users/${user.id}`}>
          <Button size="sm" variant="outline">상세보기</Button>
        </Link>
      ),
    },
  ]
}

// 헬퍼 함수들
export function getStatusVariant(status) {
  const variants = {
    ACTIVE: 'success',
    SUSPENDED: 'danger',
    DELETED: 'default',
    PENDING: 'warning',
  }
  return variants[status] || 'default'
}

export function getStatusLabel(status) {
  const labels = {
    ACTIVE: '활성',
    SUSPENDED: '정지',
    DELETED: '삭제됨',
    PENDING: '대기',
  }
  return labels[status] || status
}

export function getProviderLabel(provider) {
  const labels = {
    CREDENTIALS: '이메일',
    GOOGLE: 'Google',
    GITHUB: 'GitHub',
  }
  return labels[provider] || provider
}

