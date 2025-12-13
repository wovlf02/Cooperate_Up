/**
 * dashboard-validators.test.js
 *
 * Dashboard Validators 테스트
 *
 * @module __tests__/lib/validators/dashboard-validators.test.js
 * @author CoUp Team
 * @created 2025-12-04
 */

import {
  // 상수
  WIDGET_TYPES,
  STATISTICS_TYPES,
  PERIOD_TYPES,
  AGGREGATION_TYPES,
  DASHBOARD_CONSTANTS,
  
  // 날짜/시간 검증 함수
  validateDateFormat,
  validateDateRange,
  validatePeriodType,
  validateNotFutureDate,
  getDateRangeFromPeriodType,
  validateAggregationType,
  
  // 위젯 검증 함수
  validateWidgetType,
  validateWidgetConfig,
  validateWidgetPosition,
  validateWidgetId,
  validateWidgetCreateData,
  validateWidgetSettings,
  
  // 통계 검증 함수
  validateStatisticsType,
  validateStatisticsParams,
  validateStudyIdForStats,
  
  // 페이지네이션 검증 함수
  validatePage,
  validateLimit,
  validateSortOrder,
  
  // 통합 검증 함수
  validateDashboardQueryParams,
  validateRecentActivitiesParams,
  validateUpcomingSchedulesParams,
  
  // 권한 검증 함수
  validateSession,
  validateUserId
} from '@/lib/validators/dashboard-validators';

import {
  DashboardValidationException,
  DashboardPermissionException
} from '@/lib/exceptions/dashboard';

describe('Dashboard Validators', () => {
  // ============================================
  // 1. 날짜/시간 검증 함수 테스트
  // ============================================

  describe('날짜/시간 검증 함수', () => {
    describe('validateDateFormat', () => {
      it('유효한 날짜 문자열을 Date 객체로 반환해야 함', () => {
        const result = validateDateFormat('2025-12-04');
        expect(result instanceof Date).toBe(true);
        expect(result.getFullYear()).toBe(2025);
        expect(result.getMonth()).toBe(11); // 0-indexed
        expect(result.getDate()).toBe(4);
      });

      it('Date 객체를 그대로 반환해야 함', () => {
        const date = new Date('2025-12-04');
        const result = validateDateFormat(date);
        expect(result instanceof Date).toBe(true);
      });

      it('null/undefined일 때 에러를 발생시켜야 함', () => {
        expect(() => validateDateFormat(null)).toThrow(DashboardValidationException);
        expect(() => validateDateFormat(undefined)).toThrow(DashboardValidationException);
      });

      it('유효하지 않은 날짜 형식에서 에러를 발생시켜야 함', () => {
        expect(() => validateDateFormat('invalid-date')).toThrow(DashboardValidationException);
        expect(() => validateDateFormat('12-04-2025')).toThrow(DashboardValidationException);
        expect(() => validateDateFormat('2025/12/04')).toThrow(DashboardValidationException);
      });

      it('유효하지 않은 날짜 값에서 에러를 발생시켜야 함', () => {
        expect(() => validateDateFormat('2025-13-45')).toThrow(DashboardValidationException);
      });
    });

    describe('validateDateRange', () => {
      it('유효한 날짜 범위를 검증해야 함', () => {
        const result = validateDateRange('2025-01-01', '2025-12-31');
        
        expect(result.startDate instanceof Date).toBe(true);
        expect(result.endDate instanceof Date).toBe(true);
        expect(result.diffDays).toBeDefined();
      });

      it('시작일이 종료일보다 늦으면 에러를 발생시켜야 함', () => {
        expect(() => validateDateRange('2025-12-31', '2025-01-01')).toThrow(DashboardValidationException);
      });

      it('같은 날짜는 허용해야 함', () => {
        const result = validateDateRange('2025-12-04', '2025-12-04');
        expect(result.diffDays).toBe(0);
      });

      it('날짜 범위가 최대값(365일)을 초과하면 에러를 발생시켜야 함', () => {
        expect(() => validateDateRange('2020-01-01', '2025-12-31')).toThrow(DashboardValidationException);
      });
    });

    describe('validatePeriodType', () => {
      it('유효한 기간 타입을 검증해야 함', () => {
        expect(validatePeriodType('TODAY')).toBe('TODAY');
        expect(validatePeriodType('THIS_WEEK')).toBe('THIS_WEEK');
        expect(validatePeriodType('THIS_MONTH')).toBe('THIS_MONTH');
        expect(validatePeriodType('THIS_YEAR')).toBe('THIS_YEAR');
        expect(validatePeriodType('CUSTOM')).toBe('CUSTOM');
      });

      it('소문자를 대문자로 변환해야 함', () => {
        expect(validatePeriodType('today')).toBe('TODAY');
        expect(validatePeriodType('this_week')).toBe('THIS_WEEK');
      });

      it('null/undefined일 때 기본값 THIS_WEEK을 반환해야 함', () => {
        expect(validatePeriodType(null)).toBe('THIS_WEEK');
        expect(validatePeriodType(undefined)).toBe('THIS_WEEK');
      });

      it('유효하지 않은 기간 타입에서 에러를 발생시켜야 함', () => {
        expect(() => validatePeriodType('INVALID_PERIOD')).toThrow(DashboardValidationException);
      });
    });

    describe('validateNotFutureDate', () => {
      it('과거 날짜를 허용해야 함', () => {
        const pastDate = '2020-01-01';
        const result = validateNotFutureDate(pastDate);
        expect(result instanceof Date).toBe(true);
      });

      it('오늘 날짜를 허용해야 함', () => {
        const today = new Date().toISOString().split('T')[0];
        const result = validateNotFutureDate(today);
        expect(result instanceof Date).toBe(true);
      });

      it('미래 날짜에서 에러를 발생시켜야 함', () => {
        const futureDate = '2030-12-31';
        expect(() => validateNotFutureDate(futureDate)).toThrow(DashboardValidationException);
      });
    });

    describe('getDateRangeFromPeriodType', () => {
      it('TODAY 기간에 대한 날짜 범위를 반환해야 함', () => {
        const result = getDateRangeFromPeriodType('TODAY');
        
        expect(result.startDate instanceof Date).toBe(true);
        expect(result.endDate instanceof Date).toBe(true);
        // 시작시간이 00:00:00이어야 함
        expect(result.startDate.getHours()).toBe(0);
        expect(result.startDate.getMinutes()).toBe(0);
      });

      it('THIS_WEEK 기간에 대한 날짜 범위를 반환해야 함', () => {
        const result = getDateRangeFromPeriodType('THIS_WEEK');
        
        expect(result.startDate <= result.endDate).toBe(true);
        expect(result.startDate.getDay()).toBe(0); // 일요일 시작
      });

      it('THIS_MONTH 기간에 대한 날짜 범위를 반환해야 함', () => {
        const result = getDateRangeFromPeriodType('THIS_MONTH');
        
        expect(result.startDate.getDate()).toBe(1); // 월 첫째 날
      });

      it('THIS_YEAR 기간에 대한 날짜 범위를 반환해야 함', () => {
        const result = getDateRangeFromPeriodType('THIS_YEAR');
        
        expect(result.startDate.getMonth()).toBe(0); // 1월
        expect(result.startDate.getDate()).toBe(1);
      });

      it('유효하지 않은 기간일 때 기본값(7일)을 사용해야 함', () => {
        const result = getDateRangeFromPeriodType('INVALID');
        
        expect(result.startDate instanceof Date).toBe(true);
        expect(result.endDate instanceof Date).toBe(true);
      });
    });

    describe('validateAggregationType', () => {
      it('유효한 집계 타입을 검증해야 함', () => {
        expect(validateAggregationType('DAY')).toBe('DAY');
        expect(validateAggregationType('WEEK')).toBe('WEEK');
        expect(validateAggregationType('MONTH')).toBe('MONTH');
        expect(validateAggregationType('YEAR')).toBe('YEAR');
      });

      it('소문자를 대문자로 변환해야 함', () => {
        expect(validateAggregationType('day')).toBe('DAY');
        expect(validateAggregationType('week')).toBe('WEEK');
      });

      it('null/undefined일 때 기본값 DAY를 반환해야 함', () => {
        expect(validateAggregationType(null)).toBe('DAY');
        expect(validateAggregationType(undefined)).toBe('DAY');
      });

      it('유효하지 않은 집계 타입에서 에러를 발생시켜야 함', () => {
        expect(() => validateAggregationType('INVALID')).toThrow(DashboardValidationException);
      });
    });
  });

  // ============================================
  // 2. 위젯 검증 함수 테스트
  // ============================================

  describe('위젯 검증 함수', () => {
    describe('validateWidgetType', () => {
      it('유효한 위젯 타입을 검증해야 함', () => {
        expect(validateWidgetType('STUDY_OVERVIEW')).toBe('STUDY_OVERVIEW');
        expect(validateWidgetType('TASK_SUMMARY')).toBe('TASK_SUMMARY');
        expect(validateWidgetType('RECENT_ACTIVITIES')).toBe('RECENT_ACTIVITIES');
        expect(validateWidgetType('UPCOMING_SCHEDULES')).toBe('UPCOMING_SCHEDULES');
      });

      it('소문자를 대문자로 변환해야 함', () => {
        expect(validateWidgetType('study_overview')).toBe('STUDY_OVERVIEW');
        expect(validateWidgetType('task_summary')).toBe('TASK_SUMMARY');
      });

      it('null/undefined일 때 에러를 발생시켜야 함', () => {
        expect(() => validateWidgetType(null)).toThrow(DashboardValidationException);
        expect(() => validateWidgetType(undefined)).toThrow(DashboardValidationException);
      });

      it('유효하지 않은 위젯 타입에서 에러를 발생시켜야 함', () => {
        expect(() => validateWidgetType('INVALID_TYPE')).toThrow(DashboardValidationException);
      });
    });

    describe('validateWidgetConfig', () => {
      it('빈 객체를 반환해야 함 (빈 입력)', () => {
        expect(validateWidgetConfig({})).toEqual({});
        expect(validateWidgetConfig(null)).toEqual({});
        expect(validateWidgetConfig(undefined)).toEqual({});
      });

      it('position을 검증해야 함', () => {
        const result = validateWidgetConfig({ position: 5 });
        expect(result.position).toBe(5);
      });

      it('음수 position에서 에러를 발생시켜야 함', () => {
        expect(() => validateWidgetConfig({ position: -1 })).toThrow(DashboardValidationException);
      });

      it('size를 검증해야 함', () => {
        expect(validateWidgetConfig({ size: 'small' }).size).toBe('small');
        expect(validateWidgetConfig({ size: 'MEDIUM' }).size).toBe('medium');
        expect(validateWidgetConfig({ size: 'Large' }).size).toBe('large');
      });

      it('유효하지 않은 size에서 에러를 발생시켜야 함', () => {
        expect(() => validateWidgetConfig({ size: 'extra-large' })).toThrow(DashboardValidationException);
      });

      it('visible 속성을 boolean으로 변환해야 함', () => {
        expect(validateWidgetConfig({ visible: true }).visible).toBe(true);
        expect(validateWidgetConfig({ visible: false }).visible).toBe(false);
        expect(validateWidgetConfig({ visible: 1 }).visible).toBe(true);
        expect(validateWidgetConfig({ visible: 0 }).visible).toBe(false);
      });

      it('color 속성을 처리해야 함', () => {
        const result = validateWidgetConfig({ color: 'blue' });
        expect(result.color).toBe('blue');
      });

      it('title 길이를 100자로 제한해야 함', () => {
        const longTitle = 'a'.repeat(200);
        const result = validateWidgetConfig({ title: longTitle });
        expect(result.title.length).toBe(100);
      });
    });

    describe('validateWidgetPosition', () => {
      it('유효한 위치를 반환해야 함', () => {
        expect(validateWidgetPosition(0)).toBe(0);
        expect(validateWidgetPosition(5)).toBe(5);
        expect(validateWidgetPosition(10)).toBe(10);
      });

      it('문자열을 숫자로 변환해야 함', () => {
        expect(validateWidgetPosition('5')).toBe(5);
        expect(validateWidgetPosition('0')).toBe(0);
      });

      it('음수 위치에서 에러를 발생시켜야 함', () => {
        expect(() => validateWidgetPosition(-1)).toThrow(DashboardValidationException);
      });

      it('최대값 초과시 에러를 발생시켜야 함', () => {
        expect(() => validateWidgetPosition(15, 10)).toThrow(DashboardValidationException);
      });

      it('NaN에서 에러를 발생시켜야 함', () => {
        expect(() => validateWidgetPosition('abc')).toThrow(DashboardValidationException);
      });
    });

    describe('validateWidgetId', () => {
      it('유효한 위젯 ID를 반환해야 함', () => {
        expect(validateWidgetId('widget-123')).toBe('widget-123');
      });

      it('공백을 트림해야 함', () => {
        expect(validateWidgetId('  widget-123  ')).toBe('widget-123');
      });

      it('null/undefined에서 에러를 발생시켜야 함', () => {
        expect(() => validateWidgetId(null)).toThrow(DashboardValidationException);
        expect(() => validateWidgetId(undefined)).toThrow(DashboardValidationException);
      });

      it('빈 문자열에서 에러를 발생시켜야 함', () => {
        expect(() => validateWidgetId('')).toThrow(DashboardValidationException);
        expect(() => validateWidgetId('   ')).toThrow(DashboardValidationException);
      });
    });

    describe('validateWidgetCreateData', () => {
      it('유효한 생성 데이터를 검증해야 함', () => {
        const data = { type: 'STUDY_OVERVIEW', config: {} };
        const result = validateWidgetCreateData(data);
        
        expect(result.type).toBe('STUDY_OVERVIEW');
        expect(result.config).toEqual({});
      });

      it('config가 없어도 기본 빈 객체를 생성해야 함', () => {
        const data = { type: 'TASK_SUMMARY' };
        const result = validateWidgetCreateData(data);
        
        expect(result.type).toBe('TASK_SUMMARY');
        expect(result.config).toEqual({});
      });

      it('null/undefined에서 에러를 발생시켜야 함', () => {
        expect(() => validateWidgetCreateData(null)).toThrow(DashboardValidationException);
        expect(() => validateWidgetCreateData(undefined)).toThrow(DashboardValidationException);
      });

      it('타입이 없으면 에러를 발생시켜야 함', () => {
        expect(() => validateWidgetCreateData({})).toThrow(DashboardValidationException);
        expect(() => validateWidgetCreateData({ config: {} })).toThrow(DashboardValidationException);
      });
    });

    describe('validateWidgetSettings', () => {
      it('유효한 위젯 설정을 검증해야 함', () => {
        const settings = {
          widgets: [
            { id: 'w1', type: 'STUDY_OVERVIEW' },
            { id: 'w2', type: 'TASK_SUMMARY' }
          ]
        };
        const result = validateWidgetSettings(settings);
        
        expect(result.widgets.length).toBe(2);
      });

      it('null/undefined에서 에러를 발생시켜야 함', () => {
        expect(() => validateWidgetSettings(null)).toThrow(DashboardValidationException);
        expect(() => validateWidgetSettings(undefined)).toThrow(DashboardValidationException);
      });

      it('widgets가 배열이 아니면 에러를 발생시켜야 함', () => {
        expect(() => validateWidgetSettings({ widgets: 'not-array' })).toThrow(DashboardValidationException);
        expect(() => validateWidgetSettings({ widgets: null })).toThrow(DashboardValidationException);
      });

      it('위젯 수 제한(20개)을 검사해야 함', () => {
        const widgets = Array.from({ length: 25 }, (_, i) => ({ id: `w${i}`, type: 'STUDY_OVERVIEW' }));
        expect(() => validateWidgetSettings({ widgets })).toThrow(DashboardValidationException);
      });

      it('중복 ID를 검사해야 함', () => {
        const settings = {
          widgets: [
            { id: 'same-id', type: 'STUDY_OVERVIEW' },
            { id: 'same-id', type: 'TASK_SUMMARY' }
          ]
        };
        expect(() => validateWidgetSettings(settings)).toThrow(DashboardValidationException);
      });

      it('빈 위젯 배열은 허용해야 함', () => {
        const settings = { widgets: [] };
        const result = validateWidgetSettings(settings);
        expect(result.widgets.length).toBe(0);
      });
    });
  });

  // ============================================
  // 3. 통계 검증 함수 테스트
  // ============================================

  describe('통계 검증 함수', () => {
    describe('validateStatisticsType', () => {
      it('유효한 통계 타입을 검증해야 함', () => {
        expect(validateStatisticsType('STUDY')).toBe('STUDY');
        expect(validateStatisticsType('TASK')).toBe('TASK');
        expect(validateStatisticsType('NOTIFICATION')).toBe('NOTIFICATION');
        expect(validateStatisticsType('ACTIVITY')).toBe('ACTIVITY');
        expect(validateStatisticsType('OVERVIEW')).toBe('OVERVIEW');
      });

      it('소문자를 대문자로 변환해야 함', () => {
        expect(validateStatisticsType('study')).toBe('STUDY');
        expect(validateStatisticsType('task')).toBe('TASK');
      });

      it('null/undefined일 때 기본값 OVERVIEW를 반환해야 함', () => {
        expect(validateStatisticsType(null)).toBe('OVERVIEW');
        expect(validateStatisticsType(undefined)).toBe('OVERVIEW');
      });

      it('유효하지 않은 통계 타입에서 에러를 발생시켜야 함', () => {
        expect(() => validateStatisticsType('INVALID_TYPE')).toThrow(DashboardValidationException);
      });
    });

    describe('validateStatisticsParams', () => {
      it('유효한 통계 파라미터를 검증해야 함', () => {
        const result = validateStatisticsParams({
          type: 'STUDY',
          period: 'THIS_MONTH'
        });
        
        expect(result.type).toBe('STUDY');
        expect(result.period).toBe('THIS_MONTH');
        expect(result.startDate).toBeDefined();
        expect(result.endDate).toBeDefined();
        expect(result.aggregation).toBe('DAY');
      });

      it('기본값을 적용해야 함', () => {
        const result = validateStatisticsParams({});
        
        expect(result.type).toBe('OVERVIEW');
        expect(result.period).toBe('THIS_WEEK');
        expect(result.aggregation).toBe('DAY');
      });

      it('CUSTOM 기간에는 startDate, endDate가 필수여야 함', () => {
        expect(() => validateStatisticsParams({
          type: 'STUDY',
          period: 'CUSTOM'
        })).toThrow(DashboardValidationException);
      });

      it('CUSTOM 기간에 날짜 범위를 제공하면 검증해야 함', () => {
        const result = validateStatisticsParams({
          type: 'STUDY',
          period: 'CUSTOM',
          startDate: '2025-01-01',
          endDate: '2025-03-31'
        });
        
        expect(result.startDate instanceof Date).toBe(true);
        expect(result.endDate instanceof Date).toBe(true);
      });
    });

    describe('validateStudyIdForStats', () => {
      it('유효한 스터디 ID를 검증해야 함', () => {
        expect(validateStudyIdForStats('study-123')).toBe('study-123');
      });

      it('공백을 트림해야 함', () => {
        expect(validateStudyIdForStats('  study-123  ')).toBe('study-123');
      });

      it('null/undefined일 때 null을 반환해야 함', () => {
        expect(validateStudyIdForStats(null)).toBe(null);
        expect(validateStudyIdForStats(undefined)).toBe(null);
      });

      it('빈 문자열에서 에러를 발생시켜야 함', () => {
        expect(() => validateStudyIdForStats('   ')).toThrow(DashboardValidationException);
      });
    });
  });

  // ============================================
  // 4. 페이지네이션 검증 함수 테스트
  // ============================================

  describe('페이지네이션 검증 함수', () => {
    describe('validatePage', () => {
      it('유효한 페이지 번호를 검증해야 함', () => {
        expect(validatePage(1)).toBe(1);
        expect(validatePage(10)).toBe(10);
        expect(validatePage(100)).toBe(100);
      });

      it('문자열을 숫자로 변환해야 함', () => {
        expect(validatePage('5')).toBe(5);
        expect(validatePage('1')).toBe(1);
      });

      it('null/undefined일 때 기본값 1을 반환해야 함', () => {
        expect(validatePage(null)).toBe(1);
        expect(validatePage(undefined)).toBe(1);
      });

      it('0 이하의 값에서 에러를 발생시켜야 함', () => {
        expect(() => validatePage(0)).toThrow(DashboardValidationException);
        expect(() => validatePage(-1)).toThrow(DashboardValidationException);
      });

      it('숫자가 아닌 값에서 에러를 발생시켜야 함', () => {
        expect(() => validatePage('abc')).toThrow(DashboardValidationException);
      });
    });

    describe('validateLimit', () => {
      it('유효한 limit 값을 검증해야 함', () => {
        expect(validateLimit(10)).toBe(10);
        expect(validateLimit(50)).toBe(50);
        expect(validateLimit(100)).toBe(100);
      });

      it('문자열을 숫자로 변환해야 함', () => {
        expect(validateLimit('20')).toBe(20);
        expect(validateLimit('50')).toBe(50);
      });

      it('null/undefined일 때 기본값 20을 반환해야 함', () => {
        expect(validateLimit(null)).toBe(20);
        expect(validateLimit(undefined)).toBe(20);
      });

      it('최소값(1) 미만에서 에러를 발생시켜야 함', () => {
        expect(() => validateLimit(0)).toThrow(DashboardValidationException);
        expect(() => validateLimit(-1)).toThrow(DashboardValidationException);
      });

      it('최대값(100) 초과에서 에러를 발생시켜야 함', () => {
        expect(() => validateLimit(101)).toThrow(DashboardValidationException);
        expect(() => validateLimit(200)).toThrow(DashboardValidationException);
      });
    });

    describe('validateSortOrder', () => {
      it('유효한 정렬 순서를 검증해야 함', () => {
        expect(validateSortOrder('asc')).toBe('asc');
        expect(validateSortOrder('desc')).toBe('desc');
        expect(validateSortOrder('ASC')).toBe('asc');
        expect(validateSortOrder('DESC')).toBe('desc');
      });

      it('null/undefined일 때 기본값 desc를 반환해야 함', () => {
        expect(validateSortOrder(null)).toBe('desc');
        expect(validateSortOrder(undefined)).toBe('desc');
      });

      it('유효하지 않은 정렬 순서에서 에러를 발생시켜야 함', () => {
        expect(() => validateSortOrder('invalid')).toThrow(DashboardValidationException);
        expect(() => validateSortOrder('up')).toThrow(DashboardValidationException);
      });
    });
  });

  // ============================================
  // 5. 통합 검증 함수 테스트
  // ============================================

  describe('통합 검증 함수', () => {
    describe('validateDashboardQueryParams', () => {
      it('유효한 대시보드 쿼리 파라미터를 검증해야 함', () => {
        const result = validateDashboardQueryParams({
          page: 2,
          limit: 20,
          period: 'THIS_MONTH',
          sortOrder: 'asc'
        });
        
        expect(result.page).toBe(2);
        expect(result.limit).toBe(20);
        expect(result.period).toBe('THIS_MONTH');
        expect(result.sortOrder).toBe('asc');
        expect(result.startDate).toBeDefined();
        expect(result.endDate).toBeDefined();
      });

      it('기본값을 적용해야 함', () => {
        const result = validateDashboardQueryParams({});
        
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.period).toBe('THIS_WEEK');
        expect(result.sortOrder).toBe('desc');
      });

      it('CUSTOM 기간에 날짜 범위를 적용해야 함', () => {
        const result = validateDashboardQueryParams({
          period: 'CUSTOM',
          startDate: '2025-01-01',
          endDate: '2025-03-31'
        });
        
        expect(result.period).toBe('CUSTOM');
        expect(result.startDate instanceof Date).toBe(true);
        expect(result.endDate instanceof Date).toBe(true);
      });
    });

    describe('validateRecentActivitiesParams', () => {
      it('유효한 최근 활동 파라미터를 검증해야 함', () => {
        const result = validateRecentActivitiesParams({
          limit: 10,
          page: 2
        });
        
        expect(result.limit).toBe(10);
        expect(result.page).toBe(2);
      });

      it('기본값을 적용해야 함', () => {
        const result = validateRecentActivitiesParams({});
        
        expect(result.limit).toBe(20);
        expect(result.page).toBe(1);
      });

      it('활동 타입 필터를 처리해야 함', () => {
        const result = validateRecentActivitiesParams({
          types: ['COMMENT', 'TASK']
        });
        
        expect(result.types).toEqual(['COMMENT', 'TASK']);
      });
    });

    describe('validateUpcomingSchedulesParams', () => {
      it('유효한 예정 일정 파라미터를 검증해야 함', () => {
        const result = validateUpcomingSchedulesParams({
          limit: 5,
          days: 14
        });
        
        expect(result.limit).toBe(5);
        expect(result.days).toBe(14);
      });

      it('기본값을 적용해야 함', () => {
        const result = validateUpcomingSchedulesParams({});
        
        expect(result.limit).toBe(20);
        expect(result.days).toBe(7);
      });

      it('일수가 범위를 벗어나면 기본값 7을 사용해야 함', () => {
        expect(validateUpcomingSchedulesParams({ days: 0 }).days).toBe(7);
        expect(validateUpcomingSchedulesParams({ days: 50 }).days).toBe(7);
        expect(validateUpcomingSchedulesParams({ days: -1 }).days).toBe(7);
      });
    });
  });

  // ============================================
  // 6. 권한 검증 함수 테스트
  // ============================================

  describe('권한 검증 함수', () => {
    describe('validateSession', () => {
      it('유효한 세션에서 사용자 정보를 반환해야 함', () => {
        const session = {
          user: { id: 'user-123', name: 'Test User' }
        };
        const result = validateSession(session);
        
        expect(result.id).toBe('user-123');
        expect(result.name).toBe('Test User');
      });

      it('null/undefined 세션에서 에러를 발생시켜야 함', () => {
        expect(() => validateSession(null)).toThrow(DashboardPermissionException);
        expect(() => validateSession(undefined)).toThrow(DashboardPermissionException);
      });

      it('user가 없는 세션에서 에러를 발생시켜야 함', () => {
        expect(() => validateSession({})).toThrow(DashboardPermissionException);
      });

      it('user.id가 없는 세션에서 에러를 발생시켜야 함', () => {
        expect(() => validateSession({ user: {} })).toThrow(DashboardPermissionException);
        expect(() => validateSession({ user: { name: 'Test' } })).toThrow(DashboardPermissionException);
      });
    });

    describe('validateUserId', () => {
      it('유효한 사용자 ID를 반환해야 함', () => {
        expect(validateUserId('user-123')).toBe('user-123');
      });

      it('공백을 트림해야 함', () => {
        expect(validateUserId('  user-123  ')).toBe('user-123');
      });

      it('null/undefined에서 에러를 발생시켜야 함', () => {
        expect(() => validateUserId(null)).toThrow(DashboardValidationException);
        expect(() => validateUserId(undefined)).toThrow(DashboardValidationException);
      });

      it('빈 문자열에서 에러를 발생시켜야 함', () => {
        expect(() => validateUserId('')).toThrow(DashboardValidationException);
        expect(() => validateUserId('   ')).toThrow(DashboardValidationException);
      });
    });
  });

  // ============================================
  // 7. 상수 테스트
  // ============================================

  describe('상수', () => {
    it('WIDGET_TYPES가 정의되어야 함', () => {
      expect(WIDGET_TYPES).toBeDefined();
      expect(Array.isArray(WIDGET_TYPES)).toBe(true);
      expect(WIDGET_TYPES.length).toBeGreaterThan(0);
      expect(WIDGET_TYPES).toContain('STUDY_OVERVIEW');
      expect(WIDGET_TYPES).toContain('TASK_SUMMARY');
      expect(WIDGET_TYPES).toContain('RECENT_ACTIVITIES');
    });

    it('STATISTICS_TYPES가 정의되어야 함', () => {
      expect(STATISTICS_TYPES).toBeDefined();
      expect(Array.isArray(STATISTICS_TYPES)).toBe(true);
      expect(STATISTICS_TYPES).toContain('STUDY');
      expect(STATISTICS_TYPES).toContain('TASK');
      expect(STATISTICS_TYPES).toContain('OVERVIEW');
    });

    it('PERIOD_TYPES가 정의되어야 함', () => {
      expect(PERIOD_TYPES).toBeDefined();
      expect(Array.isArray(PERIOD_TYPES)).toBe(true);
      expect(PERIOD_TYPES).toContain('TODAY');
      expect(PERIOD_TYPES).toContain('THIS_WEEK');
      expect(PERIOD_TYPES).toContain('THIS_MONTH');
      expect(PERIOD_TYPES).toContain('THIS_YEAR');
      expect(PERIOD_TYPES).toContain('CUSTOM');
    });

    it('AGGREGATION_TYPES가 정의되어야 함', () => {
      expect(AGGREGATION_TYPES).toBeDefined();
      expect(Array.isArray(AGGREGATION_TYPES)).toBe(true);
      expect(AGGREGATION_TYPES).toContain('DAY');
      expect(AGGREGATION_TYPES).toContain('WEEK');
      expect(AGGREGATION_TYPES).toContain('MONTH');
      expect(AGGREGATION_TYPES).toContain('YEAR');
    });

    it('DASHBOARD_CONSTANTS가 정의되어야 함', () => {
      expect(DASHBOARD_CONSTANTS).toBeDefined();
      expect(DASHBOARD_CONSTANTS.PAGE_MIN).toBe(1);
      expect(DASHBOARD_CONSTANTS.LIMIT_MIN).toBe(1);
      expect(DASHBOARD_CONSTANTS.LIMIT_MAX).toBe(100);
      expect(DASHBOARD_CONSTANTS.DEFAULT_LIMIT).toBe(20);
      expect(DASHBOARD_CONSTANTS.MAX_DATE_RANGE_DAYS).toBe(365);
    });
  });
});
