// TOEIC Speaking 스터디 OWNER 정보 조회
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const member = await prisma.studyMember.findFirst({
    where: {
      study: { name: { contains: 'TOEIC Speaking' } },
      role: 'OWNER'
    },
    include: {
      user: { select: { name: true, email: true } },
      study: { select: { name: true } }
    }
  });

  console.log('=== TOEIC Speaking 스터디 OWNER 정보 ===');
  console.log('스터디:', member.study.name);
  console.log('OWNER:', member.user.name);
  console.log('이메일:', member.user.email);
  console.log('비밀번호: password123 (시드 데이터 기본값)');
}

main().catch(console.error).finally(() => prisma.$disconnect());

