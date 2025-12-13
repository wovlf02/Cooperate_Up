'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSettings } from '@/contexts/SettingsContext';
import { SETTINGS_TABS } from '../settingsConfig';
import SettingsHeader from './SettingsHeader';
import SettingsSidebar from './SettingsSidebar';
import SettingsMobileNav from './SettingsMobileNav';
import LanguageSettings from './LanguageSettings';
import AccessibilitySettings from './AccessibilitySettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import DataSettings from './DataSettings';
import AdvancedSettings from './AdvancedSettings';
import Toast from './Toast';
import styles from './SettingsContent.module.css';

export default function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const { settings: globalSettings, saveSettings, resetSettings, defaultSettings, isLoaded } = useSettings();

  // 초기 탭 계산
  const initialTab = useMemo(() => {
    if (tabParam && SETTINGS_TABS.find(t => t.id === tabParam)) {
      return tabParam;
    }
    return 'language';
  }, [tabParam]);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [localSettings, setLocalSettings] = useState(globalSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 전역 설정이 로드되면 로컬 상태 업데이트
  useEffect(() => {
    if (isLoaded) {
      setLocalSettings(globalSettings);
    }
  }, [isLoaded, globalSettings]);

  // 설정 저장
  const handleSave = () => {
    saveSettings(localSettings);
    setHasChanges(false);
    setToast({ message: '설정이 저장되었습니다! ✅', type: 'success' });
  };

  // 설정 업데이트
  const updateSettings = (newSettings) => {
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  // 설정 초기화
  const handleReset = () => {
    if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      setLocalSettings(defaultSettings);
      resetSettings();
      setHasChanges(false);
      setToast({ message: '설정이 초기화되었습니다.', type: 'info' });
    }
  };

  // 탭 변경
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    router.push(`/settings?tab=${tabId}`, { scroll: false });
  };

  // 콘텐츠 렌더링
  const renderContent = () => {
    switch (activeTab) {
      case 'language':
        return <LanguageSettings settings={localSettings} onUpdate={updateSettings} />;
      case 'accessibility':
        return <AccessibilitySettings settings={localSettings} onUpdate={updateSettings} />;
      case 'notifications':
        return <NotificationSettings settings={localSettings} onUpdate={updateSettings} />;
      case 'privacy':
        return <PrivacySettings settings={localSettings} onUpdate={updateSettings} />;
      case 'data':
        return <DataSettings />;
      case 'advanced':
        return <AdvancedSettings settings={localSettings} onUpdate={updateSettings} />;
      default:
        return <LanguageSettings settings={localSettings} onUpdate={updateSettings} />;
    }
  };

  const currentTab = SETTINGS_TABS.find(t => t.id === activeTab);

  return (
    <div className={styles.container}>
      {/* 토스트 알림 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 헤더 */}
      <SettingsHeader
        hasChanges={hasChanges}
        onSave={handleSave}
      />

      {/* 모바일 탭 선택 */}
      <SettingsMobileNav
        tabs={SETTINGS_TABS}
        activeTab={activeTab}
        currentTab={currentTab}
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onTabChange={handleTabChange}
      />

      {/* 메인 레이아웃 */}
      <div className={styles.mainLayout}>
        {/* 사이드바 (데스크탑) */}
        <SettingsSidebar
          tabs={SETTINGS_TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* 콘텐츠 영역 */}
        <main className={styles.content}>
          <div className={styles.contentHeader}>
            <span className={styles.contentIcon}>{currentTab?.icon}</span>
            <div>
              <h2 className={styles.contentTitle}>{currentTab?.label}</h2>
              <p className={styles.contentDesc}>{currentTab?.description}</p>
            </div>
          </div>

          <div className={styles.contentBody}>
            {renderContent()}
          </div>

          {/* 하단 액션 */}
          <div className={styles.actions}>
            <button onClick={handleReset} className={styles.resetButton}>
              기본값으로 초기화
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={styles.saveButton}
            >
              {hasChanges ? '변경사항 저장' : '저장됨'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
