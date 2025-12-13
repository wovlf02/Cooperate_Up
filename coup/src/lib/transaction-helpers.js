/**
 * transaction-helpers.js
 *
 * 스터디 관련 트랜잭션 헬퍼 함수
 * 데이터 일관성을 보장하기 위한 트랜잭션 로직 제공
 *
 * 사용 예시:
 * ```js
 * import { createStudyWithOwner, approveJoinRequest, deleteStudyWithCleanup } from '@/lib/transaction-helpers'
 *
 * const result = await createStudyWithOwner(prisma, userId, studyData)
 * ```
 *
 * @module lib/transaction-helpers
 */

import { logStudyError } from '@/lib/exceptions/study-errors'
import { createTemplatedNotification, notifyStudyAdmins } from '@/lib/notification-helpers'
import { NOTIFICATION_TYPES } from '@/lib/notification-helpers'

// ============================================
// 스터디 CRUD 트랜잭션
// ============================================

/**
 * 스터디 생성 + OWNER 멤버 생성 (트랜잭션)
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} userId - 생성자 ID
 * @param {Object} studyData - 스터디 데이터
 * @returns {Promise<Object>} { success: boolean, study?: Object, error?: string }
 *
 * @example
 * const result = await createStudyWithOwner(prisma, session.user.id, {
 *   name: '알고리즘 스터디',
 *   description: '코딩테스트 준비',
 *   maxMembers: 10,
 *   category: 'IT'
 * })
 */
export async function createStudyWithOwner(prisma, userId, studyData) {
  try {
    // 트랜잭션으로 스터디 생성 + OWNER 멤버 생성
    const result = await prisma.$transaction(async (tx) => {
      // 1. 스터디 생성
      const study = await tx.study.create({
        data: {
          ...studyData,
          ownerId: userId,
          currentMembers: 1 // OWNER 포함
        }
      })

      // 2. OWNER 멤버 생성
      const ownerMember = await tx.studyMember.create({
        data: {
          studyId: study.id,
          userId: userId,
          role: 'OWNER',
          status: 'ACTIVE',
          joinedAt: new Date()
        }
      })

      return { study, ownerMember }
    })

    console.log('[TRANSACTION] 스터디 생성 성공:', {
      studyId: result.study.id,
      studyName: result.study.name,
      ownerId: userId
    })

    return {
      success: true,
      study: result.study,
      member: result.ownerMember
    }

  } catch (error) {
    logStudyError('스터디 생성 트랜잭션', error, { userId, studyData })

    return {
      success: false,
      error: '스터디 생성에 실패했습니다'
    }
  }
}

/**
 * 스터디 삭제 + 관련 데이터 정리 (트랜잭션)
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @returns {Promise<Object>} { success: boolean, deletedCount?: Object, error?: string }
 *
 * @example
 * const result = await deleteStudyWithCleanup(prisma, studyId)
 */
export async function deleteStudyWithCleanup(prisma, studyId) {
  try {
    // 트랜잭션으로 모든 관련 데이터 삭제
    const deletedCount = await prisma.$transaction(async (tx) => {
      const counts = {}

      // 1. 채팅 메시지 삭제
      counts.messages = await tx.studyMessage.deleteMany({
        where: { studyId }
      })

      // 2. 할일 삭제
      counts.tasks = await tx.studyTask.deleteMany({
        where: { studyId }
      })

      // 3. 일정 삭제
      counts.events = await tx.studyEvent.deleteMany({
        where: { studyId }
      })

      // 4. 파일 삭제 (DB 레코드만, 실제 파일은 별도 처리 필요)
      counts.files = await tx.studyFile.deleteMany({
        where: { studyId }
      })

      // 5. 공지 삭제
      counts.notices = await tx.studyNotice.deleteMany({
        where: { studyId }
      })

      // 6. 멤버 삭제
      counts.members = await tx.studyMember.deleteMany({
        where: { studyId }
      })

      // 7. 스터디 삭제
      const study = await tx.study.delete({
        where: { id: studyId }
      })

      return { ...counts, study: 1, studyName: study.name }
    })

    console.log('[TRANSACTION] 스터디 삭제 성공:', {
      studyId,
      deletedCount
    })

    return {
      success: true,
      deletedCount
    }

  } catch (error) {
    logStudyError('스터디 삭제 트랜잭션', error, { studyId })

    return {
      success: false,
      error: '스터디 삭제에 실패했습니다'
    }
  }
}

// ============================================
// 가입/승인 트랜잭션
// ============================================

/**
 * 가입 요청 승인 (트랜잭션)
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @param {Object} options - 옵션
 * @returns {Promise<Object>} { success: boolean, member?: Object, error?: string }
 *
 * @example
 * const result = await approveJoinRequest(prisma, studyId, userId, {
 *   checkCapacity: true,
 *   sendNotification: true
 * })
 */
export async function approveJoinRequest(prisma, studyId, userId, options = {}) {
  const {
    checkCapacity = true,
    sendNotification = true
  } = options

  try {
    // 트랜잭션으로 승인 + 멤버 수 업데이트 + 알림
    const result = await prisma.$transaction(async (tx) => {
      // 1. 정원 재확인 (옵션)
      if (checkCapacity) {
        const study = await tx.study.findUnique({
          where: { id: studyId },
          select: {
            maxMembers: true,
            _count: {
              select: {
                members: {
                  where: { status: 'ACTIVE' }
                }
              }
            }
          }
        })

        if (!study) {
          throw new Error('스터디를 찾을 수 없습니다')
        }

        if (study._count.members >= study.maxMembers) {
          throw new Error('정원이 마감되었습니다')
        }
      }

      // 2. 가입 요청 조회
      const joinRequest = await tx.studyMember.findFirst({
        where: {
          studyId,
          userId,
          status: 'PENDING'
        }
      })

      if (!joinRequest) {
        throw new Error('가입 요청을 찾을 수 없습니다')
      }

      // 3. 멤버 상태 업데이트 (PENDING -> ACTIVE)
      const member = await tx.studyMember.update({
        where: { id: joinRequest.id },
        data: {
          status: 'ACTIVE',
          joinedAt: new Date()
        },
        include: {
          study: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      // 4. 스터디 멤버 수 증가
      await tx.study.update({
        where: { id: studyId },
        data: {
          currentMembers: {
            increment: 1
          }
        }
      })

      return member
    })

    console.log('[TRANSACTION] 가입 승인 성공:', {
      studyId,
      userId,
      memberId: result.id
    })

    // 5. 승인 알림 전송 (트랜잭션 외부)
    if (sendNotification) {
      await createTemplatedNotification(
        prisma,
        userId,
        NOTIFICATION_TYPES.STUDY_JOIN_APPROVED,
        {
          studyId: studyId,
          studyName: result.study.name
        }
      ).catch(error => {
        console.error('[NOTIFICATION] 승인 알림 전송 실패:', error)
      })
    }

    return {
      success: true,
      member: result
    }

  } catch (error) {
    logStudyError('가입 승인 트랜잭션', error, { studyId, userId })

    return {
      success: false,
      error: error.message || '가입 승인에 실패했습니다'
    }
  }
}

/**
 * 가입 요청 거절 (트랜잭션)
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @param {Object} options - 옵션
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function rejectJoinRequest(prisma, studyId, userId, options = {}) {
  const {
    reason = null,
    sendNotification = true
  } = options

  try {
    // 트랜잭션으로 거절 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 가입 요청 조회
      const joinRequest = await tx.studyMember.findFirst({
        where: {
          studyId,
          userId,
          status: 'PENDING'
        },
        include: {
          study: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      if (!joinRequest) {
        throw new Error('가입 요청을 찾을 수 없습니다')
      }

      // 2. 멤버 레코드 삭제
      await tx.studyMember.delete({
        where: { id: joinRequest.id }
      })

      return joinRequest
    })

    console.log('[TRANSACTION] 가입 거절 성공:', {
      studyId,
      userId,
      reason
    })

    // 3. 거절 알림 전송 (트랜잭션 외부)
    if (sendNotification) {
      await createTemplatedNotification(
        prisma,
        userId,
        NOTIFICATION_TYPES.STUDY_JOIN_REJECTED,
        {
          studyId: studyId,
          studyName: result.study.name,
          reason: reason
        }
      ).catch(error => {
        console.error('[NOTIFICATION] 거절 알림 전송 실패:', error)
      })
    }

    return {
      success: true
    }

  } catch (error) {
    logStudyError('가입 거절 트랜잭션', error, { studyId, userId })

    return {
      success: false,
      error: error.message || '가입 거절에 실패했습니다'
    }
  }
}

/**
 * 스터디 탈퇴 (트랜잭션)
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function leaveStudy(prisma, studyId, userId) {
  try {
    // 트랜잭션으로 탈퇴 + 멤버 수 감소
    await prisma.$transaction(async (tx) => {
      // 1. 멤버 조회
      const member = await tx.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId,
            userId
          }
        }
      })

      if (!member) {
        throw new Error('멤버를 찾을 수 없습니다')
      }

      // 2. OWNER 탈퇴 방지
      if (member.role === 'OWNER') {
        throw new Error('스터디장은 탈퇴할 수 없습니다. 스터디를 삭제하거나 소유권을 이전하세요')
      }

      // 3. 멤버 상태 업데이트 (ACTIVE -> LEFT)
      await tx.studyMember.update({
        where: { id: member.id },
        data: {
          status: 'LEFT',
          leftAt: new Date()
        }
      })

      // 4. 스터디 멤버 수 감소
      await tx.study.update({
        where: { id: studyId },
        data: {
          currentMembers: {
            decrement: 1
          }
        }
      })
    })

    console.log('[TRANSACTION] 탈퇴 성공:', { studyId, userId })

    return {
      success: true
    }

  } catch (error) {
    logStudyError('탈퇴 트랜잭션', error, { studyId, userId })

    return {
      success: false,
      error: error.message || '탈퇴 처리에 실패했습니다'
    }
  }
}

// ============================================
// 멤버 관리 트랜잭션
// ============================================

/**
 * 멤버 강퇴 (트랜잭션)
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {string} targetUserId - 대상 사용자 ID
 * @param {Object} options - 옵션
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function kickMember(prisma, studyId, targetUserId, options = {}) {
  const {
    reason = null,
    sendNotification = true
  } = options

  try {
    // 트랜잭션으로 강퇴 + 멤버 수 감소
    const result = await prisma.$transaction(async (tx) => {
      // 1. 멤버 조회
      const member = await tx.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId,
            userId: targetUserId
          }
        },
        include: {
          study: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      if (!member) {
        throw new Error('멤버를 찾을 수 없습니다')
      }

      if (member.status !== 'ACTIVE') {
        throw new Error('활동 중인 멤버만 강퇴할 수 있습니다')
      }

      // 2. 멤버 상태 업데이트 (ACTIVE -> KICKED)
      await tx.studyMember.update({
        where: { id: member.id },
        data: {
          status: 'KICKED',
          kickedAt: new Date(),
          kickReason: reason
        }
      })

      // 3. 스터디 멤버 수 감소
      await tx.study.update({
        where: { id: studyId },
        data: {
          currentMembers: {
            decrement: 1
          }
        }
      })

      return member
    })

    console.log('[TRANSACTION] 강퇴 성공:', {
      studyId,
      targetUserId,
      reason
    })

    // 4. 강퇴 알림 전송 (트랜잭션 외부)
    if (sendNotification) {
      await createTemplatedNotification(
        prisma,
        targetUserId,
        NOTIFICATION_TYPES.STUDY_MEMBER_KICKED,
        {
          studyId: studyId,
          studyName: result.study.name,
          reason: reason
        }
      ).catch(error => {
        console.error('[NOTIFICATION] 강퇴 알림 전송 실패:', error)
      })
    }

    return {
      success: true
    }

  } catch (error) {
    logStudyError('멤버 강퇴 트랜잭션', error, { studyId, targetUserId })

    return {
      success: false,
      error: error.message || '멤버 강퇴에 실패했습니다'
    }
  }
}

/**
 * 소유권 이전 (트랜잭션)
 *
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @param {string} studyId - 스터디 ID
 * @param {string} currentOwnerId - 현재 소유자 ID
 * @param {string} newOwnerId - 새 소유자 ID
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function transferOwnership(prisma, studyId, currentOwnerId, newOwnerId) {
  try {
    // 트랜잭션으로 소유권 이전
    const result = await prisma.$transaction(async (tx) => {
      // 1. 스터디 조회
      const study = await tx.study.findUnique({
        where: { id: studyId },
        select: {
          id: true,
          name: true,
          ownerId: true
        }
      })

      if (!study) {
        throw new Error('스터디를 찾을 수 없습니다')
      }

      if (study.ownerId !== currentOwnerId) {
        throw new Error('스터디 소유자가 아닙니다')
      }

      // 2. 새 소유자 멤버 확인
      const newOwnerMember = await tx.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId,
            userId: newOwnerId
          }
        }
      })

      if (!newOwnerMember) {
        throw new Error('새 소유자가 스터디 멤버가 아닙니다')
      }

      if (newOwnerMember.status !== 'ACTIVE') {
        throw new Error('새 소유자가 활동 중인 멤버가 아닙니다')
      }

      // 3. 현재 소유자 역할 변경 (OWNER -> ADMIN)
      await tx.studyMember.update({
        where: {
          studyId_userId: {
            studyId,
            userId: currentOwnerId
          }
        },
        data: { role: 'ADMIN' }
      })

      // 4. 새 소유자 역할 변경 (현재 역할 -> OWNER)
      await tx.studyMember.update({
        where: { id: newOwnerMember.id },
        data: { role: 'OWNER' }
      })

      // 5. 스터디 소유자 변경
      await tx.study.update({
        where: { id: studyId },
        data: { ownerId: newOwnerId }
      })

      return study
    })

    console.log('[TRANSACTION] 소유권 이전 성공:', {
      studyId,
      from: currentOwnerId,
      to: newOwnerId
    })

    // 6. 알림 전송 (트랜잭션 외부)
    await createTemplatedNotification(
      prisma,
      newOwnerId,
      NOTIFICATION_TYPES.STUDY_OWNER_TRANSFERRED,
      {
        studyId: studyId,
        studyName: result.name
      }
    ).catch(error => {
      console.error('[NOTIFICATION] 소유권 이전 알림 전송 실패:', error)
    })

    return {
      success: true
    }

  } catch (error) {
    logStudyError('소유권 이전 트랜잭션', error, {
      studyId,
      currentOwnerId,
      newOwnerId
    })

    return {
      success: false,
      error: error.message || '소유권 이전에 실패했습니다'
    }
  }
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 트랜잭션 재시도 래퍼
 *
 * @param {Function} transactionFn - 트랜잭션 함수
 * @param {number} maxRetries - 최대 재시도 횟수
 * @param {number} delayMs - 재시도 간격 (밀리초)
 * @returns {Promise<any>} 트랜잭션 결과
 */
export async function retryTransaction(transactionFn, maxRetries = 3, delayMs = 100) {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await transactionFn()
    } catch (error) {
      lastError = error

      // P2034: 트랜잭션 충돌
      if (error.code === 'P2034' && attempt < maxRetries) {
        console.log(`[TRANSACTION] 재시도 ${attempt}/${maxRetries}...`)
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
        continue
      }

      throw error
    }
  }

  throw lastError
}

