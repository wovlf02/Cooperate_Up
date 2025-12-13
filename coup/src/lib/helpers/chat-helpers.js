/**
 * chat-helpers.js
 *
 * Chat 도메인 헬퍼 함수 모음
 * ChatException과 통합된 에러 처리
 *
 * @module lib/helpers/chat-helpers
 * @author CoUp Team
 * @created 2025-12-04
 */

import {
  ChatBusinessException,
  ChatPermissionException,
  ChatValidationException
} from '@/lib/exceptions/chat';

// ============================================
// 응답 포맷팅
// ============================================

/**
 * 메시지 정보를 클라이언트 응답 형식으로 변환
 *
 * @param {Object} message - 메시지 객체
 * @returns {Object} 포맷된 메시지 정보
 *
 * @example
 * const formatted = formatMessageResponse(message);
 */
export function formatMessageResponse(message) {
  if (!message) return null;

  return {
    id: message.id,
    studyId: message.studyId,
    userId: message.userId,
    content: message.content,
    fileId: message.fileId,
    file: message.file ? {
      id: message.file.id,
      name: message.file.name,
      url: message.file.url,
      type: message.file.type,
      size: message.file.size
    } : null,
    user: message.user ? {
      id: message.user.id,
      name: message.user.name,
      avatar: message.user.avatar
    } : null,
    readers: message.readers || [],
    createdAt: message.createdAt,
    updatedAt: message.updatedAt
  };
}

/**
 * 메시지 목록을 클라이언트 응답 형식으로 변환
 *
 * @param {Array} messages - 메시지 배열
 * @returns {Array} 포맷된 메시지 배열
 *
 * @example
 * const formatted = formatMessagesListResponse(messages);
 */
export function formatMessagesListResponse(messages) {
  if (!messages || !Array.isArray(messages)) return [];

  return messages.map(formatMessageResponse);
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
 * const response = createPaginatedResponse(messages, 1, 50, 100);
 */
export function createPaginatedResponse(data, page, limit, total) {
  const totalPages = Math.ceil(total / limit);

  return {
    data: formatMessagesListResponse(data),
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
 * const response = createSuccessResponse({ message }, '메시지를 전송했습니다.');
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
    // ChatException 계열
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
// 메시지 존재 확인
// ============================================

/**
 * 메시지 존재 확인
 *
 * @param {string} messageId - 메시지 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 메시지 정보
 * @throws {ChatBusinessException}
 *
 * @example
 * const message = await checkMessageExists('msg-123', prisma);
 */
export async function checkMessageExists(messageId, prisma) {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        file: true
      }
    });

    if (!message) {
      throw ChatBusinessException.messageNotFound(messageId);
    }

    return message;
  } catch (error) {
    if (error.code?.startsWith('CHAT-')) {
      throw error;
    }
    throw ChatBusinessException.databaseError('checkMessageExists', error.message);
  }
}

/**
 * 메시지 소유권 확인
 *
 * @param {string} messageId - 메시지 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 메시지 정보
 * @throws {ChatPermissionException|ChatBusinessException}
 *
 * @example
 * const message = await checkMessageOwnership('msg-123', 'user-456', prisma);
 */
export async function checkMessageOwnership(messageId, userId, prisma) {
  const message = await checkMessageExists(messageId, prisma);

  if (message.userId !== userId) {
    throw ChatPermissionException.messageNotOwned(messageId);
  }

  return message;
}

// ============================================
// 스터디 & 멤버십 확인
// ============================================

/**
 * 스터디 존재 확인
 *
 * @param {string} studyId - 스터디 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 스터디 정보
 * @throws {ChatBusinessException}
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
        emoji: true,
        ownerId: true
      }
    });

    if (!study) {
      throw ChatBusinessException.studyNotFound(studyId);
    }

    return study;
  } catch (error) {
    if (error.code?.startsWith('CHAT-')) {
      throw error;
    }
    throw ChatBusinessException.databaseError('checkStudyExists', error.message);
  }
}

/**
 * 스터디 멤버십 확인
 *
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 멤버십 정보
 * @throws {ChatPermissionException}
 *
 * @example
 * const membership = await checkStudyMembership('study-123', 'user-456', prisma);
 */
export async function checkStudyMembership(studyId, userId, prisma) {
  try {
    const membership = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      }
    });

    if (!membership) {
      throw ChatPermissionException.notStudyMember(studyId);
    }

    if (membership.status === 'PENDING') {
      throw ChatPermissionException.membershipPending(studyId);
    }

    if (membership.status === 'KICKED') {
      throw ChatPermissionException.membershipKicked(studyId);
    }

    if (membership.status !== 'ACTIVE') {
      throw ChatPermissionException.notStudyMember(studyId);
    }

    return membership;
  } catch (error) {
    if (error.code?.startsWith('CHAT-')) {
      throw error;
    }
    throw ChatBusinessException.databaseError('checkStudyMembership', error.message);
  }
}

/**
 * 사용자 채팅 권한 확인 (제재 여부)
 *
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<boolean>} 채팅 가능 여부
 * @throws {ChatPermissionException}
 *
 * @example
 * const canChat = await checkUserChatPermission('user-456', prisma);
 */
export async function checkUserChatPermission(userId, prisma) {
  try {
    // 사용자 상태 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        status: true,
        suspendReason: true
      }
    });

    if (!user) {
      throw ChatBusinessException.userNotFound(userId);
    }

    if (user.status === 'SUSPENDED') {
      throw ChatPermissionException.accountSuspended(user.suspendReason);
    }

    // 채팅 금지 제재 확인
    const chatBan = await prisma.sanction.findFirst({
      where: {
        userId,
        type: 'CHAT_BAN',
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (chatBan) {
      throw ChatPermissionException.chatBanned(chatBan.reason, chatBan.expiresAt);
    }

    return true;
  } catch (error) {
    if (error.code?.startsWith('CHAT-')) {
      throw error;
    }
    throw ChatBusinessException.databaseError('checkUserChatPermission', error.message);
  }
}

// ============================================
// 메시지 생성 / 전송
// ============================================

/**
 * 메시지 생성
 *
 * @param {Object} data - 메시지 데이터
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 생성된 메시지
 * @throws {ChatBusinessException}
 *
 * @example
 * const message = await createMessage({
 *   studyId: 'study-123',
 *   userId: 'user-456',
 *   content: '안녕하세요!'
 * }, prisma);
 */
export async function createMessage(data, prisma) {
  try {
    const message = await prisma.message.create({
      data: {
        studyId: data.studyId,
        userId: data.userId,
        content: data.content,
        fileId: data.fileId || null,
        readers: [data.userId] // 작성자는 기본적으로 읽음
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        file: true
      }
    });

    return message;
  } catch (error) {
    if (error.code?.startsWith('CHAT-')) {
      throw error;
    }
    throw ChatBusinessException.sendFailed(error.message);
  }
}

// ============================================
// 읽음 처리
// ============================================

/**
 * 단일 메시지 읽음 처리
 *
 * @param {string} messageId - 메시지 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 업데이트된 메시지
 * @throws {ChatBusinessException}
 *
 * @example
 * const message = await markMessageAsRead('msg-123', 'user-456', prisma);
 */
export async function markMessageAsRead(messageId, userId, prisma) {
  try {
    const message = await checkMessageExists(messageId, prisma);

    // 이미 읽음 표시된 경우
    if (message.readers.includes(userId)) {
      return message;
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        readers: {
          push: userId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        file: true
      }
    });

    return updated;
  } catch (error) {
    if (error.code?.startsWith('CHAT-')) {
      throw error;
    }
    throw ChatBusinessException.markAsReadFailed(messageId, error.message);
  }
}

/**
 * 스터디의 모든 메시지 읽음 처리
 *
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 업데이트 결과
 * @throws {ChatBusinessException}
 *
 * @example
 * const result = await markAllMessagesAsRead('study-123', 'user-456', prisma);
 */
export async function markAllMessagesAsRead(studyId, userId, prisma) {
  try {
    // 읽지 않은 메시지 조회
    const unreadMessages = await prisma.message.findMany({
      where: {
        studyId,
        NOT: {
          readers: {
            has: userId
          }
        }
      },
      select: { id: true }
    });

    if (unreadMessages.length === 0) {
      return { count: 0, success: true };
    }

    // 각 메시지에 userId 추가
    const updatePromises = unreadMessages.map(msg =>
      prisma.message.update({
        where: { id: msg.id },
        data: {
          readers: {
            push: userId
          }
        }
      })
    );

    await Promise.all(updatePromises);

    return {
      count: unreadMessages.length,
      success: true
    };
  } catch (error) {
    if (error.code?.startsWith('CHAT-')) {
      throw error;
    }
    throw ChatBusinessException.markAllAsReadFailed(error.message);
  }
}

// ============================================
// 메시지 삭제
// ============================================

/**
 * 메시지 삭제
 *
 * @param {string} messageId - 메시지 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 삭제된 메시지
 * @throws {ChatBusinessException}
 *
 * @example
 * const deleted = await deleteMessage('msg-123', 'user-456', prisma);
 */
export async function deleteMessage(messageId, userId, prisma) {
  try {
    await checkMessageOwnership(messageId, userId, prisma);

    const deleted = await prisma.message.delete({
      where: { id: messageId }
    });

    return deleted;
  } catch (error) {
    if (error.code?.startsWith('CHAT-')) {
      throw error;
    }
    throw ChatBusinessException.deletionFailed(messageId, error.message);
  }
}

/**
 * 여러 메시지 삭제 (관리자용)
 *
 * @param {string[]} messageIds - 메시지 ID 배열
 * @param {string} studyId - 스터디 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 삭제 결과
 * @throws {ChatBusinessException}
 *
 * @example
 * const result = await deleteBulkMessages(['m1', 'm2'], 'study-123', prisma);
 */
export async function deleteBulkMessages(messageIds, studyId, prisma) {
  try {
    const result = await prisma.message.deleteMany({
      where: {
        id: { in: messageIds },
        studyId
      }
    });

    const failed = messageIds.length - result.count;

    if (failed > 0) {
      throw ChatBusinessException.bulkDeletionFailed(result.count, failed, '일부 메시지 삭제 실패');
    }

    return {
      success: result.count,
      failed: 0,
      total: messageIds.length
    };
  } catch (error) {
    if (error.code?.startsWith('CHAT-')) {
      throw error;
    }
    throw ChatBusinessException.bulkDeletionFailed(0, messageIds.length, error.message);
  }
}

// ============================================
// 조회
// ============================================

/**
 * 스터디의 메시지 목록 조회
 *
 * @param {string} studyId - 스터디 ID
 * @param {Object} options - 조회 옵션
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 메시지 목록 및 페이지네이션 정보
 * @throws {ChatBusinessException}
 *
 * @example
 * const result = await getStudyMessages('study-123', { page: 1, limit: 50 }, prisma);
 */
export async function getStudyMessages(studyId, options, prisma) {
  try {
    const { page = 1, limit = 50, search } = options;
    const skip = (page - 1) * limit;

    const where = {
      studyId,
      ...(search && {
        content: {
          contains: search,
          mode: 'insensitive'
        }
      })
    };

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          file: true
        }
      }),
      prisma.message.count({ where })
    ]);

    // 최신 메시지가 아래에 오도록 역순 정렬
    const sortedMessages = messages.reverse();

    return createPaginatedResponse(sortedMessages, page, limit, total);
  } catch (error) {
    if (error.code?.startsWith('CHAT-')) {
      throw error;
    }
    throw ChatBusinessException.listFetchFailed(error.message);
  }
}

/**
 * 읽지 않은 메시지 수 조회
 *
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<number>} 읽지 않은 메시지 수
 * @throws {ChatBusinessException}
 *
 * @example
 * const count = await getUnreadMessageCount('study-123', 'user-456', prisma);
 */
export async function getUnreadMessageCount(studyId, userId, prisma) {
  try {
    const count = await prisma.message.count({
      where: {
        studyId,
        NOT: {
          readers: {
            has: userId
          }
        }
      }
    });

    return count;
  } catch (error) {
    if (error.code?.startsWith('CHAT-')) {
      throw error;
    }
    throw ChatBusinessException.unreadCountFetchFailed(error.message);
  }
}

/**
 * 사용자의 전체 읽지 않은 메시지 수 조회
 *
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 스터디별 읽지 않은 메시지 수
 * @throws {ChatBusinessException}
 *
 * @example
 * const result = await getTotalUnreadCount('user-456', prisma);
 */
export async function getTotalUnreadCount(userId, prisma) {
  try {
    // 사용자가 속한 스터디 목록
    const memberships = await prisma.studyMember.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      select: {
        studyId: true
      }
    });

    const studyIds = memberships.map(m => m.studyId);

    if (studyIds.length === 0) {
      return { total: 0, byStudy: {} };
    }

    // 각 스터디별 읽지 않은 메시지 수
    const counts = await Promise.all(
      studyIds.map(async (studyId) => {
        const count = await getUnreadMessageCount(studyId, userId, prisma);
        return { studyId, count };
      })
    );

    const byStudy = {};
    let total = 0;

    for (const { studyId, count } of counts) {
      byStudy[studyId] = count;
      total += count;
    }

    return { total, byStudy };
  } catch (error) {
    if (error.code?.startsWith('CHAT-')) {
      throw error;
    }
    throw ChatBusinessException.unreadCountFetchFailed(error.message);
  }
}

// ============================================
// 에러 핸들링
// ============================================

/**
 * Chat 에러 핸들러 래퍼
 *
 * @param {Function} handler - 핸들러 함수
 * @returns {Function} 래핑된 핸들러
 *
 * @example
 * export const GET = withChatErrorHandler(async (request) => { ... });
 */
export function withChatErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('[CHAT ERROR]', error);

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

export const CHAT_HELPER_VERSION = '1.0.0';
