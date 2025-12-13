'use client'

import React, { useState, useRef, useEffect, useId } from 'react'
import PropTypes from 'prop-types'
import clsx from '@/utils/clsx'
import styles from './Select.module.css'

/**
 * Select 컴포넌트
 *
 * @param {Object} props
 * @param {Array} props.options - 옵션 배열 [{value, label, group?}, ...]
 * @param {string|Array} props.value - 선택된 값(들)
 * @param {Function} props.onChange - 변경 핸들러
 * @param {string} props.label - 라벨 텍스트
 * @param {string} props.placeholder - 플레이스홀더
 * @param {string} props.helperText - 도움말 텍스트
 * @param {string} props.error - 에러 메시지
 * @param {boolean} props.disabled - 비활성 상태
 * @param {boolean} props.required - 필수 선택
 * @param {boolean} props.multiple - 다중 선택
 * @param {boolean} props.searchable - 검색 가능
 * @param {boolean} props.fullWidth - 전체 너비
 * @param {'sm'|'md'|'lg'} props.size - 크기
 */
export default function Select({
  options = [],
  value,
  onChange,
  label,
  placeholder = '선택하세요',
  helperText,
  error,
  disabled = false,
  required = false,
  multiple = false,
  searchable = false,
  fullWidth = false,
  size = 'md',
  className,
  id,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const selectRef = useRef(null)
  const searchInputRef = useRef(null)

  const generatedId = useId()
  const selectId = id || generatedId
  const hasError = !!error
  const helperId = helperText ? `${selectId}-helper` : undefined
  const errorId = error ? `${selectId}-error` : undefined

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 검색창에 포커스
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  // 필터된 옵션
  const filteredOptions = searchable && searchQuery
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  // 그룹핑된 옵션
  const groupedOptions = filteredOptions.reduce((acc, opt) => {
    const group = opt.group || '_default'
    if (!acc[group]) acc[group] = []
    acc[group].push(opt)
    return acc
  }, {})

  // 선택된 옵션 라벨
  const getSelectedLabel = () => {
    if (!value) return placeholder

    if (multiple) {
      const selectedOptions = options.filter(opt => value.includes(opt.value))
      if (selectedOptions.length === 0) return placeholder
      return selectedOptions.map(opt => opt.label).join(', ')
    }

    const selectedOption = options.find(opt => opt.value === value)
    return selectedOption ? selectedOption.label : placeholder
  }

  // 옵션 선택 핸들러
  const handleOptionClick = (optionValue) => {
    if (multiple) {
      const newValue = value?.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...(value || []), optionValue]
      onChange?.(newValue)
    } else {
      onChange?.(optionValue)
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  // 선택 여부 확인
  const isSelected = (optionValue) => {
    if (multiple) {
      return value?.includes(optionValue)
    }
    return value === optionValue
  }

  const wrapperClass = clsx(
    styles.wrapper,
    {
      [styles['wrapper--full-width']]: fullWidth,
    },
    className
  )

  const selectWrapperClass = clsx(
    styles.selectWrapper,
    styles[`selectWrapper--${size}`],
    {
      [styles['selectWrapper--open']]: isOpen,
      [styles['selectWrapper--error']]: hasError,
      [styles['selectWrapper--disabled']]: disabled,
    }
  )

  return (
    <div className={wrapperClass} ref={selectRef}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-label="required">*</span>}
        </label>
      )}

      <div className={selectWrapperClass}>
        <button
          id={selectId}
          type="button"
          className={styles.trigger}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-describedby={clsx(helperId, errorId)}
        >
          <span className={styles.value}>{getSelectedLabel()}</span>
          <svg
            className={clsx(styles.arrow, { [styles['arrow--open']]: isOpen })}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isOpen && (
          <div className={styles.dropdown} role="listbox">
            {searchable && (
              <div className={styles.searchWrapper}>
                <input
                  ref={searchInputRef}
                  type="text"
                  className={styles.search}
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className={styles.optionsList}>
              {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <div key={group}>
                  {group !== '_default' && (
                    <div className={styles.groupLabel}>{group}</div>
                  )}
                  {groupOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={clsx(styles.option, {
                        [styles['option--selected']]: isSelected(option.value),
                      })}
                      onClick={() => handleOptionClick(option.value)}
                      role="option"
                      aria-selected={isSelected(option.value)}
                    >
                      {multiple && (
                        <span className={styles.checkbox}>
                          {isSelected(option.value) && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </span>
                      )}
                      <span className={styles.optionLabel}>{option.label}</span>
                      {!multiple && isSelected(option.value) && (
                        <svg
                          className={styles.checkIcon}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              ))}
              {filteredOptions.length === 0 && (
                <div className={styles.emptyState}>결과가 없습니다</div>
              )}
            </div>
          </div>
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
}

Select.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      group: PropTypes.string,
    })
  ).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  ]),
  onChange: PropTypes.func,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  multiple: PropTypes.bool,
  searchable: PropTypes.bool,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  id: PropTypes.string,
}

