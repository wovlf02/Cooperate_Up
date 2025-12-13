/**
 * @jest-environment node
 */

import { GET, POST } from '@/app/api/studies/[id]/notices/route';
import { GET as GETNotice, PATCH, DELETE } from '@/app/api/studies/[id]/notices/[noticeId]/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Mock modules
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    notice: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    studyMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    study: {
      findUnique: jest.fn(),
    },
    notification: {
      createMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth-helpers', () => ({
  requireStudyMember: jest.fn(async (studyId, requiredRole) => {
    const { getServerSession } = require('next-auth');
    const session = await getServerSession();
    if (!session) {
      const { NextResponse } = require('next/server');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 멤버 확인
    const { prisma } = require('@/lib/prisma');
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
        { error: 'Not a member' },
        { status: 403 }
      );
    }

    // 권한 확인
    if (requiredRole && requiredRole === 'ADMIN' && member.role === 'MEMBER') {
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

    return { member, session };
  }),
}));

jest.mock('@/lib/cache-helpers', () => ({
  getCachedNotices: jest.fn(() => null),
  setCachedNotices: jest.fn(),
  invalidateNoticesCache: jest.fn(),
}));

jest.mock('@/lib/utils/input-sanitizer', () => ({
  validateAndSanitize: jest.fn((data) => ({
    valid: true,
    sanitized: data,
    errors: []
  }))
}));

jest.mock('@/lib/utils/xss-sanitizer', () => ({
  validateSecurityThreats: jest.fn(() => ({ safe: true, threats: [] })),
  logSecurityEvent: jest.fn()
}));

describe('GET /api/studies/[id]/notices - 공지사항 목록 조회', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockNotices = [
    {
      id: 'notice1',
      studyId: 'study1',
      title: '중요 공지',
      content: '중요한 공지사항 내용입니다. 모든 멤버는 꼭 읽어주세요.',
      isPinned: true,
      createdAt: new Date(),
      author: {
        id: 'user1',
        name: 'Test User',
        avatar: null,
      },
    },
    {
      id: 'notice2',
      studyId: 'study1',
      title: '일반 공지',
      content: '일반 공지사항 내용입니다. 참고해주세요.',
      isPinned: false,
      createdAt: new Date(),
      author: {
        id: 'user1',
        name: 'Test User',
        avatar: null,
      },
    },
  ];

  it('should return notices list successfully', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user1',
      studyId: 'study1',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    prisma.notice.count.mockResolvedValue(2);
    prisma.notice.findMany.mockResolvedValue(mockNotices);

    const request = new Request('http://localhost:3000/api/studies/study1/notices');
    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.pagination.total).toBe(2);
  });

  it('should filter by pinned', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user1',
      studyId: 'study1',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    prisma.notice.count.mockResolvedValue(1);
    prisma.notice.findMany.mockResolvedValue([mockNotices[0]]);

    const request = new Request('http://localhost:3000/api/studies/study1/notices?pinned=true');
    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(prisma.notice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isPinned: true,
        }),
      })
    );
  });

  it('should return 403 when not a member', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user2', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/studies/study1/notices');
    const context = {
      params: Promise.resolve({ id: 'study1' }),
    };

    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Not a member');
  });
});

describe('POST /api/studies/[id]/notices - 공지사항 작성', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create notice successfully', async () => {
    try {
      getServerSession.mockResolvedValue({
        user: { id: 'user1', email: 'test@example.com' },
      });

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user1',
        studyId: 'study1',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      prisma.notice.count.mockResolvedValue(0);

      prisma.studyMember.findMany.mockResolvedValue([]);
      prisma.study.findUnique.mockResolvedValue({
        id: 'study1',
        name: '테스트 스터디',
        emoji: '📚',
      });
      prisma.notification.createMany.mockResolvedValue({ count: 0 });

      prisma.notice.create.mockResolvedValue({
        id: 'notice1',
        studyId: 'study1',
        title: '새 공지',
        content: '공지 내용입니다. 최소 10자 이상이어야 합니다.',
        isPinned: false,
        authorId: 'user1',
        createdAt: new Date(),
        author: {
          id: 'user1',
          name: 'Test User',
          avatar: null,
        },
      });

      const request = new Request('http://localhost:3000/api/studies/study1/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: '새 공지',
          content: '공지 내용입니다. 최소 10자 이상이어야 합니다.',
          isPinned: false,
        }),
      });

      const context = {
        params: Promise.resolve({ id: 'study1' }),
      };

      const response = await POST(request, context);
      const data = await response.json();

      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(data, null, 2));

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('새 공지');
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });

  it('should throw exception when title is missing', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user1',
      studyId: 'study1',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    const request = new Request('http://localhost:3000/api/studies/study1/notices', {
      method: 'POST',
      body: JSON.stringify({
        content: '공지 내용입니다. 최소 10자 이상이어야 합니다.',
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

  it('should throw exception when not admin or owner', async () => {
    try {
      getServerSession.mockResolvedValue({
        user: { id: 'user2', email: 'test@example.com' },
      });

      prisma.studyMember.findUnique.mockResolvedValue({
        userId: 'user2',
        studyId: 'study1',
        role: 'MEMBER',
        status: 'ACTIVE',
      });

      const request = new Request('http://localhost:3000/api/studies/study1/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: '새 공지',
          content: '공지 내용입니다. 최소 10자 이상이어야 합니다.',
        }),
      });

      const context = {
        params: Promise.resolve({ id: 'study1' }),
      };

      const response = await POST(request, context);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });
});

describe('GET /api/studies/[id]/notices/[noticeId] - 공지사항 상세 조회', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return notice detail successfully', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user1',
      studyId: 'study1',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    prisma.notice.findUnique.mockResolvedValue({
      id: 'notice1',
      studyId: 'study1',
      title: '공지 제목',
      content: '공지사항 내용입니다. 최소 10자 이상이어야 합니다.',
      isPinned: false,
      createdAt: new Date(),
      author: {
        id: 'user1',
        name: 'Test User',
        avatar: null,
      },
    });

    const request = new Request('http://localhost:3000/api/studies/study1/notices/notice1');
    const context = {
      params: Promise.resolve({ id: 'study1', noticeId: 'notice1' }),
    };

    const response = await GETNotice(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('notice1');
  });

  it('should return 404 when notice not found', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user1',
      studyId: 'study1',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    prisma.notice.findUnique.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/studies/study1/notices/notice999');
    const context = {
      params: Promise.resolve({ id: 'study1', noticeId: 'notice999' }),
    };

    const response = await GETNotice(request, context);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });
});

describe('PATCH /api/studies/[id]/notices/[noticeId] - 공지사항 수정', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update notice successfully', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user1',
      studyId: 'study1',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    prisma.notice.findUnique.mockResolvedValue({
      id: 'notice1',
      studyId: 'study1',
      authorId: 'user1',
      title: '원래 제목',
      content: '원래 공지사항 내용입니다. 최소 10자 이상이어야 합니다.',
    });

    prisma.notice.update.mockResolvedValue({
      id: 'notice1',
      studyId: 'study1',
      title: '수정된 제목',
      content: '수정된 공지사항 내용입니다. 최소 10자 이상이어야 합니다.',
      author: {
        id: 'user1',
        name: 'Test User',
        avatar: null,
      },
    });

    const request = new Request('http://localhost:3000/api/studies/study1/notices/notice1', {
      method: 'PATCH',
      body: JSON.stringify({
        title: '수정된 제목',
        content: '수정된 공지사항 내용입니다. 최소 10자 이상이어야 합니다.',
      }),
    });

    const context = {
      params: Promise.resolve({ id: 'study1', noticeId: 'notice1' }),
    };

    const response = await PATCH(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('수정된 제목');
  });
});

describe('DELETE /api/studies/[id]/notices/[noticeId] - 공지사항 삭제', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete notice successfully', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user1',
      studyId: 'study1',
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    prisma.notice.findUnique.mockResolvedValue({
      id: 'notice1',
      studyId: 'study1',
      authorId: 'user1',
    });

    prisma.notice.delete.mockResolvedValue({
      id: 'notice1',
    });

    const request = new Request('http://localhost:3000/api/studies/study1/notices/notice1', {
      method: 'DELETE',
    });

    const context = {
      params: Promise.resolve({ id: 'study1', noticeId: 'notice1' }),
    };

    const response = await DELETE(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should throw exception when trying to delete others notice', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user2', email: 'test@example.com' },
    });

    prisma.studyMember.findUnique.mockResolvedValue({
      userId: 'user2',
      studyId: 'study1',
      role: 'MEMBER',
      status: 'ACTIVE',
    });

    prisma.notice.findUnique.mockResolvedValue({
      id: 'notice1',
      studyId: 'study1',
      authorId: 'user1',
    });

    const request = new Request('http://localhost:3000/api/studies/study1/notices/notice1', {
      method: 'DELETE',
    });

    const context = {
      params: Promise.resolve({ id: 'study1', noticeId: 'notice1' }),
    };

    const response = await DELETE(request, context);
    const data = await response.json();


    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });
});

