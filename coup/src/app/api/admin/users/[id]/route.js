/**
 * 관리자 - 개별 사용자 조회 API
 * GET /api/admin/users/[id]
 * PATCH /api/admin/users/[id]
 * DELETE /api/admin/users/[id]
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'
import {
  AdminPermissionException,
  AdminUserException,
  AdminBusinessException
} from '@/lib/exceptions/admin'
import { AdminLogger } from '@/lib/logging/adminLogger'
import {
  withAdminErrorHandler,
  createSuccessResponse,
  sanitizeUserData
} from '@/lib/utils/admin-utils'

const prisma = new PrismaClient()

/**
 * GET - 사용자 상세 조회
 */
async function getUserHandler(request, context) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.USER_VIEW, 'unknown')
  }

  const adminId = auth.adminRole.userId
  const params = await context.params
  const { id: userId } = params

  AdminLogger.info('Admin user detail request', { adminId, userId })

  try {
    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminRole: true,
        sanctions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        receivedWarnings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            ownedStudies: true,
            studyMembers: true,
            messages: true,
            reports: true,
            notifications: true,
          },
        },
      },
    })

    if (!user) {
      throw AdminUserException.userNotFound(userId, { adminId })
    }

    // 관리자 로그
    AdminLogger.logUserManagement(adminId, userId, 'VIEW', {
      userStatus: user.status
    })

    await logAdminAction({
      adminId: adminId,
      action: 'USER_VIEW',
      targetType: 'USER',
      targetId: userId,
      details: { userId },
    })

    // 민감 정보 제거하여 응답
    const sanitized = sanitizeUserData(user)

    return createSuccessResponse({
      ...sanitized,
      _count: user._count,
      sanctions: user.sanctions,
      receivedWarnings: user.receivedWarnings,
      adminRole: user.adminRole
    })
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * PATCH - 사용자 정보 수정
 */
async function patchUserHandler(request, context) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_EDIT)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.USER_EDIT, 'unknown')
  }

  const adminId = auth.adminRole.userId
  const params = await context.params
  const { id: userId } = params
  const body = await request.json()

  AdminLogger.info('Admin user update request', { adminId, userId, updates: Object.keys(body) })

  // 자기 자신 수정 불가
  if (adminId === userId) {
    throw AdminBusinessException.cannotSuspendSelf(adminId, {
      action: 'update',
      message: 'Cannot modify own account'
    })
  }

  try {
    const { name, email, role, status } = body

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { adminRole: true }
    })

    if (!existingUser) {
      throw AdminUserException.userNotFound(userId, { adminId })
    }

    // 다른 관리자 수정 불가
    if (existingUser.adminRole && existingUser.id !== adminId) {
      throw AdminPermissionException.cannotSuspendAdmin(userId, {
        adminId,
        action: 'update'
      })
    }

    // 사용자 수정
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status }),
      },
    })

    // 관리자 로그
    AdminLogger.logUserManagement(adminId, userId, 'UPDATE', {
      changes: body,
      updatedFields: Object.keys(body)
    })

    await logAdminAction({
      adminId: adminId,
      action: 'USER_UPDATE',
      targetType: 'USER',
      targetId: userId,
      details: { changes: body },
    })

    return createSuccessResponse(sanitizeUserData(user), '사용자 정보가 수정되었습니다')
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * DELETE - 사용자 삭제
 */
async function deleteUserHandler(request, context) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_DELETE)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.USER_DELETE, 'unknown')
  }

  const adminId = auth.adminRole.userId
  const params = await context.params
  const { id: userId } = params

  AdminLogger.warn('Admin user deletion request', { adminId, userId })

  // 자기 자신 삭제 불가
  if (adminId === userId) {
    throw AdminBusinessException.cannotSuspendSelf(adminId, {
      action: 'delete',
      message: 'Cannot delete own account'
    })
  }

  try {
    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminRole: true,
        _count: {
          select: {
            ownedStudies: true,
            studyMembers: true
          }
        }
      }
    })

    if (!existingUser) {
      throw AdminUserException.userNotFound(userId, { adminId })
    }

    // 다른 관리자 삭제 불가
    if (existingUser.adminRole) {
      throw AdminPermissionException.cannotSuspendAdmin(userId, {
        adminId,
        action: 'delete'
      })
    }

    // 활동 중인 스터디가 있으면 삭제 불가
    if (existingUser._count.ownedStudies > 0) {
      throw AdminBusinessException.userDeletionNotAllowed(userId, 'User owns active studies', {
        adminId,
        ownedStudies: existingUser._count.ownedStudies
      })
    }

    // 사용자 삭제 (soft delete)
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'DELETED',
      },
    })

    // 관리자 로그
    AdminLogger.logUserManagement(adminId, userId, 'DELETE', {
      previousStatus: existingUser.status,
      studyMemberships: existingUser._count.studyMembers
    })

    await logAdminAction({
      adminId: adminId,
      action: 'USER_DELETE',
      targetType: 'USER',
      targetId: userId,
      details: { reason: 'Admin deletion', previousStatus: existingUser.status },
    })

    return createSuccessResponse(
      { id: user.id, status: user.status },
      '사용자가 삭제되었습니다'
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Export with error handler wrapper
export const GET = withAdminErrorHandler(getUserHandler)
export const PATCH = withAdminErrorHandler(patchUserHandler)
export const DELETE = withAdminErrorHandler(deleteUserHandler)

