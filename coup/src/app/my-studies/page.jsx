// 내 스터디 목록 페이지 - 그리드 레이아웃 + 무한 스크롤
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { useToast } from '@/components/admin/ui/Toast';

// 빈 상태 메시지 정의
const EMPTY_MESSAGES = {
  전체: {
    icon: '📚',
    title: '아직 참여 중인 스터디가 없어요',
    description: '지금 바로 관심있는 스터디를 찾아보세요!',
    cta: '스터디 둘러보기',
    href: '/studies'
  },
  참여중: {
    icon: '👤',
    title: '참여 중인 스터디가 없습니다',
    description: '새로운 스터디에 참여하여 함께 공부해보세요',
    cta: '스터디 찾기',
    href: '/studies'
  },
  관리중: {
    icon: '⭐',
    title: '관리 중인 스터디가 없습니다',
    description: '스터디를 만들어 리더가 되어보세요!',
    cta: '스터디 만들기',
    href: '/studies/create'
  },
  대기중: {
    icon: '⏳',
    title: '승인 대기 중인 스터디가 없습니다',
    description: '관심있는 스터디에 참여 신청을 해보세요',
    cta: '스터디 둘러보기',
    href: '/studies'
  }
};

const ITEMS_PER_LOAD = 20;

export default function MyStudiesListPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('전체');
  
  // 데이터 상태
  const [allStudies, setAllStudies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 무한 스크롤 상태
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_LOAD);
  const [hasMore, setHasMore] = useState(true);
  
  // 맨 위로 버튼 상태
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // 스크롤 감지용 ref
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // 데이터 가져오기
  const fetchMyStudies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/my-studies');
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showToast({ message: '로그인이 필요합니다', type: 'error' });
          setTimeout(() => router.push('/auth/signin'), 1500);
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        console.error('API 응답 에러:', response.status, errorData);
        throw new Error(errorData.message || '스터디 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('내 스터디 API 응답:', data);
      setAllStudies(data.data?.studies || []);
    } catch (err) {
      console.error('내 스터디 로드 에러:', err);
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [router, showToast]);

  // 초기 로드
  useEffect(() => {
    fetchMyStudies();
  }, [fetchMyStudies]);

  // 클라이언트 측 필터링
  const getFilteredStudies = useCallback(() => {
    switch (activeTab) {
      case '참여중':
        return allStudies.filter(s => s.role === 'MEMBER');
      case '관리중':
        return allStudies.filter(s => ['OWNER', 'ADMIN'].includes(s.role));
      case '대기중':
        return allStudies.filter(s => s.role === 'PENDING');
      case '전체':
      default:
        return allStudies;
    }
  }, [activeTab, allStudies]);

  const filteredStudies = getFilteredStudies();
  const displayedStudies = filteredStudies.slice(0, displayCount);

  // 탭별 카운트 계산
  const tabs = [
    { label: '전체', count: allStudies.length },
    { label: '참여중', count: allStudies.filter(s => s.role === 'MEMBER').length },
    { label: '관리중', count: allStudies.filter(s => ['OWNER', 'ADMIN'].includes(s.role)).length },
    { label: '대기중', count: allStudies.filter(s => s.role === 'PENDING').length },
  ];

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setDisplayCount(prev => {
            const newCount = prev + ITEMS_PER_LOAD;
            if (newCount >= filteredStudies.length) {
              setHasMore(false);
            }
            return newCount;
          });
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    observerRef.current = observer;
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, filteredStudies.length]);

  // 탭 변경 시 리셋
  useEffect(() => {
    setDisplayCount(ITEMS_PER_LOAD);
    setHasMore(true);
  }, [activeTab]);

  // hasMore 업데이트
  useEffect(() => {
    setHasMore(displayCount < filteredStudies.length);
  }, [displayCount, filteredStudies.length]);

  // 스크롤 위치 감지 (맨 위로 버튼)
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 맨 위로 스크롤 함수
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const getRoleBadge = (role) => {
    const badges = {
      OWNER: { label: 'OWNER', icon: '👑', color: 'owner' },
      ADMIN: { label: 'ADMIN', icon: '⭐', color: 'admin' },
      MEMBER: { label: 'MEMBER', icon: '👤', color: 'member' },
      PENDING: { label: 'PENDING', icon: '⏳', color: 'pending' },
    };
    return badges[role] || badges.MEMBER;
  };

  // 초기 로딩 상태
  if (isInitialLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.loading}>내 스터디를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error && allStudies.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3 className={styles.errorTitle}>스터디를 불러올 수 없습니다</h3>
            <p className={styles.errorDescription}>{error}</p>
            <div className={styles.errorActions}>
              <button onClick={fetchMyStudies} className={styles.retryButton}>
                🔄 다시 시도
              </button>
              <Link href="/studies" className={styles.exploreButton}>
                스터디 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>👥 내 스터디</h1>
            <p className={styles.subtitle}>
              참여 중인 스터디를 관리하고 활동하세요
            </p>
          </div>
          <Link href="/studies/create" className={styles.createButton}>
            + 스터디 만들기
          </Link>
        </div>

        {/* 탭 필터 */}
        <div className={styles.filterSection}>
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`${styles.tab} ${activeTab === tab.label ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.label)}
              >
                {tab.label}
                {tab.count > 0 && <span className={styles.tabCount}>{tab.count}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 정보 */}
        <div className={styles.resultInfo}>
          <span>총 {filteredStudies.length}개의 스터디</span>
          {displayedStudies.length > 0 && (
            <span className={styles.loadedCount}>({displayedStudies.length}개 표시 중)</span>
          )}
        </div>

        {/* 스터디 카드 그리드 */}
        {displayedStudies.length === 0 ? (
          <div className={styles.emptyState}>
            {(() => {
              const emptyMessage = EMPTY_MESSAGES[activeTab] || EMPTY_MESSAGES['전체'];
              return (
                <>
                  <div className={styles.emptyIcon}>{emptyMessage.icon}</div>
                  <h3 className={styles.emptyTitle}>{emptyMessage.title}</h3>
                  <p className={styles.emptyText}>{emptyMessage.description}</p>
                  <Link href={emptyMessage.href} className={styles.exploreButton}>
                    {emptyMessage.cta} →
                  </Link>
                </>
              );
            })()}
          </div>
        ) : (
          <div className={styles.studiesGrid}>
            {displayedStudies.map((study, index) => {
              const badge = getRoleBadge(study.role);
              const uniqueKey = study.id || study.studyId || `study-${index}`;
              const studyData = study.study || {};

              return (
                <Link
                  key={uniqueKey}
                  href={`/my-studies/${studyData.id || study.studyId}`}
                  className={styles.studyCard}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.emoji}>{studyData.emoji || '📚'}</div>
                    <span className={`${styles.roleBadge} ${styles[badge.color]}`}>
                      {badge.icon} {badge.label}
                    </span>
                  </div>

                  <h3 className={styles.studyName}>{studyData.name || '스터디'}</h3>
                  <p className={styles.studyDescription}>{studyData.description || ''}</p>

                  <div className={styles.studyMeta}>
                    <span className={styles.category}>
                      {studyData.category || '기타'}
                    </span>
                    {studyData.rating && (
                      <div className={styles.rating}>
                        ⭐ {studyData.rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {studyData.tags && studyData.tags.length > 0 && (
                    <div className={styles.tags}>
                      {studyData.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.tag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <span className={styles.members}>
                      👥 {studyData.currentMembers || 0}/{studyData.maxMembers || 0}명
                    </span>
                    <span className={styles.joinedAt}>
                      📅 {new Date(study.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 무한 스크롤 로더 */}
        <div ref={loadMoreRef} className={styles.loadMore}>
          {isLoading && <div className={styles.loadingMore}>더 불러오는 중...</div>}
          {!hasMore && displayedStudies.length > 0 && (
            <div className={styles.endMessage}>모든 스터디를 불러왔습니다 🎉</div>
          )}
        </div>
      </div>

      {/* 우측 사이드바 위젯 */}
      <aside className={styles.sidebar}>
        {/* 나의 활동 요약 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>📊 나의 활동 요약</h3>
          <div className={styles.widgetContent}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryValue}>{allStudies.length}</span>
                <span className={styles.summaryDesc}>전체</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryValue}>
                  {allStudies.filter(s => s.role === 'MEMBER').length}
                </span>
                <span className={styles.summaryDesc}>참여중</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryValue}>
                  {allStudies.filter(s => ['ADMIN', 'OWNER'].includes(s.role)).length}
                </span>
                <span className={styles.summaryDesc}>관리중</span>
              </div>
            </div>
          </div>
          <Link href="/me" className={styles.widgetLink}>
            내 프로필 보기 →
          </Link>
        </div>

        {/* 빠른 링크 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>⚡ 빠른 이동</h3>
          <div className={styles.widgetContent}>
            <Link href="/tasks" className={styles.quickLink}>
              ✅ 내 할일 관리
            </Link>
            <Link href="/notifications" className={styles.quickLink}>
              🔔 알림 확인
            </Link>
            <Link href="/studies" className={styles.quickLink}>
              🔍 스터디 탐색
            </Link>
          </div>
        </div>
      </aside>

      {/* 맨 위로 플로팅 버튼 */}
      {showScrollTop && (
        <button 
          className={styles.scrollTopButton}
          onClick={scrollToTop}
          aria-label="맨 위로"
        >
          ↑ 맨 위로
        </button>
      )}
    </div>
  );
}
