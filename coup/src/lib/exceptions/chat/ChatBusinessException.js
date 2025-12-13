/**
 * Chat Business Exception
 *
 * @description
 * 채팅/메시지 비즈니스 로직 관련 예외 클래스
 * 23개 에러 코드 (CHAT-BIZ-001 ~ CHAT-BIZ-023)
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-04
 */

import ChatException from './ChatException.js';

export default class ChatBusinessException extends ChatException {
  constructor(message, code, statusCode = 400, context = {}) {
    super(message, code, statusCode, 'medium', { ...context, type: 'business' });
    this.name = 'ChatBusinessException';
  }

  // ========================================
  // 메시지 조회 관련 (4개)
  // ========================================

  static messageNotFound(messageId) {
    return new ChatBusinessException(
      '메시지를 찾을 수 없습니다.',
      'CHAT-BIZ-001',
      404,
      { subtype: 'message_not_found', messageId }
    );
  }

  static studyNotFound(studyId) {
    return new ChatBusinessException(
      '스터디를 찾을 수 없습니다.',
      'CHAT-BIZ-002',
      404,
      { subtype: 'study_not_found', studyId }
    );
  }

  static userNotFound(userId) {
    return new ChatBusinessException(
      '사용자를 찾을 수 없습니다.',
      'CHAT-BIZ-003',
      404,
      { subtype: 'user_not_found', userId }
    );
  }

  static fileNotFound(fileId) {
    return new ChatBusinessException(
      '파일을 찾을 수 없습니다.',
      'CHAT-BIZ-004',
      404,
      { subtype: 'file_not_found', fileId }
    );
  }

  // ========================================
  // 메시지 전송 관련 (5개)
  // ========================================

  static sendFailed(reason) {
    return new ChatBusinessException(
      `메시지 전송에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-BIZ-005',
      500,
      { subtype: 'send_failed', reason }
    );
  }

  static duplicateMessage() {
    return new ChatBusinessException(
      '동일한 메시지가 최근에 전송되었습니다.',
      'CHAT-BIZ-006',
      409,
      { subtype: 'duplicate_message' }
    );
  }

  static rateLimitExceeded(limit, period) {
    return new ChatBusinessException(
      `메시지 전송 한도를 초과했습니다. ${period}초 후에 다시 시도해주세요.`,
      'CHAT-BIZ-007',
      429,
      { subtype: 'rate_limit_exceeded', limit, period }
    );
  }

  static messageQueueFull() {
    return new ChatBusinessException(
      '메시지 큐가 가득 찼습니다. 잠시 후 다시 시도해주세요.',
      'CHAT-BIZ-008',
      503,
      { subtype: 'queue_full' }
    );
  }

  static fileSizeTooLarge(maxSize) {
    return new ChatBusinessException(
      `파일 크기가 너무 큽니다. 최대 ${maxSize}MB까지 가능합니다.`,
      'CHAT-BIZ-009',
      400,
      { subtype: 'file_too_large', maxSize }
    );
  }

  // ========================================
  // 읽음 처리 관련 (4개)
  // ========================================

  static alreadyRead(messageId) {
    return new ChatBusinessException(
      '이미 읽은 메시지입니다.',
      'CHAT-BIZ-010',
      400,
      { subtype: 'already_read', messageId }
    );
  }

  static markAsReadFailed(messageId, reason) {
    return new ChatBusinessException(
      `메시지 읽음 처리에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-BIZ-011',
      500,
      { subtype: 'mark_read_failed', messageId, reason }
    );
  }

  static markAllAsReadFailed(reason) {
    return new ChatBusinessException(
      `전체 메시지 읽음 처리에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-BIZ-012',
      500,
      { subtype: 'mark_all_read_failed', reason }
    );
  }

  static noUnreadMessages() {
    return new ChatBusinessException(
      '읽지 않은 메시지가 없습니다.',
      'CHAT-BIZ-013',
      400,
      { subtype: 'no_unread_messages' }
    );
  }

  // ========================================
  // 삭제 관련 (4개)
  // ========================================

  static messageAlreadyDeleted(messageId) {
    return new ChatBusinessException(
      '이미 삭제된 메시지입니다.',
      'CHAT-BIZ-014',
      404,
      { subtype: 'already_deleted', messageId }
    );
  }

  static deletionFailed(messageId, reason) {
    return new ChatBusinessException(
      `메시지 삭제에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-BIZ-015',
      500,
      { subtype: 'deletion_failed', messageId, reason }
    );
  }

  static cannotDeleteOldMessage(messageId, maxAge) {
    return new ChatBusinessException(
      `${maxAge}시간 이상 지난 메시지는 삭제할 수 없습니다.`,
      'CHAT-BIZ-016',
      400,
      { subtype: 'cannot_delete_old', messageId, maxAge }
    );
  }

  static bulkDeletionFailed(successCount, failCount, reason) {
    return new ChatBusinessException(
      `대량 메시지 삭제 중 일부 실패 (성공: ${successCount}, 실패: ${failCount})`,
      'CHAT-BIZ-017',
      500,
      { subtype: 'bulk_deletion_failed', successCount, failCount, reason }
    );
  }

  // ========================================
  // 조회 실패 관련 (3개)
  // ========================================

  static listFetchFailed(reason) {
    return new ChatBusinessException(
      `메시지 목록 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-BIZ-018',
      500,
      { subtype: 'list_fetch_failed', reason }
    );
  }

  static unreadCountFetchFailed(reason) {
    return new ChatBusinessException(
      `읽지 않은 메시지 수 조회에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-BIZ-019',
      500,
      { subtype: 'unread_count_failed', reason }
    );
  }

  static searchFailed(reason) {
    return new ChatBusinessException(
      `메시지 검색에 실패했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-BIZ-020',
      500,
      { subtype: 'search_failed', reason }
    );
  }

  // ========================================
  // 시스템 오류 (3개)
  // ========================================

  static databaseError(operation, details) {
    return new ChatBusinessException(
      '데이터베이스 오류가 발생했습니다.',
      'CHAT-BIZ-021',
      500,
      { subtype: 'database_error', operation, details }
    );
  }

  static connectionError(reason) {
    return new ChatBusinessException(
      `연결 오류가 발생했습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-BIZ-022',
      503,
      { subtype: 'connection_error', reason }
    );
  }

  static unexpectedError(message) {
    return new ChatBusinessException(
      message || '예상치 못한 오류가 발생했습니다.',
      'CHAT-BIZ-023',
      500,
      { subtype: 'unexpected' }
    );
  }
}
