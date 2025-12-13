/**
 * @jest-environment node
 */

import {
  validateGroupName,
  validateDescription,
  validateCategory,
  validateCapacity,
  validateVisibility,
  validateGroupData,
  validateRole,
  validateMemberStatus,
  validateInviteCode,
  validateEmailFormat
} from '@/lib/validators/group-validators';
import { GroupException } from '@/lib/exceptions/group';

describe('validateGroupName', () => {
  it('should accept valid group name', () => {
    expect(() => validateGroupName('알고리즘 스터디')).not.toThrow();
    expect(() => validateGroupName('AB')).not.toThrow(); // 최소 2자
  });

  it('should reject empty or null name', () => {
    expect(() => validateGroupName('')).toThrow(GroupException);
    expect(() => validateGroupName(null)).toThrow(GroupException);
    expect(() => validateGroupName(undefined)).toThrow(GroupException);
  });

  it('should reject too short name', () => {
    expect(() => validateGroupName('A')).toThrow(GroupException);
  });

  it('should reject too long name', () => {
    const longName = 'A'.repeat(51); // 50자 초과
    expect(() => validateGroupName(longName)).toThrow(GroupException);
  });
});

describe('validateDescription', () => {
  it('should accept valid description', () => {
    expect(() => validateDescription('매주 알고리즘 문제를 풉니다')).not.toThrow();
  });

  it('should accept empty description', () => {
    expect(() => validateDescription('')).not.toThrow();
    expect(() => validateDescription(null)).not.toThrow();
    expect(() => validateDescription(undefined)).not.toThrow();
  });

  it('should reject too long description', () => {
    const longDesc = 'A'.repeat(1001); // 1000자 초과
    expect(() => validateDescription(longDesc)).toThrow(GroupException);
  });
});

describe('validateCategory', () => {
  it('should accept valid categories', () => {
    const validCategories = ['study', 'project', 'hobby', 'network', 'social', 'etc'];

    validCategories.forEach(category => {
      expect(() => validateCategory(category)).not.toThrow();
    });
  });

  it('should reject invalid category', () => {
    expect(() => validateCategory('invalid')).toThrow(GroupException);
    expect(() => validateCategory('')).toThrow(GroupException);
    expect(() => validateCategory(null)).toThrow(GroupException);
  });
});

describe('validateCapacity', () => {
  it('should accept valid capacity', () => {
    expect(() => validateCapacity(10)).not.toThrow();
    expect(() => validateCapacity(2)).not.toThrow(); // 최소값
    expect(() => validateCapacity(200)).not.toThrow(); // 최대값
  });

  it('should reject capacity below minimum', () => {
    expect(() => validateCapacity(1)).toThrow(GroupException);
    expect(() => validateCapacity(0)).toThrow(GroupException);
  });

  it('should reject capacity above maximum', () => {
    expect(() => validateCapacity(201)).toThrow(GroupException);
    expect(() => validateCapacity(1000)).toThrow(GroupException);
  });

  it('should reject capacity less than current members', () => {
    expect(() => validateCapacity(10, 15)).toThrow(GroupException);
  });
});

describe('validateVisibility', () => {
  it('should accept valid visibility values', () => {
    expect(() => validateVisibility(true)).not.toThrow();
    expect(() => validateVisibility(false)).not.toThrow();
  });

  it('should reject invalid visibility', () => {
    expect(() => validateVisibility('public')).toThrow(GroupException);
    expect(() => validateVisibility(null)).toThrow(GroupException);
    expect(() => validateVisibility(undefined)).toThrow(GroupException);
  });
});

describe('validateGroupData', () => {
  const validData = {
    name: '테스트 그룹',
    description: '설명',
    category: 'study',
    isPublic: true,
    maxMembers: 30
  };

  it('should accept valid group data', () => {
    expect(() => validateGroupData(validData)).not.toThrow();
  });

  it('should reject missing required fields', () => {
    const invalidData = {
      description: '설명만 있음'
    };

    expect(() => validateGroupData(invalidData)).toThrow(GroupException);
  });

  it('should use default values for optional fields', () => {
    const minimalData = {
      name: '테스트 그룹',
      category: 'study'
    };

    const result = validateGroupData(minimalData);
    expect(result.isPublic).toBeDefined();
    expect(result.maxMembers).toBeDefined();
  });
});

describe('validateRole', () => {
  it('should accept valid roles', () => {
    const validRoles = ['OWNER', 'ADMIN', 'MEMBER'];

    validRoles.forEach(role => {
      expect(() => validateRole(role)).not.toThrow();
    });
  });

  it('should reject invalid role', () => {
    expect(() => validateRole('INVALID')).toThrow(GroupException);
    expect(() => validateRole('')).toThrow(GroupException);
    expect(() => validateRole(null)).toThrow(GroupException);
  });
});

describe('validateMemberStatus', () => {
  it('should accept valid member statuses', () => {
    const validStatuses = ['PENDING', 'ACTIVE', 'LEFT', 'KICKED'];

    validStatuses.forEach(status => {
      expect(() => validateMemberStatus(status)).not.toThrow();
    });
  });

  it('should reject invalid status', () => {
    expect(() => validateMemberStatus('INVALID')).toThrow(GroupException);
    expect(() => validateMemberStatus('')).toThrow(GroupException);
  });
});

describe('validateInviteCode', () => {
  it('should accept valid invite code', () => {
    expect(() => validateInviteCode('ABC123DEF456')).not.toThrow();
  });

  it('should reject empty code', () => {
    expect(() => validateInviteCode('')).toThrow(GroupException);
    expect(() => validateInviteCode(null)).toThrow(GroupException);
  });

  it('should reject too short code', () => {
    expect(() => validateInviteCode('ABC')).toThrow(GroupException);
  });

  it('should reject invalid format', () => {
    // 특수문자 포함
    expect(() => validateInviteCode('ABC-123-DEF!')).toThrow(GroupException);
  });
});

describe('validateEmailFormat', () => {
  it('should accept valid email', () => {
    expect(() => validateEmailFormat('test@example.com')).not.toThrow();
    expect(() => validateEmailFormat('user.name+tag@example.co.kr')).not.toThrow();
  });

  it('should reject invalid email format', () => {
    expect(() => validateEmailFormat('invalid')).toThrow(GroupException);
    expect(() => validateEmailFormat('@example.com')).toThrow(GroupException);
    expect(() => validateEmailFormat('test@')).toThrow(GroupException);
  });

  it('should reject empty email', () => {
    expect(() => validateEmailFormat('')).toThrow(GroupException);
    expect(() => validateEmailFormat(null)).toThrow(GroupException);
  });
});

