// src/app/api/dashboard/route.js
/**
 * Dashboard API - 메인 대시보드 데이터
 *
 * GET /api/dashboard - 대시보드 메인 데이터 조회
 *
 * @module app/api/dashboard/route
 * @author CoUp Team
 * @updated 2025-12-04
 */

import { NextResponse } from "next/server"
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from "@/lib/prisma"
import {
  DashboardException,
  DashboardPermissionException,
  DashboardBusinessException
} from '@/lib/exceptions/dashboard';
import {
  validateSession,
  validateDashboardQueryParams
} from '@/lib/validators/dashboard-validators';
import {
  createSuccessResponse,
  createErrorResponse,
  formatDashboardResponse,
  withDashboardErrorHandler
} from '@/lib/helpers/dashboard-helpers';
import {
  logDashboardError,
  logDashboardWarning,
  handlePrismaError,
  createPartialSuccessResponse
} from "@/lib/exceptions/dashboard-errors"
import { validateDashboardData } from "@/lib/validators/dashboard-validation"

export async function GET(request) {
  const startTime = Date.now()

  try {
    // 세션 검증 (Exception 통합)
    const session = await getServerSession(authOptions);
    const user = validateSession(session);
    const userId = user.id;

    console.log('🔐 [DASHBOARD] Fetching data for user:', userId)

    // 쿼리 파라미터 검증
    const { searchParams } = new URL(request.url);
    const params = {
      period: searchParams.get('period'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    };

    // 기간 파라미터 검증 (선택적)
    let validatedParams = {};
    try {
      validatedParams = validateDashboardQueryParams(params);
    } catch (validationError) {
      // 검증 실패 시 기본값 사용
      console.log('[DASHBOARD] Using default period');
    }

    // ============================================
    // 2.1 Prisma 연결 실패 처리 + 부분 실패 허용
    // ============================================

    // 통계 카드 데이터 - Promise.allSettled로 부분 실패 허용
    const [
      activeStudyCount,
      taskCount,
      unreadNotificationCount,
      completedTaskCount
    ] = await Promise.allSettled([
      // 활성 스터디 수
      prisma.studyMember.count({
        where: {
          userId,
          status: 'ACTIVE'
        }
      }).catch(error => {
        logDashboardError('활성 스터디 수 조회', error, { userId })
        throw error
      }),

      // 총 할일 수
      prisma.task.count({
        where: {
          userId,
          completed: false
        }
      }).catch(error => {
        logDashboardError('할일 수 조회', error, { userId })
        throw error
      }),

      // 읽지 않은 알림 수
      prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      }).catch(error => {
        logDashboardError('알림 수 조회', error, { userId })
        throw error
      }),

      // 완료한 할일 수 (이번 달)
      prisma.task.count({
        where: {
          userId,
          completed: true,
          completedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }).catch(error => {
        logDashboardError('완료 할일 수 조회', error, { userId })
        throw error
      })
    ])

    // 각 결과 검증 및 기본값 설정
    const failedQueries = []

    const stats = {
      activeStudies: activeStudyCount.status === 'fulfilled'
        ? activeStudyCount.value
        : (() => { failedQueries.push('activeStudies'); return 0; })(),
      pendingTasks: taskCount.status === 'fulfilled'
        ? taskCount.value
        : (() => { failedQueries.push('pendingTasks'); return 0; })(),
      unreadNotifications: unreadNotificationCount.status === 'fulfilled'
        ? unreadNotificationCount.value
        : (() => { failedQueries.push('unreadNotifications'); return 0; })(),
      completedThisMonth: completedTaskCount.status === 'fulfilled'
        ? completedTaskCount.value
        : (() => { failedQueries.push('completedThisMonth'); return 0; })(),
    }

    // 실패 항목 로깅
    if (failedQueries.length > 0) {
      logDashboardWarning('통계 쿼리 부분 실패', '일부 통계 데이터를 불러오지 못했습니다', {
        userId,
        failedQueries,
        errors: [
          activeStudyCount,
          taskCount,
          unreadNotificationCount,
          completedTaskCount
        ]
          .filter(r => r.status === 'rejected')
          .map(r => r.reason?.message)
      })
    }

    // ============================================
    // 2.2 나머지 쿼리들 - 개별 에러 처리
    // ============================================

    // 내 스터디 (최대 6개)
    const myStudies = await prisma.studyMember.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      take: 6,
      orderBy: {
        joinedAt: 'desc'
      },
      include: {
        study: {
          select: {
            id: true,
            name: true,
            emoji: true,
            category: true,
            _count: {
              select: {
                members: {
                  where: { status: 'ACTIVE' }
                }
              }
            }
          }
        }
      }
    }).catch(error => {
      logDashboardError('내 스터디 조회', error, { userId })
      failedQueries.push('myStudies')
      return [] // 실패 시 빈 배열 반환
    })

    // 최근 활동 (최대 5개)
    const recentActivities = await prisma.notification.findMany({
      where: {
        userId
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        type: true,
        message: true,
        studyName: true,
        studyEmoji: true,
        isRead: true,
        createdAt: true
      }
    }).catch(error => {
      logDashboardError('최근 활동 조회', error, { userId })
      failedQueries.push('recentActivities')
      return [] // 실패 시 빈 배열 반환
    })

    // 다가오는 일정 (3일 이내)
    const upcomingEvents = await prisma.event.findMany({
      where: {
        study: {
          members: {
            some: {
              userId,
              status: 'ACTIVE'
            }
          }
        },
        date: {
          gte: new Date(),
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }
      },
      take: 3,
      orderBy: {
        date: 'asc'
      },
      include: {
        study: {
          select: {
            name: true,
            emoji: true
          }
        }
      }
    }).catch(error => {
      logDashboardError('다가오는 일정 조회', error, { userId })
      failedQueries.push('upcomingEvents')
      return [] // 실패 시 빈 배열 반환
    })

    // ============================================
    // 2.3 응답 데이터 구성 및 검증
    // ============================================

    const responseData = {
      stats,
      myStudies: myStudies.map(sm => ({
        id: sm.study.id,
        name: sm.study.name,
        emoji: sm.study.emoji,
        category: sm.study.category,
        role: sm.role,
        memberCount: sm.study._count.members,
        joinedAt: sm.joinedAt
      })),
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        message: activity.message,
        studyName: activity.studyName,
        studyEmoji: activity.studyEmoji,
        isRead: activity.isRead,
        createdAt: activity.createdAt
      })),
      upcomingEvents: upcomingEvents.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        studyName: event.study.name,
        studyEmoji: event.study.emoji
      }))
    }

    // 데이터 검증
    const validation = validateDashboardData(responseData)
    if (!validation.valid) {
      logDashboardWarning('대시보드 데이터 검증 실패', '응답 데이터 검증 중 오류 발견', {
        userId,
        errors: validation.errors
      })
    }

    const duration = Date.now() - startTime
    console.log(`✅ [DASHBOARD] Data fetched successfully (${duration}ms)`)

    // 부분 실패가 있는 경우 경고와 함께 응답
    if (failedQueries.length > 0) {
      logDashboardWarning('부분 데이터 로드', '일부 데이터를 불러오지 못했습니다', {
        userId,
        duration,
        failedQueries,
        loadedQueries: ['stats', 'myStudies', 'recentActivities', 'upcomingEvents']
          .filter(q => !failedQueries.includes(q))
      })

      return NextResponse.json(
        createPartialSuccessResponse(responseData, failedQueries),
        { status: 207 } // Multi-Status
      )
    }

    // 정상 응답
    return NextResponse.json({
      success: true,
      data: responseData,
      metadata: {
        duration,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime

    // Prisma 에러 처리
    if (error.code && error.code.startsWith('P')) {
      const dashError = handlePrismaError(error)
      logDashboardError('Prisma 에러', error, {
        userId: session?.user?.id,
        prismaCode: error.code,
        duration
      })

      return NextResponse.json(dashError, { status: dashError.statusCode })
    }

    // 일반 에러 처리
    logDashboardError('대시보드 데이터 로드', error, {
      userId: session?.user?.id,
      duration,
      stack: error.stack
    })

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DASH-009',
          message: "대시보드 데이터를 가져오는 중 오류가 발생했습니다",
          category: 'API',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

