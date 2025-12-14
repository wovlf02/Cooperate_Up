# 데이터베이스 모델

## 개요

1:1 및 그룹 채팅 시스템에 필요한 Prisma 모델 정의입니다.

---

## ERD (Entity Relationship Diagram)

```
┌─────────────────┐      ┌─────────────────────┐      ┌─────────────────┐
│     User        │      │    ChatRoomMember   │      │    ChatRoom     │
├─────────────────┤      ├─────────────────────┤      ├─────────────────┤
│ id              │◄────►│ userId              │      │ id              │
│ name            │      │ chatRoomId          │◄────►│ type            │
│ avatar          │      │ role                │      │ name            │
│ ...             │      │ lastReadAt          │      │ imageUrl        │
└─────────────────┘      │ isPinned            │      │ createdById     │
                         │ isMuted             │      │ lastMessageId   │
                         └─────────────────────┘      └─────────────────┘
                                                              │
                                                              ▼
                         ┌─────────────────────┐      ┌─────────────────┐
                         │  MessageReaction    │      │  DirectMessage  │
                         ├─────────────────────┤      ├─────────────────┤
                         │ id                  │      │ id              │
                         │ messageId           │◄────►│ chatRoomId      │
                         │ userId              │      │ senderId        │
                         │ emoji               │      │ content         │
                         └─────────────────────┘      │ type            │
                                                      │ replyToId       │
                                                      │ fileUrl         │
                                                      └─────────────────┘
```

---

## Prisma Schema

### ChatRoom (채팅방)

```prisma
model ChatRoom {
  id          String       @id @default(cuid())
  type        ChatRoomType @default(DIRECT)
  
  // 그룹 채팅 정보
  name        String?      // 그룹 이름 (1:1은 null)
  description String?      // 그룹 설명
  imageUrl    String?      // 그룹 이미지
  
  // 생성자 (그룹만)
  createdById String?
  
  // 마지막 메시지 (목록 정렬용)
  lastMessageId   String?   @unique
  lastMessageAt   DateTime?
  lastMessageText String?   // 미리보기용
  
  // 설정
  maxMembers Int @default(100)  // 최대 멤버 수
  
  // 타임스탬프
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // 관계
  createdBy   User?            @relation("ChatRoomCreator", fields: [createdById], references: [id])
  lastMessage DirectMessage?   @relation("LastMessage", fields: [lastMessageId], references: [id], onDelete: SetNull, onUpdate: NoAction)
  members     ChatRoomMember[]
  messages    DirectMessage[]  @relation("ChatRoomMessages")
  
  @@index([type])
  @@index([createdById])
  @@index([lastMessageAt])
}

enum ChatRoomType {
  DIRECT  // 1:1 채팅
  GROUP   // 그룹 채팅
}
```

### ChatRoomMember (채팅방 멤버)

```prisma
model ChatRoomMember {
  id         String             @id @default(cuid())
  chatRoomId String
  userId     String
  
  // 역할
  role       ChatRoomMemberRole @default(MEMBER)
  
  // 개인 설정
  isPinned   Boolean   @default(false)  // 상단 고정
  isMuted    Boolean   @default(false)  // 알림 음소거
  nickname   String?                    // 그룹 내 별명 (선택)
  
  // 읽음 상태
  lastReadAt    DateTime?               // 마지막 읽은 시간
  lastReadMsgId String?                 // 마지막 읽은 메시지 ID
  
  // 상태
  isActive   Boolean   @default(true)   // 활성 멤버 여부
  
  // 타임스탬프
  joinedAt   DateTime  @default(now())
  leftAt     DateTime?                  // 나간 시간
  
  // 관계
  chatRoom ChatRoom @relation(fields: [chatRoomId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([chatRoomId, userId])
  @@index([userId, isActive])
  @@index([chatRoomId, isActive])
  @@index([isPinned, lastReadAt])
}

enum ChatRoomMemberRole {
  OWNER   // 방장 (그룹)
  ADMIN   // 관리자
  MEMBER  // 일반 멤버
}
```

### DirectMessage (메시지)

```prisma
model DirectMessage {
  id         String      @id @default(cuid())
  chatRoomId String
  senderId   String
  
  // 메시지 내용
  content    String      @db.Text
  type       DMMessageType @default(TEXT)
  
  // 파일 첨부
  fileUrl    String?
  fileName   String?
  fileSize   Int?
  fileMimeType String?
  thumbnailUrl String?   // 이미지 썸네일
  
  // 답장
  replyToId  String?
  
  // 상태
  isEdited   Boolean     @default(false)
  editedAt   DateTime?
  isDeleted  Boolean     @default(false)
  deletedAt  DateTime?
  
  // 시스템 메시지 메타데이터
  metadata   Json?       // { "action": "join", "targetUserId": "..." }
  
  // 타임스탬프
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // 관계
  chatRoom  ChatRoom          @relation("ChatRoomMessages", fields: [chatRoomId], references: [id], onDelete: Cascade)
  sender    User              @relation("MessageSender", fields: [senderId], references: [id])
  replyTo   DirectMessage?    @relation("MessageReplies", fields: [replyToId], references: [id], onDelete: SetNull)
  replies   DirectMessage[]   @relation("MessageReplies")
  reactions MessageReaction[]
  
  // 마지막 메시지 역참조
  lastMessageOf ChatRoom? @relation("LastMessage")
  
  @@index([chatRoomId, createdAt])
  @@index([senderId])
  @@index([replyToId])
}

enum DMMessageType {
  TEXT      // 텍스트
  IMAGE     // 이미지
  FILE      // 파일
  VIDEO     // 동영상
  AUDIO     // 음성
  SYSTEM    // 시스템 메시지 (입장/퇴장/초대 등)
}
```

### MessageReaction (메시지 반응)

```prisma
model MessageReaction {
  id        String @id @default(cuid())
  messageId String
  userId    String
  emoji     String  // "👍", "❤️", "😂" 등
  
  createdAt DateTime @default(now())
  
  message DirectMessage @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user    User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([messageId, userId, emoji])  // 같은 이모지 중복 방지
  @@index([messageId])
  @@index([userId])
}
```

### MessageReadStatus (읽음 상태) - 선택적

그룹 채팅에서 누가 읽었는지 상세 추적이 필요한 경우

```prisma
model MessageReadStatus {
  id        String   @id @default(cuid())
  messageId String
  userId    String
  readAt    DateTime @default(now())
  
  message DirectMessage @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user    User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([messageId, userId])
  @@index([messageId])
}
```

---

## User 모델 확장

```prisma
model User {
  // ...기존 필드...
  
  // DM 관련
  chatRoomMemberships ChatRoomMember[]
  sentDirectMessages  DirectMessage[]    @relation("MessageSender")
  messageReactions    MessageReaction[]
  createdChatRooms    ChatRoom[]         @relation("ChatRoomCreator")
  
  // 선택적
  messageReadStatuses MessageReadStatus[]
}
```

---

## 인덱스 설계

### 주요 쿼리 패턴

| 쿼리 | 사용 인덱스 |
|------|------------|
| 내 채팅방 목록 | `ChatRoomMember(userId, isActive)` |
| 채팅방 목록 정렬 | `ChatRoom(lastMessageAt)` |
| 메시지 목록 (페이지네이션) | `DirectMessage(chatRoomId, createdAt)` |
| 안 읽은 메시지 수 | `DirectMessage(chatRoomId, createdAt)` + `ChatRoomMember(lastReadAt)` |
| 고정된 채팅방 | `ChatRoomMember(isPinned, lastReadAt)` |

---

## 쿼리 예시

### 1. 내 채팅방 목록 (최신 메시지 순)

```javascript
const chatRooms = await prisma.chatRoomMember.findMany({
  where: {
    userId: currentUserId,
    isActive: true,
  },
  include: {
    chatRoom: {
      include: {
        lastMessage: {
          include: {
            sender: { select: { id: true, name: true, avatar: true } }
          }
        },
        members: {
          where: { isActive: true },
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          },
          take: 4  // 프로필 표시용
        },
        _count: {
          select: { members: { where: { isActive: true } } }
        }
      }
    }
  },
  orderBy: [
    { isPinned: 'desc' },
    { chatRoom: { lastMessageAt: 'desc' } }
  ]
})
```

### 2. 안 읽은 메시지 수 계산

```javascript
const unreadCount = await prisma.directMessage.count({
  where: {
    chatRoomId: roomId,
    createdAt: {
      gt: member.lastReadAt || new Date(0)
    },
    senderId: { not: currentUserId },
    isDeleted: false,
  }
})
```

### 3. 1:1 채팅방 찾기/생성

```javascript
async function findOrCreateDirectRoom(userId1, userId2) {
  // 기존 1:1 채팅방 찾기
  const existingRoom = await prisma.chatRoom.findFirst({
    where: {
      type: 'DIRECT',
      AND: [
        { members: { some: { userId: userId1, isActive: true } } },
        { members: { some: { userId: userId2, isActive: true } } }
      ]
    }
  })
  
  if (existingRoom) return existingRoom
  
  // 새로 생성
  return prisma.chatRoom.create({
    data: {
      type: 'DIRECT',
      members: {
        createMany: {
          data: [
            { userId: userId1, role: 'MEMBER' },
            { userId: userId2, role: 'MEMBER' }
          ]
        }
      }
    },
    include: { members: { include: { user: true } } }
  })
}
```

### 4. 메시지 목록 (커서 기반 페이지네이션)

```javascript
const messages = await prisma.directMessage.findMany({
  where: {
    chatRoomId: roomId,
    isDeleted: false,
  },
  include: {
    sender: { select: { id: true, name: true, avatar: true } },
    replyTo: {
      select: {
        id: true,
        content: true,
        sender: { select: { id: true, name: true } }
      }
    },
    reactions: {
      include: {
        user: { select: { id: true, name: true } }
      }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 50,
  ...(cursor && {
    cursor: { id: cursor },
    skip: 1
  })
})
```

---

## 마이그레이션

```bash
npx prisma migrate dev --name add_direct_messaging
npx prisma generate
```

