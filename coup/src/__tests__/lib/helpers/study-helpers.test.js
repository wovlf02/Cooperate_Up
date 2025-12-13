/**
 * @jest-environment node
 */

import {
  getRoleHierarchy,
  compareRoles,
  checkModifyMemberPermission,
  checkRoleChangePermission,
  checkMemberPermission,
  calculateCapacityRemaining,
  isStudyFull,
  validateStudyCapacity,
  checkRejoinEligibility,
  validateJoinEligibility,
  validateMemberStatusTransition
} from '@/lib/helpers/study-helpers';
import {
  StudyPermissionException,
  StudyMemberException,
  StudyBusinessException,
  StudyDatabaseException
} from '@/lib/exceptions/study';

// Mock logging
jest.mock('@/lib/logging/studyLogger', () => ({
  StudyLogger: {
    logError: jest.fn(),
    logInfo: jest.fn(),
  }
}));

describe('Study Helpers', () => {
  // ============================================
  // 역할 계층 관리
  // ============================================
  describe('getRoleHierarchy', () => {
    it('should return correct hierarchy for OWNER', () => {
      expect(getRoleHierarchy('OWNER')).toBe(3);
    });

    it('should return correct hierarchy for ADMIN', () => {
      expect(getRoleHierarchy('ADMIN')).toBe(2);
    });

    it('should return correct hierarchy for MEMBER', () => {
      expect(getRoleHierarchy('MEMBER')).toBe(1);
    });

    it('should return 0 for invalid role', () => {
      expect(getRoleHierarchy('INVALID')).toBe(0);
    });
  });

  describe('compareRoles', () => {
    it('should return positive when role1 > role2', () => {
      expect(compareRoles('OWNER', 'ADMIN')).toBeGreaterThan(0);
      expect(compareRoles('ADMIN', 'MEMBER')).toBeGreaterThan(0);
      expect(compareRoles('OWNER', 'MEMBER')).toBeGreaterThan(0);
    });

    it('should return 0 when roles are equal', () => {
      expect(compareRoles('OWNER', 'OWNER')).toBe(0);
      expect(compareRoles('ADMIN', 'ADMIN')).toBe(0);
    });

    it('should return negative when role1 < role2', () => {
      expect(compareRoles('ADMIN', 'OWNER')).toBeLessThan(0);
      expect(compareRoles('MEMBER', 'ADMIN')).toBeLessThan(0);
    });
  });

  describe('checkModifyMemberPermission', () => {
    it('should allow OWNER to modify ADMIN', () => {
      expect(() => checkModifyMemberPermission('OWNER', 'ADMIN')).not.toThrow();
    });

    it('should allow ADMIN to modify MEMBER', () => {
      expect(() => checkModifyMemberPermission('ADMIN', 'MEMBER')).not.toThrow();
    });

    it('should throw when trying to modify higher or equal role', () => {
      expect(() => checkModifyMemberPermission('ADMIN', 'OWNER')).toThrow();
      expect(() => checkModifyMemberPermission('MEMBER', 'ADMIN')).toThrow();
      expect(() => checkModifyMemberPermission('MEMBER', 'MEMBER')).toThrow();
    });
  });

  describe('checkRoleChangePermission', () => {
    it('should allow OWNER to change ADMIN to MEMBER', () => {
      expect(() =>
        checkRoleChangePermission('study-1', 'user-1', 'OWNER', 'ADMIN', 'MEMBER')
      ).not.toThrow();
    });

    it('should throw when non-OWNER tries to change role', () => {
      expect(() =>
        checkRoleChangePermission('study-1', 'user-1', 'ADMIN', 'MEMBER', 'ADMIN')
      ).toThrow();
    });
  });

  describe('checkMemberPermission', () => {
    it('should pass for active member with sufficient role', () => {
      const member = { userId: 'user-1', role: 'ADMIN', status: 'ACTIVE' };
      expect(() => checkMemberPermission(member, 'ADMIN', 'study-1')).not.toThrow();
    });

    it('should throw when member is null', () => {
      expect(() => checkMemberPermission(null, 'ADMIN', 'study-1')).toThrow(
        StudyPermissionException
      );
    });

    it('should throw when member is not ACTIVE', () => {
      const member = { userId: 'user-1', role: 'ADMIN', status: 'LEFT' };
      expect(() => checkMemberPermission(member, 'ADMIN', 'study-1')).toThrow(
        StudyPermissionException
      );
    });

    it('should throw when member has insufficient role', () => {
      const member = { userId: 'user-1', role: 'MEMBER', status: 'ACTIVE' };
      expect(() => checkMemberPermission(member, 'ADMIN', 'study-1')).toThrow(
        StudyPermissionException
      );
    });
  });

  // ============================================
  // 정원 관리
  // ============================================
  describe('calculateCapacityRemaining', () => {
    it('should calculate remaining capacity correctly', () => {
      expect(calculateCapacityRemaining(5, 10)).toBe(5);
      expect(calculateCapacityRemaining(8, 10)).toBe(2);
    });

    it('should return 0 when full', () => {
      expect(calculateCapacityRemaining(10, 10)).toBe(0);
    });

    it('should return 0 when over capacity', () => {
      expect(calculateCapacityRemaining(15, 10)).toBe(0);
    });
  });

  describe('isStudyFull', () => {
    it('should return false when not full', () => {
      expect(isStudyFull(5, 10)).toBe(false);
    });

    it('should return true when full', () => {
      expect(isStudyFull(10, 10)).toBe(true);
    });

    it('should return true when over capacity', () => {
      expect(isStudyFull(11, 10)).toBe(true);
    });
  });

  describe('validateStudyCapacity', () => {
    it('should not throw when capacity available', () => {
      expect(() => validateStudyCapacity(5, 10, 'study-1')).not.toThrow();
      expect(() => validateStudyCapacity(1, 10, 'study-1')).not.toThrow();
      expect(() => validateStudyCapacity(9, 10, 'study-1')).not.toThrow();
    });
  });

  // ============================================
  // 멤버 상태 관리
  // ============================================
  describe('checkRejoinEligibility', () => {
    it('should allow rejoin for LEFT status', () => {
      expect(() => checkRejoinEligibility('LEFT', 'user-1', 'study-1')).not.toThrow();
    });

    it('should allow rejoin for undefined status', () => {
      expect(() => checkRejoinEligibility(undefined, 'user-1', 'study-1')).not.toThrow();
    });
  });

  describe('validateJoinEligibility', () => {
    it('should pass for recruiting study with capacity', () => {
      const study = {
        id: 'study-1',
        isRecruiting: true,
        maxMembers: 10,
        _count: { members: 5 }
      };
      expect(() => validateJoinEligibility(study)).not.toThrow();
    });

    it('should pass when existing member is LEFT', () => {
      const study = {
        id: 'study-1',
        isRecruiting: true,
        maxMembers: 10,
        _count: { members: 5 }
      };
      const existingMember = { userId: 'user-1', status: 'LEFT' };
      expect(() => validateJoinEligibility(study, existingMember)).not.toThrow();
    });

    it('should handle currentMembers property', () => {
      const study = {
        id: 'study-1',
        isRecruiting: true,
        maxMembers: 10,
        currentMembers: 3
      };
      expect(() => validateJoinEligibility(study)).not.toThrow();
    });
  });

  // ============================================
  // 멤버 상태 전환
  // ============================================
  describe('validateMemberStatusTransition', () => {
    it('should allow PENDING to ACTIVE transition', () => {
      expect(() =>
        validateMemberStatusTransition('PENDING', 'ACTIVE', 'user-1', 'study-1')
      ).not.toThrow();
    });

    it('should allow ACTIVE to LEFT transition', () => {
      expect(() =>
        validateMemberStatusTransition('ACTIVE', 'LEFT', 'user-1', 'study-1')
      ).not.toThrow();
    });

    it('should allow ACTIVE to KICKED transition', () => {
      expect(() =>
        validateMemberStatusTransition('ACTIVE', 'KICKED', 'user-1', 'study-1')
      ).not.toThrow();
    });
  });
});
