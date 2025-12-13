/**
 * Chat 에러 핸들러
 *
 * @description
 * Chat 관련 에러를 처리하고 적절한 응답을 생성
 * 에러 분류, 로깅, 사용자 메시지 생성을 담당
 */

import {
  ChatException,
  ChatConnectionException,
  ChatMessageException,
  ChatSyncException,
  ChatFileException,
  ChatUIException
} from '@/lib/exceptions/chat';
import { logChatError, logChatWarning } from './errorLogger.js';
import { getUserMessage, getDeveloperMessage, isRetryable } from './errorMessages.js';

/**
 * Chat 에러 처리 메인 함수
 *
 * @param {Error} error - 처리할 에러
 * @param {Object} context - 에러 발생 컨텍스트
 * @returns {Object} 처리된 에러 정보
 */
export function handleChatError(error, context = {}) {
  // 1. 에러 분류
  const errorInfo = classifyChatError(error);

  // 2. 로깅
  logChatError(error, context);

  // 3. 사용자에게 표시할 메시지 생성
  const userMessage = errorInfo.userMessage || getUserMessage(errorInfo.code);

  // 4. 재시도 가능 여부 판단
  const retryable = errorInfo.retryable ?? isRetryable(errorInfo.code);

  return {
    code: errorInfo.code,
    category: errorInfo.category,
    message: userMessage,
    devMessage: errorInfo.devMessage,
    retryable,
    timestamp: new Date().toISOString(),
    context: { ...errorInfo.context, ...context },
  };
}

/**
 * 에러 분류 함수
 *
 * @param {Error} error - 분류할 에러
 * @returns {Object} 분류된 에러 정보
 */
function classifyChatError(error) {
  // ChatException 계열인 경우
  if (error instanceof ChatException) {
    return {
      code: error.code,
      category: error.category || error.name.replace('ChatException', '').toLowerCase(),
      userMessage: error.userMessage,
      devMessage: error.devMessage,
      retryable: error.retryable,
      context: error.context,
    };
  }

  // Socket.IO 연결 에러
  if (isSocketError(error)) {
    return classifySocketError(error);
  }

  // 네트워크 에러
  if (isNetworkError(error)) {
    return {
      code: 'CHAT-MSG-001',
      category: 'message',
      userMessage: '메시지 전송에 실패했습니다. 다시 시도해주세요',
      devMessage: `Network error: ${error.message}`,
      retryable: true,
      context: { originalError: error.message },
    };
  }

  // HTTP 에러
  if (error.response) {
    return classifyHttpError(error);
  }

  // 기본 에러
  return {
    code: 'CHAT-UNKNOWN-001',
    category: 'unknown',
    userMessage: '알 수 없는 오류가 발생했습니다',
    devMessage: error.message || 'Unknown error',
    retryable: false,
    context: { originalError: error.message },
  };
}

/**
 * Socket 에러인지 확인
 */
function isSocketError(error) {
  const message = error.message?.toLowerCase() || '';
  return (
    message.includes('socket') ||
    message.includes('websocket') ||
    message.includes('connection') ||
    error.type === 'TransportError'
  );
}

/**
 * Socket 에러 분류
 */
function classifySocketError(error) {
  const message = error.message?.toLowerCase() || '';

  // 연결 거부
  if (message.includes('refused') || message.includes('econnrefused')) {
    return {
      code: 'CHAT-CONN-001',
      category: 'connection',
      userMessage: '채팅 서버에 연결할 수 없습니다',
      devMessage: `Connection refused: ${error.message}`,
      retryable: true,
      context: { errorType: 'connection_refused' },
    };
  }

  // 타임아웃
  if (message.includes('timeout') || message.includes('etimedout')) {
    return {
      code: 'CHAT-CONN-002',
      category: 'connection',
      userMessage: '서버 응답이 없습니다. 잠시 후 다시 시도해주세요',
      devMessage: `Connection timeout: ${error.message}`,
      retryable: true,
      context: { errorType: 'timeout' },
    };
  }

  // 인증 실패
  if (message.includes('auth') || message.includes('unauthorized')) {
    return {
      code: 'CHAT-CONN-003',
      category: 'connection',
      userMessage: '인증에 실패했습니다. 다시 로그인해주세요',
      devMessage: `Authentication failed: ${error.message}`,
      retryable: false,
      context: { errorType: 'auth_failed' },
    };
  }

  // 기본 연결 에러
  return {
    code: 'CHAT-CONN-001',
    category: 'connection',
    userMessage: '채팅 서버에 연결할 수 없습니다',
    devMessage: `Socket error: ${error.message}`,
    retryable: true,
    context: { errorType: 'socket_error' },
  };
}

/**
 * 네트워크 에러인지 확인
 */
function isNetworkError(error) {
  const message = error.message?.toLowerCase() || '';
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('cors') ||
    error.name === 'NetworkError' ||
    error.name === 'TypeError' && message.includes('failed to fetch')
  );
}

/**
 * HTTP 에러 분류
 */
function classifyHttpError(error) {
  const status = error.response?.status;
  const data = error.response?.data;

  // 400 Bad Request
  if (status === 400) {
    return {
      code: data?.code || 'CHAT-MSG-003',
      category: 'message',
      userMessage: data?.error || '잘못된 요청입니다',
      devMessage: data?.error || error.message,
      retryable: false,
      context: { status, responseData: data },
    };
  }

  // 401 Unauthorized
  if (status === 401) {
    return {
      code: 'CHAT-CONN-003',
      category: 'connection',
      userMessage: '인증에 실패했습니다. 다시 로그인해주세요',
      devMessage: 'Unauthorized request',
      retryable: false,
      context: { status },
    };
  }

  // 403 Forbidden
  if (status === 403) {
    return {
      code: 'CHAT-MSG-008',
      category: 'message',
      userMessage: '권한이 없습니다',
      devMessage: 'Forbidden - insufficient permissions',
      retryable: false,
      context: { status },
    };
  }

  // 404 Not Found
  if (status === 404) {
    return {
      code: 'CHAT-MSG-010',
      category: 'message',
      userMessage: '메시지를 찾을 수 없습니다',
      devMessage: 'Resource not found',
      retryable: false,
      context: { status },
    };
  }

  // 429 Too Many Requests (스팸)
  if (status === 429) {
    return {
      code: 'CHAT-MSG-005',
      category: 'message',
      userMessage: '메시지를 너무 빠르게 전송하고 있습니다',
      devMessage: 'Rate limit exceeded',
      retryable: true,
      context: { status },
    };
  }

  // 500 Server Error
  if (status >= 500) {
    return {
      code: 'CHAT-MSG-002',
      category: 'message',
      userMessage: '메시지를 전송할 수 없습니다. 잠시 후 다시 시도해주세요',
      devMessage: `Server error: ${status}`,
      retryable: true,
      context: { status },
    };
  }

  // 기타 HTTP 에러
  return {
    code: 'CHAT-MSG-002',
    category: 'message',
    userMessage: '요청 처리 중 오류가 발생했습니다',
    devMessage: `HTTP error ${status}: ${error.message}`,
    retryable: true,
    context: { status },
  };
}

/**
 * API 응답 에러 처리
 *
 * @param {Response} response - fetch API 응답
 * @returns {Object} 처리된 에러 정보
 */
export async function handleApiError(response) {
  let errorData;

  try {
    errorData = await response.json();
  } catch {
    errorData = { error: 'Unknown error' };
  }

  const error = new Error(errorData.error || `HTTP ${response.status}`);
  error.response = { status: response.status, data: errorData };

  return handleChatError(error);
}

/**
 * 재시도 로직이 포함된 에러 핸들러
 *
 * @param {Function} fn - 실행할 함수
 * @param {Object} options - 옵션
 * @returns {Promise} 실행 결과
 */
export async function withRetry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = true,
    context = {}
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const errorInfo = handleChatError(error, { ...context, attempt });

      // 재시도 불가능한 에러면 즉시 throw
      if (!errorInfo.retryable) {
        throw error;
      }

      // 마지막 시도였으면 throw
      if (attempt === maxAttempts) {
        throw error;
      }

      // 재시도 전 대기
      const delay = backoff ? delayMs * attempt : delayMs;
      logChatWarning(`Retrying after ${delay}ms (attempt ${attempt}/${maxAttempts})`, context);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

