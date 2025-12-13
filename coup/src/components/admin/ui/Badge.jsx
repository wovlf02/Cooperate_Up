'use client'

import React from 'react'
import PropTypes from 'prop-types'
import clsx from '@/utils/clsx'
import styles from './Badge.module.css'

/**
 * Badge 컴포넌트
 *
 * @param {Object} props
 * @param {'default'|'primary'|'success'|'warning'|'danger'|'info'} props.variant - 배지 스타일
 * @param {'sm'|'md'|'lg'} props.size - 배지 크기
 * @param {boolean} props.dot - 점 표시
 * @param {boolean} props.removable - 제거 가능
 * @param {Function} props.onRemove - 제거 핸들러
 * @param {React.ReactNode} props.children - 배지 내용
 * @param {string} props.className - 추가 CSS 클래스
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
}) {
  const badgeClass = clsx(
    styles.badge,
    styles[`badge--${variant}`],
    styles[`badge--${size}`],
    {
      [styles['badge--with-dot']]: dot,
      [styles['badge--removable']]: removable,
    },
    className
  )

  const handleRemove = (e) => {
    e.stopPropagation()
    onRemove && onRemove()
  }

  return (
    <span className={badgeClass}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      <span className={styles.content}>{children}</span>
      {removable && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={handleRemove}
          aria-label="제거"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
            />
          </svg>
        </button>
      )}
    </span>
  )
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  dot: PropTypes.bool,
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
  className: PropTypes.string,
}

