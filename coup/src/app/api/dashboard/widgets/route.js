/**
 * Dashboard Widgets API - 대시보드 위젯 설정
 *
 * GET /api/dashboard/widgets - 위젯 설정 조회
 * PATCH /api/dashboard/widgets - 위젯 설정 수정
 *
 * @module app/api/dashboard/widgets/route
 * @author CoUp Team
 * @created 2025-12-04
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  DashboardBusinessException
} from '@/lib/exceptions/dashboard';
import {
  validateSession,
  validateWidgetConfig,
  validateWidgetSettings
} from '@/lib/validators/dashboard-validators';
import {
  createSuccessResponse,
  withDashboardErrorHandler
} from '@/lib/helpers/dashboard-helpers';

// 기본 위젯 설정
const DEFAULT_WIDGETS = [
  { id: 'statistics', type: 'statistics', title: '통계', enabled: true, order: 1 },
  { id: 'my-studies', type: 'study-list', title: '내 스터디', enabled: true, order: 2 },
  { id: 'tasks', type: 'task-list', title: '할 일', enabled: true, order: 3 },
  { id: 'notifications', type: 'notification-list', title: '알림', enabled: true, order: 4 },
  { id: 'upcoming', type: 'schedule', title: '다가오는 일정', enabled: true, order: 5 },
  { id: 'recent-activities', type: 'activity-list', title: '최근 활동', enabled: true, order: 6 }
];

/**
 * GET /api/dashboard/widgets
 *
 * 위젯 설정 조회
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     widgets: [...widgets],
 *     lastUpdated: timestamp
 *   }
 * }
 */
export const GET = withDashboardErrorHandler(async (request) => {
  // 1. 세션 검증
  const session = await getServerSession(authOptions);
  const user = validateSession(session);

  // 2. 사용자 설정 조회
  const userSettings = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      dashboardWidgets: true,
      updatedAt: true
    }
  });

  // 3. 위젯 설정 반환 (없으면 기본값)
  let widgets;
  let lastUpdated;

  if (userSettings?.dashboardWidgets) {
    try {
      widgets = typeof userSettings.dashboardWidgets === 'string'
        ? JSON.parse(userSettings.dashboardWidgets)
        : userSettings.dashboardWidgets;
      lastUpdated = userSettings.updatedAt;
    } catch (parseError) {
      // JSON 파싱 실패시 기본값 사용
      widgets = DEFAULT_WIDGETS;
      lastUpdated = null;
    }
  } else {
    widgets = DEFAULT_WIDGETS;
    lastUpdated = null;
  }

  // 4. 응답
  return NextResponse.json(
    createSuccessResponse({ 
      widgets,
      lastUpdated,
      defaultWidgets: DEFAULT_WIDGETS
    }, '위젯 설정 조회 성공'),
    { status: 200 }
  );
});

/**
 * PATCH /api/dashboard/widgets
 *
 * 위젯 설정 수정
 *
 * Request Body:
 * {
 *   widgets: [
 *     { id: 'statistics', enabled: true, order: 1 },
 *     { id: 'my-studies', enabled: false, order: 2 },
 *     ...
 *   ]
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     widgets: [...updatedWidgets]
 *   }
 * }
 */
export const PATCH = withDashboardErrorHandler(async (request) => {
  // 1. 세션 검증
  const session = await getServerSession(authOptions);
  const user = validateSession(session);

  // 2. 요청 본문 파싱
  let body;
  try {
    body = await request.json();
  } catch (parseError) {
    throw DashboardBusinessException.widgetLoadFailed('위젯', parseError.message);
  }

  // 3. 위젯 설정 검증
  const { widgets } = body;
  if (!widgets) {
    throw DashboardBusinessException.widgetLoadFailed('widgets', '위젯 설정이 필요합니다');
  }

  // 각 위젯 설정 검증
  const validatedWidgets = [];
  for (const widget of widgets) {
    try {
      const validated = validateWidgetConfig(widget);
      validatedWidgets.push(validated);
    } catch (validationError) {
      throw validationError;
    }
  }

  // 4. 전체 위젯 설정 검증
  validateWidgetSettings({ widgets: validatedWidgets });

  // 5. 사용자 설정 업데이트
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      dashboardWidgets: JSON.stringify(validatedWidgets),
      updatedAt: new Date()
    },
    select: {
      dashboardWidgets: true,
      updatedAt: true
    }
  });

  // 6. 업데이트된 위젯 설정 파싱
  const updatedWidgets = typeof updatedUser.dashboardWidgets === 'string'
    ? JSON.parse(updatedUser.dashboardWidgets)
    : updatedUser.dashboardWidgets;

  // 7. 응답
  return NextResponse.json(
    createSuccessResponse({ 
      widgets: updatedWidgets,
      lastUpdated: updatedUser.updatedAt
    }, '위젯 설정 수정 성공'),
    { status: 200 }
  );
});
