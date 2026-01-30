# 🛡️ Admin 관련 모델

## 개요

관리자 시스템(AdminRole, Warning, Sanction, AdminLog, Report) 관련 모델을 다룹니다.

---

## AdminRole 모델 (관리자 역할)

### 스키마

```prisma
model AdminRole {
  id          String        @id @default(cuid())
  userId      String        @unique
  role        AdminRoleType
  permissions Json
  grantedBy   String
  grantedAt   DateTime      @default(now())
  expiresAt   DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([role])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `userId` | String | ✓ | - | 사용자 ID (FK, 유니크) |
| `role` | AdminRoleType | ✓ | - | 관리자 역할 |
| `permissions` | Json | ✓ | - | 세부 권한 JSON |
| `grantedBy` | String | ✓ | - | 권한 부여자 ID |
| `grantedAt` | DateTime | ✓ | now() | 권한 부여일 |
| `expiresAt` | DateTime | - | - | 권한 만료일 |

### AdminRoleType Enum

```prisma
enum AdminRoleType {
  VIEWER       // 조회만 가능
  MODERATOR    // 콘텐츠 모더레이션
  ADMIN        // 사용자/스터디 관리
  SUPER_ADMIN  // 모든 권한
}
```

### 권한 계층

| 역할 | 조회 | 콘텐츠 관리 | 사용자 관리 | 시스템 설정 |
|------|------|------------|------------|------------|
| VIEWER | ✓ | ✗ | ✗ | ✗ |
| MODERATOR | ✓ | ✓ | ✗ | ✗ |
| ADMIN | ✓ | ✓ | ✓ | ✗ |
| SUPER_ADMIN | ✓ | ✓ | ✓ | ✓ |

---

## Warning 모델 (경고)

### 스키마

```prisma
model Warning {
  id             String          @id @default(cuid())
  userId         String
  adminId        String
  reason         String          @db.Text
  severity       WarningSeverity @default(NORMAL)
  relatedContent String?
  expiresAt      DateTime?
  createdAt      DateTime        @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([severity, createdAt])
  @@index([userId, severity, createdAt])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `userId` | String | ✓ | - | 대상 사용자 ID (FK) |
| `adminId` | String | ✓ | - | 경고 부여 관리자 ID |
| `reason` | String | ✓ | - | 경고 사유 |
| `severity` | WarningSeverity | ✓ | NORMAL | 심각도 |
| `relatedContent` | String | - | - | 관련 콘텐츠 URL/ID |
| `expiresAt` | DateTime | - | - | 경고 만료일 |
| `createdAt` | DateTime | ✓ | now() | 생성일 |

### WarningSeverity Enum

```prisma
enum WarningSeverity {
  MINOR     // 경미한 위반
  NORMAL    // 일반 위반
  SERIOUS   // 심각한 위반
  CRITICAL  // 치명적 위반
}
```

---

## Sanction 모델 (제재)

### 스키마

```prisma
model Sanction {
  id              String       @id @default(cuid())
  userId          String
  adminId         String
  type            SanctionType
  reason          String       @db.Text
  duration        String?
  expiresAt       DateTime?
  relatedReportId String?
  metadata        String?      @db.Text

  // 해제 정보
  isActive        Boolean   @default(true)
  unsuspendedBy   String?
  unsuspendReason String?
  unsuspendedAt   DateTime?

  createdAt DateTime @default(now())

  user User @relation("UserSanctions", fields: [userId], references: [id])

  @@index([userId, type, createdAt])
  @@index([userId, isActive, expiresAt])
  @@index([isActive, expiresAt])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `userId` | String | ✓ | - | 대상 사용자 ID (FK) |
| `adminId` | String | ✓ | - | 제재 부여 관리자 ID |
| `type` | SanctionType | ✓ | - | 제재 유형 |
| `reason` | String | ✓ | - | 제재 사유 |
| `duration` | String | - | - | 기간 (1d, 7d, permanent) |
| `expiresAt` | DateTime | - | - | 만료일 |
| `relatedReportId` | String | - | - | 관련 신고 ID |
| `metadata` | String | - | - | 추가 데이터 (JSON) |
| `isActive` | Boolean | ✓ | true | 활성 여부 |
| `unsuspendedBy` | String | - | - | 해제 관리자 ID |
| `unsuspendReason` | String | - | - | 해제 사유 |
| `unsuspendedAt` | DateTime | - | - | 해제일 |
| `createdAt` | DateTime | ✓ | now() | 생성일 |

### SanctionType Enum

```prisma
enum SanctionType {
  WARNING          // 경고
  CHAT_BAN         // 채팅 금지
  STUDY_CREATE_BAN // 스터디 생성 금지
  FILE_UPLOAD_BAN  // 파일 업로드 금지
  RESTRICTION      // 활동 제한
  SUSPENSION       // 계정 정지
  PERMANENT_BAN    // 영구 정지
}
```

---

## AdminLog 모델 (관리자 활동 로그)

### 스키마

```prisma
model AdminLog {
  id         String      @id @default(cuid())
  adminId    String
  action     AdminAction
  targetType String?
  targetId   String?

  // 변경 내용
  before Json?
  after  Json?
  reason String? @db.Text

  // 메타 정보
  ipAddress String?
  userAgent String?

  createdAt DateTime @default(now())

  admin User @relation("AdminActions", fields: [adminId], references: [id])

  @@index([adminId, createdAt])
  @@index([action, createdAt])
  @@index([targetType, targetId])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `adminId` | String | ✓ | - | 관리자 ID (FK) |
| `action` | AdminAction | ✓ | - | 수행한 액션 |
| `targetType` | String | - | - | 대상 타입 (User, Study, Report) |
| `targetId` | String | - | - | 대상 ID |
| `before` | Json | - | - | 변경 전 상태 |
| `after` | Json | - | - | 변경 후 상태 |
| `reason` | String | - | - | 처리 사유 |
| `ipAddress` | String | - | - | IP 주소 |
| `userAgent` | String | - | - | 브라우저 정보 |
| `createdAt` | DateTime | ✓ | now() | 생성일 |

### AdminAction Enum

```prisma
enum AdminAction {
  // 사용자 관리
  USER_VIEW
  USER_SEARCH
  USER_WARN
  USER_SUSPEND
  USER_UNSUSPEND
  USER_DELETE
  USER_RESTORE
  USER_UPDATE

  // 스터디 관리
  STUDY_VIEW
  STUDY_HIDE
  STUDY_UNHIDE
  STUDY_CLOSE
  STUDY_REOPEN
  STUDY_DELETE
  STUDY_RECOMMEND

  // 신고 처리
  REPORT_VIEW
  REPORT_ASSIGN
  REPORT_RESOLVE
  REPORT_REJECT

  // 콘텐츠 관리
  CONTENT_DELETE
  CONTENT_RESTORE

  // 시스템 설정
  SETTINGS_VIEW
  SETTINGS_UPDATE
  SETTINGS_CACHE_CLEAR

  // 분석 및 통계
  ANALYTICS_VIEW
  ANALYTICS_EXPORT

  // 감사 로그
  AUDIT_VIEW
  AUDIT_EXPORT
}
```

---

## Report 모델 (신고)

### 스키마

```prisma
model Report {
  id         String     @id @default(cuid())
  reporterId String
  targetType TargetType
  targetId   String
  targetName String?
  type       ReportType
  reason     String     @db.Text
  evidence   Json?

  status   ReportStatus @default(PENDING)
  priority Priority     @default(MEDIUM)

  // 처리
  processedBy String?
  processedAt DateTime?
  resolution  String?   @db.Text

  createdAt DateTime @default(now())

  reporter User @relation(fields: [reporterId], references: [id])

  @@index([status, priority, createdAt])
  @@index([targetType, targetId])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `reporterId` | String | ✓ | - | 신고자 ID (FK) |
| `targetType` | TargetType | ✓ | - | 대상 유형 |
| `targetId` | String | ✓ | - | 대상 ID |
| `targetName` | String | - | - | 대상 이름 (캐시) |
| `type` | ReportType | ✓ | - | 신고 유형 |
| `reason` | String | ✓ | - | 신고 사유 |
| `evidence` | Json | - | - | 증거 자료 |
| `status` | ReportStatus | ✓ | PENDING | 처리 상태 |
| `priority` | Priority | ✓ | MEDIUM | 우선순위 |
| `processedBy` | String | - | - | 처리 관리자 ID |
| `processedAt` | DateTime | - | - | 처리일 |
| `resolution` | String | - | - | 처리 결과 |
| `createdAt` | DateTime | ✓ | now() | 생성일 |

### 관련 Enum

```prisma
enum TargetType {
  USER     // 사용자
  STUDY    // 스터디
  MESSAGE  // 메시지
}

enum ReportType {
  SPAM          // 스팸
  HARASSMENT    // 괴롭힘
  INAPPROPRIATE // 부적절한 콘텐츠
  COPYRIGHT     // 저작권 침해
  OTHER         // 기타
}

enum ReportStatus {
  PENDING      // 대기 중
  IN_PROGRESS  // 처리 중
  RESOLVED     // 해결됨
  REJECTED     // 기각됨
}
```

---

## SystemSetting 모델 (시스템 설정)

### 스키마

```prisma
model SystemSetting {
  id          String   @id @default(cuid())
  category    String
  key         String   @unique
  value       String   @db.Text
  type        String
  description String?
  updatedAt   DateTime @updatedAt
  updatedBy   String

  @@index([category])
  @@index([key])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `category` | String | ✓ | - | 설정 카테고리 |
| `key` | String | ✓ | - | 설정 키 (유니크) |
| `value` | String | ✓ | - | 설정 값 |
| `type` | String | ✓ | - | 값 타입 (string, number, boolean, json) |
| `description` | String | - | - | 설정 설명 |
| `updatedAt` | DateTime | ✓ | auto | 수정일 |
| `updatedBy` | String | ✓ | - | 수정자 ID |

---

## 사용 예시

### 경고 생성

```javascript
const warning = await prisma.warning.create({
  data: {
    userId: 'user123',
    adminId: 'admin456',
    reason: '욕설 사용',
    severity: 'NORMAL',
    relatedContent: '/studies/abc/chat/msg123'
  }
})
```

### 제재 적용

```javascript
const sanction = await prisma.sanction.create({
  data: {
    userId: 'user123',
    adminId: 'admin456',
    type: 'SUSPENSION',
    reason: '반복적인 규정 위반',
    duration: '7d',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true
  }
})

// User 상태 업데이트
await prisma.user.update({
  where: { id: 'user123' },
  data: {
    status: 'SUSPENDED',
    suspendedUntil: sanction.expiresAt,
    suspendReason: sanction.reason
  }
})
```

### 관리자 로그 기록

```javascript
await prisma.adminLog.create({
  data: {
    adminId: 'admin456',
    action: 'USER_SUSPEND',
    targetType: 'User',
    targetId: 'user123',
    before: { status: 'ACTIVE' },
    after: { status: 'SUSPENDED' },
    reason: '반복적인 규정 위반',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...'
  }
})
```

---

## 관련 문서

- [User 모델](./models-user.md) - 사용자 관련 모델
- [Study 모델](./models-study.md) - 스터디 관련 모델
- [Content 모델](./models-content.md) - 콘텐츠 관련 모델
- [Enum & Index](./enums-indexes.md) - 열거형 및 인덱스

