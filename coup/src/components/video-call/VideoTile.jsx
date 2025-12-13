// 비디오 타일 컴포넌트 - 개별 컨트롤 버튼 포함
'use client';

import { useRef, useEffect, useState } from 'react';
import styles from './VideoTile.module.css';

export default function VideoTile({
  stream,
  user,
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  isSpeaking = false,
  isExpanded = false,
  onToggleMute,
  onToggleVideo,
  onExpand,
  onCollapse,
  onDoubleClick
}) {
  const videoRef = useRef(null);
  const [showControls, setShowControls] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={`${styles.videoTile} ${isSpeaking ? styles.speaking : ''} ${isExpanded ? styles.expanded : ''}`}
      onMouseEnter={() => {
        setShowControls(true);
        setShowExpandButton(true);
      }}
      onMouseLeave={() => {
        setShowControls(false);
        setShowExpandButton(false);
      }}
      onDoubleClick={onDoubleClick}
    >
      {/* 비디오 또는 아바타 */}
      {isVideoOff || !stream ? (
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={styles.video}
        />
      )}

      {/* 상단 오버레이: 이름 및 전체보기 버튼 */}
      <div className={styles.topOverlay}>
        <div className={styles.name}>
          {user?.name || 'Unknown'}
          {isLocal && ' (나)'}
        </div>

        {/* 전체보기 버튼 (확대되지 않은 상태에서만, 마우스 오버 시) */}
        {!isExpanded && showExpandButton && onExpand && (
          <button
            className={styles.expandButton}
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            title="전체보기"
          >
            ⛶
          </button>
        )}
      </div>

      {/* 작게보기 버튼 (확대된 상태에서만, 우측 하단) */}
      {isExpanded && onCollapse && (
        <button
          className={styles.collapseButton}
          onClick={(e) => {
            e.stopPropagation();
            onCollapse();
          }}
          title="작게보기"
        >
          ⛶
        </button>
      )}

      {/* 하단 오버레이: 컨트롤 버튼 */}
      {isLocal && (
        <div className={`${styles.controls} ${showControls ? styles.controlsVisible : ''}`}>
          <button
            className={`${styles.controlButton} ${isMuted ? styles.controlButtonActive : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute?.();
            }}
            title={isMuted ? '마이크 켜기' : '마이크 끄기'}
          >
            {isMuted ? '🔇' : '🎤'}
          </button>

          <button
            className={`${styles.controlButton} ${isVideoOff ? styles.controlButtonActive : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleVideo?.();
            }}
            title={isVideoOff ? '비디오 켜기' : '비디오 끄기'}
          >
            {isVideoOff ? '📹❌' : '📹'}
          </button>
        </div>
      )}

      {/* 상태 표시 배지 */}
      <div className={styles.statusBadges}>
        {isMuted && <span className={styles.statusBadge}>🔇</span>}
        {isVideoOff && <span className={styles.statusBadge}>📹❌</span>}
      </div>
    </div>
  );
}

