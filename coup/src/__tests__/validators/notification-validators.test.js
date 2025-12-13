/**
 * @jest-environment node
 */

/**
 * Notification Validators 테스트
 *
 * @description notification-validators.js의 모든 검증 함수 테스트
 */

import {
  validateNotificationType,
  validateNotificationMessage,
  validateUserId,
  validateNotificationId,
  validateNotificationData,
  validateStudyId,
  validateStudyName,
  validateIsRead,
  validatePage,
  validateLimit,
  validateNotificationCreateData,
  validateNotificationQueryParams,
  validateBulkNotificationData,
  validateNotificationOwnership,
  validateSession,
  NOTIFICATION_TYPES,
  NOTIFICATION_CONSTANTS
} from '@/lib/validators/notification-validators';

import {
  NotificationValidationException,
  NotificationPermissionException,
  NotificationBusinessException
} from '@/lib/exceptions/notification';

describe('Notification Validators', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // ============================================
  // 1. 알림 타입 검증 테스트
  // ============================================
  describe('validateNotificationType', () => {
    it('유효한 알림 타입이면 true 반환', () => {
      expect(validateNotificationType('JOIN_APPROVED')).toBe(true);
      expect(validateNotificationType('NOTICE')).toBe(true);
      expect(validateNotificationType('FILE')).toBe(true);
      expect(validateNotificationType('EVENT')).toBe(true);
      expect(validateNotificationType('TASK')).toBe(true);
      expect(validateNotificationType('MEMBER')).toBe(true);
      expect(validateNotificationType('KICK')).toBe(true);
      expect(validateNotificationType('CHAT')).toBe(true);
    });

    it('소문자도 유효하게 처리', () => {
      expect(validateNotificationType('join_approved')).toBe(true);
      expect(validateNotificationType('notice')).toBe(true);
    });

    it('타입이 없으면 예외 발생', () => {
      expect(() => validateNotificationType(null)).toThrow(NotificationValidationException);
      expect(() => validateNotificationType(undefined)).toThrow(NotificationValidationException);
      expect(() => validateNotificationType('')).toThrow(NotificationValidationException);
    });

    it('유효하지 않은 타입이면 예외 발생', () => {
      expect(() => validateNotificationType('INVALID_TYPE')).toThrow(NotificationValidationException);
      expect(() => validateNotificationType('UNKNOWN')).toThrow(NotificationValidationException);
    });

    it('문자열이 아니면 예외 발생', () => {
      expect(() => validateNotificationType(123)).toThrow(NotificationValidationException);
      expect(() => validateNotificationType({})).toThrow(NotificationValidationException);
    });
  });

  // ============================================
  // 2. 알림 메시지 검증 테스트
  // ============================================
  describe('validateNotificationMessage', () => {
    it('유효한 메시지면 true 반환', () => {
      expect(validateNotificationMessage('알림 메시지입니다.')).toBe(true);
      expect(validateNotificationMessage('a')).toBe(true);
    });

    it('메시지가 없으면 예외 발생', () => {
      expect(() => validateNotificationMessage(null)).toThrow(NotificationValidationException);
      expect(() => validateNotificationMessage(undefined)).toThrow(NotificationValidationException);
      expect(() => validateNotificationMessage('')).toThrow(NotificationValidationException);
    });

    it('메시지가 너무 길면 예외 발생', () => {
      const longMessage = 'a'.repeat(501);
      expect(() => validateNotificationMessage(longMessage)).toThrow(NotificationValidationException);
    });

    it('공백만 있는 메시지는 예외 발생', () => {
      expect(() => validateNotificationMessage('   ')).toThrow(NotificationValidationException);
    });
  });

  // ============================================
  // 3. 사용자 ID 검증 테스트
  // ============================================
  describe('validateUserId', () => {
    it('유효한 사용자 ID면 true 반환', () => {
      expect(validateUserId('user123')).toBe(true);
      expect(validateUserId('cuid12345')).toBe(true);
    });

    it('사용자 ID가 없으면 예외 발생', () => {
      expect(() => validateUserId(null)).toThrow(NotificationValidationException);
      expect(() => validateUserId(undefined)).toThrow(NotificationValidationException);
      expect(() => validateUserId('')).toThrow(NotificationValidationException);
    });

    it('공백만 있는 ID는 예외 발생', () => {
      expect(() => validateUserId('   ')).toThrow(NotificationValidationException);
    });
  });

  // ============================================
  // 4. 알림 ID 검증 테스트
  // ============================================
  describe('validateNotificationId', () => {
    it('유효한 알림 ID면 true 반환', () => {
      expect(validateNotificationId('notification123')).toBe(true);
      expect(validateNotificationId('cuid12345')).toBe(true);
    });

    it('알림 ID가 없으면 예외 발생', () => {
      expect(() => validateNotificationId(null)).toThrow(NotificationValidationException);
      expect(() => validateNotificationId(undefined)).toThrow(NotificationValidationException);
      expect(() => validateNotificationId('')).toThrow(NotificationValidationException);
    });
  });

  // ============================================
  // 5. 알림 데이터 검증 테스트
  // ============================================
  describe('validateNotificationData', () => {
    it('유효한 데이터면 true 반환', () => {
      expect(validateNotificationData({ studyId: 'study123' })).toBe(true);
      expect(validateNotificationData(null)).toBe(true);
      expect(validateNotificationData(undefined)).toBe(true);
    });

    it('유효한 JSON 문자열이면 true 반환', () => {
      expect(validateNotificationData('{"key": "value"}')).toBe(true);
    });

    it('유효하지 않은 JSON 문자열이면 예외 발생', () => {
      expect(() => validateNotificationData('invalid json')).toThrow(NotificationValidationException);
    });

    it('데이터가 너무 크면 예외 발생', () => {
      const largeData = { key: 'a'.repeat(15000) };
      expect(() => validateNotificationData(largeData)).toThrow(NotificationValidationException);
    });
  });

  // ============================================
  // 6. 스터디 ID 검증 테스트
  // ============================================
  describe('validateStudyId', () => {
    it('유효한 스터디 ID면 true 반환', () => {
      expect(validateStudyId('study123')).toBe(true);
    });

    it('스터디 ID가 없어도 true 반환 (선택사항)', () => {
      expect(validateStudyId(null)).toBe(true);
      expect(validateStudyId(undefined)).toBe(true);
    });

    it('공백만 있는 ID는 예외 발생', () => {
      expect(() => validateStudyId('   ')).toThrow(NotificationValidationException);
    });
  });

  // ============================================
  // 7. 스터디 이름 검증 테스트
  // ============================================
  describe('validateStudyName', () => {
    it('유효한 스터디 이름이면 true 반환', () => {
      expect(validateStudyName('알고리즘 스터디')).toBe(true);
    });

    it('스터디 이름이 없어도 true 반환 (선택사항)', () => {
      expect(validateStudyName(null)).toBe(true);
      expect(validateStudyName(undefined)).toBe(true);
    });

    it('스터디 이름이 너무 길면 예외 발생', () => {
      const longName = 'a'.repeat(101);
      expect(() => validateStudyName(longName)).toThrow(NotificationValidationException);
    });
  });

  // ============================================
  // 8. 읽음 상태 검증 테스트
  // ============================================
  describe('validateIsRead', () => {
    it('boolean 값이면 true 반환', () => {
      expect(validateIsRead(true)).toBe(true);
      expect(validateIsRead(false)).toBe(true);
    });

    it('값이 없어도 true 반환', () => {
      expect(validateIsRead(null)).toBe(true);
      expect(validateIsRead(undefined)).toBe(true);
    });

    it('boolean이 아니면 예외 발생', () => {
      expect(() => validateIsRead('true')).toThrow(NotificationValidationException);
      expect(() => validateIsRead(1)).toThrow(NotificationValidationException);
    });
  });

  // ============================================
  // 9. 페이지 번호 검증 테스트
  // ============================================
  describe('validatePage', () => {
    it('유효한 페이지 번호면 해당 숫자 반환', () => {
      expect(validatePage(1)).toBe(1);
      expect(validatePage(10)).toBe(10);
      expect(validatePage('5')).toBe(5);
    });

    it('값이 없으면 기본값 1 반환', () => {
      expect(validatePage(null)).toBe(1);
      expect(validatePage(undefined)).toBe(1);
    });

    it('0 이하의 값이면 예외 발생', () => {
      expect(() => validatePage(0)).toThrow(NotificationValidationException);
      expect(() => validatePage(-1)).toThrow(NotificationValidationException);
    });

    it('숫자가 아니면 예외 발생', () => {
      expect(() => validatePage('abc')).toThrow(NotificationValidationException);
    });
  });

  // ============================================
  // 10. Limit 검증 테스트
  // ============================================
  describe('validateLimit', () => {
    it('유효한 limit이면 해당 숫자 반환', () => {
      expect(validateLimit(20)).toBe(20);
      expect(validateLimit(100)).toBe(100);
      expect(validateLimit('50')).toBe(50);
    });

    it('값이 없으면 기본값 20 반환', () => {
      expect(validateLimit(null)).toBe(20);
      expect(validateLimit(undefined)).toBe(20);
    });

    it('범위를 벗어나면 예외 발생', () => {
      expect(() => validateLimit(0)).toThrow(NotificationValidationException);
      expect(() => validateLimit(101)).toThrow(NotificationValidationException);
    });
  });

  // ============================================
  // 11. 알림 생성 데이터 통합 검증 테스트
  // ============================================
  describe('validateNotificationCreateData', () => {
    it('유효한 데이터면 검증된 데이터 반환', () => {
      const data = {
        userId: 'user123',
        type: 'JOIN_APPROVED',
        message: '스터디 가입이 승인되었습니다.'
      };

      const result = validateNotificationCreateData(data);

      expect(result.userId).toBe('user123');
      expect(result.type).toBe('JOIN_APPROVED');
      expect(result.message).toBe('스터디 가입이 승인되었습니다.');
    });

    it('선택 필드도 포함하여 반환', () => {
      const data = {
        userId: 'user123',
        type: 'NOTICE',
        message: '새 공지사항',
        studyId: 'study123',
        studyName: '알고리즘 스터디',
        studyEmoji: '📚'
      };

      const result = validateNotificationCreateData(data);

      expect(result.studyId).toBe('study123');
      expect(result.studyName).toBe('알고리즘 스터디');
      expect(result.studyEmoji).toBe('📚');
    });

    it('데이터가 없으면 예외 발생', () => {
      expect(() => validateNotificationCreateData(null)).toThrow(NotificationValidationException);
      expect(() => validateNotificationCreateData(undefined)).toThrow(NotificationValidationException);
    });

    it('필수 필드가 없으면 예외 발생', () => {
      expect(() => validateNotificationCreateData({ type: 'NOTICE', message: 'msg' })).toThrow(NotificationValidationException);
      expect(() => validateNotificationCreateData({ userId: 'user', message: 'msg' })).toThrow(NotificationValidationException);
      expect(() => validateNotificationCreateData({ userId: 'user', type: 'NOTICE' })).toThrow(NotificationValidationException);
    });
  });

  // ============================================
  // 12. 쿼리 파라미터 검증 테스트
  // ============================================
  describe('validateNotificationQueryParams', () => {
    it('유효한 파라미터면 검증된 파라미터 반환', () => {
      const params = {
        page: '2',
        limit: '30',
        isRead: 'true',
        type: 'NOTICE'
      };

      const result = validateNotificationQueryParams(params);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(30);
      expect(result.isRead).toBe(true);
      expect(result.type).toBe('NOTICE');
    });

    it('기본값 적용', () => {
      const result = validateNotificationQueryParams({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('isRead false 처리', () => {
      const result = validateNotificationQueryParams({ isRead: 'false' });
      expect(result.isRead).toBe(false);
    });
  });

  // ============================================
  // 13. 대량 알림 데이터 검증 테스트
  // ============================================
  describe('validateBulkNotificationData', () => {
    it('유효한 데이터면 검증된 데이터 반환', () => {
      const userIds = ['user1', 'user2'];
      const notificationData = {
        type: 'NOTICE',
        message: '공지사항'
      };

      const result = validateBulkNotificationData(userIds, notificationData);

      expect(result.userIds).toEqual(['user1', 'user2']);
      expect(result.notificationData.type).toBe('NOTICE');
    });

    it('userIds가 빈 배열이면 예외 발생', () => {
      expect(() => validateBulkNotificationData([], { type: 'NOTICE', message: 'msg' })).toThrow(NotificationValidationException);
    });

    it('userIds가 배열이 아니면 예외 발생', () => {
      expect(() => validateBulkNotificationData('user1', { type: 'NOTICE', message: 'msg' })).toThrow(NotificationValidationException);
    });
  });

  // ============================================
  // 14. 알림 소유권 검증 테스트
  // ============================================
  describe('validateNotificationOwnership', () => {
    it('소유자가 일치하면 true 반환', () => {
      const notification = { id: 'n1', userId: 'user123' };
      expect(validateNotificationOwnership(notification, 'user123')).toBe(true);
    });

    it('알림이 없으면 예외 발생', () => {
      expect(() => validateNotificationOwnership(null, 'user123')).toThrow(NotificationBusinessException);
    });

    it('userId가 없으면 예외 발생', () => {
      const notification = { id: 'n1', userId: 'user123' };
      expect(() => validateNotificationOwnership(notification, null)).toThrow(NotificationPermissionException);
    });

    it('소유자가 일치하지 않으면 예외 발생', () => {
      const notification = { id: 'n1', userId: 'user123' };
      expect(() => validateNotificationOwnership(notification, 'user456')).toThrow(NotificationPermissionException);
    });
  });

  // ============================================
  // 15. 세션 검증 테스트
  // ============================================
  describe('validateSession', () => {
    it('유효한 세션이면 사용자 정보 반환', () => {
      const session = { user: { id: 'user123', name: 'Test User' } };
      const result = validateSession(session);
      expect(result.id).toBe('user123');
    });

    it('세션이 없으면 예외 발생', () => {
      expect(() => validateSession(null)).toThrow(NotificationPermissionException);
      expect(() => validateSession(undefined)).toThrow(NotificationPermissionException);
    });

    it('user가 없으면 예외 발생', () => {
      expect(() => validateSession({})).toThrow(NotificationPermissionException);
    });

    it('user.id가 없으면 예외 발생', () => {
      expect(() => validateSession({ user: {} })).toThrow(NotificationPermissionException);
    });
  });

  // ============================================
  // 16. 상수 Export 테스트
  // ============================================
  describe('Constants', () => {
    it('NOTIFICATION_TYPES가 정의되어 있음', () => {
      expect(NOTIFICATION_TYPES).toBeDefined();
      expect(NOTIFICATION_TYPES).toContain('JOIN_APPROVED');
      expect(NOTIFICATION_TYPES).toContain('NOTICE');
    });

    it('NOTIFICATION_CONSTANTS가 정의되어 있음', () => {
      expect(NOTIFICATION_CONSTANTS).toBeDefined();
      expect(NOTIFICATION_CONSTANTS.MESSAGE_MAX_LENGTH).toBe(500);
      expect(NOTIFICATION_CONSTANTS.LIMIT_MAX).toBe(100);
    });
  });
});
