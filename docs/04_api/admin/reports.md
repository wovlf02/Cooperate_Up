# 관리자 - 신고 관리 API

> 사용자 신고 조회 및 처리 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **기본 엔드포인트** | `/api/admin/reports` |
| **필요 권한** | `REPORT_VIEW`, `REPORT_MANAGE` |

---

## 📚 엔드포인트 목록

| 엔드포인트 | 메서드 | 권한 | 설명 |
|------------|--------|------|------|
| `/api/admin/reports` | GET | REPORT_VIEW | 신고 목록 조회 |
| `/api/admin/reports/[reportId]` | GET | REPORT_VIEW | 신고 상세 조회 |
| `/api/admin/reports/[reportId]` | PATCH | REPORT_MANAGE | 신고 처리 |

---

## 📖 신고 목록 조회

### 요청

```http
GET /api/admin/reports?page=1&limit=20&status=PENDING&priority=URGENT
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 20 | 페이지당 항목 수 |
| `search` | string | - | 사유, 대상명, 신고자 검색 |
| `status` | string | all | 상태 (PENDING, IN_PROGRESS, RESOLVED, REJECTED, all) |
| `type` | string | all | 신고 유형 |
| `priority` | string | all | 우선순위 (LOW, MEDIUM, HIGH, URGENT, all) |
| `targetType` | string | all | 대상 유형 (USER, STUDY, MESSAGE, all) |
| `assignedTo` | string | all | 담당자 (me, unassigned, [adminId], all) |
| `createdFrom` | string | - | 접수일 시작 (ISO 8601) |
| `createdTo` | string | - | 접수일 종료 (ISO 8601) |
| `sortBy` | string | createdAt | 정렬 기준 (createdAt, updatedAt, priority, status) |
| `sortOrder` | string | desc | 정렬 순서 (asc, desc) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report-uuid-123",
        "type": "HARASSMENT",
        "reason": "부적절한 메시지 발송",
        "description": "욕설 및 비하 발언이 포함된 메시지를 지속적으로 보냄",
        "status": "PENDING",
        "priority": "HIGH",
        "targetType": "USER",
        "targetId": "user-uuid-456",
        "targetName": "홍길동",
        "createdAt": "2026-01-30T10:00:00.000Z",
        "updatedAt": "2026-01-30T10:00:00.000Z",
        "reporter": {
          "id": "user-uuid-789",
          "name": "김철수",
          "email": "kim@example.com",
          "avatar": "https://...",
          "status": "ACTIVE"
        },
        "processor": null
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8,
      "hasMore": true
    }
  }
}
```

---

## 📖 신고 상세 조회

### 요청

```http
GET /api/admin/reports/report-uuid-123
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "report": {
      "id": "report-uuid-123",
      "type": "HARASSMENT",
      "reason": "부적절한 메시지 발송",
      "description": "욕설 및 비하 발언이 포함된 메시지를 지속적으로 보냄",
      "evidence": "채팅 캡처 이미지 첨부",
      "status": "PENDING",
      "priority": "HIGH",
      "targetType": "USER",
      "targetId": "user-uuid-456",
      "targetName": "홍길동",
      "createdAt": "2026-01-30T10:00:00.000Z",
      "updatedAt": "2026-01-30T10:00:00.000Z",
      "processedAt": null,
      "resolution": null,
      "adminNote": null
    },
    "reporter": {
      "id": "user-uuid-789",
      "name": "김철수",
      "email": "kim@example.com",
      "avatar": "https://...",
      "status": "ACTIVE",
      "reportCount": 5
    },
    "target": {
      "id": "user-uuid-456",
      "name": "홍길동",
      "email": "hong@example.com",
      "avatar": "https://...",
      "status": "ACTIVE",
      "warningCount": 2,
      "previousReports": 3
    },
    "relatedContent": {
      "messages": [
        {
          "id": "message-uuid",
          "content": "[신고된 메시지 내용]",
          "createdAt": "2026-01-29T15:30:00.000Z"
        }
      ]
    },
    "history": [
      {
        "action": "CREATED",
        "description": "신고 접수",
        "createdAt": "2026-01-30T10:00:00.000Z",
        "by": null
      }
    ]
  }
}
```

---

## ✏️ 신고 처리

### 요청

```http
PATCH /api/admin/reports/report-uuid-123
Content-Type: application/json

{
  "status": "RESOLVED",
  "resolution": "WARNING_ISSUED",
  "adminNote": "경고 발송 완료. 재발 시 정지 예정.",
  "actions": [
    {
      "type": "WARN",
      "targetId": "user-uuid-456",
      "reason": "부적절한 메시지 발송"
    }
  ]
}
```

### 요청 본문

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `status` | string | ✅ | 새 상태 |
| `resolution` | string | ❌ | 해결 방법 (상태가 RESOLVED인 경우 필수) |
| `adminNote` | string | ❌ | 관리자 메모 |
| `actions` | array | ❌ | 수행할 조치 목록 |
| `priority` | string | ❌ | 우선순위 변경 |

### 상태 값

| 상태 | 설명 |
|------|------|
| `PENDING` | 대기 중 |
| `IN_PROGRESS` | 처리 중 |
| `RESOLVED` | 해결됨 |
| `REJECTED` | 기각됨 |

### 해결 방법 (Resolution)

| 값 | 설명 |
|-----|------|
| `WARNING_ISSUED` | 경고 발송 |
| `USER_SUSPENDED` | 사용자 정지 |
| `CONTENT_REMOVED` | 콘텐츠 삭제 |
| `NO_ACTION_NEEDED` | 조치 불필요 |
| `FALSE_REPORT` | 허위 신고 |
| `DUPLICATE` | 중복 신고 |

### 조치 유형 (Actions)

| 타입 | 설명 |
|------|------|
| `WARN` | 경고 발송 |
| `SUSPEND` | 계정 정지 |
| `RESTRICT` | 활동 제한 |
| `DELETE_CONTENT` | 콘텐츠 삭제 |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "신고가 처리되었습니다",
  "data": {
    "reportId": "report-uuid-123",
    "status": "RESOLVED",
    "resolution": "WARNING_ISSUED",
    "processedAt": "2026-01-30T12:00:00.000Z",
    "processedBy": {
      "id": "admin-id",
      "name": "관리자"
    },
    "actionsPerformed": [
      {
        "type": "WARN",
        "targetId": "user-uuid-456",
        "success": true
      }
    ]
  }
}
```

---

## 📊 신고 유형

| 유형 | 설명 |
|------|------|
| `SPAM` | 스팸 |
| `HARASSMENT` | 괴롭힘 |
| `HATE_SPEECH` | 혐오 발언 |
| `INAPPROPRIATE_CONTENT` | 부적절한 콘텐츠 |
| `IMPERSONATION` | 사칭 |
| `SCAM` | 사기 |
| `OTHER` | 기타 |

## 📊 우선순위

| 우선순위 | 설명 | 처리 권장 시간 |
|----------|------|----------------|
| `LOW` | 낮음 | 7일 이내 |
| `MEDIUM` | 보통 | 3일 이내 |
| `HIGH` | 높음 | 24시간 이내 |
| `URGENT` | 긴급 | 즉시 처리 |

---

## 🔗 관련 문서

- [Report 모델](../../03_database/models/admin.md)
- [사용자 관리 API](./users.md)
- [관리자 신고 페이지](../../05_pages/admin/reports.md)
