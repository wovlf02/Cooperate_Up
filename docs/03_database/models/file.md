# 📁 File 모델

## 📋 개요

`File` 모델은 스터디에 업로드된 파일 정보를 저장합니다. 이미지, 문서, 영상 등 다양한 파일 유형을 지원합니다.

---

## 📊 스키마 정의

### File (파일)

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

### NoticeFile (공지사항 첨부파일)

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

## 🏷️ File 필드 상세

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✅ | cuid() | 고유 식별자 |
| `studyId` | String | ✅ | - | 스터디 ID (FK) |
| `uploaderId` | String | ✅ | - | 업로더 ID (FK) |
| `name` | String | ✅ | - | 파일명 |
| `size` | Int | ✅ | - | 파일 크기 (bytes) |
| `type` | String | ✅ | - | MIME 타입 |
| `url` | String | ✅ | - | 저장 URL |
| `folderId` | String | ❌ | null | 폴더 ID (폴더 정리용) |
| `downloads` | Int | ✅ | 0 | 다운로드 횟수 |
| `createdAt` | DateTime | ✅ | now() | 업로드 일시 |

---

## 🔗 관계 (Relations)

### File 관계

| 관계 | 대상 모델 | 관계 유형 | 설명 |
|------|----------|----------|------|
| `study` | Study | N:1 | 소속 스터디 |
| `uploader` | User | N:1 | 업로드한 사용자 |
| `messages` | Message[] | 1:N | 첨부된 메시지들 |
| `noticeFiles` | NoticeFile[] | 1:N | 첨부된 공지사항들 |

---

## 🔍 인덱스

| 인덱스 | 필드 | 용도 |
|--------|------|------|
| `@@index([studyId, folderId])` | studyId, folderId | 스터디별 폴더별 파일 조회 |
| `@@index([uploaderId])` | uploaderId | 업로더별 파일 조회 |

---

## 📂 지원 파일 유형

### 이미지

| MIME 타입 | 확장자 |
|-----------|--------|
| `image/jpeg` | .jpg, .jpeg |
| `image/png` | .png |
| `image/gif` | .gif |
| `image/webp` | .webp |

### 문서

| MIME 타입 | 확장자 |
|-----------|--------|
| `application/pdf` | .pdf |
| `application/msword` | .doc |
| `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | .docx |
| `application/vnd.ms-excel` | .xls |
| `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | .xlsx |
| `text/plain` | .txt |

### 압축 파일

| MIME 타입 | 확장자 |
|-----------|--------|
| `application/zip` | .zip |
| `application/x-rar-compressed` | .rar |

---

## 💡 사용 예시

### 파일 업로드 기록
```javascript
const file = await prisma.file.create({
  data: {
    studyId: 'study-id',
    uploaderId: userId,
    name: 'React_강의노트.pdf',
    size: 1024000, // 1MB
    type: 'application/pdf',
    url: 'https://storage.coup.app/files/xxx.pdf',
  }
});
```

### 스터디 파일 목록 조회
```javascript
const files = await prisma.file.findMany({
  where: { studyId: 'study-id' },
  include: {
    uploader: { select: { name: true, avatar: true } }
  },
  orderBy: { createdAt: 'desc' }
});
```

### 파일 다운로드 카운트 증가
```javascript
await prisma.file.update({
  where: { id: 'file-id' },
  data: { downloads: { increment: 1 } }
});
```

### 폴더별 파일 조회
```javascript
const files = await prisma.file.findMany({
  where: {
    studyId: 'study-id',
    folderId: 'folder-id' // null이면 루트 폴더
  }
});
```

### 공지사항에 파일 첨부
```javascript
await prisma.noticeFile.create({
  data: {
    noticeId: 'notice-id',
    fileId: 'file-id'
  }
});
```

### 파일 크기 포맷팅
```javascript
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 사용 예: formatFileSize(1024000) → "1000 KB"
```

---

## 🔒 파일 업로드 제한

| 항목 | 제한 |
|------|------|
| 최대 파일 크기 | 10MB |
| 허용 확장자 | 이미지, 문서, 압축 파일 |
| 금지 확장자 | .exe, .bat, .sh, .js 등 실행 파일 |

---

## 🔗 관련 문서

- [스터디 모델](./study.md)
- [메시지 모델](./message.md)
- [파일 업로드 API](../../04_api/upload/README.md)
