/**
 * study-helpers.js
 *
 * 스터디 관련 유틸리티 헬퍼 함수 모음
 *
 * 사용 예시:
 * ```js
 * import { checkStudyCapacity, canModifyMember, getRoleHierarchy } from '@/lib/study-helpers'
 *
 * const hasCapacity = await checkStudyCapacity(prisma, studyId)
 * const canKick = canModifyMember(kickerRole, targetRole)
 * ```
 *
 * @module lib/study-helpers
 */

import { STUDY_ERRORS } from '@/lib/exceptions/study-errors'

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
}

/**
 * 역할 계층 순위 가져오기
 *
 * @param {string} role - 역할 (OWNER, ADMIN, MEMBER)
 * @returns {number} 계층 순위
 */
export function getRoleHierarchy(role) {
  return ROLE_HIERARCHY[role] || 0
}

/**
 * 역할 비교
 *
 * @param {string} role1 - 비교할 역할 1
 * @param {string} role2 - 비교할 역할 2
 * @returns {number} 양수: role1이 높음, 0: 같음, 음수: role2가 높음
 */
export function compareRoles(role1, role2) {
  return getRoleHierarchy(role1) - getRoleHierarchy(role2)
}

/**
 * 멤버 수정 권한 확인
 *
 * @param {string} modifierRole - 수정하려는 사람의 역할
 * @param {string} targetRole - 수정 대상의 역할
 * @returns {boolean} 수정 가능 여부
 *
 * @example
 * canModifyMember('ADMIN', 'MEMBER') // true
 * canModifyMember('ADMIN', 'ADMIN') // false
 * canModifyMember('MEMBER', 'ADMIN') // false
 */
export function canModifyMember(modifierRole, targetRole) {
  // 자신보다 낮은 권한만 수정 가능
  return compareRoles(modifierRole, targetRole) > 0
}

/**
 * 역할 변경 가능 여부 확인
 *
 * @param {string} modifierRole - 변경하려는 사람의 역할
 * @param {string} currentRole - 현재 역할
 * @param {string} newRole - 새로운 역할
 * @returns {Object} { allowed: boolean, reason?: string }
 */
export function canChangeRole(modifierRole, currentRole, newRole) {
  // OWNER만 역할 변경 가능
  if (modifierRole !== 'OWNER') {
    return {
      allowed: false,
      reason: 'OWNER만 역할을 변경할 수 있습니다'
    }
  }

  // OWNER의 역할은 변경 불가
  if (currentRole === 'OWNER') {
    return {
      allowed: false,
      reason: 'OWNER의 역할은 변경할 수 없습니다. 소유권 이전을 사용하세요'
    }
  }

  // OWNER로 변경 불가 (소유권 이전 API 사용)
  if (newRole === 'OWNER') {
    return {
      allowed: false,
      reason: 'OWNER로 변경할 수 없습니다. 소유권 이전을 사용하세요'
    }
  }

  return { allowed: true }
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
 */
export async function checkStudyCapacity(prisma, studyId) {
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
  })

  if (!study) {
    throw new Error('스터디를 찾을 수 없습니다')
  }

  const currentMembers = study._count.members
  const maxMembers = study.maxMembers

  return {
    hasCapacity: currentMembers < maxMembers,
    current: currentMembers,
    max: maxMembers
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
  return Math.max(0, maxMembers - currentMembers)
}

/**
 * 정원 마감 여부 확인
 *
 * @param {number} currentMembers - 현재 멤버 수
 * @param {number} maxMembers - 최대 멤버 수
 * @returns {boolean} 정원 마감 여부
 */
export function isStudyFull(currentMembers, maxMembers) {
  return currentMembers >= maxMembers
}

// ============================================
// 멤버 상태 관리
// ============================================

/**
 * 멤버 상태별 재가입 가능 여부 확인
 *
 * @param {string} status - 멤버 상태 (PENDING, ACTIVE, LEFT, KICKED)
 * @returns {Object} { canRejoin: boolean, reason?: string }
 */
export function canRejoinStudy(status) {
  switch (status) {
    case 'ACTIVE':
      return {
        canRejoin: false,
        reason: '이미 가입된 스터디입니다'
      }

    case 'PENDING':
      return {
        canRejoin: false,
        reason: '가입 승인 대기 중입니다'
      }

    case 'KICKED':
      return {
        canRejoin: false,
        reason: '강퇴된 스터디입니다. 스터디장에게 문의하세요'
      }

    case 'LEFT':
      return {
        canRejoin: true,
        needsConfirmation: true,
        message: '이전에 탈퇴한 스터디입니다. 재가입하시겠습니까?'
      }

    default:
      return { canRejoin: true }
  }
}

/**
 * 멤버 가입 가능 여부 종합 확인
 *
 * @param {Object} study - 스터디 정보
 * @param {Object} [existingMember] - 기존 멤버 정보 (있을 경우)
 * @returns {Object} { allowed: boolean, reason?: string, needsConfirmation?: boolean }
 */
export function canJoinStudy(study, existingMember = null) {
  // 1. 모집 중인지 확인
  if (!study.isRecruiting) {
    return {
      allowed: false,
      reason: '현재 모집 중이 아닙니다',
      errorCode: 'STUDY_NOT_RECRUITING'
    }
  }

  // 2. 정원 확인
  const currentMembers = study._count?.members || 0
  if (isStudyFull(currentMembers, study.maxMembers)) {
    return {
      allowed: false,
      reason: '정원이 마감되었습니다',
      errorCode: 'STUDY_FULL'
    }
  }

  // 3. 기존 멤버 상태 확인
  if (existingMember) {
    const rejoinCheck = canRejoinStudy(existingMember.status)

    if (!rejoinCheck.canRejoin) {
      return {
        allowed: false,
        reason: rejoinCheck.reason,
        errorCode: existingMember.status === 'ACTIVE' ? 'ALREADY_MEMBER' :
                   existingMember.status === 'PENDING' ? 'PENDING_APPROVAL' :
                   existingMember.status === 'KICKED' ? 'KICKED_MEMBER' : null
      }
    }

    if (rejoinCheck.needsConfirmation) {
      return {
        allowed: true,
        needsConfirmation: true,
        message: rejoinCheck.message
      }
    }
  }

  return { allowed: true }
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
 */
export async function findStudyMember(prisma, studyId, userId) {
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
  })
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
  const member = await findStudyMember(prisma, studyId, userId)
  return member?.status === 'ACTIVE'
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
  const member = await findStudyMember(prisma, studyId, userId)
  return member?.role === 'OWNER' && member?.status === 'ACTIVE'
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
  const member = await findStudyMember(prisma, studyId, userId)
  return member?.status === 'ACTIVE' && ['OWNER', 'ADMIN'].includes(member?.role)
}

// ============================================
// 스터디 정보 조회
// ============================================

/**
 * 스터디 상세 정보 조회 (멤버용)
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @returns {Promise<Object|null>} 스터디 정보
 */
export async function getStudyDetail(prisma, studyId) {
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
  })
}

/**
 * 스터디 멤버 목록 조회
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {Object} options - 조회 옵션
 * @returns {Promise<Array>} 멤버 목록
 */
export async function getStudyMembers(prisma, studyId, options = {}) {
  const { status = 'ACTIVE', role = null, page = 1, limit = 20 } = options

  const where = {
    studyId,
    ...(status && { status }),
    ...(role && { role })
  }

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
      { role: 'desc' }, // OWNER > ADMIN > MEMBER
      { joinedAt: 'asc' }
    ],
    skip: (page - 1) * limit,
    take: limit
  })
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
 */
export async function recalculateMemberCount(prisma, studyId) {
  const memberCount = await prisma.studyMember.count({
    where: {
      studyId,
      status: 'ACTIVE'
    }
  })

  return await prisma.study.update({
    where: { id: studyId },
    data: { currentMembers: memberCount }
  })
}

/**
 * 멤버 수 증가
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {number} increment - 증가량 (기본값: 1)
 * @returns {Promise<Object>} 업데이트된 스터디 정보
 */
export async function incrementMemberCount(prisma, studyId, increment = 1) {
  return await prisma.study.update({
    where: { id: studyId },
    data: {
      currentMembers: {
        increment
      }
    }
  })
}

/**
 * 멤버 수 감소
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {number} decrement - 감소량 (기본값: 1)
 * @returns {Promise<Object>} 업데이트된 스터디 정보
 */
export async function decrementMemberCount(prisma, studyId, decrement = 1) {
  return await prisma.study.update({
    where: { id: studyId },
    data: {
      currentMembers: {
        decrement
      }
    }
  })
}

// ============================================
// 가입 요청 관리
// ============================================

/**
 * 가입 요청 조회
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object|null>} 가입 요청 정보
 */
export async function findJoinRequest(prisma, studyId, userId) {
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
  })
}

/**
 * 대기 중인 가입 요청 목록 조회
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @returns {Promise<Array>} 가입 요청 목록
 */
export async function getPendingJoinRequests(prisma, studyId) {
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
  })
}

// ============================================
// 초대 코드 관리
// ============================================

/**
 * 랜덤 초대 코드 생성
 *
 * @param {number} length - 코드 길이 (기본값: 8)
 * @returns {string} 초대 코드
 */
export function generateInviteCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''

  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return code
}

/**
 * 초대 코드 유효성 확인
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} inviteCode - 초대 코드
 * @returns {Promise<Object>} { valid: boolean, study?: Object, reason?: string }
 */
export async function validateInviteCode(prisma, inviteCode) {
  const study = await prisma.study.findUnique({
    where: { inviteCode },
    include: {
      _count: {
        select: {
          members: {
            where: { status: 'ACTIVE' }
          }
        }
      }
    }
  })

  if (!study) {
    return {
      valid: false,
      reason: '유효하지 않은 초대 코드입니다'
    }
  }

  // 모집 중인지 확인
  if (!study.isRecruiting) {
    return {
      valid: false,
      reason: '현재 모집 중이 아닙니다',
      study
    }
  }

  // 정원 확인
  if (isStudyFull(study._count.members, study.maxMembers)) {
    return {
      valid: false,
      reason: '정원이 마감되었습니다',
      study
    }
  }

  return { valid: true, study }
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 스터디 존재 확인
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @returns {Promise<boolean>} 존재 여부
 */
export async function studyExists(prisma, studyId) {
  const count = await prisma.study.count({
    where: { id: studyId }
  })

  return count > 0
}

/**
 * 스터디 이름 중복 확인
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} name - 스터디 이름
 * @param {string} [excludeId] - 제외할 스터디 ID (수정 시)
 * @returns {Promise<boolean>} 중복 여부
 */
export async function isDuplicateStudyName(prisma, name, excludeId = null) {
  const where = {
    name: {
      equals: name,
      mode: 'insensitive' // 대소문자 무시
    }
  }

  if (excludeId) {
    where.id = { not: excludeId }
  }

  const count = await prisma.study.count({ where })

  return count > 0
}

/**
 * 역할 표시 이름 가져오기
 *
 * @param {string} role - 역할 (OWNER, ADMIN, MEMBER)
 * @returns {string} 한글 표시 이름
 */
export function getRoleDisplayName(role) {
  const displayNames = {
    OWNER: '스터디장',
    ADMIN: '관리자',
    MEMBER: '멤버'
  }

  return displayNames[role] || '멤버'
}

/**
 * 상태 표시 이름 가져오기
 *
 * @param {string} status - 상태 (PENDING, ACTIVE, LEFT, KICKED)
 * @returns {string} 한글 표시 이름
 */
export function getStatusDisplayName(status) {
  const displayNames = {
    PENDING: '승인 대기',
    ACTIVE: '활동 중',
    LEFT: '탈퇴',
    KICKED: '강퇴'
  }

  return displayNames[status] || '알 수 없음'
}

