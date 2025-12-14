# Socket.IO 실시간 이벤트

## 개요

1:1 및 그룹 채팅의 실시간 기능을 위한 Socket.IO 이벤트 명세입니다.

---

## 연결 설정

### 네임스페이스

```javascript
// 클라이언트
const socket = io('/dm', {
  auth: {
    token: accessToken
  }
})
```

### 서버 설정

```javascript
// server.mjs
const dmNamespace = io.of('/dm')

dmNamespace.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  // 토큰 검증
  const user = await verifyToken(token)
  if (!user) return next(new Error('Unauthorized'))
  socket.user = user
  next()
})
```

---

## 연결 이벤트

### connect

연결 성공 시

**Client Handler:**
```javascript
socket.on('connect', () => {
  console.log('DM 소켓 연결됨:', socket.id)
})
```

### disconnect

연결 해제 시

**Client Handler:**
```javascript
socket.on('disconnect', (reason) => {
  console.log('DM 소켓 연결 해제:', reason)
})
```

### error

에러 발생 시

**Server → Client:**
```javascript
{
  code: 'UNAUTHORIZED',
  message: '인증이 필요합니다.'
}
```

---

## 채팅방 이벤트

### dm:join

채팅방에 입장합니다.

**Client → Server:**
```javascript
socket.emit('dm:join', { roomId: 'room_cuid' })
```

**Server Response:**
```javascript
socket.on('dm:joined', {
  roomId: 'room_cuid',
  onlineMembers: ['user1', 'user2']
})
```

**Server Broadcast (to room):**
```javascript
{
  event: 'dm:member-online',
  data: {
    roomId: 'room_cuid',
    userId: 'user_cuid',
    user: { id, name, avatar }
  }
}
```

---

### dm:leave

채팅방을 퇴장합니다.

**Client → Server:**
```javascript
socket.emit('dm:leave', { roomId: 'room_cuid' })
```

**Server Broadcast (to room):**
```javascript
{
  event: 'dm:member-offline',
  data: {
    roomId: 'room_cuid',
    userId: 'user_cuid'
  }
}
```

---

## 메시지 이벤트

### dm:message

새 메시지를 전송합니다.

**Client → Server:**
```javascript
socket.emit('dm:message', {
  roomId: 'room_cuid',
  content: '안녕하세요!',
  type: 'TEXT',
  replyToId: null,
  tempId: 'temp_123'  // 클라이언트 임시 ID (낙관적 업데이트용)
})
```

**Server → Sender (확인):**
```javascript
{
  event: 'dm:message-sent',
  data: {
    tempId: 'temp_123',
    message: {
      id: 'msg_cuid',
      content: '안녕하세요!',
      type: 'TEXT',
      sender: { id, name, avatar },
      createdAt: '2024-12-15T10:00:00Z'
    }
  }
}
```

**Server Broadcast (to room, except sender):**
```javascript
{
  event: 'dm:message-received',
  data: {
    roomId: 'room_cuid',
    message: {
      id: 'msg_cuid',
      content: '안녕하세요!',
      type: 'TEXT',
      sender: { id, name, avatar },
      replyTo: null,
      createdAt: '2024-12-15T10:00:00Z'
    }
  }
}
```

**Server → All Members (채팅방 목록 업데이트):**
```javascript
{
  event: 'dm:room-updated',
  data: {
    roomId: 'room_cuid',
    lastMessage: {
      content: '안녕하세요!',
      sender: { id, name },
      createdAt: '...'
    }
  }
}
```

---

### dm:message-edit

메시지를 수정합니다.

**Client → Server:**
```javascript
socket.emit('dm:message-edit', {
  roomId: 'room_cuid',
  messageId: 'msg_cuid',
  content: '수정된 내용'
})
```

**Server Broadcast (to room):**
```javascript
{
  event: 'dm:message-edited',
  data: {
    roomId: 'room_cuid',
    messageId: 'msg_cuid',
    content: '수정된 내용',
    editedAt: '2024-12-15T10:05:00Z'
  }
}
```

---

### dm:message-delete

메시지를 삭제합니다.

**Client → Server:**
```javascript
socket.emit('dm:message-delete', {
  roomId: 'room_cuid',
  messageId: 'msg_cuid'
})
```

**Server Broadcast (to room):**
```javascript
{
  event: 'dm:message-deleted',
  data: {
    roomId: 'room_cuid',
    messageId: 'msg_cuid',
    deletedBy: 'user_cuid'
  }
}
```

---

## 읽음 상태 이벤트

### dm:read

메시지를 읽음 처리합니다.

**Client → Server:**
```javascript
socket.emit('dm:read', {
  roomId: 'room_cuid',
  lastMessageId: 'msg_cuid'
})
```

**Server Broadcast (to room):**
```javascript
{
  event: 'dm:read-receipt',
  data: {
    roomId: 'room_cuid',
    userId: 'user_cuid',
    lastReadMessageId: 'msg_cuid',
    readAt: '2024-12-15T10:10:00Z'
  }
}
```

---

## 타이핑 이벤트

### dm:typing-start

타이핑을 시작합니다.

**Client → Server:**
```javascript
socket.emit('dm:typing-start', { roomId: 'room_cuid' })
```

**Server Broadcast (to room, except sender):**
```javascript
{
  event: 'dm:typing',
  data: {
    roomId: 'room_cuid',
    user: { id, name }
  }
}
```

---

### dm:typing-stop

타이핑을 중지합니다.

**Client → Server:**
```javascript
socket.emit('dm:typing-stop', { roomId: 'room_cuid' })
```

**Server Broadcast (to room, except sender):**
```javascript
{
  event: 'dm:typing-stopped',
  data: {
    roomId: 'room_cuid',
    userId: 'user_cuid'
  }
}
```

---

## 반응 이벤트

### dm:reaction-add

메시지에 반응을 추가합니다.

**Client → Server:**
```javascript
socket.emit('dm:reaction-add', {
  roomId: 'room_cuid',
  messageId: 'msg_cuid',
  emoji: '👍'
})
```

**Server Broadcast (to room):**
```javascript
{
  event: 'dm:reaction-added',
  data: {
    roomId: 'room_cuid',
    messageId: 'msg_cuid',
    reaction: {
      emoji: '👍',
      userId: 'user_cuid',
      user: { id, name }
    }
  }
}
```

---

### dm:reaction-remove

반응을 제거합니다.

**Client → Server:**
```javascript
socket.emit('dm:reaction-remove', {
  roomId: 'room_cuid',
  messageId: 'msg_cuid',
  emoji: '👍'
})
```

**Server Broadcast (to room):**
```javascript
{
  event: 'dm:reaction-removed',
  data: {
    roomId: 'room_cuid',
    messageId: 'msg_cuid',
    emoji: '👍',
    userId: 'user_cuid'
  }
}
```

---

## 멤버 관리 이벤트 (그룹)

### dm:member-invited

새 멤버가 초대됨

**Server Broadcast (to room):**
```javascript
{
  event: 'dm:member-invited',
  data: {
    roomId: 'room_cuid',
    invitedBy: { id, name },
    newMembers: [
      { id, name, avatar }
    ]
  }
}
```

**Server → Invited Users (새 방 알림):**
```javascript
{
  event: 'dm:invited-to-room',
  data: {
    room: {
      id: 'room_cuid',
      name: '그룹 이름',
      type: 'GROUP'
    },
    invitedBy: { id, name }
  }
}
```

---

### dm:member-kicked

멤버가 강퇴됨

**Server Broadcast (to room):**
```javascript
{
  event: 'dm:member-kicked',
  data: {
    roomId: 'room_cuid',
    kickedUser: { id, name },
    kickedBy: { id, name }
  }
}
```

**Server → Kicked User:**
```javascript
{
  event: 'dm:kicked-from-room',
  data: {
    roomId: 'room_cuid',
    roomName: '그룹 이름'
  }
}
```

---

### dm:member-left

멤버가 나감

**Server Broadcast (to room):**
```javascript
{
  event: 'dm:member-left',
  data: {
    roomId: 'room_cuid',
    user: { id, name }
  }
}
```

---

### dm:role-changed

멤버 권한이 변경됨

**Server Broadcast (to room):**
```javascript
{
  event: 'dm:role-changed',
  data: {
    roomId: 'room_cuid',
    userId: 'user_cuid',
    newRole: 'ADMIN',
    changedBy: { id, name }
  }
}
```

---

## 채팅방 이벤트

### dm:room-updated

채팅방 정보가 변경됨 (이름, 이미지 등)

**Server Broadcast (to room):**
```javascript
{
  event: 'dm:room-info-updated',
  data: {
    roomId: 'room_cuid',
    changes: {
      name: '새 이름',
      imageUrl: '/new-image.jpg'
    },
    updatedBy: { id, name }
  }
}
```

---

### dm:room-deleted

채팅방이 삭제됨 (그룹)

**Server Broadcast (to all members):**
```javascript
{
  event: 'dm:room-deleted',
  data: {
    roomId: 'room_cuid',
    roomName: '그룹 이름'
  }
}
```

---

## 온라인 상태 이벤트

### dm:presence-update

사용자 온라인 상태 변경

**Server → Friends/Room Members:**
```javascript
{
  event: 'dm:presence-update',
  data: {
    userId: 'user_cuid',
    status: 'online',  // 'online', 'offline', 'away'
    lastSeenAt: '2024-12-15T10:00:00Z'
  }
}
```

---

## 클라이언트 구현 예시

### React Hook

```javascript
// hooks/useDMSocket.js
import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useSession } from 'next-auth/react'

export function useDMSocket() {
  const { data: session } = useSession()
  const socketRef = useRef(null)
  
  useEffect(() => {
    if (!session?.accessToken) return
    
    socketRef.current = io('/dm', {
      auth: { token: session.accessToken }
    })
    
    socketRef.current.on('connect', () => {
      console.log('DM socket connected')
    })
    
    socketRef.current.on('error', (error) => {
      console.error('DM socket error:', error)
    })
    
    return () => {
      socketRef.current?.disconnect()
    }
  }, [session?.accessToken])
  
  const joinRoom = useCallback((roomId) => {
    socketRef.current?.emit('dm:join', { roomId })
  }, [])
  
  const leaveRoom = useCallback((roomId) => {
    socketRef.current?.emit('dm:leave', { roomId })
  }, [])
  
  const sendMessage = useCallback((roomId, content, type = 'TEXT', replyToId = null) => {
    const tempId = `temp_${Date.now()}`
    socketRef.current?.emit('dm:message', {
      roomId,
      content,
      type,
      replyToId,
      tempId
    })
    return tempId
  }, [])
  
  const startTyping = useCallback((roomId) => {
    socketRef.current?.emit('dm:typing-start', { roomId })
  }, [])
  
  const stopTyping = useCallback((roomId) => {
    socketRef.current?.emit('dm:typing-stop', { roomId })
  }, [])
  
  const markAsRead = useCallback((roomId, lastMessageId) => {
    socketRef.current?.emit('dm:read', { roomId, lastMessageId })
  }, [])
  
  const addReaction = useCallback((roomId, messageId, emoji) => {
    socketRef.current?.emit('dm:reaction-add', { roomId, messageId, emoji })
  }, [])
  
  const removeReaction = useCallback((roomId, messageId, emoji) => {
    socketRef.current?.emit('dm:reaction-remove', { roomId, messageId, emoji })
  }, [])
  
  const onMessage = useCallback((callback) => {
    socketRef.current?.on('dm:message-received', callback)
    return () => socketRef.current?.off('dm:message-received', callback)
  }, [])
  
  const onTyping = useCallback((callback) => {
    socketRef.current?.on('dm:typing', callback)
    return () => socketRef.current?.off('dm:typing', callback)
  }, [])
  
  return {
    socket: socketRef.current,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    addReaction,
    removeReaction,
    onMessage,
    onTyping,
  }
}
```

---

## 서버 구현 예시

### Socket Handler

```javascript
// signaling-server/handlers/dm.js
export function setupDMHandlers(io) {
  const dmNamespace = io.of('/dm')
  
  dmNamespace.on('connection', (socket) => {
    const userId = socket.user.id
    
    // 사용자별 소켓 저장
    socket.join(`user:${userId}`)
    
    // 채팅방 입장
    socket.on('dm:join', async ({ roomId }) => {
      // 멤버 확인
      const isMember = await checkMembership(userId, roomId)
      if (!isMember) {
        return socket.emit('error', { code: 'FORBIDDEN' })
      }
      
      socket.join(`room:${roomId}`)
      
      // 온라인 멤버 목록
      const room = dmNamespace.adapter.rooms.get(`room:${roomId}`)
      const onlineMembers = await getOnlineMembers(room)
      
      socket.emit('dm:joined', { roomId, onlineMembers })
      
      // 다른 멤버에게 알림
      socket.to(`room:${roomId}`).emit('dm:member-online', {
        roomId,
        userId,
        user: socket.user
      })
    })
    
    // 메시지 전송
    socket.on('dm:message', async ({ roomId, content, type, replyToId, tempId }) => {
      try {
        // 메시지 저장
        const message = await createMessage({
          chatRoomId: roomId,
          senderId: userId,
          content,
          type,
          replyToId
        })
        
        // 발신자에게 확인
        socket.emit('dm:message-sent', { tempId, message })
        
        // 채팅방 멤버에게 브로드캐스트
        socket.to(`room:${roomId}`).emit('dm:message-received', {
          roomId,
          message
        })
        
        // 오프라인 멤버에게 알림
        await sendPushNotification(roomId, message)
        
      } catch (error) {
        socket.emit('error', { code: 'MESSAGE_FAILED', message: error.message })
      }
    })
    
    // 읽음 처리
    socket.on('dm:read', async ({ roomId, lastMessageId }) => {
      await updateLastRead(userId, roomId, lastMessageId)
      
      socket.to(`room:${roomId}`).emit('dm:read-receipt', {
        roomId,
        userId,
        lastReadMessageId: lastMessageId,
        readAt: new Date()
      })
    })
    
    // 타이핑
    socket.on('dm:typing-start', ({ roomId }) => {
      socket.to(`room:${roomId}`).emit('dm:typing', {
        roomId,
        user: { id: userId, name: socket.user.name }
      })
    })
    
    socket.on('dm:typing-stop', ({ roomId }) => {
      socket.to(`room:${roomId}`).emit('dm:typing-stopped', {
        roomId,
        userId
      })
    })
    
    // 연결 해제
    socket.on('disconnect', () => {
      // 참여 중인 모든 방에 오프라인 알림
      socket.rooms.forEach((room) => {
        if (room.startsWith('room:')) {
          socket.to(room).emit('dm:member-offline', {
            roomId: room.replace('room:', ''),
            userId
          })
        }
      })
    })
  })
}
```

---

## 이벤트 요약 테이블

### Client → Server

| 이벤트 | 설명 |
|--------|------|
| `dm:join` | 채팅방 입장 |
| `dm:leave` | 채팅방 퇴장 |
| `dm:message` | 메시지 전송 |
| `dm:message-edit` | 메시지 수정 |
| `dm:message-delete` | 메시지 삭제 |
| `dm:read` | 읽음 처리 |
| `dm:typing-start` | 타이핑 시작 |
| `dm:typing-stop` | 타이핑 중지 |
| `dm:reaction-add` | 반응 추가 |
| `dm:reaction-remove` | 반응 제거 |

### Server → Client

| 이벤트 | 설명 |
|--------|------|
| `dm:joined` | 입장 완료 |
| `dm:member-online` | 멤버 접속 |
| `dm:member-offline` | 멤버 오프라인 |
| `dm:message-sent` | 메시지 전송 완료 |
| `dm:message-received` | 새 메시지 수신 |
| `dm:message-edited` | 메시지 수정됨 |
| `dm:message-deleted` | 메시지 삭제됨 |
| `dm:read-receipt` | 읽음 확인 |
| `dm:typing` | 타이핑 중 |
| `dm:typing-stopped` | 타이핑 중지 |
| `dm:reaction-added` | 반응 추가됨 |
| `dm:reaction-removed` | 반응 제거됨 |
| `dm:member-invited` | 멤버 초대됨 |
| `dm:member-kicked` | 멤버 강퇴됨 |
| `dm:member-left` | 멤버 나감 |
| `dm:role-changed` | 권한 변경됨 |
| `dm:room-info-updated` | 방 정보 변경 |
| `dm:room-deleted` | 방 삭제됨 |
| `dm:presence-update` | 온라인 상태 변경 |
| `dm:invited-to-room` | 방에 초대됨 |
| `dm:kicked-from-room` | 방에서 강퇴됨 |

