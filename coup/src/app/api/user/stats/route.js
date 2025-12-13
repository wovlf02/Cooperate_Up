/**
 * User Stats API - 사용자 활동 통계
 *
 * GET /api/user/stats - 사용자 활동 통계 조회
 *
 * @module app/api/user/stats/route
 * @created 2025-12-05
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * 안전하게 count 쿼리 실행
 */
async function safeCount(queryFn, fallback = 0) {
  try {
    return await queryFn();
  } catch (error) {
    console.error('[User Stats] Count error:', error.message);
    return fallback;
  }
}

/**
 * GET /api/user/stats
 * 사용자 활동 통계 조회
 */
export async function GET() {
  try {
    // 1. 세션 검증
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. 이번 주 시작/끝 날짜 계산
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // 일요일
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // 3. 이번 주 통계 조회 (개별 안전 처리)
    const [
      completedTasksThisWeek,
      createdNoticesThisWeek,
      uploadedFilesThisWeek,
      chatMessagesThisWeek
    ] = await Promise.all([
      // 이번 주 완료한 할 일
      safeCount(() => prisma.task.count({
        where: {
          userId: userId,
          completed: true,
          completedAt: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      })),
      // 이번 주 작성한 공지
      safeCount(() => prisma.notice.count({
        where: {
          authorId: userId,
          createdAt: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      })),
      // 이번 주 업로드한 파일
      safeCount(() => prisma.file.count({
        where: {
          uploaderId: userId,
          createdAt: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      })),
      // 이번 주 채팅 메시지
      safeCount(() => prisma.message.count({
        where: {
          userId: userId,
          createdAt: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      }))
    ]);

    // 4. 전체 통계 조회
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true }
      });
    } catch (error) {
      console.error('[User Stats] User query error:', error.message);
    }

    const [
      totalStudyCount,
      totalCompletedTasks
    ] = await Promise.all([
      // 총 참여 스터디
      safeCount(() => prisma.studyMember.count({
        where: {
          userId: userId,
          status: 'ACTIVE'
        }
      })),
      // 총 완료 할 일
      safeCount(() => prisma.task.count({
        where: {
          userId: userId,
          completed: true
        }
      }))
    ]);

    // 가입 기간 계산
    const joinedDays = user 
      ? Math.floor((now - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + 1
      : 1;

    // 5. 응답 구성
    const stats = {
      thisWeek: {
        completedTasks: completedTasksThisWeek,
        createdNotices: createdNoticesThisWeek,
        uploadedFiles: uploadedFilesThisWeek,
        chatMessages: chatMessagesThisWeek
      },
      total: {
        studyCount: totalStudyCount,
        completedTasks: totalCompletedTasks,
        averageAttendance: 100,
        joinedDays: joinedDays
      },
      badges: []
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[User Stats] Error:', error.message);
    console.error('[User Stats] Stack:', error.stack);
    return NextResponse.json(
      { error: '통계를 불러오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}
