// src/app/api/studies/[id]/invite/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

/**
 * POST /api/studies/{id}/invite
 * 스터디 초대 코드 생성 (ADMIN+ 권한 필요)
 */
export async function POST(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    const body = await request.json()
    const { expiresIn, maxUses } = body // 만료 시간 (시간 단위), 최대 사용 횟수

    // 1. 만료 기간 검증 (1-720시간 = 1시간-30일)
    let expiresInHours = expiresIn || 168; // 기본값 7일
    if (expiresInHours < 1 || expiresInHours > 720) {
      return NextResponse.json(
        { error: "만료 기간은 1시간에서 720시간(30일) 사이여야 합니다" },
        { status: 400 }
      );
    }

    // 2. 최대 사용 횟수 검증 (1-100)
    let maxUsesCount = maxUses || 10; // 기본값 10회
    if (maxUsesCount < 1 || maxUsesCount > 100) {
      return NextResponse.json(
        { error: "최대 사용 횟수는 1회에서 100회 사이여야 합니다" },
        { status: 400 }
      );
    }

    // 3. 스터디 조회 및 정원 확인
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: {
        id: true,
        name: true,
        inviteCode: true,
        maxMembers: true,
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
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 4. 정원 여유 확인
    const currentMembers = study._count.members;
    const availableSlots = study.maxMembers - currentMembers;

    if (availableSlots <= 0) {
      return NextResponse.json(
        { error: "스터디 정원이 마감되어 초대 코드를 생성할 수 없습니다" },
        { status: 400 }
      );
    }

    // 5. 최대 사용 횟수가 정원 여유보다 많으면 조정
    if (maxUsesCount > availableSlots) {
      maxUsesCount = availableSlots;
    }

    // 6. 새로운 초대 코드 생성 (8자리, 충돌 방지)
    let newInviteCode;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      newInviteCode = nanoid(8);
      const existing = await prisma.study.findFirst({
        where: { inviteCode: newInviteCode }
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: "초대 코드 생성에 실패했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    // 7. 만료 시간 계산
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // 8. 초대 코드 업데이트
    const updatedStudy = await prisma.study.update({
      where: { id: studyId },
      data: {
        inviteCode: newInviteCode,
        inviteCodeExpiresAt: expiresAt,
        inviteCodeMaxUses: maxUsesCount,
        inviteCodeUsedCount: 0, // 사용 횟수 초기화
      },
      select: {
        id: true,
        name: true,
        inviteCode: true,
        inviteCodeExpiresAt: true,
        inviteCodeMaxUses: true,
        inviteCodeUsedCount: true,
      }
    })

    // 9. 초대 링크 생성
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/studies/${studyId}/join?code=${newInviteCode}`;

    return NextResponse.json({
      success: true,
      message: "초대 코드가 생성되었습니다",
      data: {
        studyId: updatedStudy.id,
        studyName: updatedStudy.name,
        inviteCode: updatedStudy.inviteCode,
        inviteUrl: inviteUrl,
        expiresAt: updatedStudy.inviteCodeExpiresAt,
        maxUses: updatedStudy.inviteCodeMaxUses,
        usedCount: updatedStudy.inviteCodeUsedCount,
        availableSlots: availableSlots,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create invite code error:', error)
    return NextResponse.json(
      { error: "초대 코드 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/studies/{id}/invite
 * 현재 초대 코드 조회 (ADMIN+ 권한 필요)
 */
export async function GET(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) return result

  try {
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: {
        id: true,
        name: true,
        inviteCode: true,
        inviteCodeExpiresAt: true,
        inviteCodeMaxUses: true,
        inviteCodeUsedCount: true,
      }
    })

    if (!study) {
      return NextResponse.json(
        { error: "스터디를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 초대 코드가 없는 경우
    if (!study.inviteCode) {
      return NextResponse.json({
        success: true,
        message: "활성화된 초대 코드가 없습니다",
        data: null
      });
    }

    // 초대 코드 상태 확인
    const now = new Date();
    const isExpired = study.inviteCodeExpiresAt && study.inviteCodeExpiresAt < now;
    const isExhausted = study.inviteCodeUsedCount >= study.inviteCodeMaxUses;
    const isActive = !isExpired && !isExhausted;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/studies/${studyId}/join?code=${study.inviteCode}`;

    return NextResponse.json({
      success: true,
      data: {
        studyId: study.id,
        studyName: study.name,
        inviteCode: study.inviteCode,
        inviteUrl: inviteUrl,
        expiresAt: study.inviteCodeExpiresAt,
        maxUses: study.inviteCodeMaxUses,
        usedCount: study.inviteCodeUsedCount,
        isActive: isActive,
        status: isExpired ? 'expired' : isExhausted ? 'exhausted' : 'active',
      }
    })

  } catch (error) {
    console.error('Get invite code error:', error)
    return NextResponse.json(
      { error: "초대 코드 조회 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

