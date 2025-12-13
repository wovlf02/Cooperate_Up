// src/app/api/studies/[id]/members/route.js
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  withStudyErrorHandler,
  createSuccessResponse,
  createPaginatedResponse
} from '@/lib/utils/study-utils'
import { requireStudyMember } from "@/lib/auth-helpers"
import { 
  StudyMemberException, 
  StudyPermissionException, 
  StudyValidationException, 
  StudyApplicationException 
} from '@/lib/exceptions/study'
import { StudyLogger } from '@/lib/logging/studyLogger'

/**
 * GET /api/studies/[id]/members
 * 스터디 멤버 목록 조회
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
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '50')));
  const skip = (page - 1) * limit;
  const role = searchParams.get('role'); // 'OWNER' | 'ADMIN' | 'MEMBER'
  const status = searchParams.get('status') || 'ACTIVE'; // 기본값: ACTIVE (활성 멤버만)

  // 3. where 조건 생성
  let whereClause = { studyId, status };
  if (role) {
    whereClause.role = role;
  }

  // 4. 비즈니스 로직 - 데이터 조회
  const [total, members] = await Promise.all([
    prisma.studyMember.count({ where: whereClause }),
    prisma.studyMember.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [
        { role: 'asc' }, // OWNER, ADMIN, MEMBER 순
        { joinedAt: 'asc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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
  StudyLogger.info('Member list retrieved', { 
    studyId, 
    page, 
    limit, 
    role, 
    status, 
    total 
  });

  // 6. 응답
  return createPaginatedResponse(members, total, page, limit);
});

/**
 * POST /api/studies/[id]/members
 * 멤버 초대/추가
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
  const { userId, role = 'MEMBER' } = body;

  // 3. 입력 검증
  if (!userId) {
    throw StudyValidationException.missingRequiredField('userId', { studyId });
  }

  const validRoles = ['ADMIN', 'MEMBER'];
  if (!validRoles.includes(role)) {
    throw StudyMemberException.invalidRole(role, validRoles, { studyId, userId });
  }

  // 4. 스터디 존재 및 정원 확인
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    include: {
      _count: {
        select: { members: true }
      }
    }
  });

  if (!study) {
    throw StudyValidationException.studyNotFound(studyId);
  }

  if (study._count.members >= study.maxMembers) {
    throw StudyApplicationException.studyFull(
      studyId,
      study._count.members,
      study.maxMembers
    );
  }

  // 5. 사용자 존재 확인
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw StudyValidationException.studyNotFound(userId, { message: '사용자를 찾을 수 없습니다' });
  }

  // 6. 이미 멤버인지 확인
  const existingMember = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: {
        studyId,
        userId
      }
    }
  });

  if (existingMember) {
    throw StudyApplicationException.alreadyMember(userId, studyId, {
      role: existingMember.role,
      status: existingMember.status
    });
  }

  // 7. 멤버 추가
  const newMember = await prisma.studyMember.create({
    data: {
      userId,
      studyId,
      role,
      status: 'ACTIVE',
      joinedAt: new Date()
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        }
      }
    }
  });

  // 8. 로깅
  StudyLogger.info('Member added to study', {
    studyId,
    userId,
    role,
    addedBy: session.user.id
  });

  // 9. 알림 생성 (선택적)
  try {
    // TODO: 알림 시스템 구현 시 추가
  } catch (notifError) {
    StudyLogger.warn('Failed to create member added notification', {
      error: notifError.message,
      studyId,
      userId
    });
  }

  return NextResponse.json(
    {
      success: true,
      data: newMember,
      message: '멤버가 추가되었습니다'
    },
    { status: 201 }
  );
});

/**
 * DELETE /api/studies/[id]/members
 * 멤버 제거
 */
export const DELETE = withStudyErrorHandler(async (request, context) => {
  const { params } = context;
  const { id: studyId } = await params;

  // 1. ADMIN 권한 확인
  const result = await requireStudyMember(studyId, 'ADMIN');
  if (result && typeof result.json === 'function') return result;

  const { session } = result;

  // 2. 쿼리 파라미터에서 userId 추출
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    throw StudyValidationException.missingRequiredField('userId', { studyId });
  }

  // 3. 대상 멤버 확인
  const targetMember = await prisma.studyMember.findUnique({
    where: {
      studyId_userId: {
        studyId,
        userId
      }
    }
  });

  if (!targetMember) {
    throw StudyMemberException.memberNotFound(userId, studyId);
  }

  // 4. OWNER는 제거 불가
  if (targetMember.role === 'OWNER') {
    throw StudyMemberException.cannotKickOwner(userId, {
      studyId,
      message: 'OWNER는 제거할 수 없습니다'
    });
  }

  // 5. 멤버 제거
  await prisma.studyMember.delete({
    where: {
      studyId_userId: {
        studyId,
        userId
      }
    }
  });

  // 6. 로깅
  StudyLogger.info('Member removed from study', {
    studyId,
    userId,
    removedBy: session.user.id,
    role: targetMember.role
  });

  // 7. 알림 생성 (선택적)
  try {
    // TODO: 알림 시스템 구현 시 추가
  } catch (notifError) {
    StudyLogger.warn('Failed to create member removed notification', {
      error: notifError.message,
      studyId,
      userId
    });
  }

  return createSuccessResponse(
    { userId, studyId },
    '멤버가 제거되었습니다'
  );
});
