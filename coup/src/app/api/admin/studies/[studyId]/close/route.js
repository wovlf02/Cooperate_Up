/**
 * 관리자 - 스터디 강제 종료 API
 * POST /api/admin/studies/[studyId]/close
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'
import {
  AdminPermissionException,
  AdminBusinessException,
  AdminDatabaseException,
  AdminValidationException
} from '@/lib/exceptions/admin'
import { AdminLogger } from '@/lib/logging/adminLogger'
import { withAdminErrorHandler } from '@/lib/utils/admin-utils'

const prisma = new PrismaClient()

async function closeStudyHandler(request, context) {
  const startTime = Date.now()

  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.STUDY_MANAGE)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.STUDY_MANAGE, 'unknown')
  }

  const { adminRole } = auth
  const adminId = adminRole.userId
  const params = await context.params
  const { studyId } = params

  if (!studyId) {
    throw AdminValidationException.missingField('studyId')
  }

  AdminLogger.info('Admin study close request', { adminId, studyId })

  try {
    const body = await request.json()

    // 유효성 검사
    if (!body.reason || body.reason.trim().length < 10) {
      throw AdminValidationException.invalidFieldFormat('reason', body.reason, '최소 10자 이상')
    }

    // 스터디 존재 확인
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        owner: true,
        members: {
          where: { status: 'ACTIVE' },
          include: { user: true },
        },
      },
    })

    if (!study) {
      throw AdminBusinessException.studyNotFound(studyId, { adminId })
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      const updatedStudy = await tx.study.update({
        where: { id: studyId },
        data: {
          isPublic: false,
          isRecruiting: false,
        },
      }).catch(error => {
        throw AdminBusinessException.studyClosureFailed(studyId, error.message, { adminId })
      })

      await tx.adminLog.create({
        data: {
          adminId,
          action: 'STUDY_CLOSE',
          targetType: 'Study',
          targetId: studyId,
          reason: body.reason,
          metadata: {
            studyName: study.name,
            ownerId: study.ownerId,
            memberCount: study.members.length,
            notifyOwner: body.notifyOwner !== false,
            notifyMembers: body.notifyMembers === true,
          },
        },
      })

      return updatedStudy
    }).catch(error => {
      if (error.name?.includes('Admin')) throw error
      throw AdminDatabaseException.transactionFailed('study close', error.message)
    })

    // 알림 발송
    let notificationsSent = 0
    if (body.notifyOwner !== false) notificationsSent++
    if (body.notifyMembers === true) notificationsSent += study.members.length

    const duration = Date.now() - startTime
    AdminLogger.logStudyClose(adminId, studyId, body.reason, {
      studyName: study.name,
      memberCount: study.members.length,
      notificationsSent,
      duration
    })

    return NextResponse.json({
      success: true,
      message: '스터디가 종료되었습니다',
      data: {
        study: result,
        notificationsSent,
      },
    })
  } catch (error) {
    if (error.name?.includes('Admin')) throw error
    AdminLogger.critical('Unknown error in study close', {
      adminId,
      studyId,
      error: error.message
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 종료 해제 (재개)
async function reopenStudyHandler(request, context) {
  const startTime = Date.now()

  const auth = await requireAdmin(request, PERMISSIONS.STUDY_MANAGE)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.STUDY_MANAGE, 'unknown')
  }

  const { adminRole } = auth
  const adminId = adminRole.userId
  const params = await context.params
  const { studyId } = params

  AdminLogger.info('Admin study reopen request', { adminId, studyId })

  try {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: { owner: true },
    })

    if (!study) {
      throw AdminBusinessException.studyNotFound(studyId, { adminId })
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedStudy = await tx.study.update({
        where: { id: studyId },
        data: {
          isPublic: true,
          isRecruiting: true,
        },
      })

      await tx.adminLog.create({
        data: {
          adminId,
          action: 'STUDY_REOPEN',
          targetType: 'Study',
          targetId: studyId,
          metadata: {
            studyName: study.name,
            ownerId: study.ownerId,
          },
        },
      })

      return updatedStudy
    })

    const duration = Date.now() - startTime
    AdminLogger.logAdminAction(adminId, 'STUDY_REOPEN', {
      studyId,
      studyName: study.name,
      duration
    })

    return NextResponse.json({
      success: true,
      message: '스터디가 재개되었습니다',
      data: result,
    })
  } catch (error) {
    if (error.name?.includes('Admin')) throw error
    AdminLogger.critical('Unknown error in study reopen', {
      adminId,
      studyId,
      error: error.message
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const POST = withAdminErrorHandler(closeStudyHandler)
export const DELETE = withAdminErrorHandler(reopenStudyHandler)

