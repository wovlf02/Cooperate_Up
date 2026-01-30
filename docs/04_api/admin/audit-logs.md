# 관리자 - 감사 로그 API

> 관리자 활동 로그 조회 및 내보내기 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **기본 엔드포인트** | `/api/admin/audit-logs` |
| **필요 권한** | `AUDIT_VIEW` |

---

## 📚 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/admin/audit-logs` | GET | 감사 로그 목록 조회 |
| `/api/admin/audit-logs/export` | GET | 감사 로그 내보내기 |

---

## 📖 감사 로그 목록 조회

### 요청

```http
GET /api/admin/audit-logs?page=1&limit=20&action=USER_*
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 20 | 페이지당 항목 수 |
| `adminId` | string | - | 관리자 ID 필터 |
| `action` | string | - | 작업 유형 필터 (와일드카드 지원: `USER_*`) |
| `targetType` | string | - | 대상 유형 필터 |
| `startDate` | string | - | 시작일 (ISO 8601) |
| `endDate` | string | - | 종료일 (ISO 8601) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-uuid-123",
        "action": "USER_SUSPENDED",
        "targetType": "USER",
        "targetId": "user-uuid-456",
        "details": {
          "reason": "커뮤니티 가이드라인 위반",
          "duration": 7,
          "unit": "days"
        },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2026-01-30T10:00:00.000Z",
        "admin": {
          "id": "admin-uuid",
          "name": "관리자",
          "email": "admin@example.com",
          "avatar": "https://..."
        }
      }
    ],
    "admins": [
      {
        "id": "admin-uuid",
        "name": "관리자",
        "email": "admin@example.com"
      }
    ],
    "pagination": {
      "total": 500,
      "page": 1,
      "limit": 20,
      "totalPages": 25,
      "hasMore": true
    }
  }
}
```

---

## 📥 감사 로그 내보내기

### 요청

```http
GET /api/admin/audit-logs/export?format=csv&startDate=2026-01-01&endDate=2026-01-31
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `format` | string | csv | 내보내기 형식 (csv, json) |
| `adminId` | string | - | 관리자 ID 필터 |
| `action` | string | - | 작업 유형 필터 |
| `targetType` | string | - | 대상 유형 필터 |
| `startDate` | string | - | 시작일 (ISO 8601) |
| `endDate` | string | - | 종료일 (ISO 8601) |

### 성공 응답 (200 OK)

CSV 형식:
```csv
id,action,targetType,targetId,adminId,adminEmail,details,createdAt
log-uuid-123,USER_SUSPENDED,USER,user-uuid-456,admin-uuid,admin@example.com,"{...}",2026-01-30T10:00:00.000Z
```

JSON 형식:
```json
{
  "success": true,
  "data": {
    "logs": [...],
    "exportedAt": "2026-01-31T12:00:00.000Z",
    "totalRecords": 150
  }
}
```

---

## 📊 작업 유형 (Actions)

### 사용자 관련

| 작업 | 설명 |
|------|------|
| `USER_VIEW` | 사용자 정보 조회 |
| `USER_UPDATE` | 사용자 정보 수정 |
| `USER_SUSPENDED` | 사용자 정지 |
| `USER_UNSUSPENDED` | 정지 해제 |
| `USER_WARNED` | 경고 발송 |
| `USER_DELETED` | 사용자 삭제 |
| `USER_RESTRICTED` | 활동 제한 |

### 스터디 관련

| 작업 | 설명 |
|------|------|
| `STUDY_VIEW` | 스터디 정보 조회 |
| `STUDY_UPDATE` | 스터디 정보 수정 |
| `STUDY_DELETED` | 스터디 삭제 |

### 신고 관련

| 작업 | 설명 |
|------|------|
| `REPORT_VIEW` | 신고 조회 |
| `REPORT_PROCESSED` | 신고 처리 |
| `REPORT_ASSIGNED` | 신고 담당자 지정 |

### 설정 관련

| 작업 | 설명 |
|------|------|
| `SETTINGS_VIEW` | 설정 조회 |
| `SETTINGS_UPDATE` | 설정 변경 |
| `CACHE_CLEARED` | 캐시 초기화 |

### 기타

| 작업 | 설명 |
|------|------|
| `ADMIN_LOGIN` | 관리자 로그인 |
| `ADMIN_LOGOUT` | 관리자 로그아웃 |
| `EXPORT_REQUESTED` | 데이터 내보내기 요청 |

---

## 📊 대상 유형 (Target Types)

| 유형 | 설명 |
|------|------|
| `USER` | 사용자 |
| `STUDY` | 스터디 |
| `REPORT` | 신고 |
| `SETTINGS` | 시스템 설정 |
| `MESSAGE` | 메시지 |
| `FILE` | 파일 |

---

## 🔍 와일드카드 검색

`action` 파라미터에서 와일드카드를 사용할 수 있습니다:

| 패턴 | 설명 | 예시 |
|------|------|------|
| `USER_*` | USER로 시작하는 모든 작업 | USER_VIEW, USER_UPDATE, USER_SUSPENDED 등 |
| `STUDY_*` | STUDY로 시작하는 모든 작업 | STUDY_VIEW, STUDY_UPDATE, STUDY_DELETED 등 |
| `REPORT_*` | REPORT로 시작하는 모든 작업 | REPORT_VIEW, REPORT_PROCESSED 등 |

---

## 💡 사용 예시

### 특정 관리자의 최근 활동 조회

```http
GET /api/admin/audit-logs?adminId=admin-uuid&limit=50
```

### 사용자 제재 관련 로그만 조회

```http
GET /api/admin/audit-logs?action=USER_SUSPENDED&action=USER_WARNED
```

### 특정 기간의 모든 로그 내보내기

```http
GET /api/admin/audit-logs/export?format=csv&startDate=2026-01-01&endDate=2026-01-31
```

---

## ⚠️ 주의사항

1. **보안**: 감사 로그는 민감한 정보를 포함할 수 있으므로 `AUDIT_VIEW` 권한이 필요합니다.
2. **데이터 보존**: 감사 로그는 삭제할 수 없으며 무기한 보존됩니다.
3. **성능**: 대량의 로그 내보내기 시 시간이 소요될 수 있습니다.

---

## 🔗 관련 문서

- [AdminLog 모델](../../03_database/models/admin.md)
- [관리자 감사 로그 페이지](../../05_pages/admin/audit-logs.md)
