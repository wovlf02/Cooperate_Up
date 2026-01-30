# 🔔 Notification 모델

## 📋 개요

`Notification` 모델은 사용자에게 전달되는 시스템 알림을 저장합니다. 가입 승인, 새 공지, 태스크 배정 등 다양한 이벤트를 알림으로 전달합니다.

---

## 📊 스키마 정의

```prisma
model Notification {
  id         String           @id @default(cuid())
  userId     String
  type       NotificationType
  studyId    String?
  studyName  String?
  studyEmoji String?
  message    String
  data       Json?

  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead, createdAt])
}
```

---

## 🏷️ 필드 상세

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✅ | cuid() | 고유 식별자 |
| `userId` | String | ✅ | - | 수신자 ID (FK) |
| `type` | NotificationType | ✅ | - | 알림 유형 |
| `studyId` | String | ❌ | null | 관련 스터디 ID |
| `studyName` | String | ❌ | null | 스터디 이름 (캐시) |
| `studyEmoji` | String | ❌ | null | 스터디 이모지 (캐시) |
| `message` | String | ✅ | - | 알림 메시지 |
| `data` | Json | ❌ | null | 추가 데이터 |
| `isRead` | Boolean | ✅ | false | 읽음 여부 |
| `createdAt` | DateTime | ✅ | now() | 생성 시간 |

---

## 📌 NotificationType (알림 유형)

| 값 | 설명 | 메시지 예시 |
|----|------|------------|
| `JOIN_APPROVED` | 가입 승인됨 | "React 스터디 가입이 승인되었습니다" |
| `NOTICE` | 새 공지 | "새 공지사항이 등록되었습니다" |
| `FILE` | 새 파일 | "새 파일이 업로드되었습니다" |
| `EVENT` | 새 일정 | "새 일정이 등록되었습니다" |
| `TASK` | 태스크 배정 | "새 태스크가 배정되었습니다" |
| `MEMBER` | 새 멤버 가입 | "새 멤버가 가입했습니다" |
| `KICK` | 강퇴됨 | "스터디에서 제외되었습니다" |
| `CHAT` | 채팅 알림 | "새 메시지가 도착했습니다" |

---

## 🔗 관계 (Relations)

| 관계 | 대상 모델 | 관계 유형 | 설명 |
|------|----------|----------|------|
| `user` | User | N:1 | 알림 수신자 |

---

## 🔍 인덱스

| 인덱스 | 필드 | 용도 |
|--------|------|------|
| `@@index([userId, isRead, createdAt])` | userId, isRead, createdAt | 읽지 않은 알림 우선 조회 |

---

## 📦 data 필드 구조

`data` 필드는 알림 유형에 따라 추가 정보를 JSON으로 저장합니다.

### JOIN_APPROVED
```json
{
  "studyId": "study-id",
  "requesterId": "user-id"
}
```

### TASK
```json
{
  "taskId": "task-id",
  "taskTitle": "태스크 제목",
  "dueDate": "2026-02-15"
}
```

### EVENT
```json
{
  "eventId": "event-id",
  "eventTitle": "이벤트 제목",
  "date": "2026-02-20",
  "time": "14:00"
}
```

---

## 💡 사용 예시

### 알림 생성
```javascript
const notification = await prisma.notification.create({
  data: {
    userId: 'user-id',
    type: 'JOIN_APPROVED',
    studyId: 'study-id',
    studyName: 'React 스터디',
    studyEmoji: '⚛️',
    message: 'React 스터디 가입이 승인되었습니다!',
    data: { studyId: 'study-id' }
  }
});

// Socket.io로 실시간 알림 전송
io.to(`user:${userId}`).emit('notification', notification);
```

### 읽지 않은 알림 조회
```javascript
const unreadNotifications = await prisma.notification.findMany({
  where: {
    userId: 'user-id',
    isRead: false
  },
  orderBy: { createdAt: 'desc' },
  take: 20
});
```

### 읽지 않은 알림 개수
```javascript
const unreadCount = await prisma.notification.count({
  where: {
    userId: 'user-id',
    isRead: false
  }
});
```

### 알림 읽음 처리
```javascript
// 단일 알림
await prisma.notification.update({
  where: { id: 'notification-id' },
  data: { isRead: true }
});

// 전체 읽음 처리
await prisma.notification.updateMany({
  where: {
    userId: 'user-id',
    isRead: false
  },
  data: { isRead: true }
});
```

### 알림 삭제
```javascript
await prisma.notification.delete({
  where: { id: 'notification-id' }
});
```

### 오래된 알림 정리 (30일 이상)
```javascript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

await prisma.notification.deleteMany({
  where: {
    createdAt: { lt: thirtyDaysAgo },
    isRead: true
  }
});
```

---

## 🔄 알림 생성 헬퍼 함수

```javascript
// lib/notification-helpers.js

export async function createNotification({
  userId,
  type,
  message,
  studyId = null,
  studyName = null,
  studyEmoji = null,
  data = null
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      message,
      studyId,
      studyName,
      studyEmoji,
      data
    }
  });

  // 실시간 알림 전송 (Socket.io)
  if (global.io) {
    global.io.to(`user:${userId}`).emit('notification', notification);
  }

  return notification;
}
```

---

## 🔗 관련 문서

- [사용자 모델](./user.md)
- [스터디 모델](./study.md)
- [실시간 통신](../../02_architecture/realtime-communication.md)
