// 전역 설정 컨텍스트
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 기본 설정 값
const defaultSettings = {
  // 언어 및 지역
  language: 'ko',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  timezone: 'Asia/Seoul',

  // 폰트 크기
  fontSize: 100,

  // 접근성
  accessibility: {
    keyboardNav: true,
    focusIndicator: true,
    shortcuts: true,
    screenReader: true,
    ariaLabels: true,
    highContrast: false,
    reduceMotion: false,
    colorBlind: false,
    autoplayVideos: true,
    reduceFlash: false,
  },

  // 알림
  notifications: {
    push: true,
    email: true,
    studyUpdates: true,
    taskReminders: true,
    chatMessages: true,
    announcements: true,
    weeklyDigest: false,
    marketingEmails: false,
  },

  // 개인정보 보호
  privacy: {
    publicProfile: true,
    publicActivity: false,
    searchable: true,
    showOnlineStatus: true,
    analytics: true,
    errorReports: true,
    performanceData: false,
    cookiePolicy: 'functional',
    twoFactor: false,
  },

  // 고급 설정
  advanced: {
    devMode: false,
    consoleLogs: false,
    networkLogs: false,
    betaFeatures: false,
    newUI: false,
    experimentalAPI: false,
  }
};

const SettingsContext = createContext(null);

// 초기 설정 로드 함수
function loadInitialSettings() {
  if (typeof window === 'undefined') return defaultSettings;

  try {
    const saved = localStorage.getItem('systemSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return deepMerge(defaultSettings, parsed);
    }
  } catch (error) {
    console.error('설정 로드 오류:', error);
  }
  return defaultSettings;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadInitialSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // DOM에 설정 적용 (클라이언트에서만)
  useEffect(() => {
    applySettingsToDOM(settings);
    setIsLoaded(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 설정 저장
  const saveSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem('systemSettings', JSON.stringify(newSettings));
      applySettingsToDOM(newSettings);
    }
  }, []);

  // 설정 업데이트 (부분 업데이트)
  const updateSettings = useCallback((updates) => {
    const newSettings = deepMerge(settings, updates);
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // 설정 초기화
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('systemSettings');
      applySettingsToDOM(defaultSettings);
    }
  }, []);

  // 날짜 포맷
  const formatDate = useCallback((date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    switch (settings.dateFormat) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD.MM.YYYY':
        return `${day}.${month}.${year}`;
      case 'YYYY-MM-DD':
      default:
        return `${year}-${month}-${day}`;
    }
  }, [settings.dateFormat]);

  // 시간 포맷
  const formatTime = useCallback((date) => {
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');

    if (settings.timeFormat === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const h12 = hours % 12 || 12;
      return `${h12}:${minutes} ${period}`;
    }
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }, [settings.timeFormat]);

  // 날짜+시간 포맷
  const formatDateTime = useCallback((date) => {
    return `${formatDate(date)} ${formatTime(date)}`;
  }, [formatDate, formatTime]);

  // 알림 허용 여부 확인
  const isNotificationEnabled = useCallback((type) => {
    if (!settings.notifications.push && !settings.notifications.email) {
      return false;
    }
    return settings.notifications[type] ?? true;
  }, [settings.notifications]);

  // 접근성 설정 확인
  const isAccessibilityEnabled = useCallback((feature) => {
    return settings.accessibility[feature] ?? false;
  }, [settings.accessibility]);

  const value = {
    settings,
    isLoaded,
    saveSettings,
    updateSettings,
    resetSettings,
    formatDate,
    formatTime,
    formatDateTime,
    isNotificationEnabled,
    isAccessibilityEnabled,
    defaultSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// 깊은 병합 유틸리티
function deepMerge(target, source) {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

// DOM에 설정 적용
function applySettingsToDOM(settings) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // 폰트 크기 적용
  root.style.fontSize = `${settings.fontSize}%`;

  // 언어 설정
  root.setAttribute('lang', settings.language);

  // 애니메이션 줄이기
  if (settings.accessibility?.reduceMotion) {
    root.style.setProperty('--animation-duration', '0.01s');
    root.classList.add('reduce-motion');
  } else {
    root.style.setProperty('--animation-duration', '0.3s');
    root.classList.remove('reduce-motion');
  }

  // 고대비 모드
  if (settings.accessibility?.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  // 포커스 표시기
  if (settings.accessibility?.focusIndicator) {
    root.style.setProperty('--focus-ring-width', '4px');
    root.classList.add('focus-visible-enabled');
  } else {
    root.style.setProperty('--focus-ring-width', '2px');
    root.classList.remove('focus-visible-enabled');
  }

  // 색맹 보정 모드
  if (settings.accessibility?.colorBlind) {
    root.classList.add('color-blind-mode');
  } else {
    root.classList.remove('color-blind-mode');
  }

  // 플래시 줄이기
  if (settings.accessibility?.reduceFlash) {
    root.classList.add('reduce-flash');
  } else {
    root.classList.remove('reduce-flash');
  }

  // 개발자 모드
  if (settings.advanced?.devMode) {
    root.classList.add('dev-mode');
  } else {
    root.classList.remove('dev-mode');
  }
}

export default SettingsContext;

