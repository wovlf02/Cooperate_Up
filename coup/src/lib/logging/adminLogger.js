/**
 * adminLogger.js
 *
 * Admin 도메인 전용 구조화된 로깅 시스템
 * AdminException과 통합되어 일관된 로깅 제공
 * 보안 감사 로깅 강화
 *
 * 이 파일은 분리된 로깅 모듈들을 통합하여 단일 인터페이스를 제공합니다.
 *
 * @module lib/logging/adminLogger
 * @author CoUp Team
 * @created 2025-12-02
 */

// Constants & Utils
export { LOG_LEVELS, sanitizeSensitiveData } from './constants';
export { extractRequestContext, extractErrorContext } from './utils';

// Core Logger
import { CoreLogger } from './coreLogger';

// Domain-specific Loggers
import { AdminActionLoggers } from './adminActions';
import { UserLoggers } from './userLoggers';
import { StudyLoggers } from './studyLoggers';
import { ReportLoggers } from './reportLoggers';
import { SettingsLoggers } from './settingsLoggers';
import { AnalyticsLoggers } from './analyticsLoggers';
import { ApiLoggers } from './apiLoggers';
import { DataLoggers } from './dataLoggers';

/**
 * Admin Logger 클래스
 * 모든 로깅 기능을 통합하여 제공
 */
export class AdminLogger extends CoreLogger {
  // Admin Action Loggers
  static logAdminLogin = AdminActionLoggers.logAdminLogin;
  static logAdminAction = AdminActionLoggers.logAdminAction;
  static logPermissionDenied = AdminActionLoggers.logPermissionDenied;
  static logLoginAttempt = AdminActionLoggers.logLoginAttempt;
  static logSuspiciousActivity = AdminActionLoggers.logSuspiciousActivity;

  // User Loggers
  static logUserManagement = UserLoggers.logUserManagement;
  static logUserSuspension = UserLoggers.logUserSuspension;

  // Study Loggers
  static logStudyView = StudyLoggers.logStudyView;
  static logStudyClosure = StudyLoggers.logStudyClosure;
  static logStudyClose = StudyLoggers.logStudyClose;
  static logStudyDelete = StudyLoggers.logStudyDelete;
  static logStudyHide = StudyLoggers.logStudyHide;

  // Report Loggers
  static logReportProcessing = ReportLoggers.logReportProcessing;
  static logReportProcessed = ReportLoggers.logReportProcessed;
  static logReportView = ReportLoggers.logReportView;

  // Settings Loggers
  static logSettingChange = SettingsLoggers.logSettingChange;
  static logSettingsView = SettingsLoggers.logSettingsView;
  static logSettingsUpdate = SettingsLoggers.logSettingsUpdate;
  static logSettingsChange = SettingsLoggers.logSettingsChange;

  // Analytics & Performance Loggers
  static logAnalyticsView = AnalyticsLoggers.logAnalyticsView;
  static logPerformance = AnalyticsLoggers.logPerformance;
  static logSlowQuery = AnalyticsLoggers.logSlowQuery;

  // API & Database Loggers
  static logDatabaseError = ApiLoggers.logDatabaseError;
  static logApiRequest = ApiLoggers.logApiRequest;
  static logApiResponse = ApiLoggers.logApiResponse;
  static logException = ApiLoggers.logException;

  // Data Operations Loggers
  static logDataExport = DataLoggers.logDataExport;
  static logBulkOperation = DataLoggers.logBulkOperation;
  static logSecurityEvent = DataLoggers.logSecurityEvent;
}

/**
 * 성능 측정 래퍼
 *
 * @param {Function} fn - 실행할 함수
 * @param {string} operationName - 작업 이름
 * @returns {Promise<*>} 함수 실행 결과
 */
export async function measurePerformance(fn, operationName) {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    AdminLogger.logPerformance(operationName, duration, {
      success: true
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    AdminLogger.logPerformance(operationName, duration, {
      success: false,
      error: error.message
    });

    throw error;
  }
}

export default AdminLogger;

