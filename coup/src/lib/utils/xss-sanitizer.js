/**
 * XSS 방어 유틸리티
 *
 * 사용자 입력에서 악성 스크립트를 제거하고 안전한 HTML로 정제합니다.
 *
 * @module xss-sanitizer
 * @requires sanitize-html
 * @created 2025-12-01
 */

import sanitizeHtml from 'sanitize-html';

// ============================================
// 1. 설정 프리셋
// ============================================

/**
 * XSS 방어 설정 프리셋
 * @constant
 */
export const SANITIZE_PRESETS = {
  /**
   * 기본 프리셋 - 모든 HTML 제거 (순수 텍스트만)
   */
  PLAIN_TEXT: {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
    textFilter: (text) => text.trim(),
  },

  /**
   * 기본 서식 프리셋 - 안전한 HTML 태그만 허용
   * 허용: <b>, <i>, <u>, <em>, <strong>, <br>, <p>
   */
  BASIC_FORMATTING: {
    allowedTags: ['b', 'i', 'u', 'em', 'strong', 'br', 'p'],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
    textFilter: (text) => text.trim(),
  },

  /**
   * 리치 텍스트 프리셋 - 서식 + 링크 허용
   * 허용: 기본 서식 + <a>, <ul>, <ol>, <li>, <h1>-<h6>, <blockquote>
   */
  RICH_TEXT: {
    allowedTags: [
      'b', 'i', 'u', 'em', 'strong', 'br', 'p',
      'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre'
    ],
    allowedAttributes: {
      'a': ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      a: ['http', 'https', 'mailto']
    },
    // 외부 링크에 자동으로 rel="noopener noreferrer" 추가
    transformTags: {
      'a': (tagName, attribs) => {
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        };
      }
    },
    disallowedTagsMode: 'discard',
  },

  /**
   * 마크다운 프리셋 - 마크다운 변환 후 사용
   */
  MARKDOWN: {
    allowedTags: [
      'b', 'i', 'u', 'em', 'strong', 'br', 'p',
      'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'img'
    ],
    allowedAttributes: {
      'a': ['href', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'code': ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      'a': (tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      'img': (tagName, attribs) => ({
        tagName: 'img',
        attribs: {
          ...attribs,
          loading: 'lazy'
        }
      })
    },
    disallowedTagsMode: 'discard',
  },
};

// ============================================
// 2. 핵심 정제 함수
// ============================================

/**
 * HTML 문자열 정제
 *
 * @param {string} html - 정제할 HTML 문자열
 * @param {object} options - sanitize-html 옵션 (기본: PLAIN_TEXT)
 * @returns {string} 정제된 문자열
 *
 * @example
 * sanitizeHTML('<script>alert("XSS")</script>Hello');
 * // Returns: 'Hello'
 *
 * sanitizeHTML('<b>Bold</b> text', SANITIZE_PRESETS.BASIC_FORMATTING);
 * // Returns: '<b>Bold</b> text'
 */
export function sanitizeHTML(html, options = SANITIZE_PRESETS.PLAIN_TEXT) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    const sanitized = sanitizeHtml(html, options);
    return sanitized.trim();
  } catch (error) {
    console.error('[XSS Sanitizer] Sanitization failed:', error);
    // 실패 시 모든 HTML 제거
    return html.replace(/<[^>]*>/g, '').trim();
  }
}

/**
 * 여러 필드를 일괄 정제
 *
 * @param {object} fields - 필드 객체 { fieldName: value }
 * @param {object} presetMap - 프리셋 맵 { fieldName: preset }
 * @returns {object} 정제된 필드 객체
 *
 * @example
 * sanitizeFields(
 *   { title: '<script>XSS</script>Title', content: '<b>Bold</b>' },
 *   { title: 'PLAIN_TEXT', content: 'BASIC_FORMATTING' }
 * );
 * // Returns: { title: 'Title', content: '<b>Bold</b>' }
 */
export function sanitizeFields(fields, presetMap = {}) {
  const sanitized = {};

  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== 'string') {
      sanitized[key] = value;
      continue;
    }

    const preset = presetMap[key] || 'PLAIN_TEXT';
    const options = SANITIZE_PRESETS[preset] || SANITIZE_PRESETS.PLAIN_TEXT;
    sanitized[key] = sanitizeHTML(value, options);
  }

  return sanitized;
}

// ============================================
// 3. 특수 목적 정제 함수
// ============================================

/**
 * URL 정제 및 검증
 *
 * @param {string} url - 정제할 URL
 * @param {Array<string>} allowedSchemes - 허용할 스킴 (기본: http, https)
 * @returns {string|null} 정제된 URL 또는 null (유효하지 않은 경우)
 *
 * @example
 * sanitizeURL('javascript:alert("XSS")');
 * // Returns: null
 *
 * sanitizeURL('https://example.com');
 * // Returns: 'https://example.com'
 */
export function sanitizeURL(url, allowedSchemes = ['http', 'https']) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const urlObj = new URL(url);

    // 허용된 스킴인지 확인
    if (!allowedSchemes.includes(urlObj.protocol.replace(':', ''))) {
      return null;
    }

    return urlObj.toString();
  } catch (error) {
    // 상대 경로 처리
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    return null;
  }
}

/**
 * 파일 이름 정제
 * 특수 문자 제거 및 안전한 파일명 생성
 *
 * @param {string} filename - 정제할 파일명
 * @returns {string} 정제된 파일명
 *
 * @example
 * sanitizeFilename('../../../etc/passwd');
 * // Returns: 'etc-passwd'
 *
 * sanitizeFilename('file<script>.txt');
 * // Returns: 'file-script.txt'
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return 'untitled';
  }

  return filename
    // HTML 태그 제거
    .replace(/<[^>]*>/g, '')
    // 경로 구분자 제거
    .replace(/[\/\\]/g, '-')
    // 특수 문자를 대시로 변경
    .replace(/[^a-zA-Z0-9가-힣._-]/g, '-')
    // 연속된 대시를 하나로
    .replace(/-+/g, '-')
    // 앞뒤 대시 제거
    .replace(/^-+|-+$/g, '')
    // 최대 길이 제한 (255자)
    .slice(0, 255)
    || 'untitled';
}

/**
 * 이메일 주소 정제
 *
 * @param {string} email - 정제할 이메일
 * @returns {string|null} 정제된 이메일 또는 null (유효하지 않은 경우)
 *
 * @example
 * sanitizeEmail('user@example.com');
 * // Returns: 'user@example.com'
 *
 * sanitizeEmail('<script>@example.com');
 * // Returns: null
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }

  // 기본 이메일 정규식
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = email.trim().toLowerCase();

  if (emailRegex.test(cleaned)) {
    return cleaned;
  }

  return null;
}

// ============================================
// 4. 고급 정제 함수
// ============================================

/**
 * SQL Injection 패턴 감지
 *
 * @param {string} input - 검사할 입력값
 * @returns {boolean} SQL Injection 패턴 포함 여부
 *
 * @example
 * detectSQLInjection("'; DROP TABLE users; --");
 * // Returns: true
 */
export function detectSQLInjection(input) {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
    /(--|\||\/\*|\*\/|;|'|"|`)/,
    /(\bOR\b.*\b=\b|\bAND\b.*\b=\b)/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * XSS 패턴 감지
 *
 * @param {string} input - 검사할 입력값
 * @returns {boolean} XSS 패턴 포함 여부
 *
 * @example
 * detectXSS('<script>alert("XSS")</script>');
 * // Returns: true
 */
export function detectXSS(input) {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["']?[^"']*["']?/gi, // onclick, onerror 등
    /<embed\b/gi,
    /<object\b/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Path Traversal 공격 감지
 *
 * @param {string} path - 검사할 경로
 * @returns {boolean} Path Traversal 패턴 포함 여부
 *
 * @example
 * detectPathTraversal('../../../etc/passwd');
 * // Returns: true
 */
export function detectPathTraversal(path) {
  if (!path || typeof path !== 'string') {
    return false;
  }

  const traversalPatterns = [
    /\.\./,
    /\/\.\./,
    /\.\.\\/,
    /%2e%2e/i,
    /%252e%252e/i,
  ];

  return traversalPatterns.some(pattern => pattern.test(path));
}

// ============================================
// 5. 통합 검증 함수
// ============================================

/**
 * 보안 위험 검증 (통합)
 *
 * @param {string} input - 검사할 입력값
 * @returns {object} 검증 결과
 * @property {boolean} safe - 안전 여부
 * @property {Array<string>} threats - 감지된 위협 목록
 *
 * @example
 * validateSecurityThreats('<script>alert(1)</script>');
 * // Returns: { safe: false, threats: ['xss'] }
 */
export function validateSecurityThreats(input) {
  const threats = [];

  if (detectXSS(input)) {
    threats.push('xss');
  }

  if (detectSQLInjection(input)) {
    threats.push('sql_injection');
  }

  if (detectPathTraversal(input)) {
    threats.push('path_traversal');
  }

  return {
    safe: threats.length === 0,
    threats,
  };
}

/**
 * 사용자 입력 안전 처리 (권장)
 *
 * @param {string} input - 사용자 입력
 * @param {string} preset - 프리셋 이름
 * @returns {object} 처리 결과
 * @property {boolean} success - 성공 여부
 * @property {string} sanitized - 정제된 값
 * @property {Array<string>} threats - 감지된 위협
 *
 * @example
 * safeProcessInput('<b>Hello</b><script>XSS</script>', 'BASIC_FORMATTING');
 * // Returns: { success: true, sanitized: '<b>Hello</b>', threats: ['xss'] }
 */
export function safeProcessInput(input, preset = 'PLAIN_TEXT') {
  if (!input || typeof input !== 'string') {
    return {
      success: true,
      sanitized: '',
      threats: [],
    };
  }

  // 1. 위협 감지
  const validation = validateSecurityThreats(input);

  // 2. HTML 정제
  const options = SANITIZE_PRESETS[preset] || SANITIZE_PRESETS.PLAIN_TEXT;
  const sanitized = sanitizeHTML(input, options);

  return {
    success: true,
    sanitized,
    threats: validation.threats,
  };
}

// ============================================
// 6. 로깅 및 모니터링
// ============================================

/**
 * 보안 이벤트 로깅
 *
 * @param {string} eventType - 이벤트 타입
 * @param {object} details - 세부 정보
 */
export function logSecurityEvent(eventType, details) {
  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    ...details,
  };

  // 프로덕션 환경에서는 보안 로그 시스템에 전송
  if (process.env.NODE_ENV === 'production') {
    // TODO: 보안 로그 시스템 연동 (e.g., Sentry, CloudWatch)
    console.warn('[Security Event]', JSON.stringify(event));
  } else {
    console.warn('[Security Event]', event);
  }
}

// ============================================
// 7. 유틸리티 Export
// ============================================

export default {
  // 설정
  SANITIZE_PRESETS,

  // 기본 정제
  sanitizeHTML,
  sanitizeFields,

  // 특수 정제
  sanitizeURL,
  sanitizeFilename,
  sanitizeEmail,

  // 위협 감지
  detectXSS,
  detectSQLInjection,
  detectPathTraversal,
  validateSecurityThreats,

  // 통합 처리
  safeProcessInput,

  // 로깅
  logSecurityEvent,
};

