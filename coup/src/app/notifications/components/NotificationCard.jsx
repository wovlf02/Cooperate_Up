/**
 * 알림 카드 컴포넌트
 */
import { getRelativeTime, getTypeInfo, getNotificationTitle, getNotificationMessage } from '../utils';
import styles from './NotificationCard.module.css';

export default function NotificationCard({
  notification,
  isDeleting,
  onRead,
  onDelete,
  onClick
}) {
  const typeInfo = getTypeInfo(notification.type);
  const isUnread = !notification.isRead;
  
  // 알림 제목과 메시지 생성
  const title = getNotificationTitle(notification);
  const message = getNotificationMessage(notification);

  const handleClick = () => {
    onClick?.(notification);
  };

  const handleReadClick = (e) => {
    e.stopPropagation();
    onRead?.(notification.id, e);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.(notification.id, e);
  };

  return (
    <article
      className={`
        ${styles.card} 
        ${isUnread ? styles.unread : styles.read}
        ${isDeleting ? styles.deleting : ''}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* 읽지 않음 인디케이터 */}
      {isUnread && <div className={styles.unreadIndicator} />}

      {/* 아이콘 - 스터디 이모지 우선 사용 */}
      <div 
        className={styles.iconWrapper}
        style={{ background: typeInfo.bgColor }}
      >
        <span className={styles.icon}>
          {notification.studyEmoji || typeInfo.icon}
        </span>
      </div>

      {/* 콘텐츠 */}
      <div className={styles.content}>
        <div className={styles.header}>
          <span 
            className={styles.typeLabel} 
            style={{ color: typeInfo.color }}
          >
            {typeInfo.label}
          </span>
          <span className={styles.time}>
            {getRelativeTime(notification.createdAt)}
          </span>
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        {notification.link && (
          <span className={styles.linkHint}>클릭하여 자세히 보기 →</span>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className={styles.actions}>
        {isUnread && (
          <button
            className={styles.readBtn}
            onClick={handleReadClick}
            title="읽음으로 표시"
            aria-label="읽음으로 표시"
          >
            ✓
          </button>
        )}
        <button
          className={styles.deleteBtn}
          onClick={handleDeleteClick}
          title="삭제"
          aria-label="알림 삭제"
        >
          ✕
        </button>
      </div>
    </article>
  );
}
