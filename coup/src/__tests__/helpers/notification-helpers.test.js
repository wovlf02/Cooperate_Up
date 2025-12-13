/**
 * @jest-environment node
 */

/**
 * Notification Helpers 테스트
 *
 * @description notification-helpers.js의 모든 헬퍼 함수 테스트
 */

import {
  formatNotificationResponse,
  formatNotificationsListResponse,
  createPaginatedResponse,
  createSuccessResponse,
  createErrorResponse,
  checkNotificationExists,
  checkNotificationOwnership,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotificationWithException,
  deleteNotificationWithException,
  getUserNotificationsWithException,
  getUnreadNotificationCount,
  withNotificationErrorHandler
} from '@/lib/helpers/notification-helpers';

import {
  NotificationException,
  NotificationValidationException,
  NotificationPermissionException,
  NotificationBusinessException
} from '@/lib/exceptions/notification';

// Mock Prisma
const mockPrisma = {
  notification: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  user: {
    findUnique: jest.fn()
  }
};

describe('Notification Helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ============================================
  // 1. formatNotificationResponse 테스트
  // ============================================
  describe('formatNotificationResponse', () => {
    it('알림 응답을 올바르게 포맷팅', () => {
      const notification = {
        id: 'n1',
        userId: 'user1',
        type: 'NOTICE',
        message: '새 공지사항',
        studyId: 'study1',
        studyName: '알고리즘 스터디',
        studyEmoji: '📚',
        data: { extra: 'info' },
        isRead: false,
        createdAt: new Date('2024-01-01')
      };

      const result = formatNotificationResponse(notification);

      expect(result.id).toBe('n1');
      expect(result.type).toBe('NOTICE');
      expect(result.message).toBe('새 공지사항');
      expect(result.isRead).toBe(false);
    });

    it('알림이 null이면 null 반환', () => {
      expect(formatNotificationResponse(null)).toBeNull();
    });

    it('알림이 undefined면 null 반환', () => {
      expect(formatNotificationResponse(undefined)).toBeNull();
    });
  });

  // ============================================
  // 2. formatNotificationsListResponse 테스트
  // ============================================
  describe('formatNotificationsListResponse', () => {
    it('알림 목록을 올바르게 포맷팅', () => {
      const notifications = [
        { id: 'n1', type: 'NOTICE', message: 'msg1', isRead: false, createdAt: new Date() },
        { id: 'n2', type: 'FILE', message: 'msg2', isRead: true, createdAt: new Date() }
      ];

      const result = formatNotificationsListResponse(notifications);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('n1');
      expect(result[1].id).toBe('n2');
    });

    it('빈 배열이면 빈 배열 반환', () => {
      const result = formatNotificationsListResponse([]);
      expect(result).toHaveLength(0);
    });

    it('null이면 빈 배열 반환', () => {
      const result = formatNotificationsListResponse(null);
      expect(result).toEqual([]);
    });
  });

  // ============================================
  // 3. createPaginatedResponse 테스트
  // ============================================
  describe('createPaginatedResponse', () => {
    it('페이지네이션 응답 생성', () => {
      const notifications = [
        { id: 'n1', type: 'NOTICE', message: 'msg1', isRead: false, createdAt: new Date() }
      ];

      const result = createPaginatedResponse(notifications, 1, 20, 50);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(50);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('마지막 페이지면 hasNext가 false', () => {
      const result = createPaginatedResponse([], 3, 20, 50);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });
  });

  // ============================================
  // 4. createSuccessResponse 테스트
  // ============================================
  describe('createSuccessResponse', () => {
    it('성공 응답 생성', () => {
      const result = createSuccessResponse({ notification: { id: 'n1' } });

      expect(result.success).toBe(true);
      expect(result.notification.id).toBe('n1');
    });

    it('메시지 포함 성공 응답 생성', () => {
      const result = createSuccessResponse({ id: 'n1' }, '알림이 생성되었습니다.');

      expect(result.success).toBe(true);
      expect(result.message).toBe('알림이 생성되었습니다.');
      expect(result.id).toBe('n1');
    });
  });

  // ============================================
  // 5. createErrorResponse 테스트
  // ============================================
  describe('createErrorResponse', () => {
    it('NotificationException으로 에러 응답 생성', () => {
      const error = NotificationBusinessException.notificationNotFound('n1');
      const result = createErrorResponse(error);

      expect(result.success).toBe(false);
      expect(result.code).toBe('NOTI-BIZ-001');
      expect(result.statusCode).toBe(404);
    });

    it('일반 에러로 응답 생성', () => {
      const error = new Error('일반 에러');
      const result = createErrorResponse(error);

      expect(result.success).toBe(false);
      expect(result.error).toBe('일반 에러');
      expect(result.statusCode).toBe(500);
    });
  });

  // ============================================
  // 6. checkNotificationExists 테스트
  // ============================================
  describe('checkNotificationExists', () => {
    it('알림이 존재하면 알림 반환', async () => {
      const mockNotification = { id: 'n1', userId: 'user1' };
      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification);

      const result = await checkNotificationExists('n1', mockPrisma);

      expect(result).toEqual(mockNotification);
      expect(mockPrisma.notification.findUnique).toHaveBeenCalledWith({
        where: { id: 'n1' }
      });
    });

    it('알림이 없으면 예외 발생', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      await expect(checkNotificationExists('n1', mockPrisma))
        .rejects.toThrow(NotificationBusinessException);
    });
  });

  // ============================================
  // 7. checkNotificationOwnership 테스트
  // ============================================
  describe('checkNotificationOwnership', () => {
    it('소유자가 일치하면 알림 반환', async () => {
      const mockNotification = { id: 'n1', userId: 'user1' };
      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification);

      const result = await checkNotificationOwnership('n1', 'user1', mockPrisma);

      expect(result).toEqual(mockNotification);
    });

    it('소유자가 일치하지 않으면 예외 발생', async () => {
      const mockNotification = { id: 'n1', userId: 'user1' };
      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification);

      await expect(checkNotificationOwnership('n1', 'user2', mockPrisma))
        .rejects.toThrow(NotificationPermissionException);
    });
  });

  // ============================================
  // 8. markNotificationAsRead 테스트
  // ============================================
  describe('markNotificationAsRead', () => {
    it('알림을 읽음으로 표시', async () => {
      const mockNotification = { id: 'n1', userId: 'user1', isRead: false };
      const mockUpdated = { ...mockNotification, isRead: true };
      
      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification);
      mockPrisma.notification.update.mockResolvedValue(mockUpdated);

      const result = await markNotificationAsRead('n1', 'user1', mockPrisma);

      expect(result.isRead).toBe(true);
      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'n1' },
        data: { isRead: true }
      });
    });

    it('이미 읽은 알림이면 현재 상태 그대로 반환 (멱등성)', async () => {
      const mockNotification = { id: 'n1', userId: 'user1', isRead: true };
      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification);

      const result = await markNotificationAsRead('n1', 'user1', mockPrisma);

      expect(result.isRead).toBe(true);
      expect(mockPrisma.notification.update).not.toHaveBeenCalled();
    });

    it('소유자가 아니면 예외 발생', async () => {
      const mockNotification = { id: 'n1', userId: 'user1' };
      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification);

      await expect(markNotificationAsRead('n1', 'user2', mockPrisma))
        .rejects.toThrow(NotificationPermissionException);
    });
  });

  // ============================================
  // 9. markAllNotificationsAsRead 테스트
  // ============================================
  describe('markAllNotificationsAsRead', () => {
    it('모든 알림을 읽음으로 표시', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await markAllNotificationsAsRead('user1', mockPrisma);

      expect(result.count).toBe(5);
      expect(result.success).toBe(true);
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user1', isRead: false },
        data: { isRead: true }
      });
    });
  });

  // ============================================
  // 10. createNotificationWithException 테스트
  // ============================================
  describe('createNotificationWithException', () => {
    it('알림 생성 성공', async () => {
      const mockCreated = {
        id: 'n1',
        userId: 'user1',
        type: 'NOTICE',
        message: '새 알림',
        isRead: false
      };
      mockPrisma.notification.create.mockResolvedValue(mockCreated);

      const result = await createNotificationWithException({
        userId: 'user1',
        type: 'NOTICE',
        message: '새 알림'
      }, mockPrisma);

      expect(result.id).toBe('n1');
      expect(mockPrisma.notification.create).toHaveBeenCalled();
    });

    it('생성 실패시 예외 발생', async () => {
      mockPrisma.notification.create.mockRejectedValue(new Error('DB Error'));

      await expect(createNotificationWithException({
        userId: 'user1',
        type: 'NOTICE',
        message: '새 알림'
      }, mockPrisma)).rejects.toThrow(NotificationBusinessException);
    });
  });

  // ============================================
  // 11. deleteNotificationWithException 테스트
  // ============================================
  describe('deleteNotificationWithException', () => {
    it('알림 삭제 성공', async () => {
      const mockNotification = { id: 'n1', userId: 'user1' };
      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification);
      mockPrisma.notification.delete.mockResolvedValue(mockNotification);

      const result = await deleteNotificationWithException('n1', 'user1', mockPrisma);

      expect(result).toEqual(mockNotification);
      expect(mockPrisma.notification.delete).toHaveBeenCalledWith({
        where: { id: 'n1' }
      });
    });

    it('소유자가 아니면 예외 발생', async () => {
      const mockNotification = { id: 'n1', userId: 'user1' };
      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification);

      await expect(deleteNotificationWithException('n1', 'user2', mockPrisma))
        .rejects.toThrow(NotificationPermissionException);
    });

    it('알림이 없으면 예외 발생', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      await expect(deleteNotificationWithException('n1', 'user1', mockPrisma))
        .rejects.toThrow(NotificationBusinessException);
    });
  });

  // ============================================
  // 12. getUserNotificationsWithException 테스트
  // ============================================
  describe('getUserNotificationsWithException', () => {
    it('사용자 알림 목록 조회 성공', async () => {
      const mockNotifications = [
        { id: 'n1', type: 'NOTICE', message: 'msg1', isRead: false, createdAt: new Date() },
        { id: 'n2', type: 'FILE', message: 'msg2', isRead: true, createdAt: new Date() }
      ];
      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
      mockPrisma.notification.count.mockResolvedValue(2);

      const result = await getUserNotificationsWithException('user1', { page: 1, limit: 20 }, mockPrisma);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('필터 적용하여 조회', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.notification.count.mockResolvedValue(0);

      await getUserNotificationsWithException('user1', { 
        page: 1, 
        limit: 20, 
        isRead: false,
        type: 'NOTICE'
      }, mockPrisma);

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user1',
            isRead: false,
            type: 'NOTICE'
          })
        })
      );
    });
  });

  // ============================================
  // 13. getUnreadNotificationCount 테스트
  // ============================================
  describe('getUnreadNotificationCount', () => {
    it('읽지 않은 알림 개수 반환', async () => {
      mockPrisma.notification.count.mockResolvedValue(5);

      const result = await getUnreadNotificationCount('user1', mockPrisma);

      expect(result).toBe(5);
      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user1', isRead: false }
      });
    });
  });

  // ============================================
  // 14. withNotificationErrorHandler 테스트
  // ============================================
  describe('withNotificationErrorHandler', () => {
    it('성공시 핸들러 결과 반환', async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }));
      const handler = jest.fn().mockResolvedValue(mockResponse);
      const wrappedHandler = withNotificationErrorHandler(handler);

      const result = await wrappedHandler({});

      expect(result).toBe(mockResponse);
    });

    it('NotificationException 처리', async () => {
      const handler = jest.fn().mockRejectedValue(
        NotificationBusinessException.notificationNotFound('n1')
      );
      const wrappedHandler = withNotificationErrorHandler(handler);

      const result = await wrappedHandler({});
      const data = await result.json();

      expect(result.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('일반 Error 처리', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('Unknown error'));
      const wrappedHandler = withNotificationErrorHandler(handler);

      const result = await wrappedHandler({});

      expect(result.status).toBe(500);
    });
  });
});
