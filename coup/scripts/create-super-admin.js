// scripts/create-super-admin.js
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()

  try {
    console.log('=== SUPER_ADMIN 권한 부여 ===')

    // admin@coup.com 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email: 'admin@coup.com' },
      include: { adminRole: true }
    })

    if (!user) {
      console.log('❌ admin@coup.com 사용자를 찾을 수 없습니다.')
      return
    }

    console.log('✅ 사용자 발견:', user.id, user.email)

    if (user.adminRole) {
      console.log('✅ 이미 AdminRole이 있습니다:', user.adminRole.role)
      return
    }

    // AdminRole 생성
    const adminRole = await prisma.adminRole.create({
      data: {
        userId: user.id,
        role: 'SUPER_ADMIN',
        permissions: { all: true },
        grantedBy: user.id
      }
    })

    console.log('✅ AdminRole 생성 완료!')
    console.log('  역할:', adminRole.role)
    console.log('  권한:', JSON.stringify(adminRole.permissions))

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

