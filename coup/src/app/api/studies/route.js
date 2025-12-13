// Stub for testing
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from 'next-auth/react'

export async function POST(request, context) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.category || !body.emoji) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    if (body.name.length < 2 || body.name.length > 50) {
      return NextResponse.json({ error: 'Invalid name length' }, { status: 400 })
    }
    
    const study = await prisma.study.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        capacity: body.capacity || 10,
        emoji: body.emoji,
        tags: body.tags || [],
        ownerId: session.user.id,
        status: 'RECRUITING'
      }
    })
    
    await prisma.studyMember.create({
      data: {
        studyId: study.id,
        userId: session.user.id,
        role: 'OWNER',
        status: 'ACTIVE'
      }
    })
    
    return NextResponse.json({ success: true, data: study }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const recruitingFilter = searchParams.get('recruiting') // 'all', 'recruiting', 'closed'
    
    // 필터 조건 구성 - 공개 스터디만 표시
    const where = {
      isPublic: true,
    }

    if (category && category !== '전체') {
      where.category = category
    }
    
    // 모집 상태 필터 (isRecruiting 필드 기준 - 인원마감은 별도 처리)
    if (recruitingFilter === 'recruiting') {
      // 모집중: isRecruiting이 true인 것만 (인원마감은 아래에서 추가 필터링)
      where.isRecruiting = true
    } else if (recruitingFilter === 'closed') {
      // 모집마감: isRecruiting이 false인 것만 조회 (인원마감은 아래에서 추가)
      where.isRecruiting = false
    }
    // 'all'이거나 없으면 isRecruiting 조건 없이 전체 표시

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ]
    }
    
    // 인원마감 필터링을 위해 더 많은 데이터를 조회
    // (인원마감 스터디가 제외될 수 있으므로 여유분 확보)
    const fetchLimit = recruitingFilter === 'recruiting' ? limit * 3 : limit
    const fetchSkip = recruitingFilter === 'recruiting' ? 0 : (page - 1) * limit

    const studies = await prisma.study.findMany({
      where,
      skip: fetchSkip,
      take: recruitingFilter === 'recruiting' ? undefined : fetchLimit, // 모집중일 때는 전체 조회
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // 응답 데이터 가공 및 인원마감 필터링
    let formattedStudies = studies.map(study => ({
      ...study,
      currentMembers: study._count?.members || 0,
    }))
    
    // 모집중 필터: 인원마감 스터디 제외 (현재 인원 >= 최대 인원)
    if (recruitingFilter === 'recruiting') {
      formattedStudies = formattedStudies.filter(study =>
        study.currentMembers < study.maxMembers
      )
    }

    // 모집마감 필터: isRecruiting=false 이거나 인원마감인 스터디 모두 포함
    if (recruitingFilter === 'closed') {
      // 인원마감 스터디도 추가로 조회 (isRecruiting은 true지만 인원이 꽉 찬 스터디)
      const fullStudiesWhere = {
        isPublic: true,
        isRecruiting: true,
        ...(category && category !== '전체' ? { category } : {}),
      }

      // 검색 조건도 적용
      if (search && search.trim()) {
        fullStudiesWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search] } },
        ]
      }

      const fullStudies = await prisma.study.findMany({
        where: fullStudiesWhere,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          },
          _count: {
            select: {
              members: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // 인원마감 스터디 필터링 및 추가
      const fullFormattedStudies = fullStudies
        .map(study => ({
          ...study,
          currentMembers: study._count?.members || 0,
        }))
        .filter(study => study.currentMembers >= study.maxMembers)

      // 기존 모집마감 스터디와 인원마감 스터디 합치기 (중복 제거)
      const existingIds = new Set(formattedStudies.map(s => s.id))
      fullFormattedStudies.forEach(study => {
        if (!existingIds.has(study.id)) {
          formattedStudies.push(study)
        }
      })

      // 최신순 정렬
      formattedStudies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    // 전체 개수 계산 (필터링 적용된 결과 기준)
    let total
    if (recruitingFilter === 'recruiting') {
      // 모집중: isRecruiting=true이고 인원마감이 아닌 스터디 수
      total = formattedStudies.length
    } else if (recruitingFilter === 'closed') {
      // 모집마감: 필터링된 전체 수
      total = formattedStudies.length
    } else {
      total = await prisma.study.count({ where })
    }

    // 페이지네이션 적용 (모집중/모집마감 필터 시)
    if (recruitingFilter === 'recruiting' || recruitingFilter === 'closed') {
      const start = (page - 1) * limit
      formattedStudies = formattedStudies.slice(start, start + limit)
    }

    return NextResponse.json({
      success: true,
      data: formattedStudies,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('[API /studies] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
