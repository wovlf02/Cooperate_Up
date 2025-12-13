/**
 * Admin Logger - Study Management Loggers
 * 스터디 관리 관련 로깅 기능
 *
 * @module lib/logging/studyLoggers
 */

import { CoreLogger } from './coreLogger';

/**
 * Study Management Logger Mixin
 */
export const StudyLoggers = {
  /**
   * 스터디 조회 로깅
   */
  logStudyView(adminId, studyId, context = {}) {
    CoreLogger.debug(`Study viewed: ${studyId} by admin: ${adminId}`, {
      action: 'study_view',
      adminId,
      studyId,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 스터디 종료 로깅 (logStudyClosure alias)
   */
  logStudyClosure(adminId, studyId, reason, context = {}) {
    CoreLogger.info(`Study closed: ${studyId}`, {
      action: 'study_closure',
      adminId,
      studyId,
      reason,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 스터디 종료 로깅
   */
  logStudyClose(adminId, studyId, reason, context = {}) {
    CoreLogger.warn(`Study closed: ${studyId} by admin: ${adminId}`, {
      action: 'study_close',
      adminId,
      studyId,
      reason,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 스터디 삭제 로깅
   */
  logStudyDelete(adminId, studyId, reason, context = {}) {
    CoreLogger.warn(`Study deleted: ${studyId} by admin: ${adminId}`, {
      action: 'study_delete',
      adminId,
      studyId,
      reason,
      timestamp: new Date().toISOString(),
      ...context
    });
  },

  /**
   * 스터디 숨김 로깅
   */
  logStudyHide(adminId, studyId, reason, context = {}) {
    CoreLogger.warn(`Study hidden: ${studyId} by admin: ${adminId}`, {
      action: 'study_hide',
      adminId,
      studyId,
      reason,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
};

