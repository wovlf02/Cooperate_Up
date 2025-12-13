/**
 * 화면 크기에 따라 동적으로 페이지당 아이템 개수를 계산하는 훅
 * - 그리드 컨테이너의 크기와 아이템 크기를 기반으로 계산
 * - 화면 리사이즈에 반응
 * - 2줄 또는 3줄이 꽉 찰 때까지 표시
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 동적 페이지네이션 훅
 * @param {Object} options
 * @param {number} options.cardMinWidth - 카드 최소 너비 비율 (vw 기준, 기본: 15)
 * @param {number} options.cardMaxWidth - 카드 최대 너비 비율 (vw 기준, 기본: 25)
 * @param {number} options.cardAspectRatio - 카드 가로:세로 비율 (기본: 0.8 = 높이가 너비의 1.25배)
 * @param {number} options.gapRatio - 간격 비율 (vw 기준, 기본: 1)
 * @param {number} options.targetRows - 목표 행 수 (2 또는 3, 기본: 자동 - 화면에 맞춰 2 or 3)
 * @returns {Object} { itemsPerPage, columns, rows, containerRef }
 */
export function useDynamicPagination({
  cardMinWidth = 15,    // 최소 15vw
  cardMaxWidth = 22,    // 최대 22vw
  cardAspectRatio = 0.75, // 너비:높이 = 1:1.33
  gapRatio = 1,         // 1vw 간격
  targetRows = null,    // null이면 자동 (2 or 3줄)
} = {}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    itemsPerPage: 12, // 기본값
    columns: 4,
    rows: 3,
  });

  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // vw 기준으로 실제 픽셀 계산
    const minCardPx = (cardMinWidth / 100) * viewportWidth;
    const maxCardPx = (cardMaxWidth / 100) * viewportWidth;
    const gapPx = (gapRatio / 100) * viewportWidth;

    // 컨테이너에 들어갈 수 있는 컬럼 수 계산
    // 최소 너비 기준으로 최대 몇 개 들어가는지
    const maxColumns = Math.floor((containerWidth + gapPx) / (minCardPx + gapPx));
    // 최대 너비 기준으로 최소 몇 개 들어가는지
    const minColumns = Math.floor((containerWidth + gapPx) / (maxCardPx + gapPx));
    
    // 컬럼 수 결정 (최소 1개)
    const columns = Math.max(1, Math.min(maxColumns, Math.max(minColumns, 2)));

    // 실제 카드 너비 계산 (컨테이너를 columns로 나눈 값)
    const actualCardWidth = (containerWidth - (columns - 1) * gapPx) / columns;
    const actualCardHeight = actualCardWidth / cardAspectRatio;

    // 사용 가능한 높이 계산 (헤더, 필터, 페이지네이션 제외)
    // 대략적인 고정 영역: 헤더 ~100px, 필터 ~120px, 페이지네이션 ~80px, 여백 ~60px
    const fixedHeight = 360;
    const availableHeight = viewportHeight - fixedHeight;

    // 2줄 또는 3줄이 들어갈 수 있는지 계산
    let calculatedRows;
    if (targetRows) {
      calculatedRows = targetRows;
    } else {
      // 3줄이 들어갈 수 있으면 3줄, 아니면 2줄
      const heightFor3Rows = 3 * actualCardHeight + 2 * gapPx;
      const heightFor2Rows = 2 * actualCardHeight + 1 * gapPx;
      
      if (availableHeight >= heightFor3Rows) {
        calculatedRows = 3;
      } else if (availableHeight >= heightFor2Rows) {
        calculatedRows = 2;
      } else {
        calculatedRows = 2; // 최소 2줄
      }
    }

    const itemsPerPage = columns * calculatedRows;

    setDimensions({
      itemsPerPage,
      columns,
      rows: calculatedRows,
      cardWidth: actualCardWidth,
      cardHeight: actualCardHeight,
    });
  }, [cardMinWidth, cardMaxWidth, cardAspectRatio, gapRatio, targetRows]);

  useEffect(() => {
    // 초기 계산
    calculateDimensions();

    // ResizeObserver로 컨테이너 크기 변화 감지
    const resizeObserver = new ResizeObserver(() => {
      calculateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // 윈도우 리사이즈도 감지
    window.addEventListener('resize', calculateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateDimensions);
    };
  }, [calculateDimensions]);

  return {
    ...dimensions,
    containerRef,
  };
}

/**
 * 스터디 그리드용 동적 페이지네이션 훅
 * 2줄 또는 3줄이 꽉 찰 때까지 표시
 */
export function useDynamicStudyGrid({
  cardMinWidth = 15,
  cardMaxWidth = 22,
  cardAspectRatio = 0.75,
  gapRatio = 1,
  targetRows = null,
} = {}) {
  const { itemsPerPage, columns, rows, cardWidth, cardHeight, containerRef } = useDynamicPagination({
    cardMinWidth,
    cardMaxWidth,
    cardAspectRatio,
    gapRatio,
    targetRows,
  });

  // 페이지 변경 시 스크롤 위치 조정
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    itemsPerPage,
    columns,
    rows,
    cardWidth,
    cardHeight,
    containerRef,
    scrollToTop,
  };
}

export default useDynamicPagination;
