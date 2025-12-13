// src/app/api/auth/logout/route.js
import { NextResponse } from "next/server"
import { deleteRefreshToken } from "@/lib/redis"

export async function POST(request) {
  try {
    const refreshToken = request.cookies.get('refresh-token')?.value

    // Redis에서 Refresh Token 삭제
    if (refreshToken) {
      await deleteRefreshToken(refreshToken)
    }

    const response = NextResponse.json({
      success: true,
      message: "로그아웃되었습니다"
    })

    // 쿠키 삭제
    response.cookies.delete('access-token')
    response.cookies.delete('refresh-token')

    return response
  } catch (error) {
    console.error('Logout error:', error)

    // 에러가 발생해도 쿠키는 삭제
    const response = NextResponse.json({
      success: true,
      message: "로그아웃되었습니다"
    })

    response.cookies.delete('access-token')
    response.cookies.delete('refresh-token')

    return response
  }
}

