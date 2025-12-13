// src/app/api/studies/[id]/chat/search/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/studies/{id}/chat/search?q=keyword&startDate=...&endDate=...&userId=...
 * 스터디 내 메시지 검색
 */
export async function GET(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const startDate = searchParams.get('startDate') // YYYY-MM-DD
    const endDate = searchParams.get('endDate') // YYYY-MM-DD
    const userId = searchParams.get('userId') // 특정 사용자 메시지만
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 검색 조건 생성
    let whereClause = {
      studyId
    }

    // 검색어 필터 (메시지 내용)
    if (query) {
      whereClause.content = {
        contains: query,
        mode: 'insensitive'
      }
    }

    // 날짜 범위 필터
    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        const endDateTime = new Date(endDate)
        endDateTime.setHours(23, 59, 59, 999)
        whereClause.createdAt.lte = endDateTime
      }
    }

    // 사용자 필터
    if (userId) {
      whereClause.userId = userId
    }

    // 총 개수
    const total = await prisma.message.count({ where: whereClause })

    // 메시지 검색
    const messages = await prisma.message.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        file: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
            size: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      query: {
        keyword: query,
        startDate: startDate || null,
        endDate: endDate || null,
        userId: userId || null
      }
    })

  } catch (error) {
    console.error('Message search error:', error)
    return NextResponse.json(
      { error: "메시지 검색 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

