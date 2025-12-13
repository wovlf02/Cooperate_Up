/**
 * Dashboard 비즈니스 로직 예외 클래스
 *
 * @description
 * 대시보드 비즈니스 로직 관련 예외
 * 20개의 에러 코드 (DASH-BIZ-001 ~ DASH-BIZ-020)
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-04
 */

import DashboardException from './DashboardException.js';

export default class DashboardBusinessException extends DashboardException {
  constructor(message, code, statusCode = 400, context = {}) {
    super(message, code, statusCode, 'medium', context);
    this.name = 'DashboardBusinessException';
  }

  // ========================================
  // 데이터 조회 실패 (6개)
  // ========================================

  static dashboardDataNotFound(userId) {
    return new DashboardBusinessException(
      '대시보드 데이터를 찾을 수 없습니다.',
      'DASH-BIZ-001',
      404,
      { type: 'data', subtype: 'not_found', userId }
    );
  }

  static studyStatisticsNotFound(studyId) {
    return new DashboardBusinessException(
      '스터디 통계를 찾을 수 없습니다.',
      'DASH-BIZ-002',
      404,
      { type: 'statistics', subtype: 'study_not_found', studyId }
    );
  }

  static taskStatisticsNotFound(userId) {
    return new DashboardBusinessException(
      '할일 통계를 찾을 수 없습니다.',
      'DASH-BIZ-003',
      404,
      { type: 'statistics', subtype: 'task_not_found', userId }
    );
  }

  static noRecentActivities() {
    return new DashboardBusinessException(
      '최근 활동 내역이 없습니다.',
      'DASH-BIZ-004',
      404,
      { type: 'activities', subtype: 'no_data' }
    );
  }

  static noUpcomingSchedules() {
    return new DashboardBusinessException(
      '예정된 일정이 없습니다.',
      'DASH-BIZ-005',
      404,
      { type: 'schedules', subtype: 'no_data' }
    );
  }

  static userNotFound(userId) {
    return new DashboardBusinessException(
      '사용자를 찾을 수 없습니다.',
      'DASH-BIZ-006',
      404,
      { type: 'user', subtype: 'not_found', userId }
    );
  }

  // ========================================
  // 위젯 관련 (6개)
  // ========================================

  static widgetNotFound(widgetId) {
    return new DashboardBusinessException(
      '위젯을 찾을 수 없습니다.',
      'DASH-BIZ-007',
      404,
      { type: 'widget', subtype: 'not_found', widgetId }
    );
  }

  static widgetCreationFailed(reason) {
    return new DashboardBusinessException(
      `위젯 생성에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-BIZ-008',
      500,
      { type: 'widget', subtype: 'creation_failed', reason }
    );
  }

  static widgetUpdateFailed(widgetId, reason) {
    return new DashboardBusinessException(
      `위젯 업데이트에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-BIZ-009',
      500,
      { type: 'widget', subtype: 'update_failed', widgetId, reason }
    );
  }

  static widgetDeletionFailed(widgetId, reason) {
    return new DashboardBusinessException(
      `위젯 삭제에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-BIZ-010',
      500,
      { type: 'widget', subtype: 'deletion_failed', widgetId, reason }
    );
  }

  static duplicateWidget(widgetType) {
    return new DashboardBusinessException(
      `이미 동일한 유형의 위젯이 존재합니다: ${widgetType}`,
      'DASH-BIZ-011',
      409,
      { type: 'widget', subtype: 'duplicate', widgetType }
    );
  }

  static maxWidgetsReached(maxWidgets = 10) {
    return new DashboardBusinessException(
      `위젯은 최대 ${maxWidgets}개까지 추가할 수 있습니다.`,
      'DASH-BIZ-012',
      400,
      { type: 'widget', subtype: 'max_reached', maxWidgets }
    );
  }

  // ========================================
  // 통계 계산 관련 (4개)
  // ========================================

  static statisticsCalculationFailed(type, reason) {
    return new DashboardBusinessException(
      `${type} 통계 계산에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-BIZ-013',
      500,
      { type: 'statistics', subtype: 'calculation_failed', statisticsType: type, reason }
    );
  }

  static insufficientDataForStatistics(type) {
    return new DashboardBusinessException(
      `${type} 통계를 계산하기에 데이터가 부족합니다.`,
      'DASH-BIZ-014',
      400,
      { type: 'statistics', subtype: 'insufficient_data', statisticsType: type }
    );
  }

  static statisticsAggregationFailed(reason) {
    return new DashboardBusinessException(
      `통계 집계에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-BIZ-015',
      500,
      { type: 'statistics', subtype: 'aggregation_failed', reason }
    );
  }

  static cacheInvalidationFailed(reason) {
    return new DashboardBusinessException(
      `캐시 무효화에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-BIZ-016',
      500,
      { type: 'cache', subtype: 'invalidation_failed', reason }
    );
  }

  // ========================================
  // 시스템 관련 (4개)
  // ========================================

  static databaseError(operation, details) {
    return new DashboardBusinessException(
      '데이터베이스 오류가 발생했습니다.',
      'DASH-BIZ-017',
      500,
      { type: 'system', subtype: 'database_error', operation, details }
    );
  }

  static externalServiceError(service, details) {
    return new DashboardBusinessException(
      `외부 서비스 오류가 발생했습니다: ${service}`,
      'DASH-BIZ-018',
      502,
      { type: 'system', subtype: 'external_service_error', service, details }
    );
  }

  static rateLimitExceeded(limit) {
    return new DashboardBusinessException(
      '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      'DASH-BIZ-019',
      429,
      { type: 'system', subtype: 'rate_limit', limit }
    );
  }

  static unexpectedError(message) {
    return new DashboardBusinessException(
      message || '예상치 못한 오류가 발생했습니다.',
      'DASH-BIZ-020',
      500,
      { type: 'system', subtype: 'unexpected' }
    );
  }
}
