/**
 * 기존 관리자 시스템 데이터 정리 스크립트
 *
 * 실행 방법:
 * node scripts/clean-old-admin-data.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanOldAdminData() {
  console.log('🧹 기존 관리자 시스템 데이터 정리 시작...\n')

  try {
    // 1. Setting 테이블 확인
    console.log('1. Setting 테이블 확인 중...')
    const settingsCount = await prisma.$queryRaw`
      SELECT COUNT(*) FROM "Setting"
    `.catch(() => null)

    if (settingsCount) {
      console.log(`   - Setting 레코드 ${settingsCount[0].count}개 발견`)
      console.log('   - Setting 테이블 삭제 준비 중...')
    }

    // 2. 기존 enum 값 확인
    console.log('\n2. 기존 enum 값 사용 확인 중...')

    // UserRole enum 확인
    const adminUsers = await prisma.$queryRaw`
      SELECT COUNT(*) FROM "User" WHERE role IN ('ADMIN', 'SYSTEM_ADMIN')
    `.catch(() => [{ count: 0 }])
    console.log(`   - ADMIN/SYSTEM_ADMIN 역할 사용자: ${adminUsers[0].count}명`)

    // MemberRole enum 확인
    const adminMembers = await prisma.$queryRaw`
      SELECT COUNT(*) FROM "StudyMember" WHERE role = 'ADMIN'
    `.catch(() => [{ count: 0 }])
    console.log(`   - ADMIN 역할 스터디 멤버: ${adminMembers[0].count}명`)

    // 3. 데이터 정리 여부 확인
    console.log('\n⚠️  다음 작업이 수행됩니다:')
    console.log('   1. Setting 테이블 삭제')
    console.log('   2. ADMIN/SYSTEM_ADMIN 역할 사용자 → USER로 변경')
    console.log('   3. ADMIN 역할 스터디 멤버 → MEMBER로 변경')
    console.log('\n계속하려면 아래 명령을 실행하세요:')
    console.log('\n--- SQL 명령어 ---')
    console.log(`
-- 1. 사용자 역할 변경
UPDATE "User" SET role = 'USER' WHERE role IN ('ADMIN', 'SYSTEM_ADMIN');

-- 2. 스터디 멤버 역할 변경  
UPDATE "StudyMember" SET role = 'MEMBER' WHERE role = 'ADMIN';

-- 3. Setting 테이블 삭제
DROP TABLE IF EXISTS "Setting" CASCADE;

-- 4. 기존 Sanction, AdminLog, SystemSetting 테이블 삭제 (있다면)
DROP TABLE IF EXISTS "AdminLog" CASCADE;
DROP TABLE IF EXISTS "Sanction" CASCADE;
DROP TABLE IF EXISTS "SystemSetting" CASCADE;

-- 5. 이제 prisma migrate dev 또는 prisma db push 실행 가능
`)
    console.log('-------------------\n')

  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

cleanOldAdminData()

