/**
 * @jest-environment node
 */

/**
 * Notifications API 테스트
 *
 * @description /api/notifications 엔드포인트 테스트
 */

import { GET, POST } from '@/app/api/notifications/route';
import { GET as GET_BY_ID, DELETE } from '@/app/api/notifications/[id]/route';
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
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    }
  }
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {}
}));

describe('Notifications API', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ============================================
  // GET /api/notifications 테스트
  // ============================================
  describe('GET /api/notifications', () => {
    it('인증된 사용자의 알림 목록 조회', async () => {
      const mockSession = { user: { id: 'user1' } };
      const mockNotifications = [
        { id: 'n1', type: 'NOTICE', message: '공지사항1', isRead: false, createdAt: new Date() },
        { id: 'n2', type: 'FILE', message: '파일 알림', isRead: true, createdAt: new Date() }
      ];

      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findMany.mockResolvedValue(mockNotifications);
      prisma.notification.count.mockResolvedValue(2);

      const url = 'http://localhost:3000/api/notifications?page=1&limit=20';
      const request = new Request(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
    });

    it('인증되지 않은 요청은 401 에러', async () => {
      getServerSession.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/notifications');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
      expect(data.code).toMatch(/^NOTI-PERM/);
    });

    it('isRead 필터로 조회', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);

      const url = 'http://localhost:3000/api/notifications?isRead=false';
      const request = new Request(url);

      await GET(request);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isRead: false
          })
        })
      );
    });

    it('type 필터로 조회', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);

      const url = 'http://localhost:3000/api/notifications?type=NOTICE';
      const request = new Request(url);

      await GET(request);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'NOTICE'
          })
        })
      );
    });

    it('페이지네이션 정보가 포함됨', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(50);

      const url = 'http://localhost:3000/api/notifications?page=1&limit=20';
      const request = new Request(url);

      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(20);
      expect(data.pagination.total).toBe(50);
    });
  });

  // ============================================
  // POST /api/notifications 테스트
  // ============================================
  describe('POST /api/notifications', () => {
    it('알림 생성 성공', async () => {
      const mockSession = { user: { id: 'user1' } };
      const mockCreated = {
        id: 'n1',
        userId: 'user1',
        type: 'NOTICE',
        message: '새 공지사항',
        isRead: false,
        createdAt: new Date()
      };

      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.create.mockResolvedValue(mockCreated);

      const request = new Request('http://localhost:3000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user1',
          type: 'NOTICE',
          message: '새 공지사항'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('필수 필드 누락시 400 에러', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);

      const request = new Request('http://localhost:3000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NOTICE'
          // userId와 message 누락
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('유효하지 않은 type이면 400 에러', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);

      const request = new Request('http://localhost:3000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user1',
          type: 'INVALID_TYPE',
          message: '메시지'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  // ============================================
  // GET /api/notifications/[id] 테스트
  // ============================================
  describe('GET /api/notifications/[id]', () => {
    it('특정 알림 조회 성공', async () => {
      const mockSession = { user: { id: 'user1' } };
      const mockNotification = {
        id: 'n1',
        userId: 'user1',
        type: 'NOTICE',
        message: '알림 메시지',
        isRead: false,
        createdAt: new Date()
      };

      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findUnique.mockResolvedValue(mockNotification);

      const request = new Request('http://localhost:3000/api/notifications/n1');
      const params = Promise.resolve({ id: 'n1' });

      const response = await GET_BY_ID(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('존재하지 않는 알림은 404 에러', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findUnique.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/notifications/n999');
      const params = Promise.resolve({ id: 'n999' });

      const response = await GET_BY_ID(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('NOTI-BIZ-001');
    });

    it('다른 사용자의 알림 조회시 403 에러', async () => {
      const mockSession = { user: { id: 'user1' } };
      const mockNotification = {
        id: 'n1',
        userId: 'user2', // 다른 사용자
        type: 'NOTICE',
        message: '알림'
      };

      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findUnique.mockResolvedValue(mockNotification);

      const request = new Request('http://localhost:3000/api/notifications/n1');
      const params = Promise.resolve({ id: 'n1' });

      const response = await GET_BY_ID(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('NOTI-PERM-004');
    });
  });

  // ============================================
  // DELETE /api/notifications/[id] 테스트
  // ============================================
  describe('DELETE /api/notifications/[id]', () => {
    it('알림 삭제 성공', async () => {
      const mockSession = { user: { id: 'user1' } };
      const mockNotification = { id: 'n1', userId: 'user1' };

      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findUnique.mockResolvedValue(mockNotification);
      prisma.notification.delete.mockResolvedValue(mockNotification);

      const request = new Request('http://localhost:3000/api/notifications/n1', {
        method: 'DELETE'
      });
      const params = Promise.resolve({ id: 'n1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('다른 사용자의 알림 삭제시 403 에러', async () => {
      const mockSession = { user: { id: 'user1' } };
      const mockNotification = { id: 'n1', userId: 'user2' };

      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.findUnique.mockResolvedValue(mockNotification);

      const request = new Request('http://localhost:3000/api/notifications/n1', {
        method: 'DELETE'
      });
      const params = Promise.resolve({ id: 'n1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('NOTI-PERM-004');
    });
  });
});
