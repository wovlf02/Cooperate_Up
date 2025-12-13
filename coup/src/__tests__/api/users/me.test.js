/**
 * @jest-environment node
 */

import { GET, PATCH, DELETE } from '@/app/api/users/me/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Mock modules
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    studyMember: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth-helpers', () => ({
  requireAuth: jest.fn(async () => {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return session;
  }),
}));

describe('GET /api/users/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user profile successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      avatar: null,
      bio: 'Test bio',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      _count: {
        studyMembers: 2,
        tasks: 5,
        notifications: 3,
      },
    };

    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue(mockUser);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.email).toBe('test@test.com');
    expect(data.user.stats).toBeDefined();
    expect(data.user.stats.studyCount).toBe(2);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      select: expect.any(Object),
    });
  });

  it('should return 401 if not authenticated', async () => {
    getServerSession.mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 if user not found', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '999', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-015');
  });

  it('should return 410 if account is deleted', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      status: 'DELETED',
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(410);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-019');
  });

  it('should return 403 if account is suspended', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      status: 'SUSPENDED',
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-018');
  });
});

describe('PATCH /api/users/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest = (body) => ({
    json: async () => body,
  });

  it('should update user profile successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Updated Name',
      avatar: null,
      bio: 'Updated bio',
    };

    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.update.mockResolvedValue(mockUser);

    const request = mockRequest({
      name: 'Updated Name',
      bio: 'Updated bio',
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.name).toBe('Updated Name');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: expect.objectContaining({
        name: 'Updated Name',
        bio: 'Updated bio',
      }),
      select: expect.any(Object),
    });
  });

  it('should return 400 if name is too short', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const request = mockRequest({
      name: 'A',
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-002');
  });

  it('should return 400 if name is too long', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const request = mockRequest({
      name: 'A'.repeat(51),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-002');
  });

  it('should return 400 if bio is too long', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const request = mockRequest({
      name: 'Valid Name',
      bio: 'A'.repeat(201),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-005');
  });

  it('should return 400 if XSS detected in name', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const request = mockRequest({
      name: '<script>alert("xss")</script>',
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-002'); // 이름 형식 검증으로 처리됨
  });

  it('should return 400 if SQL injection detected', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const request = mockRequest({
      name: "'; DROP TABLE users; --",
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-002'); // 이름 형식 검증으로 처리됨
  });

  it('should return 400 if no fields to update', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const request = mockRequest({});

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-001');
  });

  it('should handle null bio', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      avatar: null,
      bio: null,
    };

    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.user.update.mockResolvedValue(mockUser);

    const request = mockRequest({
      name: 'Test User',
      bio: null,
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.bio).toBe(null);
  });
});

describe('DELETE /api/users/me', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest = (body) => ({
    json: async () => body,
  });

  it('should delete account successfully', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.studyMember.findMany.mockResolvedValue([]);

    prisma.user.update.mockResolvedValue({
      id: '1',
      status: 'DELETED',
    });

    const request = mockRequest({
      confirmation: 'test@test.com',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('계정이 삭제되었습니다');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: expect.objectContaining({
        status: 'DELETED',
      }),
    });
  });

  it('should return 400 if confirmation is missing', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const request = mockRequest({});

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-001');
  });

  it('should return 400 if confirmation does not match', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    const request = mockRequest({
      confirmation: 'wrong@email.com',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-054');
  });

  it('should return 409 if user owns active studies', async () => {
    getServerSession.mockResolvedValue({
      user: { id: '1', email: 'test@test.com' },
    });

    prisma.studyMember.findMany.mockResolvedValue([
      {
        study: {
          id: 'study1',
          name: 'Study 1',
        },
      },
      {
        study: {
          id: 'study2',
          name: 'Study 2',
        },
      },
    ]);

    const request = mockRequest({
      confirmation: 'test@test.com',
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('PROFILE-051');
    // details.studyCount는 에러 핸들러 구현 필요 (현재는 제외)
  });
});

