import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * 프로필 수정
 * PUT /api/user/profile
 */
export async function PUT(request) {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, bio, avatar } = body;

    // 유효성 검증
    if (name !== undefined) {
      if (typeof name !== 'string' || name.length < 2 || name.length > 50) {
        return NextResponse.json(
          { error: '이름은 2-50자여야 합니다.' },
          { status: 400 }
        );
      }
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string' || bio.length > 200) {
        return NextResponse.json(
          { error: '자기소개는 200자 이하여야 합니다.' },
          { status: 400 }
        );
      }
    }

    // 업데이트할 데이터 구성
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (avatar !== undefined) updateData.avatar = avatar;

    // 업데이트할 항목이 없으면 에러
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '수정할 항목이 없습니다.' },
        { status: 400 }
      );
    }

    // DB 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });

    // createdAt을 ISO 문자열로 변환
    const createdAtISO = updatedUser.createdAt 
      ? new Date(updatedUser.createdAt).toISOString() 
      : null;

    return NextResponse.json({
      message: '프로필이 수정되었습니다.',
      user: {
        ...updatedUser,
        createdAt: createdAtISO,
      }
    });
  } catch (error) {
    console.error('[API /user/profile] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 프로필 조회
 * GET /api/user/profile
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // createdAt을 ISO 문자열로 변환
    const createdAtISO = user.createdAt 
      ? new Date(user.createdAt).toISOString() 
      : null;

    return NextResponse.json({
      user: {
        ...user,
        createdAt: createdAtISO,
      }
    });
  } catch (error) {
    console.error('[API /user/profile GET] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

