// src/app/api/studies/[id]/notices/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  withStudyErrorHandler,
  createSuccessResponse,
  createPaginatedResponse
} from '@/lib/utils/study-utils'
import { requireStudyMember } from "@/lib/auth-helpers"
import { StudyNoticeException } from '@/lib/exceptions/study'
import { StudyLogger } from '@/lib/logging/studyLogger'
import { validateAndSanitize } from "@/lib/utils/input-sanitizer"
import { validateSecurityThreats, logSecurityEvent } from "@/lib/utils/xss-sanitizer"

/**
 * GET /api/studies/[id]/notices
 * 스터디 공지사항 목록 조회
 */
export const GET = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId } = await params;

  // 1. 멤버 권한 확인
  const result = await requireStudyMember(studyId);
  if (result && typeof result.json === 'function') return result;

  // 2. 쿼리 파라미터 추출 및 검증
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const skip = (page - 1) * limit;
  const pinned = searchParams.get('pinned'); // 'true' | 'false'

  // 3. where 조건 생성
  let whereClause = { studyId };
  if (pinned === 'true') {
    whereClause.isPinned = true;
  }

  // 4. 비즈니스 로직 - 데이터 조회 (캐시 미사용 - 항상 최신 데이터)
  const [total, notices] = await Promise.all([
    prisma.notice.count({ where: whereClause }),
    prisma.notice.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
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
  ]);

  const pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };

  // 5. 로깅
  StudyLogger.logNoticeList(studyId, { page, limit, pinned, total, cached: false });

  // 6. 응답
  return createPaginatedResponse(notices, total, page, limit);
});

/**
 * POST /api/studies/[id]/notices
 * 스터디 공지사항 작성
 */
export const POST = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId } = await params;

  // 1. ADMIN 권한 확인
  const result = await requireStudyMember(studyId, 'ADMIN');
  if (result && typeof result.json === 'function') return result;
  const { session } = result;

  // 2. 요청 본문 파싱
  const body = await request.json();
  const { title, content, isPinned, isImportant } = body;

  // 3. 입력 검증 - 제목
  if (!title || !title.trim()) {
    throw StudyNoticeException.titleRequired({ studyId });
  }

  if (title.length < 2 || title.length > 100) {
    throw StudyNoticeException.titleTooLong(title.length, 100);
  }

  // 4. 입력 검증 - 내용
  if (!content || !content.trim()) {
    throw StudyNoticeException.contentRequired({ studyId });
  }

  if (content.length > 10000) {
    throw StudyNoticeException.contentRequired({
      studyId,
      userMessage: '공지사항 내용은 10000자 이하로 입력해주세요'
    });
  }

  // 5. 보안 위협 검증
  const titleThreats = validateSecurityThreats(title);
  if (!titleThreats.safe) {
    logSecurityEvent('XSS_ATTEMPT_DETECTED', {
      userId: session.user.id,
      studyId,
      field: 'notice_title',
      threats: titleThreats.threats,
    });
    throw StudyNoticeException.titleRequired({
      userMessage: '제목에 허용되지 않는 콘텐츠가 포함되어 있습니다'
    });
  }

  const contentThreats = validateSecurityThreats(content);
  if (!contentThreats.safe) {
    logSecurityEvent('XSS_ATTEMPT_DETECTED', {
      userId: session.user.id,
      studyId,
      field: 'notice_content',
      threats: contentThreats.threats,
    });
    throw StudyNoticeException.contentRequired({
      userMessage: '내용에 허용되지 않는 콘텐츠가 포함되어 있습니다'
    });
  }

  // 6. 입력값 정제
  const validation = validateAndSanitize(body, 'NOTICE');
  if (!validation.valid) {
    throw StudyNoticeException.titleRequired({
      errors: validation.errors,
      userMessage: '입력값이 유효하지 않습니다'
    });
  }

  const sanitizedData = validation.sanitized;

  // 7. 고정 공지 개수 확인 (최대 3개)
  if (sanitizedData.isPinned) {
    const pinnedCount = await prisma.notice.count({
      where: {
        studyId,
        isPinned: true,
      },
    });

    if (pinnedCount >= 3) {
      throw StudyNoticeException.pinnedNoticeLimitExceeded(pinnedCount, 3, { studyId });
    }
  }

  // 8. 비즈니스 로직 - 공지사항 생성
  const notice = await prisma.notice.create({
    data: {
      studyId,
      authorId: session.user.id,
      title: sanitizedData.title,
      content: sanitizedData.content,
      isPinned: sanitizedData.isPinned || false,
      isImportant: isImportant || false
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

  // 9. 스터디 멤버들에게 알림 생성
  const members = await prisma.studyMember.findMany({
    where: {
      studyId,
      status: 'ACTIVE',
      userId: { not: session.user.id }
    }
  });

  const study = await prisma.study.findUnique({
    where: { id: studyId },
    select: { name: true, emoji: true }
  });

  await prisma.notification.createMany({
    data: members.map(member => ({
      userId: member.userId,
      type: 'NOTICE',
      studyId,
      studyName: study.name,
      studyEmoji: study.emoji,
      message: `새 공지사항: ${sanitizedData.title}`
    }))
  });

  // 10. 로깅
  StudyLogger.logNoticeCreate(notice.id, studyId, session.user.id, sanitizedData);

  // 11. 응답
  return createSuccessResponse(notice, '공지사항이 작성되었습니다', 201);
});

