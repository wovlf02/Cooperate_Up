/**
 * Admin Logger - API & Database Loggers
 * API 및 데이터베이스 관련 로깅 기능
 *
 * @module lib/logging/apiLoggers
 */

import { CoreLogger } from './coreLogger';
import { LOG_LEVELS } from './constants';

/**
 * API & Database Logger Mixin
 */
export const ApiLoggers = {
  /**
   * 데이터베이스 오류 로깅
   */
  logDatabaseError(operation, error, context = {}) {
    CoreLogger.error(`Database error during ${operation}`, {
      action: 'database_error',
      operation,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * API 요청 시작 로깅
   */
  logApiRequest(endpoint, method, context = {}) {
    CoreLogger.debug(`API Request: ${method} ${endpoint}`, {
      action: 'api_request',
      endpoint,
      method,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * API 응답 로깅
   */
  logApiResponse(endpoint, statusCode, duration, context = {}) {
    const level = statusCode >= 500 ? LOG_LEVELS.ERROR :
                  statusCode >= 400 ? LOG_LEVELS.WARN :
                  LOG_LEVELS.DEBUG;

    CoreLogger.log(level, `API Response: ${statusCode} in ${duration}ms`, {
      action: 'api_response',
      endpoint,
      statusCode,
      duration,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 예외 로깅
   */
  logException(error, context = {}) {
    CoreLogger.error(`Exception occurred: ${error.message}`, {
      action: 'exception',
      name: error.name,
      code: error.code,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
};

