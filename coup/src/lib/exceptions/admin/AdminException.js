/**
 * Admin 영역 예외 클래스
 *
 * @description
 * 관리자 도메인 관련 모든 예외를 처리하는 클래스
 * 100개의 에러 코드 (ADMIN-001 ~ ADMIN-100)
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-02
 */

// ========================================
// BASE CLASS
// ========================================

export class AdminException extends Error {
  /**
   * @param {string} code - 에러 코드
   * @param {string} message - 기본 메시지
   * @param {Object} details - 상세 정보
   */
  constructor(code, message, details = {}) {
    super(message);

    this.name = 'AdminException';
    this.code = code;
    this.message = message;
    this.userMessage = details.userMessage || message;
    this.devMessage = details.devMessage || message;
    this.statusCode = details.statusCode || 400;
    this.retryable = details.retryable ?? false;
    this.severity = details.severity || 'medium'; // 관리자 작업은 기본적으로 medium
    this.timestamp = new Date().toISOString();
    this.context = details.context || {};
    this.category = details.category || 'general';
    this.securityLevel = details.securityLevel || 'normal'; // 보안 레벨 추가

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AdminException);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      devMessage: this.devMessage,
      statusCode: this.statusCode,
      retryable: this.retryable,
      severity: this.severity,
      securityLevel: this.securityLevel,
      timestamp: this.timestamp,
      context: this.context,
      category: this.category,
    };
  }

  toResponse() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.userMessage,
        retryable: this.retryable,
        timestamp: this.timestamp,
      },
    };
  }
}

// ========================================
// SUB CLASSES
// ========================================

/**
 * 관리자 검증 예외
 * 입력값 검증, 데이터 형식 에러
 */
export class AdminValidationException extends AdminException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'validation',
      severity: details.severity || 'low',
      statusCode: details.statusCode || 400
    });
    this.name = 'AdminValidationException';
  }
}

/**
 * 관리자 권한 예외
 * 인증, 인가, 권한 부족 에러
 */
export class AdminPermissionException extends AdminException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'permission',
      severity: details.severity || 'high', // 권한 관련은 high
      statusCode: details.statusCode || 403,
      securityLevel: details.securityLevel || 'high' // 기본값 high, 덮어쓰기 가능
    });
    this.name = 'AdminPermissionException';
  }
}

/**
 * 관리자 비즈니스 로직 예외
 * 처리 규칙, 상태 변경, 워크플로우 에러
 */
export class AdminBusinessException extends AdminException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'business_logic',
      severity: details.severity || 'medium',
      statusCode: details.statusCode || 400
    });
    this.name = 'AdminBusinessException';
  }
}

/**
 * 관리자 데이터베이스 예외
 * DB 쿼리, 트랜잭션, 제약조건 에러
 */
export class AdminDatabaseException extends AdminException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'database',
      severity: details.severity || 'critical',
      statusCode: details.statusCode || 500
    });
    this.name = 'AdminDatabaseException';
  }
}

/**
 * 관리자 사용자 관리 예외
 * 사용자 조회, 정지, 활성화 에러
 */
export class AdminUserException extends AdminException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'user_management',
      severity: details.severity || 'medium',
      statusCode: details.statusCode || 400
    });
    this.name = 'AdminUserException';
  }
}

/**
 * 관리자 신고 처리 예외
 * 신고 조회, 처리, 할당 에러
 */
export class AdminReportException extends AdminException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'report_management',
      severity: details.severity || 'medium',
      statusCode: details.statusCode || 400
    });
    this.name = 'AdminReportException';
  }
}

/**
 * 관리자 설정 예외
 * 시스템 설정, 캐시, 백업 에러
 */
export class AdminSettingsException extends AdminException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'settings',
      severity: details.severity || 'high', // 설정 변경은 중요
      statusCode: details.statusCode || 400,
      securityLevel: 'high'
    });
    this.name = 'AdminSettingsException';
  }
}

// ========================================
// STATIC METHODS - 권한 & 인증 (ADMIN-001 ~ ADMIN-020)
// ========================================

/**
 * ADMIN-001: 관리자 인증 실패
 */
AdminPermissionException.authenticationFailed = function(context = {}) {
  return new AdminPermissionException(
    'ADMIN-001',
    '관리자 인증에 실패했습니다',
    {
      userMessage: '관리자 권한이 필요합니다. 다시 로그인해주세요',
      devMessage: 'Admin authentication failed - invalid or missing credentials',
      statusCode: 401,
      retryable: false,
      severity: 'high',
      securityLevel: 'critical',
      context
    }
  );
};

/**
 * ADMIN-002: 관리자 권한 부족
 */
AdminPermissionException.insufficientPermission = function(requiredPermission, currentRole, context = {}) {
  return new AdminPermissionException(
    'ADMIN-002',
    '해당 작업을 수행할 권한이 없습니다',
    {
      userMessage: '이 작업을 수행할 권한이 없습니다',
      devMessage: `Insufficient permission: required=${requiredPermission}, role=${currentRole}`,
      statusCode: 403,
      retryable: false,
      severity: 'high',
      securityLevel: 'high',
      context: { requiredPermission, currentRole, ...context }
    }
  );
};

/**
 * ADMIN-003: 세션 만료
 */
AdminPermissionException.sessionExpired = function(context = {}) {
  return new AdminPermissionException(
    'ADMIN-003',
    '관리자 세션이 만료되었습니다',
    {
      userMessage: '세션이 만료되었습니다. 다시 로그인해주세요',
      devMessage: 'Admin session has expired',
      statusCode: 401,
      retryable: true,
      severity: 'medium',
      securityLevel: 'high',
      context
    }
  );
};

/**
 * ADMIN-004: IP 주소 차단
 */
AdminPermissionException.ipBlocked = function(ipAddress, context = {}) {
  return new AdminPermissionException(
    'ADMIN-004',
    '접근이 차단된 IP 주소입니다',
    {
      userMessage: '접근이 제한되었습니다. 관리자에게 문의하세요',
      devMessage: `Blocked IP address attempted admin access: ${ipAddress}`,
      statusCode: 403,
      retryable: false,
      severity: 'critical',
      securityLevel: 'critical',
      context: { ipAddress, ...context }
    }
  );
};

/**
 * ADMIN-005: 2단계 인증 필요
 */
AdminPermissionException.twoFactorRequired = function(context = {}) {
  return new AdminPermissionException(
    'ADMIN-005',
    '2단계 인증이 필요합니다',
    {
      userMessage: '보안을 위해 2단계 인증을 완료해주세요',
      devMessage: 'Two-factor authentication required for this admin action',
      statusCode: 403,
      retryable: true,
      severity: 'high',
      securityLevel: 'high',
      context
    }
  );
};

// ========================================
// STATIC METHODS - 사용자 관리 (ADMIN-021 ~ ADMIN-040)
// ========================================

/**
 * ADMIN-021: 사용자를 찾을 수 없음
 */
AdminUserException.userNotFound = function(userId, context = {}) {
  return new AdminUserException(
    'ADMIN-021',
    '사용자를 찾을 수 없습니다',
    {
      userMessage: '해당 사용자를 찾을 수 없습니다',
      devMessage: `User not found: userId=${userId}`,
      statusCode: 404,
      retryable: false,
      severity: 'low',
      context: { userId, ...context }
    }
  );
};

/**
 * ADMIN-022: 유효하지 않은 사용자 상태 변경
 */
AdminUserException.invalidStatusChange = function(currentStatus, targetStatus, context = {}) {
  return new AdminUserException(
    'ADMIN-022',
    '유효하지 않은 상태 변경입니다',
    {
      userMessage: '현재 상태에서 해당 작업을 수행할 수 없습니다',
      devMessage: `Invalid status change: ${currentStatus} -> ${targetStatus}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { currentStatus, targetStatus, ...context }
    }
  );
};

/**
 * ADMIN-023: 사용자 정지 사유 누락
 */
AdminValidationException.suspensionReasonMissing = function(context = {}) {
  return new AdminValidationException(
    'ADMIN-023',
    '정지 사유가 누락되었습니다',
    {
      userMessage: '사용자 정지 사유를 입력해주세요',
      devMessage: 'Suspension reason is required but was not provided',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context
    }
  );
};

/**
 * ADMIN-024: 사용자가 이미 정지됨
 */
AdminUserException.userAlreadySuspended = function(userId, context = {}) {
  return new AdminUserException(
    'ADMIN-024',
    '이미 정지된 사용자입니다',
    {
      userMessage: '해당 사용자는 이미 정지 상태입니다',
      devMessage: `User is already suspended: userId=${userId}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { userId, ...context }
    }
  );
};

/**
 * ADMIN-025: 자기 자신을 정지할 수 없음
 */
AdminBusinessException.cannotSuspendSelf = function(adminId, context = {}) {
  return new AdminBusinessException(
    'ADMIN-025',
    '자기 자신을 정지할 수 없습니다',
    {
      userMessage: '자기 자신에 대해서는 이 작업을 수행할 수 없습니다',
      devMessage: `Admin cannot suspend themselves: adminId=${adminId}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { adminId, ...context }
    }
  );
};

/**
 * ADMIN-026: 다른 관리자를 정지할 권한 없음
 */
AdminPermissionException.cannotSuspendAdmin = function(targetAdminId, context = {}) {
  return new AdminPermissionException(
    'ADMIN-026',
    '다른 관리자를 정지할 권한이 없습니다',
    {
      userMessage: '관리자 계정에 대해서는 이 작업을 수행할 수 없습니다',
      devMessage: `Insufficient permission to suspend admin: targetId=${targetAdminId}`,
      statusCode: 403,
      retryable: false,
      severity: 'high',
      securityLevel: 'high',
      context: { targetAdminId, ...context }
    }
  );
};

/**
 * ADMIN-027: 유효하지 않은 정지 기간
 */
AdminValidationException.invalidSuspensionDuration = function(duration, context = {}) {
  return new AdminValidationException(
    'ADMIN-027',
    '유효하지 않은 정지 기간입니다',
    {
      userMessage: '정지 기간을 올바르게 설정해주세요 (1일 ~ 365일)',
      devMessage: `Invalid suspension duration: ${duration}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { duration, ...context }
    }
  );
};

/**
 * ADMIN-028: 사용자 활성화 실패
 */
AdminUserException.activationFailed = function(userId, reason, context = {}) {
  return new AdminUserException(
    'ADMIN-028',
    '사용자 활성화에 실패했습니다',
    {
      userMessage: '사용자 활성화 중 오류가 발생했습니다',
      devMessage: `Failed to activate user: userId=${userId}, reason=${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'high',
      context: { userId, reason, ...context }
    }
  );
};

/**
 * ADMIN-029: 사용자 삭제 불가
 */
AdminBusinessException.userDeletionNotAllowed = function(userId, reason, context = {}) {
  return new AdminBusinessException(
    'ADMIN-029',
    '사용자를 삭제할 수 없습니다',
    {
      userMessage: '해당 사용자는 삭제할 수 없습니다',
      devMessage: `User deletion not allowed: userId=${userId}, reason=${reason}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { userId, reason, ...context }
    }
  );
};

/**
 * ADMIN-030: 유효하지 않은 검색 조건
 */
AdminValidationException.invalidSearchCriteria = function(criteria, context = {}) {
  return new AdminValidationException(
    'ADMIN-030',
    '유효하지 않은 검색 조건입니다',
    {
      userMessage: '검색 조건을 올바르게 입력해주세요',
      devMessage: `Invalid search criteria: ${JSON.stringify(criteria)}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { criteria, ...context }
    }
  );
};

// ========================================
// STATIC METHODS - 신고 관리 (ADMIN-041 ~ ADMIN-055)
// ========================================

/**
 * ADMIN-041: 신고를 찾을 수 없음
 */
AdminReportException.reportNotFound = function(reportId, context = {}) {
  return new AdminReportException(
    'ADMIN-041',
    '신고를 찾을 수 없습니다',
    {
      userMessage: '해당 신고를 찾을 수 없습니다',
      devMessage: `Report not found: reportId=${reportId}`,
      statusCode: 404,
      retryable: false,
      severity: 'low',
      context: { reportId, ...context }
    }
  );
};

/**
 * ADMIN-042: 신고가 이미 처리됨
 */
AdminReportException.reportAlreadyProcessed = function(reportId, status, context = {}) {
  return new AdminReportException(
    'ADMIN-042',
    '이미 처리된 신고입니다',
    {
      userMessage: '해당 신고는 이미 처리되었습니다',
      devMessage: `Report already processed: reportId=${reportId}, status=${status}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { reportId, status, ...context }
    }
  );
};

/**
 * ADMIN-043: 처리 결과 누락
 */
AdminValidationException.resolutionMissing = function(context = {}) {
  return new AdminValidationException(
    'ADMIN-043',
    '처리 결과가 누락되었습니다',
    {
      userMessage: '신고 처리 결과를 입력해주세요',
      devMessage: 'Report resolution is required but was not provided',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context
    }
  );
};

/**
 * ADMIN-044: 유효하지 않은 신고 상태
 */
AdminValidationException.invalidReportStatus = function(status, validStatuses, context = {}) {
  return new AdminValidationException(
    'ADMIN-044',
    '유효하지 않은 신고 상태입니다',
    {
      userMessage: '올바른 신고 상태를 선택해주세요',
      devMessage: `Invalid report status: ${status}. Valid: ${validStatuses.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { status, validStatuses, ...context }
    }
  );
};

/**
 * ADMIN-045: 신고 할당 실패
 */
AdminReportException.assignmentFailed = function(reportId, adminId, reason, context = {}) {
  return new AdminReportException(
    'ADMIN-045',
    '신고 할당에 실패했습니다',
    {
      userMessage: '신고 할당 중 오류가 발생했습니다',
      devMessage: `Failed to assign report: reportId=${reportId}, adminId=${adminId}, reason=${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'medium',
      context: { reportId, adminId, reason, ...context }
    }
  );
};

/**
 * ADMIN-046: 신고 우선순위 변경 실패
 */
AdminReportException.priorityUpdateFailed = function(reportId, newPriority, context = {}) {
  return new AdminReportException(
    'ADMIN-046',
    '우선순위 변경에 실패했습니다',
    {
      userMessage: '신고 우선순위 변경 중 오류가 발생했습니다',
      devMessage: `Failed to update report priority: reportId=${reportId}, priority=${newPriority}`,
      statusCode: 500,
      retryable: true,
      severity: 'low',
      context: { reportId, newPriority, ...context }
    }
  );
};

// ========================================
// STATIC METHODS - 스터디 관리 (ADMIN-056 ~ ADMIN-070)
// ========================================

/**
 * ADMIN-056: 스터디를 찾을 수 없음
 */
AdminBusinessException.studyNotFound = function(studyId, context = {}) {
  return new AdminBusinessException(
    'ADMIN-056',
    '스터디를 찾을 수 없습니다',
    {
      userMessage: '해당 스터디를 찾을 수 없습니다',
      devMessage: `Study not found: studyId=${studyId}`,
      statusCode: 404,
      retryable: false,
      severity: 'low',
      context: { studyId, ...context }
    }
  );
};

/**
 * ADMIN-057: 스터디 강제 종료 실패
 */
AdminBusinessException.studyClosureFailed = function(studyId, reason, context = {}) {
  return new AdminBusinessException(
    'ADMIN-057',
    '스터디 종료에 실패했습니다',
    {
      userMessage: '스터디 종료 중 오류가 발생했습니다',
      devMessage: `Failed to close study: studyId=${studyId}, reason=${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'high',
      context: { studyId, reason, ...context }
    }
  );
};

/**
 * ADMIN-058: 스터디 숨김 처리 실패
 */
AdminBusinessException.studyHideFailed = function(studyId, reason, context = {}) {
  return new AdminBusinessException(
    'ADMIN-058',
    '스터디 숨김 처리에 실패했습니다',
    {
      userMessage: '스터디 숨김 처리 중 오류가 발생했습니다',
      devMessage: `Failed to hide study: studyId=${studyId}, reason=${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'medium',
      context: { studyId, reason, ...context }
    }
  );
};

/**
 * ADMIN-059: 스터디 삭제 불가
 */
AdminBusinessException.studyDeletionNotAllowed = function(studyId, reason, context = {}) {
  return new AdminBusinessException(
    'ADMIN-059',
    '스터디를 삭제할 수 없습니다',
    {
      userMessage: '해당 스터디는 삭제할 수 없습니다',
      devMessage: `Study deletion not allowed: studyId=${studyId}, reason=${reason}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { studyId, reason, ...context }
    }
  );
};

/**
 * ADMIN-060: 스터디 정보 수정 실패
 */
AdminBusinessException.studyUpdateFailed = function(studyId, reason, context = {}) {
  return new AdminBusinessException(
    'ADMIN-060',
    '스터디 정보 수정에 실패했습니다',
    {
      userMessage: '스터디 정보 수정 중 오류가 발생했습니다',
      devMessage: `Failed to update study: studyId=${studyId}, reason=${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'medium',
      context: { studyId, reason, ...context }
    }
  );
};

// ========================================
// STATIC METHODS - 시스템 설정 (ADMIN-071 ~ ADMIN-085)
// ========================================

/**
 * ADMIN-071: 설정을 찾을 수 없음
 */
AdminSettingsException.settingNotFound = function(settingKey, context = {}) {
  return new AdminSettingsException(
    'ADMIN-071',
    '설정을 찾을 수 없습니다',
    {
      userMessage: '해당 설정을 찾을 수 없습니다',
      devMessage: `Setting not found: key=${settingKey}`,
      statusCode: 404,
      retryable: false,
      severity: 'low',
      context: { settingKey, ...context }
    }
  );
};

/**
 * ADMIN-072: 유효하지 않은 설정 값
 */
AdminValidationException.invalidSettingValue = function(key, value, expectedType, context = {}) {
  return new AdminValidationException(
    'ADMIN-072',
    '유효하지 않은 설정 값입니다',
    {
      userMessage: '설정 값이 올바르지 않습니다',
      devMessage: `Invalid setting value: key=${key}, value=${value}, expected=${expectedType}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { key, value, expectedType, ...context }
    }
  );
};

/**
 * ADMIN-073: 설정 업데이트 실패
 */
AdminSettingsException.settingUpdateFailed = function(key, reason, context = {}) {
  return new AdminSettingsException(
    'ADMIN-073',
    '설정 업데이트에 실패했습니다',
    {
      userMessage: '설정 저장 중 오류가 발생했습니다',
      devMessage: `Failed to update setting: key=${key}, reason=${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'high',
      context: { key, reason, ...context }
    }
  );
};

/**
 * ADMIN-074: 캐시 삭제 실패
 */
AdminSettingsException.cacheClearFailed = function(reason, context = {}) {
  return new AdminSettingsException(
    'ADMIN-074',
    '캐시 삭제에 실패했습니다',
    {
      userMessage: '캐시 삭제 중 오류가 발생했습니다',
      devMessage: `Failed to clear cache: ${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'medium',
      context: { reason, ...context }
    }
  );
};

/**
 * ADMIN-075: 시스템 백업 실패
 */
AdminSettingsException.backupFailed = function(reason, context = {}) {
  return new AdminSettingsException(
    'ADMIN-075',
    '시스템 백업에 실패했습니다',
    {
      userMessage: '시스템 백업 중 오류가 발생했습니다',
      devMessage: `Backup operation failed: ${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'critical',
      context: { reason, ...context }
    }
  );
};

/**
 * ADMIN-076: 위험한 설정 변경
 */
AdminSettingsException.dangerousSettingChange = function(key, oldValue, newValue, context = {}) {
  return new AdminSettingsException(
    'ADMIN-076',
    '위험한 설정 변경입니다',
    {
      userMessage: '이 설정을 변경하면 시스템에 영향을 줄 수 있습니다. 신중히 검토하세요',
      devMessage: `Dangerous setting change detected: key=${key}, old=${oldValue}, new=${newValue}`,
      statusCode: 400,
      retryable: false,
      severity: 'critical',
      securityLevel: 'high',
      context: { key, oldValue, newValue, ...context }
    }
  );
};

// ========================================
// STATIC METHODS - 데이터베이스 & 시스템 (ADMIN-086 ~ ADMIN-100)
// ========================================

/**
 * ADMIN-086: 데이터베이스 연결 실패
 */
AdminDatabaseException.connectionFailed = function(reason, context = {}) {
  return new AdminDatabaseException(
    'ADMIN-086',
    '데이터베이스 연결에 실패했습니다',
    {
      userMessage: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
      devMessage: `Database connection failed: ${reason}`,
      statusCode: 503,
      retryable: true,
      severity: 'critical',
      context: { reason, ...context }
    }
  );
};

/**
 * ADMIN-087: 트랜잭션 실패
 */
AdminDatabaseException.transactionFailed = function(operation, reason, context = {}) {
  return new AdminDatabaseException(
    'ADMIN-087',
    '트랜잭션 처리에 실패했습니다',
    {
      userMessage: '작업 처리 중 오류가 발생했습니다',
      devMessage: `Transaction failed: operation=${operation}, reason=${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'high',
      context: { operation, reason, ...context }
    }
  );
};

/**
 * ADMIN-088: 쿼리 타임아웃
 */
AdminDatabaseException.queryTimeout = function(queryName, timeout, context = {}) {
  return new AdminDatabaseException(
    'ADMIN-088',
    '데이터베이스 쿼리가 시간 초과되었습니다',
    {
      userMessage: '요청 처리 시간이 초과되었습니다. 잠시 후 다시 시도해주세요',
      devMessage: `Query timeout: query=${queryName}, timeout=${timeout}ms`,
      statusCode: 504,
      retryable: true,
      severity: 'high',
      context: { queryName, timeout, ...context }
    }
  );
};

/**
 * ADMIN-089: 제약조건 위반
 */
AdminDatabaseException.constraintViolation = function(constraint, details, context = {}) {
  return new AdminDatabaseException(
    'ADMIN-089',
    '데이터 무결성 제약조건 위반',
    {
      userMessage: '데이터 처리 중 오류가 발생했습니다',
      devMessage: `Constraint violation: ${constraint}, details=${details}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { constraint, details, ...context }
    }
  );
};

/**
 * ADMIN-090: 중복 데이터
 */
AdminDatabaseException.duplicateEntry = function(field, value, context = {}) {
  return new AdminDatabaseException(
    'ADMIN-090',
    '중복된 데이터입니다',
    {
      userMessage: '이미 존재하는 데이터입니다',
      devMessage: `Duplicate entry: field=${field}, value=${value}`,
      statusCode: 409,
      retryable: false,
      severity: 'low',
      context: { field, value, ...context }
    }
  );
};

/**
 * ADMIN-091: 페이지네이션 오류
 */
AdminValidationException.invalidPagination = function(page, limit, context = {}) {
  return new AdminValidationException(
    'ADMIN-091',
    '유효하지 않은 페이지네이션 설정입니다',
    {
      userMessage: '페이지 설정이 올바르지 않습니다',
      devMessage: `Invalid pagination: page=${page}, limit=${limit}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { page, limit, ...context }
    }
  );
};

/**
 * ADMIN-092: 정렬 옵션 오류
 */
AdminValidationException.invalidSorting = function(sortBy, validFields, context = {}) {
  return new AdminValidationException(
    'ADMIN-092',
    '유효하지 않은 정렬 옵션입니다',
    {
      userMessage: '정렬 옵션이 올바르지 않습니다',
      devMessage: `Invalid sorting: sortBy=${sortBy}, valid=${validFields.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { sortBy, validFields, ...context }
    }
  );
};

/**
 * ADMIN-093: 날짜 범위 오류
 */
AdminValidationException.invalidDateRange = function(startDate, endDate, context = {}) {
  return new AdminValidationException(
    'ADMIN-093',
    '유효하지 않은 날짜 범위입니다',
    {
      userMessage: '날짜 범위를 올바르게 설정해주세요',
      devMessage: `Invalid date range: start=${startDate}, end=${endDate}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { startDate, endDate, ...context }
    }
  );
};

/**
 * ADMIN-094: 대용량 데이터 처리 제한
 */
AdminBusinessException.bulkOperationLimitExceeded = function(operation, limit, requested, context = {}) {
  return new AdminBusinessException(
    'ADMIN-094',
    '대용량 데이터 처리 제한을 초과했습니다',
    {
      userMessage: `한 번에 최대 ${limit}개까지만 처리할 수 있습니다`,
      devMessage: `Bulk operation limit exceeded: operation=${operation}, limit=${limit}, requested=${requested}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { operation, limit, requested, ...context }
    }
  );
};

/**
 * ADMIN-095: 감사 로그 기록 실패
 */
AdminDatabaseException.auditLogFailed = function(action, reason, context = {}) {
  return new AdminDatabaseException(
    'ADMIN-095',
    '감사 로그 기록에 실패했습니다',
    {
      userMessage: '작업은 완료되었으나 로그 기록에 실패했습니다',
      devMessage: `Audit log failed: action=${action}, reason=${reason}`,
      statusCode: 500,
      retryable: false,
      severity: 'high',
      securityLevel: 'high',
      context: { action, reason, ...context }
    }
  );
};

/**
 * ADMIN-096: 외부 API 호출 실패
 */
AdminBusinessException.externalApiError = function(apiName, statusCode, message, context = {}) {
  return new AdminBusinessException(
    'ADMIN-096',
    '외부 API 호출에 실패했습니다',
    {
      userMessage: '외부 서비스 연동 중 오류가 발생했습니다',
      devMessage: `External API error: api=${apiName}, status=${statusCode}, message=${message}`,
      statusCode: 502,
      retryable: true,
      severity: 'high',
      context: { apiName, statusCode, message, ...context }
    }
  );
};

/**
 * ADMIN-097: 파일 시스템 오류
 */
AdminBusinessException.fileSystemError = function(operation, path, reason, context = {}) {
  return new AdminBusinessException(
    'ADMIN-097',
    '파일 시스템 오류가 발생했습니다',
    {
      userMessage: '파일 처리 중 오류가 발생했습니다',
      devMessage: `File system error: operation=${operation}, path=${path}, reason=${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'high',
      context: { operation, path, reason, ...context }
    }
  );
};

/**
 * ADMIN-098: 메모리 부족
 */
AdminBusinessException.outOfMemory = function(operation, context = {}) {
  return new AdminBusinessException(
    'ADMIN-098',
    '메모리 부족으로 작업을 완료할 수 없습니다',
    {
      userMessage: '요청한 작업이 너무 큽니다. 범위를 줄여 다시 시도해주세요',
      devMessage: `Out of memory: operation=${operation}`,
      statusCode: 507,
      retryable: false,
      severity: 'critical',
      context: { operation, ...context }
    }
  );
};

/**
 * ADMIN-099: 서비스 이용 불가
 */
AdminBusinessException.serviceUnavailable = function(reason, context = {}) {
  return new AdminBusinessException(
    'ADMIN-099',
    '서비스를 일시적으로 이용할 수 없습니다',
    {
      userMessage: '서비스 점검 중입니다. 잠시 후 다시 시도해주세요',
      devMessage: `Service unavailable: ${reason}`,
      statusCode: 503,
      retryable: true,
      severity: 'critical',
      context: { reason, ...context }
    }
  );
};

/**
 * ADMIN-100: 알 수 없는 오류
 */
AdminException.unknownError = function(originalError, context = {}) {
  return new AdminException(
    'ADMIN-100',
    '알 수 없는 오류가 발생했습니다',
    {
      userMessage: '예기치 않은 오류가 발생했습니다. 관리자에게 문의하세요',
      devMessage: `Unknown error: ${originalError?.message || 'No details available'}`,
      statusCode: 500,
      retryable: true,
      severity: 'critical',
      context: {
        originalError: originalError?.toString(),
        stack: originalError?.stack,
        ...context
      }
    }
  );
};



