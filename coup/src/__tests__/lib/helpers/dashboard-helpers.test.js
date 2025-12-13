/**
 * dashboard-helpers.test.js
 *
 * Dashboard Helpers 테스트
 *
 * @module __tests__/lib/helpers/dashboard-helpers.test.js
 * @author CoUp Team
 * @created 2025-12-04
 */

import {
  // 통계 계산 함수
  calculatePercentage,
  safeCalculate,
  calculateAverage,
  calculateChangeRate,
  
  // 날짜/시간 계산 함수
  calculateDday,
  formatDday,
  formatRelativeTime,
  formatDateRange,
  
  // 데이터 변환 함수
  withDefault,
  ensureArray,
  ensureObject,
  mergePartialData,
  
  // 데이터 정렬/필터링 함수
  getRecentItems,
  getUpcomingEvents,
  getUrgentTasks,
  
  // 포맷팅 함수
  formatNumber,
  formatPercentage,
  formatStatValue,
  formatDuration,
  
  // 에러 메시지 변환 함수
  getHttpErrorMessage,
  getErrorMessage,
  
  // 캐시/성능 관련 함수
  isDataFresh,
  debounce,
  
  // 서버사이드 응답 포맷팅 함수
  formatDashboardResponse,
  formatStatisticsResponse,
  formatWidgetResponse,
  formatWidgetsListResponse,
  createPaginatedResponse,
  createSuccessResponse,
  createErrorResponse,
  
  // 권한 확인 함수
  checkDashboardAccess,
  
  // 상수
  DASHBOARD_HELPER_VERSION
} from '@/lib/helpers/dashboard-helpers';

import { DashboardPermissionException } from '@/lib/exceptions/dashboard';

describe('Dashboard Helpers', () => {
  // ============================================
  // 1. 통계 계산 함수 테스트
  // ============================================

  describe('통계 계산 함수', () => {
    describe('calculatePercentage', () => {
      it('정상적인 백분율을 계산해야 함', () => {
        expect(calculatePercentage(75, 100)).toBe(75.0);
        expect(calculatePercentage(50, 200)).toBe(25.0);
        expect(calculatePercentage(1, 3)).toBeCloseTo(33.3, 1);
      });

      it('분모가 0일 때 0을 반환해야 함', () => {
        expect(calculatePercentage(100, 0)).toBe(0);
        expect(calculatePercentage(0, 0)).toBe(0);
      });

      it('null/undefined 값을 처리해야 함', () => {
        expect(calculatePercentage(null, 100)).toBe(0);
        expect(calculatePercentage(50, undefined)).toBe(0);
      });

      it('최대값 100을 초과하지 않아야 함', () => {
        expect(calculatePercentage(150, 100)).toBe(100);
        expect(calculatePercentage(200, 100)).toBe(100);
      });

      it('음수 값에 대해 최소값 0을 유지해야 함', () => {
        expect(calculatePercentage(-50, 100)).toBe(0);
      });

      it('소수점 자릿수를 설정할 수 있어야 함', () => {
        expect(calculatePercentage(1, 3, { decimals: 2 })).toBeCloseTo(33.33, 2);
        expect(calculatePercentage(1, 3, { decimals: 0 })).toBe(33);
      });
    });

    describe('safeCalculate', () => {
      it('정상적인 계산을 수행해야 함', () => {
        expect(safeCalculate(() => 10 + 20)).toBe(30);
        expect(safeCalculate(() => 100 / 4)).toBe(25);
      });

      it('에러 발생 시 기본값을 반환해야 함', () => {
        expect(safeCalculate(() => { throw new Error('test'); }, 0)).toBe(0);
        expect(safeCalculate(() => { throw new Error('test'); }, -1)).toBe(-1);
      });

      it('NaN 결과에 대해 기본값을 반환해야 함', () => {
        expect(safeCalculate(() => parseInt('abc'), 0)).toBe(0);
      });

      it('Infinity 결과에 대해 기본값을 반환해야 함', () => {
        expect(safeCalculate(() => 1 / 0, 0)).toBe(0);
      });
    });

    describe('calculateAverage', () => {
      it('배열의 평균을 계산해야 함', () => {
        expect(calculateAverage([80, 90, 85])).toBeCloseTo(85.0, 1);
        expect(calculateAverage([100])).toBe(100);
      });

      it('빈 배열에 대해 0을 반환해야 함', () => {
        expect(calculateAverage([])).toBe(0);
      });

      it('null/undefined에 대해 0을 반환해야 함', () => {
        expect(calculateAverage(null)).toBe(0);
        expect(calculateAverage(undefined)).toBe(0);
      });

      it('유효하지 않은 값을 필터링해야 함', () => {
        expect(calculateAverage([80, NaN, 90, undefined, 85])).toBeCloseTo(85.0, 1);
      });

      it('소수점 자릿수를 설정할 수 있어야 함', () => {
        expect(calculateAverage([1, 2], 2)).toBeCloseTo(1.50, 2);
      });
    });

    describe('calculateChangeRate', () => {
      it('증가율을 계산해야 함', () => {
        const result = calculateChangeRate(120, 100);
        expect(result.value).toBe(20);
        expect(result.isIncrease).toBe(true);
        expect(result.isDecrease).toBe(false);
        expect(result.isStable).toBe(false);
      });

      it('감소율을 계산해야 함', () => {
        const result = calculateChangeRate(80, 100);
        expect(result.value).toBe(-20);
        expect(result.isIncrease).toBe(false);
        expect(result.isDecrease).toBe(true);
        expect(result.isStable).toBe(false);
      });

      it('변화 없음을 처리해야 함', () => {
        const result = calculateChangeRate(100, 100);
        expect(result.value).toBe(0);
        expect(result.isStable).toBe(true);
      });

      it('이전 값이 0일 때 안정 상태를 반환해야 함', () => {
        const result = calculateChangeRate(100, 0);
        expect(result.value).toBe(0);
        expect(result.isStable).toBe(true);
      });
    });
  });

  // ============================================
  // 2. 날짜/시간 계산 함수 테스트
  // ============================================

  describe('날짜/시간 계산 함수', () => {
    describe('calculateDday', () => {
      it('미래 날짜에 대한 D-day를 계산해야 함', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);
        expect(calculateDday(futureDate)).toBe(5);
      });

      it('과거 날짜에 대한 D-day를 계산해야 함', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 3);
        expect(calculateDday(pastDate)).toBe(-3);
      });

      it('오늘 날짜에 대해 0을 반환해야 함', () => {
        const today = new Date();
        expect(calculateDday(today)).toBe(0);
      });

      it('null/undefined에 대해 null을 반환해야 함', () => {
        expect(calculateDday(null)).toBe(null);
        expect(calculateDday(undefined)).toBe(null);
      });

      it('유효하지 않은 날짜에 대해 null을 반환해야 함', () => {
        expect(calculateDday('invalid-date')).toBe(null);
      });
    });

    describe('formatDday', () => {
      it('미래 날짜를 "D-N" 형식으로 포맷해야 함', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);
        expect(formatDday(futureDate)).toBe('D-5');
      });

      it('과거 날짜를 "D+N" 형식으로 포맷해야 함', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 3);
        expect(formatDday(pastDate)).toBe('D+3');
      });

      it('오늘 날짜를 "D-Day"로 포맷해야 함', () => {
        const today = new Date();
        expect(formatDday(today)).toBe('D-Day');
      });

      it('null에 대해 "날짜 없음"을 반환해야 함', () => {
        expect(formatDday(null)).toBe('날짜 없음');
      });
    });

    describe('formatRelativeTime', () => {
      it('"방금 전"을 반환해야 함 (1분 미만)', () => {
        const justNow = new Date();
        expect(formatRelativeTime(justNow)).toBe('방금 전');
      });

      it('"N분 전"을 반환해야 함', () => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        expect(formatRelativeTime(fiveMinutesAgo)).toBe('5분 전');
      });

      it('"N시간 전"을 반환해야 함', () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        expect(formatRelativeTime(twoHoursAgo)).toBe('2시간 전');
      });

      it('"N일 전"을 반환해야 함', () => {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        expect(formatRelativeTime(threeDaysAgo)).toBe('3일 전');
      });

      it('null에 대해 "알 수 없음"을 반환해야 함', () => {
        expect(formatRelativeTime(null)).toBe('알 수 없음');
      });
    });

    describe('formatDateRange', () => {
      it('날짜 범위를 포맷해야 함', () => {
        const result = formatDateRange('2025-12-01', '2025-12-31');
        expect(result).toContain('2025');
        expect(result).toContain('~');
      });

      it('null 값에 대해 "날짜 없음"을 반환해야 함', () => {
        expect(formatDateRange(null, '2025-12-31')).toBe('날짜 없음');
        expect(formatDateRange('2025-12-01', null)).toBe('날짜 없음');
      });

      it('유효하지 않은 날짜에 대해 "날짜 오류"를 반환해야 함', () => {
        expect(formatDateRange('invalid', 'invalid')).toBe('날짜 오류');
      });
    });
  });

  // ============================================
  // 3. 데이터 변환 함수 테스트
  // ============================================

  describe('데이터 변환 함수', () => {
    describe('withDefault', () => {
      it('null에 대해 기본값을 반환해야 함', () => {
        expect(withDefault(null, [])).toEqual([]);
        expect(withDefault(null, 0)).toBe(0);
      });

      it('undefined에 대해 기본값을 반환해야 함', () => {
        expect(withDefault(undefined, {})).toEqual({});
      });

      it('유효한 값은 그대로 반환해야 함', () => {
        expect(withDefault(5, 0)).toBe(5);
        expect(withDefault([1, 2], [])).toEqual([1, 2]);
      });

      it('falsy 값(0, "", false)은 그대로 반환해야 함', () => {
        expect(withDefault(0, 100)).toBe(0);
        expect(withDefault('', 'default')).toBe('');
        expect(withDefault(false, true)).toBe(false);
      });
    });

    describe('ensureArray', () => {
      it('배열을 그대로 반환해야 함', () => {
        expect(ensureArray([1, 2, 3])).toEqual([1, 2, 3]);
      });

      it('null에 대해 빈 배열을 반환해야 함', () => {
        expect(ensureArray(null)).toEqual([]);
      });

      it('undefined에 대해 빈 배열을 반환해야 함', () => {
        expect(ensureArray(undefined)).toEqual([]);
      });

      it('배열이 아닌 값에 대해 빈 배열을 반환해야 함', () => {
        expect(ensureArray('string')).toEqual([]);
        expect(ensureArray(123)).toEqual([]);
        expect(ensureArray({})).toEqual([]);
      });
    });

    describe('ensureObject', () => {
      it('객체를 그대로 반환해야 함', () => {
        expect(ensureObject({ a: 1 })).toEqual({ a: 1 });
      });

      it('null에 대해 빈 객체를 반환해야 함', () => {
        expect(ensureObject(null)).toEqual({});
      });

      it('undefined에 대해 빈 객체를 반환해야 함', () => {
        expect(ensureObject(undefined)).toEqual({});
      });

      it('배열에 대해 빈 객체를 반환해야 함', () => {
        expect(ensureObject([1, 2])).toEqual({});
      });

      it('문자열에 대해 빈 객체를 반환해야 함', () => {
        expect(ensureObject('string')).toEqual({});
      });
    });

    describe('mergePartialData', () => {
      it('부분 데이터를 병합해야 함', () => {
        const full = { a: [], b: [], c: [] };
        const partial = { a: [1], b: [2] };
        const result = mergePartialData(full, partial);
        
        expect(result.a).toEqual([1]);
        expect(result.b).toEqual([2]);
        expect(result.c).toEqual([]);
      });

      it('실패한 키를 제외해야 함', () => {
        const full = { a: [], b: [], c: [] };
        const partial = { a: [1], b: [2], c: [3] };
        const result = mergePartialData(full, partial, ['c']);
        
        expect(result.a).toEqual([1]);
        expect(result.b).toEqual([2]);
        expect(result.c).toEqual([]);
      });
    });
  });

  // ============================================
  // 4. 데이터 정렬/필터링 함수 테스트
  // ============================================

  describe('데이터 정렬/필터링 함수', () => {
    describe('getRecentItems', () => {
      const items = [
        { id: 1, createdAt: '2025-12-01T10:00:00Z' },
        { id: 2, createdAt: '2025-12-03T10:00:00Z' },
        { id: 3, createdAt: '2025-12-02T10:00:00Z' }
      ];

      it('최신순으로 정렬된 항목을 반환해야 함', () => {
        const result = getRecentItems(items, 5);
        expect(result[0].id).toBe(2);
        expect(result[1].id).toBe(3);
        expect(result[2].id).toBe(1);
      });

      it('요청한 개수만큼 반환해야 함', () => {
        const result = getRecentItems(items, 2);
        expect(result.length).toBe(2);
      });

      it('배열이 아닌 값에 대해 빈 배열을 반환해야 함', () => {
        expect(getRecentItems(null, 5)).toEqual([]);
        expect(getRecentItems(undefined, 5)).toEqual([]);
      });

      it('커스텀 날짜 필드를 사용할 수 있어야 함', () => {
        const customItems = [
          { id: 1, updatedAt: '2025-12-01T10:00:00Z' },
          { id: 2, updatedAt: '2025-12-03T10:00:00Z' }
        ];
        const result = getRecentItems(customItems, 2, 'updatedAt');
        expect(result[0].id).toBe(2);
      });
    });

    describe('getUpcomingEvents', () => {
      it('미래 이벤트만 필터링해야 함', () => {
        const now = new Date();
        const events = [
          { id: 1, startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString() }, // 과거
          { id: 2, startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() }, // 미래
          { id: 3, startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString() }  // 미래
        ];
        
        const result = getUpcomingEvents(events, 10);
        expect(result.length).toBe(2);
        expect(result.some(e => e.id === 1)).toBe(false);
      });

      it('가까운 날짜순으로 정렬해야 함', () => {
        const now = new Date();
        const events = [
          { id: 1, startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString() },
          { id: 2, startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() }
        ];
        
        const result = getUpcomingEvents(events, 10);
        expect(result[0].id).toBe(2);
      });

      it('배열이 아닌 값에 대해 빈 배열을 반환해야 함', () => {
        expect(getUpcomingEvents(null, 5)).toEqual([]);
      });
    });

    describe('getUrgentTasks', () => {
      it('마감 임박한 미완료 할일만 필터링해야 함', () => {
        const now = new Date();
        const tasks = [
          { id: 1, dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), completed: false }, // 2일 후
          { id: 2, dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), completed: false }, // 5일 후
          { id: 3, dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), completed: true }   // 완료됨
        ];
        
        const result = getUrgentTasks(tasks, 3);
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(1);
      });

      it('마감일 가까운 순으로 정렬해야 함', () => {
        const now = new Date();
        const tasks = [
          { id: 1, dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), completed: false },
          { id: 2, dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), completed: false }
        ];
        
        const result = getUrgentTasks(tasks, 3);
        expect(result[0].id).toBe(2);
      });

      it('배열이 아닌 값에 대해 빈 배열을 반환해야 함', () => {
        expect(getUrgentTasks(null, 3)).toEqual([]);
      });
    });
  });

  // ============================================
  // 5. 포맷팅 함수 테스트
  // ============================================

  describe('포맷팅 함수', () => {
    describe('formatNumber', () => {
      it('천 단위 콤마를 추가해야 함', () => {
        expect(formatNumber(1234567)).toBe('1,234,567');
        expect(formatNumber(1000)).toBe('1,000');
      });

      it('NaN에 대해 "0"을 반환해야 함', () => {
        expect(formatNumber(NaN)).toBe('0');
        expect(formatNumber('abc')).toBe('0');
      });

      it('0을 올바르게 포맷해야 함', () => {
        expect(formatNumber(0)).toBe('0');
      });
    });

    describe('formatPercentage', () => {
      it('백분율 문자열을 반환해야 함', () => {
        expect(formatPercentage(75.5678)).toBe('75.6%');
        expect(formatPercentage(100)).toBe('100.0%');
      });

      it('NaN에 대해 "0.0%"를 반환해야 함', () => {
        expect(formatPercentage(NaN)).toBe('0.0%');
      });

      it('소수점 자릿수를 설정할 수 있어야 함', () => {
        expect(formatPercentage(75.5678, 2)).toBe('75.57%');
        expect(formatPercentage(75, 0)).toBe('75%');
      });
    });

    describe('formatStatValue', () => {
      it('number 타입을 포맷해야 함', () => {
        expect(formatStatValue(1234, 'number')).toBe('1,234');
      });

      it('percentage 타입을 포맷해야 함', () => {
        expect(formatStatValue(75.5, 'percentage')).toBe('75.5%');
      });

      it('duration 타입을 포맷해야 함', () => {
        expect(formatStatValue(90, 'duration')).toBe('1시간 30분');
      });

      it('기본 타입(number)을 사용해야 함', () => {
        expect(formatStatValue(1234)).toBe('1,234');
      });
    });

    describe('formatDuration', () => {
      it('분을 시간/분으로 변환해야 함', () => {
        expect(formatDuration(90)).toBe('1시간 30분');
        expect(formatDuration(150)).toBe('2시간 30분');
      });

      it('60분 미만일 때 분만 표시해야 함', () => {
        expect(formatDuration(45)).toBe('45분');
        expect(formatDuration(30)).toBe('30분');
      });

      it('정확히 시간 단위일 때 시간만 표시해야 함', () => {
        expect(formatDuration(60)).toBe('1시간');
        expect(formatDuration(120)).toBe('2시간');
      });

      it('0 또는 음수에 대해 "0분"을 반환해야 함', () => {
        expect(formatDuration(0)).toBe('0분');
        expect(formatDuration(-10)).toBe('0분');
      });

      it('NaN에 대해 "0분"을 반환해야 함', () => {
        expect(formatDuration(NaN)).toBe('0분');
      });
    });
  });

  // ============================================
  // 6. 에러 메시지 변환 함수 테스트
  // ============================================

  describe('에러 메시지 변환 함수', () => {
    describe('getHttpErrorMessage', () => {
      it('HTTP 상태 코드에 맞는 메시지를 반환해야 함', () => {
        expect(getHttpErrorMessage(400)).toBe('잘못된 요청입니다');
        expect(getHttpErrorMessage(401)).toBe('로그인이 필요합니다');
        expect(getHttpErrorMessage(403)).toBe('권한이 없습니다');
        expect(getHttpErrorMessage(404)).toBe('데이터를 찾을 수 없습니다');
        expect(getHttpErrorMessage(500)).toBe('서버 오류가 발생했습니다');
      });

      it('알 수 없는 상태 코드에 대해 기본 메시지를 반환해야 함', () => {
        expect(getHttpErrorMessage(999)).toBe('알 수 없는 오류가 발생했습니다');
      });
    });

    describe('getErrorMessage', () => {
      it('API 에러 응답에서 메시지를 추출해야 함', () => {
        const error = {
          response: {
            data: {
              error: { message: '사용자 정의 에러 메시지' }
            }
          }
        };
        expect(getErrorMessage(error)).toBe('사용자 정의 에러 메시지');
      });

      it('HTTP 상태 코드에서 메시지를 생성해야 함', () => {
        const error = { response: { status: 404 } };
        expect(getErrorMessage(error)).toBe('데이터를 찾을 수 없습니다');
      });

      it('네트워크 에러를 처리해야 함', () => {
        const error = { message: 'Network Error' };
        expect(getErrorMessage(error)).toBe('네트워크 연결을 확인해주세요');
      });

      it('타임아웃 에러를 처리해야 함', () => {
        const error = { message: 'Request timeout' };
        expect(getErrorMessage(error)).toBe('요청 시간이 초과되었습니다');
      });

      it('null에 대해 기본 메시지를 반환해야 함', () => {
        expect(getErrorMessage(null)).toBe('알 수 없는 오류가 발생했습니다');
      });
    });
  });

  // ============================================
  // 7. 캐시/성능 관련 함수 테스트
  // ============================================

  describe('캐시/성능 관련 함수', () => {
    describe('isDataFresh', () => {
      it('신선한 데이터에 대해 true를 반환해야 함', () => {
        const recentTime = new Date(Date.now() - 2 * 60 * 1000); // 2분 전
        expect(isDataFresh(recentTime, 5 * 60 * 1000)).toBe(true);
      });

      it('오래된 데이터에 대해 false를 반환해야 함', () => {
        const oldTime = new Date(Date.now() - 10 * 60 * 1000); // 10분 전
        expect(isDataFresh(oldTime, 5 * 60 * 1000)).toBe(false);
      });

      it('null에 대해 false를 반환해야 함', () => {
        expect(isDataFresh(null, 5 * 60 * 1000)).toBe(false);
      });
    });

    describe('debounce', () => {
      jest.useFakeTimers();

      it('지정된 시간 후에 함수를 실행해야 함', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 300);

        debouncedFn();
        expect(mockFn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(300);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('여러 번 호출되면 마지막 호출만 실행해야 함', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 300);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        jest.advanceTimersByTime(300);
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      jest.useRealTimers();
    });
  });

  // ============================================
  // 8. 서버사이드 응답 포맷팅 함수 테스트
  // ============================================

  describe('서버사이드 응답 포맷팅 함수', () => {
    describe('formatDashboardResponse', () => {
      it('대시보드 데이터를 포맷해야 함', () => {
        const data = {
          summary: { totalStudies: 5 },
          studyStats: {},
          taskStats: {},
          recentActivities: []
        };
        
        const result = formatDashboardResponse(data);
        expect(result.summary.totalStudies).toBe(5);
        expect(result.widgets).toBeDefined();
      });

      it('null에 대해 null을 반환해야 함', () => {
        expect(formatDashboardResponse(null)).toBe(null);
      });

      it('누락된 필드에 기본값을 제공해야 함', () => {
        const result = formatDashboardResponse({});
        expect(result.summary).toEqual({});
        expect(result.studyStats).toEqual({});
        expect(result.recentActivities).toEqual([]);
      });
    });

    describe('formatStatisticsResponse', () => {
      it('통계 데이터를 포맷해야 함', () => {
        const stats = {
          data: [1, 2, 3],
          summary: { total: 100 }
        };
        
        const result = formatStatisticsResponse(stats, 'STUDY');
        expect(result.type).toBe('STUDY');
        expect(result.data).toEqual([1, 2, 3]);
        expect(result.generatedAt).toBeDefined();
      });

      it('null에 대해 null을 반환해야 함', () => {
        expect(formatStatisticsResponse(null, 'STUDY')).toBe(null);
      });
    });

    describe('formatWidgetResponse', () => {
      it('위젯 데이터를 포맷해야 함', () => {
        const widget = {
          id: 'widget-1',
          type: 'STUDY_OVERVIEW',
          config: { size: 'large' },
          position: 0
        };
        
        const result = formatWidgetResponse(widget);
        expect(result.id).toBe('widget-1');
        expect(result.type).toBe('STUDY_OVERVIEW');
        expect(result.visible).toBe(true);
      });

      it('null에 대해 null을 반환해야 함', () => {
        expect(formatWidgetResponse(null)).toBe(null);
      });
    });

    describe('formatWidgetsListResponse', () => {
      it('위젯 배열을 포맷해야 함', () => {
        const widgets = [
          { id: 'w1', type: 'STUDY_OVERVIEW' },
          { id: 'w2', type: 'TASK_SUMMARY' }
        ];
        
        const result = formatWidgetsListResponse(widgets);
        expect(result.length).toBe(2);
        expect(result[0].id).toBe('w1');
      });

      it('null/undefined에 대해 빈 배열을 반환해야 함', () => {
        expect(formatWidgetsListResponse(null)).toEqual([]);
        expect(formatWidgetsListResponse(undefined)).toEqual([]);
      });
    });

    describe('createPaginatedResponse', () => {
      it('페이지네이션 응답을 생성해야 함', () => {
        const data = [1, 2, 3];
        const result = createPaginatedResponse(data, 1, 10, 25);
        
        expect(result.data).toEqual([1, 2, 3]);
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.limit).toBe(10);
        expect(result.pagination.total).toBe(25);
        expect(result.pagination.totalPages).toBe(3);
        expect(result.pagination.hasNext).toBe(true);
        expect(result.pagination.hasPrev).toBe(false);
      });

      it('마지막 페이지를 올바르게 처리해야 함', () => {
        const result = createPaginatedResponse([], 3, 10, 25);
        
        expect(result.pagination.hasNext).toBe(false);
        expect(result.pagination.hasPrev).toBe(true);
      });
    });

    describe('createSuccessResponse', () => {
      it('성공 응답을 생성해야 함', () => {
        const result = createSuccessResponse({ data: 'test' }, '조회 성공');
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('조회 성공');
        expect(result.data).toBe('test');
      });

      it('기본 메시지를 사용해야 함', () => {
        const result = createSuccessResponse({});
        expect(result.message).toBe('성공');
      });
    });

    describe('createErrorResponse', () => {
      it('DashboardException 에러를 처리해야 함', () => {
        const error = {
          code: 'DASH-001',
          statusCode: 400,
          message: 'Test error',
          userMessage: '사용자 에러 메시지'
        };
        
        const result = createErrorResponse(error);
        expect(result.success).toBe(false);
        expect(result.error).toBe('사용자 에러 메시지');
        expect(result.code).toBe('DASH-001');
      });

      it('일반 에러를 처리해야 함', () => {
        const error = { message: '일반 에러' };
        
        const result = createErrorResponse(error);
        expect(result.success).toBe(false);
        expect(result.error).toBe('일반 에러');
        expect(result.statusCode).toBe(500);
      });
    });
  });

  // ============================================
  // 9. 권한 확인 함수 테스트
  // ============================================

  describe('권한 확인 함수', () => {
    describe('checkDashboardAccess', () => {
      it('같은 사용자면 true를 반환해야 함', () => {
        expect(checkDashboardAccess('user-123', 'user-123')).toBe(true);
      });

      it('다른 사용자면 에러를 발생시켜야 함', () => {
        expect(() => checkDashboardAccess('user-123', 'user-456')).toThrow(DashboardPermissionException);
      });
    });
  });

  // ============================================
  // 10. 상수 테스트
  // ============================================

  describe('상수', () => {
    it('DASHBOARD_HELPER_VERSION이 정의되어야 함', () => {
      expect(DASHBOARD_HELPER_VERSION).toBeDefined();
      expect(typeof DASHBOARD_HELPER_VERSION).toBe('string');
    });
  });
});
