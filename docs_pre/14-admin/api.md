# 🔌 관리자 API 문서

## 개요

관리자 API는 `/api/admin` 경로 아래에 구성되어 있습니다. 모든 API는 관리자 인증이 필요합니다.

---

## API 구조

```
/api/admin/
├── stats/                   # 통계
│   └── route.js
├── users/                   # 사용자 관리
│   ├── route.js            # GET: 목록
│   └── [id]/
│       ├── route.js        # GET: 상세, DELETE: 삭제
│       ├── suspend/        # POST: 정지
│       └── activate/       # POST: 활성화
├── studies/                 # 스터디 관리
│   ├── route.js            # GET: 목록
│   └── [studyId]/
│       ├── route.js        # GET: 상세
│       ├── hide/           # POST: 숨김, DELETE: 해제
│       ├── close/          # POST: 종료, DELETE: 재개
│       └── delete/         # DELETE: 삭제
├── reports/                 # 신고 관리
│   ├── route.js            # GET: 목록
│   └── [reportId]/
│       ├── route.js        # GET: 상세
│       ├── assign/         # POST: 담당자 배정
│       └── process/        # POST: 처리
├── analytics/               # 분석
│   ├── overview/           # 전체 통계
│   ├── users/              # 사용자 분석
│   └── studies/            # 스터디 분석
├── audit-logs/              # 감사 로그
│   ├── route.js            # GET: 목록
│   └── export/             # GET: 내보내기
└── settings/                # 설정
    ├── route.js            # GET: 조회, PUT: 업데이트
    ├── history/            # 변경 이력
    └── cache/
        └── clear/          # POST: 캐시 초기화
```

---

## 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "error": "에러 메시지",
  "code": "ERROR_CODE"
}
```

### HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 500 | 서버 에러 |

---

## 통계 API

### `GET /api/admin/stats`

대시보드 통계 조회

**권한**: `ANALYTICS_VIEW`

**응답**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "users": {
        "total": 1234,
        "active": 1100,
        "suspended": 34,
        "newToday": 12,
        "newThisWeek": 56
      },
      "studies": {
        "total": 456,
        "active": 320,
        "newToday": 5,
        "newThisWeek": 23
      },
      "reports": {
        "total": 89,
        "pending": 12,
        "urgent": 2,
        "newToday": 3
      },
      "moderation": {
        "totalWarnings": 45,
        "warningsToday": 2,
        "activeSanctions": 8
      }
    },
    "recentActivity": {
      "users": [...],
      "reports": [...],
      "warnings": [...]
    },
    "trends": {
      "userGrowth": [...],
      "reportTrends": [...]
    }
  }
}
```

---

## 사용자 관리 API

### `GET /api/admin/users`

사용자 목록 조회

**권한**: `USER_VIEW`

**쿼리 파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `page` | number | 페이지 번호 (기본: 1) |
| `limit` | number | 페이지당 개수 (기본: 20) |
| `search` | string | 검색어 (이메일, 이름) |
| `status` | string | 상태 필터 |
| `provider` | string | 가입 방식 필터 |
| `hasWarnings` | boolean | 경고 있는 사용자만 |
| `sortBy` | string | 정렬 필드 |
| `sortOrder` | string | 정렬 방향 (asc/desc) |

---

### `GET /api/admin/users/[id]`

사용자 상세 조회

**권한**: `USER_VIEW`

---

### `POST /api/admin/users/[id]/suspend`

사용자 정지

**권한**: `USER_SUSPEND`

**요청**:
```json
{
  "reason": "정지 사유",
  "duration": null  // null이면 영구 정지
}
```

---

### `POST /api/admin/users/[id]/activate`

사용자 활성화 (정지 해제)

**권한**: `USER_UNSUSPEND`

---

### `DELETE /api/admin/users/[id]`

사용자 삭제

**권한**: `USER_DELETE`

---

## 스터디 관리 API

### `GET /api/admin/studies`

스터디 목록 조회

**권한**: `STUDY_VIEW`

**쿼리 파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `search` | string | 검색어 |
| `category` | string | 카테고리 필터 |
| `isPublic` | boolean | 공개 여부 |
| `isRecruiting` | boolean | 모집 중 여부 |

---

### `GET /api/admin/studies/[studyId]`

스터디 상세 조회

**권한**: `STUDY_VIEW`

---

### `POST /api/admin/studies/[studyId]/hide`

스터디 숨김

**권한**: `STUDY_HIDE`

**요청**:
```json
{
  "reason": "숨김 사유 (10자 이상)",
  "notifyOwner": true,
  "notifyMembers": false
}
```

---

### `DELETE /api/admin/studies/[studyId]/hide`

스터디 숨김 해제

**권한**: `STUDY_HIDE`

---

### `POST /api/admin/studies/[studyId]/close`

스터디 종료

**권한**: `STUDY_CLOSE`

**요청**:
```json
{
  "reason": "종료 사유 (10자 이상)",
  "notifyOwner": true,
  "notifyMembers": false
}
```

---

### `DELETE /api/admin/studies/[studyId]/close`

스터디 재개

**권한**: `STUDY_CLOSE`

---

### `DELETE /api/admin/studies/[studyId]/delete`

스터디 삭제 (영구)

**권한**: `STUDY_DELETE`

**요청**:
```json
{
  "reason": "삭제 사유 (10자 이상)"
}
```

---

## 신고 관리 API

### `GET /api/admin/reports`

신고 목록 조회

**권한**: `REPORT_VIEW`

**쿼리 파라미터**:
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `status` | string | 상태 필터 |
| `type` | string | 신고 유형 |
| `priority` | string | 우선순위 |
| `targetType` | string | 대상 유형 |
| `assignedTo` | string | 담당자 (`me`, `unassigned`) |

---

### `GET /api/admin/reports/[reportId]`

신고 상세 조회

**권한**: `REPORT_VIEW`

---

### `POST /api/admin/reports/[reportId]/assign`

담당자 배정

**권한**: `REPORT_ASSIGN`

**요청**:
```json
{
  "autoAssign": false  // true면 자동 배정, false면 자신에게 배정
}
```

---

### `POST /api/admin/reports/[reportId]/process`

신고 처리

**권한**: `REPORT_PROCESS`

**요청**:
```json
{
  "action": "approve",  // approve, reject, hold
  "resolution": "처리 사유",
  "linkedAction": "warn_user",  // none, warn_user, suspend_user, etc.
  "linkedActionDetails": {
    "severity": "NORMAL",
    "duration": "7d"
  }
}
```

---

## 분석 API

### `GET /api/admin/analytics/overview`

전체 통계 개요

**권한**: `ANALYTICS_VIEW`

---

### `GET /api/admin/analytics/users`

사용자 분석

**권한**: `ANALYTICS_VIEW`

**쿼리 파라미터**:
| 파라미터 | 기본값 | 설명 |
|----------|--------|------|
| `period` | daily | 집계 단위 (daily/weekly/monthly) |
| `range` | 30 | 기간 (일) |

---

### `GET /api/admin/analytics/studies`

스터디 분석

**권한**: `ANALYTICS_VIEW`

---

## 감사 로그 API

### `GET /api/admin/audit-logs`

감사 로그 목록

**권한**: `AUDIT_VIEW`

**쿼리 파라미터**:
| 파라미터 | 설명 |
|----------|------|
| `adminId` | 관리자 필터 |
| `action` | 액션 타입 필터 |
| `targetType` | 대상 타입 필터 |
| `startDate` | 시작 날짜 |
| `endDate` | 종료 날짜 |

---

### `GET /api/admin/audit-logs/export`

CSV 내보내기

**권한**: `AUDIT_EXPORT`

---

## 설정 API

### `GET /api/admin/settings`

설정 조회

**권한**: `SETTINGS_VIEW`

---

### `PUT /api/admin/settings`

설정 업데이트

**권한**: `SETTINGS_UPDATE`

**요청**:
```json
{
  "settings": [
    { "key": "site_name", "value": "CoUp" },
    { "key": "maintenance_mode", "value": true }
  ]
}
```

---

### `GET /api/admin/settings/history`

설정 변경 이력

**권한**: `SETTINGS_VIEW`

---

### `POST /api/admin/settings/cache/clear`

캐시 초기화

**권한**: `SETTINGS_UPDATE`

---

## 에러 코드

| 코드 | 설명 |
|------|------|
| `UNAUTHORIZED` | 인증 필요 |
| `FORBIDDEN` | 권한 없음 |
| `NOT_FOUND` | 리소스 없음 |
| `VALIDATION_ERROR` | 유효성 검사 실패 |
| `DATABASE_ERROR` | DB 에러 |
| `INTERNAL_ERROR` | 서버 내부 에러 |

