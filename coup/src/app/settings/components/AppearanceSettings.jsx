// 외관 설정 컴포넌트
'use client';

import { useState } from 'react';
import styles from './LanguageSettings.module.css';

export default function AppearanceSettings({ settings, onUpdate }) {
  const [fontSize, setFontSize] = useState(settings.fontSize);

  const handleChange = (field, value) => {
    onUpdate({ ...settings, [field]: value });
  };

  const handleFontSizeChange = (value) => {
    setFontSize(value);
    onUpdate({ ...settings, fontSize: value });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🎨 외관 설정</h2>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>테마</h3>
        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="theme"
              value="light"
              checked={settings.theme === 'light'}
              onChange={(e) => handleChange('theme', e.target.value)}
              className={styles.radio}
            />
            <span>☀️ 라이트 모드</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={settings.theme === 'dark'}
              onChange={(e) => handleChange('theme', e.target.value)}
              className={styles.radio}
            />
            <span>🌙 다크 모드</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="theme"
              value="system"
              checked={settings.theme === 'system'}
              onChange={(e) => handleChange('theme', e.target.value)}
              className={styles.radio}
            />
            <span>💻 시스템 설정 따르기</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="theme"
              value="auto"
              checked={settings.theme === 'auto'}
              onChange={(e) => handleChange('theme', e.target.value)}
              className={styles.radio}
            />
            <span>🌗 자동 (시간에 따라)</span>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>폰트 크기</h3>
        <div className={styles.fontSizeControl}>
          <input
            type="range"
            min="80"
            max="150"
            value={fontSize}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.fontSizeInputWrapper}>
            <input
              type="number"
              min="80"
              max="150"
              value={fontSize}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 80 && value <= 150) {
                  handleFontSizeChange(value);
                }
              }}
              className={styles.fontSizeInput}
            />
            <span className={styles.fontSizeUnit}>%</span>
          </div>
        </div>
        <div className={styles.previewBox}>
          <p style={{ fontSize: `${fontSize / 100}em`, margin: 0 }}>
            미리보기: 가나다라마바사 ABCDEFG 12345
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>애니메이션</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.animations}
              onChange={(e) => handleChange('animations', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>페이지 전환 애니메이션</span>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.hoverEffects}
              onChange={(e) => handleChange('hoverEffects', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>호버 효과</span>
            </div>
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={settings.reduceAnimations}
              onChange={(e) => handleChange('reduceAnimations', e.target.checked)}
              className={styles.checkbox}
            />
            <div className={styles.checkboxLabel}>
              <span>애니메이션 줄이기 (성능 향상)</span>
            </div>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>배경</h3>
        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="background"
              value="solid"
              checked={settings.background === 'solid'}
              onChange={(e) => handleChange('background', e.target.value)}
              className={styles.radio}
            />
            <span>단색</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="background"
              value="gradient"
              checked={settings.background === 'gradient'}
              onChange={(e) => handleChange('background', e.target.value)}
              className={styles.radio}
            />
            <span>그라데이션</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="background"
              value="pattern"
              checked={settings.background === 'pattern'}
              onChange={(e) => handleChange('background', e.target.value)}
              className={styles.radio}
            />
            <span>패턴</span>
          </label>
        </div>
      </div>
    </div>
  );
}

