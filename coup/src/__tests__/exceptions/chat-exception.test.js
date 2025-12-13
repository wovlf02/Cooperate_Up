/**
 * @jest-environment node
 */

/**
 * Chat Exception Classes 테스트
 *
 * @description ChatException, ChatValidationException,
 *              ChatPermissionException, ChatBusinessException 테스트
 */

import ChatException from '@/lib/exceptions/chat/ChatException';
import ChatValidationException from '@/lib/exceptions/chat/ChatValidationException';
import ChatPermissionException from '@/lib/exceptions/chat/ChatPermissionException';
import ChatBusinessException from '@/lib/exceptions/chat/ChatBusinessException';

describe('Chat Exception Classes', () => {
  // ============================================
  // ChatException 테스트
  // ============================================
  describe('ChatException', () => {
    describe('constructor', () => {
      it('기본 속성이 올바르게 설정됨', () => {
        const error = new ChatException('에러', 'CHAT-000', 400, 'medium', {});

        expect(error.name).toBe('ChatException');
        expect(error.message).toBe('에러');
        expect(error.code).toBe('CHAT-000');
        expect(error.statusCode).toBe(400);
        expect(error.domain).toBe('CHAT');
        expect(error.retryable).toBe(false);
        expect(error.timestamp).toBeDefined();
      });
    });

    describe('toJSON', () => {
      it('JSON 변환이 올바르게 동작', () => {
        const error = new ChatException('에러', 'CHAT-000', 400, 'medium', {});
        const json = error.toJSON();

        expect(json.name).toBe('ChatException');
        expect(json.message).toBe('에러');
        expect(json.code).toBe('CHAT-000');
        expect(json.statusCode).toBe(400);
        expect(json.domain).toBe('CHAT');
      });
    });

    describe('메서드', () => {
      it('getUserFriendlyMessage - 사용자 메시지 반환', () => {
        const error = new ChatException('에러', 'CHAT-000', 400, 'medium', {});
        expect(error.getUserFriendlyMessage()).toBe('에러');
      });

      it('getDeveloperMessage - 개발자 메시지 반환', () => {
        const error = new ChatException('에러', 'CHAT-000', 400, 'medium', {});
        expect(error.getDeveloperMessage()).toBe('[CHAT-000] 에러');
      });

      it('toLogFormat - 로그 포맷 반환', () => {
        const error = new ChatException('에러', 'CHAT-000', 400, 'medium', {});
        const logFormat = error.toLogFormat();

        expect(logFormat.timestamp).toBeDefined();
        expect(logFormat.code).toBe('CHAT-000');
        expect(logFormat.message).toBe('에러');
      });
    });

    describe('static methods - Validation', () => {
      it('contentRequired - CHAT-001', () => {
        const error = ChatException.contentRequired();
        expect(error.code).toBe('CHAT-001');
        expect(error.statusCode).toBe(400);
      });

      it('contentTooShort - CHAT-002', () => {
        const error = ChatException.contentTooShort(10);
        expect(error.code).toBe('CHAT-002');
        expect(error.message).toContain('10');
      });

      it('contentTooLong - CHAT-003', () => {
        const error = ChatException.contentTooLong(5000);
        expect(error.code).toBe('CHAT-003');
        expect(error.message).toContain('5000');
      });

      it('userIdRequired - CHAT-005', () => {
        const error = ChatException.userIdRequired();
        expect(error.code).toBe('CHAT-005');
      });

      it('studyIdRequired - CHAT-008', () => {
        const error = ChatException.studyIdRequired();
        expect(error.code).toBe('CHAT-008');
      });

      it('messageIdRequired - CHAT-011', () => {
        const error = ChatException.messageIdRequired();
        expect(error.code).toBe('CHAT-011');
      });
    });

    describe('static methods - Permission', () => {
      it('authenticationRequired - CHAT-016', () => {
        const error = ChatException.authenticationRequired();
        expect(error.code).toBe('CHAT-016');
        expect(error.statusCode).toBe(401);
      });

      it('notStudyMember - CHAT-018', () => {
        const error = ChatException.notStudyMember('study123');
        expect(error.code).toBe('CHAT-018');
        expect(error.statusCode).toBe(403);
      });

      it('messageNotOwned - CHAT-021', () => {
        const error = ChatException.messageNotOwned('msg123');
        expect(error.code).toBe('CHAT-021');
        expect(error.statusCode).toBe(403);
      });
    });

    describe('static methods - Business', () => {
      it('messageNotFound - CHAT-024', () => {
        const error = ChatException.messageNotFound('msg123');
        expect(error.code).toBe('CHAT-024');
        expect(error.statusCode).toBe(404);
      });

      it('sendFailed - CHAT-027', () => {
        const error = ChatException.sendFailed('네트워크 오류');
        expect(error.code).toBe('CHAT-027');
        expect(error.statusCode).toBe(500);
      });

      it('rateLimitExceeded - CHAT-030', () => {
        const error = ChatException.rateLimitExceeded(10, 60);
        expect(error.code).toBe('CHAT-030');
        expect(error.statusCode).toBe(429);
      });

      it('unexpectedError - CHAT-040', () => {
        const error = ChatException.unexpectedError('테스트');
        expect(error.code).toBe('CHAT-040');
        expect(error.statusCode).toBe(500);
      });
    });
  });

  // ============================================
  // ChatValidationException 테스트
  // ============================================
  describe('ChatValidationException', () => {
    describe('메시지 내용 관련 에러', () => {
      it('contentRequired - CHAT-VAL-001', () => {
        const error = ChatValidationException.contentRequired();
        expect(error.code).toBe('CHAT-VAL-001');
        expect(error.statusCode).toBe(400);
        expect(error.name).toBe('ChatValidationException');
      });

      it('contentTooShort - CHAT-VAL-002', () => {
        const error = ChatValidationException.contentTooShort(10);
        expect(error.code).toBe('CHAT-VAL-002');
        expect(error.message).toContain('10');
      });

      it('contentTooLong - CHAT-VAL-003', () => {
        const error = ChatValidationException.contentTooLong(5000);
        expect(error.code).toBe('CHAT-VAL-003');
        expect(error.message).toContain('5000');
      });

      it('contentInvalidFormat - CHAT-VAL-004', () => {
        const error = ChatValidationException.contentInvalidFormat();
        expect(error.code).toBe('CHAT-VAL-004');
      });

      it('contentContainsProhibitedWords - CHAT-VAL-005', () => {
        const error = ChatValidationException.contentContainsProhibitedWords();
        expect(error.code).toBe('CHAT-VAL-005');
      });
    });

    describe('ID 관련 에러', () => {
      it('studyIdRequired - CHAT-VAL-006', () => {
        const error = ChatValidationException.studyIdRequired();
        expect(error.code).toBe('CHAT-VAL-006');
      });

      it('invalidStudyId - CHAT-VAL-007', () => {
        const error = ChatValidationException.invalidStudyId('bad-id');
        expect(error.code).toBe('CHAT-VAL-007');
        expect(error.message).toContain('bad-id');
      });

      it('messageIdRequired - CHAT-VAL-008', () => {
        const error = ChatValidationException.messageIdRequired();
        expect(error.code).toBe('CHAT-VAL-008');
      });

      it('invalidMessageId - CHAT-VAL-009', () => {
        const error = ChatValidationException.invalidMessageId('bad-id');
        expect(error.code).toBe('CHAT-VAL-009');
      });

      it('userIdRequired - CHAT-VAL-010', () => {
        const error = ChatValidationException.userIdRequired();
        expect(error.code).toBe('CHAT-VAL-010');
      });

      it('invalidUserId - CHAT-VAL-011', () => {
        const error = ChatValidationException.invalidUserId('bad-id');
        expect(error.code).toBe('CHAT-VAL-011');
      });
    });

    describe('페이지네이션 에러', () => {
      it('invalidPage - CHAT-VAL-012', () => {
        const error = ChatValidationException.invalidPage(-1);
        expect(error.code).toBe('CHAT-VAL-012');
      });

      it('invalidLimit - CHAT-VAL-013', () => {
        const error = ChatValidationException.invalidLimit(200);
        expect(error.code).toBe('CHAT-VAL-013');
      });
    });

    describe('파일 관련 에러', () => {
      it('invalidFileId - CHAT-VAL-014', () => {
        const error = ChatValidationException.invalidFileId('bad-file');
        expect(error.code).toBe('CHAT-VAL-014');
      });

      it('invalidFileType - CHAT-VAL-015', () => {
        const error = ChatValidationException.invalidFileType('exe', ['jpg', 'png']);
        expect(error.code).toBe('CHAT-VAL-015');
        expect(error.message).toContain('exe');
      });
    });
  });

  // ============================================
  // ChatPermissionException 테스트
  // ============================================
  describe('ChatPermissionException', () => {
    describe('인증 관련 에러', () => {
      it('authenticationRequired - CHAT-PERM-001 (401)', () => {
        const error = ChatPermissionException.authenticationRequired();
        expect(error.code).toBe('CHAT-PERM-001');
        expect(error.statusCode).toBe(401);
        expect(error.name).toBe('ChatPermissionException');
      });

      it('sessionExpired - CHAT-PERM-002 (401)', () => {
        const error = ChatPermissionException.sessionExpired();
        expect(error.code).toBe('CHAT-PERM-002');
        expect(error.statusCode).toBe(401);
      });

      it('invalidToken - CHAT-PERM-003 (401)', () => {
        const error = ChatPermissionException.invalidToken();
        expect(error.code).toBe('CHAT-PERM-003');
        expect(error.statusCode).toBe(401);
      });
    });

    describe('멤버십 관련 에러', () => {
      it('notStudyMember - CHAT-PERM-004 (403)', () => {
        const error = ChatPermissionException.notStudyMember('study123');
        expect(error.code).toBe('CHAT-PERM-004');
        expect(error.statusCode).toBe(403);
      });

      it('membershipPending - CHAT-PERM-005 (403)', () => {
        const error = ChatPermissionException.membershipPending('study123');
        expect(error.code).toBe('CHAT-PERM-005');
        expect(error.statusCode).toBe(403);
      });

      it('membershipKicked - CHAT-PERM-006 (403)', () => {
        const error = ChatPermissionException.membershipKicked('study123');
        expect(error.code).toBe('CHAT-PERM-006');
        expect(error.statusCode).toBe(403);
      });

      it('studyInactive - CHAT-PERM-007 (403)', () => {
        const error = ChatPermissionException.studyInactive('study123');
        expect(error.code).toBe('CHAT-PERM-007');
        expect(error.statusCode).toBe(403);
      });
    });

    describe('메시지 권한 에러', () => {
      it('messageNotOwned - CHAT-PERM-008 (403)', () => {
        const error = ChatPermissionException.messageNotOwned('msg123');
        expect(error.code).toBe('CHAT-PERM-008');
        expect(error.statusCode).toBe(403);
      });

      it('cannotSendMessage - CHAT-PERM-009 (403)', () => {
        const error = ChatPermissionException.cannotSendMessage('제재 중');
        expect(error.code).toBe('CHAT-PERM-009');
        expect(error.statusCode).toBe(403);
      });

      it('cannotDeleteMessage - CHAT-PERM-010 (403)', () => {
        const error = ChatPermissionException.cannotDeleteMessage('권한 없음');
        expect(error.code).toBe('CHAT-PERM-010');
        expect(error.statusCode).toBe(403);
      });

      it('cannotEditMessage - CHAT-PERM-011 (403)', () => {
        const error = ChatPermissionException.cannotEditMessage('시간 초과');
        expect(error.code).toBe('CHAT-PERM-011');
        expect(error.statusCode).toBe(403);
      });
    });

    describe('제재 관련 에러', () => {
      it('chatBanned - CHAT-PERM-012 (403)', () => {
        const error = ChatPermissionException.chatBanned('욕설 사용', '2025-12-31');
        expect(error.code).toBe('CHAT-PERM-012');
        expect(error.statusCode).toBe(403);
        expect(error.message).toContain('욕설 사용');
      });

      it('accountSuspended - CHAT-PERM-013 (403)', () => {
        const error = ChatPermissionException.accountSuspended('규정 위반');
        expect(error.code).toBe('CHAT-PERM-013');
        expect(error.statusCode).toBe(403);
      });

      it('adminPermissionRequired - CHAT-PERM-014 (403)', () => {
        const error = ChatPermissionException.adminPermissionRequired();
        expect(error.code).toBe('CHAT-PERM-014');
        expect(error.statusCode).toBe(403);
      });
    });
  });

  // ============================================
  // ChatBusinessException 테스트
  // ============================================
  describe('ChatBusinessException', () => {
    describe('조회 관련 에러', () => {
      it('messageNotFound - CHAT-BIZ-001 (404)', () => {
        const error = ChatBusinessException.messageNotFound('msg123');
        expect(error.code).toBe('CHAT-BIZ-001');
        expect(error.statusCode).toBe(404);
        expect(error.name).toBe('ChatBusinessException');
      });

      it('studyNotFound - CHAT-BIZ-002 (404)', () => {
        const error = ChatBusinessException.studyNotFound('study123');
        expect(error.code).toBe('CHAT-BIZ-002');
        expect(error.statusCode).toBe(404);
      });

      it('userNotFound - CHAT-BIZ-003 (404)', () => {
        const error = ChatBusinessException.userNotFound('user123');
        expect(error.code).toBe('CHAT-BIZ-003');
        expect(error.statusCode).toBe(404);
      });

      it('fileNotFound - CHAT-BIZ-004 (404)', () => {
        const error = ChatBusinessException.fileNotFound('file123');
        expect(error.code).toBe('CHAT-BIZ-004');
        expect(error.statusCode).toBe(404);
      });
    });

    describe('메시지 전송 에러', () => {
      it('sendFailed - CHAT-BIZ-005 (500)', () => {
        const error = ChatBusinessException.sendFailed('DB 오류');
        expect(error.code).toBe('CHAT-BIZ-005');
        expect(error.statusCode).toBe(500);
      });

      it('duplicateMessage - CHAT-BIZ-006 (409)', () => {
        const error = ChatBusinessException.duplicateMessage();
        expect(error.code).toBe('CHAT-BIZ-006');
        expect(error.statusCode).toBe(409);
      });

      it('rateLimitExceeded - CHAT-BIZ-007 (429)', () => {
        const error = ChatBusinessException.rateLimitExceeded(10, 60);
        expect(error.code).toBe('CHAT-BIZ-007');
        expect(error.statusCode).toBe(429);
      });

      it('messageQueueFull - CHAT-BIZ-008 (503)', () => {
        const error = ChatBusinessException.messageQueueFull();
        expect(error.code).toBe('CHAT-BIZ-008');
        expect(error.statusCode).toBe(503);
      });

      it('fileSizeTooLarge - CHAT-BIZ-009', () => {
        const error = ChatBusinessException.fileSizeTooLarge(10);
        expect(error.code).toBe('CHAT-BIZ-009');
        expect(error.message).toContain('10');
      });
    });

    describe('읽음 처리 에러', () => {
      it('alreadyRead - CHAT-BIZ-010', () => {
        const error = ChatBusinessException.alreadyRead('msg123');
        expect(error.code).toBe('CHAT-BIZ-010');
        expect(error.statusCode).toBe(400);
      });

      it('markAsReadFailed - CHAT-BIZ-011 (500)', () => {
        const error = ChatBusinessException.markAsReadFailed('msg123', 'DB 에러');
        expect(error.code).toBe('CHAT-BIZ-011');
        expect(error.statusCode).toBe(500);
      });

      it('markAllAsReadFailed - CHAT-BIZ-012 (500)', () => {
        const error = ChatBusinessException.markAllAsReadFailed('timeout');
        expect(error.code).toBe('CHAT-BIZ-012');
        expect(error.statusCode).toBe(500);
      });

      it('noUnreadMessages - CHAT-BIZ-013', () => {
        const error = ChatBusinessException.noUnreadMessages();
        expect(error.code).toBe('CHAT-BIZ-013');
        expect(error.statusCode).toBe(400);
      });
    });

    describe('삭제 관련 에러', () => {
      it('messageAlreadyDeleted - CHAT-BIZ-014 (404)', () => {
        const error = ChatBusinessException.messageAlreadyDeleted('msg123');
        expect(error.code).toBe('CHAT-BIZ-014');
        expect(error.statusCode).toBe(404);
      });

      it('deletionFailed - CHAT-BIZ-015 (500)', () => {
        const error = ChatBusinessException.deletionFailed('msg123', 'DB 에러');
        expect(error.code).toBe('CHAT-BIZ-015');
        expect(error.statusCode).toBe(500);
      });

      it('cannotDeleteOldMessage - CHAT-BIZ-016', () => {
        const error = ChatBusinessException.cannotDeleteOldMessage('msg123', 24);
        expect(error.code).toBe('CHAT-BIZ-016');
        expect(error.message).toContain('24');
      });

      it('bulkDeletionFailed - CHAT-BIZ-017 (500)', () => {
        const error = ChatBusinessException.bulkDeletionFailed(3, 1, 'partial');
        expect(error.code).toBe('CHAT-BIZ-017');
        expect(error.statusCode).toBe(500);
      });
    });

    describe('조회 실패 에러', () => {
      it('listFetchFailed - CHAT-BIZ-018 (500)', () => {
        const error = ChatBusinessException.listFetchFailed('timeout');
        expect(error.code).toBe('CHAT-BIZ-018');
        expect(error.statusCode).toBe(500);
      });

      it('unreadCountFetchFailed - CHAT-BIZ-019 (500)', () => {
        const error = ChatBusinessException.unreadCountFetchFailed('DB 에러');
        expect(error.code).toBe('CHAT-BIZ-019');
        expect(error.statusCode).toBe(500);
      });

      it('searchFailed - CHAT-BIZ-020 (500)', () => {
        const error = ChatBusinessException.searchFailed('인덱스 오류');
        expect(error.code).toBe('CHAT-BIZ-020');
        expect(error.statusCode).toBe(500);
      });
    });

    describe('시스템 에러', () => {
      it('databaseError - CHAT-BIZ-021 (500)', () => {
        const error = ChatBusinessException.databaseError('query', 'timeout');
        expect(error.code).toBe('CHAT-BIZ-021');
        expect(error.statusCode).toBe(500);
      });

      it('connectionError - CHAT-BIZ-022 (503)', () => {
        const error = ChatBusinessException.connectionError('timeout');
        expect(error.code).toBe('CHAT-BIZ-022');
        expect(error.statusCode).toBe(503);
      });

      it('unexpectedError - CHAT-BIZ-023 (500)', () => {
        const error = ChatBusinessException.unexpectedError('Test message');
        expect(error.code).toBe('CHAT-BIZ-023');
        expect(error.statusCode).toBe(500);
      });
    });
  });

  // ============================================
  // Error Code Format 검증
  // ============================================
  describe('Error Code Format', () => {
    it('Base 에러는 CHAT-xxx 형식', () => {
      const errors = [
        ChatException.contentRequired(),
        ChatException.userIdRequired(),
        ChatException.messageNotFound('m1'),
        ChatException.unexpectedError()
      ];

      errors.forEach(error => {
        expect(error.code).toMatch(/^CHAT-\d{3}$/);
      });
    });

    it('Validation 에러는 CHAT-VAL-xxx 형식', () => {
      const errors = [
        ChatValidationException.contentRequired(),
        ChatValidationException.invalidStudyId('test'),
        ChatValidationException.messageIdRequired(),
        ChatValidationException.userIdRequired()
      ];

      errors.forEach(error => {
        expect(error.code).toMatch(/^CHAT-VAL-\d{3}$/);
      });
    });

    it('Permission 에러는 CHAT-PERM-xxx 형식', () => {
      const errors = [
        ChatPermissionException.authenticationRequired(),
        ChatPermissionException.sessionExpired(),
        ChatPermissionException.notStudyMember('s1'),
        ChatPermissionException.messageNotOwned('m1')
      ];

      errors.forEach(error => {
        expect(error.code).toMatch(/^CHAT-PERM-\d{3}$/);
      });
    });

    it('Business 에러는 CHAT-BIZ-xxx 형식', () => {
      const errors = [
        ChatBusinessException.messageNotFound('m1'),
        ChatBusinessException.sendFailed(),
        ChatBusinessException.alreadyRead('m1'),
        ChatBusinessException.databaseError()
      ];

      errors.forEach(error => {
        expect(error.code).toMatch(/^CHAT-BIZ-\d{3}$/);
      });
    });
  });

  // ============================================
  // 상속 관계 검증
  // ============================================
  describe('Inheritance', () => {
    it('ChatValidationException은 ChatException을 상속', () => {
      const error = ChatValidationException.contentRequired();
      expect(error).toBeInstanceOf(ChatException);
      expect(error).toBeInstanceOf(Error);
    });

    it('ChatPermissionException은 ChatException을 상속', () => {
      const error = ChatPermissionException.authenticationRequired();
      expect(error).toBeInstanceOf(ChatException);
      expect(error).toBeInstanceOf(Error);
    });

    it('ChatBusinessException은 ChatException을 상속', () => {
      const error = ChatBusinessException.messageNotFound('m1');
      expect(error).toBeInstanceOf(ChatException);
      expect(error).toBeInstanceOf(Error);
    });
  });

  // ============================================
  // Category 검증
  // ============================================
  describe('Category', () => {
    it('Validation 에러의 category는 validation', () => {
      const error = ChatValidationException.contentRequired();
      expect(error.category).toBe('validation');
    });

    it('Permission 에러의 category는 permission', () => {
      const error = ChatPermissionException.authenticationRequired();
      expect(error.category).toBe('permission');
    });

    it('Business 에러의 category는 business', () => {
      const error = ChatBusinessException.messageNotFound('m1');
      expect(error.category).toBe('business');
    });
  });
});
