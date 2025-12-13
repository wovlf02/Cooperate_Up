// coup/src/app/api/studies/[id]/calendar/route.js
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
 * GET /api/studies/[id]/calendar
 * 일정 목록 조회
 */
export const GET = withStudyErrorHandler(async (request, context) => {
  const { params } = context
  const { id: studyId } = await params

  // 1. 멤버 권한 확인
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session } = result

  // 2. 쿼리 파라미터 검증 (startDate, endDate)
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const month = searchParams.get('month') // YYYY-MM 형식

  let whereClause = { studyId }

  // 날짜 범위 검증 및 설정
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw StudyValidationException.invalidSearchQueryFormat('Invalid date format', { studyId })
    }

    if (start > end) {
      throw StudyFeatureException.eventEndTimeBeforeStartTime(startDate, endDate, { studyId })
    }

    whereClause.date = {
      gte: start,
      lte: end
    }
  } else if (month) {
    // 월 기준 조회
    const [year, monthNum] = month.split('-')

    if (!year || !monthNum || isNaN(year) || isNaN(monthNum)) {
      throw StudyValidationException.invalidSearchQueryFormat('Invalid month format (use YYYY-MM)', { studyId })
    }

    const start = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
    const end = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59)

    whereClause.date = {
      gte: start,
      lte: end
    }
  }

  // 3. 일정 목록 조회
  const events = await prisma.event.findMany({
    where: whereClause,
    orderBy: {
      date: 'asc'
    },
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

  // 4. 로깅
  StudyLogger.logEventList(studyId, {
    startDate: whereClause.date?.gte,
    endDate: whereClause.date?.lte,
    total: events.length,
    userId: session.user.id
  })

  // 5. 응답
  return createSuccessResponse(events)
})

/**
 * POST /api/studies/[id]/calendar
 * 일정 생성
 */
export const POST = withStudyErrorHandler(async (request, context) => {
  const { params } = context
  const { id: studyId } = await params

  console.log('[Calendar POST] Starting - studyId:', studyId)

  // 1. ADMIN 권한 확인
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result
  console.log('[Calendar POST] Auth passed - userId:', session.user.id, 'role:', member.role)

  // ADMIN 이상 권한 확인
  if (!['OWNER', 'ADMIN'].includes(member.role)) {
    throw StudyPermissionException.cannotCreateEvent(session.user.id, 'ADMIN', { studyId })
  }

  // 2. 입력 검증
  const body = await request.json()
  console.log('[Calendar POST] Request body:', JSON.stringify(body))
  const { title, date, startTime, endTime, location, color } = body

  // 제목 검증 (필수, 2-100자)
  if (!title || !title.trim()) {
    throw StudyFeatureException.eventTitleMissing({ studyId })
  }

  if (title.length < 2 || title.length > 100) {
    throw StudyFeatureException.invalidNoticeTitleLength(title, { min: 2, max: 100 }, { studyId })
  }

  // 필수 필드 검증
  if (!date || !startTime || !endTime) {
    throw StudyValidationException.cannotDeleteRequiredField('date/startTime/endTime', { studyId })
  }

  // 날짜 형식 검증
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    throw StudyValidationException.invalidSearchQueryFormat('Invalid date format', { studyId, date })
  }

  // 시작 날짜 검증 (오늘 포함 미래만 허용)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // UTC 날짜를 로컬 날짜로 변환 (YYYY-MM-DD 형식은 UTC로 해석됨)
  const eventDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000)
  eventDate.setHours(0, 0, 0, 0)

  console.log('[Calendar POST] Date validation - today:', today.toISOString(), 'eventDate:', eventDate.toISOString(), 'input:', date)

  if (eventDate < today) {
    throw StudyFeatureException.eventStartTimeInPast(date, { studyId })
  }

  // 시간 형식 검증 (HH:MM)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw StudyValidationException.invalidSearchQueryFormat('Invalid time format (use HH:MM)', {
      studyId,
      startTime,
      endTime
    })
  }

  // 종료 시간 (시작 시간 이후)
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  if (startMinutes >= endMinutes) {
    throw StudyFeatureException.eventEndTimeBeforeStartTime(startTime, endTime, { studyId })
  }

  // 위치 검증 (선택, max 200자)
  if (location && location.length > 200) {
    throw StudyValidationException.invalidStudyNameLength(location, { min: 0, max: 200 }, {
      studyId,
      field: 'location'
    })
  }

  // 색상 검증 (hex color)
  if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
    throw StudyValidationException.invalidSearchQueryFormat('Invalid color format (use #RRGGBB)', {
      studyId,
      color
    })
  }

  // 일정 중복 확인 (선택)
  // 날짜를 YYYY-MM-DD 형식에서 Date 객체로 변환 (시간 부분은 00:00:00 UTC)
  const [year, month, day] = date.split('-').map(Number)
  const eventDateForDB = new Date(Date.UTC(year, month - 1, day))

  const overlapping = await prisma.event.findFirst({
    where: {
      studyId,
      date: eventDateForDB,
      OR: [
        {
          startTime: { lte: startTime },
          endTime: { gt: startTime },
        },
        {
          startTime: { lt: endTime },
          endTime: { gte: endTime },
        },
        {
          startTime: { gte: startTime },
          endTime: { lte: endTime },
        },
      ],
    },
    select: {
      id: true,
      title: true
    }
  })

  // 중복 일정이 있으면 경고 (에러는 아님)
  let warning = null
  if (overlapping) {
    warning = `같은 시간대에 다른 일정이 있습니다: ${overlapping.title}`

    // 강제로 중복 방지하고 싶다면 아래 주석 해제
    // throw StudyFeatureException.eventTimeConflict(startTime, endTime, overlapping.id, { studyId })
  }

  // 3. 일정 생성
  console.log('[Calendar POST] Creating event - studyId:', studyId, 'userId:', session.user.id, 'date:', eventDateForDB.toISOString())

  const event = await prisma.event.create({
    data: {
      studyId,
      createdById: session.user.id,
      title: title.trim(),
      date: eventDateForDB,
      startTime,
      endTime,
      location: location?.trim() || null,
      color: color || '#6366F1'
    },
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

  // 4. 멤버들에게 알림
  const [members, study] = await Promise.all([
    prisma.studyMember.findMany({
      where: {
        studyId,
        status: 'ACTIVE',
        userId: { not: session.user.id }
      }
    }),
    prisma.study.findUnique({
      where: { id: studyId },
      select: { name: true, emoji: true }
    })
  ])

  if (members.length > 0) {
    await prisma.notification.createMany({
      data: members.map(member => ({
        userId: member.userId,
        type: 'EVENT',
        studyId,
        studyName: study.name,
        studyEmoji: study.emoji,
        message: `새 일정: ${title}`
      }))
    }).catch(error => {
      StudyLogger.warn('Failed to send event notifications', {
        studyId,
        eventId: event.id,
        error: error.message
      })
    })
  }

  // 5. 로깅
  StudyLogger.logEventCreate(event.id, studyId, session.user.id, {
    title,
    date,
    startTime,
    endTime
  })

  // 6. 응답
  return createSuccessResponse(
    { ...event, warning },
    '일정이 생성되었습니다',
    201
  )
})

