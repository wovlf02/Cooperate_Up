// 스터디별 멤버 권한 확인 스크립트
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 세종대왕 유저 조회
  const user = await prisma.user.findFirst({
    where: { email: 'sejong@example.com' }
  });

  console.log('=== 세종대왕 계정 스터디 권한 확인 ===');
  console.log('유저 ID:', user.id);
  console.log('유저 이메일:', user.email);
  console.log('');

  // 세종대왕이 가입한 모든 스터디와 권한 조회
  const memberships = await prisma.studyMember.findMany({
    where: {
      userId: user.id,
      status: 'ACTIVE'
    },
    include: {
      study: { select: { id: true, name: true, emoji: true } }
    }
  });

  console.log('가입된 스터디 목록:');
  console.log('-'.repeat(60));
  memberships.forEach((m, i) => {
    console.log(`${i+1}. ${m.study.emoji} ${m.study.name}`);
    console.log(`   - 스터디 ID: ${m.study.id}`);
    console.log(`   - 멤버십 ID: ${m.id}`);
    console.log(`   - 역할: ${m.role}`);
    console.log('');
  });

  // TOEIC Speaking 스터디 상세 확인
  console.log('=== TOEIC Speaking 스터디 상세 ===');
  const toeicStudy = await prisma.study.findFirst({
    where: { name: { contains: 'TOEIC Speaking' } },
    include: {
      members: {
        where: { status: 'ACTIVE' },
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      }
    }
  });

  console.log('스터디 ID:', toeicStudy.id);
  console.log('');
  console.log('멤버별 권한:');
  toeicStudy.members.forEach((m, i) => {
    const isSejong = m.user.email === 'sejong@example.com';
    console.log(`${i+1}. ${m.user.name} (${m.user.email}) - ${m.role} ${isSejong ? '← 세종대왕' : ''}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

