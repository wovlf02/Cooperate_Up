/**
 * 관리자 - 스터디 목록 API
 * GET /api/admin/studies
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

async function getStudiesHandler(request) {
  const startTime = Date.now()

  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.STUDY_VIEW)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.STUDY_VIEW, 'unknown')
  }

  const { adminRole } = auth
  const adminId = adminRole.userId

  AdminLogger.info('Admin studies list request', { adminId })

  try {
    const { searchParams } = new URL(request.url)

    // 페이지네이션 검증
    const { page, limit, skip } = validatePagination(searchParams)

    // 필터
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const isPublic = searchParams.get('isPublic')
    const isRecruiting = searchParams.get('isRecruiting')

    // 멤버 수 범위
    const minMembers = searchParams.get('minMembers')
    const maxMembers = searchParams.get('maxMembers')

    // 날짜 필터
    const createdFrom = searchParams.get('createdFrom')
    const createdTo = searchParams.get('createdTo')

    // 정렬
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 유효한 정렬 필드 검증
    const validSortFields = ['createdAt', 'updatedAt', 'name', 'memberCount', 'rating']
    if (!validSortFields.includes(sortBy)) {
      throw AdminValidationException.invalidSorting(sortBy, validSortFields)
    }

    // 날짜 범위 검증
    if (createdFrom && createdTo && new Date(createdFrom) > new Date(createdTo)) {
      throw AdminValidationException.invalidDateRange(createdFrom, createdTo)
    }

    // Where 조건 구성
    const where = {}

    // 검색
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { id: { contains: search } },
      ]
    }

    // 카테고리 필터
    if (category && category !== 'all') {
      where.category = category
    }

    // 공개 여부
    if (isPublic !== null && isPublic !== 'all') {
      where.isPublic = isPublic === 'true'
    }

    // 모집 중 여부
    if (isRecruiting !== null && isRecruiting !== 'all') {
      where.isRecruiting = isRecruiting === 'true'
    }

    // 날짜 필터
    if (createdFrom || createdTo) {
      where.createdAt = {}
      if (createdFrom) where.createdAt.gte = new Date(createdFrom)
      if (createdTo) where.createdAt.lte = new Date(createdTo)
    }

    // 스터디 조회
    const [studies, total] = await Promise.all([
      prisma.study.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              status: true,
            },
          },
          _count: {
            select: {
              members: {
                where: { status: 'ACTIVE' },
              },
              messages: true,
              files: true,
              notices: true,
            },
          },
        },
      }).catch(error => {
        AdminLogger.error('Database query failed for studies list', {
          adminId,
          error: error.message,
          where
        })
        throw AdminDatabaseException.queryFailed('study.findMany', error.message)
      }),
      prisma.study.count({ where }).catch(error => {
        throw AdminDatabaseException.queryFailed('study.count', error.message)
      }),
    ])

    // 멤버 수 필터 (후처리)
    let filteredStudies = studies
    if (minMembers || maxMembers) {
      filteredStudies = studies.filter((study) => {
        const memberCount = study._count.members
        if (minMembers && memberCount < parseInt(minMembers)) return false
        if (maxMembers && memberCount > parseInt(maxMembers)) return false
        return true
      })
    }

    // 데이터 변환
    const transformedStudies = await Promise.all(
      filteredStudies.map(async (study) => {
        // 최근 활동 시간 계산
        const lastMessage = await prisma.message.findFirst({
          where: { studyId: study.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        })

        return {
          id: study.id,
          name: study.name,
          emoji: study.emoji,
          description: study.description,
          category: study.category,
          subCategory: study.subCategory,
          tags: study.tags,
          owner: study.owner,
          settings: {
            maxMembers: study.maxMembers,
            isPublic: study.isPublic,
            autoApprove: study.autoApprove,
            isRecruiting: study.isRecruiting,
          },
          stats: {
            memberCount: study._count.members,
            messageCount: study._count.messages,
            fileCount: study._count.files,
            noticeCount: study._count.notices,
            rating: study.rating || 0,
            reviewCount: study.reviewCount || 0,
          },
          lastActivityAt: lastMessage?.createdAt || study.updatedAt,
          createdAt: study.createdAt,
          updatedAt: study.updatedAt,
        }
      })
    )

    // 전체 통계
    const publicCount = await prisma.study.count({
      where: { ...where, isPublic: true },
    })
    const recruitingCount = await prisma.study.count({
      where: { ...where, isRecruiting: true },
    })

    // 로그 기록
    const duration = Date.now() - startTime
    AdminLogger.logAdminAction(adminId, 'STUDY_LIST_VIEW', {
      filters: { search, category, isPublic, isRecruiting },
      resultCount: transformedStudies.length,
      total,
      duration
    })

    return createPaginatedResponse(transformedStudies, total, page, limit, {
      stats: {
        total,
        public: publicCount,
        recruiting: recruitingCount,
      },
    })

  } catch (error) {
    // 예외가 이미 AdminException인 경우 그대로 전달
    if (error.name?.includes('Admin')) {
      throw error
    }

    // 데이터베이스 에러
    if (error.code?.startsWith('P')) {
      AdminLogger.error('Database error in studies list', {
        adminId,
        error: error.message,
        code: error.code
      })
      throw AdminDatabaseException.queryFailed('studies', error.message)
    }

    // 알 수 없는 에러
    AdminLogger.critical('Unknown error in studies list', {
      adminId,
      error: error.message,
      stack: error.stack
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withAdminErrorHandler(getStudiesHandler)

