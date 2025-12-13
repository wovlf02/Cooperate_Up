// 가입 신청 카드 컴포넌트
'use client';

import styles from './JoinRequestCard.module.css';

/**
 * 가입 신청 카드 컴포넌트
 * @param {Object} props
 * @param {Object} props.request - 가입 신청 정보
 * @param {Function} props.onApprove - 승인 핸들러
 * @param {Function} props.onReject - 거절 핸들러
 * @param {boolean} props.isProcessing - 처리 중 상태
 */
export default function JoinRequestCard({ 
  request, 
  onApprove, 
  onReject,
  isProcessing = false 
}) {
  if (!request || !request.user) {
    return null;
  }

  return (
    <div className={styles.requestCard}>
      <div className={styles.requestInfo}>
        <div className={styles.requestAvatar}>
          {request.user.avatar ? (
            <img src={request.user.avatar} alt={request.user.name} />
          ) : (
            request.user.name?.charAt(0) || '?'
          )}
        </div>
        <div className={styles.requestDetails}>
          <h4 className={styles.requestName}>{request.user.name}</h4>
          <div className={styles.requestEmail}>{request.user.email}</div>
          <div className={styles.requestDate}>
            신청일: {new Date(request.createdAt).toLocaleDateString()}
          </div>
          {request.message && (
            <div className={styles.requestMessage}>
              💬 {request.message}
            </div>
          )}
        </div>
      </div>
      <div className={styles.requestActions}>
        <button
          className={styles.approveBtn}
          onClick={() => onApprove(request)}
          disabled={isProcessing}
        >
          ✅ 승인
        </button>
        <button
          className={styles.rejectBtn}
          onClick={() => onReject(request)}
          disabled={isProcessing}
        >
          ❌ 거절
        </button>
      </div>
    </div>
  );
}
