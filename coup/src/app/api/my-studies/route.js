// src/app/api/my-studies/route.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  createMyStudiesError,
  logMyStudiesError,
  logMyStudiesInfo,
  handlePrismaError
} from '@/lib/exceptions/my-studies-errors'
import { validateFilter, validatePagination } from '@/lib/validators/my-studies-validation'
import { getFilteredStudies } from '@/lib/my-studies-helpers'

export async function GET(request) {
  const startTime = Date.now()
  let userId = null

  try {
    // 1. 타임아웃 설정 (10초)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    // 2. 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      const error = createMyStudiesError('UNAUTHORIZED')
      return NextResponse.json(error, { status: error.statusCode })
    }

    userId = session.user.id

    // 3. 쿼리 파라미터 검증
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    // limit은 파라미터가 없으면 전체 조회 (validation 스킵)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam) : null

    // 필터 검증
    const filterValidation = validateFilter(filter)
    if (!filterValidation.valid) {
      const error = createMyStudiesError('INVALID_FILTER', filterValidation.error)
      return NextResponse.json(error, { status: error.statusCode })
    }

    // 페이지네이션 검증 (limit이 명시적으로 전달된 경우만)
    if (limitParam) {
      const paginationValidation = validatePagination({ page, limit })
      if (!paginationValidation.valid) {
        const error = createMyStudiesError('INVALID_REQUEST', paginationValidation.error)
        return NextResponse.json(error, { status: error.statusCode })
      }
    }

    // 4. DB 쿼리 - ACTIVE 또는 PENDING 상태만 조회 (KICKED, LEFT 제외)
    const studyMembers = await prisma.studyMember.findMany({
      where: {
        userId,
        status: {
          in: ['ACTIVE', 'PENDING']
        }
      },
      include: {
        study: {
          select: {
            id: true,
            name: true,
            emoji: true,
            description: true,
            category: true,
            subCategory: true,
            maxMembers: true,
            isPublic: true,
            isRecruiting: true,
            tags: true,
            createdAt: true,
            _count: {
              select: {
                members: {
                  where: { status: 'ACTIVE' }
                },
                messages: {
                  where: {
                    createdAt: {
                      gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 최근 24시간
                    }
                  }
                },
                notices: {
                  where: {
                    createdAt: {
                      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 최근 7일
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'desc' }, // PENDING이 먼저
        { joinedAt: 'desc' }
      ]
    })

    clearTimeout(timeoutId)

    // 5. 필터링 (안전)
    const filtered = getFilteredStudies(studyMembers, filter)

    // 6. 응답 데이터 포맷팅
    const studies = filtered.map(sm => ({
      membershipId: sm.id,
      role: sm.role,
      status: sm.status,
      joinedAt: sm.joinedAt,
      approvedAt: sm.approvedAt,
      study: {
        id: sm.study.id,
        name: sm.study.name,
        emoji: sm.study.emoji,
        description: sm.study.description,
        category: sm.study.category,
        subCategory: sm.study.subCategory,
        maxMembers: sm.study.maxMembers,
        currentMembers: sm.study._count.members,
        isPublic: sm.study.isPublic,
        isRecruiting: sm.study.isRecruiting,
        tags: sm.study.tags,
        createdAt: sm.study.createdAt,
        newMessages: sm.study._count.messages,
        newNotices: sm.study._count.notices
      }
    }))

    // 7. 응답
    const duration = Date.now() - startTime

    // 로깅
    logMyStudiesInfo('스터디 목록 로드 성공', {
      userId,
      filter,
      totalCount: studyMembers.length,
      filteredCount: studies.length,
      duration: `${duration}ms`
    })

    return NextResponse.json({
      success: true,
      data: {
        studies,
        count: studies.length,
        filter
      },
      meta: {
        duration,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime

    // Prisma 에러 변환
    if (error.code?.startsWith('P')) {
      const prismaError = handlePrismaError(error)
      logMyStudiesError('스터디 목록 로드 실패 (Prisma)', error, {
        userId,
        prismaCode: error.code,
        duration: `${duration}ms`
      })
      return NextResponse.json(prismaError, { status: prismaError.statusCode })
    }

    // 타임아웃
    if (error.name === 'AbortError') {
      const timeoutError = createMyStudiesError('TIMEOUT')
      logMyStudiesError('스터디 목록 로드 타임아웃', error, {
        userId,
        duration: `${duration}ms`
      })
      return NextResponse.json(timeoutError, { status: timeoutError.statusCode })
    }

    // 일반 에러
    logMyStudiesError('스터디 목록 로드 실패', error, {
      userId,
      duration: `${duration}ms`
    })

    const genericError = createMyStudiesError('STUDIES_LOAD_FAILED')
    return NextResponse.json(genericError, { status: genericError.statusCode })
  }
}

