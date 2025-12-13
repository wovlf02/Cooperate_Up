/**
 * 알림 스켈레톤 로딩 컴포넌트
 */
import styles from './NotificationSkeleton.module.css';

export default function NotificationSkeleton({ count = 5 }) {
  return (
    <div className={styles.list}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.icon} />
          <div className={styles.content}>
            <div className={styles.header}>
              <div className={styles.type} />
              <div className={styles.time} />
            </div>
            <div className={styles.title} />
            <div className={styles.message} />
          </div>
        </div>
      ))}
    </div>
  );
}

