# 👥 친구 관리 시스템

## 개요

CoUp 플랫폼에서 사용자 간 친구 관계를 관리하는 시스템입니다.
친구 요청, 수락/거절, 친구 목록 관리, 온라인 상태 확인, 차단 기능을 제공합니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 친구 요청 | 다른 사용자에게 친구 요청 전송 |
| 요청 수락/거절 | 받은 친구 요청 처리 |
| 친구 목록 | 친구 목록 조회 및 검색 |
| 온라인 상태 | 친구의 실시간 접속 상태 표시 |
| 친구 삭제 | 친구 관계 해제 |
| 사용자 차단 | 특정 사용자 차단 및 차단 해제 |
| 친구 추천 | 같은 스터디 멤버, 공통 관심사 기반 추천 |
| 알림 연동 | 친구 요청/수락 시 알림 발송 |
| 친구 신고 | 부적절한 행동의 친구 신고 |
| 1:1 채팅 시작 | 친구와 바로 1:1 채팅 시작 (카카오톡 스타일) |

---

## 데이터 모델

### Friend (친구 관계)

```prisma
model Friend {
  id        String       @id @default(cuid())
  userId    String       // 요청자
  friendId  String       // 대상자
  status    FriendStatus @default(PENDING)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user   User @relation("FriendRequester", fields: [userId], references: [id], onDelete: Cascade)
  friend User @relation("FriendReceiver", fields: [friendId], references: [id], onDelete: Cascade)
  
  @@unique([userId, friendId])
  @@index([userId, status])
  @@index([friendId, status])
}

enum FriendStatus {
  PENDING   // 요청 대기중
  ACCEPTED  // 수락됨
  REJECTED  // 거절됨
}
```

### BlockedUser (차단)

```prisma
model BlockedUser {
  id        String   @id @default(cuid())
  userId    String   // 차단한 사용자
  blockedId String   // 차단당한 사용자
  reason    String?  // 차단 사유
  
  createdAt DateTime @default(now())
  
  user    User @relation("Blocker", fields: [userId], references: [id], onDelete: Cascade)
  blocked User @relation("Blocked", fields: [blockedId], references: [id], onDelete: Cascade)
  
  @@unique([userId, blockedId])
  @@index([userId])
}
```

---

## API 엔드포인트

### 친구 관리

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/friends` | 친구 목록 조회 |
| POST | `/api/friends/request` | 친구 요청 전송 |
| GET | `/api/friends/requests` | 받은/보낸 요청 목록 |
| POST | `/api/friends/accept` | 친구 요청 수락 |
| POST | `/api/friends/reject` | 친구 요청 거절 |
| DELETE | `/api/friends/[id]` | 친구 삭제 |
| GET | `/api/friends/suggestions` | 친구 추천 목록 |

### 1:1 채팅 바로 시작

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/friends/[id]/chat` | 친구와 1:1 채팅방 생성/이동 |

> 기존 1:1 채팅방이 있으면 해당 방으로 이동, 없으면 새로 생성

### 친구 신고

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/friends/[id]/report` | 친구 신고 |

**Request Body:**
```json
{
  "type": "HARASSMENT",  // SPAM, HARASSMENT, INAPPROPRIATE, OTHER
  "reason": "부적절한 메시지를 지속적으로 보냄",
  "evidence": ["screenshot_url1", "screenshot_url2"]
}
```

### 차단 관리

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/blocked` | 차단 목록 조회 |
| POST | `/api/blocked` | 사용자 차단 |
| DELETE | `/api/blocked/[id]` | 차단 해제 |

---

## 컴포넌트 구조

```
src/components/friends/
├── FriendList.jsx          # 친구 목록
├── FriendCard.jsx          # 친구 카드 (아바타, 상태, 액션)
├── FriendRequestList.jsx   # 친구 요청 목록
├── FriendRequestCard.jsx   # 요청 카드 (수락/거절 버튼)
├── FriendSearch.jsx        # 친구 검색
├── FriendSuggestions.jsx   # 친구 추천
├── OnlineIndicator.jsx     # 온라인 상태 표시
├── BlockedUserList.jsx     # 차단 목록
├── FriendActionMenu.jsx    # 친구 액션 메뉴 (채팅, 신고, 차단, 삭제)
├── StartChatButton.jsx     # 1:1 채팅 시작 버튼
├── ReportFriendModal.jsx   # 친구 신고 모달
└── index.js
```

---

## 친구 카드 UI (카카오톡 스타일)

```
┌─────────────────────────────────────────────────┐
│ [🟢] 👤 홍길동              [💬] [⋮]            │
│      마지막 접속: 방금 전                        │
└─────────────────────────────────────────────────┘

[💬] 클릭 → 1:1 채팅방으로 바로 이동
[⋮] 클릭 → 메뉴 (프로필 보기, 신고, 차단, 삭제)
```

### FriendActionMenu 메뉴 항목

| 메뉴 | 아이콘 | 설명 |
|------|--------|------|
| 1:1 채팅 | 💬 | 채팅방으로 바로 이동 |
| 프로필 보기 | 👤 | 사용자 프로필 페이지 |
| 신고하기 | 🚨 | 신고 모달 열기 |
| 차단하기 | 🚫 | 차단 확인 후 처리 |
| 친구 삭제 | 🗑️ | 삭제 확인 후 처리 |

---

## 페이지 구조

| 경로 | URL | 설명 |
|------|-----|------|
| `src/app/friends/page.jsx` | `/friends` | 친구 목록 |
| `src/app/friends/requests/page.jsx` | `/friends/requests` | 친구 요청 관리 |
| `src/app/friends/blocked/page.jsx` | `/friends/blocked` | 차단 목록 |

---

## 실시간 기능 (Socket.IO)

### 이벤트

| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `friend:request` | Server → Client | 친구 요청 수신 알림 |
| `friend:accepted` | Server → Client | 친구 요청 수락 알림 |
| `friend:status` | Server → Client | 친구 온라인 상태 변경 |
| `friend:online` | Client → Server | 온라인 상태 등록 |

---

## 구현 우선순위

1. **Phase 1**: 기본 친구 요청/수락/거절
2. **Phase 2**: 친구 목록, 삭제, 검색
3. **Phase 3**: 온라인 상태 (Socket.IO 연동)
4. **Phase 4**: 차단 기능
5. **Phase 5**: 친구 추천 알고리즘

---

## 관련 문서

- [22-direct-messaging](../22-direct-messaging/README.md) - 1:1 채팅 연동
- [08-notifications](../08-notifications/README.md) - 알림 시스템

