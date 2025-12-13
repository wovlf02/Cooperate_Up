/**
 * 관리자 - 신고 목록 API
 * GET /api/admin/reports
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'
import {
  AdminPermissionException,
  AdminValidationException,
  AdminDatabaseException
} from '@/lib/exceptions/admin'
import { AdminLogger } from '@/lib/logging/adminLogger'
import {
  withAdminErrorHandler,
  validatePagination,
  createPaginatedResponse
} from '@/lib/utils/admin-utils'

const prisma = new PrismaClient()

async function getReportsHandler(request) {
  const startTime = Date.now()

  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.REPORT_VIEW)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.REPORT_VIEW, 'unknown')
  }

  const { adminRole } = auth
  const adminId = adminRole.userId

  AdminLogger.info('Admin reports list request', { adminId })

  try {
    const { searchParams } = new URL(request.url)

    // 페이지네이션 검증
    const { page, limit, skip } = validatePagination(searchParams)

    // 필터
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const targetType = searchParams.get('targetType')
    const assignedTo = searchParams.get('assignedTo')

    // 날짜 필터
    const createdFrom = searchParams.get('createdFrom')
    const createdTo = searchParams.get('createdTo')

    // 정렬
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 유효한 정렬 필드 검증
    const validSortFields = ['createdAt', 'updatedAt', 'priority', 'status']
    if (!validSortFields.includes(sortBy)) {
      throw AdminValidationException.invalidSorting(sortBy, validSortFields)
    }

    // 날짜 범위 검증
    if (createdFrom && createdTo && new Date(createdFrom) > new Date(createdTo)) {
      throw AdminValidationException.invalidDateRange(createdFrom, createdTo)
    }

    // Where 조건 구성
    const where = {}

    // 검색 (신고 사유, 신고자 이름/이메일)
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { targetName: { contains: search, mode: 'insensitive' } },
        {
          reporter: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ]
    }

    // 상태 필터
    if (status && status !== 'all') {
      const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']
      if (!validStatuses.includes(status)) {
        throw AdminValidationException.invalidReportStatus(status, validStatuses)
      }
      where.status = status
    }

    // 신고 유형 필터
    if (type && type !== 'all') {
      where.type = type
    }

    // 우선순위 필터
    if (priority && priority !== 'all') {
      where.priority = priority
    }

    // 대상 유형 필터
    if (targetType && targetType !== 'all') {
      where.targetType = targetType
    }

    // 담당자 필터
    if (assignedTo === 'me') {
      where.processedBy = adminId
    } else if (assignedTo === 'unassigned') {
      where.processedBy = null
    } else if (assignedTo && assignedTo !== 'all') {
      where.processedBy = assignedTo
    }

    // 날짜 필터
    if (createdFrom || createdTo) {
      where.createdAt = {}
      if (createdFrom) where.createdAt.gte = new Date(createdFrom)
      if (createdTo) where.createdAt.lte = new Date(createdTo)
    }

    // 신고 조회
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy === 'priority'
          ? [
              { priority: 'asc' },
              { createdAt: 'desc' }
            ]
          : { [sortBy]: sortOrder },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              status: true,
            },
          },
        },
      }).catch(error => {
        AdminLogger.error('Database query failed for reports list', {
          adminId,
          error: error.message,
          where
        })
        throw AdminDatabaseException.queryFailed('report.findMany', error.message)
      }),
      prisma.report.count({ where }).catch(error => {
        throw AdminDatabaseException.queryFailed('report.count', error.message)
      }),
    ])

    // 통계 계산
    const stats = await prisma.report.groupBy({
      by: ['status'],
      _count: true,
    })

    const statsMap = {
      total: total,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
    }

    stats.forEach(stat => {
      const key = stat.status.toLowerCase()
      if (key === 'in_progress') {
        statsMap.in_progress = stat._count
      } else {
        statsMap[key] = stat._count
      }
    })

    // 로그 기록
    const duration = Date.now() - startTime
    AdminLogger.logReportView(adminId, {
      filters: { status, type, priority, targetType, assignedTo },
      resultCount: reports.length,
      total,
      duration
    })

    return createPaginatedResponse(reports, total, page, limit, {
      stats: statsMap,
    })

  } catch (error) {
    // 예외가 이미 AdminException인 경우 그대로 전달
    if (error.name?.includes('Admin')) {
      throw error
    }

    // 데이터베이스 에러
    if (error.code?.startsWith('P')) {
      AdminLogger.error('Database error in reports list', {
        adminId,
        error: error.message,
        code: error.code
      })
      throw AdminDatabaseException.queryFailed('reports', error.message)
    }

    // 알 수 없는 에러
    AdminLogger.critical('Unknown error in reports list', {
      adminId,
      error: error.message,
      stack: error.stack
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withAdminErrorHandler(getReportsHandler)

