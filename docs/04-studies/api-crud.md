# 🔌 스터디 CRUD API

## 엔드포인트 목록

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/studies` | 스터디 목록 조회 | - |
| POST | `/api/studies` | 스터디 생성 | ✓ |
| GET | `/api/studies/[id]` | 스터디 상세 조회 | - |
| PATCH | `/api/studies/[id]` | 스터디 수정 | ✓ (OWNER) |
| DELETE | `/api/studies/[id]` | 스터디 삭제 | ✓ (OWNER) |

---

## GET /api/studies

### 설명

공개된 스터디 목록을 조회합니다.

### 파일 위치

`src/app/api/studies/route.js`

### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 10 | 페이지당 개수 |
| `category` | string | - | 카테고리 필터 |
| `search` | string | - | 검색어 (이름, 설명, 태그) |
| `recruiting` | string | 'all' | 모집 상태 ('all', 'recruiting', 'closed') |

### Response

```json
{
  "success": true,
  "data": {
    "studies": [
      {
        "id": "cuid123",
        "name": "JavaScript 스터디",
        "emoji": "💻",
        "description": "JS 심화 학습",
        "category": "programming",
        "maxMembers": 10,
        "currentMembers": 5,
        "isRecruiting": true,
        "rating": 4.5,
        "tags": ["javascript", "frontend"],
        "owner": {
          "id": "user123",
          "name": "홍길동",
          "avatar": "https://..."
        },
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

## POST /api/studies

### 설명

새 스터디를 생성합니다.

### 파일 위치

`src/app/api/studies/route.js`

### Request Body

```json
{
  "name": "JavaScript 스터디",
  "description": "JS 심화 학습을 위한 스터디입니다.",
  "category": "programming",
  "emoji": "💻",
  "maxMembers": 10,
  "isPublic": true,
  "autoApprove": true,
  "tags": ["javascript", "frontend"]
}
```

### 필드 검증

| 필드 | 규칙 |
|------|------|
| `name` | 필수, 2-50자 |
| `description` | 필수 |
| `category` | 필수 |
| `emoji` | 필수 |
| `maxMembers` | 선택, 기본 10 |

### Response

**성공 (201)**
```json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "name": "JavaScript 스터디",
    "inviteCode": "abc123",
    ...
  }
}
```

### 처리 흐름

1. 세션 검증
2. 입력 검증
3. 스터디 생성
4. 생성자를 OWNER로 멤버 추가
5. 응답 반환

---

## GET /api/studies/[id]

### 설명

특정 스터디의 상세 정보를 조회합니다.

### 파일 위치

`src/app/api/studies/[id]/route.js`

### Path Parameters

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | string | 스터디 ID |

### Response

```json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "name": "JavaScript 스터디",
    "emoji": "💻",
    "description": "JS 심화 학습",
    "category": "programming",
    "maxMembers": 10,
    "currentMembers": 5,
    "isPublic": true,
    "isRecruiting": true,
    "autoApprove": true,
    "inviteCode": "abc123",
    "tags": ["javascript"],
    "members": [
      {
        "id": "member123",
        "userId": "user123",
        "role": "OWNER",
        "status": "ACTIVE",
        "user": {
          "id": "user123",
          "name": "홍길동",
          "avatar": "https://..."
        }
      }
    ],
    "myRole": "MEMBER",           // 현재 사용자의 역할
    "myMembershipStatus": "ACTIVE" // 현재 사용자의 멤버십 상태
  }
}
```

---

## PATCH /api/studies/[id]

### 설명

스터디 정보를 수정합니다. OWNER만 가능합니다.

### 파일 위치

`src/app/api/studies/[id]/route.js`

### Request Body

```json
{
  "name": "새 스터디 이름",
  "description": "새 설명",
  "maxMembers": 15,
  "isRecruiting": false
}
```

### 수정 가능 필드

| 필드 | 설명 |
|------|------|
| `name` | 스터디 이름 |
| `description` | 설명 |
| `emoji` | 이모지 |
| `category` | 카테고리 |
| `subCategory` | 서브 카테고리 |
| `maxMembers` | 최대 인원 |
| `isPublic` | 공개 여부 |
| `isRecruiting` | 모집 여부 |
| `autoApprove` | 자동 승인 |
| `tags` | 태그 배열 |

### Response

```json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "name": "새 스터디 이름",
    ...
  }
}
```

---

## DELETE /api/studies/[id]

### 설명

스터디를 삭제합니다. OWNER만 가능합니다.

### 파일 위치

`src/app/api/studies/[id]/route.js`

### Response

```json
{
  "success": true,
  "message": "Study deleted successfully"
}
```

### 주의사항

- Cascade 삭제로 관련 데이터(멤버, 메시지, 파일 등) 모두 삭제됨
- 복구 불가

---

## 에러 코드

| 코드 | 상태 | 메시지 |
|------|------|--------|
| 401 | Unauthorized | 로그인이 필요합니다 |
| 403 | Forbidden | 권한이 부족합니다 |
| 404 | Not Found | 스터디를 찾을 수 없습니다 |
| 400 | Bad Request | 필수 필드가 누락되었습니다 |
| 500 | Server Error | 서버 오류가 발생했습니다 |

---

## 사용 예시

### 스터디 목록 조회

```javascript
const response = await fetch('/api/studies?category=programming&recruiting=recruiting')
const { data } = await response.json()
```

### 스터디 생성

```javascript
const response = await fetch('/api/studies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'JavaScript 스터디',
    description: '...',
    category: 'programming',
    emoji: '💻'
  })
})
```

### 스터디 수정

```javascript
const response = await fetch(`/api/studies/${studyId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    isRecruiting: false
  })
})
```

---

## 관련 문서

- [멤버 API](./api-members.md) - 멤버 관리
- [기능 API](./api-features.md) - 초대, 가입 등
- [스터디 헬퍼](./helpers.md) - 헬퍼 함수

