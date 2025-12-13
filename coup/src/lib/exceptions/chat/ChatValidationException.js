/**
 * Chat Validation Exception
 *
 * @description
 * 채팅/메시지 데이터 검증 관련 예외 클래스
 * 15개 에러 코드 (CHAT-VAL-001 ~ CHAT-VAL-015)
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-04
 */

import ChatException from './ChatException.js';

export default class ChatValidationException extends ChatException {
  constructor(message, code, statusCode = 400, context = {}) {
    super(message, code, statusCode, 'medium', { ...context, type: 'validation' });
    this.name = 'ChatValidationException';
  }

  // ========================================
  // 메시지 내용 검증 (5개)
  // ========================================

  static contentRequired() {
    return new ChatValidationException(
      '메시지 내용을 입력해주세요.',
      'CHAT-VAL-001',
      400,
      { field: 'content', subtype: 'required' }
    );
  }

  static contentTooShort(minLength = 1) {
    return new ChatValidationException(
      `메시지는 최소 ${minLength}자 이상이어야 합니다.`,
      'CHAT-VAL-002',
      400,
      { field: 'content', subtype: 'too_short', minLength }
    );
  }

  static contentTooLong(maxLength = 5000) {
    return new ChatValidationException(
      `메시지는 최대 ${maxLength}자까지 가능합니다.`,
      'CHAT-VAL-003',
      400,
      { field: 'content', subtype: 'too_long', maxLength }
    );
  }

  static contentInvalidFormat() {
    return new ChatValidationException(
      '메시지 형식이 올바르지 않습니다.',
      'CHAT-VAL-004',
      400,
      { field: 'content', subtype: 'invalid_format' }
    );
  }

  static contentContainsProhibitedWords() {
    return new ChatValidationException(
      '메시지에 금지된 단어가 포함되어 있습니다.',
      'CHAT-VAL-005',
      400,
      { field: 'content', subtype: 'prohibited_words' }
    );
  }

  // ========================================
  // ID 검증 (4개)
  // ========================================

  static studyIdRequired() {
    return new ChatValidationException(
      '스터디 ID를 입력해주세요.',
      'CHAT-VAL-006',
      400,
      { field: 'studyId', subtype: 'required' }
    );
  }

  static invalidStudyId(studyId) {
    return new ChatValidationException(
      `유효하지 않은 스터디 ID입니다: ${studyId}`,
      'CHAT-VAL-007',
      400,
      { field: 'studyId', subtype: 'invalid', value: studyId }
    );
  }

  static messageIdRequired() {
    return new ChatValidationException(
      '메시지 ID를 입력해주세요.',
      'CHAT-VAL-008',
      400,
      { field: 'messageId', subtype: 'required' }
    );
  }

  static invalidMessageId(messageId) {
    return new ChatValidationException(
      `유효하지 않은 메시지 ID입니다: ${messageId}`,
      'CHAT-VAL-009',
      400,
      { field: 'messageId', subtype: 'invalid', value: messageId }
    );
  }

  // ========================================
  // 사용자 검증 (2개)
  // ========================================

  static userIdRequired() {
    return new ChatValidationException(
      '사용자 ID를 입력해주세요.',
      'CHAT-VAL-010',
      400,
      { field: 'userId', subtype: 'required' }
    );
  }

  static invalidUserId(userId) {
    return new ChatValidationException(
      `유효하지 않은 사용자 ID입니다: ${userId}`,
      'CHAT-VAL-011',
      400,
      { field: 'userId', subtype: 'invalid', value: userId }
    );
  }

  // ========================================
  // 페이지네이션 검증 (2개)
  // ========================================

  static invalidPage(page) {
    return new ChatValidationException(
      `유효하지 않은 페이지 번호입니다: ${page}`,
      'CHAT-VAL-012',
      400,
      { field: 'page', subtype: 'invalid', value: page }
    );
  }

  static invalidLimit(limit, maxLimit = 100) {
    return new ChatValidationException(
      `유효하지 않은 limit 값입니다. 1~${maxLimit} 사이의 값을 입력해주세요.`,
      'CHAT-VAL-013',
      400,
      { field: 'limit', subtype: 'invalid', value: limit, maxLimit }
    );
  }

  // ========================================
  // 파일 검증 (2개)
  // ========================================

  static invalidFileId(fileId) {
    return new ChatValidationException(
      `유효하지 않은 파일 ID입니다: ${fileId}`,
      'CHAT-VAL-014',
      400,
      { field: 'fileId', subtype: 'invalid', value: fileId }
    );
  }

  static invalidFileType(fileType, allowedTypes = []) {
    return new ChatValidationException(
      `지원하지 않는 파일 형식입니다: ${fileType}${allowedTypes.length > 0 ? `. 허용: ${allowedTypes.join(', ')}` : ''}`,
      'CHAT-VAL-015',
      400,
      { field: 'file', subtype: 'invalid_type', value: fileType, allowedTypes }
    );
  }
}
