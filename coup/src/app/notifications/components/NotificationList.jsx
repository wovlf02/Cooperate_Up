/**
 * 알림 그룹 목록 컴포넌트
 */
import NotificationCard from './NotificationCard';
import styles from './NotificationList.module.css';

export default function NotificationList({
  groupedNotifications,
  deletingIds,
  onRead,
  onDelete,
  onClick
}) {
  return (
    <div className={styles.groups}>
      {groupedNotifications.map(([groupKey, group]) => (
        <section key={groupKey} className={styles.group}>
          <header className={styles.header}>
            <h2 className={styles.label}>{group.label}</h2>
            <span className={styles.count}>{group.notifications.length}</span>
          </header>

          <div className={styles.list}>
            {group.notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isDeleting={deletingIds.has(notification.id)}
                onRead={onRead}
                onDelete={onDelete}
                onClick={onClick}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

