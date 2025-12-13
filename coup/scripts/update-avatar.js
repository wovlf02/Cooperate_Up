// scripts/update-avatar.js
// 특정 사용자의 아바타를 업데이트하는 스크립트

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const userName = process.argv[2] || '이재필'
  const avatarPath = process.argv[3] || '/cat.png'

  console.log(`🔍 "${userName}" 사용자를 찾는 중...`)

  // 이름으로 사용자 찾기
  const user = await prisma.user.findFirst({
    where: {
      name: userName
    }
  })

  if (!user) {
    console.log(`❌ "${userName}" 사용자를 찾을 수 없습니다.`)
    console.log('\n📋 현재 등록된 사용자 목록:')

    const allUsers = await prisma.user.findMany({
      select: { name: true, email: true }
    })

    allUsers.forEach(u => {
      console.log(`  - ${u.name} (${u.email})`)
    })

    process.exit(1)
  }

  console.log(`✅ 사용자를 찾았습니다: ${user.name} (${user.email})`)
  console.log(`   현재 아바타: ${user.avatar}`)

  // 아바타 업데이트
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { avatar: avatarPath }
  })

  console.log(`✅ 아바타가 업데이트되었습니다!`)
  console.log(`   새 아바타: ${updated.avatar}`)
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

