'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import styles from './ReportFilters.module.css'

const STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'PENDING', label: '대기중' },
  { value: 'IN_PROGRESS', label: '처리중' },
  { value: 'RESOLVED', label: '해결됨' },
  { value: 'REJECTED', label: '거부됨' },
]

const TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'SPAM', label: '스팸' },
  { value: 'HARASSMENT', label: '괴롭힘' },
  { value: 'INAPPROPRIATE', label: '부적절한 콘텐츠' },
  { value: 'COPYRIGHT', label: '저작권 침해' },
  { value: 'OTHER', label: '기타' },
]

const PRIORITY_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'LOW', label: '낮음' },
  { value: 'MEDIUM', label: '보통' },
  { value: 'HIGH', label: '높음' },
  { value: 'URGENT', label: '긴급' },
]

const TARGET_TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'USER', label: '사용자' },
  { value: 'STUDY', label: '스터디' },
  { value: 'MESSAGE', label: '메시지' },
]

const ASSIGNED_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'me', label: '내가 담당' },
  { value: 'unassigned', label: '미배정' },
]

export default function ReportFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  const [priority, setPriority] = useState(searchParams.get('priority') || 'all')
  const [targetType, setTargetType] = useState(searchParams.get('targetType') || 'all')
  const [assignedTo, setAssignedTo] = useState(searchParams.get('assignedTo') || 'all')

  const handleApplyFilters = () => {
    const params = new URLSearchParams()

    if (search) params.set('search', search)
    if (status !== 'all') params.set('status', status)
    if (type !== 'all') params.set('type', type)
    if (priority !== 'all') params.set('priority', priority)
    if (targetType !== 'all') params.set('targetType', targetType)
    if (assignedTo !== 'all') params.set('assignedTo', assignedTo)

    router.push(`/admin/reports?${params.toString()}`)
  }

  const handleReset = () => {
    setSearch('')
    setStatus('all')
    setType('all')
    setPriority('all')
    setTargetType('all')
    setAssignedTo('all')
    router.push('/admin/reports')
  }

  const handleQuickFilter = (filterParams) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(filterParams).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/admin/reports?${params.toString()}`)
  }

  return (
    <div className={styles.container}>
      {/* 빠른 필터 */}
      <div className={styles.quickFilters}>
        <button
          className={styles.quickButton}
          onClick={() => handleQuickFilter({ assignedTo: 'me' })}
        >
          📋 나한테 배정됨
        </button>
        <button
          className={styles.quickButton}
          onClick={() => handleQuickFilter({ priority: 'URGENT' })}
        >
          🚨 긴급
        </button>
        <button
          className={styles.quickButton}
          onClick={() => handleQuickFilter({ status: 'PENDING' })}
        >
          ⏰ 대기중
        </button>
      </div>

      {/* 필터 그리드 */}
      <div className={styles.filterGrid}>
        {/* 검색 */}
        <div className={styles.filterItem}>
          <label className={styles.label}>검색</label>
          <input
            type="text"
            className={styles.input}
            placeholder="신고 사유, 신고자 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
          />
        </div>

        {/* 상태 */}
        <div className={styles.filterItem}>
          <label className={styles.label}>상태</label>
          <select
            className={styles.select}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 신고 유형 */}
        <div className={styles.filterItem}>
          <label className={styles.label}>신고 유형</label>
          <select
            className={styles.select}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 우선순위 */}
        <div className={styles.filterItem}>
          <label className={styles.label}>우선순위</label>
          <select
            className={styles.select}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {PRIORITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 대상 유형 */}
        <div className={styles.filterItem}>
          <label className={styles.label}>대상 유형</label>
          <select
            className={styles.select}
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
          >
            {TARGET_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 담당자 */}
        <div className={styles.filterItem}>
          <label className={styles.label}>담당자</label>
          <select
            className={styles.select}
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            {ASSIGNED_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className={styles.actions}>
        <button className={styles.applyButton} onClick={handleApplyFilters}>
          필터 적용
        </button>
        <button className={styles.resetButton} onClick={handleReset}>
          초기화
        </button>
      </div>
    </div>
  )
}

