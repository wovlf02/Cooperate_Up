// 설정 사이드바 컴포넌트
'use client';

import styles from './SettingsSidebar.module.css';

/**
 * 설정 사이드바 컴포넌트
 * @param {Object} props
 * @param {Object} props.study - 스터디 정보
 * @param {boolean} props.isOwner - 현재 사용자가 OWNER인지
 * @param {boolean} props.isAdmin - 현재 사용자가 ADMIN인지
 */
export default function SettingsSidebar({ study, isOwner, isAdmin }) {
  if (!study) return null;

  return (
    <aside className={styles.sidebar}>
      {/* 주의사항 */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>⚠️ 주의사항</h3>
        <div className={styles.widgetContent}>
          <p className={styles.widgetText}>변경사항은 즉시 반영됩니다.</p>
          <p className={styles.widgetText}>중요한 변경 사항은 신중하게 진행하세요.</p>
        </div>
      </div>

      {/* 권한 안내 */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>💡 권한 안내</h3>
        <div className={styles.widgetContent}>
          <div className={styles.roleInfo}>
            <strong>👑 OWNER</strong>
            <ul>
              <li>모든 설정 변경</li>
              <li>멤버 관리</li>
              <li>스터디 삭제</li>
            </ul>
          </div>
          <div className={styles.roleInfo}>
            <strong>⭐ ADMIN</strong>
            <ul>
              <li>기본 정보 수정</li>
              <li>멤버 관리</li>
              <li>공개 설정</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 스터디 정보 */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>📊 스터디 정보</h3>
        <div className={styles.widgetContent}>
          <div className={styles.statRow}>
            <span>총 멤버:</span>
            <span className={styles.statValue}>{study.currentMembers}명</span>
          </div>
          <div className={styles.statRow}>
            <span>최대 인원:</span>
            <span>{study.maxMembers}명</span>
          </div>
          <div className={styles.statRow}>
            <span>공개 여부:</span>
            <span>{study.isPublic ? '공개' : '비공개'}</span>
          </div>
          <div className={styles.statRow}>
            <span>모집 상태:</span>
            <span className={study.isRecruiting ? styles.recruiting : styles.closed}>
              {study.isRecruiting ? '모집 중' : '모집 마감'}
            </span>
          </div>
          <div className={styles.statRow}>
            <span>생성일:</span>
            <span>{study.createdAt ? new Date(study.createdAt).toLocaleDateString() : '-'}</span>
          </div>
        </div>
      </div>

      {/* 내 역할 */}
      <div className={styles.widget}>
        <h3 className={styles.widgetTitle}>👤 내 역할</h3>
        <div className={styles.widgetContent}>
          <div className={styles.myRole}>
            <span className={`${styles.roleBadge} ${styles[study.myRole?.toLowerCase() || 'member']}`}>
              {study.myRole === 'OWNER' ? '👑' : study.myRole === 'ADMIN' ? '⭐' : '👤'}
              {study.myRole || 'MEMBER'}
            </span>
          </div>
          {isOwner && (
            <p className={styles.roleDesc}>
              스터디의 모든 권한을 가지고 있습니다.
            </p>
          )}
          {isAdmin && !isOwner && (
            <p className={styles.roleDesc}>
              기본 설정 변경 및 멤버 관리가 가능합니다.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
