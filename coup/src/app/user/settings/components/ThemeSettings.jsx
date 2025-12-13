// 테마 설정 컴포넌트
'use client';

import { useState } from 'react';
import api from '@/lib/api';
import styles from './ThemeSettings.module.css';

export default function ThemeSettings() {
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
    accentColor: 'purple',
  });
  const [isSaving, setIsSaving] = useState(false);

  const themes = [
    { value: 'light', label: '라이트 모드', icon: '☀️' },
    { value: 'dark', label: '다크 모드', icon: '🌙' },
    { value: 'system', label: '시스템 설정 따르기', icon: '💻' },
  ];

  const fontSizes = [
    { value: 'small', label: '작게' },
    { value: 'medium', label: '보통' },
    { value: 'large', label: '크게' },
  ];

  const accentColors = [
    { value: 'purple', color: '#C7B8EA', icon: '🟣' },
    { value: 'blue', color: '#60A5FA', icon: '🔵' },
    { value: 'green', color: '#34D399', icon: '🟢' },
    { value: 'yellow', color: '#FBBF24', icon: '🟡' },
    { value: 'red', color: '#F87171', icon: '🔴' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.put('/api/user/settings/theme', settings);
      alert('테마 설정이 저장되었습니다.');
      // 실제로는 여기서 테마를 적용하는 로직이 필요합니다
    } catch (error) {
      console.error('Save error:', error);
      alert('테마 설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🎨 화면 설정</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 테마 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>테마</h3>
          <div className={styles.themeOptions}>
            {themes.map((theme) => (
              <label
                key={theme.value}
                className={`${styles.themeOption} ${settings.theme === theme.value ? styles.themeOptionActive : ''}`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={theme.value}
                  checked={settings.theme === theme.value}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className={styles.radio}
                />
                <span className={styles.themeIcon}>{theme.icon}</span>
                <span className={styles.themeLabel}>{theme.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 폰트 크기 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>화면 크기</h3>
          <div className={styles.fontSizeOptions}>
            {fontSizes.map((size) => (
              <label
                key={size.value}
                className={`${styles.fontSizeOption} ${settings.fontSize === size.value ? styles.fontSizeOptionActive : ''}`}
              >
                <input
                  type="radio"
                  name="fontSize"
                  value={size.value}
                  checked={settings.fontSize === size.value}
                  onChange={(e) => setSettings({ ...settings, fontSize: e.target.value })}
                  className={styles.radio}
                />
                <span>{size.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 강조색 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>강조색</h3>
          <div className={styles.colorOptions}>
            {accentColors.map((color) => (
              <label
                key={color.value}
                className={`${styles.colorOption} ${settings.accentColor === color.value ? styles.colorOptionActive : ''}`}
              >
                <input
                  type="radio"
                  name="accentColor"
                  value={color.value}
                  checked={settings.accentColor === color.value}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  className={styles.radio}
                />
                <span className={styles.colorCircle} style={{ backgroundColor: color.color }}>
                  {settings.accentColor === color.value && '✓'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div className={styles.actions}>
          <button
            type="submit"
            disabled={isSaving}
            className={styles.saveButton}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}

