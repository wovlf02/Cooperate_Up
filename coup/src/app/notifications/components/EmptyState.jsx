/**
 * 빈 상태 컴포넌트
 */
import { NOTIFICATION_TYPES, FILTER_STATUS } from '../constants';
import styles from './EmptyState.module.css';

export default function EmptyState({ filter, typeFilter }) {
  const getEmptyMessage = () => {
    // 타입 필터가 적용된 경우
    if (typeFilter !== 'all') {
      const typeInfo = NOTIFICATION_TYPES[typeFilter] || NOTIFICATION_TYPES.DEFAULT;
      return {
        icon: typeInfo.icon,
        title: `${typeInfo.label} 알림이 없습니다`,
        description: '새로운 알림이 오면 여기에 표시됩니다'
      };
    }

    // 읽음 상태 필터에 따른 메시지
    switch (filter) {
      case FILTER_STATUS.UNREAD:
        return {
          icon: '✨',
          title: '모든 알림을 확인했습니다!',
          description: '읽지 않은 알림이 없습니다'
        };
      case FILTER_STATUS.READ:
        return {
          icon: '📭',
          title: '읽은 알림이 없습니다',
          description: '알림을 확인하면 여기에 표시됩니다'
        };
      default:
        return {
          icon: '🔔',
          title: '알림이 없습니다',
          description: '새로운 활동이 있으면 알려드릴게요'
        };
    }
  };

  const { icon, title, description } = getEmptyMessage();

  return (
    <div className={styles.container}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}

