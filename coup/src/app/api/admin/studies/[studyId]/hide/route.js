/**
 * 관리자 - 스터디 숨김 처리 API
 * POST /api/admin/studies/[studyId]/hide
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

async function hideStudyHandler(request, context) {
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

  // studyId 검증
  if (!studyId) {
    throw AdminValidationException.missingField('studyId')
  }

  AdminLogger.info('Admin study hide request', { adminId, studyId })

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
    }).catch(error => {
      AdminLogger.error('Database query failed for study hide', {
        adminId,
        studyId,
        error: error.message
      })
      throw AdminDatabaseException.queryFailed('study.findUnique', error.message)
    })

    if (!study) {
      throw AdminBusinessException.studyNotFound(studyId, { adminId })
    }

    // 이미 숨김 처리된 스터디인지 확인
    if (!study.isPublic && study.isRecruiting === false) {
      throw AdminBusinessException.studyHideFailed(studyId, '이미 숨김 처리된 스터디', { adminId })
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 스터디 상태 업데이트
      const updatedStudy = await tx.study.update({
        where: { id: studyId },
        data: {
          isPublic: false,
          isRecruiting: false,
        },
      }).catch(error => {
        throw AdminBusinessException.studyHideFailed(studyId, error.message, { adminId })
      })

      // 관리자 로그 기록
      await tx.adminLog.create({
        data: {
          adminId,
          action: 'STUDY_HIDE',
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
      }).catch(error => {
        AdminLogger.warn('Failed to create admin log', { adminId, studyId, error: error.message })
      })

      return updatedStudy
    }).catch(error => {
      if (error.name?.includes('Admin')) throw error
      throw AdminDatabaseException.transactionFailed('study hide', error.message)
    })

    // 알림 발송 (트랜잭션 외부에서)
    let notificationsSent = 0
    if (body.notifyOwner !== false) {
      notificationsSent++
    }
    if (body.notifyMembers === true) {
      notificationsSent += study.members.length
    }

    // 로그 기록
    const duration = Date.now() - startTime
    AdminLogger.logStudyHide(adminId, studyId, body.reason, {
      studyName: study.name,
      memberCount: study.members.length,
      notificationsSent,
      duration
    })

    return NextResponse.json({
      success: true,
      message: '스터디가 숨김 처리되었습니다',
      data: {
        study: result,
        notificationsSent,
      },
    })
  } catch (error) {
    if (error.name?.includes('Admin')) throw error

    AdminLogger.critical('Unknown error in study hide', {
      adminId,
      studyId,
      error: error.message,
      stack: error.stack
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 숨김 해제
async function unhideStudyHandler(request, context) {
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

  AdminLogger.info('Admin study unhide request', { adminId, studyId })

  try {
    // 스터디 존재 확인
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: { owner: true },
    })

    if (!study) {
      throw AdminBusinessException.studyNotFound(studyId, { adminId })
    }

    // 트랜잭션으로 처리
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
          action: 'STUDY_UNHIDE',
          targetType: 'Study',
          targetId: studyId,
          metadata: {
            studyName: study.name,
            ownerId: study.ownerId,
          },
        },
      })

      return updatedStudy
    }).catch(error => {
      if (error.name?.includes('Admin')) throw error
      throw AdminDatabaseException.transactionFailed('study unhide', error.message)
    })

    const duration = Date.now() - startTime
    AdminLogger.logAdminAction(adminId, 'STUDY_UNHIDE', {
      studyId,
      studyName: study.name,
      duration
    })

    return NextResponse.json({
      success: true,
      message: '스터디 숨김이 해제되었습니다',
      data: result,
    })
  } catch (error) {
    if (error.name?.includes('Admin')) throw error

    AdminLogger.critical('Unknown error in study unhide', {
      adminId,
      studyId,
      error: error.message
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const POST = withAdminErrorHandler(hideStudyHandler)
export const DELETE = withAdminErrorHandler(unhideStudyHandler)

