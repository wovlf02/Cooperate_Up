/**
 * Dashboard Summary API - 요약 데이터
 *
 * GET /api/dashboard/summary - 대시보드 요약 데이터 조회
 *
 * @module app/api/dashboard/summary/route
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
  validateSession
} from '@/lib/validators/dashboard-validators';
import {
  getDashboardSummary,
  createSuccessResponse,
  withDashboardErrorHandler
} from '@/lib/helpers/dashboard-helpers';

/**
 * GET /api/dashboard/summary
 *
 * 대시보드 요약 데이터 조회
 * - 스터디 요약 (활성/전체)
 * - 할일 요약 (대기/완료/전체/완료율)
 * - 알림 요약 (읽지 않음)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     studies: { active, total },
 *     tasks: { pending, completed, total, completionRate },
 *     notifications: { unread }
 *   }
 * }
 */
export const GET = withDashboardErrorHandler(async (request) => {
  // 1. 세션 검증
  const session = await getServerSession(authOptions);
  const user = validateSession(session);

  // 2. 요약 데이터 조회
  const summaryData = await getDashboardSummary(user.id, {}, prisma);

  // 3. 응답
  return NextResponse.json(
    createSuccessResponse({ data: summaryData }, '요약 데이터 조회 성공'),
    { status: 200 }
  );
});
