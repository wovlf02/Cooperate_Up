'use client';

import styles from './SettingsSidebar.module.css';

export default function SettingsSidebar({ tabs, activeTab, onTabChange }) {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.navItem} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className={styles.navIcon}>{tab.icon}</span>
            <div className={styles.navInfo}>
              <span className={styles.navLabel}>{tab.label}</span>
              <span className={styles.navDesc}>{tab.description}</span>
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
}

