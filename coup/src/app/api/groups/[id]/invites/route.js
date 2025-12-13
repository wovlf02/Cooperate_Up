/**
 * /api/groups/[id]/invites/route.js
 *
 * 그룹 초대 관리 API
 *
 * @route GET /api/groups/[id]/invites - 초대 목록 조회
 * @route POST /api/groups/[id]/invites - 초대 생성
 * @route DELETE /api/groups/[id]/invites - 초대 취소
 * @access Private
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  GroupBusinessException,
  GroupPermissionException,
  GroupInviteException
} from '@/lib/exceptions/group';
import { GroupLogger, logInviteCreated, logInviteCanceled } from '@/lib/logging/groupLogger';
import {
  checkGroupMembership,
  checkGroupPermission,
  checkGroupCapacity,
  checkKickedHistory,
  generateInviteCode
} from '@/lib/helpers/group-helpers';
import { validateEmailFormat as validateEmail } from '@/lib/validators/group-validators';

/**
 * GET /api/groups/[id]/invites
 *
 * 초대 목록 조회
 * - 멤버만 조회 가능
 * - 상태별 필터링
 * - 페이지네이션
 */
export async function GET(request, context) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const { params } = context;
    const { id: groupId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    // 멤버인지 확인
    await checkGroupMembership(groupId, session.user.id, prisma);

    // Where 조건
    const where = {
      groupId,
      ...(status && { status })
    };

    // 초대 목록 조회
    const [invites, total] = await Promise.all([
      prisma.groupInvite.findMany({
        where,
        skip,
        take: limit,
        include: {
          invitedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          },
          invitedUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.groupInvite.count({ where })
    ]);

    GroupLogger.info('Invites list retrieved', {
      groupId,
      userId: session.user.id,
      total,
      status
    });

    return NextResponse.json({
      success: true,
      data: invites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return NextResponse.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to retrieve invites', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '초대 목록 조회에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/invites
 *
 * 초대 생성
 * - ADMIN 이상 권한 필요
 * - 이메일 형식 검증 (선택적)
 * - 이미 멤버인 경우 방지
 * - 강퇴된 사용자 초대 방지
 * - 정원 확인
 * - 초대 코드 생성
 */
export async function POST(request, context) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const { params } = context;
    const { id: groupId } = await params;
    const body = await request.json();
    const { userId, email, expiresInDays = 7 } = body;

    // ADMIN 이상 권한 확인
    await checkGroupPermission(groupId, session.user.id, 'ADMIN', prisma);

    // 정원 확인
    await checkGroupCapacity(groupId, prisma);

    // 이메일 검증 (제공된 경우)
    if (email && !validateEmail(email)) {
      throw GroupBusinessException.invalidInput('유효하지 않은 이메일 형식입니다.');
    }

    let invitedUserId = userId;

    // userId 제공된 경우
    if (userId) {
      // 사용자 존재 확인
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw GroupBusinessException.invalidInput('존재하지 않는 사용자입니다.');
      }

      // 이미 멤버인지 확인
      const existingMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: { groupId, userId }
        }
      });

      if (existingMember && (existingMember.status === 'ACTIVE' || existingMember.status === 'PENDING')) {
        throw GroupInviteException.alreadyMember();
      }

      // 강퇴 이력 확인
      await checkKickedHistory(groupId, userId, prisma);
    }

    // 초대 코드 생성
    const code = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // 초대 생성
    const invite = await prisma.groupInvite.create({
      data: {
        groupId,
        invitedById: session.user.id,
        invitedUserId,
        email,
        code,
        status: 'PENDING',
        expiresAt
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        invitedUser: invitedUserId ? {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        } : undefined
      }
    });

    logInviteCreated(groupId, invite.id, session.user.id, userId || email);

    return NextResponse.json({
      success: true,
      data: invite,
      message: '초대가 성공적으로 생성되었습니다.'
    }, { status: 201 });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return NextResponse.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to create invite', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '초대 생성에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]/invites
 *
 * 초대 취소
 * - 생성자 또는 ADMIN 권한 확인
 * - PENDING 상태만 취소 가능
 */
export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const { params } = context;
    const { id: groupId } = await params;
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('inviteId');

    if (!inviteId) {
      throw GroupBusinessException.invalidInput('초대 ID는 필수입니다.');
    }

    // 초대 조회
    const invite = await prisma.groupInvite.findUnique({
      where: { id: inviteId }
    });

    if (!invite) {
      throw GroupInviteException.inviteNotFound();
    }

    if (invite.groupId !== groupId) {
      throw GroupBusinessException.invalidInput('잘못된 그룹 ID입니다.');
    }

    // 권한 확인 (생성자 또는 ADMIN)
    if (invite.invitedById !== session.user.id) {
      await checkGroupPermission(groupId, session.user.id, 'ADMIN', prisma);
    }

    // PENDING 상태 확인
    if (invite.status !== 'PENDING') {
      throw GroupInviteException.invalidInviteStatus(
        'PENDING 상태의 초대만 취소할 수 있습니다.'
      );
    }

    // 초대 취소
    await prisma.groupInvite.update({
      where: { id: inviteId },
      data: { status: 'CANCELLED' }
    });

    logInviteCanceled(groupId, inviteId, session.user.id);

    return NextResponse.json({
      success: true,
      message: '초대가 취소되었습니다.'
    });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return NextResponse.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to cancel invite', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '초대 취소에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

