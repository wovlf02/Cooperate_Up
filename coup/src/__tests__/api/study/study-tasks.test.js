/**
 * @jest-environment node
 */

import { GET, POST } from '@/app/api/studies/[id]/tasks/route';
import { GET as GET_TASK, PATCH, DELETE } from '@/app/api/studies/[id]/tasks/[taskId]/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Mock modules
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    studyMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    studyTask: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    studyTaskAssignee: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    study: {
      findUnique: jest.fn(),
    },
    notification: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/auth-helpers', () => ({
  requireStudyMember: jest.fn(async (studyId) => {
    const { getServerSession } = require('next-auth');
    const session = await getServerSession();
    if (!session) {
      // 인증 실패 시 에러 응답 객체를 반환하는 대신, 예외를 던짐
      throw new Error('Unauthorized');
    }
    const { prisma } = require('@/lib/prisma');
    const member = await prisma.studyMember.findUnique({
      where: {
        userId_studyId: {
          userId: session.user.id,
          studyId: studyId,
        },
      },
    });
    if (!member) {
      throw new Error('Not a member');
    }
    return { member, session };
  }),
}));

describe('Study Tasks API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSession = {
    user: { id: 'user1', email: 'test@example.com' },
  };

  const mockTask = {
    id: 'task1',
    studyId: 'study1',
    createdById: 'user1',
    title: '테스트 태스크',
    description: '태스크 설명',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: new Date('2025-12-31'),
    createdAt: new Date(),
    createdBy: {
      id: 'user1',
      name: 'Test User',
      avatar: null,
    },
    assignees: [
      {
        user: {
          id: 'user2',
          name: 'Assignee',
          avatar: null,
        },
      },
    ],
  };

  describe('GET /api/studies/[id]/tasks - 할일 목록 조회', () => {
    it('should return tasks list successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      prisma.studyTask.count.mockResolvedValue(1);
      prisma.studyTask.findMany.mockResolvedValue([mockTask]);

      const request = new Request('http://localhost:3000/api/studies/study1/tasks');
      const context = { params: Promise.resolve({ id: 'study1' }) };

      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].title).toBe('테스트 태스크');
    });

    it('should filter by status', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      prisma.studyTask.count.mockResolvedValue(1);
      prisma.studyTask.findMany.mockResolvedValue([mockTask]);

      const request = new Request('http://localhost:3000/api/studies/study1/tasks?status=TODO');
      const context = { params: Promise.resolve({ id: 'study1' }) };

      const response = await GET(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.studyTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'TODO',
          }),
        })
      );
    });
  });

  describe('POST /api/studies/[id]/tasks - 할일 생성', () => {
    it('should create task successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      // 담당자 검증용 - 명시적으로 mock 재설정
      prisma.studyMember.findMany = jest.fn().mockResolvedValue([
        {
          userId: 'user2',
          studyId: 'study1',
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      ]);

      // 알림용 스터디 정보
      prisma.study.findUnique = jest.fn().mockResolvedValue({
        id: 'study1',
        name: '테스트 스터디',
        emoji: '📚',
      });

      // 알림 생성
      prisma.notification.createMany = jest.fn().mockResolvedValue({ count: 1 });

      const newTask = { ...mockTask, id: 'task2' };
      prisma.$transaction.mockImplementation(async (callback) => {
        return await callback(prisma);
      });
      prisma.studyTask.create.mockResolvedValue(newTask);
      prisma.studyTask.findUnique.mockResolvedValue(newTask);
      prisma.studyTaskAssignee.createMany.mockResolvedValue({ count: 1 });

      const request = new Request('http://localhost:3000/api/studies/study1/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: '새로운 태스크',
          description: '태스크 설명',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: '2025-12-31',
          assigneeIds: ['user2'],
        }),
      });

      const context = { params: Promise.resolve({ id: 'study1' }) };
      const response = await POST(request, context);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should throw exception when title is missing', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      const request = new Request('http://localhost:3000/api/studies/study1/tasks', {
        method: 'POST',
        body: JSON.stringify({
          description: '태스크 설명',
        }),
      });

      const context = { params: Promise.resolve({ id: 'study1' }) };
      const response = await POST(request, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should throw exception when not admin', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      const request = new Request('http://localhost:3000/api/studies/study1/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: '새로운 태스크',
        }),
      });

      const context = { params: Promise.resolve({ id: 'study1' }) };
      const response = await POST(request, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/studies/[id]/tasks/[taskId] - 할일 상세 조회', () => {
    it('should return task details successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      prisma.studyTask.findUnique.mockResolvedValue(mockTask);

      const request = new Request('http://localhost:3000/api/studies/study1/tasks/task1');
      const context = {
        params: Promise.resolve({ id: 'study1', taskId: 'task1' }),
      };

      const response = await GET_TASK(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('테스트 태스크');
    });

    it('should throw exception when task not found', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      prisma.studyTask.findUnique.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/studies/study1/tasks/invalid');
      const context = {
        params: Promise.resolve({ id: 'study1', taskId: 'invalid' }),
      };

      const response = await GET_TASK(request, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('PATCH /api/studies/[id]/tasks/[taskId] - 할일 수정', () => {
    it('should update task successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.studyTask.findUnique.mockResolvedValue(mockTask);

      const updatedTask = { ...mockTask, title: '수정된 태스크' };
      prisma.$transaction.mockImplementation(async (callback) => {
        return await callback(prisma);
      });
      prisma.studyTask.update.mockResolvedValue(updatedTask);

      const request = new Request('http://localhost:3000/api/studies/study1/tasks/task1', {
        method: 'PATCH',
        body: JSON.stringify({
          title: '수정된 태스크',
        }),
      });

      const context = {
        params: Promise.resolve({ id: 'study1', taskId: 'task1' }),
      };

      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should update task status', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      prisma.studyTask.findUnique.mockResolvedValue(mockTask);

      const updatedTask = { ...mockTask, status: 'IN_PROGRESS' };
      prisma.$transaction.mockImplementation(async (callback) => {
        return await callback(prisma);
      });
      prisma.studyTask.update.mockResolvedValue(updatedTask);

      const request = new Request('http://localhost:3000/api/studies/study1/tasks/task1', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'IN_PROGRESS',
        }),
      });

      const context = {
        params: Promise.resolve({ id: 'study1', taskId: 'task1' }),
      };

      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('DELETE /api/studies/[id]/tasks/[taskId] - 할일 삭제', () => {
    it('should delete task successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.studyTask.findUnique.mockResolvedValue(mockTask);
      prisma.$transaction.mockResolvedValue([{}, mockTask]);
      prisma.studyTask.delete.mockResolvedValue(mockTask);

      const request = new Request('http://localhost:3000/api/studies/study1/tasks/task1', {
        method: 'DELETE',
      });

      const context = {
        params: Promise.resolve({ id: 'study1', taskId: 'task1' }),
      };

      const response = await DELETE(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should throw exception when not admin', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      // 다른 사용자가 만든 태스크
      const otherUserTask = { ...mockTask, createdById: 'user2' };
      prisma.studyTask.findUnique.mockResolvedValue(otherUserTask);

      const request = new Request('http://localhost:3000/api/studies/study1/tasks/task1', {
        method: 'DELETE',
      });

      const context = {
        params: Promise.resolve({ id: 'study1', taskId: 'task1' }),
      };

      const response = await DELETE(request, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });
});

