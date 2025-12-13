# 👨‍💼 관리자 도메인

## 개요

플랫폼 관리를 위한 관리자 기능입니다. RBAC(Role-Based Access Control) 기반 권한 시스템을 사용합니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 대시보드 | 플랫폼 현황, 통계 |
| 사용자 관리 | 조회, 경고, 정지, 삭제 |
| 스터디 관리 | 조회, 숨김, 종료, 삭제 |
| 신고 관리 | 조회, 할당, 처리, 해결 |
| 분석 | 통계, 차트, 내보내기 |
| 감사 로그 | 관리자 활동 기록 |
| 설정 | 시스템 설정 관리 |

---

## 관리자 역할 (RBAC)

| 역할 | 설명 | 권한 수준 |
|------|------|-----------|
| VIEWER | 조회 전용 | 최소 |
| MODERATOR | 콘텐츠 모더레이션 | 중간 |
| ADMIN | 사용자/스터디 관리 | 높음 |
| SUPER_ADMIN | 모든 권한 | 최고 |

---

## 권한 시스템

### 사용자 관리

| 권한 코드 | 설명 |
|-----------|------|
| `user:view` | 사용자 조회 |
| `user:search` | 사용자 검색 |
| `user:warn` | 경고 발송 |
| `user:suspend` | 계정 정지 |
| `user:unsuspend` | 정지 해제 |
| `user:delete` | 계정 삭제 |

### 스터디 관리

| 권한 코드 | 설명 |
|-----------|------|
| `study:view` | 스터디 조회 |
| `study:hide` | 스터디 숨김 |
| `study:close` | 스터디 종료 |
| `study:delete` | 스터디 삭제 |
| `study:recommend` | 추천 설정 |

### 신고 관리

| 권한 코드 | 설명 |
|-----------|------|
| `report:view` | 신고 조회 |
| `report:assign` | 신고 할당 |
| `report:process` | 신고 처리 |
| `report:resolve` | 신고 해결 |
| `report:reject` | 신고 거부 |

### 시스템

| 권한 코드 | 설명 |
|-----------|------|
| `analytics:view` | 분석 조회 |
| `analytics:export` | 데이터 내보내기 |
| `settings:view` | 설정 조회 |
| `settings:update` | 설정 변경 |
| `audit:view` | 감사 로그 조회 |
| `admin:manage` | 관리자 관리 |

---

## 파일 구조

```
coup/src/
├── app/
│   ├── admin/
│   │   ├── layout.jsx           # 관리자 레이아웃
│   │   ├── page.jsx             # 대시보드
│   │   ├── users/               # 사용자 관리
│   │   ├── studies/             # 스터디 관리
│   │   ├── reports/             # 신고 관리
│   │   ├── analytics/           # 분석
│   │   ├── audit-logs/          # 감사 로그
│   │   └── settings/            # 설정
│   └── api/admin/
│       ├── stats/               # 통계 API
│       ├── users/               # 사용자 API
│       ├── studies/             # 스터디 API
│       ├── reports/             # 신고 API
│       ├── analytics/           # 분석 API
│       ├── audit-logs/          # 감사 로그 API
│       └── settings/            # 설정 API
├── components/admin/
│   ├── common/                  # 공통 컴포넌트
│   │   ├── AdminNavbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── SearchBar.jsx
│   │   ├── FilterPanel.jsx
│   │   └── Breadcrumb.jsx
│   └── ui/                      # UI 컴포넌트
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Stats.jsx
│       └── Toast/
└── lib/
    ├── admin/
    │   ├── auth.js              # 관리자 인증
    │   └── permissions.js       # 권한 시스템
    ├── exceptions/admin/
    │   └── AdminException.js    # 예외 클래스
    ├── logging/
    │   └── adminLogger.js       # 관리자 로깅
    └── utils/
        └── admin-utils.js       # 유틸리티
```

---

## 데이터베이스 모델

### AdminRole 모델

```prisma
model AdminRole {
  id          String    @id @default(cuid())
  userId      String    @unique
  role        AdminRoleType @default(VIEWER)
  permissions Json?     // 커스텀 권한
  grantedBy   String?
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id])
}

enum AdminRoleType {
  VIEWER
  MODERATOR
  ADMIN
  SUPER_ADMIN
}
```

### Warning 모델 (경고)

```prisma
model Warning {
  id          String    @id @default(cuid())
  userId      String
  issuedById  String
  reason      String
  severity    String    // LOW, MEDIUM, HIGH
  createdAt   DateTime  @default(now())

  user        User      @relation("ReceivedWarnings", fields: [userId], references: [id])
  issuedBy    User      @relation("IssuedWarnings", fields: [issuedById], references: [id])
}
```

### Sanction 모델 (제재)

```prisma
model Sanction {
  id          String    @id @default(cuid())
  userId      String
  type        String    // SUSPEND, BAN
  reason      String
  duration    Int?      // 일 단위
  isActive    Boolean   @default(true)
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())

  user        User      @relation(fields: [userId], references: [id])
}
```

---

## 관련 문서

- [API](./api.md)
- [화면](./screens.md)
- [권한](./permissions.md)
- [예외](./exceptions.md)

