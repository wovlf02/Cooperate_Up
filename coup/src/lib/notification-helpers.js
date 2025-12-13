/**
 * notification-helpers.js
 *
 * 알림 생성 및 관리 유틸리티 헬퍼 함수
 *
 * 사용 예시:
 * ```js
 * import { createNotification, createBulkNotifications } from '@/lib/notification-helpers'
 *
 * await createNotification(prisma, {
 *   userId: targetUserId,
 *   type: 'STUDY_INVITE',
 *   message: '새로운 스터디 초대가 도착했습니다',
 *   link: `/studies/${studyId}`
 * })
 * ```
 *
 * @module lib/notification-helpers
 */

// ============================================
// 알림 타입 정의
// ============================================

/**
 * 알림 타입 목록
 */
export const NOTIFICATION_TYPES = {
  // 스터디 관련
  STUDY_INVITE: 'STUDY_INVITE',                   // 스터디 초대
  STUDY_JOIN_REQUEST: 'STUDY_JOIN_REQUEST',       // 가입 신청
  STUDY_JOIN_APPROVED: 'STUDY_JOIN_APPROVED',     // 가입 승인
  STUDY_JOIN_REJECTED: 'STUDY_JOIN_REJECTED',     // 가입 거절
  STUDY_MEMBER_KICKED: 'STUDY_MEMBER_KICKED',     // 멤버 강퇴
  STUDY_ROLE_CHANGED: 'STUDY_ROLE_CHANGED',       // 역할 변경
  STUDY_OWNER_TRANSFERRED: 'STUDY_OWNER_TRANSFERRED', // 소유권 이전

  // 공지 관련
  STUDY_NOTICE_NEW: 'STUDY_NOTICE_NEW',           // 새 공지
  STUDY_NOTICE_PINNED: 'STUDY_NOTICE_PINNED',     // 공지 고정

  // 할일 관련
  STUDY_TASK_ASSIGNED: 'STUDY_TASK_ASSIGNED',     // 할일 배정
  STUDY_TASK_UPDATED: 'STUDY_TASK_UPDATED',       // 할일 수정
  STUDY_TASK_COMPLETED: 'STUDY_TASK_COMPLETED',   // 할일 완료
  STUDY_TASK_DUE_SOON: 'STUDY_TASK_DUE_SOON',     // 마감 임박

  // 파일 관련
  STUDY_FILE_UPLOADED: 'STUDY_FILE_UPLOADED',     // 파일 업로드

  // 채팅 관련
  STUDY_MESSAGE_MENTION: 'STUDY_MESSAGE_MENTION', // 메시지 멘션

  // 일정 관련
  STUDY_EVENT_NEW: 'STUDY_EVENT_NEW',             // 새 일정
  STUDY_EVENT_UPDATED: 'STUDY_EVENT_UPDATED',     // 일정 수정
  STUDY_EVENT_REMINDER: 'STUDY_EVENT_REMINDER',   // 일정 알림

  // 시스템
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT'      // 시스템 공지
}

/**
 * 알림 우선순위
 */
export const NOTIFICATION_PRIORITY = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
}

// ============================================
// 알림 템플릿
// ============================================

/**
 * 알림 메시지 템플릿 생성
 *
 * @param {string} type - 알림 타입
 * @param {Object} data - 템플릿 데이터
 * @returns {string} 생성된 메시지
 */
export function createNotificationMessage(type, data) {
  const templates = {
    // 스터디 관련
    STUDY_INVITE: `${data.inviterName}님이 "${data.studyName}" 스터디에 초대했습니다`,
    STUDY_JOIN_REQUEST: `${data.userName}님이 "${data.studyName}" 스터디 가입을 신청했습니다`,
    STUDY_JOIN_APPROVED: `"${data.studyName}" 스터디 가입이 승인되었습니다`,
    STUDY_JOIN_REJECTED: `"${data.studyName}" 스터디 가입이 거절되었습니다${data.reason ? `: ${data.reason}` : ''}`,
    STUDY_MEMBER_KICKED: `"${data.studyName}" 스터디에서 강퇴되었습니다${data.reason ? `: ${data.reason}` : ''}`,
    STUDY_ROLE_CHANGED: `"${data.studyName}" 스터디에서 역할이 ${data.newRole}(으)로 변경되었습니다`,
    STUDY_OWNER_TRANSFERRED: `"${data.studyName}" 스터디의 소유권이 이전되었습니다`,

    // 공지 관련
    STUDY_NOTICE_NEW: `"${data.studyName}"에 새 공지가 등록되었습니다: ${data.noticeTitle}`,
    STUDY_NOTICE_PINNED: `"${data.studyName}"에 중요 공지가 고정되었습니다: ${data.noticeTitle}`,

    // 할일 관련
    STUDY_TASK_ASSIGNED: `"${data.studyName}"에서 새로운 할일이 배정되었습니다: ${data.taskTitle}`,
    STUDY_TASK_UPDATED: `"${data.studyName}"의 할일이 수정되었습니다: ${data.taskTitle}`,
    STUDY_TASK_COMPLETED: `"${data.studyName}"의 할일이 완료되었습니다: ${data.taskTitle}`,
    STUDY_TASK_DUE_SOON: `"${data.studyName}"의 할일 마감이 임박했습니다: ${data.taskTitle}`,

    // 파일 관련
    STUDY_FILE_UPLOADED: `"${data.studyName}"에 새 파일이 업로드되었습니다: ${data.fileName}`,

    // 채팅 관련
    STUDY_MESSAGE_MENTION: `"${data.studyName}"에서 ${data.senderName}님이 회원님을 언급했습니다`,

    // 일정 관련
    STUDY_EVENT_NEW: `"${data.studyName}"에 새 일정이 등록되었습니다: ${data.eventTitle}`,
    STUDY_EVENT_UPDATED: `"${data.studyName}"의 일정이 변경되었습니다: ${data.eventTitle}`,
    STUDY_EVENT_REMINDER: `"${data.studyName}"의 일정이 곧 시작됩니다: ${data.eventTitle}`,

    // 시스템
    SYSTEM_ANNOUNCEMENT: data.message || '시스템 공지사항이 있습니다'
  }

  return templates[type] || '새로운 알림이 도착했습니다'
}

/**
 * 알림 링크 생성
 *
 * @param {string} type - 알림 타입
 * @param {Object} data - 링크 데이터
 * @returns {string|null} 생성된 링크
 */
export function createNotificationLink(type, data) {
  const linkMap = {
    // 스터디 관련
    STUDY_INVITE: `/studies/${data.studyId}`,
    STUDY_JOIN_REQUEST: `/studies/${data.studyId}/members`,
    STUDY_JOIN_APPROVED: `/studies/${data.studyId}`,
    STUDY_JOIN_REJECTED: '/studies',
    STUDY_MEMBER_KICKED: '/studies',
    STUDY_ROLE_CHANGED: `/studies/${data.studyId}`,
    STUDY_OWNER_TRANSFERRED: `/studies/${data.studyId}`,

    // 공지 관련
    STUDY_NOTICE_NEW: `/studies/${data.studyId}/notices/${data.noticeId}`,
    STUDY_NOTICE_PINNED: `/studies/${data.studyId}/notices/${data.noticeId}`,

    // 할일 관련
    STUDY_TASK_ASSIGNED: `/studies/${data.studyId}/tasks/${data.taskId}`,
    STUDY_TASK_UPDATED: `/studies/${data.studyId}/tasks/${data.taskId}`,
    STUDY_TASK_COMPLETED: `/studies/${data.studyId}/tasks/${data.taskId}`,
    STUDY_TASK_DUE_SOON: `/studies/${data.studyId}/tasks/${data.taskId}`,

    // 파일 관련
    STUDY_FILE_UPLOADED: `/studies/${data.studyId}/files`,

    // 채팅 관련
    STUDY_MESSAGE_MENTION: `/studies/${data.studyId}/chat`,

    // 일정 관련
    STUDY_EVENT_NEW: `/studies/${data.studyId}/calendar/${data.eventId}`,
    STUDY_EVENT_UPDATED: `/studies/${data.studyId}/calendar/${data.eventId}`,
    STUDY_EVENT_REMINDER: `/studies/${data.studyId}/calendar/${data.eventId}`,

    // 시스템
    SYSTEM_ANNOUNCEMENT: data.link || null
  }

  return linkMap[type] || null
}

// ============================================
// 알림 생성 함수
// ============================================

/**
 * 단일 알림 생성
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {Object} notificationData - 알림 데이터
 * @returns {Promise<Object|null>} 생성된 알림 또는 null
 *
 * @example
 * await createNotification(prisma, {
 *   userId: 'user123',
 *   type: 'STUDY_JOIN_APPROVED',
 *   message: '가입이 승인되었습니다',
 *   link: '/studies/study123',
 *   priority: 'NORMAL'
 * })
 */
export async function createNotification(prisma, notificationData) {
  try {
    const {
      userId,
      type,
      message,
      link = null,
      priority = NOTIFICATION_PRIORITY.NORMAL,
      metadata = {}
    } = notificationData

    // 필수 필드 확인
    if (!userId || !type || !message) {
      console.error('[NOTIFICATION] 필수 필드 누락:', { userId, type, message })
      return null
    }

    // 알림 생성
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        link,
        priority,
        metadata: metadata ? JSON.stringify(metadata) : null,
        isRead: false
      }
    })

    console.log('[NOTIFICATION] 알림 생성 성공:', {
      id: notification.id,
      userId,
      type
    })

    return notification

  } catch (error) {
    console.error('[NOTIFICATION] 알림 생성 실패:', error)
    return null
  }
}

/**
 * 템플릿 기반 알림 생성
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} userId - 수신자 ID
 * @param {string} type - 알림 타입
 * @param {Object} templateData - 템플릿 데이터
 * @param {Object} options - 추가 옵션
 * @returns {Promise<Object|null>} 생성된 알림
 */
export async function createTemplatedNotification(prisma, userId, type, templateData, options = {}) {
  const message = createNotificationMessage(type, templateData)
  const link = createNotificationLink(type, templateData)

  return await createNotification(prisma, {
    userId,
    type,
    message,
    link,
    priority: options.priority || NOTIFICATION_PRIORITY.NORMAL,
    metadata: options.metadata || {}
  })
}

/**
 * 일괄 알림 생성
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {Array<string>} userIds - 수신자 ID 배열
 * @param {Object} notificationData - 공통 알림 데이터
 * @returns {Promise<Object>} { success: number, failed: number, total: number }
 *
 * @example
 * await createBulkNotifications(prisma, ['user1', 'user2', 'user3'], {
 *   type: 'STUDY_NOTICE_NEW',
 *   message: '새 공지가 등록되었습니다',
 *   link: '/studies/study123/notices/notice456'
 * })
 */
export async function createBulkNotifications(prisma, userIds, notificationData) {
  const results = {
    success: 0,
    failed: 0,
    total: userIds.length
  }

  try {
    const {
      type,
      message,
      link = null,
      priority = NOTIFICATION_PRIORITY.NORMAL,
      metadata = {}
    } = notificationData

    // 필수 필드 확인
    if (!type || !message) {
      console.error('[NOTIFICATION] 일괄 알림 생성 실패: 필수 필드 누락')
      results.failed = results.total
      return results
    }

    // 알림 데이터 준비
    const notifications = userIds.map(userId => ({
      userId,
      type,
      message,
      link,
      priority,
      metadata: metadata ? JSON.stringify(metadata) : null,
      isRead: false
    }))

    // 일괄 생성
    const result = await prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true
    })

    results.success = result.count
    results.failed = results.total - result.count

    console.log('[NOTIFICATION] 일괄 알림 생성 완료:', results)

    return results

  } catch (error) {
    console.error('[NOTIFICATION] 일괄 알림 생성 실패:', error)
    results.failed = results.total
    return results
  }
}

/**
 * 스터디 전체 멤버에게 알림 전송
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {Object} notificationData - 알림 데이터
 * @param {Object} options - 옵션
 * @returns {Promise<Object>} 생성 결과
 */
export async function notifyAllStudyMembers(prisma, studyId, notificationData, options = {}) {
  try {
    const {
      excludeUserIds = [],
      status = 'ACTIVE',
      roles = null
    } = options

    // 스터디 멤버 조회
    const members = await prisma.studyMember.findMany({
      where: {
        studyId,
        status,
        ...(roles && { role: { in: roles } }),
        ...(excludeUserIds.length > 0 && { userId: { notIn: excludeUserIds } })
      },
      select: {
        userId: true
      }
    })

    const userIds = members.map(m => m.userId)

    if (userIds.length === 0) {
      console.log('[NOTIFICATION] 알림 대상 멤버 없음')
      return { success: 0, failed: 0, total: 0 }
    }

    return await createBulkNotifications(prisma, userIds, notificationData)

  } catch (error) {
    console.error('[NOTIFICATION] 스터디 전체 알림 실패:', error)
    return { success: 0, failed: 0, total: 0 }
  }
}

/**
 * 스터디 관리자에게만 알림 전송
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {Object} notificationData - 알림 데이터
 * @returns {Promise<Object>} 생성 결과
 */
export async function notifyStudyAdmins(prisma, studyId, notificationData) {
  return await notifyAllStudyMembers(prisma, studyId, notificationData, {
    roles: ['OWNER', 'ADMIN']
  })
}

// ============================================
// 알림 조회 함수
// ============================================

/**
 * 사용자의 읽지 않은 알림 수 조회
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} userId - 사용자 ID
 * @returns {Promise<number>} 읽지 않은 알림 수
 */
export async function getUnreadNotificationCount(prisma, userId) {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    })
  } catch (error) {
    console.error('[NOTIFICATION] 읽지 않은 알림 수 조회 실패:', error)
    return 0
  }
}

/**
 * 사용자의 알림 목록 조회
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} userId - 사용자 ID
 * @param {Object} options - 조회 옵션
 * @returns {Promise<Array>} 알림 목록
 */
export async function getUserNotifications(prisma, userId, options = {}) {
  try {
    const {
      isRead = null,
      type = null,
      page = 1,
      limit = 20
    } = options

    const where = {
      userId,
      ...(isRead !== null && { isRead }),
      ...(type && { type })
    }

    return await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

  } catch (error) {
    console.error('[NOTIFICATION] 알림 목록 조회 실패:', error)
    return []
  }
}

// ============================================
// 알림 업데이트 함수
// ============================================

/**
 * 알림 읽음 처리
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} notificationId - 알림 ID
 * @returns {Promise<boolean>} 성공 여부
 */
export async function markNotificationAsRead(prisma, notificationId) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() }
    })

    return true

  } catch (error) {
    console.error('[NOTIFICATION] 알림 읽음 처리 실패:', error)
    return false
  }
}

/**
 * 모든 알림 읽음 처리
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} userId - 사용자 ID
 * @returns {Promise<number>} 업데이트된 알림 수
 */
export async function markAllNotificationsAsRead(prisma, userId) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return result.count

  } catch (error) {
    console.error('[NOTIFICATION] 전체 알림 읽음 처리 실패:', error)
    return 0
  }
}

/**
 * 알림 삭제
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} notificationId - 알림 ID
 * @returns {Promise<boolean>} 성공 여부
 */
export async function deleteNotification(prisma, notificationId) {
  try {
    await prisma.notification.delete({
      where: { id: notificationId }
    })

    return true

  } catch (error) {
    console.error('[NOTIFICATION] 알림 삭제 실패:', error)
    return false
  }
}

/**
 * 오래된 알림 일괄 삭제
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {number} daysOld - 보관 기간 (일)
 * @returns {Promise<number>} 삭제된 알림 수
 */
export async function deleteOldNotifications(prisma, daysOld = 30) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        isRead: true
      }
    })

    console.log(`[NOTIFICATION] ${daysOld}일 이상 된 알림 ${result.count}개 삭제`)

    return result.count

  } catch (error) {
    console.error('[NOTIFICATION] 오래된 알림 삭제 실패:', error)
    return 0
  }
}

