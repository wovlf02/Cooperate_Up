# 📖 Study 모델

## 📋 개요

`Study` 모델은 스터디 그룹의 정보를 저장합니다. 스터디는 CoUp의 핵심 단위로, 멤버, 채팅, 파일, 일정 등 모든 활동이 스터디를 중심으로 이루어집니다.

---

## 📊 스키마 정의

```prisma
model Study {
  id          String  @id @default(cuid())
  ownerId     String
  name        String
  emoji       String  @default("📚")
  description String  @db.Text
  category    String
  subCategory String?

  // 설정
  maxMembers   Int     @default(20)
  isPublic     Boolean @default(true)
  autoApprove  Boolean @default(true)
  isRecruiting Boolean @default(true)

  // 평가
  rating      Float? @default(0)
  reviewCount Int?   @default(0)

  // 메타
  tags       String[]
  inviteCode String   @unique @default(cuid())

  // 타임스탬프
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🏷️ 필드 상세

### 기본 정보

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✅ | cuid() | 고유 식별자 |
| `ownerId` | String | ✅ | - | 스터디장 ID (FK → User) |
| `name` | String | ✅ | - | 스터디 이름 |
| `emoji` | String | ✅ | "📚" | 대표 이모지 |
| `description` | String | ✅ | - | 스터디 설명 (Text) |
| `category` | String | ✅ | - | 주 카테고리 |
| `subCategory` | String | ❌ | null | 서브 카테고리 |

### 설정

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `maxMembers` | Int | ✅ | 20 | 최대 멤버 수 |
| `isPublic` | Boolean | ✅ | true | 공개 여부 |
| `autoApprove` | Boolean | ✅ | true | 가입 자동 승인 |
| `isRecruiting` | Boolean | ✅ | true | 모집 중 여부 |

### 평가

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `rating` | Float | ❌ | 0 | 평균 평점 |
| `reviewCount` | Int | ❌ | 0 | 리뷰 수 |

### 메타 정보

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `tags` | String[] | ✅ | [] | 태그 배열 |
| `inviteCode` | String | ✅ | cuid() | 초대 코드 (유니크) |

### 타임스탬프

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `createdAt` | DateTime | ✅ | now() | 생성일 |
| `updatedAt` | DateTime | ✅ | 자동 | 수정일 |

---

## 🔗 관계 (Relations)

| 관계 | 대상 모델 | 관계 유형 | 설명 |
|------|----------|----------|------|
| `owner` | User | N:1 | 스터디장 |
| `members` | StudyMember[] | 1:N | 스터디 멤버십 |
| `messages` | Message[] | 1:N | 채팅 메시지 |
| `notices` | Notice[] | 1:N | 공지사항 |
| `files` | File[] | 1:N | 업로드된 파일 |
| `events` | Event[] | 1:N | 캘린더 일정 |
| `tasks` | Task[] | 1:N | 개인 태스크 (스터디 연결) |
| `studyTasks` | StudyTask[] | 1:N | 스터디 공유 태스크 |

---

## 🔍 인덱스

| 인덱스 | 필드 | 용도 |
|--------|------|------|
| `@@index([category])` | category | 카테고리별 필터링 |
| `@@index([isPublic, isRecruiting])` | isPublic, isRecruiting | 공개+모집 중 스터디 조회 |
| `@@index([ownerId])` | ownerId | 특정 사용자의 스터디 조회 |
| `@@index([rating])` | rating | 평점순 정렬 |

---

## 📂 카테고리 예시

| 카테고리 | 설명 |
|----------|------|
| `programming` | 프로그래밍 |
| `language` | 어학 |
| `certificate` | 자격증 |
| `employment` | 취업 |
| `hobby` | 취미 |
| `other` | 기타 |

---

## 💡 사용 예시

### 스터디 생성
```javascript
const study = await prisma.study.create({
  data: {
    name: "React 스터디",
    emoji: "⚛️",
    description: "React를 함께 공부합니다",
    category: "programming",
    ownerId: userId,
    tags: ["react", "frontend", "javascript"],
  }
});
```

### 공개 모집 중 스터디 조회
```javascript
const studies = await prisma.study.findMany({
  where: {
    isPublic: true,
    isRecruiting: true,
  },
  include: {
    owner: { select: { name: true, avatar: true } },
    _count: { select: { members: true } }
  },
  orderBy: { createdAt: 'desc' }
});
```

### 카테고리별 스터디 검색
```javascript
const studies = await prisma.study.findMany({
  where: {
    category: "programming",
    OR: [
      { name: { contains: "React", mode: 'insensitive' } },
      { tags: { has: "react" } }
    ]
  }
});
```

---

## 🔗 관련 문서

- [사용자 모델](./user.md)
- [스터디 멤버 모델](./study-member.md)
- [메시지 모델](./message.md)
- [태스크 모델](./task.md)
