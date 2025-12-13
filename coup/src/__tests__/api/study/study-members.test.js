/**
 * @jest-environment node
 */

import { GET, POST, DELETE } from '@/app/api/studies/[id]/members/route';
import { PATCH } from '@/app/api/studies/[id]/members/[userId]/role/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { StudyMemberException, StudyPermissionException } from '@/lib/exceptions/study';

// Mock modules
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    study: {
      findUnique: jest.fn(),
    },
    studyMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
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
  requireStudyMember: jest.fn(async (studyId, requiredRole) => {
    const { getServerSession } = require('next-auth');
    const { prisma } = require('@/lib/prisma');

    const session = await getServerSession();
    if (!session) {
      const { NextResponse } = require('next/server');
      return NextResponse.json(
        { error: 'Unauthorized', message: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const member = await prisma.studyMember.findUnique({
      where: {
        userId_studyId: {
          userId: session.user.id,
          studyId,
        },
      },
    });

    if (!member) {
      const { NextResponse } = require('next/server');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STUDY-002',
            message: 'Not a study member'
          }
        },
        { status: 403 }
      );
    }

    // 권한 체크
    if (requiredRole === 'ADMIN' && member.role === 'MEMBER') {
      const { NextResponse } = require('next/server');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STUDY-003',
            message: 'Insufficient permissions'
          }
        },
        { status: 403 }
      );
    }

    return { session, member };
  }),
}));

describe('GET /api/studies/[id]/members - 멤버 목록 조회', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMembers = [
    {
      id: 'member1',
      userId: 'user1',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: new Date(),
      user: {
        id: 'user1',
        name: 'Test Owner',
        avatar: null,
      },
    },
    {
      id: 'member2',
      userId: 'user2',
      studyId: 'study1',
      role: 'MEMBER',
      status: 'ACTIVE',
      joinedAt: new Date(),
      user: {
        id: 'user2',
        name: 'Test Member',
        avatar: null,
      },
    },
  ];

  it('should return member list successfully', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user1',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    prisma.studyMember.count.mockResolvedValue(2);
    prisma.studyMember.findMany.mockResolvedValue(mockMembers);

    const request = new Request('http://localhost:3000/api/studies/study1/members');
    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].role).toBe('OWNER');
  });

  it('should filter by role', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user1',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    prisma.studyMember.count.mockResolvedValue(1);
    prisma.studyMember.findMany.mockResolvedValue([mockMembers[0]]);

    const request = new Request('http://localhost:3000/api/studies/study1/members?role=OWNER');
    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.studyMember.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: 'OWNER',
        }),
      })
    );
  });

  it('should throw exception when not a member', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user3', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/studies/study1/members');
    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });
});

describe('POST /api/studies/[id]/members - 멤버 초대', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add member successfully', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce({
      userId: 'user1',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    prisma.study.findUnique.mockResolvedValue({
      id: 'study1',
      maxMembers: 10,
      _count: { members: 5 },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: 'user2',
      email: 'newmember@example.com',
      name: 'New Member',
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce(null);

    prisma.studyMember.create.mockResolvedValue({
      id: 'member3',
      userId: 'user2',
      studyId: 'study1',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    const request = new Request('http://localhost:3000/api/studies/study1/members', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user2',
        role: 'MEMBER',
      }),
    });

    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await POST(request, context);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.userId).toBe('user2');
  });

  it('should throw exception when not admin', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user2', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user2',
      studyId: 'study1',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    const request = new Request('http://localhost:3000/api/studies/study1/members', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user3',
        role: 'MEMBER',
      }),
    });

    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await POST(request, context);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });

  it('should throw exception when study is full', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user1',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    prisma.study.findUnique.mockResolvedValue({
      id: 'study1',
      maxMembers: 5,
      _count: { members: 5 },
    });

    const request = new Request('http://localhost:3000/api/studies/study1/members', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user2',
        role: 'MEMBER',
      }),
    });

    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await POST(request, context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should throw exception when user already member', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce({
      userId: 'user1',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    prisma.study.findUnique.mockResolvedValue({
      id: 'study1',
      maxMembers: 10,
      _count: { members: 5 },
    });

    prisma.user.findUnique.mockResolvedValue({
      id: 'user2',
      email: 'member@example.com',
      name: 'Existing Member',
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce({
      userId: 'user2',
      studyId: 'study1',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    const request = new Request('http://localhost:3000/api/studies/study1/members', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user2',
        role: 'MEMBER',
      }),
    });

    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await POST(request, context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

describe('DELETE /api/studies/[id]/members - 멤버 제거', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove member successfully', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce({
      userId: 'user1',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce({
      userId: 'user2',
      studyId: 'study1',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    prisma.studyMember.delete.mockResolvedValue({
      id: 'member2',
      userId: 'user2',
      studyId: 'study1',
    });

    const request = new Request('http://localhost:3000/api/studies/study1/members?userId=user2', {
      method: 'DELETE',
    });

    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await DELETE(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should throw exception when trying to remove owner', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce({
      userId: 'user1',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce({
      userId: 'user2',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    const request = new Request('http://localhost:3000/api/studies/study1/members?userId=user2', {
      method: 'DELETE',
    });

    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await DELETE(request, context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should throw exception when not admin', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user2', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user2',
      studyId: 'study1',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    const request = new Request('http://localhost:3000/api/studies/study1/members?userId=user3', {
      method: 'DELETE',
    });

    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await DELETE(request, context);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });

  it('should throw exception when member not found', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce({
      userId: 'user1',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce(null);

    const request = new Request('http://localhost:3000/api/studies/study1/members?userId=user999', {
      method: 'DELETE',
    });

    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await DELETE(request, context);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });
});

describe('PATCH /api/studies/[id]/members/[userId]/role - 역할 변경', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should change member role successfully', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce({
      userId: 'user1',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce({
      userId: 'user2',
      studyId: 'study1',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    prisma.studyMember.update.mockResolvedValue({
      userId: 'user2',
      studyId: 'study1',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    const request = new Request('http://localhost:3000/api/studies/study1/members/user2/role', {
      method: 'PATCH',
      body: JSON.stringify({
        role: 'ADMIN',
      }),
    });

    const context = {
      params: Promise.resolve({ id: 'study1', userId: 'user2' }),
    };

    const response = await PATCH(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.role).toBe('ADMIN');
  });

  it('should throw exception when not owner', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user2', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user2',
      studyId: 'study1',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    const request = new Request('http://localhost:3000/api/studies/study1/members/user3/role', {
      method: 'PATCH',
      body: JSON.stringify({
        role: 'ADMIN',
      }),
    });

    const context = {
      params: Promise.resolve({ id: 'study1', userId: 'user3' }),
    };

    const response = await PATCH(request, context);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });

  it('should throw exception when invalid role', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user1',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    const request = new Request('http://localhost:3000/api/studies/study1/members/user2/role', {
      method: 'PATCH',
      body: JSON.stringify({
        role: 'INVALID',
      }),
    });

    const context = {
      params: Promise.resolve({ id: 'study1', userId: 'user2' }),
    };

    const response = await PATCH(request, context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should throw exception when trying to change owner role', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce({
      userId: 'user1',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    prisma.studyMember.findUnique.mockResolvedValueOnce({
      userId: 'user2',
      studyId: 'study1',
      role: 'OWNER',
      status: 'ACTIVE',
    });

    const request = new Request('http://localhost:3000/api/studies/study1/members/user2/role', {
      method: 'PATCH',
      body: JSON.stringify({
        role: 'ADMIN',
      }),
    });

    const context = {
      params: Promise.resolve({ id: 'study1', userId: 'user2' }),
    };

    const response = await PATCH(request, context);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

