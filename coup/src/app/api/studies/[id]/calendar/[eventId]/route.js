// coup/src/app/api/studies/[id]/calendar/[eventId]/route.js
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
 * GET /api/studies/[id]/calendar/[eventId]
 * 일정 상세 조회
 */
export const GET = withStudyErrorHandler(async (request, context) => {
  const { params } = context
  const { id: studyId, eventId } = await params

  // 1. 멤버 권한 확인
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session } = result

  // 2. 일정 조회
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  })

  // 3. 스터디 일치 확인
  if (!event) {
    throw StudyFeatureException.eventNotFound(eventId, { studyId })
  }

  if (event.studyId !== studyId) {
    throw StudyValidationException.studyNotFound(studyId, { eventId })
  }

  // 4. 로깅
  StudyLogger.logEventView(eventId, studyId, session.user.id)

  // 5. 응답
  return createSuccessResponse(event)
})

/**
 * PATCH /api/studies/[id]/calendar/[eventId]
 * 일정 수정
 */
export const PATCH = withStudyErrorHandler(async (request, context) => {
  const { params } = context
  const { id: studyId, eventId } = await params

  // 1. ADMIN 권한 확인
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result

  // 2. 일정 존재 확인
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  })

  if (!event) {
    throw StudyFeatureException.eventNotFound(eventId, { studyId })
  }

  if (event.studyId !== studyId) {
    throw StudyValidationException.studyNotFound(studyId, { eventId })
  }

  // 3. 입력 검증
  const body = await request.json()
  const { title, date, startTime, endTime, location, description, color } = body

  // 제목 검증
  if (title !== undefined) {
    if (!title || !title.trim()) {
      throw StudyFeatureException.eventTitleMissing({ studyId, eventId })
    }
    if (title.length < 2 || title.length > 100) {
      throw StudyFeatureException.invalidNoticeTitleLength(title, { min: 2, max: 100 }, { studyId, eventId })
    }
  }

  // 날짜 검증
  if (date !== undefined) {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      throw StudyValidationException.invalidSearchQueryFormat('Invalid date format', { studyId, eventId, date })
    }

    // 과거 날짜 방지
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    dateObj.setHours(0, 0, 0, 0)

    if (dateObj < now) {
      throw StudyFeatureException.eventStartTimeInPast(date, { studyId, eventId })
    }
  }

  // 4. 시간 검증 (종료 > 시작)
  const finalStartTime = startTime !== undefined ? startTime : event.startTime
  const finalEndTime = endTime !== undefined ? endTime : event.endTime

  // 시간 형식 검증
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
  if (startTime !== undefined && !timeRegex.test(startTime)) {
    throw StudyValidationException.invalidSearchQueryFormat('Invalid start time format (use HH:MM)', {
      studyId,
      eventId,
      startTime
    })
  }

  if (endTime !== undefined && !timeRegex.test(endTime)) {
    throw StudyValidationException.invalidSearchQueryFormat('Invalid end time format (use HH:MM)', {
      studyId,
      eventId,
      endTime
    })
  }

  // 시간 순서 검증
  const [startHour, startMin] = finalStartTime.split(':').map(Number)
  const [endHour, endMin] = finalEndTime.split(':').map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  if (startMinutes >= endMinutes) {
    throw StudyFeatureException.eventEndTimeBeforeStartTime(finalStartTime, finalEndTime, { studyId, eventId })
  }

  // 위치 검증
  if (location !== undefined && location && location.length > 200) {
    throw StudyValidationException.invalidStudyNameLength(location, { min: 0, max: 200 }, {
      studyId,
      eventId,
      field: 'location'
    })
  }

  // 설명 검증
  if (description !== undefined && description && description.length > 1000) {
    throw StudyFeatureException.eventDescriptionTooLong(description, 1000, { studyId, eventId })
  }

  // 색상 검증
  if (color !== undefined && !/^#[0-9A-F]{6}$/i.test(color)) {
    throw StudyValidationException.invalidSearchQueryFormat('Invalid color format (use #RRGGBB)', {
      studyId,
      eventId,
      color
    })
  }

  // 권한 확인: 작성자 또는 ADMIN/OWNER
  const canEdit = event.createdById === session.user.id ||
                  ['OWNER', 'ADMIN'].includes(member.role)

  if (!canEdit) {
    throw StudyPermissionException.cannotModifyStudy(session.user.id, 'ADMIN_OR_CREATOR', { studyId, eventId })
  }

  // 5. 일정 수정
  const updateData = {}
  if (title !== undefined) updateData.title = title.trim()
  if (date !== undefined) updateData.date = new Date(date)
  if (startTime !== undefined) updateData.startTime = startTime
  if (endTime !== undefined) updateData.endTime = endTime
  if (location !== undefined) updateData.location = location?.trim() || null
  if (description !== undefined) updateData.description = description?.trim() || null
  if (color !== undefined) updateData.color = color

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  })

  // 6. 로깅
  StudyLogger.logEventUpdate(eventId, studyId, session.user.id, {
    title,
    date,
    startTime,
    endTime,
    location,
    description,
    color
  })

  // 7. 응답
  return createSuccessResponse(updated, '일정이 수정되었습니다')
})

/**
 * DELETE /api/studies/[id]/calendar/[eventId]
 * 일정 삭제
 */
export const DELETE = withStudyErrorHandler(async (request, context) => {
  const { params } = context
  const { id: studyId, eventId } = await params

  // 1. ADMIN 권한 확인
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result

  // 2. 일정 존재 확인
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  })

  if (!event) {
    throw StudyFeatureException.eventNotFound(eventId, { studyId })
  }

  if (event.studyId !== studyId) {
    throw StudyValidationException.studyNotFound(studyId, { eventId })
  }

  // 권한 확인: 작성자 또는 ADMIN/OWNER
  const canDelete = event.createdById === session.user.id ||
                    ['OWNER', 'ADMIN'].includes(member.role)

  if (!canDelete) {
    throw StudyPermissionException.cannotModifyStudy(session.user.id, 'ADMIN_OR_CREATOR', { studyId, eventId })
  }

  // 3. 일정 삭제
  await prisma.event.delete({
    where: { id: eventId }
  })

  // 4. 로깅
  StudyLogger.logEventDelete(eventId, studyId, session.user.id)

  // 5. 응답
  return createSuccessResponse(null, '일정이 삭제되었습니다')
})

