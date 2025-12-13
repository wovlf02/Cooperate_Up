'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './UserFilters.module.css'

export default function UserFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 초기값을 URL 파라미터에서 가져옴
  const initialSearch = searchParams.get('search') || ''
  const initialStatus = searchParams.get('status') || 'all'
  const initialProvider = searchParams.get('provider') || 'all'

  const [search, setSearch] = useState(initialSearch)
  const [status, setStatus] = useState(initialStatus)
  const [provider, setProvider] = useState(initialProvider)

  const updateFilters = useCallback((filters) => {
    const params = new URLSearchParams()

    if (filters.search?.trim()) params.set('search', filters.search.trim())
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.provider && filters.provider !== 'all') params.set('provider', filters.provider)

    const queryString = params.toString()
    router.push(queryString ? `/admin/users?${queryString}` : '/admin/users')
  }, [router])

  const handleSearch = (e) => {
    e.preventDefault()
    updateFilters({ search, status, provider })
  }

  const handleReset = () => {
    setSearch('')
    setStatus('all')
    setProvider('all')
    router.push('/admin/users')
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchWrapper}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.searchIcon}>
            <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="이메일, 이름으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            검색
          </button>
        </div>

        <div className={styles.filters}>
          <select
            value={status}
            onChange={(e) => {
              const newStatus = e.target.value
              setStatus(newStatus)
              updateFilters({ search, status: newStatus, provider })
            }}
            className={styles.select}
          >
            <option value="all">모든 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="SUSPENDED">정지</option>
            <option value="DELETED">삭제됨</option>
          </select>

          <select
            value={provider}
            onChange={(e) => {
              const newProvider = e.target.value
              setProvider(newProvider)
              updateFilters({ search, status, provider: newProvider })
            }}
            className={styles.select}
          >
            <option value="all">모든 가입방식</option>
            <option value="CREDENTIALS">이메일</option>
            <option value="GOOGLE">Google</option>
            <option value="GITHUB">GitHub</option>
          </select>

          {(search || status !== 'all' || provider !== 'all') && (
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetButton}
            >
              초기화
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

