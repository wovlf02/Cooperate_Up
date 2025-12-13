/**
 * @jest-environment node
 */

/**
 * Notification Actions API 테스트
 *
 * @description /api/notifications/count, /api/notifications/bulk 엔드포인트 테스트
 */

import { GET as GET_COUNT } from '@/app/api/notifications/count/route';
import { DELETE as BULK_DELETE } from '@/app/api/notifications/bulk/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Mocks
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      count: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn()
    }
  }
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {}
}));

describe('Notification Actions API', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ============================================
  // GET /api/notifications/count 테스트
  // ============================================
  describe('GET /api/notifications/count', () => {
    it('읽지 않은 알림 개수 조회 성공', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.count.mockResolvedValue(5);

      const request = new Request('http://localhost:3000/api/notifications/count');

      const response = await GET_COUNT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(5);
    });

    it('읽지 않은 알림이 없으면 0 반환', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.count.mockResolvedValue(0);

      const request = new Request('http://localhost:3000/api/notifications/count');

      const response = await GET_COUNT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.count).toBe(0);
    });

    it('인증되지 않은 요청은 401 에러', async () => {
      getServerSession.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/notifications/count');

      const response = await GET_COUNT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('NOTI-PERM-001');
    });

    it('올바른 쿼리로 호출됨', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.count.mockResolvedValue(3);

      const request = new Request('http://localhost:3000/api/notifications/count');

      await GET_COUNT(request);

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          isRead: false
        }
      });
    });
  });

  // ============================================
  // DELETE /api/notifications/bulk 테스트
  // ============================================
  describe('DELETE /api/notifications/bulk', () => {
    it('여러 알림 삭제 성공', async () => {
      const mockSession = { user: { id: 'user1' } };

      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.deleteMany.mockResolvedValue({ count: 3 });

      const request = new Request('http://localhost:3000/api/notifications/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: ['n1', 'n2', 'n3']
        })
      });

      const response = await BULK_DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // createSuccessResponse는 { success: true, ...result } 형식
      // result = { success: 3, failed: 0, total: 3 }
      // 따라서 data.success는 3 (숫자)이 됨
      expect(data.total).toBe(3);
      expect(data.failed).toBe(0);
    });

    it('ids가 비어있으면 400 에러', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);

      const request = new Request('http://localhost:3000/api/notifications/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: []
        })
      });

      const response = await BULK_DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('NOTI-BIZ-023');
    });

    it('ids가 없으면 400 에러', async () => {
      const mockSession = { user: { id: 'user1' } };
      getServerSession.mockResolvedValue(mockSession);

      const request = new Request('http://localhost:3000/api/notifications/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const response = await BULK_DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('인증되지 않은 요청은 401 에러', async () => {
      getServerSession.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/notifications/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: ['n1', 'n2']
        })
      });

      const response = await BULK_DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('NOTI-PERM-001');
    });

    it('다른 사용자의 알림은 삭제되지 않음 - 일부 실패시 에러', async () => {
      const mockSession = { user: { id: 'user1' } };

      getServerSession.mockResolvedValue(mockSession);
      // 3개 중 2개만 삭제 성공 (1개는 다른 사용자 것)
      prisma.notification.deleteMany.mockResolvedValue({ count: 2 });

      const request = new Request('http://localhost:3000/api/notifications/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: ['n1', 'n2', 'n3']
        })
      });

      const response = await BULK_DELETE(request);
      const data = await response.json();

      // 일부 실패시 500 에러와 함께 bulkDeletionFailed
      expect(response.status).toBe(500);
      expect(data.code).toBe('NOTI-BIZ-011');
    });

    it('삭제할 알림이 모두 없으면 에러', async () => {
      const mockSession = { user: { id: 'user1' } };

      getServerSession.mockResolvedValue(mockSession);
      prisma.notification.deleteMany.mockResolvedValue({ count: 0 });

      const request = new Request('http://localhost:3000/api/notifications/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: ['n-nonexistent']
        })
      });

      const response = await BULK_DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.code).toBe('NOTI-BIZ-011');
    });
  });
});
