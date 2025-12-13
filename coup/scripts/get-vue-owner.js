const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const study = await prisma.study.findFirst({
    where: { name: { contains: 'Vue' } },
    include: {
      owner: {
        select: { id: true, email: true, name: true, status: true }
      }
    }
  })

  if (study) {
    console.log('=== Vue.js 스터디 정보 ===')
    console.log('스터디명:', study.name)
    console.log('Owner ID:', study.owner.id)
    console.log('Owner Email:', study.owner.email)
    console.log('Owner Name:', study.owner.name)
    console.log('Owner Status:', study.owner.status)
    console.log('')
    console.log('로그인 정보:')
    console.log('  이메일:', study.owner.email)
    console.log('  비밀번호: password123 (기본 테스트 비밀번호)')
  } else {
    console.log('Vue 관련 스터디를 찾을 수 없습니다.')

    // 모든 스터디 목록 표시
    const studies = await prisma.study.findMany({
      take: 10,
      include: { owner: { select: { email: true, name: true } } }
    })
    console.log('\n모든 스터디 목록:')
    studies.forEach(s => {
      console.log(`  - ${s.name} (owner: ${s.owner.email})`)
    })
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())

