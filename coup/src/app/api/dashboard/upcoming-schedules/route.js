/**
 * Dashboard Upcoming Schedules API - 예정 일정
 *
 * GET /api/dashboard/upcoming-schedules - 예정 일정 목록 조회
 *
 * @module app/api/dashboard/upcoming-schedules/route
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
  validateUpcomingSchedulesParams
} from '@/lib/validators/dashboard-validators';
import {
  getUpcomingSchedules,
  createSuccessResponse,
  withDashboardErrorHandler
} from '@/lib/helpers/dashboard-helpers';

/**
 * GET /api/dashboard/upcoming-schedules
 *
 * 예정 일정 목록 조회
 *
 * Query Parameters:
 * - limit: 조회할 일정 수 (기본값: 5, 최대: 100)
 * - days: 조회할 일수 (기본값: 7, 최대: 30)
 *
 * Response:
 * {
 *   success: true,
 *   data: [...schedules]
 * }
 */
export const GET = withDashboardErrorHandler(async (request) => {
  // 1. 세션 검증
  const session = await getServerSession(authOptions);
  const user = validateSession(session);

  // 2. 쿼리 파라미터 검증
  const { searchParams } = new URL(request.url);
  const params = {
    limit: searchParams.get('limit'),
    days: searchParams.get('days')
  };
  const validatedParams = validateUpcomingSchedulesParams(params);

  // 3. 예정 일정 조회
  const schedules = await getUpcomingSchedules(user.id, validatedParams, prisma);

  // 4. 응답
  return NextResponse.json(
    createSuccessResponse({ 
      data: schedules,
      count: schedules.length,
      period: {
        days: validatedParams.days
      }
    }, '예정 일정 조회 성공'),
    { status: 200 }
  );
});
