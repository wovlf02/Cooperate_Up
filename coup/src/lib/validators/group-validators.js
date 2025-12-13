/**
 * group-validators.js
 *
 * Group 도메인의 통합 검증 시스템
 * GroupException 클래스를 활용한 체계적인 검증
 *
 * @module lib/validators/group-validators
 * @author CoUp Team
 * @created 2025-12-03
 */

import {
  GroupValidationException,
  GroupPermissionException,
  GroupMemberException,
  GroupInviteException
} from '@/lib/exceptions/group';

// ============================================
// 상수 정의
// ============================================

const VALID_CATEGORIES = ['study', 'project', 'hobby', 'network', 'social', 'etc'];
const VALID_ROLES = ['OWNER', 'ADMIN', 'MEMBER'];
const VALID_MEMBER_STATUS = ['PENDING', 'ACTIVE', 'LEFT', 'KICKED'];
const VALID_VISIBILITIES = ['PUBLIC', 'PRIVATE'];
const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// ============================================
// 1. 그룹 필드 검증 (8개)
// ============================================

/**
 * 그룹 이름 검증
 *
 * @param {string} name - 그룹 이름
 * @returns {boolean} 검증 성공
 * @throws {GroupValidationException}
 *
 * @example
 * validateGroupName('알고리즘 스터디'); // true
 */
export function validateGroupName(name) {
  if (!name) {
    throw GroupValidationException.nameRequired();
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    throw GroupValidationException.nameTooShort(2);
  }

  if (trimmedName.length > 50) {
    throw GroupValidationException.nameTooLong(50);
  }

  // 특수문자 검증
  const invalidChars = /[<>{}[\]\\\/]/;
  if (invalidChars.test(trimmedName)) {
    throw GroupValidationException.nameInvalidCharacters();
  }

  return true;
}

/**
 * 그룹 설명 검증
 *
 * @param {string} description - 그룹 설명
 * @returns {boolean} 검증 성공
 * @throws {GroupValidationException}
 *
 * @example
 * validateDescription('매주 알고리즘 문제를 풀어보는 그룹입니다'); // true
 */
export function validateDescription(description) {
  // description은 선택사항
  if (!description || description.trim().length === 0) {
    return true;
  }

  const trimmedDesc = description.trim();

  if (trimmedDesc.length > 1000) {
    throw GroupValidationException.descriptionTooLong(1000);
  }

  return true;
}

/**
 * 그룹 카테고리 검증
 *
 * @param {string} category - 그룹 카테고리
 * @returns {boolean} 검증 성공
 * @throws {GroupValidationException}
 *
 * @example
 * validateCategory('study'); // true
 */
export function validateCategory(category) {
  if (!category) {
    throw GroupValidationException.categoryRequired();
  }

  if (!VALID_CATEGORIES.includes(category)) {
    throw GroupValidationException.invalidCategory(category, VALID_CATEGORIES);
  }

  return true;
}

/**
 * 그룹 정원 검증
 *
 * @param {number} capacity - 정원
 * @param {number} currentMembers - 현재 멤버 수
 * @returns {boolean} 검증 성공
 * @throws {GroupValidationException}
 *
 * @example
 * validateCapacity(10, 5); // true
 */
export function validateCapacity(capacity, currentMembers = 0) {
  if (capacity === undefined || capacity === null) {
    throw GroupValidationException.capacityRequired();
  }

  if (typeof capacity !== 'number') {
    throw GroupValidationException.capacityInvalidType();
  }

  if (capacity < 2) {
    throw GroupValidationException.capacityTooSmall(2);
  }

  if (capacity > 200) {
    throw GroupValidationException.capacityTooLarge(200);
  }

  if (currentMembers > capacity) {
    throw GroupValidationException.capacityBelowCurrentMembers(currentMembers, capacity);
  }

  return true;
}

/**
 * 그룹 태그 검증
 *
 * @param {string[]} tags - 태그 배열
 * @returns {boolean} 검증 성공
 * @throws {GroupValidationException}
 *
 * @example
 * validateTags(['JavaScript', 'React']); // true
 */
export function validateTags(tags) {
  if (!tags || !Array.isArray(tags)) {
    return true; // 태그는 선택사항
  }

  if (tags.length > 10) {
    throw GroupValidationException.tooManyTags(10);
  }

  for (const tag of tags) {
    if (typeof tag !== 'string' || tag.trim().length === 0) {
      throw GroupValidationException.invalidTagFormat(tag);
    }

    if (tag.length > 20) {
      throw GroupValidationException.tagTooLong(20);
    }
  }

  return true;
}

/**
 * 그룹 이미지 검증
 *
 * @param {File|Object} file - 이미지 파일
 * @returns {boolean} 검증 성공
 * @throws {GroupValidationException}
 *
 * @example
 * validateImage(uploadedFile); // true
 */
export function validateImage(file) {
  if (!file) {
    return true; // 이미지는 선택사항
  }

  // 파일 크기 검증
  if (file.size > IMAGE_SIZE_LIMIT) {
    throw GroupValidationException.imageTooLarge(IMAGE_SIZE_LIMIT);
  }

  // 파일 타입 검증
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    throw GroupValidationException.invalidImageFormat(file.type);
  }

  return true;
}

/**
 * 그룹 공개 설정 검증
 *
 * @param {boolean|string} isPublic - 공개 여부
 * @returns {boolean} 검증 성공
 * @throws {GroupValidationException}
 *
 * @example
 * validateVisibility(true); // true
 */
export function validateVisibility(isPublic) {
  if (isPublic === undefined || isPublic === null) {
    throw GroupValidationException.visibilityRequired();
  }

  if (typeof isPublic !== 'boolean') {
    throw GroupValidationException.visibilityInvalidType();
  }

  return true;
}

/**
 * 그룹 생성/수정 데이터 통합 검증
 *
 * @param {Object} data - 그룹 데이터
 * @param {boolean} isUpdate - 수정 모드 여부
 * @returns {Object} 검증된 데이터
 * @throws {GroupValidationException}
 *
 * @example
 * const validated = validateGroupData({
 *   name: '알고리즘 스터디',
 *   description: '매주 알고리즘 문제를 풀어보는 그룹입니다',
 *   category: 'study',
 *   maxMembers: 10,
 *   isPublic: true
 * });
 */
export function validateGroupData(data, isUpdate = false) {
  const validated = {};

  // 필수 필드 검증 (생성 시에만)
  if (!isUpdate) {
    validateGroupName(data.name);
    validated.name = data.name.trim();

    // description은 선택사항
    if (data.description && data.description.trim().length > 0) {
      validateDescription(data.description);
      validated.description = data.description.trim();
    }

    validateCategory(data.category);
    validated.category = data.category;

    // maxMembers 기본값 설정 후 검증
    const maxMembers = data.maxMembers || 50;
    validateCapacity(maxMembers);
    validated.maxMembers = maxMembers;

    // isPublic 기본값 설정 후 검증
    const isPublic = data.isPublic !== undefined ? data.isPublic : true;
    validateVisibility(isPublic);
    validated.isPublic = isPublic;
  } else {
    // 수정 시에는 제공된 필드만 검증
    if (data.name !== undefined) {
      validateGroupName(data.name);
      validated.name = data.name.trim();
    }

    if (data.description !== undefined) {
      validateDescription(data.description);
      validated.description = data.description ? data.description.trim() : '';
    }

    if (data.category !== undefined) {
      validateCategory(data.category);
      validated.category = data.category;
    }

    if (data.maxMembers !== undefined) {
      validateCapacity(data.maxMembers, data.currentMembers);
      validated.maxMembers = data.maxMembers;
    }

    if (data.isPublic !== undefined) {
      validateVisibility(data.isPublic);
      validated.isPublic = data.isPublic;
    }
  }

  // 선택적 필드 검증
  if (data.tags !== undefined) {
    validateTags(data.tags);
    validated.tags = data.tags;
  }

  if (data.image !== undefined) {
    validateImage(data.image);
    validated.image = data.image;
  }

  return validated;
}

// ============================================
// 2. 멤버 검증 (3개)
// ============================================

/**
 * 멤버 역할 검증
 *
 * @param {string} role - 역할
 * @returns {boolean} 검증 성공
 * @throws {GroupValidationException}
 *
 * @example
 * validateRole('ADMIN'); // true
 */
export function validateRole(role) {
  if (!role) {
    throw GroupValidationException.roleRequired();
  }

  if (!VALID_ROLES.includes(role)) {
    throw GroupValidationException.invalidRole(role, VALID_ROLES);
  }

  return true;
}

/**
 * 멤버 상태 검증
 *
 * @param {string} status - 멤버 상태
 * @returns {boolean} 검증 성공
 * @throws {GroupValidationException}
 *
 * @example
 * validateMemberStatus('ACTIVE'); // true
 */
export function validateMemberStatus(status) {
  if (!status) {
    throw GroupValidationException.statusRequired();
  }

  if (!VALID_MEMBER_STATUS.includes(status)) {
    throw GroupValidationException.invalidStatus(status, VALID_MEMBER_STATUS);
  }

  return true;
}

/**
 * 멤버 액션 권한 검증
 *
 * @param {string} action - 액션 (add, remove, update)
 * @param {Object} member - 액션 대상 멤버
 * @param {Object} requestUser - 요청자 정보
 * @returns {boolean} 검증 성공
 * @throws {GroupPermissionException}
 *
 * @example
 * validateMemberAction('remove', targetMember, requestUser); // true
 */
export function validateMemberAction(action, member, requestUser) {
  if (!requestUser || !requestUser.role) {
    throw GroupPermissionException.insufficientPermissionToUpdate();
  }

  const requestRole = requestUser.role;
  const targetRole = member?.role;

  switch (action) {
    case 'add':
      // ADMIN 이상 권한 필요
      if (!['OWNER', 'ADMIN'].includes(requestRole)) {
        throw GroupPermissionException.insufficientPermissionToAddMember();
      }
      break;

    case 'remove':
      // OWNER 또는 ADMIN만 가능, 단 ADMIN은 OWNER 제거 불가
      if (!['OWNER', 'ADMIN'].includes(requestRole)) {
        throw GroupPermissionException.insufficientPermissionToRemoveMember();
      }
      if (requestRole === 'ADMIN' && targetRole === 'OWNER') {
        throw GroupPermissionException.cannotRemoveOwner();
      }
      if (targetRole === 'OWNER') {
        throw GroupPermissionException.cannotRemoveOwner();
      }
      break;

    case 'update':
      // OWNER만 역할 변경 가능
      if (requestRole !== 'OWNER') {
        throw GroupPermissionException.insufficientPermissionToChangeRole();
      }
      if (targetRole === 'OWNER') {
        throw GroupPermissionException.cannotChangeOwnerRole();
      }
      break;

    default:
      throw GroupValidationException.invalidAction(action);
  }

  return true;
}

// ============================================
// 3. 초대 검증 (2개)
// ============================================

/**
 * 초대 코드 검증
 *
 * @param {string} code - 초대 코드
 * @returns {boolean} 검증 성공
 * @throws {GroupValidationException}
 *
 * @example
 * validateInviteCode('ABC123DEF456'); // true
 */
export function validateInviteCode(code) {
  if (!code) {
    throw GroupValidationException.inviteCodeRequired();
  }

  // 코드 형식: 12자리 영숫자
  const codePattern = /^[A-Z0-9]{12}$/;
  if (!codePattern.test(code)) {
    throw GroupValidationException.invalidInviteCodeFormat(code);
  }

  return true;
}

/**
 * 이메일 형식 검증
 *
 * @param {string} email - 이메일 주소
 * @returns {boolean} 검증 성공
 * @throws {GroupValidationException}
 *
 * @example
 * validateEmailFormat('user@example.com'); // true
 */
export function validateEmailFormat(email) {
  if (!email) {
    throw GroupValidationException.emailRequired();
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw GroupValidationException.invalidEmailFormat(email);
  }

  return true;
}

// ============================================
// 4. 요청 검증 (2개)
// ============================================

/**
 * 그룹 가입 요청 검증
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @returns {boolean} 검증 성공
 * @throws {GroupValidationException}
 *
 * @example
 * validateJoinRequest('group-123', 'user-456'); // true
 */
export function validateJoinRequest(groupId, userId) {
  if (!groupId) {
    throw GroupValidationException.groupIdRequired();
  }

  if (!userId) {
    throw GroupValidationException.userIdRequired();
  }

  return true;
}

/**
 * 그룹 탈퇴 요청 검증
 *
 * @param {string} groupId - 그룹 ID
 * @param {string} userId - 사용자 ID
 * @param {string} memberRole - 멤버 역할
 * @returns {boolean} 검증 성공
 * @throws {GroupValidationException|GroupPermissionException}
 *
 * @example
 * validateLeaveRequest('group-123', 'user-456', 'MEMBER'); // true
 */
export function validateLeaveRequest(groupId, userId, memberRole) {
  if (!groupId) {
    throw GroupValidationException.groupIdRequired();
  }

  if (!userId) {
    throw GroupValidationException.userIdRequired();
  }

  // OWNER는 탈퇴 불가
  if (memberRole === 'OWNER') {
    throw GroupPermissionException.ownerCannotLeave();
  }

  return true;
}

