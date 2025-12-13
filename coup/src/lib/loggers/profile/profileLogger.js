/**
 * Profile 영역 전용 로거
 * 
 * @description
 * 프로필 관련 로그를 구조화하여 기록하는 로거
 * 에러, 정보, 경고, 보안 이벤트를 분류하여 로깅
 * 
 * @category Logger
 * @author CoUp Team
 * @created 2025-12-01
 */

/**
 * 로그 레벨 정의
 */
const LOG_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SECURITY: 'security',
  DEBUG: 'debug',
};

/**
 * 로그 색상 (콘솔 출력용)
 */
const LOG_COLORS = {
  info: '\x1b[36m',      // Cyan
  warning: '\x1b[33m',   // Yellow
  error: '\x1b[31m',     // Red
  security: '\x1b[35m',  // Magenta
  debug: '\x1b[90m',     // Gray
  reset: '\x1b[0m',      // Reset
};

/**
 * 구조화된 로그 생성
 * 
 * @param {string} level - 로그 레벨
 * @param {string} message - 로그 메시지
 * @param {Object} context - 추가 컨텍스트
 * @returns {Object} 구조화된 로그 객체
 * 
 * @private
 */
function createLog(level, message, context = {}) {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    area: 'profile',
    environment: process.env.NODE_ENV || 'development',
  };
}

/**
 * 로그를 콘솔에 출력
 * 
 * @param {Object} log - 로그 객체
 * @param {string} prefix - 로그 접두사
 * 
 * @private
 */
function printLog(log, prefix) {
  const color = LOG_COLORS[log.level] || LOG_COLORS.reset;
  const resetColor = LOG_COLORS.reset;
  
  if (process.env.NODE_ENV === 'production') {
    // 프로덕션: JSON 형태로 출력
    console.log(JSON.stringify(log));
  } else {
    // 개발 환경: 가독성 좋게 출력
    console.log(
      `${color}[${prefix}]${resetColor}`,
      `${log.timestamp} - ${log.message}`,
      log.context
    );
  }
}

/**
 * 외부 로깅 서비스로 전송 (프로덕션)
 * 
 * @param {Object} log - 로그 객체
 * 
 * @private
 */
async function sendToLoggingService(log) {
  // TODO: 실제 로깅 서비스 연동 (예: Sentry, DataDog, CloudWatch)
  
  // 예시: Sentry
  // if (log.level === LOG_LEVELS.ERROR || log.level === LOG_LEVELS.SECURITY) {
  //   Sentry.captureException(new Error(log.message), {
  //     level: log.level === LOG_LEVELS.SECURITY ? 'warning' : 'error',
  //     tags: {
  //       area: log.area,
  //       code: log.context.code,
  //     },
  //     extra: log.context,
  //   });
  // }
}

/**
 * 보안 모니터링 시스템으로 전송 (프로덕션)
 * 
 * @param {Object} log - 로그 객체
 * 
 * @private
 */
async function sendToSecurityMonitoring(log) {
  // TODO: 보안 모니터링 시스템 연동
  
  // 예시
  // await fetch(process.env.SECURITY_WEBHOOK_URL, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     title: `Security Alert: ${log.message}`,
  //     severity: 'high',
  //     details: log.context,
  //     timestamp: log.timestamp,
  //   }),
  // });
}

/**
 * 프로필 에러 로깅
 * 
 * @param {Error} error - 에러 객체
 * @param {Object} context - 추가 컨텍스트
 * @returns {Object} 로그 객체
 * 
 * @example
 * try {
 *   // some code
 * } catch (error) {
 *   logProfileError(error, { userId: '123', action: 'update_profile' })
 * }
 */
export function logProfileError(error, context = {}) {
  const log = createLog(LOG_LEVELS.ERROR, error.message || 'Unknown error', {
    ...context,
    code: error.code || 'UNKNOWN',
    statusCode: error.statusCode || 500,
    stack: error.stack,
    name: error.name,
  });

  printLog(log, 'PROFILE ERROR');

  // 프로덕션: 외부 로깅 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    sendToLoggingService(log).catch(err => {
      console.error('Failed to send log to external service:', err);
    });
  }

  return log;
}

/**
 * 프로필 정보 로깅
 * 
 * @param {string} message - 로그 메시지
 * @param {Object} context - 추가 컨텍스트
 * @returns {Object} 로그 객체
 * 
 * @example
 * logProfileInfo('Profile updated successfully', { 
 *   userId: '123', 
 *   fields: ['name', 'bio'] 
 * })
 */
export function logProfileInfo(message, context = {}) {
  const log = createLog(LOG_LEVELS.INFO, message, context);

  printLog(log, 'PROFILE INFO');

  return log;
}

/**
 * 프로필 경고 로깅
 * 
 * @param {string} message - 로그 메시지
 * @param {Object} context - 추가 컨텍스트
 * @returns {Object} 로그 객체
 * 
 * @example
 * logProfileWarning('Profile update rate limit approaching', { 
 *   userId: '123', 
 *   count: 8, 
 *   limit: 10 
 * })
 */
export function logProfileWarning(message, context = {}) {
  const log = createLog(LOG_LEVELS.WARNING, message, context);

  printLog(log, 'PROFILE WARNING');

  // 프로덕션: 중요한 경고는 외부로 전송
  if (process.env.NODE_ENV === 'production' && context.severity === 'high') {
    sendToLoggingService(log).catch(err => {
      console.error('Failed to send warning to external service:', err);
    });
  }

  return log;
}

/**
 * 보안 이벤트 로깅
 * 
 * @param {string} eventType - 이벤트 타입
 * @param {Object} context - 추가 컨텍스트
 * @returns {Object} 로그 객체
 * 
 * @example
 * logProfileSecurity('XSS_DETECTED', { 
 *   userId: '123', 
 *   field: 'bio', 
 *   value: '<script>alert(1)</script>' 
 * })
 */
export function logProfileSecurity(eventType, context = {}) {
  const log = createLog(LOG_LEVELS.SECURITY, `Security event: ${eventType}`, {
    ...context,
    eventType,
    severity: context.severity || 'high',
    ipAddress: context.ipAddress || 'unknown',
    userAgent: context.userAgent || 'unknown',
  });

  printLog(log, 'PROFILE SECURITY');

  // 프로덕션: 보안 이벤트는 즉시 전송
  if (process.env.NODE_ENV === 'production') {
    sendToSecurityMonitoring(log).catch(err => {
      console.error('Failed to send security event:', err);
    });
  }

  return log;
}

/**
 * 디버그 로깅 (개발 환경에서만)
 * 
 * @param {string} message - 로그 메시지
 * @param {Object} context - 추가 컨텍스트
 * @returns {Object|null} 로그 객체 (개발 환경) 또는 null (프로덕션)
 * 
 * @example
 * logProfileDebug('Validation result', { 
 *   valid: true, 
 *   field: 'name' 
 * })
 */
export function logProfileDebug(message, context = {}) {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const log = createLog(LOG_LEVELS.DEBUG, message, context);

  printLog(log, 'PROFILE DEBUG');

  return log;
}

/**
 * 프로필 업데이트 이벤트 로깅
 * 
 * @param {string} userId - 사용자 ID
 * @param {string[]} fields - 업데이트된 필드 목록
 * @param {Object} additionalContext - 추가 컨텍스트
 * 
 * @example
 * logProfileUpdate('user123', ['name', 'bio'], { source: 'web' })
 */
export function logProfileUpdate(userId, fields, additionalContext = {}) {
  return logProfileInfo('Profile updated', {
    userId,
    fields,
    fieldCount: fields.length,
    ...additionalContext,
  });
}

/**
 * 아바타 업로드 이벤트 로깅
 * 
 * @param {string} userId - 사용자 ID
 * @param {Object} fileInfo - 파일 정보
 * @param {Object} additionalContext - 추가 컨텍스트
 * 
 * @example
 * logAvatarUpload('user123', { 
 *   size: 1024000, 
 *   type: 'image/png' 
 * })
 */
export function logAvatarUpload(userId, fileInfo, additionalContext = {}) {
  return logProfileInfo('Avatar uploaded', {
    userId,
    fileSize: fileInfo.size,
    fileType: fileInfo.type,
    fileName: fileInfo.name,
    ...additionalContext,
  });
}

/**
 * 비밀번호 변경 이벤트 로깅
 * 
 * @param {string} userId - 사용자 ID
 * @param {boolean} success - 성공 여부
 * @param {Object} additionalContext - 추가 컨텍스트
 * 
 * @example
 * logPasswordChange('user123', true, { method: '2fa' })
 */
export function logPasswordChange(userId, success, additionalContext = {}) {
  const level = success ? LOG_LEVELS.INFO : LOG_LEVELS.WARNING;
  const message = success ? 'Password changed successfully' : 'Password change failed';

  const log = createLog(level, message, {
    userId,
    success,
    ...additionalContext,
  });

  printLog(log, success ? 'PROFILE INFO' : 'PROFILE WARNING');

  return log;
}

/**
 * 계정 삭제 이벤트 로깅
 * 
 * @param {string} userId - 사용자 ID
 * @param {string} reason - 삭제 이유
 * @param {Object} additionalContext - 추가 컨텍스트
 * 
 * @example
 * logAccountDeletion('user123', 'user_request', { 
 *   studyCount: 0, 
 *   taskCount: 0 
 * })
 */
export function logAccountDeletion(userId, reason, additionalContext = {}) {
  return logProfileInfo('Account deleted', {
    userId,
    reason,
    deletedAt: new Date().toISOString(),
    ...additionalContext,
  });
}

/**
 * Rate Limit 초과 이벤트 로깅
 * 
 * @param {string} userId - 사용자 ID
 * @param {string} action - 액션 타입
 * @param {number} count - 현재 카운트
 * @param {number} limit - 제한값
 * 
 * @example
 * logRateLimitExceeded('user123', 'profile_update', 11, 10)
 */
export function logRateLimitExceeded(userId, action, count, limit) {
  return logProfileWarning('Rate limit exceeded', {
    userId,
    action,
    count,
    limit,
    severity: 'medium',
  });
}

/**
 * 프로필 조회 이벤트 로깅
 * 
 * @param {string} viewerId - 조회자 ID
 * @param {string} profileId - 프로필 소유자 ID
 * @param {Object} additionalContext - 추가 컨텍스트
 * 
 * @example
 * logProfileView('user123', 'user456', { source: 'search' })
 */
export function logProfileView(viewerId, profileId, additionalContext = {}) {
  return logProfileDebug('Profile viewed', {
    viewerId,
    profileId,
    ...additionalContext,
  });
}

/**
 * 로그 필터링 헬퍼
 * 
 * @param {Object[]} logs - 로그 배열
 * @param {string} level - 필터링할 레벨
 * @returns {Object[]} 필터링된 로그 배열
 */
export function filterLogsByLevel(logs, level) {
  return logs.filter(log => log.level === level);
}

/**
 * 로그 검색 헬퍼
 * 
 * @param {Object[]} logs - 로그 배열
 * @param {string} keyword - 검색 키워드
 * @returns {Object[]} 검색된 로그 배열
 */
export function searchLogs(logs, keyword) {
  const lowerKeyword = keyword.toLowerCase();
  return logs.filter(log => 
    log.message.toLowerCase().includes(lowerKeyword) ||
    JSON.stringify(log.context).toLowerCase().includes(lowerKeyword)
  );
}

/**
 * 로그 통계 생성
 * 
 * @param {Object[]} logs - 로그 배열
 * @returns {Object} 통계 객체
 */
export function getLogStatistics(logs) {
  const stats = {
    total: logs.length,
    byLevel: {},
    byArea: {},
    timeRange: {
      start: null,
      end: null,
    },
  };

  logs.forEach(log => {
    // 레벨별 카운트
    stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

    // 영역별 카운트
    stats.byArea[log.area] = (stats.byArea[log.area] || 0) + 1;

    // 시간 범위
    const timestamp = new Date(log.timestamp);
    if (!stats.timeRange.start || timestamp < new Date(stats.timeRange.start)) {
      stats.timeRange.start = log.timestamp;
    }
    if (!stats.timeRange.end || timestamp > new Date(stats.timeRange.end)) {
      stats.timeRange.end = log.timestamp;
    }
  });

  return stats;
}

/**
 * 로그 레벨 상수 export
 */
export { LOG_LEVELS };
