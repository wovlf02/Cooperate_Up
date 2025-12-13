/**
 * Dashboard Recent Activities API - 최근 활동
 *
 * GET /api/dashboard/recent-activities - 최근 활동 목록 조회
 *
 * @module app/api/dashboard/recent-activities/route
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
  validateRecentActivitiesParams
} from '@/lib/validators/dashboard-validators';
import {
  getRecentActivities,
  createSuccessResponse,
  createPaginatedResponse,
  withDashboardErrorHandler
} from '@/lib/helpers/dashboard-helpers';

/**
 * GET /api/dashboard/recent-activities
 *
 * 최근 활동 목록 조회
 *
 * Query Parameters:
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 항목 수 (기본값: 10, 최대: 100)
 * - types: 활동 타입 필터 (선택)
 *
 * Response:
 * {
 *   success: true,
 *   data: [...activities],
 *   pagination: { page, limit, total, totalPages, hasNext, hasPrev }
 * }
 */
export const GET = withDashboardErrorHandler(async (request) => {
  // 1. 세션 검증
  const session = await getServerSession(authOptions);
  const user = validateSession(session);

  // 2. 쿼리 파라미터 검증
  const { searchParams } = new URL(request.url);
  const params = {
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    types: searchParams.get('types')?.split(',').filter(Boolean)
  };
  const validatedParams = validateRecentActivitiesParams(params);

  // 3. 최근 활동 조회
  const activities = await getRecentActivities(user.id, validatedParams, prisma);

  // 4. 전체 개수 조회
  const total = await prisma.notification.count({
    where: { userId: user.id }
  });

  // 5. 페이지네이션 응답 생성
  const response = createPaginatedResponse(
    activities,
    validatedParams.page,
    validatedParams.limit,
    total
  );

  return NextResponse.json(
    createSuccessResponse(response, '최근 활동 조회 성공'),
    { status: 200 }
  );
});
