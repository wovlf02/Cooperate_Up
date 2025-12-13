/**
 * Notification Validation Exception
 *
 * @description
 * 알림 데이터 검증 관련 예외 클래스
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-03
 */

import NotificationException from './NotificationException.js';

export default class NotificationValidationException extends NotificationException {
  constructor(message, code, statusCode = 400, context = {}) {
    super(message, code, statusCode, 'medium', { ...context, type: 'validation' });
    this.name = 'NotificationValidationException';
  }

  // ========================================
  // 알림 타입 검증
  // ========================================

  static typeRequired() {
    return new NotificationValidationException(
      '알림 타입을 입력해주세요.',
      'NOTI-VAL-001',
      400,
      { field: 'type', subtype: 'required' }
    );
  }

  static invalidType(type, validTypes = []) {
    return new NotificationValidationException(
      `'${type}'은(는) 유효하지 않은 알림 타입입니다.${validTypes.length > 0 ? ` 가능한 값: ${validTypes.join(', ')}` : ''}`,
      'NOTI-VAL-002',
      400,
      { field: 'type', subtype: 'invalid', value: type, validTypes }
    );
  }

  // ========================================
  // 메시지 검증
  // ========================================

  static messageRequired() {
    return new NotificationValidationException(
      '알림 메시지를 입력해주세요.',
      'NOTI-VAL-003',
      400,
      { field: 'message', subtype: 'required' }
    );
  }

  static messageTooShort(minLength = 1) {
    return new NotificationValidationException(
      `알림 메시지는 최소 ${minLength}자 이상이어야 합니다.`,
      'NOTI-VAL-004',
      400,
      { field: 'message', subtype: 'too_short', minLength }
    );
  }

  static messageTooLong(maxLength = 500) {
    return new NotificationValidationException(
      `알림 메시지는 최대 ${maxLength}자까지 가능합니다.`,
      'NOTI-VAL-005',
      400,
      { field: 'message', subtype: 'too_long', maxLength }
    );
  }

  // ========================================
  // 사용자 ID 검증
  // ========================================

  static userIdRequired() {
    return new NotificationValidationException(
      '사용자 ID를 입력해주세요.',
      'NOTI-VAL-006',
      400,
      { field: 'userId', subtype: 'required' }
    );
  }

  static invalidUserId(userId) {
    return new NotificationValidationException(
      `유효하지 않은 사용자 ID입니다: ${userId}`,
      'NOTI-VAL-007',
      400,
      { field: 'userId', subtype: 'invalid', value: userId }
    );
  }

  // ========================================
  // 알림 ID 검증
  // ========================================

  static notificationIdRequired() {
    return new NotificationValidationException(
      '알림 ID를 입력해주세요.',
      'NOTI-VAL-008',
      400,
      { field: 'notificationId', subtype: 'required' }
    );
  }

  static invalidNotificationId(notificationId) {
    return new NotificationValidationException(
      `유효하지 않은 알림 ID입니다: ${notificationId}`,
      'NOTI-VAL-009',
      400,
      { field: 'notificationId', subtype: 'invalid', value: notificationId }
    );
  }

  // ========================================
  // 데이터 검증
  // ========================================

  static invalidDataFormat() {
    return new NotificationValidationException(
      '알림 데이터 형식이 올바르지 않습니다.',
      'NOTI-VAL-010',
      400,
      { field: 'data', subtype: 'format' }
    );
  }

  static dataTooLarge(maxSize = 10000) {
    return new NotificationValidationException(
      `알림 데이터 크기가 너무 큽니다. 최대 ${maxSize}바이트까지 가능합니다.`,
      'NOTI-VAL-011',
      400,
      { field: 'data', subtype: 'too_large', maxSize }
    );
  }

  // ========================================
  // 페이지네이션 검증
  // ========================================

  static invalidPage(page) {
    return new NotificationValidationException(
      `유효하지 않은 페이지 번호입니다: ${page}`,
      'NOTI-VAL-012',
      400,
      { field: 'page', subtype: 'invalid', value: page }
    );
  }

  static invalidLimit(limit, maxLimit = 100) {
    return new NotificationValidationException(
      `유효하지 않은 limit 값입니다. 1~${maxLimit} 사이의 값을 입력해주세요.`,
      'NOTI-VAL-013',
      400,
      { field: 'limit', subtype: 'invalid', value: limit, maxLimit }
    );
  }

  // ========================================
  // 스터디 관련 검증
  // ========================================

  static invalidStudyId(studyId) {
    return new NotificationValidationException(
      `유효하지 않은 스터디 ID입니다: ${studyId}`,
      'NOTI-VAL-014',
      400,
      { field: 'studyId', subtype: 'invalid', value: studyId }
    );
  }

  static studyNameTooLong(maxLength = 100) {
    return new NotificationValidationException(
      `스터디 이름이 너무 깁니다. 최대 ${maxLength}자까지 가능합니다.`,
      'NOTI-VAL-015',
      400,
      { field: 'studyName', subtype: 'too_long', maxLength }
    );
  }
}
