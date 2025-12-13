/**
 * Admin Logger - Constants and Config
 * 로그 레벨 및 설정 상수
 *
 * @module lib/logging/constants
 */

// ============================================
// 로그 레벨 및 설정
// ============================================

/**
 * 로그 레벨 정의
 */
export const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
  SECURITY: 'SECURITY' // Admin 전용 보안 로그
};

/**
 * 로그 레벨 우선순위
 */
export const LOG_LEVEL_PRIORITY = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4,
  SECURITY: 5 // 최상위
};

/**
 * 환경별 최소 로그 레벨
 */
export const MIN_LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG';

/**
 * 로그 출력 여부 확인
 */
export function shouldLog(level) {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL];
}

/**
 * 보안 민감 정보 필터링
 *
 * @param {Object} data - 원본 데이터
 * @returns {Object} 필터링된 데이터
 */
export function sanitizeSensitiveData(data) {
  if (!data || typeof data !== 'object') return data;

  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'sessionId', 'creditCard'];
  const sanitized = { ...data };

  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeSensitiveData(sanitized[key]);
    }
  });

  return sanitized;
}

