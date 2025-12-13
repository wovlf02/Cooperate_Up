// src/app/api/studies/[id]/chat/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { validateAndSanitize } from "@/lib/utils/input-sanitizer"
import { validateSecurityThreats, logSecurityEvent } from "@/lib/utils/xss-sanitizer"
import { ChatMessageException } from "@/lib/exceptions/chat"
import { logChatError, logChatInfo, logChatWarning } from "@/lib/utils/chat/errorLogger"

export async function GET(request, { params }) {
  try {
    const { id: studyId } = await params

    // 권한 검증
    const result = await requireStudyMember(studyId)
    if (result instanceof NextResponse) {
      logChatWarning('Unauthorized access attempt', { studyId })
      return result
    }

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor') // 마지막 메시지 ID
    const limit = parseInt(searchParams.get('limit') || '50')

    // limit 검증
    if (limit < 1 || limit > 100) {
      logChatWarning('Invalid limit parameter', { studyId, limit })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_LIMIT',
            message: 'limit은 1-100 사이의 값이어야 합니다'
          }
        },
        { status: 400 }
      )
    }

    let whereClause = { studyId }

    // cursor 기반 페이지네이션 (무한 스크롤)
    const messages = await prisma.message.findMany({
      where: whereClause,
      take: limit,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1 // cursor 자체는 제외
      }),
      orderBy: {
        createdAt: 'desc'
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

    // 역순으로 반환 (최신 메시지가 아래로)
    const reversedMessages = messages.reverse()

    logChatInfo('Messages fetched successfully', {
      studyId,
      count: messages.length,
      hasMore: messages.length === limit
    })

    return NextResponse.json({
      success: true,
      data: reversedMessages,
      hasMore: messages.length === limit,
      nextCursor: messages.length > 0 ? messages[0].id : null
    })

  } catch (error) {
    const studyId = (await params)?.id
    logChatError(error, { studyId, action: 'fetch_messages' })

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
          code: 'FETCH_MESSAGES_FAILED',
          message: "메시지를 가져오는 중 오류가 발생했습니다"
        }
      },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { id: studyId } = await params

    // 권한 검증
    const result = await requireStudyMember(studyId)
    if (result instanceof NextResponse) {
      logChatWarning('Unauthorized message send attempt', { studyId })
      return result
    }

    const { session } = result

    const body = await request.json()
    const { content, fileId } = body

    // 1. 기본 검증
    if (!content && !fileId) {
      throw ChatMessageException.emptyContent({ studyId, userId: session.user.id })
    }

    // 2. 보안 위협 검증 (content가 있는 경우만)
    if (content) {
      const threats = validateSecurityThreats(content);

      if (!threats.safe) {
        logSecurityEvent('XSS_ATTEMPT_DETECTED', {
          userId: session.user.id,
          studyId,
          field: 'chat_message',
          threats: threats.threats,
        });

        throw ChatMessageException.xssDetected(threats.threats, {
          studyId,
          userId: session.user.id
        })
      }
    }

    // 3. 입력값 검증 및 정제
    const validation = validateAndSanitize(
      { content, fileId },
      'CHAT_MESSAGE'
    );

    if (!validation.valid) {
      logChatWarning('Message validation failed', {
        studyId,
        userId: session.user.id,
        errors: validation.errors
      })

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: "입력값이 유효하지 않습니다",
            details: validation.errors
          }
        },
        { status: 400 }
      );
    }

    const sanitizedData = validation.sanitized;

    // 4. 메시지 길이 제한 (2000자)
    if (sanitizedData.content && sanitizedData.content.length > 2000) {
      throw ChatMessageException.contentTooLong(
        sanitizedData.content.length,
        2000,
        { studyId, userId: session.user.id }
      )
    }

    // 5. 스팸 감지 (최근 10초 내 5개 이상 메시지)
    const timeWindow = 10; // seconds
    const maxMessages = 5;
    const recentMessages = await prisma.message.count({
      where: {
        studyId,
        userId: session.user.id,
        createdAt: {
          gte: new Date(Date.now() - timeWindow * 1000),
        },
      },
    });

    if (recentMessages >= maxMessages) {
      throw ChatMessageException.spamDetected(recentMessages, timeWindow, {
        studyId,
        userId: session.user.id
      })
    }

    // 6. 파일 ID 검증 (존재하는 경우)
    if (sanitizedData.fileId) {
      const file = await prisma.file.findUnique({
        where: { id: sanitizedData.fileId },
      });

      if (!file || file.studyId !== studyId) {
        logChatWarning('Invalid file ID', {
          studyId,
          userId: session.user.id,
          fileId: sanitizedData.fileId
        })

        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_FILE',
              message: "유효하지 않은 파일입니다"
            }
          },
          { status: 400 }
        );
      }
    }

    // 7. 메시지 생성
    const message = await prisma.message.create({
      data: {
        studyId,
        userId: session.user.id,
        content: sanitizedData.content || '',
        fileId: sanitizedData.fileId,
        readers: [session.user.id] // 작성자는 자동으로 읽음
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

    // 8. 다른 멤버들에게 알림
    const members = await prisma.studyMember.findMany({
      where: {
        studyId,
        status: 'ACTIVE',
        userId: { not: session.user.id }
      },
      take: 10 // 알림은 최대 10명까지만
    })

    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { name: true, emoji: true }
    })

    // 채팅 알림 생성 (선택적)
    if (members.length > 0 && study) {
      await prisma.notification.createMany({
        data: members.map(member => ({
          userId: member.userId,
          type: 'CHAT',
          studyId,
          studyName: study.name,
          studyEmoji: study.emoji,
          message: `${session.user.name}님이 메시지를 보냈습니다`
        }))
      })
    }

    logChatInfo('Message created successfully', {
      studyId,
      messageId: message.id,
      userId: session.user.id,
      hasFile: !!sanitizedData.fileId
    })

    return NextResponse.json({
      success: true,
      message: "메시지가 전송되었습니다",
      data: message
    }, { status: 201 })

  } catch (error) {
    const studyId = (await params)?.id
    logChatError(error, { studyId, action: 'send_message' })

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
          code: 'SEND_MESSAGE_FAILED',
          message: "메시지 전송 중 오류가 발생했습니다"
        }
      },
      { status: 500 }
    )
  }
}

