# 게이미피케이션 시스템 데이터베이스 모델

## 개요

포인트, 레벨, 뱃지, 랭킹 시스템에 필요한 Prisma 모델 정의입니다.

---

## Prisma Schema

### UserGameProfile (게임 프로필)

```prisma
model UserGameProfile {
  id     String @id @default(cuid())
  userId String @unique
  
  // 경험치 & 레벨
  totalXp    Int @default(0)
  level      Int @default(1)
  currentXp  Int @default(0)  // 현재 레벨 내 XP
  
  // 포인트
  points      Int @default(0)
  totalPoints Int @default(0)  // 누적 획득
  
  // 스트릭
  currentStreak Int       @default(0)
  longestStreak Int       @default(0)
  lastActiveAt  DateTime?
  
  // 통계
  totalStudyTime   Int @default(0)  // 분 단위
  quizzesTaken     Int @default(0)
  quizzesPerfect   Int @default(0)
  notesCreated     Int @default(0)
  messagesCount    Int @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user   User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  badges UserBadge[]
}
```

### Badge (뱃지)

```prisma
model Badge {
  id          String      @id @default(cuid())
  code        String      @unique  // "FIRST_STUDY", "STREAK_7" 등
  name        String
  description String
  iconUrl     String
  rarity      BadgeRarity
  category    String      // "학습", "협업", "꾸준함", "특별"
  
  // 자동 획득 조건
  condition   Json?       // 자동 체크용 조건 (예: { "type": "streak", "value": 7 })
  isHidden    Boolean     @default(false)  // 히든 뱃지
  
  createdAt DateTime @default(now())
  
  users UserBadge[]
  
  @@index([category])
  @@index([rarity])
}

enum BadgeRarity {
  COMMON     // 일반
  RARE       // 레어
  EPIC       // 에픽
  LEGENDARY  // 전설
}
```

### UserBadge (사용자 뱃지)

```prisma
model UserBadge {
  id       String @id @default(cuid())
  userId   String
  badgeId  String
  
  earnedAt  DateTime @default(now())
  displayed Boolean  @default(false)  // 프로필에 표시
  
  userProfile UserGameProfile @relation(fields: [userId], references: [userId], onDelete: Cascade)
  badge       Badge           @relation(fields: [badgeId], references: [id])
  
  @@unique([userId, badgeId])
  @@index([userId])
  @@index([badgeId])
}
```

### XpTransaction (XP 이력)

```prisma
model XpTransaction {
  id     String @id @default(cuid())
  userId String
  
  amount   Int
  reason   String      // "출석체크", "퀴즈 완료" 등
  category String      // "attendance", "quiz", "study" 등
  metadata Json?       // 추가 정보 (예: { "quizId": "...", "score": 100 })
  
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, createdAt])
  @@index([category])
  @@index([createdAt])
}
```

### Challenge (챌린지)

```prisma
model Challenge {
  id          String          @id @default(cuid())
  title       String
  description String          @db.Text
  type        ChallengeType
  
  // 목표
  goal        Json            // { "type": "studyTime", "value": 600, "unit": "minutes" }
  reward      Json            // { "xp": 500, "points": 100, "badgeId": "..." }
  
  // 기간
  startDate   DateTime
  endDate     DateTime
  
  // 상태
  status      ChallengeStatus @default(UPCOMING)
  
  // 제한
  maxParticipants Int?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  participants ChallengeParticipant[]
  
  @@index([status, startDate])
  @@index([type])
}

enum ChallengeType {
  PERSONAL  // 개인 챌린지
  STUDY     // 스터디 챌린지
  GLOBAL    // 전체 챌린지
}

enum ChallengeStatus {
  UPCOMING  // 시작 전
  ACTIVE    // 진행 중
  ENDED     // 종료
}
```

### ChallengeParticipant (챌린지 참가자)

```prisma
model ChallengeParticipant {
  id          String @id @default(cuid())
  challengeId String
  userId      String
  studyId     String?  // 스터디 챌린지인 경우
  
  progress    Float    @default(0)  // 진행도 (0~100)
  completed   Boolean  @default(false)
  completedAt DateTime?
  
  // 보상 수령
  rewardClaimed Boolean @default(false)
  
  joinedAt DateTime @default(now())
  
  challenge Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([challengeId, userId])
  @@index([userId])
}
```

### Leaderboard (리더보드 캐시)

```prisma
model Leaderboard {
  id       String          @id @default(cuid())
  type     LeaderboardType
  period   String          // "2024-12", "2024-W50", "all"
  studyId  String?         // 스터디 내 랭킹
  
  rankings Json            // [{ userId, rank, score, change }]
  
  calculatedAt DateTime @default(now())
  expiresAt    DateTime  // 캐시 만료 시간
  
  @@unique([type, period, studyId])
  @@index([type, period])
}

enum LeaderboardType {
  XP           // 경험치
  STUDY_TIME   // 공부 시간
  QUIZ_SCORE   // 퀴즈 점수
  STREAK       // 스트릭
  POINTS       // 포인트
}
```

---

## User 모델 확장

```prisma
model User {
  // ...기존 필드...
  
  // 게이미피케이션
  gameProfile      UserGameProfile?
  xpTransactions   XpTransaction[]
  challengeParticipations ChallengeParticipant[]
}
```

---

## XP 계산 설정

### Level XP Requirements

```javascript
// lib/gamification/levels.js
export const LEVEL_XP_REQUIREMENTS = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  700,    // Level 4
  1400,   // Level 5
  2400,   // Level 6
  3900,   // Level 7
  5900,   // Level 8
  8900,   // Level 9
  13900,  // Level 10
]

export const LEVEL_TITLES = [
  '새싹',        // Level 1
  '학습자',      // Level 2
  '탐험가',      // Level 3
  '도전자',      // Level 4
  '학자',        // Level 5
  '연구원',      // Level 6
  '전문가',      // Level 7
  '마스터',      // Level 8
  '그랜드마스터', // Level 9
  '레전드',      // Level 10
]

export function calculateLevel(totalXp) {
  for (let i = LEVEL_XP_REQUIREMENTS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_XP_REQUIREMENTS[i]) {
      return i + 1
    }
  }
  return 1
}
```

### XP Rewards Config

```javascript
// lib/gamification/xp-config.js
export const XP_REWARDS = {
  attendance: {
    daily: 10,
    bonus_streak_7: 5,
    bonus_streak_30: 10,
  },
  study: {
    per_30_minutes: 15,
    per_hour: 35,
    focus_bonus: 5,  // 집중도 80% 이상
  },
  quiz: {
    completion: 20,
    perfect_score: 30,  // 만점 보너스
    per_correct: 2,
  },
  note: {
    create: 15,
    collaborate: 20,
  },
  chat: {
    per_message: 1,
    daily_limit: 50,
  }
}
```

---

## 뱃지 시드 데이터

```javascript
// prisma/seed-badges.js
const badges = [
  {
    code: 'FIRST_STUDY',
    name: '첫 발자국',
    description: '첫 공부 세션을 완료했습니다',
    iconUrl: '/badges/first-study.svg',
    rarity: 'COMMON',
    category: '학습',
    condition: { type: 'study_session', count: 1 }
  },
  {
    code: 'STUDY_100H',
    name: '공부의 달인',
    description: '누적 100시간 공부를 달성했습니다',
    iconUrl: '/badges/study-100h.svg',
    rarity: 'RARE',
    category: '학습',
    condition: { type: 'study_time', minutes: 6000 }
  },
  {
    code: 'STREAK_7',
    name: '일주일 스트릭',
    description: '7일 연속 활동했습니다',
    iconUrl: '/badges/streak-7.svg',
    rarity: 'COMMON',
    category: '꾸준함',
    condition: { type: 'streak', days: 7 }
  },
  {
    code: 'STREAK_30',
    name: '한 달 스트릭',
    description: '30일 연속 활동했습니다',
    iconUrl: '/badges/streak-30.svg',
    rarity: 'RARE',
    category: '꾸준함',
    condition: { type: 'streak', days: 30 }
  },
  {
    code: 'QUIZ_PERFECT_10',
    name: '만점왕',
    description: '퀴즈 10회 만점을 달성했습니다',
    iconUrl: '/badges/quiz-perfect.svg',
    rarity: 'RARE',
    category: '학습',
    condition: { type: 'quiz_perfect', count: 10 }
  },
  {
    code: 'COLLABORATOR',
    name: '협업의 시작',
    description: '첫 협업 노트에 참여했습니다',
    iconUrl: '/badges/collaborator.svg',
    rarity: 'COMMON',
    category: '협업',
    condition: { type: 'note_collaborate', count: 1 }
  },
  {
    code: 'STUDY_1000H',
    name: '천 시간의 법칙',
    description: '누적 1000시간 공부를 달성했습니다',
    iconUrl: '/badges/study-1000h.svg',
    rarity: 'LEGENDARY',
    category: '학습',
    condition: { type: 'study_time', minutes: 60000 }
  }
]
```

