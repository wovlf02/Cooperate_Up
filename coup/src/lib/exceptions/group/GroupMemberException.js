/**
 * Group Member Exception
 *
 * @description
 * 그룹 멤버 관리 예외 처리 클래스 (14개 에러)
 * GROUP-027 ~ GROUP-040
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-03
 */

import GroupException from './GroupException.js';

export default class GroupMemberException extends GroupException {
  constructor(message, code, statusCode = 400, securityLevel = 'high', context = {}) {
    super(message, code, statusCode, securityLevel, context);
    this.name = 'GroupMemberException';
    this.category = 'member';
  }

  // ========================================
  // 멤버 존재 여부 (7개)
  // ========================================

  static memberNotFound(userId) {
    return GroupException.memberNotFound(userId);
  }

  static alreadyMember(userId) {
    return GroupException.alreadyMember(userId);
  }

  static alreadyLeft(userId) {
    return GroupException.alreadyLeft(userId);
  }

  static kickedUser(userId) {
    return GroupException.kickedUser(userId);
  }

  static suspendedUserCannotJoin(userId) {
    return GroupException.suspendedUserCannotJoin(userId);
  }

  static memberCapacityExceeded(capacity) {
    return GroupException.memberCapacityExceeded(capacity);
  }

  static memberDuplicateCheck() {
    return GroupException.memberDuplicateCheck();
  }

  // ========================================
  // 역할 관리 (4개)
  // ========================================

  static invalidRole(role) {
    return GroupException.invalidRole(role);
  }

  static onlyOneOwnerAllowed() {
    return GroupException.onlyOneOwnerAllowed();
  }

  static atLeastOneAdminRequired() {
    return GroupException.atLeastOneAdminRequired();
  }

  static targetMemberNotFound(userId) {
    return GroupException.targetMemberNotFound(userId);
  }

  // ========================================
  // 멤버 액션 (3개)
  // ========================================

  static cannotRemoveSelf() {
    return GroupException.cannotRemoveSelf();
  }

  static cannotRemoveOwner() {
    return GroupException.cannotRemoveOwner();
  }

  static memberHasActiveTasks(taskCount) {
    return GroupException.memberHasActiveTasks(taskCount);
  }

  // ========================================
  // 추가 멤버 상태 체크 메서드
  // ========================================

  static memberNotActive(userId, status) {
    return new GroupException(
      '활성화된 멤버가 아닙니다.',
      'GROUP-027',
      403,
      'high',
      { userId, status }
    );
  }

  static memberKicked(userId) {
    return new GroupException(
      '강퇴된 사용자는 재가입할 수 없습니다.',
      'GROUP-030',
      403,
      'high',
      { userId }
    );
  }
}

