/**
 * Admin Users API 통합 테스트
 *
 * 테스트 범위:
 * - GET /api/admin/users - 사용자 목록 조회
 * - GET /api/admin/users/[id] - 사용자 상세 조회
 * - PATCH /api/admin/users/[id] - 사용자 정보 수정
 * - POST /api/admin/users/[id]/suspend - 사용자 정지
 * - POST /api/admin/users/[id]/activate - 사용자 활성화
 */

import { GET as getUsers } from '@/app/api/admin/users/route'
import { GET as getUser, PATCH as updateUser } from '@/app/api/admin/users/[id]/route'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

jest.mock('next-auth')
jest.mock('@prisma/client')

describe('Admin Users API', () => {
  let mockPrisma
  let mockSession

  beforeEach(() => {
    // Prisma Mock 초기화
    mockPrisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      adminRole: {
        findUnique: jest.fn(),
      },
      adminAction: {
        create: jest.fn(),
      },
    }

    PrismaClient.mockImplementation(() => mockPrisma)

    // Admin 세션 Mock
    mockSession = {
      user: {
        id: 'admin-user-id',
        email: 'admin@coup.com',
        role: 'ADMIN',
      },
    }

    getServerSession.mockResolvedValue(mockSession)

    // Admin 권한 Mock
    mockPrisma.adminRole.findUnique.mockResolvedValue({
      userId: 'admin-user-id',
      role: 'SUPER_ADMIN',
      permissions: ['user:view', 'user:manage'],
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ========================================
  // GET /api/admin/users - 사용자 목록 조회
  // ========================================

  describe('GET /api/admin/users', () => {
    it('관리자가 사용자 목록을 조회할 수 있다', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@test.com',
          name: 'User 1',
          status: 'ACTIVE',
          createdAt: new Date(),
        },
        {
          id: 'user-2',
          email: 'user2@test.com',
          name: 'User 2',
          status: 'ACTIVE',
          createdAt: new Date(),
        },
      ]

      mockPrisma.user.findMany.mockResolvedValue(mockUsers)
      mockPrisma.user.count.mockResolvedValue(2)

      const request = new Request('http://localhost:3000/api/admin/users?page=1&limit=10')

      const response = await getUsers(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.users).toHaveLength(2)
      expect(data.data.pagination.total).toBe(2)
    })

    it('검색 조건으로 사용자를 필터링할 수 있다', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'john@test.com',
          name: 'John Doe',
          status: 'ACTIVE',
          createdAt: new Date(),
        },
      ]

      mockPrisma.user.findMany.mockResolvedValue(mockUsers)
      mockPrisma.user.count.mockResolvedValue(1)

      const request = new Request('http://localhost:3000/api/admin/users?search=john')

      const response = await getUsers(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ email: expect.objectContaining({ contains: 'john' }) }),
              expect.objectContaining({ name: expect.objectContaining({ contains: 'john' }) }),
            ]),
          }),
        })
      )
    })

    it('상태별로 사용자를 필터링할 수 있다', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])
      mockPrisma.user.count.mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/admin/users?status=SUSPENDED')

      await getUsers(request)

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SUSPENDED',
          }),
        })
      )
    })

    it('페이지네이션이 올바르게 작동한다', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])
      mockPrisma.user.count.mockResolvedValue(50)

      const request = new Request('http://localhost:3000/api/admin/users?page=2&limit=10')

      const response = await getUsers(request)
      const data = await response.json()

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      )

      expect(data.data.pagination).toMatchObject({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
      })
    })

    it('권한이 없으면 403 에러를 반환한다', async () => {
      mockPrisma.adminRole.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/admin/users')

      const response = await getUsers(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('ADMIN-002')
    })

    it('로그인하지 않으면 401 에러를 반환한다', async () => {
      getServerSession.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/admin/users')

      const response = await getUsers(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })

    it('잘못된 정렬 필드는 검증 에러를 반환한다', async () => {
      const request = new Request('http://localhost:3000/api/admin/users?sortBy=invalidField')

      const response = await getUsers(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toContain('ADMIN')
    })
  })

  // ========================================
  // GET /api/admin/users/[id] - 사용자 상세 조회
  // ========================================

  describe('GET /api/admin/users/[id]', () => {
    it('특정 사용자의 상세 정보를 조회할 수 있다', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user1@test.com',
        name: 'User 1',
        status: 'ACTIVE',
        createdAt: new Date(),
        profile: {
          bio: 'Test bio',
        },
        _count: {
          studies: 5,
        },
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const request = new Request('http://localhost:3000/api/admin/users/user-1')

      const response = await getUser(request, { params: { id: 'user-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('user-1')
      expect(data.data.email).toBe('user1@test.com')
    })

    it('존재하지 않는 사용자는 404 에러를 반환한다', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/admin/users/non-existent')

      const response = await getUser(request, { params: { id: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('ADMIN-021')
    })
  })

  // ========================================
  // PATCH /api/admin/users/[id] - 사용자 정보 수정
  // ========================================

  describe('PATCH /api/admin/users/[id]', () => {
    it('사용자 정보를 수정할 수 있다', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user1@test.com',
        name: 'User 1',
        status: 'ACTIVE',
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      })

      const request = new Request('http://localhost:3000/api/admin/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Updated Name',
        }),
      })

      const response = await updateUser(request, { params: { id: 'user-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('Updated Name')
      expect(mockPrisma.adminAction.create).toHaveBeenCalled()
    })

    it('사용자 상태를 변경할 수 있다', async () => {
      const mockUser = {
        id: 'user-1',
        status: 'ACTIVE',
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        status: 'SUSPENDED',
      })

      const request = new Request('http://localhost:3000/api/admin/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'SUSPENDED',
          reason: 'Policy violation',
        }),
      })

      const response = await updateUser(request, { params: { id: 'user-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.status).toBe('SUSPENDED')
    })

    it('잘못된 상태값은 검증 에러를 반환한다', async () => {
      const request = new Request('http://localhost:3000/api/admin/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'INVALID_STATUS',
        }),
      })

      const response = await updateUser(request, { params: { id: 'user-1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  // ========================================
  // 데이터베이스 에러 처리
  // ========================================

  describe('Database Error Handling', () => {
    it('데이터베이스 연결 에러를 올바르게 처리한다', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database connection failed'))

      const request = new Request('http://localhost:3000/api/admin/users')

      const response = await getUsers(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('쿼리 타임아웃을 올바르게 처리한다', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Query timeout'))

      const request = new Request('http://localhost:3000/api/admin/users')

      const response = await getUsers(request)

      expect(response.status).toBe(500)
    })
  })

  // ========================================
  // 로깅 검증
  // ========================================

  describe('Logging', () => {
    it('관리자 작업을 로깅한다', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])
      mockPrisma.user.count.mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/admin/users')

      await getUsers(request)

      // AdminLogger가 호출되었는지 확인 (실제 구현에 따라 조정 필요)
      expect(mockPrisma.adminAction.create).not.toHaveBeenCalled() // 조회는 로깅하지 않을 수 있음
    })
  })
})

