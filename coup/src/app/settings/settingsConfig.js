// 설정 기본값 및 상수
export const defaultSettings = {
  // 언어 및 지역
  language: 'ko',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  timezone: 'Asia/Seoul',

  // 접근성
  fontSize: 100,
  animations: true,
  reduceAnimations: false,
  accessibility: {
    keyboardNav: true,
    focusIndicator: true,
    shortcuts: true,
    screenReader: true,
    ariaLabels: true,
    highContrast: false,
    reduceMotion: false,
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
  },

  // 고급 설정
  advanced: {
    devMode: false,
    consoleLogs: false,
    betaFeatures: false,
  }
};

// 탭 설정
export const SETTINGS_TABS = [
  { id: 'language', label: '언어 및 지역', icon: '🌍', description: '언어, 시간대, 날짜 형식' },
  { id: 'accessibility', label: '접근성', icon: '♿', description: '화면 읽기, 키보드 탐색' },
  { id: 'notifications', label: '알림', icon: '🔔', description: '푸시, 이메일 알림 관리' },
  { id: 'privacy', label: '개인정보', icon: '🔒', description: '프로필 공개, 활동 표시' },
  { id: 'data', label: '데이터', icon: '📊', description: '저장 공간, 데이터 관리' },
  { id: 'advanced', label: '고급', icon: '🔧', description: '개발자 옵션, 베타 기능' },
];

// 설정 적용 함수
export const applySettings = (settingsToApply) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // 폰트 크기 적용
  root.style.fontSize = `${settingsToApply.fontSize}%`;

  // 애니메이션 설정
  if (settingsToApply.reduceAnimations || settingsToApply.accessibility?.reduceMotion) {
    root.style.setProperty('--animation-duration', '0.01s');
  } else {
    root.style.setProperty('--animation-duration', '0.3s');
  }

  // 고대비 모드
  if (settingsToApply.accessibility?.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  // 포커스 표시기
  if (settingsToApply.accessibility?.focusIndicator) {
    root.style.setProperty('--focus-ring-width', '4px');
  } else {
    root.style.setProperty('--focus-ring-width', '2px');
  }
};

// 설정 저장
export const saveSettings = (settings) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('systemSettings', JSON.stringify(settings));
};

// 설정 로드
export const loadSettings = () => {
  if (typeof localStorage === 'undefined') return null;
  const savedSettings = localStorage.getItem('systemSettings');
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings);
    } catch (error) {
      console.error('Failed to parse settings:', error);
      return null;
    }
  }
  return null;
};

// 설정 초기화
export const resetSettings = () => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('systemSettings');
};

