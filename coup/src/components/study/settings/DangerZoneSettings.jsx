// 위험 구역 설정 컴포넌트
'use client';

import styles from './DangerZoneSettings.module.css';

/**
 * 위험 구역 설정 컴포넌트
 * @param {Object} props
 * @param {boolean} props.isOwner - 현재 사용자가 OWNER인지
 * @param {Function} props.onLeave - 탈퇴 핸들러
 * @param {Function} props.onDelete - 삭제 핸들러
 * @param {boolean} props.isProcessing - 처리 중 상태
 */
export default function DangerZoneSettings({ 
  isOwner, 
  onLeave, 
  onDelete,
  isProcessing = false 
}) {
  return (
    <div className={styles.settingsCard}>
      <h3 className={styles.cardTitle}>⚠️ 위험 구역</h3>
      <p className={styles.dangerWarning}>
        아래 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.
      </p>

      {/* 스터디 탈퇴 (OWNER가 아닌 경우) */}
      {!isOwner && (
        <div className={styles.dangerAction}>
          <div className={styles.dangerInfo}>
            <h4 className={styles.dangerTitle}>🚪 스터디 탈퇴</h4>
            <p className={styles.dangerDesc}>
              스터디에서 나가며 모든 데이터 접근 권한을 잃습니다.
              작성한 글과 댓글은 유지됩니다.
            </p>
          </div>
          <button 
            className={styles.leaveButton} 
            onClick={onLeave}
            disabled={isProcessing}
          >
            {isProcessing ? '처리 중...' : '스터디 탈퇴'}
          </button>
        </div>
      )}

      {/* 스터디 삭제 (OWNER만) */}
      {isOwner && (
        <div className={styles.dangerAction}>
          <div className={styles.dangerInfo}>
            <h4 className={styles.dangerTitle}>🗑️ 스터디 삭제</h4>
            <p className={styles.dangerDesc}>
              스터디와 모든 데이터(게시글, 파일, 일정 등)가 영구적으로 삭제됩니다.
              이 작업은 취소할 수 없습니다.
            </p>
          </div>
          <button 
            className={styles.deleteButton} 
            onClick={onDelete}
            disabled={isProcessing}
          >
            {isProcessing ? '처리 중...' : '스터디 삭제'}
          </button>
        </div>
      )}

      {/* OWNER 양도 안내 */}
      {isOwner && (
        <div className={styles.infoBox}>
          <h4 className={styles.infoTitle}>💡 스터디장 양도</h4>
          <p className={styles.infoDesc}>
            스터디를 유지하면서 다른 멤버에게 스터디장 권한을 양도하려면 
            멤버 관리에서 해당 멤버를 OWNER로 변경하세요.
          </p>
        </div>
      )}
    </div>
  );
}
