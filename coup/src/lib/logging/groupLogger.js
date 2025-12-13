/**
 * groupLogger.js
 *
 * Group 도메인 전용 구조화된 로깅 시스템
 * GroupException과 통합되어 일관된 로깅 제공
 *
 * @module lib/logging/groupLogger
 * @author CoUp Team
 * @created 2025-12-03
 */

// ============================================
// 로그 레벨 및 설정
// ============================================

/**
 * 로그 레벨 정의
 */
export const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

/**
 * 로그 레벨 우선순위
 */
const LOG_LEVEL_PRIORITY = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
};

/**
 * 환경별 최소 로그 레벨
 */
const MIN_LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG';

/**
 * 로그 출력 여부 확인
 */
function shouldLog(level) {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL];
}

// ============================================
// 로그 포맷팅
// ============================================

/**
 * 로그 엔트리 생성
 *
 * @param {string} level - 로그 레벨
 * @param {string} message - 로그 메시지
 * @param {Object} context - 컨텍스트 정보
 * @returns {Object} 포맷된 로그 엔트리
 */
function createLogEntry(level, message, context = {}) {
  const timestamp = new Date().toISOString();

  return {
    level,
    message,
    timestamp,
    domain: 'group',
    environment: process.env.NODE_ENV || 'development',
    ...context
  };
}

/**
 * 로그 출력
 *
 * @param {Object} logEntry - 로그 엔트리
 */
function outputLog(logEntry) {
  const { level, message, timestamp, ...rest } = logEntry;

  // 콘솔 출력 메서드 선택
  const consoleMethod = {
    DEBUG: 'log',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    CRITICAL: 'error'
  }[level];

  if (process.env.NODE_ENV === 'production') {
    // 프로덕션: JSON 형식
    console[consoleMethod](JSON.stringify(logEntry));
  } else {
    // 개발: 가독성 있는 형식
    console[consoleMethod](
      `[${timestamp}] [${level}] [GROUP] ${message}`,
      Object.keys(rest).length > 0 ? rest : ''
    );
  }
}

// ============================================
// 핵심 로깅 클래스
// ============================================

/**
 * Group Logger 클래스
 */
export class GroupLogger {
  /**
   * 일반 로그
   *
   * @param {string} level - 로그 레벨
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static log(level, message, context = {}) {
    if (!shouldLog(level)) return;

    const logEntry = createLogEntry(level, message, context);
    outputLog(logEntry);
  }

  /**
   * INFO 레벨 로그
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static info(message, context = {}) {
    this.log(LOG_LEVELS.INFO, message, context);
  }

  /**
   * WARN 레벨 로그
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static warn(message, context = {}) {
    this.log(LOG_LEVELS.WARN, message, context);
  }

  /**
   * ERROR 레벨 로그
   *
   * @param {string} message - 로그 메시지
   * @param {Object} context - 컨텍스트 정보
   */
  static error(message, context = {}) {
    this.log(LOG_LEVELS.ERROR, message, context);
  }

  /**
   * 그룹 생성 로그
   */
  static logGroupCreated(groupId, createdBy, groupData) {
    this.info('Group created', {
      action: 'group_created',
      groupId,
      createdBy,
      name: groupData.name,
      category: groupData.category,
      isPublic: groupData.isPublic,
      maxMembers: groupData.maxMembers,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 그룹 수정 로그
   */
  static logGroupUpdated(groupId, updatedBy, changes) {
    this.info('Group updated', {
      action: 'group_updated',
      groupId,
      updatedBy,
      changes: Object.keys(changes),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 그룹 삭제 로그
   */
  static logGroupDeleted(groupId, deletedBy, reason = '') {
    this.warn('Group deleted', {
      action: 'group_deleted',
      groupId,
      deletedBy,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 멤버 추가 로그
   */
  static logMemberAdded(groupId, userId, addedBy, role) {
    this.info('Member added', {
      action: 'member_added',
      groupId,
      userId,
      addedBy,
      role,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 멤버 제거 로그
   */
  static logMemberRemoved(groupId, userId, removedBy, reason = '') {
    this.warn('Member removed', {
      action: 'member_removed',
      groupId,
      userId,
      removedBy,
      reason,
      timestamp: new Date().toISOString()
    });
  }
}

// ============================================
// 1. Group CRUD 로깅 (4개)
// ============================================

/**
 * 그룹 생성 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} createdBy - 생성자 ID
 * @param {Object} groupData - 그룹 데이터
 *
 * @example
 * logGroupCreated('group-123', 'user-456', { name: '알고리즘 스터디', category: 'study' });
 */
export function logGroupCreated(groupId, createdBy, groupData) {
  GroupLogger.info('Group created', {
    action: 'group_created',
    groupId,
    createdBy,
    name: groupData.name,
    category: groupData.category,
    isPublic: groupData.isPublic,
    maxMembers: groupData.maxMembers,
    timestamp: new Date().toISOString()
  });
}

/**
 * 그룹 수정 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} updatedBy - 수정자 ID
 * @param {Object} changes - 변경 사항
 *
 * @example
 * logGroupUpdated('group-123', 'user-456', { name: '새로운 이름' });
 */
export function logGroupUpdated(groupId, updatedBy, changes) {
  GroupLogger.info('Group updated', {
    action: 'group_updated',
    groupId,
    updatedBy,
    changes: Object.keys(changes),
    timestamp: new Date().toISOString()
  });
}

/**
 * 그룹 삭제 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} deletedBy - 삭제자 ID
 * @param {string} reason - 삭제 사유
 *
 * @example
 * logGroupDeleted('group-123', 'user-456', '활동 중단');
 */
export function logGroupDeleted(groupId, deletedBy, reason) {
  GroupLogger.warn('Group deleted', {
    action: 'group_deleted',
    groupId,
    deletedBy,
    reason,
    timestamp: new Date().toISOString()
  });
}

/**
 * 그룹 조회 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} viewedBy - 조회자 ID
 *
 * @example
 * logGroupViewed('group-123', 'user-456');
 */
export function logGroupViewed(groupId, viewedBy) {
  GroupLogger.info('Group viewed', {
    action: 'group_viewed',
    groupId,
    viewedBy,
    timestamp: new Date().toISOString()
  });
}

// ============================================
// 2. 멤버 관리 로깅 (6개)
// ============================================

/**
 * 멤버 추가 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} memberId - 멤버 ID
 * @param {string} addedBy - 추가자 ID
 * @param {string} role - 역할
 *
 * @example
 * logMemberAdded('group-123', 'user-789', 'user-456', 'MEMBER');
 */
export function logMemberAdded(groupId, memberId, addedBy, role) {
  GroupLogger.info('Member added to group', {
    action: 'member_added',
    groupId,
    memberId,
    addedBy,
    role,
    timestamp: new Date().toISOString()
  });
}

/**
 * 멤버 제거 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} memberId - 멤버 ID
 * @param {string} removedBy - 제거자 ID
 * @param {string} reason - 제거 사유
 *
 * @example
 * logMemberRemoved('group-123', 'user-789', 'user-456', '규칙 위반');
 */
export function logMemberRemoved(groupId, memberId, removedBy, reason) {
  GroupLogger.warn('Member removed from group', {
    action: 'member_removed',
    groupId,
    memberId,
    removedBy,
    reason,
    timestamp: new Date().toISOString()
  });
}

/**
 * 멤버 역할 변경 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} memberId - 멤버 ID
 * @param {string} oldRole - 이전 역할
 * @param {string} newRole - 새 역할
 * @param {string} changedBy - 변경자 ID
 *
 * @example
 * logMemberRoleChanged('group-123', 'user-789', 'MEMBER', 'ADMIN', 'user-456');
 */
export function logMemberRoleChanged(groupId, memberId, oldRole, newRole, changedBy) {
  GroupLogger.info('Member role changed', {
    action: 'member_role_changed',
    groupId,
    memberId,
    oldRole,
    newRole,
    changedBy,
    timestamp: new Date().toISOString()
  });
}

/**
 * 멤버 가입 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} memberId - 멤버 ID
 *
 * @example
 * logMemberJoined('group-123', 'user-789');
 */
export function logMemberJoined(groupId, memberId) {
  GroupLogger.info('Member joined group', {
    action: 'member_joined',
    groupId,
    memberId,
    timestamp: new Date().toISOString()
  });
}

/**
 * 멤버 탈퇴 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} memberId - 멤버 ID
 * @param {string} reason - 탈퇴 사유
 *
 * @example
 * logMemberLeft('group-123', 'user-789', '개인 사정');
 */
export function logMemberLeft(groupId, memberId, reason) {
  GroupLogger.info('Member left group', {
    action: 'member_left',
    groupId,
    memberId,
    reason,
    timestamp: new Date().toISOString()
  });
}

/**
 * 멤버 강퇴 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} memberId - 멤버 ID
 * @param {string} kickedBy - 강퇴자 ID
 * @param {string} reason - 강퇴 사유
 *
 * @example
 * logMemberKicked('group-123', 'user-789', 'user-456', '규칙 위반');
 */
export function logMemberKicked(groupId, memberId, kickedBy, reason) {
  GroupLogger.warn('Member kicked from group', {
    action: 'member_kicked',
    groupId,
    memberId,
    kickedBy,
    reason,
    timestamp: new Date().toISOString()
  });
}

// ============================================
// 3. 초대 시스템 로깅 (5개)
// ============================================

/**
 * 초대 생성 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} inviteId - 초대 ID
 * @param {string} createdBy - 생성자 ID
 * @param {string} targetEmail - 대상 이메일
 *
 * @example
 * logInviteCreated('group-123', 'invite-456', 'user-789', 'target@example.com');
 */
export function logInviteCreated(groupId, inviteId, createdBy, targetEmail) {
  GroupLogger.info('Invite created', {
    action: 'invite_created',
    groupId,
    inviteId,
    createdBy,
    targetEmail,
    timestamp: new Date().toISOString()
  });
}

/**
 * 초대 전송 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} inviteId - 초대 ID
 * @param {string} targetEmail - 대상 이메일
 *
 * @example
 * logInviteSent('group-123', 'invite-456', 'target@example.com');
 */
export function logInviteSent(groupId, inviteId, targetEmail) {
  GroupLogger.info('Invite sent', {
    action: 'invite_sent',
    groupId,
    inviteId,
    targetEmail,
    timestamp: new Date().toISOString()
  });
}

/**
 * 초대 수락 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} inviteId - 초대 ID
 * @param {string} acceptedBy - 수락자 ID
 *
 * @example
 * logInviteAccepted('group-123', 'invite-456', 'user-789');
 */
export function logInviteAccepted(groupId, inviteId, acceptedBy) {
  GroupLogger.info('Invite accepted', {
    action: 'invite_accepted',
    groupId,
    inviteId,
    acceptedBy,
    timestamp: new Date().toISOString()
  });
}

/**
 * 초대 거절 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} inviteId - 초대 ID
 * @param {string} rejectedBy - 거절자 ID
 *
 * @example
 * logInviteRejected('group-123', 'invite-456', 'user-789');
 */
export function logInviteRejected(groupId, inviteId, rejectedBy) {
  GroupLogger.info('Invite rejected', {
    action: 'invite_rejected',
    groupId,
    inviteId,
    rejectedBy,
    timestamp: new Date().toISOString()
  });
}

/**
 * 초대 취소 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} inviteId - 초대 ID
 * @param {string} canceledBy - 취소자 ID
 *
 * @example
 * logInviteCanceled('group-123', 'invite-456', 'user-789');
 */
export function logInviteCanceled(groupId, inviteId, canceledBy) {
  GroupLogger.info('Invite canceled', {
    action: 'invite_canceled',
    groupId,
    inviteId,
    canceledBy,
    timestamp: new Date().toISOString()
  });
}

// ============================================
// 4. 가입/탈퇴 로깅 (3개)
// ============================================

/**
 * 가입 요청 생성 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 *
 * @example
 * logJoinRequestCreated('group-123', 'user-789');
 */
export function logJoinRequestCreated(groupId, userId) {
  GroupLogger.info('Join request created', {
    action: 'join_request_created',
    groupId,
    userId,
    timestamp: new Date().toISOString()
  });
}

/**
 * 가입 요청 처리 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {string} status - 처리 결과 (approved, rejected)
 * @param {string} processedBy - 처리자 ID
 *
 * @example
 * logJoinRequestProcessed('group-123', 'user-789', 'approved', 'user-456');
 */
export function logJoinRequestProcessed(groupId, userId, status, processedBy) {
  const logMethod = status === 'approved' ? GroupLogger.info : GroupLogger.warn;

  logMethod(`Join request ${status}`, {
    action: 'join_request_processed',
    groupId,
    userId,
    status,
    processedBy,
    timestamp: new Date().toISOString()
  });
}

/**
 * 탈퇴 요청 처리 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {string} reason - 탈퇴 사유
 *
 * @example
 * logLeaveRequestProcessed('group-123', 'user-789', '개인 사정');
 */
export function logLeaveRequestProcessed(groupId, userId, reason) {
  GroupLogger.info('Leave request processed', {
    action: 'leave_request_processed',
    groupId,
    userId,
    reason,
    timestamp: new Date().toISOString()
  });
}

// ============================================
// 5. 권한 변경 로깅 (2개)
// ============================================

/**
 * 권한 부여 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {string} permission - 부여된 권한
 * @param {string} grantedBy - 부여자 ID
 *
 * @example
 * logPermissionGranted('group-123', 'user-789', 'ADMIN', 'user-456');
 */
export function logPermissionGranted(groupId, userId, permission, grantedBy) {
  GroupLogger.info('Permission granted', {
    action: 'permission_granted',
    groupId,
    userId,
    permission,
    grantedBy,
    timestamp: new Date().toISOString()
  });
}

/**
 * 권한 회수 로그
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {string} permission - 회수된 권한
 * @param {string} revokedBy - 회수자 ID
 *
 * @example
 * logPermissionRevoked('group-123', 'user-789', 'ADMIN', 'user-456');
 */
export function logPermissionRevoked(groupId, userId, permission, revokedBy) {
  GroupLogger.warn('Permission revoked', {
    action: 'permission_revoked',
    groupId,
    userId,
    permission,
    revokedBy,
    timestamp: new Date().toISOString()
  });
}

// ============================================
// 기본 Export
// ============================================

export default GroupLogger;

