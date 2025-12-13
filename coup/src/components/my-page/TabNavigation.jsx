'use client'

import styles from './TabNavigation.module.css'

const TABS = [
  { id: 'overview', icon: '📊', label: '개요' },
  { id: 'studies', icon: '📚', label: '스터디' },
  { id: 'settings', icon: '⚙️', label: '설정' },
]

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <nav className={styles.tabNav}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className={styles.tabIcon}>{tab.icon}</span>
          <span className={styles.tabLabel}>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

