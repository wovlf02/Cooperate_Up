# 🔔 알림 API

> 사용자 알림 관리 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **기본 엔드포인트** | `/api/notifications` |
| **인증 필요** | ✅ |

---

## 📚 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/notifications` | GET | 알림 목록 조회 |
| `/api/notifications` | POST | 알림 생성 (내부용) |
| `/api/notifications/[id]` | GET | 알림 상세 조회 |
| `/api/notifications/[id]` | PATCH | 알림 읽음 처리 |
| `/api/notifications/[id]` | DELETE | 알림 삭제 |
| `/api/notifications/count` | GET | 읽지 않은 알림 수 |
| `/api/notifications/mark-all-read` | PATCH | 전체 읽음 처리 |
| `/api/notifications/bulk` | DELETE | 알림 일괄 삭제 |

---

## 📖 알림 목록 조회

### 요청

```http
GET /api/notifications?page=1&limit=20&isRead=false&type=STUDY_INVITE
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 20 | 페이지당 항목 수 (최대 100) |
| `isRead` | boolean | - | 읽음 상태 필터 |
| `type` | string | - | 알림 유형 필터 |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "notification-uuid",
      "type": "STUDY_INVITE",
      "message": "React 스터디에 초대되었습니다",
      "isRead": false,
      "studyId": "study-uuid",
      "studyName": "React 스터디",
      "studyEmoji": "⚛️",
      "data": {},
      "createdAt": "2026-01-30T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

---

## 📖 읽지 않은 알림 수

### 요청

```http
GET /api/notifications/count
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "count": 5
}
```

---

## ✏️ 알림 읽음 처리

### 요청

```http
PATCH /api/notifications/notification-uuid
Content-Type: application/json

{
  "isRead": true
}
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "notification-uuid",
    "isRead": true
  }
}
```

---

## ✏️ 전체 읽음 처리

### 요청

```http
PATCH /api/notifications/mark-all-read
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "모든 알림을 읽음 처리했습니다",
  "count": 5
}
```

---

## 🗑️ 알림 삭제

### 요청

```http
DELETE /api/notifications/notification-uuid
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "알림이 삭제되었습니다"
}
```

---

## 🗑️ 알림 일괄 삭제

### 요청

```http
DELETE /api/notifications/bulk
Content-Type: application/json

{
  "ids": ["notification-uuid-1", "notification-uuid-2"]
}
```

또는 조건 기반:

```http
DELETE /api/notifications/bulk
Content-Type: application/json

{
  "filter": "read"
}
```

### 필터 옵션

| 값 | 설명 |
|-----|------|
| `read` | 읽은 알림만 삭제 |
| `all` | 모든 알림 삭제 |

---

## 📊 알림 유형

| 유형 | 설명 |
|------|------|
| `STUDY_INVITE` | 스터디 초대 |
| `STUDY_JOIN_REQUEST` | 가입 신청 알림 (관리자) |
| `STUDY_JOIN_APPROVED` | 가입 승인됨 |
| `STUDY_JOIN_REJECTED` | 가입 거절됨 |
| `STUDY_KICKED` | 강퇴됨 |
| `TASK_ASSIGNED` | 할 일 배정됨 |
| `TASK_DUE_SOON` | 마감 임박 |
| `TASK_OVERDUE` | 마감 초과 |
| `MESSAGE_MENTION` | 멘션됨 |
| `NOTICE_CREATED` | 새 공지 |
| `CALENDAR_EVENT` | 일정 알림 |
| `SYSTEM` | 시스템 알림 |
| `WARNING` | 경고 알림 |

---

## ➕ 알림 생성 (내부용)

> ⚠️ 이 API는 내부 시스템에서만 사용됩니다.

### 요청

```http
POST /api/notifications
Content-Type: application/json

{
  "userId": "user-uuid",
  "type": "STUDY_INVITE",
  "message": "React 스터디에 초대되었습니다",
  "studyId": "study-uuid",
  "studyName": "React 스터디",
  "studyEmoji": "⚛️",
  "data": {
    "inviterId": "inviter-uuid",
    "inviterName": "홍길동"
  }
}
```

---

## 🔗 관련 문서

- [Notification 모델](../../03_database/models/notification.md)
- [알림 페이지](../../05_pages/notifications/README.md)
- [실시간 통신](../../02_architecture/realtime-communication.md)
