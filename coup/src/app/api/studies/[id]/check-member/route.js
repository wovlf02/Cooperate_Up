import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 시그널링 서버에서 스터디 멤버십 확인을 위한 API
 * POST /api/studies/[id]/check-member
 */
export async function POST(request, { params }) {
  try {
    const { id: studyId } = params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // 스터디 멤버 확인
    const member = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: {
          studyId,
          userId
        }
      },
      include: {
        study: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Not a member of this study' },
        { status: 403 }
      );
    }

    if (member.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Member status is not active' },
        { status: 403 }
      );
    }

    if (member.study.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Study is not active' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        role: member.role,
        status: member.status
      },
      study: member.study
    });
  } catch (error) {
    console.error('Check member error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

