/**
 * /api/groups/search/route.js
 *
 * 그룹 고급 검색 API
 *
 * @route GET /api/groups/search
 * @access Private
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GroupBusinessException } from '@/lib/exceptions/group';
import { GroupLogger } from '@/lib/logging/groupLogger';

/**
 * GET /api/groups/search
 *
 * 고급 그룹 검색
 * - 다중 조건 필터링
 * - 정렬 옵션 (관련도, 인기순, 최신순)
 * - 페이지네이션
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const isPublic = searchParams.get('isPublic');
    const isRecruiting = searchParams.get('isRecruiting');
    const minMembers = parseInt(searchParams.get('minMembers') || '0');
    const maxMembers = parseInt(searchParams.get('maxMembers') || '999');
    const sort = searchParams.get('sort') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Where 조건 구성
    const where = {
      deletedAt: null,
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      }),
      ...(category && { category }),
      ...(isPublic !== null && { isPublic: isPublic === 'true' }),
      ...(isRecruiting !== null && { isRecruiting: isRecruiting === 'true' })
    };

    // 정렬 조건
    let orderBy;
    switch (sort) {
      case 'popular':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      default: // relevance
        orderBy = query
          ? [{ name: 'asc' }, { createdAt: 'desc' }]
          : { createdAt: 'desc' };
    }

    const skip = (page - 1) * limit;

    // 검색 실행
    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              members: { where: { status: 'ACTIVE' } }
            }
          },
          members: {
            where: {
              userId: session.user.id,
              status: { in: ['ACTIVE', 'PENDING'] }
            },
            select: { role: true, status: true }
          }
        }
      }),
      prisma.group.count({ where })
    ]);

    // 정원 필터링 (후처리)
    const filteredGroups = groups.filter(group => {
      const memberCount = group._count.members;
      return memberCount >= minMembers && memberCount <= maxMembers;
    });

    // 응답 포맷팅
    const formattedGroups = filteredGroups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      category: group.category,
      isPublic: group.isPublic,
      isRecruiting: group.isRecruiting,
      maxMembers: group.maxMembers,
      imageUrl: group.imageUrl,
      createdAt: group.createdAt,
      currentMembers: group._count.members,
      isMember: group.members.length > 0,
      myRole: group.members[0]?.role || null,
      myStatus: group.members[0]?.status || null
    }));

    GroupLogger.info('Groups search completed', {
      userId: session.user.id,
      query,
      total: filteredGroups.length,
      filters: { category, isPublic, isRecruiting, minMembers, maxMembers, sort }
    });

    return NextResponse.json({
      success: true,
      data: {
        groups: formattedGroups,
        pagination: {
          page,
          limit,
          total: total,
          totalFiltered: filteredGroups.length,
          totalPages: Math.ceil(filteredGroups.length / limit)
        },
        filters: {
          query,
          category,
          isPublic,
          isRecruiting,
          minMembers,
          maxMembers,
          sort
        }
      }
    });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return NextResponse.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to search groups', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '그룹 검색에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

