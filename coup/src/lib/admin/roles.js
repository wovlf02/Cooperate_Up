/**
 * 관리자 역할 관리
 */

import { PrismaClient } from '@prisma/client'
import { getDefaultPermissions, compareRoles } from './permissions'

const prisma = new PrismaClient()

/**
 * 역할 정보 (UI 표시용)
 */
export const ROLE_INFO = {
  VIEWER: {
    name: '뷰어',
    description: '데이터 조회만 가능',
    color: '#6B7280', // gray
    level: 1,
  },
  MODERATOR: {
    name: '모더레이터',
    description: '콘텐츠 관리 및 신고 처리',
    color: '#3B82F6', // blue
    level: 2,
  },
  ADMIN: {
    name: '관리자',
    description: '사용자 및 스터디 관리',
    color: '#8B5CF6', // purple
    level: 3,
  },
  SUPER_ADMIN: {
    name: '슈퍼 관리자',
    description: '모든 권한 및 시스템 설정',
    color: '#EF4444', // red
    level: 4,
  },
}

/**
 * 역할 업데이트
 * @param {string} userId - 대상 사용자 ID
 * @param {string} newRole - 새 역할
 * @param {string} updatedBy - 변경하는 관리자 ID
 * @param {string} reason - 변경 사유
 */
export async function updateAdminRole(userId, newRole, updatedBy, reason = null) {
  try {
    const existingRole = await prisma.adminRole.findUnique({
      where: { userId },
    })

    if (!existingRole) {
      throw new Error('관리자 역할이 존재하지 않습니다.')
    }

    // 역할 변경 방향 확인
    const comparison = compareRoles(existingRole.role, newRole)

    // 새 권한 생성
    const newPermissions = getDefaultPermissions(newRole)

    // 역할 업데이트
    const updatedRole = await prisma.adminRole.update({
      where: { userId },
      data: {
        role: newRole,
        permissions: newPermissions,
        grantedBy: updatedBy,
        grantedAt: new Date(),
      },
    })

    // 로그 기록
    await prisma.adminLog.create({
      data: {
        adminId: updatedBy,
        action: 'ADMIN_UPDATE_ROLE',
        targetType: 'User',
        targetId: userId,
        before: {
          role: existingRole.role,
          permissions: existingRole.permissions,
        },
        after: {
          role: newRole,
          permissions: newPermissions,
        },
        reason: reason || `Role ${comparison}: ${existingRole.role} → ${newRole}`,
      },
    })

    return updatedRole
  } catch (error) {
    console.error('Failed to update admin role:', error)
    throw error
  }
}

/**
 * 역할 만료일 설정
 * @param {string} userId
 * @param {Date|null} expiresAt
 * @param {string} updatedBy
 */
export async function setRoleExpiration(userId, expiresAt, updatedBy) {
  try {
    const updatedRole = await prisma.adminRole.update({
      where: { userId },
      data: { expiresAt },
    })

    // 로그 기록
    await prisma.adminLog.create({
      data: {
        adminId: updatedBy,
        action: 'ADMIN_UPDATE_EXPIRATION',
        targetType: 'User',
        targetId: userId,
        after: { expiresAt },
        reason: expiresAt
          ? `Set expiration to ${expiresAt.toISOString()}`
          : 'Removed expiration',
      },
    })

    return updatedRole
  } catch (error) {
    console.error('Failed to set role expiration:', error)
    throw error
  }
}

/**
 * 세부 권한 업데이트 (커스텀 권한)
 * @param {string} userId
 * @param {Object} permissions - 권한 객체
 * @param {string} updatedBy
 */
export async function updateCustomPermissions(userId, permissions, updatedBy) {
  try {
    const existingRole = await prisma.adminRole.findUnique({
      where: { userId },
    })

    if (!existingRole) {
      throw new Error('관리자 역할이 존재하지 않습니다.')
    }

    const updatedRole = await prisma.adminRole.update({
      where: { userId },
      data: { permissions },
    })

    // 로그 기록
    await prisma.adminLog.create({
      data: {
        adminId: updatedBy,
        action: 'ADMIN_UPDATE_PERMISSIONS',
        targetType: 'User',
        targetId: userId,
        before: { permissions: existingRole.permissions },
        after: { permissions },
        reason: 'Updated custom permissions',
      },
    })

    return updatedRole
  } catch (error) {
    console.error('Failed to update custom permissions:', error)
    throw error
  }
}

/**
 * 역할 통계
 */
export async function getRoleStatistics() {
  try {
    const now = new Date()

    const stats = await prisma.adminRole.groupBy({
      by: ['role'],
      _count: true,
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      },
    })

    const expiringSoon = await prisma.adminRole.count({
      where: {
        expiresAt: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 이내
          gte: now,
        },
      },
    })

    const expired = await prisma.adminRole.count({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    })

    return {
      byRole: stats.reduce((acc, stat) => {
        acc[stat.role] = stat._count
        return acc
      }, {}),
      expiringSoon,
      expired,
      total: stats.reduce((sum, stat) => sum + stat._count, 0),
    }
  } catch (error) {
    console.error('Failed to get role statistics:', error)
    return {
      byRole: {},
      expiringSoon: 0,
      expired: 0,
      total: 0,
    }
  }
}

/**
 * 만료된 역할 정리
 * @returns {Promise<number>} 삭제된 역할 수
 */
export async function cleanupExpiredRoles() {
  try {
    const result = await prisma.adminRole.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    console.log(`Cleaned up ${result.count} expired admin roles`)
    return result.count
  } catch (error) {
    console.error('Failed to cleanup expired roles:', error)
    return 0
  }
}

/**
 * 역할 변경 이력 조회
 * @param {string} userId
 * @param {number} limit
 */
export async function getRoleHistory(userId, limit = 10) {
  try {
    const history = await prisma.adminLog.findMany({
      where: {
        targetType: 'User',
        targetId: userId,
        action: {
          in: ['ADMIN_GRANT_ROLE', 'ADMIN_UPDATE_ROLE', 'ADMIN_REVOKE_ROLE'],
        },
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return history
  } catch (error) {
    console.error('Failed to get role history:', error)
    return []
  }
}

/**
 * 역할 검증
 * @param {string} role
 * @returns {boolean}
 */
export function isValidRole(role) {
  return ['VIEWER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(role)
}

/**
 * 역할 비교 (레벨 기반)
 * @param {string} role1
 * @param {string} role2
 * @returns {number} -1: role1 < role2, 0: equal, 1: role1 > role2
 */
export function compareRoleLevel(role1, role2) {
  const level1 = ROLE_INFO[role1]?.level || 0
  const level2 = ROLE_INFO[role2]?.level || 0

  if (level1 < level2) return -1
  if (level1 > level2) return 1
  return 0
}

/**
 * 역할을 부여할 수 있는지 확인
 * @param {string} granterRole - 부여하는 사람의 역할
 * @param {string} targetRole - 부여하려는 역할
 * @returns {boolean}
 */
export function canGrantRole(granterRole, targetRole) {
  // SUPER_ADMIN만 모든 역할 부여 가능
  if (granterRole === 'SUPER_ADMIN') {
    return true
  }

  // ADMIN은 MODERATOR와 VIEWER만 부여 가능
  if (granterRole === 'ADMIN') {
    return ['MODERATOR', 'VIEWER'].includes(targetRole)
  }

  // 나머지는 역할 부여 불가
  return false
}

