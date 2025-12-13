// src/lib/auth-helpers.js
import { NextResponse } from "next/server"
import { prisma } from "./prisma"
import { verifyAccessToken } from "./jwt"
import { cookies } from "next/headers"

/**
 * 세션 가져오기 (Server Component용)
 * 로그인되지 않은 경우 null 반환
 */
export async function getSession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access-token')?.value

    if (!token) {
      return null
    }

    const decoded = verifyAccessToken(token)
    if (!decoded) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        bio: true
      }
    })

    if (!user || user.status !== 'ACTIVE') {
      return null
    }

    return { user }
  } catch (error) {
    console.error('getSession error:', error)
    return null
  }
}

/**
 * 로그인 확인 (JWT 기반)
 * API Route에서 사용
 */
export async function requireAuth() {
  // JWT 토큰 확인 (Next.js 15: cookies()는 Promise)
  const cookieStore = await cookies()
  const token = cookieStore.get('access-token')?.value

  if (!token) {
    return NextResponse.json(
      { error: "로그인이 필요합니다" },
      { status: 401 }
    )
  }

  const decoded = verifyAccessToken(token)
  if (!decoded) {
    return NextResponse.json(
      { error: "유효하지 않은 토큰입니다" },
      { status: 401 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      status: true,
      bio: true
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

  return { user }
}

/**
 * 관리자 확인
 */
export async function requireAdmin() {
  const result = await requireAuth()

  if (result instanceof NextResponse) return result

  if (!['ADMIN', 'SYSTEM_ADMIN'].includes(result.user.role)) {
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다" },
      { status: 403 }
    )
  }

  return result
}

/**
 * 스터디 멤버 확인
 * @param {string} studyId - 스터디 ID
 * @param {string} minRole - 최소 요구 역할 (MEMBER, ADMIN, OWNER)
 */
export async function requireStudyMember(studyId, minRole = 'MEMBER') {
  const result = await requireAuth()
  if (result instanceof NextResponse) return result

  const member = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: {
        studyId,
        userId: result.user.id
      }
    }
  })

  if (!member || member.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: "스터디 멤버가 아닙니다" },
      { status: 403 }
    )
  }

  // 역할 확인
  const roleHierarchy = { MEMBER: 0, ADMIN: 1, OWNER: 2 }
  if (roleHierarchy[member.role] < roleHierarchy[minRole]) {
    return NextResponse.json(
      { error: "권한이 부족합니다" },
      { status: 403 }
    )
  }

  return { session: result, member }
}
