import styles from './NotificationSettings.module.css'

export default function NotificationSettings({ settings }) {
  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetHeader}>⚙️ 알림 설정</h3>
      <div className={styles.settingsList}>
        <div className={styles.settingItem}>
          <span className={styles.settingLabel}>알림음</span>
          <span className={styles.settingValue}>
            {settings.sound ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className={styles.settingItem}>
          <span className={styles.settingLabel}>진동</span>
          <span className={styles.settingValue}>
            {settings.vibration ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className={styles.settingItem}>
          <span className={styles.settingLabel}>이메일</span>
          <span className={styles.settingValue}>
            {settings.email ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
      <button className={styles.settingsButton}>
        상세 설정
      </button>
    </div>
  )
}

