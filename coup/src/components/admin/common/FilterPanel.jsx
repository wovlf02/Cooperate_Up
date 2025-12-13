'use client'

import { useState } from 'react'
import PropTypes from 'prop-types'
import Button from '@/components/admin/ui/Button'
import Badge from '@/components/admin/ui/Badge'
import { Card, CardHeader, CardContent } from '@/components/admin/ui/Card'
import styles from './FilterPanel.module.css'

/**
 * FilterPanel 컴포넌트
 * 다중 필터 선택
 */
export default function FilterPanel({
  filters = [],
  selectedFilters = {},
  onChange,
  onReset,
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (filterKey, value) => {
    const currentValues = selectedFilters[filterKey] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]

    onChange?.({
      ...selectedFilters,
      [filterKey]: newValues,
    })
  }

  const handleReset = () => {
    onReset?.()
    setIsOpen(false)
  }

  // 선택된 필터 개수
  const selectedCount = Object.values(selectedFilters)
    .flat()
    .filter(Boolean).length

  return (
    <div className={styles.filterPanel}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" />
          </svg>
        }
      >
        필터 {selectedCount > 0 && <Badge size="sm" variant="primary">{selectedCount}</Badge>}
      </Button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <Card className={styles.dropdown}>
            <CardHeader>
              <div className={styles.header}>
                <h3>필터</h3>
                <Button size="sm" variant="ghost" onClick={handleReset}>
                  초기화
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={styles.filterGroups}>
                {filters.map((filter) => (
                  <div key={filter.key} className={styles.filterGroup}>
                    <div className={styles.filterLabel}>{filter.label}</div>
                    <div className={styles.filterOptions}>
                      {filter.options.map((option) => {
                        const isSelected = (selectedFilters[filter.key] || []).includes(option.value)
                        return (
                          <button
                            key={option.value}
                            className={`${styles.filterOption} ${isSelected ? styles.selected : ''}`}
                            onClick={() => handleFilterChange(filter.key, option.value)}
                            style={option.color ? {
                              backgroundColor: isSelected ? option.color.bg : 'transparent',
                              color: isSelected ? option.color.fg : 'var(--text-secondary)',
                              borderColor: option.color.fg,
                            } : {}}
                          >
                            {option.label}
                            {isSelected && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

FilterPanel.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          color: PropTypes.shape({
            bg: PropTypes.string,
            fg: PropTypes.string,
          }),
        })
      ).isRequired,
    })
  ).isRequired,
  selectedFilters: PropTypes.object,
  onChange: PropTypes.func,
  onReset: PropTypes.func,
}

