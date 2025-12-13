import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 시그널링 서버에서 사용자 인증을 위한 API
 * POST /api/auth/verify
 */
export async function POST(request) {
  try {
    const { userId } = await request.json();
    console.log('[API /auth/verify] Request received, userId:', userId);

    if (!userId) {
      console.log('[API /auth/verify] No userId provided');
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        status: true
      }
    });

    console.log('[API /auth/verify] User found:', user ? `${user.name} (${user.id})` : 'null');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.status !== 'ACTIVE') {
      console.log('[API /auth/verify] User not active:', user.status);
      return NextResponse.json(
        { error: 'User is not active' },
        { status: 403 }
      );
    }

    console.log('[API /auth/verify] Success, returning user:', user.name);
    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('[API /auth/verify] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

