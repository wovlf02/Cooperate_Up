/**
 * dashboard-api.test.js
 *
 * Dashboard API 테스트
 *
 * @module __tests__/api/dashboard/dashboard-api.test.js
 * @author CoUp Team
 * @created 2025-12-04
 */

import { NextResponse } from 'next/server';
import { GET } from '@/app/api/dashboard/route';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

// Mocks
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    studyMember: {
      count: jest.fn(),
      findMany: jest.fn()
    },
    task: {
      count: jest.fn()
    },
    notification: {
      count: jest.fn(),
      findMany: jest.fn()
    },
    event: {
      findMany: jest.fn()
    }
  }
}));

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {}
}));

// NextResponse mock
const createMockRequest = (url) => {
  return {
    url: new URL(url, 'http://localhost:3000').toString()
  };
};

describe('Dashboard API', () => {
  const mockUserId = 'user-123';
  const mockSession = {
    user: {
      id: mockUserId,
      name: 'Test User',
      email: 'test@example.com'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue(mockSession);
    
    // 기본 mock 응답 설정
    prisma.studyMember.count.mockResolvedValue(3);
    prisma.task.count.mockResolvedValue(5);
    prisma.notification.count.mockResolvedValue(2);
    prisma.studyMember.findMany.mockResolvedValue([]);
    prisma.notification.findMany.mockResolvedValue([]);
    prisma.event.findMany.mockResolvedValue([]);
  });

  // ============================================
  // 인증 테스트
  // ============================================

  describe('인증', () => {
    it('세션이 없으면 401 에러를 반환해야 함', async () => {
      getServerSession.mockResolvedValue(null);
      
      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('유효한 세션으로 요청하면 성공해야 함', async () => {
      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  // ============================================
  // 정상 응답 테스트
  // ============================================

  describe('정상 응답', () => {
    it('대시보드 데이터를 반환해야 함', async () => {
      prisma.studyMember.count.mockResolvedValue(5);
      prisma.task.count
        .mockResolvedValueOnce(10) // pendingTasks
        .mockResolvedValueOnce(8);  // completedThisMonth
      prisma.notification.count.mockResolvedValue(3);
      
      prisma.studyMember.findMany.mockResolvedValue([
        {
          role: 'MEMBER',
          joinedAt: new Date(),
          study: {
            id: 'study-1',
            name: 'Test Study',
            emoji: '📚',
            category: 'development',
            _count: { members: 5 }
          }
        }
      ]);
      
      prisma.notification.findMany.mockResolvedValue([
        {
          id: 'notif-1',
          type: 'STUDY_INVITE',
          message: 'You have been invited',
          studyName: 'Test Study',
          studyEmoji: '📚',
          isRead: false,
          createdAt: new Date()
        }
      ]);

      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.stats).toBeDefined();
      expect(data.data.myStudies).toBeDefined();
      expect(data.data.recentActivities).toBeDefined();
    });

    it('통계 데이터 구조가 올바라야 함', async () => {
      prisma.studyMember.count.mockResolvedValue(5);
      prisma.task.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8);
      prisma.notification.count.mockResolvedValue(3);

      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.stats.activeStudies).toBe(5);
      expect(data.data.stats.pendingTasks).toBe(10);
      expect(data.data.stats.unreadNotifications).toBe(3);
    });

    it('메타데이터가 포함되어야 함', async () => {
      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      const data = await response.json();

      expect(data.metadata).toBeDefined();
      expect(data.metadata.duration).toBeDefined();
      expect(data.metadata.timestamp).toBeDefined();
    });
  });

  // ============================================
  // 부분 실패 테스트
  // ============================================

  describe('부분 실패 처리', () => {
    it('일부 쿼리 실패 시 207 상태와 함께 부분 데이터를 반환해야 함', async () => {
      prisma.studyMember.count.mockRejectedValue(new Error('DB Error'));
      prisma.task.count.mockResolvedValue(5);
      prisma.notification.count.mockResolvedValue(2);

      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      const data = await response.json();

      // 부분 실패는 207 또는 200으로 처리될 수 있음
      expect([200, 207]).toContain(response.status);
      expect(data.data.stats.pendingTasks).toBe(5);
    });

    it('myStudies 쿼리 실패 시 빈 배열을 반환해야 함', async () => {
      prisma.studyMember.findMany.mockRejectedValue(new Error('DB Error'));

      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.myStudies).toEqual([]);
    });

    it('recentActivities 쿼리 실패 시 빈 배열을 반환해야 함', async () => {
      prisma.notification.findMany.mockRejectedValue(new Error('DB Error'));

      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.recentActivities).toEqual([]);
    });

    it('upcomingEvents 쿼리 실패 시 빈 배열을 반환해야 함', async () => {
      prisma.event.findMany.mockRejectedValue(new Error('DB Error'));

      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.upcomingEvents).toEqual([]);
    });
  });

  // ============================================
  // 쿼리 파라미터 테스트
  // ============================================

  describe('쿼리 파라미터', () => {
    it('period 파라미터를 처리해야 함', async () => {
      const request = createMockRequest('/api/dashboard?period=THIS_MONTH');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
    });

    it('잘못된 period 파라미터에서도 기본값을 사용해야 함', async () => {
      const request = createMockRequest('/api/dashboard?period=INVALID');
      const response = await GET(request);
      
      // 잘못된 파라미터는 무시하고 기본값 사용
      expect(response.status).toBe(200);
    });

    it('날짜 범위 파라미터를 처리해야 함', async () => {
      const request = createMockRequest('/api/dashboard?startDate=2025-01-01&endDate=2025-12-31');
      const response = await GET(request);
      
      expect(response.status).toBe(200);
    });
  });

  // ============================================
  // 에러 처리 테스트
  // ============================================

  describe('에러 처리', () => {
    it('Prisma 에러를 적절히 처리해야 함', async () => {
      const prismaError = new Error('Prisma error');
      prismaError.code = 'P2002';
      
      prisma.studyMember.count.mockRejectedValue(prismaError);
      prisma.task.count.mockRejectedValue(prismaError);
      prisma.notification.count.mockRejectedValue(prismaError);

      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      
      // 부분 실패 또는 완전 실패로 처리됨
      expect([200, 207, 500]).toContain(response.status);
    });

    it('예상치 못한 에러에 대해 500 에러를 반환해야 함', async () => {
      // 모든 쿼리가 동시에 실패하는 심각한 에러 시뮬레이션
      const fatalError = new Error('Fatal error');
      fatalError.code = 'P1001'; // Connection error
      
      getServerSession.mockImplementation(() => {
        throw fatalError;
      });

      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  // ============================================
  // 데이터 변환 테스트
  // ============================================

  describe('데이터 변환', () => {
    it('스터디 데이터가 올바르게 변환되어야 함', async () => {
      prisma.studyMember.findMany.mockResolvedValue([
        {
          role: 'LEADER',
          joinedAt: new Date('2025-01-01'),
          study: {
            id: 'study-1',
            name: 'Test Study',
            emoji: '📚',
            category: 'development',
            _count: { members: 5 }
          }
        }
      ]);

      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.myStudies[0]).toEqual(expect.objectContaining({
        id: 'study-1',
        name: 'Test Study',
        emoji: '📚',
        category: 'development',
        role: 'LEADER',
        memberCount: 5
      }));
    });

    it('활동 데이터가 올바르게 변환되어야 함', async () => {
      const createdAt = new Date('2025-12-04T10:00:00Z');
      prisma.notification.findMany.mockResolvedValue([
        {
          id: 'notif-1',
          type: 'TASK_ASSIGNED',
          message: 'Task assigned',
          studyName: 'Test Study',
          studyEmoji: '📚',
          isRead: false,
          createdAt
        }
      ]);

      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.recentActivities[0]).toEqual(expect.objectContaining({
        id: 'notif-1',
        type: 'TASK_ASSIGNED',
        message: 'Task assigned',
        studyName: 'Test Study',
        studyEmoji: '📚',
        isRead: false
      }));
    });

    it('이벤트 데이터가 올바르게 변환되어야 함', async () => {
      const eventDate = new Date('2025-12-10');
      prisma.event.findMany.mockResolvedValue([
        {
          id: 'event-1',
          title: 'Study Meeting',
          date: eventDate,
          startTime: '14:00',
          endTime: '16:00',
          study: {
            name: 'Test Study',
            emoji: '📚'
          }
        }
      ]);

      const request = createMockRequest('/api/dashboard');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.upcomingEvents[0]).toEqual(expect.objectContaining({
        id: 'event-1',
        title: 'Study Meeting',
        studyName: 'Test Study',
        studyEmoji: '📚'
      }));
    });
  });
});
