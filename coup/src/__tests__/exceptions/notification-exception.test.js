/**
 * @jest-environment node
 */

/**
 * Notification Exception Classes 테스트
 *
 * @description NotificationException, NotificationValidationException,
 *              NotificationPermissionException, NotificationBusinessException 테스트
 */

import NotificationException from '@/lib/exceptions/notification/NotificationException';
import NotificationValidationException from '@/lib/exceptions/notification/NotificationValidationException';
import NotificationPermissionException from '@/lib/exceptions/notification/NotificationPermissionException';
import NotificationBusinessException from '@/lib/exceptions/notification/NotificationBusinessException';

describe('Notification Exception Classes', () => {
  // ============================================
  // NotificationException 테스트
  // ============================================
  describe('NotificationException', () => {
    describe('constructor', () => {
      it('기본 속성이 올바르게 설정됨', () => {
        const error = new NotificationException('에러', 'NOTI-000', 400, 'medium', {});

        expect(error.name).toBe('NotificationException');
        expect(error.message).toBe('에러');
        expect(error.code).toBe('NOTI-000');
        expect(error.statusCode).toBe(400);
        expect(error.domain).toBe('NOTIFICATION');
        expect(error.retryable).toBe(false);
        expect(error.timestamp).toBeDefined();
      });
    });

    describe('toJSON', () => {
      it('JSON 변환이 올바르게 동작', () => {
        const error = new NotificationException('에러', 'NOTI-000', 400, 'medium', {});
        const json = error.toJSON();

        expect(json.name).toBe('NotificationException');
        expect(json.message).toBe('에러');
        expect(json.code).toBe('NOTI-000');
        expect(json.statusCode).toBe(400);
        expect(json.domain).toBe('NOTIFICATION');
      });
    });

    describe('static methods', () => {
      it('typeRequired - NOTI-001', () => {
        const error = NotificationException.typeRequired();
        expect(error.code).toBe('NOTI-001');
        expect(error.statusCode).toBe(400);
      });

      it('invalidType - NOTI-002', () => {
        const error = NotificationException.invalidType('UNKNOWN');
        expect(error.code).toBe('NOTI-002');
        expect(error.message).toContain('UNKNOWN');
      });

      it('messageRequired - NOTI-005', () => {
        const error = NotificationException.messageRequired();
        expect(error.code).toBe('NOTI-005');
      });

      it('authenticationRequired - NOTI-016', () => {
        const error = NotificationException.authenticationRequired();
        expect(error.code).toBe('NOTI-016');
        expect(error.statusCode).toBe(401);
      });

      it('notificationNotFound - NOTI-024', () => {
        const error = NotificationException.notificationNotFound('n123');
        expect(error.code).toBe('NOTI-024');
        expect(error.statusCode).toBe(404);
      });

      it('unexpectedError - NOTI-040', () => {
        const error = NotificationException.unexpectedError('테스트');
        expect(error.code).toBe('NOTI-040');
        expect(error.statusCode).toBe(500);
      });
    });
  });

  // ============================================
  // NotificationValidationException 테스트
  // ============================================
  describe('NotificationValidationException', () => {
    describe('알림 타입 관련 에러', () => {
      it('typeRequired - NOTI-VAL-001', () => {
        const error = NotificationValidationException.typeRequired();
        expect(error.code).toBe('NOTI-VAL-001');
        expect(error.statusCode).toBe(400);
        expect(error.name).toBe('NotificationValidationException');
      });

      it('invalidType - NOTI-VAL-002', () => {
        const error = NotificationValidationException.invalidType('UNKNOWN');
        expect(error.code).toBe('NOTI-VAL-002');
        expect(error.message).toContain('UNKNOWN');
      });
    });

    describe('메시지 관련 에러', () => {
      it('messageRequired - NOTI-VAL-003', () => {
        const error = NotificationValidationException.messageRequired();
        expect(error.code).toBe('NOTI-VAL-003');
      });

      it('messageTooShort - NOTI-VAL-004', () => {
        const error = NotificationValidationException.messageTooShort(10);
        expect(error.code).toBe('NOTI-VAL-004');
        expect(error.message).toContain('10');
      });

      it('messageTooLong - NOTI-VAL-005', () => {
        const error = NotificationValidationException.messageTooLong(500);
        expect(error.code).toBe('NOTI-VAL-005');
        expect(error.message).toContain('500');
      });
    });

    describe('ID 관련 에러', () => {
      it('userIdRequired - NOTI-VAL-006', () => {
        const error = NotificationValidationException.userIdRequired();
        expect(error.code).toBe('NOTI-VAL-006');
      });

      it('invalidUserId - NOTI-VAL-007', () => {
        const error = NotificationValidationException.invalidUserId('bad-id');
        expect(error.code).toBe('NOTI-VAL-007');
      });

      it('notificationIdRequired - NOTI-VAL-008', () => {
        const error = NotificationValidationException.notificationIdRequired();
        expect(error.code).toBe('NOTI-VAL-008');
      });

      it('invalidNotificationId - NOTI-VAL-009', () => {
        const error = NotificationValidationException.invalidNotificationId('bad-id');
        expect(error.code).toBe('NOTI-VAL-009');
      });
    });

    describe('페이지네이션 에러', () => {
      it('invalidPage - NOTI-VAL-012', () => {
        const error = NotificationValidationException.invalidPage(-1);
        expect(error.code).toBe('NOTI-VAL-012');
      });

      it('invalidLimit - NOTI-VAL-013', () => {
        const error = NotificationValidationException.invalidLimit(200);
        expect(error.code).toBe('NOTI-VAL-013');
      });
    });

    describe('데이터 관련 에러', () => {
      it('invalidDataFormat - NOTI-VAL-010', () => {
        const error = NotificationValidationException.invalidDataFormat();
        expect(error.code).toBe('NOTI-VAL-010');
      });

      it('dataTooLarge - NOTI-VAL-011', () => {
        const error = NotificationValidationException.dataTooLarge(10000);
        expect(error.code).toBe('NOTI-VAL-011');
      });
    });
  });

  // ============================================
  // NotificationPermissionException 테스트
  // ============================================
  describe('NotificationPermissionException', () => {
    describe('인증 관련 에러', () => {
      it('authenticationRequired - NOTI-PERM-001 (401)', () => {
        const error = NotificationPermissionException.authenticationRequired();
        expect(error.code).toBe('NOTI-PERM-001');
        expect(error.statusCode).toBe(401);
        expect(error.name).toBe('NotificationPermissionException');
      });

      it('sessionExpired - NOTI-PERM-002 (401)', () => {
        const error = NotificationPermissionException.sessionExpired();
        expect(error.code).toBe('NOTI-PERM-002');
        expect(error.statusCode).toBe(401);
      });

      it('invalidSession - NOTI-PERM-003 (401)', () => {
        const error = NotificationPermissionException.invalidSession();
        expect(error.code).toBe('NOTI-PERM-003');
        expect(error.statusCode).toBe(401);
      });
    });

    describe('권한 관련 에러', () => {
      it('notificationNotOwned - NOTI-PERM-004 (403)', () => {
        const error = NotificationPermissionException.notificationNotOwned('n1');
        expect(error.code).toBe('NOTI-PERM-004');
        expect(error.statusCode).toBe(403);
      });

      it('cannotAccessOthersNotification - NOTI-PERM-005 (403)', () => {
        const error = NotificationPermissionException.cannotAccessOthersNotification('n1');
        expect(error.code).toBe('NOTI-PERM-005');
        expect(error.statusCode).toBe(403);
      });

      it('insufficientPermissionToCreate - NOTI-PERM-006 (403)', () => {
        const error = NotificationPermissionException.insufficientPermissionToCreate();
        expect(error.code).toBe('NOTI-PERM-006');
        expect(error.statusCode).toBe(403);
      });

      it('insufficientPermissionToDelete - NOTI-PERM-009 (403)', () => {
        const error = NotificationPermissionException.insufficientPermissionToDelete();
        expect(error.code).toBe('NOTI-PERM-009');
        expect(error.statusCode).toBe(403);
      });

      it('adminPermissionRequired - NOTI-PERM-010 (403)', () => {
        const error = NotificationPermissionException.adminPermissionRequired();
        expect(error.code).toBe('NOTI-PERM-010');
        expect(error.statusCode).toBe(403);
      });
    });

    describe('사용자 상태 에러', () => {
      it('userSuspended - NOTI-PERM-013 (403)', () => {
        const error = NotificationPermissionException.userSuspended('user1');
        expect(error.code).toBe('NOTI-PERM-013');
        expect(error.statusCode).toBe(403);
      });

      it('userNotActive - NOTI-PERM-014 (403)', () => {
        const error = NotificationPermissionException.userNotActive('user1');
        expect(error.code).toBe('NOTI-PERM-014');
        expect(error.statusCode).toBe(403);
      });
    });
  });

  // ============================================
  // NotificationBusinessException 테스트
  // ============================================
  describe('NotificationBusinessException', () => {
    describe('조회 관련 에러', () => {
      it('notificationNotFound - NOTI-BIZ-001 (404)', () => {
        const error = NotificationBusinessException.notificationNotFound('n123');
        expect(error.code).toBe('NOTI-BIZ-001');
        expect(error.statusCode).toBe(404);
        expect(error.name).toBe('NotificationBusinessException');
      });

      it('notificationAlreadyDeleted - NOTI-BIZ-002 (404)', () => {
        const error = NotificationBusinessException.notificationAlreadyDeleted('n123');
        expect(error.code).toBe('NOTI-BIZ-002');
        expect(error.statusCode).toBe(404);
      });

      it('userNotFound - NOTI-BIZ-017 (404)', () => {
        const error = NotificationBusinessException.userNotFound('user123');
        expect(error.code).toBe('NOTI-BIZ-017');
        expect(error.statusCode).toBe(404);
      });
    });

    describe('읽음 처리 에러', () => {
      it('notificationAlreadyRead - NOTI-BIZ-003', () => {
        const error = NotificationBusinessException.notificationAlreadyRead();
        expect(error.code).toBe('NOTI-BIZ-003');
        expect(error.statusCode).toBe(400);
      });

      it('markAsReadFailed - NOTI-BIZ-004 (500)', () => {
        const error = NotificationBusinessException.markAsReadFailed('n1', 'DB 에러');
        expect(error.code).toBe('NOTI-BIZ-004');
        expect(error.statusCode).toBe(500);
      });

      it('markAllAsReadFailed - NOTI-BIZ-005 (500)', () => {
        const error = NotificationBusinessException.markAllAsReadFailed('timeout');
        expect(error.code).toBe('NOTI-BIZ-005');
        expect(error.statusCode).toBe(500);
      });

      it('noUnreadNotifications - NOTI-BIZ-006', () => {
        const error = NotificationBusinessException.noUnreadNotifications();
        expect(error.code).toBe('NOTI-BIZ-006');
        expect(error.statusCode).toBe(400);
      });
    });

    describe('생성/삭제 에러', () => {
      it('creationFailed - NOTI-BIZ-007 (500)', () => {
        const error = NotificationBusinessException.creationFailed();
        expect(error.code).toBe('NOTI-BIZ-007');
        expect(error.statusCode).toBe(500);
      });

      it('bulkCreationFailed - NOTI-BIZ-008 (500)', () => {
        const error = NotificationBusinessException.bulkCreationFailed(5, 2, 'partial failure');
        expect(error.code).toBe('NOTI-BIZ-008');
        expect(error.statusCode).toBe(500);
      });

      it('duplicateNotification - NOTI-BIZ-009 (409)', () => {
        const error = NotificationBusinessException.duplicateNotification('NOTICE', 'user1');
        expect(error.code).toBe('NOTI-BIZ-009');
        expect(error.statusCode).toBe(409);
      });

      it('deletionFailed - NOTI-BIZ-010 (500)', () => {
        const error = NotificationBusinessException.deletionFailed();
        expect(error.code).toBe('NOTI-BIZ-010');
        expect(error.statusCode).toBe(500);
      });

      it('bulkDeletionFailed - NOTI-BIZ-011 (500)', () => {
        const error = NotificationBusinessException.bulkDeletionFailed(3, 1, 'partial failure');
        expect(error.code).toBe('NOTI-BIZ-011');
        expect(error.statusCode).toBe(500);
      });
    });

    describe('시스템 에러', () => {
      it('databaseError - NOTI-BIZ-019 (500)', () => {
        const error = NotificationBusinessException.databaseError('query', 'timeout');
        expect(error.code).toBe('NOTI-BIZ-019');
        expect(error.statusCode).toBe(500);
      });

      it('unexpectedError - NOTI-BIZ-020 (500)', () => {
        const error = NotificationBusinessException.unexpectedError('Test message');
        expect(error.code).toBe('NOTI-BIZ-020');
        expect(error.statusCode).toBe(500);
      });

      it('rateLimitExceeded - NOTI-BIZ-021 (429)', () => {
        const error = NotificationBusinessException.rateLimitExceeded(100, '1시간');
        expect(error.code).toBe('NOTI-BIZ-021');
        expect(error.statusCode).toBe(429);
      });

      it('invalidInput - NOTI-BIZ-023', () => {
        const error = NotificationBusinessException.invalidInput('잘못된 입력');
        expect(error.code).toBe('NOTI-BIZ-023');
        expect(error.statusCode).toBe(400);
      });
    });
  });

  // ============================================
  // Error Code Format 검증
  // ============================================
  describe('Error Code Format', () => {
    it('Validation 에러는 NOTI-VAL-xxx 형식', () => {
      const errors = [
        NotificationValidationException.typeRequired(),
        NotificationValidationException.invalidType('test'),
        NotificationValidationException.messageRequired(),
        NotificationValidationException.userIdRequired()
      ];

      errors.forEach(error => {
        expect(error.code).toMatch(/^NOTI-VAL-\d{3}$/);
      });
    });

    it('Permission 에러는 NOTI-PERM-xxx 형식', () => {
      const errors = [
        NotificationPermissionException.authenticationRequired(),
        NotificationPermissionException.sessionExpired(),
        NotificationPermissionException.notificationNotOwned()
      ];

      errors.forEach(error => {
        expect(error.code).toMatch(/^NOTI-PERM-\d{3}$/);
      });
    });

    it('Business 에러는 NOTI-BIZ-xxx 형식', () => {
      const errors = [
        NotificationBusinessException.notificationNotFound('n1'),
        NotificationBusinessException.notificationAlreadyRead(),
        NotificationBusinessException.creationFailed(),
        NotificationBusinessException.databaseError()
      ];

      errors.forEach(error => {
        expect(error.code).toMatch(/^NOTI-BIZ-\d{3}$/);
      });
    });
  });

  // ============================================
  // 상속 관계 검증
  // ============================================
  describe('Inheritance', () => {
    it('NotificationValidationException은 NotificationException을 상속', () => {
      const error = NotificationValidationException.typeRequired();
      expect(error).toBeInstanceOf(NotificationException);
      expect(error).toBeInstanceOf(Error);
    });

    it('NotificationPermissionException은 NotificationException을 상속', () => {
      const error = NotificationPermissionException.authenticationRequired();
      expect(error).toBeInstanceOf(NotificationException);
      expect(error).toBeInstanceOf(Error);
    });

    it('NotificationBusinessException은 NotificationException을 상속', () => {
      const error = NotificationBusinessException.notificationNotFound('n1');
      expect(error).toBeInstanceOf(NotificationException);
      expect(error).toBeInstanceOf(Error);
    });
  });

  // ============================================
  // Category 검증
  // ============================================
  describe('Category', () => {
    it('Validation 에러의 category는 validation', () => {
      const error = NotificationValidationException.typeRequired();
      expect(error.category).toBe('validation');
    });

    it('Permission 에러의 category는 permission', () => {
      const error = NotificationPermissionException.authenticationRequired();
      expect(error.category).toBe('permission');
    });

    it('Business 에러의 category는 business', () => {
      const error = NotificationBusinessException.notificationNotFound('n1');
      expect(error.category).toBe('business');
    });
  });
});
