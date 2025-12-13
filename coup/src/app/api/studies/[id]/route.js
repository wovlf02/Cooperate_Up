// Study [id] API - 완벽한 stub 버전
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudyMember } from '@/lib/auth-helpers'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    
    // 현재 사용자 세션 가져오기
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id
    
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: { 
        members: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            userId: true,  // 명시적으로 userId 포함
            role: true,
            status: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
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
      return NextResponse.json({ error: 'Study not found' }, { status: 404 })
    }

    // 현재 사용자의 역할 찾기 - 별도 쿼리로 정확히 조회
    let myRole = null
    let myJoinedAt = null
    let myMembershipStatus = null

    if (currentUserId) {
      // 현재 사용자의 멤버십을 직접 조회 (상태와 관계없이)
      const myMembership = await prisma.studyMember.findUnique({
        where: {
          studyId_userId: {
            studyId: studyId,
            userId: currentUserId
          }
        },
        select: {
          role: true,
          status: true,
          joinedAt: true
        }
      })

      if (myMembership) {
        myRole = myMembership.role
        myJoinedAt = myMembership.joinedAt
        myMembershipStatus = myMembership.status
      }

      // 디버그 로그 (개발 환경에서만)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Study API] User ${currentUserId} role in study ${studyId}: ${myRole} (status: ${myMembershipStatus})`)
      }
    }

    // currentMembers 계산하여 추가
    const responseData = {
      ...study,
      currentMembers: study._count.members,
      myRole, // 현재 사용자의 역할 추가
      myJoinedAt, // 현재 사용자의 가입일 추가
      myMembershipStatus, // 현재 사용자의 멤버십 상태 추가
    }
    
    return NextResponse.json({ success: true, data: responseData }, { status: 200 })
  } catch (error) {
    console.error('GET study error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    const body = await request.json()
    
    const result = await requireStudyMember(studyId, 'OWNER')
    if (result instanceof NextResponse) return result
    
    const study = await prisma.study.update({
      where: { id: studyId },
      data: body
    })
    
    return NextResponse.json({ success: true, data: study }, { status: 200 })
  } catch (error) {
    console.error('PATCH study error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    
    const result = await requireStudyMember(studyId, 'OWNER')
    if (result instanceof NextResponse) return result
    
    await prisma.study.delete({ where: { id: studyId } })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Study deleted successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('DELETE study error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
