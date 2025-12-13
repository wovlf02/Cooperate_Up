/**
 * 관리자 - 스터디 삭제 API
 * DELETE /api/admin/studies/[studyId]/delete
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

async function deleteStudyHandler(request, context) {
  const startTime = Date.now()

  // 권한 확인 (삭제는 최고 권한 필요)
  const auth = await requireAdmin(request, PERMISSIONS.STUDY_DELETE)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.STUDY_DELETE, 'unknown')
  }

  const { adminRole } = auth
  const adminId = adminRole.userId
  const params = await context.params
  const { studyId } = params

  if (!studyId) {
    throw AdminValidationException.missingField('studyId')
  }

  AdminLogger.warn('Admin study delete request', { adminId, studyId }, 'high')

  try {
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason')

    // 유효성 검사
    if (!reason || reason.trim().length < 10) {
      throw AdminValidationException.invalidFieldFormat('reason', reason, '최소 10자 이상')
    }

    // 스터디 존재 확인
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        owner: true,
        members: {
          where: { status: 'ACTIVE' },
        },
        _count: {
          select: {
            messages: true,
            files: true,
            notices: true,
            events: true,
            tasks: true,
          },
        },
      },
    }).catch(error => {
      AdminLogger.error('Database query failed for study delete', {
        adminId,
        studyId,
        error: error.message
      })
      throw AdminDatabaseException.queryFailed('study.findUnique', error.message)
    })

    if (!study) {
      throw AdminBusinessException.studyNotFound(studyId, { adminId })
    }

    // 활성 멤버가 많은 경우 경고
    if (study.members.length > 10) {
      AdminLogger.warn('Attempting to delete study with many active members', {
        adminId,
        studyId,
        memberCount: study.members.length
      }, 'high')
    }

    // 삭제 전 로그 저장
    const studySnapshot = {
      id: study.id,
      name: study.name,
      ownerId: study.ownerId,
      ownerEmail: study.owner.email,
      memberCount: study.members.length,
      stats: study._count,
      createdAt: study.createdAt,
    }

    // 트랜잭션으로 처리
    await prisma.$transaction(async (tx) => {
      // 관리자 로그 기록 (삭제 전에 기록)
      await tx.adminLog.create({
        data: {
          adminId,
          action: 'STUDY_DELETE',
          targetType: 'Study',
          targetId: studyId,
          reason,
          metadata: {
            ...studySnapshot,
            deletedBy: adminId,
            deletedAt: new Date(),
          },
        },
      })

      // 스터디 삭제 (CASCADE로 관련 데이터 자동 삭제)
      await tx.study.delete({
        where: { id: studyId },
      }).catch(error => {
        // Prisma constraint 에러 체크
        if (error.code === 'P2003' || error.code === 'P2014') {
          throw AdminBusinessException.studyDeletionNotAllowed(
            studyId,
            '연관된 데이터가 있어 삭제할 수 없습니다',
            { adminId, error: error.message }
          )
        }
        throw AdminBusinessException.studyDeletionNotAllowed(studyId, error.message, { adminId })
      })
    }).catch(error => {
      if (error.name?.includes('Admin')) throw error
      throw AdminDatabaseException.transactionFailed('study delete', error.message)
    })

    const duration = Date.now() - startTime
    AdminLogger.logStudyDelete(adminId, studyId, reason, {
      studyName: study.name,
      memberCount: study.members.length,
      stats: study._count,
      duration
    })

    return NextResponse.json({
      success: true,
      message: '스터디가 삭제되었습니다',
      data: {
        deletedStudy: studySnapshot,
      },
    })
  } catch (error) {
    if (error.name?.includes('Admin')) throw error

    AdminLogger.critical('Unknown error in study delete', {
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

export const DELETE = withAdminErrorHandler(deleteStudyHandler)

