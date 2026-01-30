# REST API 명세

## 개요

1:1 및 그룹 채팅 시스템의 REST API 엔드포인트 상세 명세입니다.

---

## 인증

모든 API는 인증이 필요합니다.

```
Authorization: Bearer <access_token>
```

---

## 채팅방 API

### GET /api/chat-rooms

참여 중인 채팅방 목록을 조회합니다.

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| type | string | ❌ | `all`, `direct`, `group` (기본: all) |
| page | number | ❌ | 페이지 번호 (기본: 1) |
| limit | number | ❌ | 페이지당 개수 (기본: 20) |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "room_cuid",
      "type": "DIRECT",
      "name": null,
      "imageUrl": null,
      "isPinned": true,
      "isMuted": false,
      "unreadCount": 3,
      "lastMessage": {
        "id": "msg_cuid",
        "content": "안녕하세요!",
        "type": "TEXT",
        "createdAt": "2024-12-15T10:00:00Z",
        "sender": {
          "id": "user_cuid",
          "name": "홍길동",
          "avatar": "/uploads/avatar.jpg"
        }
      },
      "participants": [
        {
          "id": "user_cuid",
          "name": "홍길동",
          "avatar": "/uploads/avatar.jpg",
          "isOnline": true
        }
      ],
      "memberCount": 2,
      "updatedAt": "2024-12-15T10:00:00Z"
    },
    {
      "id": "room_cuid_2",
      "type": "GROUP",
      "name": "프로젝트 팀",
      "imageUrl": "/uploads/group.jpg",
      "isPinned": false,
      "isMuted": false,
      "unreadCount": 0,
      "lastMessage": { ... },
      "participants": [ ... ],
      "memberCount": 8,
      "updatedAt": "2024-12-15T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

### POST /api/chat-rooms

새 채팅방을 생성합니다.

**Request Body (1:1 채팅):**

```json
{
  "type": "DIRECT",
  "targetUserId": "user_cuid"
}
```

**Request Body (그룹 채팅):**

```json
{
  "type": "GROUP",
  "name": "스터디 그룹",
  "description": "알고리즘 스터디",
  "memberIds": ["user1_cuid", "user2_cuid", "user3_cuid"],
  "imageUrl": "/uploads/group.jpg"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "room_cuid",
    "type": "GROUP",
    "name": "스터디 그룹",
    "description": "알고리즘 스터디",
    "imageUrl": "/uploads/group.jpg",
    "memberCount": 4,
    "members": [
      {
        "id": "member_cuid",
        "user": { "id": "...", "name": "...", "avatar": "..." },
        "role": "OWNER"
      }
    ],
    "createdAt": "2024-12-15T10:00:00Z"
  }
}
```

**Error Responses:**

| 코드 | 상황 |
|------|------|
| 400 | 필수 필드 누락 |
| 400 | 이미 1:1 채팅방 존재 (기존 방 반환) |
| 403 | 차단된 사용자와 채팅 시도 |
| 404 | 대상 사용자를 찾을 수 없음 |

---

### GET /api/chat-rooms/[roomId]

채팅방 상세 정보를 조회합니다.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "room_cuid",
    "type": "GROUP",
    "name": "스터디 그룹",
    "description": "알고리즘 스터디",
    "imageUrl": "/uploads/group.jpg",
    "createdAt": "2024-12-15T10:00:00Z",
    "createdBy": {
      "id": "user_cuid",
      "name": "홍길동"
    },
    "myMembership": {
      "role": "ADMIN",
      "isPinned": false,
      "isMuted": false,
      "joinedAt": "2024-12-15T10:00:00Z"
    },
    "memberCount": 8,
    "maxMembers": 100
  }
}
```

---

### PATCH /api/chat-rooms/[roomId]

채팅방 정보를 수정합니다. (그룹만, OWNER/ADMIN)

**Request Body:**

```json
{
  "name": "새로운 그룹 이름",
  "description": "수정된 설명",
  "imageUrl": "/uploads/new-image.jpg"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "채팅방이 수정되었습니다.",
  "data": { ... }
}
```

---

### DELETE /api/chat-rooms/[roomId]

채팅방을 삭제합니다. (그룹만, OWNER만)

**Response (200):**

```json
{
  "success": true,
  "message": "채팅방이 삭제되었습니다."
}
```

---

### POST /api/chat-rooms/[roomId]/leave

채팅방을 나갑니다.

**Response (200):**

```json
{
  "success": true,
  "message": "채팅방을 나갔습니다."
}
```

> 1:1 채팅방을 나가면 대화 기록은 유지되지만 목록에서 숨겨집니다.
> 그룹 채팅방 OWNER가 나가면 다른 멤버에게 OWNER가 이전됩니다.

---

### PATCH /api/chat-rooms/[roomId]/settings

개인 채팅방 설정을 변경합니다.

**Request Body:**

```json
{
  "isPinned": true,
  "isMuted": false,
  "nickname": "나의 별명"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "설정이 변경되었습니다."
}
```

---

## 멤버 관리 API (그룹 채팅)

### GET /api/chat-rooms/[roomId]/members

채팅방 멤버 목록을 조회합니다.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "member_cuid",
      "user": {
        "id": "user_cuid",
        "name": "홍길동",
        "avatar": "/uploads/avatar.jpg",
        "isOnline": true
      },
      "role": "OWNER",
      "nickname": null,
      "joinedAt": "2024-12-15T10:00:00Z"
    }
  ],
  "total": 8
}
```

---

### POST /api/chat-rooms/[roomId]/members

멤버를 초대합니다. (OWNER/ADMIN)

**Request Body:**

```json
{
  "userIds": ["user1_cuid", "user2_cuid"]
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "2명을 초대했습니다.",
  "data": {
    "invited": ["user1_cuid", "user2_cuid"],
    "failed": []
  }
}
```

**Error Responses:**

| 코드 | 상황 |
|------|------|
| 400 | 이미 멤버인 사용자 |
| 400 | 최대 멤버 수 초과 |
| 403 | 권한 없음 |
| 403 | 차단된 사용자 초대 시도 |

---

### DELETE /api/chat-rooms/[roomId]/members/[userId]

멤버를 강퇴합니다. (OWNER/ADMIN)

**Response (200):**

```json
{
  "success": true,
  "message": "멤버를 내보냈습니다."
}
```

**Error Responses:**

| 코드 | 상황 |
|------|------|
| 400 | 자기 자신 강퇴 시도 |
| 403 | 권한 없음 (OWNER 강퇴 불가) |

---

### PATCH /api/chat-rooms/[roomId]/members/[userId]/role

멤버 권한을 변경합니다. (OWNER만)

**Request Body:**

```json
{
  "role": "ADMIN"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "권한이 변경되었습니다."
}
```

---

### POST /api/chat-rooms/[roomId]/transfer-owner

방장을 이전합니다. (OWNER만)

**Request Body:**

```json
{
  "newOwnerId": "user_cuid"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "방장이 이전되었습니다."
}
```

---

## 메시지 API

### GET /api/chat-rooms/[roomId]/messages

메시지 목록을 조회합니다. (커서 기반 페이지네이션)

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| cursor | string | ❌ | 마지막 메시지 ID |
| limit | number | ❌ | 개수 (기본: 50, 최대: 100) |
| direction | string | ❌ | `before`, `after` (기본: before) |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "msg_cuid",
      "content": "안녕하세요!",
      "type": "TEXT",
      "sender": {
        "id": "user_cuid",
        "name": "홍길동",
        "avatar": "/uploads/avatar.jpg"
      },
      "replyTo": null,
      "reactions": [
        { "emoji": "👍", "count": 3, "reacted": true }
      ],
      "isEdited": false,
      "createdAt": "2024-12-15T10:00:00Z"
    },
    {
      "id": "msg_cuid_2",
      "content": "파일입니다",
      "type": "FILE",
      "fileUrl": "/uploads/document.pdf",
      "fileName": "document.pdf",
      "fileSize": 1024000,
      "sender": { ... },
      "replyTo": {
        "id": "msg_cuid",
        "content": "안녕하세요!",
        "sender": { "id": "...", "name": "홍길동" }
      },
      "reactions": [],
      "createdAt": "2024-12-15T10:01:00Z"
    }
  ],
  "hasMore": true,
  "nextCursor": "msg_oldest_cuid"
}
```

---

### POST /api/chat-rooms/[roomId]/messages

메시지를 전송합니다.

**Request Body (텍스트):**

```json
{
  "content": "안녕하세요!",
  "type": "TEXT",
  "replyToId": null
}
```

**Request Body (파일/이미지):**

```json
{
  "content": "파일 설명",
  "type": "IMAGE",
  "fileUrl": "/uploads/image.jpg",
  "fileName": "image.jpg",
  "fileSize": 102400,
  "thumbnailUrl": "/uploads/thumb_image.jpg",
  "replyToId": "msg_cuid"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "msg_new_cuid",
    "content": "안녕하세요!",
    "type": "TEXT",
    "sender": { ... },
    "createdAt": "2024-12-15T10:05:00Z"
  }
}
```

---

### PATCH /api/chat-rooms/[roomId]/messages/[messageId]

메시지를 수정합니다. (본인 메시지만, 5분 이내)

**Request Body:**

```json
{
  "content": "수정된 내용"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "msg_cuid",
    "content": "수정된 내용",
    "isEdited": true,
    "editedAt": "2024-12-15T10:06:00Z"
  }
}
```

---

### DELETE /api/chat-rooms/[roomId]/messages/[messageId]

메시지를 삭제합니다. (본인 또는 OWNER/ADMIN)

**Response (200):**

```json
{
  "success": true,
  "message": "메시지가 삭제되었습니다."
}
```

---

### POST /api/chat-rooms/[roomId]/messages/read

읽음 처리합니다.

**Request Body:**

```json
{
  "lastMessageId": "msg_cuid"
}
```

**Response (200):**

```json
{
  "success": true,
  "lastReadAt": "2024-12-15T10:10:00Z"
}
```

---

### GET /api/chat-rooms/[roomId]/messages/search

메시지를 검색합니다.

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| q | string | ✅ | 검색어 |
| senderId | string | ❌ | 특정 사용자 메시지만 |
| type | string | ❌ | 메시지 타입 필터 |
| startDate | string | ❌ | 시작 날짜 |
| endDate | string | ❌ | 종료 날짜 |
| page | number | ❌ | 페이지 |
| limit | number | ❌ | 개수 |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "msg_cuid",
      "content": "검색어가 포함된 메시지",
      "highlightedContent": "검색어가 포함된 <mark>메시지</mark>",
      "sender": { ... },
      "createdAt": "..."
    }
  ],
  "pagination": { ... }
}
```

---

## 반응 API

### POST /api/chat-rooms/[roomId]/messages/[messageId]/reactions

메시지에 반응을 추가합니다.

**Request Body:**

```json
{
  "emoji": "👍"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "emoji": "👍",
    "count": 4,
    "reacted": true
  }
}
```

---

### DELETE /api/chat-rooms/[roomId]/messages/[messageId]/reactions/[emoji]

반응을 제거합니다.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "emoji": "👍",
    "count": 3,
    "reacted": false
  }
}
```

---

## 파일 업로드 API

### POST /api/chat-rooms/[roomId]/upload

채팅용 파일을 업로드합니다.

**Request:** `multipart/form-data`

| 필드 | 타입 | 설명 |
|------|------|------|
| file | File | 업로드할 파일 |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "url": "/uploads/dm/room_cuid/file.jpg",
    "thumbnailUrl": "/uploads/dm/room_cuid/thumb_file.jpg",
    "fileName": "file.jpg",
    "fileSize": 102400,
    "mimeType": "image/jpeg"
  }
}
```

**제한사항:**

| 항목 | 제한 |
|------|------|
| 파일 크기 | 최대 50MB |
| 이미지 | jpg, png, gif, webp |
| 동영상 | mp4, webm (최대 100MB) |
| 문서 | pdf, doc, docx, xls, xlsx, ppt, pptx |
| 압축 | zip, rar |

