// coup/src/app/api/studies/[id]/tasks/[taskId]/route.js
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import {
  withStudyErrorHandler,
  createSuccessResponse
} from '@/lib/utils/study-utils'
import {
  StudyFeatureException,
  StudyValidationException,
  StudyPermissionException
} from '@/lib/exceptions/study'
import { StudyLogger } from '@/lib/logging/studyLogger'

/**
 * GET /api/studies/[id]/tasks/[taskId]
 * 할일 상세 조회
 */
export const GET = withStudyErrorHandler(async (request, context) => {
  const { params } = context
  const { id: studyId, taskId } = await params

  // 1. 멤버 권한 확인
  const result = await requireStudyMember(studyId)
  if (result && typeof result.json === 'function') return result

  const { session } = result

  // 2. 할일 조회
  const task = await prisma.studyTask.findUnique({
    where: { id: taskId },
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

  // 3. 스터디 일치 확인
  if (!task) {
    throw StudyFeatureException.eventNotFound(taskId, { studyId, type: 'task' })
  }

  if (task.studyId !== studyId) {
    throw StudyValidationException.studyNotFound(studyId, { taskId })
  }

  // assignees 데이터 정리
  const taskWithAssignees = {
    ...task,
    assignees: task.assignees.map(a => a.user)
  }

  // 4. 로깅
  StudyLogger.logTaskView(taskId, studyId, session.user.id)

  // 5. 응답
  return createSuccessResponse(taskWithAssignees)
})

/**
 * PATCH /api/studies/[id]/tasks/[taskId]
 * 할일 수정
 */
export const PATCH = withStudyErrorHandler(async (request, context) => {
  const { params } = context
  const { id: studyId, taskId } = await params

  // 1. 멤버 권한 확인
  const result = await requireStudyMember(studyId)
  if (result && typeof result.json === 'function') return result

  const { session, member } = result

  // 2. 할일 존재 확인
  const task = await prisma.studyTask.findUnique({
    where: { id: taskId },
    include: {
      assignees: true
    }
  })

  if (!task) {
    throw StudyFeatureException.eventNotFound(taskId, { studyId, type: 'task' })
  }

  if (task.studyId !== studyId) {
    throw StudyValidationException.studyNotFound(studyId, { taskId })
  }

  // 3. 입력 검증
  const body = await request.json()
  const { title, description, status, priority, dueDate, assigneeIds } = body

  // 제목 검증
  if (title !== undefined) {
    if (!title || !title.trim()) {
      throw StudyFeatureException.taskTitleMissing({ studyId, taskId })
    }
    if (title.length < 2 || title.length > 100) {
      throw StudyValidationException.invalidStudyNameLength(title, { min: 2, max: 100 }, { studyId, taskId })
    }
  }

  // 설명 검증
  if (description !== undefined && description && description.length > 1000) {
    throw StudyFeatureException.eventDescriptionTooLong(description, 1000, { studyId, taskId })
  }

  // 상태 검증
  if (status !== undefined) {
    const validStatuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      throw StudyValidationException.invalidSortField(status, validStatuses, { studyId, taskId, field: 'status' })
    }

    // 상태 전환 규칙 검증
    const validTransitions = {
      TODO: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['REVIEW', 'DONE', 'TODO', 'CANCELLED'],
      REVIEW: ['DONE', 'IN_PROGRESS', 'TODO'],
      DONE: ['TODO'], // 재오픈
      CANCELLED: ['TODO'], // 재활성화
    }

    const allowedTransitions = validTransitions[task.status] || []
    if (!allowedTransitions.includes(status) && task.status !== status) {
      throw StudyValidationException.invalidStateTransition(task.status, status, { studyId, taskId })
    }
  }

  // 우선순위 검증
  if (priority !== undefined) {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
    if (!validPriorities.includes(priority)) {
      throw StudyValidationException.invalidSortField(priority, validPriorities, { studyId, taskId, field: 'priority' })
    }
  }

  // 4. 담당자 변경 시 멤버 확인
  if (assigneeIds !== undefined && assigneeIds.length > 0) {
    const members = await prisma.studyMember.findMany({
      where: {
        studyId,
        userId: { in: assigneeIds },
        status: 'ACTIVE',
      },
    })

    if (members.length !== assigneeIds.length) {
      const validUserIds = members.map(m => m.userId)
      const invalidUserIds = assigneeIds.filter(id => !validUserIds.includes(id))

      throw StudyFeatureException.assigneeNotMember(invalidUserIds[0], studyId, {
        taskId,
        invalidUserIds
      })
    }
  }

  // 마감일 검증
  if (dueDate !== undefined && dueDate) {
    const dueDateObj = new Date(dueDate)
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (dueDateObj < now) {
      throw StudyFeatureException.taskDeadlineInPast(dueDate, { studyId, taskId })
    }
  }

  // 권한 확인: 작성자, 담당자, ADMIN/OWNER
  const isAssignee = task.assignees.some(a => a.userId === session.user.id)
  const canEdit = task.createdById === session.user.id ||
                  isAssignee ||
                  ['OWNER', 'ADMIN'].includes(member.role)

  if (!canEdit) {
    throw StudyPermissionException.cannotModifyStudy(session.user.id, 'ADMIN_OR_ASSIGNEE', { studyId, taskId })
  }

  // 5. 할일 수정
  const updateData = {}
  if (title !== undefined) updateData.title = title.trim()
  if (description !== undefined) updateData.description = description?.trim() || null
  if (status !== undefined) updateData.status = status
  if (priority !== undefined) updateData.priority = priority
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null

  // 담당자 업데이트가 있는 경우 트랜잭션
  if (assigneeIds !== undefined) {
    await prisma.$transaction(async (tx) => {
      // 기존 담당자 삭제
      await tx.studyTaskAssignee.deleteMany({
        where: { taskId }
      })

      // 새 담당자 추가
      if (assigneeIds.length > 0) {
        await tx.studyTaskAssignee.createMany({
          data: assigneeIds.map(userId => ({
            taskId,
            userId
          }))
        })
      }

      // 할일 업데이트
      if (Object.keys(updateData).length > 0) {
        await tx.studyTask.update({
          where: { id: taskId },
          data: updateData
        })
      }
    })
  } else if (Object.keys(updateData).length > 0) {
    // 담당자 업데이트 없이 할일만 업데이트
    await prisma.studyTask.update({
      where: { id: taskId },
      data: updateData
    })
  }

  // 업데이트된 할일 조회
  const updated = await prisma.studyTask.findUnique({
    where: { id: taskId },
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

  // 6. 로깅
  StudyLogger.logTaskUpdate(taskId, studyId, session.user.id, {
    title,
    description,
    status,
    priority,
    dueDate,
    assigneeIds
  })

  // assignees 데이터 정리
  const taskWithAssignees = {
    ...updated,
    assignees: updated.assignees.map(a => a.user)
  }

  // 7. 응답
  return createSuccessResponse(taskWithAssignees, '할일이 수정되었습니다')
})

/**
 * DELETE /api/studies/[id]/tasks/[taskId]
 * 할일 삭제
 */
export const DELETE = withStudyErrorHandler(async (request, context) => {
  const { params } = context
  const { id: studyId, taskId } = await params

  // 1. ADMIN 권한 확인
  const result = await requireStudyMember(studyId)
  if (result && typeof result.json === 'function') return result

  const { session, member } = result

  // 2. 할일 존재 확인
  const task = await prisma.studyTask.findUnique({
    where: { id: taskId }
  })

  if (!task) {
    throw StudyFeatureException.eventNotFound(taskId, { studyId, type: 'task' })
  }

  if (task.studyId !== studyId) {
    throw StudyValidationException.studyNotFound(studyId, { taskId })
  }

  // 권한 확인: 작성자 또는 ADMIN/OWNER만 삭제 가능
  const canDelete = task.createdById === session.user.id ||
                    ['OWNER', 'ADMIN'].includes(member.role)

  if (!canDelete) {
    throw StudyPermissionException.cannotModifyStudy(session.user.id, 'ADMIN_OR_CREATOR', { studyId, taskId })
  }

  // 3. 할일 삭제 (트랜잭션)
  await prisma.$transaction([
    prisma.studyTaskAssignee.deleteMany({
      where: { taskId }
    }),
    prisma.studyTask.delete({
      where: { id: taskId }
    })
  ])

  // 4. 로깅
  StudyLogger.logTaskDelete(taskId, studyId, session.user.id)

  // 5. 응답
  return createSuccessResponse(null, '할일이 삭제되었습니다')
})

