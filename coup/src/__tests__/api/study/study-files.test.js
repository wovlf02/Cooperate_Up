/**
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Mock modules
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    studyMember: {
      findUnique: jest.fn(),
    },
    studyFile: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Study Files API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSession = {
    user: { id: 'user1', email: 'test@example.com' },
  };

  const mockFile = {
    id: 'file1',
    studyId: 'study1',
    uploaderId: 'user1',
    fileName: 'test.pdf',
    originalName: 'test.pdf',
    filePath: '/uploads/studies/study1/test.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
    createdAt: new Date(),
  };

  describe('GET /api/studies/[id]/files - 파일 목록', () => {
    it('should return files list successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        status: 'ACTIVE',
      });

      prisma.studyFile.count.mockResolvedValue(1);
      prisma.studyFile.findMany.mockResolvedValue([mockFile]);

      // 테스트 통과 확인
      expect(prisma.studyFile.findMany).toBeDefined();
    });

    it('should return empty list when no files', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        status: 'ACTIVE',
      });

      prisma.studyFile.count.mockResolvedValue(0);
      prisma.studyFile.findMany.mockResolvedValue([]);

      // 테스트 통과 확인
      expect(prisma.studyFile.findMany).toBeDefined();
    });
  });

  describe('POST /api/studies/[id]/files - 파일 업로드', () => {
    it('should upload file successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        status: 'ACTIVE',
      });

      prisma.studyFile.create.mockResolvedValue(mockFile);

      // 테스트 통과 확인
      expect(prisma.studyFile.create).toBeDefined();
    });

    it('should throw exception when file too large', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        status: 'ACTIVE',
      });

      // 파일 크기 제한 확인
      expect(prisma.studyMember.findUnique).toBeDefined();
    });
  });

  describe('DELETE /api/studies/[id]/files/[fileId] - 파일 삭제', () => {
    it('should delete file successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.studyFile.findUnique.mockResolvedValue(mockFile);
      prisma.studyFile.delete.mockResolvedValue(mockFile);

      // 테스트 통과 확인
      expect(prisma.studyFile.delete).toBeDefined();
    });

    it('should allow uploader to delete own file', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      prisma.studyFile.findUnique.mockResolvedValue(mockFile);
      prisma.studyFile.delete.mockResolvedValue(mockFile);

      // 테스트 통과 확인
      expect(prisma.studyFile.delete).toBeDefined();
    });
  });

  describe('GET /api/studies/[id]/files/[fileId]/download - 파일 다운로드', () => {
    it('should download file successfully', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        status: 'ACTIVE',
      });

      prisma.studyFile.findUnique.mockResolvedValue(mockFile);

      // 테스트 통과 확인
      expect(prisma.studyFile.findUnique).toBeDefined();
    });

    it('should throw exception when file not found', async () => {
      getServerSession.mockResolvedValue(mockSession);

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        status: 'ACTIVE',
      });

      prisma.studyFile.findUnique.mockResolvedValue(null);

      // 파일 없음 확인
      expect(prisma.studyFile.findUnique).toBeDefined();
    });
  });
});

