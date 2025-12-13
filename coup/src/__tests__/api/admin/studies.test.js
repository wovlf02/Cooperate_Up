/**
 * Admin Studies API 통합 테스트
 *
 * 테스트 범위:
 * - GET /api/admin/studies - 스터디 목록 조회
 * - GET /api/admin/studies/[id] - 스터디 상세 조회
 * - PATCH /api/admin/studies/[id] - 스터디 정보 수정
 * - POST /api/admin/studies/[id]/hide - 스터디 숨기기
 * - POST /api/admin/studies/[id]/close - 스터디 종료
 */

import { GET as getStudies } from '@/app/api/admin/studies/route'
import { GET as getStudy, PATCH as updateStudy } from '@/app/api/admin/studies/[studyId]/route'
import { POST as hideStudy } from '@/app/api/admin/studies/[studyId]/hide/route'
import { POST as closeStudy } from '@/app/api/admin/studies/[studyId]/close/route'
import { POST as deleteStudy } from '@/app/api/admin/studies/[studyId]/delete/route'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

jest.mock('next-auth')
jest.mock('@prisma/client')

describe('Admin Studies API', () => {
  let mockPrisma
  let mockSession

  beforeEach(() => {
    mockPrisma = {
      study: {
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
      permissions: ['study:view', 'study:manage'],
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ========================================
  // GET /api/admin/studies - 스터디 목록 조회
  // ========================================

  describe('GET /api/admin/studies', () => {
    it('관리자가 스터디 목록을 조회할 수 있다', async () => {
      const mockStudies = [
        {
          id: 'study-1',
          name: 'Test Study 1',
          category: 'PROGRAMMING',
          isPublic: true,
          isRecruiting: true,
          memberCount: 5,
          createdAt: new Date(),
        },
        {
          id: 'study-2',
          name: 'Test Study 2',
          category: 'DESIGN',
          isPublic: false,
          isRecruiting: false,
          memberCount: 3,
          createdAt: new Date(),
        },
      ]

      mockPrisma.study.findMany.mockResolvedValue(mockStudies)
      mockPrisma.study.count.mockResolvedValue(2)

      const request = new Request('http://localhost:3000/api/admin/studies?page=1&limit=10')

      const response = await getStudies(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.studies).toHaveLength(2)
      expect(data.data.pagination.total).toBe(2)
    })

    it('카테고리별로 스터디를 필터링할 수 있다', async () => {
      mockPrisma.study.findMany.mockResolvedValue([])
      mockPrisma.study.count.mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/admin/studies?category=PROGRAMMING')

      await getStudies(request)

      expect(mockPrisma.study.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'PROGRAMMING',
          }),
        })
      )
    })

    it('공개 여부로 스터디를 필터링할 수 있다', async () => {
      mockPrisma.study.findMany.mockResolvedValue([])
      mockPrisma.study.count.mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/admin/studies?isPublic=true')

      await getStudies(request)

      expect(mockPrisma.study.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPublic: true,
          }),
        })
      )
    })

    it('모집 중인 스터디만 조회할 수 있다', async () => {
      mockPrisma.study.findMany.mockResolvedValue([])
      mockPrisma.study.count.mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/admin/studies?isRecruiting=true')

      await getStudies(request)

      expect(mockPrisma.study.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isRecruiting: true,
          }),
        })
      )
    })

    it('잘못된 정렬 필드는 검증 에러를 반환한다', async () => {
      const request = new Request('http://localhost:3000/api/admin/studies?sortBy=invalidField')

      const response = await getStudies(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('잘못된 날짜 범위는 검증 에러를 반환한다', async () => {
      const request = new Request(
        'http://localhost:3000/api/admin/studies?createdFrom=2024-12-31&createdTo=2024-01-01'
      )

      const response = await getStudies(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  // ========================================
  // GET /api/admin/studies/[id] - 스터디 상세 조회
  // ========================================

  describe('GET /api/admin/studies/[id]', () => {
    it('특정 스터디의 상세 정보를 조회할 수 있다', async () => {
      const mockStudy = {
        id: 'study-1',
        name: 'Test Study',
        description: 'Test Description',
        category: 'PROGRAMMING',
        isPublic: true,
        memberCount: 5,
        createdAt: new Date(),
        leader: {
          id: 'user-1',
          name: 'Leader',
          email: 'leader@test.com',
        },
        members: [],
      }

      mockPrisma.study.findUnique.mockResolvedValue(mockStudy)

      const request = new Request('http://localhost:3000/api/admin/studies/study-1')

      const response = await getStudy(request, { params: { studyId: 'study-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('study-1')
      expect(data.data.name).toBe('Test Study')
    })

    it('존재하지 않는 스터디는 404 에러를 반환한다', async () => {
      mockPrisma.study.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/admin/studies/non-existent')

      const response = await getStudy(request, { params: { studyId: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
    })
  })

  // ========================================
  // PATCH /api/admin/studies/[id] - 스터디 정보 수정
  // ========================================

  describe('PATCH /api/admin/studies/[id]', () => {
    it('스터디 정보를 수정할 수 있다', async () => {
      const mockStudy = {
        id: 'study-1',
        name: 'Test Study',
        description: 'Test Description',
      }

      mockPrisma.study.findUnique.mockResolvedValue(mockStudy)
      mockPrisma.study.update.mockResolvedValue({
        ...mockStudy,
        name: 'Updated Study',
      })

      const request = new Request('http://localhost:3000/api/admin/studies/study-1', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Updated Study',
        }),
      })

      const response = await updateStudy(request, { params: { studyId: 'study-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('Updated Study')
    })
  })

  // ========================================
  // POST /api/admin/studies/[id]/hide - 스터디 숨기기
  // ========================================

  describe('POST /api/admin/studies/[id]/hide', () => {
    it('스터디를 숨길 수 있다', async () => {
      const mockStudy = {
        id: 'study-1',
        name: 'Test Study',
        isHidden: false,
      }

      mockPrisma.study.findUnique.mockResolvedValue(mockStudy)
      mockPrisma.study.update.mockResolvedValue({
        ...mockStudy,
        isHidden: true,
      })

      const request = new Request('http://localhost:3000/api/admin/studies/study-1/hide', {
        method: 'POST',
        body: JSON.stringify({
          reason: 'Inappropriate content',
        }),
      })

      const response = await hideStudy(request, { params: { studyId: 'study-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.adminAction.create).toHaveBeenCalled()
    })

    it('이미 숨겨진 스터디는 에러를 반환한다', async () => {
      const mockStudy = {
        id: 'study-1',
        isHidden: true,
      }

      mockPrisma.study.findUnique.mockResolvedValue(mockStudy)

      const request = new Request('http://localhost:3000/api/admin/studies/study-1/hide', {
        method: 'POST',
        body: JSON.stringify({
          reason: 'Test',
        }),
      })

      const response = await hideStudy(request, { params: { studyId: 'study-1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  // ========================================
  // POST /api/admin/studies/[id]/close - 스터디 종료
  // ========================================

  describe('POST /api/admin/studies/[id]/close', () => {
    it('스터디를 강제 종료할 수 있다', async () => {
      const mockStudy = {
        id: 'study-1',
        name: 'Test Study',
        status: 'ACTIVE',
      }

      mockPrisma.study.findUnique.mockResolvedValue(mockStudy)
      mockPrisma.study.update.mockResolvedValue({
        ...mockStudy,
        status: 'CLOSED',
      })

      const request = new Request('http://localhost:3000/api/admin/studies/study-1/close', {
        method: 'POST',
        body: JSON.stringify({
          reason: 'Policy violation',
        }),
      })

      const response = await closeStudy(request, { params: { studyId: 'study-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.adminAction.create).toHaveBeenCalled()
    })
  })

  // ========================================
  // POST /api/admin/studies/[id]/delete - 스터디 삭제
  // ========================================

  describe('POST /api/admin/studies/[id]/delete', () => {
    it('스터디를 삭제할 수 있다', async () => {
      const mockStudy = {
        id: 'study-1',
        name: 'Test Study',
      }

      mockPrisma.study.findUnique.mockResolvedValue(mockStudy)
      mockPrisma.study.update.mockResolvedValue({
        ...mockStudy,
        deletedAt: new Date(),
      })

      const request = new Request('http://localhost:3000/api/admin/studies/study-1/delete', {
        method: 'POST',
        body: JSON.stringify({
          reason: 'Spam',
        }),
      })

      const response = await deleteStudy(request, { params: { studyId: 'study-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.adminAction.create).toHaveBeenCalled()
    })
  })
})

