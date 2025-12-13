/**
 * Admin Logger - Analytics & Performance Loggers
 * 분석 및 성능 관련 로깅 기능
 *
 * @module lib/logging/analyticsLoggers
 */

import { CoreLogger } from './coreLogger';
import { LOG_LEVELS } from './constants';

/**
 * Analytics & Performance Logger Mixin
 */
export const AnalyticsLoggers = {
  /**
   * 분석 페이지 조회 로깅
   */
  logAnalyticsView(adminId, analyticsType, context = {}) {
    CoreLogger.debug(`Analytics viewed: ${analyticsType} by admin: ${adminId}`, {
      action: 'analytics_view',
      adminId,
      analyticsType,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 성능 측정 로깅
   */
  logPerformance(operation, duration, context = {}) {
    const level = duration > 5000 ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

    CoreLogger.log(level, `Performance: ${operation} took ${duration}ms`, {
      action: 'performance',
      operation,
      duration,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 느린 쿼리 로깅
   */
  logSlowQuery(query, duration, context = {}) {
    CoreLogger.warn(`Slow query: ${query.substring(0, 100)}`, {
      action: 'slow_query',
      query,
      duration,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
};

