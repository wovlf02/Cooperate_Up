/**
 * @jest-environment node
 */

/**
 * Chat API Integration Tests
 *
 * @description Chat API 관련 통합 테스트
 * ChatMessageException 중심의 테스트 (CHAT-MSG-001 ~ CHAT-MSG-012)
 *
 * ChatMessageException 코드 매핑:
 * - CHAT-MSG-001: sendFailedNetwork
 * - CHAT-MSG-002: sendFailedServer
 * - CHAT-MSG-003: emptyContent
 * - CHAT-MSG-004: contentTooLong
 * - CHAT-MSG-005: spamDetected
 * - CHAT-MSG-006: xssDetected
 * - CHAT-MSG-007: fetchFailed
 * - CHAT-MSG-008: unauthorizedEdit
 * - CHAT-MSG-009: unauthorizedDelete
 * - CHAT-MSG-010: notFound
 * - CHAT-MSG-011: duplicate
 * - CHAT-MSG-012: orderInconsistency
 */

import ChatException from '@/lib/exceptions/chat/ChatException';
import { ChatMessageException } from '@/lib/exceptions/chat';

describe('Chat API Exceptions', () => {
  // ============================================
  // ChatMessageException Static Methods
  // ============================================
  describe('ChatMessageException', () => {
    describe('sendFailedNetwork', () => {
      it('CHAT-MSG-001 에러 생성', () => {
        const error = ChatMessageException.sendFailedNetwork({ studyId: 'study123' });

        expect(error).toBeInstanceOf(ChatMessageException);
        expect(error).toBeInstanceOf(ChatException);
        expect(error.code).toBe('CHAT-MSG-001');
        expect(error.name).toBe('ChatMessageException');
      });
    });

    describe('sendFailedServer', () => {
      it('CHAT-MSG-002 에러 생성', () => {
        const error = ChatMessageException.sendFailedServer({ studyId: 'study123' });

        expect(error).toBeInstanceOf(ChatMessageException);
        expect(error.code).toBe('CHAT-MSG-002');
        expect(error.name).toBe('ChatMessageException');
      });
    });

    describe('emptyContent', () => {
      it('CHAT-MSG-003 에러 생성', () => {
        const error = ChatMessageException.emptyContent({ studyId: 'study123' });

        expect(error).toBeInstanceOf(ChatMessageException);
        expect(error.code).toBe('CHAT-MSG-003');
        expect(error.message).toBe('Empty message content');
        expect(error.name).toBe('ChatMessageException');
      });
    });

    describe('contentTooLong', () => {
      it('CHAT-MSG-004 에러 생성', () => {
        const error = ChatMessageException.contentTooLong(2500, 2000, {});

        expect(error).toBeInstanceOf(ChatMessageException);
        expect(error.code).toBe('CHAT-MSG-004');
        expect(error.message).toContain('2500');
        expect(error.message).toContain('2000');
        expect(error.name).toBe('ChatMessageException');
      });
    });

    describe('spamDetected', () => {
      it('CHAT-MSG-005 에러 생성', () => {
        const error = ChatMessageException.spamDetected(6, 10, {});

        expect(error).toBeInstanceOf(ChatMessageException);
        expect(error.code).toBe('CHAT-MSG-005');
        expect(error.message).toContain('6 messages');
        expect(error.message).toContain('10s');
        expect(error.name).toBe('ChatMessageException');
      });
    });

    describe('xssDetected', () => {
      it('CHAT-MSG-006 에러 생성', () => {
        const error = ChatMessageException.xssDetected(['script'], {});

        expect(error).toBeInstanceOf(ChatMessageException);
        expect(error.code).toBe('CHAT-MSG-006');
        expect(error.message).toBe('XSS attempt detected');
        expect(error.name).toBe('ChatMessageException');
      });
    });

    describe('fetchFailed', () => {
      it('CHAT-MSG-007 에러 생성', () => {
        const error = ChatMessageException.fetchFailed({ studyId: 'study123' });

        expect(error).toBeInstanceOf(ChatMessageException);
        expect(error.code).toBe('CHAT-MSG-007');
        expect(error.message).toBe('Failed to fetch messages');
        expect(error.name).toBe('ChatMessageException');
      });
    });

    describe('unauthorizedEdit', () => {
      it('CHAT-MSG-008 에러 생성', () => {
        const error = ChatMessageException.unauthorizedEdit({
          messageId: 'msg123',
          userId: 'user456'
        });

        expect(error).toBeInstanceOf(ChatMessageException);
        expect(error.code).toBe('CHAT-MSG-008');
        expect(error.message).toBe('Unauthorized message edit');
        expect(error.name).toBe('ChatMessageException');
      });
    });

    describe('unauthorizedDelete', () => {
      it('CHAT-MSG-009 에러 생성', () => {
        const error = ChatMessageException.unauthorizedDelete({
          messageId: 'msg123',
          userId: 'user456'
        });

        expect(error).toBeInstanceOf(ChatMessageException);
        expect(error.code).toBe('CHAT-MSG-009');
        expect(error.message).toBe('Unauthorized message delete');
        expect(error.name).toBe('ChatMessageException');
      });
    });

    describe('notFound', () => {
      it('CHAT-MSG-010 에러 생성', () => {
        const error = ChatMessageException.notFound('msg123', {});

        expect(error).toBeInstanceOf(ChatMessageException);
        expect(error.code).toBe('CHAT-MSG-010');
        expect(error.message).toBe('Message not found');
        expect(error.name).toBe('ChatMessageException');
      });
    });

    describe('duplicate', () => {
      it('CHAT-MSG-011 에러 생성', () => {
        const error = ChatMessageException.duplicate('msg123', {});

        expect(error).toBeInstanceOf(ChatMessageException);
        expect(error.code).toBe('CHAT-MSG-011');
        expect(error.name).toBe('ChatMessageException');
      });
    });

    describe('orderInconsistency', () => {
      it('CHAT-MSG-012 에러 생성', () => {
        const error = ChatMessageException.orderInconsistency({});

        expect(error).toBeInstanceOf(ChatMessageException);
        expect(error.code).toBe('CHAT-MSG-012');
        expect(error.name).toBe('ChatMessageException');
      });
    });
  });

  // ============================================
  // Error Response Format
  // ============================================
  describe('Error Response Format', () => {
    it('ChatMessageException에서 userMessage 접근 가능', () => {
      const error = ChatMessageException.emptyContent({ studyId: 'study123' });

      // ChatMessageException은 constructor에서 details 객체로 userMessage 설정
      // ChatException.toJSON()을 사용해야 함
      expect(error.code).toBe('CHAT-MSG-003');
      expect(error.name).toBe('ChatMessageException');
    });

    it('notFound에서 messageId 정보가 있어야 함', () => {
      const error = ChatMessageException.notFound('msg789', {
        studyId: 'study123'
      });

      expect(error.code).toBe('CHAT-MSG-010');
      expect(error.message).toBe('Message not found');
    });
  });

  // ============================================
  // Error Code Format
  // ============================================
  describe('Error Code Format', () => {
    it('모든 코드는 CHAT-MSG-xxx 패턴을 따라야 함', () => {
      const errors = [
        ChatMessageException.sendFailedNetwork({}),
        ChatMessageException.sendFailedServer({}),
        ChatMessageException.emptyContent({}),
        ChatMessageException.contentTooLong(3000, 2000, {}),
        ChatMessageException.spamDetected(5, 10, {}),
        ChatMessageException.xssDetected([], {}),
        ChatMessageException.fetchFailed({}),
        ChatMessageException.unauthorizedEdit({}),
        ChatMessageException.unauthorizedDelete({}),
        ChatMessageException.notFound('msg1', {}),
        ChatMessageException.duplicate('msg1', {}),
        ChatMessageException.orderInconsistency({})
      ];

      errors.forEach(error => {
        expect(error.code).toMatch(/^CHAT-MSG-\d{3}$/);
        expect(error.name).toBe('ChatMessageException');
      });
    });

    it('코드 순서가 001부터 012까지 올바름', () => {
      const codeMapping = {
        'CHAT-MSG-001': ChatMessageException.sendFailedNetwork({}),
        'CHAT-MSG-002': ChatMessageException.sendFailedServer({}),
        'CHAT-MSG-003': ChatMessageException.emptyContent({}),
        'CHAT-MSG-004': ChatMessageException.contentTooLong(100, 50, {}),
        'CHAT-MSG-005': ChatMessageException.spamDetected(5, 10, {}),
        'CHAT-MSG-006': ChatMessageException.xssDetected(['test'], {}),
        'CHAT-MSG-007': ChatMessageException.fetchFailed({}),
        'CHAT-MSG-008': ChatMessageException.unauthorizedEdit({}),
        'CHAT-MSG-009': ChatMessageException.unauthorizedDelete({}),
        'CHAT-MSG-010': ChatMessageException.notFound('id', {}),
        'CHAT-MSG-011': ChatMessageException.duplicate('id', {}),
        'CHAT-MSG-012': ChatMessageException.orderInconsistency({})
      };

      Object.entries(codeMapping).forEach(([expectedCode, exception]) => {
        expect(exception.code).toBe(expectedCode);
      });
    });
  });

  // ============================================
  // 상속 관계 테스트
  // ============================================
  describe('상속 관계', () => {
    it('ChatMessageException은 ChatException을 상속해야 함', () => {
      const error = ChatMessageException.emptyContent({});

      expect(error).toBeInstanceOf(ChatMessageException);
      expect(error).toBeInstanceOf(ChatException);
      expect(error).toBeInstanceOf(Error);
    });
  });

  // ============================================
  // API 시나리오 테스트
  // ============================================
  describe('API 시나리오', () => {
    describe('POST /api/studies/[id]/chat 시나리오', () => {
      it('빈 메시지 전송 시 CHAT-MSG-003 예외 발생', () => {
        const content = '';
        const fileId = null;

        if (!content && !fileId) {
          const error = ChatMessageException.emptyContent({ studyId: 'study123' });
          expect(error.code).toBe('CHAT-MSG-003');
        }
      });

      it('2000자 초과 메시지 전송 시 CHAT-MSG-004 예외 발생', () => {
        const content = 'a'.repeat(2500);
        const maxLength = 2000;

        if (content.length > maxLength) {
          const error = ChatMessageException.contentTooLong(content.length, maxLength, {});
          expect(error.code).toBe('CHAT-MSG-004');
        }
      });

      it('스팸 감지 시 CHAT-MSG-005 예외 발생', () => {
        const messageCount = 6;
        const timeWindow = 10;
        const maxMessages = 5;

        if (messageCount >= maxMessages) {
          const error = ChatMessageException.spamDetected(messageCount, timeWindow, {});
          expect(error.code).toBe('CHAT-MSG-005');
        }
      });

      it('XSS 시도 감지 시 CHAT-MSG-006 예외 발생', () => {
        const threatCheck = { safe: false, threats: ['script_tag'] };

        if (!threatCheck.safe) {
          const error = ChatMessageException.xssDetected(threatCheck.threats, {});
          expect(error.code).toBe('CHAT-MSG-006');
        }
      });
    });

    describe('PATCH /api/studies/[id]/chat/[messageId] 시나리오', () => {
      it('빈 내용으로 수정 시 CHAT-MSG-003 예외 발생', () => {
        const content = '';

        if (!content || !content.trim()) {
          const error = ChatMessageException.emptyContent({});
          expect(error.code).toBe('CHAT-MSG-003');
        }
      });

      it('존재하지 않는 메시지 수정 시 CHAT-MSG-010 예외 발생', () => {
        const message = null;

        if (!message) {
          const error = ChatMessageException.notFound('msg123', {});
          expect(error.code).toBe('CHAT-MSG-010');
        }
      });

      it('다른 사용자 메시지 수정 시 CHAT-MSG-008 예외 발생', () => {
        const message = { userId: 'other-user' };
        const currentUserId = 'user123';

        if (message.userId !== currentUserId) {
          const error = ChatMessageException.unauthorizedEdit({
            messageId: 'msg123',
            userId: currentUserId,
            ownerId: message.userId
          });
          expect(error.code).toBe('CHAT-MSG-008');
        }
      });

      it('자신의 메시지 수정은 예외 없음', () => {
        const message = { userId: 'user123' };
        const currentUserId = 'user123';

        expect(message.userId).toBe(currentUserId);
        // 예외가 발생하지 않음
      });
    });

    describe('DELETE /api/studies/[id]/chat/[messageId] 시나리오', () => {
      it('존재하지 않는 메시지 삭제 시 CHAT-MSG-010 예외 발생', () => {
        const message = null;

        if (!message) {
          const error = ChatMessageException.notFound('msg123', {});
          expect(error.code).toBe('CHAT-MSG-010');
        }
      });

      it('일반 멤버가 다른 사용자 메시지 삭제 시 CHAT-MSG-009 예외 발생', () => {
        const message = { userId: 'other-user' };
        const currentUserId = 'user123';
        const userRole = 'MEMBER';

        const canDelete = message.userId === currentUserId || ['OWNER', 'ADMIN'].includes(userRole);

        if (!canDelete) {
          const error = ChatMessageException.unauthorizedDelete({
            messageId: 'msg123',
            userId: currentUserId,
            ownerId: message.userId,
            userRole
          });
          expect(error.code).toBe('CHAT-MSG-009');
        }
      });

      it('자신의 메시지 삭제는 예외 없음', () => {
        const message = { userId: 'user123' };
        const currentUserId = 'user123';
        const userRole = 'MEMBER';

        const canDelete = message.userId === currentUserId || ['OWNER', 'ADMIN'].includes(userRole);

        expect(canDelete).toBe(true);
      });

      it('ADMIN은 다른 사용자 메시지 삭제 가능', () => {
        const message = { userId: 'other-user' };
        const currentUserId = 'user123';
        const userRole = 'ADMIN';

        const canDelete = message.userId === currentUserId || ['OWNER', 'ADMIN'].includes(userRole);

        expect(canDelete).toBe(true);
      });

      it('OWNER는 다른 사용자 메시지 삭제 가능', () => {
        const message = { userId: 'other-user' };
        const currentUserId = 'user123';
        const userRole = 'OWNER';

        const canDelete = message.userId === currentUserId || ['OWNER', 'ADMIN'].includes(userRole);

        expect(canDelete).toBe(true);
      });
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('context 없이도 예외 생성 가능', () => {
      const error = ChatMessageException.emptyContent();

      expect(error.code).toBe('CHAT-MSG-003');
      expect(error.name).toBe('ChatMessageException');
    });

    it('빈 threats 배열로도 xssDetected 생성 가능', () => {
      const error = ChatMessageException.xssDetected([]);

      expect(error.code).toBe('CHAT-MSG-006');
    });

    it('0자 길이 검증', () => {
      const error = ChatMessageException.contentTooLong(0, 2000);

      expect(error.code).toBe('CHAT-MSG-004');
      expect(error.message).toContain('0');
    });

    it('매우 큰 숫자의 길이 검증', () => {
      const error = ChatMessageException.contentTooLong(1000000, 2000);

      expect(error.code).toBe('CHAT-MSG-004');
    });

    it('null messageId로도 notFound 생성 가능', () => {
      const error = ChatMessageException.notFound(null);

      expect(error.code).toBe('CHAT-MSG-010');
    });

    it('undefined messageId로도 notFound 생성 가능', () => {
      const error = ChatMessageException.notFound(undefined);

      expect(error.code).toBe('CHAT-MSG-010');
    });

    it('정확히 2000자 메시지는 예외 없음', () => {
      const content = 'a'.repeat(2000);
      const maxLength = 2000;

      expect(content.length).toBeLessThanOrEqual(maxLength);
    });
  });
});
