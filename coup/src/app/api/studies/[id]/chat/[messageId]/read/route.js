// src/app/api/studies/[id]/chat/[messageId]/read/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ChatMessageException, ChatSyncException } from "@/lib/exceptions/chat"
import { logChatError, logChatInfo, logChatWarning } from "@/lib/utils/chat/errorLogger"

export async function POST(request, { params }) {
  try {
    const { id: studyId, messageId } = await params

    // 권한 검증
    const result = await requireStudyMember(studyId)
    if (result instanceof NextResponse) {
      logChatWarning('Unauthorized mark as read attempt', { studyId, messageId })
      return result
    }

    const { session } = result

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message || message.studyId !== studyId) {
      throw ChatMessageException.notFound(messageId, {
        studyId,
        userId: session.user.id
      })
    }

    // 이미 읽음 처리된 경우
    if (message.readers.includes(session.user.id)) {
      logChatInfo('Message already marked as read', {
        studyId,
        messageId,
        userId: session.user.id
      })

      return NextResponse.json({
        success: true,
        message: "이미 읽음 처리되었습니다"
      })
    }

    // 읽은 사용자 추가
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        readers: {
          push: session.user.id
        }
      }
    })

    logChatInfo('Message marked as read', {
      studyId,
      messageId,
      userId: session.user.id
    })

    return NextResponse.json({
      success: true,
      message: "메시지를 읽음 처리했습니다",
      data: updated
    })

  } catch (error) {
    const { id: studyId, messageId } = await params
    logChatError(error, { studyId, messageId, action: 'mark_as_read' })

    // ChatException인 경우
    if (error instanceof ChatMessageException || error instanceof ChatSyncException) {
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
          code: 'MARK_AS_READ_FAILED',
          message: "메시지 읽음 처리 중 오류가 발생했습니다"
        }
      },
      { status: 500 }
    )
  }
}

