// src/app/api/studies/[id]/join/route.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/studies/[id]/join
 * 스터디 가입 신청
 */
export async function POST(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params

    // 1. 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다', type: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 2. 스터디 존재 확인
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })

    if (!study) {
      return NextResponse.json(
        { success: false, error: '스터디를 찾을 수 없습니다', type: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // 3. 이미 멤버인지 확인
    const existingMember = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: { studyId, userId }
      }
    })

    if (existingMember) {
      if (existingMember.status === 'ACTIVE') {
        return NextResponse.json(
          { success: false, error: '이미 이 스터디의 멤버입니다', type: 'ALREADY_MEMBER' },
          { status: 400 }
        )
      }
      if (existingMember.status === 'KICKED') {
        return NextResponse.json(
          { success: false, error: '강퇴된 스터디에는 다시 가입할 수 없습니다', type: 'KICKED_MEMBER' },
          { status: 403 }
        )
      }
      if (existingMember.status === 'PENDING') {
        return NextResponse.json(
          { success: false, error: '이미 가입 신청 중입니다', type: 'APPLICATION_ALREADY_EXISTS' },
          { status: 400 }
        )
      }
      // LEFT 상태인 경우: 다시 가입 가능 - 아래에서 update로 처리
    }

    // 4. 정원 확인
    const currentMembers = study._count.members
    if (currentMembers >= study.maxMembers) {
      return NextResponse.json(
        { success: false, error: '스터디 정원이 가득 찼습니다', type: 'STUDY_FULL' },
        { status: 400 }
      )
    }

    // 5. 모집 중인지 확인
    if (!study.isRecruiting) {
      return NextResponse.json(
        { success: false, error: '현재 멤버를 모집하지 않는 스터디입니다', type: 'NOT_RECRUITING' },
        { status: 400 }
      )
    }

    // 6. 요청 body 파싱
    const body = await request.json().catch(() => ({}))
    const { introduction, purpose, level } = body

    // 7. 자동 승인 여부에 따른 처리
    if (study.autoApprove) {
      // 자동 승인: 바로 멤버로 추가
      let member
      if (existingMember && existingMember.status === 'LEFT') {
        // LEFT 상태 -> ACTIVE로 업데이트 (재가입)
        member = await prisma.studyMember.update({
          where: { id: existingMember.id },
          data: {
            role: 'MEMBER',
            status: 'ACTIVE',
            joinedAt: new Date(),
            approvedAt: new Date()
          }
        })
      } else {
        member = await prisma.studyMember.create({
          data: {
            studyId,
            userId,
            role: 'MEMBER',
            status: 'ACTIVE',
            joinedAt: new Date(),
            approvedAt: new Date()
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: '스터디에 가입되었습니다',
        data: {
          ...member,
          autoApproved: true
        }
      }, { status: 201 })
    } else {
      // 수동 승인: PENDING 상태로 생성
      let member
      if (existingMember && existingMember.status === 'LEFT') {
        // LEFT 상태 -> PENDING으로 업데이트 (재가입 신청)
        member = await prisma.studyMember.update({
          where: { id: existingMember.id },
          data: {
            role: 'MEMBER',
            status: 'PENDING',
            joinedAt: new Date(),
            approvedAt: null
          }
        })
      } else {
        member = await prisma.studyMember.create({
          data: {
            studyId,
            userId,
            role: 'MEMBER',
            status: 'PENDING',
            joinedAt: new Date(),
            // 가입 신청 정보는 별도 필드가 없으면 memo 등에 저장하거나 JoinRequest 테이블 사용
          }
        })
      }

      // JoinRequest 테이블이 있다면 추가 정보 저장
      try {
        await prisma.joinRequest.create({
          data: {
            studyId,
            userId,
            message: introduction || '',
            status: 'PENDING'
          }
        })
      } catch (e) {
        // JoinRequest 테이블이 없거나 에러 시 무시
        console.log('JoinRequest 생성 스킵:', e.message)
      }

      return NextResponse.json({
        success: true,
        message: '가입 신청이 완료되었습니다. 승인을 기다려주세요.',
        data: {
          ...member,
          autoApproved: false
        }
      }, { status: 201 })
    }

  } catch (error) {
    console.error('스터디 가입 오류:', error)

    // Prisma unique constraint 에러 처리
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: '이미 가입 신청 중이거나 멤버입니다', type: 'DUPLICATE' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: '가입 처리 중 오류가 발생했습니다', type: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
