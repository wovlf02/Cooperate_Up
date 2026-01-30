# 채팅 도메인 (Chat Domain)

> **최종 업데이트**: 2024-12-25
> **패키지 경로**: `com.bizone.api.domain.chat`

## 1. 개요

채팅 도메인은 실시간 채팅, 채팅방 관리, 메시지 이력 관리를 담당합니다.

### 1.1 주요 기능

- 채팅방 생성/관리
- 실시간 메시지 송수신 (WebSocket)
- 메시지 이력 조회
- 읽음 확인
- 안 읽은 메시지 수

---

## 2. 패키지 구조

```
domain/chat/
├── controller/
│   ├── ChatController.java                  # 채팅 REST API 컨트롤러 (~50줄)
│   └── ChatWebSocketController.java         # WebSocket 컨트롤러 (~40줄)
│
├── service/
│   ├── ChatService.java                     # 서비스 인터페이스 (~30줄)
│   └── impl/
│       └── ChatServiceImpl.java             # 서비스 구현체 (~150줄)
│
├── repository/
│   ├── ChatRoomRepository.java              # 채팅방 Repository (~20줄)
│   ├── ChatMessageRepository.java           # 메시지 Repository (~25줄)
│   └── ChatParticipantRepository.java       # 참여자 Repository (~20줄)
│
├── entity/
│   ├── ChatRoom.java                        # 채팅방 엔티티 (~60줄)
│   ├── ChatMessage.java                     # 메시지 엔티티 (~50줄)
│   └── ChatParticipant.java                 # 참여자 엔티티 (~40줄)
│
├── dto/
│   ├── request/
│   │   ├── ChatRoomCreateRequest.java       # 채팅방 생성 요청 (~20줄)
│   │   └── ChatMessageRequest.java          # 메시지 전송 요청 (~15줄)
│   │
│   └── response/
│       ├── ChatRoomResponse.java            # 채팅방 응답 (~25줄)
│       ├── ChatRoomListResponse.java        # 채팅방 목록 응답 (~30줄)
│       └── ChatMessageResponse.java         # 메시지 응답 (~25줄)
│
├── mapper/
│   └── ChatMapper.java                      # Entity-DTO 매퍼 (~30줄)
│
├── handler/
│   └── ChatWebSocketHandler.java            # WebSocket 핸들러 (~80줄)
│
└── constant/
    ├── ChatRoomType.java                    # 채팅방 유형 enum (~10줄)
    └── MessageType.java                     # 메시지 유형 enum (~10줄)
```

---

## 3. 엔티티 (Entity)

### 3.1 chat_rooms (채팅방) 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| workplace_id | BIGINT | NO | - | FK → workplaces.id |
| room_type | VARCHAR(20) | NO | - | 'group', 'direct' |
| name | VARCHAR(200) | YES | NULL | 채팅방 이름 (그룹용) |
| created_by | BIGINT | YES | NULL | FK → users.id |
| last_message_content | TEXT | YES | NULL | 마지막 메시지 (비정규화) |
| last_message_sender_id | BIGINT | YES | NULL | 마지막 발신자 |
| last_message_sender_name | VARCHAR(100) | YES | NULL | 마지막 발신자명 |
| last_message_type | VARCHAR(20) | YES | NULL | 마지막 메시지 타입 |
| last_message_at | TIMESTAMP | YES | NULL | 마지막 메시지 시간 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |
| updated_at | TIMESTAMP | NO | NOW | 수정일시 |

**제약조건:**
- PK: `id`
- FK: `workplace_id` → `workplaces(id)` ON DELETE CASCADE
- FK: `created_by` → `users(id)` ON DELETE SET NULL
- CHECK: `room_type IN ('group', 'direct')`
- INDEX: `(workplace_id, updated_at DESC)`

### 3.2 chat_room_participants (채팅방 참여자) 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| chat_room_id | BIGINT | NO | - | FK → chat_rooms.id |
| user_id | BIGINT | NO | - | FK → users.id |
| last_read_at | TIMESTAMP | YES | NULL | 마지막 읽은 시간 |
| joined_at | TIMESTAMP | NO | NOW | 참여 일시 |

**제약조건:**
- PK: `id`
- FK: `chat_room_id` → `chat_rooms(id)` ON DELETE CASCADE
- FK: `user_id` → `users(id)` ON DELETE CASCADE
- UK: `(chat_room_id, user_id)`
- INDEX: `chat_room_id`, `user_id`

### 3.3 messages (메시지) 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| chat_room_id | BIGINT | NO | - | FK → chat_rooms.id |
| sender_id | BIGINT | NO | - | FK → users.id |
| sender_name | VARCHAR(100) | NO | - | 발신자명 (비정규화) |
| content | TEXT | YES | NULL | 메시지 내용 |
| message_type | VARCHAR(20) | NO | 'text' | 메시지 타입 |
| created_at | TIMESTAMP | NO | NOW | 생성일시 |

**제약조건:**
- PK: `id`
- FK: `chat_room_id` → `chat_rooms(id)` ON DELETE CASCADE
- FK: `sender_id` → `users(id)` ON DELETE SET NULL
- CHECK: `message_type IN ('text', 'image', 'video', 'audio', 'document', 'system')`
- INDEX: `(chat_room_id, created_at DESC)`

### 3.4 message_attachments (메시지 첨부파일) 테이블

| 컬럼명 | 타입 | NULL | 기본값 | 설명 |
|--------|------|:----:|--------|------|
| **id** | BIGINT | NO | AUTO | PK |
| message_id | BIGINT | NO | - | FK → messages.id |
| file_name | VARCHAR(255) | NO | - | 파일명 |
| file_url | VARCHAR(500) | NO | - | 파일 URL |
| thumbnail_url | VARCHAR(500) | YES | NULL | 썸네일 URL |
| file_type | VARCHAR(20) | YES | NULL | 파일 타입 |
| mime_type | VARCHAR(100) | YES | NULL | MIME 타입 |
| file_size | INT | NO | 0 | 파일 크기 |
| duration | INT | YES | NULL | 재생 시간 (초) |

**제약조건:**
- PK: `id`
- FK: `message_id` → `messages(id)` ON DELETE CASCADE
- INDEX: `message_id`

---

## 4. 상세 파일 구조

### 4.1 Entity

#### ChatRoom.java (~60줄)

```java
package com.bizone.api.domain.chat.entity;

@Entity
@Table(name = "chat_rooms")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoom extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workplaceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChatRoomType type;

    @Column(length = 100)
    private String name;

    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatParticipant> participants = new ArrayList<>();

    private Long lastMessageId;
    private LocalDateTime lastMessageAt;

    private boolean isActive;

    // 비즈니스 메서드
    public void addParticipant(Long userId, String userName) { }
    public void removeParticipant(Long userId) { }
    public void updateLastMessage(Long messageId) { }
}
```

#### ChatMessage.java (~50줄)

```java
package com.bizone.api.domain.chat.entity;

@Entity
@Table(name = "chat_messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long chatRoomId;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false, length = 100)
    private String senderName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageType type;

    @Column(nullable = false, length = 2000)
    private String content;

    private String attachmentUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private boolean isDeleted;

    // 비즈니스 메서드
    public void delete() {
        this.isDeleted = true;
        this.content = "삭제된 메시지입니다.";
    }
}
```

### 3.2 WebSocket Handler

#### ChatWebSocketHandler.java (~80줄)

```java
package com.bizone.api.domain.chat.handler;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketHandler {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtTokenProvider jwtTokenProvider;

    @MessageMapping("/chat/{roomId}/send")
    public void sendMessage(@DestinationVariable Long roomId,
                            @Payload ChatMessageRequest request,
                            @Header("Authorization") String token) {
        // 1. 토큰 검증
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        
        // 2. 메시지 저장
        ChatMessage message = chatService.saveMessage(roomId, userId, request);
        
        // 3. 참여자들에게 브로드캐스트
        ChatMessageResponse response = chatMapper.toResponse(message);
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, response);
        
        // 4. 푸시 알림 발송 (오프라인 사용자)
        chatService.sendPushToOfflineParticipants(roomId, message);
    }

    @MessageMapping("/chat/{roomId}/read")
    public void markAsRead(@DestinationVariable Long roomId,
                           @Header("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        chatService.markAsRead(roomId, userId);
    }

    @MessageMapping("/chat/{roomId}/typing")
    public void notifyTyping(@DestinationVariable Long roomId,
                             @Header("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        String userName = chatService.getUserName(userId);
        messagingTemplate.convertAndSend("/topic/chat/" + roomId + "/typing",
            Map.of("userId", userId, "userName", userName));
    }
}
```

### 3.3 Controller

#### ChatController.java (~50줄)

```java
package com.bizone.api.domain.chat.controller;

@RestController
@RequestMapping("/api/v1/workplaces/{workplaceId}/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "채팅 API")
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/rooms")
    @Operation(summary = "채팅방 목록 조회")
    public ApiResponse<List<ChatRoomListResponse>> getChatRooms(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @PostMapping("/rooms")
    @Operation(summary = "채팅방 생성")
    public ApiResponse<ChatRoomResponse> createChatRoom(
        @PathVariable Long workplaceId,
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ChatRoomCreateRequest request) { }

    @GetMapping("/rooms/{roomId}")
    @Operation(summary = "채팅방 상세 조회")
    public ApiResponse<ChatRoomResponse> getChatRoom(
        @PathVariable Long workplaceId,
        @PathVariable Long roomId,
        @AuthenticationPrincipal UserPrincipal principal) { }

    @GetMapping("/rooms/{roomId}/messages")
    @Operation(summary = "메시지 이력 조회")
    public ApiResponse<PageResponse<ChatMessageResponse>> getMessages(
        @PathVariable Long workplaceId,
        @PathVariable Long roomId,
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) Long beforeMessageId,
        @RequestParam(defaultValue = "50") int size) { }

    @PostMapping("/rooms/{roomId}/leave")
    @Operation(summary = "채팅방 나가기")
    public ApiResponse<Void> leaveChatRoom(
        @PathVariable Long workplaceId,
        @PathVariable Long roomId,
        @AuthenticationPrincipal UserPrincipal principal) { }
}
```

---

## 4. API 명세

### 4.1 REST API

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/v1/workplaces/{id}/chat/rooms` | 채팅방 목록 | 멤버 |
| POST | `/api/v1/workplaces/{id}/chat/rooms` | 채팅방 생성 | 멤버 |
| GET | `/api/v1/workplaces/{id}/chat/rooms/{roomId}` | 채팅방 상세 | 참여자 |
| GET | `/api/v1/workplaces/{id}/chat/rooms/{roomId}/messages` | 메시지 이력 | 참여자 |
| POST | `/api/v1/workplaces/{id}/chat/rooms/{roomId}/leave` | 채팅방 나가기 | 참여자 |

### 4.2 WebSocket

| Endpoint | 설명 |
|----------|------|
| `/ws/chat` | WebSocket 연결 엔드포인트 |
| `/app/chat/{roomId}/send` | 메시지 전송 |
| `/app/chat/{roomId}/read` | 읽음 처리 |
| `/app/chat/{roomId}/typing` | 타이핑 알림 |
| `/topic/chat/{roomId}` | 메시지 구독 |
| `/topic/chat/{roomId}/typing` | 타이핑 알림 구독 |

---

## 5. 관련 문서

- [알림 도메인](./14-notification.md) - 오프라인 사용자 푸시 알림
- [전역 설정 (WebSocket)](./16-global.md)

