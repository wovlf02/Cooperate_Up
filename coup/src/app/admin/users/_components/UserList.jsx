'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Table from '@/components/admin/ui/Table'
import { Card } from '@/components/admin/ui/Card'
import api from '@/lib/api'
import { getUserColumns } from './UserColumns'
import UserBulkActions from './UserBulkActions'
import UserError from './UserError'
import UserEmptyState from './UserEmptyState'
import styles from './UserList.module.css'

export default function UserList({ searchParams }) {
  const { status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [pagination, setPagination] = useState(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {}
      if (searchParams?.page) params.page = searchParams.page
      if (searchParams?.search) params.search = searchParams.search
      if (searchParams?.status) params.status = searchParams.status
      if (searchParams?.provider) params.provider = searchParams.provider

      console.log('🔍 Fetching users with params:', params)

      const result = await api.get('/api/admin/users', params)
      console.log('📊 Users API Response:', result)

      if (result.success) {
        // createPaginatedResponse는 data에 배열을 직접 넣음
        const usersData = Array.isArray(result.data)
          ? result.data
          : (result.data?.users || result.data || [])

        console.log('📊 Parsed users data:', usersData.length, 'users')
        setUsers(usersData)
        setPagination(result.pagination || null)
      } else {
        console.error('❌ API returned success: false', result)
        setError(result.error || 'Invalid response format')
      }
    } catch (err) {
      console.error('❌ Failed to fetch users:', err)
      setError(err.message || '사용자 목록을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [searchParams?.page, searchParams?.search, searchParams?.status, searchParams?.provider])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in?callbackUrl=/admin/users')
      return
    }

    if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status, router, fetchUsers])

  const columns = getUserColumns()

  // 로딩 상태
  if (status === 'loading') {
    return (
      <Card>
        <Table columns={columns} data={[]} loading />
      </Card>
    )
  }

  // 에러 상태
  if (error) {
    return <UserError error={error} onRetry={fetchUsers} />
  }

  return (
    <div className={styles.container}>
      <UserBulkActions
        selectedRows={selectedRows}
        onClearSelection={() => setSelectedRows([])}
      />

      <Card>
        <Table
          columns={columns}
          data={users}
          sortable
          selectable
          selectedRows={selectedRows}
          onSelectRows={setSelectedRows}
          loading={loading}
          stickyHeader
          emptyState={<UserEmptyState />}
        />
      </Card>

      {pagination && (
        <div className={styles.pagination}>
          <span>총 {pagination.total}명</span>
        </div>
      )}
    </div>
  )
}

