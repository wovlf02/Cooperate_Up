// scripts/activate-users.js
// 모든 사용자를 ACTIVE 상태로 변경하는 스크립트

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function activateAllUsers() {
  try {
    console.log('🔧 Activating all users...\n')

    // 비활성 사용자 조회
    const inactiveUsers = await prisma.user.findMany({
      where: {
        status: {
          not: 'ACTIVE'
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      }
    })

    if (inactiveUsers.length === 0) {
      console.log('✅ All users are already ACTIVE!')
      return
    }

    console.log(`📊 Found ${inactiveUsers.length} inactive users:`)
    inactiveUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'} (${user.email}) - Current: ${user.status}`)
    })
    console.log('')

    // 모든 사용자 활성화
    const result = await prisma.user.updateMany({
      where: {
        status: {
          not: 'ACTIVE'
        }
      },
      data: {
        status: 'ACTIVE',
        suspendedUntil: null,
        suspendReason: null,
      }
    })

    console.log(`✅ Successfully activated ${result.count} users!`)
    console.log('')

    // 최종 상태 확인
    const allUsers = await prisma.user.findMany({
      select: {
        status: true
      }
    })

    const activeCount = allUsers.filter(u => u.status === 'ACTIVE').length
    console.log(`📈 Final Status:`)
    console.log(`   Total users: ${allUsers.length}`)
    console.log(`   Active users: ${activeCount}`)
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

activateAllUsers()

