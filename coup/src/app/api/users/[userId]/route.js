// src/app/api/users/[userId]/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/users/{userId}
 * 사용자 상세 정보 조회 (공개 프로필)
 */
export async function GET(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { userId } = await params

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            studyMembers: {
              where: { status: 'ACTIVE' }
            },
            tasks: true,
            messages: true,
            createdNotices: true
          }
        },
        studyMembers: {
          where: {
            status: 'ACTIVE'
          },
          take: 6, // 최근 6개 스터디만
          orderBy: {
            joinedAt: 'desc'
          },
          select: {
            role: true,
            joinedAt: true,
            study: {
              select: {
                id: true,
                name: true,
                emoji: true,
                category: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 비활성 사용자는 조회 불가
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 응답 데이터 포맷팅
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      stats: {
        studyCount: user._count.studyMembers,
        taskCount: user._count.tasks,
        messageCount: user._count.messages,
        noticeCount: user._count.createdNotices
      },
      recentStudies: user.studyMembers.map(member => ({
        studyId: member.study.id,
        studyName: member.study.name,
        studyEmoji: member.study.emoji,
        category: member.study.category,
        role: member.role,
        joinedAt: member.joinedAt
      }))
    }

    return NextResponse.json({
      success: true,
      data: userData
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: "사용자 정보를 조회하는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

