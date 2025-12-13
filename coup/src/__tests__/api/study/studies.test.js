/**
 * @jest-environment node
 */

import { GET, POST } from '@/app/api/studies/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { StudyValidationException } from '@/lib/exceptions/study';

// Mock modules
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    study: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    studyMember: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/auth-helpers', () => ({
  requireAuth: jest.fn(async () => {
    const { getServerSession } = require('next-auth');
    const session = await getServerSession();
    if (!session) {
      const { NextResponse } = require('next/server');
      return NextResponse.json(
        { error: 'Unauthorized', message: '로그인이 필요합니다' },
        { status: 401 }
      );
    }
    return session;
  }),
}));

describe('GET /api/studies - 스터디 목록 조회', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStudies = [
    {
      id: 'study1',
      name: '알고리즘 스터디',
      emoji: '💻',
      description: '매주 알고리즘 문제를 풉니다',
      category: 'programming',
      subCategory: 'algorithm',
      tags: ['algorithm', 'coding'],
      maxMembers: 10,
      isRecruiting: true,
      rating: 4.5,
      reviewCount: 5,
      owner: {
        id: 'user1',
        name: 'Test User',
        avatar: null,
      },
      _count: { members: 5 },
      createdAt: new Date(),
    },
  ];

  it('should return study list successfully', async () => {
    prisma.study.count.mockResolvedValue(1);
    prisma.study.findMany.mockResolvedValue(mockStudies);

    const request = new Request('http://localhost:3000/api/studies');
    const response = await GET(request, {});
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].name).toBe('알고리즘 스터디');
    expect(data.pagination.total).toBe(1);
  });

  it('should filter by category', async () => {
    prisma.study.count.mockResolvedValue(1);
    prisma.study.findMany.mockResolvedValue(mockStudies);

    const request = new Request('http://localhost:3000/api/studies?category=programming');
    const response = await GET(request, {});
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.study.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: 'programming',
        }),
      })
    );
  });

  it('should filter by search keyword', async () => {
    prisma.study.count.mockResolvedValue(1);
    prisma.study.findMany.mockResolvedValue(mockStudies);

    const request = new Request('http://localhost:3000/api/studies?search=알고리즘');
    const response = await GET(request, {});
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.study.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.any(Array),
        }),
      })
    );
  });
});

describe('POST /api/studies - 스터디 생성', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validStudyData = {
    name: '새로운 스터디',
    description: '새로운 스터디입니다. 최소 10자 이상의 설명이 필요합니다.',
    category: 'programming',
    maxMembers: 10,
  };

  it('should create study successfully', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.study.findFirst.mockResolvedValue(null);

    const mockStudy = {
      id: 'study1',
      ...validStudyData,
      ownerId: 'user1',
      owner: {
        id: 'user1',
        name: 'Test User',
        avatar: null,
      },
    };

    prisma.$transaction.mockImplementation(async (callback) => {
      return await callback({
        study: {
          create: jest.fn().mockResolvedValue(mockStudy),
        },
        studyMember: {
          create: jest.fn().mockResolvedValue({}),
        },
      });
    });

    const request = new Request('http://localhost:3000/api/studies', {
      method: 'POST',
      body: JSON.stringify(validStudyData),
    });

    const response = await POST(request, {});
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('새로운 스터디');
  });

  it('should throw exception when name is missing', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    const invalidData = { ...validStudyData, name: '' };

    const request = new Request('http://localhost:3000/api/studies', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request, {});
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toContain('STUDY');
  });

  it('should throw exception when description is too short', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    const invalidData = { ...validStudyData, description: '짧음' };

    const request = new Request('http://localhost:3000/api/studies', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request, {});
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toContain('STUDY');
  });

  it('should throw exception when category is invalid', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    const invalidData = { ...validStudyData, category: 'invalid' };

    const request = new Request('http://localhost:3000/api/studies', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request, {});
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toContain('STUDY');
  });

  it('should throw exception when maxMembers is invalid', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    const invalidData = { ...validStudyData, maxMembers: 1 };

    const request = new Request('http://localhost:3000/api/studies', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request, {});
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toContain('STUDY');
  });

  it('should throw exception when duplicate study name', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.study.findFirst.mockResolvedValue({
      id: 'existing',
      name: '새로운 스터디',
      ownerId: 'user1',
    });

    const request = new Request('http://localhost:3000/api/studies', {
      method: 'POST',
      body: JSON.stringify(validStudyData),
    });

    const response = await POST(request, {});
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error.code).toContain('STUDY');
  });

  it('should create study with optional fields', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.study.findFirst.mockResolvedValue(null);

    const dataWithOptional = {
      ...validStudyData,
      imageUrl: 'https://example.com/image.jpg',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    };

    const mockStudy = {
      id: 'study1',
      ...dataWithOptional,
      ownerId: 'user1',
      owner: {
        id: 'user1',
        name: 'Test User',
        avatar: null,
      },
    };

    prisma.$transaction.mockImplementation(async (callback) => {
      return await callback({
        study: {
          create: jest.fn().mockResolvedValue(mockStudy),
        },
        studyMember: {
          create: jest.fn().mockResolvedValue({}),
        },
      });
    });

    const request = new Request('http://localhost:3000/api/studies', {
      method: 'POST',
      body: JSON.stringify(dataWithOptional),
    });

    const response = await POST(request, {});
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });

  it('should return 401 when not authenticated', async () => {
    getServerSession.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/studies', {
      method: 'POST',
      body: JSON.stringify(validStudyData),
    });

    const response = await POST(request, {});
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});

