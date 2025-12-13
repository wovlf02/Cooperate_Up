'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Table from '@/components/admin/ui/Table'
import { Card } from '@/components/admin/ui/Card'
import api from '@/lib/api'
import { getStudyColumns } from './StudyColumns'
import StudyBulkActions from './StudyBulkActions'
import StudyError from './StudyError'
import StudyEmptyState from './StudyEmptyState'
import styles from './StudyList.module.css'

export default function StudyList() {
  const { status } = useSession()
  const router = useRouter()
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [pagination, setPagination] = useState(null)

  const fetchStudies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await api.get('/api/admin/studies')
      console.log('📊 Studies API Response:', result)

      if (result.success) {
        // createPaginatedResponse는 data에 배열을 직접 넣음
        const studiesData = Array.isArray(result.data)
          ? result.data
          : (result.data?.studies || result.data || [])

        console.log('📊 Parsed studies data:', studiesData)
        setStudies(studiesData)
        setPagination(result.pagination || null)
      } else {
        console.error('❌ API returned success: false', result)
        setError(result.error || 'Invalid response format')
      }
    } catch (err) {
      console.error('❌ Failed to fetch studies:', err)
      setError(err.message || '스터디 목록을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in?callbackUrl=/admin/studies')
      return
    }

    if (status === 'authenticated') {
      fetchStudies()
    }
  }, [status, router, fetchStudies])

  const columns = getStudyColumns()

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
    return <StudyError error={error} onRetry={fetchStudies} />
  }

  return (
    <div className={styles.container}>
      <StudyBulkActions
        selectedRows={selectedRows}
        onClearSelection={() => setSelectedRows([])}
      />

      <Card>
        <Table
          columns={columns}
          data={studies}
          sortable
          selectable
          selectedRows={selectedRows}
          onSelectRows={setSelectedRows}
          loading={loading}
          stickyHeader
          emptyState={<StudyEmptyState />}
        />
      </Card>

      {pagination && (
        <div className={styles.pagination}>
          <span>총 {pagination.total}개</span>
        </div>
      )}
    </div>
  )
}

