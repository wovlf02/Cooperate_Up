# 👤 사용자 API

> 사용자 검색 및 프로필 관리 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **기본 엔드포인트** | `/api/users` |
| **인증 필요** | ✅ |

---

## 📚 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/users` | GET | 사용자 검색 |
| `/api/users/me` | GET | 내 정보 조회 |
| `/api/users/me` | PATCH | 내 정보 수정 |
| `/api/users/[userId]` | GET | 사용자 프로필 조회 |
| `/api/users/avatar` | POST | 아바타 업로드 |

---

## 🔍 사용자 검색

### 요청

```http
GET /api/users?q=홍길동&page=1&limit=20&role=USER
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `q` | string | - | 검색어 (이름, 이메일) |
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 20 | 페이지당 항목 수 |
| `role` | string | - | 역할 필터 (USER, ADMIN 등) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid-123",
      "email": "hong@example.com",
      "name": "홍길동",
      "avatar": "https://...",
      "bio": "안녕하세요!",
      "role": "USER",
      "createdAt": "2026-01-15T09:00:00.000Z",
      "lastLoginAt": "2026-01-30T10:00:00.000Z",
      "studyCount": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 📖 내 정보 조회

### 요청

```http
GET /api/users/me
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "https://...",
    "bio": "안녕하세요!",
    "role": "USER",
    "status": "ACTIVE",
    "provider": "CREDENTIALS",
    "createdAt": "2026-01-15T09:00:00.000Z",
    "lastLoginAt": "2026-01-30T10:00:00.000Z",
    "settings": {
      "emailNotifications": true,
      "pushNotifications": true,
      "theme": "light"
    },
    "statistics": {
      "studyCount": 5,
      "taskCount": 25,
      "completedTaskCount": 20
    }
  }
}
```

---

## ✏️ 내 정보 수정

### 요청

```http
PATCH /api/users/me
Content-Type: application/json

{
  "name": "새 이름",
  "bio": "수정된 자기소개",
  "avatar": "https://..."
}
```

### 수정 가능 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `name` | string | 이름 (2~50자) |
| `bio` | string | 자기소개 (최대 500자) |
| `avatar` | string | 프로필 이미지 URL |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "새 이름",
    "bio": "수정된 자기소개",
    "avatar": "https://..."
  }
}
```

---

## 📖 사용자 프로필 조회

### 요청

```http
GET /api/users/user-uuid-123
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "user-uuid-123",
    "name": "홍길동",
    "avatar": "https://...",
    "bio": "안녕하세요!",
    "createdAt": "2026-01-15T09:00:00.000Z",
    "studyCount": 5,
    "publicStudies": [
      {
        "id": "study-uuid",
        "name": "React 스터디",
        "emoji": "⚛️",
        "role": "OWNER"
      }
    ]
  }
}
```

> 다른 사용자 프로필 조회 시 이메일 등 민감 정보는 제외됩니다.

---

## 🖼️ 아바타 업로드

### 요청

```http
POST /api/users/avatar
Content-Type: multipart/form-data

file: [이미지 파일]
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "url": "/uploads/avatar/avatar-123456.jpg"
}
```

### 제한사항

- **파일 크기**: 최대 5MB
- **파일 형식**: JPEG, PNG, GIF, WebP

---

## 📊 응답 필드 설명

| 필드 | 설명 |
|------|------|
| `id` | 사용자 고유 ID |
| `email` | 이메일 (본인만 확인 가능) |
| `name` | 사용자 이름 |
| `avatar` | 프로필 이미지 URL |
| `bio` | 자기소개 |
| `role` | 역할 (USER) |
| `status` | 상태 (ACTIVE, SUSPENDED 등) |
| `provider` | 가입 방식 (CREDENTIALS, GOOGLE 등) |
| `studyCount` | 참여 중인 스터디 수 |

---

## 🔗 관련 문서

- [User 모델](../../03_database/models/user.md)
- [인증 API](../auth/README.md)
- [설정 페이지](../../05_pages/settings/README.md)
