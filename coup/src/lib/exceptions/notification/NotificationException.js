/**
 * Notification 영역 예외 클래스 (Base)
 *
 * @description
 * 알림 관련 모든 예외를 처리하는 Base 클래스
 * 40개의 에러 코드 (NOTI-001 ~ NOTI-040)
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-03
 */

export default class NotificationException extends Error {
  /**
   * @param {string} message - 기본 메시지
   * @param {string} code - 에러 코드
   * @param {number} statusCode - HTTP 상태 코드
   * @param {string} securityLevel - 보안 수준 (critical, high, medium, low)
   * @param {Object} context - 추가 컨텍스트
   */
  constructor(message, code, statusCode = 400, securityLevel = 'medium', context = {}) {
    super(message);

    this.name = 'NotificationException';
    this.code = code;
    this.message = message;
    this.userMessage = message;
    this.devMessage = message;
    this.statusCode = statusCode;
    this.securityLevel = securityLevel;
    this.domain = 'NOTIFICATION';
    this.retryable = false;
    this.timestamp = new Date().toISOString();
    this.context = context;
    this.category = context.type || 'general';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotificationException);
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
  // A. Validation Exceptions (15개)
  // ========================================

  // 알림 타입 검증 (4개)
  static typeRequired() {
    return new NotificationException(
      '알림 타입을 입력해주세요.',
      'NOTI-001',
      400,
      'medium',
      { field: 'type', type: 'required' }
    );
  }

  static invalidType(type) {
    return new NotificationException(
      `'${type}'은(는) 유효하지 않은 알림 타입입니다.`,
      'NOTI-002',
      400,
      'medium',
      { field: 'type', type: 'invalid', value: type }
    );
  }

  static typeNotSupported(type) {
    return new NotificationException(
      `'${type}' 알림 타입은 지원되지 않습니다.`,
      'NOTI-003',
      400,
      'medium',
      { field: 'type', type: 'not_supported', value: type }
    );
  }

  static invalidTypeFormat(type) {
    return new NotificationException(
      `알림 타입 형식이 올바르지 않습니다: ${type}`,
      'NOTI-004',
      400,
      'medium',
      { field: 'type', type: 'format', value: type }
    );
  }

  // 메시지 검증 (4개)
  static messageRequired() {
    return new NotificationException(
      '알림 메시지를 입력해주세요.',
      'NOTI-005',
      400,
      'medium',
      { field: 'message', type: 'required' }
    );
  }

  static messageTooShort(minLength = 1) {
    return new NotificationException(
      `알림 메시지는 최소 ${minLength}자 이상이어야 합니다.`,
      'NOTI-006',
      400,
      'medium',
      { field: 'message', type: 'length', minLength }
    );
  }

  static messageTooLong(maxLength = 500) {
    return new NotificationException(
      `알림 메시지는 최대 ${maxLength}자까지 가능합니다.`,
      'NOTI-007',
      400,
      'medium',
      { field: 'message', type: 'length', maxLength }
    );
  }

  static messageInvalidContent() {
    return new NotificationException(
      '알림 메시지에 허용되지 않는 내용이 포함되어 있습니다.',
      'NOTI-008',
      400,
      'medium',
      { field: 'message', type: 'content' }
    );
  }

  // 사용자 ID 검증 (3개)
  static userIdRequired() {
    return new NotificationException(
      '사용자 ID를 입력해주세요.',
      'NOTI-009',
      400,
      'medium',
      { field: 'userId', type: 'required' }
    );
  }

  static invalidUserId(userId) {
    return new NotificationException(
      `유효하지 않은 사용자 ID입니다: ${userId}`,
      'NOTI-010',
      400,
      'medium',
      { field: 'userId', type: 'invalid', value: userId }
    );
  }

  static userNotFound(userId) {
    return new NotificationException(
      '사용자를 찾을 수 없습니다.',
      'NOTI-011',
      404,
      'medium',
      { field: 'userId', type: 'not_found', value: userId }
    );
  }

  // 알림 ID 검증 (3개)
  static notificationIdRequired() {
    return new NotificationException(
      '알림 ID를 입력해주세요.',
      'NOTI-012',
      400,
      'medium',
      { field: 'notificationId', type: 'required' }
    );
  }

  static invalidNotificationId(notificationId) {
    return new NotificationException(
      `유효하지 않은 알림 ID입니다: ${notificationId}`,
      'NOTI-013',
      400,
      'medium',
      { field: 'notificationId', type: 'invalid', value: notificationId }
    );
  }

  static invalidDataFormat() {
    return new NotificationException(
      '알림 데이터 형식이 올바르지 않습니다.',
      'NOTI-014',
      400,
      'medium',
      { field: 'data', type: 'format' }
    );
  }

  // 기타 검증 (1개)
  static invalidPaginationParams(message) {
    return new NotificationException(
      message || '페이지네이션 파라미터가 올바르지 않습니다.',
      'NOTI-015',
      400,
      'low',
      { field: 'pagination', type: 'invalid' }
    );
  }

  // ========================================
  // B. Permission Exceptions (8개)
  // ========================================

  // 인증 관련 (2개)
  static authenticationRequired() {
    return new NotificationException(
      '로그인이 필요합니다.',
      'NOTI-016',
      401,
      'critical',
      { type: 'permission', subtype: 'authentication_required' }
    );
  }

  static sessionExpired() {
    return new NotificationException(
      '세션이 만료되었습니다. 다시 로그인해주세요.',
      'NOTI-017',
      401,
      'critical',
      { type: 'permission', subtype: 'session_expired' }
    );
  }

  // 소유권 관련 (3개)
  static notificationNotOwned(notificationId) {
    return new NotificationException(
      '본인의 알림만 조회/수정/삭제할 수 있습니다.',
      'NOTI-018',
      403,
      'critical',
      { type: 'permission', subtype: 'not_owned', notificationId }
    );
  }

  static insufficientPermissionToCreate() {
    return new NotificationException(
      '알림을 생성할 권한이 없습니다.',
      'NOTI-019',
      403,
      'critical',
      { type: 'permission', action: 'create' }
    );
  }

  static insufficientPermissionToDelete() {
    return new NotificationException(
      '알림을 삭제할 권한이 없습니다.',
      'NOTI-020',
      403,
      'critical',
      { type: 'permission', action: 'delete' }
    );
  }

  // 관리자 권한 (3개)
  static adminPermissionRequired() {
    return new NotificationException(
      '관리자 권한이 필요합니다.',
      'NOTI-021',
      403,
      'critical',
      { type: 'permission', subtype: 'admin_required' }
    );
  }

  static systemNotificationPermissionRequired() {
    return new NotificationException(
      '시스템 알림을 생성할 권한이 없습니다.',
      'NOTI-022',
      403,
      'critical',
      { type: 'permission', subtype: 'system_notification' }
    );
  }

  static bulkOperationPermissionRequired() {
    return new NotificationException(
      '대량 알림 작업 권한이 없습니다.',
      'NOTI-023',
      403,
      'critical',
      { type: 'permission', subtype: 'bulk_operation' }
    );
  }

  // ========================================
  // C. Business Logic Exceptions (17개)
  // ========================================

  // 알림 존재 확인 (3개)
  static notificationNotFound(notificationId) {
    return new NotificationException(
      '알림을 찾을 수 없습니다.',
      'NOTI-024',
      404,
      'medium',
      { type: 'notification', subtype: 'not_found', notificationId }
    );
  }

  static notificationAlreadyRead(notificationId) {
    return new NotificationException(
      '이미 읽은 알림입니다.',
      'NOTI-025',
      400,
      'low',
      { type: 'notification', subtype: 'already_read', notificationId }
    );
  }

  static notificationAlreadyDeleted(notificationId) {
    return new NotificationException(
      '이미 삭제된 알림입니다.',
      'NOTI-026',
      404,
      'low',
      { type: 'notification', subtype: 'already_deleted', notificationId }
    );
  }

  // 알림 생성 실패 (4개)
  static creationFailed(reason) {
    return new NotificationException(
      `알림 생성에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'NOTI-027',
      500,
      'high',
      { type: 'notification', subtype: 'creation_failed', reason }
    );
  }

  static bulkCreationFailed(successCount, failCount, reason) {
    return new NotificationException(
      `대량 알림 생성 중 일부 실패 (성공: ${successCount}, 실패: ${failCount})`,
      'NOTI-028',
      500,
      'high',
      { type: 'notification', subtype: 'bulk_creation_failed', successCount, failCount, reason }
    );
  }

  static duplicateNotification(type, userId) {
    return new NotificationException(
      '중복된 알림이 존재합니다.',
      'NOTI-029',
      409,
      'low',
      { type: 'notification', subtype: 'duplicate', notificationType: type, userId }
    );
  }

  static templateNotFound(templateId) {
    return new NotificationException(
      '알림 템플릿을 찾을 수 없습니다.',
      'NOTI-030',
      404,
      'medium',
      { type: 'notification', subtype: 'template_not_found', templateId }
    );
  }

  // 읽음 처리 실패 (3개)
  static markAsReadFailed(notificationId, reason) {
    return new NotificationException(
      `알림 읽음 처리에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'NOTI-031',
      500,
      'medium',
      { type: 'notification', subtype: 'mark_read_failed', notificationId, reason }
    );
  }

  static markAllAsReadFailed(reason) {
    return new NotificationException(
      `전체 알림 읽음 처리에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'NOTI-032',
      500,
      'medium',
      { type: 'notification', subtype: 'mark_all_read_failed', reason }
    );
  }

  static noUnreadNotifications() {
    return new NotificationException(
      '읽지 않은 알림이 없습니다.',
      'NOTI-033',
      400,
      'low',
      { type: 'notification', subtype: 'no_unread' }
    );
  }

  // 삭제 처리 실패 (3개)
  static deletionFailed(notificationId, reason) {
    return new NotificationException(
      `알림 삭제에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'NOTI-034',
      500,
      'medium',
      { type: 'notification', subtype: 'deletion_failed', notificationId, reason }
    );
  }

  static bulkDeletionFailed(successCount, failCount, reason) {
    return new NotificationException(
      `대량 알림 삭제 중 일부 실패 (성공: ${successCount}, 실패: ${failCount})`,
      'NOTI-035',
      500,
      'medium',
      { type: 'notification', subtype: 'bulk_deletion_failed', successCount, failCount, reason }
    );
  }

  static cannotDeleteUnreadNotification(notificationId) {
    return new NotificationException(
      '읽지 않은 알림은 삭제할 수 없습니다.',
      'NOTI-036',
      400,
      'low',
      { type: 'notification', subtype: 'cannot_delete_unread', notificationId }
    );
  }

  // 조회 실패 (4개)
  static listFetchFailed(reason) {
    return new NotificationException(
      `알림 목록 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'NOTI-037',
      500,
      'medium',
      { type: 'notification', subtype: 'list_fetch_failed', reason }
    );
  }

  static unreadCountFetchFailed(reason) {
    return new NotificationException(
      `읽지 않은 알림 수 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'NOTI-038',
      500,
      'medium',
      { type: 'notification', subtype: 'unread_count_failed', reason }
    );
  }

  static databaseError(operation, details) {
    return new NotificationException(
      '데이터베이스 오류가 발생했습니다.',
      'NOTI-039',
      500,
      'low',
      { type: 'system', subtype: 'database_error', operation, details }
    );
  }

  static unexpectedError(message) {
    return new NotificationException(
      message || '예상치 못한 오류가 발생했습니다.',
      'NOTI-040',
      500,
      'low',
      { type: 'system', subtype: 'unexpected' }
    );
  }
}
