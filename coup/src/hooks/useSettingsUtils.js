// 설정 기반 유틸리티 훅
'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { useCallback } from 'react';

/**
 * 설정 기반 날짜/시간 포맷 훅
 * 사용자 설정에 따라 날짜와 시간을 자동으로 포맷합니다.
 */
export function useDateTimeFormat() {
  const { formatDate, formatTime, formatDateTime, settings } = useSettings();

  // 상대 시간 (예: 2시간 전)
  const getRelativeTime = useCallback((dateString) => {
    if (!dateString) return '-';
    const now = new Date();
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    // 언어에 따른 표현
    const lang = settings.language;

    if (diffMins < 1) {
      return lang === 'ko' ? '방금 전' : lang === 'ja' ? 'たった今' : 'just now';
    }
    if (diffMins < 60) {
      return lang === 'ko' ? `${diffMins}분 전` : lang === 'ja' ? `${diffMins}分前` : `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return lang === 'ko' ? `${diffHours}시간 전` : lang === 'ja' ? `${diffHours}時間前` : `${diffHours}h ago`;
    }
    if (diffDays < 7) {
      return lang === 'ko' ? `${diffDays}일 전` : lang === 'ja' ? `${diffDays}日前` : `${diffDays}d ago`;
    }

    return formatDate(dateString);
  }, [settings.language, formatDate]);

  // 마감까지 남은 시간
  const getTimeLeft = useCallback((dueDate) => {
    if (!dueDate) {
      const noDateText = settings.language === 'ko' ? '마감일 없음' :
                         settings.language === 'ja' ? '期限なし' : 'No due date';
      return { text: noDateText, urgent: false, expired: false };
    }

    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      const expiredText = settings.language === 'ko' ? '마감됨' :
                          settings.language === 'ja' ? '期限切れ' : 'Expired';
      return { text: expiredText, urgent: true, expired: true };
    }
    if (diffHours < 24) {
      const text = settings.language === 'ko' ? `${diffHours}시간 남음` :
                   settings.language === 'ja' ? `${diffHours}時間` : `${diffHours}h left`;
      return { text, urgent: diffHours < 6, expired: false };
    }
    if (diffDays < 7) {
      const text = settings.language === 'ko' ? `${diffDays}일 남음` :
                   settings.language === 'ja' ? `${diffDays}日` : `${diffDays}d left`;
      return { text, urgent: diffDays <= 1, expired: false };
    }

    return { text: formatDate(dueDate), urgent: false, expired: false };
  }, [settings.language, formatDate]);

  return {
    formatDate,
    formatTime,
    formatDateTime,
    getRelativeTime,
    getTimeLeft,
  };
}

/**
 * 설정 기반 알림 허용 여부 확인 훅
 */
export function useNotificationSettings() {
  const { isNotificationEnabled, settings } = useSettings();

  const canReceive = useCallback((type) => {
    return isNotificationEnabled(type);
  }, [isNotificationEnabled]);

  const requestPushPermission = useCallback(async () => {
    if (!settings.notifications.push) return false;
    if (!('Notification' in window)) return false;

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }, [settings.notifications.push]);

  return {
    canReceive,
    requestPushPermission,
    notifications: settings.notifications,
  };
}

/**
 * 설정 기반 접근성 확인 훅
 */
export function useAccessibilitySettings() {
  const { isAccessibilityEnabled, settings } = useSettings();

  return {
    isEnabled: isAccessibilityEnabled,
    reduceMotion: settings.accessibility?.reduceMotion ?? false,
    highContrast: settings.accessibility?.highContrast ?? false,
    keyboardNav: settings.accessibility?.keyboardNav ?? true,
    focusIndicator: settings.accessibility?.focusIndicator ?? true,
  };
}

/**
 * 개발자 모드 확인 훅
 */
export function useDevMode() {
  const { settings } = useSettings();

  return {
    isDevMode: settings.advanced?.devMode ?? false,
    consoleLogs: settings.advanced?.consoleLogs ?? false,
    betaFeatures: settings.advanced?.betaFeatures ?? false,
  };
}

