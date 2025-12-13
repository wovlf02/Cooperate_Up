'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import UserList from './_components/UserList'
import UserFilters from './_components/UserFilters'
import styles from './page.module.css'

export default function UsersPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>사용자 관리</h1>
          <p className={styles.subtitle}>모든 사용자를 관리하고 모니터링하세요</p>
        </div>
      </div>

      <Suspense fallback={null}>
        <UserFilters />
      </Suspense>

      <Suspense fallback={<UserListSkeleton />}>
        <UserListWrapper />
      </Suspense>
    </div>
  )
}

function UserListWrapper() {
  const searchParams = useSearchParams()

  // searchParams를 객체로 변환
  const params = {
    page: searchParams.get('page') || '1',
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    provider: searchParams.get('provider') || '',
  }

  return <UserList searchParams={params} />
}

function UserListSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonTable}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={styles.skeletonRow}>
            <div className={styles.skeletonCell} style={{ width: '40%' }} />
            <div className={styles.skeletonCell} style={{ width: '20%' }} />
            <div className={styles.skeletonCell} style={{ width: '20%' }} />
            <div className={styles.skeletonCell} style={{ width: '20%' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

