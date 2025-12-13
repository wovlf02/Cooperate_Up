const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    const email = 'admin@coup.com'
    const password = 'Admin123!'

    console.log('🔐 로그인 테스트 시작...')
    console.log('이메일:', email)
    console.log('비밀번호:', password)
    console.log('')

    // 1. 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email },
      include: { adminRole: true }
    })

    if (!user) {
      console.log('❌ 사용자를 찾을 수 없습니다.')
      return
    }

    console.log('✅ 사용자 발견:', user.email)
    console.log('   상태:', user.status)
    console.log('   비밀번호 해시 존재:', !!user.password)
    console.log('')

    // 2. 비밀번호 확인
    if (!user.password) {
      console.log('❌ 비밀번호가 설정되지 않았습니다.')
      return
    }

    const isValid = await bcrypt.compare(password, user.password)
    console.log('🔑 비밀번호 검증:', isValid ? '✅ 성공' : '❌ 실패')
    console.log('')

    // 3. 상태 확인
    if (user.status === 'DELETED') {
      console.log('❌ 삭제된 계정입니다.')
      return
    }

    if (user.status === 'SUSPENDED') {
      console.log('❌ 정지된 계정입니다.')
      return
    }

    console.log('✅ 계정 상태 정상')
    console.log('')

    // 4. 관리자 권한 확인
    if (user.adminRole) {
      console.log('✅ 관리자 권한:', user.adminRole.role)
    } else {
      console.log('⚠️ 관리자 권한 없음')
    }

    console.log('')
    console.log('========================================')
    if (isValid && user.status === 'ACTIVE') {
      console.log('✅ 로그인 성공!')
      console.log('관리자 페이지에서 로그인을 시도해보세요:')
      console.log('http://localhost:3000/sign-in')
      console.log('')
      console.log('로그인 정보:')
      console.log('이메일: admin@coup.com')
      console.log('비밀번호: Admin123!')
    } else {
      console.log('❌ 로그인 실패')
    }
    console.log('========================================')

  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()

