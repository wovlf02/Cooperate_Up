/**
 * study-helpers.js
 *
 * Study 도메인 헬퍼 함수 모음
 * StudyException과 통합된 에러 처리
 *
 * @module lib/helpers/study-helpers
 * @author CoUp Team
 * @updated 2025-12-01
 */

import {
  StudyPermissionException,
  StudyMemberException,
  StudyBusinessException,
  StudyDatabaseException
} from '@/lib/exceptions/study';
import { StudyLogger } from '@/lib/logging/studyLogger';

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

/**
 * 멤버 수정 권한 확인
 *
 * @param {string} modifierRole - 수정하려는 사람의 역할
 * @param {string} targetRole - 수정 대상의 역할
 * @returns {boolean} 수정 가능 여부
 * @throws {StudyPermissionException}
 */
export function checkModifyMemberPermission(modifierRole, targetRole) {
  const canModify = compareRoles(modifierRole, targetRole) > 0;

  if (!canModify) {
    throw StudyPermissionException.insufficientPermission(
      null,
      modifierRole,
      targetRole
    );
  }

  return true;
}

/**
 * 역할 변경 권한 확인
 *
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 변경 실행자 ID
 * @param {string} modifierRole - 변경하려는 사람의 역할
 * @param {string} currentRole - 현재 역할
 * @param {string} newRole - 새로운 역할
 * @throws {StudyPermissionException}
 */
export function checkRoleChangePermission(studyId, userId, modifierRole, currentRole, newRole) {
  // OWNER만 역할 변경 가능
  if (modifierRole !== 'OWNER') {
    throw StudyPermissionException.ownerPermissionRequired(userId, modifierRole);
  }

  // OWNER의 역할은 변경 불가
  if (currentRole === 'OWNER') {
    throw StudyPermissionException.ownerRoleChangeNotAllowed(studyId);
  }

  // OWNER로 변경 불가 (소유권 이전 API 사용)
  if (newRole === 'OWNER') {
    throw StudyPermissionException.cannotAssignOwnerRole(userId);
  }

  return true;
}

/**
 * 멤버 권한 확인
 *
 * @param {Object} member - 멤버 정보
 * @param {string} requiredRole - 필요한 역할
 * @param {string} studyId - 스터디 ID
 * @throws {StudyPermissionException|StudyMemberException}
 */
export function checkMemberPermission(member, requiredRole, studyId) {
  if (!member) {
    throw StudyPermissionException.notStudyMember(null, studyId);
  }

  if (member.status !== 'ACTIVE') {
    throw StudyPermissionException.notActiveMember(member.userId, studyId, member.status);
  }

  if (compareRoles(member.role, requiredRole) < 0) {
    if (requiredRole === 'OWNER') {
      throw StudyPermissionException.ownerPermissionRequired(member.userId, member.role);
    } else if (requiredRole === 'ADMIN') {
      throw StudyPermissionException.adminPermissionRequired(member.userId, member.role);
    }
  }

  return true;
}

// ============================================
// 정원 관리
// ============================================

/**
 * 스터디 정원 확인
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @returns {Promise<Object>} { hasCapacity: boolean, current: number, max: number }
 * @throws {StudyDatabaseException}
 */
export async function checkStudyCapacity(prisma, studyId) {
  try {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
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

    if (!study) {
      throw StudyDatabaseException.studyNotFound(studyId);
    }

    const currentMembers = study._count.members;
    const maxMembers = study.maxMembers;

    return {
      hasCapacity: currentMembers < maxMembers,
      current: currentMembers,
      max: maxMembers
    };
  } catch (error) {
    if (error.code?.startsWith('STUDY-')) {
      throw error;
    }
    StudyLogger.logError(error, { studyId, action: 'checkStudyCapacity' });
    throw StudyDatabaseException.queryFailed('checkStudyCapacity', error.message);
  }
}

/**
 * 스터디 정원 여유 계산
 *
 * @param {number} currentMembers - 현재 멤버 수
 * @param {number} maxMembers - 최대 멤버 수
 * @returns {number} 여유 인원
 */
export function calculateCapacityRemaining(currentMembers, maxMembers) {
  return Math.max(0, maxMembers - currentMembers);
}

/**
 * 정원 마감 여부 확인
 *
 * @param {number} currentMembers - 현재 멤버 수
 * @param {number} maxMembers - 최대 멤버 수
 * @returns {boolean} 정원 마감 여부
 */
export function isStudyFull(currentMembers, maxMembers) {
  return currentMembers >= maxMembers;
}

/**
 * 정원 확인 및 예외 발생
 *
 * @param {number} currentMembers - 현재 멤버 수
 * @param {number} maxMembers - 최대 멤버 수
 * @param {string} studyId - 스터디 ID
 * @throws {StudyBusinessException}
 */
export function validateStudyCapacity(currentMembers, maxMembers, studyId) {
  if (isStudyFull(currentMembers, maxMembers)) {
    throw StudyBusinessException.studyCapacityExceeded(studyId, currentMembers, maxMembers);
  }
  return true;
}

// ============================================
// 멤버 상태 관리
// ============================================

/**
 * 멤버 상태별 재가입 가능 여부 확인
 *
 * @param {string} status - 멤버 상태 (PENDING, ACTIVE, LEFT, KICKED)
 * @param {string} userId - 사용자 ID
 * @param {string} studyId - 스터디 ID
 * @throws {StudyMemberException|StudyBusinessException}
 */
export function checkRejoinEligibility(status, userId, studyId) {
  switch (status) {
    case 'ACTIVE':
      throw StudyMemberException.alreadyMember(userId, studyId);

    case 'PENDING':
      throw StudyBusinessException.applicationAlreadyExists(studyId, userId);

    case 'KICKED':
      throw StudyMemberException.kickedMemberCannotRejoin(userId, studyId);

    case 'LEFT':
      // 재가입 가능
      return true;

    default:
      return true;
  }
}

/**
 * 스터디 가입 가능 여부 종합 확인
 *
 * @param {Object} study - 스터디 정보
 * @param {Object} [existingMember] - 기존 멤버 정보 (있을 경우)
 * @throws {StudyBusinessException|StudyMemberException}
 */
export function validateJoinEligibility(study, existingMember = null) {
  // 1. 모집 중인지 확인
  if (!study.isRecruiting) {
    throw StudyBusinessException.studyNotRecruiting(study.id);
  }

  // 2. 정원 확인
  const currentMembers = study._count?.members || study.currentMembers || 0;
  validateStudyCapacity(currentMembers, study.maxMembers, study.id);

  // 3. 기존 멤버 상태 확인
  if (existingMember) {
    checkRejoinEligibility(existingMember.status, existingMember.userId, study.id);
  }

  return true;
}

// ============================================
// 멤버 조회 헬퍼
// ============================================

/**
 * 스터디 멤버 조회
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object|null>} 멤버 정보 또는 null
 * @throws {StudyDatabaseException}
 */
export async function findStudyMember(prisma, studyId, userId) {
  try {
    return await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });
  } catch (error) {
    StudyLogger.logError(error, { studyId, userId, action: 'findStudyMember' });
    throw StudyDatabaseException.queryFailed('findStudyMember', error.message);
  }
}

/**
 * 활성 멤버 여부 확인
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @returns {Promise<boolean>} 활성 멤버 여부
 */
export async function isActiveMember(prisma, studyId, userId) {
  const member = await findStudyMember(prisma, studyId, userId);
  return member?.status === 'ACTIVE';
}

/**
 * 스터디 소유자 확인
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @returns {Promise<boolean>} 소유자 여부
 */
export async function isStudyOwner(prisma, studyId, userId) {
  const member = await findStudyMember(prisma, studyId, userId);
  return member?.role === 'OWNER' && member?.status === 'ACTIVE';
}

/**
 * 스터디 관리자 확인 (OWNER 또는 ADMIN)
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @returns {Promise<boolean>} 관리자 여부
 */
export async function isStudyAdmin(prisma, studyId, userId) {
  const member = await findStudyMember(prisma, studyId, userId);
  return member?.status === 'ACTIVE' && ['OWNER', 'ADMIN'].includes(member?.role);
}

/**
 * 멤버 조회 및 존재 확인
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 멤버 정보
 * @throws {StudyMemberException}
 */
export async function findStudyMemberOrFail(prisma, studyId, userId) {
  const member = await findStudyMember(prisma, studyId, userId);

  if (!member) {
    throw StudyMemberException.memberNotFound(userId, studyId);
  }

  return member;
}

// ============================================
// 스터디 정보 조회
// ============================================

/**
 * 스터디 상세 정보 조회
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @returns {Promise<Object|null>} 스터디 정보
 * @throws {StudyDatabaseException}
 */
export async function getStudyDetail(prisma, studyId) {
  try {
    return await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    });
  } catch (error) {
    StudyLogger.logError(error, { studyId, action: 'getStudyDetail' });
    throw StudyDatabaseException.queryFailed('getStudyDetail', error.message);
  }
}

/**
 * 스터디 조회 및 존재 확인
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @returns {Promise<Object>} 스터디 정보
 * @throws {StudyDatabaseException}
 */
export async function getStudyOrFail(prisma, studyId) {
  const study = await getStudyDetail(prisma, studyId);

  if (!study) {
    throw StudyDatabaseException.studyNotFound(studyId);
  }

  return study;
}

/**
 * 스터디 멤버 목록 조회
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {Object} options - 조회 옵션
 * @returns {Promise<Array>} 멤버 목록
 * @throws {StudyDatabaseException}
 */
export async function getStudyMembers(prisma, studyId, options = {}) {
  try {
    const { status = 'ACTIVE', role = null, page = 1, limit = 20 } = options;

    const where = {
      studyId,
      ...(status && { status }),
      ...(role && { role })
    };

    return await prisma.studyMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: [
        { role: 'desc' },
        { joinedAt: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });
  } catch (error) {
    StudyLogger.logError(error, { studyId, options, action: 'getStudyMembers' });
    throw StudyDatabaseException.queryFailed('getStudyMembers', error.message);
  }
}

// ============================================
// 멤버 수 업데이트
// ============================================

/**
 * 스터디 멤버 수 재계산 및 업데이트
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @returns {Promise<Object>} 업데이트된 스터디 정보
 * @throws {StudyDatabaseException}
 */
export async function recalculateMemberCount(prisma, studyId) {
  try {
    const memberCount = await prisma.studyMember.count({
      where: {
        studyId,
        status: 'ACTIVE'
      }
    });

    return await prisma.study.update({
      where: { id: studyId },
      data: { currentMembers: memberCount }
    });
  } catch (error) {
    StudyLogger.logError(error, { studyId, action: 'recalculateMemberCount' });
    throw StudyDatabaseException.updateFailed('recalculateMemberCount', error.message);
  }
}

/**
 * 멤버 수 증가
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {number} increment - 증가량 (기본값: 1)
 * @returns {Promise<Object>} 업데이트된 스터디 정보
 * @throws {StudyDatabaseException}
 */
export async function incrementMemberCount(prisma, studyId, increment = 1) {
  try {
    return await prisma.study.update({
      where: { id: studyId },
      data: {
        currentMembers: {
          increment
        }
      }
    });
  } catch (error) {
    StudyLogger.logError(error, { studyId, increment, action: 'incrementMemberCount' });
    throw StudyDatabaseException.updateFailed('incrementMemberCount', error.message);
  }
}

/**
 * 멤버 수 감소
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {number} decrement - 감소량 (기본값: 1)
 * @returns {Promise<Object>} 업데이트된 스터디 정보
 * @throws {StudyDatabaseException}
 */
export async function decrementMemberCount(prisma, studyId, decrement = 1) {
  try {
    return await prisma.study.update({
      where: { id: studyId },
      data: {
        currentMembers: {
          decrement
        }
      }
    });
  } catch (error) {
    StudyLogger.logError(error, { studyId, decrement, action: 'decrementMemberCount' });
    throw StudyDatabaseException.updateFailed('decrementMemberCount', error.message);
  }
}

// ============================================
// 가입 신청 관리
// ============================================

/**
 * 가입 신청 조회
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object|null>} 가입 신청 정보
 * @throws {StudyDatabaseException}
 */
export async function findJoinApplication(prisma, studyId, userId) {
  try {
    return await prisma.studyMember.findFirst({
      where: {
        studyId,
        userId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });
  } catch (error) {
    StudyLogger.logError(error, { studyId, userId, action: 'findJoinApplication' });
    throw StudyDatabaseException.queryFailed('findJoinApplication', error.message);
  }
}

/**
 * 대기 중인 가입 신청 목록 조회
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @returns {Promise<Array>} 가입 신청 목록
 * @throws {StudyDatabaseException}
 */
export async function getPendingApplications(prisma, studyId) {
  try {
    return await prisma.studyMember.findMany({
      where: {
        studyId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  } catch (error) {
    StudyLogger.logError(error, { studyId, action: 'getPendingApplications' });
    throw StudyDatabaseException.queryFailed('getPendingApplications', error.message);
  }
}

// ============================================
// 상태 전이 검증
// ============================================

/**
 * 멤버 상태 전이 유효성 검증
 *
 * @param {string} currentStatus - 현재 상태
 * @param {string} newStatus - 새 상태
 * @param {string} userId - 사용자 ID
 * @param {string} studyId - 스터디 ID
 * @throws {StudyBusinessException}
 */
export function validateMemberStatusTransition(currentStatus, newStatus, userId, studyId) {
  const validTransitions = {
    'PENDING': ['ACTIVE', 'REJECTED'],
    'ACTIVE': ['LEFT', 'KICKED'],
    'LEFT': ['PENDING', 'ACTIVE'],
    'KICKED': [],
    'REJECTED': ['PENDING']
  };

  const allowed = validTransitions[currentStatus];

  if (!allowed || !allowed.includes(newStatus)) {
    throw StudyBusinessException.invalidMemberStatusTransition(
      currentStatus,
      newStatus,
      studyId,
      userId
    );
  }

  return true;
}

// ============================================
// 트랜잭션 헬퍼
// ============================================

/**
 * 스터디 트랜잭션 래퍼
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {Function} callback - 트랜잭션 콜백
 * @returns {Promise<any>} 트랜잭션 결과
 * @throws {StudyDatabaseException}
 *
 * @example
 * await withStudyTransaction(prisma, async (tx) => {
 *   await tx.studyMember.create(...);
 *   await tx.study.update(...);
 * });
 */
export async function withStudyTransaction(prisma, callback) {
  try {
    return await prisma.$transaction(callback);
  } catch (error) {
    StudyLogger.logError(error, { action: 'withStudyTransaction' });
    throw StudyDatabaseException.transactionFailed(error.message);
  }
}

// Export legacy compatibility (기존 study-helpers.js 호환성)
export {
  findStudyMember as findJoinRequest,
  getPendingApplications as getPendingJoinRequests
};

