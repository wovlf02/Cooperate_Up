// src/app/api/users/me/password/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { ProfileException } from "@/lib/exceptions/profile"
import { logProfileError, logPasswordChange } from "@/lib/loggers/profile"
import {
  validatePasswordStrength,
  validatePasswordMatch
} from "@/lib/utils/profile"

export async function PATCH(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // 필수 필드 확인
    if (!currentPassword) {
      throw ProfileException.passwordRequired({
        field: 'currentPassword',
        userId: session.user.id
      })
    }

    if (!newPassword) {
      throw ProfileException.passwordRequired({
        field: 'newPassword',
        userId: session.user.id
      })
    }

    // 새 비밀번호 강도 검증
    const strengthValidation = validatePasswordStrength(newPassword)
    if (!strengthValidation.valid) {
      throw ProfileException.passwordTooWeak({
        error: strengthValidation.error,
        requirements: strengthValidation.requirements,
        userId: session.user.id
      })
    }

    // 새 비밀번호와 확인 비밀번호 일치 확인 (제공된 경우)
    if (confirmPassword !== undefined) {
      const matchValidation = validatePasswordMatch(newPassword, confirmPassword)
      if (!matchValidation.valid) {
        throw ProfileException.passwordMismatch({
          userId: session.user.id
        })
      }
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      throw ProfileException.notFound({ userId: session.user.id })
    }

    if (!user.password) {
      throw ProfileException.passwordChangeFailed({
        reason: 'User has no password (OAuth account)',
        userId: session.user.id
      })
    }

    // 현재 비밀번호 확인
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      throw ProfileException.currentPasswordIncorrect({
        userId: session.user.id
      })
    }

    // 새 비밀번호가 현재 비밀번호와 같은지 확인
    const isSameAsOld = await bcrypt.compare(newPassword, user.password)
    if (isSameAsOld) {
      throw ProfileException.newPasswordSameAsOld({
        userId: session.user.id
      })
    }

    // 새 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    }).catch(error => {
      throw ProfileException.passwordChangeFailed({
        reason: error.message,
        userId: session.user.id
      })
    })

    logPasswordChange(session.user.id, {
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      message: "비밀번호가 변경되었습니다"
    })

  } catch (error) {
    logProfileError(error, {
      userId: session?.user?.id,
      action: 'change_password'
    })

    if (error instanceof ProfileException) {
      return NextResponse.json(
        error.toResponse(),
        { status: error.statusCode }
      )
    }

    const passwordError = ProfileException.passwordChangeFailed({
      reason: error.message,
      userId: session?.user?.id
    })
    return NextResponse.json(
      passwordError.toResponse(),
      { status: passwordError.statusCode }
    )
  }
}

