// src/app/api/tasks/[id]/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id } = await params

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        study: {
          select: {
            id: true,
            name: true,
            emoji: true
          }
        }
      }
    })

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json(
        { error: "할일을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: task
    })

  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json(
      { error: "할일을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id } = await params
    const body = await request.json()

    const task = await prisma.task.findUnique({
      where: { id }
    })

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json(
        { error: "할일을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status && { status: body.status }),
        ...(body.priority && { priority: body.priority }),
        ...(body.dueDate !== undefined && {
          dueDate: body.dueDate ? new Date(body.dueDate) : null
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: "할일이 수정되었습니다",
      data: updated
    })

  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: "할일 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

// PUT 메서드 - 전체 업데이트
export async function PUT(request, { params }) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { id } = await params
    const body = await request.json()

    const task = await prisma.task.findUnique({
      where: { id }
    })

    if (!task || task.userId !== session.user.id) {
      return NextResponse.json(
        { error: "할일을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description || null,
        studyId: body.studyId,
        priority: body.priority || 'MEDIUM',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
      include: {
        study: {
          select: {
            id: true,
            name: true,
            emoji: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "할일이 수정되었습니다",
      data: updated
    })

  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: "할일 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
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

    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "할일이 삭제되었습니다"
    })

  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: "할일 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

