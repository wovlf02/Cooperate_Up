'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Table from '@/components/admin/ui/Table'
import { Card } from '@/components/admin/ui/Card'
import api from '@/lib/api'
import { getReportColumns } from './ReportColumns'
import ReportBulkActions from './ReportBulkActions'
import ReportError from './ReportError'
import ReportEmptyState from './ReportEmptyState'
import styles from './ReportList.module.css'

export default function ReportList() {
  const { status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [pagination, setPagination] = useState(null)

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await api.get('/api/admin/reports')
      console.log('📊 Reports API Response:', result)

      if (result.success) {
        // createPaginatedResponse는 data에 배열을 직접 넣음
        const reportsData = Array.isArray(result.data)
          ? result.data
          : (result.data?.reports || result.data || [])

        console.log('📊 Parsed reports data:', reportsData)
        setReports(reportsData)
        setPagination(result.pagination || null)
      } else {
        console.error('❌ API returned success: false', result)
        setError(result.error || 'Invalid response format')
      }
    } catch (err) {
      console.error('❌ Failed to fetch reports:', err)
      setError(err.message || '신고 목록을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in?callbackUrl=/admin/reports')
      return
    }

    if (status === 'authenticated') {
      fetchReports()
    }
  }, [status, router, fetchReports])

  const columns = getReportColumns()

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
    return <ReportError error={error} onRetry={fetchReports} />
  }

  return (
    <div className={styles.container}>
      <ReportBulkActions
        selectedRows={selectedRows}
        onClearSelection={() => setSelectedRows([])}
      />

      <Card>
        <Table
          columns={columns}
          data={reports}
          sortable
          selectable
          selectedRows={selectedRows}
          onSelectRows={setSelectedRows}
          loading={loading}
          stickyHeader
          emptyState={<ReportEmptyState />}
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

