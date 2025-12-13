/**
 * Profile 영역 예외 클래스
 * 
 * @description
 * 프로필 관련 모든 예외를 처리하는 클래스
 * 90개의 에러 코드 (PROFILE-001 ~ PROFILE-090)
 * 
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-01
 */

export class ProfileException extends Error {
  /**
   * @param {string} code - 에러 코드
   * @param {string} message - 기본 메시지
   * @param {Object} details - 상세 정보
   */
  constructor(code, message, details = {}) {
    super(message);
    
    this.name = 'ProfileException';
    this.code = code;
    this.message = message;
    this.userMessage = details.userMessage || message;
    this.devMessage = details.devMessage || message;
    this.statusCode = details.statusCode || 400;
    this.retryable = details.retryable ?? false;
    this.timestamp = new Date().toISOString();
    this.context = details.context || {};
    this.category = details.category || 'general';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProfileException);
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

  // ========================================
  // A. PROFILE_INFO (프로필 정보) - 20개
  // ========================================

  // A-1: PROFILE-001 ~ PROFILE-005 (필수 필드 및 형식)
  
  static requiredFieldMissing(context = {}) {
    return new ProfileException(
      'PROFILE-001',
      'Required field missing',
      {
        userMessage: '필수 항목이 누락되었습니다',
        devMessage: `Required field missing: ${context.field || 'unknown'}`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static invalidNameFormat(context = {}) {
    return new ProfileException(
      'PROFILE-002',
      'Invalid name format',
      {
        userMessage: '이름 형식이 올바르지 않습니다',
        devMessage: `Invalid name format: ${context.name || 'unknown'}`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static nameTooShort(context = {}) {
    return new ProfileException(
      'PROFILE-003',
      'Name too short',
      {
        userMessage: '이름은 2자 이상이어야 합니다',
        devMessage: `Name length ${context.length} is less than minimum 2`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static nameTooLong(context = {}) {
    return new ProfileException(
      'PROFILE-004',
      'Name too long',
      {
        userMessage: '이름은 50자 이하여야 합니다',
        devMessage: `Name length ${context.length} exceeds maximum 50`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static bioTooLong(context = {}) {
    return new ProfileException(
      'PROFILE-005',
      'Bio too long',
      {
        userMessage: '자기소개는 200자 이하여야 합니다',
        devMessage: `Bio length ${context.length} exceeds maximum 200`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  // A-2: PROFILE-006 ~ PROFILE-010 (중복 및 금지)

  static invalidBioContent(context = {}) {
    return new ProfileException(
      'PROFILE-006',
      'Invalid bio content',
      {
        userMessage: '자기소개에 부적절한 내용이 포함되어 있습니다',
        devMessage: 'Bio contains invalid or inappropriate content',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static duplicateEmail(context = {}) {
    return new ProfileException(
      'PROFILE-007',
      'Duplicate email',
      {
        userMessage: '이미 사용 중인 이메일입니다',
        devMessage: `Email ${context.email} already exists`,
        statusCode: 409,
        retryable: false,
        category: 'conflict',
        context,
      }
    );
  }

  static invalidEmailFormat(context = {}) {
    return new ProfileException(
      'PROFILE-008',
      'Invalid email format',
      {
        userMessage: '이메일 형식이 올바르지 않습니다',
        devMessage: `Invalid email format: ${context.email || 'unknown'}`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static duplicateNickname(context = {}) {
    return new ProfileException(
      'PROFILE-009',
      'Duplicate nickname',
      {
        userMessage: '이미 사용 중인 닉네임입니다',
        devMessage: `Nickname ${context.nickname} already exists`,
        statusCode: 409,
        retryable: false,
        category: 'conflict',
        context,
      }
    );
  }

  static forbiddenNickname(context = {}) {
    return new ProfileException(
      'PROFILE-010',
      'Forbidden nickname',
      {
        userMessage: '사용할 수 없는 닉네임입니다',
        devMessage: `Forbidden nickname: ${context.nickname}`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  // A-3: PROFILE-011 ~ PROFILE-015 (보안 및 검증)

  static specialCharError(context = {}) {
    return new ProfileException(
      'PROFILE-011',
      'Special character error',
      {
        userMessage: '허용되지 않은 특수문자가 포함되어 있습니다',
        devMessage: `Invalid special characters in ${context.field || 'unknown'}`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static xssDetected(context = {}) {
    return new ProfileException(
      'PROFILE-012',
      'XSS detected',
      {
        userMessage: '보안상 문제가 있는 입력입니다',
        devMessage: `XSS pattern detected in ${context.field || 'unknown'}`,
        statusCode: 400,
        retryable: false,
        category: 'security',
        context,
      }
    );
  }

  static sqlInjectionDetected(context = {}) {
    return new ProfileException(
      'PROFILE-013',
      'SQL injection detected',
      {
        userMessage: '보안상 문제가 있는 입력입니다',
        devMessage: `SQL injection pattern detected in ${context.field || 'unknown'}`,
        statusCode: 400,
        retryable: false,
        category: 'security',
        context,
      }
    );
  }

  static updateFailed(context = {}) {
    return new ProfileException(
      'PROFILE-014',
      'Update failed',
      {
        userMessage: '프로필 업데이트에 실패했습니다',
        devMessage: `Profile update failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'database',
        context,
      }
    );
  }

  static notFound(context = {}) {
    return new ProfileException(
      'PROFILE-015',
      'Profile not found',
      {
        userMessage: '프로필을 찾을 수 없습니다',
        devMessage: `Profile not found for user ${context.userId || 'unknown'}`,
        statusCode: 404,
        retryable: false,
        category: 'not_found',
        context,
      }
    );
  }

  // A-4: PROFILE-016 ~ PROFILE-020 (권한 및 제한)

  static unauthorizedAccess(context = {}) {
    return new ProfileException(
      'PROFILE-016',
      'Unauthorized access',
      {
        userMessage: '프로필에 접근할 권한이 없습니다',
        devMessage: `Unauthorized access to profile ${context.profileId || 'unknown'}`,
        statusCode: 403,
        retryable: false,
        category: 'authorization',
        context,
      }
    );
  }

  static rateLimitExceeded(context = {}) {
    return new ProfileException(
      'PROFILE-017',
      'Rate limit exceeded',
      {
        userMessage: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요',
        devMessage: `Rate limit exceeded: ${context.limit || 'unknown'} requests`,
        statusCode: 429,
        retryable: true,
        category: 'rate_limit',
        context,
      }
    );
  }

  static accountSuspended(context = {}) {
    return new ProfileException(
      'PROFILE-018',
      'Account suspended',
      {
        userMessage: '정지된 계정입니다',
        devMessage: `Account ${context.userId} is suspended`,
        statusCode: 403,
        retryable: false,
        category: 'authorization',
        context,
      }
    );
  }

  static accountDeleted(context = {}) {
    return new ProfileException(
      'PROFILE-019',
      'Account deleted',
      {
        userMessage: '삭제된 계정입니다',
        devMessage: `Account ${context.userId} is deleted`,
        statusCode: 410,
        retryable: false,
        category: 'authorization',
        context,
      }
    );
  }

  static fetchFailed(context = {}) {
    return new ProfileException(
      'PROFILE-020',
      'Fetch failed',
      {
        userMessage: '프로필 정보를 불러오는데 실패했습니다',
        devMessage: `Profile fetch failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'database',
        context,
      }
    );
  }

  // ========================================
  // B. AVATAR (아바타) - 15개
  // ========================================

  // B-1: PROFILE-021 ~ PROFILE-025 (파일 검증)

  static fileNotProvided(context = {}) {
    return new ProfileException(
      'PROFILE-021',
      'File not provided',
      {
        userMessage: '파일이 제공되지 않았습니다',
        devMessage: 'Avatar file not provided in request',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static fileTooLarge(context = {}) {
    return new ProfileException(
      'PROFILE-022',
      'File too large',
      {
        userMessage: `파일 크기는 ${context.maxSize || '5MB'} 이하여야 합니다`,
        devMessage: `File size ${context.size} exceeds maximum ${context.maxSize}`,
        statusCode: 413,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static invalidFileType(context = {}) {
    return new ProfileException(
      'PROFILE-023',
      'Invalid file type',
      {
        userMessage: 'JPG, PNG, GIF, WebP 형식만 지원합니다',
        devMessage: `Invalid file type: ${context.type}`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static invalidImageFormat(context = {}) {
    return new ProfileException(
      'PROFILE-024',
      'Invalid image format',
      {
        userMessage: '올바른 이미지 형식이 아닙니다',
        devMessage: `Invalid image format: ${context.format || 'unknown'}`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static corruptedImage(context = {}) {
    return new ProfileException(
      'PROFILE-025',
      'Corrupted image',
      {
        userMessage: '손상된 이미지 파일입니다',
        devMessage: 'Image file is corrupted or unreadable',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  // B-2: PROFILE-026 ~ PROFILE-030 (업로드 및 처리)

  static uploadFailed(context = {}) {
    return new ProfileException(
      'PROFILE-026',
      'Upload failed',
      {
        userMessage: '파일 업로드에 실패했습니다',
        devMessage: `File upload failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'upload',
        context,
      }
    );
  }

  static imageProcessingFailed(context = {}) {
    return new ProfileException(
      'PROFILE-027',
      'Image processing failed',
      {
        userMessage: '이미지 처리에 실패했습니다',
        devMessage: `Image processing failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'processing',
        context,
      }
    );
  }

  static invalidImageDimensions(context = {}) {
    return new ProfileException(
      'PROFILE-028',
      'Invalid image dimensions',
      {
        userMessage: '이미지 크기가 너무 작거나 큽니다',
        devMessage: `Invalid dimensions: ${context.width}x${context.height}`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static avatarUpdateFailed(context = {}) {
    return new ProfileException(
      'PROFILE-029',
      'Avatar update failed',
      {
        userMessage: '아바타 업데이트에 실패했습니다',
        devMessage: `Avatar update failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'database',
        context,
      }
    );
  }

  static avatarDeleteFailed(context = {}) {
    return new ProfileException(
      'PROFILE-030',
      'Avatar delete failed',
      {
        userMessage: '아바타 삭제에 실패했습니다',
        devMessage: `Avatar delete failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'database',
        context,
      }
    );
  }

  // B-3: PROFILE-031 ~ PROFILE-035 (저장 및 표시)

  static storageFull(context = {}) {
    return new ProfileException(
      'PROFILE-031',
      'Storage full',
      {
        userMessage: '저장 공간이 부족합니다',
        devMessage: 'Storage quota exceeded for user',
        statusCode: 507,
        retryable: false,
        category: 'storage',
        context,
      }
    );
  }

  static avatarNotFound(context = {}) {
    return new ProfileException(
      'PROFILE-032',
      'Avatar not found',
      {
        userMessage: '아바타를 찾을 수 없습니다',
        devMessage: `Avatar not found: ${context.avatarId || 'unknown'}`,
        statusCode: 404,
        retryable: false,
        category: 'not_found',
        context,
      }
    );
  }

  static avatarLoadFailed(context = {}) {
    return new ProfileException(
      'PROFILE-033',
      'Avatar load failed',
      {
        userMessage: '아바타를 불러오는데 실패했습니다',
        devMessage: `Avatar load failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'loading',
        context,
      }
    );
  }

  static avatarUrlInvalid(context = {}) {
    return new ProfileException(
      'PROFILE-034',
      'Avatar URL invalid',
      {
        userMessage: '아바타 URL이 올바르지 않습니다',
        devMessage: `Invalid avatar URL: ${context.url}`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static cropDataInvalid(context = {}) {
    return new ProfileException(
      'PROFILE-035',
      'Crop data invalid',
      {
        userMessage: '이미지 크롭 데이터가 올바르지 않습니다',
        devMessage: 'Invalid crop data provided',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  // ========================================
  // C. PASSWORD (비밀번호) - 15개
  // ========================================

  // C-1: PROFILE-036 ~ PROFILE-040 (검증)

  static passwordRequired(context = {}) {
    return new ProfileException(
      'PROFILE-036',
      'Password required',
      {
        userMessage: '비밀번호는 필수 항목입니다',
        devMessage: 'Password field is required',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static passwordTooShort(context = {}) {
    return new ProfileException(
      'PROFILE-037',
      'Password too short',
      {
        userMessage: '비밀번호는 8자 이상이어야 합니다',
        devMessage: `Password length ${context.length} is less than minimum 8`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static passwordTooLong(context = {}) {
    return new ProfileException(
      'PROFILE-038',
      'Password too long',
      {
        userMessage: '비밀번호는 128자 이하여야 합니다',
        devMessage: `Password length ${context.length} exceeds maximum 128`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static passwordTooWeak(context = {}) {
    return new ProfileException(
      'PROFILE-039',
      'Password too weak',
      {
        userMessage: '비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용해주세요',
        devMessage: `Password strength score ${context.score} is too low`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static passwordNoUppercase(context = {}) {
    return new ProfileException(
      'PROFILE-040',
      'Password no uppercase',
      {
        userMessage: '비밀번호에 대문자가 포함되어야 합니다',
        devMessage: 'Password must contain at least one uppercase letter',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  // C-2: PROFILE-041 ~ PROFILE-045 (보안)

  static passwordNoLowercase(context = {}) {
    return new ProfileException(
      'PROFILE-041',
      'Password no lowercase',
      {
        userMessage: '비밀번호에 소문자가 포함되어야 합니다',
        devMessage: 'Password must contain at least one lowercase letter',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static passwordNoNumber(context = {}) {
    return new ProfileException(
      'PROFILE-042',
      'Password no number',
      {
        userMessage: '비밀번호에 숫자가 포함되어야 합니다',
        devMessage: 'Password must contain at least one number',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static passwordNoSpecialChar(context = {}) {
    return new ProfileException(
      'PROFILE-043',
      'Password no special char',
      {
        userMessage: '비밀번호에 특수문자가 포함되어야 합니다',
        devMessage: 'Password must contain at least one special character',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static passwordReuse(context = {}) {
    return new ProfileException(
      'PROFILE-044',
      'Password reuse',
      {
        userMessage: '최근에 사용한 비밀번호는 사용할 수 없습니다',
        devMessage: 'Password was used recently',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static passwordCommonlyUsed(context = {}) {
    return new ProfileException(
      'PROFILE-045',
      'Password commonly used',
      {
        userMessage: '흔히 사용되는 비밀번호는 사용할 수 없습니다',
        devMessage: 'Password is in common passwords list',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  // C-3: PROFILE-046 ~ PROFILE-050 (변경 및 확인)

  static currentPasswordIncorrect(context = {}) {
    return new ProfileException(
      'PROFILE-046',
      'Current password incorrect',
      {
        userMessage: '현재 비밀번호가 올바르지 않습니다',
        devMessage: 'Current password verification failed',
        statusCode: 401,
        retryable: false,
        category: 'authentication',
        context,
      }
    );
  }

  static passwordChangeCooldown(context = {}) {
    return new ProfileException(
      'PROFILE-047',
      'Password change cooldown',
      {
        userMessage: '비밀번호는 24시간에 한 번만 변경할 수 있습니다',
        devMessage: `Password change cooldown active until ${context.nextAllowedTime}`,
        statusCode: 429,
        retryable: true,
        category: 'rate_limit',
        context,
      }
    );
  }

  static passwordChangeFailed(context = {}) {
    return new ProfileException(
      'PROFILE-048',
      'Password change failed',
      {
        userMessage: '비밀번호 변경에 실패했습니다',
        devMessage: `Password change failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'database',
        context,
      }
    );
  }

  static newPasswordSameAsOld(context = {}) {
    return new ProfileException(
      'PROFILE-049',
      'New password same as old',
      {
        userMessage: '새 비밀번호는 현재 비밀번호와 달라야 합니다',
        devMessage: 'New password is same as current password',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static passwordMismatch(context = {}) {
    return new ProfileException(
      'PROFILE-050',
      'Password mismatch',
      {
        userMessage: '비밀번호가 일치하지 않습니다',
        devMessage: 'Password confirmation does not match',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  // ========================================
  // D. ACCOUNT_DELETE (계정 삭제) - 10개
  // ========================================

  // D-1: PROFILE-051 ~ PROFILE-055 (사전 확인)

  static ownerStudyExists(context = {}) {
    return new ProfileException(
      'PROFILE-051',
      'Owner study exists',
      {
        userMessage: 'OWNER로 있는 스터디가 있습니다. 먼저 스터디를 삭제하거나 소유권을 이전해주세요',
        devMessage: `User owns ${context.studyCount || 0} studies`,
        statusCode: 409,
        retryable: false,
        category: 'conflict',
        context,
      }
    );
  }

  static activeTasksExist(context = {}) {
    return new ProfileException(
      'PROFILE-052',
      'Active tasks exist',
      {
        userMessage: '진행 중인 작업이 있습니다. 모든 작업을 완료한 후 다시 시도해주세요',
        devMessage: `User has ${context.taskCount || 0} active tasks`,
        statusCode: 409,
        retryable: false,
        category: 'conflict',
        context,
      }
    );
  }

  static deletionNotAllowed(context = {}) {
    return new ProfileException(
      'PROFILE-053',
      'Deletion not allowed',
      {
        userMessage: '계정 삭제가 허용되지 않습니다',
        devMessage: `Account deletion not allowed: ${context.reason || 'unknown'}`,
        statusCode: 403,
        retryable: false,
        category: 'authorization',
        context,
      }
    );
  }

  static confirmationMismatch(context = {}) {
    return new ProfileException(
      'PROFILE-054',
      'Confirmation mismatch',
      {
        userMessage: '확인 문구가 일치하지 않습니다',
        devMessage: 'Deletion confirmation text does not match',
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static deletionCooldown(context = {}) {
    return new ProfileException(
      'PROFILE-055',
      'Deletion cooldown',
      {
        userMessage: '계정 삭제는 7일 후에 가능합니다',
        devMessage: `Deletion cooldown active until ${context.nextAllowedTime}`,
        statusCode: 429,
        retryable: true,
        category: 'rate_limit',
        context,
      }
    );
  }

  // D-2: PROFILE-056 ~ PROFILE-060 (삭제 처리)

  static deletionFailed(context = {}) {
    return new ProfileException(
      'PROFILE-056',
      'Deletion failed',
      {
        userMessage: '계정 삭제에 실패했습니다',
        devMessage: `Account deletion failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'database',
        context,
      }
    );
  }

  static dataCleanupFailed(context = {}) {
    return new ProfileException(
      'PROFILE-057',
      'Data cleanup failed',
      {
        userMessage: '데이터 정리에 실패했습니다',
        devMessage: `Data cleanup failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'database',
        context,
      }
    );
  }

  static sessionClearFailed(context = {}) {
    return new ProfileException(
      'PROFILE-058',
      'Session clear failed',
      {
        userMessage: '세션 정리에 실패했습니다',
        devMessage: `Session clear failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'session',
        context,
      }
    );
  }

  static alreadyDeleted(context = {}) {
    return new ProfileException(
      'PROFILE-059',
      'Already deleted',
      {
        userMessage: '이미 삭제된 계정입니다',
        devMessage: `Account ${context.userId} is already deleted`,
        statusCode: 410,
        retryable: false,
        category: 'not_found',
        context,
      }
    );
  }

  static deletionRollbackFailed(context = {}) {
    return new ProfileException(
      'PROFILE-060',
      'Deletion rollback failed',
      {
        userMessage: '삭제 취소에 실패했습니다',
        devMessage: `Deletion rollback failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: false,
        category: 'database',
        context,
      }
    );
  }

  // ========================================
  // E. PRIVACY (프라이버시) - 10개
  // ========================================

  // E-1: PROFILE-061 ~ PROFILE-065 (설정)

  static invalidPrivacySetting(context = {}) {
    return new ProfileException(
      'PROFILE-061',
      'Invalid privacy setting',
      {
        userMessage: '올바르지 않은 프라이버시 설정입니다',
        devMessage: `Invalid privacy setting: ${context.setting || 'unknown'}`,
        statusCode: 400,
        retryable: false,
        category: 'validation',
        context,
      }
    );
  }

  static privacyUpdateFailed(context = {}) {
    return new ProfileException(
      'PROFILE-062',
      'Privacy update failed',
      {
        userMessage: '프라이버시 설정 업데이트에 실패했습니다',
        devMessage: `Privacy update failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'database',
        context,
      }
    );
  }

  static privacyFetchFailed(context = {}) {
    return new ProfileException(
      'PROFILE-063',
      'Privacy fetch failed',
      {
        userMessage: '프라이버시 설정을 불러오는데 실패했습니다',
        devMessage: `Privacy fetch failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'database',
        context,
      }
    );
  }

  static profileVisibilityError(context = {}) {
    return new ProfileException(
      'PROFILE-064',
      'Profile visibility error',
      {
        userMessage: '프로필 공개 설정 변경에 실패했습니다',
        devMessage: `Profile visibility error: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'database',
        context,
      }
    );
  }

  static contactVisibilityError(context = {}) {
    return new ProfileException(
      'PROFILE-065',
      'Contact visibility error',
      {
        userMessage: '연락처 공개 설정 변경에 실패했습니다',
        devMessage: `Contact visibility error: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'database',
        context,
      }
    );
  }

  // E-2: PROFILE-066 ~ PROFILE-070 (데이터 보호)

  static dataExportFailed(context = {}) {
    return new ProfileException(
      'PROFILE-066',
      'Data export failed',
      {
        userMessage: '데이터 내보내기에 실패했습니다',
        devMessage: `Data export failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'export',
        context,
      }
    );
  }

  static dataExportTooLarge(context = {}) {
    return new ProfileException(
      'PROFILE-067',
      'Data export too large',
      {
        userMessage: '데이터가 너무 커서 내보낼 수 없습니다',
        devMessage: `Data export size ${context.size} exceeds maximum`,
        statusCode: 413,
        retryable: false,
        category: 'export',
        context,
      }
    );
  }

  static dataExportInProgress(context = {}) {
    return new ProfileException(
      'PROFILE-068',
      'Data export in progress',
      {
        userMessage: '이미 데이터 내보내기가 진행 중입니다',
        devMessage: 'Data export already in progress',
        statusCode: 409,
        retryable: false,
        category: 'conflict',
        context,
      }
    );
  }

  static gdprRequestFailed(context = {}) {
    return new ProfileException(
      'PROFILE-069',
      'GDPR request failed',
      {
        userMessage: 'GDPR 요청 처리에 실패했습니다',
        devMessage: `GDPR request failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'gdpr',
        context,
      }
    );
  }

  static consentRequired(context = {}) {
    return new ProfileException(
      'PROFILE-070',
      'Consent required',
      {
        userMessage: '동의가 필요합니다',
        devMessage: `Consent required for: ${context.purpose || 'unknown'}`,
        statusCode: 403,
        retryable: false,
        category: 'authorization',
        context,
      }
    );
  }

  // ========================================
  // F. VERIFICATION (인증) - 10개
  // ========================================

  // F-1: PROFILE-071 ~ PROFILE-075 (이메일 인증)

  static emailNotVerified(context = {}) {
    return new ProfileException(
      'PROFILE-071',
      'Email not verified',
      {
        userMessage: '이메일 인증이 필요합니다',
        devMessage: `Email ${context.email} is not verified`,
        statusCode: 403,
        retryable: false,
        category: 'verification',
        context,
      }
    );
  }

  static verificationExpired(context = {}) {
    return new ProfileException(
      'PROFILE-072',
      'Verification expired',
      {
        userMessage: '인증 코드가 만료되었습니다',
        devMessage: 'Verification code has expired',
        statusCode: 410,
        retryable: false,
        category: 'verification',
        context,
      }
    );
  }

  static verificationCodeInvalid(context = {}) {
    return new ProfileException(
      'PROFILE-073',
      'Verification code invalid',
      {
        userMessage: '인증 코드가 올바르지 않습니다',
        devMessage: 'Invalid verification code provided',
        statusCode: 400,
        retryable: false,
        category: 'verification',
        context,
      }
    );
  }

  static verificationSendFailed(context = {}) {
    return new ProfileException(
      'PROFILE-074',
      'Verification send failed',
      {
        userMessage: '인증 코드 발송에 실패했습니다',
        devMessage: `Verification send failed: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'email',
        context,
      }
    );
  }

  static verificationTooManyAttempts(context = {}) {
    return new ProfileException(
      'PROFILE-075',
      'Verification too many attempts',
      {
        userMessage: '인증 시도 횟수를 초과했습니다',
        devMessage: `Too many verification attempts: ${context.attempts}`,
        statusCode: 429,
        retryable: true,
        category: 'rate_limit',
        context,
      }
    );
  }

  // F-2: PROFILE-076 ~ PROFILE-080 (추가 인증)

  static phoneNotVerified(context = {}) {
    return new ProfileException(
      'PROFILE-076',
      'Phone not verified',
      {
        userMessage: '휴대폰 인증이 필요합니다',
        devMessage: `Phone ${context.phone} is not verified`,
        statusCode: 403,
        retryable: false,
        category: 'verification',
        context,
      }
    );
  }

  static twoFactorRequired(context = {}) {
    return new ProfileException(
      'PROFILE-077',
      'Two factor required',
      {
        userMessage: '2단계 인증이 필요합니다',
        devMessage: 'Two-factor authentication is required',
        statusCode: 403,
        retryable: false,
        category: 'authentication',
        context,
      }
    );
  }

  static twoFactorInvalid(context = {}) {
    return new ProfileException(
      'PROFILE-078',
      'Two factor invalid',
      {
        userMessage: '2단계 인증 코드가 올바르지 않습니다',
        devMessage: 'Invalid two-factor authentication code',
        statusCode: 401,
        retryable: false,
        category: 'authentication',
        context,
      }
    );
  }

  static backupCodeInvalid(context = {}) {
    return new ProfileException(
      'PROFILE-079',
      'Backup code invalid',
      {
        userMessage: '백업 코드가 올바르지 않습니다',
        devMessage: 'Invalid backup code provided',
        statusCode: 401,
        retryable: false,
        category: 'authentication',
        context,
      }
    );
  }

  static securityQuestionIncorrect(context = {}) {
    return new ProfileException(
      'PROFILE-080',
      'Security question incorrect',
      {
        userMessage: '보안 질문 답변이 올바르지 않습니다',
        devMessage: 'Incorrect security question answer',
        statusCode: 401,
        retryable: false,
        category: 'authentication',
        context,
      }
    );
  }

  // ========================================
  // G. SOCIAL (소셜 연동) - 10개
  // ========================================

  // G-1: PROFILE-081 ~ PROFILE-085 (연동)

  static socialLinkFailed(context = {}) {
    return new ProfileException(
      'PROFILE-081',
      'Social link failed',
      {
        userMessage: '소셜 계정 연동에 실패했습니다',
        devMessage: `Social link failed for ${context.provider}: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'social',
        context,
      }
    );
  }

  static socialAlreadyLinked(context = {}) {
    return new ProfileException(
      'PROFILE-082',
      'Social already linked',
      {
        userMessage: '이미 연동된 소셜 계정입니다',
        devMessage: `${context.provider} account is already linked`,
        statusCode: 409,
        retryable: false,
        category: 'conflict',
        context,
      }
    );
  }

  static socialUnlinkFailed(context = {}) {
    return new ProfileException(
      'PROFILE-083',
      'Social unlink failed',
      {
        userMessage: '소셜 계정 연동 해제에 실패했습니다',
        devMessage: `Social unlink failed for ${context.provider}: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'social',
        context,
      }
    );
  }

  static socialAccountNotFound(context = {}) {
    return new ProfileException(
      'PROFILE-084',
      'Social account not found',
      {
        userMessage: '연동된 소셜 계정을 찾을 수 없습니다',
        devMessage: `${context.provider} account not found`,
        statusCode: 404,
        retryable: false,
        category: 'not_found',
        context,
      }
    );
  }

  static socialProviderError(context = {}) {
    return new ProfileException(
      'PROFILE-085',
      'Social provider error',
      {
        userMessage: '소셜 로그인 제공자에서 오류가 발생했습니다',
        devMessage: `${context.provider} provider error: ${context.reason || 'unknown'}`,
        statusCode: 502,
        retryable: true,
        category: 'social',
        context,
      }
    );
  }

  // G-2: PROFILE-086 ~ PROFILE-090 (동기화)

  static socialSyncFailed(context = {}) {
    return new ProfileException(
      'PROFILE-086',
      'Social sync failed',
      {
        userMessage: '소셜 계정 동기화에 실패했습니다',
        devMessage: `Social sync failed for ${context.provider}: ${context.reason || 'unknown'}`,
        statusCode: 500,
        retryable: true,
        category: 'social',
        context,
      }
    );
  }

  static socialProfileFetchFailed(context = {}) {
    return new ProfileException(
      'PROFILE-087',
      'Social profile fetch failed',
      {
        userMessage: '소셜 프로필 정보를 가져오는데 실패했습니다',
        devMessage: `Social profile fetch failed for ${context.provider}`,
        statusCode: 500,
        retryable: true,
        category: 'social',
        context,
      }
    );
  }

  static socialTokenExpired(context = {}) {
    return new ProfileException(
      'PROFILE-088',
      'Social token expired',
      {
        userMessage: '소셜 로그인 토큰이 만료되었습니다. 다시 연동해주세요',
        devMessage: `${context.provider} token has expired`,
        statusCode: 401,
        retryable: false,
        category: 'authentication',
        context,
      }
    );
  }

  static socialPermissionDenied(context = {}) {
    return new ProfileException(
      'PROFILE-089',
      'Social permission denied',
      {
        userMessage: '소셜 계정 접근 권한이 거부되었습니다',
        devMessage: `${context.provider} permission denied: ${context.permission}`,
        statusCode: 403,
        retryable: false,
        category: 'authorization',
        context,
      }
    );
  }

  static lastSocialUnlinkDenied(context = {}) {
    return new ProfileException(
      'PROFILE-090',
      'Last social unlink denied',
      {
        userMessage: '마지막 소셜 계정은 연동 해제할 수 없습니다',
        devMessage: 'Cannot unlink the last social login method',
        statusCode: 409,
        retryable: false,
        category: 'conflict',
        context,
      }
    );
  }
}
