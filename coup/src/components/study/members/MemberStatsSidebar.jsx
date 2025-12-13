// 멤버 통계 사이드바 컴포넌트
'use client';

import styles from './MemberStatsSidebar.module.css';

/**
 * 멤버 통계 사이드바 컴포넌트
 * @param {Object} props
 * @param {Object} props.memberStats - 멤버 통계 객체 { total, owner, admin, member }
 * @param {number} props.pendingRequestCount - 대기 중인 가입 신청 수
 */
export default function MemberStatsSidebar({ 
  memberStats = { total: 0, owner: 0, admin: 0, member: 0 }, 
  pendingRequestCount = 0 
}) {
  return (
    <aside className={styles.sidebar}>
      {/* 멤버 현황 */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>📊 멤버 현황</h3>
        <div className={styles.widgetContent}>
          <div className={styles.statRow}>
            <span>총 멤버:</span>
            <span className={styles.statValue}>{memberStats.total}명</span>
          </div>
          <div className={styles.statRow}>
            <span>• 👑 OWNER:</span>
            <span>{memberStats.owner}명</span>
          </div>
          <div className={styles.statRow}>
            <span>• ⭐ ADMIN:</span>
            <span>{memberStats.admin}명</span>
          </div>
          <div className={styles.statRow}>
            <span>• 👤 MEMBER:</span>
            <span>{memberStats.member}명</span>
          </div>
        </div>
      </div>

      {/* 가입 신청 */}
      {pendingRequestCount > 0 && (
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>💬 가입 신청</h3>
          <div className={styles.widgetContent}>
            <div className={styles.statRow}>
              <span>대기 중:</span>
              <span className={`${styles.statValue} ${styles.pending}`}>
                {pendingRequestCount}건
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 권한 안내 */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>ℹ️ 권한 안내</h3>
        <div className={styles.widgetContent}>
          <div className={styles.permissionInfo}>
            <div className={styles.permissionItem}>
              <strong>👑 OWNER</strong>
              <ul>
                <li>모든 권한</li>
                <li>역할 변경</li>
                <li>멤버 강퇴</li>
                <li>스터디 삭제</li>
              </ul>
            </div>
            <div className={styles.permissionItem}>
              <strong>⭐ ADMIN</strong>
              <ul>
                <li>MEMBER 강퇴</li>
                <li>가입 승인/거절</li>
                <li>공지 작성</li>
              </ul>
            </div>
            <div className={styles.permissionItem}>
              <strong>👤 MEMBER</strong>
              <ul>
                <li>스터디 참여</li>
                <li>채팅/할일 작성</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
