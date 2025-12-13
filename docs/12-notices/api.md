# 📡 공지사항 API

## 개요

스터디 공지사항 관리를 위한 REST API입니다.

---

## 엔드포인트 목록

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/studies/[id]/notices` | 공지 목록 조회 | MEMBER |
| POST | `/api/studies/[id]/notices` | 공지 생성 | ADMIN+ |
| GET | `/api/studies/[id]/notices/[noticeId]` | 공지 상세 조회 | MEMBER |
| PATCH | `/api/studies/[id]/notices/[noticeId]` | 공지 수정 | 작성자/ADMIN+ |
| DELETE | `/api/studies/[id]/notices/[noticeId]` | 공지 삭제 | 작성자/ADMIN+ |
| POST | `/api/studies/[id]/notices/[noticeId]/pin` | 고정 토글 | ADMIN+ |

---

## GET /api/studies/[id]/notices

공지사항 목록을 조회합니다.

### 요청

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| page | number | ❌ | 페이지 번호 (기본: 1) |
| limit | number | ❌ | 페이지 크기 (기본: 10, 최대: 50) |
| pinned | string | ❌ | 'true' = 고정 공지만 |

### 응답

```json
{
  "success": true,
  "data": [
    {
      "id": "notice_123",
      "title": "📢 주간 스터디 일정 안내",
      "content": "이번 주 스터디 일정입니다...",
      "isPinned": true,
      "isImportant": false,
      "views": 45,
      "createdAt": "2024-12-01T00:00:00.000Z",
      "updatedAt": "2024-12-10T00:00:00.000Z",
      "author": {
        "id": "user_123",
        "name": "홍길동",
        "avatar": "/avatars/user_123.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 처리 흐름

```
1. 멤버 권한 확인 (requireStudyMember)
2. 쿼리 파라미터 파싱
3. WHERE 조건 생성 (pinned 필터)
4. 공지 목록 조회 (고정 우선, 최신순)
5. 로깅 (StudyLogger.logNoticeList)
6. 응답 반환
```

### 정렬 순서

```javascript
orderBy: [
  { isPinned: 'desc' },  // 고정 공지 먼저
  { createdAt: 'desc' }  // 최신순
]
```

---

## POST /api/studies/[id]/notices

공지사항을 생성합니다.

### 요청

```json
{
  "title": "📢 주간 스터디 일정 안내",
  "content": "이번 주 스터디 일정입니다...",
  "isPinned": true,
  "isImportant": false
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | string | ✅ | 제목 (2-100자) |
| content | string | ✅ | 내용 (최대 10000자) |
| isPinned | boolean | ❌ | 고정 여부 (최대 3개) |
| isImportant | boolean | ❌ | 중요 표시 |

### 응답

```json
{
  "success": true,
  "data": {
    "id": "notice_456",
    "title": "📢 주간 스터디 일정 안내",
    "content": "이번 주 스터디 일정입니다...",
    "isPinned": true,
    "isImportant": false,
    "views": 0,
    "author": {
      "id": "user_123",
      "name": "홍길동"
    }
  },
  "message": "공지사항이 작성되었습니다"
}
```

### 처리 흐름

```
1. ADMIN 권한 확인 (requireStudyMember(studyId, 'ADMIN'))
2. 요청 본문 파싱
3. 입력 검증
   - 제목: 2-100자, 필수
   - 내용: 최대 10000자, 필수
4. 보안 위협 검증 (validateSecurityThreats)
5. 입력값 정제 (validateAndSanitize)
6. 고정 공지 개수 확인 (최대 3개)
7. 공지사항 생성
8. 멤버들에게 알림 전송
9. 로깅 (StudyLogger.logNoticeCreate)
10. 응답 반환
```

### 보안 검증

```javascript
const titleThreats = validateSecurityThreats(title);
if (!titleThreats.safe) {
  logSecurityEvent('XSS_ATTEMPT_DETECTED', {
    userId: session.user.id,
    studyId,
    field: 'notice_title',
    threats: titleThreats.threats,
  });
  throw StudyNoticeException.titleRequired({
    userMessage: '제목에 허용되지 않는 콘텐츠가 포함되어 있습니다'
  });
}
```

---

## GET /api/studies/[id]/notices/[noticeId]

공지사항 상세 정보를 조회합니다. **조회수가 자동으로 증가**합니다.

### 응답

```json
{
  "success": true,
  "data": {
    "id": "notice_123",
    "title": "📢 주간 스터디 일정 안내",
    "content": "이번 주 스터디 일정입니다...",
    "isPinned": true,
    "isImportant": false,
    "views": 46,
    "createdAt": "2024-12-01T00:00:00.000Z",
    "updatedAt": "2024-12-10T00:00:00.000Z",
    "author": {
      "id": "user_123",
      "name": "홍길동",
      "avatar": "/avatars/user_123.jpg"
    }
  }
}
```

### 처리 흐름

```
1. 멤버 권한 확인 (requireStudyMember)
2. 공지사항 조회
3. 존재 여부 및 스터디 일치 확인
4. 조회수 증가 (views: { increment: 1 })
5. 로깅 (StudyLogger.logNoticeView)
6. 응답 반환
```

---

## PATCH /api/studies/[id]/notices/[noticeId]

공지사항을 수정합니다.

### 요청

```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "isPinned": false,
  "isImportant": true
}
```

> 모든 필드 선택적

### 응답

```json
{
  "success": true,
  "data": {
    "id": "notice_123",
    "title": "수정된 제목",
    "content": "수정된 내용",
    "isPinned": false,
    "isImportant": true,
    "author": {...}
  },
  "message": "공지사항이 수정되었습니다"
}
```

### 처리 흐름

```
1. ADMIN 권한 확인 (requireStudyMember(studyId, 'ADMIN'))
2. 공지사항 존재 확인
3. 스터디 일치 확인
4. 수정 권한 확인 (작성자 또는 ADMIN+)
5. 입력 검증
6. 공지사항 수정
7. 로깅 (StudyLogger.logNoticeUpdate)
8. 응답 반환
```

---

## DELETE /api/studies/[id]/notices/[noticeId]

공지사항을 삭제합니다.

### 응답

```json
{
  "success": true,
  "data": null,
  "message": "공지사항이 삭제되었습니다"
}
```

### 처리 흐름

```
1. ADMIN 권한 확인 (requireStudyMember(studyId, 'ADMIN'))
2. 공지사항 존재 확인
3. 스터디 일치 확인
4. 삭제 권한 확인 (작성자 또는 ADMIN+)
5. 공지사항 삭제
6. 로깅 (StudyLogger.logNoticeDelete)
7. 응답 반환
```

---

## POST /api/studies/[id]/notices/[noticeId]/pin

공지사항 고정/해제를 토글합니다.

### 응답

```json
{
  "success": true,
  "data": {
    "id": "notice_123",
    "title": "공지 제목",
    "isPinned": true,
    ...
  },
  "message": "공지사항을 고정했습니다"
}
```

또는

```json
{
  "success": true,
  "data": {...},
  "message": "공지사항 고정을 해제했습니다"
}
```

### 처리 흐름

```
1. ADMIN 권한 확인 (requireStudyMember(studyId, 'ADMIN'))
2. 공지사항 조회
3. 존재 여부 및 스터디 일치 확인
4. 고정하려는 경우: 최대 3개 제한 체크
5. 고정/해제 토글
6. 로깅 (StudyLogger.logNoticeUpdate)
7. 응답 반환
```

### 고정 제한

```javascript
if (!notice.isPinned) {  // 고정하려는 경우
  const pinnedCount = await prisma.notice.count({
    where: { studyId, isPinned: true }
  });

  if (pinnedCount >= 3) {
    throw StudyNoticeException.pinnedNoticeLimitExceeded(pinnedCount, 3);
  }
}
```

---

## React Query Hooks

### useNotices

```javascript
export function useNotices(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'notices', params],
    queryFn: () => api.get(`/api/studies/${studyId}/notices`, params),
    enabled: !!studyId,
  });
}
```

### useCreateNotice

```javascript
export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studyId, data }) => 
      api.post(`/api/studies/${studyId}/notices`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return key[0] === 'studies' && key[1] === variables.studyId && key[2] === 'notices';
        }
      });
    },
  });
}
```

### useTogglePinNotice

```javascript
export function useTogglePinNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studyId, noticeId }) => 
      api.post(`/api/studies/${studyId}/notices/${noticeId}/pin`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return key[0] === 'studies' && key[1] === variables.studyId && key[2] === 'notices';
        }
      });
    },
  });
}
```

---

## 에러 코드

| HTTP | 코드 | 설명 |
|------|------|------|
| 400 | STUDY-116 | 제목 필수 |
| 400 | STUDY-117 | 제목 길이 초과 (100자) |
| 400 | STUDY-118 | 내용 필수 |
| 400 | STUDY-121 | 고정 공지 제한 (3개) |
| 403 | NOTICE_ACCESS_DENIED | 수정/삭제 권한 없음 |
| 404 | STUDY-119 | 공지 없음 |

---

## 관련 문서

- [README](./README.md)
- [화면](./screens.md)
- [예외](./exceptions.md)

