// coup/src/app/api/studies/[id]/tasks/route.js
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import {
  withStudyErrorHandler,
  createSuccessResponse,
  createPaginatedResponse
} from '@/lib/utils/study-utils'
import { StudyFeatureException, StudyValidationException, StudyPermissionException } from '@/lib/exceptions/study'
import { StudyLogger } from '@/lib/logging/studyLogger'

/**
 * GET /api/studies/[id]/tasks
 * 할일 목록 조회
 */
export const GET = withStudyErrorHandler(async (request, context) => {
  const { params } = context
  const { id: studyId } = await params

  // 1. 멤버 권한 확인
  const result = await requireStudyMember(studyId)
  if (result && typeof result.json === 'function') return result

  const { session } = result

  // 2. 쿼리 파라미터 추출 및 검증
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // TODO | IN_PROGRESS | REVIEW | DONE | CANCELLED | all
  const assignee = searchParams.get('assignee') // userId
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  // 페이지 검증
  if (page < 1) {
    throw StudyValidationException.invalidPageNumber(page, { studyId })
  }

  // 페이지 크기 검증
  if (limit < 1 || limit > 100) {
    throw StudyValidationException.invalidPageSize(limit, { min: 1, max: 100 }, { studyId })
  }

  // 상태 검증
  const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']
  if (status && status !== 'all' && !validStatuses.includes(status)) {
    throw StudyValidationException.invalidSortField(status, validStatuses, { studyId, field: 'status' })
  }

  // 3. where 조건 생성
  let whereClause = { studyId }

  if (status && status !== 'all') {
    whereClause.status = status
  }

  if (assignee) {
    whereClause.assignees = {
      some: {
        userId: assignee
      }
    }
  }

  // 4. 할일 목록 조회
  const [tasks, total] = await Promise.all([
    prisma.studyTask.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    }),
    prisma.studyTask.count({ where: whereClause })
  ])

  // assignees 데이터 정리
  const tasksWithAssignees = tasks.map(task => ({
    ...task,
    assignees: task.assignees.map(a => a.user)
  }))

  // 5. 로깅
  StudyLogger.logTaskList(studyId, {
    page,
    limit,
    status,
    assignee,
    total,
    userId: session.user.id
  })

  // 6. 페이지네이션 응답
  return createPaginatedResponse(tasksWithAssignees, {
    page,
    limit,
    total
  })
})

/**
 * POST /api/studies/[id]/tasks
 * 할일 생성
 */
export const POST = withStudyErrorHandler(async (request, context) => {
  const { params } = context
  const { id: studyId } = await params

  // 1. ADMIN 권한 확인
  const result = await requireStudyMember(studyId)
  if (result && typeof result.json === 'function') return result

  const { session, member } = result

  // ADMIN 이상 권한 확인
  if (!['OWNER', 'ADMIN'].includes(member.role)) {
    throw StudyPermissionException.adminPermissionRequired(session.user.id, member.role, { studyId })
  }

  // 2. 입력 검증
  const body = await request.json()
  const { title, description, status, priority, dueDate, assigneeIds } = body

  // 제목 검증 (필수, 2-100자)
  if (!title || !title.trim()) {
    throw StudyFeatureException.taskTitleMissing({ studyId })
  }

  if (title.length < 2 || title.length > 100) {
    throw StudyValidationException.invalidStudyNameLength(title, { min: 2, max: 100 }, { studyId })
  }

  // 설명 검증 (선택, max 1000자)
  if (description && description.length > 1000) {
    throw StudyFeatureException.eventDescriptionTooLong(description, 1000, { studyId })
  }

  // 상태 검증
  const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']
  if (status && !validStatuses.includes(status)) {
    throw StudyValidationException.invalidSortField(status, validStatuses, { studyId, field: 'status' })
  }

  // 우선순위 검증
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
  if (priority && !validPriorities.includes(priority)) {
    throw StudyValidationException.invalidSortField(priority, validPriorities, { studyId, field: 'priority' })
  }

  // 마감일 검증 (미래 날짜)
  if (dueDate) {
    const dueDateObj = new Date(dueDate)
    const now = new Date()
    now.setHours(0, 0, 0, 0) // 오늘 날짜의 시작

    if (dueDateObj < now) {
      throw StudyFeatureException.taskDeadlineInPast(dueDate, { studyId })
    }
  }

  // 담당자 검증 (멤버 확인)
  if (assigneeIds && Array.isArray(assigneeIds) && assigneeIds.length > 0) {
    const members = await prisma.studyMember.findMany({
      where: {
        studyId,
        userId: { in: assigneeIds },
        status: 'ACTIVE',
      },
    }) || []

    if (members.length !== assigneeIds.length) {
      const validUserIds = members.map(m => m.userId)
      const invalidUserIds = assigneeIds.filter(id => !validUserIds.includes(id))

      throw StudyFeatureException.assigneeNotMember(invalidUserIds[0], studyId, {
        invalidUserIds
      })
    }
  }

  // 3. 트랜잭션으로 할일과 담당자 생성
  const task = await prisma.$transaction(async (tx) => {
    // 할일 생성
    const newTask = await tx.studyTask.create({
      data: {
        studyId,
        createdById: session.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null
      }
    })

    // 담당자 추가
    if (assigneeIds && Array.isArray(assigneeIds) && assigneeIds.length > 0) {
      await tx.studyTaskAssignee.createMany({
        data: assigneeIds.map(userId => ({
          taskId: newTask.id,
          userId
        }))
      })
    }

    // 담당자 정보 포함하여 반환
    return await tx.studyTask.findUnique({
      where: { id: newTask.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    })
  })

  // 4. 담당자에게 알림
  if (assigneeIds && Array.isArray(assigneeIds) && assigneeIds.length > 0) {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { name: true, emoji: true }
    })

    await prisma.notification.createMany({
      data: assigneeIds
        .filter(userId => userId !== session.user.id)
        .map(userId => ({
          userId,
          type: 'TASK_ASSIGNED',
          studyId,
          studyName: study.name,
          studyEmoji: study.emoji,
          message: `새 할일: ${title}`
        }))
    }).catch(error => {
      StudyLogger.warn('Failed to send task assignment notifications', {
        studyId,
        taskId: task.id,
        error: error.message
      })
    })
  }

  // 5. 로깅
  StudyLogger.logTaskCreate(task.id, studyId, session.user.id, {
    title,
    priority: priority || 'MEDIUM',
    status: status || 'TODO',
    dueDate,
    assigneeIds
  })

  // assignees 데이터 정리
  const taskWithAssignees = {
    ...task,
    assignees: task.assignees.map(a => a.user)
  }

  // 6. 응답
  return createSuccessResponse(taskWithAssignees, '할일이 생성되었습니다', 201)
})

