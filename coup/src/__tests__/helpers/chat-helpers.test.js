/**
 * @jest-environment node
 */

/**
 * Chat Helpers 테스트
 *
 * @description chat-helpers.js의 모든 헬퍼 함수 테스트
 */

// 모킹을 먼저 설정
const mockPrisma = {
  message: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn()
  },
  study: {
    findUnique: jest.fn()
  },
  studyMember: {
    findUnique: jest.fn(),
    findMany: jest.fn()
  },
  user: {
    findUnique: jest.fn()
  },
  sanction: {
    findFirst: jest.fn()
  }
};

import {
  formatMessageResponse,
  formatMessagesListResponse,
  createPaginatedResponse,
  createSuccessResponse,
  createErrorResponse,
  checkMessageExists,
  checkMessageOwnership,
  checkStudyExists,
  checkStudyMembership,
  checkUserChatPermission,
  createMessage,
  markMessageAsRead,
  markAllMessagesAsRead,
  deleteMessage,
  deleteBulkMessages,
  getStudyMessages,
  getUnreadMessageCount,
  getTotalUnreadCount,
  withChatErrorHandler,
  CHAT_HELPER_VERSION
} from '@/lib/helpers/chat-helpers';

import ChatBusinessException from '@/lib/exceptions/chat/ChatBusinessException';
import ChatPermissionException from '@/lib/exceptions/chat/ChatPermissionException';

describe('Chat Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // 응답 포맷팅
  // ============================================
  describe('formatMessageResponse', () => {
    it('메시지 응답 포맷', () => {
      const message = {
        id: 'msg1',
        studyId: 'study123',
        userId: 'user123',
        content: '안녕하세요',
        fileId: null,
        file: null,
        user: { id: 'user123', name: 'Test', avatar: null },
        readers: ['user123'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      const result = formatMessageResponse(message);

      expect(result.id).toBe('msg1');
      expect(result.content).toBe('안녕하세요');
      expect(result.user.id).toBe('user123');
      expect(result.readers).toEqual(['user123']);
    });

    it('null 메시지는 null 반환', () => {
      expect(formatMessageResponse(null)).toBeNull();
    });

    it('파일이 있는 메시지 포맷', () => {
      const message = {
        id: 'msg1',
        studyId: 'study123',
        userId: 'user123',
        content: '파일입니다',
        fileId: 'file123',
        file: { id: 'file123', name: 'test.pdf', url: '/files/test.pdf', type: 'application/pdf', size: 1024 },
        user: { id: 'user123', name: 'Test', avatar: null },
        readers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = formatMessageResponse(message);

      expect(result.file).toBeDefined();
      expect(result.file.name).toBe('test.pdf');
    });
  });

  describe('formatMessagesListResponse', () => {
    it('메시지 배열 포맷', () => {
      const messages = [
        {
          id: 'msg1',
          content: '첫번째',
          studyId: 'study123',
          userId: 'user1',
          fileId: null,
          file: null,
          user: { id: 'user1', name: 'User1', avatar: null },
          readers: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'msg2',
          content: '두번째',
          studyId: 'study123',
          userId: 'user2',
          fileId: null,
          file: null,
          user: { id: 'user2', name: 'User2', avatar: null },
          readers: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = formatMessagesListResponse(messages);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('msg1');
      expect(result[1].id).toBe('msg2');
    });

    it('null이면 빈 배열 반환', () => {
      expect(formatMessagesListResponse(null)).toEqual([]);
    });

    it('배열이 아니면 빈 배열 반환', () => {
      expect(formatMessagesListResponse('not an array')).toEqual([]);
    });
  });

  describe('createPaginatedResponse', () => {
    it('페이지네이션 응답 생성', () => {
      const data = [
        { id: 'msg1', content: '첫번째', studyId: 's1', userId: 'u1', fileId: null, file: null, user: null, readers: [], createdAt: new Date(), updatedAt: new Date() }
      ];

      const result = createPaginatedResponse(data, 1, 10, 25);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });
  });

  describe('createSuccessResponse', () => {
    it('성공 응답 생성', () => {
      const result = createSuccessResponse({ data: 'test' }, '성공했습니다');

      expect(result.success).toBe(true);
      expect(result.message).toBe('성공했습니다');
      expect(result.data).toBe('test');
    });

    it('기본 메시지 사용', () => {
      const result = createSuccessResponse({ data: 'test' });

      expect(result.message).toBe('성공');
    });
  });

  describe('createErrorResponse', () => {
    it('ChatException 에러 응답 생성', () => {
      const error = ChatBusinessException.messageNotFound('msg123');

      const result = createErrorResponse(error);

      expect(result.success).toBe(false);
      expect(result.code).toBe('CHAT-BIZ-001');
      expect(result.statusCode).toBe(404);
    });

    it('일반 에러 응답 생성', () => {
      const error = new Error('Something went wrong');

      const result = createErrorResponse(error);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Something went wrong');
      expect(result.statusCode).toBe(500);
    });
  });

  // ============================================
  // 메시지 존재 확인
  // ============================================
  describe('checkMessageExists', () => {
    it('메시지가 있으면 반환', async () => {
      const mockMessage = {
        id: 'msg1',
        content: '안녕하세요',
        userId: 'user123',
        user: { id: 'user123', name: 'Test', avatar: null },
        file: null
      };
      mockPrisma.message.findUnique.mockResolvedValue(mockMessage);

      const result = await checkMessageExists('msg1', mockPrisma);

      expect(result).toEqual(mockMessage);
    });

    it('메시지가 없으면 ChatBusinessException 발생', async () => {
      mockPrisma.message.findUnique.mockResolvedValue(null);

      await expect(checkMessageExists('msg1', mockPrisma))
        .rejects
        .toThrow(ChatBusinessException);
    });
  });

  describe('checkMessageOwnership', () => {
    it('소유자면 메시지 반환', async () => {
      const mockMessage = {
        id: 'msg1',
        userId: 'user123',
        content: '안녕하세요',
        user: { id: 'user123', name: 'Test', avatar: null },
        file: null
      };
      mockPrisma.message.findUnique.mockResolvedValue(mockMessage);

      const result = await checkMessageOwnership('msg1', 'user123', mockPrisma);

      expect(result).toEqual(mockMessage);
    });

    it('소유자가 아니면 ChatPermissionException 발생', async () => {
      const mockMessage = {
        id: 'msg1',
        userId: 'user456',
        content: '안녕하세요',
        user: { id: 'user456', name: 'Other', avatar: null },
        file: null
      };
      mockPrisma.message.findUnique.mockResolvedValue(mockMessage);

      await expect(checkMessageOwnership('msg1', 'user123', mockPrisma))
        .rejects
        .toThrow(ChatPermissionException);
    });
  });

  // ============================================
  // 스터디 & 멤버십 확인
  // ============================================
  describe('checkStudyExists', () => {
    it('스터디가 있으면 반환', async () => {
      const mockStudy = {
        id: 'study123',
        name: '테스트 스터디',
        emoji: '📚',
        ownerId: 'user123'
      };
      mockPrisma.study.findUnique.mockResolvedValue(mockStudy);

      const result = await checkStudyExists('study123', mockPrisma);

      expect(result).toEqual(mockStudy);
    });

    it('스터디가 없으면 ChatBusinessException 발생', async () => {
      mockPrisma.study.findUnique.mockResolvedValue(null);

      await expect(checkStudyExists('study123', mockPrisma))
        .rejects
        .toThrow(ChatBusinessException);
    });
  });

  describe('checkStudyMembership', () => {
    it('활성 멤버십이 있으면 반환', async () => {
      const mockMembership = {
        id: 'member1',
        userId: 'user123',
        studyId: 'study123',
        status: 'ACTIVE',
        role: 'MEMBER'
      };
      mockPrisma.studyMember.findUnique.mockResolvedValue(mockMembership);

      const result = await checkStudyMembership('study123', 'user123', mockPrisma);

      expect(result).toEqual(mockMembership);
    });

    it('멤버십이 없으면 ChatPermissionException 발생', async () => {
      mockPrisma.studyMember.findUnique.mockResolvedValue(null);

      await expect(checkStudyMembership('study123', 'user123', mockPrisma))
        .rejects
        .toThrow(ChatPermissionException);
    });

    it('PENDING 상태는 ChatPermissionException 발생', async () => {
      const mockMembership = {
        id: 'member1',
        userId: 'user123',
        studyId: 'study123',
        status: 'PENDING',
        role: 'MEMBER'
      };
      mockPrisma.studyMember.findUnique.mockResolvedValue(mockMembership);

      await expect(checkStudyMembership('study123', 'user123', mockPrisma))
        .rejects
        .toThrow(ChatPermissionException);
    });

    it('KICKED 상태는 ChatPermissionException 발생', async () => {
      const mockMembership = {
        id: 'member1',
        userId: 'user123',
        studyId: 'study123',
        status: 'KICKED',
        role: 'MEMBER'
      };
      mockPrisma.studyMember.findUnique.mockResolvedValue(mockMembership);

      await expect(checkStudyMembership('study123', 'user123', mockPrisma))
        .rejects
        .toThrow(ChatPermissionException);
    });
  });

  describe('checkUserChatPermission', () => {
    it('정상 사용자는 true 반환', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        status: 'ACTIVE'
      });
      mockPrisma.sanction.findFirst.mockResolvedValue(null);

      const result = await checkUserChatPermission('user123', mockPrisma);

      expect(result).toBe(true);
    });

    it('SUSPENDED 사용자는 ChatPermissionException 발생', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        status: 'SUSPENDED',
        suspendReason: '규칙 위반'
      });

      await expect(checkUserChatPermission('user123', mockPrisma))
        .rejects
        .toThrow(ChatPermissionException);
    });

    it('채팅 금지 제재가 있으면 ChatPermissionException 발생', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        status: 'ACTIVE'
      });
      mockPrisma.sanction.findFirst.mockResolvedValue({
        type: 'CHAT_BAN',
        reason: '스팸',
        isActive: true
      });

      await expect(checkUserChatPermission('user123', mockPrisma))
        .rejects
        .toThrow(ChatPermissionException);
    });
  });

  // ============================================
  // 메시지 CRUD
  // ============================================
  describe('createMessage', () => {
    it('메시지 생성 성공', async () => {
      const mockMessage = {
        id: 'msg1',
        studyId: 'study123',
        userId: 'user123',
        content: '안녕하세요',
        readers: ['user123'],
        user: { id: 'user123', name: 'Test', avatar: null },
        file: null
      };
      mockPrisma.message.create.mockResolvedValue(mockMessage);

      const result = await createMessage({
        studyId: 'study123',
        userId: 'user123',
        content: '안녕하세요'
      }, mockPrisma);

      expect(result).toEqual(mockMessage);
    });

    it('DB 에러 시 ChatBusinessException 발생', async () => {
      mockPrisma.message.create.mockRejectedValue(new Error('DB Error'));

      await expect(createMessage({
        studyId: 'study123',
        userId: 'user123',
        content: '안녕하세요'
      }, mockPrisma))
        .rejects
        .toThrow(ChatBusinessException);
    });
  });

  describe('markMessageAsRead', () => {
    it('읽음 표시 성공', async () => {
      const mockMessage = {
        id: 'msg1',
        userId: 'user123',
        readers: [],
        user: { id: 'user123', name: 'Test', avatar: null },
        file: null
      };
      const updatedMessage = {
        ...mockMessage,
        readers: ['user456']
      };

      mockPrisma.message.findUnique.mockResolvedValue(mockMessage);
      mockPrisma.message.update.mockResolvedValue(updatedMessage);

      const result = await markMessageAsRead('msg1', 'user456', mockPrisma);

      expect(result.readers).toContain('user456');
    });

    it('이미 읽은 메시지는 그대로 반환', async () => {
      const mockMessage = {
        id: 'msg1',
        userId: 'user123',
        readers: ['user456'],
        user: { id: 'user123', name: 'Test', avatar: null },
        file: null
      };

      mockPrisma.message.findUnique.mockResolvedValue(mockMessage);

      const result = await markMessageAsRead('msg1', 'user456', mockPrisma);

      expect(result).toEqual(mockMessage);
      expect(mockPrisma.message.update).not.toHaveBeenCalled();
    });
  });

  describe('markAllMessagesAsRead', () => {
    it('모든 메시지 읽음 표시 성공', async () => {
      mockPrisma.message.findMany.mockResolvedValue([
        { id: 'msg1' },
        { id: 'msg2' }
      ]);
      mockPrisma.message.update.mockResolvedValue({});

      const result = await markAllMessagesAsRead('study123', 'user123', mockPrisma);

      expect(result.count).toBe(2);
      expect(result.success).toBe(true);
      expect(mockPrisma.message.update).toHaveBeenCalledTimes(2);
    });

    it('읽지 않은 메시지가 없으면 count 0 반환', async () => {
      mockPrisma.message.findMany.mockResolvedValue([]);

      const result = await markAllMessagesAsRead('study123', 'user123', mockPrisma);

      expect(result.count).toBe(0);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteMessage', () => {
    it('메시지 삭제 성공', async () => {
      const mockMessage = {
        id: 'msg1',
        userId: 'user123',
        user: { id: 'user123', name: 'Test', avatar: null },
        file: null
      };
      mockPrisma.message.findUnique.mockResolvedValue(mockMessage);
      mockPrisma.message.delete.mockResolvedValue(mockMessage);

      const result = await deleteMessage('msg1', 'user123', mockPrisma);

      expect(result).toEqual(mockMessage);
    });

    it('소유자가 아니면 ChatPermissionException 발생', async () => {
      const mockMessage = {
        id: 'msg1',
        userId: 'user456',
        user: { id: 'user456', name: 'Other', avatar: null },
        file: null
      };
      mockPrisma.message.findUnique.mockResolvedValue(mockMessage);

      await expect(deleteMessage('msg1', 'user123', mockPrisma))
        .rejects
        .toThrow(ChatPermissionException);
    });
  });

  describe('deleteBulkMessages', () => {
    it('여러 메시지 삭제 성공', async () => {
      mockPrisma.message.deleteMany.mockResolvedValue({ count: 3 });

      const result = await deleteBulkMessages(['msg1', 'msg2', 'msg3'], 'study123', mockPrisma);

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
    });

    it('일부 삭제 실패 시 ChatBusinessException 발생', async () => {
      mockPrisma.message.deleteMany.mockResolvedValue({ count: 2 });

      await expect(deleteBulkMessages(['msg1', 'msg2', 'msg3'], 'study123', mockPrisma))
        .rejects
        .toThrow(ChatBusinessException);
    });
  });

  // ============================================
  // 조회
  // ============================================
  describe('getStudyMessages', () => {
    it('메시지 목록 조회', async () => {
      const mockMessages = [
        { id: 'msg1', content: '첫번째', studyId: 's1', userId: 'u1', fileId: null, file: null, user: null, readers: [], createdAt: new Date(), updatedAt: new Date() },
        { id: 'msg2', content: '두번째', studyId: 's1', userId: 'u2', fileId: null, file: null, user: null, readers: [], createdAt: new Date(), updatedAt: new Date() }
      ];

      mockPrisma.message.findMany.mockResolvedValue(mockMessages);
      mockPrisma.message.count.mockResolvedValue(2);

      const result = await getStudyMessages('study123', { page: 1, limit: 50 }, mockPrisma);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('getUnreadMessageCount', () => {
    it('읽지 않은 메시지 수 반환', async () => {
      mockPrisma.message.count.mockResolvedValue(5);

      const result = await getUnreadMessageCount('study123', 'user123', mockPrisma);

      expect(result).toBe(5);
    });
  });

  describe('getTotalUnreadCount', () => {
    it('전체 읽지 않은 메시지 수 반환', async () => {
      mockPrisma.studyMember.findMany.mockResolvedValue([
        { studyId: 'study1' },
        { studyId: 'study2' }
      ]);
      mockPrisma.message.count.mockResolvedValueOnce(3);
      mockPrisma.message.count.mockResolvedValueOnce(2);

      const result = await getTotalUnreadCount('user123', mockPrisma);

      expect(result.total).toBe(5);
      expect(result.byStudy).toEqual({
        study1: 3,
        study2: 2
      });
    });

    it('스터디가 없으면 0 반환', async () => {
      mockPrisma.studyMember.findMany.mockResolvedValue([]);

      const result = await getTotalUnreadCount('user123', mockPrisma);

      expect(result.total).toBe(0);
      expect(result.byStudy).toEqual({});
    });
  });

  // ============================================
  // 에러 핸들링 & 상수
  // ============================================
  describe('withChatErrorHandler', () => {
    it('성공 응답을 그대로 반환', async () => {
      const handler = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }))
      );

      const wrappedHandler = withChatErrorHandler(handler);
      const response = await wrappedHandler({}, {});

      expect(handler).toHaveBeenCalled();
      expect(response).toBeInstanceOf(Response);
    });

    it('에러 발생 시 에러 응답 반환', async () => {
      const handler = jest.fn().mockRejectedValue(
        ChatBusinessException.messageNotFound('msg123')
      );

      const wrappedHandler = withChatErrorHandler(handler);
      const response = await wrappedHandler({}, {});
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('CHAT_HELPER_VERSION', () => {
    it('버전이 정의됨', () => {
      expect(CHAT_HELPER_VERSION).toBeDefined();
      expect(CHAT_HELPER_VERSION).toBe('1.0.0');
    });
  });
});
