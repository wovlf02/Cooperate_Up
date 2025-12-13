/**
 * 데이터베이스 정리 자동 실행 스크립트
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanDatabase() {
  console.log('🧹 데이터베이스 정리 시작...\n')

  try {
    // 1. 사용자 역할 변경
    console.log('1. 사용자 역할 변경 중...')
    const userUpdate = await prisma.$executeRaw`
      UPDATE "User" SET role = 'USER' WHERE role IN ('ADMIN', 'SYSTEM_ADMIN')
    `
    console.log(`   ✓ ${userUpdate}명의 사용자 역할 변경 완료`)

    // 2. 스터디 멤버 역할 변경
    console.log('2. 스터디 멤버 역할 변경 중...')
    const memberUpdate = await prisma.$executeRaw`
      UPDATE "StudyMember" SET role = 'MEMBER' WHERE role = 'ADMIN'
    `
    console.log(`   ✓ ${memberUpdate}명의 멤버 역할 변경 완료`)

    // 3. Setting 테이블 삭제
    console.log('3. Setting 테이블 삭제 중...')
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Setting" CASCADE`
    console.log('   ✓ Setting 테이블 삭제 완료')

    // 4. 기존 관리자 테이블 삭제
    console.log('4. 기존 관리자 테이블 삭제 중...')
    await prisma.$executeRaw`DROP TABLE IF EXISTS "AdminLog" CASCADE`
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Sanction" CASCADE`
    await prisma.$executeRaw`DROP TABLE IF EXISTS "SystemSetting" CASCADE`
    console.log('   ✓ 기존 관리자 테이블 삭제 완료')

    console.log('\n✅ 데이터베이스 정리 완료!')
    console.log('\n다음 명령을 실행하세요:')
    console.log('npx prisma db push')

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase()

