'use client';

import styles from './NotificationSettings.module.css';

// 토글 스위치 컴포넌트
function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <label className={styles.toggleItem}>
      <div className={styles.toggleInfo}>
        <span className={styles.toggleLabel}>{label}</span>
        {description && <span className={styles.toggleDesc}>{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.toggleThumb} />
      </button>
    </label>
  );
}

export default function NotificationSettings({ settings, onUpdate }) {
  const notifications = settings.notifications || {};

  const handleToggle = (key, value) => {
    onUpdate({
      ...settings,
      notifications: {
        ...notifications,
        [key]: value,
      },
    });
  };

  return (
    <div className={styles.container}>
      {/* 알림 수신 방법 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>📲 알림 수신 방법</h3>
        <div className={styles.settingsGroup}>
          <ToggleSwitch
            checked={notifications.push ?? true}
            onChange={(v) => handleToggle('push', v)}
            label="푸시 알림"
            description="브라우저 푸시 알림을 받습니다"
          />
          <ToggleSwitch
            checked={notifications.email ?? true}
            onChange={(v) => handleToggle('email', v)}
            label="이메일 알림"
            description="중요한 알림을 이메일로 받습니다"
          />
        </div>
      </section>

      {/* 스터디 알림 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>📚 스터디 알림</h3>
        <div className={styles.settingsGroup}>
          <ToggleSwitch
            checked={notifications.studyUpdates ?? true}
            onChange={(v) => handleToggle('studyUpdates', v)}
            label="스터디 업데이트"
            description="스터디 정보 변경, 멤버 참여/탈퇴"
          />
          <ToggleSwitch
            checked={notifications.announcements ?? true}
            onChange={(v) => handleToggle('announcements', v)}
            label="공지사항"
            description="스터디 공지사항 알림"
          />
          <ToggleSwitch
            checked={notifications.taskReminders ?? true}
            onChange={(v) => handleToggle('taskReminders', v)}
            label="할 일 리마인더"
            description="마감일 임박 할 일 알림"
          />
          <ToggleSwitch
            checked={notifications.chatMessages ?? true}
            onChange={(v) => handleToggle('chatMessages', v)}
            label="채팅 메시지"
            description="새로운 채팅 메시지 알림"
          />
        </div>
      </section>

      {/* 정기 알림 */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>📅 정기 알림</h3>
        <div className={styles.settingsGroup}>
          <ToggleSwitch
            checked={notifications.weeklyDigest ?? false}
            onChange={(v) => handleToggle('weeklyDigest', v)}
            label="주간 요약"
            description="매주 월요일 활동 요약 이메일"
          />
          <ToggleSwitch
            checked={notifications.marketingEmails ?? false}
            onChange={(v) => handleToggle('marketingEmails', v)}
            label="마케팅 이메일"
            description="새로운 기능, 이벤트 소식"
          />
        </div>
      </section>

      {/* 알림 도움말 */}
      <div className={styles.helpBox}>
        <span className={styles.helpIcon}>💡</span>
        <div className={styles.helpContent}>
          <p className={styles.helpTitle}>알림 설정 팁</p>
          <p className={styles.helpText}>
            중요한 알림만 받고 싶다면 푸시 알림은 켜두고,
            채팅 메시지나 주간 요약은 끄세요.
          </p>
        </div>
      </div>
    </div>
  );
}

