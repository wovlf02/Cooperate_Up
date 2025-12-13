/**
 * 읽지 않은 알림 수 조회 API
 *
 * @description
 * - GET: 읽지 않은 알림 수 조회
 *
 * @module app/api/notifications/count/route
 * @author CoUp Team
 * @created 2025-12-03
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  NotificationPermissionException
} from '@/lib/exceptions/notification';
import {
  validateSession
} from '@/lib/validators/notification-validators';
import {
  getUnreadNotificationCount,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/helpers/notification-helpers';

/**
 * GET /api/notifications/count
 * 읽지 않은 알림 수 조회
 */
export async function GET(request) {
  try {
    // 1. 세션 검증
    const session = await getServerSession(authOptions);
    const user = validateSession(session);

    // 2. 읽지 않은 알림 수 조회
    const count = await getUnreadNotificationCount(user.id, prisma);

    // 3. 성공 응답
    return NextResponse.json(
      createSuccessResponse({ count })
    );

  } catch (error) {
    console.error('[NOTIFICATION COUNT ERROR]', error);

    const response = createErrorResponse(error);
    return NextResponse.json(
      { error: response.error, code: response.code },
      { status: response.statusCode }
    );
  }
}
