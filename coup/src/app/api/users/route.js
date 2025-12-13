// src/app/api/users/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/users?q=keyword&page=1&limit=20&role=USER
 * 사용자 검색 API
 */
export async function GET(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role') // USER, ADMIN, SYSTEM_ADMIN
    const skip = (page - 1) * limit

    // 검색 조건 생성
    let whereClause = {
      status: 'ACTIVE', // 활성 사용자만
    }

    // 역할 필터
    if (role) {
      whereClause.role = role
    }

    // 검색어가 있는 경우
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ]
    }

    // 총 개수 조회
    const total = await prisma.user.count({ where: whereClause })

    // 사용자 목록 조회
    const users = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            studyMembers: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })

    // 응답 데이터 포맷팅
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      studyCount: user._count.studyMembers
    }))

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json(
      { error: "사용자 검색 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

