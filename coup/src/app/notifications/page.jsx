/**
 * 알림 메인 페이지
 * 
 * @description
 * 사용자의 알림을 관리하는 페이지입니다.
 * - 읽음/읽지 않음 상태 필터링
 * - 알림 종류별 필터링
 * - 알림 읽음 처리 및 삭제
 * - 날짜별 그룹핑
 */
'use client';

import { useRouter } from 'next/navigation';
import { useNotifications } from './hooks/useNotifications';
import {
  Toast,
  EmptyState,
  NotificationSkeleton,
  NotificationList,
  NotificationFilters,
  NotificationHeader
} from './components';
import styles from './page.module.css';

export default function NotificationsPage() {
  const router = useRouter();
  
  const {
    notifications,
    groupedNotifications,
    stats,
    activeTypes,
    isLoading,
    deletingIds,
    toast,
    filter,
    typeFilter,
    setFilter,
    setTypeFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications
  } = useNotifications();

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className={styles.container}>
      {/* 토스트 알림 */}
      <Toast 
        message={toast.message} 
        isVisible={toast.isVisible} 
        type={toast.type} 
      />

      {/* 헤더 */}
      <NotificationHeader
        stats={stats}
        onMarkAllRead={markAllAsRead}
        onDeleteRead={deleteReadNotifications}
      />

      {/* 필터 */}
      <NotificationFilters
        filter={filter}
        typeFilter={typeFilter}
        stats={stats}
        activeTypes={activeTypes}
        onFilterChange={setFilter}
        onTypeFilterChange={setTypeFilter}
      />

      {/* 알림 목록 영역 */}
      <main className={styles.content}>
        {isLoading ? (
          <NotificationSkeleton count={5} />
        ) : notifications.length === 0 ? (
          <EmptyState filter={filter} typeFilter={typeFilter} />
        ) : (
          <NotificationList
            groupedNotifications={groupedNotifications}
            deletingIds={deletingIds}
            onRead={markAsRead}
            onDelete={deleteNotification}
            onClick={handleNotificationClick}
          />
        )}
      </main>
    </div>
  );
}
