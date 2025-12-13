// 가입 신청 목록 컴포넌트
'use client';

import JoinRequestCard from './JoinRequestCard';
import styles from './JoinRequestList.module.css';

/**
 * 가입 신청 목록 컴포넌트
 * @param {Object} props
 * @param {Array} props.requests - 가입 신청 목록
 * @param {Function} props.onApprove - 승인 핸들러
 * @param {Function} props.onReject - 거절 핸들러
 * @param {boolean} props.isProcessing - 처리 중 상태
 */
export default function JoinRequestList({ 
  requests = [], 
  onApprove, 
  onReject,
  isProcessing = false 
}) {
  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <div className={styles.requestSection}>
      <h3 className={styles.requestTitle}>
        🔔 가입 신청 ({pendingRequests.length})
      </h3>
      <div className={styles.requestList}>
        {pendingRequests.map((request) => (
          <JoinRequestCard
            key={request.id}
            request={request}
            onApprove={onApprove}
            onReject={onReject}
            isProcessing={isProcessing}
          />
        ))}
      </div>
    </div>
  );
}
