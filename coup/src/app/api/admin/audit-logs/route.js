import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin/auth'

const prisma = new PrismaClient()

// GET /api/admin/audit-logs - 감사 로그 목록
export async function GET(request) {
  try {
    // 권한 확인
    const auth = await requireAdmin(request, 'AUDIT_VIEW')
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(request.url)

    // 페이지네이션
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 필터
    const adminId = searchParams.get('adminId')
    const action = searchParams.get('action')
    const targetType = searchParams.get('targetType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // where 조건 생성
    const where = {}

    if (adminId) {
      where.adminId = adminId
    }

    if (action) {
      // action이 와일드카드를 포함하는 경우 (예: "USER_*")
      if (action.endsWith('*')) {
        where.action = {
          startsWith: action.slice(0, -1)
        }
      } else {
        where.action = action
      }
    }

    if (targetType) {
      where.targetType = targetType
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // 로그 조회
    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.adminLog.count({ where })
    ])

    // 관리자 목록 (필터용)
    const admins = await prisma.user.findMany({
      where: {
        adminRole: {
          isNot: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        logs,
        admins,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total
        }
      }
    })

  } catch (error) {
    console.error('❌ GET /api/admin/audit-logs error:', error)
    return NextResponse.json(
      { success: false, error: '감사 로그를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

