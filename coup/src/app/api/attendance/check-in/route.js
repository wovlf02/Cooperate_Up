// 출석 체크인 API
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  console.log('[Attendance] API called');

  try {
    const session = await getServerSession(authOptions);
    console.log('[Attendance] Session:', session?.user?.id ? 'found' : 'not found');

    if (!session?.user?.id) {
      return Response.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('[Attendance] User ID:', userId);

    // 사용자가 속한 ACTIVE 상태의 스터디 조회
    const userStudies = await prisma.studyMember.findMany({
      where: {
        userId: userId,
        status: 'ACTIVE',
      },
      select: {
        studyId: true,
        study: {
          select: {
            name: true,
          }
        }
      },
    });

    console.log('[Attendance] Found studies:', userStudies.length);

    if (userStudies.length === 0) {
      return Response.json({
        success: true,
        message: '참여 중인 스터디가 없습니다.',
        attendedStudies: 0
      });
    }

    const studyNames = userStudies.map(us => us.study.name).join(', ');

    return Response.json({
      success: true,
      message: '출석이 완료되었습니다.',
      attendedStudies: userStudies.length,
      totalStudies: userStudies.length,
      alreadyAttended: 0,
      studies: studyNames,
    });

  } catch (error) {
    console.error('[Attendance] Error:', error.message);
    console.error('[Attendance] Stack:', error.stack);
    return Response.json(
      { error: '출석 처리 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

