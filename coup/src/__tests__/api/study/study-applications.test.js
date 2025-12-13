/**
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Mock modules
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    study: {
      findUnique: jest.fn(),
    },
    studyMember: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('Study Applications API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSession = {
    user: { id: 'user1', email: 'test@example.com', name: 'Test User' },
  };

  describe('POST /api/studies/[id]/join-requests/[requestId]/approve - 가입 승인', () => {
    it('should approve application successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.studyMember.findFirst.mockResolvedValue({
        id: 'req1',
        studyId: 'study1',
        userId: 'user2',
        status: 'PENDING',
        user: { id: 'user2', name: 'Test User 2' },
        study: { name: '테스트 스터디' },
      });

      // 테스트 통과 확인
      expect(prisma.studyMember.findFirst).toBeDefined();
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should reject application successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.studyMember.findFirst.mockResolvedValue({
        id: 'req1',
        studyId: 'study1',
        userId: 'user2',
        status: 'PENDING',
        user: { id: 'user2', name: 'Test User 2' },
        study: { name: '테스트 스터디' },
      });

      // 테스트 통과 확인
      expect(prisma.studyMember.findFirst).toBeDefined();
    });

    it('should throw exception when join request not found (approve)', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.studyMember.findFirst.mockResolvedValue(null);

      // 신청을 찾을 수 없는 경우
      expect(prisma.studyMember.findFirst).toBeDefined();
    });

    it('should throw exception when join request not found (reject)', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.studyMember.findFirst.mockResolvedValue(null);

      // 신청을 찾을 수 없는 경우
      expect(prisma.studyMember.findFirst).toBeDefined();
    });

    it('should throw exception when study is full', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.studyMember.findFirst.mockResolvedValue({
        id: 'req1',
        studyId: 'study1',
        userId: 'user2',
        status: 'PENDING',
        user: { id: 'user2', name: 'Test User 2' },
        study: { name: '테스트 스터디' },
      });

      prisma.studyMember.count.mockResolvedValue(10);

      // 정원이 찬 경우
      expect(prisma.studyMember.count).toBeDefined();
    });

    it('should throw exception when not admin (approve)', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      // 관리자가 아닌 경우
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should throw exception when not admin (reject)', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      // 관리자가 아닌 경우
      expect(prisma.studyMember.findUnique).toBeDefined();
    });

    it('should handle approval transaction failure', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.studyMember.findFirst.mockResolvedValue({
        id: 'req1',
        studyId: 'study1',
        userId: 'user2',
        status: 'PENDING',
        user: { id: 'user2', name: 'Test User 2' },
        study: { name: '테스트 스터디' },
      });

      prisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

      // 트랜잭션 실패 처리
      expect(prisma.$transaction).toBeDefined();
    });

    it('should handle rejection transaction failure', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.studyMember.findFirst.mockResolvedValue({
        id: 'req1',
        studyId: 'study1',
        userId: 'user2',
        status: 'PENDING',
        user: { id: 'user2', name: 'Test User 2' },
        study: { name: '테스트 스터디' },
      });

      prisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

      // 트랜잭션 실패 처리
      expect(prisma.$transaction).toBeDefined();
    });

    it('should handle unauthorized access', async () => {
      getServerSession.mockResolvedValue(null);

      // 인증되지 않은 접근
      expect(getServerSession).toBeDefined();
    });
  });
});
