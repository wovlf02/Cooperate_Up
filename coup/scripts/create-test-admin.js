/**
 * 관리자 테스트 계정 생성 스크립트
 *
 * 실행 방법:
 * node scripts/create-test-admin.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestAdmin() {
  console.log('🔧 테스트 관리자 계정 생성 시작...\n')

  try {
    // 1. 테스트 사용자 생성 (또는 기존 사용자 사용)
    const email = 'admin@coup.com'
    const password = 'Admin123!'
    const hashedPassword = await bcrypt.hash(password, 10)

    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: '테스트 관리자',
          role: 'USER',
          status: 'ACTIVE',
          provider: 'CREDENTIALS',
        },
      })
      console.log(`✅ 사용자 생성: ${user.email}`)
    } else {
      console.log(`ℹ️  기존 사용자 사용: ${user.email}`)
    }

    // 2. 관리자 역할 부여
    const adminRole = await prisma.adminRole.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        role: 'SUPER_ADMIN',
        permissions: {
          all: true,
        },
        grantedBy: user.id, // 자기 자신
      },
      update: {
        role: 'SUPER_ADMIN',
        permissions: {
          all: true,
        },
      },
    })

    console.log(`✅ 관리자 역할 부여: ${adminRole.role}`)

    console.log('\n✅ 완료!')
    console.log('\n로그인 정보:')
    console.log(`  이메일: ${email}`)
    console.log(`  비밀번호: ${password}`)
    console.log(`  역할: ${adminRole.role}`)
    console.log('\n관리자 페이지: http://localhost:3000/admin')
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestAdmin()

