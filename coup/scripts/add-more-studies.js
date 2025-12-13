// scripts/add-more-studies.js
// 스터디 20개를 데이터베이스에 추가하는 스크립트

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🚀 스터디 데이터 추가 시작...\n')

  // 사용자 목록 가져오기
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    take: 20
  })

  if (users.length < 10) {
    console.error('❌ 충분한 사용자가 없습니다. 먼저 seed를 실행하세요.')
    console.error('   실행: npx prisma db seed')
    return
  }

  console.log(`✅ ${users.length}명의 사용자 발견\n`)

  const studyData = [
    {
      name: 'TypeScript 마스터클래스',
      emoji: '📘',
      description: 'TypeScript의 고급 타입 시스템부터 실전 프로젝트까지 완벽 마스터! 제네릭, 유틸리티 타입, 데코레이터 등을 심도있게 학습합니다.',
      category: '프로그래밍',
      subCategory: '프론트엔드',
      maxMembers: 15,
      tags: ['TypeScript', '타입시스템', '고급']
    },
    {
      name: 'Rust 시스템 프로그래밍',
      emoji: '🦀',
      description: 'Rust로 안전하고 빠른 시스템 프로그래밍을 배웁니다. 소유권, 빌림, 생명주기를 완벽하게 이해하고 실전 프로젝트를 진행합니다.',
      category: '프로그래밍',
      subCategory: '시스템',
      maxMembers: 12,
      tags: ['Rust', '시스템프로그래밍', '성능']
    },
    {
      name: 'MongoDB 실전 가이드',
      emoji: '🍃',
      description: 'NoSQL 데이터베이스 MongoDB를 실무 수준으로 마스터합니다. 인덱싱, 집계, 샤딩까지 모든 것을 다룹니다.',
      category: '프로그래밍',
      subCategory: '데이터베이스',
      maxMembers: 18,
      tags: ['MongoDB', 'NoSQL', '데이터베이스']
    },
    {
      name: 'Redis 캐싱 전략',
      emoji: '⚡',
      description: 'Redis를 활용한 고성능 캐싱 전략과 실시간 데이터 처리를 학습합니다. Pub/Sub, Streams까지 완벽 정복!',
      category: '프로그래밍',
      subCategory: '백엔드',
      maxMembers: 14,
      tags: ['Redis', '캐싱', '성능최적화']
    },
    {
      name: 'Next.js 13 App Router 완전정복',
      emoji: '▲',
      description: 'Next.js 13의 App Router와 Server Components를 활용한 최신 웹 개발을 배웁니다. RSC, Streaming까지!',
      category: '프로그래밍',
      subCategory: '프론트엔드',
      maxMembers: 16,
      tags: ['Next.js', 'React', 'SSR']
    },
    {
      name: 'gRPC 마이크로서비스 아키텍처',
      emoji: '🔌',
      description: 'gRPC를 활용한 고성능 마이크로서비스 구축. Protocol Buffers, 스트리밍, 인증/인가까지 학습합니다.',
      category: '프로그래밍',
      subCategory: '백엔드',
      maxMembers: 12,
      tags: ['gRPC', '마이크로서비스', 'ProtoBuf']
    },
    {
      name: 'Terraform 인프라 자동화',
      emoji: '🏗️',
      description: 'IaC의 정석 Terraform으로 클라우드 인프라를 코드로 관리합니다. AWS, GCP, Azure 멀티 클라우드 지원!',
      category: '프로그래밍',
      subCategory: 'DevOps',
      maxMembers: 15,
      tags: ['Terraform', 'IaC', 'DevOps']
    },
    {
      name: 'WebAssembly 고성능 웹 개발',
      emoji: '⚙️',
      description: 'WebAssembly로 브라우저에서 네이티브 수준의 성능을 구현합니다. Rust/C++에서 WASM으로!',
      category: '프로그래밍',
      subCategory: '웹개발',
      maxMembers: 10,
      tags: ['WebAssembly', 'WASM', '고성능']
    },
    {
      name: 'GitHub Actions로 완성하는 CI/CD',
      emoji: '🔄',
      description: 'GitHub Actions를 활용한 자동화 파이프라인 구축. 테스트, 빌드, 배포를 자동화합니다.',
      category: '프로그래밍',
      subCategory: 'DevOps',
      maxMembers: 18,
      tags: ['GitHub Actions', 'CI/CD', '자동화']
    },
    {
      name: 'Svelte & SvelteKit 실전',
      emoji: '🔥',
      description: '가장 간결한 프론트엔드 프레임워크 Svelte와 SvelteKit으로 빠르고 효율적인 웹 앱을 만듭니다.',
      category: '프로그래밍',
      subCategory: '프론트엔드',
      maxMembers: 14,
      tags: ['Svelte', 'SvelteKit', '프론트엔드']
    },
    {
      name: 'Elasticsearch 검색 엔진 구축',
      emoji: '🔍',
      description: 'Elasticsearch로 강력한 검색 기능을 구현합니다. 인덱싱, 쿼리 최적화, 집계 분석까지!',
      category: '프로그래밍',
      subCategory: '검색엔진',
      maxMembers: 16,
      tags: ['Elasticsearch', '검색', '빅데이터']
    },
    {
      name: 'FastAPI 모던 백엔드 개발',
      emoji: '⚡',
      description: 'Python FastAPI로 빠르고 현대적인 REST API를 개발합니다. 비동기, 타입힌트, 자동 문서화!',
      category: '프로그래밍',
      subCategory: '백엔드',
      maxMembers: 15,
      tags: ['FastAPI', 'Python', 'REST API']
    },
    {
      name: 'Three.js로 만드는 3D 웹',
      emoji: '🎨',
      description: 'Three.js를 활용한 3D 웹 그래픽스 개발. WebGL, 셰이더, 인터랙티브 경험을 만듭니다.',
      category: '프로그래밍',
      subCategory: '웹그래픽',
      maxMembers: 12,
      tags: ['Three.js', '3D', 'WebGL']
    },
    {
      name: 'NestJS 엔터프라이즈 애플리케이션',
      emoji: '🐈',
      description: 'NestJS로 확장 가능한 엔터프라이즈급 백엔드를 구축합니다. DI, 모듈 시스템, 마이크로서비스까지!',
      category: '프로그래밍',
      subCategory: '백엔드',
      maxMembers: 16,
      tags: ['NestJS', 'Node.js', 'TypeScript']
    },
    {
      name: 'PostgreSQL 고급 튜닝 & 최적화',
      emoji: '🐘',
      description: 'PostgreSQL의 고급 기능과 성능 튜닝을 마스터합니다. 쿼리 최적화, 파티셔닝, 복제까지!',
      category: '프로그래밍',
      subCategory: '데이터베이스',
      maxMembers: 14,
      tags: ['PostgreSQL', 'SQL', '튜닝']
    },
    {
      name: 'Figma to Code - 디자인 구현',
      emoji: '🎨',
      description: 'Figma 디자인을 실제 코드로 완벽하게 구현하는 방법을 배웁니다. 디자인 시스템, 컴포넌트화까지!',
      category: '프로그래밍',
      subCategory: '프론트엔드',
      maxMembers: 15,
      tags: ['Figma', 'UI구현', '디자인']
    },
    {
      name: 'RabbitMQ 메시지 큐 시스템',
      emoji: '🐰',
      description: 'RabbitMQ로 안정적인 메시지 큐 시스템을 구축합니다. 비동기 처리, 이벤트 드리븐 아키텍처!',
      category: '프로그래밍',
      subCategory: '백엔드',
      maxMembers: 12,
      tags: ['RabbitMQ', '메시지큐', '비동기']
    },
    {
      name: 'Tailwind CSS 완전정복',
      emoji: '💨',
      description: 'Tailwind CSS로 빠르고 일관된 UI를 구축합니다. 커스터마이징, 반응형, 다크모드까지!',
      category: '프로그래밍',
      subCategory: '프론트엔드',
      maxMembers: 18,
      tags: ['Tailwind', 'CSS', 'UI']
    },
    {
      name: 'Playwright로 완성하는 E2E 테스트',
      emoji: '🎭',
      description: 'Playwright를 활용한 안정적인 E2E 테스트 작성. 크로스 브라우저, 시각적 테스트까지!',
      category: '프로그래밍',
      subCategory: '테스트',
      maxMembers: 14,
      tags: ['Playwright', 'E2E', '테스트']
    },
    {
      name: 'Go 동시성 프로그래밍 마스터',
      emoji: '🐹',
      description: 'Go의 고루틴과 채널을 활용한 동시성 프로그래밍을 마스터합니다. 고성능 서버 개발의 핵심!',
      category: '프로그래밍',
      subCategory: '백엔드',
      maxMembers: 16,
      tags: ['Go', 'Golang', '동시성']
    }
  ]

  console.log(`📚 ${studyData.length}개의 스터디를 추가합니다...\n`)

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < studyData.length; i++) {
    const data = studyData[i]
    const owner = users[i % users.length]

    try {
      const study = await prisma.study.create({
        data: {
          ownerId: owner.id,
          name: data.name,
          emoji: data.emoji,
          description: data.description,
          category: data.category,
          subCategory: data.subCategory,
          maxMembers: data.maxMembers,
          isPublic: true,
          autoApprove: i % 2 === 0, // 50% 자동 승인
          isRecruiting: true,
          rating: 4.5 + Math.random() * 0.4, // 4.5-4.9
          reviewCount: Math.floor(Math.random() * 20) + 10, // 10-30
          tags: data.tags
        }
      })

      console.log(`✅ [${i + 1}/${studyData.length}] ${study.name} (소유자: ${owner.name})`)
      successCount++
    } catch (error) {
      console.error(`❌ [${i + 1}/${studyData.length}] ${data.name} 실패:`, error.message)
      failCount++
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ 성공: ${successCount}개`)
  console.log(`❌ 실패: ${failCount}개`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  // 총 스터디 수 확인
  const totalStudies = await prisma.study.count()
  console.log(`📊 현재 총 스터디 수: ${totalStudies}개\n`)

  // 카테고리별 통계
  const categoryStats = await prisma.study.groupBy({
    by: ['category'],
    _count: { category: true }
  })

  console.log('📈 카테고리별 통계:')
  categoryStats.forEach(stat => {
    console.log(`   ${stat.category}: ${stat._count.category}개`)
  })
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

