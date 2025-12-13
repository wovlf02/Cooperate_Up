import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ProfileException } from "@/lib/exceptions/profile"
import {
  logProfileInfo,
  logProfileError,
  logProfileUpdate,
  logProfileSecurity,
  logAccountDeletion
} from "@/lib/loggers/profile"
import {
  validateProfileName,
  validateBio,
  validateDeletionConfirmation,
  checkXSS,
  checkSQLInjection
} from "@/lib/utils/profile"

export async function GET() {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
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
        lastLoginAt: true,
        _count: {
          select: {
            studyMembers: {
              where: { status: 'ACTIVE' }
            },
            tasks: true,
            notifications: {
              where: { isRead: false }
            }
          }
        }
      }
    })

    if (!user) {
      throw ProfileException.notFound({ userId: session.user.id })
    }

    if (user.status === 'DELETED') {
      throw ProfileException.accountDeleted({ userId: session.user.id })
    }

    if (user.status === 'SUSPENDED') {
      throw ProfileException.accountSuspended({ userId: session.user.id })
    }

    logProfileInfo('Profile fetched successfully', {
      userId: session.user.id,
      role: user.role,
      status: user.status
    })

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        stats: {
          studyCount: user._count.studyMembers,
          taskCount: user._count.tasks,
          unreadNotifications: user._count.notifications,
        }
      }
    })

  } catch (error) {
    logProfileError(error, {
      userId: session?.user?.id,
      action: 'fetch_profile'
    })

    if (error instanceof ProfileException) {
      return NextResponse.json(
        error.toResponse(),
        { status: error.statusCode }
      )
    }

    const fetchError = ProfileException.fetchFailed({
      reason: error.message,
      userId: session?.user?.id
    })
    return NextResponse.json(
      fetchError.toResponse(),
      { status: fetchError.statusCode }
    )
  }
}

export async function PATCH(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const { name, bio, avatar } = body

    const updateData = {}
    const updatedFields = []

    // 이름 검증
    if (name !== undefined) {
      if (!name || name.trim() === '') {
        throw ProfileException.requiredFieldMissing({
          field: 'name',
          userId: session.user.id
        })
      }

      const nameValidation = validateProfileName(name)
      if (!nameValidation.valid) {
        throw ProfileException.invalidNameFormat({
          name,
          error: nameValidation.error,
          userId: session.user.id
        })
      }

      // XSS 검사
      if (checkXSS(name)) {
        logProfileSecurity('XSS_DETECTED', {
          userId: session.user.id,
          field: 'name',
          value: name
        })
        throw ProfileException.xssDetected({
          field: 'name',
          userId: session.user.id
        })
      }

      // SQL Injection 검사
      if (checkSQLInjection(name)) {
        logProfileSecurity('SQL_INJECTION_DETECTED', {
          userId: session.user.id,
          field: 'name',
          value: name
        })
        throw ProfileException.sqlInjectionDetected({
          field: 'name',
          userId: session.user.id
        })
      }

      updateData.name = name.trim()
      updatedFields.push('name')
    }

    // 바이오 검증
    if (bio !== undefined) {
      if (bio !== null && bio !== '') {
        const bioValidation = validateBio(bio)
        if (!bioValidation.valid) {
          throw ProfileException.bioTooLong({
            length: bio.length,
            maxLength: 200,
            userId: session.user.id
          })
        }

        // XSS 검사
        if (checkXSS(bio)) {
          logProfileSecurity('XSS_DETECTED', {
            userId: session.user.id,
            field: 'bio',
            value: bio
          })
          throw ProfileException.xssDetected({
            field: 'bio',
            userId: session.user.id
          })
        }

        // SQL Injection 검사
        if (checkSQLInjection(bio)) {
          logProfileSecurity('SQL_INJECTION_DETECTED', {
            userId: session.user.id,
            field: 'bio',
            value: bio
          })
          throw ProfileException.sqlInjectionDetected({
            field: 'bio',
            userId: session.user.id
          })
        }

        updateData.bio = bio.trim()
      } else {
        updateData.bio = null
      }
      updatedFields.push('bio')
    }

    // 아바타 URL 검증
    if (avatar !== undefined) {
      if (avatar && typeof avatar === 'string') {
        // 기본적인 URL 형식 검증
        try {
          new URL(avatar)
          updateData.avatar = avatar
          updatedFields.push('avatar')
        } catch {
          throw ProfileException.avatarUrlInvalid({
            url: avatar,
            userId: session.user.id
          })
        }
      } else if (avatar === null) {
        updateData.avatar = null
        updatedFields.push('avatar')
      }
    }

    // 업데이트할 필드가 없으면 에러
    if (Object.keys(updateData).length === 0) {
      throw ProfileException.requiredFieldMissing({
        field: 'any',
        message: 'No fields to update',
        userId: session.user.id
      })
    }

    // DB 업데이트
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
      }
    }).catch(error => {
      throw ProfileException.updateFailed({
        reason: error.message,
        userId: session.user.id
      })
    })

    logProfileUpdate(session.user.id, updatedFields, {
      fields: updatedFields,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: "프로필이 업데이트되었습니다",
      user
    })

  } catch (error) {
    logProfileError(error, {
      userId: session?.user?.id,
      action: 'update_profile'
    })

    if (error instanceof ProfileException) {
      return NextResponse.json(
        error.toResponse(),
        { status: error.statusCode }
      )
    }

    const updateError = ProfileException.updateFailed({
      reason: error.message,
      userId: session?.user?.id
    })
    return NextResponse.json(
      updateError.toResponse(),
      { status: updateError.statusCode }
    )
  }
}

export async function DELETE(request) {
  const session = await requireAuth()
  if (session instanceof NextResponse) return session

  try {
    const body = await request.json()
    const { confirmation } = body

    // 삭제 확인 검증 (사용자가 "DELETE" 또는 이메일을 입력해야 함)
    if (!confirmation) {
      throw ProfileException.requiredFieldMissing({
        field: 'confirmation',
        userId: session.user.id
      })
    }

    const validationResult = validateDeletionConfirmation(confirmation, session.user.email)
    if (!validationResult.valid) {
      throw ProfileException.confirmationMismatch({
        expected: session.user.email,
        received: confirmation,
        userId: session.user.id
      })
    }

    // OWNER인 스터디가 있는지 확인
    const ownerStudies = await prisma.studyMember.findMany({
      where: {
        userId: session.user.id,
        role: 'OWNER',
        status: 'ACTIVE'
      },
      include: {
        study: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (ownerStudies.length > 0) {
      throw ProfileException.ownerStudyExists({
        studyCount: ownerStudies.length,
        studies: ownerStudies.map(sm => ({
          id: sm.study.id,
          name: sm.study.name
        })),
        userId: session.user.id
      })
    }

    // 계정 상태를 DELETED로 변경 (소프트 삭제)
    const deletedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        status: 'DELETED',
        email: `deleted_${session.user.id}_${Date.now()}@deleted.com`, // 이메일 중복 방지
        name: `[삭제된 사용자]`,
        bio: null,
        avatar: null,
      }
    }).catch(error => {
      throw ProfileException.deletionFailed({
        reason: error.message,
        userId: session.user.id
      })
    })

    logAccountDeletion(session.user.id, {
      email: session.user.email,
      timestamp: new Date().toISOString(),
      reason: 'user_requested'
    })

    return NextResponse.json({
      success: true,
      message: "계정이 삭제되었습니다"
    })

  } catch (error) {
    logProfileError(error, {
      userId: session?.user?.id,
      action: 'delete_account'
    })

    if (error instanceof ProfileException) {
      return NextResponse.json(
        error.toResponse(),
        { status: error.statusCode }
      )
    }

    const deleteError = ProfileException.deletionFailed({
      reason: error.message,
      userId: session?.user?.id
    })
    return NextResponse.json(
      deleteError.toResponse(),
      { status: deleteError.statusCode }
    )
  }
}
