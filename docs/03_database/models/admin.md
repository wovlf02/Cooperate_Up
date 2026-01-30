# 🛡️ Admin (관리자) 모델

## 📋 개요

관리자 시스템은 신고 처리, 경고/제재, 활동 로그, 권한 관리를 담당합니다. 다음 모델들로 구성됩니다:

- **Report**: 사용자 신고
- **Warning**: 경고
- **Sanction**: 제재 이력
- **AdminLog**: 관리자 활동 로그
- **AdminRole**: 관리자 역할 및 권한

---

## 📊 스키마 정의

### Report (신고)

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

  processedBy String?
  processedAt DateTime?
  resolution  String?   @db.Text

  createdAt DateTime @default(now())

  reporter User @relation(fields: [reporterId], references: [id])

  @@index([status, priority, createdAt])
  @@index([targetType, targetId])
}
```

### Warning (경고)

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
}
```

### Sanction (제재)

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

### AdminLog (관리자 활동 로그)

```prisma
model AdminLog {
  id         String      @id @default(cuid())
  adminId    String
  action     AdminAction
  targetType String?
  targetId   String?

  before Json?
  after  Json?
  reason String? @db.Text

  ipAddress String?
  userAgent String?

  createdAt DateTime @default(now())

  admin User @relation("AdminActions", fields: [adminId], references: [id])

  @@index([adminId, createdAt])
  @@index([action, createdAt])
  @@index([targetType, targetId])
}
```

### AdminRole (관리자 역할)

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

---

## 📌 Enum 타입

### TargetType (신고 대상 유형)

| 값 | 설명 |
|----|------|
| `USER` | 사용자 |
| `STUDY` | 스터디 |
| `MESSAGE` | 메시지 |

### ReportType (신고 유형)

| 값 | 설명 |
|----|------|
| `SPAM` | 스팸 |
| `HARASSMENT` | 괴롭힘 |
| `INAPPROPRIATE` | 부적절한 콘텐츠 |
| `COPYRIGHT` | 저작권 침해 |
| `OTHER` | 기타 |

### ReportStatus (신고 상태)

| 값 | 설명 |
|----|------|
| `PENDING` | 대기 중 |
| `IN_PROGRESS` | 처리 중 |
| `RESOLVED` | 해결됨 |
| `REJECTED` | 기각됨 |

### WarningSeverity (경고 심각도)

| 값 | 설명 | 점수 |
|----|------|------|
| `MINOR` | 경미한 위반 | 1점 |
| `NORMAL` | 일반 위반 | 2점 |
| `SERIOUS` | 심각한 위반 | 3점 |
| `CRITICAL` | 치명적 위반 | 5점 |

### SanctionType (제재 유형)

| 값 | 설명 |
|----|------|
| `WARNING` | 경고 |
| `CHAT_BAN` | 채팅 금지 |
| `STUDY_CREATE_BAN` | 스터디 생성 금지 |
| `FILE_UPLOAD_BAN` | 파일 업로드 금지 |
| `RESTRICTION` | 활동 제한 |
| `SUSPENSION` | 계정 정지 |
| `PERMANENT_BAN` | 영구 정지 |

### AdminRoleType (관리자 역할)

| 값 | 설명 | 권한 |
|----|------|------|
| `VIEWER` | 뷰어 | 조회만 가능 |
| `MODERATOR` | 모더레이터 | 콘텐츠 모더레이션 |
| `ADMIN` | 관리자 | 사용자/스터디 관리 |
| `SUPER_ADMIN` | 슈퍼 관리자 | 모든 권한 |

### AdminAction (관리자 액션)

| 카테고리 | 액션 |
|----------|------|
| 사용자 관리 | `USER_VIEW`, `USER_WARN`, `USER_SUSPEND`, `USER_UNSUSPEND`, `USER_DELETE` |
| 스터디 관리 | `STUDY_VIEW`, `STUDY_HIDE`, `STUDY_CLOSE`, `STUDY_DELETE` |
| 신고 처리 | `REPORT_VIEW`, `REPORT_RESOLVE`, `REPORT_REJECT` |
| 시스템 | `SETTINGS_UPDATE`, `ANALYTICS_VIEW`, `AUDIT_VIEW` |

---

## 💡 사용 예시

### 신고 접수
```javascript
const report = await prisma.report.create({
  data: {
    reporterId: userId,
    targetType: 'USER',
    targetId: 'target-user-id',
    targetName: '악성 사용자',
    type: 'HARASSMENT',
    reason: '반복적인 욕설과 비방',
    priority: 'HIGH'
  }
});
```

### 경고 부여
```javascript
const warning = await prisma.warning.create({
  data: {
    userId: 'target-user-id',
    adminId: adminId,
    reason: '커뮤니티 가이드라인 위반',
    severity: 'NORMAL',
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90일
  }
});

// 관리자 로그 기록
await prisma.adminLog.create({
  data: {
    adminId: adminId,
    action: 'USER_WARN',
    targetType: 'User',
    targetId: 'target-user-id',
    reason: '커뮤니티 가이드라인 위반'
  }
});
```

### 계정 정지
```javascript
await prisma.$transaction([
  // 제재 기록
  prisma.sanction.create({
    data: {
      userId: 'target-user-id',
      adminId: adminId,
      type: 'SUSPENSION',
      reason: '심각한 규정 위반',
      duration: '7d',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  }),
  // 사용자 상태 변경
  prisma.user.update({
    where: { id: 'target-user-id' },
    data: {
      status: 'SUSPENDED',
      suspendedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      suspendReason: '심각한 규정 위반'
    }
  })
]);
```

### 대기 중인 신고 목록
```javascript
const pendingReports = await prisma.report.findMany({
  where: { status: 'PENDING' },
  include: {
    reporter: { select: { name: true, email: true } }
  },
  orderBy: [
    { priority: 'desc' },
    { createdAt: 'asc' }
  ]
});
```

### 관리자 활동 로그 조회
```javascript
const logs = await prisma.adminLog.findMany({
  where: {
    adminId: 'admin-id',
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 최근 7일
    }
  },
  include: {
    admin: { select: { name: true } }
  },
  orderBy: { createdAt: 'desc' }
});
```

---

## 🔗 관련 문서

- [사용자 모델](./user.md)
- [관리자 API](../../04_api/admin/README.md)
- [시스템 설정 모델](./settings.md)
