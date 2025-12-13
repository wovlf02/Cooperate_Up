/**
 * Admin Logger - User Management Loggers
 * 사용자 관리 관련 로깅 기능
 *
 * @module lib/logging/userLoggers
 */

import { CoreLogger } from './coreLogger';

/**
 * User Management Logger Mixin
 */
export const UserLoggers = {
  /**
   * 사용자 관리 작업 로깅
   */
  logUserManagement(adminId, targetUserId, action, context = {}) {
    CoreLogger.info(`User management: ${action} on ${targetUserId}`, {
      action: 'user_management',
      adminId,
      targetUserId,
      managementAction: action,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 사용자 정지 액션 로깅
   */
  logUserSuspension(adminId, userId, reason, days, context = {}) {
    CoreLogger.info(`User suspended: ${userId} for ${days} days`, {
      action: 'user_suspension',
      adminId,
      userId,
      reason,
      days,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
};

