/**
 * dashboard-validators.js
 *
 * Dashboard 도메인의 통합 검증 시스템
 * DashboardException 클래스를 활용한 체계적인 검증
 *
 * @module lib/validators/dashboard-validators
 * @author CoUp Team
 * @created 2025-12-04
 */

import {
  DashboardValidationException,
  DashboardPermissionException,
  DashboardBusinessException
} from '@/lib/exceptions/dashboard';

// ============================================
// 상수 정의
// ============================================

const VALID_WIDGET_TYPES = [
  'STUDY_OVERVIEW',
  'TASK_SUMMARY',
  'NOTIFICATION_COUNT',
  'RECENT_ACTIVITIES',
  'UPCOMING_SCHEDULES',
  'STUDY_STATISTICS',
  'TASK_STATISTICS',
  'PROGRESS_CHART'
];

const VALID_STATISTICS_TYPES = [
  'STUDY',
  'TASK',
  'NOTIFICATION',
  'ACTIVITY',
  'OVERVIEW'
];

const VALID_PERIOD_TYPES = [
  'TODAY',
  'THIS_WEEK',
  'THIS_MONTH',
  'THIS_YEAR',
  'CUSTOM'
];

const VALID_AGGREGATION_TYPES = [
  'DAY',
  'WEEK',
  'MONTH',
  'YEAR'
];

const VALID_SORT_ORDERS = ['asc', 'desc', 'ASC', 'DESC'];

const PAGE_MIN = 1;
const LIMIT_MIN = 1;
const LIMIT_MAX = 100;
const DEFAULT_LIMIT = 20;
const MAX_DATE_RANGE_DAYS = 365;

// ============================================
// 1. 날짜/시간 검증 (6개)
// ============================================

/**
 * 날짜 형식 검증
 *
 * @param {string|Date} date - 검증할 날짜
 * @returns {Date} 검증된 Date 객체
 * @throws {DashboardValidationException}
 *
 * @example
 * validateDateFormat('2025-12-04'); // Date object
 */
export function validateDateFormat(date) {
  if (!date) {
    throw DashboardValidationException.dateRequired();
  }

  let dateObj;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    // YYYY-MM-DD 형식 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw DashboardValidationException.invalidDateFormat(date);
    }
    
    dateObj = new Date(date);
  } else {
    throw DashboardValidationException.invalidDateFormat(date);
  }

  if (isNaN(dateObj.getTime())) {
    throw DashboardValidationException.invalidDateFormat(date);
  }

  return dateObj;
}

/**
 * 날짜 범위 검증
 *
 * @param {string|Date} startDate - 시작 날짜
 * @param {string|Date} endDate - 종료 날짜
 * @returns {Object} 검증된 날짜 범위
 * @throws {DashboardValidationException}
 *
 * @example
 * validateDateRange('2025-01-01', '2025-12-31');
 */
export function validateDateRange(startDate, endDate) {
  const start = validateDateFormat(startDate);
  const end = validateDateFormat(endDate);

  if (start > end) {
    throw DashboardValidationException.invalidDateRange(startDate, endDate);
  }

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > MAX_DATE_RANGE_DAYS) {
    throw DashboardValidationException.dateRangeTooLarge(diffDays, MAX_DATE_RANGE_DAYS);
  }

  return { startDate: start, endDate: end, diffDays };
}

/**
 * 기간 타입 검증
 *
 * @param {string} periodType - 기간 타입
 * @returns {string} 검증된 기간 타입
 * @throws {DashboardValidationException}
 *
 * @example
 * validatePeriodType('THIS_WEEK'); // 'THIS_WEEK'
 */
export function validatePeriodType(periodType) {
  if (!periodType) {
    return 'THIS_WEEK'; // 기본값
  }

  const upperType = periodType.toUpperCase();
  if (!VALID_PERIOD_TYPES.includes(upperType)) {
    throw DashboardValidationException.invalidPeriodType(periodType);
  }

  return upperType;
}

/**
 * 미래 날짜 불허 검증
 *
 * @param {string|Date} date - 검증할 날짜
 * @returns {Date} 검증된 Date 객체
 * @throws {DashboardValidationException}
 *
 * @example
 * validateNotFutureDate('2025-12-04'); // Date object
 */
export function validateNotFutureDate(date) {
  const dateObj = validateDateFormat(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (dateObj > today) {
    throw DashboardValidationException.futureDateNotAllowed(date);
  }

  return dateObj;
}

/**
 * 기간 타입에 따른 날짜 범위 계산
 *
 * @param {string} periodType - 기간 타입
 * @returns {Object} 시작/종료 날짜
 *
 * @example
 * getDateRangeFromPeriodType('THIS_WEEK');
 */
export function getDateRangeFromPeriodType(periodType) {
  const today = new Date();
  const endDate = new Date(today);
  let startDate;

  switch (periodType) {
    case 'TODAY':
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'THIS_WEEK':
      startDate = new Date(today);
      const dayOfWeek = today.getDay();
      startDate.setDate(today.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'THIS_MONTH':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'THIS_YEAR':
      startDate = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7); // 기본 7일
  }

  return { startDate, endDate };
}

/**
 * 집계 타입 검증
 *
 * @param {string} aggregationType - 집계 타입
 * @returns {string} 검증된 집계 타입
 * @throws {DashboardValidationException}
 *
 * @example
 * validateAggregationType('WEEK'); // 'WEEK'
 */
export function validateAggregationType(aggregationType) {
  if (!aggregationType) {
    return 'DAY'; // 기본값
  }

  const upperType = aggregationType.toUpperCase();
  if (!VALID_AGGREGATION_TYPES.includes(upperType)) {
    throw DashboardValidationException.invalidPeriodType(aggregationType);
  }

  return upperType;
}

// ============================================
// 2. 위젯 검증 (5개)
// ============================================

/**
 * 위젯 타입 검증
 *
 * @param {string} widgetType - 위젯 타입
 * @returns {string} 검증된 위젯 타입
 * @throws {DashboardValidationException}
 *
 * @example
 * validateWidgetType('STUDY_OVERVIEW'); // 'STUDY_OVERVIEW'
 */
export function validateWidgetType(widgetType) {
  if (!widgetType) {
    throw DashboardValidationException.widgetTypeRequired();
  }

  const upperType = widgetType.toUpperCase();
  if (!VALID_WIDGET_TYPES.includes(upperType)) {
    throw DashboardValidationException.invalidWidgetType(widgetType, VALID_WIDGET_TYPES);
  }

  return upperType;
}

/**
 * 위젯 설정 검증
 *
 * @param {Object} config - 위젯 설정
 * @returns {Object} 검증된 위젯 설정
 * @throws {DashboardValidationException}
 *
 * @example
 * validateWidgetConfig({ position: 0, size: 'medium' });
 */
export function validateWidgetConfig(config) {
  if (!config || typeof config !== 'object') {
    return {};
  }

  const validated = {};

  // 위치 검증
  if (config.position !== undefined) {
    const pos = parseInt(config.position, 10);
    if (isNaN(pos) || pos < 0) {
      throw DashboardValidationException.invalidWidgetPosition(config.position);
    }
    validated.position = pos;
  }

  // 크기 검증
  if (config.size !== undefined) {
    const validSizes = ['small', 'medium', 'large'];
    if (!validSizes.includes(config.size.toLowerCase())) {
      throw DashboardValidationException.invalidWidgetSize(config.size);
    }
    validated.size = config.size.toLowerCase();
  }

  // 표시 여부
  if (config.visible !== undefined) {
    validated.visible = Boolean(config.visible);
  }

  // 색상
  if (config.color !== undefined) {
    validated.color = config.color;
  }

  // 제목
  if (config.title !== undefined) {
    validated.title = String(config.title).slice(0, 100);
  }

  return validated;
}

/**
 * 위젯 위치 검증
 *
 * @param {number} position - 위젯 위치
 * @param {number} maxPosition - 최대 위치
 * @returns {number} 검증된 위치
 * @throws {DashboardValidationException}
 *
 * @example
 * validateWidgetPosition(0, 10); // 0
 */
export function validateWidgetPosition(position, maxPosition = 10) {
  const pos = parseInt(position, 10);

  if (isNaN(pos) || pos < 0 || pos > maxPosition) {
    throw DashboardValidationException.invalidWidgetPosition(position);
  }

  return pos;
}

/**
 * 위젯 ID 검증
 *
 * @param {string} widgetId - 위젯 ID
 * @returns {string} 검증된 위젯 ID
 * @throws {DashboardValidationException}
 *
 * @example
 * validateWidgetId('widget-123'); // 'widget-123'
 */
export function validateWidgetId(widgetId) {
  if (!widgetId) {
    throw DashboardValidationException.widgetConfigInvalid('widgetId', 'ID가 필요합니다');
  }

  if (typeof widgetId !== 'string' || widgetId.trim().length === 0) {
    throw DashboardValidationException.widgetConfigInvalid('widgetId', '유효하지 않은 ID');
  }

  return widgetId.trim();
}

/**
 * 위젯 생성 데이터 검증
 *
 * @param {Object} data - 위젯 데이터
 * @returns {Object} 검증된 데이터
 * @throws {DashboardValidationException}
 *
 * @example
 * validateWidgetCreateData({ type: 'STUDY_OVERVIEW', config: {} });
 */
export function validateWidgetCreateData(data) {
  if (!data || typeof data !== 'object') {
    throw DashboardValidationException.widgetTypeRequired();
  }

  const validated = {};

  // 타입 필수
  validated.type = validateWidgetType(data.type);

  // 설정 선택
  validated.config = validateWidgetConfig(data.config || {});

  return validated;
}

/**
 * 위젯 설정 전체 검증
 *
 * @param {Object} settings - 위젯 설정
 * @returns {Object} 검증된 설정
 * @throws {DashboardValidationException}
 *
 * @example
 * validateWidgetSettings({ widgets: [...] });
 */
export function validateWidgetSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    throw DashboardValidationException.widgetConfigInvalid('settings', '설정이 필요합니다');
  }

  const { widgets } = settings;

  if (!widgets || !Array.isArray(widgets)) {
    throw DashboardValidationException.widgetConfigInvalid('widgets', '위젯 배열이 필요합니다');
  }

  // 위젯 수 제한 (최대 20개)
  if (widgets.length > 20) {
    throw DashboardValidationException.widgetConfigInvalid('widgets', '위젯은 최대 20개까지 설정 가능합니다');
  }

  // 중복 ID 체크
  const ids = widgets.map(w => w.id).filter(Boolean);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    throw DashboardValidationException.widgetConfigInvalid('widgets', '중복된 위젯 ID가 있습니다');
  }

  return settings;
}

// ============================================
// 3. 통계 검증 (3개)
// ============================================

/**
 * 통계 타입 검증
 *
 * @param {string} statisticsType - 통계 타입
 * @returns {string} 검증된 통계 타입
 * @throws {DashboardValidationException}
 *
 * @example
 * validateStatisticsType('STUDY'); // 'STUDY'
 */
export function validateStatisticsType(statisticsType) {
  if (!statisticsType) {
    return 'OVERVIEW'; // 기본값
  }

  const upperType = statisticsType.toUpperCase();
  if (!VALID_STATISTICS_TYPES.includes(upperType)) {
    throw DashboardValidationException.invalidStatisticsType(statisticsType, VALID_STATISTICS_TYPES);
  }

  return upperType;
}

/**
 * 통계 조회 파라미터 검증
 *
 * @param {Object} params - 조회 파라미터
 * @returns {Object} 검증된 파라미터
 * @throws {DashboardValidationException}
 *
 * @example
 * validateStatisticsParams({ type: 'STUDY', period: 'THIS_MONTH' });
 */
export function validateStatisticsParams(params) {
  const validated = {};

  // 통계 타입
  validated.type = validateStatisticsType(params?.type);

  // 기간 타입
  validated.period = validatePeriodType(params?.period);

  // 날짜 범위 (CUSTOM인 경우)
  if (validated.period === 'CUSTOM') {
    if (params?.startDate && params?.endDate) {
      const range = validateDateRange(params.startDate, params.endDate);
      validated.startDate = range.startDate;
      validated.endDate = range.endDate;
    } else {
      throw DashboardValidationException.dateRequired('startDate/endDate');
    }
  } else {
    const range = getDateRangeFromPeriodType(validated.period);
    validated.startDate = range.startDate;
    validated.endDate = range.endDate;
  }

  // 집계 타입
  validated.aggregation = validateAggregationType(params?.aggregation);

  return validated;
}

/**
 * 스터디 ID 검증 (통계용)
 *
 * @param {string} studyId - 스터디 ID
 * @returns {string|null} 검증된 스터디 ID
 * @throws {DashboardValidationException}
 *
 * @example
 * validateStudyIdForStats('study-123'); // 'study-123'
 */
export function validateStudyIdForStats(studyId) {
  if (!studyId) {
    return null; // 전체 스터디 통계
  }

  if (typeof studyId !== 'string' || studyId.trim().length === 0) {
    throw DashboardValidationException.widgetConfigInvalid('studyId', '유효하지 않은 스터디 ID');
  }

  return studyId.trim();
}

// ============================================
// 4. 페이지네이션 검증 (3개)
// ============================================

/**
 * 페이지 번호 검증
 *
 * @param {number|string} page - 페이지 번호
 * @returns {number} 검증된 페이지 번호
 * @throws {DashboardValidationException}
 *
 * @example
 * validatePage(1); // 1
 */
export function validatePage(page) {
  if (page === undefined || page === null) {
    return 1;
  }

  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum < PAGE_MIN) {
    throw DashboardValidationException.invalidPageValue(page);
  }

  return pageNum;
}

/**
 * 페이지당 항목 수 검증
 *
 * @param {number|string} limit - 항목 수
 * @returns {number} 검증된 항목 수
 * @throws {DashboardValidationException}
 *
 * @example
 * validateLimit(20); // 20
 */
export function validateLimit(limit) {
  if (limit === undefined || limit === null) {
    return DEFAULT_LIMIT;
  }

  const limitNum = parseInt(limit, 10);

  if (isNaN(limitNum) || limitNum < LIMIT_MIN || limitNum > LIMIT_MAX) {
    throw DashboardValidationException.invalidLimitValue(limit, LIMIT_MIN, LIMIT_MAX);
  }

  return limitNum;
}

/**
 * 정렬 순서 검증
 *
 * @param {string} sortOrder - 정렬 순서
 * @returns {string} 검증된 정렬 순서
 * @throws {DashboardValidationException}
 *
 * @example
 * validateSortOrder('desc'); // 'desc'
 */
export function validateSortOrder(sortOrder) {
  if (!sortOrder) {
    return 'desc'; // 기본값
  }

  if (!VALID_SORT_ORDERS.includes(sortOrder)) {
    throw DashboardValidationException.invalidSortOrder(sortOrder);
  }

  return sortOrder.toLowerCase();
}

// ============================================
// 5. 통합 검증 (3개)
// ============================================

/**
 * 대시보드 조회 쿼리 파라미터 검증
 *
 * @param {Object} params - 쿼리 파라미터
 * @returns {Object} 검증된 파라미터
 * @throws {DashboardValidationException}
 *
 * @example
 * validateDashboardQueryParams({ page: 1, limit: 20, period: 'THIS_WEEK' });
 */
export function validateDashboardQueryParams(params) {
  const validated = {};

  // 페이지네이션
  validated.page = validatePage(params?.page);
  validated.limit = validateLimit(params?.limit);

  // 기간
  validated.period = validatePeriodType(params?.period);

  // 날짜 범위
  if (validated.period === 'CUSTOM' && params?.startDate && params?.endDate) {
    const range = validateDateRange(params.startDate, params.endDate);
    validated.startDate = range.startDate;
    validated.endDate = range.endDate;
  } else {
    const range = getDateRangeFromPeriodType(validated.period);
    validated.startDate = range.startDate;
    validated.endDate = range.endDate;
  }

  // 정렬
  validated.sortOrder = validateSortOrder(params?.sortOrder);

  return validated;
}

/**
 * 최근 활동 조회 파라미터 검증
 *
 * @param {Object} params - 조회 파라미터
 * @returns {Object} 검증된 파라미터
 * @throws {DashboardValidationException}
 *
 * @example
 * validateRecentActivitiesParams({ limit: 10 });
 */
export function validateRecentActivitiesParams(params) {
  const validated = {};

  validated.limit = validateLimit(params?.limit);
  validated.page = validatePage(params?.page);

  // 활동 타입 필터 (선택)
  if (params?.types && Array.isArray(params.types)) {
    validated.types = params.types;
  }

  return validated;
}

/**
 * 예정 일정 조회 파라미터 검증
 *
 * @param {Object} params - 조회 파라미터
 * @returns {Object} 검증된 파라미터
 * @throws {DashboardValidationException}
 *
 * @example
 * validateUpcomingSchedulesParams({ limit: 5, days: 7 });
 */
export function validateUpcomingSchedulesParams(params) {
  const validated = {};

  validated.limit = validateLimit(params?.limit);

  // 조회할 일수
  const days = parseInt(params?.days, 10);
  validated.days = isNaN(days) || days < 1 || days > 30 ? 7 : days;

  return validated;
}

// ============================================
// 6. 권한 검증 (2개)
// ============================================

/**
 * 세션 검증
 *
 * @param {Object} session - 세션 객체
 * @returns {Object} 검증된 사용자 정보
 * @throws {DashboardPermissionException}
 *
 * @example
 * const user = validateSession(session);
 */
export function validateSession(session) {
  if (!session) {
    throw DashboardPermissionException.authenticationRequired();
  }

  if (!session.user) {
    throw DashboardPermissionException.invalidSession();
  }

  if (!session.user.id) {
    throw DashboardPermissionException.invalidSession();
  }

  return session.user;
}

/**
 * 사용자 ID 검증
 *
 * @param {string} userId - 사용자 ID
 * @returns {string} 검증된 사용자 ID
 * @throws {DashboardValidationException}
 *
 * @example
 * validateUserId('user-123'); // 'user-123'
 */
export function validateUserId(userId) {
  if (!userId) {
    throw DashboardValidationException.dateRequired('userId');
  }

  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw DashboardValidationException.widgetConfigInvalid('userId', '유효하지 않은 ID');
  }

  return userId.trim();
}

// ============================================
// 상수 Export
// ============================================

export const WIDGET_TYPES = VALID_WIDGET_TYPES;
export const STATISTICS_TYPES = VALID_STATISTICS_TYPES;
export const PERIOD_TYPES = VALID_PERIOD_TYPES;
export const AGGREGATION_TYPES = VALID_AGGREGATION_TYPES;
export const DASHBOARD_CONSTANTS = {
  PAGE_MIN,
  LIMIT_MIN,
  LIMIT_MAX,
  DEFAULT_LIMIT,
  MAX_DATE_RANGE_DAYS
};
