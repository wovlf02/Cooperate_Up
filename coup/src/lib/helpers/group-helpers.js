/**
 * group-helpers.js
 *
 * Group 도메인 헬퍼 함수 모음
 * GroupException과 통합된 에러 처리
 *
 * @module lib/helpers/group-helpers
 * @author CoUp Team
 * @created 2025-12-03
 */

import {
  GroupException,
  GroupPermissionException,
  GroupMemberException,
  GroupInviteException,
  GroupBusinessException
} from '@/lib/exceptions/group';
import { GroupLogger } from '@/lib/logging/groupLogger';

// ============================================
// 응답 포맷팅
// ============================================

/**
 * 그룹 정보를 클라이언트 응답 형식으로 변환
 *
 * @param {Object} group - 그룹 객체
 * @returns {Object} 포맷된 그룹 정보
 *
 * @example
 * const formatted = formatGroupResponse(group);
 */
export function formatGroupResponse(group) {
  if (!group) return null;

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    category: group.category,
    isPublic: group.isPublic,
    isRecruiting: group.isRecruiting,
    maxMembers: group.maxMembers,
    imageUrl: group.imageUrl,
    createdBy: group.createdBy,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    memberCount: group._count?.members || 0
  };
}

/**
 * 멤버 정보를 클라이언트 응답 형식으로 변환
 *
 * @param {Object} member - 멤버 객체
 * @returns {Object} 포맷된 멤버 정보
 *
 * @example
 * const formatted = formatMemberResponse(member);
 */
export function formatMemberResponse(member) {
  if (!member) return null;

  return {
    id: member.id,
    role: member.role,
    status: member.status,
    joinedAt: member.joinedAt,
    user: member.user ? {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatar: member.user.avatar
    } : null
  };
}

/**
 * 초대 정보를 클라이언트 응답 형식으로 변환
 *
 * @param {Object} invite - 초대 객체
 * @returns {Object} 포맷된 초대 정보
 *
 * @example
 * const formatted = formatInviteResponse(invite);
 */
export function formatInviteResponse(invite) {
  if (!invite) return null;

  return {
    id: invite.id,
    code: invite.code,
    status: invite.status,
    expiresAt: invite.expiresAt,
    maxUses: invite.maxUses,
    usedCount: invite.usedCount,
    createdBy: invite.createdBy,
    createdAt: invite.createdAt
  };
}

// ============================================
// 역할 계층 관리
// ============================================

/**
 * 역할 계층 순위
 * 숫자가 높을수록 높은 권한
 */
const ROLE_HIERARCHY = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1
};

/**
 * 역할 계층 순위 가져오기
 *
 * @param {string} role - 역할 (OWNER, ADMIN, MEMBER)
 * @returns {number} 계층 순위
 */
export function getRoleHierarchy(role) {
  return ROLE_HIERARCHY[role] || 0;
}

/**
 * 역할 비교
 *
 * @param {string} role1 - 비교할 역할 1
 * @param {string} role2 - 비교할 역할 2
 * @returns {number} 양수: role1이 높음, 0: 같음, 음수: role2가 높음
 */
export function compareRoles(role1, role2) {
  return getRoleHierarchy(role1) - getRoleHierarchy(role2);
}

// ============================================
// 1. 그룹 상태 관리 (5개)
// ============================================

/**
 * 그룹 존재 확인
 *
 * @param {string} groupId - 그룹 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 그룹 정보
 * @throws {GroupBusinessException}
 *
 * @example
 * const group = await checkGroupExists('group-123', prisma);
 */
export async function checkGroupExists(groupId, prisma) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      throw GroupBusinessException.groupNotFound(groupId);
    }

    if (group.deletedAt) {
      throw GroupBusinessException.groupDeleted(groupId);
    }

    return group;
  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      throw error;
    }
    GroupLogger.error('Failed to check group exists', { groupId, error: error.message });
    throw GroupBusinessException.databaseError('checkGroupExists', error.message);
  }
}

/**
 * 그룹 접근 가능 여부 확인
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 그룹 정보
 * @throws {GroupBusinessException|GroupPermissionException}
 *
 * @example
 * const group = await checkGroupAccessible('group-123', 'user-456', prisma);
 */
export async function checkGroupAccessible(groupId, userId, prisma) {
  const group = await checkGroupExists(groupId, prisma);

  // 비공개 그룹인 경우 멤버만 접근 가능
  if (!group.isPublic) {
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId }
      }
    });

    if (!member) {
      throw GroupBusinessException.privateGroupAccessDenied(groupId);
    }
  }

  return group;
}

/**
 * 그룹 모집 중인지 확인
 *
 * @param {string} groupId - 그룹 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<boolean>} 모집 중 여부
 * @throws {GroupBusinessException}
 *
 * @example
 * const isRecruiting = await checkGroupRecruiting('group-123', prisma);
 */
export async function checkGroupRecruiting(groupId, prisma) {
  const group = await checkGroupExists(groupId, prisma);

  if (!group.isRecruiting) {
    throw GroupBusinessException.recruitmentClosed(groupId);
  }

  return true;
}

/**
 * 그룹 정원 확인
 *
 * @param {string} groupId - 그룹 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} { hasCapacity: boolean, current: number, max: number }
 * @throws {GroupBusinessException}
 *
 * @example
 * const capacity = await checkGroupCapacity('group-123', prisma);
 */
export async function checkGroupCapacity(groupId, prisma) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        maxMembers: true,
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    });

    if (!group) {
      throw GroupBusinessException.groupNotFound(groupId);
    }

    const currentMembers = group._count.members;
    const maxMembers = group.maxMembers;

    if (currentMembers >= maxMembers) {
      throw GroupBusinessException.capacityFull(currentMembers, maxMembers);
    }

    return {
      hasCapacity: currentMembers < maxMembers,
      current: currentMembers,
      max: maxMembers
    };
  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      throw error;
    }
    GroupLogger.error('Failed to check group capacity', { groupId, error: error.message });
    throw GroupBusinessException.databaseError('checkGroupCapacity', error.message);
  }
}

/**
 * 멤버 포함한 그룹 정보 가져오기
 *
 * @param {string} groupId - 그룹 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 그룹 + 멤버 정보
 * @throws {GroupBusinessException}
 *
 * @example
 * const groupWithMembers = await getGroupWithMembers('group-123', prisma);
 */
export async function getGroupWithMembers(groupId, prisma) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!group) {
      throw GroupBusinessException.groupNotFound(groupId);
    }

    return group;
  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      throw error;
    }
    GroupLogger.error('Failed to get group with members', { groupId, error: error.message });
    throw GroupBusinessException.databaseError('getGroupWithMembers', error.message);
  }
}

// ============================================
// 2. 멤버 역할 관리 (5개)
// ============================================

/**
 * 멤버 역할 가져오기
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<string>} 멤버 역할
 * @throws {GroupMemberException}
 *
 * @example
 * const role = await getMemberRole('group-123', 'user-456', prisma);
 */
export async function getMemberRole(groupId, userId, prisma) {
  try {
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId }
      }
    });

    if (!member) {
      throw GroupMemberException.memberNotFound(userId);
    }

    if (member.status !== 'ACTIVE') {
      throw GroupMemberException.memberNotActive(userId, member.status);
    }

    return member.role;
  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      throw error;
    }
    GroupLogger.error('Failed to get member role', { groupId, userId, error: error.message });
    throw GroupBusinessException.databaseError('getMemberRole', error.message);
  }
}

/**
 * 멤버 존재 확인
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 멤버 정보
 * @throws {GroupMemberException}
 *
 * @example
 * const member = await checkMemberExists('group-123', 'user-456', prisma);
 */
export async function checkMemberExists(groupId, userId, prisma) {
  try {
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId }
      }
    });

    if (!member) {
      throw GroupMemberException.memberNotFound(userId);
    }

    return member;
  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      throw error;
    }
    GroupLogger.error('Failed to check member exists', { groupId, userId, error: error.message });
    throw GroupBusinessException.databaseError('checkMemberExists', error.message);
  }
}

/**
 * 강퇴된 멤버인지 확인
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<boolean>} 강퇴 여부
 * @throws {GroupMemberException}
 *
 * @example
 * await checkMemberKicked('group-123', 'user-456', prisma);
 */
export async function checkMemberKicked(groupId, userId, prisma) {
  try {
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        status: 'KICKED'
      }
    });

    if (member) {
      throw GroupMemberException.memberKicked(userId);
    }

    return false;
  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      throw error;
    }
    GroupLogger.error('Failed to check member kicked', { groupId, userId, error: error.message });
    throw GroupBusinessException.databaseError('checkMemberKicked', error.message);
  }
}

/**
 * 멤버 정원 확인
 *
 * @param {string} groupId - 그룹 ID
 * @param {number} newMemberCount - 추가할 멤버 수
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<boolean>} 정원 여유 여부
 * @throws {GroupBusinessException}
 *
 * @example
 * await checkMemberCapacity('group-123', 1, prisma);
 */
export async function checkMemberCapacity(groupId, newMemberCount, prisma) {
  const capacity = await checkGroupCapacity(groupId, prisma);

  if (capacity.current + newMemberCount > capacity.max) {
    throw GroupBusinessException.capacityFull(capacity.current, capacity.max);
  }

  return true;
}

/**
 * 멤버 역할 업데이트
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {string} newRole - 새 역할
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 업데이트된 멤버 정보
 * @throws {GroupMemberException}
 *
 * @example
 * const updated = await updateMemberRole('group-123', 'user-456', 'ADMIN', prisma);
 */
export async function updateMemberRole(groupId, userId, newRole, prisma) {
  try {
    const member = await checkMemberExists(groupId, userId, prisma);

    if (member.role === 'OWNER') {
      throw GroupPermissionException.cannotChangeOwnerRole();
    }

    const updated = await prisma.groupMember.update({
      where: {
        groupId_userId: { groupId, userId }
      },
      data: { role: newRole }
    });

    return updated;
  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      throw error;
    }
    GroupLogger.error('Failed to update member role', { groupId, userId, newRole, error: error.message });
    throw GroupBusinessException.databaseError('updateMemberRole', error.message);
  }
}

// ============================================
// 3. 초대 코드 생성/검증 (5개)
// ============================================

/**
 * 초대 코드 생성
 *
 * @returns {string} 12자리 영숫자 초대 코드
 *
 * @example
 * const code = generateInviteCode(); // 'ABC123DEF456'
 */
export function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

/**
 * 초대 코드 존재 확인
 *
 * @param {string} code - 초대 코드
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 초대 정보
 * @throws {GroupInviteException}
 *
 * @example
 * const invite = await validateInviteCodeExists('ABC123DEF456', prisma);
 */
export async function validateInviteCodeExists(code, prisma) {
  try {
    const invite = await prisma.groupInvite.findUnique({
      where: { code }
    });

    if (!invite) {
      throw GroupInviteException.invalidInviteCode(code);
    }

    return invite;
  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      throw error;
    }
    GroupLogger.error('Failed to validate invite code', { code, error: error.message });
    throw GroupBusinessException.databaseError('validateInviteCodeExists', error.message);
  }
}

/**
 * 초대 코드 만료 확인
 *
 * @param {string} inviteId - 초대 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<boolean>} 만료 여부
 * @throws {GroupInviteException}
 *
 * @example
 * await checkInviteCodeExpired('invite-123', prisma);
 */
export async function checkInviteCodeExpired(inviteId, prisma) {
  try {
    const invite = await prisma.groupInvite.findUnique({
      where: { id: inviteId }
    });

    if (!invite) {
      throw GroupInviteException.inviteNotFound(inviteId);
    }

    if (invite.expiresAt && new Date() > invite.expiresAt) {
      throw GroupInviteException.inviteExpired(inviteId);
    }

    return false;
  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      throw error;
    }
    GroupLogger.error('Failed to check invite expired', { inviteId, error: error.message });
    throw GroupBusinessException.databaseError('checkInviteCodeExpired', error.message);
  }
}

/**
 * 초대 코드 사용 여부 확인
 *
 * @param {string} inviteId - 초대 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<boolean>} 사용 여부
 * @throws {GroupInviteException}
 *
 * @example
 * await checkInviteCodeUsed('invite-123', prisma);
 */
export async function checkInviteCodeUsed(inviteId, prisma) {
  try {
    const invite = await prisma.groupInvite.findUnique({
      where: { id: inviteId }
    });

    if (!invite) {
      throw GroupInviteException.inviteNotFound(inviteId);
    }

    if (invite.maxUses && invite.usedCount >= invite.maxUses) {
      throw GroupInviteException.inviteUsageLimitReached(inviteId);
    }

    return false;
  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      throw error;
    }
    GroupLogger.error('Failed to check invite used', { inviteId, error: error.message });
    throw GroupBusinessException.databaseError('checkInviteCodeUsed', error.message);
  }
}

/**
 * 초대 사용 횟수 증가
 *
 * @param {string} inviteId - 초대 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 업데이트된 초대 정보
 * @throws {GroupInviteException}
 *
 * @example
 * await incrementInviteUsage('invite-123', prisma);
 */
export async function incrementInviteUsage(inviteId, prisma) {
  try {
    const invite = await prisma.groupInvite.update({
      where: { id: inviteId },
      data: {
        usedCount: {
          increment: 1
        }
      }
    });

    return invite;
  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      throw error;
    }
    GroupLogger.error('Failed to increment invite usage', { inviteId, error: error.message });
    throw GroupBusinessException.databaseError('incrementInviteUsage', error.message);
  }
}

// ============================================
// 4. 권한 체크 (5개)
// ============================================

/**
 * OWNER 권한 확인
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 멤버 정보
 * @throws {GroupPermissionException}
 *
 * @example
 * const member = await checkOwnerPermission('group-123', 'user-456', prisma);
 */
export async function checkOwnerPermission(groupId, userId, prisma) {
  const member = await checkMemberExists(groupId, userId, prisma);

  if (member.role !== 'OWNER') {
    throw GroupPermissionException.ownerPermissionRequired(userId, member.role);
  }

  return member;
}

/**
 * ADMIN 권한 확인
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 멤버 정보
 * @throws {GroupPermissionException}
 *
 * @example
 * const member = await checkAdminPermission('group-123', 'user-456', prisma);
 */
export async function checkAdminPermission(groupId, userId, prisma) {
  const member = await checkMemberExists(groupId, userId, prisma);

  if (!['OWNER', 'ADMIN'].includes(member.role)) {
    throw GroupPermissionException.adminPermissionRequired(userId, member.role);
  }

  return member;
}

/**
 * MEMBER 권한 확인 (그룹 멤버인지)
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 멤버 정보
 * @throws {GroupPermissionException}
 *
 * @example
 * const member = await checkMemberPermission('group-123', 'user-456', prisma);
 */
export async function checkMemberPermission(groupId, userId, prisma) {
  const member = await checkMemberExists(groupId, userId, prisma);

  if (member.status !== 'ACTIVE') {
    throw GroupPermissionException.notActiveMember(userId, member.status);
  }

  return member;
}

/**
 * 멤버 추가 가능 여부
 *
 * @param {string} memberRole - 멤버 역할
 * @returns {boolean} 추가 가능 여부
 *
 * @example
 * const canAdd = canAddMember('ADMIN'); // true
 */
export function canAddMember(memberRole) {
  return ['OWNER', 'ADMIN'].includes(memberRole);
}

/**
 * 멤버 제거 가능 여부
 *
 * @param {string} memberRole - 제거하려는 사람의 역할
 * @param {string} targetRole - 제거 대상의 역할
 * @returns {boolean} 제거 가능 여부
 *
 * @example
 * const canRemove = canRemoveMember('ADMIN', 'MEMBER'); // true
 */
export function canRemoveMember(memberRole, targetRole) {
  // OWNER는 누구나 제거 가능
  if (memberRole === 'OWNER') {
    return targetRole !== 'OWNER'; // OWNER는 제거 불가
  }

  // ADMIN은 MEMBER만 제거 가능
  if (memberRole === 'ADMIN') {
    return targetRole === 'MEMBER';
  }

  // MEMBER는 제거 불가
  return false;
}

// ============================================
// 5. 기타 유틸리티 (2개)
// ============================================


/**
 * 그룹 이름 중복 확인
 *
 * @param {string} name - 그룹 이름
 * @param {string} excludeGroupId - 제외할 그룹 ID (수정 시)
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<boolean>} 중복 여부
 * @throws {GroupBusinessException}
 *
 * @example
 * await checkDuplicateGroupName('알고리즘 스터디', null, prisma);
 */
export async function checkDuplicateGroupName(name, excludeGroupId, prisma) {
  try {
    const existing = await prisma.group.findFirst({
      where: {
        name,
        id: excludeGroupId ? { not: excludeGroupId } : undefined,
        deletedAt: null
      }
    });

    if (existing) {
      throw GroupBusinessException.groupNameExists(name);
    }

    return false;
  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      throw error;
    }
    GroupLogger.error('Failed to check duplicate group name', { name, error: error.message });
    throw GroupBusinessException.databaseError('checkDuplicateGroupName', error.message);
  }
}

/**
 * 활동 중인 작업 수 가져오기
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<number>} 활동 중인 작업 수
 *
 * @example
 * const count = await getActiveTaskCount('group-123', 'user-456', prisma);
 */
export async function getActiveTaskCount(groupId, userId, prisma) {
  try {
    // 그룹에 태스크 테이블이 있다면 활용
    // 현재는 기본 0 반환
    return 0;
  } catch (error) {
    GroupLogger.error('Failed to get active task count', { groupId, userId, error: error.message });
    return 0;
  }
}

/**
 * 그룹 접근 권한 확인 (비공개 그룹용)
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 그룹 정보
 * @throws {GroupPermissionException}
 */
export async function checkGroupAccess(groupId, userId, prisma) {
  return await checkGroupAccessible(groupId, userId, prisma);
}

/**
 * 그룹 권한 확인 (최소 역할 요구)
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {string} minimumRole - 최소 필요 역할 (OWNER, ADMIN, MEMBER)
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 멤버 정보
 * @throws {GroupPermissionException}
 *
 * @example
 * const member = await checkGroupPermission('group-123', 'user-456', 'ADMIN', prisma);
 */
export async function checkGroupPermission(groupId, userId, minimumRole, prisma) {
  const member = await checkMemberExists(groupId, userId, prisma);

  if (member.status !== 'ACTIVE') {
    throw GroupPermissionException.notActiveMember(userId, member.status);
  }

  const userRoleLevel = getRoleHierarchy(member.role);
  const requiredRoleLevel = getRoleHierarchy(minimumRole);

  if (userRoleLevel < requiredRoleLevel) {
    throw GroupPermissionException.insufficientRole(
      `${minimumRole} 이상의 권한이 필요합니다. 현재 권한: ${member.role}`
    );
  }

  return member;
}

/**
 * 멤버 관리 가능 여부 (역할 계층 기반)
 *
 * @param {string} managerRole - 관리자 역할
 * @param {string} targetRole - 대상 역할
 * @returns {boolean} 관리 가능 여부
 *
 * @example
 * const canManage = canManageMember('ADMIN', 'MEMBER'); // true
 */
export function canManageMember(managerRole, targetRole) {
  return canRemoveMember(managerRole, targetRole);
}

// ============================================
// Alias 함수들 (API 라우트 호환성)
// ============================================

/**
 * 그룹 멤버십 확인 (alias for checkMemberExists)
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} [prisma] - Prisma 클라이언트
 * @returns {Promise<Object>} 멤버 정보
 * @throws {GroupMemberException}
 */
export async function checkGroupMembership(groupId, userId, prisma) {
  return await checkMemberExists(groupId, userId, prisma);
}

/**
 * 강퇴 이력 확인 (alias for checkMemberKicked)
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} [prisma] - Prisma 클라이언트
 * @returns {Promise<void>}
 * @throws {GroupMemberException}
 */
export async function checkKickedHistory(groupId, userId, prisma) {
  return await checkMemberKicked(groupId, userId, prisma);
}
