/**
 * Group 영역 예외 클래스 (Base)
 *
 * @description
 * 그룹 관련 모든 예외를 처리하는 Base 클래스
 * 76개의 에러 코드 (GROUP-001 ~ GROUP-076)
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-03
 */

export default class GroupException extends Error {
  /**
   * @param {string} message - 기본 메시지
   * @param {string} code - 에러 코드
   * @param {number} statusCode - HTTP 상태 코드
   * @param {string} securityLevel - 보안 수준 (critical, high, medium, low)
   * @param {Object} context - 추가 컨텍스트
   */
  constructor(message, code, statusCode = 400, securityLevel = 'medium', context = {}) {
    super(message);

    this.name = 'GroupException';
    this.code = code;
    this.message = message;
    this.userMessage = message;
    this.devMessage = message;
    this.statusCode = statusCode;
    this.securityLevel = securityLevel;
    this.domain = 'GROUP';
    this.retryable = false;
    this.timestamp = new Date().toISOString();
    this.context = context;
    this.category = context.type || 'general';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GroupException);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      devMessage: this.devMessage,
      statusCode: this.statusCode,
      securityLevel: this.securityLevel,
      domain: this.domain,
      retryable: this.retryable,
      timestamp: this.timestamp,
      context: this.context,
      category: this.category,
    };
  }

  // ========================================
  // A. Validation Exceptions (20개)
  // ========================================

  // 그룹 이름 검증 (5개)
  static nameRequired() {
    return new GroupException(
      '그룹 이름을 입력해주세요.',
      'GROUP-001',
      400,
      'medium',
      { field: 'name', type: 'required' }
    );
  }

  static nameTooShort(minLength = 2) {
    return new GroupException(
      `그룹 이름은 최소 ${minLength}자 이상이어야 합니다.`,
      'GROUP-002',
      400,
      'medium',
      { field: 'name', type: 'length', minLength }
    );
  }

  static nameTooLong(maxLength = 50) {
    return new GroupException(
      `그룹 이름은 최대 ${maxLength}자까지 가능합니다.`,
      'GROUP-003',
      400,
      'medium',
      { field: 'name', type: 'length', maxLength }
    );
  }

  static nameDuplicate(name) {
    return new GroupException(
      `'${name}' 그룹 이름이 이미 존재합니다. 다른 이름을 선택해주세요.`,
      'GROUP-004',
      409,
      'medium',
      { field: 'name', type: 'duplicate', name }
    );
  }

  static nameInvalidCharacters() {
    return new GroupException(
      '그룹 이름에는 특수문자를 사용할 수 없습니다.',
      'GROUP-005',
      400,
      'medium',
      { field: 'name', type: 'format' }
    );
  }

  // 설명 검증 (3개)
  static descriptionRequired() {
    return new GroupException(
      '그룹 설명을 입력해주세요.',
      'GROUP-006',
      400,
      'medium',
      { field: 'description', type: 'required' }
    );
  }

  static descriptionTooShort(minLength = 10) {
    return new GroupException(
      `그룹 설명은 최소 ${minLength}자 이상이어야 합니다.`,
      'GROUP-007',
      400,
      'medium',
      { field: 'description', type: 'length', minLength }
    );
  }

  static descriptionTooLong(maxLength = 500) {
    return new GroupException(
      `그룹 설명은 최대 ${maxLength}자까지 가능합니다.`,
      'GROUP-008',
      400,
      'medium',
      { field: 'description', type: 'length', maxLength }
    );
  }

  // 카테고리 검증 (3개)
  static categoryRequired() {
    return new GroupException(
      '카테고리를 선택해주세요.',
      'GROUP-009',
      400,
      'medium',
      { field: 'category', type: 'required' }
    );
  }

  static categoryInvalid(category) {
    return new GroupException(
      `'${category}'는 유효하지 않은 카테고리입니다.`,
      'GROUP-010',
      400,
      'medium',
      { field: 'category', type: 'invalid', category }
    );
  }

  static categoryNotFound(category) {
    return new GroupException(
      `'${category}' 카테고리를 찾을 수 없습니다.`,
      'GROUP-011',
      404,
      'medium',
      { field: 'category', type: 'not_found', category }
    );
  }

  // 정원 검증 (4개)
  static capacityRequired() {
    return new GroupException(
      '그룹 정원을 설정해주세요.',
      'GROUP-012',
      400,
      'medium',
      { field: 'capacity', type: 'required' }
    );
  }

  static capacityTooSmall(minCapacity = 2) {
    return new GroupException(
      `그룹 정원은 최소 ${minCapacity}명 이상이어야 합니다.`,
      'GROUP-013',
      400,
      'medium',
      { field: 'capacity', type: 'range', minCapacity }
    );
  }

  static capacityTooLarge(maxCapacity = 200) {
    return new GroupException(
      `그룹 정원은 최대 ${maxCapacity}명까지 가능합니다.`,
      'GROUP-014',
      400,
      'medium',
      { field: 'capacity', type: 'range', maxCapacity }
    );
  }

  static capacityBelowCurrentMembers(capacity, currentCount) {
    return new GroupException(
      `그룹 정원을 현재 멤버 수(${currentCount}명)보다 작게 설정할 수 없습니다.`,
      'GROUP-015',
      400,
      'high',
      { field: 'capacity', type: 'conflict', capacity, currentCount }
    );
  }

  // 기타 검증 (5개)
  static visibilityRequired() {
    return new GroupException(
      '그룹 공개 설정을 선택해주세요.',
      'GROUP-016',
      400,
      'medium',
      { field: 'visibility', type: 'required' }
    );
  }

  static tooManyTags(maxTags = 10) {
    return new GroupException(
      `태그는 최대 ${maxTags}개까지 추가할 수 있습니다.`,
      'GROUP-017',
      400,
      'low',
      { field: 'tags', type: 'limit', maxTags }
    );
  }

  static tagTooLong(tag, maxLength = 20) {
    return new GroupException(
      `태그 '${tag}'가 너무 깁니다. 최대 ${maxLength}자까지 가능합니다.`,
      'GROUP-018',
      400,
      'low',
      { field: 'tags', type: 'length', tag, maxLength }
    );
  }

  static invalidImageFormat(format) {
    return new GroupException(
      `'${format}' 형식은 지원하지 않습니다. JPG 또는 PNG 파일을 업로드해주세요.`,
      'GROUP-019',
      400,
      'medium',
      { field: 'image', type: 'format', format }
    );
  }

  static imageTooLarge(size, maxSize = 5) {
    return new GroupException(
      `이미지 크기가 너무 큽니다. 최대 ${maxSize}MB까지 가능합니다. (현재: ${size}MB)`,
      'GROUP-020',
      400,
      'medium',
      { field: 'image', type: 'size', size, maxSize }
    );
  }

  // 초대 코드 검증 (2개)
  static inviteCodeRequired() {
    return new GroupException(
      '초대 코드를 입력해주세요.',
      'GROUP-020-1',
      400,
      'medium',
      { field: 'inviteCode', type: 'required' }
    );
  }

  static invalidInviteCodeFormat(code) {
    return new GroupException(
      `유효하지 않은 초대 코드 형식입니다: ${code}`,
      'GROUP-020-2',
      400,
      'medium',
      { field: 'inviteCode', type: 'format', code }
    );
  }

  // 이메일 검증 (2개)
  static emailRequired() {
    return new GroupException(
      '이메일을 입력해주세요.',
      'GROUP-020-3',
      400,
      'medium',
      { field: 'email', type: 'required' }
    );
  }

  static invalidEmailFormat(email) {
    return new GroupException(
      `유효하지 않은 이메일 형식입니다: ${email}`,
      'GROUP-020-4',
      400,
      'medium',
      { field: 'email', type: 'format', email }
    );
  }

  // ========================================
  // B. Permission Exceptions (10개)
  // ========================================

  // CRUD 권한 (5개)
  static insufficientPermissionToCreate() {
    return new GroupException(
      '그룹을 생성할 권한이 없습니다.',
      'GROUP-021',
      403,
      'critical',
      { type: 'permission', action: 'create' }
    );
  }

  static insufficientPermissionToUpdate() {
    return new GroupException(
      '그룹을 수정할 권한이 없습니다. ADMIN 이상의 권한이 필요합니다.',
      'GROUP-065',
      403,
      'critical',
      { type: 'permission', action: 'update', requiredRole: 'ADMIN' }
    );
  }

  static insufficientPermissionToDelete() {
    return new GroupException(
      '그룹을 삭제할 권한이 없습니다. OWNER만 삭제할 수 있습니다.',
      'GROUP-061',
      403,
      'critical',
      { type: 'permission', action: 'delete', requiredRole: 'OWNER' }
    );
  }

  static insufficientPermissionToView() {
    return new GroupException(
      '그룹을 조회할 권한이 없습니다.',
      'GROUP-060',
      403,
      'critical',
      { type: 'permission', action: 'view' }
    );
  }

  static ownerCannotLeave() {
    return new GroupException(
      'OWNER는 그룹을 탈퇴할 수 없습니다. 소유권을 이전한 후 탈퇴해주세요.',
      'GROUP-025',
      403,
      'critical',
      { type: 'permission', action: 'leave', role: 'OWNER' }
    );
  }

  // 멤버 관리 권한 (3개)
  static insufficientPermissionToAddMember() {
    return new GroupException(
      '멤버를 추가할 권한이 없습니다. ADMIN 이상의 권한이 필요합니다.',
      'GROUP-021',
      403,
      'critical',
      { type: 'permission', action: 'add_member', requiredRole: 'ADMIN' }
    );
  }

  static insufficientPermissionToRemoveMember() {
    return new GroupException(
      '멤버를 제거할 권한이 없습니다. ADMIN 이상의 권한이 필요합니다.',
      'GROUP-022',
      403,
      'critical',
      { type: 'permission', action: 'remove_member', requiredRole: 'ADMIN' }
    );
  }

  static insufficientPermissionToChangeRole() {
    return new GroupException(
      '멤버 역할을 변경할 권한이 없습니다. OWNER만 가능합니다.',
      'GROUP-023',
      403,
      'critical',
      { type: 'permission', action: 'change_role', requiredRole: 'OWNER' }
    );
  }

  // 초대 권한 (2개)
  static insufficientPermissionToInvite() {
    return new GroupException(
      '멤버를 초대할 권한이 없습니다. ADMIN 이상의 권한이 필요합니다.',
      'GROUP-041',
      403,
      'critical',
      { type: 'permission', action: 'invite', requiredRole: 'ADMIN' }
    );
  }

  static insufficientPermissionToCancelInvite() {
    return new GroupException(
      '초대를 취소할 권한이 없습니다. ADMIN 이상의 권한이 필요합니다.',
      'GROUP-054',
      403,
      'critical',
      { type: 'permission', action: 'cancel_invite', requiredRole: 'ADMIN' }
    );
  }

  // ========================================
  // C. Member Exceptions (14개)
  // ========================================

  // 멤버 존재 여부 (7개)
  static memberNotFound(userId) {
    return new GroupException(
      '멤버를 찾을 수 없습니다.',
      'GROUP-027',
      404,
      'high',
      { type: 'member', subtype: 'not_found', userId }
    );
  }

  static alreadyMember(userId) {
    return new GroupException(
      '이미 그룹의 멤버입니다.',
      'GROUP-028',
      409,
      'high',
      { type: 'member', subtype: 'duplicate', userId }
    );
  }

  static alreadyLeft(userId) {
    return new GroupException(
      '이미 탈퇴한 그룹입니다.',
      'GROUP-029',
      409,
      'high',
      { type: 'member', subtype: 'already_left', userId }
    );
  }

  static kickedUser(userId) {
    return new GroupException(
      '강퇴된 사용자는 다시 가입할 수 없습니다.',
      'GROUP-030',
      403,
      'high',
      { type: 'member', subtype: 'kicked', userId }
    );
  }

  static suspendedUserCannotJoin(userId) {
    return new GroupException(
      '정지된 사용자는 그룹에 가입할 수 없습니다.',
      'GROUP-031',
      403,
      'high',
      { type: 'member', subtype: 'suspended', userId }
    );
  }

  static memberCapacityExceeded(capacity) {
    return new GroupException(
      `그룹 정원이 가득 찼습니다. (최대 ${capacity}명)`,
      'GROUP-032',
      400,
      'high',
      { type: 'member', subtype: 'capacity_exceeded', capacity }
    );
  }

  static memberDuplicateCheck() {
    return new GroupException(
      '멤버 중복 확인에 실패했습니다.',
      'GROUP-033',
      500,
      'low',
      { type: 'member', subtype: 'duplicate_check_failed' }
    );
  }

  // 역할 관리 (4개)
  static roleRequired() {
    return new GroupException(
      '역할을 입력해주세요.',
      'GROUP-033-1',
      400,
      'medium',
      { type: 'role', subtype: 'required' }
    );
  }

  static invalidRole(role) {
    return new GroupException(
      `'${role}'은 유효하지 않은 역할입니다.`,
      'GROUP-034',
      400,
      'high',
      { type: 'role', subtype: 'invalid', role }
    );
  }

  static invalidStatus(status, validStatuses = []) {
    return new GroupException(
      `'${status}'는 유효하지 않은 상태입니다. 가능한 값: ${validStatuses.join(', ')}`,
      'GROUP-034-1',
      400,
      'medium',
      { type: 'status', subtype: 'invalid', status, validStatuses }
    );
  }

  static onlyOneOwnerAllowed() {
    return new GroupException(
      'OWNER는 1명만 가능합니다.',
      'GROUP-035',
      400,
      'high',
      { type: 'role', subtype: 'owner_limit' }
    );
  }

  static atLeastOneAdminRequired() {
    return new GroupException(
      '최소 1명의 ADMIN이 필요합니다.',
      'GROUP-036',
      400,
      'high',
      { type: 'role', subtype: 'admin_required' }
    );
  }

  static targetMemberNotFound(userId) {
    return new GroupException(
      '역할을 변경할 멤버를 찾을 수 없습니다.',
      'GROUP-037',
      404,
      'high',
      { type: 'role', subtype: 'target_not_found', userId }
    );
  }

  // 멤버 액션 (3개)
  static cannotRemoveSelf() {
    return new GroupException(
      '본인은 제거할 수 없습니다. 탈퇴를 이용해주세요.',
      'GROUP-038',
      400,
      'medium',
      { type: 'action', subtype: 'remove_self' }
    );
  }

  static cannotRemoveOwner() {
    return new GroupException(
      'OWNER는 제거할 수 없습니다.',
      'GROUP-039',
      403,
      'critical',
      { type: 'action', subtype: 'remove_owner' }
    );
  }

  static memberHasActiveTasks(taskCount) {
    return new GroupException(
      `진행 중인 작업이 ${taskCount}개 있어 제거할 수 없습니다.`,
      'GROUP-040',
      400,
      'high',
      { type: 'action', subtype: 'has_active_tasks', taskCount }
    );
  }

  // ========================================
  // D. Invite Exceptions (15개)
  // ========================================

  // 초대 코드 (5개)
  static inviteCodeGenerationFailed() {
    return new GroupException(
      '초대 코드 생성에 실패했습니다.',
      'GROUP-043',
      500,
      'high',
      { type: 'invite', subtype: 'code_generation_failed' }
    );
  }

  static invalidInviteCode(code) {
    return new GroupException(
      '유효하지 않은 초대 코드입니다.',
      'GROUP-044',
      400,
      'high',
      { type: 'invite', subtype: 'invalid_code', code }
    );
  }

  static inviteCodeExpired(code, expiredAt) {
    return new GroupException(
      '초대 코드가 만료되었습니다.',
      'GROUP-045',
      400,
      'high',
      { type: 'invite', subtype: 'code_expired', code, expiredAt }
    );
  }

  static inviteCodeAlreadyUsed(code) {
    return new GroupException(
      '이미 사용된 초대 코드입니다.',
      'GROUP-046',
      400,
      'high',
      { type: 'invite', subtype: 'code_already_used', code }
    );
  }

  static inviteUsageLimitExceeded(limit) {
    return new GroupException(
      `초대 코드 사용 횟수가 초과되었습니다. (최대 ${limit}회)`,
      'GROUP-047',
      400,
      'medium',
      { type: 'invite', subtype: 'usage_limit_exceeded', limit }
    );
  }

  // 초대 대상 (5개)
  static cannotInviteExistingMember(userId) {
    return new GroupException(
      '이미 멤버인 사용자는 초대할 수 없습니다.',
      'GROUP-048',
      400,
      'medium',
      { type: 'invite', subtype: 'already_member', userId }
    );
  }

  static cannotInviteKickedUser(userId) {
    return new GroupException(
      '강퇴된 사용자는 초대할 수 없습니다.',
      'GROUP-049',
      403,
      'high',
      { type: 'invite', subtype: 'kicked_user', userId }
    );
  }

  static inviteTargetUserNotFound(email) {
    return new GroupException(
      '초대할 사용자를 찾을 수 없습니다.',
      'GROUP-050',
      404,
      'medium',
      { type: 'invite', subtype: 'user_not_found', email }
    );
  }

  static invalidEmailFormat(email) {
    return new GroupException(
      '유효하지 않은 이메일 형식입니다.',
      'GROUP-051',
      400,
      'medium',
      { type: 'invite', subtype: 'invalid_email', email }
    );
  }

  static emailSendFailed(email, reason) {
    return new GroupException(
      '이메일 발송에 실패했습니다.',
      'GROUP-052',
      500,
      'medium',
      { type: 'invite', subtype: 'email_send_failed', email, reason }
    );
  }

  // 초대 액션 (5개)
  static inviteNotFound(inviteId) {
    return new GroupException(
      '초대를 찾을 수 없습니다.',
      'GROUP-053',
      404,
      'medium',
      { type: 'invite', subtype: 'not_found', inviteId }
    );
  }

  static inviteCreationFailed(reason) {
    return new GroupException(
      '초대 생성에 실패했습니다.',
      'GROUP-042',
      500,
      'high',
      { type: 'invite', subtype: 'creation_failed', reason }
    );
  }

  static inviteActionFailed(action, reason) {
    return new GroupException(
      `초대 ${action}에 실패했습니다.`,
      'GROUP-055',
      500,
      'medium',
      { type: 'invite', subtype: 'action_failed', action, reason }
    );
  }

  static inviteAlreadyProcessed(inviteId, status) {
    return new GroupException(
      `이미 처리된 초대입니다. (상태: ${status})`,
      'GROUP-056',
      400,
      'medium',
      { type: 'invite', subtype: 'already_processed', inviteId, status }
    );
  }

  static cannotProcessOthersInvite(inviteId) {
    return new GroupException(
      '본인의 초대만 수락/거절할 수 있습니다.',
      'GROUP-057',
      403,
      'medium',
      { type: 'invite', subtype: 'not_owner', inviteId }
    );
  }

  // ========================================
  // E. Business Logic Exceptions (17개)
  // ========================================

  // 그룹 존재 확인 (3개)
  static groupNotFound(groupId) {
    return new GroupException(
      '그룹을 찾을 수 없습니다.',
      'GROUP-058',
      404,
      'high',
      { type: 'group', subtype: 'not_found', groupId }
    );
  }

  static groupDeleted(groupId) {
    return new GroupException(
      '삭제된 그룹입니다.',
      'GROUP-059',
      404,
      'high',
      { type: 'group', subtype: 'deleted', groupId }
    );
  }

  static privateGroupAccessDenied(groupId) {
    return new GroupException(
      '비공개 그룹에 접근할 수 없습니다.',
      'GROUP-060',
      403,
      'critical',
      { type: 'group', subtype: 'private_access_denied', groupId }
    );
  }

  // 그룹 삭제 (4개)
  static cannotDeleteWithActiveMembers(memberCount) {
    return new GroupException(
      `활동 멤버가 ${memberCount}명 있어 그룹을 삭제할 수 없습니다.`,
      'GROUP-062',
      400,
      'high',
      { type: 'group', subtype: 'has_active_members', memberCount }
    );
  }

  static cannotDeleteWithActiveProjects(projectCount) {
    return new GroupException(
      `진행 중인 프로젝트가 ${projectCount}개 있어 그룹을 삭제할 수 없습니다.`,
      'GROUP-063',
      400,
      'high',
      { type: 'group', subtype: 'has_active_projects', projectCount }
    );
  }

  static groupDeletionFailed(reason) {
    return new GroupException(
      '그룹 삭제에 실패했습니다.',
      'GROUP-064',
      500,
      'high',
      { type: 'group', subtype: 'deletion_failed', reason }
    );
  }

  // 그룹 수정 (2개)
  static groupStatusUpdateFailed(reason) {
    return new GroupException(
      '그룹 상태 변경에 실패했습니다.',
      'GROUP-066',
      500,
      'medium',
      { type: 'group', subtype: 'status_update_failed', reason }
    );
  }

  static groupRecruitingClosed(groupId) {
    return new GroupException(
      '모집이 종료된 그룹입니다.',
      'GROUP-067',
      400,
      'medium',
      { type: 'group', subtype: 'recruiting_closed', groupId }
    );
  }

  // 가입 관리 (4개)
  static groupNotJoinable(reason) {
    return new GroupException(
      `가입할 수 없는 그룹입니다. (${reason})`,
      'GROUP-068',
      400,
      'medium',
      { type: 'join', subtype: 'not_joinable', reason }
    );
  }

  static inviteOnlyGroup() {
    return new GroupException(
      '초대 전용 그룹입니다. 초대를 받아야 가입할 수 있습니다.',
      'GROUP-069',
      403,
      'medium',
      { type: 'join', subtype: 'invite_only' }
    );
  }

  static duplicateJoinRequest() {
    return new GroupException(
      '이미 가입 신청을 했습니다.',
      'GROUP-070',
      409,
      'medium',
      { type: 'join', subtype: 'duplicate_request' }
    );
  }

  static joinRequestPending() {
    return new GroupException(
      '가입 승인 대기 중입니다.',
      'GROUP-071',
      400,
      'medium',
      { type: 'join', subtype: 'request_pending' }
    );
  }

  // 탈퇴 관리 (3개)
  static cannotLeaveWithActiveTasks(taskCount) {
    return new GroupException(
      `진행 중인 작업이 ${taskCount}개 있어 탈퇴할 수 없습니다.`,
      'GROUP-072',
      400,
      'high',
      { type: 'leave', subtype: 'has_active_tasks', taskCount }
    );
  }

  static leaveFailed(reason) {
    return new GroupException(
      '그룹 탈퇴에 실패했습니다.',
      'GROUP-073',
      500,
      'medium',
      { type: 'leave', subtype: 'failed', reason }
    );
  }

  static alreadyLeftGroup() {
    return new GroupException(
      '이미 탈퇴한 그룹입니다.',
      'GROUP-074',
      400,
      'medium',
      { type: 'leave', subtype: 'already_left' }
    );
  }

  // 기타 (2개)
  static groupSuspended(groupId, reason) {
    return new GroupException(
      `그룹 활동이 정지되었습니다. (${reason})`,
      'GROUP-075',
      403,
      'high',
      { type: 'group', subtype: 'suspended', groupId, reason }
    );
  }

  static databaseError(operation, details) {
    return new GroupException(
      '데이터베이스 오류가 발생했습니다.',
      'GROUP-076',
      500,
      'low',
      { type: 'system', subtype: 'database_error', operation, details }
    );
  }

  static groupNameExists(name) {
    return new GroupException(
      `이미 존재하는 그룹 이름입니다: ${name}`,
      'GROUP-077',
      409,
      'low',
      { type: 'validation', subtype: 'duplicate_name', name }
    );
  }

  static noUpdateData() {
    return new GroupException(
      '수정할 데이터가 없습니다.',
      'GROUP-078',
      400,
      'low',
      { type: 'validation', subtype: 'no_update_data' }
    );
  }

  static groupHasActiveMembers(message) {
    return new GroupException(
      message || '활성 멤버가 있어 작업을 진행할 수 없습니다.',
      'GROUP-062',
      400,
      'high',
      { type: 'group', subtype: 'has_active_members' }
    );
  }

  static invalidCapacity(message) {
    return new GroupException(
      message || '유효하지 않은 정원입니다.',
      'GROUP-079',
      400,
      'low',
      { type: 'validation', subtype: 'invalid_capacity' }
    );
  }
}

