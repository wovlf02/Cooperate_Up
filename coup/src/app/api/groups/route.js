/**
 * /api/groups/route.js
 *
 * 그룹 목록 조회 및 생성 API
 *
 * @routes
 * - GET  /api/groups - 그룹 목록 조회
 * - POST /api/groups - 그룹 생성
 *
 * @author CoUp Team
 * @created 2025-12-03
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GroupBusinessException } from '@/lib/exceptions/group';
import { GroupLogger } from '@/lib/logging/groupLogger';
import {
  formatGroupResponse,
  checkDuplicateGroupName
} from '@/lib/helpers/group-helpers';
import { validateGroupData } from '@/lib/validators/group-validators';

/**
 * GET /api/groups
 * 그룹 목록 조회
 *
 * @param {Request} request
 * @returns {Response}
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // 최대 100개
    const category = searchParams.get('category');
    const isPublic = searchParams.get('isPublic');
    const isRecruiting = searchParams.get('isRecruiting');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'latest'; // latest, popular

    const skip = (page - 1) * limit;

    // Where 조건 구성
    const where = {
      deletedAt: null,
      ...(category && { category }),
      ...(isPublic !== null && { isPublic: isPublic === 'true' }),
      ...(isRecruiting !== null && { isRecruiting: isRecruiting === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // 정렬 조건
    const orderBy = sort === 'popular'
      ? [{ members: { _count: 'desc' } }, { createdAt: 'desc' }]
      : { createdAt: 'desc' };

    // 데이터 조회
    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              members: {
                where: { status: 'ACTIVE' }
              }
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

    // 응답 포맷팅
    const formattedGroups = groups.map(group => ({
      ...formatGroupResponse(group),
      currentMembers: group._count.members,
      isMember: group.members.length > 0,
      myRole: group.members[0]?.role || null,
      myStatus: group.members[0]?.status || null
    }));

    GroupLogger.info('Groups list retrieved', {
      userId: session.user.id,
      total,
      page,
      limit,
      filters: { category, isPublic, isRecruiting, search, sort }
    });

    return NextResponse.json({
      success: true,
      data: {
        groups: formattedGroups,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      GroupLogger.warn('Failed to retrieve groups list', {
        error: error.toJSON()
      });
      return NextResponse.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to retrieve groups list', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '그룹 목록 조회에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups
 * 그룹 생성
 *
 * @param {Request} request
 * @returns {Response}
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const body = await request.json();

    // 입력 검증
    const validated = validateGroupData(body);

    // 그룹 이름 중복 확인
    await checkDuplicateGroupName(validated.name, null, prisma);

    // 트랜잭션: 그룹 생성 + OWNER 추가
    const result = await prisma.$transaction(async (tx) => {
      // 그룹 생성
      const group = await tx.group.create({
        data: {
          name: validated.name,
          description: validated.description,
          category: validated.category || 'etc',
          isPublic: validated.isPublic !== undefined ? validated.isPublic : true,
          maxMembers: validated.maxMembers || 50,
          isRecruiting: true,
          imageUrl: validated.imageUrl || null,
          createdBy: session.user.id
        }
      });

      // 생성자를 OWNER로 추가
      const member = await tx.groupMember.create({
        data: {
          groupId: group.id,
          userId: session.user.id,
          role: 'OWNER',
          status: 'ACTIVE'
        }
      });

      return { group, member };
    });

    // 로깅
    GroupLogger.logGroupCreated(result.group.id, session.user.id, result.group);
    GroupLogger.logMemberAdded(result.group.id, session.user.id, session.user.id, 'OWNER');

    return NextResponse.json({
      success: true,
      data: formatGroupResponse(result.group),
      message: '그룹이 성공적으로 생성되었습니다.'
    }, { status: 201 });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      GroupLogger.warn('Failed to create group', {
        userId: error.userId,
        error: error.toJSON()
      });
      return NextResponse.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to create group', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GROUP-INTERNAL-ERROR',
          message: '그룹 생성에 실패했습니다.'
        }
      },
      { status: 500 }
    );
  }
}

