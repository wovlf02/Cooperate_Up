// src/app/api/studies/[id]/notices/[noticeId]/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  withStudyErrorHandler,
  createSuccessResponse
} from '@/lib/utils/study-utils'
import { requireStudyMember } from "@/lib/auth-helpers"
import { StudyNoticeException, StudyPermissionException } from '@/lib/exceptions/study'
import { StudyLogger } from '@/lib/logging/studyLogger'

/**
 * GET /api/studies/[id]/notices/[noticeId]
 * 공지사항 상세 조회
 */
export const GET = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId, noticeId } = await params;

  // 1. 멤버 권한 확인
  const result = await requireStudyMember(studyId);
  if (result && typeof result.json === 'function') return result;

  // 2. 공지사항 조회
  const notice = await prisma.notice.findUnique({
    where: { id: noticeId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  });

  // 3. 존재 여부 및 스터디 일치 확인
  if (!notice) {
    throw StudyNoticeException.noticeNotFound(noticeId, { studyId });
  }

  if (notice.studyId !== studyId) {
    throw StudyPermissionException.notStudyMember(result.session.user.id, studyId);
  }

  // 4. 조회수 증가
  const updatedNotice = await prisma.notice.update({
    where: { id: noticeId },
    data: { views: { increment: 1 } },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      }
    }
  });

  // 5. 로깅
  StudyLogger.logNoticeView(noticeId, studyId, result.session.user.id);

  // 6. 응답 (업데이트된 조회수 포함)
  return createSuccessResponse(updatedNotice);
});

/**
 * PATCH /api/studies/[id]/notices/[noticeId]
 * 공지사항 수정
 */
export const PATCH = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId, noticeId } = await params;

  // 1. ADMIN 권한 확인
  const result = await requireStudyMember(studyId, 'ADMIN');
  if (result && typeof result.json === 'function') return result;
  const { session, member } = result;

  // 2. 요청 본문 파싱
  const body = await request.json();

  // 3. 공지사항 확인
  const notice = await prisma.notice.findUnique({
    where: { id: noticeId }
  });

  if (!notice) {
    throw StudyNoticeException.noticeNotFound(noticeId, { studyId });
  }

  if (notice.studyId !== studyId) {
    throw StudyPermissionException.notStudyMember(session.user.id, studyId);
  }

  // 4. 작성자 또는 ADMIN+ 권한 확인
  if (notice.authorId !== session.user.id && member.role === 'MEMBER') {
    throw StudyNoticeException.noticeAccessDenied(session.user.id, noticeId, {
      action: 'update_notice'
    });
  }

  // 5. 입력 검증
  if (body.title !== undefined) {
    if (!body.title || !body.title.trim()) {
      throw StudyNoticeException.titleRequired({ studyId, noticeId });
    }
    if (body.title.length < 2 || body.title.length > 100) {
      throw StudyNoticeException.titleTooLong(body.title.length, 100);
    }
  }

  if (body.content !== undefined) {
    if (!body.content || !body.content.trim()) {
      throw StudyNoticeException.contentRequired({ studyId, noticeId });
    }
    if (body.content.length > 10000) {
      throw StudyNoticeException.contentRequired({
        studyId,
        noticeId,
        userMessage: '공지사항 내용은 10000자 이하로 입력해주세요'
      });
    }
  }

  // 6. 비즈니스 로직 - 공지사항 수정
  const updated = await prisma.notice.update({
    where: { id: noticeId },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.content && { content: body.content }),
      ...(body.isPinned !== undefined && { isPinned: body.isPinned }),
      ...(body.isImportant !== undefined && { isImportant: body.isImportant })
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
  });

  // 7. 로깅
  StudyLogger.logNoticeUpdate(noticeId, studyId, session.user.id, body);

  // 8. 응답
  return createSuccessResponse(updated, '공지사항이 수정되었습니다');
});

/**
 * DELETE /api/studies/[id]/notices/[noticeId]
 * 공지사항 삭제
 */
export const DELETE = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId, noticeId } = await params;

  // 1. ADMIN 권한 확인
  const result = await requireStudyMember(studyId, 'ADMIN');
  if (result && typeof result.json === 'function') return result;
  const { session, member } = result;

  // 2. 공지사항 확인
  const notice = await prisma.notice.findUnique({
    where: { id: noticeId }
  });

  if (!notice) {
    throw StudyNoticeException.noticeNotFound(noticeId, { studyId });
  }

  if (notice.studyId !== studyId) {
    throw StudyPermissionException.notStudyMember(session.user.id, studyId);
  }

  // 3. 작성자 또는 ADMIN+ 권한 확인
  if (notice.authorId !== session.user.id && member.role === 'MEMBER') {
    throw StudyNoticeException.noticeAccessDenied(session.user.id, noticeId, {
      action: 'delete_notice'
    });
  }

  // 4. 비즈니스 로직 - 공지사항 삭제
  await prisma.notice.delete({
    where: { id: noticeId }
  });

  // 5. 로깅
  StudyLogger.logNoticeDelete(noticeId, studyId, session.user.id);

  // 6. 응답
  return createSuccessResponse(null, '공지사항이 삭제되었습니다');
});

