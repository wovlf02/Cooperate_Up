# 📡 채팅 API

## 개요

스터디 내 채팅 메시지 CRUD API입니다.

---

## API 엔드포인트 목록

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/studies/[id]/chat` | 메시지 목록 | 멤버 |
| POST | `/api/studies/[id]/chat` | 메시지 전송 | 멤버 |
| PATCH | `/api/studies/[id]/chat/[messageId]` | 메시지 수정 | 작성자 |
| DELETE | `/api/studies/[id]/chat/[messageId]` | 메시지 삭제 | 작성자/관리자 |
| POST | `/api/studies/[id]/chat/[messageId]/read` | 읽음 처리 | 멤버 |
| GET | `/api/studies/[id]/chat/search` | 메시지 검색 | 멤버 |

---

## GET /api/studies/[id]/chat

메시지 목록을 조회합니다 (커서 기반 무한 스크롤).

### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| cursor | string | - | 마지막 메시지 ID |
| limit | number | 50 | 조회 개수 (1~100) |

### 응답 예시

```json
{
  "success": true,
  "data": [
    {
      "id": "msg-uuid-1",
      "content": "안녕하세요!",
      "createdAt": "2025-01-01T00:00:00Z",
      "user": {
        "id": "user-uuid-1",
        "name": "홍길동",
        "avatar": null
      },
      "file": null
    },
    {
      "id": "msg-uuid-2",
      "content": "파일 공유합니다",
      "createdAt": "2025-01-01T00:01:00Z",
      "user": {
        "id": "user-uuid-2",
        "name": "김철수",
        "avatar": null
      },
      "file": {
        "id": "file-uuid-1",
        "name": "document.pdf",
        "url": "/uploads/...",
        "type": "application/pdf",
        "size": 1024000
      }
    }
  ],
  "hasMore": true,
  "nextCursor": "msg-uuid-0"
}
```

### 페이지네이션

커서 기반 무한 스크롤:
1. 첫 요청: `cursor` 없이 요청
2. 이후 요청: 응답의 `nextCursor`를 사용

---

## POST /api/studies/[id]/chat

메시지를 전송합니다.

### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| content | string | △ | 메시지 내용 (최대 2000자) |
| fileId | string | △ | 파일 ID |

※ content 또는 fileId 중 하나는 필수

### 요청 예시

```json
{
  "content": "안녕하세요!"
}
```

### 파일 첨부 예시

```json
{
  "content": "파일 공유합니다",
  "fileId": "file-uuid-1"
}
```

### 검증 규칙

1. **내용 검증**: content 또는 fileId 중 하나 필수
2. **XSS 검증**: 보안 위협 검출 시 차단
3. **입력값 정제**: HTML 엔티티 이스케이프
4. **길이 제한**: 최대 2000자
5. **스팸 방지**: 10초 내 5개 초과 시 차단
6. **파일 검증**: fileId가 있으면 유효성 확인

### 응답 예시

```json
{
  "success": true,
  "message": "메시지가 전송되었습니다",
  "data": {
    "id": "msg-uuid-1",
    "content": "안녕하세요!",
    "createdAt": "2025-01-01T00:00:00Z",
    "user": {
      "id": "user-uuid-1",
      "name": "홍길동",
      "avatar": null
    },
    "file": null
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "SPAM_DETECTED",
    "message": "메시지를 너무 빠르게 전송하고 있습니다. 잠시 후 다시 시도해주세요."
  }
}
```

---

## PATCH /api/studies/[id]/chat/[messageId]

메시지를 수정합니다.

### 권한

- 작성자만 수정 가능

### Request Body

```json
{
  "content": "수정된 메시지"
}
```

### 검증 규칙

- 내용 필수
- 최대 2000자

### 응답 예시

```json
{
  "success": true,
  "message": "메시지가 수정되었습니다",
  "data": {
    "id": "msg-uuid-1",
    "content": "수정된 메시지",
    "updatedAt": "2025-01-01T00:05:00Z"
  }
}
```

---

## DELETE /api/studies/[id]/chat/[messageId]

메시지를 삭제합니다.

### 권한

- 작성자 또는 ADMIN/OWNER

### 응답 예시

```json
{
  "success": true,
  "message": "메시지가 삭제되었습니다"
}
```

---

## POST /api/studies/[id]/chat/[messageId]/read

메시지를 읽음 처리합니다.

### 응답 예시

```json
{
  "success": true,
  "message": "읽음 처리되었습니다"
}
```

---

## GET /api/studies/[id]/chat/search

메시지를 검색합니다.

### Query Parameters

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| q | string | 검색 키워드 |
| startDate | string | 시작일 (YYYY-MM-DD) |
| endDate | string | 종료일 (YYYY-MM-DD) |
| userId | string | 특정 사용자 메시지만 |
| page | number | 페이지 (기본: 1) |
| limit | number | 페이지당 항목 (기본: 20) |

### 응답 예시

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  },
  "query": {
    "keyword": "회의",
    "startDate": "2025-01-01",
    "endDate": null,
    "userId": null
  }
}
```

---

## 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| EMPTY_CONTENT | 400 | 내용 없음 |
| CONTENT_TOO_LONG | 400 | 내용 너무 김 |
| XSS_DETECTED | 400 | 보안 위협 감지 |
| SPAM_DETECTED | 429 | 스팸 감지 |
| INVALID_FILE | 400 | 유효하지 않은 파일 |
| MESSAGE_NOT_FOUND | 404 | 메시지 없음 |
| UNAUTHORIZED_EDIT | 403 | 수정 권한 없음 |
| UNAUTHORIZED_DELETE | 403 | 삭제 권한 없음 |

---

## 관련 코드

```
src/app/api/studies/[id]/chat/
├── route.js                  # GET, POST
├── search/
│   └── route.js              # GET (검색)
└── [messageId]/
    ├── route.js              # PATCH, DELETE
    └── read/
        └── route.js          # POST (읽음)
```

