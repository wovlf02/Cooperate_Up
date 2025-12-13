/**
 * notification-validators.js
 *
 * Notification 도메인의 통합 검증 시스템
 * NotificationException 클래스를 활용한 체계적인 검증
 *
 * @module lib/validators/notification-validators
 * @author CoUp Team
 * @created 2025-12-03
 */

import {
  NotificationValidationException,
  NotificationPermissionException,
  NotificationBusinessException
} from '@/lib/exceptions/notification';

// ============================================
// 상수 정의
// ============================================

const VALID_NOTIFICATION_TYPES = [
  'JOIN_APPROVED',
  'NOTICE',
  'FILE',
  'EVENT',
  'TASK',
  'MEMBER',
  'KICK',
  'CHAT'
];

const MESSAGE_MIN_LENGTH = 1;
const MESSAGE_MAX_LENGTH = 500;
const DATA_MAX_SIZE = 10000; // 10KB
const PAGE_MIN = 1;
const LIMIT_MIN = 1;
const LIMIT_MAX = 100;
const STUDY_NAME_MAX_LENGTH = 100;

// ============================================
// 1. 알림 필드 검증 (8개)
// ============================================

/**
 * 알림 타입 검증
 *
 * @param {string} type - 알림 타입
 * @returns {boolean} 검증 성공
 * @throws {NotificationValidationException}
 *
 * @example
 * validateNotificationType('JOIN_APPROVED'); // true
 */
export function validateNotificationType(type) {
  if (!type) {
    throw NotificationValidationException.typeRequired();
  }

  if (typeof type !== 'string') {
    throw NotificationValidationException.invalidType(type, VALID_NOTIFICATION_TYPES);
  }

  const upperType = type.toUpperCase();
  if (!VALID_NOTIFICATION_TYPES.includes(upperType)) {
    throw NotificationValidationException.invalidType(type, VALID_NOTIFICATION_TYPES);
  }

  return true;
}

/**
 * 알림 메시지 검증
 *
 * @param {string} message - 알림 메시지
 * @returns {boolean} 검증 성공
 * @throws {NotificationValidationException}
 *
 * @example
 * validateNotificationMessage('스터디 가입이 승인되었습니다.'); // true
 */
export function validateNotificationMessage(message) {
  if (!message) {
    throw NotificationValidationException.messageRequired();
  }

  if (typeof message !== 'string') {
    throw NotificationValidationException.messageTooShort(MESSAGE_MIN_LENGTH);
  }

  const trimmedMessage = message.trim();

  if (trimmedMessage.length < MESSAGE_MIN_LENGTH) {
    throw NotificationValidationException.messageTooShort(MESSAGE_MIN_LENGTH);
  }

  if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
    throw NotificationValidationException.messageTooLong(MESSAGE_MAX_LENGTH);
  }

  return true;
}

/**
 * 사용자 ID 검증
 *
 * @param {string} userId - 사용자 ID
 * @returns {boolean} 검증 성공
 * @throws {NotificationValidationException}
 *
 * @example
 * validateUserId('cuid123456'); // true
 */
export function validateUserId(userId) {
  if (!userId) {
    throw NotificationValidationException.userIdRequired();
  }

  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw NotificationValidationException.invalidUserId(userId);
  }

  return true;
}

/**
 * 알림 ID 검증
 *
 * @param {string} notificationId - 알림 ID
 * @returns {boolean} 검증 성공
 * @throws {NotificationValidationException}
 *
 * @example
 * validateNotificationId('cuid123456'); // true
 */
export function validateNotificationId(notificationId) {
  if (!notificationId) {
    throw NotificationValidationException.notificationIdRequired();
  }

  if (typeof notificationId !== 'string' || notificationId.trim().length === 0) {
    throw NotificationValidationException.invalidNotificationId(notificationId);
  }

  return true;
}

/**
 * 알림 데이터 (JSON) 검증
 *
 * @param {Object|string} data - 알림 추가 데이터
 * @returns {boolean} 검증 성공
 * @throws {NotificationValidationException}
 *
 * @example
 * validateNotificationData({ studyId: 'study123' }); // true
 */
export function validateNotificationData(data) {
  // data는 선택사항
  if (data === undefined || data === null) {
    return true;
  }

  // 객체가 아닌 경우 (문자열이면 JSON 파싱 시도)
  if (typeof data === 'string') {
    try {
      JSON.parse(data);
    } catch {
      throw NotificationValidationException.invalidDataFormat();
    }
  } else if (typeof data !== 'object') {
    throw NotificationValidationException.invalidDataFormat();
  }

  // 데이터 크기 검증
  const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
  if (dataStr.length > DATA_MAX_SIZE) {
    throw NotificationValidationException.dataTooLarge(DATA_MAX_SIZE);
  }

  return true;
}

/**
 * 스터디 ID 검증
 *
 * @param {string} studyId - 스터디 ID
 * @returns {boolean} 검증 성공
 * @throws {NotificationValidationException}
 *
 * @example
 * validateStudyId('study123'); // true
 */
export function validateStudyId(studyId) {
  // studyId는 선택사항
  if (!studyId) {
    return true;
  }

  if (typeof studyId !== 'string' || studyId.trim().length === 0) {
    throw NotificationValidationException.invalidStudyId(studyId);
  }

  return true;
}

/**
 * 스터디 이름 검증
 *
 * @param {string} studyName - 스터디 이름
 * @returns {boolean} 검증 성공
 * @throws {NotificationValidationException}
 *
 * @example
 * validateStudyName('알고리즘 스터디'); // true
 */
export function validateStudyName(studyName) {
  // studyName은 선택사항
  if (!studyName) {
    return true;
  }

  if (typeof studyName !== 'string') {
    throw NotificationValidationException.studyNameTooLong(STUDY_NAME_MAX_LENGTH);
  }

  if (studyName.length > STUDY_NAME_MAX_LENGTH) {
    throw NotificationValidationException.studyNameTooLong(STUDY_NAME_MAX_LENGTH);
  }

  return true;
}

/**
 * 읽음 상태 검증
 *
 * @param {boolean} isRead - 읽음 상태
 * @returns {boolean} 검증 성공
 * @throws {NotificationValidationException}
 *
 * @example
 * validateIsRead(true); // true
 */
export function validateIsRead(isRead) {
  // isRead가 제공되지 않으면 기본값 사용
  if (isRead === undefined || isRead === null) {
    return true;
  }

  if (typeof isRead !== 'boolean') {
    throw NotificationValidationException.invalidDataFormat();
  }

  return true;
}

// ============================================
// 2. 페이지네이션 검증 (2개)
// ============================================

/**
 * 페이지 번호 검증
 *
 * @param {number|string} page - 페이지 번호
 * @returns {number} 검증된 페이지 번호
 * @throws {NotificationValidationException}
 *
 * @example
 * validatePage(1); // 1
 * validatePage('2'); // 2
 */
export function validatePage(page) {
  // 기본값
  if (page === undefined || page === null) {
    return 1;
  }

  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum < PAGE_MIN) {
    throw NotificationValidationException.invalidPage(page);
  }

  return pageNum;
}

/**
 * 페이지당 항목 수 검증
 *
 * @param {number|string} limit - 항목 수
 * @returns {number} 검증된 항목 수
 * @throws {NotificationValidationException}
 *
 * @example
 * validateLimit(20); // 20
 * validateLimit('50'); // 50
 */
export function validateLimit(limit) {
  // 기본값
  if (limit === undefined || limit === null) {
    return 20;
  }

  const limitNum = parseInt(limit, 10);

  if (isNaN(limitNum) || limitNum < LIMIT_MIN || limitNum > LIMIT_MAX) {
    throw NotificationValidationException.invalidLimit(limit, LIMIT_MAX);
  }

  return limitNum;
}

// ============================================
// 3. 통합 검증 (3개)
// ============================================

/**
 * 알림 생성 데이터 통합 검증
 *
 * @param {Object} data - 알림 데이터
 * @returns {Object} 검증된 데이터
 * @throws {NotificationValidationException}
 *
 * @example
 * const validated = validateNotificationCreateData({
 *   userId: 'user123',
 *   type: 'JOIN_APPROVED',
 *   message: '스터디 가입이 승인되었습니다.',
 *   studyId: 'study123',
 *   studyName: '알고리즘 스터디'
 * });
 */
export function validateNotificationCreateData(data) {
  if (!data || typeof data !== 'object') {
    throw NotificationValidationException.invalidDataFormat();
  }

  const validated = {};

  // 필수 필드 검증
  validateUserId(data.userId);
  validated.userId = data.userId.trim();

  validateNotificationType(data.type);
  validated.type = data.type.toUpperCase();

  validateNotificationMessage(data.message);
  validated.message = data.message.trim();

  // 선택 필드 검증
  if (data.studyId !== undefined) {
    validateStudyId(data.studyId);
    validated.studyId = data.studyId;
  }

  if (data.studyName !== undefined) {
    validateStudyName(data.studyName);
    validated.studyName = data.studyName;
  }

  if (data.studyEmoji !== undefined) {
    validated.studyEmoji = data.studyEmoji;
  }

  if (data.data !== undefined) {
    validateNotificationData(data.data);
    validated.data = data.data;
  }

  return validated;
}

/**
 * 알림 조회 쿼리 파라미터 검증
 *
 * @param {Object} params - 쿼리 파라미터
 * @returns {Object} 검증된 파라미터
 * @throws {NotificationValidationException}
 *
 * @example
 * const validated = validateNotificationQueryParams({
 *   page: 1,
 *   limit: 20,
 *   isRead: false
 * });
 */
export function validateNotificationQueryParams(params) {
  const validated = {};

  // 페이지네이션
  validated.page = validatePage(params?.page);
  validated.limit = validateLimit(params?.limit);

  // 읽음 필터
  if (params?.isRead !== undefined) {
    if (params.isRead === 'true') {
      validated.isRead = true;
    } else if (params.isRead === 'false') {
      validated.isRead = false;
    } else if (typeof params.isRead === 'boolean') {
      validated.isRead = params.isRead;
    }
  }

  // 타입 필터
  if (params?.type) {
    validateNotificationType(params.type);
    validated.type = params.type.toUpperCase();
  }

  return validated;
}

/**
 * 대량 알림 생성 데이터 검증
 *
 * @param {string[]} userIds - 사용자 ID 배열
 * @param {Object} notificationData - 알림 데이터
 * @returns {Object} 검증된 데이터
 * @throws {NotificationValidationException}
 *
 * @example
 * const validated = validateBulkNotificationData(
 *   ['user1', 'user2'],
 *   { type: 'NOTICE', message: '공지사항' }
 * );
 */
export function validateBulkNotificationData(userIds, notificationData) {
  // 사용자 ID 배열 검증
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw NotificationValidationException.userIdRequired();
  }

  // 각 사용자 ID 검증
  for (const userId of userIds) {
    validateUserId(userId);
  }

  // 알림 데이터 검증
  if (!notificationData || typeof notificationData !== 'object') {
    throw NotificationValidationException.invalidDataFormat();
  }

  validateNotificationType(notificationData.type);
  validateNotificationMessage(notificationData.message);

  if (notificationData.studyId !== undefined) {
    validateStudyId(notificationData.studyId);
  }

  if (notificationData.studyName !== undefined) {
    validateStudyName(notificationData.studyName);
  }

  if (notificationData.data !== undefined) {
    validateNotificationData(notificationData.data);
  }

  return {
    userIds: userIds.map(id => id.trim()),
    notificationData: {
      type: notificationData.type.toUpperCase(),
      message: notificationData.message.trim(),
      studyId: notificationData.studyId,
      studyName: notificationData.studyName,
      studyEmoji: notificationData.studyEmoji,
      data: notificationData.data
    }
  };
}

// ============================================
// 4. 권한 검증 (2개)
// ============================================

/**
 * 알림 소유권 검증
 *
 * @param {Object} notification - 알림 객체
 * @param {string} userId - 요청 사용자 ID
 * @returns {boolean} 검증 성공
 * @throws {NotificationPermissionException}
 *
 * @example
 * validateNotificationOwnership(notification, 'user123'); // true
 */
export function validateNotificationOwnership(notification, userId) {
  if (!notification) {
    throw NotificationBusinessException.notificationNotFound();
  }

  if (!userId) {
    throw NotificationPermissionException.authenticationRequired();
  }

  if (notification.userId !== userId) {
    throw NotificationPermissionException.notificationNotOwned(notification.id);
  }

  return true;
}

/**
 * 세션 검증
 *
 * @param {Object} session - 세션 객체
 * @returns {Object} 검증된 사용자 정보
 * @throws {NotificationPermissionException}
 *
 * @example
 * const user = validateSession(session);
 */
export function validateSession(session) {
  if (!session) {
    throw NotificationPermissionException.authenticationRequired();
  }

  if (!session.user) {
    throw NotificationPermissionException.invalidSession();
  }

  if (!session.user.id) {
    throw NotificationPermissionException.invalidSession();
  }

  return session.user;
}

// ============================================
// 5. 상수 Export
// ============================================

export const NOTIFICATION_TYPES = VALID_NOTIFICATION_TYPES;
export const NOTIFICATION_CONSTANTS = {
  MESSAGE_MIN_LENGTH,
  MESSAGE_MAX_LENGTH,
  DATA_MAX_SIZE,
  PAGE_MIN,
  LIMIT_MIN,
  LIMIT_MAX,
  STUDY_NAME_MAX_LENGTH
};
