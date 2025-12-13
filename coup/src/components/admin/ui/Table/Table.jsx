'use client'

import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import clsx from '@/utils/clsx'
import styles from './Table.module.css'

/**
 * Table 컴포넌트
 *
 * @param {Object} props
 * @param {Array} props.columns - 컬럼 정의 [{key, label, sortable, render, width}]
 * @param {Array} props.data - 테이블 데이터
 * @param {boolean} props.sortable - 정렬 가능 여부
 * @param {boolean} props.selectable - 행 선택 가능 여부
 * @param {Array} props.selectedRows - 선택된 행 IDs
 * @param {Function} props.onSelectRows - 행 선택 핸들러
 * @param {boolean} props.loading - 로딩 상태
 * @param {React.ReactNode} props.emptyState - 빈 상태 컴포넌트
 * @param {boolean} props.stickyHeader - 헤더 고정
 * @param {Function} props.onRowClick - 행 클릭 핸들러
 * @param {string} props.className - 추가 CSS 클래스
 */
export default function Table({
  columns = [],
  data = [],
  sortable = true,
  selectable = false,
  selectedRows = [],
  onSelectRows,
  loading = false,
  emptyState,
  stickyHeader = true,
  onRowClick,
  className,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

  // 정렬
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortable) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [data, sortConfig, sortable])

  // 정렬 핸들러
  const handleSort = (key) => {
    if (!sortable) return

    const column = columns.find(col => col.key === key)
    if (!column?.sortable) return

    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // 전체 선택
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectRows?.(data.map(row => row.id))
    } else {
      onSelectRows?.([])
    }
  }

  // 행 선택
  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      onSelectRows?.(selectedRows.filter(rowId => rowId !== id))
    } else {
      onSelectRows?.([...selectedRows, id])
    }
  }

  // 전체 선택 상태
  const allSelected = data.length > 0 && selectedRows.length === data.length
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length

  const tableClass = clsx(
    styles.tableWrapper,
    {
      [styles['tableWrapper--sticky']]: stickyHeader,
    },
    className
  )

  return (
    <div className={tableClass}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {selectable && (
                <th className={styles.th} style={{ width: '48px' }}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={input => {
                        if (input) input.indeterminate = someSelected
                      }}
                      onChange={handleSelectAll}
                      disabled={loading || data.length === 0}
                    />
                    <span className={styles.checkboxMark}></span>
                  </label>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(styles.th, {
                    [styles['th--sortable']]: sortable && column.sortable,
                    [styles['th--sorted']]: sortConfig.key === column.key,
                  })}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className={styles.thContent}>
                    <span>{column.label}</span>
                    {sortable && column.sortable && (
                      <span className={styles.sortIcon}>
                        {sortConfig.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                            </svg>
                          )
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className={styles.loadingCell}>
                  <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <span>로딩 중...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className={styles.emptyCell}>
                  {emptyState || (
                    <div className={styles.emptyState}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p>데이터가 없습니다</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={clsx(styles.tr, {
                    [styles['tr--selected']]: selectedRows.includes(row.id),
                    [styles['tr--clickable']]: onRowClick,
                  })}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className={styles.td}>
                      <label className={styles.checkbox} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                        />
                        <span className={styles.checkboxMark}></span>
                      </label>
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={styles.td}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      render: PropTypes.func,
      width: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  sortable: PropTypes.bool,
  selectable: PropTypes.bool,
  selectedRows: PropTypes.array,
  onSelectRows: PropTypes.func,
  loading: PropTypes.bool,
  emptyState: PropTypes.node,
  stickyHeader: PropTypes.bool,
  onRowClick: PropTypes.func,
  className: PropTypes.string,
}

