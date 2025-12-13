// src/app/api/tasks/[id]/toggle/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function PATCH(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id } = await params

    const task = await prisma.task.findUnique({
      where: { id }
    })

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json(
        { error: "할일을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 완료/미완료 토글
    const updated = await prisma.task.update({
      where: { id },
      data: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null,
        status: !task.completed ? 'DONE' : 'TODO'
      }
    })

    return NextResponse.json({
      success: true,
      message: updated.completed ? "할일을 완료했습니다" : "할일을 미완료로 변경했습니다",
      data: updated
    })

  } catch (error) {
    console.error('Toggle task error:', error)
    return NextResponse.json(
      { error: "할일 토글 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

