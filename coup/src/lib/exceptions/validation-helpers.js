/**
 * 입력 유효성 검사 헬퍼
 * @module lib/exceptions/validation-helpers
 */

/**
 * 이메일 유효성 검사
 * @param {string} email - 검사할 이메일
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return {
      valid: false,
      error: '이메일을 입력해주세요'
    };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: '이메일을 입력해주세요'
    };
  }

  // 기본 이메일 형식 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return {
      valid: false,
      error: '올바른 이메일 형식이 아닙니다'
    };
  }

  // 이메일 길이 제한
  if (trimmed.length > 255) {
    return {
      valid: false,
      error: '이메일이 너무 깁니다 (최대 255자)'
    };
  }

  return { valid: true };
}

/**
 * 비밀번호 유효성 검사
 * @param {string} password - 검사할 비밀번호
 * @param {Object} options - 검사 옵션
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false
  } = options;

  if (!password || typeof password !== 'string') {
    return {
      valid: false,
      error: '비밀번호를 입력해주세요'
    };
  }

  if (password.length < minLength) {
    return {
      valid: false,
      error: `비밀번호는 최소 ${minLength}자 이상이어야 합니다`
    };
  }

  if (password.length > 128) {
    return {
      valid: false,
      error: '비밀번호가 너무 깁니다 (최대 128자)'
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: '비밀번호는 대문자를 포함해야 합니다'
    };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      error: '비밀번호는 소문자를 포함해야 합니다'
    };
  }

  if (requireNumbers && !/[0-9]/.test(password)) {
    return {
      valid: false,
      error: '비밀번호는 숫자를 포함해야 합니다'
    };
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      error: '비밀번호는 특수문자를 포함해야 합니다'
    };
  }

  return { valid: true };
}

/**
 * 이름 유효성 검사
 * @param {string} name - 검사할 이름
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return {
      valid: false,
      error: '이름을 입력해주세요'
    };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: '이름을 입력해주세요'
    };
  }

  if (trimmed.length < 2) {
    return {
      valid: false,
      error: '이름은 최소 2자 이상이어야 합니다'
    };
  }

  if (trimmed.length > 50) {
    return {
      valid: false,
      error: '이름이 너무 깁니다 (최대 50자)'
    };
  }

  return { valid: true };
}

/**
 * 학번 유효성 검사
 * @param {string} studentId - 검사할 학번
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateStudentId(studentId) {
  if (!studentId || typeof studentId !== 'string') {
    return {
      valid: false,
      error: '학번을 입력해주세요'
    };
  }

  const trimmed = studentId.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: '학번을 입력해주세요'
    };
  }

  // 숫자만 허용
  if (!/^\d+$/.test(trimmed)) {
    return {
      valid: false,
      error: '학번은 숫자만 입력 가능합니다'
    };
  }

  if (trimmed.length < 4 || trimmed.length > 20) {
    return {
      valid: false,
      error: '학번은 4-20자 사이여야 합니다'
    };
  }

  return { valid: true };
}

/**
 * 회원가입 데이터 전체 유효성 검사
 * @param {Object} data - 검사할 데이터
 * @returns {Object} { valid: boolean, errors: Object }
 */
export function validateSignupData(data) {
  const errors = {};

  // 이메일 검사
  const emailResult = validateEmail(data.email);
  if (!emailResult.valid) {
    errors.email = emailResult.error;
  }

  // 비밀번호 검사
  const passwordResult = validatePassword(data.password);
  if (!passwordResult.valid) {
    errors.password = passwordResult.error;
  }

  // 이름 검사
  const nameResult = validateName(data.name);
  if (!nameResult.valid) {
    errors.name = nameResult.error;
  }

  // 학번 검사 (선택적)
  if (data.studentId) {
    const studentIdResult = validateStudentId(data.studentId);
    if (!studentIdResult.valid) {
      errors.studentId = studentIdResult.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * 입력값 정제 (sanitize)
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, ''); // 제어 문자 제거
}

/**
 * 이메일 정제 (소문자 변환 + trim)
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return email;
  return email.trim().toLowerCase();
}

