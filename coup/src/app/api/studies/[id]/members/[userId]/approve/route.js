// src/app/api/studies/[id]/members/[userId]/approve/route.js
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
      },
      include: {
        study: {
          select: {
            name: true,
            emoji: true
          }
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

    // 승인 처리
    const updated = await prisma.studyMember.update({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      },
      data: {
        status: 'ACTIVE',
        approvedAt: new Date()
      }
    })

    // 알림 생성
    await prisma.notification.create({
      data: {
        userId,
        type: 'JOIN_APPROVED',
        studyId,
        studyName: member.study.name,
        studyEmoji: member.study.emoji,
        message: `${member.study.name} 가입이 승인되었습니다`
      }
    })

    return NextResponse.json({
      success: true,
      message: "가입 신청을 승인했습니다",
      data: updated
    })

  } catch (error) {
    console.error('Approve member error:', error)
    return NextResponse.json(
      { error: "승인 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

