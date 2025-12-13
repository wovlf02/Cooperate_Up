/**
 * @jest-environment node
 */

import { POST as JOIN } from '@/app/api/groups/[id]/join/route';
import { POST as LEAVE } from '@/app/api/groups/[id]/leave/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import * as groupHelpers from '@/lib/helpers/group-helpers';

// Mock modules
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(prisma)),
    group: {
      findUnique: jest.fn(),
    },
    groupMember: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    groupInvite: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/helpers/group-helpers', () => ({
  ...jest.requireActual('@/lib/helpers/group-helpers'),
  checkGroupExists: jest.fn(),
  checkKickedHistory: jest.fn(),
  checkGroupCapacity: jest.fn(),
  checkGroupMembership: jest.fn(),
}));

describe('POST /api/groups/[id]/join - 그룹 가입', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: 'user-1', name: 'Test User' }
    });
  });

  it('should join public group immediately', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '공개 그룹',
      isPublic: true,
      isRecruiting: true,
      maxMembers: 50,
      deletedAt: null,
      _count: { members: 10 }
    };

    const mockNewMember = {
      id: 'member-new',
      groupId: 'group-1',
      userId: 'user-1',
      role: 'MEMBER',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupExists.mockResolvedValue(mockGroup);
    groupHelpers.checkKickedHistory.mockResolvedValue(undefined);
    groupHelpers.checkGroupCapacity.mockResolvedValue(undefined);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(null); // 기존 멤버 아님
    prisma.groupMember.findFirst.mockResolvedValue(null); // 강퇴 이력 없음
    prisma.groupMember.count.mockResolvedValue(10); // 정원 체크
    prisma.groupMember.create.mockResolvedValue(mockNewMember);
    prisma.$transaction.mockImplementation(async (callback) => {
      return await callback(prisma);
    });

    const request = new Request('http://localhost/api/groups/group-1/join', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await JOIN(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('ACTIVE');
    expect(data.message).toContain('가입');
  });

  it('should require invite code for private group', async () => {
    // 비공개 그룹은 초대 코드 없이 가입 불가 (API 설계)
    const mockGroup = {
      id: 'group-1',
      name: '비공개 그룹',
      isPublic: false,
      isRecruiting: true,
      maxMembers: 50,
      deletedAt: null,
      _count: { members: 10 }
    };

    groupHelpers.checkGroupExists.mockResolvedValue(mockGroup);
    prisma.group.findUnique.mockResolvedValue(mockGroup);

    const request = new Request('http://localhost/api/groups/group-1/join', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await JOIN(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    // 비공개 그룹은 초대 코드 필수이므로 403 반환
    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });

  it('should join with invite code', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '비공개 그룹',
      isPublic: false,
      maxMembers: 50,
      deletedAt: null,
      _count: { members: 10 }
    };

    const mockInvite = {
      id: 'invite-1',
      groupId: 'group-1',
      code: 'ABC123DEF456',
      status: 'PENDING',
      expiresAt: new Date('2025-12-31')
    };

    const mockNewMember = {
      id: 'member-new',
      groupId: 'group-1',
      userId: 'user-1',
      role: 'MEMBER',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupExists.mockResolvedValue(mockGroup);
    groupHelpers.checkKickedHistory.mockResolvedValue(undefined);
    groupHelpers.checkGroupCapacity.mockResolvedValue(undefined);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(null);
    prisma.groupMember.findFirst.mockResolvedValue(null);
    prisma.groupMember.count.mockResolvedValue(10);
    prisma.groupInvite.findFirst.mockResolvedValue(mockInvite); // findFirst mock 추가
    prisma.groupMember.create.mockResolvedValue(mockNewMember);
    prisma.groupInvite.update.mockResolvedValue({
      ...mockInvite,
      status: 'ACCEPTED'
    });
    prisma.$transaction.mockImplementation(async (callback) => {
      return await callback(prisma);
    });

    const request = new Request('http://localhost/api/groups/group-1/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode: 'ABC123DEF456' })
    });

    const response = await JOIN(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('ACTIVE');
  });
});

describe('POST /api/groups/[id]/leave - 그룹 탈퇴', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: 'user-1', name: 'Test User' }
    });
  });

  it('should leave group as regular member', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '테스트 그룹',
      deletedAt: null
    };

    const mockMember = {
      id: 'member-1',
      groupId: 'group-1',
      userId: 'user-1',
      role: 'MEMBER',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupMembership.mockResolvedValue(mockMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockMember);
    prisma.groupMember.update.mockResolvedValue({
      ...mockMember,
      status: 'LEFT',
      leftAt: new Date()
    });
    prisma.$transaction.mockImplementation(async (callback) => {
      return await callback(prisma);
    });

    const request = new Request('http://localhost/api/groups/group-1/leave', {
      method: 'POST'
    });

    const response = await LEAVE(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('탈퇴');
  });

  it('should prevent OWNER from leaving without successor', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '테스트 그룹',
      deletedAt: null
    };

    const mockOwner = {
      id: 'member-1',
      groupId: 'group-1',
      userId: 'user-1',
      role: 'OWNER',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupMembership.mockResolvedValue(mockOwner);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockOwner);
    prisma.groupMember.count.mockResolvedValue(0); // 다른 ADMIN 없음

    const request = new Request('http://localhost/api/groups/group-1/leave', {
      method: 'POST'
    });

    const response = await LEAVE(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('OWNER'); // "OWNER는 탈퇴할 수 없습니다" 메시지 확인
  });
});
