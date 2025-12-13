// 캘린더 일정 생성 테스트
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const studyId = 'cmircxj67001guyxc6d9kwpyu'

  console.log('=== 스터디 확인 ===')
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    select: { id: true, name: true, ownerId: true }
  })

  if (!study) {
    console.log('스터디를 찾을 수 없습니다:', studyId)
    return
  }
  console.log('스터디:', study.name)

  console.log('\n=== Owner 정보 ===')
  const owner = await prisma.user.findUnique({
    where: { id: study.ownerId },
    select: { id: true, email: true, name: true }
  })
  console.log('Owner:', owner)

  console.log('\n=== 테스트 일정 생성 ===')
  try {
    const event = await prisma.event.create({
      data: {
        studyId,
        createdById: owner.id,
        title: '테스트 일정',
        date: new Date('2025-01-15'),
        startTime: '10:00',
        endTime: '11:00',
        location: '온라인',
        color: '#6366F1'
      }
    })
    console.log('일정 생성 성공:', event)

    // 테스트 일정 삭제
    await prisma.event.delete({ where: { id: event.id } })
    console.log('테스트 일정 삭제 완료')
  } catch (error) {
    console.log('일정 생성 실패:', error.message)
    console.log('에러 상세:', error)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())

