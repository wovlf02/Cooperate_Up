/**
 * base64 이미지 데이터를 파일로 저장하고 URL로 변환하는 스크립트
 * 실행: node scripts/convert-avatar-base64.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 base64 avatar 데이터 검색 중...')

  // base64 데이터가 있는 사용자 조회
  const users = await prisma.user.findMany({
    where: {
      avatar: {
        startsWith: 'data:'
      }
    },
    select: {
      id: true,
      email: true,
      avatar: true,
    }
  })

  console.log(`📊 base64 avatar를 가진 사용자: ${users.length}명`)

  if (users.length === 0) {
    console.log('✅ 변환할 데이터가 없습니다.')
    return
  }

  // uploads 디렉토리 확인
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'avatars')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
    console.log(`📁 디렉토리 생성: ${uploadsDir}`)
  }

  for (const user of users) {
    try {
      // base64 데이터 파싱
      const matches = user.avatar.match(/^data:image\/(\w+);base64,(.+)$/)
      if (!matches) {
        console.log(`  ⚠️ ${user.email}: 유효하지 않은 base64 형식, avatar 제거`)
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: null }
        })
        continue
      }

      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]
      const base64Data = matches[2]
      const filename = `${user.id}.${ext}`
      const filePath = path.join(uploadsDir, filename)

      // 파일로 저장
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'))

      // DB 업데이트
      const avatarUrl = `/uploads/avatars/${filename}`
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: avatarUrl }
      })

      console.log(`  ✅ ${user.email}: ${avatarUrl}`)
    } catch (error) {
      console.log(`  ❌ ${user.email}: ${error.message}`)
      // 오류 발생 시 avatar 제거
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: null }
      })
    }
  }

  console.log('\n✅ 변환 완료!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

