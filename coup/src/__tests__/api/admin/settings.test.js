/**
 * Admin Settings API 통합 테스트
 *
 * 테스트 범위:
 * - GET /api/admin/settings - 설정 조회
 * - PATCH /api/admin/settings - 설정 수정
 * - POST /api/admin/settings/cache/clear - 캐시 초기화
 */

import { GET as getSettings, PATCH as updateSettings } from '@/app/api/admin/settings/route'
import { GET as getSettingsHistory } from '@/app/api/admin/settings/history/route'
import { POST as clearCache } from '@/app/api/admin/settings/cache/clear/route'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

jest.mock('next-auth')
jest.mock('@prisma/client')

describe('Admin Settings API', () => {
  let mockPrisma
  let mockSession

  beforeEach(() => {
    mockPrisma = {
      systemSetting: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
      settingHistory: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      adminRole: {
        findUnique: jest.fn(),
      },
      adminAction: {
        create: jest.fn(),
      },
    }

    PrismaClient.mockImplementation(() => mockPrisma)

    mockSession = {
      user: {
        id: 'admin-user-id',
        email: 'admin@coup.com',
        role: 'ADMIN',
      },
    }

    getServerSession.mockResolvedValue(mockSession)

    mockPrisma.adminRole.findUnique.mockResolvedValue({
      userId: 'admin-user-id',
      role: 'SUPER_ADMIN',
      permissions: ['settings:view', 'settings:manage'],
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ========================================
  // GET /api/admin/settings - 설정 조회
  // ========================================

  describe('GET /api/admin/settings', () => {
    it('관리자가 시스템 설정을 조회할 수 있다', async () => {
      const mockSettings = [
        {
          key: 'site_name',
          value: 'CoUp',
          type: 'string',
          category: 'general',
        },
        {
          key: 'max_upload_size',
          value: '10485760',
          type: 'number',
          category: 'file',
        },
        {
          key: 'maintenance_mode',
          value: 'false',
          type: 'boolean',
          category: 'system',
        },
      ]

      mockPrisma.systemSetting.findMany.mockResolvedValue(mockSettings)

      const request = new Request('http://localhost:3000/api/admin/settings')

      const response = await getSettings(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.settings).toHaveLength(3)
    })

    it('카테고리별로 설정을 필터링할 수 있다', async () => {
      mockPrisma.systemSetting.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/admin/settings?category=general')

      await getSettings(request)

      expect(mockPrisma.systemSetting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'general',
          }),
        })
      )
    })

    it('권한이 없으면 403 에러를 반환한다', async () => {
      mockPrisma.adminRole.findUnique.mockResolvedValue({
        userId: 'admin-user-id',
        role: 'MODERATOR',
        permissions: ['user:view'], // settings:view 권한 없음
      })

      const request = new Request('http://localhost:3000/api/admin/settings')

      const response = await getSettings(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
    })
  })

  // ========================================
  // PATCH /api/admin/settings - 설정 수정
  // ========================================

  describe('PATCH /api/admin/settings', () => {
    it('시스템 설정을 수정할 수 있다', async () => {
      const mockSetting = {
        key: 'site_name',
        value: 'CoUp',
        type: 'string',
      }

      mockPrisma.systemSetting.findUnique.mockResolvedValue(mockSetting)
      mockPrisma.systemSetting.upsert.mockResolvedValue({
        ...mockSetting,
        value: 'New CoUp',
      })

      const request = new Request('http://localhost:3000/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          settings: [
            {
              key: 'site_name',
              value: 'New CoUp',
            },
          ],
        }),
      })

      const response = await updateSettings(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.adminAction.create).toHaveBeenCalled()
    })

    it('여러 설정을 한번에 수정할 수 있다', async () => {
      mockPrisma.systemSetting.findUnique.mockResolvedValue({})
      mockPrisma.systemSetting.upsert.mockResolvedValue({})

      const request = new Request('http://localhost:3000/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          settings: [
            { key: 'site_name', value: 'New CoUp' },
            { key: 'max_upload_size', value: '20971520' },
          ],
        }),
      })

      const response = await updateSettings(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.systemSetting.upsert).toHaveBeenCalledTimes(2)
    })

    it('잘못된 설정 키는 검증 에러를 반환한다', async () => {
      const request = new Request('http://localhost:3000/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          settings: [
            {
              key: '', // 빈 키
              value: 'test',
            },
          ],
        }),
      })

      const response = await updateSettings(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('유효하지 않은 설정 값은 검증 에러를 반환한다', async () => {
      const request = new Request('http://localhost:3000/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          settings: [
            {
              key: 'max_upload_size',
              value: 'not_a_number', // 숫자여야 함
            },
          ],
        }),
      })

      const response = await updateSettings(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  // ========================================
  // GET /api/admin/settings/history - 설정 변경 이력 조회
  // ========================================

  describe('GET /api/admin/settings/history', () => {
    it('설정 변경 이력을 조회할 수 있다', async () => {
      const mockHistory = [
        {
          id: 'history-1',
          key: 'site_name',
          oldValue: 'CoUp',
          newValue: 'New CoUp',
          changedBy: 'admin-user-id',
          changedAt: new Date(),
          admin: {
            name: 'Admin User',
            email: 'admin@coup.com',
          },
        },
      ]

      mockPrisma.settingHistory.findMany.mockResolvedValue(mockHistory)

      const request = new Request('http://localhost:3000/api/admin/settings/history')

      const response = await getSettingsHistory(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.history).toHaveLength(1)
    })

    it('특정 키의 변경 이력만 조회할 수 있다', async () => {
      mockPrisma.settingHistory.findMany.mockResolvedValue([])

      const request = new Request('http://localhost:3000/api/admin/settings/history?key=site_name')

      await getSettingsHistory(request)

      expect(mockPrisma.settingHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            key: 'site_name',
          }),
        })
      )
    })
  })

  // ========================================
  // POST /api/admin/settings/cache/clear - 캐시 초기화
  // ========================================

  describe('POST /api/admin/settings/cache/clear', () => {
    it('캐시를 초기화할 수 있다', async () => {
      const request = new Request('http://localhost:3000/api/admin/settings/cache/clear', {
        method: 'POST',
      })

      const response = await clearCache(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.adminAction.create).toHaveBeenCalled()
    })

    it('권한이 없으면 403 에러를 반환한다', async () => {
      mockPrisma.adminRole.findUnique.mockResolvedValue({
        userId: 'admin-user-id',
        role: 'MODERATOR',
        permissions: [], // cache:clear 권한 없음
      })

      const request = new Request('http://localhost:3000/api/admin/settings/cache/clear', {
        method: 'POST',
      })

      const response = await clearCache(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
    })
  })

  // ========================================
  // 데이터베이스 에러 처리
  // ========================================

  describe('Database Error Handling', () => {
    it('데이터베이스 에러를 올바르게 처리한다', async () => {
      mockPrisma.systemSetting.findMany.mockRejectedValue(new Error('Database error'))

      const request = new Request('http://localhost:3000/api/admin/settings')

      const response = await getSettings(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('업데이트 중 에러가 발생하면 롤백된다', async () => {
      mockPrisma.systemSetting.findUnique.mockResolvedValue({})
      mockPrisma.systemSetting.upsert.mockRejectedValueOnce(new Error('Update failed'))

      const request = new Request('http://localhost:3000/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          settings: [
            { key: 'site_name', value: 'New CoUp' },
          ],
        }),
      })

      const response = await updateSettings(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })

  // ========================================
  // 보안 테스트
  // ========================================

  describe('Security Tests', () => {
    it('민감한 설정은 마스킹되어 반환된다', async () => {
      const mockSettings = [
        {
          key: 'api_key',
          value: 'secret-api-key-12345',
          type: 'string',
          category: 'security',
          sensitive: true,
        },
      ]

      mockPrisma.systemSetting.findMany.mockResolvedValue(mockSettings)

      const request = new Request('http://localhost:3000/api/admin/settings')

      const response = await getSettings(request)
      const data = await response.json()

      // 민감한 값은 마스킹되어야 함
      expect(data.data.settings[0].value).not.toBe('secret-api-key-12345')
      expect(data.data.settings[0].value).toContain('***')
    })

    it('SUPER_ADMIN만 중요 설정을 수정할 수 있다', async () => {
      mockPrisma.adminRole.findUnique.mockResolvedValue({
        userId: 'admin-user-id',
        role: 'MODERATOR', // SUPER_ADMIN 아님
        permissions: ['settings:manage'],
      })

      const request = new Request('http://localhost:3000/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          settings: [
            {
              key: 'critical_system_setting',
              value: 'new_value',
            },
          ],
        }),
      })

      const response = await updateSettings(request)
      const data = await response.json()

      // 중요 설정은 SUPER_ADMIN만 수정 가능해야 함
      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
    })
  })
})

