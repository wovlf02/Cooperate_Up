/**
 * Dashboard Statistics API - 통계 데이터
 *
 * GET /api/dashboard/statistics - 통계 데이터 조회
 *
 * @module app/api/dashboard/statistics/route
 * @author CoUp Team
 * @created 2025-12-04
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  DashboardBusinessException,
  DashboardPermissionException
} from '@/lib/exceptions/dashboard';
import {
  validateSession,
  validateStatisticsParams,
  validateStudyIdForStats
} from '@/lib/validators/dashboard-validators';
import {
  getStudyStatistics,
  getTaskStatistics,
  createSuccessResponse,
  createErrorResponse,
  formatStatisticsResponse,
  withDashboardErrorHandler
} from '@/lib/helpers/dashboard-helpers';

/**
 * GET /api/dashboard/statistics
 *
 * 통계 데이터 조회
 *
 * Query Parameters:
 * - type: 통계 타입 (STUDY, TASK, NOTIFICATION, ACTIVITY, OVERVIEW)
 * - period: 기간 타입 (TODAY, THIS_WEEK, THIS_MONTH, THIS_YEAR, CUSTOM)
 * - startDate: 시작 날짜 (CUSTOM일 때 필수)
 * - endDate: 종료 날짜 (CUSTOM일 때 필수)
 * - studyId: 특정 스터디 ID (선택)
 * - aggregation: 집계 타입 (DAY, WEEK, MONTH, YEAR)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     type: 'STUDY',
 *     data: [...],
 *     summary: { ... },
 *     period: { startDate, endDate }
 *   }
 * }
 */
export const GET = withDashboardErrorHandler(async (request) => {
  // 1. 세션 검증
  const session = await getServerSession(authOptions);
  const user = validateSession(session);

  // 2. 쿼리 파라미터 검증
  const { searchParams } = new URL(request.url);
  const params = {
    type: searchParams.get('type'),
    period: searchParams.get('period'),
    startDate: searchParams.get('startDate'),
    endDate: searchParams.get('endDate'),
    aggregation: searchParams.get('aggregation')
  };
  const validatedParams = validateStatisticsParams(params);

  // 스터디 ID 검증 (선택)
  const studyId = validateStudyIdForStats(searchParams.get('studyId'));

  // 3. 통계 타입별 데이터 조회
  let statisticsData;

  switch (validatedParams.type) {
    case 'STUDY':
      statisticsData = await getStudyStatistics(user.id, validatedParams, prisma);
      break;

    case 'TASK':
      statisticsData = await getTaskStatistics(user.id, validatedParams, prisma);
      break;

    case 'NOTIFICATION':
      statisticsData = await getNotificationStatistics(user.id, validatedParams, prisma);
      break;

    case 'ACTIVITY':
      statisticsData = await getActivityStatistics(user.id, validatedParams, prisma);
      break;

    case 'OVERVIEW':
    default:
      statisticsData = await getOverviewStatistics(user.id, validatedParams, prisma);
      break;
  }

  // 4. 응답 포맷팅
  const formattedData = formatStatisticsResponse(statisticsData, validatedParams.type);

  return NextResponse.json(
    createSuccessResponse({ data: formattedData }, '통계 데이터 조회 성공'),
    { status: 200 }
  );
});

// ============================================
// 내부 헬퍼 함수
// ============================================

/**
 * 알림 통계 조회
 */
async function getNotificationStatistics(userId, options, prisma) {
  try {
    const { startDate, endDate } = options;

    const notifications = await prisma.notification.groupBy({
      by: ['type'],
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    });

    const total = await prisma.notification.count({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const unread = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return {
      data: notifications.map(n => ({
        type: n.type,
        count: n._count
      })),
      summary: {
        total,
        unread,
        read: total - unread
      },
      period: { startDate, endDate }
    };
  } catch (error) {
    throw DashboardBusinessException.statisticsCalculationFailed('알림', error.message);
  }
}

/**
 * 활동 통계 조회
 */
async function getActivityStatistics(userId, options, prisma) {
  try {
    const { startDate, endDate } = options;

    // 활동 내역: 알림, 메시지, 할일 완료 등
    const [notificationCount, messageCount, taskCompletedCount] = await Promise.all([
      prisma.notification.count({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.message.count({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.task.count({
        where: {
          userId,
          completed: true,
          completedAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    return {
      data: [
        { type: 'notifications', count: notificationCount },
        { type: 'messages', count: messageCount },
        { type: 'tasksCompleted', count: taskCompletedCount }
      ],
      summary: {
        totalActivities: notificationCount + messageCount + taskCompletedCount,
        notifications: notificationCount,
        messages: messageCount,
        tasksCompleted: taskCompletedCount
      },
      period: { startDate, endDate }
    };
  } catch (error) {
    throw DashboardBusinessException.statisticsCalculationFailed('활동', error.message);
  }
}

/**
 * 전체 개요 통계 조회
 */
async function getOverviewStatistics(userId, options, prisma) {
  try {
    const { startDate, endDate } = options;

    const [
      studyCount,
      taskStats,
      notificationCount,
      eventCount
    ] = await Promise.all([
      // 활성 스터디 수
      prisma.studyMember.count({
        where: { userId, status: 'ACTIVE' }
      }),
      // 할일 통계
      prisma.task.groupBy({
        by: ['completed'],
        where: { userId },
        _count: true
      }),
      // 읽지 않은 알림 수
      prisma.notification.count({
        where: { userId, isRead: false }
      }),
      // 예정 일정 수 (7일 이내)
      prisma.event.count({
        where: {
          study: {
            members: {
              some: { userId, status: 'ACTIVE' }
            }
          },
          date: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const completedTasks = taskStats.find(t => t.completed)?._count || 0;
    const pendingTasks = taskStats.find(t => !t.completed)?._count || 0;
    const totalTasks = completedTasks + pendingTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      data: {
        studies: { active: studyCount },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          completionRate
        },
        notifications: { unread: notificationCount },
        events: { upcoming: eventCount }
      },
      summary: {
        activeStudies: studyCount,
        pendingTasks,
        unreadNotifications: notificationCount,
        upcomingEvents: eventCount,
        taskCompletionRate: completionRate
      },
      period: { startDate, endDate }
    };
  } catch (error) {
    throw DashboardBusinessException.statisticsCalculationFailed('개요', error.message);
  }
}
