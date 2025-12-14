# 친구 시스템 데이터베이스 모델

## 개요

친구 관리 시스템에 필요한 Prisma 모델 정의입니다.

---

## 모델 정의

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

## User 모델 확장

```prisma
model User {
  // ...기존 필드...
  
  // 친구 관계
  sentFriendRequests     Friend[]      @relation("FriendRequester")
  receivedFriendRequests Friend[]      @relation("FriendReceiver")
  
  // 차단
  blockedUsers    BlockedUser[] @relation("Blocker")
  blockedByUsers  BlockedUser[] @relation("Blocked")
}
```

---

## 쿼리 예시

### 친구 목록 조회

```javascript
const friends = await prisma.friend.findMany({
  where: {
    OR: [
      { userId: currentUserId, status: 'ACCEPTED' },
      { friendId: currentUserId, status: 'ACCEPTED' }
    ]
  },
  include: {
    user: { select: { id: true, name: true, avatar: true } },
    friend: { select: { id: true, name: true, avatar: true } }
  }
})
```

### 받은 친구 요청

```javascript
const requests = await prisma.friend.findMany({
  where: {
    friendId: currentUserId,
    status: 'PENDING'
  },
  include: {
    user: { select: { id: true, name: true, avatar: true } }
  }
})
```

### 차단 여부 확인

```javascript
const isBlocked = await prisma.blockedUser.findFirst({
  where: {
    OR: [
      { userId: userA, blockedId: userB },
      { userId: userB, blockedId: userA }
    ]
  }
})
```

