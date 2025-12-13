/**
 * Notification Business Exception
 *
 * @description
 * 알림 비즈니스 로직 관련 예외 클래스
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-03
 */

import NotificationException from './NotificationException.js';

export default class NotificationBusinessException extends NotificationException {
  constructor(message, code, statusCode = 400, context = {}) {
    super(message, code, statusCode, 'high', { ...context, type: 'business' });
    this.name = 'NotificationBusinessException';
  }

  // ========================================
  // 알림 존재 확인
  // ========================================

  static notificationNotFound(notificationId) {
    return new NotificationBusinessException(
      '알림을 찾을 수 없습니다.',
      'NOTI-BIZ-001',
      404,
      { subtype: 'not_found', notificationId }
    );
  }

  static notificationAlreadyDeleted(notificationId) {
    return new NotificationBusinessException(
      '이미 삭제된 알림입니다.',
      'NOTI-BIZ-002',
      404,
      { subtype: 'already_deleted', notificationId }
    );
  }

  // ========================================
  // 읽음 처리
  // ========================================

  static notificationAlreadyRead(notificationId) {
    return new NotificationBusinessException(
      '이미 읽은 알림입니다.',
      'NOTI-BIZ-003',
      400,
      { subtype: 'already_read', notificationId }
    );
  }

  static markAsReadFailed(notificationId, reason) {
    return new NotificationBusinessException(
      `알림 읽음 처리에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'NOTI-BIZ-004',
      500,
      { subtype: 'mark_read_failed', notificationId, reason }
    );
  }

  static markAllAsReadFailed(reason) {
    return new NotificationBusinessException(
      `전체 알림 읽음 처리에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'NOTI-BIZ-005',
      500,
      { subtype: 'mark_all_read_failed', reason }
    );
  }

  static noUnreadNotifications() {
    return new NotificationBusinessException(
      '읽지 않은 알림이 없습니다.',
      'NOTI-BIZ-006',
      400,
      { subtype: 'no_unread' }
    );
  }

  // ========================================
  // 알림 생성
  // ========================================

  static creationFailed(reason) {
    return new NotificationBusinessException(
      `알림 생성에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'NOTI-BIZ-007',
      500,
      { subtype: 'creation_failed', reason }
    );
  }

  static bulkCreationFailed(successCount, failCount, reason) {
    return new NotificationBusinessException(
      `대량 알림 생성 중 일부 실패 (성공: ${successCount}, 실패: ${failCount})`,
      'NOTI-BIZ-008',
      500,
      { subtype: 'bulk_creation_failed', successCount, failCount, reason }
    );
  }

  static duplicateNotification(type, userId) {
    return new NotificationBusinessException(
      '중복된 알림이 존재합니다.',
      'NOTI-BIZ-009',
      409,
      { subtype: 'duplicate', notificationType: type, userId }
    );
  }

  // ========================================
  // 알림 삭제
  // ========================================

  static deletionFailed(notificationId, reason) {
    return new NotificationBusinessException(
      `알림 삭제에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'NOTI-BIZ-010',
      500,
      { subtype: 'deletion_failed', notificationId, reason }
    );
  }

  static bulkDeletionFailed(successCount, failCount, reason) {
    return new NotificationBusinessException(
      `대량 알림 삭제 중 일부 실패 (성공: ${successCount}, 실패: ${failCount})`,
      'NOTI-BIZ-011',
      500,
      { subtype: 'bulk_deletion_failed', successCount, failCount, reason }
    );
  }

  static cannotDeleteUnreadNotification(notificationId) {
    return new NotificationBusinessException(
      '읽지 않은 알림은 삭제할 수 없습니다.',
      'NOTI-BIZ-012',
      400,
      { subtype: 'cannot_delete_unread', notificationId }
    );
  }

  // ========================================
  // 조회 관련
  // ========================================

  static listFetchFailed(reason) {
    return new NotificationBusinessException(
      `알림 목록 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'NOTI-BIZ-013',
      500,
      { subtype: 'list_fetch_failed', reason }
    );
  }

  static unreadCountFetchFailed(reason) {
    return new NotificationBusinessException(
      `읽지 않은 알림 수 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'NOTI-BIZ-014',
      500,
      { subtype: 'unread_count_failed', reason }
    );
  }

  // ========================================
  // 템플릿 관련
  // ========================================

  static templateNotFound(templateId) {
    return new NotificationBusinessException(
      '알림 템플릿을 찾을 수 없습니다.',
      'NOTI-BIZ-015',
      404,
      { subtype: 'template_not_found', templateId }
    );
  }

  static templateRenderFailed(templateId, reason) {
    return new NotificationBusinessException(
      `알림 템플릿 렌더링에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'NOTI-BIZ-016',
      500,
      { subtype: 'template_render_failed', templateId, reason }
    );
  }

  // ========================================
  // 사용자 관련
  // ========================================

  static userNotFound(userId) {
    return new NotificationBusinessException(
      '사용자를 찾을 수 없습니다.',
      'NOTI-BIZ-017',
      404,
      { subtype: 'user_not_found', userId }
    );
  }

  static studyNotFound(studyId) {
    return new NotificationBusinessException(
      '스터디를 찾을 수 없습니다.',
      'NOTI-BIZ-018',
      404,
      { subtype: 'study_not_found', studyId }
    );
  }

  // ========================================
  // 시스템 오류
  // ========================================

  static databaseError(operation, details) {
    return new NotificationBusinessException(
      '데이터베이스 오류가 발생했습니다.',
      'NOTI-BIZ-019',
      500,
      { subtype: 'database_error', operation, details }
    );
  }

  static unexpectedError(message) {
    return new NotificationBusinessException(
      message || '예상치 못한 오류가 발생했습니다.',
      'NOTI-BIZ-020',
      500,
      { subtype: 'unexpected' }
    );
  }

  // ========================================
  // 추가 비즈니스 로직
  // ========================================

  static rateLimitExceeded(limit, window) {
    return new NotificationBusinessException(
      `알림 전송 제한을 초과했습니다. ${window} 동안 최대 ${limit}개까지 전송 가능합니다.`,
      'NOTI-BIZ-021',
      429,
      { subtype: 'rate_limit_exceeded', limit, window }
    );
  }

  static notificationDisabled(userId) {
    return new NotificationBusinessException(
      '알림이 비활성화되어 있습니다.',
      'NOTI-BIZ-022',
      400,
      { subtype: 'notification_disabled', userId }
    );
  }

  static invalidInput(message) {
    return new NotificationBusinessException(
      message || '유효하지 않은 입력입니다.',
      'NOTI-BIZ-023',
      400,
      { subtype: 'invalid_input' }
    );
  }
}
