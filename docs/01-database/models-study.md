# 📚 Study 관련 모델

## 개요

스터디(Study)와 그룹(Group, GroupInvite) 관련 모델을 다룹니다.

---

## Study 모델

### 스키마

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

  // 관계
  owner      User          @relation("StudyOwner", fields: [ownerId], references: [id])
  members    StudyMember[]
  messages   Message[]
  notices    Notice[]
  files      File[]
  events     Event[]
  tasks      Task[]
  studyTasks StudyTask[]

  @@index([category])
  @@index([isPublic, isRecruiting])
  @@index([ownerId])
  @@index([rating])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `ownerId` | String | ✓ | - | 소유자 User ID (FK) |
| `name` | String | ✓ | - | 스터디 이름 |
| `emoji` | String | ✓ | "📚" | 대표 이모지 |
| `description` | String | ✓ | - | 스터디 설명 |
| `category` | String | ✓ | - | 카테고리 |
| `subCategory` | String | - | - | 서브 카테고리 |
| `maxMembers` | Int | ✓ | 20 | 최대 멤버 수 |
| `isPublic` | Boolean | ✓ | true | 공개 여부 |
| `autoApprove` | Boolean | ✓ | true | 자동 승인 여부 |
| `isRecruiting` | Boolean | ✓ | true | 모집 중 여부 |
| `rating` | Float | - | 0 | 평균 평점 |
| `reviewCount` | Int | - | 0 | 리뷰 수 |
| `tags` | String[] | - | - | 태그 배열 |
| `inviteCode` | String | ✓ | cuid() | 초대 코드 (유니크) |
| `createdAt` | DateTime | ✓ | now() | 생성일 |
| `updatedAt` | DateTime | ✓ | auto | 수정일 |

### 인덱스

```prisma
@@index([category])              // 카테고리별 조회
@@index([isPublic, isRecruiting]) // 공개 + 모집중 필터
@@index([ownerId])               // 소유자별 조회
@@index([rating])                // 평점 정렬
```

---

## Group 모델

### 스키마

```prisma
model Group {
  id          String  @id @default(cuid())
  name        String
  description String? @db.Text
  category    String  @default("etc")
  imageUrl    String?

  // 그룹 설정
  isPublic     Boolean @default(true)
  maxMembers   Int     @default(50)
  isRecruiting Boolean @default(true)

  // 메타
  createdBy String
  deletedAt DateTime?

  // 타임스탬프
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 관계
  creator User          @relation("GroupCreator", fields: [createdBy], references: [id])
  members GroupMember[]
  invites GroupInvite[]

  @@index([category])
  @@index([isPublic, isRecruiting])
  @@index([createdBy])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `name` | String | ✓ | - | 그룹 이름 |
| `description` | String | - | - | 그룹 설명 |
| `category` | String | ✓ | "etc" | 카테고리 |
| `imageUrl` | String | - | - | 그룹 이미지 URL |
| `isPublic` | Boolean | ✓ | true | 공개 여부 |
| `maxMembers` | Int | ✓ | 50 | 최대 멤버 수 |
| `isRecruiting` | Boolean | ✓ | true | 모집 중 여부 |
| `createdBy` | String | ✓ | - | 생성자 User ID (FK) |
| `deletedAt` | DateTime | - | - | 소프트 삭제 일시 |
| `createdAt` | DateTime | ✓ | now() | 생성일 |
| `updatedAt` | DateTime | ✓ | auto | 수정일 |

---

## GroupInvite 모델

### 스키마

```prisma
model GroupInvite {
  id        String            @id @default(cuid())
  groupId   String
  invitedBy String
  email     String?
  code      String            @unique @default(cuid())
  status    GroupInviteStatus @default(PENDING)

  // 타임스탬프
  createdAt DateTime  @default(now())
  expiresAt DateTime?
  usedAt    DateTime?
  usedBy    String?

  // 관계
  group   Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  inviter User  @relation("GroupInviter", fields: [invitedBy], references: [id])
  user    User? @relation("GroupInvitee", fields: [usedBy], references: [id])

  @@index([groupId])
  @@index([invitedBy])
  @@index([status])
  @@index([code])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `groupId` | String | ✓ | - | 그룹 ID (FK) |
| `invitedBy` | String | ✓ | - | 초대자 User ID (FK) |
| `email` | String | - | - | 초대 대상 이메일 |
| `code` | String | ✓ | cuid() | 초대 코드 (유니크) |
| `status` | GroupInviteStatus | ✓ | PENDING | 초대 상태 |
| `createdAt` | DateTime | ✓ | now() | 생성일 |
| `expiresAt` | DateTime | - | - | 만료일 |
| `usedAt` | DateTime | - | - | 사용일 |
| `usedBy` | String | - | - | 사용자 ID |

### 관련 Enum

```prisma
enum GroupInviteStatus {
  PENDING    // 대기 중
  ACCEPTED   // 수락됨
  EXPIRED    // 만료됨
  CANCELLED  // 취소됨
}
```

---

## Study vs Group 비교

| 항목 | Study | Group |
|------|-------|-------|
| **목적** | 학습 중심 협업 | 일반 커뮤니티 |
| **기본 인원** | 20명 | 50명 |
| **기능** | 채팅, 캘린더, 파일, 공지, 할일 | 멤버 관리 |
| **초대 방식** | 초대 코드 | 초대 링크 + 이메일 |
| **관계** | 독립적 | 독립적 |

---

## 사용 예시

### 스터디 생성

```javascript
const study = await prisma.study.create({
  data: {
    name: 'JavaScript 스터디',
    emoji: '💻',
    description: 'JS 심화 학습',
    category: 'programming',
    ownerId: userId,
    tags: ['javascript', 'frontend'],
    maxMembers: 10,
    isPublic: true,
    autoApprove: false
  }
})
```

### 공개 스터디 목록 조회

```javascript
const studies = await prisma.study.findMany({
  where: {
    isPublic: true,
    isRecruiting: true
  },
  include: {
    owner: {
      select: { id: true, name: true, avatar: true }
    },
    _count: {
      select: { members: { where: { status: 'ACTIVE' } } }
    }
  },
  orderBy: { rating: 'desc' }
})
```

### 스터디 상세 조회 (멤버 포함)

```javascript
const study = await prisma.study.findUnique({
  where: { id: studyId },
  include: {
    owner: {
      select: { id: true, name: true, avatar: true, email: true }
    },
    members: {
      where: { status: 'ACTIVE' },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    }
  }
})
```

### 초대 코드로 스터디 찾기

```javascript
const study = await prisma.study.findUnique({
  where: { inviteCode: 'abc123' }
})
```

---

## 관련 문서

- [User 모델](./models-user.md) - 사용자 관련 모델
- [Content 모델](./models-content.md) - 콘텐츠 관련 모델
- [Admin 모델](./models-admin.md) - 관리자 관련 모델

