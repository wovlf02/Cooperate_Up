// 가입 신청 데이터 조회 테스트
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // PENDING 상태의 가입 신청 조회
  const requests = await prisma.studyMember.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
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
            take: 5
          }
        }
      }
    },
    take: 2
  });

  console.log('=== 가입 신청 조회 결과 ===');
  console.log('총 신청 수:', requests.length);

  requests.forEach((req, i) => {
    console.log(`\n[${i + 1}] ${req.user.name} (${req.user.email})`);
    console.log('    bio:', req.user.bio || '(없음)');
    console.log('    참여 중인 스터디:');

    if (req.user.studyMembers && req.user.studyMembers.length > 0) {
      req.user.studyMembers.forEach((sm, j) => {
        console.log(`      ${j + 1}. ${sm.study.emoji} ${sm.study.name} (${sm.role})`);
      });
    } else {
      console.log('      (없음)');
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

