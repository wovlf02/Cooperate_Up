/**
 * 스터디 필터 컴포넌트
 * Client Component - 검색 및 필터링
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './StudyFilters.module.css'

export default function StudyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [isPublic, setIsPublic] = useState(searchParams.get('isPublic') || 'all')
  const [isRecruiting, setIsRecruiting] = useState(
    searchParams.get('isRecruiting') || 'all'
  )

  // 필터 적용
  const handleFilter = () => {
    const params = new URLSearchParams()

    if (search) params.set('search', search)
    if (category !== 'all') params.set('category', category)
    if (isPublic !== 'all') params.set('isPublic', isPublic)
    if (isRecruiting !== 'all') params.set('isRecruiting', isRecruiting)

    router.push(`/admin/studies?${params.toString()}`)
  }

  // 필터 초기화
  const handleReset = () => {
    setSearch('')
    setCategory('all')
    setIsPublic('all')
    setIsRecruiting('all')
    router.push('/admin/studies')
  }

  // Enter 키로 검색
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFilter()
    }
  }

  return (
    <div className={styles.filters}>
      {/* 검색 */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="스터디 이름, 설명 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.searchInput}
        />
      </div>

      {/* 필터 */}
      <div className={styles.filterGroup}>
        {/* 카테고리 */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.select}
        >
          <option value="all">전체 카테고리</option>
          <option value="개발/프로그래밍">개발/프로그래밍</option>
          <option value="디자인">디자인</option>
          <option value="외국어">외국어</option>
          <option value="자격증">자격증</option>
          <option value="취업/이직">취업/이직</option>
          <option value="기타">기타</option>
        </select>

        {/* 공개 여부 */}
        <select
          value={isPublic}
          onChange={(e) => setIsPublic(e.target.value)}
          className={styles.select}
        >
          <option value="all">공개 여부</option>
          <option value="true">공개</option>
          <option value="false">비공개</option>
        </select>

        {/* 모집 여부 */}
        <select
          value={isRecruiting}
          onChange={(e) => setIsRecruiting(e.target.value)}
          className={styles.select}
        >
          <option value="all">모집 여부</option>
          <option value="true">모집중</option>
          <option value="false">모집마감</option>
        </select>

        {/* 버튼 */}
        <div className={styles.buttonGroup}>
          <button onClick={handleFilter} className={styles.filterButton}>
            필터 적용
          </button>
          <button onClick={handleReset} className={styles.resetButton}>
            초기화
          </button>
        </div>
      </div>
    </div>
  )
}

