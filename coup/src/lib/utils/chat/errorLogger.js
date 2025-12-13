/**
 * Chat 에러 로거
 *
 * @description
 * Chat 관련 에러를 로깅하는 유틸리티
 * 개발/프로덕션 환경에 따라 다르게 동작
 */

import { ChatException } from '@/lib/exceptions/chat';

/**
 * 로그 레벨
 */
export const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Chat 에러 로깅
 *
 * @param {Error|ChatException} error - 에러 객체
 * @param {Object} context - 추가 컨텍스트
 */
export function logChatError(error, context = {}) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // ChatException인 경우
  if (error instanceof ChatException) {
    const logData = {
      timestamp: error.timestamp,
      level: LogLevel.ERROR,
      code: error.code,
      category: error.category,
      message: error.devMessage,
      context: { ...error.context, ...context },
      retryable: error.retryable,
    };

    if (isDevelopment) {
      console.error(`[Chat Error] ${error.code}:`, logData);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } else {
      // 프로덕션: 서버로 전송 (향후 구현)
      sendErrorToServer(logData);
    }

    return logData;
  }

  // 일반 에러
  const logData = {
    timestamp: new Date().toISOString(),
    level: LogLevel.ERROR,
    code: 'CHAT-UNKNOWN-001',
    category: 'unknown',
    message: error.message,
    context,
    retryable: false,
  };

  if (isDevelopment) {
    console.error('[Chat Error] Unknown:', logData);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } else {
    sendErrorToServer(logData);
  }

  return logData;
}

/**
 * Chat 경고 로깅
 *
 * @param {string} message - 경고 메시지
 * @param {Object} context - 추가 컨텍스트
 */
export function logChatWarning(message, context = {}) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const logData = {
    timestamp: new Date().toISOString(),
    level: LogLevel.WARN,
    message,
    context,
  };

  if (isDevelopment) {
    console.warn('[Chat Warning]:', logData);
  }

  return logData;
}

/**
 * Chat 정보 로깅
 *
 * @param {string} message - 정보 메시지
 * @param {Object} context - 추가 컨텍스트
 */
export function logChatInfo(message, context = {}) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const logData = {
    timestamp: new Date().toISOString(),
    level: LogLevel.INFO,
    message,
    context,
  };

  if (isDevelopment) {
    console.log('[Chat Info]:', logData);
  }

  return logData;
}

/**
 * Chat 디버그 로깅 (개발 환경에서만)
 *
 * @param {string} message - 디버그 메시지
 * @param {Object} context - 추가 컨텍스트
 */
export function logChatDebug(message, context = {}) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) return;

  const logData = {
    timestamp: new Date().toISOString(),
    level: LogLevel.DEBUG,
    message,
    context,
  };

  console.debug('[Chat Debug]:', logData);

  return logData;
}

/**
 * 서버로 에러 전송 (향후 구현)
 *
 * @param {Object} logData - 로그 데이터
 */
function sendErrorToServer(logData) {
  // TODO: 서버로 에러 로그 전송
  // 예: Sentry, LogRocket, 자체 로깅 서버 등

  // 임시로 콘솔에 출력
  console.error('[Chat Error - Production]:', {
    code: logData.code,
    message: logData.message,
    timestamp: logData.timestamp,
  });
}

/**
 * 에러 로그 포맷팅 (사용자 친화적)
 *
 * @param {Error|ChatException} error - 에러 객체
 * @returns {string} 포맷된 에러 메시지
 */
export function formatErrorLog(error) {
  if (error instanceof ChatException) {
    return `[${error.code}] ${error.category.toUpperCase()}: ${error.devMessage}`;
  }

  return `[UNKNOWN] ${error.message}`;
}

