/**
 * Chat 영역 예외 클래스 (Base)
 *
 * @description
 * 채팅/메시지 관련 모든 예외를 처리하는 Base 클래스
 * 40개의 에러 코드 (CHAT-001 ~ CHAT-040)
 *
 * Prisma Schema 기반:
 * - Message 모델: studyId, userId, content, fileId, readers
 * - 스터디 기반 채팅 시스템
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-04
 */

export default class ChatException extends Error {
  /**
   * @param {string} message - 기본 메시지
   * @param {string} code - 에러 코드
   * @param {number} statusCode - HTTP 상태 코드
   * @param {string} securityLevel - 보안 수준 (critical, high, medium, low)
   * @param {Object} context - 추가 컨텍스트
   */
  constructor(message, code, statusCode = 400, securityLevel = 'medium', context = {}) {
    super(message);

    this.name = 'ChatException';
    this.code = code;
    this.message = message;
    this.userMessage = message;
    this.devMessage = message;
    this.statusCode = statusCode;
    this.securityLevel = securityLevel;
    this.domain = 'CHAT';
    this.retryable = false;
    this.timestamp = new Date().toISOString();
    this.context = context;
    this.category = context.type || 'general';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ChatException);
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

  /**
   * 사용자 친화적인 에러 메시지 반환
   */
  getUserFriendlyMessage() {
    return this.userMessage;
  }

  /**
   * 개발자용 상세 메시지 반환
   */
  getDeveloperMessage() {
    return `[${this.code}] ${this.devMessage}`;
  }

  /**
   * 에러 로깅용 포맷
   */
  toLogFormat() {
    return {
      timestamp: this.timestamp,
      code: this.code,
      category: this.category,
      message: this.devMessage,
      context: this.context,
      stack: this.stack,
    };
  }

  // ========================================
  // A. Validation Exceptions (15개)
  // ========================================

  // 메시지 내용 검증 (4개)
  static contentRequired() {
    return new ChatException(
      '메시지 내용을 입력해주세요.',
      'CHAT-001',
      400,
      'medium',
      { field: 'content', type: 'required' }
    );
  }

  static contentTooShort(minLength = 1) {
    return new ChatException(
      `메시지는 최소 ${minLength}자 이상이어야 합니다.`,
      'CHAT-002',
      400,
      'medium',
      { field: 'content', type: 'length', minLength }
    );
  }

  static contentTooLong(maxLength = 5000) {
    return new ChatException(
      `메시지는 최대 ${maxLength}자까지 가능합니다.`,
      'CHAT-003',
      400,
      'medium',
      { field: 'content', type: 'length', maxLength }
    );
  }

  static contentInvalidContent() {
    return new ChatException(
      '메시지에 허용되지 않는 내용이 포함되어 있습니다.',
      'CHAT-004',
      400,
      'medium',
      { field: 'content', type: 'content' }
    );
  }

  // 사용자 ID 검증 (3개)
  static userIdRequired() {
    return new ChatException(
      '사용자 ID를 입력해주세요.',
      'CHAT-005',
      400,
      'medium',
      { field: 'userId', type: 'required' }
    );
  }

  static invalidUserId(userId) {
    return new ChatException(
      `유효하지 않은 사용자 ID입니다: ${userId}`,
      'CHAT-006',
      400,
      'medium',
      { field: 'userId', type: 'invalid', value: userId }
    );
  }

  static userNotFound(userId) {
    return new ChatException(
      '사용자를 찾을 수 없습니다.',
      'CHAT-007',
      404,
      'medium',
      { field: 'userId', type: 'not_found', value: userId }
    );
  }

  // 스터디 ID 검증 (3개)
  static studyIdRequired() {
    return new ChatException(
      '스터디 ID를 입력해주세요.',
      'CHAT-008',
      400,
      'medium',
      { field: 'studyId', type: 'required' }
    );
  }

  static invalidStudyId(studyId) {
    return new ChatException(
      `유효하지 않은 스터디 ID입니다: ${studyId}`,
      'CHAT-009',
      400,
      'medium',
      { field: 'studyId', type: 'invalid', value: studyId }
    );
  }

  static studyNotFound(studyId) {
    return new ChatException(
      '스터디를 찾을 수 없습니다.',
      'CHAT-010',
      404,
      'medium',
      { field: 'studyId', type: 'not_found', value: studyId }
    );
  }

  // 메시지 ID 검증 (3개)
  static messageIdRequired() {
    return new ChatException(
      '메시지 ID를 입력해주세요.',
      'CHAT-011',
      400,
      'medium',
      { field: 'messageId', type: 'required' }
    );
  }

  static invalidMessageId(messageId) {
    return new ChatException(
      `유효하지 않은 메시지 ID입니다: ${messageId}`,
      'CHAT-012',
      400,
      'medium',
      { field: 'messageId', type: 'invalid', value: messageId }
    );
  }

  // 페이지네이션 검증 (2개)
  static invalidPaginationParams(message) {
    return new ChatException(
      message || '페이지네이션 파라미터가 올바르지 않습니다.',
      'CHAT-013',
      400,
      'low',
      { field: 'pagination', type: 'invalid' }
    );
  }

  static invalidDataFormat() {
    return new ChatException(
      '메시지 데이터 형식이 올바르지 않습니다.',
      'CHAT-014',
      400,
      'medium',
      { field: 'data', type: 'format' }
    );
  }

  static invalidFileId(fileId) {
    return new ChatException(
      `유효하지 않은 파일 ID입니다: ${fileId}`,
      'CHAT-015',
      400,
      'medium',
      { field: 'fileId', type: 'invalid', value: fileId }
    );
  }

  // ========================================
  // B. Permission Exceptions (8개)
  // ========================================

  // 인증 관련 (2개)
  static authenticationRequired() {
    return new ChatException(
      '로그인이 필요합니다.',
      'CHAT-016',
      401,
      'critical',
      { type: 'permission', subtype: 'authentication_required' }
    );
  }

  static sessionExpired() {
    return new ChatException(
      '세션이 만료되었습니다. 다시 로그인해주세요.',
      'CHAT-017',
      401,
      'critical',
      { type: 'permission', subtype: 'session_expired' }
    );
  }

  // 멤버십 관련 (3개)
  static notStudyMember(studyId) {
    return new ChatException(
      '스터디 멤버만 채팅에 참여할 수 있습니다.',
      'CHAT-018',
      403,
      'critical',
      { type: 'permission', subtype: 'not_member', studyId }
    );
  }

  static insufficientPermissionToSend() {
    return new ChatException(
      '메시지를 전송할 권한이 없습니다.',
      'CHAT-019',
      403,
      'critical',
      { type: 'permission', action: 'send' }
    );
  }

  static insufficientPermissionToDelete() {
    return new ChatException(
      '메시지를 삭제할 권한이 없습니다.',
      'CHAT-020',
      403,
      'critical',
      { type: 'permission', action: 'delete' }
    );
  }

  // 메시지 소유권 (2개)
  static messageNotOwned(messageId) {
    return new ChatException(
      '본인의 메시지만 수정/삭제할 수 있습니다.',
      'CHAT-021',
      403,
      'critical',
      { type: 'permission', subtype: 'not_owned', messageId }
    );
  }

  static chatBanned(reason) {
    return new ChatException(
      `채팅이 금지된 상태입니다.${reason ? ` 사유: ${reason}` : ''}`,
      'CHAT-022',
      403,
      'critical',
      { type: 'permission', subtype: 'chat_banned', reason }
    );
  }

  // 관리자 권한 (1개)
  static adminPermissionRequired() {
    return new ChatException(
      '관리자 권한이 필요합니다.',
      'CHAT-023',
      403,
      'critical',
      { type: 'permission', subtype: 'admin_required' }
    );
  }

  // ========================================
  // C. Business Logic Exceptions (17개)
  // ========================================

  // 메시지 존재 확인 (3개)
  static messageNotFound(messageId) {
    return new ChatException(
      '메시지를 찾을 수 없습니다.',
      'CHAT-024',
      404,
      'medium',
      { type: 'message', subtype: 'not_found', messageId }
    );
  }

  static messageAlreadyDeleted(messageId) {
    return new ChatException(
      '이미 삭제된 메시지입니다.',
      'CHAT-025',
      404,
      'low',
      { type: 'message', subtype: 'already_deleted', messageId }
    );
  }

  static messageAlreadyRead(messageId) {
    return new ChatException(
      '이미 읽은 메시지입니다.',
      'CHAT-026',
      400,
      'low',
      { type: 'message', subtype: 'already_read', messageId }
    );
  }

  // 메시지 전송 실패 (4개)
  static sendFailed(reason) {
    return new ChatException(
      `메시지 전송에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-027',
      500,
      'high',
      { type: 'message', subtype: 'send_failed', reason }
    );
  }

  static bulkSendFailed(successCount, failCount, reason) {
    return new ChatException(
      `대량 메시지 전송 중 일부 실패 (성공: ${successCount}, 실패: ${failCount})`,
      'CHAT-028',
      500,
      'high',
      { type: 'message', subtype: 'bulk_send_failed', successCount, failCount, reason }
    );
  }

  static duplicateMessage() {
    return new ChatException(
      '동일한 메시지가 이미 존재합니다.',
      'CHAT-029',
      409,
      'low',
      { type: 'message', subtype: 'duplicate' }
    );
  }

  static rateLimitExceeded(limit, period) {
    return new ChatException(
      `메시지 전송 한도를 초과했습니다. ${period}초 후에 다시 시도해주세요.`,
      'CHAT-030',
      429,
      'medium',
      { type: 'message', subtype: 'rate_limit', limit, period }
    );
  }

  // 읽음 처리 실패 (3개)
  static markAsReadFailed(messageId, reason) {
    return new ChatException(
      `메시지 읽음 처리에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-031',
      500,
      'medium',
      { type: 'message', subtype: 'mark_read_failed', messageId, reason }
    );
  }

  static markAllAsReadFailed(reason) {
    return new ChatException(
      `전체 메시지 읽음 처리에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-032',
      500,
      'medium',
      { type: 'message', subtype: 'mark_all_read_failed', reason }
    );
  }

  static noUnreadMessages() {
    return new ChatException(
      '읽지 않은 메시지가 없습니다.',
      'CHAT-033',
      400,
      'low',
      { type: 'message', subtype: 'no_unread' }
    );
  }

  // 삭제 처리 실패 (3개)
  static deletionFailed(messageId, reason) {
    return new ChatException(
      `메시지 삭제에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-034',
      500,
      'medium',
      { type: 'message', subtype: 'deletion_failed', messageId, reason }
    );
  }

  static bulkDeletionFailed(successCount, failCount, reason) {
    return new ChatException(
      `대량 메시지 삭제 중 일부 실패 (성공: ${successCount}, 실패: ${failCount})`,
      'CHAT-035',
      500,
      'medium',
      { type: 'message', subtype: 'bulk_deletion_failed', successCount, failCount, reason }
    );
  }

  static cannotDeleteOldMessage(messageId) {
    return new ChatException(
      '오래된 메시지는 삭제할 수 없습니다.',
      'CHAT-036',
      400,
      'low',
      { type: 'message', subtype: 'cannot_delete_old', messageId }
    );
  }

  // 조회 실패 (4개)
  static listFetchFailed(reason) {
    return new ChatException(
      `메시지 목록 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-037',
      500,
      'medium',
      { type: 'message', subtype: 'list_fetch_failed', reason }
    );
  }

  static unreadCountFetchFailed(reason) {
    return new ChatException(
      `읽지 않은 메시지 수 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-038',
      500,
      'medium',
      { type: 'message', subtype: 'unread_count_failed', reason }
    );
  }

  static databaseError(operation, details) {
    return new ChatException(
      '데이터베이스 오류가 발생했습니다.',
      'CHAT-039',
      500,
      'low',
      { type: 'system', subtype: 'database_error', operation, details }
    );
  }

  static unexpectedError(message) {
    return new ChatException(
      message || '예상치 못한 오류가 발생했습니다.',
      'CHAT-040',
      500,
      'low',
      { type: 'system', subtype: 'unexpected' }
    );
  }
}

