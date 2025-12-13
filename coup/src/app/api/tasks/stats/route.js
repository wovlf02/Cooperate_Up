// src/app/api/tasks/stats/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/tasks/stats
 * 할일 통계 조회
 */
export async function GET(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const userId = session.user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())

    const thisWeekEnd = new Date(thisWeekStart)
    thisWeekEnd.setDate(thisWeekStart.getDate() + 7)

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // 병렬로 통계 조회
    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      todayTasks,
      thisWeekTasks,
      thisMonthTasks,
      overdueTasks,
      byPriority,
      byStatus,
      recentCompleted
    ] = await Promise.all([
      // 전체 할일 수
      prisma.task.count({
        where: { userId }
      }),

      // 완료된 할일
      prisma.task.count({
        where: { userId, completed: true }
      }),

      // 미완료 할일
      prisma.task.count({
        where: { userId, completed: false }
      }),

      // 오늘 할일
      prisma.task.count({
        where: {
          userId,
          completed: false,
          dueDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // 이번 주 할일
      prisma.task.count({
        where: {
          userId,
          completed: false,
          dueDate: {
            gte: thisWeekStart,
            lt: thisWeekEnd
          }
        }
      }),

      // 이번 달 할일
      prisma.task.count({
        where: {
          userId,
          completed: false,
          dueDate: {
            gte: thisMonthStart,
            lte: thisMonthEnd
          }
        }
      }),

      // 기한 지난 할일
      prisma.task.count({
        where: {
          userId,
          completed: false,
          dueDate: {
            lt: today
          }
        }
      }),

      // 우선순위별 통계
      prisma.task.groupBy({
        by: ['priority'],
        where: {
          userId,
          completed: false
        },
        _count: {
          id: true
        }
      }),

      // 상태별 통계
      prisma.task.groupBy({
        by: ['status'],
        where: { userId },
        _count: {
          id: true
        }
      }),

      // 최근 완료된 할일 (5개)
      prisma.task.findMany({
        where: {
          userId,
          completed: true
        },
        take: 5,
        orderBy: {
          completedAt: 'desc'
        },
        select: {
          id: true,
          title: true,
          completedAt: true,
          priority: true
        }
      })
    ])

    // 우선순위별 데이터 포맷팅
    const priorityStats = {
      URGENT: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    }
    byPriority.forEach(item => {
      priorityStats[item.priority] = item._count.id
    })

    // 상태별 데이터 포맷팅
    const statusStats = {
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      DONE: 0
    }
    byStatus.forEach(item => {
      statusStats[item.status] = item._count.id
    })

    // 완료율 계산
    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          completionRate: completionRate
        },
        timeline: {
          today: todayTasks,
          thisWeek: thisWeekTasks,
          thisMonth: thisMonthTasks,
          overdue: overdueTasks
        },
        byPriority: priorityStats,
        byStatus: statusStats,
        recentCompleted: recentCompleted
      }
    })

  } catch (error) {
    console.error('Task stats error:', error)
    return NextResponse.json(
      { error: "할일 통계 조회 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

