# 💬 Message 모델

## 📋 개요

`Message` 모델은 스터디 내 채팅 메시지를 저장합니다. 실시간 Socket.io를 통해 전송되며, 읽음 처리와 파일 첨부를 지원합니다.

---

## 📊 스키마 정의

### Message (채팅 메시지)

```prisma
model Message {
  id      String  @id @default(cuid())
  studyId String
  userId  String
  content String  @db.Text
  fileId  String?

  readers String[] // User IDs array

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  study Study @relation(fields: [studyId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id])
  file  File? @relation(fields: [fileId], references: [id])

  @@index([studyId, createdAt])
}
```

### Notice (공지사항)

```prisma
model Notice {
  id       String @id @default(cuid())
  studyId  String
  authorId String
  title    String
  content  String @db.Text

  isPinned    Boolean @default(false)
  isImportant Boolean @default(false)
  views       Int     @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  attachments NoticeFile[]
  study       Study @relation(...)
  author      User  @relation(...)

  @@index([studyId, isPinned, createdAt])
  @@index([authorId])
}
```

---

## 🏷️ Message 필드 상세

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✅ | cuid() | 고유 식별자 |
| `studyId` | String | ✅ | - | 스터디 ID (FK) |
| `userId` | String | ✅ | - | 작성자 ID (FK) |
| `content` | String | ✅ | - | 메시지 내용 (Text) |
| `fileId` | String | ❌ | null | 첨부 파일 ID (FK) |
| `readers` | String[] | ✅ | [] | 읽은 사용자 ID 배열 |
| `createdAt` | DateTime | ✅ | now() | 작성 시간 |
| `updatedAt` | DateTime | ✅ | 자동 | 수정 시간 |

---

## 🏷️ Notice 필드 상세

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✅ | cuid() | 고유 식별자 |
| `studyId` | String | ✅ | - | 스터디 ID (FK) |
| `authorId` | String | ✅ | - | 작성자 ID (FK) |
| `title` | String | ✅ | - | 공지 제목 |
| `content` | String | ✅ | - | 공지 내용 (Text) |
| `isPinned` | Boolean | ✅ | false | 상단 고정 여부 |
| `isImportant` | Boolean | ✅ | false | 중요 표시 여부 |
| `views` | Int | ✅ | 0 | 조회수 |

---

## 🔗 관계 (Relations)

### Message 관계

| 관계 | 대상 모델 | 관계 유형 | 설명 |
|------|----------|----------|------|
| `study` | Study | N:1 | 소속 스터디 |
| `user` | User | N:1 | 작성자 |
| `file` | File | N:1 | 첨부 파일 (선택) |

### Notice 관계

| 관계 | 대상 모델 | 관계 유형 | 설명 |
|------|----------|----------|------|
| `study` | Study | N:1 | 소속 스터디 |
| `author` | User | N:1 | 작성자 |
| `attachments` | NoticeFile[] | 1:N | 첨부 파일들 |

---

## 🔍 인덱스

### Message 인덱스

| 인덱스 | 필드 | 용도 |
|--------|------|------|
| `@@index([studyId, createdAt])` | studyId, createdAt | 스터디별 최신 메시지 조회 |

### Notice 인덱스

| 인덱스 | 필드 | 용도 |
|--------|------|------|
| `@@index([studyId, isPinned, createdAt])` | studyId, isPinned, createdAt | 고정 공지 우선 정렬 |
| `@@index([authorId])` | authorId | 작성자별 공지 조회 |

---

## 💡 사용 예시

### 메시지 전송
```javascript
const message = await prisma.message.create({
  data: {
    studyId: 'study-id',
    userId: 'user-id',
    content: '안녕하세요! 오늘 모임 참석합니다.',
    readers: ['user-id'], // 작성자는 이미 읽음
  },
  include: {
    user: { select: { name: true, avatar: true } }
  }
});

// Socket.io로 실시간 전송
io.to(`study:${studyId}`).emit('message', message);
```

### 스터디 메시지 목록 조회
```javascript
const messages = await prisma.message.findMany({
  where: { studyId: 'study-id' },
  include: {
    user: { select: { id: true, name: true, avatar: true } },
    file: { select: { id: true, name: true, url: true } }
  },
  orderBy: { createdAt: 'asc' },
  take: 50, // 최근 50개
});
```

### 메시지 읽음 처리
```javascript
await prisma.message.update({
  where: { id: 'message-id' },
  data: {
    readers: { push: 'user-id' }
  }
});
```

### 공지사항 작성
```javascript
const notice = await prisma.notice.create({
  data: {
    studyId: 'study-id',
    authorId: 'user-id',
    title: '이번 주 모임 안내',
    content: '토요일 오후 2시에 만납니다.',
    isPinned: true,
    isImportant: true,
  }
});
```

### 공지사항 목록 조회 (고정 우선)
```javascript
const notices = await prisma.notice.findMany({
  where: { studyId: 'study-id' },
  include: {
    author: { select: { name: true } },
    attachments: { include: { file: true } }
  },
  orderBy: [
    { isPinned: 'desc' },
    { createdAt: 'desc' }
  ]
});
```

---

## 🔗 관련 문서

- [스터디 모델](./study.md)
- [파일 모델](./file.md)
- [알림 모델](./notification.md)
