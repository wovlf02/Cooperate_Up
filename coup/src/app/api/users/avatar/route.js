// src/app/api/users/avatar/route.js
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ProfileException } from "@/lib/exceptions/profile"
import { logProfileError, logAvatarUpload, logProfileInfo } from "@/lib/loggers/profile"
import { validateAvatarFile } from "@/lib/utils/profile"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

/**
 * POST /api/users/avatar
 * 아바타 이미지 업로드
 */
export async function POST(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    // 파일 제공 여부 확인
    if (!file) {
      throw ProfileException.fileNotProvided({
        userId: session.user.id
      })
    }

    // 파일 검증
    const validation = validateAvatarFile(file)
    if (!validation.valid) {
      if (validation.error.includes('크기')) {
        throw ProfileException.fileTooLarge({
          size: file.size,
          maxSize: '5MB',
          userId: session.user.id
        })
      } else if (validation.error.includes('형식')) {
        throw ProfileException.invalidFileType({
          type: file.type,
          error: validation.error,
          userId: session.user.id
        })
      } else {
        throw ProfileException.invalidImageFormat({
          error: validation.error,
          userId: session.user.id
        })
      }
    }

    // 파일 저장
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 고유 파일명 생성
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${session.user.id}_${timestamp}_${originalName}`

    // 업로드 디렉토리 경로
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    const filePath = join(uploadDir, fileName)

    // 디렉토리 존재 확인 및 생성
    const fs = require('fs')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // 파일 저장
    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      throw ProfileException.uploadFailed({
        reason: error.message,
        userId: session.user.id
      })
    }

    // DB 업데이트 - 상대 경로로 저장
    const avatarUrl = `/uploads/avatars/${fileName}`

    // 기존 아바타 파일 삭제 (기본 이미지가 아닌 경우)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true }
    })

    if (currentUser?.avatar && currentUser.avatar.startsWith('/uploads/avatars/')) {
      const oldFilePath = join(process.cwd(), 'public', currentUser.avatar)
      if (existsSync(oldFilePath)) {
        try {
          await unlink(oldFilePath)
        } catch (error) {
          // 기존 파일 삭제 실패는 무시 (중요하지 않음)
          console.warn('Failed to delete old avatar:', error)
        }
      }
    }

    // DB 업데이트
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
      }
    }).catch(error => {
      // 업로드된 파일 삭제
      unlink(filePath).catch(() => {})
      throw ProfileException.uploadFailed({
        reason: error.message,
        userId: session.user.id
      })
    })

    logAvatarUpload(session.user.id, {
      fileName,
      size: file.size,
      type: file.type,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: "아바타가 업로드되었습니다",
      user
    })

  } catch (error) {
    logProfileError(error, {
      userId: session?.user?.id,
      action: 'upload_avatar'
    })

    if (error instanceof ProfileException) {
      return NextResponse.json(
        error.toResponse(),
        { status: error.statusCode }
      )
    }

    const uploadError = ProfileException.uploadFailed({
      reason: error.message,
      userId: session?.user?.id
    })
    return NextResponse.json(
      uploadError.toResponse(),
      { status: uploadError.statusCode }
    )
  }
}

/**
 * DELETE /api/users/avatar
 * 아바타 이미지 삭제 (기본 이미지로 복구)
 */
export async function DELETE() {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    // 현재 아바타 확인
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true }
    })

    if (!currentUser) {
      throw ProfileException.notFound({ userId: session.user.id })
    }

    if (!currentUser.avatar || !currentUser.avatar.startsWith('/uploads/avatars/')) {
      throw ProfileException.avatarNotFound({
        message: 'No custom avatar to delete',
        userId: session.user.id
      })
    }

    // 파일 삭제
    const filePath = join(process.cwd(), 'public', currentUser.avatar)
    if (existsSync(filePath)) {
      try {
        await unlink(filePath)
      } catch (error) {
        throw ProfileException.avatarDeleteFailed({
          reason: error.message,
          userId: session.user.id
        })
      }
    }

    // DB 업데이트 - null로 설정 (기본 아바타 사용)
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: null },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
      }
    }).catch(error => {
      throw ProfileException.avatarDeleteFailed({
        reason: error.message,
        userId: session.user.id
      })
    })

    logProfileInfo('Avatar deleted successfully', {
      userId: session.user.id,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: "아바타가 삭제되었습니다",
      user
    })

  } catch (error) {
    logProfileError(error, {
      userId: session?.user?.id,
      action: 'delete_avatar'
    })

    if (error instanceof ProfileException) {
      return NextResponse.json(
        error.toResponse(),
        { status: error.statusCode }
      )
    }

    const deleteError = ProfileException.avatarDeleteFailed({
      reason: error.message,
      userId: session?.user?.id
    })
    return NextResponse.json(
      deleteError.toResponse(),
      { status: deleteError.statusCode }
    )
  }
}

