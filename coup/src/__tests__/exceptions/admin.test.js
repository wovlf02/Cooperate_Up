/**
 * Admin Exception 클래스 테스트
 *
 * 테스트 범위:
 * - AdminException 기본 동작
 * - AdminPermissionException (권한 관련)
 * - AdminValidationException (검증 관련)
 * - AdminUserException (사용자 관리)
 * - AdminReportException (신고 관리)
 * - AdminSettingsException (설정 관리)
 * - AdminBusinessException (비즈니스 로직)
 * - AdminDatabaseException (데이터베이스)
 */

import {
  AdminException,
  AdminPermissionException,
  AdminValidationException,
  AdminUserException,
  AdminReportException,
  AdminSettingsException,
  AdminBusinessException,
  AdminDatabaseException,
} from '@/lib/exceptions/admin'

describe('AdminException 클래스', () => {
  // ========================================
  // 기본 AdminException 테스트
  // ========================================

  describe('AdminException 기본 동작', () => {
    it('기본 속성이 올바르게 설정된다', () => {
      const error = new AdminException('ADMIN-001', 'Test error', {
        userMessage: 'User message',
        devMessage: 'Dev message',
        statusCode: 400,
      })

      expect(error.code).toBe('ADMIN-001')
      expect(error.message).toBe('Test error')
      expect(error.userMessage).toBe('User message')
      expect(error.devMessage).toBe('Dev message')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('AdminException')
    })

    it('기본값이 올바르게 적용된다', () => {
      const error = new AdminException('ADMIN-001', 'Test error')

      expect(error.userMessage).toBe('Test error')
      expect(error.devMessage).toBe('Test error')
      expect(error.statusCode).toBe(400)
      expect(error.retryable).toBe(false)
      expect(error.severity).toBe('medium')
      expect(error.category).toBe('general')
    })

    it('toJSON()이 올바른 형식으로 변환한다', () => {
      const error = new AdminException('ADMIN-001', 'Test error', {
        context: { userId: 'user-1' },
      })

      const json = error.toJSON()

      expect(json).toHaveProperty('name')
      expect(json).toHaveProperty('code')
      expect(json).toHaveProperty('message')
      expect(json).toHaveProperty('userMessage')
      expect(json).toHaveProperty('devMessage')
      expect(json).toHaveProperty('statusCode')
      expect(json).toHaveProperty('retryable')
      expect(json).toHaveProperty('severity')
      expect(json).toHaveProperty('timestamp')
      expect(json).toHaveProperty('context')
      expect(json.context.userId).toBe('user-1')
    })

    it('toResponse()가 API 응답 형식으로 변환한다', () => {
      const error = new AdminException('ADMIN-001', 'Test error', {
        userMessage: 'Error message for user',
      })

      const response = error.toResponse()

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('ADMIN-001')
      expect(response.error.message).toBe('Error message for user')
      expect(response.error).toHaveProperty('retryable')
      expect(response.error).toHaveProperty('timestamp')
    })
  })

  // ========================================
  // AdminPermissionException 테스트 (ADMIN-001 ~ ADMIN-020)
  // ========================================

  describe('AdminPermissionException', () => {
    it('ADMIN-001: authenticationFailed', () => {
      const error = AdminPermissionException.authenticationFailed({ ip: '127.0.0.1' })

      expect(error.code).toBe('ADMIN-001')
      expect(error.statusCode).toBe(401)
      expect(error.category).toBe('permission')
      expect(error.severity).toBe('high')
      expect(error.securityLevel).toBe('critical')
      expect(error.context.ip).toBe('127.0.0.1')
    })

    it('ADMIN-002: insufficientPermission', () => {
      const error = AdminPermissionException.insufficientPermission('user:delete', 'MODERATOR')

      expect(error.code).toBe('ADMIN-002')
      expect(error.statusCode).toBe(403)
      expect(error.context.requiredPermission).toBe('user:delete')
      expect(error.context.currentRole).toBe('MODERATOR')
    })

    it('ADMIN-003: sessionExpired', () => {
      const error = AdminPermissionException.sessionExpired()

      expect(error.code).toBe('ADMIN-003')
      expect(error.statusCode).toBe(401)
      expect(error.retryable).toBe(true)
    })

    it('ADMIN-004: ipBlocked', () => {
      const error = AdminPermissionException.ipBlocked('192.168.1.1')

      expect(error.code).toBe('ADMIN-004')
      expect(error.statusCode).toBe(403)
      expect(error.severity).toBe('critical')
      expect(error.securityLevel).toBe('critical')
      expect(error.context.ipAddress).toBe('192.168.1.1')
    })

    it('ADMIN-005: twoFactorRequired', () => {
      const error = AdminPermissionException.twoFactorRequired()

      expect(error.code).toBe('ADMIN-005')
      expect(error.statusCode).toBe(403)
      expect(error.retryable).toBe(true)
    })
  })

  // ========================================
  // AdminUserException 테스트 (ADMIN-021 ~ ADMIN-040)
  // ========================================

  describe('AdminUserException', () => {
    it('ADMIN-021: userNotFound', () => {
      const error = AdminUserException.userNotFound('user-123')

      expect(error.code).toBe('ADMIN-021')
      expect(error.statusCode).toBe(404)
      expect(error.category).toBe('user_management')
      expect(error.context.userId).toBe('user-123')
    })

    it('ADMIN-022: invalidStatusChange', () => {
      const error = AdminUserException.invalidStatusChange('ACTIVE', 'DELETED')

      expect(error.code).toBe('ADMIN-022')
      expect(error.statusCode).toBe(400)
      expect(error.context.currentStatus).toBe('ACTIVE')
      expect(error.context.targetStatus).toBe('DELETED')
    })

    it('ADMIN-024: userAlreadySuspended', () => {
      const error = AdminUserException.userAlreadySuspended('user-123')

      expect(error.code).toBe('ADMIN-024')
      expect(error.statusCode).toBe(400)
      expect(error.context.userId).toBe('user-123')
    })

    it('ADMIN-028: activationFailed', () => {
      const error = AdminUserException.activationFailed('user-123', 'Database error')

      expect(error.code).toBe('ADMIN-028')
      expect(error.statusCode).toBe(500)
      expect(error.retryable).toBe(true)
      expect(error.severity).toBe('high')
      expect(error.context.userId).toBe('user-123')
      expect(error.context.reason).toBe('Database error')
    })
  })

  // ========================================
  // AdminValidationException 테스트
  // ========================================

  describe('AdminValidationException', () => {
    it('ADMIN-023: suspensionReasonMissing', () => {
      const error = AdminValidationException.suspensionReasonMissing()

      expect(error.code).toBe('ADMIN-023')
      expect(error.statusCode).toBe(400)
      expect(error.category).toBe('validation')
      expect(error.severity).toBe('low')
    })

    it('ADMIN-027: invalidSuspensionDuration', () => {
      const error = AdminValidationException.invalidSuspensionDuration(400)

      expect(error.code).toBe('ADMIN-027')
      expect(error.statusCode).toBe(400)
      expect(error.context.duration).toBe(400)
    })

    it('ADMIN-030: invalidSearchCriteria', () => {
      const criteria = { status: 'INVALID' }
      const error = AdminValidationException.invalidSearchCriteria(criteria)

      expect(error.code).toBe('ADMIN-030')
      expect(error.statusCode).toBe(400)
      expect(error.context.criteria).toEqual(criteria)
    })
  })

  // ========================================
  // AdminBusinessException 테스트
  // ========================================

  describe('AdminBusinessException', () => {
    it('ADMIN-025: cannotSuspendSelf', () => {
      const error = AdminBusinessException.cannotSuspendSelf('admin-123')

      expect(error.code).toBe('ADMIN-025')
      expect(error.statusCode).toBe(400)
      expect(error.category).toBe('business_logic')
      expect(error.context.adminId).toBe('admin-123')
    })

    it('ADMIN-029: userDeletionNotAllowed', () => {
      const error = AdminBusinessException.userDeletionNotAllowed('user-123', 'Has active studies')

      expect(error.code).toBe('ADMIN-029')
      expect(error.statusCode).toBe(400)
      expect(error.severity).toBe('medium')
      expect(error.context.userId).toBe('user-123')
      expect(error.context.reason).toBe('Has active studies')
    })
  })

  // ========================================
  // AdminReportException 테스트 (ADMIN-041 ~ ADMIN-055)
  // ========================================

  describe('AdminReportException', () => {
    it('ADMIN-041: reportNotFound', () => {
      const error = AdminReportException.reportNotFound('report-123')

      expect(error.code).toBe('ADMIN-041')
      expect(error.statusCode).toBe(404)
      expect(error.category).toBe('report_management')
      expect(error.context.reportId).toBe('report-123')
    })

    it('ADMIN-042: reportAlreadyProcessed', () => {
      const error = AdminReportException.reportAlreadyProcessed('report-123', 'APPROVED')

      expect(error.code).toBe('ADMIN-042')
      expect(error.statusCode).toBe(400)
      expect(error.context.reportId).toBe('report-123')
      expect(error.context.status).toBe('APPROVED')
    })
  })

  // ========================================
  // 서브클래스 카테고리 테스트
  // ========================================

  describe('서브클래스 카테고리', () => {
    it('AdminPermissionException은 category가 permission이다', () => {
      const error = new AdminPermissionException('TEST-001', 'Test')

      expect(error.category).toBe('permission')
      expect(error.name).toBe('AdminPermissionException')
    })

    it('AdminValidationException은 category가 validation이다', () => {
      const error = new AdminValidationException('TEST-001', 'Test')

      expect(error.category).toBe('validation')
      expect(error.name).toBe('AdminValidationException')
    })

    it('AdminUserException은 category가 user_management이다', () => {
      const error = new AdminUserException('TEST-001', 'Test')

      expect(error.category).toBe('user_management')
      expect(error.name).toBe('AdminUserException')
    })

    it('AdminReportException은 category가 report_management이다', () => {
      const error = new AdminReportException('TEST-001', 'Test')

      expect(error.category).toBe('report_management')
      expect(error.name).toBe('AdminReportException')
    })

    it('AdminSettingsException은 category가 settings이다', () => {
      const error = new AdminSettingsException('TEST-001', 'Test')

      expect(error.category).toBe('settings')
      expect(error.name).toBe('AdminSettingsException')
    })

    it('AdminBusinessException은 category가 business_logic이다', () => {
      const error = new AdminBusinessException('TEST-001', 'Test')

      expect(error.category).toBe('business_logic')
      expect(error.name).toBe('AdminBusinessException')
    })

    it('AdminDatabaseException은 category가 database이다', () => {
      const error = new AdminDatabaseException('TEST-001', 'Test')

      expect(error.category).toBe('database')
      expect(error.name).toBe('AdminDatabaseException')
    })
  })

  // ========================================
  // 보안 레벨 테스트
  // ========================================

  describe('보안 레벨', () => {
    it('인증 실패는 critical 보안 레벨이다', () => {
      const error = AdminPermissionException.authenticationFailed()

      expect(error.securityLevel).toBe('critical')
    })

    it('IP 차단은 critical 보안 레벨이다', () => {
      const error = AdminPermissionException.ipBlocked('1.2.3.4')

      expect(error.securityLevel).toBe('critical')
    })

    it('권한 부족은 high 보안 레벨이다', () => {
      const error = AdminPermissionException.insufficientPermission('test', 'role')

      expect(error.securityLevel).toBe('high')
    })

    it('설정 관련 에러는 high 보안 레벨이다', () => {
      const error = new AdminSettingsException('TEST-001', 'Test')

      expect(error.securityLevel).toBe('high')
    })
  })

  // ========================================
  // 에러 메시지 테스트
  // ========================================

  describe('에러 메시지', () => {
    it('userMessage는 사용자 친화적이다', () => {
      const error = AdminPermissionException.insufficientPermission('user:delete', 'MODERATOR')

      expect(error.userMessage).toBe('이 작업을 수행할 권한이 없습니다')
      expect(error.userMessage).not.toContain('permission')
    })

    it('devMessage는 개발자용 상세 정보를 포함한다', () => {
      const error = AdminUserException.userNotFound('user-123')

      expect(error.devMessage).toContain('User not found')
      expect(error.devMessage).toContain('userId=user-123')
    })

    it('context에 추가 정보가 저장된다', () => {
      const context = { ip: '127.0.0.1', userAgent: 'Test Agent' }
      const error = AdminPermissionException.authenticationFailed(context)

      expect(error.context.ip).toBe('127.0.0.1')
      expect(error.context.userAgent).toBe('Test Agent')
    })
  })

  // ========================================
  // Timestamp 테스트
  // ========================================

  describe('Timestamp', () => {
    it('timestamp가 자동으로 생성된다', () => {
      const error = new AdminException('TEST-001', 'Test')

      expect(error.timestamp).toBeDefined()
      expect(typeof error.timestamp).toBe('string')
      expect(new Date(error.timestamp).toString()).not.toBe('Invalid Date')
    })

    it('timestamp가 ISO 형식이다', () => {
      const error = new AdminException('TEST-001', 'Test')

      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })
})

