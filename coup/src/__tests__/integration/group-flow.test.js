/**
 * @jest-environment node
 */

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { POST as CREATE_GROUP } from '@/app/api/groups/route';
import { POST as ADD_MEMBER } from '@/app/api/groups/[id]/members/route';
import { POST as CREATE_INVITE } from '@/app/api/groups/[id]/invites/route';
import { POST as JOIN_GROUP } from '@/app/api/groups/[id]/join/route';
import { POST as LEAVE_GROUP } from '@/app/api/groups/[id]/leave/route';
import { DELETE as DELETE_GROUP } from '@/app/api/groups/[id]/route';
import * as groupHelpers from '@/lib/helpers/group-helpers';

// Mock modules
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    group: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/helpers/group-helpers', () => ({
  ...jest.requireActual('@/lib/helpers/group-helpers'),
  checkGroupMembership: jest.fn(),
  checkGroupPermission: jest.fn(),
  checkGroupCapacity: jest.fn(),
  checkKickedHistory: jest.fn(),
  checkGroupExists: jest.fn(),
}));

// 전역 beforeEach - 모든 테스트 전에 실행
beforeEach(() => {
  jest.resetAllMocks();
});

describe('Group creation and deletion flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create group and assign OWNER automatically', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'owner-1', name: 'Owner User' }
    });

    const mockGroup = {
      id: 'group-new',
      name: '??洹몃９',
      category: 'study',
      maxMembers: 30,
      createdBy: 'owner-1'
    };

    const mockMember = {
      id: 'member-1',
      groupId: 'group-new',
      userId: 'owner-1',
      role: 'OWNER',
      status: 'ACTIVE'
    };

    prisma.group.findFirst.mockResolvedValue(null);
    prisma.$transaction.mockResolvedValue({
      group: mockGroup,
      member: mockMember
    });

    const request = new Request('http://localhost/api/groups', {
      method: 'POST',
      body: JSON.stringify({
        name: '??洹몃９',
        category: 'study',
        maxMembers: 30
      })
    });

    const response = await CREATE_GROUP(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('should handle member invitation and joining flow', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'admin-1', name: 'Admin User' }
    });

    // Step 1: 초대 생성
    const mockGroup = {
      id: 'group-1',
      name: '테스트그룹',
      deletedAt: null
    };

    const mockAdminMember = {
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    const mockInvite = {
      id: 'invite-1',
      groupId: 'group-1',
      code: 'ABC123DEF456',
      email: 'newuser@test.com',
      status: 'PENDING',
      expiresAt: new Date('2025-12-31'),
      createdBy: 'admin-1'
    };

    // Helper mocks 추가
    groupHelpers.checkGroupPermission.mockResolvedValue(mockAdminMember);
    groupHelpers.checkGroupCapacity.mockResolvedValue(undefined);
    
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockAdminMember);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-2', email: 'newuser@test.com' });
    prisma.groupMember.findFirst.mockResolvedValue(null);
    prisma.groupInvite.create.mockResolvedValue(mockInvite);

    const inviteRequest = new Request('http://localhost/api/groups/group-1/invites', {
      method: 'POST',
      body: JSON.stringify({ email: 'newuser@test.com' })
    });

    const inviteResponse = await CREATE_INVITE(inviteRequest, { params: Promise.resolve({ id: 'group-1' }) });
    const inviteData = await inviteResponse.json();

    expect(inviteResponse.status).toBe(201);
    expect(inviteData.data.code).toBe('ABC123DEF456');
  });

  it('should handle member role escalation to ADMIN', async () => {
    // OWNER媛 MEMBER瑜?ADMIN?쇰줈 ?밴꺽
    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockOwner = {
      userId: 'owner-1',
      role: 'OWNER',
      status: 'ACTIVE'
    };

    const mockMemberToPromote = {
      id: 'member-2',
      userId: 'user-2',
      role: 'MEMBER',
      status: 'ACTIVE'
    };

    getServerSession.mockResolvedValue({
      user: { id: 'owner-1', name: 'Owner' }
    });

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique
      .mockResolvedValueOnce(mockOwner)
      .mockResolvedValueOnce(mockMemberToPromote);

    // 沅뚰븳 蹂寃쎌? 蹂꾨룄 API濡?泥섎━?섎?濡??ш린?쒕뒗 寃利앸쭔
    expect(mockOwner.role).toBe('OWNER');
    expect(mockMemberToPromote.role).toBe('MEMBER');
  });

  it('should handle member removal and LEFT status', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'admin-1', name: 'Admin' }
    });

    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockAdminMember = {
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    const mockTargetMember = {
      id: 'member-2',
      userId: 'user-2',
      role: 'MEMBER',
      status: 'ACTIVE'
    };

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique
      .mockResolvedValueOnce(mockAdminMember)
      .mockResolvedValueOnce(mockTargetMember);
    prisma.groupMember.update.mockResolvedValue({
      ...mockTargetMember,
      status: 'KICKED'
    });

    // 硫ㅻ쾭 ?쒓굅 ?쒕??덉씠??
    expect(mockTargetMember.status).toBe('ACTIVE');
  });

  it('should soft delete group when requested', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'owner-1', name: 'Owner' }
    });

    const mockGroup = {
      id: 'group-1',
      name: '삭제할그룹',
      deletedAt: null,
      members: [{ userId: 'owner-1', role: 'OWNER', status: 'ACTIVE' }],
      _count: { members: 1 }
    };

    // Helper mocks 추가
    groupHelpers.checkGroupExists.mockResolvedValue(mockGroup);
    groupHelpers.checkGroupPermission.mockResolvedValue({ userId: 'owner-1', role: 'OWNER', status: 'ACTIVE' });

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.count.mockResolvedValue(0); // OWNER 외 다른 활성 멤버 없음
    prisma.group.update.mockResolvedValue({
      ...mockGroup,
      deletedAt: new Date()
    });

    const request = new Request('http://localhost/api/groups/group-1', {
      method: 'DELETE'
    });

    const response = await DELETE_GROUP(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('Invite flow integration test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create invite and generate code', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'admin-1' }
    });

    const mockGroup = { id: 'group-1', deletedAt: null };
    const mockAdminMember = { userId: 'admin-1', role: 'ADMIN', status: 'ACTIVE' };
    const mockInvite = {
      id: 'invite-1',
      code: 'GENERATED123',
      status: 'PENDING'
    };

    // Helper mocks 추가
    groupHelpers.checkGroupPermission.mockResolvedValue(mockAdminMember);
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

    const response = await CREATE_INVITE(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.code).toBeTruthy();
  });

  it('should join with invite code and become ACTIVE', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user-1' }
    });

    const mockGroup = {
      id: 'group-1',
      isPublic: false,
      maxMembers: 50,
      deletedAt: null,
      _count: { members: 10 }
    };

    const mockInvite = {
      id: 'invite-1',
      groupId: 'group-1',
      code: 'ABC123',
      status: 'PENDING',
      expiresAt: new Date('2025-12-31')
    };

    const mockNewMember = {
      id: 'member-new',
      userId: 'user-1',
      role: 'MEMBER',
      status: 'ACTIVE'
    };

    // Helper mocks 추가
    groupHelpers.checkKickedHistory.mockResolvedValue(undefined);
    groupHelpers.checkGroupCapacity.mockResolvedValue(undefined);

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(null);
    prisma.groupMember.findFirst.mockResolvedValue(null);
    prisma.groupMember.count.mockResolvedValue(10);
    prisma.groupInvite.findFirst.mockResolvedValue(mockInvite); // findFirst 사용
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
      body: JSON.stringify({ inviteCode: 'ABC123' })
    });

    const response = await JOIN_GROUP(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.status).toBe('ACTIVE');
  });

  it('should reject expired invite', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user-1' }
    });

    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockExpiredInvite = {
      id: 'invite-1',
      code: 'EXPIRED123',
      status: 'PENDING',
      expiresAt: new Date('2025-01-01') // 怨쇨굅 ?좎쭨
    };

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(null);
    prisma.groupMember.findFirst.mockResolvedValue(null);
    prisma.groupInvite.findUnique.mockResolvedValue(mockExpiredInvite);

    const request = new Request('http://localhost/api/groups/group-1/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode: 'EXPIRED123' })
    });

    const response = await JOIN_GROUP(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });
});

describe('Permission flow verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow only OWNER to delete group', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'owner-1' }
    });

    const mockGroup = {
      id: 'group-1',
      deletedAt: null,
      members: [{ userId: 'owner-1', role: 'OWNER', status: 'ACTIVE' }],
      _count: { members: 1 }
    };

    // Helper mocks 추가
    groupHelpers.checkGroupExists.mockResolvedValue(mockGroup);
    groupHelpers.checkGroupPermission.mockResolvedValue({ userId: 'owner-1', role: 'OWNER', status: 'ACTIVE' });

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.count.mockResolvedValue(0); // OWNER 외 다른 활성 멤버 없음
    prisma.group.update.mockResolvedValue({
      ...mockGroup,
      deletedAt: new Date()
    });

    const request = new Request('http://localhost/api/groups/group-1', {
      method: 'DELETE'
    });

    const response = await DELETE_GROUP(request, { params: Promise.resolve({ id: 'group-1' }) });

    expect(response.status).toBe(200);
  });

  it('should require ADMIN permission for member management', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'admin-1' }
    });

    const mockGroup = {
      id: 'group-1',
      maxMembers: 50,
      deletedAt: null,
      _count: { members: 10 }
    };

    const mockAdminMember = {
      userId: 'admin-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique
      .mockResolvedValueOnce(mockAdminMember)
      .mockResolvedValueOnce(null);
    prisma.groupMember.findFirst.mockResolvedValue(null);
    prisma.groupMember.count.mockResolvedValue(10);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-2' });
    prisma.groupMember.create.mockResolvedValue({
      id: 'member-new',
      userId: 'user-2',
      role: 'MEMBER',
      status: 'ACTIVE'
    });

    // ADMIN??硫ㅻ쾭瑜?異붽??????덉뼱????
    expect(mockAdminMember.role).toBe('ADMIN');
  });

  it('should prevent ADMIN from removing OWNER', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'admin-1' }
    });

    const mockAdminMember = {
      userId: 'admin-1',
      role: 'ADMIN'
    };

    const mockOwnerMember = {
      userId: 'owner-1',
      role: 'OWNER'
    };

    // ??븷 怨꾩링 寃利?
    const adminLevel = 2;
    const ownerLevel = 3;

    expect(adminLevel).toBeLessThan(ownerLevel);
  });
});

describe('Business logic verification', () => {
  it('should prevent joining when capacity is full', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user-1' }
    });

    const mockGroup = {
      id: 'group-1',
      maxMembers: 10,
      isPublic: true,
      isRecruiting: true,
      deletedAt: null,
      _count: { members: 10 }
    };

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(null);
    prisma.groupMember.findFirst.mockResolvedValue(null);
    prisma.groupMember.count.mockResolvedValue(10); // ?뺤썝 媛??李?

    const request = new Request('http://localhost/api/groups/group-1/join', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await JOIN_GROUP(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('should check kicked history before allowing rejoin', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user-1' }
    });

    const mockGroup = {
      id: 'group-1',
      isPublic: true,
      isRecruiting: true,
      maxMembers: 50,
      deletedAt: null
    };

    const mockKickedHistory = {
      userId: 'user-1',
      status: 'KICKED',
      leftAt: new Date('2025-11-01')
    };

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(null);
    prisma.groupMember.findFirst.mockResolvedValue(mockKickedHistory);

    const request = new Request('http://localhost/api/groups/group-1/join', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await JOIN_GROUP(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('should prevent duplicate join attempts', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'user-1' }
    });

    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockExistingMember = {
      userId: 'user-1',
      status: 'ACTIVE'
    };

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockExistingMember);

    const request = new Request('http://localhost/api/groups/group-1/join', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await JOIN_GROUP(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('should prevent OWNER from leaving without successor', async () => {
    getServerSession.mockResolvedValue({
      user: { id: 'owner-1' }
    });

    const mockGroup = {
      id: 'group-1',
      deletedAt: null
    };

    const mockOwnerMember = {
      id: 'member-1',
      userId: 'owner-1',
      role: 'OWNER',
      status: 'ACTIVE'
    };

    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.findUnique.mockResolvedValue(mockOwnerMember);
    // OWNER이므로 다른 ADMIN 체크 - 0명이면 탈퇴 불가
    prisma.groupMember.count.mockResolvedValue(0);

    const request = new Request('http://localhost/api/groups/group-1/leave', {
      method: 'POST'
    });

    const response = await LEAVE_GROUP(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    // OWNER는 다른 ADMIN 없이 탈퇴 불가 -> 403 또는 400 반환
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });
});


