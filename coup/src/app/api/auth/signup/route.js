// src/app/api/auth/signup/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import {
  AUTH_ERRORS,
  createAuthErrorResponse,
  logAuthError
} from "@/lib/exceptions/auth-errors"
import {
  validateSignupData,
  sanitizeEmail,
  sanitizeInput
} from "@/lib/exceptions/validation-helpers"

// 유효성 검사 스키마
const signupSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다"),
  avatar: z.string().url().optional().nullable(),
})

export async function POST(request) {
  try {
    // 1. 요청 본문 파싱
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      logAuthError('signup - JSON 파싱', parseError)
      const errorResponse = createAuthErrorResponse('UNKNOWN_ERROR', {
        message: '잘못된 요청 형식입니다'
      })
      return NextResponse.json(
        { error: errorResponse.error, message: errorResponse.message },
        { status: 400 }
      )
    }

    // 2. 입력값 정제
    const sanitizedData = {
      email: sanitizeEmail(body.email || ''),
      password: body.password || '',
      name: sanitizeInput(body.name || ''),
      avatar: body.avatar || null,
    }

    // 3. 유효성 검사 (Zod + 커스텀)
    let validatedData
    try {
      validatedData = signupSchema.parse(sanitizedData)
    } catch (zodError) {
      console.log('❌ [SIGNUP] Zod 검증 실패:', zodError.errors)

      // Zod 에러를 사용자 친화적 메시지로 변환
      const firstError = zodError.errors[0]
      let errorResponse

      if (firstError.path[0] === 'email') {
        errorResponse = createAuthErrorResponse('INVALID_EMAIL_FORMAT')
      } else if (firstError.path[0] === 'password') {
        errorResponse = createAuthErrorResponse('PASSWORD_TOO_SHORT')
      } else {
        errorResponse = {
          error: 'VALIDATION_ERROR',
          message: firstError.message,
          statusCode: 400
        }
      }

      return NextResponse.json(
        { error: errorResponse.error, message: errorResponse.message },
        { status: errorResponse.statusCode }
      )
    }

    // 커스텀 유효성 검사
    const customValidation = validateSignupData(validatedData)
    if (!customValidation.valid) {
      const firstErrorKey = Object.keys(customValidation.errors)[0]
      const errorMessage = customValidation.errors[firstErrorKey]

      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: errorMessage,
          field: firstErrorKey
        },
        { status: 400 }
      )
    }

    // 4. 이메일 중복 확인
    let existingUser
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
        select: {
          id: true,
          email: true,
          status: true,
          provider: true
        }
      })
    } catch (dbError) {
      logAuthError('signup - 이메일 중복 확인', dbError, {
        email: validatedData.email
      })
      const errorResponse = createAuthErrorResponse('DB_CONNECTION_ERROR')
      return NextResponse.json(
        { error: errorResponse.error, message: errorResponse.message },
        { status: errorResponse.statusCode }
      )
    }

    if (existingUser) {
      console.log('❌ [SIGNUP] 이메일 중복:', validatedData.email)

      // 보안: 계정 상태를 노출하지 않음
      const errorResponse = createAuthErrorResponse('EMAIL_ALREADY_EXISTS')
      return NextResponse.json(
        { error: errorResponse.error, message: errorResponse.message },
        { status: errorResponse.statusCode }
      )
    }

    // 5. 비밀번호 해싱
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(validatedData.password, 10)
    } catch (hashError) {
      logAuthError('signup - 비밀번호 해싱', hashError)
      const errorResponse = createAuthErrorResponse('UNKNOWN_ERROR', {
        message: '비밀번호 처리 중 오류가 발생했습니다'
      })
      return NextResponse.json(
        { error: errorResponse.error, message: errorResponse.message },
        { status: 500 }
      )
    }

    // 6. 사용자 생성
    let user
    try {
      user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          avatar: validatedData.avatar,
          provider: 'CREDENTIALS',
          role: 'USER',
          status: 'ACTIVE',
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          status: true,
          createdAt: true,
        }
      })
    } catch (dbError) {
      logAuthError('signup - 사용자 생성', dbError, {
        email: validatedData.email
      })

      // Prisma 에러 코드 체크
      if (dbError.code === 'P2002') {
        // Unique constraint 위반 (이중 체크에서 놓친 경우)
        const errorResponse = createAuthErrorResponse('EMAIL_ALREADY_EXISTS')
        return NextResponse.json(
          { error: errorResponse.error, message: errorResponse.message },
          { status: errorResponse.statusCode }
        )
      }

      const errorResponse = createAuthErrorResponse('DB_QUERY_ERROR')
      return NextResponse.json(
        { error: errorResponse.error, message: errorResponse.message },
        { status: errorResponse.statusCode }
      )
    }

    console.log('✅ [SIGNUP] 회원가입 성공:', {
      userId: user.id,
      email: user.email
    })

    // 7. 회원가입 성공 - 클라이언트에서 signIn() 호출 필요
    return NextResponse.json(
      {
        success: true,
        message: "회원가입이 완료되었습니다",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    // 최상위 예외 처리
    logAuthError('signup - 최상위', error)

    const errorResponse = createAuthErrorResponse('UNKNOWN_ERROR')
    return NextResponse.json(
      { error: errorResponse.error, message: errorResponse.message },
      { status: errorResponse.statusCode }
    )
  }
}

