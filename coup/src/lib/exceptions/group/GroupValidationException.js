/**
 * Group Validation Exception
 *
 * @description
 * 그룹 입력 검증 예외 처리 클래스 (20개 에러)
 * GROUP-001 ~ GROUP-020
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-03
 */

import GroupException from './GroupException.js';

export default class GroupValidationException extends GroupException {
  constructor(message, code, statusCode = 400, securityLevel = 'medium', context = {}) {
    super(message, code, statusCode, securityLevel, context);
    this.name = 'GroupValidationException';
    this.category = 'validation';
  }

  // ========================================
  // 그룹 이름 검증 (5개)
  // ========================================

  static nameRequired() {
    return GroupException.nameRequired();
  }

  static nameTooShort(minLength = 2) {
    return GroupException.nameTooShort(minLength);
  }

  static nameTooLong(maxLength = 50) {
    return GroupException.nameTooLong(maxLength);
  }

  static nameDuplicate(name) {
    return GroupException.nameDuplicate(name);
  }

  static nameInvalidCharacters() {
    return GroupException.nameInvalidCharacters();
  }

  // ========================================
  // 설명 검증 (3개)
  // ========================================

  static descriptionRequired() {
    return GroupException.descriptionRequired();
  }

  static descriptionTooShort(minLength = 10) {
    return GroupException.descriptionTooShort(minLength);
  }

  static descriptionTooLong(maxLength = 500) {
    return GroupException.descriptionTooLong(maxLength);
  }

  // ========================================
  // 카테고리 검증 (3개)
  // ========================================

  static categoryRequired() {
    return GroupException.categoryRequired();
  }

  static categoryInvalid(category) {
    return GroupException.categoryInvalid(category);
  }

  static invalidCategory(category, validCategories = []) {
    return GroupException.categoryInvalid(category);
  }

  static categoryNotFound(category) {
    return GroupException.categoryNotFound(category);
  }

  // ========================================
  // 정원 검증 (4개)
  // ========================================

  static capacityRequired() {
    return GroupException.capacityRequired();
  }

  static capacityTooSmall(minCapacity = 2) {
    return GroupException.capacityTooSmall(minCapacity);
  }

  static capacityTooLarge(maxCapacity = 100) {
    return GroupException.capacityTooLarge(maxCapacity);
  }

  static capacityBelowCurrentMembers(capacity, currentCount) {
    return GroupException.capacityBelowCurrentMembers(capacity, currentCount);
  }

  // ========================================
  // 기타 검증 (5개)
  // ========================================

  static visibilityRequired() {
    return GroupException.visibilityRequired();
  }

  static visibilityInvalidType() {
    return GroupException.visibilityRequired();
  }

  static tooManyTags(maxTags = 10) {
    return GroupException.tooManyTags(maxTags);
  }

  static tagTooLong(tag, maxLength = 20) {
    return GroupException.tagTooLong(tag, maxLength);
  }

  static invalidImageFormat(format) {
    return GroupException.invalidImageFormat(format);
  }

  static imageTooLarge(size, maxSize = 5) {
    return GroupException.imageTooLarge(size, maxSize);
  }

  // ========================================
  // 초대 코드 검증 (2개)
  // ========================================

  static inviteCodeRequired() {
    return GroupException.inviteCodeRequired();
  }

  static invalidInviteCodeFormat(code) {
    return GroupException.invalidInviteCodeFormat(code);
  }

  // ========================================
  // 이메일 검증 (2개)
  // ========================================

  static emailRequired() {
    return GroupException.emailRequired();
  }

  static invalidEmailFormat(email) {
    return GroupException.invalidEmailFormat(email);
  }

  // ========================================
  // 역할 및 상태 검증 (2개)
  // ========================================

  static roleRequired() {
    return GroupException.roleRequired();
  }

  static invalidStatus(status, validStatuses = []) {
    return GroupException.invalidStatus(status, validStatuses);
  }

  static statusRequired() {
    return GroupException.roleRequired(); // status와 role은 유사한 validation
  }

  // ========================================
  // 중복 검증 (1개)
  // ========================================

  static groupNameExists(name) {
    return new GroupValidationException(
      `이미 존재하는 그룹 이름입니다: ${name}`,
      'GROUP-NAME-EXISTS',
      409,
      'low',
      { name }
    );
  }
}

