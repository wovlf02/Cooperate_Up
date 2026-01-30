# 👤 User 모델

## 📋 개요

`User` 모델은 CoUp 서비스에 가입한 사용자의 기본 정보를 저장합니다. 인증, 프로필, 상태 관리를 담당하는 핵심 모델입니다.

---

## 📊 스키마 정의

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
}
```

---

## 🏷️ 필드 상세

### 기본 정보

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✅ | cuid() | 고유 식별자 |
| `email` | String | ✅ | - | 이메일 (로그인 ID), 유니크 |
| `password` | String | ❌ | null | 비밀번호 해시 (OAuth 사용자는 null) |
| `name` | String | ❌ | null | 표시 이름 |
| `avatar` | String | ❌ | null | 프로필 이미지 URL |
| `bio` | String | ❌ | null | 자기소개 |

### 인증 정보

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `provider` | Provider | ✅ | CREDENTIALS | 로그인 방식 |
| `googleId` | String | ❌ | null | Google OAuth ID |
| `githubId` | String | ❌ | null | GitHub OAuth ID |

### 역할 및 권한

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `role` | UserRole | ✅ | USER | 사용자 역할 |

### 상태 관리

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `status` | UserStatus | ✅ | ACTIVE | 계정 상태 |
| `suspendedUntil` | DateTime | ❌ | null | 정지 해제 일시 |
| `suspendReason` | String | ❌ | null | 정지 사유 |
| `restrictedUntil` | DateTime | ❌ | null | 활동 제한 해제 일시 |
| `restrictedActions` | String[] | ✅ | [] | 제한된 활동 목록 |

### 타임스탬프

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `createdAt` | DateTime | ✅ | now() | 가입일 |
| `updatedAt` | DateTime | ✅ | 자동 | 수정일 |
| `lastLoginAt` | DateTime | ❌ | null | 마지막 로그인 |

---

## 🔗 관계 (Relations)

### 소유 관계 (1:N)

| 관계 | 대상 모델 | 설명 |
|------|----------|------|
| `ownedStudies` | Study[] | 생성한 스터디 목록 |
| `createdGroups` | Group[] | 생성한 그룹 목록 |
| `createdNotices` | Notice[] | 작성한 공지사항 |
| `uploadedFiles` | File[] | 업로드한 파일 |
| `createdEvents` | Event[] | 생성한 일정 |
| `createdStudyTasks` | StudyTask[] | 생성한 스터디 태스크 |

### 참여 관계 (1:N)

| 관계 | 대상 모델 | 설명 |
|------|----------|------|
| `studyMembers` | StudyMember[] | 가입한 스터디 멤버십 |
| `groupMembers` | GroupMember[] | 가입한 그룹 멤버십 |
| `messages` | Message[] | 작성한 메시지 |
| `tasks` | Task[] | 개인 할 일 |
| `assignedStudyTasks` | StudyTaskAssignee[] | 배정받은 태스크 |

### 알림/신고 관계 (1:N)

| 관계 | 대상 모델 | 설명 |
|------|----------|------|
| `notifications` | Notification[] | 받은 알림 |
| `reports` | Report[] | 제출한 신고 |
| `receivedWarnings` | Warning[] | 받은 경고 |
| `sanctions` | Sanction[] | 받은 제재 |

### 관리자 관계 (1:1)

| 관계 | 대상 모델 | 설명 |
|------|----------|------|
| `adminRole` | AdminRole? | 관리자 역할 (있는 경우) |

---

## 📌 Enum 타입

### Provider (로그인 방식)

| 값 | 설명 |
|----|------|
| `CREDENTIALS` | 이메일/비밀번호 로그인 |
| `GOOGLE` | Google OAuth |
| `GITHUB` | GitHub OAuth |

### UserRole (사용자 역할)

| 값 | 설명 |
|----|------|
| `USER` | 일반 사용자 |
| `ADMIN` | 관리자 |

### UserStatus (계정 상태)

| 값 | 설명 |
|----|------|
| `ACTIVE` | 활성 상태 |
| `SUSPENDED` | 정지 상태 |
| `DELETED` | 삭제됨 |

---

## 🔍 인덱스

| 인덱스 | 필드 | 용도 |
|--------|------|------|
| `@@index([email])` | email | 로그인 시 빠른 조회 |
| `@@index([status])` | status | 상태별 사용자 조회 |
| `@@index([createdAt])` | createdAt | 가입일순 정렬 |
| `@@index([lastLoginAt])` | lastLoginAt | 최근 로그인 사용자 조회 |

---

## 💡 사용 예시

### 사용자 조회
```javascript
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    studyMembers: {
      include: { study: true }
    }
  }
});
```

### 활성 사용자 목록
```javascript
const activeUsers = await prisma.user.findMany({
  where: { status: 'ACTIVE' },
  orderBy: { createdAt: 'desc' }
});
```

---

## 🔗 관련 문서

- [스터디 모델](./study.md)
- [스터디 멤버 모델](./study-member.md)
- [관리자 모델](./admin.md)
