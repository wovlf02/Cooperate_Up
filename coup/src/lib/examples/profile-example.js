/**
 * Profile Exception 시스템 사용 예제
 * 
 * @description
 * ProfileException, Validators, Logger의 실제 사용 예제
 * 
 * 실행: node coup/src/lib/examples/profile-example.js
 */

// Import 예제
import { ProfileException } from '../exceptions/profile/ProfileException.js';
import { 
  validateProfileName, 
  validateBio,
  validatePasswordStrength,
  checkXSS,
  validateEmail 
} from '../utils/profile/validators.js';
import { 
  logProfileInfo, 
  logProfileError,
  logProfileSecurity 
} from '../loggers/profile/profileLogger.js';

console.log('🚀 Profile Exception 시스템 사용 예제\n');

// ====================================
// 예제 1: 프로필 이름 검증 및 예외 처리
// ====================================
console.log('📝 예제 1: 프로필 이름 검증\n');

function validateAndUpdateName(name, userId) {
  try {
    // 1. 이름 검증
    const validation = validateProfileName(name);
    if (!validation.valid) {
      throw ProfileException.invalidNameFormat({
        name,
        error: validation.error,
        userId
      });
    }

    // 2. XSS 검사
    if (checkXSS(name)) {
      logProfileSecurity('XSS_DETECTED', {
        userId,
        field: 'name',
        value: name
      });
      throw ProfileException.xssDetected({
        field: 'name',
        userId
      });
    }

    // 3. 성공
    logProfileInfo('Name validated successfully', { userId, name });
    return { success: true, name };

  } catch (error) {
    if (error instanceof ProfileException) {
      console.log(`❌ 에러 발생: ${error.code}`);
      console.log(`   사용자 메시지: ${error.userMessage}`);
      console.log(`   개발자 메시지: ${error.devMessage}`);
      console.log('');
    }
    throw error;
  }
}

// 정상 케이스
try {
  const result1 = validateAndUpdateName('홍길동', 'user123');
  console.log('✅ 정상 케이스:', result1.name);
} catch (e) {
  // 이미 처리됨
}

// 에러 케이스 1: 너무 짧음
try {
  validateAndUpdateName('a', 'user123');
} catch (e) {
  // 에러 출력됨
}

// 에러 케이스 2: XSS 공격
try {
  validateAndUpdateName('<script>alert(1)</script>', 'user123');
} catch (e) {
  // 에러 출력됨
}

console.log('');

// ====================================
// 예제 2: 비밀번호 강도 검증
// ====================================
console.log('📝 예제 2: 비밀번호 강도 검증\n');

function validatePassword(password) {
  const strength = validatePasswordStrength(password);
  
  console.log(`비밀번호: ${password}`);
  console.log(`검증 결과: ${strength.valid ? '✅ 통과' : '❌ 실패'}`);
  console.log(`강도 점수: ${strength.score}/4`);
  
  if (strength.feedback.length > 0) {
    console.log(`피드백:`);
    strength.feedback.forEach(f => console.log(`  - ${f}`));
  }
  
  console.log(`크랙 시간: ${strength.crackTime}`);
  console.log('');
  
  return strength;
}

// 약한 비밀번호
validatePassword('12345678');

// 강한 비밀번호
validatePassword('MyP@ssw0rd123!');

// ====================================
// 예제 3: Exception 응답 형식
// ====================================
console.log('📝 예제 3: Exception 응답 형식\n');

const exception = ProfileException.duplicateEmail({
  email: 'test@example.com',
  userId: 'user123'
});

console.log('Exception 객체:');
console.log(JSON.stringify(exception.toJSON(), null, 2));
console.log('');

console.log('API 응답 형식:');
console.log(JSON.stringify(exception.toResponse(), null, 2));
console.log('');

// ====================================
// 예제 4: 여러 검증 함수 조합
// ====================================
console.log('📝 예제 4: 프로필 업데이트 검증\n');

function validateProfileUpdate(data) {
  const errors = {};

  // 이름 검증
  if (data.name) {
    const nameValidation = validateProfileName(data.name);
    if (!nameValidation.valid) {
      errors.name = nameValidation.error;
    }
    if (checkXSS(data.name)) {
      errors.name = 'XSS 패턴이 감지되었습니다';
    }
  }

  // 자기소개 검증
  if (data.bio) {
    const bioValidation = validateBio(data.bio);
    if (!bioValidation.valid) {
      errors.bio = bioValidation.error;
    }
    if (checkXSS(data.bio)) {
      errors.bio = 'XSS 패턴이 감지되었습니다';
    }
  }

  // 이메일 검증
  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

// 정상 데이터
const validData = {
  name: '홍길동',
  bio: '안녕하세요!',
  email: 'test@example.com'
};

const result1 = validateProfileUpdate(validData);
console.log('정상 데이터 검증:', result1.valid ? '✅ 통과' : '❌ 실패');

// 문제가 있는 데이터
const invalidData = {
  name: 'a',  // 너무 짧음
  bio: 'x'.repeat(201),  // 너무 김
  email: 'invalid-email'  // 형식 오류
};

const result2 = validateProfileUpdate(invalidData);
console.log('문제 데이터 검증:', result2.valid ? '✅ 통과' : '❌ 실패');
if (!result2.valid) {
  console.log('에러 목록:');
  Object.entries(result2.errors).forEach(([field, error]) => {
    console.log(`  - ${field}: ${error}`);
  });
}

console.log('\n✅ 모든 예제 완료!');
