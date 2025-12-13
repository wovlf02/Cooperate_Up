'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/admin/ui/Button'
import api from '@/lib/api'
import styles from './LogFilters.module.css'

const actionGroups = [
  { value: '', label: '전체' },
  { value: 'USER_*', label: '사용자 관리' },
  { value: 'STUDY_*', label: '스터디 관리' },
  { value: 'REPORT_*', label: '신고 처리' },
  { value: 'SETTINGS_*', label: '설정 관리' },
  { value: 'AUDIT_*', label: '감사 로그' }
]

const targetTypes = [
  { value: '', label: '전체' },
  { value: 'User', label: '사용자' },
  { value: 'Study', label: '스터디' },
  { value: 'Report', label: '신고' }
]

export default function LogFilters({ onFilterChange }) {
  const [admins, setAdmins] = useState([])
  const [filters, setFilters] = useState({
    adminId: '',
    action: '',
    targetType: '',
    startDate: '',
    endDate: ''
  })
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const data = await api.get('/api/admin/audit-logs', { limit: 1 })
      if (data.success) {
        setAdmins(data.data.admins || [])
      }
    } catch (error) {
      console.error('관리자 목록 불러오기 실패:', error)
    }
  }

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    if (onFilterChange) {
      onFilterChange(newFilters)
    }
  }

  const handleReset = () => {
    const resetFilters = {
      adminId: '',
      action: '',
      targetType: '',
      startDate: '',
      endDate: ''
    }
    setFilters(resetFilters)
    if (onFilterChange) {
      onFilterChange(resetFilters)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)

      // 필터 쿼리 생성
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key])
        }
      })

      const url = `/api/admin/audit-logs/export?${params.toString()}`

      // 파일 다운로드
      const link = document.createElement('a')
      link.href = url
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error) {
      console.error('내보내기 실패:', error)
      alert('로그 내보내기 중 오류가 발생했습니다.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.field}>
          <label className={styles.label}>관리자</label>
          <select
            value={filters.adminId}
            onChange={(e) => handleChange('adminId', e.target.value)}
            className={styles.select}
          >
            <option value="">전체</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.id}>
                {admin.name} ({admin.email})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>액션 타입</label>
          <select
            value={filters.action}
            onChange={(e) => handleChange('action', e.target.value)}
            className={styles.select}
          >
            {actionGroups.map(group => (
              <option key={group.value} value={group.value}>
                {group.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>대상 타입</label>
          <select
            value={filters.targetType}
            onChange={(e) => handleChange('targetType', e.target.value)}
            className={styles.select}
          >
            {targetTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>시작 날짜</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>종료 날짜</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={handleReset}>
          초기화
        </Button>
        <Button variant="primary" onClick={handleExport} loading={exporting}>
          📥 CSV 내보내기
        </Button>
      </div>
    </div>
  )
}

