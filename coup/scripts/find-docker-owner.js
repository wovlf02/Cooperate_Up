require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // kim@example.com 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: 'kim@example.com' }
    });

    if (!user) {
      console.log('kim@example.com 사용자를 찾을 수 없습니다.');
      return;
    }

    console.log('사용자 찾음:', user.id, user.name);

    // 사용자가 소속한 스터디 찾기
    const memberships = await prisma.studyMember.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      include: {
        study: true
      }
    });

    if (memberships.length === 0) {
      console.log('소속된 스터디가 없습니다.');
      return;
    }

    console.log('소속 스터디:', memberships.map(m => m.study.name).join(', '));

    // 알림 메시지 템플릿
    const notificationTemplates = [
      { type: 'NOTICE', message: '새로운 공지사항이 등록되었습니다.' },
      { type: 'NOTICE', message: '공지사항이 수정되었습니다.' },
      { type: 'TASK', message: '새로운 과제가 등록되었습니다: 주간 과제 제출' },
      { type: 'TASK', message: '과제 마감일이 다가옵니다.' },
      { type: 'TASK', message: '과제가 완료 처리되었습니다.' },
      { type: 'EVENT', message: '내일 오후 7시에 정기 모임이 있습니다.' },
      { type: 'EVENT', message: '이번 주 토요일 스터디 모임이 예정되어 있습니다.' },
      { type: 'EVENT', message: '일정이 변경되었습니다.' },
      { type: 'MEMBER', message: '새로운 멤버가 스터디에 참여했습니다.' },
      { type: 'MEMBER', message: '멤버가 스터디를 탈퇴했습니다.' },
      { type: 'FILE', message: '새로운 파일이 업로드되었습니다.' },
      { type: 'FILE', message: '학습 자료가 공유되었습니다.' },
      { type: 'CHAT', message: '새로운 채팅 메시지가 있습니다.' },
      { type: 'CHAT', message: '멘션되었습니다: @' + user.name },
      { type: 'JOIN_APPROVED', message: '스터디 가입이 승인되었습니다!' },
    ];

    // 30개 알림 데이터 생성
    const notificationsData = [];

    for (let i = 0; i < 30; i++) {
      // 랜덤 스터디 선택
      const membership = memberships[i % memberships.length];
      const study = membership.study;

      // 랜덤 템플릿 선택
      const template = notificationTemplates[i % notificationTemplates.length];

      // 시간을 조금씩 다르게 (최근 7일 내)
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - (i * 5)); // 5시간씩 차이

      notificationsData.push({
        userId: user.id,
        type: template.type,
        message: template.message,
        studyId: study.id,
        studyName: study.name,
        studyEmoji: study.emoji,
        isRead: i > 10, // 처음 10개는 읽지 않음
        createdAt: createdAt
      });
    }

    // 알림 생성
    const result = await prisma.notification.createMany({
      data: notificationsData
    });

    console.log('알림 생성 완료:', result.count, '개');
    console.log('- 읽지 않은 알림:', notificationsData.filter(n => !n.isRead).length, '개');
    console.log('- 읽은 알림:', notificationsData.filter(n => n.isRead).length, '개');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

