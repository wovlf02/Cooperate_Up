// src/app/api/tasks/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const { searchParams } = new URL(request.url)
    const studyId = searchParams.get('studyId')
    const status = searchParams.get('status') // TODO | IN_PROGRESS | REVIEW | DONE | all | incomplete | completed
    let completed = searchParams.get('completed') // 'true' | 'false'
    const sortBy = searchParams.get('sortBy') || 'deadline' // deadline | priority | createdAt
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const userId = session.user.id

    let whereClause = { userId }

    if (studyId) {
      whereClause.studyId = studyId
    }

    // status 파라미터 처리 (incomplete/completed는 completed 필드로 변환)
    if (status === 'incomplete') {
      completed = 'false'
    } else if (status === 'completed') {
      completed = 'true'
    } else if (status && status !== 'all') {
      // TODO, IN_PROGRESS, REVIEW, DONE 등 실제 상태값
      whereClause.status = status
    }

    if (completed !== null && completed !== undefined) {
      whereClause.completed = completed === 'true'
    }

    // 정렬 순서 설정
    let orderBy = [
      { completed: 'asc' }, // 미완료가 먼저
    ]

    if (sortBy === 'deadline') {
      orderBy.push({ dueDate: 'asc' }, { createdAt: 'desc' })
    } else if (sortBy === 'priority') {
      orderBy.push({ priority: 'desc' }, { dueDate: 'asc' })
    } else if (sortBy === 'createdAt') {
      orderBy.push({ createdAt: 'desc' })
    } else {
      // 기본값
      orderBy.push({ dueDate: 'asc' }, { createdAt: 'desc' })
    }

    const total = await prisma.task.count({ where: whereClause })

    const tasks = await prisma.task.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
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
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: "할일 목록을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const { studyId, title, description, status, priority, dueDate } = body

    if (!title) {
      return NextResponse.json(
        { error: "제목을 입력해주세요" },
        { status: 400 }
      )
    }

    // studyId가 있는 경우 스터디 멤버 확인
    if (studyId) {
      const member = await prisma.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId,
            userId: session.user.id
          }
        }
      })

      if (!member || member.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: "스터디 멤버가 아닙니다" },
          { status: 403 }
        )
      }
    }

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        studyId: studyId || null,
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null
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
      message: "할일이 생성되었습니다",
      data: task
    }, { status: 201 })

  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: "할일 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

