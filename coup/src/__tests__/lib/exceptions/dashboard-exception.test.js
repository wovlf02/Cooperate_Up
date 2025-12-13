/**
 * dashboard-exception.test.js
 *
 * Dashboard Exception 클래스 테스트
 *
 * @module __tests__/lib/exceptions/dashboard-exception.test.js
 * @author CoUp Team
 * @created 2025-12-04
 */

import DashboardException from '@/lib/exceptions/dashboard/DashboardException';
import DashboardValidationException from '@/lib/exceptions/dashboard/DashboardValidationException';
import DashboardPermissionException from '@/lib/exceptions/dashboard/DashboardPermissionException';
import DashboardBusinessException from '@/lib/exceptions/dashboard/DashboardBusinessException';

describe('DashboardException 클래스', () => {
  // ============================================
  // 기본 예외 구조 테스트
  // ============================================

  describe('기본 예외 구조', () => {
    it('DashboardException 인스턴스를 올바르게 생성해야 함', () => {
      const error = new DashboardException('Test error', 'DASH-TEST', 400);
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DashboardException);
      expect(error.code).toBe('DASH-TEST');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
    });

    it('기본 상태 코드는 400이어야 함', () => {
      const error = new DashboardException('Test error', 'DASH-TEST');
      expect(error.statusCode).toBe(400);
    });

    it('name 속성이 "DashboardException"이어야 함', () => {
      const error = new DashboardException('Test error', 'DASH-TEST');
      expect(error.name).toBe('DashboardException');
    });

    it('toJSON 메서드가 올바르게 작동해야 함', () => {
      const error = new DashboardException('Test error', 'DASH-TEST', 400);
      const json = error.toJSON();
      
      expect(json.name).toBe('DashboardException');
      expect(json.code).toBe('DASH-TEST');
      expect(json.message).toBe('Test error');
      expect(json.statusCode).toBe(400);
    });
  });

  // ============================================
  // DashboardException 정적 메서드 테스트
  // ============================================

  describe('DashboardException 정적 메서드', () => {
    // A. 인증 관련
    it('authenticationRequired() - 인증 필요 에러', () => {
      const error = DashboardException.authenticationRequired();
      
      expect(error.code).toBe('DASH-001');
      expect(error.statusCode).toBe(401);
    });

    it('sessionExpired() - 세션 만료 에러', () => {
      const error = DashboardException.sessionExpired();
      
      expect(error.code).toBe('DASH-002');
      expect(error.statusCode).toBe(401);
    });

    it('invalidSession() - 유효하지 않은 세션 에러', () => {
      const error = DashboardException.invalidSession();
      
      expect(error.code).toBe('DASH-003');
      expect(error.statusCode).toBe(401);
    });

    it('tokenExpired() - 토큰 만료 에러', () => {
      const error = DashboardException.tokenExpired();
      
      expect(error.code).toBe('DASH-004');
      expect(error.statusCode).toBe(401);
    });

    // B. 사용자 관련
    it('userIdRequired() - 사용자 ID 필수 에러', () => {
      const error = DashboardException.userIdRequired();
      
      expect(error.code).toBe('DASH-005');
      expect(error.statusCode).toBe(400);
    });

    it('invalidUserId() - 유효하지 않은 사용자 ID 에러', () => {
      const error = DashboardException.invalidUserId('invalid-id');
      
      expect(error.code).toBe('DASH-006');
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('invalid-id');
    });

    it('userNotFound() - 사용자 없음 에러', () => {
      const error = DashboardException.userNotFound('user-123');
      
      expect(error.code).toBe('DASH-007');
      expect(error.statusCode).toBe(404);
    });

    it('userSuspended() - 정지된 계정 에러', () => {
      const error = DashboardException.userSuspended('user-123');
      
      expect(error.code).toBe('DASH-008');
      expect(error.statusCode).toBe(403);
    });

    // C. 날짜 범위 관련
    it('dateRangeRequired() - 날짜 범위 필수 에러', () => {
      const error = DashboardException.dateRangeRequired();
      
      expect(error.code).toBe('DASH-009');
      expect(error.statusCode).toBe(400);
    });

    it('invalidDateRange() - 유효하지 않은 날짜 범위 에러', () => {
      const error = DashboardException.invalidDateRange('2025-12-31', '2025-01-01');
      
      expect(error.code).toBe('DASH-010');
      expect(error.statusCode).toBe(400);
    });

    it('invalidDateFormat() - 잘못된 날짜 형식 에러', () => {
      const error = DashboardException.invalidDateFormat('invalid-date');
      
      expect(error.code).toBe('DASH-011');
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('invalid-date');
    });

    it('dateRangeTooLarge() - 날짜 범위 초과 에러', () => {
      const error = DashboardException.dateRangeTooLarge(365);
      
      expect(error.code).toBe('DASH-012');
      expect(error.statusCode).toBe(400);
    });

    // D. 위젯 관련
    it('widgetIdRequired() - 위젯 ID 필수 에러', () => {
      const error = DashboardException.widgetIdRequired();
      
      expect(error.code).toBe('DASH-015');
      expect(error.statusCode).toBe(400);
    });

    it('widgetNotFound() - 위젯 없음 에러', () => {
      const error = DashboardException.widgetNotFound('widget-123');
      
      expect(error.code).toBe('DASH-017');
      expect(error.statusCode).toBe(404);
    });

    it('widgetTypeRequired() - 위젯 타입 필수 에러', () => {
      const error = DashboardException.widgetTypeRequired();
      
      expect(error.code).toBe('DASH-018');
      expect(error.statusCode).toBe(400);
    });

    it('invalidWidgetType() - 유효하지 않은 위젯 타입 에러', () => {
      const error = DashboardException.invalidWidgetType('INVALID_TYPE');
      
      expect(error.code).toBe('DASH-019');
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('INVALID_TYPE');
    });

    it('maxWidgetsExceeded() - 위젯 수 초과 에러', () => {
      const error = DashboardException.maxWidgetsExceeded(10);
      
      expect(error.code).toBe('DASH-022');
      expect(error.statusCode).toBe(400);
    });

    // E. 통계 관련
    it('statisticsTypeRequired() - 통계 타입 필수 에러', () => {
      const error = DashboardException.statisticsTypeRequired();
      
      expect(error.code).toBe('DASH-023');
      expect(error.statusCode).toBe(400);
    });

    it('invalidStatisticsType() - 유효하지 않은 통계 타입 에러', () => {
      const error = DashboardException.invalidStatisticsType('INVALID_TYPE');
      
      expect(error.code).toBe('DASH-024');
      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('INVALID_TYPE');
    });

    it('statisticsFetchFailed() - 통계 조회 실패 에러', () => {
      const error = DashboardException.statisticsFetchFailed('STUDY', 'DB Error');
      
      expect(error.code).toBe('DASH-025');
      expect(error.statusCode).toBe(500);
    });

    it('noStatisticsData() - 통계 데이터 없음 에러', () => {
      const error = DashboardException.noStatisticsData();
      
      expect(error.code).toBe('DASH-026');
      expect(error.statusCode).toBe(404);
    });

    // F. 대시보드 데이터 관련
    it('dashboardDataFetchFailed() - 대시보드 데이터 조회 실패 에러', () => {
      const error = DashboardException.dashboardDataFetchFailed('DB Error');
      
      expect(error.code).toBe('DASH-029');
      expect(error.statusCode).toBe(500);
    });

    it('recentActivitiesFetchFailed() - 최근 활동 조회 실패 에러', () => {
      const error = DashboardException.recentActivitiesFetchFailed('DB Error');
      
      expect(error.code).toBe('DASH-030');
      expect(error.statusCode).toBe(500);
    });

    // G. 페이지네이션 및 기타
    it('invalidPage() - 유효하지 않은 페이지 에러', () => {
      const error = DashboardException.invalidPage(-1);
      
      expect(error.code).toBe('DASH-035');
      expect(error.statusCode).toBe(400);
    });

    it('invalidLimit() - 유효하지 않은 limit 에러', () => {
      const error = DashboardException.invalidLimit(500);
      
      expect(error.code).toBe('DASH-036');
      expect(error.statusCode).toBe(400);
    });

    it('databaseError() - 데이터베이스 에러', () => {
      const error = DashboardException.databaseError('getDashboard', 'Connection Failed');
      
      expect(error.code).toBe('DASH-038');
      expect(error.statusCode).toBe(500);
    });

    it('serviceUnavailable() - 서비스 불가 에러', () => {
      const error = DashboardException.serviceUnavailable('Dashboard');
      
      expect(error.code).toBe('DASH-040');
      expect(error.statusCode).toBe(503);
    });
  });

  // ============================================
  // DashboardValidationException 테스트
  // ============================================

  describe('DashboardValidationException', () => {
    it('인스턴스 생성', () => {
      const error = new DashboardValidationException('Validation error', 'DASH-VAL-001', 400);
      
      expect(error).toBeInstanceOf(DashboardValidationException);
      expect(error.name).toBe('DashboardValidationException');
    });

    it('dateRequired() - 날짜 필수 에러', () => {
      const error = DashboardValidationException.dateRequired('startDate');
      
      expect(error.code).toBe('DASH-VAL-001');
      expect(error.statusCode).toBe(400);
    });

    it('invalidDateFormat() - 잘못된 날짜 형식 에러', () => {
      const error = DashboardValidationException.invalidDateFormat('invalid-date');
      
      expect(error.code).toBe('DASH-VAL-002');
      expect(error.statusCode).toBe(400);
    });

    it('invalidDateRange() - 유효하지 않은 날짜 범위', () => {
      const error = DashboardValidationException.invalidDateRange('2025-12-31', '2025-01-01');
      
      expect(error.code).toBe('DASH-VAL-003');
      expect(error.statusCode).toBe(400);
    });

    it('widgetTypeRequired() - 위젯 타입 필수', () => {
      const error = DashboardValidationException.widgetTypeRequired();
      
      expect(error.code).toBe('DASH-VAL-006');
      expect(error.statusCode).toBe(400);
    });

    it('invalidWidgetType() - 유효하지 않은 위젯 타입', () => {
      const error = DashboardValidationException.invalidWidgetType('INVALID', ['TYPE1', 'TYPE2']);
      
      expect(error.code).toBe('DASH-VAL-007');
      expect(error.statusCode).toBe(400);
    });

    it('invalidPageValue() - 페이지 값 오류', () => {
      const error = DashboardValidationException.invalidPageValue(-1);
      
      expect(error.code).toBe('DASH-VAL-015');
      expect(error.statusCode).toBe(400);
    });

    it('invalidLimitValue() - limit 값 오류', () => {
      const error = DashboardValidationException.invalidLimitValue(500, 1, 100);
      
      expect(error.code).toBe('DASH-VAL-014');
      expect(error.statusCode).toBe(400);
    });
  });

  // ============================================
  // DashboardPermissionException 테스트
  // ============================================

  describe('DashboardPermissionException', () => {
    it('인스턴스 생성', () => {
      const error = new DashboardPermissionException('Permission error', 'DASH-PERM-001', 403);
      
      expect(error).toBeInstanceOf(DashboardPermissionException);
      expect(error.name).toBe('DashboardPermissionException');
    });

    it('authenticationRequired() - 인증 필요 에러', () => {
      const error = DashboardPermissionException.authenticationRequired();
      
      expect(error.code).toBe('DASH-PERM-001');
      expect(error.statusCode).toBe(401);
    });

    it('sessionExpired() - 세션 만료', () => {
      const error = DashboardPermissionException.sessionExpired();
      
      expect(error.code).toBe('DASH-PERM-002');
      expect(error.statusCode).toBe(401);
    });

    it('invalidSession() - 유효하지 않은 세션', () => {
      const error = DashboardPermissionException.invalidSession();
      
      expect(error.code).toBe('DASH-PERM-003');
      expect(error.statusCode).toBe(401);
    });

    it('tokenInvalid() - 유효하지 않은 토큰', () => {
      const error = DashboardPermissionException.tokenInvalid();
      
      expect(error.code).toBe('DASH-PERM-004');
      expect(error.statusCode).toBe(401);
    });

    it('accessDenied() - 접근 거부', () => {
      const error = DashboardPermissionException.accessDenied('dashboard');
      
      expect(error.code).toBe('DASH-PERM-005');
      expect(error.statusCode).toBe(403);
    });

    it('insufficientPermission() - 권한 부족', () => {
      const error = DashboardPermissionException.insufficientPermission('edit');
      
      expect(error.code).toBe('DASH-PERM-006');
      expect(error.statusCode).toBe(403);
    });

    it('otherUserDataAccessDenied() - 다른 사용자 데이터 접근 거부', () => {
      const error = DashboardPermissionException.otherUserDataAccessDenied('user-456');
      
      expect(error.code).toBe('DASH-PERM-010');
      expect(error.statusCode).toBe(403);
    });

    it('adminOnlyAccess() - 관리자 전용 접근', () => {
      const error = DashboardPermissionException.adminOnlyAccess();
      
      expect(error.code).toBe('DASH-PERM-011');
      expect(error.statusCode).toBe(403);
    });
  });

  // ============================================
  // DashboardBusinessException 테스트
  // ============================================

  describe('DashboardBusinessException', () => {
    it('인스턴스 생성', () => {
      const error = new DashboardBusinessException('Business error', 'DASH-BIZ-001', 500);
      
      expect(error).toBeInstanceOf(DashboardBusinessException);
      expect(error.name).toBe('DashboardBusinessException');
    });

    it('dashboardDataNotFound() - 대시보드 데이터 없음', () => {
      const error = DashboardBusinessException.dashboardDataNotFound('user-123');
      
      expect(error.code).toBe('DASH-BIZ-001');
      expect(error.statusCode).toBe(404);
    });

    it('studyStatisticsNotFound() - 스터디 통계 없음', () => {
      const error = DashboardBusinessException.studyStatisticsNotFound('study-123');
      
      expect(error.code).toBe('DASH-BIZ-002');
      expect(error.statusCode).toBe(404);
    });

    it('taskStatisticsNotFound() - 할일 통계 없음', () => {
      const error = DashboardBusinessException.taskStatisticsNotFound('user-123');
      
      expect(error.code).toBe('DASH-BIZ-003');
      expect(error.statusCode).toBe(404);
    });

    it('noRecentActivities() - 최근 활동 없음', () => {
      const error = DashboardBusinessException.noRecentActivities();
      
      expect(error.code).toBe('DASH-BIZ-004');
      expect(error.statusCode).toBe(404);
    });

    it('noUpcomingSchedules() - 예정 일정 없음', () => {
      const error = DashboardBusinessException.noUpcomingSchedules();
      
      expect(error.code).toBe('DASH-BIZ-005');
      expect(error.statusCode).toBe(404);
    });

    it('userNotFound() - 사용자 없음', () => {
      const error = DashboardBusinessException.userNotFound('user-123');
      
      expect(error.code).toBe('DASH-BIZ-006');
      expect(error.statusCode).toBe(404);
    });

    it('widgetNotFound() - 위젯 없음', () => {
      const error = DashboardBusinessException.widgetNotFound('widget-123');
      
      expect(error.code).toBe('DASH-BIZ-007');
      expect(error.statusCode).toBe(404);
    });

    it('widgetCreationFailed() - 위젯 생성 실패', () => {
      const error = DashboardBusinessException.widgetCreationFailed('DB Error');
      
      expect(error.code).toBe('DASH-BIZ-008');
      expect(error.statusCode).toBe(500);
    });

    it('databaseError() - 데이터베이스 에러', () => {
      const error = DashboardBusinessException.databaseError('getDashboard', 'Connection Lost');
      
      expect(error.code).toBe('DASH-BIZ-017');
      expect(error.statusCode).toBe(500);
    });

    it('rateLimitExceeded() - Rate Limit 초과', () => {
      const error = DashboardBusinessException.rateLimitExceeded(60);
      
      expect(error.code).toBe('DASH-BIZ-019');
      expect(error.statusCode).toBe(429);
    });

    it('unexpectedError() - 예상치 못한 에러', () => {
      const error = DashboardBusinessException.unexpectedError('Something went wrong');
      
      expect(error.code).toBe('DASH-BIZ-020');
      expect(error.statusCode).toBe(500);
    });
  });

  // ============================================
  // 에러 상속 체인 테스트
  // ============================================

  describe('에러 상속 체인', () => {
    it('DashboardValidationException은 DashboardException을 상속해야 함', () => {
      const error = DashboardValidationException.dateRequired();
      
      expect(error).toBeInstanceOf(DashboardException);
      expect(error).toBeInstanceOf(DashboardValidationException);
      expect(error).toBeInstanceOf(Error);
    });

    it('DashboardPermissionException은 DashboardException을 상속해야 함', () => {
      const error = DashboardPermissionException.authenticationRequired();
      
      expect(error).toBeInstanceOf(DashboardException);
      expect(error).toBeInstanceOf(DashboardPermissionException);
      expect(error).toBeInstanceOf(Error);
    });

    it('DashboardBusinessException은 DashboardException을 상속해야 함', () => {
      const error = DashboardBusinessException.dashboardDataNotFound('user-123');
      
      expect(error).toBeInstanceOf(DashboardException);
      expect(error).toBeInstanceOf(DashboardBusinessException);
      expect(error).toBeInstanceOf(Error);
    });
  });

  // ============================================
  // 에러 코드 체계 테스트
  // ============================================

  describe('에러 코드 체계', () => {
    it('DashboardException 에러 코드는 DASH-xxx 형식', () => {
      const error = DashboardException.authenticationRequired();
      expect(error.code).toMatch(/^DASH-\d{3}$/);
    });

    it('DashboardValidationException 에러 코드는 DASH-VAL-xxx 형식', () => {
      const error = DashboardValidationException.dateRequired();
      expect(error.code).toMatch(/^DASH-VAL-\d{3}$/);
    });

    it('DashboardPermissionException 에러 코드는 DASH-PERM-xxx 형식', () => {
      const error = DashboardPermissionException.authenticationRequired();
      expect(error.code).toMatch(/^DASH-PERM-\d{3}$/);
    });

    it('DashboardBusinessException 에러 코드는 DASH-BIZ-xxx 형식', () => {
      const error = DashboardBusinessException.dashboardDataNotFound('user-123');
      expect(error.code).toMatch(/^DASH-BIZ-\d{3}$/);
    });
  });

  // ============================================
  // HTTP 상태 코드 테스트
  // ============================================

  describe('HTTP 상태 코드', () => {
    it('Validation 에러는 400 상태 코드를 반환해야 함', () => {
      expect(DashboardValidationException.dateRequired().statusCode).toBe(400);
      expect(DashboardValidationException.invalidDateFormat('test').statusCode).toBe(400);
      expect(DashboardValidationException.invalidPageValue(-1).statusCode).toBe(400);
    });

    it('인증 에러는 401 상태 코드를 반환해야 함', () => {
      expect(DashboardPermissionException.authenticationRequired().statusCode).toBe(401);
      expect(DashboardPermissionException.invalidSession().statusCode).toBe(401);
      expect(DashboardPermissionException.sessionExpired().statusCode).toBe(401);
    });

    it('권한 에러는 403 상태 코드를 반환해야 함', () => {
      expect(DashboardPermissionException.accessDenied('resource').statusCode).toBe(403);
      expect(DashboardPermissionException.insufficientPermission('action').statusCode).toBe(403);
      expect(DashboardPermissionException.adminOnlyAccess().statusCode).toBe(403);
    });

    it('Not Found 에러는 404 상태 코드를 반환해야 함', () => {
      expect(DashboardBusinessException.dashboardDataNotFound('user').statusCode).toBe(404);
      expect(DashboardBusinessException.widgetNotFound('widget').statusCode).toBe(404);
      expect(DashboardBusinessException.userNotFound('user').statusCode).toBe(404);
    });

    it('Rate Limit 에러는 429 상태 코드를 반환해야 함', () => {
      expect(DashboardBusinessException.rateLimitExceeded(60).statusCode).toBe(429);
    });

    it('서버 에러는 500 상태 코드를 반환해야 함', () => {
      expect(DashboardBusinessException.databaseError('op', 'err').statusCode).toBe(500);
      expect(DashboardBusinessException.widgetCreationFailed('err').statusCode).toBe(500);
    });

    it('외부 서비스 에러는 502 상태 코드를 반환해야 함', () => {
      expect(DashboardBusinessException.externalServiceError('service', 'err').statusCode).toBe(502);
    });
  });
});
