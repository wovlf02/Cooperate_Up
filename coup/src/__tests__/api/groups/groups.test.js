/**
 * @jest-environment node
 */

import { GET, POST } from '@/app/api/groups/route';
import { GET as GET_ID, PATCH, DELETE } from '@/app/api/groups/[id]/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import * as groupHelpers from '@/lib/helpers/group-helpers';
import { GroupPermissionException } from '@/lib/exceptions/group';

// Mock modules
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    group: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    groupMember: {
      create: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/helpers/group-helpers', () => ({
  ...jest.requireActual('@/lib/helpers/group-helpers'),
  checkGroupExists: jest.fn(),
  checkGroupPermission: jest.fn(),
}));

describe('GET /api/groups - 그룹 목록 조회', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: 'user-1', name: 'Test User' }
    });
  });

  const mockGroups = [
    {
      id: 'group-1',
      name: '알고리즘 스터디',
      description: '매일 알고리즘 문제를 풉니다',
      category: 'study',
      isPublic: true,
      isRecruiting: true,
      maxMembers: 20,
      imageUrl: null,
      createdBy: 'user-1',
      createdAt: new Date('2025-12-01'),
      updatedAt: new Date('2025-12-01'),
      deletedAt: null,
      _count: { members: 5 },
      members: [{ role: 'OWNER', status: 'ACTIVE' }]
    }
  ];

  it('should return groups list successfully', async () => {
    prisma.group.findMany.mockResolvedValue(mockGroups);
    prisma.group.count.mockResolvedValue(1);

    const request = new Request('http://localhost/api/groups?page=1&limit=20');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.groups).toHaveLength(1);
    expect(data.data.groups[0].name).toBe('알고리즘 스터디');
    expect(data.data.pagination.total).toBe(1);
  });

  it('should filter by category', async () => {
    prisma.group.findMany.mockResolvedValue(mockGroups);
    prisma.group.count.mockResolvedValue(1);

    const request = new Request('http://localhost/api/groups?category=study');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(prisma.group.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: 'study'
        })
      })
    );
  });

  it('should support pagination', async () => {
    prisma.group.findMany.mockResolvedValue(mockGroups);
    prisma.group.count.mockResolvedValue(50);

    const request = new Request('http://localhost/api/groups?page=2&limit=10');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.pagination.page).toBe(2);
    expect(data.data.pagination.limit).toBe(10);
    expect(data.data.pagination.total).toBe(50);
    expect(data.data.pagination.totalPages).toBe(5);
  });
});

describe('POST /api/groups - 그룹 생성', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: 'user-1', name: 'Test User' }
    });
  });

  const validGroupData = {
    name: '새로운 스터디',
    description: '함께 공부합시다',
    category: 'study',
    isPublic: true,
    maxMembers: 30
  };

  it('should create group successfully', async () => {
    const mockGroup = {
      id: 'group-new',
      ...validGroupData,
      createdBy: 'user-1',
      createdAt: new Date()
    };

    const mockMember = {
      id: 'member-1',
      groupId: 'group-new',
      userId: 'user-1',
      role: 'OWNER',
      status: 'ACTIVE'
    };

    prisma.group.findFirst.mockResolvedValue(null); // 중복 없음
    prisma.$transaction.mockResolvedValue({
      group: mockGroup,
      member: mockMember
    });

    const request = new Request('http://localhost/api/groups', {
      method: 'POST',
      body: JSON.stringify(validGroupData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('새로운 스터디');
    expect(data.message).toContain('생성');
  });

  it('should reject duplicate group name', async () => {
    prisma.group.findFirst.mockResolvedValue({ id: 'existing-group' });

    const request = new Request('http://localhost/api/groups', {
      method: 'POST',
      body: JSON.stringify(validGroupData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('GROUP-077'); // groupNameExists
  });

  it('should reject missing required fields', async () => {
    const invalidData = {
      description: '설명만 있음'
    };

    const request = new Request('http://localhost/api/groups', {
      method: 'POST',
      body: JSON.stringify(invalidData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('should validate capacity range', async () => {
    const invalidData = {
      ...validGroupData,
      maxMembers: 250 // 범위 초과
    };

    const request = new Request('http://localhost/api/groups', {
      method: 'POST',
      body: JSON.stringify(invalidData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('should automatically add creator as OWNER', async () => {
    const mockGroup = {
      id: 'group-new',
      ...validGroupData,
      createdBy: 'user-1'
    };

    const mockMember = {
      id: 'member-1',
      groupId: 'group-new',
      userId: 'user-1',
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
      body: JSON.stringify(validGroupData)
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});

describe('GET /api/groups/[id] - 그룹 상세 조회', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: 'user-1', name: 'Test User' }
    });
  });

  it('should return group details successfully', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '알고리즘 스터디',
      description: '매일 알고리즘',
      category: 'study',
      isPublic: true,
      isRecruiting: true,
      maxMembers: 20,
      deletedAt: null,
      _count: { members: 5 },
      members: [{ userId: 'user-1', role: 'MEMBER', status: 'ACTIVE' }]
    };

    prisma.group.findUnique.mockResolvedValue(mockGroup);

    const request = new Request('http://localhost/api/groups/group-1');
    const response = await GET_ID(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('알고리즘 스터디');
  });

  it('should control access to private groups', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '비공개 그룹',
      isPublic: false,
      deletedAt: null,
      members: [] // 멤버 아님
    };

    prisma.group.findUnique.mockResolvedValue(mockGroup);

    const request = new Request('http://localhost/api/groups/group-1');
    const response = await GET_ID(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });
});

describe('PATCH /api/groups/[id] - 그룹 수정', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: 'user-1', name: 'Test User' }
    });
  });

  it('should update group with ADMIN permission', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '기존 그룹',
      deletedAt: null,
      members: [{ userId: 'user-1', role: 'ADMIN', status: 'ACTIVE' }]
    };

    const mockMember = {
      id: 'member-1',
      userId: 'user-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    const updateData = {
      description: '새로운 설명'
    };

    groupHelpers.checkGroupExists.mockResolvedValue(mockGroup);
    groupHelpers.checkGroupPermission.mockResolvedValue(mockMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.group.findFirst.mockResolvedValue(null); // 이름 중복 체크
    prisma.group.update.mockResolvedValue({
      ...mockGroup,
      ...updateData
    });

    const request = new Request('http://localhost/api/groups/group-1', {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    if (response.status !== 200) {
      console.log('Response data:', data);
    }

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should reject update without permission', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '기존 그룹',
      deletedAt: null,
      members: [{ userId: 'user-1', role: 'MEMBER', status: 'ACTIVE' }]
    };

    groupHelpers.checkGroupExists.mockResolvedValue(mockGroup);
    groupHelpers.checkGroupPermission.mockRejectedValue(
      GroupPermissionException.insufficientPermissionToUpdate()
    );
    prisma.group.findUnique.mockResolvedValue(mockGroup);

    const request = new Request('http://localhost/api/groups/group-1', {
      method: 'PATCH',
      body: JSON.stringify({ description: '수정 시도' })
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
  });

  it('should prevent duplicate name on update', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '내 그룹',
      deletedAt: null,
      members: [{ userId: 'user-1', role: 'ADMIN', status: 'ACTIVE' }]
    };

    const mockMember = {
      id: 'member-1',
      userId: 'user-1',
      role: 'ADMIN',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupExists.mockResolvedValue(mockGroup);
    groupHelpers.checkGroupPermission.mockResolvedValue(mockMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.group.findFirst.mockResolvedValue({ id: 'other-group' });

    const request = new Request('http://localhost/api/groups/group-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: '이미 있는 이름' })
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
  });
});

describe('DELETE /api/groups/[id] - 그룹 삭제', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: 'user-1', name: 'Test User' }
    });
  });

  it('should delete group with OWNER permission', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '삭제할 그룹',
      deletedAt: null,
      members: [{ userId: 'user-1', role: 'OWNER', status: 'ACTIVE' }],
      _count: { members: 1 }
    };

    const mockMember = {
      id: 'member-1',
      userId: 'user-1',
      role: 'OWNER',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupExists.mockResolvedValue(mockGroup);
    groupHelpers.checkGroupPermission.mockResolvedValue(mockMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.count.mockResolvedValue(0); // OWNER 외 다른 멤버 없음
    prisma.group.update.mockResolvedValue({
      ...mockGroup,
      deletedAt: new Date()
    });

    const request = new Request('http://localhost/api/groups/group-1', {
      method: 'DELETE'
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('삭제');
  });

  it('should prevent deletion with active members', async () => {
    const mockGroup = {
      id: 'group-1',
      name: '멤버 있는 그룹',
      deletedAt: null,
      members: [{ userId: 'user-1', role: 'OWNER', status: 'ACTIVE' }],
      _count: { members: 5 }
    };

    const mockMember = {
      id: 'member-1',
      userId: 'user-1',
      role: 'OWNER',
      status: 'ACTIVE'
    };

    groupHelpers.checkGroupExists.mockResolvedValue(mockGroup);
    groupHelpers.checkGroupPermission.mockResolvedValue(mockMember);
    prisma.group.findUnique.mockResolvedValue(mockGroup);
    prisma.groupMember.count.mockResolvedValue(4); // OWNER 외 4명

    const request = new Request('http://localhost/api/groups/group-1', {
      method: 'DELETE'
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: 'group-1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

