// src/app/api/studies/[id]/files/[fileId]/download/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(request, { params }) {
  const { id: studyId, fileId } = await params

  // 1. 멤버 권한 확인
  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    // 2. 파일 정보 조회 (업로더 정보 포함)
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: {
        uploader: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // 3. 파일 존재 확인 (상세 에러)
    if (!file) {
      return NextResponse.json(
        {
          error: "파일을 찾을 수 없습니다",
          details: "파일이 삭제되었거나 존재하지 않습니다"
        },
        { status: 404 }
      )
    }

    // 4. 스터디 일치 확인
    if (file.studyId !== studyId) {
      console.error('[SECURITY] File access attempt from different study:', {
        userId: session.user.id,
        fileId,
        fileStudyId: file.studyId,
        requestedStudyId: studyId
      })

      return NextResponse.json(
        {
          error: "잘못된 접근입니다",
          details: "이 파일에 접근할 권한이 없습니다"
        },
        { status: 403 }
      )
    }

    // 5. 물리적 파일 존재 확인
    const filepath = join(process.cwd(), 'public', file.url)
    if (!existsSync(filepath)) {
      console.error('[FILE ERROR] Physical file not found:', {
        fileId,
        filepath,
        url: file.url
      })

      return NextResponse.json(
        {
          error: "파일이 서버에서 발견되지 않았습니다",
          details: "관리자에게 문의하세요"
        },
        { status: 500 }
      )
    }

    // 6. 트랜잭션: 다운로드 횟수 증가 + 로그 기록
    await prisma.$transaction([
      // 다운로드 횟수 증가
      prisma.file.update({
        where: { id: fileId },
        data: {
          downloads: {
            increment: 1
          },
          lastDownloadedAt: new Date()
        }
      }),

      // 다운로드 로그 기록
      prisma.fileDownloadLog.create({
        data: {
          fileId,
          userId: session.user.id,
          studyId,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })
    ])

    // 7. 파일 읽기
    const fileBuffer = await readFile(filepath)

    // 8. 파일 응답
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
        'Content-Length': file.size.toString(),
        'X-File-Id': fileId,
        'X-Uploader': file.uploader.name
      }
    })

  } catch (error) {
    console.error('Download file error:', {
      error: error.message,
      stack: error.stack,
      fileId,
      studyId,
      userId: session?.user?.id
    })

    return NextResponse.json(
      {
        error: "파일 다운로드 중 오류가 발생했습니다",
        details: error.message
      },
      { status: 500 }
    )
  }
}

