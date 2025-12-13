/**
 * 입력값 정제 유틸리티
 *
 * 사용자 입력값을 안전하게 정제하고 검증합니다.
 *
 * @module input-sanitizer
 * @created 2025-12-01
 */

import { sanitizeHTML, SANITIZE_PRESETS } from './xss-sanitizer.js';

// ============================================
// 1. 스터디 관련 입력 정제
// ============================================

/**
 * 스터디 생성/수정 데이터 정제
 *
 * @param {object} data - 스터디 데이터
 * @returns {object} 정제된 데이터
 *
 * @example
 * sanitizeStudyInput({
 *   name: '<script>XSS</script>Study',
 *   description: '<b>Description</b>',
 *   category: 'PROGRAMMING'
 * });
 */
export function sanitizeStudyInput(data) {
  const sanitized = {};

  // 1. 이름 (순수 텍스트)
  if (data.name !== undefined) {
    sanitized.name = sanitizeHTML(data.name, SANITIZE_PRESETS.PLAIN_TEXT);
  }

  // 2. 설명 (기본 서식 허용)
  if (data.description !== undefined) {
    sanitized.description = sanitizeHTML(data.description, SANITIZE_PRESETS.BASIC_FORMATTING);
  }

  // 3. 카테고리 (열거형 검증)
  if (data.category !== undefined) {
    const validCategories = [
      'PROGRAMMING', 'LANGUAGE', 'CERTIFICATION', 'HOBBY',
      'CAREER', 'EXAM', 'BOOK', 'OTHER'
    ];
    sanitized.category = validCategories.includes(data.category)
      ? data.category
      : 'OTHER';
  }

  // 4. 모집 상태 (불린 보장)
  if (data.isRecruiting !== undefined) {
    sanitized.isRecruiting = Boolean(data.isRecruiting);
  }

  // 5. 자동 승인 (불린 보장)
  if (data.autoApprove !== undefined) {
    sanitized.autoApprove = Boolean(data.autoApprove);
  }

  // 6. 정원 (숫자 검증)
  if (data.maxMembers !== undefined) {
    const num = parseInt(data.maxMembers, 10);
    sanitized.maxMembers = Number.isInteger(num) && num >= 2 && num <= 100
      ? num
      : 20; // 기본값
  }

  // 7. 태그 (배열 정제)
  if (data.tags !== undefined && Array.isArray(data.tags)) {
    sanitized.tags = data.tags
      .map(tag => sanitizeHTML(String(tag), SANITIZE_PRESETS.PLAIN_TEXT))
      .filter(tag => tag.length > 0)
      .slice(0, 10); // 최대 10개
  }

  // 8. 이미지 URL (URL 검증)
  if (data.imageUrl !== undefined) {
    sanitized.imageUrl = sanitizeURL(data.imageUrl);
  }

  return sanitized;
}

/**
 * 공지사항 데이터 정제
 *
 * @param {object} data - 공지사항 데이터
 * @returns {object} 정제된 데이터
 */
export function sanitizeNoticeInput(data) {
  const sanitized = {};

  // 1. 제목 (순수 텍스트)
  if (data.title !== undefined) {
    sanitized.title = sanitizeHTML(data.title, SANITIZE_PRESETS.PLAIN_TEXT)
      .slice(0, 100); // 최대 100자
  }

  // 2. 내용 (리치 텍스트 허용)
  if (data.content !== undefined) {
    sanitized.content = sanitizeHTML(data.content, SANITIZE_PRESETS.RICH_TEXT)
      .slice(0, 10000); // 최대 10,000자
  }

  // 3. 고정 여부 (불린 보장)
  if (data.isPinned !== undefined) {
    sanitized.isPinned = Boolean(data.isPinned);
  }

  return sanitized;
}

/**
 * 할일 데이터 정제
 *
 * @param {object} data - 할일 데이터
 * @returns {object} 정제된 데이터
 */
export function sanitizeTaskInput(data) {
  const sanitized = {};

  // 1. 제목 (순수 텍스트)
  if (data.title !== undefined) {
    sanitized.title = sanitizeHTML(data.title, SANITIZE_PRESETS.PLAIN_TEXT)
      .slice(0, 200); // 최대 200자
  }

  // 2. 설명 (기본 서식 허용)
  if (data.description !== undefined) {
    sanitized.description = sanitizeHTML(data.description, SANITIZE_PRESETS.BASIC_FORMATTING)
      .slice(0, 2000); // 최대 2,000자
  }

  // 3. 상태 (열거형 검증)
  if (data.status !== undefined) {
    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
    sanitized.status = validStatuses.includes(data.status)
      ? data.status
      : 'TODO';
  }

  // 4. 우선순위 (열거형 검증)
  if (data.priority !== undefined) {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    sanitized.priority = validPriorities.includes(data.priority)
      ? data.priority
      : 'MEDIUM';
  }

  // 5. 마감일 (날짜 검증)
  if (data.dueDate !== undefined) {
    const date = new Date(data.dueDate);
    sanitized.dueDate = isValidDate(date) ? date : null;
  }

  // 6. 담당자 ID (문자열 정제)
  if (data.assigneeId !== undefined) {
    sanitized.assigneeId = sanitizeHTML(String(data.assigneeId), SANITIZE_PRESETS.PLAIN_TEXT);
  }

  return sanitized;
}

/**
 * 채팅 메시지 데이터 정제
 *
 * @param {object} data - 채팅 메시지 데이터
 * @returns {object} 정제된 데이터
 */
export function sanitizeChatMessageInput(data) {
  const sanitized = {};

  // 1. 내용 (순수 텍스트 - XSS 방지)
  if (data.content !== undefined) {
    sanitized.content = sanitizeHTML(data.content, SANITIZE_PRESETS.PLAIN_TEXT)
      .slice(0, 2000); // 최대 2,000자
  }

  // 2. 파일 ID (문자열 정제)
  if (data.fileId !== undefined) {
    sanitized.fileId = sanitizeHTML(String(data.fileId), SANITIZE_PRESETS.PLAIN_TEXT);
  }

  // 3. 파일 URL (URL 검증)
  if (data.fileUrl !== undefined) {
    sanitized.fileUrl = sanitizeURL(data.fileUrl);
  }

  return sanitized;
}

/**
 * 일정 데이터 정제
 *
 * @param {object} data - 일정 데이터
 * @returns {object} 정제된 데이터
 */
export function sanitizeCalendarEventInput(data) {
  const sanitized = {};

  // 1. 제목 (순수 텍스트)
  if (data.title !== undefined) {
    sanitized.title = sanitizeHTML(data.title, SANITIZE_PRESETS.PLAIN_TEXT)
      .slice(0, 100); // 최대 100자
  }

  // 2. 설명 (기본 서식 허용)
  if (data.description !== undefined) {
    sanitized.description = sanitizeHTML(data.description, SANITIZE_PRESETS.BASIC_FORMATTING)
      .slice(0, 1000); // 최대 1,000자
  }

  // 3. 시작 시간 (날짜 검증)
  if (data.startTime !== undefined) {
    const date = new Date(data.startTime);
    sanitized.startTime = isValidDate(date) ? date : null;
  }

  // 4. 종료 시간 (날짜 검증 + 순서 확인)
  if (data.endTime !== undefined) {
    const date = new Date(data.endTime);
    sanitized.endTime = isValidDate(date) ? date : null;

    // 시작 시간보다 이후인지 확인
    if (sanitized.startTime && sanitized.endTime && sanitized.endTime <= sanitized.startTime) {
      sanitized.endTime = null;
    }
  }

  // 5. 위치 (순수 텍스트)
  if (data.location !== undefined) {
    sanitized.location = sanitizeHTML(data.location, SANITIZE_PRESETS.PLAIN_TEXT)
      .slice(0, 200); // 최대 200자
  }

  // 6. 반복 (불린 보장)
  if (data.isRecurring !== undefined) {
    sanitized.isRecurring = Boolean(data.isRecurring);
  }

  return sanitized;
}

/**
 * 댓글 데이터 정제
 *
 * @param {object} data - 댓글 데이터
 * @returns {object} 정제된 데이터
 */
export function sanitizeCommentInput(data) {
  const sanitized = {};

  // 1. 내용 (기본 서식 허용)
  if (data.content !== undefined) {
    sanitized.content = sanitizeHTML(data.content, SANITIZE_PRESETS.BASIC_FORMATTING)
      .slice(0, 1000); // 최대 1,000자
  }

  return sanitized;
}

// ============================================
// 2. 사용자 관련 입력 정제
// ============================================

/**
 * 사용자 프로필 데이터 정제
 *
 * @param {object} data - 프로필 데이터
 * @returns {object} 정제된 데이터
 */
export function sanitizeUserProfileInput(data) {
  const sanitized = {};

  // 1. 이름 (순수 텍스트)
  if (data.name !== undefined) {
    sanitized.name = sanitizeHTML(data.name, SANITIZE_PRESETS.PLAIN_TEXT)
      .slice(0, 50);
  }

  // 2. 바이오 (기본 서식 허용)
  if (data.bio !== undefined) {
    sanitized.bio = sanitizeHTML(data.bio, SANITIZE_PRESETS.BASIC_FORMATTING)
      .slice(0, 500);
  }

  // 3. 이메일 (이메일 검증)
  if (data.email !== undefined) {
    sanitized.email = sanitizeEmail(data.email);
  }

  // 4. 전화번호 (숫자와 하이픈만)
  if (data.phone !== undefined) {
    sanitized.phone = String(data.phone)
      .replace(/[^0-9-]/g, '')
      .slice(0, 20);
  }

  // 5. 웹사이트 URL (URL 검증)
  if (data.website !== undefined) {
    sanitized.website = sanitizeURL(data.website);
  }

  // 6. SNS 링크 (URL 검증)
  if (data.socialLinks !== undefined && typeof data.socialLinks === 'object') {
    sanitized.socialLinks = {};
    for (const [platform, url] of Object.entries(data.socialLinks)) {
      const sanitizedUrl = sanitizeURL(url);
      if (sanitizedUrl) {
        sanitized.socialLinks[platform] = sanitizedUrl;
      }
    }
  }

  return sanitized;
}

/**
 * 검색 쿼리 정제
 *
 * @param {string} query - 검색 쿼리
 * @returns {string} 정제된 쿼리
 */
export function sanitizeSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return '';
  }

  return sanitizeHTML(query, SANITIZE_PRESETS.PLAIN_TEXT)
    .replace(/[<>'"]/g, '') // 특수 문자 추가 제거
    .slice(0, 100); // 최대 100자
}

// ============================================
// 3. 헬퍼 함수
// ============================================

/**
 * URL 정제
 *
 * @param {string} url - URL
 * @returns {string|null} 정제된 URL
 */
function sanitizeURL(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const urlObj = new URL(url);
    // HTTP(S)만 허용
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    return urlObj.toString();
  } catch {
    return null;
  }
}

/**
 * 이메일 정제
 *
 * @param {string} email - 이메일
 * @returns {string|null} 정제된 이메일
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = email.trim().toLowerCase();

  return emailRegex.test(cleaned) ? cleaned : null;
}

/**
 * 유효한 날짜인지 확인
 *
 * @param {Date} date - 날짜 객체
 * @returns {boolean} 유효 여부
 */
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

// ============================================
// 4. 일괄 정제 함수
// ============================================

/**
 * 객체의 모든 문자열 필드 정제
 *
 * @param {object} obj - 정제할 객체
 * @param {string} preset - 프리셋 이름
 * @returns {object} 정제된 객체
 */
export function sanitizeAllStringFields(obj, preset = 'PLAIN_TEXT') {
  const sanitized = {};
  const options = SANITIZE_PRESETS[preset] || SANITIZE_PRESETS.PLAIN_TEXT;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHTML(value, options);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeHTML(item, options) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeAllStringFields(value, preset);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

// ============================================
// 5. 검증 + 정제 통합 함수
// ============================================

/**
 * 입력값 검증 및 정제 (통합)
 *
 * @param {object} data - 입력 데이터
 * @param {string} type - 데이터 타입
 * @returns {object} 결과
 * @property {boolean} valid - 유효 여부
 * @property {object} sanitized - 정제된 데이터
 * @property {Array<string>} errors - 에러 목록
 */
export function validateAndSanitize(data, type) {
  const errors = [];
  let sanitized = {};

  try {
    switch (type) {
      case 'STUDY':
        sanitized = sanitizeStudyInput(data);
        // 필수 필드 검증
        if (!sanitized.name || sanitized.name.length < 2) {
          errors.push('스터디 이름은 2자 이상이어야 합니다.');
        }
        if (!sanitized.description || sanitized.description.length < 10) {
          errors.push('스터디 설명은 10자 이상이어야 합니다.');
        }
        break;

      case 'NOTICE':
        sanitized = sanitizeNoticeInput(data);
        if (!sanitized.title || sanitized.title.length < 1) {
          errors.push('공지사항 제목은 필수입니다.');
        }
        if (!sanitized.content || sanitized.content.length < 1) {
          errors.push('공지사항 내용은 필수입니다.');
        }
        break;

      case 'TASK':
        sanitized = sanitizeTaskInput(data);
        if (!sanitized.title || sanitized.title.length < 1) {
          errors.push('할일 제목은 필수입니다.');
        }
        break;

      case 'CHAT_MESSAGE':
        sanitized = sanitizeChatMessageInput(data);
        if (!sanitized.content && !sanitized.fileId) {
          errors.push('메시지 내용 또는 파일이 필요합니다.');
        }
        break;

      case 'CALENDAR_EVENT':
        sanitized = sanitizeCalendarEventInput(data);
        if (!sanitized.title || sanitized.title.length < 1) {
          errors.push('일정 제목은 필수입니다.');
        }
        if (!sanitized.startTime) {
          errors.push('시작 시간은 필수입니다.');
        }
        if (!sanitized.endTime) {
          errors.push('종료 시간은 필수입니다.');
        }
        break;

      case 'COMMENT':
        sanitized = sanitizeCommentInput(data);
        if (!sanitized.content || sanitized.content.length < 1) {
          errors.push('댓글 내용은 필수입니다.');
        }
        break;

      case 'USER_PROFILE':
        sanitized = sanitizeUserProfileInput(data);
        if (data.name !== undefined && (!sanitized.name || sanitized.name.length < 2)) {
          errors.push('이름은 2자 이상이어야 합니다.');
        }
        if (data.email !== undefined && !sanitized.email) {
          errors.push('유효한 이메일 주소가 아닙니다.');
        }
        break;

      default:
        errors.push('지원되지 않는 데이터 타입입니다.');
    }

    return {
      valid: errors.length === 0,
      sanitized,
      errors,
    };
  } catch (error) {
    console.error('[Input Sanitizer] Validation error:', error);
    return {
      valid: false,
      sanitized: {},
      errors: ['입력값 검증 중 오류가 발생했습니다.'],
    };
  }
}

// ============================================
// 6. Export
// ============================================

export default {
  // 스터디 관련
  sanitizeStudyInput,
  sanitizeNoticeInput,
  sanitizeTaskInput,
  sanitizeChatMessageInput,
  sanitizeCalendarEventInput,
  sanitizeCommentInput,

  // 사용자 관련
  sanitizeUserProfileInput,
  sanitizeSearchQuery,

  // 일괄 정제
  sanitizeAllStringFields,

  // 통합 검증
  validateAndSanitize,
};

