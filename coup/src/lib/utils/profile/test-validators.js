/**
 * Profile Validators 테스트
 * 
 * @description
 * validators.js의 모든 함수를 테스트
 * 
 * 실행: node coup/src/lib/utils/profile/test-validators.js
 */

import {
  validateProfileName,
  validateBio,
  validatePasswordStrength,
  checkXSS,
  checkSQLInjection,
  validateAvatarFile,
  validateEmail,
  isForbiddenNickname,
  validatePasswordMatch,
  validateDeletionConfirmation,
} from './validators.js';

console.log('🧪 Profile Validators 테스트 시작\n');

let testCount = 0;
let passCount = 0;

function test(description, fn) {
  testCount++;
  try {
    fn();
    passCount++;
    console.log(`✅ ${description}`);
  } catch (error) {
    console.error(`❌ ${description}`);
    console.error(`   ${error.message}`);
  }
}

// validateProfileName 테스트
test('이름 검증: 정상 케이스', () => {
  const result = validateProfileName('홍길동');
  if (!result.valid) throw new Error('Should be valid');
});

test('이름 검증: 영문 이름', () => {
  const result = validateProfileName('John Doe');
  if (!result.valid) throw new Error('Should be valid');
});

test('이름 검증: 빈 값', () => {
  const result = validateProfileName('');
  if (result.valid) throw new Error('Should be invalid');
  if (!result.error.includes('필수')) throw new Error('Wrong error message');
});

test('이름 검증: 너무 짧음', () => {
  const result = validateProfileName('a');
  if (result.valid) throw new Error('Should be invalid');
  if (!result.error.includes('2자')) throw new Error('Wrong error message');
});

test('이름 검증: 너무 김', () => {
  const result = validateProfileName('a'.repeat(51));
  if (result.valid) throw new Error('Should be invalid');
  if (!result.error.includes('50자')) throw new Error('Wrong error message');
});

test('이름 검증: 특수문자 허용 (하이픈, 언더스코어)', () => {
  const result = validateProfileName('홍길동-테스트_123');
  if (!result.valid) throw new Error('Should be valid');
});

// validateBio 테스트
test('자기소개 검증: 정상 케이스', () => {
  const result = validateBio('안녕하세요!');
  if (!result.valid) throw new Error('Should be valid');
});

test('자기소개 검증: 빈 값 (선택사항)', () => {
  const result = validateBio('');
  if (!result.valid) throw new Error('Should be valid (optional)');
});

test('자기소개 검증: 너무 김', () => {
  const result = validateBio('a'.repeat(201));
  if (result.valid) throw new Error('Should be invalid');
  if (!result.error.includes('200자')) throw new Error('Wrong error message');
});

// validatePasswordStrength 테스트
test('비밀번호 검증: 강한 비밀번호', () => {
  const result = validatePasswordStrength('MyP@ssw0rd123!');
  if (!result.valid) throw new Error('Should be valid');
  if (result.score < 2) throw new Error('Score too low');
});

test('비밀번호 검증: 너무 짧음', () => {
  const result = validatePasswordStrength('Pass1!');
  if (result.valid) throw new Error('Should be invalid');
  if (!result.error.includes('8자')) throw new Error('Wrong error message');
});

test('비밀번호 검증: 약한 비밀번호', () => {
  const result = validatePasswordStrength('12345678');
  if (result.valid) throw new Error('Should be invalid (too weak)');
});

test('비밀번호 검증: 너무 김', () => {
  const result = validatePasswordStrength('a'.repeat(129));
  if (result.valid) throw new Error('Should be invalid');
  if (!result.error.includes('128자')) throw new Error('Wrong error message');
});

// checkXSS 테스트
test('XSS 검사: 정상 텍스트', () => {
  const result = checkXSS('안녕하세요');
  if (result) throw new Error('Should not detect XSS');
});

test('XSS 검사: <script> 태그', () => {
  const result = checkXSS('<script>alert(1)</script>');
  if (!result) throw new Error('Should detect XSS');
});

test('XSS 검사: javascript: 프로토콜', () => {
  const result = checkXSS('javascript:alert(1)');
  if (!result) throw new Error('Should detect XSS');
});

test('XSS 검사: onclick 이벤트', () => {
  const result = checkXSS('<div onclick="alert(1)">');
  if (!result) throw new Error('Should detect XSS');
});

// checkSQLInjection 테스트
test('SQL Injection 검사: 정상 텍스트', () => {
  const result = checkSQLInjection('안녕하세요');
  if (result) throw new Error('Should not detect SQL injection');
});

test('SQL Injection 검사: SELECT 문', () => {
  const result = checkSQLInjection("SELECT * FROM users");
  if (!result) throw new Error('Should detect SQL injection');
});

test('SQL Injection 검사: OR 1=1', () => {
  const result = checkSQLInjection("admin' OR '1'='1");
  if (!result) throw new Error('Should detect SQL injection');
});

// validateEmail 테스트
test('이메일 검증: 정상 케이스', () => {
  const result = validateEmail('test@example.com');
  if (!result.valid) throw new Error('Should be valid');
});

test('이메일 검증: 복잡한 이메일', () => {
  const result = validateEmail('user.name+tag@example.co.kr');
  if (!result.valid) throw new Error('Should be valid');
});

test('이메일 검증: 빈 값', () => {
  const result = validateEmail('');
  if (result.valid) throw new Error('Should be invalid');
});

test('이메일 검증: @ 없음', () => {
  const result = validateEmail('testexample.com');
  if (result.valid) throw new Error('Should be invalid');
});

test('이메일 검증: 여러 개의 @', () => {
  const result = validateEmail('test@@example.com');
  if (result.valid) throw new Error('Should be invalid');
});

// isForbiddenNickname 테스트
test('금지 닉네임: admin', () => {
  const result = isForbiddenNickname('admin');
  if (!result) throw new Error('Should be forbidden');
});

test('금지 닉네임: Admin (대소문자)', () => {
  const result = isForbiddenNickname('Admin');
  if (!result) throw new Error('Should be forbidden');
});

test('금지 닉네임: 정상 닉네임', () => {
  const result = isForbiddenNickname('홍길동');
  if (result) throw new Error('Should not be forbidden');
});

// validatePasswordMatch 테스트
test('비밀번호 확인: 일치', () => {
  const result = validatePasswordMatch('password123', 'password123');
  if (!result.valid) throw new Error('Should be valid');
});

test('비밀번호 확인: 불일치', () => {
  const result = validatePasswordMatch('password123', 'password456');
  if (result.valid) throw new Error('Should be invalid');
  if (!result.error.includes('일치')) throw new Error('Wrong error message');
});

// validateDeletionConfirmation 테스트
test('삭제 확인: 정확한 입력', () => {
  const result = validateDeletionConfirmation('계정을 삭제합니다');
  if (!result.valid) throw new Error('Should be valid');
});

test('삭제 확인: 잘못된 입력', () => {
  const result = validateDeletionConfirmation('계정 삭제');
  if (result.valid) throw new Error('Should be invalid');
});

// 결과 출력
console.log(`\n📊 테스트 결과: ${passCount}/${testCount} 통과`);

if (passCount === testCount) {
  console.log('✅ 모든 테스트 통과!');
  process.exit(0);
} else {
  console.log(`❌ ${testCount - passCount}개 테스트 실패`);
  process.exit(1);
}
