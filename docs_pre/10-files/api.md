# 📡 파일 API

## 개요

스터디 파일 관리를 위한 REST API입니다.

---

## 엔드포인트 목록

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/studies/[id]/files` | 파일 목록 조회 |
| POST | `/api/studies/[id]/files` | 파일 업로드 |
| DELETE | `/api/studies/[id]/files/[fileId]` | 파일 삭제 |
| GET | `/api/studies/[id]/files/[fileId]/download` | 파일 다운로드 |

---

## GET /api/studies/[id]/files

파일 목록을 조회합니다.

### 요청

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| page | number | ❌ | 페이지 번호 (기본: 1) |
| limit | number | ❌ | 페이지 크기 (기본: 20, 최대: 100) |
| folderId | string | ❌ | 폴더 ID (null: 루트) |

### 응답

```json
{
  "success": true,
  "data": [
    {
      "id": "file_123",
      "name": "프로젝트_문서.pdf",
      "size": 1048576,
      "type": "application/pdf",
      "url": "/uploads/study_123/user_123_1701388800000_프로젝트-문서.pdf",
      "downloads": 5,
      "createdAt": "2024-12-01T00:00:00.000Z",
      "uploader": {
        "id": "user_123",
        "name": "홍길동",
        "avatar": "/avatars/user_123.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 처리 흐름

```
1. 멤버 권한 확인 (requireStudyMember)
2. 쿼리 파라미터 파싱 및 검증
3. WHERE 조건 생성 (folderId)
4. 파일 목록 조회 (페이지네이션)
5. 로깅 (StudyLogger.logFileList)
6. 응답 반환
```

---

## POST /api/studies/[id]/files

파일을 업로드합니다.

### 요청

**Content-Type**: `multipart/form-data`

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| file | File | ✅ | 업로드할 파일 |
| folderId | string | ❌ | 저장할 폴더 ID |
| category | string | ❌ | 파일 카테고리 (자동 감지) |

### 응답

```json
{
  "success": true,
  "data": {
    "id": "file_456",
    "name": "스터디자료.pdf",
    "size": 2097152,
    "type": "application/pdf",
    "url": "/uploads/study_123/user_123_1701388800000_스터디자료.pdf",
    "uploader": {
      "id": "user_123",
      "name": "홍길동"
    },
    "storage": {
      "usagePercentage": "15.50",
      "used": "158.50MB",
      "quota": "1024.00MB"
    }
  },
  "message": "파일이 업로드되었습니다"
}
```

### 처리 흐름

```
1. 멤버 권한 확인 (requireStudyMember)
2. FormData 파싱
3. 파일 유효성 검사
   - 파일 존재 여부
   - 파일 객체 유효성
4. 파일명 정제 (sanitizeFilename)
5. 파일 크기 검증 (10MB 제한)
6. 파일 버퍼 읽기
7. 파일 보안 검증 (validateFileSecurity)
   - 확장자 검증
   - MIME 타입 검증
   - 매직 넘버 검증
   - 악성 코드 패턴 탐지
8. 저장 공간 확인 (1GB/스터디)
9. uploads 디렉토리 생성
10. 안전한 파일명 생성 (generateSafeFilename)
11. 파일 저장 (writeFile)
12. DB에 파일 정보 저장
13. 멤버들에게 알림 전송
14. 로깅 (StudyLogger.logFileUpload)
15. 응답 반환
```

### 카테고리 자동 감지

```javascript
const getAutoCategory = (filename) => {
  const ext = filename.toLowerCase().split('.').pop();
  
  // 이미지
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', ...].includes(ext)) {
    return 'IMAGE';
  }
  // 비디오
  if (['mp4', 'avi', 'mov', ...].includes(ext)) {
    return 'VIDEO';
  }
  // 오디오
  if (['mp3', 'wav', 'ogg', ...].includes(ext)) {
    return 'AUDIO';
  }
  // 압축
  if (['zip', 'rar', '7z', ...].includes(ext)) {
    return 'ARCHIVE';
  }
  // 코드
  if (['js', 'jsx', 'ts', 'py', ...].includes(ext)) {
    return 'CODE';
  }
  // 기본: 문서
  return 'DOCUMENT';
};
```

---

## DELETE /api/studies/[id]/files/[fileId]

파일을 삭제합니다.

### 요청

**Path Parameters**

| 파라미터 | 설명 |
|----------|------|
| id | 스터디 ID |
| fileId | 파일 ID |

### 응답

```json
{
  "success": true,
  "data": null,
  "message": "파일이 삭제되었습니다"
}
```

### 처리 흐름

```
1. 멤버 권한 확인 (requireStudyMember)
2. 파일 조회
3. 파일 존재 확인
4. 스터디 일치 확인
5. 삭제 권한 확인 (업로더 또는 OWNER/ADMIN)
6. 파일 시스템에서 삭제 (unlink)
7. DB에서 파일 정보 삭제
8. 로깅 (StudyLogger.logFileDelete)
9. 응답 반환
```

### 권한 규칙

| 역할 | 자신의 파일 | 타인의 파일 |
|------|-------------|-------------|
| OWNER | ✅ | ✅ |
| ADMIN | ✅ | ✅ |
| MEMBER | ✅ | ❌ |

---

## GET /api/studies/[id]/files/[fileId]/download

파일을 다운로드합니다.

### 요청

**Path Parameters**

| 파라미터 | 설명 |
|----------|------|
| id | 스터디 ID |
| fileId | 파일 ID |

### 응답

**Headers**

```
Content-Type: application/pdf (파일 타입에 따라)
Content-Disposition: attachment; filename="파일명.pdf"
Content-Length: 2097152
X-File-Id: file_456
X-Uploader: 홍길동
```

**Body**: 파일 바이너리 데이터

### 처리 흐름

```
1. 멤버 권한 확인 (requireStudyMember)
2. 파일 정보 조회 (uploader 포함)
3. 파일 존재 확인
4. 스터디 일치 확인 (보안)
5. 물리적 파일 존재 확인
6. 트랜잭션:
   - 다운로드 횟수 증가
   - 다운로드 로그 기록
7. 파일 읽기 (readFile)
8. 파일 응답 반환
```

### 다운로드 로그

```javascript
prisma.fileDownloadLog.create({
  data: {
    fileId,
    userId: session.user.id,
    studyId,
    ip: request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent')
  }
})
```

---

## React Query Hooks

### useFiles

```javascript
export function useFiles(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'files', params],
    queryFn: () => api.get(`/api/studies/${studyId}/files`, params),
    enabled: !!studyId,
  });
}
```

### useUploadFile

```javascript
export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studyId, formData }) => 
      api.post(`/api/studies/${studyId}/files`, formData, { headers: {} }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'files']);
    },
  });
}
```

### useDeleteFile

```javascript
export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studyId, fileId }) => 
      api.delete(`/api/studies/${studyId}/files/${fileId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'files']);
    },
  });
}
```

---

## 에러 응답

| HTTP | 코드 | 설명 |
|------|------|------|
| 400 | STUDY-086 | 파일 미선택 |
| 400 | STUDY-088 | 허용되지 않은 파일 형식 |
| 400 | STUDY-091 | 파일명 너무 김 |
| 403 | STUDY-089 | 악성 파일 감지 |
| 403 | STUDY-094 | 삭제 권한 없음 |
| 404 | STUDY-093 | 파일 없음 |
| 413 | STUDY-087 | 파일 크기 초과 |
| 500 | STUDY-092 | 업로드 실패 |
| 507 | STUDY-090 | 저장 공간 부족 |

---

## 관련 문서

- [README](./README.md)
- [화면](./screens.md)
- [보안](./security.md)
- [예외](./exceptions.md)

