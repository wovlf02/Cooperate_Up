# 친구 시스템 API 명세

## 개요

친구 관리 시스템의 REST API 엔드포인트 상세 명세입니다.

---

## 인증

모든 API는 인증이 필요합니다.

```
Authorization: Bearer <access_token>
```

---

## 친구 API

### GET /api/friends

친구 목록을 조회합니다.

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| page | number | ❌ | 페이지 번호 (기본: 1) |
| limit | number | ❌ | 페이지당 개수 (기본: 20) |
| search | string | ❌ | 이름 검색 |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "friend_cuid",
      "userId": "user_a",
      "friendId": "user_b",
      "status": "ACCEPTED",
      "createdAt": "2024-01-01T00:00:00Z",
      "friend": {
        "id": "user_b",
        "name": "홍길동",
        "avatar": "/uploads/avatar.jpg",
        "isOnline": true,
        "lastActiveAt": "2024-01-01T00:00:00Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

### POST /api/friends/request

친구 요청을 전송합니다.

**Request Body:**
```json
{
  "targetUserId": "target_user_cuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "친구 요청을 보냈습니다.",
  "data": {
    "id": "friend_cuid",
    "userId": "current_user",
    "friendId": "target_user",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
| 코드 | 상황 |
|------|------|
| 400 | 자기 자신에게 요청 |
| 400 | 이미 친구인 경우 |
| 400 | 대기 중인 요청 존재 |
| 403 | 차단된 사용자 |
| 404 | 대상 사용자 없음 |

---

### GET /api/friends/requests

받은/보낸 친구 요청 목록을 조회합니다.

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| type | string | ❌ | `received` / `sent` (기본: received) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "received": [
      {
        "id": "friend_cuid",
        "user": {
          "id": "requester_id",
          "name": "김철수",
          "avatar": "/uploads/avatar.jpg"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "sent": [
      {
        "id": "friend_cuid",
        "friend": {
          "id": "target_id",
          "name": "이영희",
          "avatar": null
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### POST /api/friends/accept

친구 요청을 수락합니다.

**Request Body:**
```json
{
  "requestId": "friend_request_cuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "친구 요청을 수락했습니다.",
  "data": {
    "id": "friend_cuid",
    "status": "ACCEPTED",
    "friend": {
      "id": "user_id",
      "name": "김철수",
      "avatar": null
    }
  }
}
```

---

### POST /api/friends/reject

친구 요청을 거절합니다.

**Request Body:**
```json
{
  "requestId": "friend_request_cuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "친구 요청을 거절했습니다."
}
```

---

### DELETE /api/friends/[id]

친구를 삭제합니다.

**Response (200):**
```json
{
  "success": true,
  "message": "친구를 삭제했습니다."
}
```

---

### GET /api/friends/suggestions

친구 추천 목록을 조회합니다.

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| limit | number | ❌ | 추천 수 (기본: 10) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "user": {
        "id": "user_id",
        "name": "박지민",
        "avatar": null
      },
      "reason": "같은 스터디 멤버",
      "mutualFriends": 3,
      "commonStudies": ["React 스터디", "알고리즘 스터디"]
    }
  ]
}
```

---

## 차단 API

### GET /api/blocked

차단 목록을 조회합니다.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "block_cuid",
      "blocked": {
        "id": "blocked_user_id",
        "name": "차단된 사용자",
        "avatar": null
      },
      "reason": "스팸 메시지",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/blocked

사용자를 차단합니다.

**Request Body:**
```json
{
  "targetUserId": "target_user_cuid",
  "reason": "스팸 메시지"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "사용자를 차단했습니다."
}
```

---

### DELETE /api/blocked/[id]

차단을 해제합니다.

**Response (200):**
```json
{
  "success": true,
  "message": "차단을 해제했습니다."
}
```

---

## 1:1 채팅 시작 API

### POST /api/friends/[id]/chat

친구와 1:1 채팅방을 시작합니다.
기존에 해당 친구와의 1:1 채팅방이 있으면 기존 방 정보를 반환하고,
없으면 새로운 채팅방을 생성합니다. (카카오톡 스타일)

**Response (200/201):**
```json
{
  "success": true,
  "isNew": false,
  "data": {
    "chatRoomId": "chatroom_cuid",
    "type": "DIRECT",
    "friend": {
      "id": "friend_user_id",
      "name": "홍길동",
      "avatar": "/uploads/avatar.jpg",
      "isOnline": true
    },
    "lastMessage": {
      "content": "안녕하세요!",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "unreadCount": 3
  }
}
```

**Error Responses:**
| 코드 | 상황 |
|------|------|
| 400 | 친구가 아닌 사용자 |
| 403 | 차단된 사용자 |
| 404 | 친구를 찾을 수 없음 |

---

## 친구 신고 API

### POST /api/friends/[id]/report

친구를 신고합니다.

**Request Body:**
```json
{
  "type": "HARASSMENT",
  "reason": "부적절한 메시지를 지속적으로 보내고 있습니다.",
  "evidence": [
    "https://example.com/screenshot1.png",
    "https://example.com/screenshot2.png"
  ]
}
```

**신고 유형 (type):**
| 값 | 설명 |
|-----|------|
| `SPAM` | 스팸/광고 메시지 |
| `HARASSMENT` | 괴롭힘/욕설 |
| `INAPPROPRIATE` | 부적절한 콘텐츠 |
| `IMPERSONATION` | 사칭 |
| `OTHER` | 기타 |

**Response (201):**
```json
{
  "success": true,
  "message": "신고가 접수되었습니다. 검토 후 조치하겠습니다.",
  "data": {
    "reportId": "report_cuid",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
| 코드 | 상황 |
|------|------|
| 400 | 필수 필드 누락 |
| 400 | 이미 신고 접수됨 (24시간 내) |
| 404 | 친구를 찾을 수 없음 |

---

## Socket.IO 이벤트

### 친구 관련 이벤트

| 이벤트 | 방향 | 데이터 | 설명 |
|--------|------|--------|------|
| `friend:request` | S→C | `{ from, createdAt }` | 친구 요청 수신 |
| `friend:accepted` | S→C | `{ friend }` | 친구 요청 수락됨 |
| `friend:rejected` | S→C | `{ requestId }` | 친구 요청 거절됨 |
| `friend:removed` | S→C | `{ friendId }` | 친구 삭제됨 |
| `friend:status` | S→C | `{ userId, isOnline }` | 온라인 상태 변경 |

