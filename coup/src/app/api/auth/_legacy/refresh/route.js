// src/app/api/auth/refresh/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { signAccessToken } from "@/lib/jwt"
import { getRefreshToken } from "@/lib/redis"

export async function POST(request) {
  try {
    const refreshToken = request.cookies.get('refresh-token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token이 없습니다" },
        { status: 401 }
      )
    }

    // Redis에서 Refresh Token 검증
    const userId = await getRefreshToken(refreshToken)

    if (!userId) {
      return NextResponse.json(
        { error: "유효하지 않거나 만료된 refresh token입니다" },
        { status: 401 }
      )
    }

    // 사용자 정보 가져오기
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true
      }
    })

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없거나 비활성화된 계정입니다" },
        { status: 404 }
      )
    }

    // 새로운 Access Token 발급
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      user
    })

    // 새로운 Access Token을 쿠키에 설정
    response.cookies.set('access-token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15분
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: "토큰 갱신 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

