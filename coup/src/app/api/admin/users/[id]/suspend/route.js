/**
 * 관리자 - 사용자 정지 API
 * POST /api/admin/users/[id]/suspend
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'
import {
  AdminPermissionException,
  AdminUserException,
  AdminBusinessException,
  AdminValidationException
} from '@/lib/exceptions/admin'
import { AdminLogger } from '@/lib/logging/adminLogger'
import {
  withAdminErrorHandler,
  createSuccessResponse,
  sanitizeUserData
} from '@/lib/utils/admin-utils'

const prisma = new PrismaClient()

async function suspendUserHandler(request, context) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_EDIT)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.USER_EDIT, 'unknown')
  }

  const adminId = auth.adminRole.userId
  const params = await context.params
  const { id: userId } = params
  const body = await request.json()
  const { reason, duration } = body

  AdminLogger.warn('Admin user suspension request', { adminId, userId, reason, duration })

  // 정지 사유 필수
  if (!reason) {
    throw AdminValidationException.suspensionReasonMissing({ adminId, userId })
  }

  // 정지 기간 검증
  if (duration && (duration < 1 || duration > 365)) {
    throw AdminValidationException.invalidSuspensionDuration(duration, { adminId, userId })
  }

  // 자기 자신 정지 불가
  if (adminId === userId) {
    throw AdminBusinessException.cannotSuspendSelf(adminId)
  }

  try {
    // 사용자 존재 및 상태 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { adminRole: true }
    })

    if (!existingUser) {
      throw AdminUserException.userNotFound(userId, { adminId })
    }

    // 다른 관리자 정지 불가
    if (existingUser.adminRole) {
      throw AdminPermissionException.cannotSuspendAdmin(userId, { adminId })
    }

    // 이미 정지된 사용자
    if (existingUser.status === 'SUSPENDED') {
      throw AdminUserException.userAlreadySuspended(userId, {
        adminId,
        currentSuspendReason: existingUser.suspendReason,
        suspendedUntil: existingUser.suspendedUntil
      })
    }

    // 사용자 정지
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
        suspendReason: reason,
        ...(duration && {
          suspendedUntil: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
        }),
      },
    })

    // 관리자 로그
    AdminLogger.logUserManagement(adminId, userId, 'SUSPEND', {
      reason,
      duration,
      previousStatus: existingUser.status,
      suspendedUntil: user.suspendedUntil
    })

    await logAdminAction({
      adminId: adminId,
      action: 'USER_SUSPEND',
      targetType: 'USER',
      targetId: userId,
      details: { userId, reason, duration },
    })

    return createSuccessResponse(
      sanitizeUserData(user),
      '사용자가 정지되었습니다'
    )
  } finally {
    await prisma.$disconnect()
  }
}

export const POST = withAdminErrorHandler(suspendUserHandler)

