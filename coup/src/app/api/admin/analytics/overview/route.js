/**
 * 관리자 - 전체 통계 개요 API
 * GET /api/admin/analytics/overview
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'
import {
  AdminPermissionException,
  AdminDatabaseException
} from '@/lib/exceptions/admin'
import { AdminLogger } from '@/lib/logging/adminLogger'
import { withAdminErrorHandler } from '@/lib/utils/admin-utils'

const prisma = new PrismaClient()

async function getAnalyticsOverviewHandler(request) {
  const startTime = Date.now()

  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.ANALYTICS_VIEW)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.ANALYTICS_VIEW, 'unknown')
  }

  const adminId = auth.adminRole.userId

  AdminLogger.info('Admin analytics overview request', { adminId })

  try {
    // 날짜 범위 설정
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // 1. 사용자 통계
    const [totalUsers, activeUsers, suspendedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      prisma.user.count({
        where: {
          status: 'SUSPENDED'
        }
      })
    ])

    // 2. 스터디 통계
    const [totalStudies, publicStudies, recruitingStudies] = await Promise.all([
      prisma.study.count(),
      prisma.study.count({
        where: {
          isPublic: true
        }
      }),
      prisma.study.count({
        where: {
          isRecruiting: true
        }
      })
    ])

    // 3. 신고 통계
    const [totalReports, pendingReports, inProgressReports, resolvedReports] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({
        where: {
          status: 'PENDING'
        }
      }),
      prisma.report.count({
        where: {
          status: 'IN_PROGRESS'
        }
      }),
      prisma.report.count({
        where: {
          status: 'RESOLVED'
        }
      })
    ])

    // 4. 일일 가입자 수 추이 (최근 30일)
    const dailySignups = await getDailySignups(thirtyDaysAgo, now)

    // 5. 일일 스터디 생성 추이 (최근 30일)
    const dailyStudies = await getDailyStudies(thirtyDaysAgo, now)

    // 6. 일일 신고 접수 추이 (최근 30일)
    const dailyReports = await getDailyReports(thirtyDaysAgo, now)

    // 관리자 로그 기록
    const duration = Date.now() - startTime
    AdminLogger.logAnalyticsView(adminId, 'overview', {
      duration,
      userCount: totalUsers,
      studyCount: totalStudies,
      reportCount: totalReports
    })

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          users: {
            total: totalUsers,
            active: activeUsers,
            suspended: suspendedUsers,
            growth: calculateGrowthRate(dailySignups)
          },
          studies: {
            total: totalStudies,
            public: publicStudies,
            recruiting: recruitingStudies,
            growth: calculateGrowthRate(dailyStudies)
          },
          reports: {
            total: totalReports,
            pending: pendingReports,
            in_progress: inProgressReports,
            resolved: resolvedReports,
            resolution_rate: totalReports > 0
              ? Math.round((resolvedReports / totalReports) * 100)
              : 0
          }
        },
        trends: {
          dailySignups,
          dailyStudies,
          dailyReports
        }
      }
    })

  } catch (error) {
    if (error.name?.includes('Admin')) throw error

    if (error.code?.startsWith('P')) {
      AdminLogger.error('Database error in analytics overview', {
        adminId,
        error: error.message,
        code: error.code
      })
      throw AdminDatabaseException.queryFailed('analytics overview', error.message)
    }

    AdminLogger.critical('Unknown error in analytics overview', {
      adminId,
      error: error.message
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withAdminErrorHandler(getAnalyticsOverviewHandler)

/**
 * 일일 가입자 수 추이 조회
 */
async function getDailySignups(startDate, endDate) {
  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      createdAt: true
    }
  })

  return aggregateByDate(users, 'createdAt', startDate, endDate)
}

/**
 * 일일 스터디 생성 추이 조회
 */
async function getDailyStudies(startDate, endDate) {
  const studies = await prisma.study.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      createdAt: true
    }
  })

  return aggregateByDate(studies, 'createdAt', startDate, endDate)
}

/**
 * 일일 신고 접수 추이 조회
 */
async function getDailyReports(startDate, endDate) {
  const reports = await prisma.report.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      createdAt: true
    }
  })

  return aggregateByDate(reports, 'createdAt', startDate, endDate)
}

/**
 * 날짜별 데이터 집계
 */
function aggregateByDate(data, dateField, startDate, endDate) {
  // 날짜 범위 생성
  const dateMap = new Map()
  const current = new Date(startDate)

  while (current <= endDate) {
    const dateStr = formatDate(current)
    dateMap.set(dateStr, 0)
    current.setDate(current.getDate() + 1)
  }

  // 데이터 카운트
  data.forEach(item => {
    const dateStr = formatDate(item[dateField])
    if (dateMap.has(dateStr)) {
      dateMap.set(dateStr, dateMap.get(dateStr) + 1)
    }
  })

  // 배열로 변환
  return Array.from(dateMap.entries()).map(([date, count]) => ({
    date,
    count
  }))
}

/**
 * 날짜 포맷 (YYYY-MM-DD)
 */
function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 성장률 계산 (최근 7일 vs 그 이전 7일)
 */
function calculateGrowthRate(dailyData) {
  if (dailyData.length < 14) return 0

  const recentWeek = dailyData.slice(-7).reduce((sum, item) => sum + item.count, 0)
  const previousWeek = dailyData.slice(-14, -7).reduce((sum, item) => sum + item.count, 0)

  if (previousWeek === 0) return recentWeek > 0 ? 100 : 0

  return Math.round(((recentWeek - previousWeek) / previousWeek) * 100)
}

