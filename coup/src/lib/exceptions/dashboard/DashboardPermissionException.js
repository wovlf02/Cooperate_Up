/**
 * Dashboard 권한 예외 클래스
 *
 * @description
 * 대시보드 접근 권한 관련 예외
 * 12개의 에러 코드 (DASH-PERM-001 ~ DASH-PERM-012)
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-04
 */

import DashboardException from './DashboardException.js';

export default class DashboardPermissionException extends DashboardException {
  constructor(message, code, statusCode = 403, context = {}) {
    super(message, code, statusCode, 'critical', context);
    this.name = 'DashboardPermissionException';
  }

  // ========================================
  // 인증 관련 (4개)
  // ========================================

  static authenticationRequired() {
    return new DashboardPermissionException(
      '로그인이 필요합니다.',
      'DASH-PERM-001',
      401,
      { type: 'authentication', subtype: 'required' }
    );
  }

  static sessionExpired() {
    return new DashboardPermissionException(
      '세션이 만료되었습니다. 다시 로그인해주세요.',
      'DASH-PERM-002',
      401,
      { type: 'authentication', subtype: 'expired' }
    );
  }

  static invalidSession() {
    return new DashboardPermissionException(
      '유효하지 않은 세션입니다.',
      'DASH-PERM-003',
      401,
      { type: 'authentication', subtype: 'invalid' }
    );
  }

  static tokenInvalid() {
    return new DashboardPermissionException(
      '유효하지 않은 인증 토큰입니다.',
      'DASH-PERM-004',
      401,
      { type: 'authentication', subtype: 'invalid_token' }
    );
  }

  // ========================================
  // 접근 권한 관련 (4개)
  // ========================================

  static accessDenied(resource) {
    return new DashboardPermissionException(
      `${resource || '리소스'}에 대한 접근 권한이 없습니다.`,
      'DASH-PERM-005',
      403,
      { type: 'access', subtype: 'denied', resource }
    );
  }

  static insufficientPermission(action) {
    return new DashboardPermissionException(
      `${action || '이 작업'}을(를) 수행할 권한이 없습니다.`,
      'DASH-PERM-006',
      403,
      { type: 'permission', subtype: 'insufficient', action }
    );
  }

  static dashboardNotOwned(dashboardId) {
    return new DashboardPermissionException(
      '본인의 대시보드만 수정할 수 있습니다.',
      'DASH-PERM-007',
      403,
      { type: 'ownership', subtype: 'not_owned', dashboardId }
    );
  }

  static widgetNotOwned(widgetId) {
    return new DashboardPermissionException(
      '본인의 위젯만 수정할 수 있습니다.',
      'DASH-PERM-008',
      403,
      { type: 'ownership', subtype: 'not_owned', widgetId }
    );
  }

  // ========================================
  // 데이터 접근 권한 (4개)
  // ========================================

  static studyStatisticsAccessDenied(studyId) {
    return new DashboardPermissionException(
      '해당 스터디 통계에 접근할 권한이 없습니다.',
      'DASH-PERM-009',
      403,
      { type: 'data', subtype: 'study_stats_denied', studyId }
    );
  }

  static otherUserDataAccessDenied(userId) {
    return new DashboardPermissionException(
      '다른 사용자의 데이터에 접근할 수 없습니다.',
      'DASH-PERM-010',
      403,
      { type: 'data', subtype: 'other_user_denied', userId }
    );
  }

  static adminOnlyAccess() {
    return new DashboardPermissionException(
      '관리자만 접근할 수 있습니다.',
      'DASH-PERM-011',
      403,
      { type: 'permission', subtype: 'admin_only' }
    );
  }

  static premiumFeatureRequired() {
    return new DashboardPermissionException(
      '이 기능은 프리미엄 회원만 이용할 수 있습니다.',
      'DASH-PERM-012',
      403,
      { type: 'permission', subtype: 'premium_required' }
    );
  }
}
