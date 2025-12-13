/**
 * 관리자 - 통계 API
 * GET /api/admin/stats
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function GET(request) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.ANALYTICS_VIEW)
  if (auth instanceof NextResponse) return auth

  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    // 사용자 통계
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      newUsersToday,
      newUsersThisWeek,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    ])

    // 스터디 통계
    const [
      totalStudies,
      activeStudies,
      newStudiesToday,
      newStudiesThisWeek,
    ] = await Promise.all([
      prisma.study.count(),
      prisma.study.count({ where: { isRecruiting: true } }),
      prisma.study.count({ where: { createdAt: { gte: today } } }),
      prisma.study.count({ where: { createdAt: { gte: weekAgo } } }),
    ])

    // 신고 통계
    const [
      totalReports,
      pendingReports,
      urgentReports,
      newReportsToday,
    ] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.count({
        where: {
          status: 'PENDING',
          priority: 'URGENT'
        }
      }),
      prisma.report.count({ where: { createdAt: { gte: today } } }),
    ])

    // 경고 및 제재 통계
    const [
      totalWarnings,
      warningsToday,
      activeSanctions,
    ] = await Promise.all([
      prisma.warning.count(),
      prisma.warning.count({ where: { createdAt: { gte: today } } }),
      prisma.sanction.count({ where: { isActive: true } }),
    ])

    // 최근 활동 (다양한 타입)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    })

    const recentReports = await prisma.report.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { status: 'PENDING' },
      select: {
        id: true,
        type: true,
        targetType: true,
        priority: true,
        createdAt: true,
        reporter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    const recentWarnings = await prisma.warning.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reason: true,
        severity: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // 차트 데이터 (최근 7일)
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      last7Days.push(date)
    }

    const userGrowth = await Promise.all(
      last7Days.map(async (date) => {
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
        const count = await prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        })
        return {
          date: date.toISOString().split('T')[0],
          count,
        }
      })
    )

    const reportTrends = await Promise.all(
      last7Days.map(async (date) => {
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
        const count = await prisma.report.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        })
        return {
          date: date.toISOString().split('T')[0],
          count,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          users: {
            total: totalUsers,
            active: activeUsers,
            suspended: suspendedUsers,
            newToday: newUsersToday,
            newThisWeek: newUsersThisWeek,
          },
          studies: {
            total: totalStudies,
            active: activeStudies,
            newToday: newStudiesToday,
            newThisWeek: newStudiesThisWeek,
          },
          reports: {
            total: totalReports,
            pending: pendingReports,
            urgent: urgentReports,
            newToday: newReportsToday,
          },
          moderation: {
            totalWarnings,
            warningsToday,
            activeSanctions,
          },
        },
        recentActivity: {
          users: recentUsers,
          reports: recentReports,
          warnings: recentWarnings,
        },
        charts: {
          userGrowth,
          reportTrends,
        },
      },
    })
  } catch (error) {
    console.error('Get admin stats error:', error)
    return NextResponse.json(
      { success: false, error: '통계 조회 실패' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

