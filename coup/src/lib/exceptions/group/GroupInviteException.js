/**
 * Group Invite Exception
 *
 * @description
 * 그룹 초대 시스템 예외 처리 클래스 (15개 에러)
 * GROUP-042 ~ GROUP-057
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-03
 */

import GroupException from './GroupException.js';

export default class GroupInviteException extends GroupException {
  constructor(message, code, statusCode = 400, securityLevel = 'medium', context = {}) {
    super(message, code, statusCode, securityLevel, context);
    this.name = 'GroupInviteException';
    this.category = 'invite';
  }

  // ========================================
  // 초대 코드 (5개)
  // ========================================

  static inviteCodeGenerationFailed() {
    return GroupException.inviteCodeGenerationFailed();
  }

  static invalidInviteCode(code) {
    return GroupException.invalidInviteCode(code);
  }

  static inviteCodeExpired(code, expiredAt) {
    return GroupException.inviteCodeExpired(code, expiredAt);
  }

  static inviteCodeAlreadyUsed(code) {
    return GroupException.inviteCodeAlreadyUsed(code);
  }

  static inviteUsageLimitExceeded(limit) {
    return GroupException.inviteUsageLimitExceeded(limit);
  }

  // ========================================
  // 초대 대상 (5개)
  // ========================================

  static cannotInviteExistingMember(userId) {
    return GroupException.cannotInviteExistingMember(userId);
  }

  static cannotInviteKickedUser(userId) {
    return GroupException.cannotInviteKickedUser(userId);
  }

  static inviteTargetUserNotFound(email) {
    return GroupException.inviteTargetUserNotFound(email);
  }

  static invalidEmailFormat(email) {
    return GroupException.invalidEmailFormat(email);
  }

  static emailSendFailed(email, reason) {
    return GroupException.emailSendFailed(email, reason);
  }

  // ========================================
  // 초대 액션 (5개)
  // ========================================

  static inviteNotFound(inviteId) {
    return GroupException.inviteNotFound(inviteId);
  }

  static inviteCreationFailed(reason) {
    return GroupException.inviteCreationFailed(reason);
  }

  static inviteActionFailed(action, reason) {
    return GroupException.inviteActionFailed(action, reason);
  }

  static inviteAlreadyProcessed(inviteId, status) {
    return GroupException.inviteAlreadyProcessed(inviteId, status);
  }

  static cannotProcessOthersInvite(inviteId) {
    return GroupException.cannotProcessOthersInvite(inviteId);
  }
}

