const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const studyId = 'cmircxj6f002kuyxcwd00i7o9'
  
  console.log('=== 스터디 정보 ===')
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    select: { id: true, name: true, ownerId: true }
  })
  console.log(study)
  
  console.log('\n=== 스터디 멤버 ===')
  const members = await prisma.studyMember.findMany({
    where: { studyId },
    include: { user: { select: { email: true, name: true } } }
  })
  
  members.forEach(m => {
    console.log(`- ${m.user.email} (${m.user.name}): ${m.role} [${m.status}]`)
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())

