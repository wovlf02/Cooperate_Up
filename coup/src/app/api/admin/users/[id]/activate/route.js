/**
 * 관리자 - 사용자 활성화 API
 * POST /api/admin/users/[id]/activate
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'
import {
  AdminPermissionException,
  AdminUserException
} from '@/lib/exceptions/admin'
import { AdminLogger } from '@/lib/logging/adminLogger'
import {
  withAdminErrorHandler,
  createSuccessResponse,
  sanitizeUserData
} from '@/lib/utils/admin-utils'

const prisma = new PrismaClient()

async function activateUserHandler(request, context) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_EDIT)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.USER_EDIT, 'unknown')
  }

  const adminId = auth.adminRole.userId
  const params = await context.params
  const { id: userId } = params

  AdminLogger.info('Admin user activation request', { adminId, userId })

  try {
    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      throw AdminUserException.userNotFound(userId, { adminId })
    }

    // 사용자 활성화
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        suspendedUntil: null,
        suspendReason: null,
      },
    })

    // 관리자 로그
    AdminLogger.logUserManagement(adminId, userId, 'ACTIVATE', {
      previousStatus: existingUser.status,
      previousSuspendReason: existingUser.suspendReason
    })

    await logAdminAction({
      adminId: adminId,
      action: 'USER_UNSUSPEND',
      targetType: 'USER',
      targetId: userId,
      details: { userId },
    })

    return createSuccessResponse(
      sanitizeUserData(user),
      '사용자가 활성화되었습니다'
    )
  } finally {
    await prisma.$disconnect()
  }
}

export const POST = withAdminErrorHandler(activateUserHandler)

