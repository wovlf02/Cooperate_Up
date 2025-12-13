// coup/src/app/api/my-studies/[studyId]/announcements/[announcementId]/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const { studyId, announcementId } = params

    const session = await requireAuth()
    if (session instanceof NextResponse) return session // 인증되지 않은 사용자 처리

    // 1. 스터디 멤버십 확인
    const membership = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId: studyId,
          userId: session.user.id
        }
      }
    })

    if (!membership || membership.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: "스터디 멤버만 공지사항을 볼 수 있습니다." },
        { status: 403 }
      )
    }

    // 2. 공지사항 조회
    const notice = await prisma.notice.findUnique({
      where: {
        id: announcementId,
        studyId: studyId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        attachments: { // 첨부 파일 포함
          include: {
            file: true // 실제 File 모델 데이터 포함
          }
        }
      }
    })

    if (!notice) {
      return NextResponse.json(
        { error: "공지사항을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 3. 조회수 증가 (선택 사항)
    // await prisma.notice.update({
    //   where: { id: announcementId },
    //   data: { views: { increment: 1 } }
    // });

    return NextResponse.json({
      success: true,
      data: notice
    })

  } catch (error) {
    console.error('Get announcement detail error:', error)
    return NextResponse.json(
      { error: "공지사항 정보를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
