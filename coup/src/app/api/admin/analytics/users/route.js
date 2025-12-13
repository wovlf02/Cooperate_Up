/**
 * 관리자 - 사용자 분석 API
 * GET /api/admin/analytics/users
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin, logAdminAction } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

const prisma = new PrismaClient()

export async function GET(request) {
  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.ANALYTICS_VIEW)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'daily' // daily, weekly, monthly
    const range = parseInt(searchParams.get('range') || '30') // 기간

    // 날짜 범위 설정
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - range)

    // 1. 가입 추이
    const signupTrend = await getSignupTrend(startDate, now, period)

    // 2. 가입 방식 분포
    const providerDistribution = await getProviderDistribution()

    // 3. 활동 메트릭
    const activityMetrics = await getActivityMetrics()

    // 4. 제재 현황
    const sanctions = await getSanctions()

    // 5. 상태별 사용자 수
    const statusDistribution = await getStatusDistribution()

    // 6. 평균 세션 시간 (더미 데이터 - 추후 구현)
    const avgSessionTime = '12분 34초'

    // 관리자 로그 기록
    await logAdminAction({
      adminId: auth.adminRole.userId,
      action: 'ANALYTICS_VIEW',
      targetType: 'Analytics',
      targetId: 'users',
      request,
    })

    return NextResponse.json({
      success: true,
      data: {
        signupTrend,
        providerDistribution,
        activityMetrics,
        sanctions,
        statusDistribution,
        avgSessionTime
      }
    })

  } catch (error) {
    console.error('❌ 사용자 분석 조회 실패:', error)
    return NextResponse.json(
      {
        success: false,
        error: '사용자 분석을 조회하는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * 가입 추이 조회
 */
async function getSignupTrend(startDate, endDate, period) {
  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      createdAt: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  if (period === 'monthly') {
    return aggregateByMonth(users, 'createdAt')
  } else if (period === 'weekly') {
    return aggregateByWeek(users, 'createdAt', startDate, endDate)
  } else {
    return aggregateByDate(users, 'createdAt', startDate, endDate)
  }
}

/**
 * 가입 방식 분포
 */
async function getProviderDistribution() {
  const result = await prisma.user.groupBy({
    by: ['provider'],
    _count: true
  })

  return result.map(item => ({
    provider: item.provider || 'email',
    count: item._count,
    name: getProviderName(item.provider)
  }))
}

/**
 * 활동 메트릭 (DAU, WAU, MAU)
 */
async function getActivityMetrics() {
  const now = new Date()

  // DAU (Daily Active Users) - 최근 24시간
  const oneDayAgo = new Date(now)
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  // WAU (Weekly Active Users) - 최근 7일
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // MAU (Monthly Active Users) - 최근 30일
  const oneMonthAgo = new Date(now)
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)

  const [dau, wau, mau] = await Promise.all([
    prisma.user.count({
      where: {
        lastLoginAt: {
          gte: oneDayAgo
        }
      }
    }),
    prisma.user.count({
      where: {
        lastLoginAt: {
          gte: oneWeekAgo
        }
      }
    }),
    prisma.user.count({
      where: {
        lastLoginAt: {
          gte: oneMonthAgo
        }
      }
    })
  ])

  return { dau, wau, mau }
}

/**
 * 제재 현황
 */
async function getSanctions() {
  const [warnings, suspensions, bans] = await Promise.all([
    // 경고를 받은 사용자 수 (receivedWarnings relation 사용)
    prisma.user.count({
      where: {
        receivedWarnings: {
          some: {}  // 경고가 하나라도 있는 사용자
        }
      }
    }),
    // 정지된 사용자
    prisma.user.count({
      where: {
        status: 'SUSPENDED'
      }
    }),
    // 영구 정지된 사용자
    prisma.user.count({
      where: {
        status: 'SUSPENDED',
        suspendedUntil: null
      }
    })
  ])

  return { warnings, suspensions, bans }
}

/**
 * 상태별 사용자 수
 */
async function getStatusDistribution() {
  const result = await prisma.user.groupBy({
    by: ['status'],
    _count: true
  })

  return result.map(item => ({
    status: item.status,
    count: item._count,
    name: getStatusName(item.status)
  }))
}

/**
 * 월별 집계
 */
function aggregateByMonth(data, dateField) {
  const monthMap = new Map()

  data.forEach(item => {
    const date = new Date(item[dateField])
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, (monthMap.get(key) || 0) + 1)
  })

  return Array.from(monthMap.entries())
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))
}

/**
 * 주별 집계
 */
function aggregateByWeek(data, dateField, startDate, endDate) {
  const weekMap = new Map()
  const current = new Date(startDate)

  // 주 시작일 기준으로 맵 초기화
  while (current <= endDate) {
    const weekStart = getWeekStart(current)
    const key = formatDate(weekStart)
    if (!weekMap.has(key)) {
      weekMap.set(key, 0)
    }
    current.setDate(current.getDate() + 7)
  }

  // 데이터 카운트
  data.forEach(item => {
    const date = new Date(item[dateField])
    const weekStart = getWeekStart(date)
    const key = formatDate(weekStart)
    if (weekMap.has(key)) {
      weekMap.set(key, weekMap.get(key) + 1)
    }
  })

  return Array.from(weekMap.entries())
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period))
}

/**
 * 일별 집계
 */
function aggregateByDate(data, dateField, startDate, endDate) {
  const dateMap = new Map()
  const current = new Date(startDate)

  while (current <= endDate) {
    const dateStr = formatDate(current)
    dateMap.set(dateStr, 0)
    current.setDate(current.getDate() + 1)
  }

  data.forEach(item => {
    const dateStr = formatDate(item[dateField])
    if (dateMap.has(dateStr)) {
      dateMap.set(dateStr, dateMap.get(dateStr) + 1)
    }
  })

  return Array.from(dateMap.entries()).map(([period, count]) => ({
    period,
    count
  }))
}

/**
 * 주 시작일 구하기 (월요일 기준)
 */
function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 월요일로 조정
  return new Date(d.setDate(diff))
}

/**
 * 날짜 포맷 (YYYY-MM-DD)
 */
function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Provider 이름 변환
 */
function getProviderName(provider) {
  const names = {
    'email': '이메일',
    'google': 'Google',
    'github': 'GitHub'
  }
  return names[provider] || provider
}

/**
 * 상태 이름 변환
 */
function getStatusName(status) {
  const names = {
    'ACTIVE': '활성',
    'SUSPENDED': '정지',
    'DELETED': '삭제'
  }
  return names[status] || status
}

