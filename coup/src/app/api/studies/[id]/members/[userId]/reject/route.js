// src/app/api/studies/[id]/members/[userId]/reject/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(request, { params }) {
  const { id: studyId, userId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    // 멤버 확인
    const member = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: "가입 신청을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    if (member.status !== 'PENDING') {
      return NextResponse.json(
        { error: "이미 처리된 신청입니다" },
        { status: 400 }
      )
    }

    // 거절 (삭제)
    await prisma.studyMember.delete({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "가입 신청을 거절했습니다"
    })

  } catch (error) {
    console.error('Reject member error:', error)
    return NextResponse.json(
      { error: "거절 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

