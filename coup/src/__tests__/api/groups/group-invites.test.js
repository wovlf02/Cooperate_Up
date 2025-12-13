/**
 * @jest-environment node
 */

import { GET, POST, DELETE } from '@/app/api/groups/[id]/invites/route';
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
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    groupInvite: {
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
  checkKickedHistory: jest.fn(),
  checkGroupCapacity: jest.fn(),
}));

describe('GET /api/groups/[id]/invites - 초대 목록 조회', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: 'user-1', name: 'Test User' }
    });
  });

  it('should return invites list successfully', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockMember = {
      userId: 'user-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    const mockInvites = [
      {
        id: 'invite-1',
        groupId: 'group-1',
        code: 'ABC123DEF456',
        email: 'test@example.com',
        status: 'PENDING',
        expiresAt: new Date('2025-12-10'),
        createdBy: 'user-1',
        createdAt: new Date('2025-12-01'),
        creator: {
          id: 'user-1',
          name: 'Admin User',
          email: 'admin@test.com'
        }
      }
    ];

    groupHelpers.checkGroupMembership.mockResolvedValue(mockMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockMember);
    prisma.groupInvite.findMany.mockResolvedValue(mockInvites);
    prisma.groupInvite.count.mockResolvedValue(1);

    const request = new Request('http://localhost/api/groups/group-1/invites');
    const response = await GET(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].code).toBe('ABC123DEF456');
  });

  it('should filter by status', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockMember = {
      userId: 'user-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupMembership.mockResolvedValue(mockMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockMember);
    prisma.groupInvite.findMany.mockResolvedValue([]);
    prisma.groupInvite.count.mockResolvedValue(0);

    const request = new Request('http://localhost/api/groups/group-1/invites?status=PENDING');
    const response = await GET(request, { params: Promise.resolve({ id: 'group-1' }) });

    expect(response.status).toBe(200);
    expect(prisma.groupInvite.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PENDING'
        })
      })
    );
  });
});

describe('POST /api/groups/[id]/invites - 초대 생성', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: 'admin-1', name: 'Admin User' }
    });
  });

  it('should create invite with ADMIN permission', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '테스트 그룹',
      deletedAt: null
    };

    const mockAdminMember = {
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    const mockUser = {
      id: 'user-2',
      email: 'invited@test.com'
    };

    const mockInvite = {
      id: 'invite-new',
      groupId: 'group-1',
      code: 'XYZ789GHI012',
      email: 'invited@test.com',
      status: 'PENDING',
      expiresAt: new Date('2025-12-10'),
      createdBy: 'admin-1'
    };

    groupHelpers.checkGroupPermission.mockResolvedValue(mockAdminMember);
    groupHelpers.checkKickedHistory.mockResolvedValue(undefined);
    groupHelpers.checkGroupCapacity.mockResolvedValue(undefined); // 정원 체크 통과
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValueOnce(mockAdminMember);
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.groupMember.findFirst.mockResolvedValue(null); // 멤버 아님
    prisma.groupInvite.create.mockResolvedValue(mockInvite);

    const request = new Request('http://localhost/api/groups/group-1/invites', {
      method: 'POST',
      body: JSON.stringify({ email: 'invited@test.com' })
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.code).toBeTruthy();
  });

  it('should generate unique invite code', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockAdminMember = {
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    const mockInvite = {
      id: 'invite-new',
      code: 'ABC123DEF456', // 12자리 코드
      groupId: 'group-1',
      status: 'PENDING'
    };

    groupHelpers.checkGroupPermission.mockResolvedValue(mockAdminMember);
    groupHelpers.checkKickedHistory.mockResolvedValue(undefined);
    groupHelpers.checkGroupCapacity.mockResolvedValue(undefined);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockAdminMember);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-2', email: 'test@test.com' });
    prisma.groupMember.findFirst.mockResolvedValue(null);
    prisma.groupInvite.create.mockResolvedValue(mockInvite);

    const request = new Request('http://localhost/api/groups/group-1/invites', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com' })
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.code).toHaveLength(12); // 초대 코드 길이 확인
  });

  it('should prevent inviting existing members', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockAdminMember = {
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    const mockUser = {
      id: 'user-2',
      email: 'member@test.com'
    };

    const mockExistingMember = {
      userId: 'user-2',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupPermission.mockResolvedValue(mockAdminMember);
    groupHelpers.checkGroupCapacity.mockResolvedValue(undefined);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    // userId로 요청 시 API가 findUnique로 기존 멤버 확인
    prisma.groupMember.findUnique.mockResolvedValue(mockExistingMember);
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const request = new Request('http://localhost/api/groups/group-1/invites', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-2' }) // userId로 요청해야 기존 멤버 체크
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('should prevent inviting kicked users', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockAdminMember = {
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    const mockUser = {
      id: 'user-2',
      email: 'kicked@test.com'
    };

    groupHelpers.checkGroupPermission.mockResolvedValue(mockAdminMember);
    groupHelpers.checkGroupCapacity.mockResolvedValue(undefined);
    
    const kickedError = new Error('강퇴된 사용자입니다');
    kickedError.code = 'GROUP-037';
    kickedError.statusCode = 403;
    kickedError.toJSON = () => ({ code: 'GROUP-037', message: '강퇴된 사용자입니다' });
    groupHelpers.checkKickedHistory.mockRejectedValue(kickedError);

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(null); // 기존 멤버 아님
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const request = new Request('http://localhost/api/groups/group-1/invites', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-2' }) // userId로 요청해야 강퇴 이력 체크
    });

    const response = await POST(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });
});

describe('DELETE /api/groups/[id]/invites - 초대 취소', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: 'admin-1', name: 'Admin User' }
    });
  });

  it('should cancel invite by creator', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockMember = {
      userId: 'admin-1',
      role: 'MEMBER',
      status: 'ACTIVE'
    };

    const mockInvite = {
      id: 'invite-1',
      groupId: 'group-1',
      createdBy: 'admin-1', // 생성자
      status: 'PENDING'
    };

    groupHelpers.checkGroupMembership.mockResolvedValue(mockMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockMember);
    prisma.groupInvite.findUnique.mockResolvedValue(mockInvite);
    prisma.groupInvite.update.mockResolvedValue({
      ...mockInvite,
      status: 'CANCELED'
    });

    const request = new Request('http://localhost/api/groups/group-1/invites?inviteId=invite-1', {
      method: 'DELETE'
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('취소');
  });

  it('should require creator or ADMIN permission', async () => {
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockMember = {
      userId: 'admin-1',
      role: 'MEMBER', // 권한 부족
      status: 'ACTIVE'
    };

    const mockInvite = {
      id: 'invite-1',
      groupId: 'group-1',
      invitedById: 'other-user', // 다른 사람이 생성 (API에서 invitedById 사용)
      status: 'PENDING'
    };

    // MEMBER 권한으로는 ADMIN 권한 체크에서 실패해야 함
    const permissionError = new Error('권한이 부족합니다');
    permissionError.code = 'GROUP-PERMISSION';
    permissionError.statusCode = 403;
    permissionError.toJSON = () => ({ code: 'GROUP-PERMISSION', message: '권한이 부족합니다' });
    groupHelpers.checkGroupPermission.mockRejectedValue(permissionError);
    
    groupHelpers.checkGroupMembership.mockResolvedValue(mockMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockMember);
    prisma.groupInvite.findUnique.mockResolvedValue(mockInvite);

    const request = new Request('http://localhost/api/groups/group-1/invites?inviteId=invite-1', {
      method: 'DELETE'
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });
});
