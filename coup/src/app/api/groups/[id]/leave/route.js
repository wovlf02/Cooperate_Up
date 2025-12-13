/**
 * /api/groups/[id]/leave/route.js
 *
 * 그룹 탈퇴 API
 *
 * @route POST /api/groups/[id]/leave - 그룹 탈퇴
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
import { GroupLogger, logMemberLeft } from '@/lib/logging/groupLogger';

/**
 * POST /api/groups/[id]/leave
 *
 * 그룹 탈퇴
 * - OWNER는 다른 ADMIN이 있을 때만 탈퇴 가능
 * - ACTIVE 멤버만 탈퇴 가능
 * - 멤버 상태를 LEFT로 변경
 */
export async function POST(request, context) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const { params } = context;
    const { id: groupId } = await params;

    // 그룹 존재 확인
    const group = await prisma.group.findUnique({
      where: { id: groupId, deletedAt: null }
    });

    if (!group) {
      throw GroupBusinessException.groupNotFound();
    }

    // 멤버 확인
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id }
      }
    });

    if (!member) {
      throw GroupMemberException.memberNotFound();
    }

    // ACTIVE 상태 확인
    if (member.status !== 'ACTIVE') {
      throw GroupMemberException.invalidMemberStatus(
        'ACTIVE 상태의 멤버만 탈퇴할 수 있습니다.'
      );
    }

    // OWNER인 경우 다른 ADMIN 확인
    if (member.role === 'OWNER') {
      const otherAdmins = await prisma.groupMember.count({
        where: {
          groupId,
          status: 'ACTIVE',
          role: 'ADMIN',
          userId: { not: session.user.id }
        }
      });

      if (otherAdmins === 0) {
        throw GroupPermissionException.ownerCannotLeave(
          '다른 ADMIN이 없어 탈퇴할 수 없습니다. 먼저 다른 멤버를 ADMIN으로 지정해주세요.'
        );
      }
    }

    // 탈퇴 처리
    await prisma.groupMember.update({
      where: { id: member.id },
      data: {
        status: 'LEFT',
        leftAt: new Date()
      }
    });

    logMemberLeft(groupId, session.user.id);

    return NextResponse.json({
      success: true,
      message: '그룹에서 성공적으로 탈퇴했습니다.'
    });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return NextResponse.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to leave group', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '그룹 탈퇴에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

