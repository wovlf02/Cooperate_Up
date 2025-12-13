/**
 * Group Permission Exception
 *
 * @description
 * 그룹 권한 예외 처리 클래스 (10개 에러)
 * GROUP-021, GROUP-022, GROUP-023, GROUP-025, GROUP-041, GROUP-054, GROUP-060, GROUP-061, GROUP-065
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-03
 */

import GroupException from './GroupException.js';

export default class GroupPermissionException extends GroupException {
  constructor(message, code, statusCode = 403, securityLevel = 'critical', context = {}) {
    super(message, code, statusCode, securityLevel, context);
    this.name = 'GroupPermissionException';
    this.category = 'permission';
  }

  // ========================================
  // CRUD 권한 (5개)
  // ========================================

  static insufficientPermissionToCreate() {
    return GroupException.insufficientPermissionToCreate();
  }

  static insufficientPermissionToUpdate() {
    return GroupException.insufficientPermissionToUpdate();
  }

  static insufficientPermissionToDelete() {
    return GroupException.insufficientPermissionToDelete();
  }

  static insufficientPermissionToView() {
    return GroupException.insufficientPermissionToView();
  }

  static ownerCannotLeave() {
    return GroupException.ownerCannotLeave();
  }

  // ========================================
  // 멤버 관리 권한 (3개)
  // ========================================

  static insufficientPermissionToAddMember() {
    return GroupException.insufficientPermissionToAddMember();
  }

  static insufficientPermissionToRemoveMember() {
    return GroupException.insufficientPermissionToRemoveMember();
  }

  static insufficientPermissionToChangeRole() {
    return GroupException.insufficientPermissionToChangeRole();
  }

  // ========================================
  // 초대 권한 (2개)
  // ========================================

  static insufficientPermissionToInvite() {
    return GroupException.insufficientPermissionToInvite();
  }

  static insufficientPermissionToCancelInvite() {
    return GroupException.insufficientPermissionToCancelInvite();
  }

  // ========================================
  // 추가 권한 체크 메서드
  // ========================================

  static ownerPermissionRequired(userId, currentRole) {
    return new GroupException(
      'OWNER 권한이 필요합니다.',
      'GROUP-021',
      403,
      'critical',
      { userId, currentRole, requiredRole: 'OWNER' }
    );
  }

  static adminPermissionRequired(userId, currentRole) {
    return new GroupException(
      'ADMIN 이상의 권한이 필요합니다.',
      'GROUP-022',
      403,
      'critical',
      { userId, currentRole, requiredRole: 'ADMIN' }
    );
  }

  static notActiveMember(userId, status) {
    return new GroupException(
      '활성화된 멤버가 아닙니다.',
      'GROUP-027',
      403,
      'high',
      { userId, status }
    );
  }

  static insufficientRole(message) {
    return new GroupException(
      message || '권한이 부족합니다.',
      'GROUP-023',
      403,
      'critical'
    );
  }

  static cannotChangeOwnerRole() {
    return new GroupException(
      'OWNER의 역할을 변경할 수 없습니다.',
      'GROUP-041',
      403,
      'critical'
    );
  }

  static cannotModifyOwner() {
    return new GroupException(
      'OWNER는 제거할 수 없습니다.',
      'GROUP-060',
      403,
      'critical'
    );
  }

  static cannotModifySelf() {
    return new GroupException(
      '자기 자신을 제거할 수 없습니다.',
      'GROUP-061',
      403,
      'critical'
    );
  }

  static insufficientPermission(message) {
    return new GroupException(
      message || '권한이 부족합니다.',
      'GROUP-023',
      403,
      'critical'
    );
  }
}

