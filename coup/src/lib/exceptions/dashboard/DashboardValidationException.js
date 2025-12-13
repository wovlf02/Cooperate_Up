/**
 * Dashboard 유효성 검증 예외 클래스
 *
 * @description
 * 대시보드 유효성 검증 실패 시 발생하는 예외
 * 15개의 에러 코드 (DASH-VAL-001 ~ DASH-VAL-015)
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-04
 */

import DashboardException from './DashboardException.js';

export default class DashboardValidationException extends DashboardException {
  constructor(message, code, statusCode = 400, context = {}) {
    super(message, code, statusCode, 'medium', context);
    this.name = 'DashboardValidationException';
  }

  // ========================================
  // 날짜/시간 검증 (5개)
  // ========================================

  static dateRequired(field = 'date') {
    return new DashboardValidationException(
      `${field}을(를) 입력해주세요.`,
      'DASH-VAL-001',
      400,
      { field, type: 'required' }
    );
  }

  static invalidDateFormat(date) {
    return new DashboardValidationException(
      `날짜 형식이 올바르지 않습니다: ${date}. YYYY-MM-DD 형식으로 입력해주세요.`,
      'DASH-VAL-002',
      400,
      { field: 'date', type: 'format', value: date }
    );
  }

  static invalidDateRange(startDate, endDate) {
    return new DashboardValidationException(
      '시작일은 종료일보다 이전이어야 합니다.',
      'DASH-VAL-003',
      400,
      { field: 'dateRange', type: 'invalid', startDate, endDate }
    );
  }

  static dateRangeTooLarge(days, maxDays = 365) {
    return new DashboardValidationException(
      `날짜 범위가 너무 깁니다. 최대 ${maxDays}일까지 조회 가능합니다.`,
      'DASH-VAL-004',
      400,
      { field: 'dateRange', type: 'too_large', days, maxDays }
    );
  }

  static futureDateNotAllowed(date) {
    return new DashboardValidationException(
      '미래 날짜는 선택할 수 없습니다.',
      'DASH-VAL-005',
      400,
      { field: 'date', type: 'future_not_allowed', value: date }
    );
  }

  // ========================================
  // 위젯 검증 (5개)
  // ========================================

  static widgetTypeRequired() {
    return new DashboardValidationException(
      '위젯 타입을 선택해주세요.',
      'DASH-VAL-006',
      400,
      { field: 'widgetType', type: 'required' }
    );
  }

  static invalidWidgetType(type, validTypes = []) {
    return new DashboardValidationException(
      `'${type}'은(는) 지원하지 않는 위젯 타입입니다.`,
      'DASH-VAL-007',
      400,
      { field: 'widgetType', type: 'invalid', value: type, validTypes }
    );
  }

  static invalidWidgetPosition(position) {
    return new DashboardValidationException(
      '위젯 위치가 올바르지 않습니다.',
      'DASH-VAL-008',
      400,
      { field: 'position', type: 'invalid', value: position }
    );
  }

  static invalidWidgetSize(size) {
    return new DashboardValidationException(
      '위젯 크기가 올바르지 않습니다.',
      'DASH-VAL-009',
      400,
      { field: 'size', type: 'invalid', value: size }
    );
  }

  static widgetConfigInvalid(field, reason) {
    return new DashboardValidationException(
      `위젯 설정 '${field}'이(가) 올바르지 않습니다.${reason ? ` (${reason})` : ''}`,
      'DASH-VAL-010',
      400,
      { field: 'widgetConfig', subfield: field, type: 'invalid', reason }
    );
  }

  // ========================================
  // 통계/필터 검증 (5개)
  // ========================================

  static invalidStatisticsType(type, validTypes = []) {
    return new DashboardValidationException(
      `'${type}'은(는) 지원하지 않는 통계 타입입니다.`,
      'DASH-VAL-011',
      400,
      { field: 'statisticsType', type: 'invalid', value: type, validTypes }
    );
  }

  static invalidPeriodType(type) {
    return new DashboardValidationException(
      `'${type}'은(는) 유효하지 않은 기간 타입입니다.`,
      'DASH-VAL-012',
      400,
      { field: 'periodType', type: 'invalid', value: type }
    );
  }

  static invalidSortOrder(order) {
    return new DashboardValidationException(
      `'${order}'은(는) 유효하지 않은 정렬 순서입니다. 'asc' 또는 'desc'를 사용하세요.`,
      'DASH-VAL-013',
      400,
      { field: 'sortOrder', type: 'invalid', value: order }
    );
  }

  static invalidLimitValue(limit, min = 1, max = 100) {
    return new DashboardValidationException(
      `조회 개수는 ${min} ~ ${max} 사이여야 합니다.`,
      'DASH-VAL-014',
      400,
      { field: 'limit', type: 'invalid', value: limit, min, max }
    );
  }

  static invalidPageValue(page) {
    return new DashboardValidationException(
      '페이지 번호는 1 이상이어야 합니다.',
      'DASH-VAL-015',
      400,
      { field: 'page', type: 'invalid', value: page }
    );
  }
}
