// 멤버 필터 컴포넌트
'use client';

import styles from './MemberFilter.module.css';

/**
 * 멤버 필터 컴포넌트
 * @param {Object} props
 * @param {string} props.activeFilter - 현재 활성화된 필터
 * @param {Function} props.onFilterChange - 필터 변경 핸들러
 * @param {string} props.searchKeyword - 검색어
 * @param {Function} props.onSearchChange - 검색어 변경 핸들러
 * @param {Object} props.memberStats - 멤버 통계
 */
export default function MemberFilter({ 
  activeFilter = '전체',
  onFilterChange,
  searchKeyword = '',
  onSearchChange,
  memberStats = { total: 0, owner: 0, admin: 0, member: 0 }
}) {
  return (
    <div className={styles.filterSection}>
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${activeFilter === '전체' ? styles.active : ''}`}
          onClick={() => onFilterChange('전체')}
        >
          전체 {memberStats.total}
        </button>
        <button
          className={`${styles.filterTab} ${activeFilter === 'OWNER' ? styles.active : ''}`}
          onClick={() => onFilterChange('OWNER')}
        >
          👑 OWNER {memberStats.owner}
        </button>
        <button
          className={`${styles.filterTab} ${activeFilter === 'ADMIN' ? styles.active : ''}`}
          onClick={() => onFilterChange('ADMIN')}
        >
          ⭐ ADMIN {memberStats.admin}
        </button>
        <button
          className={`${styles.filterTab} ${activeFilter === 'MEMBER' ? styles.active : ''}`}
          onClick={() => onFilterChange('MEMBER')}
        >
          👤 MEMBER {memberStats.member}
        </button>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="이름, 이메일 검색..."
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>
    </div>
  );
}
