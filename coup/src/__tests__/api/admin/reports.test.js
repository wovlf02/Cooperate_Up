/**
 * Admin Reports API 통합 테스트
 *
 * 테스트 범위:
 * - GET /api/admin/reports - 신고 목록 조회
 * - GET /api/admin/reports/[id] - 신고 상세 조회
 * - POST /api/admin/reports/[id]/process - 신고 처리
 */

import { GET as getReports } from '@/app/api/admin/reports/route'
import { GET as getReport } from '@/app/api/admin/reports/[reportId]/route'
import { POST as assignReport } from '@/app/api/admin/reports/[reportId]/assign/route'
import { POST as processReport } from '@/app/api/admin/reports/[reportId]/process/route'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

jest.mock('next-auth')
jest.mock('@prisma/client')

describe('Admin Reports API', () => {
  let mockPrisma
  let mockSession

  beforeEach(() => {
    mockPrisma = {
      report: {
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
      permissions: ['report:view', 'report:manage'],
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ========================================
  // GET /api/admin/reports - 신고 목록 조회
  // ========================================

  describe('GET /api/admin/reports', () => {
    it('관리자가 신고 목록을 조회할 수 있다', async () => {
      const mockReports = [
        {
          id: 'report-1',
          type: 'USER',
          reason: 'SPAM',
          status: 'PENDING',
          createdAt: new Date(),
          reporter: {
            id: 'user-1',
            name: 'Reporter',
          },
          reported: {
            id: 'user-2',
            name: 'Reported User',
          },
        },
        {
          id: 'report-2',
          type: 'STUDY',
          reason: 'INAPPROPRIATE',
          status: 'PENDING',
          createdAt: new Date(),
        },
      ]

      mockPrisma.report.findMany.mockResolvedValue(mockReports)
      mockPrisma.report.count.mockResolvedValue(2)

      const request = new Request('http://localhost:3000/api/admin/reports?page=1&limit=10')

      const response = await getReports(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.reports).toHaveLength(2)
      expect(data.data.pagination.total).toBe(2)
    })

    it('상태별로 신고를 필터링할 수 있다', async () => {
      mockPrisma.report.findMany.mockResolvedValue([])
      mockPrisma.report.count.mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/admin/reports?status=PENDING')

      await getReports(request)

      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING',
          }),
        })
      )
    })

    it('신고 유형별로 필터링할 수 있다', async () => {
      mockPrisma.report.findMany.mockResolvedValue([])
      mockPrisma.report.count.mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/admin/reports?type=USER')

      await getReports(request)

      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'USER',
          }),
        })
      )
    })

    it('처리되지 않은 신고만 조회할 수 있다', async () => {
      mockPrisma.report.findMany.mockResolvedValue([])
      mockPrisma.report.count.mockResolvedValue(0)

      const request = new Request('http://localhost:3000/api/admin/reports?status=PENDING')

      await getReports(request)

      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING',
          }),
        })
      )
    })

    it('권한이 없으면 403 에러를 반환한다', async () => {
      mockPrisma.adminRole.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/admin/reports')

      const response = await getReports(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
    })
  })

  // ========================================
  // GET /api/admin/reports/[id] - 신고 상세 조회
  // ========================================

  describe('GET /api/admin/reports/[id]', () => {
    it('특정 신고의 상세 정보를 조회할 수 있다', async () => {
      const mockReport = {
        id: 'report-1',
        type: 'USER',
        reason: 'SPAM',
        description: 'This user is spamming',
        status: 'PENDING',
        createdAt: new Date(),
        reporter: {
          id: 'user-1',
          name: 'Reporter',
          email: 'reporter@test.com',
        },
        reported: {
          id: 'user-2',
          name: 'Reported User',
          email: 'reported@test.com',
        },
      }

      mockPrisma.report.findUnique.mockResolvedValue(mockReport)

      const request = new Request('http://localhost:3000/api/admin/reports/report-1')

      const response = await getReport(request, { params: { reportId: 'report-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.id).toBe('report-1')
      expect(data.data.type).toBe('USER')
    })

    it('존재하지 않는 신고는 404 에러를 반환한다', async () => {
      mockPrisma.report.findUnique.mockResolvedValue(null)

      const request = new Request('http://localhost:3000/api/admin/reports/non-existent')

      const response = await getReport(request, { params: { reportId: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
    })
  })

  // ========================================
  // POST /api/admin/reports/[id]/assign - 신고 할당
  // ========================================

  describe('POST /api/admin/reports/[id]/assign', () => {
    it('신고를 관리자에게 할당할 수 있다', async () => {
      const mockReport = {
        id: 'report-1',
        status: 'PENDING',
        assignedTo: null,
      }

      mockPrisma.report.findUnique.mockResolvedValue(mockReport)
      mockPrisma.report.update.mockResolvedValue({
        ...mockReport,
        assignedTo: 'admin-user-id',
        status: 'IN_PROGRESS',
      })

      const request = new Request('http://localhost:3000/api/admin/reports/report-1/assign', {
        method: 'POST',
        body: JSON.stringify({
          assignedTo: 'admin-user-id',
        }),
      })

      const response = await assignReport(request, { params: { reportId: 'report-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.adminAction.create).toHaveBeenCalled()
    })
  })

  // ========================================
  // POST /api/admin/reports/[id]/process - 신고 처리
  // ========================================

  describe('POST /api/admin/reports/[id]/process', () => {
    it('신고를 승인 처리할 수 있다', async () => {
      const mockReport = {
        id: 'report-1',
        type: 'USER',
        reportedId: 'user-2',
        status: 'PENDING',
      }

      mockPrisma.report.findUnique.mockResolvedValue(mockReport)
      mockPrisma.report.update.mockResolvedValue({
        ...mockReport,
        status: 'APPROVED',
        processedAt: new Date(),
      })

      const request = new Request('http://localhost:3000/api/admin/reports/report-1/process', {
        method: 'POST',
        body: JSON.stringify({
          action: 'APPROVE',
          comment: 'Valid report',
        }),
      })

      const response = await processReport(request, { params: { reportId: 'report-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.adminAction.create).toHaveBeenCalled()
    })

    it('신고를 거절 처리할 수 있다', async () => {
      const mockReport = {
        id: 'report-1',
        status: 'PENDING',
      }

      mockPrisma.report.findUnique.mockResolvedValue(mockReport)
      mockPrisma.report.update.mockResolvedValue({
        ...mockReport,
        status: 'REJECTED',
      })

      const request = new Request('http://localhost:3000/api/admin/reports/report-1/process', {
        method: 'POST',
        body: JSON.stringify({
          action: 'REJECT',
          comment: 'Invalid report',
        }),
      })

      const response = await processReport(request, { params: { reportId: 'report-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('이미 처리된 신고는 에러를 반환한다', async () => {
      const mockReport = {
        id: 'report-1',
        status: 'APPROVED',
      }

      mockPrisma.report.findUnique.mockResolvedValue(mockReport)

      const request = new Request('http://localhost:3000/api/admin/reports/report-1/process', {
        method: 'POST',
        body: JSON.stringify({
          action: 'APPROVE',
        }),
      })

      const response = await processReport(request, { params: { reportId: 'report-1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  // ========================================
  // 예외 처리 테스트
  // ========================================

  describe('Exception Handling', () => {
    it('잘못된 신고 상태는 검증 에러를 반환한다', async () => {
      const request = new Request('http://localhost:3000/api/admin/reports?status=INVALID_STATUS')

      const response = await getReports(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('잘못된 액션은 검증 에러를 반환한다', async () => {
      const mockReport = {
        id: 'report-1',
        status: 'PENDING',
      }

      mockPrisma.report.findUnique.mockResolvedValue(mockReport)

      const request = new Request('http://localhost:3000/api/admin/reports/report-1/process', {
        method: 'POST',
        body: JSON.stringify({
          action: 'INVALID_ACTION',
        }),
      })

      const response = await processReport(request, { params: { reportId: 'report-1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })
})

