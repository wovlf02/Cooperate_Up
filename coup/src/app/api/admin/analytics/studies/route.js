/**
 * 관리자 - 스터디 분석 API
 * GET /api/admin/analytics/studies
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

    // 1. 생성 추이
    const creationTrend = await getCreationTrend(startDate, now, period)

    // 2. 카테고리별 분포
    const categoryDistribution = await getCategoryDistribution()

    // 3. 멤버십 통계
    const membershipStats = await getMembershipStats()

    // 4. 활성 비율
    const activeRatio = await getActiveRatio()

    // 5. 공개/비공개 분포
    const visibilityDistribution = await getVisibilityDistribution()

    // 6. 모집 현황
    const recruitmentStatus = await getRecruitmentStatus()

    // 관리자 로그 기록
    await logAdminAction({
      adminId: auth.adminRole.userId,
      action: 'ANALYTICS_VIEW',
      targetType: 'Analytics',
      targetId: 'studies',
      request,
    })

    return NextResponse.json({
      success: true,
      data: {
        creationTrend,
        categoryDistribution,
        membershipStats,
        activeRatio,
        visibilityDistribution,
        recruitmentStatus
      }
    })

  } catch (error) {
    console.error('❌ 스터디 분석 조회 실패:', error)
    return NextResponse.json(
      {
        success: false,
        error: '스터디 분석을 조회하는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * 생성 추이 조회
 */
async function getCreationTrend(startDate, endDate, period) {
  const studies = await prisma.study.findMany({
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
    return aggregateByMonth(studies, 'createdAt')
  } else if (period === 'weekly') {
    return aggregateByWeek(studies, 'createdAt', startDate, endDate)
  } else {
    return aggregateByDate(studies, 'createdAt', startDate, endDate)
  }
}

/**
 * 카테고리별 분포
 */
async function getCategoryDistribution() {
  const result = await prisma.study.groupBy({
    by: ['category'],
    _count: true,
    orderBy: {
      _count: {
        category: 'desc'
      }
    }
  })

  return result.map(item => ({
    category: item.category,
    count: item._count,
    name: getCategoryName(item.category)
  }))
}

/**
 * 멤버십 통계
 */
async function getMembershipStats() {
  // 각 스터디의 멤버 수 조회
  const studies = await prisma.study.findMany({
    select: {
      _count: {
        select: {
          members: true
        }
      }
    }
  })

  const memberCounts = studies.map(s => s._count.members)

  if (memberCounts.length === 0) {
    return { avg: 0, min: 0, max: 0, total: 0 }
  }

  const total = memberCounts.reduce((sum, count) => sum + count, 0)
  const avg = Math.round(total / memberCounts.length * 10) / 10
  const min = Math.min(...memberCounts)
  const max = Math.max(...memberCounts)

  return { avg, min, max, total }
}

/**
 * 활성 비율 계산
 */
async function getActiveRatio() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [totalStudies, activeStudies] = await Promise.all([
    prisma.study.count(),
    // 최근 30일 내에 메시지가 있는 스터디를 활성으로 간주
    prisma.study.count({
      where: {
        messages: {
          some: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        }
      }
    })
  ])

  const ratio = totalStudies > 0
    ? Math.round((activeStudies / totalStudies) * 100)
    : 0

  return {
    total: totalStudies,
    active: activeStudies,
    inactive: totalStudies - activeStudies,
    ratio
  }
}

/**
 * 공개/비공개 분포
 */
async function getVisibilityDistribution() {
  const [publicStudies, privateStudies] = await Promise.all([
    prisma.study.count({
      where: { isPublic: true }
    }),
    prisma.study.count({
      where: { isPublic: false }
    })
  ])

  return [
    { type: 'public', name: '공개', count: publicStudies },
    { type: 'private', name: '비공개', count: privateStudies }
  ]
}

/**
 * 모집 현황
 */
async function getRecruitmentStatus() {
  const [recruiting, notRecruiting] = await Promise.all([
    prisma.study.count({
      where: { isRecruiting: true }
    }),
    prisma.study.count({
      where: { isRecruiting: false }
    })
  ])

  return [
    { type: 'recruiting', name: '모집중', count: recruiting },
    { type: 'closed', name: '모집마감', count: notRecruiting }
  ]
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
 * 카테고리 이름 변환
 */
function getCategoryName(category) {
  const names = {
    'STUDY': '공부',
    'PROJECT': '프로젝트',
    'READING': '독서',
    'EXERCISE': '운동',
    'HOBBY': '취미',
    'LANGUAGE': '언어',
    'CAREER': '커리어',
    'OTHER': '기타'
  }
  return names[category] || category
}

