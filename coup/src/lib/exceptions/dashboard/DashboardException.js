/**
 * Dashboard 영역 예외 클래스 (Base)
 *
 * @description
 * 대시보드 관련 모든 예외를 처리하는 Base 클래스
 * 40개의 에러 코드 (DASH-001 ~ DASH-040)
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-04
 */

export default class DashboardException extends Error {
  /**
   * @param {string} message - 기본 메시지
   * @param {string} code - 에러 코드
   * @param {number} statusCode - HTTP 상태 코드
   * @param {string} securityLevel - 보안 수준 (critical, high, medium, low)
   * @param {Object} context - 추가 컨텍스트
   */
  constructor(message, code, statusCode = 400, securityLevel = 'medium', context = {}) {
    super(message);

    this.name = 'DashboardException';
    this.code = code;
    this.message = message;
    this.userMessage = message;
    this.devMessage = message;
    this.statusCode = statusCode;
    this.securityLevel = securityLevel;
    this.domain = 'DASHBOARD';
    this.retryable = false;
    this.timestamp = new Date().toISOString();
    this.context = context;
    this.category = context.type || 'general';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DashboardException);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      devMessage: this.devMessage,
      statusCode: this.statusCode,
      securityLevel: this.securityLevel,
      domain: this.domain,
      retryable: this.retryable,
      timestamp: this.timestamp,
      context: this.context,
      category: this.category,
    };
  }

  // ========================================
  // A. 인증 관련 (4개)
  // ========================================

  static authenticationRequired() {
    return new DashboardException(
      '로그인이 필요합니다.',
      'DASH-001',
      401,
      'critical',
      { type: 'authentication', subtype: 'required' }
    );
  }

  static sessionExpired() {
    return new DashboardException(
      '세션이 만료되었습니다. 다시 로그인해주세요.',
      'DASH-002',
      401,
      'critical',
      { type: 'authentication', subtype: 'expired' }
    );
  }

  static invalidSession() {
    return new DashboardException(
      '유효하지 않은 세션입니다.',
      'DASH-003',
      401,
      'critical',
      { type: 'authentication', subtype: 'invalid' }
    );
  }

  static tokenExpired() {
    return new DashboardException(
      '인증 토큰이 만료되었습니다.',
      'DASH-004',
      401,
      'critical',
      { type: 'authentication', subtype: 'token_expired' }
    );
  }

  // ========================================
  // B. 사용자 관련 (4개)
  // ========================================

  static userIdRequired() {
    return new DashboardException(
      '사용자 ID가 필요합니다.',
      'DASH-005',
      400,
      'medium',
      { field: 'userId', type: 'required' }
    );
  }

  static invalidUserId(userId) {
    return new DashboardException(
      `유효하지 않은 사용자 ID입니다: ${userId}`,
      'DASH-006',
      400,
      'medium',
      { field: 'userId', type: 'invalid', value: userId }
    );
  }

  static userNotFound(userId) {
    return new DashboardException(
      '사용자를 찾을 수 없습니다.',
      'DASH-007',
      404,
      'medium',
      { field: 'userId', type: 'not_found', value: userId }
    );
  }

  static userSuspended(userId) {
    return new DashboardException(
      '정지된 계정입니다. 관리자에게 문의하세요.',
      'DASH-008',
      403,
      'high',
      { field: 'userId', type: 'suspended', value: userId }
    );
  }

  // ========================================
  // C. 날짜 범위 관련 (6개)
  // ========================================

  static dateRangeRequired() {
    return new DashboardException(
      '날짜 범위를 입력해주세요.',
      'DASH-009',
      400,
      'low',
      { field: 'dateRange', type: 'required' }
    );
  }

  static invalidDateRange(startDate, endDate) {
    return new DashboardException(
      '시작일은 종료일보다 이전이어야 합니다.',
      'DASH-010',
      400,
      'low',
      { field: 'dateRange', type: 'invalid', startDate, endDate }
    );
  }

  static invalidDateFormat(date) {
    return new DashboardException(
      `날짜 형식이 올바르지 않습니다: ${date}`,
      'DASH-011',
      400,
      'low',
      { field: 'date', type: 'format', value: date }
    );
  }

  static dateRangeTooLarge(maxDays = 365) {
    return new DashboardException(
      `날짜 범위는 최대 ${maxDays}일까지 가능합니다.`,
      'DASH-012',
      400,
      'low',
      { field: 'dateRange', type: 'too_large', maxDays }
    );
  }

  static startDateRequired() {
    return new DashboardException(
      '시작 날짜를 입력해주세요.',
      'DASH-013',
      400,
      'low',
      { field: 'startDate', type: 'required' }
    );
  }

  static endDateRequired() {
    return new DashboardException(
      '종료 날짜를 입력해주세요.',
      'DASH-014',
      400,
      'low',
      { field: 'endDate', type: 'required' }
    );
  }

  // ========================================
  // D. 위젯 관련 (8개)
  // ========================================

  static widgetIdRequired() {
    return new DashboardException(
      '위젯 ID가 필요합니다.',
      'DASH-015',
      400,
      'medium',
      { field: 'widgetId', type: 'required' }
    );
  }

  static invalidWidgetId(widgetId) {
    return new DashboardException(
      `유효하지 않은 위젯 ID입니다: ${widgetId}`,
      'DASH-016',
      400,
      'medium',
      { field: 'widgetId', type: 'invalid', value: widgetId }
    );
  }

  static widgetNotFound(widgetId) {
    return new DashboardException(
      '위젯을 찾을 수 없습니다.',
      'DASH-017',
      404,
      'medium',
      { field: 'widgetId', type: 'not_found', value: widgetId }
    );
  }

  static widgetTypeRequired() {
    return new DashboardException(
      '위젯 타입을 입력해주세요.',
      'DASH-018',
      400,
      'medium',
      { field: 'widgetType', type: 'required' }
    );
  }

  static invalidWidgetType(type, validTypes = []) {
    return new DashboardException(
      `'${type}'은(는) 유효하지 않은 위젯 타입입니다.`,
      'DASH-019',
      400,
      'medium',
      { field: 'widgetType', type: 'invalid', value: type, validTypes }
    );
  }

  static widgetConfigRequired() {
    return new DashboardException(
      '위젯 설정이 필요합니다.',
      'DASH-020',
      400,
      'medium',
      { field: 'widgetConfig', type: 'required' }
    );
  }

  static invalidWidgetConfig(reason) {
    return new DashboardException(
      `위젯 설정이 올바르지 않습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-021',
      400,
      'medium',
      { field: 'widgetConfig', type: 'invalid', reason }
    );
  }

  static maxWidgetsExceeded(maxWidgets = 10) {
    return new DashboardException(
      `위젯은 최대 ${maxWidgets}개까지 추가할 수 있습니다.`,
      'DASH-022',
      400,
      'low',
      { field: 'widgets', type: 'limit_exceeded', maxWidgets }
    );
  }

  // ========================================
  // E. 통계 관련 (6개)
  // ========================================

  static statisticsTypeRequired() {
    return new DashboardException(
      '통계 타입을 입력해주세요.',
      'DASH-023',
      400,
      'medium',
      { field: 'statisticsType', type: 'required' }
    );
  }

  static invalidStatisticsType(type) {
    return new DashboardException(
      `'${type}'은(는) 유효하지 않은 통계 타입입니다.`,
      'DASH-024',
      400,
      'medium',
      { field: 'statisticsType', type: 'invalid', value: type }
    );
  }

  static statisticsFetchFailed(type, reason) {
    return new DashboardException(
      `${type} 통계 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-025',
      500,
      'medium',
      { type: 'statistics', subtype: 'fetch_failed', statisticsType: type, reason }
    );
  }

  static noStatisticsData() {
    return new DashboardException(
      '조회할 통계 데이터가 없습니다.',
      'DASH-026',
      404,
      'low',
      { type: 'statistics', subtype: 'no_data' }
    );
  }

  static statisticsCalculationFailed(reason) {
    return new DashboardException(
      `통계 계산에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-027',
      500,
      'medium',
      { type: 'statistics', subtype: 'calculation_failed', reason }
    );
  }

  static invalidAggregationType(type) {
    return new DashboardException(
      `'${type}'은(는) 유효하지 않은 집계 타입입니다.`,
      'DASH-028',
      400,
      'medium',
      { field: 'aggregationType', type: 'invalid', value: type }
    );
  }

  // ========================================
  // F. 대시보드 데이터 관련 (6개)
  // ========================================

  static dashboardDataFetchFailed(reason) {
    return new DashboardException(
      `대시보드 데이터 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-029',
      500,
      'medium',
      { type: 'dashboard', subtype: 'fetch_failed', reason }
    );
  }

  static recentActivitiesFetchFailed(reason) {
    return new DashboardException(
      `최근 활동 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-030',
      500,
      'medium',
      { type: 'dashboard', subtype: 'activities_failed', reason }
    );
  }

  static summaryFetchFailed(reason) {
    return new DashboardException(
      `요약 데이터 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-031',
      500,
      'medium',
      { type: 'dashboard', subtype: 'summary_failed', reason }
    );
  }

  static upcomingSchedulesFetchFailed(reason) {
    return new DashboardException(
      `예정 일정 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-032',
      500,
      'medium',
      { type: 'dashboard', subtype: 'schedules_failed', reason }
    );
  }

  static taskStatisticsFetchFailed(reason) {
    return new DashboardException(
      `할일 통계 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-033',
      500,
      'medium',
      { type: 'dashboard', subtype: 'task_stats_failed', reason }
    );
  }

  static studyStatisticsFetchFailed(reason) {
    return new DashboardException(
      `스터디 통계 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-034',
      500,
      'medium',
      { type: 'dashboard', subtype: 'study_stats_failed', reason }
    );
  }

  // ========================================
  // G. 페이지네이션 및 기타 (6개)
  // ========================================

  static invalidPage(page) {
    return new DashboardException(
      `유효하지 않은 페이지 번호입니다: ${page}`,
      'DASH-035',
      400,
      'low',
      { field: 'page', type: 'invalid', value: page }
    );
  }

  static invalidLimit(limit, maxLimit = 100) {
    return new DashboardException(
      `항목 수는 1 ~ ${maxLimit} 사이여야 합니다.`,
      'DASH-036',
      400,
      'low',
      { field: 'limit', type: 'invalid', value: limit, maxLimit }
    );
  }

  static invalidSortField(field) {
    return new DashboardException(
      `'${field}'은(는) 유효하지 않은 정렬 필드입니다.`,
      'DASH-037',
      400,
      'low',
      { field: 'sortField', type: 'invalid', value: field }
    );
  }

  static databaseError(operation, details) {
    return new DashboardException(
      '데이터베이스 오류가 발생했습니다.',
      'DASH-038',
      500,
      'high',
      { type: 'system', subtype: 'database_error', operation, details }
    );
  }

  static unexpectedError(message) {
    return new DashboardException(
      message || '예상치 못한 오류가 발생했습니다.',
      'DASH-039',
      500,
      'high',
      { type: 'system', subtype: 'unexpected' }
    );
  }

  static serviceUnavailable(service) {
    return new DashboardException(
      `${service || '서비스'}를 일시적으로 사용할 수 없습니다.`,
      'DASH-040',
      503,
      'high',
      { type: 'system', subtype: 'unavailable', service }
    );
  }
}
