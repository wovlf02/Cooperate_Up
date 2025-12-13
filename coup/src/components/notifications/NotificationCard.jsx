import { getRelativeTime, getNotificationTypeText } from '@/utils/time'
import styles from './NotificationCard.module.css'

export default function NotificationCard({ notification, onClick }) {
  const getBadgeClass = (type) => {
    const map = {
      JOIN_APPROVED: styles.badgeJoin,
      NOTICE: styles.badgeNotice,
      FILE: styles.badgeFile,
      EVENT: styles.badgeEvent,
      TASK: styles.badgeTask,
      MEMBER: styles.badgeMember,
      KICK: styles.badgeKick,
    }
    return map[type] || styles.badgeDefault
  }

  const getBadgeText = (type) => {
    const map = {
      JOIN_APPROVED: '가입승인',
      NOTICE: '공지',
      FILE: '파일',
      EVENT: '일정',
      TASK: '할일',
      MEMBER: '멤버',
      KICK: '강퇴',
    }
    return map[type] || type
  }

  return (
    <div
      className={`${styles.card} ${!notification.isRead ? styles.unread : ''}`}
      onClick={onClick}
    >
      <div className={styles.header}>
        <span className={!notification.isRead ? styles.unreadDot : styles.readDot} />
        <span className={`${styles.badge} ${getBadgeClass(notification.type)}`}>
          [{getBadgeText(notification.type)}]
        </span>
        <span className={styles.studyName}>
          {notification.studyEmoji} {notification.studyName}
        </span>
      </div>
      <p className={styles.message}>{notification.message}</p>
      <p className={styles.time}>{getRelativeTime(notification.createdAt)}</p>
    </div>
  )
}

