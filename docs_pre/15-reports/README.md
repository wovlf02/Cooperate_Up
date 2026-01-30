# 🚨 신고 도메인

## 개요

플랫폼 내 부적절한 콘텐츠나 사용자를 신고하고 처리하는 시스템입니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 신고 접수 | 사용자, 스터디, 메시지 신고 |
| 신고 조회 | 필터링, 검색, 페이지네이션 |
| 신고 할당 | 담당자 할당 |
| 신고 처리 | 승인, 거부, 보류 |
| 연계 액션 | 경고, 정지, 삭제 |

---

## 신고 유형

### 대상 유형 (TargetType)

| 유형 | 설명 |
|------|------|
| USER | 사용자 신고 |
| STUDY | 스터디 신고 |
| MESSAGE | 메시지 신고 |

### 신고 사유 (ReportType)

| 유형 | 설명 |
|------|------|
| SPAM | 스팸 |
| HARASSMENT | 괴롭힘/욕설 |
| INAPPROPRIATE | 부적절한 콘텐츠 |
| COPYRIGHT | 저작권 침해 |
| OTHER | 기타 |

### 상태 (ReportStatus)

| 상태 | 설명 |
|------|------|
| PENDING | 대기 중 |
| IN_PROGRESS | 처리 중 |
| RESOLVED | 해결됨 |
| REJECTED | 거부됨 |

### 우선순위 (Priority)

| 우선순위 | 설명 |
|----------|------|
| LOW | 낮음 |
| MEDIUM | 보통 |
| HIGH | 높음 |
| URGENT | 긴급 |

---

## 데이터베이스 모델

### Report 모델

```prisma
model Report {
  id         String       @id @default(cuid())
  reporterId String
  targetType TargetType
  targetId   String
  targetName String?      // 신고 대상 이름 (캐시)
  type       ReportType
  reason     String       @db.Text
  evidence   Json?        // 증거 자료

  status     ReportStatus @default(PENDING)
  priority   Priority     @default(MEDIUM)

  // 처리
  processedBy String?
  processedAt DateTime?
  resolution  String?     @db.Text

  createdAt  DateTime     @default(now())

  reporter   User         @relation(fields: [reporterId], references: [id])

  @@index([status, priority, createdAt])
  @@index([targetType, targetId])
}
```

---

## API 엔드포인트

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/reports` | 신고 목록 | `report:view` |
| GET | `/api/admin/reports/[id]` | 신고 상세 | `report:view` |
| POST | `/api/admin/reports/[id]/assign` | 담당자 할당 | `report:assign` |
| POST | `/api/admin/reports/[id]/process` | 신고 처리 | `report:resolve` |

---

## 처리 워크플로우

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PENDING   │────▶│ IN_PROGRESS │────▶│  RESOLVED   │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                   
      │                    │            ┌─────────────┐
      └────────────────────┴───────────▶│  REJECTED   │
                                        └─────────────┘
```

### 처리 액션

| 액션 | 설명 | 결과 상태 |
|------|------|-----------|
| approve | 승인 | RESOLVED |
| reject | 거부 | REJECTED |
| hold | 보류 | PENDING |

### 연계 액션 (승인 시)

| 연계 액션 | 설명 |
|-----------|------|
| warn_user | 사용자 경고 |
| suspend_user | 사용자 정지 |
| delete_content | 콘텐츠 삭제 |
| none | 액션 없음 |

---

## 파일 구조

```
coup/src/
├── app/
│   ├── admin/reports/
│   │   ├── page.jsx              # 신고 목록 화면
│   │   ├── page.module.css
│   │   ├── [reportId]/
│   │   │   ├── page.jsx          # 신고 상세 화면
│   │   │   └── _components/
│   │   │       ├── ReportActions.jsx
│   │   │       └── ReportProcessModal.jsx
│   │   └── _components/
│   │       ├── ReportList.jsx
│   │       ├── ReportFilters.jsx
│   │       └── ReportColumns.jsx
│   └── api/admin/reports/
│       ├── route.js              # GET(목록)
│       └── [reportId]/
│           ├── route.js          # GET(상세)
│           ├── assign/route.js   # POST(할당)
│           └── process/route.js  # POST(처리)
└── lib/
    └── exceptions/admin/
        └── AdminException.js     # AdminReportException
```

---

## 관련 문서

- [API](./api.md)
- [화면](./screens.md)

