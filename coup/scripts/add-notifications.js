// kim@example.com 유저에게 알림 30개 추가
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 kim@example.com 유저 찾는 중...')

  // 1. kim@example.com 유저 찾기
  const user = await prisma.user.findUnique({
    where: { email: 'kim@example.com' }
  })

  if (!user) {
    console.error('❌ kim@example.com 유저를 찾을 수 없습니다.')
    return
  }

  console.log(`✅ 유저 발견: ${user.name} (${user.id})`)

  // 2. 유저가 속한 스터디 목록 조회
  const memberships = await prisma.studyMember.findMany({
    where: {
      userId: user.id,
      status: 'ACTIVE'
    },
    include: {
      study: {
        select: {
          id: true,
          name: true,
          emoji: true
        }
      }
    }
  })

  if (memberships.length === 0) {
    console.error('❌ 유저가 속한 스터디가 없습니다.')
    return
  }

  console.log(`📚 ${memberships.length}개 스터디에 소속됨:`)
  memberships.forEach(m => {
    console.log(`   - ${m.study.emoji || '📖'} ${m.study.name}`)
  })

  // 3. 알림 타입 및 메시지 템플릿
  const notificationTemplates = [
    { type: 'NOTICE', getMessage: (study) => `새 공지사항이 등록되었습니다: ${study.name}` },
    { type: 'NOTICE', getMessage: (study) => `중요 공지: 다음 주 모임 안내` },
    { type: 'EVENT', getMessage: (study) => `새 일정이 추가되었습니다: 정기 모임` },
    { type: 'EVENT', getMessage: (study) => `일정이 수정되었습니다: 스터디 시간 변경` },
    { type: 'EVENT', getMessage: (study) => `내일 일정이 있습니다: ${study.name} 모임` },
    { type: 'TASK', getMessage: (study) => `새 할일이 배정되었습니다: 과제 제출` },
    { type: 'TASK', getMessage: (study) => `할일 마감일이 다가옵니다` },
    { type: 'TASK', getMessage: (study) => `할일이 완료되었습니다` },
    { type: 'FILE', getMessage: (study) => `새 파일이 업로드되었습니다: 강의자료.pdf` },
    { type: 'FILE', getMessage: (study) => `파일이 공유되었습니다: 참고문서.docx` },
    { type: 'CHAT', getMessage: (study) => `새 메시지가 있습니다` },
    { type: 'CHAT', getMessage: (study) => `${study.name}에서 언급되었습니다` },
    { type: 'MEMBER', getMessage: (study) => `새 멤버가 가입했습니다` },
    { type: 'MEMBER', getMessage: (study) => `멤버의 역할이 변경되었습니다` },
    { type: 'JOIN_APPROVED', getMessage: (study) => `가입 신청이 승인되었습니다` },
  ]

  // 4. 30개 알림 생성
  const notifications = []

  for (let i = 0; i < 30; i++) {
    // 랜덤으로 스터디 선택
    const membership = memberships[i % memberships.length]
    const study = membership.study

    // 랜덤으로 템플릿 선택
    const template = notificationTemplates[i % notificationTemplates.length]

    // 시간을 다양하게 (최근 7일 내)
    const createdAt = new Date()
    createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 168)) // 최대 7일 전

    notifications.push({
      userId: user.id,
      type: template.type,
      studyId: study.id,
      studyName: study.name,
      studyEmoji: study.emoji,
      message: template.getMessage(study),
      isRead: i >= 10, // 처음 10개만 읽지 않음
      createdAt
    })
  }

  console.log(`\n📬 ${notifications.length}개 알림 생성 중...`)

  // 5. 알림 일괄 생성
  const result = await prisma.notification.createMany({
    data: notifications
  })

  console.log(`✅ ${result.count}개 알림이 추가되었습니다!`)
  console.log(`   - 읽지 않은 알림: 10개`)
  console.log(`   - 읽은 알림: 20개`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

