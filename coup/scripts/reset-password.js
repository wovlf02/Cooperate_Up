// scripts/reset-password.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetPassword(email, newPassword) {
  try {
    console.log('🔐 비밀번호 재설정 시작...')
    console.log(`📧 이메일: ${email}`)

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        provider: true,
      }
    })

    if (!user) {
      console.error('❌ 사용자를 찾을 수 없습니다:', email)
      process.exit(1)
    }

    console.log('✅ 사용자 발견:', {
      id: user.id,
      name: user.name,
      status: user.status,
      provider: user.provider,
    })

    // 소셜 로그인 계정 확인
    if (user.provider !== 'CREDENTIALS') {
      console.warn(`⚠️  이 계정은 ${user.provider} 계정입니다.`)
      console.log('비밀번호를 설정하면 이메일/비밀번호로도 로그인할 수 있습니다.')
    }

    // 계정 상태 확인
    if (user.status !== 'ACTIVE') {
      console.error(`❌ 계정 상태가 ${user.status}입니다. 활성 계정만 비밀번호를 재설정할 수 있습니다.`)
      process.exit(1)
    }

    // 비밀번호 검증
    if (!newPassword || newPassword.length < 8) {
      console.error('❌ 비밀번호는 8자 이상이어야 합니다.')
      process.exit(1)
    }

    // 비밀번호 해싱
    console.log('🔒 비밀번호 해싱 중...')
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    console.log('✅ 비밀번호 재설정 완료!')
    console.log('')
    console.log('이제 다음 정보로 로그인할 수 있습니다:')
    console.log(`  이메일: ${email}`)
    console.log(`  비밀번호: ${newPassword}`)
    console.log('')

  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 커맨드 라인 인자 처리
const args = process.argv.slice(2)

if (args.length < 2) {
  console.log('사용법: node scripts/reset-password.js <이메일> <새비밀번호>')
  console.log('')
  console.log('예시:')
  console.log('  node scripts/reset-password.js user@example.com newpassword123')
  console.log('')
  process.exit(1)
}

const [email, newPassword] = args

resetPassword(email, newPassword)

