# 공지사항 API (Announcement API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/announcements`

## 개요

사업장 공지사항 관리 API입니다.

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 | 권한 |
|--------|-----------|------|:----:|------|
| POST | `/announcements` | 공지사항 작성 | ✅ | 사업주 |
| GET | `/announcements` | 공지사항 목록 | ✅ | 멤버 |
| GET | `/announcements/{id}` | 공지사항 상세 | ✅ | 멤버 |
| PUT | `/announcements/{id}` | 공지사항 수정 | ✅ | 작성자 |
| DELETE | `/announcements/{id}` | 공지사항 삭제 | ✅ | 작성자 |
| POST | `/announcements/{id}/read` | 읽음 처리 | ✅ | 멤버 |
| GET | `/announcements/{id}/readers` | 읽은 사람 목록 | ✅ | 사업주 |
| POST | `/announcements/{id}/comments` | 댓글 작성 | ✅ | 멤버 |
| GET | `/announcements/unread-count` | 읽지 않은 공지 수 | ✅ | 멤버 |
| DELETE | `/comments/{id}` | 댓글 삭제 | ✅ | 작성자 |

---

## 1. 공지사항 작성

새로운 공지사항을 작성합니다.

### Request

```http
POST /announcements
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| title | string | ✅ | 제목 |
| content | string | ✅ | 내용 |
| isPinned | boolean | ❌ | 상단 고정 여부 |
| attachments | array | ❌ | 첨부파일 URL 목록 |

```json
{
  "workplaceId": 1,
  "title": "12월 급여일 안내",
  "content": "12월 급여는 1월 10일에 지급됩니다.\n\n문의사항은 사무실로 연락 부탁드립니다.",
  "isPinned": true,
  "attachments": [
    "https://s3.bizone.kr/attachments/salary-guide.pdf"
  ]
}
```

### Response

#### 성공 (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "authorId": 3,
    "authorName": "이사업",
    "title": "12월 급여일 안내",
    "content": "12월 급여는 1월 10일에 지급됩니다.\n\n문의사항은 사무실로 연락 부탁드립니다.",
    "isPinned": true,
    "attachments": [
      {
        "url": "https://s3.bizone.kr/attachments/salary-guide.pdf",
        "name": "salary-guide.pdf",
        "size": 102400
      }
    ],
    "viewCount": 0,
    "commentCount": 0,
    "isRead": true,
    "createdAt": "2024-12-27T10:00:00",
    "updatedAt": "2024-12-27T10:00:00"
  },
  "message": "공지사항이 작성되었습니다",
  "timestamp": "2024-12-27T10:00:00"
}
```

### 프론트엔드 연동

- 공지사항 작성 화면 제공
- 파일 첨부 기능 (이미지, PDF 등)
- 상단 고정 토글

---

## 2. 공지사항 목록

공지사항 목록을 조회합니다.

### Request

```http
GET /announcements?workplaceId=1&page=0&size=20&sort=createdAt,desc
Authorization: Bearer {accessToken}
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| page | int | ❌ | 페이지 번호 |
| size | int | ❌ | 페이지 크기 |
| sort | string | ❌ | 정렬 |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "workplaceId": 1,
        "workplaceName": "카페 BizOne 강남점",
        "authorId": 3,
        "authorName": "이사업",
        "title": "12월 급여일 안내",
        "content": "12월 급여는 1월 10일에 지급됩니다.\n\n문의사항은 사무실로 연락 부탁드립니다.",
        "isPinned": true,
        "attachments": [],
        "viewCount": 15,
        "commentCount": 3,
        "isRead": true,
        "createdAt": "2024-12-27T10:00:00",
        "updatedAt": "2024-12-27T10:00:00"
      },
      {
        "id": 2,
        "workplaceId": 1,
        "workplaceName": "카페 BizOne 강남점",
        "authorId": 3,
        "authorName": "이사업",
        "title": "연말 일정 안내",
        "content": "12월 31일은 조기 마감 예정입니다.",
        "isPinned": false,
        "attachments": [],
        "viewCount": 10,
        "commentCount": 0,
        "isRead": false,
        "createdAt": "2024-12-26T14:00:00",
        "updatedAt": "2024-12-26T14:00:00"
      }
    ],
    "totalElements": 2,
    "totalPages": 1,
    "size": 20,
    "number": 0,
    "first": true,
    "last": true,
    "empty": false
  },
  "timestamp": "2024-12-27T11:00:00"
}
```

### 프론트엔드 연동

- 공지사항 목록 화면
- 상단 고정 공지 구분 표시
- 읽지 않은 공지 강조
- 무한 스크롤 또는 페이지네이션

---

## 3. 공지사항 상세 조회

공지사항 상세 정보를 조회합니다.

### Request

```http
GET /announcements/{id}?workplaceId=1
Authorization: Bearer {accessToken}
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| id | long | ✅ | 공지사항 ID |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "authorId": 3,
    "authorName": "이사업",
    "authorProfileImage": null,
    "title": "12월 급여일 안내",
    "content": "12월 급여는 1월 10일에 지급됩니다.\n\n문의사항은 사무실로 연락 부탁드립니다.",
    "isPinned": true,
    "attachments": [
      {
        "url": "https://s3.bizone.kr/attachments/salary-guide.pdf",
        "name": "salary-guide.pdf",
        "size": 102400
      }
    ],
    "viewCount": 16,
    "commentCount": 3,
    "isRead": true,
    "comments": [
      {
        "id": 1,
        "authorId": 5,
        "authorName": "박직원",
        "authorProfileImage": null,
        "content": "확인했습니다.",
        "createdAt": "2024-12-27T10:30:00"
      },
      {
        "id": 2,
        "authorId": 6,
        "authorName": "김직원",
        "authorProfileImage": null,
        "content": "감사합니다.",
        "createdAt": "2024-12-27T11:00:00"
      }
    ],
    "createdAt": "2024-12-27T10:00:00",
    "updatedAt": "2024-12-27T10:00:00"
  },
  "timestamp": "2024-12-27T11:30:00"
}
```

### 프론트엔드 연동

- 상세 조회 시 자동 읽음 처리 (별도 API 호출 불필요 시)
- 댓글 목록 표시
- 첨부파일 다운로드 기능

---

## 4. 공지사항 수정

공지사항을 수정합니다.

### Request

```http
PUT /announcements/{id}?workplaceId=1
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| title | string | ❌ | 제목 |
| content | string | ❌ | 내용 |
| isPinned | boolean | ❌ | 상단 고정 여부 |
| attachments | array | ❌ | 첨부파일 URL 목록 |

```json
{
  "title": "12월 급여일 안내 (수정)",
  "content": "12월 급여는 1월 10일에 지급됩니다.\n추가: 연장수당 별도 지급 예정"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "12월 급여일 안내 (수정)",
    "content": "12월 급여는 1월 10일에 지급됩니다.\n추가: 연장수당 별도 지급 예정",
    "updatedAt": "2024-12-27T12:00:00"
  },
  "message": "공지사항이 수정되었습니다",
  "timestamp": "2024-12-27T12:00:00"
}
```

---

## 5. 공지사항 삭제

공지사항을 삭제합니다.

### Request

```http
DELETE /announcements/{id}?workplaceId=1
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "공지사항이 삭제되었습니다",
  "timestamp": "2024-12-27T12:00:00"
}
```

---

## 6. 읽음 처리

공지사항을 읽음 처리합니다.

### Request

```http
POST /announcements/{id}/read
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "읽음 처리되었습니다",
  "timestamp": "2024-12-27T11:30:00"
}
```

### 프론트엔드 연동

- 상세 화면 진입 시 자동 호출
- 목록에서 읽음 상태 업데이트

---

## 7. 읽은 사람 목록

공지사항을 읽은 사람 목록을 조회합니다 (관리자용).

### Request

```http
GET /announcements/{id}/readers?workplaceId=1
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "userId": 5,
      "userName": "박직원",
      "profileImageUrl": null,
      "readAt": "2024-12-27T10:30:00"
    },
    {
      "userId": 6,
      "userName": "김직원",
      "profileImageUrl": null,
      "readAt": "2024-12-27T11:00:00"
    }
  ],
  "timestamp": "2024-12-27T12:00:00"
}
```

---

## 8. 댓글 작성

공지사항에 댓글을 작성합니다.

### Request

```http
POST /announcements/{id}/comments?workplaceId=1
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| content | string | ✅ | 댓글 내용 |

```json
{
  "content": "확인했습니다."
}
```

### Response

#### 성공 (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 3,
    "authorId": 5,
    "authorName": "박직원",
    "authorProfileImage": null,
    "content": "확인했습니다.",
    "createdAt": "2024-12-27T12:30:00"
  },
  "message": "댓글이 작성되었습니다",
  "timestamp": "2024-12-27T12:30:00"
}
```

---

## 9. 읽지 않은 공지 수

읽지 않은 공지사항 수를 조회합니다.

### Request

```http
GET /announcements/unread-count?workplaceId=1
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": 2,
  "timestamp": "2024-12-27T12:00:00"
}
```

### 프론트엔드 연동

- 하단 탭 또는 메뉴에 뱃지 표시
- 주기적 폴링 또는 푸시 알림 연동

---

## 10. 댓글 삭제

댓글을 삭제합니다.

### Request

```http
DELETE /comments/{id}
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "댓글이 삭제되었습니다",
  "timestamp": "2024-12-27T13:00:00"
}
```

---

## 타입 정의

### AnnouncementResponse

```typescript
interface AnnouncementResponse {
  id: number;
  workplaceId: number;
  workplaceName: string;
  authorId: number;
  authorName: string;
  authorProfileImage?: string;
  title: string;
  content: string;
  isPinned: boolean;
  attachments: Attachment[];
  viewCount: number;
  commentCount: number;
  isRead: boolean;
  comments?: CommentResponse[];
  createdAt: string;
  updatedAt: string;
}

interface Attachment {
  url: string;
  name: string;
  size: number;
}

interface CommentResponse {
  id: number;
  authorId: number;
  authorName: string;
  authorProfileImage: string | null;
  content: string;
  createdAt: string;
}

interface ReaderResponse {
  userId: number;
  userName: string;
  profileImageUrl: string | null;
  readAt: string;
}
```

---

## 관련 문서

- [공통 규격](./00-common.md)
- [화면 설계 - 공지사항](../05_screens/06_announcement/README.md)

