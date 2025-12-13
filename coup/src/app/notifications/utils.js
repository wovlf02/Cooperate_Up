/**
 * 알림 관련 유틸리티 함수
 */
import { formatDateTimeKST } from '@/utils/time';
import { NOTIFICATION_TYPES, GROUP_LABELS } from './constants';

/**
 * 상대적 시간 표시
 * @param {string} dateString - ISO 날짜 문자열
 * @returns {string} 상대적 시간 문자열
 */
export const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffWeek < 4) return `${diffWeek}주 전`;
  if (diffMonth < 12) return `${diffMonth}개월 전`;
  return formatDateTimeKST(dateString);
};

/**
 * 알림을 날짜 그룹으로 분류
 * @param {string} dateString - ISO 날짜 문자열
 * @returns {string} 그룹 키 (today, yesterday, thisWeek, older)
 */
export const getNotificationGroup = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (date >= today) return 'today';
  if (date >= yesterday) return 'yesterday';
  if (date >= weekAgo) return 'thisWeek';
  return 'older';
};

/**
 * 알림 타입 정보 조회
 * @param {string} type - 알림 타입
 * @returns {object} 타입 정보 (icon, label, color, bgColor)
 */
export const getTypeInfo = (type) => {
  return NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.DEFAULT;
};

/**
 * 스터디 이름 포맷팅 (이모지 포함)
 * @param {object} notification - 알림 객체
 * @returns {string} 포맷된 스터디 이름
 */
const formatStudyName = (notification) => {
  if (!notification.studyName) return '';
  
  if (notification.studyEmoji) {
    return `${notification.studyEmoji} ${notification.studyName}`;
  }
  return notification.studyName;
};

/**
 * 알림 제목 생성
 * - studyName이 있으면 스터디 이름 표시
 * - message가 제목 역할을 할 수 있으면 그것 사용
 * @param {object} notification - 알림 객체
 * @returns {string} 알림 제목
 */
export const getNotificationTitle = (notification) => {
  // 스터디 이름이 있으면 스터디 이름을 제목으로
  const studyName = formatStudyName(notification);
  
  if (studyName) {
    return studyName;
  }

  // title 필드가 있으면 사용
  if (notification.title) {
    return notification.title;
  }

  // 기본: 타입 라벨
  const typeInfo = getTypeInfo(notification.type);
  return typeInfo.label;
};

/**
 * 알림 메시지 포맷팅
 * @param {object} notification - 알림 객체
 * @returns {string} 포맷된 메시지
 */
export const getNotificationMessage = (notification) => {
  // message가 있으면 사용
  if (notification.message) {
    return notification.message;
  }

  // 기본 메시지
  const typeInfo = getTypeInfo(notification.type);
  return `${typeInfo.label} 알림이 도착했습니다`;
};

/**
 * 알림 목록을 그룹화
 * @param {Array} notifications - 알림 목록
 * @returns {Array} 그룹화된 알림 배열 [groupKey, { label, notifications }]
 */
export const groupNotifications = (notifications) => {
  const groups = {
    today: { label: GROUP_LABELS.today, notifications: [] },
    yesterday: { label: GROUP_LABELS.yesterday, notifications: [] },
    thisWeek: { label: GROUP_LABELS.thisWeek, notifications: [] },
    older: { label: GROUP_LABELS.older, notifications: [] }
  };

  notifications.forEach(n => {
    const group = getNotificationGroup(n.createdAt);
    groups[group].notifications.push(n);
  });

  return Object.entries(groups).filter(([_, group]) => group.notifications.length > 0);
};

/**
 * 알림 통계 계산
 * @param {Array} notifications - 전체 알림 목록
 * @returns {object} 통계 정보
 */
export const calculateStats = (notifications) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const readCount = notifications.filter(n => n.isRead).length;
  const typeCounts = notifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});

  return {
    unreadCount,
    readCount,
    total: notifications.length,
    typeCounts
  };
};
