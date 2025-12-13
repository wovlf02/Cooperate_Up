/**
 * 알림 읽음 처리 API
 *
 * @description
 * - POST/PATCH: 특정 알림 읽음 처리
 *
 * @module app/api/notifications/[id]/read/route
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
  validateSession,
  validateNotificationId
} from '@/lib/validators/notification-validators';
import {
  markNotificationAsRead,
  createSuccessResponse,
  createErrorResponse,
  formatNotificationResponse
} from '@/lib/helpers/notification-helpers';

/**
 * POST /api/notifications/[id]/read
 * 특정 알림 읽음 처리
 */
export async function POST(request, { params }) {
  try {
    // 1. 세션 검증
    const session = await getServerSession(authOptions);
    const user = validateSession(session);

    // 2. params에서 id 추출
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 3. 알림 ID 검증
    validateNotificationId(id);

    // 4. 알림 읽음 처리
    const notification = await markNotificationAsRead(id, user.id, prisma);

    // 5. 성공 응답
    return NextResponse.json(
      createSuccessResponse(
        { data: formatNotificationResponse(notification) },
        '알림을 읽음으로 표시했습니다.'
      )
    );

  } catch (error) {
    console.error('[NOTIFICATION READ ERROR]', error);

    const response = createErrorResponse(error);
    return NextResponse.json(
      { error: response.error, code: response.code },
      { status: response.statusCode }
    );
  }
}

/**
 * PATCH /api/notifications/[id]/read
 * 특정 알림 읽음 처리 (PATCH 메서드 지원)
 */
export async function PATCH(request, { params }) {
  return POST(request, { params });
}

