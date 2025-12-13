/**
 * Admin Logger - Core Logger Class
 * 핵심 로깅 기능
 *
 * @module lib/logging/coreLogger
 */

import { LOG_LEVELS, shouldLog } from './constants';
import { createLogEntry, outputLog } from './formatters';
import { AdminException } from '@/lib/exceptions/admin';

/**
 * Core Admin Logger 클래스
 * 기본 로깅 기능 제공
 */
export class CoreLogger {
  /**
   * 일반 로그
   */
  static log(level, message, context = {}) {
    if (!shouldLog(level)) return;

    const logEntry = createLogEntry(level, message, context);
    outputLog(logEntry);
  }

  /**
   * DEBUG 레벨 로그
   */
  static debug(message, context = {}) {
    this.log(LOG_LEVELS.DEBUG, message, context);
  }

  /**
   * INFO 레벨 로그
   */
  static info(message, context = {}) {
    this.log(LOG_LEVELS.INFO, message, context);
  }

  /**
   * WARN 레벨 로그
   */
  static warn(message, context = {}) {
    this.log(LOG_LEVELS.WARN, message, context);
  }

  /**
   * ERROR 레벨 로그
   */
  static error(message, context = {}) {
    this.log(LOG_LEVELS.ERROR, message, context);
  }

  /**
   * CRITICAL 레벨 로그
   */
  static critical(message, context = {}) {
    this.log(LOG_LEVELS.CRITICAL, message, context);
  }

  /**
   * SECURITY 레벨 로그 (관리자 전용)
   */
  static security(message, context = {}) {
    this.log(LOG_LEVELS.SECURITY, message, {
      ...context,
      securityAlert: true
    });
  }

  /**
   * AdminException 로깅
   */
  static logError(error, additionalContext = {}) {
    if (error instanceof AdminException) {
      const level = this._mapSeverityToLogLevel(error.severity, error.securityLevel);

      this.log(level, error.devMessage, {
        action: 'exception',
        code: error.code,
        userMessage: error.userMessage,
        devMessage: error.devMessage,
        severity: error.severity,
        securityLevel: error.securityLevel,
        category: error.category,
        retryable: error.retryable,
        statusCode: error.statusCode,
        errorContext: error.context,
        stack: error.stack,
        ...additionalContext
      });
    } else {
      this.error(error.message, {
        action: 'error',
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...additionalContext
      });
    }
  }

  /**
   * Severity와 SecurityLevel을 로그 레벨로 매핑
   */
  static _mapSeverityToLogLevel(severity, securityLevel = 'normal') {
    if (securityLevel === 'critical' || securityLevel === 'high') {
      return LOG_LEVELS.SECURITY;
    }

    const mapping = {
      low: LOG_LEVELS.WARN,
      medium: LOG_LEVELS.ERROR,
      high: LOG_LEVELS.ERROR,
      critical: LOG_LEVELS.CRITICAL
    };
    return mapping[severity] || LOG_LEVELS.ERROR;
  }
}

