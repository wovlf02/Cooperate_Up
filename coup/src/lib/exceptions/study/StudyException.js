/**
 * Study 영역 예외 클래스
 *
 * @description
 * 스터디 관련 모든 예외를 처리하는 클래스
 * 115개의 에러 코드 (STUDY-001 ~ STUDY-115)
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-01
 */

// ========================================
// BASE CLASS
// ========================================

export class StudyException extends Error {
  /**
   * @param {string} code - 에러 코드
   * @param {string} message - 기본 메시지
   * @param {Object} details - 상세 정보
   */
  constructor(code, message, details = {}) {
    super(message);

    this.name = 'StudyException';
    this.code = code;
    this.message = message;
    this.userMessage = details.userMessage || message;
    this.devMessage = details.devMessage || message;
    this.statusCode = details.statusCode || 400;
    this.retryable = details.retryable ?? false;
    this.severity = details.severity || 'low';
    this.timestamp = new Date().toISOString();
    this.context = details.context || {};
    this.category = details.category || 'general';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StudyException);
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
 * 스터디 검증 예외
 * 생성, 수정 시 입력값 검증 에러
 */
export class StudyValidationException extends StudyException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'validation',
      severity: details.severity || 'low',
      statusCode: details.statusCode || 400
    });
    this.name = 'StudyValidationException';
  }
}

/**
 * 스터디 권한 예외
 * 접근 권한, 역할 권한 관련 에러
 */
export class StudyPermissionException extends StudyException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'permission',
      severity: details.severity || 'medium',
      statusCode: details.statusCode || 403
    });
    this.name = 'StudyPermissionException';
  }
}

/**
 * 스터디 멤버 예외
 * 멤버 관리, 강퇴, 역할 변경 에러
 */
export class StudyMemberException extends StudyException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'member',
      severity: details.severity || 'medium',
      statusCode: details.statusCode || 400
    });
    this.name = 'StudyMemberException';
  }
}

/**
 * 스터디 가입 신청 예외
 * 가입, 승인, 거절 관련 에러
 */
export class StudyApplicationException extends StudyException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'application',
      severity: details.severity || 'medium',
      statusCode: details.statusCode || 400
    });
    this.name = 'StudyApplicationException';
  }
}

/**
 * 스터디 비즈니스 로직 예외
 * 정원, 상태, 탈퇴 등 비즈니스 규칙 에러
 */
export class StudyBusinessException extends StudyException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'business_logic',
      severity: details.severity || 'high',
      statusCode: details.statusCode || 400
    });
    this.name = 'StudyBusinessException';
  }
}

/**
 * 스터디 파일 예외
 * 파일 업로드, 다운로드, 관리 에러
 */
export class StudyFileException extends StudyException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'file',
      severity: details.severity || 'medium',
      statusCode: details.statusCode || 400
    });
    this.name = 'StudyFileException';
  }
}

/**
 * 스터디 공지사항 예외
 * 공지사항 생성, 수정, 삭제, 권한 에러
 */
export class StudyNoticeException extends StudyException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'notice',
      severity: details.severity || 'low',
      statusCode: details.statusCode || 400
    });
    this.name = 'StudyNoticeException';
  }
}

/**
 * 스터디 추가 기능 예외
 * 할일, 채팅, 일정 에러
 */
export class StudyFeatureException extends StudyException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'feature',
      severity: details.severity || 'low',
      statusCode: details.statusCode || 400
    });
    this.name = 'StudyFeatureException';
  }
}

/**
 * 스터디 데이터베이스 예외
 * 트랜잭션, 제약조건, 동기화 에러
 */
export class StudyDatabaseException extends StudyException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'database',
      severity: details.severity || 'critical',
      statusCode: details.statusCode || 500
    });
    this.name = 'StudyDatabaseException';
  }
}

// ========================================
// STATIC METHODS - PHASE 1: 핵심 예외 (50개)
// ========================================

// A. Creation & Validation Errors (001-025)

/**
 * STUDY-001: 스터디 이름 누락
 */
StudyValidationException.studyNameMissing = function(context = {}) {
  return new StudyValidationException(
    'STUDY-001',
    '스터디 이름이 누락되었습니다',
    {
      userMessage: '스터디 이름을 입력해주세요',
      devMessage: 'Study name is required but was not provided',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'validation'
    }
  );
};

/**
 * STUDY-002: 스터디 이름 길이 오류
 */
StudyValidationException.invalidStudyNameLength = function(name, constraints = { min: 2, max: 50 }) {
  return new StudyValidationException(
    'STUDY-002',
    '스터디 이름 길이가 올바르지 않습니다',
    {
      userMessage: `스터디 이름은 ${constraints.min}자 이상 ${constraints.max}자 이하로 입력해주세요`,
      devMessage: `Study name length validation failed: actual=${name?.length}, required=${constraints.min}-${constraints.max}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { name, constraints, actualLength: name?.length },
      category: 'validation'
    }
  );
};

/**
 * STUDY-003: 스터디 이름 특수문자 포함
 */
StudyValidationException.invalidStudyNameFormat = function(name, context = {}) {
  return new StudyValidationException(
    'STUDY-003',
    '스터디 이름에 사용할 수 없는 문자가 포함되었습니다',
    {
      userMessage: '스터디 이름에는 특수문자를 사용할 수 없습니다',
      devMessage: `Study name contains invalid characters: ${name}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { name, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-004: 스터디 이름 중복
 */
StudyValidationException.duplicateStudyName = function(name, context = {}) {
  return new StudyValidationException(
    'STUDY-004',
    '이미 사용 중인 스터디 이름입니다',
    {
      userMessage: '이미 사용 중인 스터디 이름입니다. 다른 이름을 사용해주세요',
      devMessage: `Duplicate study name: ${name}`,
      statusCode: 409,
      retryable: false,
      severity: 'low',
      context: { name, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-005: 스터디 설명 누락
 */
StudyValidationException.studyDescriptionMissing = function(context = {}) {
  return new StudyValidationException(
    'STUDY-005',
    '스터디 설명이 누락되었습니다',
    {
      userMessage: '스터디 설명을 입력해주세요',
      devMessage: 'Study description is required but was not provided',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'validation'
    }
  );
};

/**
 * STUDY-006: 스터디 설명 길이 오류
 */
StudyValidationException.invalidDescriptionLength = function(description, constraints = { min: 10, max: 500 }) {
  return new StudyValidationException(
    'STUDY-006',
    '스터디 설명 길이가 올바르지 않습니다',
    {
      userMessage: `스터디 설명은 ${constraints.min}자 이상 ${constraints.max}자 이하로 입력해주세요`,
      devMessage: `Description length validation failed: actual=${description?.length}, required=${constraints.min}-${constraints.max}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { description, constraints, actualLength: description?.length },
      category: 'validation'
    }
  );
};

/**
 * STUDY-007: 유효하지 않은 카테고리
 */
StudyValidationException.invalidCategory = function(category, validCategories = [], context = {}) {
  return new StudyValidationException(
    'STUDY-007',
    '유효하지 않은 카테고리입니다',
    {
      userMessage: '올바른 카테고리를 선택해주세요',
      devMessage: `Invalid category: ${category}. Valid categories: ${validCategories.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { category, validCategories, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-008: 카테고리 누락
 */
StudyValidationException.categoryMissing = function(context = {}) {
  return new StudyValidationException(
    'STUDY-008',
    '카테고리가 누락되었습니다',
    {
      userMessage: '스터디 카테고리를 선택해주세요',
      devMessage: 'Study category is required but was not provided',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'validation'
    }
  );
};

/**
 * STUDY-009: 최대 인원 범위 초과
 */
StudyValidationException.invalidMaxMembers = function(maxMembers, constraints = { min: 2, max: 100 }) {
  return new StudyValidationException(
    'STUDY-009',
    '최대 인원 설정이 올바르지 않습니다',
    {
      userMessage: `최대 인원은 ${constraints.min}명 이상 ${constraints.max}명 이하로 설정해주세요`,
      devMessage: `Invalid maxMembers: ${maxMembers}. Valid range: ${constraints.min}-${constraints.max}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { maxMembers, constraints },
      category: 'validation'
    }
  );
};

/**
 * STUDY-010: 최대 인원이 현재 멤버보다 적음
 */
StudyValidationException.maxMembersLessThanCurrent = function(maxMembers, currentMembers, context = {}) {
  return new StudyValidationException(
    'STUDY-010',
    '최대 인원을 현재 멤버 수보다 적게 설정할 수 없습니다',
    {
      userMessage: `최대 인원은 현재 멤버 수(${currentMembers}명)보다 많아야 합니다`,
      devMessage: `Cannot set maxMembers (${maxMembers}) less than current members (${currentMembers})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { maxMembers, currentMembers, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-011: 유효하지 않은 모집 상태
 */
StudyValidationException.invalidRecruitmentStatus = function(status, validStatuses = [], context = {}) {
  return new StudyValidationException(
    'STUDY-011',
    '유효하지 않은 모집 상태입니다',
    {
      userMessage: '올바른 모집 상태를 선택해주세요',
      devMessage: `Invalid recruitment status: ${status}. Valid statuses: ${validStatuses.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { status, validStatuses, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-012: 이미지 URL 형식 오류
 */
StudyValidationException.invalidImageUrl = function(url, context = {}) {
  return new StudyValidationException(
    'STUDY-012',
    '이미지 URL 형식이 올바르지 않습니다',
    {
      userMessage: '올바른 이미지 URL을 입력해주세요',
      devMessage: `Invalid image URL format: ${url}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { url, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-013: 태그 개수 초과
 */
StudyValidationException.tooManyTags = function(tags, maxTags = 10, context = {}) {
  return new StudyValidationException(
    'STUDY-013',
    '태그 개수가 초과되었습니다',
    {
      userMessage: `태그는 최대 ${maxTags}개까지 추가할 수 있습니다`,
      devMessage: `Too many tags: ${tags?.length} (max: ${maxTags})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { tags, maxTags, actualCount: tags?.length, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-014: 태그 길이 초과
 */
StudyValidationException.tagTooLong = function(tag, maxLength = 20, context = {}) {
  return new StudyValidationException(
    'STUDY-014',
    '태그 길이가 초과되었습니다',
    {
      userMessage: `각 태그는 최대 ${maxLength}자까지 입력할 수 있습니다`,
      devMessage: `Tag too long: ${tag?.length} chars (max: ${maxLength})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { tag, maxLength, actualLength: tag?.length, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-015: 수정 권한 없음
 */
StudyPermissionException.cannotModifyStudy = function(userId, requiredRole = 'OWNER', context = {}) {
  return new StudyPermissionException(
    'STUDY-015',
    '스터디 정보를 수정할 권한이 없습니다',
    {
      userMessage: '스터디 정보는 스터디장만 수정할 수 있습니다',
      devMessage: `User ${userId} lacks permission to modify study. Required role: ${requiredRole}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, requiredRole, ...context },
      category: 'permission'
    }
  );
};

/**
 * STUDY-016: 필수 필드 삭제 시도
 */
StudyValidationException.cannotDeleteRequiredField = function(field, context = {}) {
  return new StudyValidationException(
    'STUDY-016',
    '필수 필드를 삭제할 수 없습니다',
    {
      userMessage: `${field}는 필수 항목이므로 삭제할 수 없습니다`,
      devMessage: `Cannot delete required field: ${field}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { field, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-017: 수정할 내용 없음
 */
StudyValidationException.noChangesToUpdate = function(context = {}) {
  return new StudyValidationException(
    'STUDY-017',
    '수정할 내용이 없습니다',
    {
      userMessage: '변경된 내용이 없습니다',
      devMessage: 'No changes detected in update request',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'validation'
    }
  );
};

/**
 * STUDY-018: 동시 수정 충돌
 */
StudyValidationException.concurrentModificationConflict = function(studyId, context = {}) {
  return new StudyValidationException(
    'STUDY-018',
    '동시 수정으로 인한 충돌이 발생했습니다',
    {
      userMessage: '다른 사용자가 수정 중입니다. 잠시 후 다시 시도해주세요',
      devMessage: `Concurrent modification detected for study ${studyId}`,
      statusCode: 409,
      retryable: true,
      severity: 'medium',
      context: { studyId, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-019: 변경 불가 필드 수정 시도
 */
StudyValidationException.cannotModifyField = function(field, reason = '', context = {}) {
  return new StudyValidationException(
    'STUDY-019',
    '변경할 수 없는 필드입니다',
    {
      userMessage: `${field}는 변경할 수 없습니다${reason ? ': ' + reason : ''}`,
      devMessage: `Field ${field} cannot be modified`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { field, reason, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-020: 스터디 삭제 실패 (활성 멤버 존재)
 */
StudyBusinessException.cannotDeleteStudyWithActiveMembers = function(studyId, memberCount, context = {}) {
  return new StudyBusinessException(
    'STUDY-020',
    '활성 멤버가 있어 스터디를 삭제할 수 없습니다',
    {
      userMessage: `현재 ${memberCount}명의 멤버가 활동 중입니다. 모든 멤버를 내보낸 후 삭제해주세요`,
      devMessage: `Cannot delete study ${studyId} with ${memberCount} active members`,
      statusCode: 400,
      retryable: false,
      severity: 'high',
      context: { studyId, memberCount, ...context },
      category: 'business_logic'
    }
  );
};

/**
 * STUDY-021: 이모지 형식 오류
 */
StudyValidationException.invalidEmojiFormat = function(emoji, context = {}) {
  return new StudyValidationException(
    'STUDY-021',
    '이모지 형식이 올바르지 않습니다',
    {
      userMessage: '올바른 이모지를 선택해주세요',
      devMessage: `Invalid emoji format: ${emoji}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { emoji, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-022: 서브 카테고리 불일치
 */
StudyValidationException.subcategoryMismatch = function(category, subcategory, context = {}) {
  return new StudyValidationException(
    'STUDY-022',
    '서브 카테고리가 카테고리와 일치하지 않습니다',
    {
      userMessage: '선택한 카테고리에 맞는 서브 카테고리를 선택해주세요',
      devMessage: `Subcategory ${subcategory} does not match category ${category}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { category, subcategory, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-023: 유효하지 않은 자동승인 설정
 */
StudyValidationException.invalidAutoApprovalSetting = function(value, context = {}) {
  return new StudyValidationException(
    'STUDY-023',
    '자동승인 설정이 올바르지 않습니다',
    {
      userMessage: '자동승인 설정을 올바르게 선택해주세요',
      devMessage: `Invalid auto approval setting: ${value}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { value, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-024: 스터디를 찾을 수 없음
 */
StudyValidationException.studyNotFound = function(studyId, context = {}) {
  return new StudyValidationException(
    'STUDY-024',
    '스터디를 찾을 수 없습니다',
    {
      userMessage: '존재하지 않는 스터디입니다',
      devMessage: `Study not found: ${studyId}`,
      statusCode: 404,
      retryable: false,
      severity: 'medium',
      context: { studyId, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-025: 스터디 상태 전이 오류
 */
StudyBusinessException.invalidStateTransition = function(currentState, newState, context = {}) {
  return new StudyBusinessException(
    'STUDY-025',
    '유효하지 않은 상태 전환입니다',
    {
      userMessage: `현재 상태에서 ${newState}(으)로 변경할 수 없습니다`,
      devMessage: `Invalid state transition: ${currentState} -> ${newState}`,
      statusCode: 400,
      retryable: false,
      severity: 'high',
      context: { currentState, newState, ...context },
      category: 'business_logic'
    }
  );
};

// B. Member Management Errors (026-053)

/**
 * STUDY-026: 스터디 멤버가 아님
 */
StudyPermissionException.notStudyMember = function(userId, studyId, context = {}) {
  return new StudyPermissionException(
    'STUDY-026',
    '스터디 멤버가 아닙니다',
    {
      userMessage: '스터디 멤버만 접근할 수 있습니다',
      devMessage: `User ${userId} is not a member of study ${studyId}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, studyId, ...context },
      category: 'permission'
    }
  );
};

/**
 * STUDY-027: 활성 멤버가 아님
 */
StudyPermissionException.notActiveMember = function(userId, studyId, memberStatus, context = {}) {
  return new StudyPermissionException(
    'STUDY-027',
    '활성 멤버가 아닙니다',
    {
      userMessage: '활성 멤버만 이 작업을 수행할 수 있습니다',
      devMessage: `User ${userId} is not an active member. Current status: ${memberStatus}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, studyId, memberStatus, ...context },
      category: 'permission'
    }
  );
};

/**
 * STUDY-028: 권한 불충분 (ADMIN 필요)
 */
StudyPermissionException.adminPermissionRequired = function(userId, actualRole, context = {}) {
  return new StudyPermissionException(
    'STUDY-028',
    '관리자 권한이 필요합니다',
    {
      userMessage: '이 작업은 관리자만 수행할 수 있습니다',
      devMessage: `User ${userId} lacks admin permission. Actual role: ${actualRole}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, actualRole, requiredRole: 'ADMIN', ...context },
      category: 'permission'
    }
  );
};

/**
 * STUDY-029: 권한 불충분 (OWNER 필요)
 */
StudyPermissionException.ownerPermissionRequired = function(userId, actualRole, context = {}) {
  return new StudyPermissionException(
    'STUDY-029',
    '스터디장 권한이 필요합니다',
    {
      userMessage: '이 작업은 스터디장만 수행할 수 있습니다',
      devMessage: `User ${userId} lacks owner permission. Actual role: ${actualRole}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, actualRole, requiredRole: 'OWNER', ...context },
      category: 'permission'
    }
  );
};

/**
 * STUDY-030: 역할 계층 위반
 */
StudyPermissionException.roleHierarchyViolation = function(actorRole, targetRole, context = {}) {
  return new StudyPermissionException(
    'STUDY-030',
    '역할 계층 위반입니다',
    {
      userMessage: '자신보다 높은 권한의 멤버를 관리할 수 없습니다',
      devMessage: `Role hierarchy violation: ${actorRole} cannot manage ${targetRole}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { actorRole, targetRole, ...context },
      category: 'permission'
    }
  );
};

/**
 * STUDY-031: OWNER는 1명만 가능
 */
StudyMemberException.multipleOwnersNotAllowed = function(studyId, context = {}) {
  return new StudyMemberException(
    'STUDY-031',
    '스터디장은 1명만 가능합니다',
    {
      userMessage: '스터디장은 1명만 지정할 수 있습니다',
      devMessage: `Study ${studyId} can only have one owner`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { studyId, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-032: OWNER 역할 변경 불가
 */
StudyMemberException.cannotChangeOwnerRole = function(userId, context = {}) {
  return new StudyMemberException(
    'STUDY-032',
    '스터디장 역할을 변경할 수 없습니다',
    {
      userMessage: '스터디장 역할은 위임만 가능합니다',
      devMessage: `Cannot change owner role for user ${userId}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { userId, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-033: 본인 역할 변경 불가
 */
StudyMemberException.cannotChangeSelfRole = function(userId, context = {}) {
  return new StudyMemberException(
    'STUDY-033',
    '본인의 역할을 변경할 수 없습니다',
    {
      userMessage: '자신의 역할은 다른 관리자에게 요청해주세요',
      devMessage: `User ${userId} cannot change their own role`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { userId, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-034: 유효하지 않은 역할
 */
StudyMemberException.invalidRole = function(role, validRoles = [], context = {}) {
  return new StudyMemberException(
    'STUDY-034',
    '유효하지 않은 역할입니다',
    {
      userMessage: '올바른 역할을 선택해주세요',
      devMessage: `Invalid role: ${role}. Valid roles: ${validRoles.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { role, validRoles, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-035: 역할 업그레이드 권한 없음
 */
StudyPermissionException.cannotUpgradeRole = function(fromRole, toRole, context = {}) {
  return new StudyPermissionException(
    'STUDY-035',
    '역할 업그레이드 권한이 없습니다',
    {
      userMessage: '이 역할로 승격시킬 권한이 없습니다',
      devMessage: `Cannot upgrade role from ${fromRole} to ${toRole}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { fromRole, toRole, ...context },
      category: 'permission'
    }
  );
};

/**
 * STUDY-036: 멤버를 찾을 수 없음
 */
StudyMemberException.memberNotFound = function(userId, studyId, context = {}) {
  return new StudyMemberException(
    'STUDY-036',
    '멤버를 찾을 수 없습니다',
    {
      userMessage: '해당 멤버를 찾을 수 없습니다',
      devMessage: `Member ${userId} not found in study ${studyId}`,
      statusCode: 404,
      retryable: false,
      severity: 'medium',
      context: { userId, studyId, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-037: 자기 자신 강퇴 불가
 */
StudyMemberException.cannotKickSelf = function(userId, context = {}) {
  return new StudyMemberException(
    'STUDY-037',
    '자기 자신을 강퇴할 수 없습니다',
    {
      userMessage: '자신을 강퇴할 수 없습니다. 탈퇴를 이용해주세요',
      devMessage: `User ${userId} attempted to kick themselves`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { userId, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-038: OWNER 강퇴 불가
 */
StudyMemberException.cannotKickOwner = function(ownerId, context = {}) {
  return new StudyMemberException(
    'STUDY-038',
    '스터디장을 강퇴할 수 없습니다',
    {
      userMessage: '스터디장은 강퇴할 수 없습니다',
      devMessage: `Cannot kick owner ${ownerId}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { ownerId, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-039: ADMIN이 다른 ADMIN 강퇴 불가
 */
StudyMemberException.cannotKickAdminAsAdmin = function(actorId, targetId, context = {}) {
  return new StudyMemberException(
    'STUDY-039',
    '관리자는 다른 관리자를 강퇴할 수 없습니다',
    {
      userMessage: '관리자는 다른 관리자를 강퇴할 수 없습니다',
      devMessage: `Admin ${actorId} cannot kick another admin ${targetId}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { actorId, targetId, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-040: 이미 강퇴된 멤버
 */
StudyMemberException.memberAlreadyKicked = function(userId, studyId, context = {}) {
  return new StudyMemberException(
    'STUDY-040',
    '이미 강퇴된 멤버입니다',
    {
      userMessage: '이미 강퇴된 멤버입니다',
      devMessage: `Member ${userId} is already kicked from study ${studyId}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { userId, studyId, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-041: 탈퇴한 멤버 강퇴 불가
 */
StudyMemberException.cannotKickLeftMember = function(userId, context = {}) {
  return new StudyMemberException(
    'STUDY-041',
    '탈퇴한 멤버는 강퇴할 수 없습니다',
    {
      userMessage: '이미 탈퇴한 멤버입니다',
      devMessage: `Cannot kick member ${userId} who has already left`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { userId, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-042: 강퇴 사유 너무 김
 */
StudyMemberException.kickReasonTooLong = function(reason, maxLength = 200, context = {}) {
  return new StudyMemberException(
    'STUDY-042',
    '강퇴 사유가 너무 깁니다',
    {
      userMessage: `강퇴 사유는 최대 ${maxLength}자까지 입력할 수 있습니다`,
      devMessage: `Kick reason too long: ${reason?.length} chars (max: ${maxLength})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { reason, maxLength, actualLength: reason?.length, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-043: 멤버 상태 업데이트 실패
 */
StudyMemberException.memberStatusUpdateFailed = function(userId, newStatus, context = {}) {
  return new StudyMemberException(
    'STUDY-043',
    '멤버 상태 업데이트에 실패했습니다',
    {
      userMessage: '멤버 상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요',
      devMessage: `Failed to update member ${userId} status to ${newStatus}`,
      statusCode: 500,
      retryable: true,
      severity: 'high',
      context: { userId, newStatus, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-044: 유효하지 않은 역할 필터
 */
StudyMemberException.invalidRoleFilter = function(role, validRoles = [], context = {}) {
  return new StudyMemberException(
    'STUDY-044',
    '유효하지 않은 역할 필터입니다',
    {
      userMessage: '올바른 역할을 선택해주세요',
      devMessage: `Invalid role filter: ${role}. Valid: ${validRoles.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { role, validRoles, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-045: 유효하지 않은 상태 필터
 */
StudyMemberException.invalidStatusFilter = function(status, validStatuses = [], context = {}) {
  return new StudyMemberException(
    'STUDY-045',
    '유효하지 않은 상태 필터입니다',
    {
      userMessage: '올바른 상태를 선택해주세요',
      devMessage: `Invalid status filter: ${status}. Valid: ${validStatuses.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { status, validStatuses, ...context },
      category: 'member'
    }
  );
};

/**
 * STUDY-046: 페이지 번호 범위 오류
 */
StudyValidationException.invalidPageNumber = function(page, context = {}) {
  return new StudyValidationException(
    'STUDY-046',
    '페이지 번호가 올바르지 않습니다',
    {
      userMessage: '올바른 페이지 번호를 입력해주세요',
      devMessage: `Invalid page number: ${page} (must be >= 1)`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { page, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-047: 페이지 크기 범위 오류
 */
StudyValidationException.invalidPageSize = function(pageSize, constraints = { min: 1, max: 100 }, context = {}) {
  return new StudyValidationException(
    'STUDY-047',
    '페이지 크기가 올바르지 않습니다',
    {
      userMessage: `페이지 크기는 ${constraints.min}-${constraints.max} 사이여야 합니다`,
      devMessage: `Invalid page size: ${pageSize} (valid: ${constraints.min}-${constraints.max})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { pageSize, constraints, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-048: 정렬 필드 유효하지 않음
 */
StudyValidationException.invalidSortField = function(field, validFields = [], context = {}) {
  return new StudyValidationException(
    'STUDY-048',
    '정렬 필드가 유효하지 않습니다',
    {
      userMessage: '올바른 정렬 기준을 선택해주세요',
      devMessage: `Invalid sort field: ${field}. Valid: ${validFields.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { field, validFields, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-049: 정렬 방향 유효하지 않음
 */
StudyValidationException.invalidSortDirection = function(direction, context = {}) {
  return new StudyValidationException(
    'STUDY-049',
    '정렬 방향이 유효하지 않습니다',
    {
      userMessage: '올바른 정렬 방향을 선택해주세요',
      devMessage: `Invalid sort direction: ${direction} (valid: asc, desc)`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { direction, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-050: 검색어 너무 짧음
 */
StudyValidationException.searchQueryTooShort = function(query, minLength = 2, context = {}) {
  return new StudyValidationException(
    'STUDY-050',
    '검색어가 너무 짧습니다',
    {
      userMessage: `검색어는 최소 ${minLength}자 이상 입력해주세요`,
      devMessage: `Search query too short: ${query?.length} chars (min: ${minLength})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { query, minLength, actualLength: query?.length, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-051: 검색어 너무 김
 */
StudyValidationException.searchQueryTooLong = function(query, maxLength = 50, context = {}) {
  return new StudyValidationException(
    'STUDY-051',
    '검색어가 너무 깁니다',
    {
      userMessage: `검색어는 최대 ${maxLength}자까지 입력할 수 있습니다`,
      devMessage: `Search query too long: ${query?.length} chars (max: ${maxLength})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { query, maxLength, actualLength: query?.length, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-052: 검색어 특수문자 사용 불가
 */
StudyValidationException.invalidSearchQueryFormat = function(query, context = {}) {
  return new StudyValidationException(
    'STUDY-052',
    '검색어에 사용할 수 없는 문자가 포함되었습니다',
    {
      userMessage: '검색어에는 특수문자를 사용할 수 없습니다',
      devMessage: `Search query contains invalid characters: ${query}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { query, ...context },
      category: 'validation'
    }
  );
};

/**
 * STUDY-053: 멤버 수 동기화 오류
 */
StudyBusinessException.memberCountMismatch = function(studyId, expectedCount, actualCount, context = {}) {
  return new StudyBusinessException(
    'STUDY-053',
    '멤버 수 동기화 오류가 발생했습니다',
    {
      userMessage: '데이터 동기화 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
      devMessage: `Member count mismatch for study ${studyId}: expected=${expectedCount}, actual=${actualCount}`,
      statusCode: 500,
      retryable: true,
      severity: 'high',
      context: { studyId, expectedCount, actualCount, ...context },
      category: 'business_logic'
    }
  );
};

/**
 * STUDY-054: 모집 중이 아님
 */
StudyApplicationException.notRecruiting = function(studyId, currentStatus, context = {}) {
  return new StudyApplicationException(
    'STUDY-054',
    '모집 중인 스터디가 아닙니다',
    {
      userMessage: '현재 모집이 마감된 스터디입니다',
      devMessage: `Study ${studyId} is not recruiting. Current status: ${currentStatus}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { studyId, currentStatus, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-055: 정원 마감
 */
StudyApplicationException.studyFull = function(studyId, currentMembers, maxMembers, context = {}) {
  return new StudyApplicationException(
    'STUDY-055',
    '스터디 정원이 마감되었습니다',
    {
      userMessage: '죄송합니다. 스터디 정원이 마감되었습니다',
      devMessage: `Study ${studyId} is full: ${currentMembers}/${maxMembers}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { studyId, currentMembers, maxMembers, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-056: 이미 가입된 멤버
 */
StudyApplicationException.alreadyMember = function(userId, studyId, context = {}) {
  return new StudyApplicationException(
    'STUDY-056',
    '이미 가입된 스터디입니다',
    {
      userMessage: '이미 가입한 스터디입니다',
      devMessage: `User ${userId} is already a member of study ${studyId}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { userId, studyId, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-057: 가입 대기 중
 */
StudyApplicationException.applicationPending = function(userId, studyId, context = {}) {
  return new StudyApplicationException(
    'STUDY-057',
    '이미 가입 신청 중입니다',
    {
      userMessage: '이미 가입 신청을 하셨습니다. 승인을 기다려주세요',
      devMessage: `User ${userId} already has pending application for study ${studyId}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { userId, studyId, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-058: 강퇴된 멤버 재가입 불가
 */
StudyApplicationException.kickedMemberCannotRejoin = function(userId, studyId, kickedAt, context = {}) {
  return new StudyApplicationException(
    'STUDY-058',
    '강퇴된 멤버는 재가입할 수 없습니다',
    {
      userMessage: '강퇴된 스터디에는 재가입할 수 없습니다',
      devMessage: `User ${userId} was kicked from study ${studyId} at ${kickedAt}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, studyId, kickedAt, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-059: 소개글 너무 김
 */
StudyApplicationException.introductionTooLong = function(introduction, maxLength = 500, context = {}) {
  return new StudyApplicationException(
    'STUDY-059',
    '소개글이 너무 깁니다',
    {
      userMessage: `소개글은 최대 ${maxLength}자까지 입력할 수 있습니다`,
      devMessage: `Introduction too long: ${introduction?.length} chars (max: ${maxLength})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { introduction, maxLength, actualLength: introduction?.length, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-057: 가입 신청 메시지 누락
 */
StudyApplicationException.applicationMessageMissing = function(context = {}) {
  return new StudyApplicationException(
    'STUDY-057',
    '가입 신청 메시지가 누락되었습니다',
    {
      userMessage: '가입 신청 메시지를 입력해주세요',
      devMessage: 'Application message is required',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'application'
    }
  );
};

/**
 * STUDY-058: 가입 신청 메시지 너무 짧음
 */
StudyApplicationException.applicationMessageTooShort = function(message, minLength, context = {}) {
  return new StudyApplicationException(
    'STUDY-058',
    '가입 신청 메시지가 너무 짧습니다',
    {
      userMessage: `가입 신청 메시지는 최소 ${minLength}자 이상 입력해주세요`,
      devMessage: `Application message too short: ${message?.length} < ${minLength}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { message, minLength, actualLength: message?.length, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-059: 가입 신청 메시지 너무 김
 */
StudyApplicationException.applicationMessageTooLong = function(message, maxLength, context = {}) {
  return new StudyApplicationException(
    'STUDY-059',
    '가입 신청 메시지가 너무 깁니다',
    {
      userMessage: `가입 신청 메시지는 최대 ${maxLength}자까지 입력할 수 있습니다`,
      devMessage: `Application message too long: ${message?.length} > ${maxLength}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { message, maxLength, actualLength: message?.length, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-060: 지원 동기 너무 김
 */
StudyApplicationException.motivationTooLong = function(motivation, maxLength = 500, context = {}) {
  return new StudyApplicationException(
    'STUDY-060',
    '지원 동기가 너무 깁니다',
    {
      userMessage: `지원 동기는 최대 ${maxLength}자까지 입력할 수 있습니다`,
      devMessage: `Motivation too long: ${motivation?.length} chars (max: ${maxLength})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { motivation, maxLength, actualLength: motivation?.length, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-061: 유효하지 않은 레벨
 */
StudyApplicationException.invalidLevel = function(level, validLevels = [], context = {}) {
  return new StudyApplicationException(
    'STUDY-061',
    '유효하지 않은 레벨입니다',
    {
      userMessage: '올바른 레벨을 선택해주세요',
      devMessage: `Invalid level: ${level}. Valid: ${validLevels.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { level, validLevels, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-062: 가입 요청을 찾을 수 없음
 */
StudyApplicationException.applicationNotFound = function(applicationId, context = {}) {
  return new StudyApplicationException(
    'STUDY-062',
    '가입 요청을 찾을 수 없습니다',
    {
      userMessage: '존재하지 않는 가입 요청입니다',
      devMessage: `Application ${applicationId} not found`,
      statusCode: 404,
      retryable: false,
      severity: 'medium',
      context: { applicationId, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-063: 이미 처리된 요청
 */
StudyApplicationException.applicationAlreadyProcessed = function(applicationId, status, context = {}) {
  return new StudyApplicationException(
    'STUDY-063',
    '이미 처리된 요청입니다',
    {
      userMessage: '이미 처리된 가입 요청입니다',
      devMessage: `Application ${applicationId} already processed with status: ${status}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { applicationId, status, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-064: 승인 권한 없음
 */
StudyPermissionException.cannotApproveApplication = function(userId, requiredRole = 'ADMIN', context = {}) {
  return new StudyPermissionException(
    'STUDY-064',
    '가입 승인 권한이 없습니다',
    {
      userMessage: '가입 승인은 관리자만 할 수 있습니다',
      devMessage: `User ${userId} lacks permission to approve applications. Required: ${requiredRole}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, requiredRole, ...context },
      category: 'permission'
    }
  );
};

/**
 * STUDY-065: 승인 중 정원 초과
 */
StudyApplicationException.capacityExceededDuringApproval = function(studyId, currentMembers, maxMembers, context = {}) {
  return new StudyApplicationException(
    'STUDY-065',
    '승인 중 정원이 초과되었습니다',
    {
      userMessage: '승인하는 동안 정원이 마감되었습니다',
      devMessage: `Capacity exceeded during approval for study ${studyId}: ${currentMembers}/${maxMembers}`,
      statusCode: 409,
      retryable: false,
      severity: 'medium',
      context: { studyId, currentMembers, maxMembers, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-066: 거절 사유 너무 김
 */
StudyApplicationException.rejectionReasonTooLong = function(reason, maxLength = 200, context = {}) {
  return new StudyApplicationException(
    'STUDY-066',
    '거절 사유가 너무 깁니다',
    {
      userMessage: `거절 사유는 최대 ${maxLength}자까지 입력할 수 있습니다`,
      devMessage: `Rejection reason too long: ${reason?.length} chars (max: ${maxLength})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { reason, maxLength, actualLength: reason?.length, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-067: 중복 승인 시도
 */
StudyApplicationException.duplicateApprovalAttempt = function(applicationId, context = {}) {
  return new StudyApplicationException(
    'STUDY-067',
    '중복 승인 시도입니다',
    {
      userMessage: '이미 승인 처리 중입니다',
      devMessage: `Duplicate approval attempt for application ${applicationId}`,
      statusCode: 409,
      retryable: false,
      severity: 'medium',
      context: { applicationId, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-068: 자동 승인 스터디에서 수동 승인 시도
 */
StudyApplicationException.manualApprovalNotAllowed = function(studyId, context = {}) {
  return new StudyApplicationException(
    'STUDY-068',
    '자동 승인 스터디입니다',
    {
      userMessage: '이 스터디는 자동으로 가입됩니다',
      devMessage: `Study ${studyId} has auto-approval enabled`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { studyId, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-069: 신청 알림 전송 실패
 */
StudyApplicationException.applicationNotificationFailed = function(applicationId, reason, context = {}) {
  return new StudyApplicationException(
    'STUDY-069',
    '알림 전송에 실패했습니다',
    {
      userMessage: '신청은 완료되었으나 알림 전송에 실패했습니다',
      devMessage: `Failed to send notification for application ${applicationId}: ${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'medium',
      context: { applicationId, reason, ...context },
      category: 'application'
    }
  );
};

/**
 * STUDY-070: 탈퇴 후 즉시 재가입 제한
 */
StudyBusinessException.rejoinTooSoon = function(userId, studyId, leftAt, waitPeriodHours = 24, context = {}) {
  return new StudyBusinessException(
    'STUDY-070',
    '탈퇴 후 즉시 재가입할 수 없습니다',
    {
      userMessage: `탈퇴 후 ${waitPeriodHours}시간이 지나야 재가입할 수 있습니다`,
      devMessage: `User ${userId} left study ${studyId} at ${leftAt}. Wait period: ${waitPeriodHours}h`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { userId, studyId, leftAt, waitPeriodHours, ...context },
      category: 'business_logic'
    }
  );
};

/**
 * STUDY-071: 재가입 횟수 초과
 */
StudyBusinessException.rejoinLimitExceeded = function(userId, studyId, rejoinCount, maxRejoins = 3, context = {}) {
  return new StudyBusinessException(
    'STUDY-071',
    '재가입 횟수를 초과했습니다',
    {
      userMessage: `이 스터디에는 최대 ${maxRejoins}회까지만 재가입할 수 있습니다`,
      devMessage: `User ${userId} exceeded rejoin limit for study ${studyId}: ${rejoinCount}/${maxRejoins}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, studyId, rejoinCount, maxRejoins, ...context },
      category: 'business_logic'
    }
  );
};

// ========================================
// PHASE 2: 비즈니스 로직 예외 (072-091)
// ========================================

// D. Business Logic Errors (072-091)

/**
 * STUDY-072: 정원 증가 불가
 */
StudyBusinessException.cannotIncreaseCapacity = function(studyId, currentMax, newMax, reason, context = {}) {
  return new StudyBusinessException(
    'STUDY-072',
    '정원을 증가시킬 수 없습니다',
    {
      userMessage: `정원을 증가시킬 수 없습니다: ${reason}`,
      devMessage: `Cannot increase capacity for study ${studyId} from ${currentMax} to ${newMax}: ${reason}`,
      statusCode: 400,
      retryable: false,
      severity: 'high',
      context: { studyId, currentMax, newMax, reason, ...context },
      category: 'business_logic'
    }
  );
};

/**
 * STUDY-073: 정원 감소 불가
 */
StudyBusinessException.cannotDecreaseCapacity = function(studyId, currentMembers, newMax, context = {}) {
  return new StudyBusinessException(
    'STUDY-073',
    '정원을 감소시킬 수 없습니다',
    {
      userMessage: `현재 멤버 수(${currentMembers}명)보다 적게 설정할 수 없습니다`,
      devMessage: `Cannot decrease capacity for study ${studyId}: current=${currentMembers}, new=${newMax}`,
      statusCode: 400,
      retryable: false,
      severity: 'high',
      context: { studyId, currentMembers, newMax, ...context },
      category: 'business_logic'
    }
  );
};

/**
 * STUDY-074: 모집 중지 불가
 */
StudyBusinessException.cannotStopRecruiting = function(studyId, pendingCount, context = {}) {
  return new StudyBusinessException(
    'STUDY-074',
    '모집을 중지할 수 없습니다',
    {
      userMessage: `대기 중인 신청(${pendingCount}건)이 있어 모집을 중지할 수 없습니다`,
      devMessage: `Cannot stop recruiting for study ${studyId}: ${pendingCount} pending applications`,
      statusCode: 400,
      retryable: false,
      severity: 'high',
      context: { studyId, pendingCount, ...context },
      category: 'business_logic'
    }
  );
};

/**
 * STUDY-075: 동시성 충돌 (정원 마감)
 */
StudyBusinessException.concurrentCapacityConflict = function(studyId, context = {}) {
  return new StudyBusinessException(
    'STUDY-075',
    '동시 가입으로 인한 충돌입니다',
    {
      userMessage: '여러 사용자가 동시에 가입하여 정원이 마감되었습니다',
      devMessage: `Concurrent capacity conflict for study ${studyId}`,
      statusCode: 409,
      retryable: true,
      severity: 'high',
      context: { studyId, ...context },
      category: 'business_logic'
    }
  );
};

/**
 * STUDY-076: 스터디 종료 후 가입 시도
 */
StudyBusinessException.studyAlreadyEnded = function(studyId, endedAt, context = {}) {
  return new StudyBusinessException(
    'STUDY-076',
    '종료된 스터디입니다',
    {
      userMessage: '종료된 스터디에는 가입할 수 없습니다',
      devMessage: `Study ${studyId} ended at ${endedAt}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { studyId, endedAt, ...context },
      category: 'business_logic'
    }
  );
};

/**
 * STUDY-077: OWNER 탈퇴 불가
 */
StudyBusinessException.ownerCannotLeave = function(userId, studyId, context = {}) {
  return new StudyBusinessException(
    'STUDY-077',
    '스터디장은 탈퇴할 수 없습니다',
    {
      userMessage: '스터디장은 탈퇴할 수 없습니다. 스터디장을 위임한 후 탈퇴해주세요',
      devMessage: `Owner ${userId} cannot leave study ${studyId}`,
      statusCode: 403,
      retryable: false,
      severity: 'high',
      context: { userId, studyId, ...context },
      category: 'business_logic'
    }
  );
};

/**
 * STUDY-078: 탈퇴 사유 누락
 */
StudyBusinessException.leaveReasonMissing = function(userId, context = {}) {
  return new StudyBusinessException(
    'STUDY-078',
    '탈퇴 사유가 누락되었습니다',
    {
      userMessage: '탈퇴 사유를 입력해주세요',
      devMessage: `Leave reason required for user ${userId}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { userId, ...context },
      category: 'business_logic'
    }
  );
};

/**
 * STUDY-079: 탈퇴 후 데이터 정리 실패
 */
StudyBusinessException.leaveCleanupFailed = function(userId, studyId, reason, context = {}) {
  return new StudyBusinessException(
    'STUDY-079',
    '탈퇴 후 데이터 정리에 실패했습니다',
    {
      userMessage: '탈퇴 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요',
      devMessage: `Failed to cleanup data after user ${userId} left study ${studyId}: ${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'high',
      context: { userId, studyId, reason, ...context },
      category: 'business_logic'
    }
  );
};

/**
 * STUDY-080: 트랜잭션 실패
 */
StudyDatabaseException.transactionFailed = function(operation, reason, context = {}) {
  return new StudyDatabaseException(
    'STUDY-080',
    '트랜잭션 처리에 실패했습니다',
    {
      userMessage: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
      devMessage: `Transaction failed for ${operation}: ${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'critical',
      context: { operation, reason, ...context },
      category: 'database'
    }
  );
};

/**
 * STUDY-081: 외래키 제약 위반
 */
StudyDatabaseException.foreignKeyViolation = function(table, column, value, context = {}) {
  return new StudyDatabaseException(
    'STUDY-081',
    '외래키 제약 조건 위반입니다',
    {
      userMessage: '참조하는 데이터가 존재하지 않습니다',
      devMessage: `Foreign key violation in ${table}.${column}: ${value}`,
      statusCode: 400,
      retryable: false,
      severity: 'critical',
      context: { table, column, value, ...context },
      category: 'database'
    }
  );
};

/**
 * STUDY-082: 중복 데이터 생성 시도
 */
StudyDatabaseException.duplicateDataCreation = function(table, field, value, context = {}) {
  return new StudyDatabaseException(
    'STUDY-082',
    '중복 데이터 생성 시도입니다',
    {
      userMessage: '이미 존재하는 데이터입니다',
      devMessage: `Duplicate data in ${table}.${field}: ${value}`,
      statusCode: 409,
      retryable: false,
      severity: 'high',
      context: { table, field, value, ...context },
      category: 'database'
    }
  );
};

/**
 * STUDY-083: 데이터베이스 연결 오류
 */
StudyDatabaseException.databaseConnectionError = function(reason, context = {}) {
  return new StudyDatabaseException(
    'STUDY-083',
    '데이터베이스 연결 오류입니다',
    {
      userMessage: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요',
      devMessage: `Database connection error: ${reason}`,
      statusCode: 503,
      retryable: true,
      severity: 'critical',
      context: { reason, ...context },
      category: 'database'
    }
  );
};

/**
 * STUDY-084: 데이터 동기화 실패
 */
StudyDatabaseException.dataSyncFailed = function(entity, reason, context = {}) {
  return new StudyDatabaseException(
    'STUDY-084',
    '데이터 동기화에 실패했습니다',
    {
      userMessage: '데이터 동기화 중 오류가 발생했습니다',
      devMessage: `Data sync failed for ${entity}: ${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'critical',
      context: { entity, reason, ...context },
      category: 'database'
    }
  );
};

/**
 * STUDY-085: 롤백 실패
 */
StudyDatabaseException.rollbackFailed = function(transaction, reason, context = {}) {
  return new StudyDatabaseException(
    'STUDY-085',
    '롤백 처리에 실패했습니다',
    {
      userMessage: '심각한 오류가 발생했습니다. 관리자에게 문의해주세요',
      devMessage: `Rollback failed for transaction ${transaction}: ${reason}`,
      statusCode: 500,
      retryable: false,
      severity: 'critical',
      context: { transaction, reason, ...context },
      category: 'database'
    }
  );
};

// ========================================
// PHASE 3: 파일 및 추가 기능 (086-115)
// ========================================

// E. File Management Errors (086-103)

/**
 * STUDY-086: 파일 선택 안 함
 */
StudyFileException.noFileSelected = function(context = {}) {
  return new StudyFileException(
    'STUDY-086',
    '파일이 선택되지 않았습니다',
    {
      userMessage: '업로드할 파일을 선택해주세요',
      devMessage: 'No file selected for upload',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'file'
    }
  );
};

/**
 * STUDY-087: 파일 크기 초과
 */
StudyFileException.fileSizeExceeded = function(fileSize, maxSize = 50 * 1024 * 1024, context = {}) {
  return new StudyFileException(
    'STUDY-087',
    '파일 크기가 초과되었습니다',
    {
      userMessage: `파일 크기는 최대 ${Math.round(maxSize / 1024 / 1024)}MB까지 업로드할 수 있습니다`,
      devMessage: `File size ${fileSize} exceeds maximum ${maxSize}`,
      statusCode: 413,
      retryable: false,
      severity: 'medium',
      context: { fileSize, maxSize, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-088: 허용되지 않은 파일 형식
 */
StudyFileException.invalidFileType = function(fileType, allowedTypes = [], context = {}) {
  return new StudyFileException(
    'STUDY-088',
    '허용되지 않은 파일 형식입니다',
    {
      userMessage: `허용된 파일 형식: ${allowedTypes.join(', ')}`,
      devMessage: `Invalid file type: ${fileType}. Allowed: ${allowedTypes.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { fileType, allowedTypes, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-089: 악성 파일 감지
 */
StudyFileException.maliciousFileDetected = function(fileName, reason, context = {}) {
  return new StudyFileException(
    'STUDY-089',
    '악성 파일이 감지되었습니다',
    {
      userMessage: '보안상 위험한 파일입니다. 업로드할 수 없습니다',
      devMessage: `Malicious file detected: ${fileName}. Reason: ${reason}`,
      statusCode: 403,
      retryable: false,
      severity: 'high',
      context: { fileName, reason, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-090: 저장 공간 부족
 */
StudyFileException.storageQuotaExceeded = function(requiredSize, availableSize, context = {}) {
  return new StudyFileException(
    'STUDY-090',
    '저장 공간이 부족합니다',
    {
      userMessage: '스터디 저장 공간이 부족합니다. 불필요한 파일을 삭제해주세요',
      devMessage: `Storage quota exceeded: required=${requiredSize}, available=${availableSize}`,
      statusCode: 507,
      retryable: false,
      severity: 'high',
      context: { requiredSize, availableSize, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-091: 파일명 너무 김
 */
StudyFileException.fileNameTooLong = function(fileName, maxLength = 255, context = {}) {
  return new StudyFileException(
    'STUDY-091',
    '파일명이 너무 깁니다',
    {
      userMessage: `파일명은 최대 ${maxLength}자까지 가능합니다`,
      devMessage: `File name too long: ${fileName?.length} chars (max: ${maxLength})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { fileName, maxLength, actualLength: fileName?.length, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-092: 파일 업로드 실패
 */
StudyFileException.fileUploadFailed = function(fileName, reason, context = {}) {
  return new StudyFileException(
    'STUDY-092',
    '파일 업로드에 실패했습니다',
    {
      userMessage: '파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요',
      devMessage: `File upload failed for ${fileName}: ${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'high',
      context: { fileName, reason, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-093: 파일을 찾을 수 없음
 */
StudyFileException.fileNotFound = function(fileId, context = {}) {
  return new StudyFileException(
    'STUDY-093',
    '파일을 찾을 수 없습니다',
    {
      userMessage: '존재하지 않는 파일입니다',
      devMessage: `File ${fileId} not found`,
      statusCode: 404,
      retryable: false,
      severity: 'medium',
      context: { fileId, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-094: 파일 삭제 권한 없음
 */
StudyFileException.cannotDeleteFile = function(userId, fileId, uploaderId, context = {}) {
  return new StudyFileException(
    'STUDY-094',
    '파일 삭제 권한이 없습니다',
    {
      userMessage: '자신이 업로드한 파일만 삭제할 수 있습니다',
      devMessage: `User ${userId} cannot delete file ${fileId} uploaded by ${uploaderId}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, fileId, uploaderId, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-095: 파일 다운로드 권한 없음
 */
StudyFileException.cannotDownloadFile = function(userId, fileId, context = {}) {
  return new StudyFileException(
    'STUDY-095',
    '파일 다운로드 권한이 없습니다',
    {
      userMessage: '스터디 멤버만 파일을 다운로드할 수 있습니다',
      devMessage: `User ${userId} lacks permission to download file ${fileId}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, fileId, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-096: 파일 손상됨
 */
StudyFileException.fileCorrupted = function(fileId, reason, context = {}) {
  return new StudyFileException(
    'STUDY-096',
    '파일이 손상되었습니다',
    {
      userMessage: '파일이 손상되어 사용할 수 없습니다',
      devMessage: `File ${fileId} is corrupted: ${reason}`,
      statusCode: 500,
      retryable: false,
      severity: 'high',
      context: { fileId, reason, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-097: 파일 삭제 실패
 */
StudyFileException.fileDeletionFailed = function(fileId, reason, context = {}) {
  return new StudyFileException(
    'STUDY-097',
    '파일 삭제에 실패했습니다',
    {
      userMessage: '파일 삭제 중 오류가 발생했습니다. 다시 시도해주세요',
      devMessage: `Failed to delete file ${fileId}: ${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'high',
      context: { fileId, reason, ...context },
      category: 'file'
    }
  );
};

// F. Additional Features (098-115)

// F1. Notice Errors (098-101)

/**
 * STUDY-098: 공지 제목 누락
 */
StudyFeatureException.noticeTitleMissing = function(context = {}) {
  return new StudyFeatureException(
    'STUDY-098',
    '공지 제목이 누락되었습니다',
    {
      userMessage: '공지 제목을 입력해주세요',
      devMessage: 'Notice title is required',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'feature'
    }
  );
};

/**
 * STUDY-099: 공지 제목 길이 오류
 */
StudyFeatureException.invalidNoticeTitleLength = function(title, constraints = { min: 2, max: 100 }, context = {}) {
  return new StudyFeatureException(
    'STUDY-099',
    '공지 제목 길이가 올바르지 않습니다',
    {
      userMessage: `공지 제목은 ${constraints.min}자 이상 ${constraints.max}자 이하로 입력해주세요`,
      devMessage: `Notice title length validation failed: ${title?.length} chars`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { title, constraints, actualLength: title?.length, ...context },
      category: 'feature'
    }
  );
};

/**
 * STUDY-100: 공지 내용 누락
 */
StudyFeatureException.noticeContentMissing = function(context = {}) {
  return new StudyFeatureException(
    'STUDY-100',
    '공지 내용이 누락되었습니다',
    {
      userMessage: '공지 내용을 입력해주세요',
      devMessage: 'Notice content is required',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'feature'
    }
  );
};

/**
 * STUDY-101: 공지 내용 길이 오류
 */
StudyFeatureException.invalidNoticeContentLength = function(content, constraints = { min: 10, max: 5000 }, context = {}) {
  return new StudyFeatureException(
    'STUDY-101',
    '공지 내용 길이가 올바르지 않습니다',
    {
      userMessage: `공지 내용은 ${constraints.min}자 이상 ${constraints.max}자 이하로 입력해주세요`,
      devMessage: `Notice content length validation failed: ${content?.length} chars`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { content, constraints, actualLength: content?.length, ...context },
      category: 'feature'
    }
  );
};

// F2. Task Errors (102-104)

/**
 * STUDY-102: 할일 제목 누락
 */
StudyFeatureException.taskTitleMissing = function(context = {}) {
  return new StudyFeatureException(
    'STUDY-102',
    '할일 제목이 누락되었습니다',
    {
      userMessage: '할일 제목을 입력해주세요',
      devMessage: 'Task title is required',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'feature'
    }
  );
};

/**
 * STUDY-103: 마감일이 과거
 */
StudyFeatureException.taskDeadlineInPast = function(deadline, context = {}) {
  return new StudyFeatureException(
    'STUDY-103',
    '마감일이 과거입니다',
    {
      userMessage: '마감일은 현재 시간 이후로 설정해주세요',
      devMessage: `Task deadline ${deadline} is in the past`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { deadline, ...context },
      category: 'feature'
    }
  );
};

/**
 * STUDY-104: 담당자가 멤버가 아님
 */
StudyFeatureException.assigneeNotMember = function(assigneeId, studyId, context = {}) {
  return new StudyFeatureException(
    'STUDY-104',
    '담당자가 스터디 멤버가 아닙니다',
    {
      userMessage: '스터디 멤버만 할일 담당자로 지정할 수 있습니다',
      devMessage: `Assignee ${assigneeId} is not a member of study ${studyId}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { assigneeId, studyId, ...context },
      category: 'feature'
    }
  );
};

// F3. Chat Errors (105-107)

/**
 * STUDY-105: 메시지 내용 누락
 */
StudyFeatureException.messageContentMissing = function(context = {}) {
  return new StudyFeatureException(
    'STUDY-105',
    '메시지 내용이 누락되었습니다',
    {
      userMessage: '메시지를 입력해주세요',
      devMessage: 'Message content is required',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'feature'
    }
  );
};

/**
 * STUDY-106: 메시지 길이 초과
 */
StudyFeatureException.messageContentTooLong = function(content, maxLength = 2000, context = {}) {
  return new StudyFeatureException(
    'STUDY-106',
    '메시지가 너무 깁니다',
    {
      userMessage: `메시지는 최대 ${maxLength}자까지 입력할 수 있습니다`,
      devMessage: `Message content too long: ${content?.length} chars (max: ${maxLength})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { content, maxLength, actualLength: content?.length, ...context },
      category: 'feature'
    }
  );
};

/**
 * STUDY-107: 타인 메시지 삭제 불가
 */
StudyFeatureException.cannotDeleteOthersMessage = function(userId, messageId, authorId, context = {}) {
  return new StudyFeatureException(
    'STUDY-107',
    '다른 사람의 메시지를 삭제할 수 없습니다',
    {
      userMessage: '자신의 메시지만 삭제할 수 있습니다',
      devMessage: `User ${userId} cannot delete message ${messageId} by ${authorId}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, messageId, authorId, ...context },
      category: 'feature'
    }
  );
};

// F4. Calendar Errors (108-115)

/**
 * STUDY-108: 일정 제목 누락
 */
StudyFeatureException.eventTitleMissing = function(context = {}) {
  return new StudyFeatureException(
    'STUDY-108',
    '일정 제목이 누락되었습니다',
    {
      userMessage: '일정 제목을 입력해주세요',
      devMessage: 'Event title is required',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'feature'
    }
  );
};

/**
 * STUDY-109: 종료 시간이 시작 시간보다 이름
 */
StudyFeatureException.eventEndTimeBeforeStartTime = function(startTime, endTime, context = {}) {
  return new StudyFeatureException(
    'STUDY-109',
    '일정 시간 설정이 올바르지 않습니다',
    {
      userMessage: '종료 시간은 시작 시간보다 나중이어야 합니다',
      devMessage: `Event end time ${endTime} is before start time ${startTime}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { startTime, endTime, ...context },
      category: 'feature'
    }
  );
};

/**
 * STUDY-110: 일정 시작 시간이 과거
 */
StudyFeatureException.eventStartTimeInPast = function(startTime, context = {}) {
  return new StudyFeatureException(
    'STUDY-110',
    '일정 시작 시간이 과거입니다',
    {
      userMessage: '일정 시작 시간은 현재 시간 이후로 설정해주세요',
      devMessage: `Event start time ${startTime} is in the past`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { startTime, ...context },
      category: 'feature'
    }
  );
};

/**
 * STUDY-111: 일정 설명 길이 초과
 */
StudyFeatureException.eventDescriptionTooLong = function(description, maxLength = 1000, context = {}) {
  return new StudyFeatureException(
    'STUDY-111',
    '일정 설명이 너무 깁니다',
    {
      userMessage: `일정 설명은 최대 ${maxLength}자까지 입력할 수 있습니다`,
      devMessage: `Event description too long: ${description?.length} chars (max: ${maxLength})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { description, maxLength, actualLength: description?.length, ...context },
      category: 'feature'
    }
  );
};

/**
 * STUDY-112: 일정 중복
 */
StudyFeatureException.eventTimeConflict = function(startTime, endTime, conflictingEventId, context = {}) {
  return new StudyFeatureException(
    'STUDY-112',
    '일정이 중복됩니다',
    {
      userMessage: '같은 시간에 다른 일정이 있습니다',
      devMessage: `Event time conflict: ${startTime}-${endTime} conflicts with event ${conflictingEventId}`,
      statusCode: 409,
      retryable: false,
      severity: 'medium',
      context: { startTime, endTime, conflictingEventId, ...context },
      category: 'feature'
    }
  );
};

/**
 * STUDY-113: 일정 생성 권한 없음
 */
StudyPermissionException.cannotCreateEvent = function(userId, requiredRole = 'ADMIN', context = {}) {
  return new StudyPermissionException(
    'STUDY-113',
    '일정 생성 권한이 없습니다',
    {
      userMessage: '일정은 관리자만 생성할 수 있습니다',
      devMessage: `User ${userId} lacks permission to create events. Required: ${requiredRole}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, requiredRole, ...context },
      category: 'permission'
    }
  );
};

/**
 * STUDY-114: 일정을 찾을 수 없음
 */
StudyFeatureException.eventNotFound = function(eventId, context = {}) {
  return new StudyFeatureException(
    'STUDY-114',
    '일정을 찾을 수 없습니다',
    {
      userMessage: '존재하지 않는 일정입니다',
      devMessage: `Event ${eventId} not found`,
      statusCode: 404,
      retryable: false,
      severity: 'medium',
      context: { eventId, ...context },
      category: 'feature'
    }
  );
};

/**
 * STUDY-115: 일정 참석 인원 초과
 */
StudyFeatureException.eventAttendeeLimitExceeded = function(eventId, currentAttendees, maxAttendees, context = {}) {
  return new StudyFeatureException(
    'STUDY-115',
    '일정 참석 인원이 초과되었습니다',
    {
      userMessage: `이 일정은 최대 ${maxAttendees}명까지 참석할 수 있습니다`,
      devMessage: `Event ${eventId} attendee limit exceeded: ${currentAttendees}/${maxAttendees}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { eventId, currentAttendees, maxAttendees, ...context },
      category: 'feature'
    }
  );
};

// F5. Notice Errors (116-121) - Extended

/**
 * STUDY-116: 공지사항 제목 필수
 */
StudyNoticeException.titleRequired = function(context = {}) {
  return new StudyNoticeException(
    'STUDY-116',
    '공지사항 제목이 필요합니다',
    {
      userMessage: '공지사항 제목을 입력해주세요',
      devMessage: 'Notice title is required',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'notice'
    }
  );
};

/**
 * STUDY-117: 공지사항 제목 길이 초과
 */
StudyNoticeException.titleTooLong = function(length, maxLength = 100, context = {}) {
  return new StudyNoticeException(
    'STUDY-117',
    '공지사항 제목이 너무 깁니다',
    {
      userMessage: `공지사항 제목은 최대 ${maxLength}자까지 입력할 수 있습니다`,
      devMessage: `Notice title too long: ${length} > ${maxLength}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { length, maxLength, ...context },
      category: 'notice'
    }
  );
};

/**
 * STUDY-118: 공지사항 내용 필수
 */
StudyNoticeException.contentRequired = function(context = {}) {
  return new StudyNoticeException(
    'STUDY-118',
    '공지사항 내용이 필요합니다',
    {
      userMessage: '공지사항 내용을 입력해주세요',
      devMessage: 'Notice content is required',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'notice'
    }
  );
};

/**
 * STUDY-119: 공지사항을 찾을 수 없음
 */
StudyNoticeException.noticeNotFound = function(noticeId, context = {}) {
  return new StudyNoticeException(
    'STUDY-119',
    '공지사항을 찾을 수 없습니다',
    {
      userMessage: '존재하지 않는 공지사항입니다',
      devMessage: `Notice ${noticeId} not found`,
      statusCode: 404,
      retryable: false,
      severity: 'medium',
      context: { noticeId, ...context },
      category: 'notice'
    }
  );
};

/**
 * STUDY-120: 공지사항 수정 권한 없음
 */
StudyNoticeException.noticeAccessDenied = function(userId, noticeId, context = {}) {
  return new StudyNoticeException(
    'STUDY-120',
    '공지사항을 수정할 권한이 없습니다',
    {
      userMessage: '작성자 또는 리더만 공지사항을 수정할 수 있습니다',
      devMessage: `User ${userId} cannot access notice ${noticeId}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, noticeId, ...context },
      category: 'notice'
    }
  );
};

/**
 * STUDY-121: 고정 공지사항 개수 초과
 */
StudyNoticeException.pinnedNoticeLimitExceeded = function(currentCount, maxCount = 5, context = {}) {
  return new StudyNoticeException(
    'STUDY-121',
    '고정 공지사항 개수를 초과했습니다',
    {
      userMessage: `최대 ${maxCount}개의 공지사항만 고정할 수 있습니다`,
      devMessage: `Pinned notice limit exceeded: ${currentCount}/${maxCount}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { currentCount, maxCount, ...context },
      category: 'notice'
    }
  );
};

// F6. File Errors (122-127) - Extended

/**
 * STUDY-122: 파일 필수
 */
StudyFileException.fileRequired = function(context = {}) {
  return new StudyFileException(
    'STUDY-122',
    '파일이 필요합니다',
    {
      userMessage: '파일을 선택해주세요',
      devMessage: 'File is required for upload',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'file'
    }
  );
};

/**
 * STUDY-123: 파일 크기 초과
 */
StudyFileException.fileSizeTooLarge = function(size, maxSize = 10 * 1024 * 1024, context = {}) {
  const sizeMB = (size / (1024 * 1024)).toFixed(2);
  const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);

  return new StudyFileException(
    'STUDY-123',
    '파일 크기가 너무 큽니다',
    {
      userMessage: `파일 크기는 최대 ${maxSizeMB}MB까지 업로드할 수 있습니다 (현재: ${sizeMB}MB)`,
      devMessage: `File size ${size} exceeds maximum ${maxSize} bytes`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { size, maxSize, sizeMB, maxSizeMB, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-124: 잘못된 파일 형식
 */
StudyFileException.invalidFileType = function(type, allowedTypes = [], context = {}) {
  return new StudyFileException(
    'STUDY-124',
    '지원하지 않는 파일 형식입니다',
    {
      userMessage: `허용된 파일 형식: ${allowedTypes.join(', ')}`,
      devMessage: `Invalid file type: ${type}, allowed: ${allowedTypes.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { type, allowedTypes, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-125: 파일 접근 권한 없음
 */
StudyFileException.fileAccessDenied = function(userId, fileId, context = {}) {
  return new StudyFileException(
    'STUDY-125',
    '파일 접근 권한이 없습니다',
    {
      userMessage: '이 파일에 접근할 권한이 없습니다',
      devMessage: `User ${userId} cannot access file ${fileId}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, fileId, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-126: 파일 업로드 실패
 */
StudyFileException.uploadFailed = function(reason, context = {}) {
  return new StudyFileException(
    'STUDY-126',
    '파일 업로드에 실패했습니다',
    {
      userMessage: '파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요',
      devMessage: `File upload failed: ${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'high',
      context: { reason, ...context },
      category: 'file'
    }
  );
};

/**
 * STUDY-127: 파일 다운로드 실패
 */
StudyFileException.downloadFailed = function(reason, context = {}) {
  return new StudyFileException(
    'STUDY-127',
    '파일 다운로드에 실패했습니다',
    {
      userMessage: '파일 다운로드 중 오류가 발생했습니다. 다시 시도해주세요',
      devMessage: `File download failed: ${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'high',
      context: { reason, ...context },
      category: 'file'
    }
  );
};

// ========================================
// ADDITIONAL VALIDATION EXCEPTIONS
// ========================================

/**
 * 수정할 필드가 없음
 */
StudyValidationException.noFieldsToUpdate = function(context = {}) {
  return new StudyValidationException(
    'STUDY-128',
    '수정할 필드가 없습니다',
    {
      userMessage: '수정할 내용을 입력해주세요',
      devMessage: 'No fields provided for update',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'validation'
    }
  );
};

/**
 * 스터디 ID 누락
 */
StudyValidationException.studyIdMissing = function(context = {}) {
  return new StudyValidationException(
    'STUDY-129',
    '스터디 ID가 누락되었습니다',
    {
      userMessage: '올바른 스터디를 선택해주세요',
      devMessage: 'Study ID is required but was not provided',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'validation'
    }
  );
};

/**
 * 검색어 누락
 */
StudyValidationException.searchQueryMissing = function(context = {}) {
  return new StudyValidationException(
    'STUDY-130',
    '검색어가 누락되었습니다',
    {
      userMessage: '검색어를 입력해주세요',
      devMessage: 'Search query is required but was not provided',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
      category: 'validation'
    }
  );
};

/**
 * 검색어 너무 짧음
 */
StudyValidationException.searchQueryTooShort = function(query, minLength, context = {}) {
  return new StudyValidationException(
    'STUDY-131',
    '검색어가 너무 짧습니다',
    {
      userMessage: `검색어는 최소 ${minLength}자 이상 입력해주세요`,
      devMessage: `Search query too short: ${query?.length} < ${minLength}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { query, minLength, actualLength: query?.length, ...context },
      category: 'validation'
    }
  );
};

/**
 * 검색어 너무 김
 */
StudyValidationException.searchQueryTooLong = function(query, maxLength, context = {}) {
  return new StudyValidationException(
    'STUDY-132',
    '검색어가 너무 깁니다',
    {
      userMessage: `검색어는 최대 ${maxLength}자까지 입력할 수 있습니다`,
      devMessage: `Search query too long: ${query?.length} > ${maxLength}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { query, maxLength, actualLength: query?.length, ...context },
      category: 'validation'
    }
  );
};

/**
 * 사용자 ID 누락
 */
StudyValidationException.userIdMissing = function(context = {}) {
  return new StudyValidationException(
    'STUDY-133',
    '사용자 ID가 누락되었습니다',
    {
      userMessage: '로그인이 필요합니다',
      devMessage: 'User ID is required but was not provided',
      statusCode: 401,
      retryable: false,
      severity: 'medium',
      context,
      category: 'validation'
    }
  );
};

/**
 * 잘못된 페이지 번호
 */
StudyValidationException.invalidPageNumber = function(page, context = {}) {
  return new StudyValidationException(
    'STUDY-134',
    '잘못된 페이지 번호입니다',
    {
      userMessage: '올바른 페이지 번호를 입력해주세요',
      devMessage: `Invalid page number: ${page}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { page, ...context },
      category: 'validation'
    }
  );
};

/**
 * 잘못된 페이지 제한
 */
StudyValidationException.invalidPageLimit = function(limit, constraints = { min: 1, max: 100 }, context = {}) {
  return new StudyValidationException(
    'STUDY-135',
    '잘못된 페이지 크기입니다',
    {
      userMessage: `페이지당 항목 수는 ${constraints.min}개 이상 ${constraints.max}개 이하로 설정해주세요`,
      devMessage: `Invalid page limit: ${limit}. Valid range: ${constraints.min}-${constraints.max}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { limit, constraints, ...context },
      category: 'validation'
    }
  );
};

/**
 * 잘못된 정렬 필드
 */
StudyValidationException.invalidSortField = function(field, validFields = [], context = {}) {
  return new StudyValidationException(
    'STUDY-136',
    '잘못된 정렬 필드입니다',
    {
      userMessage: '올바른 정렬 기준을 선택해주세요',
      devMessage: `Invalid sort field: ${field}. Valid fields: ${validFields.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { field, validFields, ...context },
      category: 'validation'
    }
  );
};

/**
 * 잘못된 정렬 순서
 */
StudyValidationException.invalidSortOrder = function(order, validOrders = ['asc', 'desc'], context = {}) {
  return new StudyValidationException(
    'STUDY-137',
    '잘못된 정렬 순서입니다',
    {
      userMessage: '올바른 정렬 순서를 선택해주세요',
      devMessage: `Invalid sort order: ${order}. Valid orders: ${validOrders.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { order, validOrders, ...context },
      category: 'validation'
    }
  );
};

// ========================================
// CONSTANTS
// ========================================

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const ERROR_CATEGORIES = {
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  MEMBER: 'member',
  APPLICATION: 'application',
  BUSINESS_LOGIC: 'business_logic',
  FILE: 'file',
  FEATURE: 'feature',
  DATABASE: 'database'
};

export const RETRYABLE_ERRORS = [
  'STUDY-018', // 동시 수정 충돌
  'STUDY-043', // 멤버 상태 업데이트 실패
  'STUDY-053', // 멤버 수 동기화 오류
  'STUDY-069', // 신청 알림 전송 실패
  'STUDY-075', // 동시성 충돌 (정원 마감)
  'STUDY-079', // 탈퇴 후 데이터 정리 실패
  'STUDY-080', // 트랜잭션 실패
  'STUDY-083', // 데이터베이스 연결 오류
  'STUDY-084', // 데이터 동기화 실패
  'STUDY-092', // 파일 업로드 실패
  'STUDY-097'  // 파일 삭제 실패
];
