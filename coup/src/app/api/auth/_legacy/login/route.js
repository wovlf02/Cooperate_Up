// src/app/api/auth/login/route.js
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signAccessToken, generateRefreshToken } from "@/lib/jwt"
import { saveRefreshToken } from "@/lib/redis"

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요" },
        { status: 400 }
      )
    }

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        status: true,
        avatar: true,
        suspendedUntil: true,
        suspendReason: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "가입되지 않은 이메일입니다" },
        { status: 401 }
      )
    }

    // 비밀번호 확인
    if (!user.password) {
      return NextResponse.json(
        { error: "소셜 로그인 계정입니다" },
        { status: 400 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "비밀번호가 일치하지 않습니다" },
        { status: 401 }
      )
    }

    // 계정 상태 확인
    if (user.status === 'SUSPENDED') {
      const message = user.suspendedUntil
        ? `정지된 계정입니다 (${new Date(user.suspendedUntil).toLocaleDateString()}까지)`
        : '정지된 계정입니다'

      return NextResponse.json(
        {
          error: message,
          suspendReason: user.suspendReason
        },
        { status: 403 }
      )
    }

    if (user.status === 'DELETED') {
      return NextResponse.json(
        { error: "삭제된 계정입니다" },
        { status: 403 }
      )
    }

    // lastLoginAt 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Access Token 생성 (15분)
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Refresh Token 생성 및 Redis에 저장 (7일)
    const refreshToken = generateRefreshToken()
    await saveRefreshToken(user.id, refreshToken, 7 * 24 * 60 * 60) // 7일

    // 응답 (password 제외)
    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      success: true,
      message: "로그인 성공",
      user: userWithoutPassword,
      accessToken
    })

    // 쿠키에 토큰 설정
    response.cookies.set('access-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15분
      path: '/'
    })

    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: "로그인 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

