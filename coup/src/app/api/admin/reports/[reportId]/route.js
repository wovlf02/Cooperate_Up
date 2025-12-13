/**
 * 관리자 - 신고 상세 API
 * GET /api/admin/reports/[reportId]
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'
import {
  AdminPermissionException,
  AdminReportException,
  AdminDatabaseException,
  AdminValidationException
} from '@/lib/exceptions/admin'
import { AdminLogger } from '@/lib/logging/adminLogger'
import { withAdminErrorHandler } from '@/lib/utils/admin-utils'

const prisma = new PrismaClient()

async function getReportDetailHandler(request, context) {
  const startTime = Date.now()

  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.REPORT_VIEW)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.REPORT_VIEW, 'unknown')
  }

  const { adminRole } = auth
  const adminId = adminRole.userId

  // Next.js 15에서 params는 Promise이므로 await 필요
  const params = await context.params
  const { reportId } = params

  // reportId 검증
  if (!reportId || typeof reportId !== 'string') {
    throw AdminValidationException.missingField('reportId')
  }

  AdminLogger.info('Admin report detail request', { adminId, reportId })

  try {
    // 신고 상세 조회
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            status: true,
            createdAt: true,
          },
        },
      },
    }).catch(error => {
      AdminLogger.error('Database query failed for report detail', {
        adminId,
        reportId,
        error: error.message
      })
      throw AdminDatabaseException.queryFailed('report.findUnique', error.message)
    })

    if (!report) {
      throw AdminReportException.reportNotFound(reportId, { adminId })
    }

    // 신고 대상 정보 가져오기
    let target = null
    if (report.targetType === 'USER') {
      target = await prisma.user.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          status: true,
          createdAt: true,
          suspendedUntil: true,
          suspendReason: true,
          _count: {
            select: {
              ownedStudies: true,
              studyMembers: true,
              messages: true,
              receivedWarnings: true,
            },
          },
        },
      })
    } else if (report.targetType === 'STUDY') {
      target = await prisma.study.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          name: true,
          emoji: true,
          description: true,
          category: true,
          isPublic: true,
          isRecruiting: true,
          createdAt: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              messages: true,
              notices: true,
            },
          },
        },
      })
    } else if (report.targetType === 'MESSAGE') {
      target = await prisma.message.findUnique({
        where: { id: report.targetId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          study: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    }

    // 처리자 정보 (있는 경우)
    let processedAdmin = null
    if (report.processedBy) {
      processedAdmin = await prisma.user.findUnique({
        where: { id: report.processedBy },
        select: {
          id: true,
          name: true,
          email: true,
          adminRole: {
            select: {
              role: true,
            },
          },
        },
      })
    }

    // 동일 대상에 대한 관련 신고 조회
    const relatedReports = await prisma.report.findMany({
      where: {
        targetId: report.targetId,
        targetType: report.targetType,
        id: { not: reportId },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // 신고자의 신고 이력
    const reporterHistory = await prisma.report.aggregate({
      where: {
        reporterId: report.reporterId,
      },
      _count: true,
    })

    // 신고 대상의 신고 받은 이력 (USER인 경우)
    let targetReportCount = 0
    if (report.targetType === 'USER') {
      targetReportCount = await prisma.report.count({
        where: {
          targetType: 'USER',
          targetId: report.targetId,
        },
      })
    }

    // 로그 기록
    const duration = Date.now() - startTime
    AdminLogger.logReportView(adminId, reportId, {
      targetType: report.targetType,
      targetId: report.targetId,
      status: report.status,
      duration
    })

    return NextResponse.json({
      success: true,
      data: {
        report: {
          ...report,
          target,
          processedAdmin,
          reporterHistory: {
            totalReports: reporterHistory._count,
          },
          targetReportCount,
        },
        relatedReports,
      },
    })
  } catch (error) {
    // 예외가 이미 AdminException인 경우 그대로 전달
    if (error.name?.includes('Admin')) {
      throw error
    }

    // 데이터베이스 에러
    if (error.code?.startsWith('P')) {
      AdminLogger.error('Database error in report detail', {
        adminId,
        reportId,
        error: error.message,
        code: error.code
      })
      throw AdminDatabaseException.queryFailed('report detail', error.message)
    }

    // 알 수 없는 에러
    AdminLogger.critical('Unknown error in report detail', {
      adminId,
      reportId,
      error: error.message,
      stack: error.stack
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withAdminErrorHandler(getReportDetailHandler)

