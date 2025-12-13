// 스터디 프리뷰 페이지 (미가입자용)
'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useStudy } from '@/lib/hooks/useApi';
import styles from './page.module.css';

export default function StudyPreviewPage({ params }) {
  const router = useRouter();
  const { studyId } = use(params);

  // 실제 API 호출
  const { data: studyData, isLoading } = useStudy(studyId);
  const study = studyData?.data;

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>스터디 정보를 불러오는 중...</div>
      </div>
    );
  }

  // 스터디 없음
  if (!study) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>스터디를 찾을 수 없습니다.</div>
      </div>
    );
  }

  // 인원 마감 또는 모집완료 여부 확인
  const isFull = study?.currentMembers >= study?.maxMembers;
  const isNotRecruiting = study?.isRecruiting === false;
  const cannotJoin = isFull || isNotRecruiting;

  // 가입 불가 사유 메시지
  const getJoinDisabledMessage = () => {
    if (isFull) return '인원이 다 찼습니다';
    if (isNotRecruiting) return '모집이 마감되었습니다';
    return '';
  };

  const handleJoin = () => {
    if (isFull) {
      alert('이 스터디는 인원이 다 찼습니다. 다른 스터디를 찾아보세요!');
      return;
    }
    if (isNotRecruiting) {
      alert('이 스터디는 현재 모집을 받지 않습니다.');
      return;
    }
    router.push(`/studies/${studyId}/join`);
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← 스터디 탐색으로
        </button>
      </div>

      {/* 메인 영역 */}
      <div className={styles.mainContent}>
        {/* 좌측: 스터디 정보 */}
        <div className={styles.leftSection}>
          {/* 스터디 카드 */}
          <div className={styles.studyCard}>
            <div className={styles.cardHeader}>
              <div className={styles.emoji}>{study.emoji}</div>
              {study.isRecruiting && (
                <span className={styles.recruitingBadge}>모집중</span>
              )}
            </div>

            <h1 className={styles.studyName}>{study.name}</h1>

            <div className={styles.studyMeta}>
              <span className={styles.category}>
                {study.category} {study.subCategory && `· ${study.subCategory}`}
              </span>
              {study.rating && <div className={styles.rating}>⭐ {study.rating.toFixed(1)}</div>}
            </div>

            {study.tags && study.tags.length > 0 && (
              <div className={styles.tags}>
                {study.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <p className={styles.description}>{study.description}</p>

            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>멤버</span>
                <span className={styles.statValue}>
                  {study.currentMembers}/{study.maxMembers}명
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>가입 방식</span>
                <span className={styles.statValue}>
                  {study.autoApprove ? '자동 승인' : '수동 승인'}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>공개 설정</span>
                <span className={styles.statValue}>
                  {study.isPublic ? '전체 공개' : '비공개'}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>개설일</span>
                <span className={styles.statValue}>
                  {new Date(study.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button 
              onClick={handleJoin} 
              className={`${styles.joinButton} ${cannotJoin ? styles.joinButtonDisabled : ''}`}
              disabled={cannotJoin}
            >
              {cannotJoin ? `🚫 ${getJoinDisabledMessage()}` : '🚀 스터디 가입하기'}
            </button>
          </div>

          {/* 스터디 소개 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>📝 상세 소개</h2>
            <p className={styles.detailText}>{study.description}</p>
          </div>

          {/* 최근 공지 미리보기 */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>📢 최근 공지</h2>
              <span className={styles.lockBadge}>🔒 가입 후 전체 확인</span>
            </div>
            <div className={styles.blurOverlay}>
              <p>가입 후 모든 공지를 확인할 수 있습니다</p>
            </div>
          </div>

          {/* 멤버 미리보기 */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>👥 멤버 ({study.currentMembers}명)</h2>
              <span className={styles.lockBadge}>🔒 가입 후 확인</span>
            </div>
            <div className={styles.blurOverlay}>
              <p>가입 후 모든 멤버를 확인할 수 있습니다</p>
            </div>
          </div>
        </div>

        {/* 우측: 사이드바 */}
        <div className={styles.rightSection}>
          {/* 빠른 가입 */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>🚀 빠른 가입</h3>
            <p className={styles.sideCardText}>
              {cannotJoin 
                ? (isFull ? '현재 인원이 다 찼습니다.' : '현재 모집을 받지 않습니다.')
                : '지금 가입하고 함께 성장해보세요!'}
            </p>
            <button 
              onClick={handleJoin} 
              className={`${styles.sideJoinButton} ${cannotJoin ? styles.sideJoinButtonDisabled : ''}`}
              disabled={cannotJoin}
            >
              {cannotJoin ? (isFull ? '마감' : '모집종료') : '가입하기'}
            </button>
          </div>

          {/* 스터디 정보 */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>ℹ️ 스터디 정보</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>그룹장</span>
                <span className={styles.infoValue}>
                  {study.owner?.name || '관리자'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>멤버 수</span>
                <span className={styles.infoValue}>
                  {study.currentMembers}/{study.maxMembers}명
                </span>
              </div>
              {study.rating && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>평점</span>
                  <span className={styles.infoValue}>⭐ {study.rating.toFixed(1)}</span>
                </div>
              )}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>공개 여부</span>
                <span className={styles.infoValue}>
                  {study.isPublic ? '전체 공개' : '비공개'}
                </span>
              </div>
            </div>
          </div>

          {/* 가입 후 혜택 */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>✨ 가입 후 혜택</h3>
            <ul className={styles.benefitsList}>
              <li>💬 실시간 채팅</li>
              <li>📢 전체 공지 확인</li>
              <li>📁 학습 자료 공유</li>
              <li>📅 일정 관리</li>
              <li>✅ 할일 관리</li>
              <li>📹 화상 스터디</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
