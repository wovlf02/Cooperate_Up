/**
 * Profile Exception 클래스 테스트
 * 
 * @description
 * ProfileException 클래스의 모든 메서드를 간단히 테스트
 * 
 * 실행: node coup/src/lib/exceptions/profile/test-ProfileException.js
 */

import { ProfileException } from './ProfileException.js';

console.log('🧪 ProfileException 테스트 시작\n');

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

// A. PROFILE_INFO (20개)
test('A-1. requiredFieldMissing', () => {
  const ex = ProfileException.requiredFieldMissing({ field: 'name', userId: '123' });
  if (ex.code !== 'PROFILE-001') throw new Error('Wrong code');
  if (!ex.userMessage.includes('필수')) throw new Error('Wrong message');
});

test('A-2. invalidNameFormat', () => {
  const ex = ProfileException.invalidNameFormat({ name: '!@#' });
  if (ex.code !== 'PROFILE-002') throw new Error('Wrong code');
});

test('A-3. nameTooShort', () => {
  const ex = ProfileException.nameTooShort({ length: 1 });
  if (ex.code !== 'PROFILE-003') throw new Error('Wrong code');
});

test('A-4. nameTooLong', () => {
  const ex = ProfileException.nameTooLong({ length: 100 });
  if (ex.code !== 'PROFILE-004') throw new Error('Wrong code');
});

test('A-5. bioTooLong', () => {
  const ex = ProfileException.bioTooLong({ length: 300 });
  if (ex.code !== 'PROFILE-005') throw new Error('Wrong code');
});

test('A-6. duplicateEmail', () => {
  const ex = ProfileException.duplicateEmail({ email: 'test@example.com' });
  if (ex.code !== 'PROFILE-007') throw new Error('Wrong code');
  if (ex.statusCode !== 409) throw new Error('Wrong status code');
});

test('A-7. xssDetected', () => {
  const ex = ProfileException.xssDetected({ field: 'bio' });
  if (ex.code !== 'PROFILE-012') throw new Error('Wrong code');
  if (ex.category !== 'security') throw new Error('Wrong category');
});

test('A-8. unauthorizedAccess', () => {
  const ex = ProfileException.unauthorizedAccess({ profileId: '123' });
  if (ex.code !== 'PROFILE-016') throw new Error('Wrong code');
  if (ex.statusCode !== 403) throw new Error('Wrong status code');
});

test('A-9. accountDeleted', () => {
  const ex = ProfileException.accountDeleted({ userId: '123' });
  if (ex.code !== 'PROFILE-019') throw new Error('Wrong code');
  if (ex.statusCode !== 410) throw new Error('Wrong status code');
});

// B. AVATAR (15개)
test('B-1. fileNotProvided', () => {
  const ex = ProfileException.fileNotProvided();
  if (ex.code !== 'PROFILE-021') throw new Error('Wrong code');
});

test('B-2. fileTooLarge', () => {
  const ex = ProfileException.fileTooLarge({ size: 10000000, maxSize: '5MB' });
  if (ex.code !== 'PROFILE-022') throw new Error('Wrong code');
  if (ex.statusCode !== 413) throw new Error('Wrong status code');
});

test('B-3. invalidFileType', () => {
  const ex = ProfileException.invalidFileType({ type: 'image/bmp' });
  if (ex.code !== 'PROFILE-023') throw new Error('Wrong code');
});

test('B-4. uploadFailed', () => {
  const ex = ProfileException.uploadFailed({ reason: 'Network error' });
  if (ex.code !== 'PROFILE-026') throw new Error('Wrong code');
  if (!ex.retryable) throw new Error('Should be retryable');
});

test('B-5. storageFull', () => {
  const ex = ProfileException.storageFull();
  if (ex.code !== 'PROFILE-031') throw new Error('Wrong code');
  if (ex.statusCode !== 507) throw new Error('Wrong status code');
});

// C. PASSWORD (15개)
test('C-1. passwordRequired', () => {
  const ex = ProfileException.passwordRequired();
  if (ex.code !== 'PROFILE-036') throw new Error('Wrong code');
});

test('C-2. passwordTooShort', () => {
  const ex = ProfileException.passwordTooShort({ length: 5 });
  if (ex.code !== 'PROFILE-037') throw new Error('Wrong code');
});

test('C-3. passwordTooWeak', () => {
  const ex = ProfileException.passwordTooWeak({ score: 1 });
  if (ex.code !== 'PROFILE-039') throw new Error('Wrong code');
});

test('C-4. currentPasswordIncorrect', () => {
  const ex = ProfileException.currentPasswordIncorrect();
  if (ex.code !== 'PROFILE-046') throw new Error('Wrong code');
  if (ex.statusCode !== 401) throw new Error('Wrong status code');
});

test('C-5. passwordMismatch', () => {
  const ex = ProfileException.passwordMismatch();
  if (ex.code !== 'PROFILE-050') throw new Error('Wrong code');
});

// D. ACCOUNT_DELETE (10개)
test('D-1. ownerStudyExists', () => {
  const ex = ProfileException.ownerStudyExists({ studyCount: 3 });
  if (ex.code !== 'PROFILE-051') throw new Error('Wrong code');
  if (ex.statusCode !== 409) throw new Error('Wrong status code');
});

test('D-2. confirmationMismatch', () => {
  const ex = ProfileException.confirmationMismatch();
  if (ex.code !== 'PROFILE-054') throw new Error('Wrong code');
});

test('D-3. deletionFailed', () => {
  const ex = ProfileException.deletionFailed({ reason: 'DB error' });
  if (ex.code !== 'PROFILE-056') throw new Error('Wrong code');
});

// E. PRIVACY (10개)
test('E-1. invalidPrivacySetting', () => {
  const ex = ProfileException.invalidPrivacySetting({ setting: 'invalid' });
  if (ex.code !== 'PROFILE-061') throw new Error('Wrong code');
});

test('E-2. dataExportFailed', () => {
  const ex = ProfileException.dataExportFailed({ reason: 'Timeout' });
  if (ex.code !== 'PROFILE-066') throw new Error('Wrong code');
});

test('E-3. consentRequired', () => {
  const ex = ProfileException.consentRequired({ purpose: 'marketing' });
  if (ex.code !== 'PROFILE-070') throw new Error('Wrong code');
});

// F. VERIFICATION (10개)
test('F-1. emailNotVerified', () => {
  const ex = ProfileException.emailNotVerified({ email: 'test@example.com' });
  if (ex.code !== 'PROFILE-071') throw new Error('Wrong code');
});

test('F-2. verificationExpired', () => {
  const ex = ProfileException.verificationExpired();
  if (ex.code !== 'PROFILE-072') throw new Error('Wrong code');
  if (ex.statusCode !== 410) throw new Error('Wrong status code');
});

test('F-3. twoFactorRequired', () => {
  const ex = ProfileException.twoFactorRequired();
  if (ex.code !== 'PROFILE-077') throw new Error('Wrong code');
});

// G. SOCIAL (10개)
test('G-1. socialLinkFailed', () => {
  const ex = ProfileException.socialLinkFailed({ provider: 'google', reason: 'Token invalid' });
  if (ex.code !== 'PROFILE-081') throw new Error('Wrong code');
});

test('G-2. socialAlreadyLinked', () => {
  const ex = ProfileException.socialAlreadyLinked({ provider: 'github' });
  if (ex.code !== 'PROFILE-082') throw new Error('Wrong code');
});

test('G-3. socialTokenExpired', () => {
  const ex = ProfileException.socialTokenExpired({ provider: 'google' });
  if (ex.code !== 'PROFILE-088') throw new Error('Wrong code');
});

test('G-4. lastSocialUnlinkDenied', () => {
  const ex = ProfileException.lastSocialUnlinkDenied();
  if (ex.code !== 'PROFILE-090') throw new Error('Wrong code');
});

// 메서드 테스트
test('toJSON() 메서드', () => {
  const ex = ProfileException.notFound({ userId: '123' });
  const json = ex.toJSON();
  if (!json.code) throw new Error('Missing code');
  if (!json.timestamp) throw new Error('Missing timestamp');
  if (!json.userMessage) throw new Error('Missing userMessage');
});

test('toResponse() 메서드', () => {
  const ex = ProfileException.updateFailed({ reason: 'Network error' });
  const response = ex.toResponse();
  if (response.success !== false) throw new Error('Should be unsuccessful');
  if (!response.error) throw new Error('Missing error object');
  if (!response.error.code) throw new Error('Missing error code');
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
