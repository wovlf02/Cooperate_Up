# 👤 User 관련 모델

## 개요

사용자(User)와 멤버십(StudyMember, GroupMember) 관련 모델을 다룹니다.

---

## User 모델

### 스키마

```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String?
  name     String?
  avatar   String?
  bio      String?
  provider Provider @default(CREDENTIALS)
  role     UserRole @default(USER)

  // 소셜 로그인
  googleId String? @unique
  githubId String? @unique

  // 상태
  status         UserStatus @default(ACTIVE)
  suspendedUntil DateTime?
  suspendReason  String?

  // 활동 제한
  restrictedUntil   DateTime?
  restrictedActions String[]  @default([])

  // 타임스탬프
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastLoginAt DateTime?

  // 관계
  ownedStudies       Study[]             @relation("StudyOwner")
  studyMembers       StudyMember[]
  messages           Message[]
  notifications      Notification[]
  tasks              Task[]
  reports            Report[]
  createdNotices     Notice[]
  uploadedFiles      File[]              @relation("FileUploader")
  createdEvents      Event[]             @relation("EventCreator")
  createdStudyTasks  StudyTask[]         @relation("StudyTaskCreator")
  assignedStudyTasks StudyTaskAssignee[] @relation("TaskAssignee")
  createdGroups      Group[]             @relation("GroupCreator")
  groupMembers       GroupMember[]
  sentInvites        GroupInvite[]       @relation("GroupInviter")
  receivedInvites    GroupInvite[]       @relation("GroupInvitee")
  sanctions          Sanction[]          @relation("UserSanctions")
  receivedWarnings   Warning[]
  adminLogs          AdminLog[]          @relation("AdminActions")
  adminRole          AdminRole?
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `email` | String | ✓ | - | 이메일 (유니크) |
| `password` | String | - | - | 해시된 비밀번호 |
| `name` | String | - | - | 사용자 이름 |
| `avatar` | String | - | - | 프로필 이미지 URL |
| `bio` | String | - | - | 자기소개 |
| `provider` | Provider | ✓ | CREDENTIALS | 인증 제공자 |
| `role` | UserRole | ✓ | USER | 사용자 역할 |
| `googleId` | String | - | - | Google OAuth ID |
| `githubId` | String | - | - | GitHub OAuth ID |
| `status` | UserStatus | ✓ | ACTIVE | 계정 상태 |
| `suspendedUntil` | DateTime | - | - | 정지 해제 일시 |
| `suspendReason` | String | - | - | 정지 사유 |
| `restrictedUntil` | DateTime | - | - | 제한 해제 일시 |
| `restrictedActions` | String[] | - | [] | 제한된 활동 목록 |
| `createdAt` | DateTime | ✓ | now() | 생성일 |
| `updatedAt` | DateTime | ✓ | auto | 수정일 |
| `lastLoginAt` | DateTime | - | - | 마지막 로그인 |

### 인덱스

```prisma
@@index([email])
@@index([status])
@@index([createdAt])
@@index([lastLoginAt])
```

---

## StudyMember 모델

### 스키마

```prisma
model StudyMember {
  id      String       @id @default(cuid())
  studyId String
  userId  String
  role    MemberRole   @default(MEMBER)
  status  MemberStatus @default(PENDING)

  // 가입 정보
  introduction String? @db.Text
  motivation   String?
  level        String?

  // 타임스탬프
  joinedAt   DateTime  @default(now())
  approvedAt DateTime?

  // 관계
  study Study @relation(fields: [studyId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([studyId, userId])
  @@index([userId])
  @@index([status])
  @@index([studyId, status])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `studyId` | String | ✓ | - | 스터디 ID (FK) |
| `userId` | String | ✓ | - | 사용자 ID (FK) |
| `role` | MemberRole | ✓ | MEMBER | 멤버 역할 |
| `status` | MemberStatus | ✓ | PENDING | 멤버 상태 |
| `introduction` | String | - | - | 자기소개 |
| `motivation` | String | - | - | 가입 동기 |
| `level` | String | - | - | 실력 레벨 |
| `joinedAt` | DateTime | ✓ | now() | 가입 신청일 |
| `approvedAt` | DateTime | - | - | 승인일 |

### 제약 조건

- `@@unique([studyId, userId])`: 한 스터디에 동일 사용자 중복 가입 방지

### 인덱스

```prisma
@@index([userId])
@@index([status])
@@index([studyId, status])  // 스터디 멤버 필터링 최적화
```

---

## GroupMember 모델

### 스키마

```prisma
model GroupMember {
  id      String            @id @default(cuid())
  groupId String
  userId  String
  role    GroupMemberRole   @default(MEMBER)
  status  GroupMemberStatus @default(ACTIVE)

  // 타임스탬프
  joinedAt DateTime  @default(now())
  leftAt   DateTime?

  // 관계
  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])
  @@index([userId])
  @@index([status])
  @@index([groupId, status])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `groupId` | String | ✓ | - | 그룹 ID (FK) |
| `userId` | String | ✓ | - | 사용자 ID (FK) |
| `role` | GroupMemberRole | ✓ | MEMBER | 멤버 역할 |
| `status` | GroupMemberStatus | ✓ | ACTIVE | 멤버 상태 |
| `joinedAt` | DateTime | ✓ | now() | 가입일 |
| `leftAt` | DateTime | - | - | 탈퇴일 |

---

## 관련 Enum

### Provider (인증 제공자)

```prisma
enum Provider {
  CREDENTIALS  // 이메일/비밀번호
  GOOGLE       // Google OAuth
  GITHUB       // GitHub OAuth
}
```

### UserRole (사용자 역할)

```prisma
enum UserRole {
  USER   // 일반 사용자
  ADMIN  // 관리자
}
```

### UserStatus (사용자 상태)

```prisma
enum UserStatus {
  ACTIVE     // 활성
  SUSPENDED  // 정지
  DELETED    // 삭제됨
}
```

### MemberRole (스터디 멤버 역할)

```prisma
enum MemberRole {
  OWNER   // 소유자
  ADMIN   // 관리자
  MEMBER  // 일반 멤버
}
```

### MemberStatus (스터디 멤버 상태)

```prisma
enum MemberStatus {
  PENDING  // 승인 대기
  ACTIVE   // 활성
  KICKED   // 추방됨
  LEFT     // 탈퇴함
}
```

### GroupMemberRole (그룹 멤버 역할)

```prisma
enum GroupMemberRole {
  OWNER   // 소유자
  ADMIN   // 관리자
  MEMBER  // 일반 멤버
}
```

### GroupMemberStatus (그룹 멤버 상태)

```prisma
enum GroupMemberStatus {
  PENDING  // 승인 대기
  ACTIVE   // 활성
  LEFT     // 탈퇴함
  KICKED   // 추방됨
}
```

---

## 사용 예시

### 사용자 생성

```javascript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: hashedPassword,
    name: '홍길동',
    provider: 'CREDENTIALS',
    role: 'USER',
    status: 'ACTIVE'
  }
})
```

### 스터디 멤버 조회

```javascript
const members = await prisma.studyMember.findMany({
  where: {
    studyId: 'study123',
    status: 'ACTIVE'
  },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        avatar: true,
        email: true
      }
    }
  }
})
```

### 사용자의 스터디 목록

```javascript
const userStudies = await prisma.studyMember.findMany({
  where: {
    userId: 'user123',
    status: 'ACTIVE'
  },
  include: {
    study: true
  }
})
```

---

## 관련 문서

- [Study 모델](./models-study.md) - 스터디 관련 모델
- [Content 모델](./models-content.md) - 콘텐츠 관련 모델
- [Admin 모델](./models-admin.md) - 관리자 관련 모델
- [Enum & Index](./enums-indexes.md) - 열거형 및 인덱스

