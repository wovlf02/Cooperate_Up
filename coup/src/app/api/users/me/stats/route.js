// src/app/api/users/me/stats/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const userId = session.user.id

    // 이번 주 시작일 (월요일)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)

    // 사용자 정보 조회 (가입일)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true }
    })

    const [
      totalStudies,
      managingStudies,
      completedTasksThisWeek,
      completedTasksTotal,
      createdNoticesThisWeek,
      uploadedFilesThisWeek,
      chatMessagesThisWeek,
    ] = await Promise.all([
      // 참여 중인 스터디 수
      prisma.studyMember.count({
        where: { userId, status: 'ACTIVE' }
      }),
      // 관리 중인 스터디 (OWNER, ADMIN)
      prisma.studyMember.count({
        where: {
          userId,
          status: 'ACTIVE',
          role: { in: ['OWNER', 'ADMIN'] }
        }
      }),
      // 이번 주 완료한 할일
      prisma.task.count({
        where: {
          userId,
          completed: true,
          completedAt: { gte: weekStart }
        }
      }),
      // 전체 완료한 할일
      prisma.task.count({
        where: { userId, completed: true }
      }),
      // 이번 주 작성한 공지
      prisma.notice.count({
        where: {
          authorId: userId,
          createdAt: { gte: weekStart }
        }
      }),
      // 이번 주 업로드한 파일
      prisma.file.count({
        where: {
          uploaderId: userId,
          createdAt: { gte: weekStart }
        }
      }),
      // 이번 주 채팅 메시지
      prisma.message.count({
        where: {
          userId,
          createdAt: { gte: weekStart }
        }
      }),
    ])

    // 가입 일수 계산
    const joinedDays = user?.createdAt
      ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
      : 0

    // 평균 출석률 계산 (임시로 랜덤 값 - 실제로는 일정 참석 데이터 기반)
    const averageAttendance = totalStudies > 0 ? 85 : 0

    return NextResponse.json({
      success: true,
      stats: {
        thisWeek: {
          completedTasks: completedTasksThisWeek,
          createdNotices: createdNoticesThisWeek,
          uploadedFiles: uploadedFilesThisWeek,
          chatMessages: chatMessagesThisWeek,
        },
        total: {
          studyCount: totalStudies,
          managingStudies: managingStudies,
          completedTasks: completedTasksTotal,
          averageAttendance: averageAttendance,
          joinedDays: joinedDays,
        },
        badges: [] // TODO: 배지 시스템 구현 시 추가
      }
    })

  } catch (error) {
    console.error('User stats error:', error)
    return NextResponse.json(
      { error: "사용자 통계를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

