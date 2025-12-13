// 언어 설정 컴포넌트
'use client';

import styles from './LanguageSettings.module.css';

export default function LanguageSettings({ settings, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ ...settings, [field]: value });
  };

  return (
    <div className={styles.container}>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>표시 언어</h3>
        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="language"
              value="ko"
              checked={settings.language === 'ko'}
              onChange={(e) => handleChange('language', e.target.value)}
              className={styles.radio}
            />
            <span>한국어 (Korean)</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="language"
              value="en"
              checked={settings.language === 'en'}
              onChange={(e) => handleChange('language', e.target.value)}
              className={styles.radio}
            />
            <span>English</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="language"
              value="ja"
              checked={settings.language === 'ja'}
              onChange={(e) => handleChange('language', e.target.value)}
              className={styles.radio}
            />
            <span>日本語 (Japanese)</span>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>날짜 형식</h3>
        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="dateFormat"
              value="YYYY-MM-DD"
              checked={settings.dateFormat === 'YYYY-MM-DD'}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className={styles.radio}
            />
            <span>YYYY-MM-DD (2025-01-21)</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="dateFormat"
              value="MM/DD/YYYY"
              checked={settings.dateFormat === 'MM/DD/YYYY'}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className={styles.radio}
            />
            <span>MM/DD/YYYY (01/21/2025)</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="dateFormat"
              value="DD.MM.YYYY"
              checked={settings.dateFormat === 'DD.MM.YYYY'}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className={styles.radio}
            />
            <span>DD.MM.YYYY (21.01.2025)</span>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>시간 형식</h3>
        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="timeFormat"
              value="24h"
              checked={settings.timeFormat === '24h'}
              onChange={(e) => handleChange('timeFormat', e.target.value)}
              className={styles.radio}
            />
            <span>24시간 (14:30)</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="timeFormat"
              value="12h"
              checked={settings.timeFormat === '12h'}
              onChange={(e) => handleChange('timeFormat', e.target.value)}
              className={styles.radio}
            />
            <span>12시간 (2:30 PM)</span>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>시간대</h3>
        <select
          value={settings.timezone}
          onChange={(e) => handleChange('timezone', e.target.value)}
          className={styles.select}
        >
          <option value="Asia/Seoul">Asia/Seoul (GMT+9)</option>
          <option value="America/New_York">America/New York (GMT-5)</option>
          <option value="Europe/London">Europe/London (GMT+0)</option>
          <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
          <option value="Australia/Sydney">Australia/Sydney (GMT+11)</option>
        </select>
      </div>
    </div>
  );
}

