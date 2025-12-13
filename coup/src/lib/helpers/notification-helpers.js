/**
 * notification-helpers.js (확장)
 *
 * Notification 도메인 헬퍼 함수 모음
 * NotificationException과 통합된 에러 처리
 *
 * 기존 lib/notification-helpers.js의 확장 버전
 *
 * @module lib/helpers/notification-helpers
 * @author CoUp Team
 * @created 2025-12-03
 */

import {
  NotificationBusinessException,
  NotificationPermissionException,
  NotificationValidationException
} from '@/lib/exceptions/notification';

// ============================================
// 응답 포맷팅
// ============================================

/**
 * 알림 정보를 클라이언트 응답 형식으로 변환
 *
 * @param {Object} notification - 알림 객체
 * @returns {Object} 포맷된 알림 정보
 *
 * @example
 * const formatted = formatNotificationResponse(notification);
 */
export function formatNotificationResponse(notification) {
  if (!notification) return null;

  return {
    id: notification.id,
    type: notification.type,
    message: notification.message,
    studyId: notification.studyId,
    studyName: notification.studyName,
    studyEmoji: notification.studyEmoji,
    data: notification.data,
    isRead: notification.isRead,
    createdAt: notification.createdAt
  };
}

/**
 * 알림 목록을 클라이언트 응답 형식으로 변환
 *
 * @param {Array} notifications - 알림 배열
 * @returns {Array} 포맷된 알림 배열
 *
 * @example
 * const formatted = formatNotificationsListResponse(notifications);
 */
export function formatNotificationsListResponse(notifications) {
  if (!notifications || !Array.isArray(notifications)) return [];

  return notifications.map(formatNotificationResponse);
}

/**
 * 페이지네이션 응답 생성
 *
 * @param {Array} data - 데이터 배열
 * @param {number} page - 현재 페이지
 * @param {number} limit - 페이지당 항목 수
 * @param {number} total - 전체 항목 수
 * @returns {Object} 페이지네이션 응답
 *
 * @example
 * const response = createPaginatedResponse(notifications, 1, 20, 100);
 */
export function createPaginatedResponse(data, page, limit, total) {
  const totalPages = Math.ceil(total / limit);

  return {
    data: formatNotificationsListResponse(data),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * 성공 응답 생성
 *
 * @param {Object} data - 응답 데이터
 * @param {string} message - 성공 메시지
 * @returns {Object} 성공 응답
 *
 * @example
 * const response = createSuccessResponse({ notification }, '알림을 읽었습니다.');
 */
export function createSuccessResponse(data, message = '성공') {
  return {
    success: true,
    message,
    ...data
  };
}

/**
 * 에러 응답 생성
 *
 * @param {Error} error - 에러 객체
 * @returns {Object} 에러 응답
 *
 * @example
 * const response = createErrorResponse(error);
 */
export function createErrorResponse(error) {
  if (error.code && error.statusCode) {
    // NotificationException 계열
    return {
      success: false,
      error: error.userMessage || error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }

  // 일반 에러
  return {
    success: false,
    error: error.message || '알 수 없는 오류가 발생했습니다.',
    statusCode: 500
  };
}

// ============================================
// 알림 존재 확인
// ============================================

/**
 * 알림 존재 확인
 *
 * @param {string} notificationId - 알림 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 알림 정보
 * @throws {NotificationBusinessException}
 *
 * @example
 * const notification = await checkNotificationExists('notification-123', prisma);
 */
export async function checkNotificationExists(notificationId, prisma) {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      throw NotificationBusinessException.notificationNotFound(notificationId);
    }

    return notification;
  } catch (error) {
    if (error.code?.startsWith('NOTI-')) {
      throw error;
    }
    throw NotificationBusinessException.databaseError('checkNotificationExists', error.message);
  }
}

/**
 * 알림 소유권 확인
 *
 * @param {string} notificationId - 알림 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 알림 정보
 * @throws {NotificationPermissionException|NotificationBusinessException}
 *
 * @example
 * const notification = await checkNotificationOwnership('notification-123', 'user-456', prisma);
 */
export async function checkNotificationOwnership(notificationId, userId, prisma) {
  const notification = await checkNotificationExists(notificationId, prisma);

  if (notification.userId !== userId) {
    throw NotificationPermissionException.notificationNotOwned(notificationId);
  }

  return notification;
}

// ============================================
// 읽음 처리
// ============================================

/**
 * 단일 알림 읽음 처리
 *
 * @param {string} notificationId - 알림 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 업데이트된 알림
 * @throws {NotificationBusinessException}
 *
 * @example
 * const notification = await markNotificationAsRead('notification-123', 'user-456', prisma);
 */
export async function markNotificationAsRead(notificationId, userId, prisma) {
  try {
    const notification = await checkNotificationOwnership(notificationId, userId, prisma);

    // 이미 읽은 알림이면 현재 상태 그대로 반환 (멱등성 보장)
    if (notification.isRead) {
      return notification;
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    return updated;
  } catch (error) {
    if (error.code?.startsWith('NOTI-')) {
      throw error;
    }
    throw NotificationBusinessException.markAsReadFailed(notificationId, error.message);
  }
}

/**
 * 모든 알림 읽음 처리
 *
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 업데이트 결과
 * @throws {NotificationBusinessException}
 *
 * @example
 * const result = await markAllNotificationsAsRead('user-456', prisma);
 */
export async function markAllNotificationsAsRead(userId, prisma) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return {
      count: result.count,
      success: true
    };
  } catch (error) {
    if (error.code?.startsWith('NOTI-')) {
      throw error;
    }
    throw NotificationBusinessException.markAllAsReadFailed(error.message);
  }
}

// ============================================
// 알림 생성
// ============================================

/**
 * 단일 알림 생성
 *
 * @param {Object} data - 알림 데이터
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 생성된 알림
 * @throws {NotificationBusinessException}
 *
 * @example
 * const notification = await createNotificationWithException({
 *   userId: 'user-123',
 *   type: 'JOIN_APPROVED',
 *   message: '가입이 승인되었습니다.'
 * }, prisma);
 */
export async function createNotificationWithException(data, prisma) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        message: data.message,
        studyId: data.studyId,
        studyName: data.studyName,
        studyEmoji: data.studyEmoji,
        data: data.data,
        isRead: false
      }
    });

    return notification;
  } catch (error) {
    if (error.code?.startsWith('NOTI-')) {
      throw error;
    }
    throw NotificationBusinessException.creationFailed(error.message);
  }
}

/**
 * 대량 알림 생성
 *
 * @param {string[]} userIds - 사용자 ID 배열
 * @param {Object} notificationData - 알림 데이터
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 생성 결과
 * @throws {NotificationBusinessException}
 *
 * @example
 * const result = await createBulkNotificationsWithException(
 *   ['user1', 'user2'],
 *   { type: 'NOTICE', message: '공지사항' },
 *   prisma
 * );
 */
export async function createBulkNotificationsWithException(userIds, notificationData, prisma) {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      type: notificationData.type,
      message: notificationData.message,
      studyId: notificationData.studyId,
      studyName: notificationData.studyName,
      studyEmoji: notificationData.studyEmoji,
      data: notificationData.data,
      isRead: false
    }));

    const result = await prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true
    });

    return {
      success: result.count,
      failed: userIds.length - result.count,
      total: userIds.length
    };
  } catch (error) {
    if (error.code?.startsWith('NOTI-')) {
      throw error;
    }
    throw NotificationBusinessException.bulkCreationFailed(0, userIds.length, error.message);
  }
}

// ============================================
// 알림 삭제
// ============================================

/**
 * 단일 알림 삭제
 *
 * @param {string} notificationId - 알림 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 삭제된 알림
 * @throws {NotificationBusinessException}
 *
 * @example
 * const deleted = await deleteNotificationWithException('notification-123', 'user-456', prisma);
 */
export async function deleteNotificationWithException(notificationId, userId, prisma) {
  try {
    await checkNotificationOwnership(notificationId, userId, prisma);

    const deleted = await prisma.notification.delete({
      where: { id: notificationId }
    });

    return deleted;
  } catch (error) {
    if (error.code?.startsWith('NOTI-')) {
      throw error;
    }
    throw NotificationBusinessException.deletionFailed(notificationId, error.message);
  }
}

/**
 * 여러 알림 삭제
 *
 * @param {string[]} notificationIds - 알림 ID 배열
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 삭제 결과
 * @throws {NotificationBusinessException}
 *
 * @example
 * const result = await deleteBulkNotificationsWithException(['n1', 'n2'], 'user-456', prisma);
 */
export async function deleteBulkNotificationsWithException(notificationIds, userId, prisma) {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId
      }
    });

    const failed = notificationIds.length - result.count;

    if (failed > 0) {
      throw NotificationBusinessException.bulkDeletionFailed(result.count, failed, '일부 알림 삭제 실패');
    }

    return {
      success: result.count,
      failed: 0,
      total: notificationIds.length
    };
  } catch (error) {
    if (error.code?.startsWith('NOTI-')) {
      throw error;
    }
    throw NotificationBusinessException.bulkDeletionFailed(0, notificationIds.length, error.message);
  }
}

/**
 * 오래된 알림 삭제
 *
 * @param {string} userId - 사용자 ID
 * @param {number} daysOld - 보관 기간 (일)
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 삭제 결과
 *
 * @example
 * const result = await deleteOldNotifications('user-456', 30, prisma);
 */
export async function deleteOldNotifications(userId, daysOld = 30, prisma) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        createdAt: { lt: cutoffDate },
        isRead: true
      }
    });

    return {
      count: result.count,
      success: true
    };
  } catch (error) {
    return {
      count: 0,
      success: false,
      error: error.message
    };
  }
}

// ============================================
// 조회
// ============================================

/**
 * 사용자의 알림 목록 조회
 *
 * @param {string} userId - 사용자 ID
 * @param {Object} options - 조회 옵션
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 알림 목록 및 페이지네이션 정보
 * @throws {NotificationBusinessException}
 *
 * @example
 * const result = await getUserNotificationsWithException('user-456', { page: 1, limit: 20 }, prisma);
 */
export async function getUserNotificationsWithException(userId, options, prisma) {
  try {
    const { page = 1, limit = 20, isRead, type } = options;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(isRead !== undefined && { isRead }),
      ...(type && { type })
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    return createPaginatedResponse(notifications, page, limit, total);
  } catch (error) {
    if (error.code?.startsWith('NOTI-')) {
      throw error;
    }
    throw NotificationBusinessException.listFetchFailed(error.message);
  }
}

/**
 * 읽지 않은 알림 수 조회
 *
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<number>} 읽지 않은 알림 수
 * @throws {NotificationBusinessException}
 *
 * @example
 * const count = await getUnreadNotificationCount('user-456', prisma);
 */
export async function getUnreadNotificationCount(userId, prisma) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    return count;
  } catch (error) {
    if (error.code?.startsWith('NOTI-')) {
      throw error;
    }
    throw NotificationBusinessException.unreadCountFetchFailed(error.message);
  }
}

// ============================================
// 사용자 확인
// ============================================

/**
 * 사용자 존재 확인
 *
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 사용자 정보
 * @throws {NotificationBusinessException}
 *
 * @example
 * const user = await checkUserExists('user-456', prisma);
 */
export async function checkUserExists(userId, prisma) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    });

    if (!user) {
      throw NotificationBusinessException.userNotFound(userId);
    }

    return user;
  } catch (error) {
    if (error.code?.startsWith('NOTI-')) {
      throw error;
    }
    throw NotificationBusinessException.databaseError('checkUserExists', error.message);
  }
}

/**
 * 스터디 존재 확인
 *
 * @param {string} studyId - 스터디 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 스터디 정보
 * @throws {NotificationBusinessException}
 *
 * @example
 * const study = await checkStudyExists('study-123', prisma);
 */
export async function checkStudyExists(studyId, prisma) {
  try {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: {
        id: true,
        name: true,
        emoji: true
      }
    });

    if (!study) {
      throw NotificationBusinessException.studyNotFound(studyId);
    }

    return study;
  } catch (error) {
    if (error.code?.startsWith('NOTI-')) {
      throw error;
    }
    throw NotificationBusinessException.databaseError('checkStudyExists', error.message);
  }
}

// ============================================
// 에러 핸들링
// ============================================

/**
 * Notification 에러 핸들러 래퍼
 *
 * @param {Function} handler - 핸들러 함수
 * @returns {Function} 래핑된 핸들러
 *
 * @example
 * export const GET = withNotificationErrorHandler(async (request) => { ... });
 */
export function withNotificationErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('[NOTIFICATION ERROR]', error);

      const response = createErrorResponse(error);

      return new Response(JSON.stringify(response), {
        status: response.statusCode || 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

// ============================================
// 상수 Export
// ============================================

export const NOTIFICATION_HELPER_VERSION = '1.0.0';
