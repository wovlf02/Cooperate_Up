// 스터디 탐색 (Explore) - 무한 스크롤
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// 카테고리 정의
const categories = [
  { id: 'all', label: '전체', value: null, icon: '📚' },
  { id: 'programming', label: '프로그래밍', value: '프로그래밍', icon: '💻' },
  { id: 'language', label: '어학', value: '어학', icon: '🌍' },
  { id: 'cert', label: '자격증', value: '자격증', icon: '📝' },
  { id: 'hobby', label: '취미', value: '취미', icon: '🎸' },
  { id: 'book', label: '독서', value: '독서', icon: '📖' },
  { id: 'finance', label: '재테크', value: '재테크', icon: '💰' },
];

// 스터디 생성 팁
const studyTips = [
  { title: '명확한 목표', description: '구체적인 학습 목표를 설정하세요' },
  { title: '규칙적인 일정', description: '정기적인 모임으로 습관을 만드세요' },
  { title: '적극적인 소통', description: '활발한 소통으로 동기부여하세요' },
];

const ITEMS_PER_LOAD = 20; // 한 번에 20개씩 로드

export default function StudiesExplorePage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [recruitingFilter, setRecruitingFilter] = useState('all'); // 'all', 'recruiting', 'closed'
  
  // 무한 스크롤 상태
  const [studies, setStudies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  
  // 내 스터디 ID 목록
  const [myStudyIds, setMyStudyIds] = useState([]);
  
  // 스크롤 감지용 ref
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const isLoadingRef = useRef(false); // 중복 호출 방지용

  // 맨 위로 버튼 표시 여부
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 내 스터디 목록 가져오기
  useEffect(() => {
    const fetchMyStudies = async () => {
      try {
        const response = await fetch('/api/my-studies?limit=100');
        if (response.ok) {
          const data = await response.json();
          const ids = (data.data?.studies || []).map(s => s.study?.id || s.studyId);
          setMyStudyIds(ids);
        }
      } catch (err) {
        console.error('내 스터디 로드 실패:', err);
      }
    };
    fetchMyStudies();
  }, []);

  // 스터디 목록 가져오기
  const fetchStudies = useCallback(async (pageNum, reset = false) => {
    // 중복 호출 방지
    if (isLoading || isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    if (reset) setIsInitialLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: ITEMS_PER_LOAD.toString(),
      });
      
      if (selectedCategory && selectedCategory !== '전체') {
        params.append('category', selectedCategory);
      }
      
      if (searchKeyword && searchKeyword.trim()) {
        params.append('search', searchKeyword.trim());
      }
      
      if (recruitingFilter && recruitingFilter !== 'all') {
        params.append('recruiting', recruitingFilter);
      }
      
      const response = await fetch(`/api/studies?${params}`);
      
      if (!response.ok) {
        throw new Error('스터디 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      const newStudies = data.data || [];
      const pagination = data.pagination || { total: 0 };
      
      // 내 스터디 제외
      const filteredStudies = newStudies.filter(study => !myStudyIds.includes(study.id));
      
      setTotalCount(pagination.total);
      
      // 더 불러올 데이터가 있는지 확인
      // 1. 새로 불러온 원본 데이터가 0개면 끝
      // 2. 새로 불러온 원본 데이터가 limit보다 적으면 끝
      const hasMoreData = newStudies.length > 0 && newStudies.length >= ITEMS_PER_LOAD;

      if (reset) {
        setStudies(filteredStudies);
      } else {
        setStudies(prev => [...prev, ...filteredStudies]);
      }

      setHasMore(hasMoreData);

    } catch (err) {
      console.error('스터디 로드 에러:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
      isLoadingRef.current = false;
    }
  }, [selectedCategory, searchKeyword, recruitingFilter, myStudyIds, isLoading]);

  // 초기 로드 및 필터 변경 시 리셋
  useEffect(() => {
    setPage(1);
    setStudies([]);
    setHasMore(true);
    fetchStudies(1, true);
  }, [selectedCategory, recruitingFilter, myStudyIds]); // searchKeyword는 검색 버튼 클릭 시에만

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    // hasMore가 false면 observer를 설정하지 않음
    if (!hasMore) {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // hasMore가 true이고, 로딩 중이 아닐 때만 다음 페이지 로드
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingRef.current) {
          setPage(prev => prev + 1);
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
  }, [hasMore, isLoading]);

  // 스크롤 위치 감지 (맨 위로 버튼 표시 여부)
  useEffect(() => {
    const handleScroll = () => {
      // 300px 이상 스크롤하면 버튼 표시
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

  // 페이지 변경 시 추가 로드
  useEffect(() => {
    if (page > 1) {
      fetchStudies(page, false);
    }
  }, [page]);

  // 검색 핸들러
  const handleSearch = () => {
    setPage(1);
    setStudies([]);
    setHasMore(true);
    fetchStudies(1, true);
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // 초기 로딩 상태
  if (isInitialLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.loading}>스터디를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error && studies.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.error}>
            {error}
            <button onClick={() => fetchStudies(1, true)} className={styles.retryButton}>
              다시 시도
            </button>
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
            <h1 className={styles.title}>🔍 스터디 탐색</h1>
            <p className={styles.subtitle}>
              관심있는 스터디를 찾아 함께 성장하세요
            </p>
          </div>
          <Link href="/studies/create" className={styles.createButton}>
            + 스터디 만들기
          </Link>
        </div>

        {/* 검색 및 필터 */}
        <div className={styles.filterSection}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="스터디 이름, 키워드로 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={styles.searchInput}
            />
            <button className={styles.searchButton} onClick={handleSearch}>
              🔍 검색
            </button>
          </div>

          <div className={styles.categoryTabs}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryTab} ${
                  selectedCategory === category.label ? styles.active : ''
                }`}
                onClick={() => handleCategoryChange(category.label)}
              >
                {category.icon} {category.label}
              </button>
            ))}
          </div>

          {/* 모집 상태 필터 */}
          <div className={styles.recruitingFilter}>
            <span className={styles.filterLabel}>모집 상태:</span>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterBtn} ${recruitingFilter === 'all' ? styles.active : ''}`}
                onClick={() => setRecruitingFilter('all')}
              >
                전체
              </button>
              <button
                className={`${styles.filterBtn} ${recruitingFilter === 'recruiting' ? styles.active : ''}`}
                onClick={() => setRecruitingFilter('recruiting')}
              >
                🟢 모집중
              </button>
              <button
                className={`${styles.filterBtn} ${recruitingFilter === 'closed' ? styles.active : ''}`}
                onClick={() => setRecruitingFilter('closed')}
              >
                🔴 모집마감
              </button>
            </div>
          </div>
        </div>

        {/* 결과 정보 */}
        <div className={styles.resultInfo}>
          <span>총 {totalCount}개의 스터디</span>
          {studies.length > 0 && (
            <span className={styles.loadedCount}>({studies.length}개 표시 중)</span>
          )}
        </div>

        {/* 스터디 카드 그리드 */}
        {studies.length === 0 && !isLoading ? (
          <div className={styles.emptyState}>
            <p>검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className={styles.studiesGrid}>
            {studies.map((study) => {
              const isFull = (study.currentMembers || 0) >= study.maxMembers;
              const isNotRecruiting = study.isRecruiting === false;
              const cannotJoin = isFull || isNotRecruiting;
              return (
              <Link
                key={study.id}
                href={`/studies/${study.id}`}
                className={`${styles.studyCard} ${cannotJoin ? styles.fullStudyCard : ''}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.emoji}>{study.emoji}</div>
                  {isFull ? (
                    <span className={styles.fullBadge}>인원마감</span>
                  ) : isNotRecruiting ? (
                    <span className={styles.closedBadge}>모집완료</span>
                  ) : (
                    <span className={styles.recruitingBadge}>모집중</span>
                  )}
                </div>

                <h3 className={styles.studyName}>{study.name}</h3>
                <p className={styles.studyDescription}>{study.description}</p>

                <div className={styles.studyMeta}>
                  <span className={styles.category}>
                    {study.category} {study.subCategory ? `· ${study.subCategory}` : ''}
                  </span>
                  <div className={styles.rating}>
                    ⭐ {study.rating ? study.rating.toFixed(1) : '0.0'}
                  </div>
                </div>

                <div className={styles.tags}>
                  {study.tags?.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <span className={`${styles.members} ${cannotJoin ? styles.membersFull : ''}`}>
                    👥 {study.currentMembers || 0}/{study.maxMembers}명
                    {isFull && <span className={styles.fullText}> (마감)</span>}
                    {!isFull && isNotRecruiting && <span className={styles.fullText}> (모집종료)</span>}
                  </span>
                  <span className={styles.owner}>👤 {study.owner?.name || '알 수 없음'}</span>
                </div>
              </Link>
            );
            })}
          </div>
        )}

        {/* 무한 스크롤 로더 */}
        <div ref={loadMoreRef} className={styles.loadMore}>
          {isLoading && <div className={styles.loadingMore}>더 불러오는 중...</div>}
          {!hasMore && studies.length > 0 && (
            <div className={styles.endMessage}>모든 스터디를 불러왔습니다 🎉</div>
          )}
        </div>
      </div>

      {/* 우측 사이드바 위젯 */}
      <aside className={styles.sidebar}>
        {/* 1. 인기 카테고리 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>🔥 인기 카테고리</h3>
          <div className={styles.widgetContent}>
            {categories.slice(1, 6).map((category) => (
              <button
                key={category.id}
                className={styles.categoryItem}
                onClick={() => handleCategoryChange(category.label)}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryLabel}>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. 스터디 생성 팁 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>💡 성공적인 스터디 운영 팁</h3>
          <div className={styles.widgetContent}>
            {studyTips.map((tip, index) => (
              <div key={index} className={styles.tipItem}>
                <div className={styles.tipNumber}>{index + 1}</div>
                <div className={styles.tipContent}>
                  <div className={styles.tipTitle}>{tip.title}</div>
                  <div className={styles.tipDesc}>{tip.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. 플랫폼 통계 */}
        <div className={styles.widget}>
          <h3 className={styles.widgetTitle}>📊 CoUp 통계</h3>
          <div className={styles.widgetContent}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>전체 스터디</span>
              <span className={styles.statValue}>{totalCount}개</span>
            </div>
          </div>
          <div className={styles.widgetFooter}>
            💙 함께 성장하는 커뮤니티
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
