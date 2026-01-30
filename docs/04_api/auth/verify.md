# 사용자 인증 API (시그널링 서버용)

> 시그널링 서버에서 사용자를 인증할 때 사용하는 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **엔드포인트** | `/api/auth/verify` |
| **메서드** | `POST` |
| **인증 필요** | ❌ (내부 서비스 간 통신용) |
| **Content-Type** | `application/json` |

---

## 🎯 목적

화상 통화를 위한 **시그널링 서버**에서 WebSocket 연결 시 사용자를 인증하기 위한 API입니다.

```
[사용자] → WebSocket 연결 요청 → [시그널링 서버]
                                      ↓
                           POST /api/auth/verify
                                      ↓
                              [CoUp API 서버]
                                      ↓
                            사용자 정보 반환
```

---

## 📥 요청

### 본문 (Body)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `userId` | string | ✅ | 사용자 ID |

### 요청 예시

```json
{
  "userId": "user-uuid-123"
}
```

---

## 📤 응답

### 성공 (200 OK)

```json
{
  "success": true,
  "user": {
    "id": "user-uuid-123",
    "name": "홍길동",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "status": "ACTIVE"
  }
}
```

### 에러 응답

#### userId 누락 (400 Bad Request)

```json
{
  "error": "userId is required"
}
```

#### 사용자 없음 (404 Not Found)

```json
{
  "error": "User not found"
}
```

#### 비활성 사용자 (403 Forbidden)

```json
{
  "error": "User is not active"
}
```

#### 서버 오류 (500 Internal Server Error)

```json
{
  "error": "Internal server error"
}
```

---

## 🔄 처리 흐름

```
1. userId 확인
   - 누락 시 400 반환
   ↓
2. DB에서 사용자 조회
   - id, name, email, avatar, status
   ↓
3. 사용자 존재 확인
   - 없으면 404 반환
   ↓
4. 계정 상태 확인
   - ACTIVE가 아니면 403 반환
   ↓
5. 성공 응답
   - 사용자 정보 반환
```

---

## 💡 사용 예시

### 시그널링 서버에서 사용

```javascript
// signaling-server/middleware/auth.js

async function verifyUser(userId) {
  try {
    const response = await fetch(`${COUP_API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('User verification failed:', error);
    throw error;
  }
}
```

### WebSocket 연결 시 인증

```javascript
// signaling-server/handlers/connection.js

io.use(async (socket, next) => {
  const { userId } = socket.handshake.auth;

  try {
    const user = await verifyUser(userId);
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});
```

---

## ⚠️ 보안 고려사항

1. **내부 서비스 전용**: 이 API는 시그널링 서버와 같은 내부 서비스 간 통신용입니다.
2. **네트워크 제한**: 프로덕션 환경에서는 시그널링 서버 IP만 접근 허용하도록 방화벽 설정을 권장합니다.
3. **userId 검증**: 클라이언트에서 직접 호출하지 않도록 주의가 필요합니다.

---

## 🔗 관련 문서

- [실시간 통신 아키텍처](../../02_architecture/realtime-communication.md)
- [시그널링 서버 설정](../../12_deployment/signaling-server.md)
- [화상 통화 컴포넌트](../../06_components/video-call/README.md)
