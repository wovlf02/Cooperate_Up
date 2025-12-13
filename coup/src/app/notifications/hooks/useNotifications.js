/**
 * 알림 데이터 관리 커스텀 훅
 */
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';
import { calculateStats, groupNotifications } from '../utils';
import { FILTER_STATUS } from '../constants';

export function useNotifications() {
  const { data: session } = useSession();
  const [allNotifications, setAllNotifications] = useState([]);
  const [filter, setFilter] = useState(FILTER_STATUS.ALL);
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [toast, setToast] = useState({ message: '', isVisible: false, type: 'success' });

  // 토스트 표시
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, isVisible: true, type });
    setTimeout(() => setToast({ message: '', isVisible: false, type: 'success' }), 3000);
  }, []);

  // 필터링된 알림 목록
  const notifications = useMemo(() => {
    return allNotifications.filter(n => {
      const statusMatch = filter === FILTER_STATUS.ALL
        ? true
        : filter === FILTER_STATUS.UNREAD
          ? !n.isRead
          : n.isRead;
      const typeMatch = typeFilter === 'all' ? true : n.type === typeFilter;
      return statusMatch && typeMatch;
    });
  }, [allNotifications, filter, typeFilter]);

  // 그룹화된 알림
  const groupedNotifications = useMemo(() => {
    return groupNotifications(notifications);
  }, [notifications]);

  // 통계 정보
  const stats = useMemo(() => {
    return calculateStats(allNotifications);
  }, [allNotifications]);

  // 활성 타입 목록
  const activeTypes = useMemo(() => {
    return Object.keys(stats.typeCounts);
  }, [stats.typeCounts]);

  // 알림 목록 조회
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/notifications', { limit: 100 });
      if (data.success) {
        setAllNotifications(data.data);
      }
    } catch (error) {
      console.error('알림 로드 실패:', error);
      showToast('알림을 불러오는데 실패했습니다', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // 세션 변경 시 데이터 로드
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session, fetchNotifications]);

  // 단일 알림 읽음 처리
  const markAsRead = useCallback(async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.post(`/api/notifications/${id}/read`);
      setAllNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      showToast('처리 중 오류가 발생했습니다', 'error');
    }
  }, [showToast]);

  // 전체 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    if (stats.unreadCount === 0) return;
    try {
      await api.post('/api/notifications/mark-all-read');
      setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast(`${stats.unreadCount}개 알림을 읽음 처리했습니다`, 'success');
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
      showToast('처리 중 오류가 발생했습니다', 'error');
    }
  }, [stats.unreadCount, showToast]);

  // 읽은 알림 일괄 삭제
  const deleteReadNotifications = useCallback(async () => {
    if (stats.readCount === 0) return;
    if (!confirm(`읽은 알림 ${stats.readCount}개를 모두 삭제하시겠습니까?`)) return;

    try {
      const readIds = allNotifications.filter(n => n.isRead).map(n => n.id);
      await api.delete('/api/notifications/bulk', { body: { ids: readIds } });
      setAllNotifications(prev => prev.filter(n => !n.isRead));
      showToast(`${readIds.length}개 알림을 삭제했습니다`, 'success');
    } catch (error) {
      console.error('읽은 알림 삭제 실패:', error);
      showToast('삭제 중 오류가 발생했습니다', 'error');
    }
  }, [allNotifications, stats.readCount, showToast]);

  // 단일 알림 삭제 (애니메이션 포함)
  const deleteNotification = useCallback(async (id, e) => {
    if (e) e.stopPropagation();

    setDeletingIds(prev => new Set([...prev, id]));

    setTimeout(async () => {
      try {
        await api.delete(`/api/notifications/${id}`);
        setAllNotifications(prev => prev.filter(n => n.id !== id));
      } catch (error) {
        console.error('알림 삭제 실패:', error);
        showToast('삭제 중 오류가 발생했습니다', 'error');
      } finally {
        setDeletingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }, 300);
  }, [showToast]);

  return {
    // 상태
    notifications,
    groupedNotifications,
    stats,
    activeTypes,
    isLoading,
    deletingIds,
    toast,
    filter,
    typeFilter,

    // 상태 변경
    setFilter,
    setTypeFilter,

    // 액션
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
    refetch: fetchNotifications
  };
}

