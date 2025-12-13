import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin/auth'

const prisma = new PrismaClient()

// CSV 변환 함수
function convertToCSV(logs) {
  const headers = ['일시', '관리자', '이메일', '액션', '대상 타입', '대상 ID', 'IP 주소', '사유']

  const rows = logs.map(log => [
    new Date(log.createdAt).toLocaleString('ko-KR'),
    log.admin.name || '알 수 없음',
    log.admin.email,
    log.action,
    log.targetType || '-',
    log.targetId || '-',
    log.ipAddress || '-',
    log.reason || '-'
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  // UTF-8 BOM 추가 (Excel에서 한글 깨짐 방지)
  return '\uFEFF' + csv
}

// GET /api/admin/audit-logs/export - 감사 로그 내보내기
export async function GET(request) {
  try {
    // 권한 확인
    const auth = await requireAdmin(request, 'AUDIT_EXPORT')
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(request.url)

    // 필터 (동일한 조건 적용)
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

    // 최대 10,000건까지만 내보내기
    const logs = await prisma.adminLog.findMany({
      where,
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10000
    })

    // CSV 변환
    const csv = convertToCSV(logs)

    // 감사 로그 기록
    await prisma.adminLog.create({
      data: {
        adminId: auth.adminId,
        action: 'AUDIT_EXPORT',
        reason: `${logs.length}건의 감사 로그 내보내기`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    // CSV 파일로 응답
    const fileName = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })

  } catch (error) {
    console.error('❌ GET /api/admin/audit-logs/export error:', error)
    return NextResponse.json(
      { success: false, error: '감사 로그 내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

