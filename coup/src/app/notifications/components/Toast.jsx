/**
 * 토스트 알림 컴포넌트
 */
import styles from './Toast.module.css';

export default function Toast({ message, isVisible, type = 'success' }) {
  if (!isVisible) return null;

  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.icon}>{iconMap[type] || iconMap.info}</span>
      <span className={styles.message}>{message}</span>
    </div>
  );
}

