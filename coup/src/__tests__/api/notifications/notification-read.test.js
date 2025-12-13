/**
 * @jest-environment node
 */

/**
 * Notification Read API 테스트
 *
 * @description /api/notifications/[id]/read, /api/notifications/mark-all-read 엔드포인트 테스트
 */

import { POST as MARK_READ, PATCH as MARK_READ_PATCH } from '@/app/api/notifications/[id]/read/route';
import { POST as MARK_ALL_READ, PATCH as MARK_ALL_READ_PATCH } from '@/app/api/notifications/mark-all-read/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Mocks
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn()
    }
  }
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {}
}));

describe('Notification Read API', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ============================================
  // POST /api/notifications/[id]/read 테스트
  // ============================================
  describe('POST /api/notifications/[id]/read', () => {
    it('알림 읽음 처리 성공', async () => {
      const mockSession = { user: { id: 'user1' } };
      const mockNotification = {
        id: 'n1',
        userId: 'user1',
        isRead: false
      };
      const mockUpdated = { ...mockNotification, isRead: true };

      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findUnique.mockResolvedValue(mockNotification);
      prisma.notification.update.mockResolvedValue(mockUpdated);

      const request = new Request('http://localhost:3000/api/notifications/n1/read', {
        method: 'POST'
      });
      const params = Promise.resolve({ id: 'n1' });

      const response = await MARK_READ(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.isRead).toBe(true);
    });

    it('이미 읽은 알림은 400 에러', async () => {
      const mockSession = { user: { id: 'user1' } };
      const mockNotification = {
        id: 'n1',
        userId: 'user1',
        isRead: true
      };

      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findUnique.mockResolvedValue(mockNotification);

      const request = new Request('http://localhost:3000/api/notifications/n1/read', {
        method: 'POST'
      });
      const params = Promise.resolve({ id: 'n1' });

      const response = await MARK_READ(request, { params });
      const data = await response.json();

      // 이미 읽은 알림 - 비즈니스 예외 발생
      expect(response.status).toBe(400);
      expect(data.code).toBe('NOTI-BIZ-003');
    });

    it('존재하지 않는 알림은 404 에러', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findUnique.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/notifications/n999/read', {
        method: 'POST'
      });
      const params = Promise.resolve({ id: 'n999' });

      const response = await MARK_READ(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('NOTI-BIZ-001');
    });

    it('다른 사용자의 알림은 403 에러', async () => {
      const mockSession = { user: { id: 'user1' } };
      const mockNotification = {
        id: 'n1',
        userId: 'user2',
        isRead: false
      };

      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findUnique.mockResolvedValue(mockNotification);

      const request = new Request('http://localhost:3000/api/notifications/n1/read', {
        method: 'POST'
      });
      const params = Promise.resolve({ id: 'n1' });

      const response = await MARK_READ(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('NOTI-PERM-004');
    });

    it('인증되지 않은 요청은 401 에러', async () => {
      getServerSession.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/notifications/n1/read', {
        method: 'POST'
      });
      const params = Promise.resolve({ id: 'n1' });

      const response = await MARK_READ(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('NOTI-PERM-001');
    });
  });

  // ============================================
  // PATCH /api/notifications/[id]/read 테스트
  // ============================================
  describe('PATCH /api/notifications/[id]/read', () => {
    it('PATCH도 동일하게 동작', async () => {
      const mockSession = { user: { id: 'user1' } };
      const mockNotification = {
        id: 'n1',
        userId: 'user1',
        isRead: false
      };
      const mockUpdated = { ...mockNotification, isRead: true };

      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findUnique.mockResolvedValue(mockNotification);
      prisma.notification.update.mockResolvedValue(mockUpdated);

      const request = new Request('http://localhost:3000/api/notifications/n1/read', {
        method: 'PATCH'
      });
      const params = Promise.resolve({ id: 'n1' });

      const response = await MARK_READ_PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ============================================
  // POST /api/notifications/mark-all-read 테스트
  // ============================================
  describe('POST /api/notifications/mark-all-read', () => {
    it('모든 알림 읽음 처리 성공', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const request = new Request('http://localhost:3000/api/notifications/mark-all-read', {
        method: 'POST'
      });

      const response = await MARK_ALL_READ(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(5);
    });

    it('읽지 않은 알림이 없어도 성공', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      const request = new Request('http://localhost:3000/api/notifications/mark-all-read', {
        method: 'POST'
      });

      const response = await MARK_ALL_READ(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(0);
    });

    it('인증되지 않은 요청은 401 에러', async () => {
      getServerSession.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/notifications/mark-all-read', {
        method: 'POST'
      });

      const response = await MARK_ALL_READ(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('NOTI-PERM-001');
    });
  });

  // ============================================
  // PATCH /api/notifications/mark-all-read 테스트
  // ============================================
  describe('PATCH /api/notifications/mark-all-read', () => {
    it('PATCH도 동일하게 동작', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.updateMany.mockResolvedValue({ count: 3 });

      const request = new Request('http://localhost:3000/api/notifications/mark-all-read', {
        method: 'PATCH'
      });

      const response = await MARK_ALL_READ_PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(3);
    });
  });
});
