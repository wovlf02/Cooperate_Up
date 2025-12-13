/**
 * Profile 영역 유효성 검증 함수들
 * 
 * @description
 * 프로필 정보, 비밀번호, 아바타 등의 유효성을 검증하는 함수들
 * 
 * @category Validation
 * @author CoUp Team
 * @created 2025-12-01
 */

/**
 * 프로필 이름 검증
 * 
 * @param {string} name - 검증할 이름
 * @returns {{ valid: boolean, error?: string }} 검증 결과
 * 
 * @example
 * const result = validateProfileName('홍길동')
 * if (!result.valid) {
 *   console.error(result.error)
 * }
 */
export function validateProfileName(name) {
  // 필수 체크
  if (!name) {
    return { valid: false, error: '이름은 필수 항목입니다' };
  }

  // 타입 체크
  if (typeof name !== 'string') {
    return { valid: false, error: '이름은 문자열이어야 합니다' };
  }

  const trimmed = name.trim();

  // 최소 길이 체크
  if (trimmed.length < 2) {
    return { valid: false, error: '이름은 2자 이상이어야 합니다' };
  }

  // 최대 길이 체크
  if (trimmed.length > 50) {
    return { valid: false, error: '이름은 50자 이하여야 합니다' };
  }

  // 허용된 문자만 사용 (한글, 영문, 숫자, 일부 특수문자)
  const nameRegex = /^[가-힣a-zA-Z0-9\s\-_.]+$/;
  if (!nameRegex.test(trimmed)) {
    return { 
      valid: false, 
      error: '이름에는 한글, 영문, 숫자, 공백, 하이픈, 언더스코어, 점만 사용할 수 있습니다' 
    };
  }

  // 연속된 공백 체크
  if (/\s{2,}/.test(trimmed)) {
    return { valid: false, error: '연속된 공백은 사용할 수 없습니다' };
  }

  // 시작/끝 공백 체크
  if (trimmed !== name) {
    return { valid: false, error: '이름의 앞뒤에 공백을 사용할 수 없습니다' };
  }

  return { valid: true };
}

/**
 * 자기소개 검증
 * 
 * @param {string} bio - 검증할 자기소개
 * @returns {{ valid: boolean, error?: string }} 검증 결과
 */
export function validateBio(bio) {
  // 선택 사항이므로 빈 값 허용
  if (!bio) {
    return { valid: true };
  }

  // 타입 체크
  if (typeof bio !== 'string') {
    return { valid: false, error: '자기소개는 문자열이어야 합니다' };
  }

  // 최대 길이 체크
  if (bio.length > 200) {
    return { 
      valid: false, 
      error: `자기소개는 200자 이하여야 합니다 (현재: ${bio.length}자)` 
    };
  }

  // 제어 문자 체크 (탭, 개행은 허용)
  const controlCharsRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
  if (controlCharsRegex.test(bio)) {
    return { valid: false, error: '자기소개에 허용되지 않는 문자가 포함되어 있습니다' };
  }

  return { valid: true };
}

/**
 * 비밀번호 강도 검증
 * 
 * @param {string} password - 검증할 비밀번호
 * @returns {{ 
 *   valid: boolean, 
 *   score: number, 
 *   feedback: string[], 
 *   warning: string,
 *   crackTime: string,
 *   error?: string 
 * }} 검증 결과
 * 
 * @example
 * const result = validatePasswordStrength('MyP@ssw0rd123')
 * console.log(result.score) // 0-4
 */
export function validatePasswordStrength(password) {
  // 기본 검증
  if (!password) {
    return {
      valid: false,
      score: 0,
      feedback: [],
      warning: '',
      crackTime: '',
      error: '비밀번호는 필수 항목입니다',
    };
  }

  if (typeof password !== 'string') {
    return {
      valid: false,
      score: 0,
      feedback: [],
      warning: '',
      crackTime: '',
      error: '비밀번호는 문자열이어야 합니다',
    };
  }

  // 길이 체크
  if (password.length < 8) {
    return {
      valid: false,
      score: 0,
      feedback: ['비밀번호는 최소 8자 이상이어야 합니다'],
      warning: '비밀번호가 너무 짧습니다',
      crackTime: '',
      error: '비밀번호는 8자 이상이어야 합니다',
    };
  }

  if (password.length > 128) {
    return {
      valid: false,
      score: 0,
      feedback: [],
      warning: '비밀번호가 너무 깁니다',
      crackTime: '',
      error: '비밀번호는 128자 이하여야 합니다',
    };
  }

  // 복잡도 체크
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const complexityCount = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;
  
  // 점수 계산 (간단한 버전, zxcvbn 없이)
  let score = 0;
  const feedback = [];

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (complexityCount >= 3) score += 1;
  if (complexityCount === 4) score += 1;

  // 피드백 생성
  if (!hasUppercase) {
    feedback.push('대문자를 포함하면 더 안전합니다');
  }
  if (!hasLowercase) {
    feedback.push('소문자를 포함하면 더 안전합니다');
  }
  if (!hasNumber) {
    feedback.push('숫자를 포함하면 더 안전합니다');
  }
  if (!hasSpecialChar) {
    feedback.push('특수문자를 포함하면 더 안전합니다');
  }
  if (password.length < 12) {
    feedback.push('12자 이상 사용하면 더 안전합니다');
  }

  // 흔한 패턴 체크
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /^admin/i,
    /(.)\1{2,}/, // 같은 문자 3번 이상 반복
  ];

  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
  if (hasCommonPattern) {
    score = Math.max(0, score - 1);
    feedback.push('흔히 사용되는 패턴을 피해주세요');
  }

  // 크랙 시간 추정 (대략적)
  const crackTimes = [
    '즉시',
    '몇 초',
    '몇 분',
    '몇 시간',
    '며칠',
  ];
  const crackTime = crackTimes[score] || '알 수 없음';

  // 최소 요구사항 체크
  const meetsMinimumRequirements = complexityCount >= 2 && password.length >= 8;

  return {
    valid: meetsMinimumRequirements && score >= 2,
    score,
    feedback,
    warning: score < 2 ? '비밀번호가 너무 약합니다' : '',
    crackTime,
  };
}

/**
 * XSS 패턴 검사
 * 
 * @param {string} text - 검사할 텍스트
 * @returns {boolean} XSS 패턴이 감지되면 true
 * 
 * @example
 * if (checkXSS(userInput)) {
 *   throw new Error('XSS detected')
 * }
 */
export function checkXSS(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,      // <script> 태그
    /javascript:/gi,                      // javascript: 프로토콜
    /on\w+\s*=/gi,                        // 이벤트 핸들러 (onclick, onload 등)
    /<iframe/gi,                          // <iframe> 태그
    /<embed/gi,                           // <embed> 태그
    /<object/gi,                          // <object> 태그
    /<img[^>]+src[^>]*>/gi,              // <img> 태그
    /<link/gi,                            // <link> 태그
    /<meta/gi,                            // <meta> 태그
    /eval\s*\(/gi,                        // eval() 함수
    /expression\s*\(/gi,                  // expression() (IE)
    /vbscript:/gi,                        // vbscript: 프로토콜
    /data:text\/html/gi,                  // data:text/html
    /<svg/gi,                             // <svg> 태그
    /<form/gi,                            // <form> 태그
    /<input/gi,                           // <input> 태그
  ];

  return xssPatterns.some(pattern => pattern.test(text));
}

/**
 * SQL Injection 패턴 검사
 * 
 * @param {string} text - 검사할 텍스트
 * @returns {boolean} SQL Injection 패턴이 감지되면 true
 */
export function checkSQLInjection(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
    /('|\")(\s*)(OR|AND)(\s*)('|\")/gi,
  ];

  return sqlPatterns.some(pattern => pattern.test(text));
}

/**
 * 아바타 파일 검증
 * 
 * @param {File} file - 검증할 파일 객체
 * @returns {{ valid: boolean, error?: string }} 검증 결과
 * 
 * @example
 * const result = validateAvatarFile(uploadedFile)
 * if (!result.valid) {
 *   alert(result.error)
 * }
 */
export function validateAvatarFile(file) {
  if (!file) {
    return { valid: false, error: '파일이 제공되지 않았습니다' };
  }

  // 파일 크기 체크 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `파일 크기는 5MB 이하여야 합니다 (현재: ${sizeMB}MB)`,
    };
  }

  // 최소 크기 체크 (1KB)
  const minSize = 1024;
  if (file.size < minSize) {
    return {
      valid: false,
      error: '파일이 너무 작습니다',
    };
  }

  // 파일 타입 체크
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'JPG, PNG, GIF, WebP 형식만 지원합니다',
    };
  }

  // 파일 확장자 체크
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return {
      valid: false,
      error: '허용되지 않은 파일 확장자입니다',
    };
  }

  return { valid: true };
}

/**
 * 이미지 차원(크기) 검증
 * 
 * @param {number} width - 이미지 너비
 * @param {number} height - 이미지 높이
 * @returns {{ valid: boolean, error?: string }} 검증 결과
 */
export function validateImageDimensions(width, height) {
  const minDimension = 100;
  const maxDimension = 4096;

  if (width < minDimension || height < minDimension) {
    return {
      valid: false,
      error: `이미지는 최소 ${minDimension}x${minDimension}px 이상이어야 합니다`,
    };
  }

  if (width > maxDimension || height > maxDimension) {
    return {
      valid: false,
      error: `이미지는 최대 ${maxDimension}x${maxDimension}px 이하여야 합니다`,
    };
  }

  return { valid: true };
}

/**
 * 이메일 형식 검증
 * 
 * @param {string} email - 검증할 이메일
 * @returns {{ valid: boolean, error?: string }} 검증 결과
 * 
 * @example
 * const result = validateEmail('user@example.com')
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, error: '이메일은 필수 항목입니다' };
  }

  if (typeof email !== 'string') {
    return { valid: false, error: '이메일은 문자열이어야 합니다' };
  }

  const trimmed = email.trim();

  // 길이 체크
  if (trimmed.length > 254) {
    return { valid: false, error: '이메일이 너무 깁니다' };
  }

  // 이메일 형식 체크 (RFC 5322 간소화 버전)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: '올바른 이메일 형식이 아닙니다' };
  }

  // @ 개수 체크
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount !== 1) {
    return { valid: false, error: '올바른 이메일 형식이 아닙니다' };
  }

  // 도메인 부분 체크
  const [localPart, domain] = trimmed.split('@');
  
  if (localPart.length > 64) {
    return { valid: false, error: '이메일 앞부분이 너무 깁니다' };
  }

  if (domain.length < 3) {
    return { valid: false, error: '도메인이 너무 짧습니다' };
  }

  // 연속된 점 체크
  if (trimmed.includes('..')) {
    return { valid: false, error: '올바른 이메일 형식이 아닙니다' };
  }

  return { valid: true };
}

/**
 * 금지된 닉네임 확인
 * 
 * @param {string} name - 확인할 닉네임
 * @returns {boolean} 금지된 닉네임이면 true
 * 
 * @example
 * if (isForbiddenNickname('admin')) {
 *   throw new Error('Forbidden nickname')
 * }
 */
export function isForbiddenNickname(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const forbiddenNames = [
    'admin',
    'administrator',
    'root',
    'system',
    'master',
    'owner',
    'moderator',
    'mod',
    'support',
    'staff',
    'official',
    'coup',
    'null',
    'undefined',
    'anonymous',
    'guest',
    'user',
    'test',
    'demo',
    'example',
  ];

  const lowerName = name.toLowerCase().trim();
  
  // 정확히 일치하는 경우
  if (forbiddenNames.includes(lowerName)) {
    return true;
  }

  // 포함하는 경우 (예: admin123, test_user)
  const containsForbidden = forbiddenNames.some(forbidden => 
    lowerName.includes(forbidden) && lowerName.length < forbidden.length + 3
  );

  return containsForbidden;
}

/**
 * 크롭 데이터 검증
 * 
 * @param {Object} cropData - 크롭 데이터
 * @param {number} cropData.x - X 좌표
 * @param {number} cropData.y - Y 좌표
 * @param {number} cropData.width - 너비
 * @param {number} cropData.height - 높이
 * @returns {{ valid: boolean, error?: string }} 검증 결과
 */
export function validateCropData(cropData) {
  if (!cropData || typeof cropData !== 'object') {
    return { valid: false, error: '크롭 데이터가 제공되지 않았습니다' };
  }

  const { x, y, width, height } = cropData;

  // 필수 필드 체크
  if (x === undefined || y === undefined || width === undefined || height === undefined) {
    return { valid: false, error: '크롭 데이터가 불완전합니다' };
  }

  // 숫자 타입 체크
  if (typeof x !== 'number' || typeof y !== 'number' || 
      typeof width !== 'number' || typeof height !== 'number') {
    return { valid: false, error: '크롭 데이터는 숫자여야 합니다' };
  }

  // 음수 체크
  if (x < 0 || y < 0 || width < 0 || height < 0) {
    return { valid: false, error: '크롭 데이터는 0 이상이어야 합니다' };
  }

  // 최소 크기 체크
  if (width < 50 || height < 50) {
    return { valid: false, error: '크롭 영역이 너무 작습니다 (최소 50x50px)' };
  }

  // 최대 크기 체크
  if (width > 4096 || height > 4096) {
    return { valid: false, error: '크롭 영역이 너무 큽니다' };
  }

  return { valid: true };
}

/**
 * 비밀번호 확인 일치 검증
 * 
 * @param {string} password - 비밀번호
 * @param {string} confirmPassword - 확인 비밀번호
 * @returns {{ valid: boolean, error?: string }} 검증 결과
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (!password || !confirmPassword) {
    return { valid: false, error: '비밀번호를 입력해주세요' };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: '비밀번호가 일치하지 않습니다' };
  }

  return { valid: true };
}

/**
 * 계정 삭제 확인 문구 검증
 * 
 * @param {string} input - 사용자 입력
 * @param {string} expected - 기대값 (기본: '계정을 삭제합니다')
 * @returns {{ valid: boolean, error?: string }} 검증 결과
 */
export function validateDeletionConfirmation(input, expected = '계정을 삭제합니다') {
  if (!input) {
    return { valid: false, error: '확인 문구를 입력해주세요' };
  }

  if (input.trim() !== expected) {
    return { 
      valid: false, 
      error: `"${expected}"를 정확히 입력해주세요` 
    };
  }

  return { valid: true };
}
