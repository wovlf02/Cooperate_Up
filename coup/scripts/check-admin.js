const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@coup.com' },
      include: { adminRole: true }
    })
    
    if (user) {
      console.log('✅ 관리자 계정 발견:')
      console.log('  ID:', user.id)
      console.log('  이메일:', user.email)
      console.log('  이름:', user.name)
      console.log('  상태:', user.status)
      console.log('  비밀번호 해시:', user.password ? '설정됨' : '없음')
      console.log('  관리자 역할:', user.adminRole ? user.adminRole.role : '없음')
    } else {
      console.log('❌ 관리자 계정을 찾을 수 없습니다.')
    }
  } catch (error) {
    console.error('오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()

