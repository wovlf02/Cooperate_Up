'use client'

import { useState } from 'react'
import PropTypes from 'prop-types'
import Input from '@/components/admin/ui/Input'
import Button from '@/components/admin/ui/Button'
import styles from './SearchBar.module.css'

/**
 * SearchBar 컴포넌트
 * 실시간 검색 with debounce
 */
export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = '검색...',
  debounce = 300,
}) {
  const [localValue, setLocalValue] = useState(value)
  const [timer, setTimer] = useState(null)

  const handleChange = (e) => {
    const newValue = e.target.value
    setLocalValue(newValue)

    // Debounce
    if (timer) clearTimeout(timer)

    const newTimer = setTimeout(() => {
      onChange?.(newValue)
    }, debounce)

    setTimer(newTimer)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange?.('')
    onClear?.()
  }

  return (
    <div className={styles.searchBar}>
      <Input
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        }
      />
      {localValue && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleClear}
          className={styles.clearButton}
          aria-label="검색 지우기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </Button>
      )}
    </div>
  )
}

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  debounce: PropTypes.number,
}

