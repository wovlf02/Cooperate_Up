// scripts/check-user-status.js
// 사용자 상태 확인 및 수정 스크립트

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUserStatus() {
  try {
    console.log('🔍 Checking user statuses...\n')

    // 모든 사용자 조회
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Total users: ${users.length}\n`)

    // 상태별 분류
    const activeUsers = users.filter(u => u.status === 'ACTIVE')
    const suspendedUsers = users.filter(u => u.status === 'SUSPENDED')
    const deletedUsers = users.filter(u => u.status === 'DELETED')

    console.log('📈 User Status Summary:')
    console.log(`  ✅ ACTIVE: ${activeUsers.length}`)
    console.log(`  ⏸️  SUSPENDED: ${suspendedUsers.length}`)
    console.log(`  ❌ DELETED: ${deletedUsers.length}`)
    console.log('')

    // 각 사용자 상세 정보
    console.log('👥 User Details:')
    console.log('─'.repeat(100))

    users.forEach((user, index) => {
      const statusIcon = user.status === 'ACTIVE' ? '✅' :
                        user.status === 'SUSPENDED' ? '⏸️' : '❌'
      console.log(`${index + 1}. ${statusIcon} ${user.name || 'No name'} (${user.email})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Status: ${user.status}`)
      console.log(`   Created: ${user.createdAt.toISOString()}`)
      console.log(`   Last Login: ${user.lastLoginAt ? user.lastLoginAt.toISOString() : 'Never'}`)
      console.log('')
    })

    // 비활성 사용자 활성화 옵션
    const inactiveUsers = users.filter(u => u.status !== 'ACTIVE')

    if (inactiveUsers.length > 0) {
      console.log('⚠️  Found inactive users!')
      console.log('   To activate all users, run:')
      console.log('   node scripts/activate-users.js')
      console.log('')
    } else {
      console.log('✅ All users are ACTIVE!')
      console.log('')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserStatus()

