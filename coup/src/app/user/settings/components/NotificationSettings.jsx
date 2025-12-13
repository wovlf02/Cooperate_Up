// 알림 설정 컴포넌트
'use client';

import { useState } from 'react';
import api from '@/lib/api';
import styles from './NotificationSettings.module.css';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    pushNewMessage: true,
    pushStudyInvite: true,
    pushAttendanceReminder: true,
    pushAnnouncement: false,
    emailImportant: true,
    emailWeeklySummary: false,
    emailMarketing: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.put('/api/user/settings/notifications', settings);
      alert('알림 설정이 저장되었습니다.');
    } catch (error) {
      console.error('Save error:', error);
      alert('알림 설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🔔 알림 설정</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 푸시 알림 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>📱 푸시 알림</h3>
          <div className={styles.options}>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={settings.pushNewMessage}
                onChange={() => handleToggle('pushNewMessage')}
                className={styles.checkbox}
              />
              <span>새 메시지 알림</span>
            </label>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={settings.pushStudyInvite}
                onChange={() => handleToggle('pushStudyInvite')}
                className={styles.checkbox}
              />
              <span>스터디 초대 알림</span>
            </label>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={settings.pushAttendanceReminder}
                onChange={() => handleToggle('pushAttendanceReminder')}
                className={styles.checkbox}
              />
              <span>출석 리마인더</span>
            </label>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={settings.pushAnnouncement}
                onChange={() => handleToggle('pushAnnouncement')}
                className={styles.checkbox}
              />
              <span>공지사항 알림</span>
            </label>
          </div>
        </div>

        {/* 이메일 알림 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>📧 이메일 알림</h3>
          <div className={styles.options}>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={settings.emailImportant}
                onChange={() => handleToggle('emailImportant')}
                className={styles.checkbox}
              />
              <span>중요 공지사항</span>
            </label>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={settings.emailWeeklySummary}
                onChange={() => handleToggle('emailWeeklySummary')}
                className={styles.checkbox}
              />
              <span>주간 요약</span>
            </label>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={settings.emailMarketing}
                onChange={() => handleToggle('emailMarketing')}
                className={styles.checkbox}
              />
              <span>마케팅 정보</span>
            </label>
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

