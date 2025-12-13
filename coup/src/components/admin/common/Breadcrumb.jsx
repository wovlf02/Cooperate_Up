'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import styles from './Breadcrumb.module.css'

const pathNames = {
  '/admin': '대시보드',
  '/admin/users': '사용자 관리',
  '/admin/studies': '스터디 관리',
  '/admin/reports': '신고 처리',
  '/admin/analytics': '분석',
  '/admin/settings': '시스템 설정',
  '/admin/audit-logs': '감사 로그',
  '/admin/design-test': '디자인 테스트',
}

export default function Breadcrumb() {
  const pathname = usePathname()
  const [showDropdown, setShowDropdown] = useState(false)

  // 경로를 배열로 분할
  const paths = pathname.split('/').filter(Boolean)

  // 빵부스러기 생성
  const breadcrumbs = []
  let currentPath = ''

  for (const path of paths) {
    currentPath += `/${path}`
    const name = pathNames[currentPath] || path
    breadcrumbs.push({
      name,
      path: currentPath,
    })
  }

  // 대시보드만 있는 경우 빵부스러기 숨김
  if (breadcrumbs.length === 1 && breadcrumbs[0].path === '/admin') {
    return null
  }

  // 5개 이상이면 중간 항목들을 드롭다운으로
  const shouldCollapse = breadcrumbs.length > 4
  const visibleBreadcrumbs = shouldCollapse
    ? [breadcrumbs[0], ...breadcrumbs.slice(-2)]
    : breadcrumbs
  const collapsedBreadcrumbs = shouldCollapse
    ? breadcrumbs.slice(1, -2)
    : []

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {/* 홈 아이콘 */}
        <li className={styles.item}>
          <Link href="/admin" className={styles.link}>
            <svg
              className={styles.homeIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
            </svg>
            <span className={styles.homeText}>대시보드</span>
          </Link>
        </li>

        {shouldCollapse && collapsedBreadcrumbs.length > 0 && (
          <>
            <li className={styles.separator} aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </li>
            <li className={styles.item}>
              <div className={styles.dropdownContainer}>
                <button
                  className={styles.dropdownButton}
                  onClick={() => setShowDropdown(!showDropdown)}
                  aria-label="중간 경로 보기"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                  </svg>
                </button>
                {showDropdown && (
                  <>
                    <div
                      className={styles.backdrop}
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className={styles.dropdown}>
                      {collapsedBreadcrumbs.map((crumb) => (
                        <Link
                          key={crumb.path}
                          href={crumb.path}
                          className={styles.dropdownItem}
                          onClick={() => setShowDropdown(false)}
                        >
                          {crumb.name}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </li>
          </>
        )}

        {visibleBreadcrumbs.slice(1).map((crumb, index) => {
          const isLast = index === visibleBreadcrumbs.slice(1).length - 1

          return (
            <li key={crumb.path} className={styles.item}>
              <span className={styles.separator} aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </span>
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.path} className={styles.link}>
                  {crumb.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}



