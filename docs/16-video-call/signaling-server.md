# 🖥️ 시그널링 서버

## 개요

WebRTC P2P 연결을 위한 시그널링 서버입니다. Socket.io 기반으로 구현되었습니다.

**파일 위치**: `signaling-server/`

---

## 기술 스택

| 기술 | 용도 |
|------|------|
| Node.js | 런타임 |
| Express | HTTP 서버 |
| Socket.io | 실시간 통신 |
| Redis | Multi-server 지원 |
| Docker | 컨테이너화 |

---

## 설치 및 실행

### 환경 변수 설정

```bash
cp .env.example .env
```

```env
PORT=4000
NEXTJS_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

### 의존성 설치

```bash
npm install
```

### 서버 실행

```bash
# 개발 모드 (auto-reload)
npm run dev

# 프로덕션 모드
npm start
```

---

## API 엔드포인트

### Health Check

```
GET /health
```

```json
{
  "status": "ok",
  "connections": 5,
  "uptime": 123.45,
  "timestamp": "2024-12-10T00:00:00.000Z"
}
```

### Metrics

```
GET /metrics
```

```json
{
  "connections": 5,
  "rooms": 3,
  "roomDetails": [
    { "name": "video:study-123-main", "participants": 3 }
  ],
  "memory": { ... },
  "uptime": 123.45
}
```

---

## Socket.io 설정

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6 // 1MB
});
```

---

## 인증 미들웨어

```javascript
// middleware/auth.js
export async function authenticateSocket(socket, next) {
  const { userId, token } = socket.handshake.auth;

  if (!userId) {
    return next(new Error('Authentication required'));
  }

  // 사용자 정보 조회
  socket.userId = userId;
  socket.user = {
    id: userId,
    name: userData.name,
    avatar: userData.avatar
  };

  next();
}
```

---

## 이벤트 핸들러

### video.js

```javascript
export function handleVideoEvents(socket, io) {
  // 방 입장
  socket.on('video:join-room', async ({ studyId, roomId }) => {
    socket.join(`video:${roomId}`);
    
    // 기존 참여자 목록 전송
    socket.emit('video:room-state', { participants });
    
    // 다른 참여자들에게 알림
    socket.to(`video:${roomId}`).emit('video:user-joined', {
      socketId: socket.id,
      user: socket.user
    });
  });

  // WebRTC Offer 전달
  socket.on('video:offer', ({ to, offer }) => {
    io.to(to).emit('video:offer', { from: socket.id, offer });
  });

  // WebRTC Answer 전달
  socket.on('video:answer', ({ to, answer }) => {
    io.to(to).emit('video:answer', { from: socket.id, answer });
  });

  // ICE Candidate 전달
  socket.on('video:ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('video:ice-candidate', { from: socket.id, candidate });
  });

  // 방 퇴장
  socket.on('video:leave-room', ({ roomId }) => {
    socket.leave(`video:${roomId}`);
    socket.to(`video:${roomId}`).emit('video:user-left', {
      socketId: socket.id
    });
  });
}
```

### presence.js

```javascript
export function handlePresenceEvents(socket, io) {
  // 스터디 입장
  socket.on('presence:join-study', ({ studyId }) => {
    socket.join(`study:${studyId}`);
    socket.to(`study:${studyId}`).emit('presence:user-online', {
      userId: socket.userId,
      user: socket.user
    });
  });

  // 접속 종료
  socket.on('disconnect', () => {
    // 참여 중인 모든 방에서 퇴장 알림
  });
}
```

---

## 방 관리

```javascript
// 메모리 기반 방 관리
const videoRooms = new Map();

// 방 정보 구조
{
  roomId: Map {
    socketId: {
      socketId: string,
      userId: string,
      user: { id, name, avatar },
      isMuted: boolean,
      isVideoOff: boolean,
      isSharingScreen: boolean,
      joinedAt: Date
    }
  }
}
```

---

## Redis Adapter

Multi-server 환경에서 Socket.io 이벤트를 공유합니다.

```javascript
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

const redisClient = createClient({ url: REDIS_URL });
const redisSubClient = redisClient.duplicate();

await redisClient.connect();
await redisSubClient.connect();

io.adapter(createAdapter(redisClient, redisSubClient));
```

---

## Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

---

## 로깅

```javascript
// utils/logger.js
export const logger = {
  info: (message, ...args) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  },
  debug: (message, ...args) => {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
};
```

---

## 관련 문서

- [README](./README.md)
- [컴포넌트](./components.md)
- [WebRTC 가이드](./webrtc.md)

