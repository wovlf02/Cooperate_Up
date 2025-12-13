/**
 * Admin Logger - Admin Action Loggers
 * 관리자 작업 관련 로깅 기능
 *
 * @module lib/logging/adminActions
 */

import { CoreLogger } from './coreLogger';
import { LOG_LEVELS } from './constants';

/**
 * Admin Action Logger Mixin
 * 관리자 작업 로깅 기능 확장
 */
export const AdminActionLoggers = {
  /**
   * 관리자 로그인 로깅
   */
  logAdminLogin(adminId, success, context = {}) {
    const level = success ? LOG_LEVELS.INFO : LOG_LEVELS.SECURITY;
    const message = success
      ? `Admin login successful: ${adminId}`
      : `Admin login failed: ${adminId}`;

    CoreLogger.log(level, message, {
      action: 'admin_login',
      adminId,
      success,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 관리자 작업 로깅
   */
  logAdminAction(adminId, action, context = {}) {
    CoreLogger.info(`Admin action: ${action}`, {
      action: 'admin_action',
      adminId,
      actionType: action,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 권한 거부 로깅
   */
  logPermissionDenied(adminId, attemptedAction, requiredPermission, context = {}) {
    CoreLogger.security(`Permission denied: ${attemptedAction}`, {
      action: 'permission_denied',
      adminId,
      attemptedAction,
      requiredPermission,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 로그인 시도 로깅
   */
  logLoginAttempt(email, success, ip, context = {}) {
    if (success) {
      CoreLogger.info(`Login attempt: ${email}`, {
        action: 'login_attempt',
        email,
        success,
        ip,
        timestamp: new Date().toISOString(),
        ...context
      });
    } else {
      CoreLogger.security(`Failed login attempt: ${email}`, {
        action: 'login_attempt',
        email,
        success,
        ip,
        timestamp: new Date().toISOString(),
        ...context
      });
    }
  },

  /**
   * 의심스러운 활동 로깅
   */
  logSuspiciousActivity(description, context = {}) {
    CoreLogger.security(`Suspicious activity: ${description}`, {
      action: 'suspicious_activity',
      description,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
};

