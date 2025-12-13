import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin/auth'

const prisma = new PrismaClient()

// GET /api/admin/settings/history - 설정 변경 이력
export async function GET(request) {
  try {
    // 권한 확인
    const auth = await requireAdmin(request, 'SETTINGS_VIEW')
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 설정 변경 로그 조회
    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where: {
          action: 'SETTINGS_UPDATE'
        },
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
      prisma.adminLog.count({
        where: {
          action: 'SETTINGS_UPDATE'
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        logs: logs.map(log => ({
          id: log.id,
          admin: log.admin,
          settings: log.after?.settings || [],
          reason: log.reason,
          ipAddress: log.ipAddress,
          createdAt: log.createdAt
        })),
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
    console.error('❌ GET /api/admin/settings/history error:', error)
    return NextResponse.json(
      { success: false, error: '설정 이력을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

