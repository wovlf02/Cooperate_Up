# 📡 알림 API

## 개요

알림 CRUD 및 읽음 처리 API입니다.

---

## API 엔드포인트 목록

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/notifications` | 알림 목록 조회 |
| POST | `/api/notifications` | 알림 생성 (시스템) |
| GET | `/api/notifications/[id]` | 알림 상세 조회 |
| DELETE | `/api/notifications/[id]` | 알림 삭제 |
| POST | `/api/notifications/[id]/read` | 읽음 처리 |
| POST | `/api/notifications/mark-all-read` | 전체 읽음 |
| GET | `/api/notifications/count` | 미읽 개수 |
| DELETE | `/api/notifications/bulk` | 대량 삭제 |

---

## GET /api/notifications

알림 목록을 조회합니다.

### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 항목 (최대 100) |
| isRead | boolean | - | 읽음 필터 |
| type | string | - | 알림 타입 필터 |

### 응답 예시

```json
{
  "success": true,
  "data": [
    {
      "id": "notif-uuid-1",
      "type": "JOIN_APPROVED",
      "message": "알고리즘 스터디에 가입되었습니다.",
      "studyId": "study-uuid-1",
      "studyName": "알고리즘 스터디",
      "studyEmoji": "📚",
      "data": null,
      "isRead": false,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## POST /api/notifications

새 알림을 생성합니다 (내부 시스템용).

### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| userId | string | ✓ | 수신자 ID |
| type | string | ✓ | 알림 타입 |
| message | string | ✓ | 알림 메시지 |
| studyId | string | X | 스터디 ID |
| studyName | string | X | 스터디 이름 |
| studyEmoji | string | X | 스터디 이모지 |
| data | object | X | 추가 데이터 |

### 요청 예시

```json
{
  "userId": "user-uuid-1",
  "type": "JOIN_APPROVED",
  "message": "알고리즘 스터디에 가입되었습니다.",
  "studyId": "study-uuid-1",
  "studyName": "알고리즘 스터디",
  "studyEmoji": "📚"
}
```

### 응답 예시

```json
{
  "success": true,
  "message": "알림이 생성되었습니다.",
  "data": {
    "id": "notif-uuid-1",
    "type": "JOIN_APPROVED",
    "...": "..."
  }
}
```

---

## GET /api/notifications/[id]

특정 알림을 조회합니다.

### 응답 예시

```json
{
  "success": true,
  "data": {
    "id": "notif-uuid-1",
    "type": "JOIN_APPROVED",
    "message": "알고리즘 스터디에 가입되었습니다.",
    "isRead": false,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

---

## DELETE /api/notifications/[id]

특정 알림을 삭제합니다.

### 응답 예시

```json
{
  "success": true,
  "message": "알림이 삭제되었습니다.",
  "data": {
    "id": "notif-uuid-1"
  }
}
```

---

## POST /api/notifications/[id]/read

특정 알림을 읽음 처리합니다.

### 응답 예시

```json
{
  "success": true,
  "message": "알림을 읽음으로 표시했습니다.",
  "data": {
    "id": "notif-uuid-1",
    "isRead": true
  }
}
```

### PATCH 메서드

PATCH `/api/notifications/[id]/read`도 동일하게 동작합니다.

---

## POST /api/notifications/mark-all-read

모든 알림을 읽음 처리합니다.

### 응답 예시

```json
{
  "success": true,
  "message": "15개의 알림을 읽음으로 표시했습니다.",
  "count": 15
}
```

### PATCH 메서드

PATCH도 동일하게 지원합니다.

---

## GET /api/notifications/count

읽지 않은 알림 수를 조회합니다.

### 응답 예시

```json
{
  "success": true,
  "count": 5
}
```

### 사용처

- 헤더 알림 배지
- 알림 드롭다운 카운터

---

## DELETE /api/notifications/bulk

여러 알림을 한 번에 삭제합니다.

### Request Body

```json
{
  "ids": ["notif-uuid-1", "notif-uuid-2", "notif-uuid-3"]
}
```

### 응답 예시

```json
{
  "success": true,
  "message": "3개의 알림이 삭제되었습니다.",
  "success": 3,
  "failed": 0
}
```

---

## 에러 응답

| 코드 | HTTP | 설명 |
|------|------|------|
| NOTI-001 | 400 | 알림 타입 필수 |
| NOTI-002 | 400 | 유효하지 않은 알림 타입 |
| NOTI-016 | 401 | 인증 필요 |
| NOTI-017 | 403 | 소유권 없음 |
| NOTI-026 | 404 | 알림 없음 |

### 에러 응답 예시

```json
{
  "error": "알림을 찾을 수 없습니다.",
  "code": "NOTI-026"
}
```

---

## 관련 코드

```
src/app/api/notifications/
├── route.js              # GET, POST
├── count/
│   └── route.js          # GET (미읽 개수)
├── mark-all-read/
│   └── route.js          # POST, PATCH
├── bulk/
│   └── route.js          # DELETE (대량)
└── [id]/
    ├── route.js          # GET, DELETE
    └── read/
        └── route.js      # POST, PATCH (읽음)
```

