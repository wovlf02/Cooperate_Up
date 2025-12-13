/**
 * Admin Logger - Data Operations Loggers
 * 데이터 작업 관련 로깅 기능
 *
 * @module lib/logging/dataLoggers
 */

import { CoreLogger } from './coreLogger';

/**
 * Data Operations Logger Mixin
 */
export const DataLoggers = {
  /**
   * 데이터 내보내기 로깅
   */
  logDataExport(adminId, dataType, recordCount, context = {}) {
    CoreLogger.warn(`Data export: ${dataType} (${recordCount} records)`, {
      action: 'data_export',
      adminId,
      dataType,
      recordCount,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 대량 작업 로깅
   */
  logBulkOperation(adminId, operation, affectedCount, context = {}) {
    CoreLogger.warn(`Bulk operation: ${operation} (${affectedCount} records)`, {
      action: 'bulk_operation',
      adminId,
      operation,
      affectedCount,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 보안 이벤트 로깅
   */
  logSecurityEvent(eventType, severity, context = {}) {
    CoreLogger.security(`Security event: ${eventType}`, {
      action: 'security_event',
      eventType,
      severity,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
};

