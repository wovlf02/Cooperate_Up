/**
 * 알림 필터 컴포넌트
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { FILTER_STATUS } from '../constants';
import { getTypeInfo } from '../utils';
import styles from './NotificationFilters.module.css';

export default function NotificationFilters({
  filter,
  typeFilter,
  stats,
  activeTypes,
  onFilterChange,
  onTypeFilterChange
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 현재 선택된 타입 정보
  const selectedTypeInfo = typeFilter === 'all' 
    ? { icon: '🔔', label: '전체', count: stats.total }
    : { ...getTypeInfo(typeFilter), count: stats.typeCounts[typeFilter] };

  const handleTypeSelect = (type) => {
    onTypeFilterChange(type);
    setIsDropdownOpen(false);
  };

  return (
    <div className={styles.container}>
      {/* 읽음 상태 필터 */}
      <div className={styles.statusFilters}>
        <button
          className={`${styles.statusTab} ${filter === FILTER_STATUS.ALL ? styles.active : ''}`}
          onClick={() => onFilterChange(FILTER_STATUS.ALL)}
        >
          전체
          <span className={styles.count}>{stats.total}</span>
        </button>

        <button
          className={`${styles.statusTab} ${filter === FILTER_STATUS.UNREAD ? styles.active : ''}`}
          onClick={() => onFilterChange(FILTER_STATUS.UNREAD)}
        >
          읽지 않음
          {stats.unreadCount > 0 && (
            <span className={`${styles.count} ${styles.unreadBadge}`}>
              {stats.unreadCount}
            </span>
          )}
        </button>

        <button
          className={`${styles.statusTab} ${filter === FILTER_STATUS.READ ? styles.active : ''}`}
          onClick={() => onFilterChange(FILTER_STATUS.READ)}
        >
          읽음
          {stats.readCount > 0 && (
            <span className={styles.count}>{stats.readCount}</span>
          )}
        </button>
      </div>

      {/* 알림 종류 필터 - 커스텀 드롭다운 */}
      {activeTypes.length > 1 && (
        <div className={styles.typeFilter}>
          <span className={styles.typeLabel}>알림 종류</span>
          
          <div className={styles.dropdown} ref={dropdownRef}>
            <button
              className={styles.dropdownTrigger}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
            >
              <span className={styles.selectedIcon}>{selectedTypeInfo.icon}</span>
              <span className={styles.selectedLabel}>{selectedTypeInfo.label}</span>
              <span className={styles.selectedCount}>({selectedTypeInfo.count})</span>
              <span className={`${styles.arrow} ${isDropdownOpen ? styles.open : ''}`}>
                ▼
              </span>
            </button>

            {isDropdownOpen && (
              <ul className={styles.dropdownMenu} role="listbox">
                <li
                  className={`${styles.dropdownItem} ${typeFilter === 'all' ? styles.selected : ''}`}
                  onClick={() => handleTypeSelect('all')}
                  role="option"
                  aria-selected={typeFilter === 'all'}
                >
                  <span className={styles.itemIcon}>🔔</span>
                  <span className={styles.itemLabel}>전체</span>
                  <span className={styles.itemCount}>{stats.total}</span>
                </li>
                
                {activeTypes.map(type => {
                  const info = getTypeInfo(type);
                  const isSelected = typeFilter === type;
                  
                  return (
                    <li
                      key={type}
                      className={`${styles.dropdownItem} ${isSelected ? styles.selected : ''}`}
                      onClick={() => handleTypeSelect(type)}
                      role="option"
                      aria-selected={isSelected}
                      style={isSelected ? { 
                        background: info.bgColor,
                        borderLeftColor: info.color 
                      } : {}}
                    >
                      <span className={styles.itemIcon}>{info.icon}</span>
                      <span className={styles.itemLabel}>{info.label}</span>
                      <span 
                        className={styles.itemCount}
                        style={{ color: info.color }}
                      >
                        {stats.typeCounts[type]}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
