// coup/src/app/api/studies/[id]/tasks/[taskId]/status/route.js
import { NextResponse } from "next/server"
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
 * PATCH /api/studies/[id]/tasks/[taskId]/status
 * 할일 상태 변경
 */
export const PATCH = withStudyErrorHandler(async (request, context) => {
  const { params } = context
  const { id: studyId, taskId } = await params

  // 1. 멤버 권한 확인 (담당자 또는 ADMIN)
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

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

  // 3. 상태 검증 (TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED)
  const body = await request.json()
  const { status } = body

  if (!status) {
    throw StudyValidationException.cannotDeleteRequiredField('status', { studyId, taskId })
  }

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
    throw StudyValidationException.invalidStateTransition(task.status, status, {
      studyId,
      taskId,
      allowedTransitions
    })
  }

  // 권한 확인: 담당자, 작성자, 또는 ADMIN/OWNER
  const isAssignee = task.assignees.some(a => a.userId === session.user.id)
  const isCreator = task.createdById === session.user.id
  const isAdmin = ['OWNER', 'ADMIN'].includes(member.role)

  if (!isAssignee && !isCreator && !isAdmin) {
    throw StudyPermissionException.cannotModifyStudy(session.user.id, 'ASSIGNEE_OR_ADMIN', {
      studyId,
      taskId
    })
  }

  // 4. 상태 업데이트
  const oldStatus = task.status

  const updated = await prisma.studyTask.update({
    where: { id: taskId },
    data: {
      status,
      // DONE으로 변경 시 완료 시간 기록
      ...(status === 'DONE' && { completedAt: new Date() }),
      // DONE에서 다른 상태로 변경 시 완료 시간 제거
      ...(oldStatus === 'DONE' && status !== 'DONE' && { completedAt: null })
    },
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

  // 5. 로깅
  StudyLogger.logTaskStatusChange(taskId, studyId, session.user.id, oldStatus, status)

  // assignees 데이터 정리
  const taskWithAssignees = {
    ...updated,
    assignees: updated.assignees.map(a => a.user)
  }

  // 6. 응답
  return createSuccessResponse(taskWithAssignees, `할일 상태가 ${status}(으)로 변경되었습니다`)
})

