// 정원 초과 스터디 조회 및 조절 스크립트
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('=== 스터디 정원 현황 조회 ===\n');

  // 모든 스터디와 멤버 수 조회
  const studies = await prisma.study.findMany({
    include: {
      _count: {
        select: {
          members: {
            where: { status: 'ACTIVE' }
          }
        }
      }
    }
  });

  console.log('스터디별 정원 현황:');
  console.log('-'.repeat(80));

  const overCapacityStudies = [];

  for (const study of studies) {
    const memberCount = study._count.members;
    const maxMembers = study.maxMembers;
    const status = memberCount > maxMembers ? '⚠️ 초과' : '✅ 정상';

    console.log(`${study.emoji} ${study.name}`);
    console.log(`   ID: ${study.id}`);
    console.log(`   현재 멤버: ${memberCount}명 / 최대 정원: ${maxMembers}명 ${status}`);
    console.log('');

    if (memberCount > maxMembers) {
      overCapacityStudies.push({
        id: study.id,
        name: study.name,
        currentMembers: memberCount,
        maxMembers: maxMembers,
        overflow: memberCount - maxMembers
      });
    }
  }

  console.log('-'.repeat(80));
  console.log(`\n총 ${studies.length}개 스터디 중 ${overCapacityStudies.length}개가 정원 초과\n`);

  if (overCapacityStudies.length > 0) {
    console.log('=== 정원 초과 스터디 목록 ===');
    for (const study of overCapacityStudies) {
      console.log(`- ${study.name}: ${study.currentMembers}/${study.maxMembers}명 (${study.overflow}명 초과)`);
    }

    console.log('\n=== 정원 조절 시작 ===');

    for (const study of overCapacityStudies) {
      // 현재 멤버 수에 맞게 maxMembers 증가
      const newMaxMembers = study.currentMembers;

      await prisma.study.update({
        where: { id: study.id },
        data: { maxMembers: newMaxMembers }
      });

      console.log(`✅ "${study.name}" 정원 조절: ${study.maxMembers}명 → ${newMaxMembers}명`);
    }

    console.log('\n=== 정원 조절 완료 ===');
  } else {
    console.log('정원 초과 스터디가 없습니다.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

