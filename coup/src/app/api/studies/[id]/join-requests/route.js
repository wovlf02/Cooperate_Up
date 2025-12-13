// Study join-requests API - StudyMember의 PENDING 상태 활용
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudyMember } from '@/lib/auth-helpers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    
    const result = await requireStudyMember(studyId, 'ADMIN')
    if (result instanceof NextResponse) return result
    
    // PENDING 상태의 StudyMember를 가입 요청으로 조회
    const requests = await prisma.studyMember.findMany({
      where: { studyId, status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            // 유저가 참여 중인 다른 스터디 정보
            studyMembers: {
              where: { status: 'ACTIVE' },
              include: {
                study: {
                  select: {
                    id: true,
                    name: true,
                    emoji: true,
                    category: true
                  }
                }
              },
              orderBy: { joinedAt: 'desc' },
              take: 5 // 최근 5개만
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: requests })
  } catch (error) {
    console.error('GET join-requests error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    const body = await request.json()
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if study exists
    const study = await prisma.study.findUnique({ where: { id: studyId } })
    if (!study) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 })
    }
    
    // Check capacity (활성 멤버 수)
    const memberCount = await prisma.studyMember.count({ 
      where: { studyId, status: 'ACTIVE' } 
    })
    
    if (memberCount >= study.capacity) {
      return NextResponse.json({ error: 'Study is full' }, { status: 400 })
    }
    
    // Check if already member or has pending request
    const existingMember = await prisma.studyMember.findUnique({
      where: { 
        studyId_userId: { studyId, userId: session.user.id } 
      }
    })
    
    if (existingMember) {
      if (existingMember.status === 'ACTIVE') {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 })
      }
      if (existingMember.status === 'PENDING') {
        return NextResponse.json({ error: 'Request already exists' }, { status: 400 })
      }
      if (existingMember.status === 'KICKED') {
        return NextResponse.json({ error: 'Cannot rejoin after being kicked' }, { status: 403 })
      }
      // LEFT 상태면 다시 PENDING으로 업데이트
      if (existingMember.status === 'LEFT') {
        const updated = await prisma.studyMember.update({
          where: { id: existingMember.id },
          data: { 
            status: 'PENDING',
            introduction: body.message || body.introduction || '',
            joinedAt: new Date()
          }
        })
        return NextResponse.json({ success: true, data: updated }, { status: 201 })
      }
    }
    
    // PENDING 상태로 StudyMember 생성 (가입 요청)
    const joinRequest = await prisma.studyMember.create({
      data: { 
        studyId, 
        userId: session.user.id, 
        role: 'MEMBER',
        status: 'PENDING',
        introduction: body.message || body.introduction || '',
        joinedAt: new Date()
      }
    })
    
    return NextResponse.json({ success: true, data: joinRequest }, { status: 201 })
  } catch (error) {
    console.error('POST join-requests error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')
    
    const result = await requireStudyMember(studyId, 'ADMIN')
    if (result instanceof NextResponse) return result
    
    // PENDING 상태의 StudyMember 찾기
    const joinRequest = await prisma.studyMember.findFirst({
      where: { id: requestId, studyId, status: 'PENDING' }
    })
    
    if (!joinRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    
    if (body.action === 'approve') {
      // 승인: PENDING → ACTIVE로 변경
      const updated = await prisma.studyMember.update({
        where: { id: requestId },
        data: { 
          status: 'ACTIVE',
          joinedAt: new Date()
        }
      })
      return NextResponse.json({ success: true, data: updated })
    } else {
      // 거절: StudyMember 레코드 삭제 (또는 REJECTED 상태로 변경)
      await prisma.studyMember.delete({
        where: { id: requestId }
      })
      return NextResponse.json({ success: true, message: 'Request rejected' })
    }
  } catch (error) {
    console.error('PATCH join-requests error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
