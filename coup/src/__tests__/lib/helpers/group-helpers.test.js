/**
 * @jest-environment node
 */

import {
  getRoleHierarchy,
  compareRoles,
  checkGroupExists,
  checkGroupAccessible,
  checkGroupRecruiting,
  checkGroupCapacity,
  getMemberRole,
  checkMemberExists,
  checkMemberKicked,
  generateInviteCode,
  checkOwnerPermission,
  checkAdminPermission,
  canManageMember,
  formatGroupResponse,
  formatMemberResponse,
  formatInviteResponse
} from '@/lib/helpers/group-helpers';
import {
  GroupException,
  GroupBusinessException,
  GroupMemberException,
  GroupPermissionException
} from '@/lib/exceptions/group';

// Mock Prisma
const mockPrisma = {
  group: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  groupMember: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  groupInvite: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};

// Mock logging
jest.mock('@/lib/logging/groupLogger', () => ({
  GroupLogger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Group Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // 역할 계층 관리
  // ============================================
  describe('getRoleHierarchy', () => {
    it('should return correct role hierarchy', () => {
      expect(getRoleHierarchy('OWNER')).toBe(3);
      expect(getRoleHierarchy('ADMIN')).toBe(2);
      expect(getRoleHierarchy('MEMBER')).toBe(1);
      expect(getRoleHierarchy('INVALID')).toBe(0);
    });
  });

  describe('compareRoles', () => {
    it('should compare roles correctly', () => {
      expect(compareRoles('OWNER', 'ADMIN')).toBeGreaterThan(0);
      expect(compareRoles('ADMIN', 'MEMBER')).toBeGreaterThan(0);
      expect(compareRoles('OWNER', 'OWNER')).toBe(0);
      expect(compareRoles('ADMIN', 'OWNER')).toBeLessThan(0);
    });
  });

  // ============================================
  // 그룹 상태 관리
  // ============================================
  describe('checkGroupExists', () => {
    it('should return group if exists', async () => {
      const mockGroup = {
        id: 'group-1',
        name: '테스트 그룹',
        deletedAt: null
      };

      mockPrisma.group.findUnique.mockResolvedValue(mockGroup);

      const result = await checkGroupExists('group-1', mockPrisma);
      expect(result).toEqual(mockGroup);
    });

    it('should throw error if group not found', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(null);

      await expect(
        checkGroupExists('group-1', mockPrisma)
      ).rejects.toThrow(GroupException);
    });

    it('should throw error if group is deleted', async () => {
      const mockDeletedGroup = {
        id: 'group-1',
        name: '삭제된 그룹',
        deletedAt: new Date()
      };

      mockPrisma.group.findUnique.mockResolvedValue(mockDeletedGroup);

      await expect(
        checkGroupExists('group-1', mockPrisma)
      ).rejects.toThrow(GroupException);
    });
  });

  describe('checkGroupAccessible', () => {
    it('should allow access to public group', async () => {
      const mockPublicGroup = {
        id: 'group-1',
        isPublic: true,
        deletedAt: null
      };

      mockPrisma.group.findUnique.mockResolvedValue(mockPublicGroup);

      await expect(
        checkGroupAccessible('group-1', 'user-1', mockPrisma)
      ).resolves.not.toThrow();
    });

    it('should allow access to private group for members', async () => {
      const mockPrivateGroup = {
        id: 'group-1',
        isPublic: false,
        deletedAt: null
      };

      mockPrisma.group.findUnique.mockResolvedValue(mockPrivateGroup);
      mockPrisma.groupMember.findUnique.mockResolvedValue({
        groupId: 'group-1',
        userId: 'user-1',
        role: 'MEMBER',
        status: 'ACTIVE'
      });

      await expect(
        checkGroupAccessible('group-1', 'user-1', mockPrisma)
      ).resolves.not.toThrow();
    });

    it('should deny access to private group for non-members', async () => {
      const mockPrivateGroup = {
        id: 'group-1',
        isPublic: false,
        deletedAt: null
      };

      mockPrisma.group.findUnique.mockResolvedValue(mockPrivateGroup);
      mockPrisma.groupMember.findUnique.mockResolvedValue(null);

      await expect(
        checkGroupAccessible('group-1', 'user-1', mockPrisma)
      ).rejects.toThrow(GroupException);
    });
  });

  describe('checkGroupRecruiting', () => {
    it('should pass if group is recruiting', async () => {
      const mockGroup = {
        id: 'group-1',
        isRecruiting: true,
        deletedAt: null
      };

      mockPrisma.group.findUnique.mockResolvedValue(mockGroup);

      await expect(
        checkGroupRecruiting('group-1', mockPrisma)
      ).resolves.not.toThrow();
    });

    it('should throw error if group is not recruiting', async () => {
      const mockGroup = {
        id: 'group-1',
        isRecruiting: false,
        deletedAt: null
      };

      mockPrisma.group.findUnique.mockResolvedValue(mockGroup);

      await expect(
        checkGroupRecruiting('group-1', mockPrisma)
      ).rejects.toThrow(GroupException);
    });
  });

  describe('checkGroupCapacity', () => {
    it('should pass if capacity is available', async () => {
      const mockGroup = {
        id: 'group-1',
        maxMembers: 50,
        _count: {
          members: 30
        }
      };

      mockPrisma.group.findUnique.mockResolvedValue(mockGroup);

      await expect(
        checkGroupCapacity('group-1', mockPrisma)
      ).resolves.not.toThrow();
    });

    it('should throw error if capacity is full', async () => {
      const mockGroup = {
        id: 'group-1',
        maxMembers: 50,
        _count: {
          members: 50
        }
      };

      mockPrisma.group.findUnique.mockResolvedValue(mockGroup);

      await expect(
        checkGroupCapacity('group-1', mockPrisma)
      ).rejects.toThrow(GroupException);
    });
  });

  // ============================================
  // 멤버 관리
  // ============================================
  describe('checkMemberExists', () => {
    it('should return member if exists', async () => {
      const mockMember = {
        id: 'member-1',
        userId: 'user-1',
        groupId: 'group-1',
        role: 'MEMBER',
        status: 'ACTIVE'
      };

      mockPrisma.groupMember.findUnique.mockResolvedValue(mockMember);

      const result = await checkMemberExists('group-1', 'user-1', mockPrisma);
      expect(result).toEqual(mockMember);
    });

    it('should throw error if member not found', async () => {
      mockPrisma.groupMember.findUnique.mockResolvedValue(null);

      await expect(
        checkMemberExists('group-1', 'user-1', mockPrisma)
      ).rejects.toThrow(GroupException);
    });
  });

  describe('checkMemberKicked', () => {
    it('should pass if no kicked history', async () => {
      mockPrisma.groupMember.findFirst.mockResolvedValue(null);

      await expect(
        checkMemberKicked('group-1', 'user-1', mockPrisma)
      ).resolves.not.toThrow();
    });

    it('should throw error if user was kicked', async () => {
      const mockKickedHistory = {
        userId: 'user-1',
        status: 'KICKED',
        leftAt: new Date('2025-11-01')
      };

      mockPrisma.groupMember.findFirst.mockResolvedValue(mockKickedHistory);

      await expect(
        checkMemberKicked('group-1', 'user-1', mockPrisma)
      ).rejects.toThrow(GroupException);
    });
  });

  describe('getMemberRole', () => {
    it('should return member role', async () => {
      const mockMember = {
        userId: 'user-1',
        role: 'ADMIN',
        status: 'ACTIVE'
      };

      mockPrisma.groupMember.findUnique.mockResolvedValue(mockMember);

      const role = await getMemberRole('group-1', 'user-1', mockPrisma);
      expect(role).toBe('ADMIN');
    });

    it('should throw if not a member', async () => {
      mockPrisma.groupMember.findUnique.mockResolvedValue(null);

      await expect(
        getMemberRole('group-1', 'user-1', mockPrisma)
      ).rejects.toThrow(GroupException);
    });
  });

  // ============================================
  // 초대 코드 관리
  // ============================================
  describe('generateInviteCode', () => {
    it('should generate 12-character code', () => {
      const code = generateInviteCode();
      expect(code).toHaveLength(12);
      expect(typeof code).toBe('string');
    });

    it('should generate unique codes', () => {
      const code1 = generateInviteCode();
      const code2 = generateInviteCode();
      expect(code1).not.toBe(code2);
    });
  });

  // ============================================
  // 권한 체크
  // ============================================
  describe('checkOwnerPermission', () => {
    it('should pass for OWNER role', async () => {
      const mockMember = {
        userId: 'user-1',
        role: 'OWNER',
        status: 'ACTIVE'
      };

      mockPrisma.groupMember.findUnique.mockResolvedValue(mockMember);

      await expect(
        checkOwnerPermission('group-1', 'user-1', mockPrisma)
      ).resolves.not.toThrow();
    });

    it('should throw error for non-OWNER', async () => {
      const mockMember = {
        userId: 'user-1',
        role: 'ADMIN',
        status: 'ACTIVE'
      };

      mockPrisma.groupMember.findUnique.mockResolvedValue(mockMember);

      await expect(
        checkOwnerPermission('group-1', 'user-1', mockPrisma)
      ).rejects.toThrow(GroupException);
    });
  });

  describe('checkAdminPermission', () => {
    it('should pass for OWNER', async () => {
      const mockMember = {
        userId: 'user-1',
        role: 'OWNER',
        status: 'ACTIVE'
      };

      mockPrisma.groupMember.findUnique.mockResolvedValue(mockMember);

      await expect(
        checkAdminPermission('group-1', 'user-1', mockPrisma)
      ).resolves.not.toThrow();
    });

    it('should pass for ADMIN', async () => {
      const mockMember = {
        userId: 'user-1',
        role: 'ADMIN',
        status: 'ACTIVE'
      };

      mockPrisma.groupMember.findUnique.mockResolvedValue(mockMember);

      await expect(
        checkAdminPermission('group-1', 'user-1', mockPrisma)
      ).resolves.not.toThrow();
    });

    it('should throw error for MEMBER', async () => {
      const mockMember = {
        userId: 'user-1',
        role: 'MEMBER',
        status: 'ACTIVE'
      };

      mockPrisma.groupMember.findUnique.mockResolvedValue(mockMember);

      await expect(
        checkAdminPermission('group-1', 'user-1', mockPrisma)
      ).rejects.toThrow(GroupException);
    });
  });

  describe('canManageMember', () => {
    it('should allow ADMIN to manage MEMBER', () => {
      const result = canManageMember('ADMIN', 'MEMBER');
      expect(result).toBe(true);
    });

    it('should prevent ADMIN from managing OWNER', () => {
      const result = canManageMember('ADMIN', 'OWNER');
      expect(result).toBe(false);
    });
  });

  // ============================================
  // 응답 포맷팅
  // ============================================
  describe('formatGroupResponse', () => {
    it('should format group data correctly', () => {
      const mockGroup = {
        id: 'group-1',
        name: '테스트 그룹',
        description: '설명',
        category: 'study',
        isPublic: true,
        maxMembers: 50,
        createdAt: new Date('2025-12-01'),
        updatedAt: new Date('2025-12-01'),
        _count: { members: 10 }
      };

      const formatted = formatGroupResponse(mockGroup);

      expect(formatted.id).toBe('group-1');
      expect(formatted.name).toBe('테스트 그룹');
      expect(formatted.memberCount).toBe(10);
    });
  });

  describe('formatMemberResponse', () => {
    it('should format member data correctly', () => {
      const mockMember = {
        id: 'member-1',
        role: 'MEMBER',
        status: 'ACTIVE',
        joinedAt: new Date('2025-12-01'),
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          avatar: null
        }
      };

      const formatted = formatMemberResponse(mockMember);

      expect(formatted.id).toBe('member-1');
      expect(formatted.role).toBe('MEMBER');
      expect(formatted.user.name).toBe('Test User');
    });
  });

  describe('formatInviteResponse', () => {
    it('should format invite data correctly', () => {
      const mockInvite = {
        id: 'invite-1',
        code: 'ABC123DEF456',
        groupId: 'group-1',
        createdBy: 'user-1',
        maxUses: 10,
        usedCount: 3,
        expiresAt: new Date('2025-12-31'),
        createdAt: new Date('2025-12-01')
      };

      const formatted = formatInviteResponse(mockInvite);

      expect(formatted.id).toBe('invite-1');
      expect(formatted.code).toBe('ABC123DEF456');
    });
  });
});

