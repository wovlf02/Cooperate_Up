'use client'

import React from 'react'
import PropTypes from 'prop-types'
import clsx from '@/utils/clsx'
import styles from './Button.module.css'

/**
 * Button 컴포넌트
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} props.variant - 버튼 스타일
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} props.size - 버튼 크기
 * @param {boolean} props.loading - 로딩 상태
 * @param {boolean} props.disabled - 비활성 상태
 * @param {boolean} props.active - 활성 상태
 * @param {boolean} props.fullWidth - 전체 너비
 * @param {React.ReactNode} props.leftIcon - 왼쪽 아이콘
 * @param {React.ReactNode} props.rightIcon - 오른쪽 아이콘
 * @param {React.ReactNode} props.children - 버튼 내용
 * @param {string} props.className - 추가 CSS 클래스
 * @param {Function} props.onClick - 클릭 핸들러
 * @param {'button'|'submit'|'reset'} props.type - 버튼 타입
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  active = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className,
  onClick,
  type = 'button',
  ...props
}) {
  const buttonClass = clsx(
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    {
      [styles['button--loading']]: loading,
      [styles['button--disabled']]: disabled || loading,
      [styles['button--active']]: active,
      [styles['button--full-width']]: fullWidth,
    },
    className
  )

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault()
      return
    }
    onClick && onClick(e)
  }

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-pressed={active}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <svg
            className={styles.spinnerIcon}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className={styles.spinnerCircle}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className={styles.spinnerPath}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}

      {!loading && leftIcon && (
        <span className={styles.iconLeft} aria-hidden="true">
          {leftIcon}
        </span>
      )}

      <span className={styles.content}>{children}</span>

      {!loading && rightIcon && (
        <span className={styles.iconRight} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  )
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  fullWidth: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
}

