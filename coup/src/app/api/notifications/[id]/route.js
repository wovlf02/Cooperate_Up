/**
 * 알림 삭제 API
 *
 * @description
 * - GET: 특정 알림 조회
 * - DELETE: 특정 알림 삭제
 *
 * @module app/api/notifications/[id]/route
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
  checkNotificationOwnership,
  deleteNotificationWithException,
  createSuccessResponse,
  createErrorResponse,
  formatNotificationResponse
} from '@/lib/helpers/notification-helpers';

/**
 * GET /api/notifications/[id]
 * 특정 알림 조회
 */
export async function GET(request, { params }) {
  try {
    // 1. 세션 검증
    const session = await getServerSession(authOptions);
    const user = validateSession(session);

    // 2. params에서 id 추출
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 3. 알림 ID 검증
    validateNotificationId(id);

    // 4. 알림 조회 및 소유권 확인
    const notification = await checkNotificationOwnership(id, user.id, prisma);

    // 5. 성공 응답
    return NextResponse.json(
      createSuccessResponse({ data: formatNotificationResponse(notification) })
    );

  } catch (error) {
    console.error('[NOTIFICATION GET BY ID ERROR]', error);

    const response = createErrorResponse(error);
    return NextResponse.json(
      { error: response.error, code: response.code },
      { status: response.statusCode }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * 특정 알림 삭제
 */
export async function DELETE(request, { params }) {
  try {
    // 1. 세션 검증
    const session = await getServerSession(authOptions);
    const user = validateSession(session);

    // 2. params에서 id 추출
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // 3. 알림 ID 검증
    validateNotificationId(id);

    // 4. 알림 삭제
    const deleted = await deleteNotificationWithException(id, user.id, prisma);

    // 5. 성공 응답
    return NextResponse.json(
      createSuccessResponse(
        { data: formatNotificationResponse(deleted) },
        '알림이 삭제되었습니다.'
      )
    );

  } catch (error) {
    console.error('[NOTIFICATION DELETE ERROR]', error);

    const response = createErrorResponse(error);
    return NextResponse.json(
      { error: response.error, code: response.code },
      { status: response.statusCode }
    );
  }
}

