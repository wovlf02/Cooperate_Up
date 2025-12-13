// src/app/api/studies/[id]/members/[userId]/role/route.js
import { NextResponse } from "next/server";
import { requireStudyMember } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { withStudyErrorHandler, createSuccessResponse } from '@/lib/utils/study-utils';
import { StudyPermissionException, StudyMemberException, StudyValidationException } from '@/lib/exceptions/study';
import { StudyLogger } from '@/lib/logging/studyLogger';

/**
 * PATCH /api/studies/[id]/members/[userId]/role
 * 멤버 역할 변경 (OWNER만 가능)
 */
export const PATCH = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId, userId } = await params;

  // 1. OWNER 권한 확인
  const result = await requireStudyMember(studyId);
  if (result && typeof result.json === 'function') return result;

  const { session, member: actorMember } = result;

  // OWNER만 역할 변경 가능
  if (actorMember.role !== 'OWNER') {
    throw StudyPermissionException.ownerPermissionRequired(
      session.user.id,
      actorMember.role,
      { studyId, action: 'change_member_role' }
    );
  }

  // 2. 요청 본문 파싱
  const body = await request.json();
  const { role } = body;

  // 3. 역할 검증
  const validRoles = ['OWNER', 'ADMIN', 'MEMBER'];
  if (!role || !validRoles.includes(role)) {
    throw StudyMemberException.invalidRole(role, validRoles, { studyId, userId });
  }

  // 4. 대상 멤버 확인
  const targetMember = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: {
        studyId,
        userId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      study: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!targetMember) {
    throw StudyMemberException.memberNotFound(userId, studyId, {
      message: '해당 스터디 멤버를 찾을 수 없습니다',
    });
  }

  // 5. OWNER 역할 변경 불가 (자기 자신 포함)
  if (targetMember.role === 'OWNER' || role === 'OWNER') {
    throw StudyMemberException.cannotChangeOwnerRole(userId, {
      studyId,
      currentRole: targetMember.role,
      targetRole: role,
      message: 'OWNER 역할은 변경할 수 없습니다',
    });
  }

  // 6. 이미 같은 역할인 경우
  if (targetMember.role === role) {
    StudyLogger.info('Member role already set', {
      studyId,
      userId,
      role,
      changedBy: session.user.id,
      noChange: true
    });

    return createSuccessResponse(targetMember, '이미 해당 역할입니다');
  }

  // 7. 역할 변경
  const updatedMember = await prisma.studyMember.update({
    where: {
      studyId_userId: {
        studyId,
        userId,
      },
    },
    data: { role },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // 8. 로깅
  StudyLogger.info('Member role changed', {
    studyId,
    userId,
    oldRole: targetMember.role,
    newRole: role,
    changedBy: session.user.id
  });

  // 9. 알림 생성 (선택적 - 에러 발생 시 무시)
  try {
    // TODO: 알림 시스템 구현 시 추가
    // await createNotification(...)
  } catch (notifError) {
    StudyLogger.warn('Failed to create role change notification', {
      error: notifError.message,
      studyId,
      userId,
      role,
    });
  }

  return createSuccessResponse(updatedMember, '역할이 변경되었습니다');
});


