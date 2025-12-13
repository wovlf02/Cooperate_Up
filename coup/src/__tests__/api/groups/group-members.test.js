/**
 * @jest-environment node
 */

import { GET, POST, DELETE } from '@/app/api/groups/[id]/members/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import * as groupHelpers from '@/lib/helpers/group-helpers';

// Mock modules
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    group: {
      findUnique: jest.fn(),
    },
    groupMember: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/helpers/group-helpers', () => ({
  ...jest.requireActual('@/lib/helpers/group-helpers'),
  checkGroupMembership: jest.fn(),
  checkGroupPermission: jest.fn(),
  canManageMember: jest.fn(),
}));

describe('GET /api/groups/[id]/members - 멤버 목록 조회', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: 'user-1', name: 'Test User' }
    });
  });

  it('should return members list successfully', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '테스트 그룹',
      deletedAt: null
    };

    const mockMembers = [
      {
        id: 'member-1',
        userId: 'user-1',
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: new Date('2025-12-01'),
        user: {
          id: 'user-1',
          name: 'Owner User',
          email: 'owner@test.com'
        }
      },
      {
        id: 'member-2',
        userId: 'user-2',
        role: 'MEMBER',
        status: 'ACTIVE',
        joinedAt: new Date('2025-12-02'),
        user: {
          id: 'user-2',
          name: 'Member User',
          email: 'member@test.com'
        }
      }
    ];

    groupHelpers.checkGroupMembership.mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
      status: 'ACTIVE'
    });
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findMany.mockResolvedValue(mockMembers);
    prisma.groupMember.count.mockResolvedValue(2);

    const request = new Request('http://localhost/api/groups/group-1/members');
    const response = await GET(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].role).toBe('OWNER');
  });

  it('should filter by role', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    groupHelpers.checkGroupMembership.mockResolvedValue({
      id: 'member-1',
      role: 'MEMBER',
      status: 'ACTIVE'
    });
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findMany.mockResolvedValue([]);
    prisma.groupMember.count.mockResolvedValue(0);

    const request = new Request('http://localhost/api/groups/group-1/members?role=ADMIN');
    const response = await GET(request, { params: Promise.resolve({ id: 'group-1' }) });

    expect(response.status).toBe(200);
    expect(prisma.groupMember.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: 'ADMIN'
        })
      })
    );
  });
});

describe('POST /api/groups/[id]/members - 멤버 추가', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: 'admin-1', name: 'Admin User' }
    });
  });

  it('should add member with ADMIN permission', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '테스트 그룹',
      maxMembers: 50,
      deletedAt: null,
      _count: { members: 5 }
    };

    const mockAdminMember = {
      id: 'member-admin',
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    const mockNewMember = {
      id: 'member-new',
      groupId: 'group-1',
      userId: 'user-2',
      role: 'MEMBER',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupPermission.mockResolvedValue(mockAdminMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-2', name: 'New User' });

    // 중복 체크 - findUnique는 한 번만 호출됨 (권한 체크는 helper가 처리)
    prisma.groupMember.findUnique.mockResolvedValue(null); // 중복 없음

    prisma.groupMember.findFirst.mockResolvedValue(null); // 강퇴 이력 없음
    prisma.groupMember.count.mockResolvedValue(5); // 정원 체크
    prisma.groupMember.create.mockResolvedValue(mockNewMember);

    const request = new Request('http://localhost/api/groups/group-1/members', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-2', role: 'MEMBER' })
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toContain('추가');
  });

  it('should check capacity before adding', async () => {
    const mockGroup = {
      id: 'group-1',
      maxMembers: 10,
      deletedAt: null,
      _count: { members: 10 }
    };

    const mockAdminMember = {
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupPermission.mockResolvedValue(mockAdminMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockAdminMember);
    prisma.groupMember.count.mockResolvedValue(10);

    const request = new Request('http://localhost/api/groups/group-1/members', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-2' })
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('should check kicked history', async () => {
    const mockGroup = {
      id: 'group-1',
      maxMembers: 50,
      deletedAt: null,
      _count: { members: 5 }
    };

    const mockAdminMember = {
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    const mockKickedHistory = {
      userId: 'user-2',
      status: 'KICKED',
      leftAt: new Date('2025-11-01')
    };

    groupHelpers.checkGroupPermission.mockResolvedValue(mockAdminMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValueOnce(mockAdminMember);
    prisma.groupMember.findUnique.mockResolvedValueOnce(null);
    prisma.groupMember.findFirst.mockResolvedValue(mockKickedHistory);

    const request = new Request('http://localhost/api/groups/group-1/members', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-2' })
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('should prevent duplicate member', async () => {
    const mockGroup = {
      id: 'group-1',
      maxMembers: 50,
      deletedAt: null
    };

    const mockAdminMember = {
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    const mockExistingMember = {
      userId: 'user-2',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupPermission.mockResolvedValue(mockAdminMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValueOnce(mockAdminMember);
    prisma.groupMember.findUnique.mockResolvedValueOnce(mockExistingMember);

    const request = new Request('http://localhost/api/groups/group-1/members', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-2' })
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('should require ADMIN permission', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockMemberUser = {
      userId: 'admin-1',
      role: 'MEMBER',
      status: 'ACTIVE'
    };

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockMemberUser);

    const request = new Request('http://localhost/api/groups/group-1/members', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-2' })
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });
});

describe('DELETE /api/groups/[id]/members - 멤버 제거', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: 'admin-1', name: 'Admin User' }
    });
  });

  it('should remove member with ADMIN permission', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockAdminMember = {
      id: 'member-admin',
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    const mockTargetMember = {
      id: 'member-target',
      userId: 'user-2',
      role: 'MEMBER',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupPermission.mockResolvedValue(mockAdminMember);
    groupHelpers.canManageMember.mockReturnValue(true); // 권한 체크 통과
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockTargetMember); // targetMember
    prisma.groupMember.update.mockResolvedValue({
      ...mockTargetMember,
      status: 'KICKED'
    });

    const request = new Request('http://localhost/api/groups/group-1/members?userId=user-2', {
      method: 'DELETE'
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('제거');
  });

  it('should check role hierarchy', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockAdminMember = {
      id: 'member-admin',
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    const mockOwnerMember = {
      id: 'member-owner',
      userId: 'owner-1',
      role: 'OWNER',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupPermission.mockResolvedValue(mockAdminMember);
    groupHelpers.canManageMember.mockReturnValue(false); // ADMIN이 OWNER를 관리할 수 없음
    prisma.group.findUnique.mockResolvedValue(mockGroup);

    // targetMember 조회를 위한 findUnique - OWNER 제거 불가 체크보다 먼저 권한 체크가 일어남
    // API에서 OWNER 제거는 role 체크로 막히므로, 여기서는 role hierarchy만 테스트
    prisma.groupMember.findUnique.mockResolvedValue(mockOwnerMember);

    const request = new Request('http://localhost/api/groups/group-1/members?userId=owner-1', {
      method: 'DELETE'
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    // OWNER 제거 불가 에러가 먼저 발생 (targetMember.role === 'OWNER')
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('should prevent OWNER removal', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockOwnerMember = {
      id: 'member-owner1',
      userId: 'owner-1',
      role: 'OWNER',
      status: 'ACTIVE'
    };

    const mockTargetOwner = {
      id: 'member-owner2',
      userId: 'owner-2',
      role: 'OWNER',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupPermission.mockResolvedValue(mockOwnerMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockTargetOwner); // targetMember

    const request = new Request('http://localhost/api/groups/group-1/members?userId=owner-2', {
      method: 'DELETE'
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('should prevent self-removal', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockMember = {
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupPermission.mockResolvedValue(mockMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockMember);

    const request = new Request('http://localhost/api/groups/group-1/members?userId=admin-1', {
      method: 'DELETE'
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('should require ADMIN permission for removal', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockMemberUser = {
      id: 'member-regular',
      userId: 'admin-1',
      role: 'MEMBER',
      status: 'ACTIVE'
    };

    const mockTargetMember = {
      id: 'member-target',
      userId: 'user-2',
      role: 'MEMBER',
      status: 'ACTIVE'
    };

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockTargetMember);

    // checkGroupPermission에서 권한 체크 실패
    const permissionError = new Error('권한이 부족합니다');
    permissionError.code = 'GROUP-023';
    permissionError.statusCode = 403;
    permissionError.toJSON = () => ({
      code: 'GROUP-023',
      message: '권한이 부족합니다'
    });
    groupHelpers.checkGroupPermission.mockRejectedValue(permissionError);

    const request = new Request('http://localhost/api/groups/group-1/members?userId=user-2', {
      method: 'DELETE'
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });
});
