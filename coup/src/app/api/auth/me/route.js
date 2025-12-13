import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * 현재 로그인한 사용자 정보 조회
 * GET /api/auth/me
 */
export async function GET() {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // DB에서 사용자 상세 정보 조회 (createdAt, bio 포함)
    const userDetails = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        bio: true,
        status: true,
        createdAt: true,
      }
    });

    // 사용자가 DB에 없는 경우 (세션은 있지만 DB에 없음)
    if (!userDetails) {
      console.warn('[API /auth/me] User not found in DB:', session.user.id);
      return NextResponse.json({
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          avatar: session.user.avatar,
          role: session.user.role || 'USER',
          bio: '',
          status: 'ACTIVE',
          createdAt: null,
        },
        adminRole: null
      });
    }

    // AdminRole 정보 조회
    const adminRole = await prisma.adminRole.findUnique({
      where: { userId: session.user.id },
      select: {
        role: true,
        expiresAt: true,
      }
    });

    // createdAt을 ISO 문자열로 안전하게 변환
    let createdAtISO = null;
    if (userDetails.createdAt) {
      try {
        createdAtISO = new Date(userDetails.createdAt).toISOString();
      } catch (e) {
        console.error('[API /auth/me] createdAt 변환 오류:', e);
      }
    }

    // 사용자 정보 반환 (AdminRole 포함)
    return NextResponse.json({
      user: {
        id: userDetails.id,
        email: userDetails.email,
        name: userDetails.name,
        avatar: userDetails.avatar,
        role: userDetails.role,
        bio: userDetails.bio || '',
        status: userDetails.status || 'ACTIVE',
        createdAt: createdAtISO,
      },
      adminRole: adminRole ? {
        role: adminRole.role,
        expiresAt: adminRole.expiresAt,
        isExpired: adminRole.expiresAt ? new Date(adminRole.expiresAt) < new Date() : false
      } : null
    });
  } catch (error) {
    console.error('[API /auth/me] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

