// src/lib/auth-helpers.js
import { NextResponse } from "next/server"
import { prisma } from "./prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import {
  AUTH_ERRORS,
  createAuthErrorResponse,
  logAuthError
} from "./exceptions/auth-errors"

/**
 * 세션 가져오기 (Server Component용)
 * 로그인되지 않은 경우 null 반환
 */
export async function getSession() {
  try {
    const session = await getServerSession(authOptions)
    return session
  } catch (error) {
    console.error('getSession error:', error)
    return null
  }
}

/**
 * 로그인 확인 (NextAuth 기반)
 * API Route에서 사용
 */
export async function requireAuth() {
  try {
    // 1. 세션 조회
    let session
    try {
      session = await getServerSession(authOptions)
    } catch (sessionError) {
      logAuthError('requireAuth - getServerSession', sessionError)
      const errorResponse = createAuthErrorResponse('INVALID_SESSION')
      return NextResponse.json(
        { error: errorResponse.code, message: errorResponse.message },
        { status: errorResponse.statusCode }
      )
    }

    // 2. 세션 검증
    if (!session || !session.user || !session.user.id) {
      console.warn('⚠️ [AUTH] requireAuth: 세션 없음')
      const errorResponse = createAuthErrorResponse('NO_SESSION')
      return NextResponse.json(
        { error: errorResponse.code, message: errorResponse.message },
        { status: errorResponse.statusCode }
      )
    }

    // 3. 데이터베이스에서 사용자 확인 (실제 검증)
    let user
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          status: true,
          provider: true
        }
      })
    } catch (dbError) {
      logAuthError('requireAuth - DB 조회', dbError, {
        userId: session.user.id
      })
      const errorResponse = createAuthErrorResponse('DB_QUERY_ERROR')
      return NextResponse.json(
        { error: errorResponse.code, message: errorResponse.message },
        { status: errorResponse.statusCode }
      )
    }

    // 4. 사용자 존재 확인
    if (!user) {
      console.warn(`⚠️ [AUTH] requireAuth: 사용자 없음 ${session.user.id}`)
      const errorResponse = createAuthErrorResponse('NO_SESSION')
      return NextResponse.json(
        { error: errorResponse.code, message: errorResponse.message },
        { status: errorResponse.statusCode }
      )
    }

    // 5. 계정 상태 확인
    if (user.status === 'DELETED') {
      console.warn(`⚠️ [AUTH] requireAuth: 삭제된 계정 ${user.id}`)
      const errorResponse = createAuthErrorResponse('ACCOUNT_DELETED')
      return NextResponse.json(
        { error: errorResponse.code, message: errorResponse.message },
        { status: errorResponse.statusCode }
      )
    }

    if (user.status === 'SUSPENDED') {
      console.warn(`⚠️ [AUTH] requireAuth: 정지된 계정 ${user.id}`)
      const errorResponse = createAuthErrorResponse('ACCOUNT_SUSPENDED')
      return NextResponse.json(
        { error: errorResponse.code, message: errorResponse.message },
        { status: errorResponse.statusCode }
      )
    }

    if (user.status !== 'ACTIVE') {
      console.warn(`⚠️ [AUTH] requireAuth: 비활성 계정 ${user.id}, status: ${user.status}`)
      return NextResponse.json(
        { error: 'INACTIVE_ACCOUNT', message: `계정 상태: ${user.status}` },
        { status: 403 }
      )
    }

    // 6. 최신 사용자 정보 반환
    console.log('✅ [AUTH] requireAuth: 인증 성공', {
      userId: user.id,
      email: user.email
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatar,
        role: user.role,
        status: user.status,
        provider: user.provider
      }
    }

  } catch (error) {
    // 최상위 예외 처리
    logAuthError('requireAuth - 최상위', error)

    const errorResponse = createAuthErrorResponse('UNKNOWN_ERROR')
    return NextResponse.json(
      { error: errorResponse.code, message: errorResponse.message },
      { status: errorResponse.statusCode }
    )
  }
}

/**
 * 스터디 멤버 확인
 * @param {string} studyId - 스터디 ID
 * @param {string} minRole - 최소 요구 역할 (MEMBER, OWNER)
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

  // 역할 확인 (MEMBER < ADMIN < OWNER)
  const roleHierarchy = { MEMBER: 0, ADMIN: 1, OWNER: 2 }
  if ((roleHierarchy[member.role] ?? 0) < (roleHierarchy[minRole] ?? 0)) {
    return NextResponse.json(
      { error: "권한이 부족합니다" },
      { status: 403 }
    )
  }

  return { session: result, member }
}

/**
 * 현재 사용자 정보 가져오기 (상세 정보 포함)
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      bio: true,
      role: true,
      status: true,
      provider: true,
      createdAt: true,
      lastLoginAt: true
    }
  })

  return user
}
