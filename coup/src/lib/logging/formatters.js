/**
 * Admin Logger - Formatting Utilities
 * 로그 포맷팅 유틸리티
 *
 * @module lib/logging/formatters
 */

import { sanitizeSensitiveData } from './constants';

/**
 * 로그 엔트리 생성
 *
 * @param {string} level - 로그 레벨
 * @param {string} message - 로그 메시지
 * @param {Object} context - 컨텍스트 정보
 * @returns {Object} 포맷된 로그 엔트리
 */
export function createLogEntry(level, message, context = {}) {
  const timestamp = new Date().toISOString();

  // 보안 민감 정보 필터링
  const sanitizedContext = sanitizeSensitiveData(context);

  return {
    level,
    message,
    timestamp,
    domain: 'admin',
    environment: process.env.NODE_ENV || 'development',
    ...sanitizedContext
  };
}

/**
 * 로그 출력
 *
 * @param {Object} logEntry - 로그 엔트리
 */
export function outputLog(logEntry) {
  const { level, message, timestamp, ...rest } = logEntry;

  // 콘솔 출력
  const consoleMethod = {
    DEBUG: 'log',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    CRITICAL: 'error',
    SECURITY: 'error'
  }[level];

  if (process.env.NODE_ENV === 'production') {
    // 프로덕션: JSON 형식 (구조화된 로깅)
    console[consoleMethod](JSON.stringify(logEntry));
  } else {
    // 개발: 가독성 있는 형식
    const icon = level === 'SECURITY' ? '🔒' : '🔑';
    console[consoleMethod](
      `${icon} [${timestamp}] [${level}] [ADMIN] ${message}`,
      Object.keys(rest).length > 0 ? rest : ''
    );
  }
}

