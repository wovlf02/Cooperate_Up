/**
 * 인증 예외 처리 헬퍼
 * @module lib/exceptions/auth-errors
 */

export class AuthError extends Error {
  constructor(message, code, statusCode = 400) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const AUTH_ERRORS = {
  // 인증 실패
  INVALID_CREDENTIALS: {
    code: 'AUTH_001',
    message: '이메일 또는 비밀번호가 일치하지 않습니다',
    statusCode: 401
  },
  MISSING_CREDENTIALS: {
    code: 'AUTH_002',
    message: '이메일과 비밀번호를 입력해주세요',
    statusCode: 400
  },
  SOCIAL_ACCOUNT: {
    code: 'AUTH_003',
    message: '소셜 로그인 계정입니다. 해당 방법으로 로그인해주세요',
    statusCode: 400
  },

  // 계정 상태
  ACCOUNT_DELETED: {
    code: 'AUTH_004',
    message: '삭제된 계정입니다',
    statusCode: 403
  },
  ACCOUNT_SUSPENDED: {
    code: 'AUTH_005',
    message: '정지된 계정입니다',
    statusCode: 403
  },

  // 세션
  NO_SESSION: {
    code: 'AUTH_006',
    message: '로그인이 필요합니다',
    statusCode: 401
  },
  SESSION_EXPIRED: {
    code: 'AUTH_007',
    message: '세션이 만료되었습니다',
    statusCode: 401
  },
  INVALID_SESSION: {
    code: 'AUTH_008',
    message: '유효하지 않은 세션입니다',
    statusCode: 401
  },

  // 권한
  INSUFFICIENT_PERMISSION: {
    code: 'AUTH_009',
    message: '권한이 없습니다',
    statusCode: 403
  },

  // Rate Limiting
  TOO_MANY_ATTEMPTS: {
    code: 'AUTH_010',
    message: '로그인 시도 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요',
    statusCode: 429
  },

  // 데이터베이스
  DB_CONNECTION_ERROR: {
    code: 'AUTH_011',
    message: '데이터베이스 연결에 실패했습니다',
    statusCode: 503
  },
  DB_QUERY_ERROR: {
    code: 'AUTH_012',
    message: '데이터베이스 조회 중 오류가 발생했습니다',
    statusCode: 500
  },

  // 회원가입
  EMAIL_ALREADY_EXISTS: {
    code: 'AUTH_013',
    message: '이미 사용 중인 이메일입니다',
    statusCode: 409
  },
  INVALID_EMAIL_FORMAT: {
    code: 'AUTH_014',
    message: '올바른 이메일 형식이 아닙니다',
    statusCode: 400
  },
  PASSWORD_TOO_SHORT: {
    code: 'AUTH_015',
    message: '비밀번호는 최소 8자 이상이어야 합니다',
    statusCode: 400
  },
  WEAK_PASSWORD: {
    code: 'AUTH_016',
    message: '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다',
    statusCode: 400
  },

  // JWT/세션
  JWT_GENERATION_ERROR: {
    code: 'AUTH_017',
    message: 'JWT 토큰 생성에 실패했습니다',
    statusCode: 500
  },
  JWT_VERIFICATION_ERROR: {
    code: 'AUTH_018',
    message: 'JWT 토큰 검증에 실패했습니다',
    statusCode: 401
  },
  TOKEN_EXPIRED: {
    code: 'AUTH_019',
    message: '토큰이 만료되었습니다',
    statusCode: 401
  },

  // 일반
  UNKNOWN_ERROR: {
    code: 'AUTH_999',
    message: '알 수 없는 오류가 발생했습니다',
    statusCode: 500
  }
};

/**
 * API 에러 응답 생성
 * @param {string} errorCode - AUTH_ERRORS의 키
 * @param {Object} details - 추가 상세 정보
 * @returns {Object} 에러 응답 객체
 */
export function createAuthErrorResponse(errorCode, details = null) {
  const error = AUTH_ERRORS[errorCode];
  if (!error) {
    return {
      error: AUTH_ERRORS.UNKNOWN_ERROR.code,
      message: AUTH_ERRORS.UNKNOWN_ERROR.message,
      details,
      statusCode: 500
    };
  }

  const response = {
    error: error.code,
    message: error.message,
    statusCode: error.statusCode
  };

  if (details) {
    response.details = details;
  }

  return response;
}

/**
 * AuthError를 API 응답으로 변환
 * @param {AuthError|Error} error - 에러 객체
 * @returns {Object} API 응답 객체
 */
export function formatAuthError(error) {
  if (error instanceof AuthError) {
    return {
      error: error.code,
      message: error.message,
      statusCode: error.statusCode
    };
  }

  // 일반 Error인 경우
  return {
    error: AUTH_ERRORS.UNKNOWN_ERROR.code,
    message: error.message || AUTH_ERRORS.UNKNOWN_ERROR.message,
    statusCode: 500
  };
}

/**
 * 에러 로깅 헬퍼
 * @param {string} context - 에러 발생 위치
 * @param {Error} error - 에러 객체
 * @param {Object} metadata - 추가 메타데이터
 */
export function logAuthError(context, error, metadata = {}) {
  console.error(`❌ [AUTH ERROR] ${context}:`, {
    message: error.message,
    code: error.code || 'UNKNOWN',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    ...metadata
  });
}

/**
 * 인증 실패 응답 생성 (보안 강화)
 * 사용자 존재 여부를 숨기기 위해 동일한 메시지 사용
 */
export function createInvalidCredentialsResponse() {
  return createAuthErrorResponse('INVALID_CREDENTIALS');
}

