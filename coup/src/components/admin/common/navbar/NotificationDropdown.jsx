'use client'

import Badge from '@/components/admin/ui/Badge'
import styles from '../AdminNavbar.module.css'

const getNotificationIcon = (type) => {
  switch (type) {
    case 'report':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      )
    case 'user':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
        </svg>
      )
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      )
  }
}

export default function NotificationDropdown({
  notifications,
  unreadCount,
  showNotifications,
  setShowNotifications,
  setShowProfile
}) {
  return (
    <div className={styles.notificationContainer}>
      <button
        className={styles.iconButton}
        onClick={() => {
          setShowNotifications(!showNotifications)
          setShowProfile(false)
        }}
        title="알림"
        aria-label="알림"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2C7.79086 2 6 3.79086 6 6V9.58579L4.70711 10.8787C4.07714 11.5087 4.52331 12.6 5.41421 12.6H14.5858C15.4767 12.6 15.9229 11.5087 15.2929 10.8787L14 9.58579V6C14 3.79086 12.2091 2 10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 15C8 16.1046 8.89543 17 10 17C11.1046 17 12 16.1046 12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {unreadCount > 0 && (
          <span className={styles.notificationBadge}>{unreadCount}</span>
        )}
      </button>

      {showNotifications && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setShowNotifications(false)}
          />
          <div className={styles.notificationDropdown}>
            <div className={styles.notificationHeader}>
              <h3>알림</h3>
              {unreadCount > 0 && (
                <Badge variant="primary" size="sm">{unreadCount}개 읽지 않음</Badge>
              )}
            </div>
            <div className={styles.notificationList}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={`${styles.notificationItem} ${
                      notification.unread ? styles.unread : ''
                    }`}
                    onClick={() => setShowNotifications(false)}
                  >
                    <div className={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className={styles.notificationContent}>
                      <p className={styles.notificationMessage}>
                        {notification.message}
                      </p>
                      <span className={styles.notificationTime}>
                        {notification.time}
                      </span>
                    </div>
                    {notification.unread && (
                      <div className={styles.unreadDot} />
                    )}
                  </button>
                ))
              ) : (
                <div className={styles.emptyNotifications}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M24 4C19.5817 4 16 7.58172 16 12V21.1716L13.4142 23.7574C11.6332 25.5383 12.5233 28.8 15.0294 28.8H32.9706C35.4767 28.8 36.3668 25.5383 34.5858 23.7574L32 21.1716V12C32 7.58172 28.4183 4 24 4Z" fill="currentColor" opacity="0.1"/>
                    <path d="M19 36C19 38.2091 20.7909 40 23 40H25C27.2091 40 29 38.2091 29 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <p>새로운 알림이 없습니다</p>
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <div className={styles.notificationFooter}>
                <button className={styles.notificationAction}>
                  모두 읽음으로 표시
                </button>
                <button className={styles.notificationAction}>
                  모두 보기
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

