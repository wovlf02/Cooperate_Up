/**
 * 모든 알림 읽음 처리 API
 *
 * @description
 * - POST/PATCH: 모든 알림 읽음 처리
 *
 * @module app/api/notifications/mark-all-read/route
 * @author CoUp Team
 * @created 2025-12-03
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  NotificationPermissionException,
  NotificationBusinessException
} from '@/lib/exceptions/notification';
import {
  validateSession
} from '@/lib/validators/notification-validators';
import {
  markAllNotificationsAsRead,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/helpers/notification-helpers';

/**
 * POST /api/notifications/mark-all-read
 * 모든 알림 읽음 처리
 */
export async function POST(request) {
  try {
    // 1. 세션 검증
    const session = await getServerSession(authOptions);
    const user = validateSession(session);

    // 2. 모든 알림 읽음 처리
    const result = await markAllNotificationsAsRead(user.id, prisma);

    // 3. 성공 응답
    return NextResponse.json(
      createSuccessResponse(
        { count: result.count },
        `${result.count}개의 알림을 읽음으로 표시했습니다.`
      )
    );

  } catch (error) {
    console.error('[NOTIFICATION MARK ALL READ ERROR]', error);

    const response = createErrorResponse(error);
    return NextResponse.json(
      { error: response.error, code: response.code },
      { status: response.statusCode }
    );
  }
}

/**
 * PATCH /api/notifications/mark-all-read
 * 모든 알림 읽음 처리 (PATCH 메서드 지원)
 */
export async function PATCH(request) {
  return POST(request);
}

