# 🔌 내 스터디 API

## 엔드포인트 목록

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/my-studies` | 내 스터디 목록 | ✓ |
| GET | `/api/studies/[id]/chat` | 채팅 메시지 조회 | ✓ (MEMBER) |
| POST | `/api/studies/[id]/chat` | 채팅 메시지 전송 | ✓ (MEMBER) |
| GET | `/api/studies/[id]/calendar` | 일정 목록 | ✓ (MEMBER) |
| POST | `/api/studies/[id]/calendar` | 일정 생성 | ✓ (MEMBER) |
| GET | `/api/studies/[id]/notices` | 공지사항 목록 | ✓ (MEMBER) |
| POST | `/api/studies/[id]/notices` | 공지사항 생성 | ✓ (ADMIN) |
| GET | `/api/studies/[id]/files` | 파일 목록 | ✓ (MEMBER) |
| POST | `/api/studies/[id]/files` | 파일 업로드 | ✓ (MEMBER) |
| GET | `/api/studies/[id]/tasks` | 스터디 할일 목록 | ✓ (MEMBER) |
| POST | `/api/studies/[id]/tasks` | 스터디 할일 생성 | ✓ (ADMIN) |

---

## GET /api/my-studies

### 설명

현재 사용자가 참여 중인 스터디 목록을 조회합니다.

### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `limit` | number | 20 | 최대 개수 |
| `role` | string | - | 역할 필터 (OWNER, ADMIN, MEMBER) |

### Response

```json
{
  "success": true,
  "data": {
    "studies": [
      {
        "id": "study123",
        "name": "JavaScript 스터디",
        "emoji": "💻",
        "category": "programming",
        "memberCount": 5,
        "myRole": "OWNER",
        "unreadMessages": 3,
        "lastActivity": "2025-12-13T10:00:00Z"
      }
    ]
  }
}
```

---

## 채팅 API

### GET /api/studies/[id]/chat

채팅 메시지 이력을 조회합니다.

### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `limit` | number | 50 | 메시지 수 |
| `before` | string | - | 이 ID 이전 메시지 |

### Response

```json
{
  "messages": [
    {
      "id": "msg123",
      "content": "안녕하세요!",
      "createdAt": "2025-12-13T10:00:00Z",
      "user": {
        "id": "user123",
        "name": "홍길동",
        "avatar": "https://..."
      },
      "readers": ["user123", "user456"]
    }
  ],
  "hasMore": true
}
```

### POST /api/studies/[id]/chat

메시지를 전송합니다.

### Request Body

```json
{
  "content": "안녕하세요!",
  "fileId": null
}
```

---

## 캘린더 API

### GET /api/studies/[id]/calendar

일정 목록을 조회합니다.

### Query Parameters

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `year` | number | 연도 |
| `month` | number | 월 (1-12) |

### Response

```json
{
  "events": [
    {
      "id": "event123",
      "title": "정기 모임",
      "date": "2025-12-15",
      "startTime": "19:00",
      "endTime": "21:00",
      "location": "온라인",
      "color": "#6366F1",
      "createdBy": { "id": "...", "name": "..." }
    }
  ]
}
```

### POST /api/studies/[id]/calendar

일정을 생성합니다.

### Request Body

```json
{
  "title": "정기 모임",
  "date": "2025-12-15",
  "startTime": "19:00",
  "endTime": "21:00",
  "location": "온라인",
  "color": "#6366F1"
}
```

---

## 공지사항 API

### GET /api/studies/[id]/notices

공지사항 목록을 조회합니다.

### Response

```json
{
  "notices": [
    {
      "id": "notice123",
      "title": "중요 공지",
      "content": "...",
      "isPinned": true,
      "isImportant": true,
      "views": 42,
      "createdAt": "2025-12-13T10:00:00Z",
      "author": { "id": "...", "name": "..." }
    }
  ]
}
```

### POST /api/studies/[id]/notices

공지사항을 생성합니다. ADMIN 이상 권한 필요.

---

## 파일 API

### GET /api/studies/[id]/files

파일 목록을 조회합니다.

### Response

```json
{
  "files": [
    {
      "id": "file123",
      "name": "자료.pdf",
      "size": 1024000,
      "type": "application/pdf",
      "url": "/uploads/...",
      "downloads": 5,
      "createdAt": "2025-12-13T10:00:00Z",
      "uploader": { "id": "...", "name": "..." }
    }
  ]
}
```

### POST /api/studies/[id]/files

파일을 업로드합니다. FormData 사용.

---

## 관련 문서

- [채팅 화면](./screens-chat.md) - 채팅 UI
- [캘린더 화면](./screens-calendar.md) - 캘린더 UI

