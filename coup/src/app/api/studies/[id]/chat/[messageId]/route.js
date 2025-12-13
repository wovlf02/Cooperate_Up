// src/app/api/studies/[id]/chat/[messageId]/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ChatMessageException } from "@/lib/exceptions/chat"
import { logChatError, logChatInfo, logChatWarning } from "@/lib/utils/chat/errorLogger"

export async function PATCH(request, { params }) {
  try {
    const { id: studyId, messageId } = await params

    // 권한 검증
    const result = await requireStudyMember(studyId)
    if (result instanceof NextResponse) {
      logChatWarning('Unauthorized message update attempt', { studyId, messageId })
      return result
    }

    const { session } = result

    const body = await request.json()
    const { content } = body

    // 내용 검증
    if (!content || !content.trim()) {
      throw ChatMessageException.emptyContent({
        studyId,
        messageId,
        userId: session.user.id
      })
    }

    // 메시지 조회
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      throw ChatMessageException.notFound(messageId, {
        studyId,
        userId: session.user.id
      })
    }

    // 권한 확인 - 작성자만 수정 가능
    if (message.userId !== session.user.id) {
      throw ChatMessageException.unauthorizedEdit({
        studyId,
        messageId,
        userId: session.user.id,
        ownerId: message.userId
      })
    }

    // 메시지 길이 검증
    if (content.trim().length > 2000) {
      throw ChatMessageException.contentTooLong(
        content.trim().length,
        2000,
        { studyId, messageId, userId: session.user.id }
      )
    }

    // 메시지 수정
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        file: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
            size: true
          }
        }
      }
    })

    logChatInfo('Message updated successfully', {
      studyId,
      messageId,
      userId: session.user.id
    })

    return NextResponse.json({
      success: true,
      message: "메시지가 수정되었습니다",
      data: updatedMessage
    })

  } catch (error) {
    const { id: studyId, messageId } = await params
    logChatError(error, { studyId, messageId, action: 'update_message' })

    // ChatMessageException인 경우
    if (error instanceof ChatMessageException) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.userMessage
          }
        },
        { status: error.statusCode || 500 }
      )
    }

    // 일반 에러
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_MESSAGE_FAILED',
          message: "메시지 수정 중 오류가 발생했습니다"
        }
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: studyId, messageId } = await params

    // 권한 검증
    const result = await requireStudyMember(studyId)
    if (result instanceof NextResponse) {
      logChatWarning('Unauthorized message delete attempt', { studyId, messageId })
      return result
    }

    const { session, member } = result

    // 메시지 조회
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      throw ChatMessageException.notFound(messageId, {
        studyId,
        userId: session.user.id
      })
    }

    // 권한 확인 - 작성자 또는 ADMIN/OWNER만 삭제 가능
    const canDelete = message.userId === session.user.id ||
                      ['OWNER', 'ADMIN'].includes(member.role)

    if (!canDelete) {
      throw ChatMessageException.unauthorizedDelete({
        studyId,
        messageId,
        userId: session.user.id,
        ownerId: message.userId,
        userRole: member.role
      })
    }

    // 메시지 삭제
    await prisma.message.delete({
      where: { id: messageId }
    })

    logChatInfo('Message deleted successfully', {
      studyId,
      messageId,
      userId: session.user.id,
      deletedBy: message.userId === session.user.id ? 'owner' : 'admin'
    })

    return NextResponse.json({
      success: true,
      message: "메시지가 삭제되었습니다"
    })

  } catch (error) {
    const { id: studyId, messageId } = await params
    logChatError(error, { studyId, messageId, action: 'delete_message' })

    // ChatMessageException인 경우
    if (error instanceof ChatMessageException) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.userMessage
          }
        },
        { status: error.statusCode || 500 }
      )
    }

    // 일반 에러
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_MESSAGE_FAILED',
          message: "메시지 삭제 중 오류가 발생했습니다"
        }
      },
      { status: 500 }
    )
  }
}

