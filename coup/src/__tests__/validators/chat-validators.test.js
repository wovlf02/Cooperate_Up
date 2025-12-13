/**
 * @jest-environment node
 */

/**
 * Chat Validators 테스트
 *
 * @description chat-validators.js의 모든 검증 함수 테스트
 */

import {
  validateMessageContent,
  sanitizeMessageContent,
  validateStudyId,
  validateMessageId,
  validateUserId,
  validateFileId,
  validatePage,
  validateLimit,
  validateFileType,
  validateFileSize,
  validateMessageCreateData,
  validateMessageQueryParams,
  validateMarkAsReadData,
  validateMessageOwnership,
  validateStudyMembership,
  validateSession,
  CHAT_CONSTANTS
} from '@/lib/validators/chat-validators';

import ChatValidationException from '@/lib/exceptions/chat/ChatValidationException';
import ChatPermissionException from '@/lib/exceptions/chat/ChatPermissionException';
import ChatBusinessException from '@/lib/exceptions/chat/ChatBusinessException';

describe('Chat Validators', () => {
  // ============================================
  // 메시지 내용 검증
  // ============================================
  describe('validateMessageContent', () => {
    it('유효한 메시지 내용 검증 통과', () => {
      expect(validateMessageContent('안녕하세요!')).toBe(true);
      expect(validateMessageContent('Hello World')).toBe(true);
      expect(validateMessageContent('a')).toBe(true);
    });

    it('빈 메시지는 에러', () => {
      expect(() => validateMessageContent('')).toThrow(ChatValidationException);
      expect(() => validateMessageContent(null)).toThrow(ChatValidationException);
      expect(() => validateMessageContent(undefined)).toThrow(ChatValidationException);
    });

    it('공백만 있는 메시지는 에러', () => {
      expect(() => validateMessageContent('   ')).toThrow(ChatValidationException);
      expect(() => validateMessageContent('\t\n')).toThrow(ChatValidationException);
    });

    it('너무 긴 메시지는 에러', () => {
      const longContent = 'a'.repeat(5001);
      expect(() => validateMessageContent(longContent)).toThrow(ChatValidationException);
    });

    it('최대 길이 메시지는 통과', () => {
      const maxContent = 'a'.repeat(5000);
      expect(validateMessageContent(maxContent)).toBe(true);
    });

    it('문자열이 아닌 타입은 에러', () => {
      expect(() => validateMessageContent(123)).toThrow(ChatValidationException);
      expect(() => validateMessageContent({})).toThrow(ChatValidationException);
    });
  });

  describe('sanitizeMessageContent', () => {
    it('유효한 메시지 정제', () => {
      expect(sanitizeMessageContent('  hello  ')).toBe('hello');
      expect(sanitizeMessageContent('test')).toBe('test');
    });

    it('allowEmpty 옵션이 true면 빈 문자열 허용', () => {
      expect(sanitizeMessageContent('', { allowEmpty: true })).toBe('');
      expect(sanitizeMessageContent(null, { allowEmpty: true })).toBe('');
    });

    it('allowEmpty 옵션이 false면 빈 문자열 에러', () => {
      expect(() => sanitizeMessageContent('', { allowEmpty: false })).toThrow(ChatValidationException);
    });

    it('maxLength 옵션 적용', () => {
      expect(() => sanitizeMessageContent('12345', { maxLength: 3 })).toThrow(ChatValidationException);
      expect(sanitizeMessageContent('123', { maxLength: 3 })).toBe('123');
    });
  });

  // ============================================
  // ID 검증
  // ============================================
  describe('validateStudyId', () => {
    it('유효한 스터디 ID 검증 통과', () => {
      expect(validateStudyId('study123')).toBe(true);
      expect(validateStudyId('clabcdefg12345')).toBe(true);
    });

    it('빈 스터디 ID는 에러', () => {
      expect(() => validateStudyId('')).toThrow(ChatValidationException);
      expect(() => validateStudyId(null)).toThrow(ChatValidationException);
      expect(() => validateStudyId(undefined)).toThrow(ChatValidationException);
    });

    it('공백만 있는 ID는 에러', () => {
      expect(() => validateStudyId('   ')).toThrow(ChatValidationException);
    });
  });

  describe('validateMessageId', () => {
    it('유효한 메시지 ID 검증 통과', () => {
      expect(validateMessageId('msg123')).toBe(true);
      expect(validateMessageId('clabcdefg12345')).toBe(true);
    });

    it('빈 메시지 ID는 에러', () => {
      expect(() => validateMessageId('')).toThrow(ChatValidationException);
      expect(() => validateMessageId(null)).toThrow(ChatValidationException);
      expect(() => validateMessageId(undefined)).toThrow(ChatValidationException);
    });
  });

  describe('validateUserId', () => {
    it('유효한 사용자 ID 검증 통과', () => {
      expect(validateUserId('user123')).toBe(true);
      expect(validateUserId('clabcdefg12345')).toBe(true);
    });

    it('빈 사용자 ID는 에러', () => {
      expect(() => validateUserId('')).toThrow(ChatValidationException);
      expect(() => validateUserId(null)).toThrow(ChatValidationException);
      expect(() => validateUserId(undefined)).toThrow(ChatValidationException);
    });
  });

  describe('validateFileId', () => {
    it('유효한 파일 ID 검증 통과', () => {
      expect(validateFileId('file123')).toBe(true);
      expect(validateFileId('clabcdefg12345')).toBe(true);
    });

    it('빈 파일 ID는 허용 (선택 사항)', () => {
      expect(validateFileId('')).toBe(true);
      expect(validateFileId(null)).toBe(true);
      expect(validateFileId(undefined)).toBe(true);
    });

    it('공백만 있는 ID는 에러', () => {
      expect(() => validateFileId('   ')).toThrow(ChatValidationException);
    });
  });

  // ============================================
  // 페이지네이션 검증
  // ============================================
  describe('validatePage', () => {
    it('유효한 페이지 번호 반환', () => {
      expect(validatePage(1)).toBe(1);
      expect(validatePage(10)).toBe(10);
      expect(validatePage('5')).toBe(5);
    });

    it('기본값 반환 (null/undefined)', () => {
      expect(validatePage(null)).toBe(1);
      expect(validatePage(undefined)).toBe(1);
    });

    it('음수 페이지는 에러', () => {
      expect(() => validatePage(-1)).toThrow(ChatValidationException);
      expect(() => validatePage(0)).toThrow(ChatValidationException);
    });

    it('유효하지 않은 값은 에러', () => {
      expect(() => validatePage('abc')).toThrow(ChatValidationException);
    });
  });

  describe('validateLimit', () => {
    it('유효한 limit 반환', () => {
      expect(validateLimit(10)).toBe(10);
      expect(validateLimit(50)).toBe(50);
      expect(validateLimit('30')).toBe(30);
    });

    it('기본값 반환 (null/undefined)', () => {
      expect(validateLimit(null)).toBe(50);
      expect(validateLimit(undefined)).toBe(50);
    });

    it('범위 밖의 값은 에러', () => {
      expect(() => validateLimit(0)).toThrow(ChatValidationException);
      expect(() => validateLimit(101)).toThrow(ChatValidationException);
      expect(() => validateLimit(-1)).toThrow(ChatValidationException);
    });
  });

  // ============================================
  // 파일 검증
  // ============================================
  describe('validateFileType', () => {
    it('허용된 파일 타입 검증 통과', () => {
      expect(validateFileType('image/jpeg')).toBe(true);
      expect(validateFileType('image/png')).toBe(true);
      expect(validateFileType('application/pdf')).toBe(true);
    });

    it('빈 파일 타입은 허용 (선택 사항)', () => {
      expect(validateFileType('')).toBe(true);
      expect(validateFileType(null)).toBe(true);
      expect(validateFileType(undefined)).toBe(true);
    });

    it('허용되지 않은 파일 타입은 에러', () => {
      expect(() => validateFileType('application/exe')).toThrow(ChatValidationException);
      expect(() => validateFileType('video/mp4')).toThrow(ChatValidationException);
    });
  });

  describe('validateFileSize', () => {
    it('허용된 파일 크기 검증 통과', () => {
      expect(validateFileSize(1024)).toBe(true);
      expect(validateFileSize(5 * 1024 * 1024)).toBe(true);
    });

    it('빈 파일 크기는 허용 (선택 사항)', () => {
      expect(validateFileSize(0)).toBe(true);
      expect(validateFileSize(null)).toBe(true);
      expect(validateFileSize(undefined)).toBe(true);
    });

    it('너무 큰 파일은 에러', () => {
      expect(() => validateFileSize(11 * 1024 * 1024)).toThrow(ChatBusinessException);
    });
  });

  // ============================================
  // 통합 검증
  // ============================================
  describe('validateMessageCreateData', () => {
    it('유효한 메시지 데이터 검증 통과', () => {
      const data = {
        studyId: 'study123',
        content: '안녕하세요!'
      };
      const validated = validateMessageCreateData(data);

      expect(validated.studyId).toBe('study123');
      expect(validated.content).toBe('안녕하세요!');
    });

    it('파일 ID 포함된 데이터 검증 통과', () => {
      const data = {
        studyId: 'study123',
        content: '파일입니다',
        fileId: 'file123'
      };
      const validated = validateMessageCreateData(data);

      expect(validated.fileId).toBe('file123');
    });

    it('공백 정제됨', () => {
      const data = {
        studyId: '  study123  ',
        content: '  hello  '
      };
      const validated = validateMessageCreateData(data);

      expect(validated.studyId).toBe('study123');
      expect(validated.content).toBe('hello');
    });

    it('빈 데이터는 에러', () => {
      expect(() => validateMessageCreateData(null)).toThrow(ChatValidationException);
      expect(() => validateMessageCreateData({})).toThrow(ChatValidationException);
    });

    it('studyId 없으면 에러', () => {
      expect(() => validateMessageCreateData({ content: 'hello' })).toThrow(ChatValidationException);
    });

    it('content 없으면 에러', () => {
      expect(() => validateMessageCreateData({ studyId: 'study123' })).toThrow(ChatValidationException);
    });
  });

  describe('validateMessageQueryParams', () => {
    it('기본값 반환', () => {
      const validated = validateMessageQueryParams({});

      expect(validated.page).toBe(1);
      expect(validated.limit).toBe(50);
    });

    it('전달된 값 검증', () => {
      const validated = validateMessageQueryParams({
        page: 2,
        limit: 30,
        cursor: 'abc123',
        search: '  hello  '
      });

      expect(validated.page).toBe(2);
      expect(validated.limit).toBe(30);
      expect(validated.cursor).toBe('abc123');
      expect(validated.search).toBe('hello');
    });

    it('잘못된 페이지네이션 값은 에러', () => {
      expect(() => validateMessageQueryParams({ page: -1 })).toThrow(ChatValidationException);
      expect(() => validateMessageQueryParams({ limit: 200 })).toThrow(ChatValidationException);
    });
  });

  describe('validateMarkAsReadData', () => {
    it('studyId만 있어도 통과', () => {
      const validated = validateMarkAsReadData('study123');

      expect(validated.studyId).toBe('study123');
      expect(validated.messageIds).toBeUndefined();
    });

    it('messageIds 포함 검증', () => {
      const validated = validateMarkAsReadData('study123', ['msg1', 'msg2']);

      expect(validated.studyId).toBe('study123');
      expect(validated.messageIds).toEqual(['msg1', 'msg2']);
    });

    it('공백 정제됨', () => {
      const validated = validateMarkAsReadData('  study123  ', ['  msg1  ']);

      expect(validated.studyId).toBe('study123');
      expect(validated.messageIds).toEqual(['msg1']);
    });

    it('빈 studyId는 에러', () => {
      expect(() => validateMarkAsReadData('')).toThrow(ChatValidationException);
      expect(() => validateMarkAsReadData(null)).toThrow(ChatValidationException);
    });

    it('messageIds가 배열이 아니면 에러', () => {
      expect(() => validateMarkAsReadData('study123', 'msg1')).toThrow(ChatValidationException);
    });
  });

  // ============================================
  // 권한 검증
  // ============================================
  describe('validateMessageOwnership', () => {
    it('소유자 검증 통과', () => {
      const message = { id: 'msg1', userId: 'user123' };
      expect(validateMessageOwnership(message, 'user123')).toBe(true);
    });

    it('메시지 없으면 에러', () => {
      expect(() => validateMessageOwnership(null, 'user123')).toThrow(ChatBusinessException);
    });

    it('userId 없으면 에러', () => {
      const message = { id: 'msg1', userId: 'user123' };
      expect(() => validateMessageOwnership(message, null)).toThrow(ChatPermissionException);
    });

    it('소유자가 다르면 에러', () => {
      const message = { id: 'msg1', userId: 'user123' };
      expect(() => validateMessageOwnership(message, 'user456')).toThrow(ChatPermissionException);
    });
  });

  describe('validateStudyMembership', () => {
    it('활성 멤버십 검증 통과', () => {
      const membership = { studyId: 'study123', status: 'ACTIVE' };
      expect(validateStudyMembership(membership, 'study123')).toBe(true);
    });

    it('멤버십 없으면 에러', () => {
      expect(() => validateStudyMembership(null, 'study123')).toThrow(ChatPermissionException);
    });

    it('PENDING 상태는 에러', () => {
      const membership = { studyId: 'study123', status: 'PENDING' };
      expect(() => validateStudyMembership(membership, 'study123')).toThrow(ChatPermissionException);
    });

    it('KICKED 상태는 에러', () => {
      const membership = { studyId: 'study123', status: 'KICKED' };
      expect(() => validateStudyMembership(membership, 'study123')).toThrow(ChatPermissionException);
    });

    it('LEFT 상태는 에러', () => {
      const membership = { studyId: 'study123', status: 'LEFT' };
      expect(() => validateStudyMembership(membership, 'study123')).toThrow(ChatPermissionException);
    });
  });

  describe('validateSession', () => {
    it('유효한 세션 검증 통과', () => {
      const session = { user: { id: 'user123', name: 'Test' } };
      const user = validateSession(session);

      expect(user.id).toBe('user123');
      expect(user.name).toBe('Test');
    });

    it('세션 없으면 에러', () => {
      expect(() => validateSession(null)).toThrow(ChatPermissionException);
      expect(() => validateSession(undefined)).toThrow(ChatPermissionException);
    });

    it('user 없으면 에러', () => {
      expect(() => validateSession({})).toThrow(ChatPermissionException);
    });

    it('user.id 없으면 에러', () => {
      expect(() => validateSession({ user: {} })).toThrow(ChatPermissionException);
    });
  });

  // ============================================
  // 상수 검증
  // ============================================
  describe('CHAT_CONSTANTS', () => {
    it('상수가 올바르게 정의됨', () => {
      expect(CHAT_CONSTANTS.MESSAGE_MIN_LENGTH).toBe(1);
      expect(CHAT_CONSTANTS.MESSAGE_MAX_LENGTH).toBe(5000);
      expect(CHAT_CONSTANTS.PAGE_MIN).toBe(1);
      expect(CHAT_CONSTANTS.LIMIT_MIN).toBe(1);
      expect(CHAT_CONSTANTS.LIMIT_MAX).toBe(100);
      expect(CHAT_CONSTANTS.DEFAULT_LIMIT).toBe(50);
      expect(CHAT_CONSTANTS.MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
      expect(CHAT_CONSTANTS.ALLOWED_FILE_TYPES).toContain('image/jpeg');
    });
  });
});
