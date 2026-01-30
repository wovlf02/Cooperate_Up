# 💬 채팅 도메인 개요

## 개요

스터디 내 실시간 채팅 기능을 제공하는 도메인입니다.  
Socket.IO 기반 실시간 통신과 REST API를 함께 사용합니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 메시지 전송 | 텍스트, 파일 메시지 전송 |
| 메시지 조회 | 커서 기반 무한 스크롤 |
| 메시지 수정 | 본인 메시지 수정 |
| 메시지 삭제 | 본인/관리자 메시지 삭제 |
| 메시지 검색 | 키워드, 날짜, 사용자별 검색 |
| 읽음 처리 | 메시지 읽음 표시 |
| 실시간 동기화 | Socket.IO로 실시간 메시지 수신 |
| 타이핑 표시 | 상대방 입력 중 표시 |
| 스팸 방지 | 메시지 전송 속도 제한 |
| XSS 방지 | 메시지 내용 보안 검증 |

---

## 관련 파일

### API

| 경로 | 설명 |
|------|------|
| `src/app/api/studies/[id]/chat/route.js` | 메시지 목록, 전송 |
| `src/app/api/studies/[id]/chat/[messageId]/route.js` | 수정, 삭제 |
| `src/app/api/studies/[id]/chat/[messageId]/read/route.js` | 읽음 처리 |
| `src/app/api/studies/[id]/chat/search/route.js` | 메시지 검색 |

### 페이지

| 경로 | URL | 설명 |
|------|-----|------|
| `src/app/my-studies/[studyId]/chat/page.jsx` | `/my-studies/[id]/chat` | 채팅 화면 |

### 예외

| 경로 | 설명 |
|------|------|
| `src/lib/exceptions/chat/` | 채팅 예외 클래스 |

### 유틸리티

| 경로 | 설명 |
|------|------|
| `src/lib/utils/chat/errorLogger.js` | 채팅 에러 로깅 |
| `src/lib/utils/input-sanitizer.js` | 입력값 정제 |
| `src/lib/utils/xss-sanitizer.js` | XSS 보안 검증 |

---

## 메시지 모델

```prisma
model Message {
  id        String   @id @default(uuid())
  studyId   String
  userId    String
  content   String
  fileId    String?
  readers   String[] @default([])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  study     Study    @relation(fields: [studyId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  file      File?    @relation(fields: [fileId], references: [id])
}
```

---

## 보안 기능

### XSS 방지

메시지 전송 전 보안 위협 검증:

```javascript
const threats = validateSecurityThreats(content);
if (!threats.safe) {
  throw ChatMessageException.xssDetected(threats.threats);
}
```

### 스팸 방지

최근 10초 내 5개 이상 메시지 전송 시 차단:

```javascript
const recentMessages = await prisma.message.count({
  where: {
    studyId,
    userId,
    createdAt: { gte: new Date(Date.now() - 10000) }
  }
});

if (recentMessages >= 5) {
  throw ChatMessageException.spamDetected();
}
```

### 메시지 길이 제한

- 최대 2000자

---

## 실시간 통신

### Socket.IO 이벤트

| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `study:join` | Client → Server | 채팅방 입장 |
| `study:leave` | Client → Server | 채팅방 퇴장 |
| `message:new` | Server → Client | 새 메시지 수신 |
| `message:update` | Server → Client | 메시지 수정 |
| `message:delete` | Server → Client | 메시지 삭제 |
| `typing:start` | Client → Server | 타이핑 시작 |
| `typing:stop` | Client → Server | 타이핑 종료 |
| `user:typing` | Server → Client | 타이핑 알림 |

---

## 예외 클래스

| 클래스 | 설명 |
|--------|------|
| ChatException | 기본 예외 클래스 |
| ChatMessageException | 메시지 관련 예외 |
| ChatValidationException | 검증 예외 |
| ChatPermissionException | 권한 예외 |
| ChatBusinessException | 비즈니스 예외 |
| ConnectionException | 연결 예외 |
| FileException | 파일 예외 |
| SyncException | 동기화 예외 |
| UIException | UI 예외 |

---

## 권한

| 역할 | 조회 | 전송 | 수정 | 삭제 |
|------|------|------|------|------|
| OWNER | ✓ | ✓ | ✓ | ✓ (모든 메시지) |
| ADMIN | ✓ | ✓ | ✓ | ✓ (모든 메시지) |
| MEMBER | ✓ | ✓ | △ (본인만) | △ (본인만) |

---

## 관련 문서

- [API](./api.md) - 채팅 API
- [화면](./screens.md) - 채팅 화면
- [예외](./exceptions.md) - 예외 클래스

