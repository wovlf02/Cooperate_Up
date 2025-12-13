// 스터디 OWNER 권한 위임 API
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudyMember } from '@/lib/auth-helpers'

/**
 * POST /api/studies/[id]/transfer-ownership
 * OWNER 권한을 다른 ADMIN 멤버에게 위임
 * - 현재 OWNER만 실행 가능
 * - 대상은 ADMIN 역할이어야 함
 * - 위임 후 원래 OWNER는 ADMIN으로 강등
 */
export async function POST(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    const { targetUserId } = await request.json()

    // 1. 현재 사용자가 OWNER인지 확인
    const result = await requireStudyMember(studyId, 'OWNER')
    if (result instanceof NextResponse) return result

    const { session, member: currentOwner } = result

    // 2. 대상 유저 ID 검증
    if (!targetUserId) {
      return NextResponse.json(
        { error: '권한을 위임할 멤버를 선택해주세요.' },
        { status: 400 }
      )
    }

    // 3. 자기 자신에게 위임 불가
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: '자기 자신에게 권한을 위임할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 4. 대상 멤버 조회
    const targetMember = await prisma.studyMember.findFirst({
      where: {
        studyId,
        userId: targetUserId,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!targetMember) {
      return NextResponse.json(
        { error: '해당 멤버를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 5. 대상이 ADMIN인지 확인
    if (targetMember.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'ADMIN 권한을 가진 멤버에게만 OWNER 권한을 위임할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 6. 트랜잭션으로 권한 변경 처리
    await prisma.$transaction([
      // 대상 멤버를 OWNER로 승격
      prisma.studyMember.update({
        where: { id: targetMember.id },
        data: { role: 'OWNER' }
      }),
      // 현재 OWNER를 ADMIN으로 강등
      prisma.studyMember.update({
        where: { id: currentOwner.id },
        data: { role: 'ADMIN' }
      })
    ])

    // 7. 스터디의 ownerId도 변경
    await prisma.study.update({
      where: { id: studyId },
      data: { ownerId: targetUserId }
    })

    return NextResponse.json({
      success: true,
      message: `${targetMember.user.name || targetMember.user.email}님에게 스터디장 권한이 위임되었습니다.`,
      data: {
        newOwner: {
          userId: targetMember.userId,
          name: targetMember.user.name,
          role: 'OWNER'
        },
        oldOwner: {
          userId: session.user.id,
          role: 'ADMIN'
        }
      }
    })

  } catch (error) {
    console.error('Transfer ownership error:', error)
    return NextResponse.json(
      { error: '권한 위임 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    )
  }
}

