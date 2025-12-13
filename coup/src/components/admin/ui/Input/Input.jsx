'use client'

import React, { forwardRef, useId } from 'react'
import PropTypes from 'prop-types'
import clsx from '@/utils/clsx'
import styles from './Input.module.css'

/**
 * Input 컴포넌트
 *
 * @param {Object} props
 * @param {'text'|'email'|'password'|'number'|'tel'|'url'|'search'} props.type - 입력 타입
 * @param {'sm'|'md'|'lg'} props.size - 입력 크기
 * @param {string} props.label - 라벨 텍스트
 * @param {string} props.placeholder - 플레이스홀더
 * @param {string} props.helperText - 도움말 텍스트
 * @param {string} props.error - 에러 메시지
 * @param {boolean} props.disabled - 비활성 상태
 * @param {boolean} props.readonly - 읽기 전용
 * @param {boolean} props.required - 필수 입력
 * @param {boolean} props.fullWidth - 전체 너비
 * @param {React.ReactNode} props.leftIcon - 왼쪽 아이콘
 * @param {React.ReactNode} props.rightIcon - 오른쪽 아이콘
 */
const Input = forwardRef(function Input({
  type = 'text',
  size = 'md',
  label,
  placeholder,
  helperText,
  error,
  disabled = false,
  readonly = false,
  required = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}, ref) {
  const generatedId = useId()
  const inputId = id || generatedId
  const hasError = !!error
  const helperId = helperText ? `${inputId}-helper` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  const wrapperClass = clsx(
    styles.wrapper,
    {
      [styles['wrapper--full-width']]: fullWidth,
    },
    className
  )

  const inputWrapperClass = clsx(
    styles.inputWrapper,
    styles[`inputWrapper--${size}`],
    {
      [styles['inputWrapper--error']]: hasError,
      [styles['inputWrapper--disabled']]: disabled,
      [styles['inputWrapper--readonly']]: readonly,
      [styles['inputWrapper--with-left-icon']]: leftIcon,
      [styles['inputWrapper--with-right-icon']]: rightIcon,
    }
  )

  const inputClass = clsx(
    styles.input,
    styles[`input--${size}`],
    {
      [styles['input--with-left-icon']]: leftIcon,
      [styles['input--with-right-icon']]: rightIcon,
    }
  )

  return (
    <div className={wrapperClass}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-label="required">*</span>}
        </label>
      )}

      <div className={inputWrapperClass}>
        {leftIcon && (
          <span className={styles.iconLeft} aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={inputClass}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          required={required}
          aria-invalid={hasError}
          aria-describedby={clsx(helperId, errorId)}
          {...props}
        />

        {rightIcon && (
          <span className={styles.iconRight} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>

      {helperText && !error && (
        <p id={helperId} className={styles.helperText}>
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

Input.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'search']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
}

export default Input

