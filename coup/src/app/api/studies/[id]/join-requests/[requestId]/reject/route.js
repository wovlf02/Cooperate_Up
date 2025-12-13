// src/app/api/studies/[id]/join-requests/[requestId]/reject/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import {
  createStudyErrorResponse,
  logStudyError,
  handlePrismaError
} from '@/lib/exceptions/study-errors'
import { validateJoinReject } from '@/lib/validators/study-validation'

export async function POST(request, { params }) {
  try {
    // 1. 파라미터 파싱
    const { id: studyId, requestId } = await params

    // 2. ADMIN 권한 확인
    const result = await requireStudyMember(studyId, 'ADMIN')
    if (result instanceof NextResponse) return result

    const { session } = result

    // 3. 요청 본문 파싱 (선택적)
    let reason = null
    try {
      const body = await request.json()
      reason = body.reason
    } catch {
      // body가 없는 경우 무시
    }

    // 4. 거절 사유 검증 (선택)
    if (reason) {
      const validation = validateJoinReject({ reason })
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error,
            errors: validation.errors
          },
          { status: 400 }
        )
      }
    }

    // 5. 가입 신청 확인
    const joinRequest = await prisma.studyMember.findFirst({
      where: {
        id: requestId,
        studyId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        study: {
          select: {
            name: true
          }
        }
      }
    })

    if (!joinRequest) {
      const errorResponse = createStudyErrorResponse('JOIN_REQUEST_NOT_FOUND')
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // 6. 거절 처리: StudyMember 레코드 삭제
    await prisma.studyMember.delete({
      where: { id: requestId }
    })

    return NextResponse.json({
      success: true,
      message: "가입 신청이 거절되었습니다"
    })

  } catch (error) {
    // Prisma 에러 처리
    if (error.code?.startsWith('P')) {
      const studyError = handlePrismaError(error)
      return NextResponse.json(studyError, { status: studyError.statusCode })
    }

    // 일반 에러
    logStudyError('가입 거절', error)
    const errorResponse = createStudyErrorResponse('JOIN_REJECT_FAILED')
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

