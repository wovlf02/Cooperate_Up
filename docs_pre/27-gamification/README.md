# 🎮 게이미피케이션 시스템

## 개요

포인트, 레벨, 뱃지, 랭킹 등 게임 요소를 도입하여
사용자의 학습 동기를 부여하고 지속적인 참여를 유도하는 시스템입니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 경험치(XP) | 활동에 따른 경험치 획득 |
| 레벨 시스템 | 경험치 기반 레벨업 |
| 뱃지 | 특정 업적 달성 시 뱃지 획득 |
| 포인트 | 활동 포인트 (보상 교환용) |
| 스트릭 | 연속 활동 일수 |
| 리더보드 | 다양한 기준 랭킹 |
| 챌린지 | 기간 한정 미션 |
| 보상 상점 | 포인트로 아이템 교환 |
| 시즌 | 시즌별 랭킹 리셋 |

---

## 경험치(XP) 획득 조건

### 일반 활동

| 활동 | XP | 일일 한도 |
|------|-----|----------|
| 출석 체크 | 10 | 1회 |
| 채팅 메시지 | 1 | 50 |
| 파일 업로드 | 5 | 10 |
| 공지사항 확인 | 2 | - |
| 일정 참여 | 10 | - |

### 학습 활동

| 활동 | XP | 조건 |
|------|-----|------|
| 공부 타이머 30분 | 15 | - |
| 공부 타이머 1시간 | 35 | - |
| 퀴즈 완료 | 20 | - |
| 퀴즈 만점 | +30 | 만점 시 보너스 |
| 오답 복습 | 10 | - |

### 협업 활동

| 활동 | XP | 조건 |
|------|-----|------|
| 노트 작성 | 15 | - |
| 노트 협업 | 20 | 다른 사람과 함께 |
| 댓글 작성 | 3 | - |
| 문제 풀이 공유 | 25 | - |

### 보너스

| 조건 | 보너스 |
|------|--------|
| 첫 활동 | +50% |
| 스트릭 7일 | +10% |
| 스트릭 30일 | +20% |
| 주말 활동 | +5% |

---

## 레벨 시스템

### 레벨 구간

| 레벨 | 필요 XP | 누적 XP | 칭호 |
|------|--------|---------|------|
| 1 | 0 | 0 | 새싹 |
| 2 | 100 | 100 | 학습자 |
| 3 | 200 | 300 | 탐험가 |
| 4 | 400 | 700 | 도전자 |
| 5 | 700 | 1,400 | 학자 |
| 6 | 1,000 | 2,400 | 연구원 |
| 7 | 1,500 | 3,900 | 전문가 |
| 8 | 2,000 | 5,900 | 마스터 |
| 9 | 3,000 | 8,900 | 그랜드마스터 |
| 10 | 5,000 | 13,900 | 레전드 |

### 레벨업 혜택

| 레벨 | 혜택 |
|------|------|
| 3 | 프로필 테두리 선택 가능 |
| 5 | 특별 이모지 사용 |
| 7 | 스터디 생성 시 추천 노출 증가 |
| 10 | 레전드 뱃지, 특별 프로필 효과 |

---

## 뱃지 시스템

### 뱃지 카테고리

#### 🎯 학습 뱃지

| 뱃지 | 조건 | 희귀도 |
|------|------|--------|
| 첫 발자국 | 첫 공부 세션 완료 | Common |
| 1시간의 집중 | 한 세션 1시간 달성 | Common |
| 공부의 달인 | 누적 100시간 공부 | Rare |
| 만점왕 | 퀴즈 10회 만점 | Rare |
| 학습 마라토너 | 하루 8시간 공부 | Epic |
| 천 시간의 법칙 | 누적 1000시간 공부 | Legendary |

#### 🤝 협업 뱃지

| 뱃지 | 조건 | 희귀도 |
|------|------|--------|
| 협업의 시작 | 첫 협업 노트 참여 | Common |
| 토론왕 | 댓글 100개 작성 | Rare |
| 문제 해결사 | 다른 사람 질문 50개 답변 | Epic |
| 스터디 리더 | 스터디장으로 3개월 활동 | Legendary |

#### 📆 꾸준함 뱃지

| 뱃지 | 조건 | 희귀도 |
|------|------|--------|
| 일주일 스트릭 | 7일 연속 활동 | Common |
| 한 달 스트릭 | 30일 연속 활동 | Rare |
| 100일 스트릭 | 100일 연속 활동 | Epic |
| 1년 스트릭 | 365일 연속 활동 | Legendary |

#### 🏆 특별 뱃지

| 뱃지 | 조건 | 희귀도 |
|------|------|--------|
| 초기 멤버 | 서비스 초기 가입 | Epic |
| 시즌 1 챔피언 | 시즌 1 랭킹 1위 | Legendary |
| 버그 헌터 | 유효한 버그 제보 | Epic |

---

## 데이터 모델

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
  
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
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
  condition   Json?       // 자동 체크용 조건
  
  createdAt DateTime @default(now())
  
  users UserBadge[]
}

enum BadgeRarity {
  COMMON
  RARE
  EPIC
  LEGENDARY
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
  metadata Json?       // 추가 정보
  
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, createdAt])
  @@index([category])
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
  goal        Json            // { "type": "studyTime", "value": 600 }
  reward      Json            // { "xp": 500, "points": 100, "badge": "..." }
  
  // 기간
  startDate   DateTime
  endDate     DateTime
  
  // 상태
  status      ChallengeStatus @default(ACTIVE)
  
  createdAt DateTime @default(now())
  
  participants ChallengeParticipant[]
}

enum ChallengeType {
  PERSONAL  // 개인 챌린지
  STUDY     // 스터디 챌린지
  GLOBAL    // 전체 챌린지
}

enum ChallengeStatus {
  UPCOMING
  ACTIVE
  ENDED
}
```

### ChallengeParticipant (챌린지 참가자)

```prisma
model ChallengeParticipant {
  id          String @id @default(cuid())
  challengeId String
  userId      String
  studyId     String?  // 스터디 챌린지인 경우
  
  progress   Int     @default(0)  // 진행도
  completed  Boolean @default(false)
  completedAt DateTime?
  
  joinedAt DateTime @default(now())
  
  challenge Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([challengeId, userId])
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
  
  updatedAt DateTime @updatedAt
  
  @@unique([type, period, studyId])
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

## API 엔드포인트

### 게임 프로필

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/gamification/profile` | 내 게임 프로필 |
| GET | `/api/gamification/profile/[userId]` | 특정 사용자 프로필 |
| GET | `/api/gamification/xp-history` | XP 획득 이력 |

### 뱃지

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/gamification/badges` | 전체 뱃지 목록 |
| GET | `/api/gamification/badges/mine` | 내 뱃지 |
| PATCH | `/api/gamification/badges/[id]/display` | 표시 설정 |

### 리더보드

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/gamification/leaderboard` | 전체 리더보드 |
| GET | `/api/gamification/leaderboard/study/[id]` | 스터디 리더보드 |
| GET | `/api/gamification/leaderboard/friends` | 친구 리더보드 |

### 챌린지

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/gamification/challenges` | 챌린지 목록 |
| POST | `/api/gamification/challenges/[id]/join` | 챌린지 참가 |
| GET | `/api/gamification/challenges/[id]/progress` | 진행 상황 |

---

## 컴포넌트 구조

```
src/components/gamification/
├── GameProfile.jsx        # 게임 프로필 카드
├── LevelProgress.jsx      # 레벨/XP 프로그레스
├── XpGainPopup.jsx        # XP 획득 팝업
├── BadgeGrid.jsx          # 뱃지 그리드
├── BadgeCard.jsx          # 뱃지 카드
├── BadgeUnlockModal.jsx   # 뱃지 획득 모달
├── StreakCounter.jsx      # 스트릭 카운터
├── Leaderboard.jsx        # 리더보드
├── LeaderboardItem.jsx    # 랭킹 아이템
├── ChallengeList.jsx      # 챌린지 목록
├── ChallengeCard.jsx      # 챌린지 카드
├── ChallengeProgress.jsx  # 챌린지 진행도
├── RewardShop.jsx         # 보상 상점
├── PointsDisplay.jsx      # 포인트 표시
└── index.js
```

---

## 페이지 구조

| 경로 | URL | 설명 |
|------|-----|------|
| `src/app/rewards/page.jsx` | `/rewards` | 게이미피케이션 메인 |
| `src/app/rewards/badges/page.jsx` | `/rewards/badges` | 뱃지 갤러리 |
| `src/app/rewards/leaderboard/page.jsx` | `/rewards/leaderboard` | 리더보드 |
| `src/app/rewards/challenges/page.jsx` | `/rewards/challenges` | 챌린지 |
| `src/app/rewards/shop/page.jsx` | `/rewards/shop` | 보상 상점 |

---

## UI/UX 설계

### XP 획득 애니메이션

```
┌───────────────────────────┐
│    ✨ +25 XP              │
│    퀴즈 완료!              │
│                           │
│  ████████████░░░░ 70%    │
│  레벨 5까지 230 XP        │
└───────────────────────────┘
```

### 뱃지 획득 모달

```
┌───────────────────────────────────┐
│         🎉 새 뱃지 획득!           │
│                                   │
│           [🏆 아이콘]              │
│                                   │
│         "일주일 스트릭"            │
│       7일 연속 활동 달성!          │
│                                   │
│        [프로필에 표시] [닫기]       │
└───────────────────────────────────┘
```

---

## 구현 우선순위

1. **Phase 1**: XP 시스템, 레벨
2. **Phase 2**: 기본 뱃지 (10개)
3. **Phase 3**: 리더보드
4. **Phase 4**: 스트릭
5. **Phase 5**: 챌린지
6. **Phase 6**: 보상 상점, 추가 뱃지

---

## 관련 문서

- [23-study-timer](../23-study-timer/README.md) - 공부 시간 연동
- [24-quiz-system](../24-quiz-system/README.md) - 퀴즈 점수 연동
- [21-friends](../21-friends/README.md) - 친구 랭킹

