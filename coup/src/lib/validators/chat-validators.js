/**
 * chat-validators.js
 *
 * Chat 도메인의 통합 검증 시스템
 * ChatException 클래스를 활용한 체계적인 검증
 *
 * @module lib/validators/chat-validators
 * @author CoUp Team
 * @created 2025-12-04
 */

import {
  ChatValidationException,
  ChatPermissionException,
  ChatBusinessException
} from '@/lib/exceptions/chat';

// ============================================
// 상수 정의
// ============================================

const MESSAGE_MIN_LENGTH = 1;
const MESSAGE_MAX_LENGTH = 5000;
const PAGE_MIN = 1;
const LIMIT_MIN = 1;
const LIMIT_MAX = 100;
const DEFAULT_LIMIT = 50;

// 금지 단어 목록 (예시)
const PROHIBITED_WORDS = [];

// 허용 파일 유형
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
];

// 최대 파일 크기 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// ============================================
// 1. 메시지 내용 검증 (4개)
// ============================================

/**
 * 메시지 내용 검증
 *
 * @param {string} content - 메시지 내용
 * @returns {boolean} 검증 성공
 * @throws {ChatValidationException}
 *
 * @example
 * validateMessageContent('안녕하세요!'); // true
 */
export function validateMessageContent(content) {
  if (!content) {
    throw ChatValidationException.contentRequired();
  }

  if (typeof content !== 'string') {
    throw ChatValidationException.contentInvalidFormat();
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length < MESSAGE_MIN_LENGTH) {
    throw ChatValidationException.contentTooShort(MESSAGE_MIN_LENGTH);
  }

  if (trimmedContent.length > MESSAGE_MAX_LENGTH) {
    throw ChatValidationException.contentTooLong(MESSAGE_MAX_LENGTH);
  }

  // 금지 단어 검사
  if (PROHIBITED_WORDS.length > 0) {
    const lowerContent = trimmedContent.toLowerCase();
    for (const word of PROHIBITED_WORDS) {
      if (lowerContent.includes(word.toLowerCase())) {
        throw ChatValidationException.contentContainsProhibitedWords();
      }
    }
  }

  return true;
}

/**
 * 메시지 내용 검증 (선택 사항 - 빈 문자열 허용 안 함)
 *
 * @param {string} content - 메시지 내용
 * @param {Object} options - 옵션
 * @returns {string} 정제된 메시지 내용
 * @throws {ChatValidationException}
 */
export function sanitizeMessageContent(content, options = {}) {
  const { allowEmpty = false, maxLength = MESSAGE_MAX_LENGTH } = options;

  if (!content && !allowEmpty) {
    throw ChatValidationException.contentRequired();
  }

  if (!content) {
    return '';
  }

  const trimmed = content.trim();

  if (trimmed.length > maxLength) {
    throw ChatValidationException.contentTooLong(maxLength);
  }

  return trimmed;
}

// ============================================
// 2. ID 검증 (4개)
// ============================================

/**
 * 스터디 ID 검증
 *
 * @param {string} studyId - 스터디 ID
 * @returns {boolean} 검증 성공
 * @throws {ChatValidationException}
 *
 * @example
 * validateStudyId('study123'); // true
 */
export function validateStudyId(studyId) {
  if (!studyId) {
    throw ChatValidationException.studyIdRequired();
  }

  if (typeof studyId !== 'string' || studyId.trim().length === 0) {
    throw ChatValidationException.invalidStudyId(studyId);
  }

  return true;
}

/**
 * 메시지 ID 검증
 *
 * @param {string} messageId - 메시지 ID
 * @returns {boolean} 검증 성공
 * @throws {ChatValidationException}
 *
 * @example
 * validateMessageId('msg123'); // true
 */
export function validateMessageId(messageId) {
  if (!messageId) {
    throw ChatValidationException.messageIdRequired();
  }

  if (typeof messageId !== 'string' || messageId.trim().length === 0) {
    throw ChatValidationException.invalidMessageId(messageId);
  }

  return true;
}

/**
 * 사용자 ID 검증
 *
 * @param {string} userId - 사용자 ID
 * @returns {boolean} 검증 성공
 * @throws {ChatValidationException}
 *
 * @example
 * validateUserId('user123'); // true
 */
export function validateUserId(userId) {
  if (!userId) {
    throw ChatValidationException.userIdRequired();
  }

  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw ChatValidationException.invalidUserId(userId);
  }

  return true;
}

/**
 * 파일 ID 검증
 *
 * @param {string} fileId - 파일 ID
 * @returns {boolean} 검증 성공
 * @throws {ChatValidationException}
 *
 * @example
 * validateFileId('file123'); // true
 */
export function validateFileId(fileId) {
  if (!fileId) {
    return true; // 파일 ID는 선택사항
  }

  if (typeof fileId !== 'string' || fileId.trim().length === 0) {
    throw ChatValidationException.invalidFileId(fileId);
  }

  return true;
}

// ============================================
// 3. 페이지네이션 검증 (2개)
// ============================================

/**
 * 페이지 번호 검증
 *
 * @param {number|string} page - 페이지 번호
 * @returns {number} 검증된 페이지 번호
 * @throws {ChatValidationException}
 *
 * @example
 * validatePage(1); // 1
 * validatePage('2'); // 2
 */
export function validatePage(page) {
  if (page === undefined || page === null) {
    return 1;
  }

  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum < PAGE_MIN) {
    throw ChatValidationException.invalidPage(page);
  }

  return pageNum;
}

/**
 * 페이지당 항목 수 검증
 *
 * @param {number|string} limit - 항목 수
 * @returns {number} 검증된 항목 수
 * @throws {ChatValidationException}
 *
 * @example
 * validateLimit(20); // 20
 * validateLimit('50'); // 50
 */
export function validateLimit(limit) {
  if (limit === undefined || limit === null) {
    return DEFAULT_LIMIT;
  }

  const limitNum = parseInt(limit, 10);

  if (isNaN(limitNum) || limitNum < LIMIT_MIN || limitNum > LIMIT_MAX) {
    throw ChatValidationException.invalidLimit(limit, LIMIT_MAX);
  }

  return limitNum;
}

// ============================================
// 4. 파일 검증 (2개)
// ============================================

/**
 * 파일 유형 검증
 *
 * @param {string} fileType - 파일 MIME 타입
 * @returns {boolean} 검증 성공
 * @throws {ChatValidationException}
 *
 * @example
 * validateFileType('image/png'); // true
 */
export function validateFileType(fileType) {
  if (!fileType) {
    return true; // 파일 유형은 선택사항
  }

  if (!ALLOWED_FILE_TYPES.includes(fileType)) {
    throw ChatValidationException.invalidFileType(fileType, ALLOWED_FILE_TYPES);
  }

  return true;
}

/**
 * 파일 크기 검증
 *
 * @param {number} fileSize - 파일 크기 (바이트)
 * @returns {boolean} 검증 성공
 * @throws {ChatBusinessException}
 *
 * @example
 * validateFileSize(1024); // true
 */
export function validateFileSize(fileSize) {
  if (!fileSize || fileSize <= 0) {
    return true;
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw ChatBusinessException.fileSizeTooLarge(MAX_FILE_SIZE / (1024 * 1024));
  }

  return true;
}

// ============================================
// 5. 통합 검증 (3개)
// ============================================

/**
 * 메시지 전송 데이터 통합 검증
 *
 * @param {Object} data - 메시지 데이터
 * @returns {Object} 검증된 데이터
 * @throws {ChatValidationException}
 *
 * @example
 * const validated = validateMessageCreateData({
 *   studyId: 'study123',
 *   content: '안녕하세요!'
 * });
 */
export function validateMessageCreateData(data) {
  if (!data || typeof data !== 'object') {
    throw ChatValidationException.contentInvalidFormat();
  }

  const validated = {};

  // 필수 필드 검증
  validateStudyId(data.studyId);
  validated.studyId = data.studyId.trim();

  validateMessageContent(data.content);
  validated.content = data.content.trim();

  // 선택 필드 검증
  if (data.fileId !== undefined && data.fileId !== null) {
    validateFileId(data.fileId);
    validated.fileId = data.fileId;
  }

  return validated;
}

/**
 * 메시지 조회 쿼리 파라미터 검증
 *
 * @param {Object} params - 쿼리 파라미터
 * @returns {Object} 검증된 파라미터
 * @throws {ChatValidationException}
 *
 * @example
 * const validated = validateMessageQueryParams({
 *   page: 1,
 *   limit: 50
 * });
 */
export function validateMessageQueryParams(params) {
  const validated = {};

  // 페이지네이션
  validated.page = validatePage(params?.page);
  validated.limit = validateLimit(params?.limit);

  // cursor 기반 페이지네이션 (선택)
  if (params?.cursor) {
    validated.cursor = params.cursor;
  }

  // 검색 키워드
  if (params?.search && typeof params.search === 'string') {
    validated.search = params.search.trim();
  }

  return validated;
}

/**
 * 읽음 처리 데이터 검증
 *
 * @param {string} studyId - 스터디 ID
 * @param {string[]} messageIds - 메시지 ID 배열 (선택)
 * @returns {Object} 검증된 데이터
 * @throws {ChatValidationException}
 *
 * @example
 * const validated = validateMarkAsReadData('study123', ['msg1', 'msg2']);
 */
export function validateMarkAsReadData(studyId, messageIds) {
  validateStudyId(studyId);

  const validated = {
    studyId: studyId.trim(),
    messageIds: undefined
  };

  // messageIds가 제공되면 검증
  if (messageIds !== undefined && messageIds !== null) {
    if (!Array.isArray(messageIds)) {
      throw ChatValidationException.contentInvalidFormat();
    }

    for (const messageId of messageIds) {
      validateMessageId(messageId);
    }

    validated.messageIds = messageIds.map(id => id.trim());
  }

  return validated;
}

// ============================================
// 6. 권한 검증 (3개)
// ============================================

/**
 * 메시지 소유권 검증
 *
 * @param {Object} message - 메시지 객체
 * @param {string} userId - 요청 사용자 ID
 * @returns {boolean} 검증 성공
 * @throws {ChatPermissionException}
 *
 * @example
 * validateMessageOwnership(message, 'user123'); // true
 */
export function validateMessageOwnership(message, userId) {
  if (!message) {
    throw ChatBusinessException.messageNotFound();
  }

  if (!userId) {
    throw ChatPermissionException.authenticationRequired();
  }

  if (message.userId !== userId) {
    throw ChatPermissionException.messageNotOwned(message.id);
  }

  return true;
}

/**
 * 스터디 멤버십 검증
 *
 * @param {Object} membership - 멤버십 객체
 * @param {string} studyId - 스터디 ID
 * @returns {boolean} 검증 성공
 * @throws {ChatPermissionException}
 *
 * @example
 * validateStudyMembership(membership, 'study123'); // true
 */
export function validateStudyMembership(membership, studyId) {
  if (!membership) {
    throw ChatPermissionException.notStudyMember(studyId);
  }

  if (membership.status === 'PENDING') {
    throw ChatPermissionException.membershipPending(studyId);
  }

  if (membership.status === 'KICKED') {
    throw ChatPermissionException.membershipKicked(studyId);
  }

  if (membership.status !== 'ACTIVE') {
    throw ChatPermissionException.notStudyMember(studyId);
  }

  return true;
}

/**
 * 세션 검증
 *
 * @param {Object} session - 세션 객체
 * @returns {Object} 검증된 사용자 정보
 * @throws {ChatPermissionException}
 *
 * @example
 * const user = validateSession(session);
 */
export function validateSession(session) {
  if (!session) {
    throw ChatPermissionException.authenticationRequired();
  }

  if (!session.user) {
    throw ChatPermissionException.sessionExpired();
  }

  if (!session.user.id) {
    throw ChatPermissionException.sessionExpired();
  }

  return session.user;
}

// ============================================
// 7. 상수 Export
// ============================================

export const CHAT_CONSTANTS = {
  MESSAGE_MIN_LENGTH,
  MESSAGE_MAX_LENGTH,
  PAGE_MIN,
  LIMIT_MIN,
  LIMIT_MAX,
  DEFAULT_LIMIT,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
};
