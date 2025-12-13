// prisma/seed.js
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Prisma 연결 확인을 위한 디버깅
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '설정됨' : '없음')

async function main() {
  console.log('🌱 Starting MASSIVE comprehensive seed...')

  // 기존 데이터 삭제 (개발용) - 순서 중요: 의존성 있는 테이블부터
  await prisma.notification.deleteMany()
  await prisma.studyTaskAssignee.deleteMany()
  await prisma.studyTask.deleteMany()
  await prisma.task.deleteMany()
  await prisma.event.deleteMany()
  await prisma.noticeFile.deleteMany()
  await prisma.file.deleteMany()
  await prisma.message.deleteMany()
  await prisma.notice.deleteMany()
  await prisma.studyMember.deleteMany()
  await prisma.groupInvite.deleteMany()
  await prisma.groupMember.deleteMany()
  await prisma.group.deleteMany()
  await prisma.study.deleteMany()
  await prisma.sanction.deleteMany()
  await prisma.warning.deleteMany()
  await prisma.report.deleteMany()
  await prisma.adminLog.deleteMany()
  await prisma.adminRole.deleteMany()
  await prisma.systemSetting.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleaned existing data')

  // 비밀번호 해시
  const hashedPassword = await bcrypt.hash('password123', 10)

  // ============================================
  // 사용자 생성 (50명으로 확장!)
  // ============================================
  const users = []
  
  const userNames = [
    { name: '김민준', email: 'kim@example.com', bio: '백엔드 개발자입니다. 알고리즘과 클린 코드에 관심이 많습니다.', seed: 'kim' },
    { name: '이서연', email: 'lee@example.com', bio: '프론트엔드 개발자입니다. React와 TypeScript를 좋아합니다.', seed: 'lee' },
    { name: '박준혁', email: 'park@example.com', bio: '풀스택 개발자 지망생입니다.', seed: 'park' },
    { name: '최지우', email: 'choi@example.com', bio: '취업 준비 중입니다. 함께 성장해요!', seed: 'choi' },
    { name: '정수아', email: 'jung@example.com', bio: '디자이너에서 개발자로 전향 중입니다.', seed: 'jung' },
    { name: '강태양', email: 'kang@example.com', bio: '데이터 분석가입니다.', seed: 'kang' },
    { name: '한유진', email: 'han@example.com', bio: 'AI/ML에 관심이 많습니다.', seed: 'han' },
    { name: '윤서준', email: 'yoon@example.com', bio: '게임 개발자 지망생입니다.', seed: 'yoon' },
    { name: '임하은', email: 'lim@example.com', bio: '모바일 앱 개발자입니다.', seed: 'lim' },
    { name: '장민호', email: 'jang@example.com', bio: 'DevOps 엔지니어를 꿈꿉니다.', seed: 'jang' },
    { name: '오세영', email: 'oh@example.com', bio: '블록체인 개발에 관심있습니다.', seed: 'oh' },
    { name: '신다은', email: 'shin@example.com', bio: 'UI/UX 디자이너입니다.', seed: 'shin' },
    { name: '조현우', email: 'jo@example.com', bio: '보안 전문가가 되고 싶습니다.', seed: 'jo' },
    { name: '배수빈', email: 'bae@example.com', bio: '클라우드 아키텍트 준비중', seed: 'bae' },
    { name: '송지민', email: 'song@example.com', bio: '데이터 사이언티스트입니다.', seed: 'song' },
    { name: '홍길동', email: 'hong@example.com', bio: '자바 백엔드 개발자', seed: 'hong' },
    { name: '권나영', email: 'kwon@example.com', bio: 'Vue.js 전문가', seed: 'kwon' },
    { name: '문재인', email: 'moon@example.com', bio: 'Angular 개발자', seed: 'moon' },
    { name: '안철수', email: 'ahn@example.com', bio: 'Spring Boot 마스터', seed: 'ahn' },
    { name: '김유신', email: 'kimy@example.com', bio: 'Node.js 백엔드', seed: 'kimy' },
    { name: '이순신', email: 'leey@example.com', bio: 'Go 언어 개발자', seed: 'leey' },
    { name: '세종대왕', email: 'sejong@example.com', bio: 'Python Django 전문', seed: 'sejong' },
    { name: '신사임당', email: 'shins@example.com', bio: 'iOS 개발자', seed: 'shins' },
    { name: '유관순', email: 'yu@example.com', bio: 'Android 개발자', seed: 'yu' },
    { name: '안중근', email: 'ahnjg@example.com', bio: 'Flutter 개발자', seed: 'ahnjg' },
    { name: '김구', email: 'kimk@example.com', bio: 'React Native 전문', seed: 'kimk' },
    { name: '윤봉길', email: 'yoonbg@example.com', bio: '머신러닝 엔지니어', seed: 'yoonbg' },
    { name: '이봉창', email: 'leebc@example.com', bio: '딥러닝 연구자', seed: 'leebc' },
    { name: '장보고', email: 'jangjb@example.com', bio: '빅데이터 분석가', seed: 'jangjb' },
    { name: '김홍도', email: 'kimhd@example.com', bio: '그래픽 프로그래머', seed: 'kimhd' },
    { name: '신윤복', email: 'shinyb@example.com', bio: '게임 개발자', seed: 'shinyb' },
    { name: '허난설헌', email: 'heo@example.com', bio: '웹 퍼블리셔', seed: 'heo' },
    { name: '황진이', email: 'hwang@example.com', bio: 'SEO 전문가', seed: 'hwang' },
    { name: '이황', email: 'leeh@example.com', bio: '소프트웨어 아키텍트', seed: 'leeh' },
    { name: '이이', email: 'leei@example.com', bio: '시스템 분석가', seed: 'leei' },
    { name: '정약용', email: 'jeong@example.com', bio: '프로젝트 매니저', seed: 'jeong' },
    { name: '박지원', email: 'parkjw@example.com', bio: '기술 블로거', seed: 'parkjw' },
    { name: '김정호', email: 'kimjh@example.com', bio: 'GIS 개발자', seed: 'kimjh' },
    { name: '전봉준', email: 'jeon@example.com', bio: '블록체인 개발자', seed: 'jeon' },
    { name: '김좌진', email: 'kimjj@example.com', bio: 'IoT 개발자', seed: 'kimjj' },
    { name: '안창호', email: 'ahnch@example.com', bio: '임베디드 개발자', seed: 'ahnch' },
    { name: '방정환', email: 'bang@example.com', bio: '교육용 앱 개발자', seed: 'bang' },
    { name: '유일한', email: 'yuil@example.com', bio: '핀테크 개발자', seed: 'yuil' },
    { name: '김대건', email: 'kimdg@example.com', bio: 'e커머스 개발자', seed: 'kimdg' },
    { name: '최제우', email: 'choijw@example.com', bio: '헬스케어 앱 개발', seed: 'choijw' },
    { name: '강감찬', email: 'kanggc@example.com', bio: '보안 개발자', seed: 'kanggc' },
    { name: '을지문덕', email: 'eulji@example.com', bio: '네트워크 엔지니어', seed: 'eulji' },
    { name: '연개소문', email: 'yeon@example.com', bio: '시스템 관리자', seed: 'yeon' },
    { name: '대조영', email: 'dae@example.com', bio: '클라우드 엔지니어', seed: 'dae' },
  ]

  // 시스템 관리자 생성
  const admin = await prisma.user.create({
    data: {
      email: 'admin@coup.com',
      password: hashedPassword,
      name: '시스템 관리자',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      bio: 'CoUp 시스템 관리자입니다.',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log('✅ Admin created:', admin.email)

  // 시스템 관리자에게 SUPER_ADMIN 권한 부여
  await prisma.adminRole.create({
    data: {
      userId: admin.id,
      role: 'SUPER_ADMIN',
      permissions: { all: true },
      grantedBy: admin.id,
    },
  })
  console.log('✅ AdminRole created: SUPER_ADMIN')

  for (const userData of userNames) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.seed}`,
        bio: userData.bio,
        role: 'USER',
        status: 'ACTIVE',
      },
    })
    users.push(user)
  }

  console.log(`✅ Users created: ${users.length} users`)

  // ============================================
  // 스터디 생성 (30개로 확장!)
  // ============================================
  const studies = []

  const studyData = [
    { name: '알고리즘 마스터 스터디', emoji: '💻', description: '매일 알고리즘 문제를 풀고 서로의 풀이를 공유하며 성장하는 스터디입니다.', category: '프로그래밍', subCategory: '알고리즘/코테', maxMembers: 20, autoApprove: false, rating: 4.8, reviewCount: 25, tags: ['알고리즘', '코딩테스트', '매일', '백준'] },
    { name: '취업 준비 스터디', emoji: '💼', description: '함께 이력서와 면접을 준비하는 스터디입니다.', category: '취업', subCategory: '면접준비', maxMembers: 15, autoApprove: true, rating: 4.5, reviewCount: 18, tags: ['취업', '면접', '자소서'] },
    { name: 'React 심화 스터디', emoji: '⚛️', description: 'React 고급 패턴과 최신 기술을 학습합니다.', category: '프로그래밍', subCategory: '프론트엔드', maxMembers: 12, autoApprove: false, rating: 4.9, reviewCount: 30, tags: ['React', 'Next.js', 'TypeScript'] },
    { name: '토익 900점 달성', emoji: '📚', description: '3개월 안에 토익 900점을 목표로 합니다.', category: '어학', subCategory: '영어', maxMembers: 20, autoApprove: true, rating: 4.6, reviewCount: 22, tags: ['토익', '영어', '매일학습'] },
    { name: 'CS 기초 다지기', emoji: '🖥️', description: '컴퓨터 공학 기초를 탄탄하게!', category: '프로그래밍', subCategory: 'CS', maxMembers: 15, autoApprove: false, rating: 4.7, reviewCount: 20, tags: ['CS', '운영체제', '네트워크'] },
    { name: '독서 모임 - 개발자의 글쓰기', emoji: '📖', description: '개발 관련 책을 읽고 토론하는 모임입니다.', category: '독서', subCategory: '개발서적', maxMembers: 10, autoApprove: true, rating: 4.4, reviewCount: 15, tags: ['독서', '개발서적'] },
    { name: '머신러닝 스터디', emoji: '🤖', description: '머신러닝 기초부터 실전 프로젝트까지!', category: '프로그래밍', subCategory: 'AI/ML', maxMembers: 12, autoApprove: false, rating: 4.8, reviewCount: 28, tags: ['머신러닝', 'AI', 'Python'] },
    { name: '아침 운동 모임', emoji: '🏃', description: '아침 6시, 함께 운동해요!', category: '취미', subCategory: '운동', maxMembers: 8, autoApprove: true, rating: 4.3, reviewCount: 12, tags: ['운동', '아침'] },
    { name: 'Vue.js 마스터하기', emoji: '🟢', description: 'Vue 3 완전 정복 스터디', category: '프로그래밍', subCategory: '프론트엔드', maxMembers: 15, autoApprove: false, rating: 4.6, reviewCount: 19, tags: ['Vue', 'Vuex', 'Nuxt'] },
    { name: 'Spring Boot 실전', emoji: '🍃', description: 'Spring Boot로 실무 프로젝트', category: '프로그래밍', subCategory: '백엔드', maxMembers: 18, autoApprove: true, rating: 4.7, reviewCount: 24, tags: ['Spring', 'Java', 'JPA'] },
    { name: 'AWS 자격증 준비', emoji: '☁️', description: 'AWS Solutions Architect 취득', category: '자격증', subCategory: '클라우드', maxMembers: 12, autoApprove: false, rating: 4.5, reviewCount: 16, tags: ['AWS', '자격증', '클라우드'] },
    { name: '파이썬 데이터 분석', emoji: '🐍', description: 'Pandas, NumPy 완전정복', category: '프로그래밍', subCategory: '데이터분석', maxMembers: 16, autoApprove: true, rating: 4.6, reviewCount: 21, tags: ['Python', 'Pandas', '데이터분석'] },
    { name: '디자인 패턴 스터디', emoji: '🎨', description: 'GoF 디자인 패턴 학습', category: '프로그래밍', subCategory: '디자인패턴', maxMembers: 10, autoApprove: false, rating: 4.8, reviewCount: 17, tags: ['디자인패턴', '객체지향', 'GoF'] },
    { name: 'SQL 튜닝 마스터', emoji: '🗄️', description: '데이터베이스 성능 최적화', category: '프로그래밍', subCategory: '데이터베이스', maxMembers: 12, autoApprove: true, rating: 4.7, reviewCount: 19, tags: ['SQL', 'MySQL', '튜닝'] },
    { name: 'iOS 앱 개발', emoji: '📱', description: 'Swift로 앱 만들기', category: '프로그래밍', subCategory: '모바일', maxMembers: 14, autoApprove: false, rating: 4.5, reviewCount: 14, tags: ['iOS', 'Swift', 'SwiftUI'] },
    { name: 'Android Kotlin', emoji: '🤖', description: 'Kotlin으로 안드로이드 개발', category: '프로그래밍', subCategory: '모바일', maxMembers: 14, autoApprove: true, rating: 4.6, reviewCount: 18, tags: ['Android', 'Kotlin', 'Jetpack'] },
    { name: 'Docker & Kubernetes', emoji: '🐳', description: '컨테이너 오케스트레이션 학습', category: '프로그래밍', subCategory: 'DevOps', maxMembers: 15, autoApprove: false, rating: 4.8, reviewCount: 22, tags: ['Docker', 'Kubernetes', 'DevOps'] },
    { name: '블록체인 개발', emoji: '⛓️', description: 'Solidity와 스마트 컨트랙트', category: '프로그래밍', subCategory: '블록체인', maxMembers: 10, autoApprove: true, rating: 4.4, reviewCount: 13, tags: ['블록체인', 'Solidity', 'Web3'] },
    { name: 'Unity 게임 개발', emoji: '🎮', description: 'Unity로 3D 게임 만들기', category: '프로그래밍', subCategory: '게임개발', maxMembers: 12, autoApprove: false, rating: 4.7, reviewCount: 20, tags: ['Unity', 'C#', '게임'] },
    { name: 'GraphQL 실전', emoji: '🔺', description: 'GraphQL API 구축', category: '프로그래밍', subCategory: '백엔드', maxMembers: 10, autoApprove: true, rating: 4.5, reviewCount: 11, tags: ['GraphQL', 'Apollo', 'API'] },
    { name: '정보처리기사 준비', emoji: '📝', description: '정보처리기사 자격증 취득', category: '자격증', subCategory: 'IT', maxMembers: 25, autoApprove: true, rating: 4.4, reviewCount: 35, tags: ['정보처리기사', '자격증', '필기'] },
    { name: 'TOEIC Speaking', emoji: '🗣️', description: '토익 스피킹 Level 7 목표', category: '어학', subCategory: '영어', maxMembers: 15, autoApprove: false, rating: 4.6, reviewCount: 16, tags: ['토익스피킹', '영어회화'] },
    { name: 'JLPT N2 합격', emoji: '🇯🇵', description: '일본어능력시험 N2 대비', category: '어학', subCategory: '일본어', maxMembers: 18, autoApprove: true, rating: 4.5, reviewCount: 19, tags: ['JLPT', '일본어', 'N2'] },
    { name: '중국어 HSK 6급', emoji: '🇨🇳', description: 'HSK 6급 합격반', category: '어학', subCategory: '중국어', maxMembers: 12, autoApprove: false, rating: 4.3, reviewCount: 10, tags: ['HSK', '중국어', '6급'] },
    { name: '사진 촬영 모임', emoji: '📷', description: '주말 출사 모임', category: '취미', subCategory: '사진', maxMembers: 10, autoApprove: true, rating: 4.7, reviewCount: 14, tags: ['사진', '촬영', '출사'] },
    { name: '기타 연주 동호회', emoji: '🎸', description: '어쿠스틱 기타 연습', category: '취미', subCategory: '음악', maxMembers: 8, autoApprove: false, rating: 4.6, reviewCount: 12, tags: ['기타', '음악', '연주'] },
    { name: '등산 모임', emoji: '⛰️', description: '주말 산행 모임', category: '취미', subCategory: '야외활동', maxMembers: 15, autoApprove: true, rating: 4.5, reviewCount: 18, tags: ['등산', '산행', '아웃도어'] },
    { name: '요리 클래스', emoji: '👨‍🍳', description: '집밥 요리 배우기', category: '취미', subCategory: '요리', maxMembers: 12, autoApprove: false, rating: 4.8, reviewCount: 20, tags: ['요리', '집밥', '레시피'] },
    { name: '주식 투자 공부', emoji: '📈', description: '가치투자 학습 모임', category: '재테크', subCategory: '주식', maxMembers: 20, autoApprove: true, rating: 4.4, reviewCount: 22, tags: ['주식', '투자', '재테크'] },
    { name: '부동산 스터디', emoji: '🏠', description: '부동산 투자 기초', category: '재테크', subCategory: '부동산', maxMembers: 15, autoApprove: false, rating: 4.3, reviewCount: 13, tags: ['부동산', '투자', '경매'] },
  ]

  for (let i = 0; i < studyData.length; i++) {
    const data = studyData[i]
    const ownerIndex = i % users.length

    const study = await prisma.study.create({
      data: {
        ownerId: users[ownerIndex].id,
        name: data.name,
        emoji: data.emoji,
        description: data.description,
        category: data.category,
        subCategory: data.subCategory,
        maxMembers: data.maxMembers,
        isPublic: true,
        autoApprove: data.autoApprove,
        isRecruiting: i < 25, // 처음 25개만 모집중
        rating: data.rating,
        reviewCount: data.reviewCount,
        tags: data.tags,
      },
    })
    studies.push(study)
  }

  console.log(`✅ Studies created: ${studies.length} studies`)

  // ============================================
  // 스터디 멤버 생성 (200명 이상!)
  // ============================================
  const memberData = []

  // 각 스터디에 5-15명씩 랜덤 배정
  for (let i = 0; i < studies.length; i++) {
    const study = studies[i]
    const memberCount = Math.floor(Math.random() * 11) + 5 // 5-15명
    const ownerIndex = i % users.length

    // OWNER 추가
    memberData.push({
      studyId: study.id,
      userId: users[ownerIndex].id,
      role: 'OWNER',
      status: 'ACTIVE',
      introduction: '스터디장입니다!',
      level: '상급',
      joinedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    })

    // 멤버 추가
    const usedUserIds = new Set([users[ownerIndex].id])
    for (let j = 1; j < memberCount; j++) {
      let userIndex
      do {
        userIndex = Math.floor(Math.random() * users.length)
      } while (usedUserIds.has(users[userIndex].id))

      usedUserIds.add(users[userIndex].id)

      const isPending = Math.random() < 0.1 // 10% 확률로 대기중

      memberData.push({
        studyId: study.id,
        userId: users[userIndex].id,
        role: 'MEMBER',
        status: isPending ? 'PENDING' : 'ACTIVE',
        introduction: isPending ? '가입 신청합니다!' : '열심히 하겠습니다!',
        level: ['초급', '중급', '상급'][Math.floor(Math.random() * 3)],
        joinedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        approvedAt: isPending ? null : new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      })
    }
  }

  for (const data of memberData) {
    await prisma.studyMember.create({ data })
  }

  console.log(`✅ Study members created: ${memberData.length} memberships`)

  // ============================================
  // 공지사항 생성 (60개)
  // ============================================
  const noticeTitles = [
    '스터디 규칙 안내',
    '이번 주 학습 내용',
    '모의 면접 일정',
    '과제 제출 안내',
    '다음 주 일정 변경',
    '중간 점검 공지',
    '온라인 모임 링크',
    '스터디 자료 공유',
  ]

  let noticeCount = 0
  for (let i = 0; i < studies.length; i++) {
    const study = studies[i]
    const noticeNum = Math.floor(Math.random() * 3) + 1 // 1-3개

    for (let j = 0; j < noticeNum; j++) {
      await prisma.notice.create({
        data: {
          studyId: study.id,
          authorId: study.ownerId,
          title: noticeTitles[Math.floor(Math.random() * noticeTitles.length)],
          content: `공지사항 내용입니다. 잘 확인해주세요!\n\n중요한 내용이니 꼭 읽어주시기 바랍니다.`,
          isPinned: j === 0 && Math.random() < 0.3,
          isImportant: Math.random() < 0.3,
          views: Math.floor(Math.random() * 50),
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      })
      noticeCount++
    }
  }

  console.log(`✅ Notices created: ${noticeCount} notices`)

  // ============================================
  // 할일 생성 (300개)
  // ============================================
  const taskTitles = [
    '알고리즘 문제 풀이',
    '프로젝트 진행',
    '자료 조사',
    '발표 준비',
    '코드 리뷰',
    '문서 작성',
    '테스트 코드 작성',
    '배포 준비',
  ]

  const tasks = []
  for (let i = 0; i < 300; i++) {
    const userIndex = i % users.length
    const hasStudy = Math.random() < 0.7
    const studyIndex = Math.floor(Math.random() * studies.length)

    const daysOffset = Math.floor(Math.random() * 60) - 30 // -30 ~ +30일
    const dueDate = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000)
    const isCompleted = daysOffset < 0 && Math.random() < 0.6

    tasks.push({
      studyId: hasStudy ? studies[studyIndex].id : null,
      userId: users[userIndex].id,
      title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
      description: '할일 상세 내용입니다.',
      status: isCompleted ? 'DONE' : ['TODO', 'IN_PROGRESS', 'REVIEW'][Math.floor(Math.random() * 3)],
      priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'][Math.floor(Math.random() * 4)],
      dueDate,
      completed: isCompleted,
      completedAt: isCompleted ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
      createdAt: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000),
    })
  }

  for (const task of tasks) {
    await prisma.task.create({ data: task })
  }

  console.log(`✅ Tasks created: ${tasks.length} tasks`)

  // ============================================
  // 캘린더 일정 생성 (100개)
  // ============================================
  const eventTitles = [
    '주간 스터디 모임',
    '프로젝트 발표',
    '코드 리뷰',
    '모의 면접',
    '팀 미팅',
    '온라인 세미나',
  ]

  const events = []
  for (let i = 0; i < 100; i++) {
    const studyIndex = i % studies.length
    const study = studies[studyIndex]

    const daysOffset = Math.floor(Math.random() * 90) - 30 // -30 ~ +60일
    const eventDate = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000)

    events.push({
      studyId: study.id,
      createdById: study.ownerId,
      title: eventTitles[Math.floor(Math.random() * eventTitles.length)],
      date: eventDate,
      startTime: ['09:00', '10:00', '14:00', '19:00', '20:00'][Math.floor(Math.random() * 5)],
      endTime: ['11:00', '12:00', '16:00', '21:00', '22:00'][Math.floor(Math.random() * 5)],
      location: ['Zoom', 'Google Meet', 'Discord', '스터디룸'][Math.floor(Math.random() * 4)],
      color: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)],
    })
  }

  for (const event of events) {
    await prisma.event.create({ data: event })
  }

  console.log(`✅ Events created: ${events.length} events`)

  // ============================================
  // 알림 생성 (500개)
  // ============================================
  const notificationTypes = ['JOIN_APPROVED', 'NOTICE', 'FILE', 'EVENT', 'TASK', 'MEMBER', 'KICK', 'CHAT']
  const notifications = []

  for (let i = 0; i < 500; i++) {
    const userIndex = i % users.length
    const studyIndex = Math.floor(Math.random() * studies.length)
    const study = studies[studyIndex]

    const hoursAgo = Math.floor(Math.random() * 720) // 0-30일 전
    const isRead = hoursAgo > 24 && Math.random() < 0.7

    notifications.push({
      userId: users[userIndex].id,
      type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
      studyId: study.id,
      studyName: study.name,
      studyEmoji: study.emoji,
      message: `${study.name}에서 새로운 활동이 있습니다`,
      isRead,
      createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
    })
  }

  for (const notification of notifications) {
    await prisma.notification.create({ data: notification })
  }

  console.log(`✅ Notifications created: ${notifications.length} notifications`)

  // ============================================
  // 채팅 메시지 생성 (1000개)
  // ============================================
  const messageTemplates = [
    '안녕하세요!',
    '좋은 의견이네요',
    '저도 동의합니다',
    '질문이 있습니다',
    '감사합니다!',
    '화이팅!',
    '다음 주 모임 참석 가능하신가요?',
    '자료 공유드립니다',
  ]

  const messages = []
  for (let i = 0; i < 1000; i++) {
    const studyIndex = Math.floor(Math.random() * studies.length)
    const study = studies[studyIndex]

    // 해당 스터디의 멤버 중 랜덤 선택
    const studyMembers = memberData.filter(m => m.studyId === study.id && m.status === 'ACTIVE')
    if (studyMembers.length === 0) continue

    const member = studyMembers[Math.floor(Math.random() * studyMembers.length)]
    const hoursAgo = Math.floor(Math.random() * 720)

    messages.push({
      studyId: study.id,
      userId: member.userId,
      content: messageTemplates[Math.floor(Math.random() * messageTemplates.length)],
      readers: Math.random() < 0.5 ? [member.userId] : studyMembers.slice(0, Math.floor(Math.random() * 3) + 1).map(m => m.userId),
      createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
    })
  }

  for (const message of messages) {
    await prisma.message.create({ data: message })
  }

  console.log(`✅ Messages created: ${messages.length} messages`)

  // ============================================
  // 신고 생성 (50개)
  // ============================================
  const reportTypes = ['SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'COPYRIGHT']
  const reportStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

  const reports = []
  for (let i = 0; i < 50; i++) {
    const reporterIndex = Math.floor(Math.random() * users.length)
    const targetType = ['USER', 'STUDY', 'MESSAGE'][Math.floor(Math.random() * 3)]

    let targetId
    if (targetType === 'USER') {
      targetId = users[Math.floor(Math.random() * users.length)].id
    } else if (targetType === 'STUDY') {
      targetId = studies[Math.floor(Math.random() * studies.length)].id
    } else {
      targetId = 'msg_' + Math.random().toString(36).substr(2, 9)
    }

    const status = reportStatuses[Math.floor(Math.random() * reportStatuses.length)]
    const daysAgo = Math.floor(Math.random() * 60)

    reports.push({
      reporterId: users[reporterIndex].id,
      targetType,
      targetId,
      type: reportTypes[Math.floor(Math.random() * reportTypes.length)],
      reason: '부적절한 콘텐츠가 포함되어 있습니다.',
      status,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      processedBy: status !== 'PENDING' ? admin.id : null,
      processedAt: status !== 'PENDING' ? new Date(Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000) : null,
      resolution: status === 'RESOLVED' ? '처리 완료되었습니다.' : null,
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    })
  }

  for (const report of reports) {
    await prisma.report.create({ data: report })
  }

  console.log(`✅ Reports created: ${reports.length} reports`)

  console.log('\n🎉 MASSIVE seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`  - Users: ${users.length} regular users`)
  console.log(`  - Studies: ${studies.length} (다양한 카테고리)`)
  console.log(`  - Study Members: ${memberData.length}`)
  console.log(`  - Notices: ${noticeCount}`)
  console.log(`  - Tasks: ${tasks.length}`)
  console.log(`  - Events: ${events.length}`)
  console.log(`  - Notifications: ${notifications.length}`)
  console.log(`  - Messages: ${messages.length}`)
  console.log(`  - Reports: ${reports.length}`)
  console.log('\n✅ You can now login with:')
  console.log('  Email: kim@example.com')
  console.log('  Password: password123')
  console.log('\n  Or any other user:')
  console.log('  Email: lee@example.com, park@example.com, etc.')
  console.log('  Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
