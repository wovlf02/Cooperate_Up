# 📈 인덱스 및 최적화 전략

## 📋 개요

이 문서는 CoUp 데이터베이스의 인덱스 전략과 쿼리 최적화 방법을 설명합니다. 적절한 인덱스는 대규모 데이터에서 쿼리 성능을 크게 향상시킵니다.

---

## 📊 전체 인덱스 목록

### User 테이블

| 인덱스 | 필드 | 유형 | 용도 |
|--------|------|------|------|
| PK | `id` | Primary | 고유 식별자 |
| UK | `email` | Unique | 로그인, 이메일 중복 체크 |
| UK | `googleId` | Unique | Google OAuth |
| UK | `githubId` | Unique | GitHub OAuth |
| IDX | `email` | Index | 이메일 검색 |
| IDX | `status` | Index | 상태별 필터링 |
| IDX | `createdAt` | Index | 가입일 정렬 |
| IDX | `lastLoginAt` | Index | 최근 로그인 조회 |

### Study 테이블

| 인덱스 | 필드 | 유형 | 용도 |
|--------|------|------|------|
| PK | `id` | Primary | 고유 식별자 |
| UK | `inviteCode` | Unique | 초대 코드 조회 |
| IDX | `category` | Index | 카테고리 필터링 |
| IDX | `isPublic, isRecruiting` | Composite | 공개+모집 중 필터 |
| IDX | `ownerId` | Index | 소유자별 스터디 조회 |
| IDX | `rating` | Index | 평점 정렬 |

### StudyMember 테이블

| 인덱스 | 필드 | 유형 | 용도 |
|--------|------|------|------|
| PK | `id` | Primary | 고유 식별자 |
| UK | `studyId, userId` | Unique | 중복 가입 방지 |
| IDX | `userId` | Index | 사용자별 스터디 목록 |
| IDX | `status` | Index | 상태별 필터링 |
| IDX | `studyId, status` | Composite | 스터디별 상태 조회 |

### Message 테이블

| 인덱스 | 필드 | 유형 | 용도 |
|--------|------|------|------|
| PK | `id` | Primary | 고유 식별자 |
| IDX | `studyId, createdAt` | Composite | 스터디별 시간순 메시지 |

### Notification 테이블

| 인덱스 | 필드 | 유형 | 용도 |
|--------|------|------|------|
| PK | `id` | Primary | 고유 식별자 |
| IDX | `userId, isRead, createdAt` | Composite | 읽지 않은 알림 우선 조회 |

### Task / StudyTask 테이블

| 인덱스 | 필드 | 유형 | 용도 |
|--------|------|------|------|
| IDX (Task) | `userId, completed` | Composite | 개인 할 일 목록 |
| IDX (Task) | `studyId, status` | Composite | 스터디별 상태 조회 |
| IDX (StudyTask) | `studyId, status` | Composite | 스터디별 상태 조회 |
| IDX (StudyTask) | `createdById` | Index | 생성자별 조회 |

---

## 🎯 인덱스 설계 원칙

### 1. WHERE 절 최적화
가장 자주 사용되는 필터링 조건에 인덱스 생성

```javascript
// 자주 사용되는 쿼리 패턴
await prisma.study.findMany({
  where: {
    isPublic: true,    // 인덱스 필요
    isRecruiting: true // 복합 인덱스
  }
});

// 복합 인덱스: @@index([isPublic, isRecruiting])
```

### 2. ORDER BY 최적화
정렬에 자주 사용되는 필드에 인덱스 생성

```javascript
// 시간순 정렬 쿼리
await prisma.message.findMany({
  where: { studyId: 'xxx' },
  orderBy: { createdAt: 'desc' }
});

// 복합 인덱스: @@index([studyId, createdAt])
```

### 3. 복합 인덱스 순서
- **선택도 높은 필드를 앞에** (유니크에 가까운 값)
- **범위 조건 필드를 뒤에** (>, <, BETWEEN)

```javascript
// 좋은 예: studyId (선택도 높음) + status (범위 조건)
@@index([studyId, status])

// 나쁜 예: status (선택도 낮음) + studyId
@@index([status, studyId]) // 비효율적
```

---

## 📈 쿼리 최적화 전략

### 1. 필요한 필드만 select

```javascript
// ❌ 나쁜 예: 모든 필드 조회
const users = await prisma.user.findMany();

// ✅ 좋은 예: 필요한 필드만 선택
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    avatar: true
  }
});
```

### 2. Pagination 사용

```javascript
// ❌ 나쁜 예: 모든 데이터 조회
const allStudies = await prisma.study.findMany();

// ✅ 좋은 예: 페이지네이션 적용
const studies = await prisma.study.findMany({
  skip: 0,
  take: 20,
  orderBy: { createdAt: 'desc' }
});
```

### 3. Cursor 기반 페이지네이션 (대규모 데이터)

```javascript
// Offset 기반보다 효율적
const messages = await prisma.message.findMany({
  take: 50,
  cursor: { id: lastMessageId },
  skip: 1, // 커서 다음부터
  orderBy: { createdAt: 'desc' }
});
```

### 4. include vs select

```javascript
// ❌ include는 전체 필드 포함
const study = await prisma.study.findUnique({
  where: { id },
  include: { members: true } // 모든 멤버 필드 포함
});

// ✅ select로 필요한 관계 필드만
const study = await prisma.study.findUnique({
  where: { id },
  include: {
    members: {
      select: { user: { select: { name: true } } }
    }
  }
});
```

### 5. _count 활용

```javascript
// ❌ 관계 데이터 전체 조회 후 길이 계산
const study = await prisma.study.findUnique({
  include: { members: true }
});
const memberCount = study.members.length;

// ✅ _count 사용
const study = await prisma.study.findUnique({
  where: { id },
  include: {
    _count: { select: { members: true, messages: true } }
  }
});
const memberCount = study._count.members;
```

---

## 🔧 N+1 문제 해결

### 문제 상황

```javascript
// ❌ N+1 문제 발생
const studies = await prisma.study.findMany();
for (const study of studies) {
  const members = await prisma.studyMember.findMany({
    where: { studyId: study.id }
  });
  // N개의 스터디에 대해 N번 추가 쿼리
}
```

### 해결: include 사용

```javascript
// ✅ 한 번의 쿼리로 해결
const studies = await prisma.study.findMany({
  include: {
    members: {
      include: { user: { select: { name: true } } }
    }
  }
});
```

---

## 📊 인덱스 모니터링

### PostgreSQL 쿼리 분석

```sql
-- 쿼리 실행 계획 확인
EXPLAIN ANALYZE SELECT * FROM "Study" WHERE "isPublic" = true AND "isRecruiting" = true;

-- 인덱스 사용 통계
SELECT 
  schemaname, tablename, indexname, 
  idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 사용되지 않는 인덱스 찾기
SELECT 
  schemaname, tablename, indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### Prisma Query 로깅

```javascript
// prisma/client 설정에서 쿼리 로깅 활성화
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

## 💡 추가 최적화 팁

### 1. 자주 조회되는 데이터 캐싱

```javascript
import { redis } from '@/lib/redis';

async function getStudyWithCache(studyId) {
  const cacheKey = `study:${studyId}`;
  
  // 캐시 확인
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // DB 조회
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    include: { /* ... */ }
  });
  
  // 캐시 저장 (5분)
  await redis.set(cacheKey, JSON.stringify(study), 'EX', 300);
  
  return study;
}
```

### 2. Batch 작업 사용

```javascript
// ❌ 개별 업데이트
for (const id of notificationIds) {
  await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });
}

// ✅ Batch 업데이트
await prisma.notification.updateMany({
  where: { id: { in: notificationIds } },
  data: { isRead: true }
});
```

### 3. Transaction 활용

```javascript
// 관련 작업을 트랜잭션으로 묶어 일관성 보장
await prisma.$transaction([
  prisma.studyMember.update({ ... }),
  prisma.notification.create({ ... }),
  prisma.adminLog.create({ ... })
]);
```

---

## 🔗 관련 문서

- [ERD 다이어그램](./erd-diagram.md)
- [테이블 관계](./relationships.md)
- [Prisma 설정](../../11_configuration/README.md)
