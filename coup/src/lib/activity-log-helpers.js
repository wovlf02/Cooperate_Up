/**
 * 스터디 활동 로그 기록 헬퍼 함수
 *
 * 스터디 내 주요 활동을 기록하여 감사 추적 및 분석에 활용
 *
 * 로그 실패는 주요 작업의 성공 여부에 영향을 주지 않습니다.
 */

/**
 * 활동 타입 상수
 */
export const ACTIVITY_TYPES = {
  // 멤버 활동
  JOIN: 'JOIN',
  LEAVE: 'LEAVE',
  KICK: 'KICK',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  ROLE_CHANGE: 'ROLE_CHANGE',

  // 스터디 관리
  STUDY_CREATE: 'STUDY_CREATE',
  STUDY_UPDATE: 'STUDY_UPDATE',
  STUDY_DELETE: 'STUDY_DELETE',

  // 콘텐츠
  NOTICE_CREATE: 'NOTICE_CREATE',
  NOTICE_UPDATE: 'NOTICE_UPDATE',
  NOTICE_DELETE: 'NOTICE_DELETE',
  FILE_UPLOAD: 'FILE_UPLOAD',
  FILE_DELETE: 'FILE_DELETE',
  FILE_DOWNLOAD: 'FILE_DOWNLOAD',

  // 할일/일정
  TASK_CREATE: 'TASK_CREATE',
  TASK_UPDATE: 'TASK_UPDATE',
  TASK_DELETE: 'TASK_DELETE',
  TASK_COMPLETE: 'TASK_COMPLETE',
  EVENT_CREATE: 'EVENT_CREATE',
  EVENT_UPDATE: 'EVENT_UPDATE',
  EVENT_DELETE: 'EVENT_DELETE',

  // 초대
  INVITE_CREATE: 'INVITE_CREATE',
  INVITE_USE: 'INVITE_USE',
}

/**
 * 스터디 활동 로그 기록
 *
 * @param {Object} prisma - Prisma 클라이언트 인스턴스
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @param {string} action - 활동 타입 (ACTIVITY_TYPES 사용)
 * @param {Object|null} details - 추가 세부 정보
 * @returns {Promise<Object|null>} 생성된 로그 또는 null (실패 시)
 */
export async function logStudyActivity(prisma, studyId, userId, action, details = null) {
  try {
    // 입력값 검증
    if (!studyId || !userId || !action) {
      console.warn('[Activity Log] Missing required parameters:', {
        studyId: !!studyId,
        userId: !!userId,
        action: !!action
      })
      return null
    }

    // 활동 타입 검증
    if (!Object.values(ACTIVITY_TYPES).includes(action)) {
      console.warn('[Activity Log] Invalid action type:', action)
      return null
    }

    const log = await prisma.studyActivityLog.create({
      data: {
        studyId,
        userId,
        action,
        details: details || {},
        createdAt: new Date()
      }
    })

    return log
  } catch (error) {
    // 로그 실패는 주요 작업에 영향을 주지 않음
    console.error('[Activity Log] Failed to create log:', {
      error: error.message,
      studyId,
      userId,
      action,
      details
    })
    return null
  }
}

/**
 * 여러 활동을 일괄 로그 기록
 *
 * @param {Object} prisma - Prisma 클라이언트 인스턴스
 * @param {Array} logs - 로그 배열 [{studyId, userId, action, details}, ...]
 * @returns {Promise<number>} 생성된 로그 수
 */
export async function logBulkStudyActivities(prisma, logs) {
  try {
    if (!Array.isArray(logs) || logs.length === 0) {
      return 0
    }

    // 유효성 검증
    const validLogs = logs.filter(log =>
      log.studyId &&
      log.userId &&
      log.action &&
      Object.values(ACTIVITY_TYPES).includes(log.action)
    )

    if (validLogs.length === 0) {
      console.warn('[Activity Log] No valid logs to create')
      return 0
    }

    const result = await prisma.studyActivityLog.createMany({
      data: validLogs.map(log => ({
        studyId: log.studyId,
        userId: log.userId,
        action: log.action,
        details: log.details || {},
        createdAt: new Date()
      }))
    })

    return result.count
  } catch (error) {
    console.error('[Activity Log] Failed to create bulk logs:', {
      error: error.message,
      logsCount: logs.length
    })
    return 0
  }
}

/**
 * 특정 기간의 스터디 활동 로그 조회
 *
 * @param {Object} prisma - Prisma 클라이언트 인스턴스
 * @param {string} studyId - 스터디 ID
 * @param {Object} options - 조회 옵션
 * @param {Date} options.startDate - 시작 날짜
 * @param {Date} options.endDate - 종료 날짜
 * @param {string} options.action - 필터링할 활동 타입
 * @param {number} options.limit - 조회 개수 (기본: 100)
 * @returns {Promise<Array>} 로그 배열
 */
export async function getStudyActivityLogs(prisma, studyId, options = {}) {
  try {
    const {
      startDate,
      endDate,
      action,
      limit = 100
    } = options

    const whereClause = { studyId }

    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) whereClause.createdAt.gte = startDate
      if (endDate) whereClause.createdAt.lte = endDate
    }

    if (action) {
      whereClause.action = action
    }

    const logs = await prisma.studyActivityLog.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return logs
  } catch (error) {
    console.error('[Activity Log] Failed to get logs:', {
      error: error.message,
      studyId,
      options
    })
    return []
  }
}

/**
 * 스터디 활동 통계 조회
 *
 * @param {Object} prisma - Prisma 클라이언트 인스턴스
 * @param {string} studyId - 스터디 ID
 * @param {Date} startDate - 시작 날짜
 * @param {Date} endDate - 종료 날짜
 * @returns {Promise<Object>} 활동 통계
 */
export async function getStudyActivityStats(prisma, studyId, startDate, endDate) {
  try {
    const whereClause = {
      studyId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    // 활동 타입별 카운트
    const actionCounts = await prisma.studyActivityLog.groupBy({
      by: ['action'],
      where: whereClause,
      _count: {
        id: true
      }
    })

    // 가장 활동적인 사용자 TOP 5
    const topUsers = await prisma.studyActivityLog.groupBy({
      by: ['userId'],
      where: whereClause,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    // 일별 활동 수
    const dailyActivity = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM StudyActivityLog
      WHERE studyId = ${studyId}
        AND createdAt >= ${startDate}
        AND createdAt <= ${endDate}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `

    return {
      actionCounts: actionCounts.reduce((acc, item) => {
        acc[item.action] = item._count.id
        return acc
      }, {}),
      topUsers: topUsers.map(item => ({
        userId: item.userId,
        activityCount: item._count.id
      })),
      dailyActivity,
      period: {
        start: startDate,
        end: endDate
      }
    }
  } catch (error) {
    console.error('[Activity Log] Failed to get stats:', {
      error: error.message,
      studyId
    })
    return null
  }
}

/**
 * 오래된 활동 로그 정리 (30일 이상)
 *
 * @param {Object} prisma - Prisma 클라이언트 인스턴스
 * @param {number} daysToKeep - 보관 기간 (일) (기본: 30)
 * @returns {Promise<number>} 삭제된 로그 수
 */
export async function cleanupOldActivityLogs(prisma, daysToKeep = 30) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const result = await prisma.studyActivityLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    console.log(`[Activity Log] Cleaned up ${result.count} old logs (older than ${daysToKeep} days)`)
    return result.count
  } catch (error) {
    console.error('[Activity Log] Failed to cleanup old logs:', error.message)
    return 0
  }
}

