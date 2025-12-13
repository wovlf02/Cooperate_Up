/**
 * 관리자 - 스터디 상세 정보 API
 * GET /api/admin/studies/[studyId]
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAdmin } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'
import {
  AdminPermissionException,
  AdminBusinessException,
  AdminDatabaseException,
  AdminValidationException
} from '@/lib/exceptions/admin'
import { AdminLogger } from '@/lib/logging/adminLogger'
import { withAdminErrorHandler } from '@/lib/utils/admin-utils'

const prisma = new PrismaClient()

async function getStudyDetailHandler(request, context) {
  const startTime = Date.now()

  // 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.STUDY_VIEW)
  if (auth instanceof NextResponse) {
    throw AdminPermissionException.insufficientPermission(PERMISSIONS.STUDY_VIEW, 'unknown')
  }

  const { adminRole } = auth
  const adminId = adminRole.userId

  // Next.js 15에서 params는 Promise이므로 await 필요
  const params = await context.params
  const { studyId } = params

  // studyId 검증
  if (!studyId || typeof studyId !== 'string') {
    throw AdminValidationException.missingField('studyId')
  }

  AdminLogger.info('Admin study detail request', { adminId, studyId })

  try {
    // 스터디 조회
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            status: true,
            createdAt: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                status: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'desc',
          },
        },
        _count: {
          select: {
            messages: true,
            files: true,
            notices: true,
            events: true,
            tasks: true,
            studyTasks: true,
          },
        },
      },
    }).catch(error => {
      AdminLogger.error('Database query failed for study detail', {
        adminId,
        studyId,
        error: error.message
      })
      throw AdminDatabaseException.queryFailed('study.findUnique', error.message)
    })

    if (!study) {
      throw AdminBusinessException.studyNotFound(studyId, { adminId })
    }

    // 활동 통계 계산
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      recentMessages,
      weeklyMessages,
      lastMessage,
      recentFiles,
      activeMembers,
    ] = await Promise.all([
      // 최근 30일 메시지 수
      prisma.message.count({
        where: {
          studyId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      // 최근 7일 메시지 수
      prisma.message.count({
        where: {
          studyId,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      // 최근 메시지
      prisma.message.findFirst({
        where: { studyId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      // 최근 30일 파일 수
      prisma.file.count({
        where: {
          studyId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      // 활성 멤버 수 (최근 7일 활동)
      prisma.message
        .findMany({
          where: {
            studyId,
            createdAt: { gte: sevenDaysAgo },
          },
          distinct: ['userId'],
          select: { userId: true },
        })
        .then((messages) => messages.length),
    ])

    // 평균 일일 메시지 수
    const avgMessagesPerDay = recentMessages / 30

    // 멤버 통계
    const memberStats = {
      total: study.members.length,
      active: study.members.filter((m) => m.status === 'ACTIVE').length,
      pending: study.members.filter((m) => m.status === 'PENDING').length,
      kicked: study.members.filter((m) => m.status === 'KICKED').length,
      left: study.members.filter((m) => m.status === 'LEFT').length,
    }

    // 멤버 목록 변환
    const transformedMembers = study.members.map((member) => ({
      id: member.id,
      user: member.user,
      role: member.role,
      status: member.status,
      joinedAt: member.joinedAt,
      approvedAt: member.approvedAt,
    }))

    // 응답 데이터 구성
    const response = {
      id: study.id,
      name: study.name,
      emoji: study.emoji,
      description: study.description,
      category: study.category,
      subCategory: study.subCategory,
      tags: study.tags,
      inviteCode: study.inviteCode,

      owner: study.owner,

      settings: {
        maxMembers: study.maxMembers,
        isPublic: study.isPublic,
        autoApprove: study.autoApprove,
        isRecruiting: study.isRecruiting,
      },

      members: transformedMembers,
      memberStats,

      activityStats: {
        messages: study._count.messages,
        recentMessages,
        weeklyMessages,
        avgMessagesPerDay: Math.round(avgMessagesPerDay * 10) / 10,
        files: study._count.files,
        recentFiles,
        notices: study._count.notices,
        events: study._count.events,
        tasks: study._count.tasks,
        studyTasks: study._count.studyTasks,
        activeMembers,
        lastActivityAt: lastMessage?.createdAt || study.updatedAt,
      },

      rating: study.rating || 0,
      reviewCount: study.reviewCount || 0,

      createdAt: study.createdAt,
      updatedAt: study.updatedAt,
    }

    // 로그 기록
    const duration = Date.now() - startTime
    AdminLogger.logStudyView(adminId, studyId, {
      studyName: study.name,
      memberCount: memberStats.total,
      duration
    })

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    // 예외가 이미 AdminException인 경우 그대로 전달
    if (error.name?.includes('Admin')) {
      throw error
    }

    // 데이터베이스 에러
    if (error.code?.startsWith('P')) {
      AdminLogger.error('Database error in study detail', {
        adminId,
        studyId,
        error: error.message,
        code: error.code
      })
      throw AdminDatabaseException.queryFailed('study detail', error.message)
    }

    // 알 수 없는 에러
    AdminLogger.critical('Unknown error in study detail', {
      adminId,
      studyId,
      error: error.message,
      stack: error.stack
    })
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export const GET = withAdminErrorHandler(getStudyDetailHandler)

