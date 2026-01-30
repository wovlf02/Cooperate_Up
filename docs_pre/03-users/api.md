# 🔌 사용자 API

## 엔드포인트 목록

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/auth/me` | 현재 사용자 정보 | ✓ |
| GET | `/api/user/profile` | 프로필 조회 | ✓ |
| PUT | `/api/user/profile` | 프로필 수정 | ✓ |
| GET | `/api/user/stats` | 활동 통계 | ✓ |
| GET | `/api/users/[id]` | 특정 사용자 공개 정보 | ✓ |

---

## GET /api/auth/me

### 설명

현재 로그인한 사용자의 상세 정보를 반환합니다.

### 파일 위치

`src/app/api/auth/me/route.js`

### Response

```json
{
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "https://...",
    "bio": "자기소개",
    "role": "USER",
    "status": "ACTIVE",
    "provider": "CREDENTIALS",
    "createdAt": "2025-01-01T00:00:00Z",
    "lastLoginAt": "2025-12-01T00:00:00Z"
  },
  "adminRole": null  // 또는 { role: "ADMIN", isExpired: false }
}
```

---

## GET /api/user/profile

### 설명

현재 사용자의 프로필 정보를 조회합니다.

### 파일 위치

`src/app/api/user/profile/route.js`

### Response

```json
{
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "https://...",
    "bio": "자기소개",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

---

## PUT /api/user/profile

### 설명

현재 사용자의 프로필을 수정합니다.

### 파일 위치

`src/app/api/user/profile/route.js`

### Request Body

```json
{
  "name": "홍길동",      // optional, 2-50자
  "bio": "자기소개",     // optional, 200자 이하
  "avatar": "https://..."  // optional, URL
}
```

### 유효성 검증

| 필드 | 규칙 |
|------|------|
| `name` | 2-50자 |
| `bio` | 200자 이하 |
| `avatar` | URL 형식 또는 base64 |

### Response

**성공 (200)**
```json
{
  "message": "프로필이 수정되었습니다.",
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "https://...",
    "bio": "자기소개",
    "role": "USER",
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

**실패 (400)**
```json
{
  "error": "이름은 2-50자여야 합니다."
}
```

---

## GET /api/user/stats

### 설명

현재 사용자의 활동 통계를 조회합니다.

### 파일 위치

`src/app/api/user/stats/route.js`

### Response

```json
{
  "stats": {
    "thisWeek": {
      "completedTasks": 5,
      "createdNotices": 2,
      "uploadedFiles": 3,
      "chatMessages": 42
    },
    "total": {
      "studyCount": 3,
      "completedTasks": 45,
      "averageAttendance": 95,
      "joinedDays": 30
    },
    "recentActivity": [
      {
        "type": "TASK_COMPLETED",
        "title": "API 문서 작성",
        "date": "2025-12-12T10:00:00Z"
      }
    ]
  }
}
```

### 통계 항목

| 항목 | 설명 |
|------|------|
| `thisWeek.completedTasks` | 이번 주 완료한 할일 |
| `thisWeek.createdNotices` | 이번 주 작성한 공지 |
| `thisWeek.uploadedFiles` | 이번 주 업로드한 파일 |
| `thisWeek.chatMessages` | 이번 주 채팅 메시지 |
| `total.studyCount` | 참여 중인 스터디 수 |
| `total.completedTasks` | 전체 완료 할일 |
| `total.averageAttendance` | 평균 출석률 (%) |
| `total.joinedDays` | 가입 후 경과일 |

---

## GET /api/users/[id]

### 설명

특정 사용자의 공개 프로필을 조회합니다.

### 파일 위치

`src/app/api/users/[id]/route.js`

### Path Parameters

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | string | 사용자 ID |

### Response

```json
{
  "user": {
    "id": "cuid123",
    "name": "홍길동",
    "avatar": "https://...",
    "bio": "자기소개",
    "createdAt": "2025-01-01T00:00:00Z"
  },
  "publicStats": {
    "studyCount": 3,
    "completedTasks": 45
  }
}
```

---

## 에러 코드

| 코드 | 상태 | 메시지 |
|------|------|--------|
| 401 | Unauthorized | 인증이 필요합니다 |
| 400 | Bad Request | 유효성 검증 실패 |
| 404 | Not Found | 사용자를 찾을 수 없습니다 |
| 500 | Server Error | 서버 오류가 발생했습니다 |

---

## 사용 예시

### 프로필 조회

```javascript
const response = await fetch('/api/user/profile')
const { user } = await response.json()
```

### 프로필 수정

```javascript
const response = await fetch('/api/user/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '새 이름',
    bio: '새 자기소개'
  })
})

if (response.ok) {
  const { user } = await response.json()
  // 캐시 무효화
  queryClient.invalidateQueries(['me'])
}
```

### TanStack Query 훅 사용

```javascript
import { useMe, useUserStats } from '@/lib/hooks/useApi'

function MyComponent() {
  const { data: userData, isLoading } = useMe()
  const { data: statsData } = useUserStats()
  
  const user = userData?.user
  const stats = statsData?.stats
  
  // ...
}
```

---

## 관련 문서

- [마이페이지 화면](./screens-my-page.md) - 화면 레이아웃
- [인증 API](../02-auth/api-endpoints.md) - 인증 관련 API

