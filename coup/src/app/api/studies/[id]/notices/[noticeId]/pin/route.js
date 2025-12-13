// src/app/api/studies/[id]/notices/[noticeId]/pin/route.js
import { prisma } from "@/lib/prisma"
import { requireStudyMember } from "@/lib/auth-helpers"
import {
  withStudyErrorHandler,
  createSuccessResponse
} from '@/lib/utils/study-utils'
import { StudyNoticeException, StudyPermissionException } from '@/lib/exceptions/study'
import { StudyLogger } from '@/lib/logging/studyLogger'

/**
 * POST /api/studies/[id]/notices/[noticeId]/pin
 * 공지사항 고정/해제 토글
 */
export const POST = withStudyErrorHandler(async (request, context) => {
  const { params } = context
  const { id: studyId, noticeId } = await params

  // 1. ADMIN 권한 확인
  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result && typeof result.json === 'function') return result
  const { session } = result

  // 2. 공지사항 조회
  const notice = await prisma.notice.findUnique({
    where: { id: noticeId }
  })

  if (!notice) {
    throw StudyNoticeException.noticeNotFound(noticeId, { studyId })
  }

  if (notice.studyId !== studyId) {
    throw StudyPermissionException.notStudyMember(session.user.id, studyId)
  }

  // 3. 고정하려는 경우 - 최대 3개 제한 체크
  if (!notice.isPinned) {
    const pinnedCount = await prisma.notice.count({
      where: {
        studyId,
        isPinned: true
      }
    })

    if (pinnedCount >= 3) {
      throw StudyNoticeException.pinnedNoticeLimitExceeded(pinnedCount, 3, { studyId })
    }
  }

  // 4. 고정/해제 토글
  const updated = await prisma.notice.update({
    where: { id: noticeId },
    data: {
      isPinned: !notice.isPinned
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  })

  // 5. 로깅
  StudyLogger.logNoticeUpdate(noticeId, studyId, session.user.id, {
    action: updated.isPinned ? 'pin' : 'unpin'
  })

  // 6. 응답
  return createSuccessResponse(
    updated,
    updated.isPinned ? '공지사항을 고정했습니다' : '공지사항 고정을 해제했습니다'
  )
})
