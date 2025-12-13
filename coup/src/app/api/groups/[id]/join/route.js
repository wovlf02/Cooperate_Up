/**
 * /api/groups/[id]/join/route.js
 *
 * 그룹 가입 API
 *
 * @route POST /api/groups/[id]/join - 그룹 가입
 * @access Private
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  GroupBusinessException,
  GroupMemberException,
  GroupInviteException
} from '@/lib/exceptions/group';
import { GroupLogger, logMemberJoined } from '@/lib/logging/groupLogger';
import {
  checkKickedHistory,
  checkGroupCapacity
} from '@/lib/helpers/group-helpers';

/**
 * POST /api/groups/[id]/join
 *
 * 그룹 가입
 * - 공개 그룹: 즉시 가입 (ACTIVE)
 * - 비공개 그룹: 승인 대기 (PENDING)
 * - 초대 코드: 즉시 가입 (ACTIVE)
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
    const { inviteCode } = body;

    // 그룹 존재 확인
    const group = await prisma.group.findUnique({
      where: { id: groupId, deletedAt: null }
    });

    if (!group) {
      throw GroupBusinessException.groupNotFound();
    }

    // 초대 코드 없이 비공개 그룹 또는 모집 종료된 그룹 가입 시도
    if (!inviteCode && !group.isPublic) {
      throw GroupBusinessException.inviteOnlyGroup();
    }

    if (!inviteCode && !group.isRecruiting) {
      throw GroupBusinessException.recruitmentClosed(groupId);
    }

    // 강퇴 이력 확인
    await checkKickedHistory(groupId, session.user.id, prisma);

    // 기존 멤버 확인
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id }
      }
    });

    if (existingMember) {
      if (existingMember.status === 'ACTIVE') {
        throw GroupMemberException.alreadyMember();
      }

      if (existingMember.status === 'PENDING') {
        throw GroupMemberException.alreadyPending();
      }

      // LEFT 상태인 경우 재가입
      if (existingMember.status === 'LEFT') {
        // 초대 코드 처리
        let invite = null;
        if (inviteCode) {
          invite = await prisma.groupInvite.findFirst({
            where: {
              groupId,
              code: inviteCode,
              status: 'PENDING'
            }
          });

          if (!invite) {
            throw GroupInviteException.invalidInviteCode();
          }

          if (invite.expiresAt && invite.expiresAt < new Date()) {
            throw GroupInviteException.inviteExpired();
          }
        }

        // 정원 확인
        await checkGroupCapacity(groupId, prisma);

        const newStatus = inviteCode || group.isPublic ? 'ACTIVE' : 'PENDING';

        const member = await prisma.$transaction(async (tx) => {
          // 멤버 상태 업데이트
          const updated = await tx.groupMember.update({
            where: { id: existingMember.id },
            data: {
              status: newStatus,
              role: 'MEMBER',
              leftAt: null
            }
          });

          // 초대 코드 사용 처리
          if (invite) {
            await tx.groupInvite.update({
              where: { id: invite.id },
              data: { status: 'ACCEPTED' }
            });
          }

          return updated;
        });

        GroupLogger.logMemberJoined(groupId, session.user.id, newStatus);

        return NextResponse.json({
          success: true,
          data: {
            memberId: member.id,
            status: member.status
          },
          message: newStatus === 'ACTIVE'
            ? '그룹에 성공적으로 재가입되었습니다.'
            : '재가입 요청이 전송되었습니다. 승인을 기다려주세요.'
        }, { status: 201 });
      }
    }

    // 초대 코드 처리
    let invite = null;
    if (inviteCode) {
      invite = await prisma.groupInvite.findFirst({
        where: {
          groupId,
          code: inviteCode,
          status: 'PENDING'
        }
      });

      if (!invite) {
        throw GroupInviteException.invalidInviteCode();
      }

      if (invite.expiresAt && invite.expiresAt < new Date()) {
        throw GroupInviteException.inviteExpired();
      }
    }

    // 정원 확인
    await checkGroupCapacity(groupId, prisma);

    // 가입 상태 결정
    const status = inviteCode || group.isPublic ? 'ACTIVE' : 'PENDING';

    // 새 멤버 추가
    const member = await prisma.$transaction(async (tx) => {
      const created = await tx.groupMember.create({
        data: {
          groupId,
          userId: session.user.id,
          role: 'MEMBER',
          status
        }
      });

      // 초대 코드 사용 처리
      if (invite) {
        await tx.groupInvite.update({
          where: { id: invite.id },
          data: { status: 'ACCEPTED' }
        });
      }

      return created;
    });

    logMemberJoined(groupId, session.user.id, status);

    return NextResponse.json({
      success: true,
      data: {
        memberId: member.id,
        status: member.status
      },
      message: status === 'ACTIVE'
        ? '그룹에 성공적으로 가입되었습니다.'
        : '가입 요청이 전송되었습니다. 승인을 기다려주세요.'
    }, { status: 201 });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return NextResponse.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to join group', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '그룹 가입에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

