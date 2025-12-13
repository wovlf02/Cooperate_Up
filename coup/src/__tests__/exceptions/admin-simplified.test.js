/**
 * @jest-environment node
 */

/**
 * AdminException 클래스 통합 테스트
 */

import {
  AdminException,
  AdminValidationException,
  AdminPermissionException,
  AdminBusinessException,
  AdminDatabaseException,
  AdminUserException,
  AdminReportException,
  AdminSettingsException
} from '@/lib/exceptions/admin';

describe('AdminException Tests', () => {
  
  describe('AdminException (Base Class)', () => {
    it('예외 객체가 생성된다', () => {
      const exception = new AdminException('ADMIN-999', 'Test error');
      
      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(AdminException);
      expect(exception.name).toBe('AdminException');
      expect(exception.code).toBe('ADMIN-999');
      expect(exception.message).toBe('Test error');
      expect(exception.timestamp).toBeDefined();
    });

    it('toJSON() 메서드가 동작한다', () => {
      const exception = new AdminException('ADMIN-999', 'Test error');
      const json = exception.toJSON();
      
      expect(json).toHaveProperty('code', 'ADMIN-999');
      expect(json).toHaveProperty('message');
      expect(json).toHaveProperty('statusCode');
      expect(json).toHaveProperty('timestamp');
    });

    it('toResponse() 메서드가 API 응답 형식을 반환한다', () => {
      const exception = new AdminException('ADMIN-999', 'Test error');
      const response = exception.toResponse();
      
      expect(response).toEqual({
        success: false,
        error: {
          code: 'ADMIN-999',
          message: expect.any(String),
          retryable: expect.any(Boolean),
          timestamp: expect.any(String)
        }
      });
    });
  });

  describe('AdminPermissionException', () => {
    it('[ADMIN-001] 관리자 인증 실패', () => {
      const exception = AdminPermissionException.authenticationFailed();
      
      expect(exception.code).toBe('ADMIN-001');
      expect(exception.statusCode).toBe(401);
      expect(exception.securityLevel).toBe('critical');
    });

    it('[ADMIN-002] 관리자 권한 부족', () => {
      const exception = AdminPermissionException.insufficientPermission('USER_DELETE');
      
      expect(exception.code).toBe('ADMIN-002');
      expect(exception.statusCode).toBe(403);
    });

    it('[ADMIN-003] 세션 만료', () => {
      const exception = AdminPermissionException.sessionExpired();
      
      expect(exception.code).toBe('ADMIN-003');
      expect(exception.statusCode).toBe(401);
    });
  });

  describe('AdminUserException', () => {
    it('[ADMIN-021] 사용자를 찾을 수 없음', () => {
      const exception = AdminUserException.userNotFound('user-123');
      
      expect(exception.code).toBe('ADMIN-021');
      expect(exception.statusCode).toBe(404);
      expect(exception.context.userId).toBe('user-123');
    });

    it('[ADMIN-022] 유효하지 않은 상태 변경', () => {
      const exception = AdminUserException.invalidStatusChange('DELETED', 'ACTIVE');
      
      expect(exception.code).toBe('ADMIN-022');
      expect(exception.context.currentStatus).toBe('DELETED');
      expect(exception.context.targetStatus).toBe('ACTIVE');
    });

    it('[ADMIN-024] 이미 정지된 사용자', () => {
      const exception = AdminUserException.userAlreadySuspended('user-1');
      
      expect(exception.code).toBe('ADMIN-024');
      expect(exception.context.userId).toBe('user-1');
    });
  });

  describe('AdminValidationException', () => {
    it('[ADMIN-092] 잘못된 정렬 필드', () => {
      const exception = AdminValidationException.invalidSorting('invalidField', ['name', 'email']);
      
      expect(exception.code).toBe('ADMIN-092');
      expect(exception.statusCode).toBe(400);
      expect(exception.context.sortBy).toBe('invalidField');
      expect(exception.context.validFields).toEqual(['name', 'email']);
    });

    it('[ADMIN-027] 유효하지 않은 정지 기간', () => {
      const exception = AdminValidationException.invalidSuspensionDuration(400);
      
      expect(exception.code).toBe('ADMIN-027');
      expect(exception.context.duration).toBe(400);
    });
  });

  describe('AdminBusinessException', () => {
    it('[ADMIN-025] 자기 자신을 정지할 수 없음', () => {
      const exception = AdminBusinessException.cannotSuspendSelf('admin-1');
      
      expect(exception.code).toBe('ADMIN-025');
      expect(exception.context.adminId).toBe('admin-1');
    });
  });

  describe('AdminDatabaseException', () => {
    it('[ADMIN-086] 데이터베이스 연결 실패', () => {
      const exception = AdminDatabaseException.connectionFailed('Connection refused');
      
      expect(exception.code).toBe('ADMIN-086');
      expect(exception.statusCode).toBe(503);
      expect(exception.retryable).toBe(true);
      expect(exception.severity).toBe('critical');
    });

    it('[ADMIN-088] 쿼리 타임아웃', () => {
      const exception = AdminDatabaseException.queryTimeout('getUsersList', 30000);
      
      expect(exception.code).toBe('ADMIN-088');
      expect(exception.context.queryName).toBe('getUsersList');
      expect(exception.context.timeout).toBe(30000);
      expect(exception.retryable).toBe(true);
    });
  });

  describe('AdminReportException', () => {
    it('[ADMIN-041] 신고를 찾을 수 없음', () => {
      const exception = AdminReportException.reportNotFound('report-1');

      expect(exception.code).toBe('ADMIN-041');
      expect(exception.statusCode).toBe(404);
      expect(exception.context.reportId).toBe('report-1');
    });
  });

  describe('AdminSettingsException', () => {
    it('[ADMIN-071] 설정을 찾을 수 없음', () => {
      const exception = AdminSettingsException.settingNotFound('maintenance_mode');
      
      expect(exception.code).toBe('ADMIN-071');
      expect(exception.statusCode).toBe(404);
      expect(exception.context.settingKey).toBe('maintenance_mode');
    });
  });

  describe('Error Response Format', () => {
    it('모든 예외가 일관된 응답 포맷을 가진다', () => {
      const exceptions = [
        AdminPermissionException.authenticationFailed(),
        AdminUserException.userNotFound('user-1'),
        AdminDatabaseException.connectionFailed('Test reason'),
        AdminReportException.reportNotFound('report-1'),
      ];
      
      exceptions.forEach(ex => {
        const response = ex.toResponse();
        
        expect(response).toHaveProperty('success', false);
        expect(response).toHaveProperty('error');
        expect(response.error).toHaveProperty('code');
        expect(response.error).toHaveProperty('message');
        expect(response.error).toHaveProperty('retryable');
        expect(response.error).toHaveProperty('timestamp');
      });
    });
  });

  describe('Context Information', () => {
    it('예외가 적절한 context를 포함한다', () => {
      const exception = AdminUserException.userNotFound('user-123');
      
      expect(exception.context).toHaveProperty('userId', 'user-123');
    });

    it('context가 toJSON()에 포함된다', () => {
      const exception = AdminUserException.userNotFound('user-123');
      const json = exception.toJSON();
      
      expect(json.context).toHaveProperty('userId', 'user-123');
    });
  });

  describe('Security Levels', () => {
    it('권한 예외는 높은 보안 레벨을 가진다', () => {
      const exception = AdminPermissionException.authenticationFailed();
      
      expect(exception.securityLevel).toBe('critical');
    });

    it('일반 비즈니스 예외는 normal 보안 레벨을 가진다', () => {
      const exception = AdminUserException.userNotFound('user-1');
      
      expect(exception.securityLevel).toBe('normal');
    });
  });

  describe('Retryable Flags', () => {
    it('데이터베이스 타임아웃은 재시도 가능하다', () => {
      const exception = AdminDatabaseException.queryTimeout('operation', 5000);
      
      expect(exception.retryable).toBe(true);
    });

    it('권한 부족은 재시도 불가능하다', () => {
      const exception = AdminPermissionException.insufficientPermission('DELETE');
      
      expect(exception.retryable).toBe(false);
    });
  });

  describe('Severity Levels', () => {
    it('데이터베이스 연결 실패는 critical 심각도를 가진다', () => {
      const exception = AdminDatabaseException.connectionFailed('Test');
      
      expect(exception.severity).toBe('critical');
    });

    it('검증 에러는 low 심각도를 가진다', () => {
      const exception = AdminValidationException.invalidSorting('field', ['valid']);
      
      expect(exception.severity).toBe('low');
    });
  });
});
