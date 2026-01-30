# 채팅 API (Chat API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/chat`

## 개요

채팅방 및 메시지 관리 API입니다. 실시간 메시지는 Socket.IO 기반 시그널링 서버에서 처리합니다.

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|:----:|
| POST | `/chat/rooms` | 채팅방 생성 | ✅ |
| GET | `/chat/rooms` | 채팅방 목록 | ✅ |
| GET | `/chat/rooms/{id}` | 채팅방 상세 | ✅ |
| GET | `/chat/rooms/{id}/messages` | 메시지 목록 | ✅ |
| POST | `/chat/rooms/{id}/read` | 읽음 처리 | ✅ |
| POST | `/chat/rooms/{id}/leave` | 채팅방 나가기 | ✅ |

---

## 1. 채팅방 생성

새로운 채팅방을 생성합니다.

### Request

```http
POST /chat/rooms
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| type | string | ✅ | 채팅방 타입 (GROUP, DIRECT) |
| name | string | ❌ | 채팅방 이름 (그룹일 때) |
| memberIds | array | ❌ | 참여자 ID 목록 |

```json
{
  "workplaceId": 1,
  "type": "DIRECT",
  "memberIds": [5]
}
```

```json
{
  "workplaceId": 1,
  "type": "GROUP",
  "name": "오전 근무조",
  "memberIds": [5, 6, 7]
}
```

### Response

#### 성공 (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "type": "DIRECT",
    "name": null,
    "members": [
      {
        "userId": 3,
        "userName": "이사업",
        "profileImageUrl": null,
        "isOnline": true
      },
      {
        "userId": 5,
        "userName": "박직원",
        "profileImageUrl": null,
        "isOnline": false
      }
    ],
    "lastMessage": null,
    "lastMessageAt": null,
    "unreadCount": 0,
    "createdAt": "2024-12-27T10:00:00"
  },
  "message": "채팅방이 생성되었습니다",
  "timestamp": "2024-12-27T10:00:00"
}
```

### 프론트엔드 연동

- 1:1 채팅은 기존 채팅방 확인 후 없으면 생성
- 그룹 채팅은 참여자 선택 UI 제공

---

## 2. 채팅방 목록

사용자가 참여한 채팅방 목록을 조회합니다.

### Request

```http
GET /chat/rooms?workplaceId=1&page=0&size=20&sort=lastMessageAt,desc
Authorization: Bearer {accessToken}
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| page | int | ❌ | 페이지 번호 |
| size | int | ❌ | 페이지 크기 |
| sort | string | ❌ | 정렬 |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "workplaceId": 1,
        "workplaceName": "카페 BizOne 강남점",
        "type": "GROUP",
        "name": "전체 채팅방",
        "members": [
          {
            "userId": 3,
            "userName": "이사업",
            "profileImageUrl": null,
            "isOnline": true
          },
          {
            "userId": 5,
            "userName": "박직원",
            "profileImageUrl": null,
            "isOnline": true
          }
        ],
        "lastMessage": {
          "id": 100,
          "senderId": 5,
          "senderName": "박직원",
          "content": "오늘 마감 완료했습니다.",
          "type": "TEXT",
          "createdAt": "2024-12-27T18:30:00"
        },
        "lastMessageAt": "2024-12-27T18:30:00",
        "unreadCount": 2,
        "createdAt": "2024-12-01T10:00:00"
      },
      {
        "id": 2,
        "workplaceId": 1,
        "workplaceName": "카페 BizOne 강남점",
        "type": "DIRECT",
        "name": null,
        "members": [
          {
            "userId": 3,
            "userName": "이사업",
            "profileImageUrl": null,
            "isOnline": true
          },
          {
            "userId": 5,
            "userName": "박직원",
            "profileImageUrl": null,
            "isOnline": true
          }
        ],
        "lastMessage": {
          "id": 50,
          "senderId": 3,
          "senderName": "이사업",
          "content": "내일 오전 미팅 가능하신가요?",
          "type": "TEXT",
          "createdAt": "2024-12-27T15:00:00"
        },
        "lastMessageAt": "2024-12-27T15:00:00",
        "unreadCount": 0,
        "createdAt": "2024-12-20T10:00:00"
      }
    ],
    "totalElements": 2,
    "totalPages": 1,
    "size": 20,
    "number": 0,
    "first": true,
    "last": true,
    "empty": false
  },
  "timestamp": "2024-12-27T19:00:00"
}
```

### 프론트엔드 연동

- 채팅 목록 화면
- 마지막 메시지 미리보기
- 읽지 않은 메시지 수 뱃지
- 온라인 상태 표시

---

## 3. 채팅방 상세 조회

채팅방 상세 정보를 조회합니다.

### Request

```http
GET /chat/rooms/{id}
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "type": "GROUP",
    "name": "전체 채팅방",
    "members": [
      {
        "userId": 3,
        "userName": "이사업",
        "profileImageUrl": null,
        "isOnline": true,
        "role": "ADMIN"
      },
      {
        "userId": 5,
        "userName": "박직원",
        "profileImageUrl": null,
        "isOnline": true,
        "role": "MEMBER"
      },
      {
        "userId": 6,
        "userName": "김직원",
        "profileImageUrl": null,
        "isOnline": false,
        "role": "MEMBER"
      }
    ],
    "lastMessage": null,
    "lastMessageAt": null,
    "unreadCount": 0,
    "createdAt": "2024-12-27T10:00:00"
  },
  "timestamp": "2024-12-27T19:00:00"
}
```

---

## 4. 메시지 목록 조회

채팅방의 메시지 목록을 조회합니다 (페이지네이션).

### Request

```http
GET /chat/rooms/{id}/messages?page=0&size=50&sort=createdAt,desc
Authorization: Bearer {accessToken}
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| page | int | ❌ | 페이지 번호 |
| size | int | ❌ | 페이지 크기 (기본값: 50) |
| sort | string | ❌ | 정렬 |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 100,
        "roomId": 1,
        "senderId": 5,
        "senderName": "박직원",
        "senderProfileImage": null,
        "content": "오늘 마감 완료했습니다.",
        "type": "TEXT",
        "attachments": [],
        "readBy": [3, 5],
        "createdAt": "2024-12-27T18:30:00"
      },
      {
        "id": 99,
        "roomId": 1,
        "senderId": 3,
        "senderName": "이사업",
        "senderProfileImage": null,
        "content": null,
        "type": "IMAGE",
        "attachments": [
          {
            "url": "https://s3.bizone.kr/chat/image1.jpg",
            "name": "image1.jpg",
            "size": 204800,
            "mimeType": "image/jpeg"
          }
        ],
        "readBy": [3, 5, 6],
        "createdAt": "2024-12-27T17:00:00"
      }
    ],
    "totalElements": 100,
    "totalPages": 2,
    "size": 50,
    "number": 0,
    "first": true,
    "last": false,
    "empty": false
  },
  "timestamp": "2024-12-27T19:00:00"
}
```

### 프론트엔드 연동

- 채팅 화면에서 메시지 표시
- 역순 정렬 (최신 메시지가 아래)
- 스크롤 시 이전 메시지 로드

---

## 5. 읽음 처리

채팅방의 메시지를 읽음 처리합니다.

### Request

```http
POST /chat/rooms/{id}/read
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "읽음 처리되었습니다",
  "timestamp": "2024-12-27T19:00:00"
}
```

### 프론트엔드 연동

- 채팅방 진입 시 자동 호출
- Socket.IO로 실시간 읽음 상태 업데이트

---

## 6. 채팅방 나가기

채팅방을 나갑니다.

### Request

```http
POST /chat/rooms/{id}/leave
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "채팅방을 나갔습니다",
  "timestamp": "2024-12-27T19:00:00"
}
```

### 프론트엔드 연동

- 채팅방 설정에서 나가기 버튼
- 1:1 채팅방은 나가기 불가 (삭제 처리)

---

## 실시간 메시지 (Socket.IO)

실시간 메시지 전송 및 수신은 시그널링 서버에서 처리합니다.

### 연결

```javascript
import io from 'socket.io-client';

const socket = io('wss://signal.bizone.kr', {
  auth: {
    token: accessToken
  }
});
```

### 이벤트

| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `join_room` | 클라이언트 → 서버 | 채팅방 입장 |
| `leave_room` | 클라이언트 → 서버 | 채팅방 퇴장 |
| `send_message` | 클라이언트 → 서버 | 메시지 전송 |
| `new_message` | 서버 → 클라이언트 | 새 메시지 수신 |
| `message_read` | 서버 → 클라이언트 | 읽음 상태 업데이트 |
| `user_typing` | 양방향 | 타이핑 상태 |
| `user_online` | 서버 → 클라이언트 | 온라인 상태 변경 |

### 메시지 전송 예시

```javascript
// 텍스트 메시지
socket.emit('send_message', {
  roomId: 1,
  type: 'TEXT',
  content: '안녕하세요!'
});

// 이미지 메시지
socket.emit('send_message', {
  roomId: 1,
  type: 'IMAGE',
  attachments: [{
    url: 'https://s3.bizone.kr/chat/image.jpg',
    name: 'image.jpg',
    size: 102400,
    mimeType: 'image/jpeg'
  }]
});

// 파일 메시지
socket.emit('send_message', {
  roomId: 1,
  type: 'FILE',
  attachments: [{
    url: 'https://s3.bizone.kr/chat/document.pdf',
    name: 'document.pdf',
    size: 512000,
    mimeType: 'application/pdf'
  }]
});
```

---

## 타입 정의

### ChatRoomResponse

```typescript
interface ChatRoomResponse {
  id: number;
  workplaceId: number;
  workplaceName: string;
  type: 'GROUP' | 'DIRECT';
  name: string | null;
  members: ChatMember[];
  lastMessage: ChatMessageSummary | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
}

interface ChatMember {
  userId: number;
  userName: string;
  profileImageUrl: string | null;
  isOnline: boolean;
  role?: 'ADMIN' | 'MEMBER';
}

interface ChatMessageSummary {
  id: number;
  senderId: number;
  senderName: string;
  content: string | null;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  createdAt: string;
}
```

### ChatMessageResponse

```typescript
interface ChatMessageResponse {
  id: number;
  roomId: number;
  senderId: number;
  senderName: string;
  senderProfileImage: string | null;
  content: string | null;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  attachments: ChatAttachment[];
  readBy: number[];
  createdAt: string;
}

interface ChatAttachment {
  url: string;
  name: string;
  size: number;
  mimeType: string;
}
```

---

## 추가 필요 API (설계)

### 파일 업로드

```http
POST /chat/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

Request:
- file: 파일 (이미지, PDF, 문서 등)
- roomId: 채팅방 ID

Response:
{
  "success": true,
  "data": {
    "url": "https://s3.bizone.kr/chat/file.pdf",
    "name": "file.pdf",
    "size": 102400,
    "mimeType": "application/pdf"
  }
}
```

### 메시지 검색

```http
GET /chat/rooms/{id}/search?keyword=급여&page=0&size=20
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 50,
        "content": "급여일 안내드립니다",
        "highlightedContent": "<em>급여</em>일 안내드립니다",
        "createdAt": "2024-12-27T10:00:00"
      }
    ],
    "totalElements": 5
  }
}
```

---

## 관련 문서

- [공통 규격](./00-common.md)
- [시그널링 서버](../../signaling-server/README.md)
- [화면 설계 - 채팅](../05_screens/07_chat/README.md)

