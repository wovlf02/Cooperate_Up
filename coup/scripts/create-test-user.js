/**
 * 일반 사용자 테스트 계정 생성 스크립트
 *
 * 실행 방법:
 * node scripts/create-test-user.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  console.log('🔧 테스트 일반 사용자 계정 생성 시작...\n')

  try {
    // 테스트 사용자 정보
    const email = 'user@coup.com'
    const password = 'User123!'
    const hashedPassword = await bcrypt.hash(password, 10)

    // 기존 사용자 확인
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      console.log(`ℹ️  기존 사용자 존재: ${user.email}`)
      console.log(`   이미 일반 사용자 계정이 있습니다.\n`)
    } else {
      // 새 사용자 생성
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: '테스트 사용자',
          role: 'USER',
          status: 'ACTIVE',
          provider: 'CREDENTIALS',
        },
      })
      console.log(`✅ 사용자 생성: ${user.email}`)
    }

    // 관리자 역할이 있는지 확인 (있으면 제거)
    const adminRole = await prisma.adminRole.findUnique({
      where: { userId: user.id },
    })

    if (adminRole) {
      await prisma.adminRole.delete({
        where: { userId: user.id },
      })
      console.log('✅ 관리자 역할 제거 (일반 사용자로 설정)')
    } else {
      console.log('✅ 일반 사용자 확인 (관리자 역할 없음)')
    }

    console.log('\n✅ 완료!\n')
    console.log('로그인 정보:')
    console.log(`  이메일: ${email}`)
    console.log(`  비밀번호: ${password}`)
    console.log(`  역할: 일반 사용자 (USER)`)
    console.log('\n로그인 페이지: http://localhost:3000/sign-in')
    console.log('→ 로그인 후 자동으로 /dashboard로 이동합니다.')

  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()

