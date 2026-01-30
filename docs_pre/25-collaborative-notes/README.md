# 📓 클라우드 메모장 (협업 노트)

## 개요

스터디 멤버들이 실시간으로 함께 문서를 편집하고, 어려운 문제를 토론하며,
학습 자료를 정리할 수 있는 협업 메모장 시스템입니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 실시간 협업 편집 | 여러 사용자가 동시에 문서 편집 |
| 마크다운 지원 | Markdown 문법으로 문서 작성 |
| 수학 수식 | LaTeX 수식 렌더링 |
| 코드 블록 | 구문 강조된 코드 블록 |
| 이미지 삽입 | 이미지 업로드 및 삽입 |
| 파일 첨부 | PDF, 문서 파일 첨부 |
| 버전 관리 | 편집 이력, 롤백 기능 |
| 폴더 구조 | 폴더로 노트 정리 |
| 검색 | 노트 내용 전문 검색 |
| 댓글 | 특정 부분에 댓글/토론 |
| 내보내기 | PDF, Markdown, HTML 내보내기 |
| 템플릿 | 문제풀이, 회의록 등 템플릿 |

---

## 기술 선택

### 실시간 협업 에디터 옵션

| 옵션 | 장점 | 단점 |
|------|------|------|
| **Yjs** | 오픈소스, CRDT 기반 | 학습 곡선 |
| **Socket.IO + OT** | 기존 인프라 활용 | 복잡한 충돌 해결 |
| **Liveblocks** | 사용 편리 | 유료 |
| **Tiptap + Yjs** | 풍부한 에디터 | 설정 복잡 |

### 추천: Tiptap + Yjs

- Tiptap: ProseMirror 기반 풍부한 WYSIWYG 에디터
- Yjs: 실시간 협업을 위한 CRDT
- 기존 Socket.IO 서버와 연동 가능

---

## 데이터 모델

### NoteFolder (폴더)

```prisma
model NoteFolder {
  id       String  @id @default(cuid())
  studyId  String
  parentId String? // 상위 폴더 (null이면 루트)
  
  name     String
  color    String? // 폴더 색상
  order    Int     @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  study    Study       @relation(fields: [studyId], references: [id], onDelete: Cascade)
  parent   NoteFolder? @relation("FolderHierarchy", fields: [parentId], references: [id])
  children NoteFolder[] @relation("FolderHierarchy")
  notes    Note[]
  
  @@index([studyId, parentId])
}
```

### Note (노트)

```prisma
model Note {
  id        String  @id @default(cuid())
  studyId   String
  folderId  String?
  createdById String
  
  title     String
  content   Json    // Tiptap JSON 형식
  plainText String  @db.Text  // 검색용 평문
  
  // 설정
  isPublic  Boolean @default(false)  // 스터디 외부 공개
  isPinned  Boolean @default(false)  // 상단 고정
  isLocked  Boolean @default(false)  // 편집 잠금
  
  // 연결된 문제 (퀴즈 시스템 연동)
  linkedQuestionIds String[]
  
  // 메타
  coverImage String?
  tags       String[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  study     Study       @relation(fields: [studyId], references: [id], onDelete: Cascade)
  folder    NoteFolder? @relation(fields: [folderId], references: [id], onDelete: SetNull)
  createdBy User        @relation(fields: [createdById], references: [id])
  
  versions     NoteVersion[]
  comments     NoteComment[]
  attachments  NoteAttachment[]
  collaborators NoteCollaborator[]
  
  @@index([studyId, folderId])
  @@index([createdById])
  @@fulltext([plainText])  // 전문 검색
}
```

### NoteVersion (버전 관리)

```prisma
model NoteVersion {
  id       String @id @default(cuid())
  noteId   String
  userId   String // 편집자
  
  content  Json   // 해당 버전의 전체 내용
  summary  String? // 변경 요약
  
  createdAt DateTime @default(now())
  
  note Note @relation(fields: [noteId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id])
  
  @@index([noteId, createdAt])
}
```

### NoteComment (댓글)

```prisma
model NoteComment {
  id       String @id @default(cuid())
  noteId   String
  userId   String
  parentId String?  // 대댓글
  
  content  String @db.Text
  
  // 텍스트 범위 선택 (특정 부분에 댓글)
  selectionStart Int?
  selectionEnd   Int?
  
  resolved Boolean @default(false)  // 해결됨 표시
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  note     Note          @relation(fields: [noteId], references: [id], onDelete: Cascade)
  user     User          @relation(fields: [userId], references: [id])
  parent   NoteComment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies  NoteComment[] @relation("CommentReplies")
  
  @@index([noteId])
  @@index([userId])
}
```

### NoteAttachment (첨부파일)

```prisma
model NoteAttachment {
  id     String @id @default(cuid())
  noteId String
  fileId String
  
  createdAt DateTime @default(now())
  
  note Note @relation(fields: [noteId], references: [id], onDelete: Cascade)
  file File @relation(fields: [fileId], references: [id], onDelete: Cascade)
  
  @@unique([noteId, fileId])
}
```

### NoteCollaborator (협업자)

```prisma
model NoteCollaborator {
  id      String @id @default(cuid())
  noteId  String
  userId  String
  
  permission NotePermission @default(VIEWER)
  lastAccessedAt DateTime?
  
  createdAt DateTime @default(now())
  
  note Note @relation(fields: [noteId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([noteId, userId])
}

enum NotePermission {
  VIEWER   // 읽기만
  EDITOR   // 편집 가능
  OWNER    // 모든 권한
}
```

---

## API 엔드포인트

### 폴더

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/studies/[id]/notes/folders` | 폴더 트리 조회 |
| POST | `/api/studies/[id]/notes/folders` | 폴더 생성 |
| PATCH | `/api/notes/folders/[id]` | 폴더 수정 |
| DELETE | `/api/notes/folders/[id]` | 폴더 삭제 |

### 노트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/studies/[id]/notes` | 노트 목록 |
| POST | `/api/studies/[id]/notes` | 노트 생성 |
| GET | `/api/notes/[id]` | 노트 상세 |
| PATCH | `/api/notes/[id]` | 노트 수정 |
| DELETE | `/api/notes/[id]` | 노트 삭제 |
| POST | `/api/notes/[id]/duplicate` | 노트 복제 |
| GET | `/api/notes/[id]/export` | 내보내기 |

### 버전

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/notes/[id]/versions` | 버전 이력 |
| GET | `/api/notes/[id]/versions/[versionId]` | 특정 버전 |
| POST | `/api/notes/[id]/versions/[versionId]/restore` | 버전 복원 |

### 댓글

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/notes/[id]/comments` | 댓글 목록 |
| POST | `/api/notes/[id]/comments` | 댓글 작성 |
| PATCH | `/api/notes/comments/[id]` | 댓글 수정 |
| DELETE | `/api/notes/comments/[id]` | 댓글 삭제 |
| POST | `/api/notes/comments/[id]/resolve` | 해결됨 표시 |

### 실시간 협업

| Method | Endpoint | 설명 |
|--------|----------|------|
| WS | `/api/notes/[id]/collaborate` | WebSocket 연결 |
| POST | `/api/notes/[id]/presence` | 현재 편집자 등록 |

---

## 컴포넌트 구조

```
src/components/notes/
├── NoteEditor.jsx          # Tiptap 에디터 메인
├── NoteToolbar.jsx         # 편집 도구 모음
├── NoteSidebar.jsx         # 폴더 트리 + 노트 목록
├── FolderTree.jsx          # 폴더 트리 컴포넌트
├── NoteList.jsx            # 노트 목록
├── NoteCard.jsx            # 노트 카드 (미리보기)
├── CollaboratorList.jsx    # 현재 편집 중인 사용자
├── CollaboratorCursor.jsx  # 협업자 커서 표시
├── CommentPanel.jsx        # 댓글 패널
├── CommentThread.jsx       # 댓글 스레드
├── VersionHistory.jsx      # 버전 이력
├── VersionDiff.jsx         # 버전 비교
├── NoteTemplates.jsx       # 템플릿 선택
├── ExportModal.jsx         # 내보내기 모달
├── MathBlock.jsx           # LaTeX 수식 블록
├── CodeBlock.jsx           # 코드 블록
└── index.js
```

---

## 페이지 구조

| 경로 | URL | 설명 |
|------|-----|------|
| `src/app/my-studies/[id]/notes/page.jsx` | `/my-studies/[id]/notes` | 스터디 노트 목록 |
| `src/app/my-studies/[id]/notes/[noteId]/page.jsx` | `/my-studies/[id]/notes/[noteId]` | 노트 편집 |
| `src/app/notes/templates/page.jsx` | `/notes/templates` | 템플릿 갤러리 |

---

## 실시간 협업 (Yjs + Socket.IO)

### 연결 흐름

```
1. 노트 페이지 진입
2. Yjs Document 생성
3. Socket.IO로 방 입장 (note:join)
4. 기존 문서 상태 동기화
5. 편집 시 Yjs Update → Socket.IO 브로드캐스트
6. 다른 사용자의 Update 수신 → Yjs 적용 → UI 반영
```

### Socket.IO 이벤트

| 이벤트 | 방향 | 설명 |
|--------|------|------|
| `note:join` | Client → Server | 노트 방 입장 |
| `note:leave` | Client → Server | 노트 방 퇴장 |
| `note:sync` | Server → Client | 초기 문서 동기화 |
| `note:update` | Bidirectional | 문서 변경 사항 |
| `note:awareness` | Bidirectional | 커서 위치, 선택 범위 |
| `note:save` | Client → Server | 명시적 저장 |
| `note:presence` | Server → Client | 현재 편집자 목록 |

---

## UI/UX 설계

### 노트 편집 화면

```
┌───────────────────────────────────────────────────────────────┐
│ [📁 폴더] [노트 제목                    ] [💾][📤][👥 3명 편집중]│
├─────────────────┬─────────────────────────────────────────────┤
│ 📁 공부 자료    │  # 미분 문제 풀이                            │
│  └📁 수학       │                                             │
│    └📄 미분     │  ## 문제 1                                  │
│    └📄 적분     │  다음 함수를 미분하시오.                      │
│  └📁 영어       │                                             │
│ + 새 폴더       │  $f(x) = x^2 + 3x + 2$                      │
│                 │                                             │
│ 📄 최근 노트    │  ### 풀이                                   │
│  └ 오늘의 정리  │  $f'(x) = 2x + 3$                           │
│  └ 문법 정리    │                                             │
│                 │  > 🗨️ @철수: 여기 왜 3이 되는 거야?           │
│                 │                                             │
├─────────────────┼─────────────────────────────────────────────┤
│                 │  📎 첨부파일: 수학공식.pdf                   │
└─────────────────┴─────────────────────────────────────────────┘
```

---

## 노트 템플릿

### 기본 제공 템플릿

| 템플릿 | 용도 |
|--------|------|
| 문제 풀이 | 문제, 풀이, 해설 구조 |
| 회의록 | 참석자, 안건, 결정사항 |
| 오답 정리 | 문제, 오답, 정답, 이유 |
| 강의 노트 | 날짜, 주제, 핵심 내용 |
| 영어 단어장 | 단어, 뜻, 예문 |

---

## 필요 패키지

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-collaboration @tiptap/extension-collaboration-cursor
npm install yjs y-websocket y-prosemirror
npm install katex  # 수학 수식
npm install highlight.js  # 코드 하이라이팅
```

---

## 구현 우선순위

1. **Phase 1**: 기본 노트 CRUD, 폴더 구조
2. **Phase 2**: Tiptap 에디터 설정, 마크다운
3. **Phase 3**: Yjs 실시간 협업
4. **Phase 4**: 수학 수식, 코드 블록
5. **Phase 5**: 댓글 시스템
6. **Phase 6**: 버전 관리, 내보내기

---

## 관련 문서

- [24-quiz-system](../24-quiz-system/README.md) - 문제 연동
- [10-files](../10-files/README.md) - 파일 첨부
- [09-chat](../09-chat/README.md) - 실시간 통신

