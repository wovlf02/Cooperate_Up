// 파일 업로드 API
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // 회원가입 중에는 세션이 없을 수 있으므로 세션 체크를 느슨하게 함
    // if (!session) {
    //   return NextResponse.json(
    //     { error: '인증이 필요합니다' },
    //     { status: 401 }
    //   );
    // }

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'general'; // avatar, file, image, etc.

    if (!file) {
      return NextResponse.json(
        { error: '파일이 제공되지 않았습니다' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 5MB 이하여야 합니다' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (type === 'avatar' && !allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원되지 않는 파일 형식입니다' },
        { status: 400 }
      );
    }

    // 파일명 생성
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.name);
    const fileName = `${type}-${timestamp}-${randomString}${ext}`;

    // 업로드 디렉토리 경로
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);

    // 디렉토리가 없으면 생성
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // 디렉토리가 이미 존재하는 경우 무시
    }

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // URL 생성
    const fileUrl = `/uploads/${type}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

