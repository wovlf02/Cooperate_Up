/**
 * 알림 대량 삭제 API
 *
 * @description
 * - DELETE: 여러 알림 삭제
 *
 * @module app/api/notifications/bulk/route
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
  deleteBulkNotificationsWithException,
  createSuccessResponse,
  createErrorResponse
} from '@/lib/helpers/notification-helpers';

/**
 * DELETE /api/notifications/bulk
 * 여러 알림 삭제
 *
 * Request Body:
 * - ids: 삭제할 알림 ID 배열
 */
export async function DELETE(request) {
  try {
    // 1. 세션 검증
    const session = await getServerSession(authOptions);
    const user = validateSession(session);

    // 2. 요청 본문 파싱
    const body = await request.json();
    const { ids } = body;

    // 3. ID 배열 검증
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw NotificationBusinessException.invalidInput('삭제할 알림 ID 배열이 필요합니다.');
    }

    // 각 ID 검증
    for (const id of ids) {
      validateNotificationId(id);
    }

    // 4. 알림 삭제
    const result = await deleteBulkNotificationsWithException(ids, user.id, prisma);

    // 5. 성공 응답
    return NextResponse.json(
      createSuccessResponse(
        { ...result },
        `${result.success}개의 알림이 삭제되었습니다.`
      )
    );

  } catch (error) {
    console.error('[NOTIFICATION BULK DELETE ERROR]', error);

    const response = createErrorResponse(error);
    return NextResponse.json(
      { error: response.error, code: response.code },
      { status: response.statusCode }
    );
  }
}
