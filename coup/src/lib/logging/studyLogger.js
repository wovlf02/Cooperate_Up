/**
 * studyLogger.js
 *
 * Study 도메인 전용 구조화된 로깅 시스템
 * StudyException과 통합되어 일관된 로깅 제공
 *
 * @module lib/logging/studyLogger
 * @author CoUp Team
 * @created 2025-12-01
 */

import { StudyException } from '@/lib/exceptions/study';

// ============================================
// 로그 레벨 및 설정
// ============================================

/**
 * 로그 레벨 정의
 */
export const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

/**
 * 로그 레벨 우선순위
 */
const LOG_LEVEL_PRIORITY = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
};

/**
 * 환경별 최소 로그 레벨
 */
const MIN_LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG';

/**
 * 로그 출력 여부 확인
 */
function shouldLog(level) {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL];
}

// ============================================
// 로그 포맷팅
// ============================================

/**
 * 로그 엔트리 생성
 *
 * @param {string} level - 로그 레벨
 * @param {string} message - 로그 메시지
 * @param {Object} context - 컨텍스트 정보
 * @returns {Object} 포맷된 로그 엔트리
 */
function createLogEntry(level, message, context = {}) {
  const timestamp = new Date().toISOString();

  return {
    level,
    message,
    timestamp,
    domain: 'study',
    environment: process.env.NODE_ENV || 'development',
    ...context
  };
}

/**
 * 로그 출력
 *
 * @param {Object} logEntry - 로그 엔트리
 */
function outputLog(logEntry) {
  const { level, message, timestamp, ...rest } = logEntry;

  // 콘솔 출력
  const consoleMethod = {
    DEBUG: 'log',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    CRITICAL: 'error'
  }[level];

  if (process.env.NODE_ENV === 'production') {
    // 프로덕션: JSON 형식
    console[consoleMethod](JSON.stringify(logEntry));
  } else {
    // 개발: 가독성 있는 형식
    console[consoleMethod](
      `[${timestamp}] [${level}] [STUDY] ${message}`,
      Object.keys(rest).length > 0 ? rest : ''
    );
  }

  // TODO: 외부 모니터링 서비스 전송
  // - Sentry
  // - DataDog
  // - CloudWatch
  // - Custom logging service
}

// ============================================
// 핵심 로깅 클래스
// ============================================

/**
 * Study Logger 클래스
 */
export class StudyLogger {
  /**
   * 일반 로그
   *
   * @param {string} level - 로그 레벨
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static log(level, message, context = {}) {
    if (!shouldLog(level)) return;

    const logEntry = createLogEntry(level, message, context);
    outputLog(logEntry);
  }

  /**
   * DEBUG 레벨 로그
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static debug(message, context = {}) {
    this.log(LOG_LEVELS.DEBUG, message, context);
  }

  /**
   * INFO 레벨 로그
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static info(message, context = {}) {
    this.log(LOG_LEVELS.INFO, message, context);
  }

  /**
   * WARN 레벨 로그
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static warn(message, context = {}) {
    this.log(LOG_LEVELS.WARN, message, context);
  }

  /**
   * ERROR 레벨 로그
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static error(message, context = {}) {
    this.log(LOG_LEVELS.ERROR, message, context);
  }

  /**
   * CRITICAL 레벨 로그
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static critical(message, context = {}) {
    this.log(LOG_LEVELS.CRITICAL, message, context);
  }

  // ============================================
  // StudyException 통합 로깅
  // ============================================

  /**
   * StudyException 로깅
   *
   * @param {StudyException|Error} error - 에러 객체
   * @param {Object} additionalContext - 추가 컨텍스트
   *
   * @example
   * try {
   *   // ...
   * } catch (error) {
   *   StudyLogger.logError(error, { userId, studyId });
   *   throw error;
   * }
   */
  static logError(error, additionalContext = {}) {
    if (error instanceof StudyException) {
      const level = this._mapSeverityToLogLevel(error.severity);

      this.log(level, error.devMessage, {
        action: 'exception',
        code: error.code,
        userMessage: error.userMessage,
        devMessage: error.devMessage,
        severity: error.severity,
        category: error.category,
        retryable: error.retryable,
        statusCode: error.statusCode,
        errorContext: error.context,
        stack: error.stack,
        ...additionalContext
      });
    } else {
      // 일반 에러
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
   * Severity를 로그 레벨로 매핑
   *
   * @param {string} severity - 에러 심각도
   * @returns {string} 로그 레벨
   */
  static _mapSeverityToLogLevel(severity) {
    const mapping = {
      low: LOG_LEVELS.WARN,
      medium: LOG_LEVELS.ERROR,
      high: LOG_LEVELS.ERROR,
      critical: LOG_LEVELS.CRITICAL
    };
    return mapping[severity] || LOG_LEVELS.ERROR;
  }

  // ============================================
  // Study 도메인 특화 로깅
  // ============================================

  /**
   * 스터디 목록 조회 로그
   *
   * @param {Object} context - 조회 컨텍스트
   */
  static logStudyList(context) {
    this.debug('Study list retrieved', {
      action: 'study_list',
      total: context.total,
      page: context.page,
      limit: context.limit,
      filters: context.filters
    });
  }

  /**
   * 스터디 생성 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 생성자 ID
   * @param {Object} studyData - 스터디 데이터
   */
  static logStudyCreate(studyId, userId, studyData) {
    this.info('Study created', {
      action: 'study_create',
      studyId,
      userId,
      studyName: studyData.name,
      category: studyData.category,
      maxMembers: studyData.maxMembers
    });
  }

  /**
   * 스터디 수정 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 수정자 ID
   * @param {Object} changes - 변경 내용
   */
  static logStudyUpdate(studyId, userId, changes) {
    this.info('Study updated', {
      action: 'study_update',
      studyId,
      userId,
      changes: Object.keys(changes)
    });
  }

  /**
   * 스터디 삭제 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 삭제자 ID
   */
  static logStudyDelete(studyId, userId) {
    this.info('Study deleted', {
      action: 'study_delete',
      studyId,
      userId
    });
  }

  /**
   * 멤버 가입 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 가입 사용자 ID
   * @param {string} role - 역할
   */
  static logMemberJoin(studyId, userId, role = 'MEMBER') {
    this.info('Member joined study', {
      action: 'member_join',
      studyId,
      userId,
      role
    });
  }

  /**
   * 멤버 탈퇴 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 탈퇴 사용자 ID
   * @param {string} reason - 탈퇴 사유 (left, kicked)
   */
  static logMemberLeave(studyId, userId, reason = 'left') {
    this.info('Member left study', {
      action: 'member_leave',
      studyId,
      userId,
      reason
    });
  }

  /**
   * 멤버 강퇴 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {string} kickedUserId - 강퇴된 사용자 ID
   * @param {string} kickerUserId - 강퇴한 사용자 ID
   */
  static logMemberKick(studyId, kickedUserId, kickerUserId) {
    this.warn('Member kicked from study', {
      action: 'member_kick',
      studyId,
      kickedUserId,
      kickerUserId
    });
  }

  /**
   * 역할 변경 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 대상 사용자 ID
   * @param {string} oldRole - 이전 역할
   * @param {string} newRole - 새 역할
   * @param {string} changedBy - 변경 실행자 ID
   */
  static logRoleChange(studyId, userId, oldRole, newRole, changedBy) {
    this.info('Member role changed', {
      action: 'role_change',
      studyId,
      userId,
      oldRole,
      newRole,
      changedBy
    });
  }

  /**
   * 소유권 이전 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {string} oldOwnerId - 이전 소유자 ID
   * @param {string} newOwnerId - 새 소유자 ID
   */
  static logOwnershipTransfer(studyId, oldOwnerId, newOwnerId) {
    this.info('Study ownership transferred', {
      action: 'ownership_transfer',
      studyId,
      oldOwnerId,
      newOwnerId
    });
  }

  /**
   * 가입 신청 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 신청자 ID
   * @param {string} applicationId - 신청 ID
   */
  static logApplicationCreate(studyId, userId, applicationId) {
    this.info('Application submitted', {
      action: 'application_create',
      studyId,
      userId,
      applicationId
    });
  }

  /**
   * 가입 신청 승인 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 신청자 ID
   * @param {string} approvedBy - 승인자 ID
   */
  static logApplicationApprove(studyId, userId, approvedBy) {
    this.info('Application approved', {
      action: 'application_approve',
      studyId,
      userId,
      approvedBy
    });
  }

  /**
   * 가입 신청 거절 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 신청자 ID
   * @param {string} rejectedBy - 거절자 ID
   */
  static logApplicationReject(studyId, userId, rejectedBy) {
    this.info('Application rejected', {
      action: 'application_reject',
      studyId,
      userId,
      rejectedBy
    });
  }

  /**
   * 공지사항 생성 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {string} noticeId - 공지사항 ID
   * @param {string} userId - 작성자 ID
   */
  static logNoticeCreate(studyId, noticeId, userId) {
    this.info('Notice created', {
      action: 'notice_create',
      studyId,
      noticeId,
      userId
    });
  }


  /**
   * 메시지 전송 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 발신자 ID
   * @param {string} messageId - 메시지 ID
   */
  static logMessageSend(studyId, userId, messageId) {
    this.debug('Message sent', {
      action: 'message_send',
      studyId,
      userId,
      messageId
    });
  }

  // ============================================
  // 보안 및 권한 로깅
  // ============================================

  /**
   * 권한 거부 로그
   *
   * @param {string} userId - 사용자 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} action - 시도한 액션
   * @param {string} requiredRole - 필요한 역할
   */
  static logPermissionDenied(userId, studyId, action, requiredRole) {
    this.warn('Permission denied', {
      action: 'permission_denied',
      userId,
      studyId,
      attemptedAction: action,
      requiredRole
    });
  }

  /**
   * 인증 실패 로그
   *
   * @param {string} userId - 사용자 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} reason - 실패 사유
   */
  static logAuthenticationFailed(userId, studyId, reason) {
    this.warn('Authentication failed', {
      action: 'authentication_failed',
      userId,
      studyId,
      reason
    });
  }

  // ============================================
  // Notice (공지사항) 로깅
  // ============================================

  /**
   * 공지사항 목록 조회 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {Object} context - 조회 컨텍스트
   */
  static logNoticeList(studyId, context) {
    this.debug('Notice list retrieved', {
      action: 'notice_list',
      studyId,
      page: context.page,
      limit: context.limit,
      pinned: context.pinned,
      total: context.total,
      cached: context.cached
    });
  }

  /**
   * 공지사항 생성 로그
   *
   * @param {string} noticeId - 공지사항 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 작성자 ID
   * @param {Object} noticeData - 공지사항 데이터
   */
  static logNoticeCreate(noticeId, studyId, userId, noticeData) {
    this.info('Notice created', {
      action: 'notice_create',
      noticeId,
      studyId,
      userId,
      title: noticeData.title,
      isPinned: noticeData.isPinned,
      isImportant: noticeData.isImportant
    });
  }

  /**
   * 공지사항 조회 로그
   *
   * @param {string} noticeId - 공지사항 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 조회자 ID
   */
  static logNoticeView(noticeId, studyId, userId) {
    this.debug('Notice viewed', {
      action: 'notice_view',
      noticeId,
      studyId,
      userId
    });
  }

  /**
   * 공지사항 수정 로그
   *
   * @param {string} noticeId - 공지사항 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 수정자 ID
   * @param {Object} changes - 변경 내용
   */
  static logNoticeUpdate(noticeId, studyId, userId, changes) {
    this.info('Notice updated', {
      action: 'notice_update',
      noticeId,
      studyId,
      userId,
      changes: Object.keys(changes)
    });
  }

  /**
   * 공지사항 삭제 로그
   *
   * @param {string} noticeId - 공지사항 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 삭제자 ID
   */
  static logNoticeDelete(noticeId, studyId, userId) {
    this.info('Notice deleted', {
      action: 'notice_delete',
      noticeId,
      studyId,
      userId
    });
  }

  // ============================================
  // Task (할일) 로깅
  // ============================================

  /**
   * 할일 목록 조회 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {Object} context - 조회 컨텍스트
   */
  static logTaskList(studyId, context) {
    this.debug('Task list retrieved', {
      action: 'task_list',
      studyId,
      page: context.page,
      limit: context.limit,
      status: context.status,
      total: context.total,
      cached: context.cached
    });
  }

  /**
   * 할일 생성 로그
   *
   * @param {string} taskId - 할일 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 작성자 ID
   * @param {Object} taskData - 할일 데이터
   */
  static logTaskCreate(taskId, studyId, userId, taskData) {
    this.info('Task created', {
      action: 'task_create',
      taskId,
      studyId,
      userId,
      title: taskData.title,
      priority: taskData.priority,
      status: taskData.status,
      dueDate: taskData.dueDate,
      assigneeCount: taskData.assigneeIds?.length || 0
    });
  }

  /**
   * 할일 조회 로그
   *
   * @param {string} taskId - 할일 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 조회자 ID
   */
  static logTaskView(taskId, studyId, userId) {
    this.debug('Task viewed', {
      action: 'task_view',
      taskId,
      studyId,
      userId
    });
  }

  /**
   * 할일 수정 로그
   *
   * @param {string} taskId - 할일 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 수정자 ID
   * @param {Object} changes - 변경 내용
   */
  static logTaskUpdate(taskId, studyId, userId, changes) {
    this.info('Task updated', {
      action: 'task_update',
      taskId,
      studyId,
      userId,
      changes: Object.keys(changes)
    });
  }

  /**
   * 할일 삭제 로그
   *
   * @param {string} taskId - 할일 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 삭제자 ID
   */
  static logTaskDelete(taskId, studyId, userId) {
    this.info('Task deleted', {
      action: 'task_delete',
      taskId,
      studyId,
      userId
    });
  }

  /**
   * 할일 상태 변경 로그
   *
   * @param {string} taskId - 할일 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 변경자 ID
   * @param {string} oldStatus - 이전 상태
   * @param {string} newStatus - 새 상태
   */
  static logTaskStatusChange(taskId, studyId, userId, oldStatus, newStatus) {
    this.info('Task status changed', {
      action: 'task_status_change',
      taskId,
      studyId,
      userId,
      oldStatus,
      newStatus
    });
  }

  // ============================================
  // Calendar (일정) 로깅
  // ============================================

  /**
   * 일정 목록 조회 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {Object} context - 조회 컨텍스트
   */
  static logEventList(studyId, context) {
    this.debug('Event list retrieved', {
      action: 'event_list',
      studyId,
      startDate: context.startDate,
      endDate: context.endDate,
      total: context.total
    });
  }

  /**
   * 일정 생성 로그
   *
   * @param {string} eventId - 일정 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 작성자 ID
   * @param {Object} eventData - 일정 데이터
   */
  static logEventCreate(eventId, studyId, userId, eventData) {
    this.info('Event created', {
      action: 'event_create',
      eventId,
      studyId,
      userId,
      title: eventData.title,
      date: eventData.date,
      startTime: eventData.startTime,
      endTime: eventData.endTime
    });
  }

  /**
   * 일정 조회 로그
   *
   * @param {string} eventId - 일정 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 조회자 ID
   */
  static logEventView(eventId, studyId, userId) {
    this.debug('Event viewed', {
      action: 'event_view',
      eventId,
      studyId,
      userId
    });
  }

  /**
   * 일정 수정 로그
   *
   * @param {string} eventId - 일정 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 수정자 ID
   * @param {Object} changes - 변경 내용
   */
  static logEventUpdate(eventId, studyId, userId, changes) {
    this.info('Event updated', {
      action: 'event_update',
      eventId,
      studyId,
      userId,
      changes: Object.keys(changes)
    });
  }

  /**
   * 일정 삭제 로그
   *
   * @param {string} eventId - 일정 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 삭제자 ID
   */
  static logEventDelete(eventId, studyId, userId) {
    this.info('Event deleted', {
      action: 'event_delete',
      eventId,
      studyId,
      userId
    });
  }

  // ============================================
  // File (파일) 로깅
  // ============================================

  /**
   * 파일 목록 조회 로그
   *
   * @param {string} studyId - 스터디 ID
   * @param {Object} context - 조회 컨텍스트
   */
  static logFileList(studyId, context) {
    this.debug('File list retrieved', {
      action: 'file_list',
      studyId,
      page: context.page,
      limit: context.limit,
      folderId: context.folderId,
      total: context.total
    });
  }

  /**
   * 파일 업로드 로그
   *
   * @param {string} fileId - 파일 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 업로더 ID
   * @param {Object} fileData - 파일 데이터
   */
  static logFileUpload(fileId, studyId, userId, fileData) {
    this.info('File uploaded', {
      action: 'file_upload',
      fileId,
      studyId,
      userId,
      filename: fileData.filename,
      size: fileData.size,
      type: fileData.type
    });
  }

  /**
   * 파일 다운로드 로그
   *
   * @param {string} fileId - 파일 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 다운로더 ID
   */
  static logFileDownload(fileId, studyId, userId) {
    this.debug('File downloaded', {
      action: 'file_download',
      fileId,
      studyId,
      userId
    });
  }

  /**
   * 파일 삭제 로그
   *
   * @param {string} fileId - 파일 ID
   * @param {string} studyId - 스터디 ID
   * @param {string} userId - 삭제자 ID
   * @param {Object} fileData - 파일 데이터
   */
  static logFileDelete(fileId, studyId, userId, fileData) {
    this.info('File deleted', {
      action: 'file_delete',
      fileId,
      studyId,
      userId,
      filename: fileData.filename,
      size: fileData.size
    });
  }

  // ============================================
  // 성능 모니터링
  // ============================================

  /**
   * 성능 측정 시작
   *
   * @param {string} operationName - 작업 이름
   * @returns {Function} 종료 함수
   *
   * @example
   * const endTimer = StudyLogger.startTimer('fetchStudies');
   * // ... operation ...
   * endTimer({ studyId, userId });
   */
  static startTimer(operationName) {
    const startTime = Date.now();

    return (context = {}) => {
      const duration = Date.now() - startTime;

      this.debug(`Operation completed: ${operationName}`, {
        action: 'performance',
        operation: operationName,
        duration,
        ...context
      });
    };
  }

  /**
   * 쿼리 성능 로그
   *
   * @param {string} queryName - 쿼리 이름
   * @param {number} duration - 소요 시간 (ms)
   * @param {Object} context - 컨텍스트
   */
  static logQueryPerformance(queryName, duration, context = {}) {
    const level = duration > 1000 ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

    this.log(level, `Database query: ${queryName}`, {
      action: 'query_performance',
      queryName,
      duration,
      slow: duration > 1000,
      ...context
    });
  }
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 요청 컨텍스트 추출
 *
 * @param {Request} request - Next.js Request 객체
 * @returns {Object} 추출된 컨텍스트
 */
export function extractRequestContext(request) {
  return {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
  };
}

/**
 * 에러 컨텍스트 추출
 *
 * @param {Error} error - 에러 객체
 * @returns {Object} 추출된 컨텍스트
 */
export function extractErrorContext(error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...(error instanceof StudyException && {
      code: error.code,
      severity: error.severity,
      category: error.category,
      retryable: error.retryable
    })
  };
}

// Export default
export default StudyLogger;

