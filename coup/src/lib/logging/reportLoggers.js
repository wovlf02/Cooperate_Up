/**
 * Admin Logger - Report Management Loggers
 * 신고 관리 관련 로깅 기능
 *
 * @module lib/logging/reportLoggers
 */

import { CoreLogger } from './coreLogger';

/**
 * Report Management Logger Mixin
 */
export const ReportLoggers = {
  /**
   * 신고 처리 로깅
   */
  logReportProcessing(adminId, reportId, action, context = {}) {
    CoreLogger.info(`Report processing: ${action} on ${reportId}`, {
      action: 'report_processing',
      adminId,
      reportId,
      processingAction: action,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 신고 처리 완료 로깅
   */
  logReportProcessed(adminId, reportId, action, context = {}) {
    CoreLogger.info(`Report processed: ${reportId} - ${action}`, {
      action: 'report_processed',
      adminId,
      reportId,
      processingAction: action,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 신고 목록/상세 조회 로깅
   * 두 가지 호출 방식 지원:
   * 1. logReportView(adminId, { filters, resultCount, ... })
   * 2. logReportView(adminId, reportId, { ... })
   */
  logReportView(adminId, reportIdOrContext, context = {}) {
    if (typeof reportIdOrContext === 'object') {
      CoreLogger.debug(`Report list viewed by admin: ${adminId}`, {
        action: 'report_view',
        adminId,
        timestamp: new Date().toISOString(),
        ...reportIdOrContext
      });
    } else {
      CoreLogger.debug(`Report viewed: ${reportIdOrContext} by admin: ${adminId}`, {
        action: 'report_view',
        adminId,
        reportId: reportIdOrContext,
        timestamp: new Date().toISOString(),
        ...context
      });
    }
  }
};

