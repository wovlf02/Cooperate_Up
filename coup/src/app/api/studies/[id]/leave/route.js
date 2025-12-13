// Study leave API - 완벽한 stub 버전
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudyMember } from '@/lib/auth-helpers'

export async function POST(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    
    const result = await requireStudyMember(studyId)
    if (result instanceof NextResponse) return result
    
    const { session, member } = result
    
    // Cannot leave if OWNER
    if (member.role === 'OWNER') {
      return NextResponse.json({ 
        error: 'Owner cannot leave study' 
      }, { status: 400 })
    }
    
    await prisma.studyMember.delete({
      where: { id: member.id }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Left study successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('POST leave error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
