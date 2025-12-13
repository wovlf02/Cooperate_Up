/**
 * Notification Permission Exception
 *
 * @description
 * 알림 권한 관련 예외 클래스
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-03
 */

import NotificationException from './NotificationException.js';

export default class NotificationPermissionException extends NotificationException {
  constructor(message, code, statusCode = 403, context = {}) {
    super(message, code, statusCode, 'critical', { ...context, type: 'permission' });
    this.name = 'NotificationPermissionException';
  }

  // ========================================
  // 인증 관련
  // ========================================

  static authenticationRequired() {
    return new NotificationPermissionException(
      '로그인이 필요합니다.',
      'NOTI-PERM-001',
      401,
      { subtype: 'authentication_required' }
    );
  }

  static sessionExpired() {
    return new NotificationPermissionException(
      '세션이 만료되었습니다. 다시 로그인해주세요.',
      'NOTI-PERM-002',
      401,
      { subtype: 'session_expired' }
    );
  }

  static invalidSession() {
    return new NotificationPermissionException(
      '유효하지 않은 세션입니다.',
      'NOTI-PERM-003',
      401,
      { subtype: 'invalid_session' }
    );
  }

  // ========================================
  // 소유권 관련
  // ========================================

  static notificationNotOwned(notificationId) {
    return new NotificationPermissionException(
      '본인의 알림만 조회/수정/삭제할 수 있습니다.',
      'NOTI-PERM-004',
      403,
      { subtype: 'not_owned', notificationId }
    );
  }

  static cannotAccessOthersNotification(notificationId) {
    return new NotificationPermissionException(
      '다른 사용자의 알림에 접근할 수 없습니다.',
      'NOTI-PERM-005',
      403,
      { subtype: 'access_denied', notificationId }
    );
  }

  // ========================================
  // 작업 권한
  // ========================================

  static insufficientPermissionToCreate() {
    return new NotificationPermissionException(
      '알림을 생성할 권한이 없습니다.',
      'NOTI-PERM-006',
      403,
      { action: 'create' }
    );
  }

  static insufficientPermissionToRead() {
    return new NotificationPermissionException(
      '알림을 조회할 권한이 없습니다.',
      'NOTI-PERM-007',
      403,
      { action: 'read' }
    );
  }

  static insufficientPermissionToUpdate() {
    return new NotificationPermissionException(
      '알림을 수정할 권한이 없습니다.',
      'NOTI-PERM-008',
      403,
      { action: 'update' }
    );
  }

  static insufficientPermissionToDelete() {
    return new NotificationPermissionException(
      '알림을 삭제할 권한이 없습니다.',
      'NOTI-PERM-009',
      403,
      { action: 'delete' }
    );
  }

  // ========================================
  // 관리자 권한
  // ========================================

  static adminPermissionRequired() {
    return new NotificationPermissionException(
      '관리자 권한이 필요합니다.',
      'NOTI-PERM-010',
      403,
      { subtype: 'admin_required' }
    );
  }

  static systemNotificationPermissionRequired() {
    return new NotificationPermissionException(
      '시스템 알림을 생성할 권한이 없습니다.',
      'NOTI-PERM-011',
      403,
      { subtype: 'system_notification' }
    );
  }

  static bulkOperationPermissionRequired() {
    return new NotificationPermissionException(
      '대량 알림 작업 권한이 없습니다.',
      'NOTI-PERM-012',
      403,
      { subtype: 'bulk_operation' }
    );
  }

  // ========================================
  // 사용자 상태
  // ========================================

  static userSuspended(userId) {
    return new NotificationPermissionException(
      '정지된 사용자는 알림 기능을 이용할 수 없습니다.',
      'NOTI-PERM-013',
      403,
      { subtype: 'user_suspended', userId }
    );
  }

  static userNotActive(userId) {
    return new NotificationPermissionException(
      '비활성화된 사용자입니다.',
      'NOTI-PERM-014',
      403,
      { subtype: 'user_not_active', userId }
    );
  }
}
