// 화상 통화 컨트롤 바
'use client';

import styles from './ControlBar.module.css';

export default function ControlBar({
  isMuted,
  isVideoOff,
  isSharingScreen,
  onToggleMute,
  onToggleVideo,
  onShareScreen,
  onLeave,
  onSettings,
  callDuration = '00:00:00'
}) {
  return (
    <div className={styles.controlBar}>
      <div className={styles.leftSection}>
        <div className={styles.duration}>⏱️ {callDuration}</div>
      </div>

      <div className={styles.centerSection}>
        <button
          className={`${styles.controlButton} ${isMuted ? styles.active : ''}`}
          onClick={onToggleMute}
          title={isMuted ? '음소거 해제' : '음소거'}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>

        <button
          className={`${styles.controlButton} ${isVideoOff ? styles.active : ''}`}
          onClick={onToggleVideo}
          title={isVideoOff ? '비디오 켜기' : '비디오 끄기'}
        >
          {isVideoOff ? '📹❌' : '📹'}
        </button>

        <button
          className={`${styles.controlButton} ${isSharingScreen ? styles.active : ''}`}
          onClick={onShareScreen}
          title={isSharingScreen ? '화면 공유 중지' : '화면 공유'}
        >
          🖥️
        </button>

        <button
          className={styles.controlButton}
          onClick={onSettings}
          title="설정"
        >
          ⚙️
        </button>
      </div>

      <div className={styles.rightSection}>
        <button
          className={`${styles.controlButton} ${styles.leaveButton}`}
          onClick={onLeave}
          title="나가기"
        >
          ← 나가기
        </button>
      </div>
    </div>
  );
}

