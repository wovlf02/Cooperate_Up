/**
 * 알림 목록 조회/생성 API
 *
 * @description
 * - GET: 사용자의 알림 목록 조회 (페이지네이션, 필터링 지원)
 * - POST: 새 알림 생성 (내부 시스템용)
 *
 * @module app/api/notifications/route
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
  validateNotificationQueryParams,
  validateNotificationCreateData
} from '@/lib/validators/notification-validators';
import {
  getUserNotificationsWithException,
  createNotificationWithException,
  createSuccessResponse,
  createErrorResponse,
  formatNotificationResponse
} from '@/lib/helpers/notification-helpers';

/**
 * GET /api/notifications
 * 사용자의 알림 목록 조회
 *
 * Query Parameters:
 * - page: 페이지 번호 (기본: 1)
 * - limit: 페이지당 항목 수 (기본: 20, 최대: 100)
 * - isRead: 읽음 필터 (true/false)
 * - type: 알림 타입 필터
 */
export async function GET(request) {
  try {
    // 1. 세션 검증
    const session = await getServerSession(authOptions);
    const user = validateSession(session);

    // 2. 쿼리 파라미터 추출 및 검증
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      isRead: searchParams.get('isRead'),
      type: searchParams.get('type')
    };

    const validatedParams = validateNotificationQueryParams(params);

    // 3. 알림 목록 조회
    const result = await getUserNotificationsWithException(
      user.id,
      validatedParams,
      prisma
    );

    // 4. 성공 응답
    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('[NOTIFICATION GET ERROR]', error);

    const response = createErrorResponse(error);
    return NextResponse.json(
      { error: response.error, code: response.code },
      { status: response.statusCode }
    );
  }
}

/**
 * POST /api/notifications
 * 새 알림 생성 (내부 시스템용)
 *
 * Request Body:
 * - userId: 수신자 ID (필수)
 * - type: 알림 타입 (필수)
 * - message: 알림 메시지 (필수)
 * - studyId: 스터디 ID (선택)
 * - studyName: 스터디 이름 (선택)
 * - studyEmoji: 스터디 이모지 (선택)
 * - data: 추가 데이터 (선택)
 */
export async function POST(request) {
  try {
    // 1. 세션 검증
    const session = await getServerSession(authOptions);
    validateSession(session);

    // 2. 요청 본문 파싱
    const body = await request.json();

    // 3. 데이터 검증
    const validatedData = validateNotificationCreateData(body);

    // 4. 알림 생성
    const notification = await createNotificationWithException(validatedData, prisma);

    // 5. 성공 응답
    return NextResponse.json(
      createSuccessResponse(
        { data: formatNotificationResponse(notification) },
        '알림이 생성되었습니다.'
      ),
      { status: 201 }
    );

  } catch (error) {
    console.error('[NOTIFICATION POST ERROR]', error);

    const response = createErrorResponse(error);
    return NextResponse.json(
      { error: response.error, code: response.code },
      { status: response.statusCode }
    );
  }
}

