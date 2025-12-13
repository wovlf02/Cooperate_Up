/**
 * 관리자 - 신고 담당자 배정 API
 * POST /api/admin/reports/[reportId]/assign
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'
import {
  AdminPermissionException,
  AdminReportException,
  AdminDatabaseException,
  AdminValidationException,
  AdminBusinessException
} from '@/lib/exceptions/admin'
import { AdminLogger } from '@/lib/logging/adminLogger'
import { withAdminErrorHandler } from '@/lib/utils/admin-utils'

const prisma = new PrismaClient()

async function assignReportHandler(request, context) {
  const startTime = Date.now()

  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.REPORT_MANAGE)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.REPORT_MANAGE, 'unknown')
  }

  const { adminRole } = auth
  const currentAdminId = adminRole.userId
  const params = await context.params
  const { reportId } = params

  // reportId 검증
  if (!reportId) {
    throw AdminValidationException.missingField('reportId')
  }

  AdminLogger.info('Admin report assign request', { currentAdminId, reportId })

  try {
    const body = await request.json()
    const { adminId, autoAssign } = body

    // 신고 존재 확인
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }).catch(error => {
      AdminLogger.error('Database query failed for report assign', {
        currentAdminId,
        reportId,
        error: error.message
      })
      throw AdminDatabaseException.queryFailed('report.findUnique', error.message)
    })

    if (!report) {
      throw AdminReportException.reportNotFound(reportId, { currentAdminId })
    }

    // 이미 처리된 신고인지 확인
    if (report.status === 'RESOLVED' || report.status === 'REJECTED') {
      throw AdminReportException.reportAlreadyProcessed(reportId, report.status, { currentAdminId })
    }

    // 자동 배정인 경우
    let targetAdminId = adminId
    if (autoAssign) {
      // 가장 적게 처리 중인 관리자에게 배정
      const admins = await prisma.adminRole.findMany({
        where: {
          role: { in: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] },
        },
        select: {
          userId: true,
        },
      })

      if (admins.length === 0) {
        throw AdminReportException.assignmentFailed(reportId, 'auto', '배정 가능한 관리자가 없습니다', { currentAdminId })
      }

      // 각 관리자의 처리 중인 신고 수 조회
      const workloads = await Promise.all(
        admins.map(async (admin) => {
          const count = await prisma.report.count({
            where: {
              processedBy: admin.userId,
              status: { in: ['PENDING', 'IN_PROGRESS'] },
            },
          })
          return { adminId: admin.userId, count }
        })
      )

      // 가장 적게 처리 중인 관리자 선택
      workloads.sort((a, b) => a.count - b.count)
      targetAdminId = workloads[0].adminId
    }

    // 관리자 존재 확인
    if (targetAdminId) {
      const admin = await prisma.adminRole.findUnique({
        where: { userId: targetAdminId },
      })

      if (!admin) {
        throw AdminBusinessException.userNotFound(targetAdminId, '관리자')
      }
    }

    // 트랜잭션으로 처리
    const updatedReport = await prisma.$transaction(async (tx) => {
      // 신고 업데이트
      const updated = await tx.report.update({
        where: { id: reportId },
        data: {
          processedBy: targetAdminId,
          status: targetAdminId ? 'IN_PROGRESS' : 'PENDING',
        },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }).catch(error => {
        throw AdminReportException.assignmentFailed(reportId, targetAdminId || 'null', error.message, { currentAdminId })
      })

      // 관리자 로그 기록
      await tx.adminLog.create({
        data: {
          adminId: currentAdminId,
          action: 'REPORT_ASSIGN',
          targetType: 'Report',
          targetId: reportId,
          metadata: {
            previousAssignee: report.processedBy,
            newAssignee: targetAdminId,
            autoAssign: !!autoAssign,
          },
        },
      })

      return updated
    }).catch(error => {
      if (error.name?.includes('Admin')) throw error
      throw AdminDatabaseException.transactionFailed('report assign', error.message)
    })

    // 로그 기록
    const duration = Date.now() - startTime
    AdminLogger.logReportProcessing(currentAdminId, reportId, 'ASSIGN', {
      previousAssignee: report.processedBy,
      newAssignee: targetAdminId,
      autoAssign: !!autoAssign,
      duration
    })

    return NextResponse.json({
      success: true,
      data: {
        report: updatedReport,
      },
      message: targetAdminId
        ? '담당자가 배정되었습니다.'
        : '담당자 배정이 해제되었습니다.',
    })
  } catch (error) {
    if (error.name?.includes('Admin')) throw error

    AdminLogger.critical('Unknown error in report assign', {
      currentAdminId,
      reportId,
      error: error.message,
      stack: error.stack
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const POST = withAdminErrorHandler(assignReportHandler)

