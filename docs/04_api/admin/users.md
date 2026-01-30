# 관리자 - 사용자 관리 API

> 사용자 목록 조회, 상세 정보 확인, 제재 관리 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **기본 엔드포인트** | `/api/admin/users` |
| **필요 권한** | `USER_VIEW`, `USER_MANAGE` |

---

## 📚 엔드포인트 목록

| 엔드포인트 | 메서드 | 권한 | 설명 |
|------------|--------|------|------|
| `/api/admin/users` | GET | USER_VIEW | 사용자 목록 조회 |
| `/api/admin/users/[id]` | GET | USER_VIEW | 사용자 상세 조회 |
| `/api/admin/users/[id]` | PATCH | USER_MANAGE | 사용자 정보 수정 |
| `/api/admin/users/[id]` | DELETE | USER_MANAGE | 사용자 삭제 |
| `/api/admin/users/[id]/suspend` | POST | USER_MANAGE | 사용자 정지 |
| `/api/admin/users/[id]/unsuspend` | POST | USER_MANAGE | 정지 해제 |
| `/api/admin/users/[id]/warn` | POST | USER_MANAGE | 경고 발송 |

---

## 📖 사용자 목록 조회

### 요청

```http
GET /api/admin/users?page=1&limit=20&search=홍길동&status=ACTIVE
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 20 | 페이지당 항목 수 |
| `search` | string | - | 이메일, 이름, ID 검색 |
| `status` | string | all | 상태 필터 (ACTIVE, SUSPENDED, DELETED, all) |
| `provider` | string | all | 가입 방식 (CREDENTIALS, GOOGLE, GITHUB, all) |
| `hasWarnings` | boolean | false | 경고 있는 사용자만 |
| `isSuspended` | boolean | false | 정지된 사용자만 |
| `createdFrom` | string | - | 가입일 시작 (ISO 8601) |
| `createdTo` | string | - | 가입일 종료 (ISO 8601) |
| `lastLoginFrom` | string | - | 최근 로그인 시작 |
| `lastLoginTo` | string | - | 최근 로그인 종료 |
| `sortBy` | string | createdAt | 정렬 기준 (createdAt, lastLoginAt, email, name, status) |
| `sortOrder` | string | desc | 정렬 순서 (asc, desc) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-uuid-123",
        "email": "user@example.com",
        "name": "홍길동",
        "avatar": "https://...",
        "status": "ACTIVE",
        "provider": "CREDENTIALS",
        "createdAt": "2026-01-15T09:30:00.000Z",
        "lastLoginAt": "2026-01-30T14:20:00.000Z",
        "_count": {
          "ownedStudies": 3,
          "studyMembers": 5,
          "messages": 150,
          "receivedWarnings": 0,
          "sanctions": 0
        }
      }
    ],
    "pagination": {
      "total": 1250,
      "page": 1,
      "limit": 20,
      "totalPages": 63,
      "hasMore": true
    }
  }
}
```

---

## 📖 사용자 상세 조회

### 요청

```http
GET /api/admin/users/user-uuid-123
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid-123",
      "email": "user@example.com",
      "name": "홍길동",
      "avatar": "https://...",
      "bio": "안녕하세요!",
      "status": "ACTIVE",
      "provider": "CREDENTIALS",
      "createdAt": "2026-01-15T09:30:00.000Z",
      "lastLoginAt": "2026-01-30T14:20:00.000Z",
      "suspendedUntil": null,
      "suspendReason": null,
      "restrictedActions": [],
      "restrictedUntil": null
    },
    "statistics": {
      "ownedStudies": 3,
      "joinedStudies": 5,
      "totalMessages": 150,
      "totalTasks": 25,
      "completedTasks": 20
    },
    "warnings": [
      {
        "id": "warning-id",
        "reason": "부적절한 언어 사용",
        "createdAt": "2026-01-20T10:00:00.000Z",
        "issuedBy": {
          "id": "admin-id",
          "name": "관리자"
        }
      }
    ],
    "sanctions": [
      {
        "id": "sanction-id",
        "type": "RESTRICTION",
        "reason": "스팸 메시지",
        "actions": ["CHAT", "CREATE_STUDY"],
        "startDate": "2026-01-25T00:00:00.000Z",
        "endDate": "2026-02-01T00:00:00.000Z",
        "isActive": true
      }
    ],
    "recentActivity": [
      {
        "type": "STUDY_JOIN",
        "description": "React 스터디에 가입",
        "createdAt": "2026-01-28T15:30:00.000Z"
      }
    ]
  }
}
```

---

## ✏️ 사용자 정보 수정

### 요청

```http
PATCH /api/admin/users/user-uuid-123
Content-Type: application/json

{
  "name": "새 이름",
  "status": "ACTIVE"
}
```

### 수정 가능 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `name` | string | 사용자 이름 |
| `status` | string | 계정 상태 (ACTIVE, SUSPENDED, DELETED) |
| `bio` | string | 자기소개 |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "사용자 정보가 수정되었습니다",
  "data": {
    "id": "user-uuid-123",
    "name": "새 이름",
    "status": "ACTIVE"
  }
}
```

---

## 🚫 사용자 정지

### 요청

```http
POST /api/admin/users/user-uuid-123/suspend
Content-Type: application/json

{
  "reason": "커뮤니티 가이드라인 위반",
  "duration": 7,
  "unit": "days"
}
```

### 요청 본문

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `reason` | string | ✅ | 정지 사유 |
| `duration` | number | ❌ | 정지 기간 (null이면 영구 정지) |
| `unit` | string | ❌ | 기간 단위 (hours, days, weeks, months) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "사용자가 정지되었습니다",
  "data": {
    "userId": "user-uuid-123",
    "status": "SUSPENDED",
    "suspendedUntil": "2026-02-07T00:00:00.000Z",
    "suspendReason": "커뮤니티 가이드라인 위반"
  }
}
```

---

## ✅ 정지 해제

### 요청

```http
POST /api/admin/users/user-uuid-123/unsuspend
Content-Type: application/json

{
  "reason": "정지 기간 만료"
}
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "사용자 정지가 해제되었습니다",
  "data": {
    "userId": "user-uuid-123",
    "status": "ACTIVE"
  }
}
```

---

## ⚠️ 경고 발송

### 요청

```http
POST /api/admin/users/user-uuid-123/warn
Content-Type: application/json

{
  "reason": "부적절한 언어 사용",
  "severity": "MEDIUM"
}
```

### 요청 본문

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `reason` | string | ✅ | 경고 사유 |
| `severity` | string | ❌ | 심각도 (LOW, MEDIUM, HIGH) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "경고가 발송되었습니다",
  "data": {
    "warningId": "warning-uuid",
    "userId": "user-uuid-123",
    "totalWarnings": 2
  }
}
```

---

## 🗑️ 사용자 삭제

### 요청

```http
DELETE /api/admin/users/user-uuid-123
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "사용자가 삭제되었습니다"
}
```

### 주의사항

- 실제 삭제가 아닌 소프트 삭제 (status를 DELETED로 변경)
- 삭제된 사용자는 로그인 불가
- 관련 데이터는 유지됨

---

## 🔗 관련 문서

- [User 모델](../../03_database/models/user.md)
- [Warning 모델](../../03_database/models/admin.md)
- [Sanction 모델](../../03_database/models/admin.md)
