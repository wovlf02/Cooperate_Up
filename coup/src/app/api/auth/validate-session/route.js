// src/app/api/auth/validate-session/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  AUTH_ERRORS,
  createAuthErrorResponse,
  logAuthError
} from '@/lib/exceptions/auth-errors'

/**
 * 세션 유효성 검증 API
 * 클라이언트에서 세션이 실제로 유효한지 확인할 때 사용
 */
export async function GET() {
  try {
    // 1. 세션 조회
    let session
    try {
      session = await getServerSession(authOptions)
    } catch (sessionError) {
      logAuthError('validate-session - getServerSession', sessionError)
      const errorResponse = createAuthErrorResponse('INVALID_SESSION')
      return NextResponse.json(
        {
          valid: false,
          error: errorResponse.error,
          message: errorResponse.message
        },
        { status: errorResponse.statusCode }
      )
    }

    // 2. 세션 존재 확인
    if (!session || !session.user || !session.user.id) {
      console.log('⚠️ [VALIDATE] 세션 없음')
      const errorResponse = createAuthErrorResponse('NO_SESSION')
      return NextResponse.json(
        {
          valid: false,
          error: errorResponse.error,
          message: errorResponse.message,
          shouldLogout: false
        },
        { status: 200 } // 세션 없음은 200으로 반환 (정상 상태)
      )
    }

    // 3. DB에서 사용자 확인
    let user
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          avatar: true,
        }
      })
    } catch (dbError) {
      logAuthError('validate-session - DB 조회', dbError, {
        userId: session.user.id
      })
      const errorResponse = createAuthErrorResponse('DB_QUERY_ERROR')
      return NextResponse.json(
        {
          valid: false,
          error: errorResponse.error,
          message: errorResponse.message
        },
        { status: errorResponse.statusCode }
      )
    }

    // 4. 사용자 존재 확인
    if (!user) {
      console.warn(`⚠️ [VALIDATE] 사용자 없음: ${session.user.id}`)
      const errorResponse = createAuthErrorResponse('ACCOUNT_DELETED')
      return NextResponse.json(
        {
          valid: false,
          error: errorResponse.error,
          message: errorResponse.message,
          shouldLogout: true // 클라이언트에서 로그아웃 처리 필요
        },
        { status: 200 }
      )
    }

    // 5. 계정 상태 확인
    if (user.status === 'DELETED') {
      console.warn(`⚠️ [VALIDATE] 삭제된 계정: ${user.id}`)
      const errorResponse = createAuthErrorResponse('ACCOUNT_DELETED')
      return NextResponse.json(
        {
          valid: false,
          error: errorResponse.error,
          message: errorResponse.message,
          shouldLogout: true
        },
        { status: 200 }
      )
    }

    if (user.status === 'SUSPENDED') {
      console.warn(`⚠️ [VALIDATE] 정지된 계정: ${user.id}`)
      const errorResponse = createAuthErrorResponse('ACCOUNT_SUSPENDED')
      return NextResponse.json(
        {
          valid: false,
          error: errorResponse.error,
          message: errorResponse.message,
          shouldLogout: true
        },
        { status: 200 }
      )
    }

    if (user.status !== 'ACTIVE') {
      console.warn(`⚠️ [VALIDATE] 비활성 계정: ${user.id}, status: ${user.status}`)
      return NextResponse.json(
        {
          valid: false,
          error: 'INACTIVE_ACCOUNT',
          message: `계정 상태: ${user.status}`,
          shouldLogout: true
        },
        { status: 200 }
      )
    }

    // 6. 유효한 세션
    console.log('✅ [VALIDATE] 유효한 세션:', {
      userId: user.id,
      email: user.email,
      status: user.status
    })

    return NextResponse.json(
      {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          avatar: user.avatar,
        }
      },
      { status: 200 }
    )

  } catch (error) {
    // 최상위 예외 처리
    logAuthError('validate-session - 최상위', error)

    const errorResponse = createAuthErrorResponse('UNKNOWN_ERROR')
    return NextResponse.json(
      {
        valid: false,
        error: errorResponse.error,
        message: errorResponse.message
      },
      { status: errorResponse.statusCode }
    )
  }
}

