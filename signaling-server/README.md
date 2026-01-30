# CoUp 시그널링 서버

WebRTC 기반 화상 통화를 위한 독립 시그널링 서버입니다.

## 🚀 빠른 시작

### 1. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 필요한 값을 설정하세요.

### 2. 의존성 설치

```bash
npm install
```

### 3. 서버 실행

#### 개발 모드 (auto-reload)
```bash
npm run dev
```

#### 프로덕션 모드
```bash
npm start
```

서버가 시작되면 `http://localhost:4000`에서 접근 가능합니다.

## 🔧 API 엔드포인트

### Health Check
```
GET /health
```

응답:
```json
{
  "status": "ok",
  "connections": 5,
  "uptime": 123.45,
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

### Metrics
```
GET /metrics
```

응답:
```json
{
  "connections": 5,
  "rooms": 3,
  "roomDetails": [
    { "name": "video:study-123-main", "participants": 3 },
    { "name": "study:456", "participants": 5 }
  ],
  "memory": { ... },
  "uptime": 123.45
}
```

## 📡 Socket.io 이벤트

### 인증

연결 시 `auth` 객체에 사용자 정보를 전달해야 합니다:

```javascript
const socket = io('http://localhost:4000', {
  auth: {
    userId: 'user-123',
    token: 'optional-jwt-token'
  }
});
```

### 화상 통화 이벤트

#### 클라이언트 → 서버

- `video:join-room` - 화상 통화 방 입장
  ```javascript
  socket.emit('video:join-room', { studyId, roomId });
  ```

- `video:leave-room` - 화상 통화 방 퇴장
  ```javascript
  socket.emit('video:leave-room', { roomId });
  ```

- `video:offer` - WebRTC Offer 전송
  ```javascript
  socket.emit('video:offer', { to: socketId, offer });
  ```

- `video:answer` - WebRTC Answer 전송
  ```javascript
  socket.emit('video:answer', { to: socketId, answer });
  ```

- `video:ice-candidate` - ICE Candidate 전송
  ```javascript
  socket.emit('video:ice-candidate', { to: socketId, candidate });
  ```

- `video:toggle-audio` - 오디오 상태 변경
  ```javascript
  socket.emit('video:toggle-audio', { roomId, isMuted: true });
  ```

- `video:toggle-video` - 비디오 상태 변경
  ```javascript
  socket.emit('video:toggle-video', { roomId, isVideoOff: true });
  ```

- `video:screen-share-start` - 화면 공유 시작
  ```javascript
  socket.emit('video:screen-share-start', { roomId });
  ```

- `video:screen-share-stop` - 화면 공유 종료
  ```javascript
  socket.emit('video:screen-share-stop', { roomId });
  ```

#### 서버 → 클라이언트

- `video:room-state` - 현재 방 상태 (참여자 목록)
  ```javascript
  socket.on('video:room-state', ({ participants }) => { ... });
  ```

- `video:user-joined` - 새 참여자 입장
  ```javascript
  socket.on('video:user-joined', ({ socketId, userId, user }) => { ... });
  ```

- `video:user-left` - 참여자 퇴장
  ```javascript
  socket.on('video:user-left', ({ socketId, userId }) => { ... });
  ```

- `video:offer` - Offer 수신
  ```javascript
  socket.on('video:offer', ({ from, offer }) => { ... });
  ```

- `video:answer` - Answer 수신
  ```javascript
  socket.on('video:answer', ({ from, answer }) => { ... });
  ```

- `video:ice-candidate` - ICE Candidate 수신
  ```javascript
  socket.on('video:ice-candidate', ({ from, candidate }) => { ... });
  ```

- `video:peer-audio-changed` - 상대방 오디오 상태 변경
  ```javascript
  socket.on('video:peer-audio-changed', ({ socketId, userId, isMuted }) => { ... });
  ```

- `video:peer-video-changed` - 상대방 비디오 상태 변경
  ```javascript
  socket.on('video:peer-video-changed', ({ socketId, userId, isVideoOff }) => { ... });
  ```

- `video:peer-screen-share` - 상대방 화면 공유 상태 변경
  ```javascript
  socket.on('video:peer-screen-share', ({ socketId, userId, isSharing }) => { ... });
  ```

### 채팅 이벤트

#### 클라이언트 → 서버

- `chat:send-message` - 메시지 전송
  ```javascript
  socket.emit('chat:send-message', { studyId, message, type: 'text' });
  ```

- `chat:video-message` - 화상 통화 중 채팅
  ```javascript
  socket.emit('chat:video-message', { roomId, message });
  ```

- `chat:typing` - 타이핑 상태
  ```javascript
  socket.emit('chat:typing', { studyId, isTyping: true });
  ```

#### 서버 → 클라이언트

- `chat:message-received` - 메시지 수신
  ```javascript
  socket.on('chat:message-received', (message) => { ... });
  ```

- `chat:video-message-received` - 화상 채팅 메시지 수신
  ```javascript
  socket.on('chat:video-message-received', (message) => { ... });
  ```

- `chat:user-typing` - 타이핑 알림
  ```javascript
  socket.on('chat:user-typing', ({ userId, user, isTyping }) => { ... });
  ```

### Presence 이벤트

#### 클라이언트 → 서버

- `presence:join-study` - 스터디 온라인 상태
  ```javascript
  socket.emit('presence:join-study', { studyId });
  ```

- `presence:leave-study` - 스터디 오프라인
  ```javascript
  socket.emit('presence:leave-study', { studyId });
  ```

- `presence:status-change` - 상태 변경
  ```javascript
  socket.emit('presence:status-change', { status: 'away' });
  ```

#### 서버 → 클라이언트

- `presence:user-online` - 사용자 온라인
  ```javascript
  socket.on('presence:user-online', ({ userId, user, timestamp }) => { ... });
  ```

- `presence:user-offline` - 사용자 오프라인
  ```javascript
  socket.on('presence:user-offline', ({ userId, user, timestamp }) => { ... });
  ```

- `presence:user-status-changed` - 사용자 상태 변경
  ```javascript
  socket.on('presence:user-status-changed', ({ userId, user, status }) => { ... });
  ```

## 🏗️ 아키텍처

### 단일 서버 모드

Redis 없이 실행 가능합니다 (개발 환경).

```
Client <--WebSocket--> Signaling Server <--HTTP--> Next.js API
```

### 다중 서버 모드 (프로덕션)

Redis Pub/Sub를 사용하여 여러 시그널링 서버 간 동기화합니다.

```
                         Load Balancer
                              |
              +---------------+---------------+
              |                               |
    Signaling Server 1            Signaling Server 2
              |                               |
              +----------- Redis -------------+
                              |
                         Next.js API
```

## 🔒 보안

### 인증

모든 소켓 연결은 Next.js API를 통해 인증됩니다:

1. 클라이언트가 `userId`와 `token`을 전송
2. 시그널링 서버가 Next.js API (`/api/auth/verify`)로 검증 요청
3. 검증 성공 시 연결 허용

### 권한 확인

화상 통화 방 입장 시 스터디 멤버십을 확인합니다:

1. `video:join-room` 이벤트 수신
2. Next.js API (`/api/studies/[id]/check-member`)로 멤버십 확인
3. 멤버가 아니면 에러 응답

## 📊 모니터링

### 로그

서버는 다음 정보를 로그로 기록합니다:

- 사용자 연결/연결 끊김
- 화상 통화 방 입장/퇴장
- 채팅 메시지 전송
- 에러 및 경고

로그 레벨은 환경 변수로 설정:
```
LOG_LEVEL=debug  # debug, info, warn, error
```

### Metrics 엔드포인트

`/metrics` 엔드포인트로 실시간 통계 조회:

- 현재 연결 수
- 활성 방 수
- 각 방의 참여자 수
- 메모리 사용량
- 서버 가동 시간

## 🛠️ 개발

### 디렉토리 구조

```
signaling-server/
├── server.js           # 메인 서버
├── handlers/           # 이벤트 핸들러
│   ├── video.js        # 화상 통화
│   ├── chat.js         # 채팅
│   └── presence.js     # 온라인 상태
├── middleware/         # 미들웨어
│   └── auth.js         # 인증
├── utils/              # 유틸리티
│   └── logger.js       # 로깅
├── package.json
├── Dockerfile
└── .env.example
```

### 테스트

```bash
# Health check
curl http://localhost:4000/health

# Metrics
curl http://localhost:4000/metrics
```

### Docker로 실행

```bash
# 이미지 빌드
docker build -t coup-signaling .

# 컨테이너 실행
docker run -p 4000:4000 --env-file .env coup-signaling
```

## 📝 환경 변수

| 변수 | 설명 | 기본값 |
|-----|------|--------|
| `PORT` | 서버 포트 | `4000` |
| `NODE_ENV` | 환경 | `development` |
| `NEXTJS_URL` | Next.js API URL | `http://localhost:3000` |
| `REDIS_URL` | Redis 연결 URL | (선택) |
| `ALLOWED_ORIGINS` | CORS 허용 오리진 | `http://localhost:3000` |
| `LOG_LEVEL` | 로그 레벨 | `info` |

## 🚀 배포

### Docker Compose

프로젝트 루트의 `docker-compose.yml`을 사용:

```bash
docker-compose up signaling
```

### 프로덕션

1. 환경 변수 설정
2. Redis 연결 확인
3. PM2 또는 Docker로 실행

```bash
# PM2로 실행
pm2 start server.js --name "signaling-server"

# 또는 Docker
docker-compose -f docker-compose.prod.yml up -d signaling
```

## 📚 참고 문서

- [Socket.io 공식 문서](https://socket.io/docs/)
- [WebRTC 가이드](/docs_pre/video-call/05-webrtc-guide.md)
- [아키텍처 문서](/docs_pre/video-call/08-signaling-server-architecture.md)

## 라이선스

MIT

