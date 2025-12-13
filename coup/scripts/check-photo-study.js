// 사진 촬영 모임 스터디 멤버 수 확인 및 정원 수정
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 사진 촬영 모임 스터디 확인
  const study = await prisma.study.findFirst({
    where: { name: { contains: '사진' } },
    include: {
      members: {
        include: {
          user: { select: { name: true, email: true } }
        }
      },
      _count: {
        select: { members: { where: { status: 'ACTIVE' } } }
      }
    }
  });

  console.log('=== 사진 촬영 모임 스터디 현황 ===');
  console.log('스터디:', study.name);
  console.log('ID:', study.id);
  console.log('현재 정원:', study.maxMembers);
  console.log('실제 ACTIVE 멤버 수:', study._count.members);
  console.log('');
  console.log('전체 멤버 목록 (모든 상태):');
  study.members.forEach((m, i) => {
    console.log(`${i+1}. ${m.user.name || m.user.email} - ${m.role} - ${m.status}`);
  });

  // 정원을 실제 ACTIVE 멤버 수로 조절
  const actualMembers = study._count.members;
  if (study.maxMembers !== actualMembers) {
    console.log('');
    console.log(`=== 정원 수정: ${study.maxMembers}명 → ${actualMembers}명 ===`);

    await prisma.study.update({
      where: { id: study.id },
      data: { maxMembers: actualMembers }
    });

    console.log('✅ 정원 수정 완료!');
  } else {
    console.log('');
    console.log('정원이 이미 정확합니다.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

