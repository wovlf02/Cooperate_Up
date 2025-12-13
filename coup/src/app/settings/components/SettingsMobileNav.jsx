'use client';

import styles from './SettingsMobileNav.module.css';

export default function SettingsMobileNav({
  tabs,
  activeTab,
  currentTab,
  isOpen,
  onToggle,
  onTabChange
}) {
  return (
    <div className={styles.mobileNav}>
      <button className={styles.mobileButton} onClick={onToggle}>
        <span className={styles.mobileIcon}>{currentTab?.icon}</span>
        <span className={styles.mobileLabel}>{currentTab?.label}</span>
        <span className={styles.mobileArrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={styles.mobileMenu}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.mobileItem} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className={styles.mobileItemIcon}>{tab.icon}</span>
              <div className={styles.mobileItemInfo}>
                <span className={styles.mobileItemLabel}>{tab.label}</span>
                <span className={styles.mobileItemDesc}>{tab.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

