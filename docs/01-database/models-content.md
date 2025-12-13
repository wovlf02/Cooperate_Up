# 📝 Content 관련 모델

## 개요

스터디 내 콘텐츠(Message, Notice, File, Event, Task, StudyTask) 관련 모델을 다룹니다.

---

## Message 모델 (채팅 메시지)

### 스키마

```prisma
model Message {
  id      String  @id @default(cuid())
  studyId String
  userId  String
  content String  @db.Text
  fileId  String?

  // 읽음 처리
  readers String[]

  // 타임스탬프
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 관계
  study Study @relation(fields: [studyId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id])
  file  File? @relation(fields: [fileId], references: [id])

  @@index([studyId, createdAt])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `studyId` | String | ✓ | - | 스터디 ID (FK) |
| `userId` | String | ✓ | - | 작성자 ID (FK) |
| `content` | String | ✓ | - | 메시지 내용 |
| `fileId` | String | - | - | 첨부 파일 ID (FK) |
| `readers` | String[] | - | - | 읽은 사용자 ID 배열 |
| `createdAt` | DateTime | ✓ | now() | 생성일 |
| `updatedAt` | DateTime | ✓ | auto | 수정일 |

---

## Notice 모델 (공지사항)

### 스키마

```prisma
model Notice {
  id       String @id @default(cuid())
  studyId  String
  authorId String
  title    String
  content  String @db.Text

  // 상태
  isPinned    Boolean @default(false)
  isImportant Boolean @default(false)

  // 통계
  views Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  attachments NoticeFile[]

  study  Study @relation(fields: [studyId], references: [id], onDelete: Cascade)
  author User  @relation(fields: [authorId], references: [id])

  @@index([studyId, isPinned, createdAt])
  @@index([authorId])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `studyId` | String | ✓ | - | 스터디 ID (FK) |
| `authorId` | String | ✓ | - | 작성자 ID (FK) |
| `title` | String | ✓ | - | 공지 제목 |
| `content` | String | ✓ | - | 공지 내용 |
| `isPinned` | Boolean | ✓ | false | 상단 고정 여부 |
| `isImportant` | Boolean | ✓ | false | 중요 공지 여부 |
| `views` | Int | ✓ | 0 | 조회수 |
| `createdAt` | DateTime | ✓ | now() | 생성일 |
| `updatedAt` | DateTime | ✓ | auto | 수정일 |

---

## NoticeFile 모델 (공지사항 첨부파일)

### 스키마

```prisma
model NoticeFile {
  id        String   @id @default(cuid())
  noticeId  String
  fileId    String
  createdAt DateTime @default(now())

  notice Notice @relation(fields: [noticeId], references: [id], onDelete: Cascade)
  file   File   @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@unique([noticeId, fileId])
  @@index([noticeId])
  @@index([fileId])
}
```

---

## File 모델 (파일)

### 스키마

```prisma
model File {
  id         String  @id @default(cuid())
  studyId    String
  uploaderId String
  name       String
  size       Int
  type       String
  url        String
  folderId   String?

  downloads Int @default(0)

  createdAt DateTime @default(now())

  study       Study        @relation(fields: [studyId], references: [id], onDelete: Cascade)
  uploader    User         @relation("FileUploader", fields: [uploaderId], references: [id])
  messages    Message[]
  noticeFiles NoticeFile[]

  @@index([studyId, folderId])
  @@index([uploaderId])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `studyId` | String | ✓ | - | 스터디 ID (FK) |
| `uploaderId` | String | ✓ | - | 업로더 ID (FK) |
| `name` | String | ✓ | - | 파일 이름 |
| `size` | Int | ✓ | - | 파일 크기 (bytes) |
| `type` | String | ✓ | - | MIME 타입 |
| `url` | String | ✓ | - | 파일 URL |
| `folderId` | String | - | - | 폴더 ID |
| `downloads` | Int | ✓ | 0 | 다운로드 수 |
| `createdAt` | DateTime | ✓ | now() | 업로드일 |

---

## Event 모델 (캘린더 일정)

### 스키마

```prisma
model Event {
  id          String   @id @default(cuid())
  studyId     String
  createdById String
  title       String
  date        DateTime @db.Date
  startTime   String
  endTime     String
  location    String?
  color       String   @default("#6366F1")

  createdAt DateTime @default(now())

  study     Study @relation(fields: [studyId], references: [id], onDelete: Cascade)
  createdBy User  @relation("EventCreator", fields: [createdById], references: [id])

  @@index([studyId, date])
  @@index([createdById])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `studyId` | String | ✓ | - | 스터디 ID (FK) |
| `createdById` | String | ✓ | - | 생성자 ID (FK) |
| `title` | String | ✓ | - | 일정 제목 |
| `date` | DateTime | ✓ | - | 날짜 |
| `startTime` | String | ✓ | - | 시작 시간 (HH:MM) |
| `endTime` | String | ✓ | - | 종료 시간 (HH:MM) |
| `location` | String | - | - | 장소 |
| `color` | String | ✓ | "#6366F1" | 색상 코드 |
| `createdAt` | DateTime | ✓ | now() | 생성일 |

---

## Task 모델 (개인 할일)

### 스키마

```prisma
model Task {
  id          String     @id @default(cuid())
  studyId     String?
  userId      String
  title       String
  description String?    @db.Text
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?

  completed   Boolean   @default(false)
  completedAt DateTime?

  createdAt DateTime @default(now())

  user  User   @relation(fields: [userId], references: [id])
  study Study? @relation(fields: [studyId], references: [id], onDelete: Cascade)

  @@index([userId, completed])
  @@index([studyId, status])
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✓ | cuid() | 고유 식별자 |
| `studyId` | String | - | - | 연관 스터디 ID |
| `userId` | String | ✓ | - | 사용자 ID (FK) |
| `title` | String | ✓ | - | 할일 제목 |
| `description` | String | - | - | 설명 |
| `status` | TaskStatus | ✓ | TODO | 상태 |
| `priority` | Priority | ✓ | MEDIUM | 우선순위 |
| `dueDate` | DateTime | - | - | 마감일 |
| `completed` | Boolean | ✓ | false | 완료 여부 |
| `completedAt` | DateTime | - | - | 완료일 |
| `createdAt` | DateTime | ✓ | now() | 생성일 |

---

## StudyTask 모델 (스터디 공유 할일)

### 스키마

```prisma
model StudyTask {
  id          String     @id @default(cuid())
  studyId     String
  createdById String
  title       String
  description String?    @db.Text
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  study     Study               @relation(fields: [studyId], references: [id], onDelete: Cascade)
  createdBy User                @relation("StudyTaskCreator", fields: [createdById], references: [id])
  assignees StudyTaskAssignee[]

  @@index([studyId, status])
  @@index([createdById])
}
```

---

## StudyTaskAssignee 모델 (할일 담당자)

### 스키마

```prisma
model StudyTaskAssignee {
  id     String @id @default(cuid())
  taskId String
  userId String

  assignedAt DateTime @default(now())

  task StudyTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user User      @relation("TaskAssignee", fields: [userId], references: [id])

  @@unique([taskId, userId])
  @@index([userId])
}
```

---

## 관련 Enum

### TaskStatus (할일 상태)

```prisma
enum TaskStatus {
  TODO         // 할 일
  IN_PROGRESS  // 진행 중
  REVIEW       // 검토 중
  DONE         // 완료
}
```

### Priority (우선순위)

```prisma
enum Priority {
  LOW     // 낮음
  MEDIUM  // 보통
  HIGH    // 높음
  URGENT  // 긴급
}
```

---

## Task vs StudyTask 비교

| 항목 | Task | StudyTask |
|------|------|-----------|
| **범위** | 개인 | 스터디 공유 |
| **소유자** | userId | createdById |
| **스터디 연관** | 선택적 | 필수 |
| **담당자** | 본인만 | 여러 명 지정 가능 |
| **용도** | 개인 일정 관리 | 팀 프로젝트 관리 |

---

## 사용 예시

### 메시지 전송 및 저장

```javascript
const message = await prisma.message.create({
  data: {
    studyId: 'study123',
    userId: 'user456',
    content: '안녕하세요!',
    readers: ['user456']
  },
  include: {
    user: {
      select: { id: true, name: true, avatar: true }
    }
  }
})
```

### 공지사항 생성

```javascript
const notice = await prisma.notice.create({
  data: {
    studyId: 'study123',
    authorId: 'user456',
    title: '중요 공지',
    content: '다음 주 모임이 취소되었습니다.',
    isImportant: true,
    isPinned: true
  }
})
```

### 스터디 할일 생성 (담당자 포함)

```javascript
const task = await prisma.studyTask.create({
  data: {
    studyId: 'study123',
    createdById: 'user456',
    title: 'API 문서 작성',
    description: 'REST API 문서화',
    priority: 'HIGH',
    dueDate: new Date('2025-12-20'),
    assignees: {
      create: [
        { userId: 'user789' },
        { userId: 'user012' }
      ]
    }
  },
  include: {
    assignees: {
      include: { user: true }
    }
  }
})
```

---

## 관련 문서

- [User 모델](./models-user.md) - 사용자 관련 모델
- [Study 모델](./models-study.md) - 스터디 관련 모델
- [Admin 모델](./models-admin.md) - 관리자 관련 모델

