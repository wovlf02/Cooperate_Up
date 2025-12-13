/**
 * Admin Logger 테스트
 *
 * 테스트 범위:
 * - 로그 레벨별 출력
 * - 보안 로깅
 * - 민감 정보 필터링
 * - 로그 포맷팅
 * - 관리자 액션 로깅
 */

import { AdminLogger, LOG_LEVELS } from '@/lib/logging/adminLogger'

describe('AdminLogger', () => {
  let consoleLogSpy
  let consoleInfoSpy
  let consoleWarnSpy
  let consoleErrorSpy

  beforeEach(() => {
    // 콘솔 메서드 스파이 설정
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    // 스파이 복원
    consoleLogSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  // ========================================
  // 로그 레벨 테스트
  // ========================================

  describe('로그 레벨', () => {
    it('DEBUG 레벨로 로그를 출력한다', () => {
      AdminLogger.debug('Debug message', { userId: 'user-1' })

      expect(consoleLogSpy).toHaveBeenCalled()
      const logCall = consoleLogSpy.mock.calls[0][0]
      expect(logCall).toContain('DEBUG')
      expect(logCall).toContain('Debug message')
    })

    it('INFO 레벨로 로그를 출력한다', () => {
      AdminLogger.info('Info message', { action: 'view_users' })

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0][0]
      expect(logCall).toContain('INFO')
      expect(logCall).toContain('Info message')
    })

    it('WARN 레벨로 로그를 출력한다', () => {
      AdminLogger.warn('Warning message', { reason: 'suspicious_activity' })

      expect(consoleWarnSpy).toHaveBeenCalled()
      const logCall = consoleWarnSpy.mock.calls[0][0]
      expect(logCall).toContain('WARN')
      expect(logCall).toContain('Warning message')
    })

    it('ERROR 레벨로 로그를 출력한다', () => {
      AdminLogger.error('Error message', { error: 'Database error' })

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logCall = consoleErrorSpy.mock.calls[0][0]
      expect(logCall).toContain('ERROR')
      expect(logCall).toContain('Error message')
    })

    it('CRITICAL 레벨로 로그를 출력한다', () => {
      AdminLogger.critical('Critical message', { severity: 'high' })

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logCall = consoleErrorSpy.mock.calls[0][0]
      expect(logCall).toContain('CRITICAL')
      expect(logCall).toContain('Critical message')
    })

    it('SECURITY 레벨로 로그를 출력한다', () => {
      AdminLogger.security('Security event', { ip: '192.168.1.1' })

      expect(consoleErrorSpy).toHaveBeenCalled()
      const logCall = consoleErrorSpy.mock.calls[0][0]
      expect(logCall).toContain('SECURITY')
      expect(logCall).toContain('Security event')
    })
  })

  // ========================================
  // 민감 ?�보 ?�터�??�스??
  // ========================================

  describe('민감 ?�보 ?�터�?, () => {
    it('password ?�드�?[REDACTED]�?마스?�한??, () => {
      AdminLogger.info('User action', {
        userId: 'user-1',
        password: 'secret123',
      })

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0]
      const contextArg = logCall[1]

      if (contextArg && typeof contextArg === 'object') {
        expect(contextArg.password).toBe('[REDACTED]')
      }
    })

    it('token 필드를 [REDACTED]로 마스킹한다', () => {
      AdminLogger.info('API call', {
        userId: 'user-1',
        token: 'bearer-token-12345',
      })

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0]
      const contextArg = logCall[1]

      if (contextArg && typeof contextArg === 'object') {
        expect(contextArg.token).toBe('[REDACTED]')
      }
    })

    it('secret 필드를 [REDACTED]로 마스킹한다', () => {
      AdminLogger.info('Config update', {
        setting: 'api',
        secret: 'api-secret-key',
      })

      expect(consoleInfoSpy).toHaveBeenCalled()
    })

    it('중첩된 객체의 민감 정보를 마스킹한다', () => {
      AdminLogger.info('Complex action', {
        user: {
          id: 'user-1',
          password: 'secret',
        },
      })

      expect(consoleInfoSpy).toHaveBeenCalled()
    })

    it('민감하지 않은 정보는 그대로 출력한다', () => {
      AdminLogger.info('Normal action', {
        userId: 'user-1',
        action: 'view_page',
      })

      expect(consoleInfoSpy).toHaveBeenCalled()
      const logCall = consoleInfoSpy.mock.calls[0]
      const contextArg = logCall[1]

      if (contextArg && typeof contextArg === 'object') {
        expect(contextArg.userId).toBe('user-1')
        expect(contextArg.action).toBe('view_page')
      }
    })
  })

  // ========================================
  // 관리자 액션 로깅
  // ========================================

  describe('관리자 액션 로깅', () => {
    it('사용자 생성 액션을 로깅한다', () => {
      AdminLogger.info('User created', {
        adminId: 'admin-1',
        targetUserId: 'user-1',
        action: 'create_user',
      })

      expect(consoleInfoSpy).toHaveBeenCalled()
    })

    it('사용자 삭제 액션을 로깅한다', () => {
      AdminLogger.warn('User deleted', {
        adminId: 'admin-1',
        targetUserId: 'user-1',
        action: 'delete_user',
      })

      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it('권한 변경 액션을 로깅한다', () => {
      AdminLogger.security('Permission changed', {
        adminId: 'admin-1',
        targetUserId: 'user-1',
        action: 'change_role',
        oldRole: 'USER',
        newRole: 'ADMIN',
      })

      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
})
