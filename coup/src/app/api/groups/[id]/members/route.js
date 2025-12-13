/**
 * /api/groups/[id]/members/route.js
 *
 * 그룹 멤버 관리 API
 *
 * @route GET /api/groups/[id]/members - 멤버 목록 조회
 * @route POST /api/groups/[id]/members - 멤버 추가
 * @route DELETE /api/groups/[id]/members - 멤버 제거
 * @access Private
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  GroupBusinessException,
  GroupPermissionException,
  GroupMemberException
} from '@/lib/exceptions/group';
import { GroupLogger, logMemberRemoved } from '@/lib/logging/groupLogger';
import {
  checkGroupMembership,
  checkGroupPermission,
  canManageMember,
  checkGroupCapacity,
  checkKickedHistory
} from '@/lib/helpers/group-helpers';

const ROLE_ORDER = { OWNER: 1, ADMIN: 2, MEMBER: 3 };

/**
 * GET /api/groups/[id]/members
 *
 * 멤버 목록 조회
 * - 상태별 필터링 (ACTIVE, PENDING, LEFT, KICKED)
 * - 페이지네이션
 * - 역할 기준 정렬
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
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    // 그룹 멤버인지 확인
    await checkGroupMembership(groupId, session.user.id, prisma);

    // Where 조건
    const where = {
      groupId,
      ...(status && { status }),
      ...(role && { role })
    };

    // 멤버 목록 조회
    const [members, total] = await Promise.all([
      prisma.groupMember.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true
            }
          }
        },
        orderBy: [
          { role: 'asc' },
          { createdAt: 'asc' }
        ]
      }),
      prisma.groupMember.count({ where })
    ]);

    // 역할 기준 정렬 (OWNER > ADMIN > MEMBER)
    const sortedMembers = members.sort((a, b) => {
      return ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
    });

    GroupLogger.info('Members list retrieved', {
      groupId,
      userId: session.user.id,
      total,
      status
    });

    return NextResponse.json({
      success: true,
      data: sortedMembers,
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

    GroupLogger.error('Failed to retrieve members', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '멤버 목록 조회에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/members
 *
 * 멤버 추가
 * - ADMIN 이상 권한 필요
 * - 중복 가입 방지
 * - 강퇴 이력 확인
 * - 정원 확인
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
    const { userId, role = 'MEMBER' } = body;

    if (!userId) {
      throw GroupBusinessException.invalidInput('사용자 ID는 필수입니다.');
    }

    // ADMIN 이상 권한 확인
    await checkGroupPermission(groupId, session.user.id, 'ADMIN', prisma);

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw GroupBusinessException.invalidInput('존재하지 않는 사용자입니다.');
    }

    // 강퇴 이력 확인
    await checkKickedHistory(groupId, userId, prisma);

    // 기존 멤버 확인
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId }
      }
    });

    if (existingMember) {
      if (existingMember.status === 'ACTIVE' || existingMember.status === 'PENDING') {
        throw GroupMemberException.alreadyMember();
      }

      // LEFT 상태인 경우 재가입
      if (existingMember.status === 'LEFT') {
        const member = await prisma.groupMember.update({
          where: { id: existingMember.id },
          data: {
            status: 'ACTIVE',
            role,
            leftAt: null
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        });

        GroupLogger.logMemberAdded(groupId, session.user.id, userId, role);

        return NextResponse.json({
          success: true,
          data: member,
          message: '멤버가 성공적으로 재가입되었습니다.'
        }, { status: 201 });
      }
    }

    // 정원 확인
    await checkGroupCapacity(groupId, prisma);

    // 새 멤버 추가
    const member = await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    GroupLogger.logMemberAdded(groupId, session.user.id, userId, role);

    return NextResponse.json({
      success: true,
      data: member,
      message: '멤버가 성공적으로 추가되었습니다.'
    }, { status: 201 });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return NextResponse.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to add member', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '멤버 추가에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]/members
 *
 * 멤버 제거
 * - ADMIN 이상 권한 필요
 * - OWNER 제거 불가
 * - 자기 자신 제거 불가
 * - 역할 계층 확인
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
    const userId = searchParams.get('userId');
    const kick = searchParams.get('kick') === 'true';

    if (!userId) {
      throw GroupBusinessException.invalidInput('사용자 ID는 필수입니다.');
    }

    // ADMIN 이상 권한 확인
    const adminMember = await checkGroupPermission(groupId, session.user.id, 'ADMIN', prisma);

    // 자기 자신 제거 불가
    if (userId === session.user.id) {
      throw GroupPermissionException.cannotModifySelf('자기 자신을 제거할 수 없습니다.');
    }

    // 대상 멤버 조회
    const targetMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId }
      }
    });

    if (!targetMember) {
      throw GroupMemberException.memberNotFound();
    }

    // OWNER 제거 불가
    if (targetMember.role === 'OWNER') {
      throw GroupPermissionException.cannotModifyOwner();
    }

    // 역할 계층 확인
    if (!canManageMember(adminMember.role, targetMember.role)) {
      throw GroupPermissionException.insufficientPermission(
        '대상 멤버의 역할을 관리할 권한이 없습니다.'
      );
    }

    // 멤버 제거 또는 강퇴
    const newStatus = kick ? 'KICKED' : 'LEFT';
    await prisma.groupMember.update({
      where: { id: targetMember.id },
      data: {
        status: newStatus,
        leftAt: new Date()
      }
    });

    logMemberRemoved(groupId, userId, session.user.id, kick);

    return NextResponse.json({
      success: true,
      message: kick ? '멤버가 강퇴되었습니다.' : '멤버가 제거되었습니다.'
    });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return NextResponse.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to remove member', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '멤버 제거에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

