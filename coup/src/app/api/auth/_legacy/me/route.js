// src/app/api/auth/me/route.js
import { NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    // 쿠키에서 토큰 가져오기
    const token = request.cookies.get('access-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      )
    }

    // JWT 검증
    const decoded = verifyAccessToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다" },
        { status: 401 }
      )
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        bio: true,
        createdAt: true,
        lastLoginAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: "비활성화된 계정입니다" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Get me error:', error)
    return NextResponse.json(
      { error: "인증 확인 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

