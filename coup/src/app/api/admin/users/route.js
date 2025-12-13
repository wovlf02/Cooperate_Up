/**
 * 관리자 - 사용자 목록 API
 * GET /api/admin/users
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'
import { AdminPermissionException, AdminValidationException, AdminDatabaseException } from '@/lib/exceptions/admin'
import { AdminLogger } from '@/lib/logging/adminLogger'
import {
  withAdminErrorHandler,
  validatePagination,
  createPaginatedResponse,
  sanitizeUserData
} from '@/lib/utils/admin-utils'

const prisma = new PrismaClient()

async function getUsersHandler(request) {
  const startTime = Date.now()

  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.USER_VIEW, 'unknown')
  }

  const { adminRole } = auth
  const adminId = adminRole.userId

  AdminLogger.info('Admin users list request', { adminId })

  try {
    const { searchParams } = new URL(request.url)

    // 페이지네이션 검증
    const { page, limit, skip } = validatePagination(searchParams)

    // 필터
    const search = searchParams.get('search')
    const statusParam = searchParams.get('status')
    const provider = searchParams.get('provider')
    const hasWarnings = searchParams.get('hasWarnings') === 'true'
    const isSuspended = searchParams.get('isSuspended') === 'true'

    // 유효한 status 값만 허용
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'DELETED', 'all']
    const status = validStatuses.includes(statusParam) ? statusParam : null

    // 날짜 필터
    const createdFrom = searchParams.get('createdFrom')
    const createdTo = searchParams.get('createdTo')
    const lastLoginFrom = searchParams.get('lastLoginFrom')
    const lastLoginTo = searchParams.get('lastLoginTo')

    // 정렬
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 정렬 필드 검증
    const validSortFields = ['createdAt', 'lastLoginAt', 'email', 'name', 'status']
    if (!validSortFields.includes(sortBy)) {
      throw AdminValidationException.invalidSorting(sortBy, validSortFields)
    }

    // Where 조건 구성
    const where = {}

    AdminLogger.debug('Building query filters', {
      adminId,
      search,
      status,
      provider,
      hasWarnings,
      isSuspended
    })

    // 검색
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { id: { contains: search } },
      ]
    }

    // 상태 필터
    if (status && status !== 'all') {
      where.status = status
    }

    // 가입 방식 필터
    if (provider && provider !== 'all') {
      where.provider = provider
    }

    // 정지된 사용자만
    if (isSuspended) {
      where.status = 'SUSPENDED'
    }

    // 날짜 필터
    if (createdFrom || createdTo) {
      where.createdAt = {}
      if (createdFrom) where.createdAt.gte = new Date(createdFrom)
      if (createdTo) where.createdAt.lte = new Date(createdTo)
    }

    if (lastLoginFrom || lastLoginTo) {
      where.lastLoginAt = {}
      if (lastLoginFrom) where.lastLoginAt.gte = new Date(lastLoginFrom)
      if (lastLoginTo) where.lastLoginAt.lte = new Date(lastLoginTo)
    }

    // 경고 있는 사용자만
    if (hasWarnings) {
      where.receivedWarnings = {
        some: {},
      }
    }

    // 사용자 조회
    AdminLogger.debug('Querying database', { adminId, where, page, limit })

    let users, total
    try {
      [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
          include: {
            _count: {
              select: {
                ownedStudies: true,
                studyMembers: true,
                messages: true,
                receivedWarnings: true,
                sanctions: {
                  where: { isActive: true },
                },
              },
            },
            receivedWarnings: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                severity: true,
                createdAt: true,
              },
            },
            sanctions: {
              where: { isActive: true },
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                type: true,
                expiresAt: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ])
    } catch (dbError) {
      AdminLogger.logDatabaseError('user query', dbError, { adminId, where })
      throw AdminDatabaseException.queryTimeout('getUsersList', 30000, {
        adminId,
        filters: { search, status, provider }
      })
    }

    // 데이터 가공 및 민감 정보 제거
    const userData = users.map(user => {
      const sanitized = sanitizeUserData(user)
      return {
        ...sanitized,
        // 통계
        stats: {
          studiesOwned: user._count.ownedStudies,
          studiesJoined: user._count.studyMembers,
          messagesCount: user._count.messages,
          warningsCount: user._count.receivedWarnings,
          activeSanctions: user._count.sanctions,
        },
        // 최근 경고
        lastWarning: user.receivedWarnings[0] || null,
        // 활성 제재
        activeSanction: user.sanctions[0] || null,
      }
    })

    // 활동 로그
    AdminLogger.logAdminAction(adminId, 'USER_LIST_VIEW', {
      search,
      status,
      provider,
      resultCount: users.length,
      totalCount: total
    })

    await logAdminAction({
      adminId: adminId,
      action: 'USER_SEARCH',
      reason: `Searched users: ${search || 'all'}`,
      request,
    })

    const duration = Date.now() - startTime
    AdminLogger.logPerformance('getUsersList', duration, {
      adminId,
      userCount: users.length
    })

    return createPaginatedResponse(
      userData,
      total,
      page,
      limit,
      {
        filters: {
          search,
          status,
          provider,
          hasWarnings,
          isSuspended,
        },
      }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Export with error handler wrapper
export const GET = withAdminErrorHandler(getUsersHandler)

