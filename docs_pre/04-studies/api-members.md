# 🔌 스터디 멤버 API

## 엔드포인트 목록

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/studies/[id]/members` | 멤버 목록 조회 | ✓ (MEMBER) |
| POST | `/api/studies/[id]/members` | 멤버 초대/추가 | ✓ (ADMIN) |
| PATCH | `/api/studies/[id]/members/[userId]` | 멤버 역할 변경 | ✓ (OWNER) |
| DELETE | `/api/studies/[id]/members/[userId]` | 멤버 추방 | ✓ (ADMIN) |
| GET | `/api/studies/[id]/join-requests` | 가입 요청 목록 | ✓ (ADMIN) |
| POST | `/api/studies/[id]/join-requests/[id]` | 가입 요청 처리 | ✓ (ADMIN) |

---

## GET /api/studies/[id]/members

### 설명

스터디 멤버 목록을 조회합니다.

### 파일 위치

`src/app/api/studies/[id]/members/route.js`

### 권한

MEMBER 이상

### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 50 | 페이지당 개수 (최대 50) |
| `role` | string | - | 역할 필터 (OWNER, ADMIN, MEMBER) |
| `status` | string | ACTIVE | 상태 필터 |

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "member123",
      "userId": "user123",
      "role": "OWNER",
      "status": "ACTIVE",
      "joinedAt": "2025-01-01T00:00:00Z",
      "user": {
        "id": "user123",
        "name": "홍길동",
        "email": "hong@example.com",
        "avatar": "https://..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## POST /api/studies/[id]/members

### 설명

멤버를 초대하거나 직접 추가합니다.

### 권한

ADMIN 이상

### Request Body

```json
{
  "userId": "user123",
  "role": "MEMBER"  // optional, default: MEMBER
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "member123",
    "userId": "user123",
    "role": "MEMBER",
    "status": "ACTIVE"
  },
  "message": "멤버가 추가되었습니다."
}
```

---

## PATCH /api/studies/[id]/members/[userId]

### 설명

멤버의 역할을 변경합니다.

### 파일 위치

`src/app/api/studies/[id]/members/[userId]/route.js`

### 권한

OWNER만 (ADMIN 역할 변경 시)

### Request Body

```json
{
  "role": "ADMIN"  // ADMIN | MEMBER
}
```

### 제약사항

- OWNER 역할은 변경 불가 (소유권 이전 API 사용)
- OWNER만 ADMIN 역할 부여 가능

### Response

```json
{
  "success": true,
  "data": {
    "id": "member123",
    "role": "ADMIN"
  },
  "message": "역할이 변경되었습니다."
}
```

---

## DELETE /api/studies/[id]/members/[userId]

### 설명

멤버를 추방합니다.

### 권한

ADMIN 이상

### 제약사항

- 자기 자신은 추방 불가 (탈퇴 API 사용)
- OWNER는 추방 불가
- ADMIN은 ADMIN/OWNER 추방 불가

### Response

```json
{
  "success": true,
  "message": "멤버가 추방되었습니다."
}
```

---

## GET /api/studies/[id]/join-requests

### 설명

가입 승인 대기 중인 요청 목록을 조회합니다.

### 파일 위치

`src/app/api/studies/[id]/join-requests/route.js`

### 권한

ADMIN 이상

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "member123",
      "userId": "user123",
      "status": "PENDING",
      "introduction": "안녕하세요, 가입 신청합니다.",
      "motivation": "JS를 배우고 싶습니다.",
      "level": "초급",
      "joinedAt": "2025-01-01T00:00:00Z",
      "user": {
        "id": "user123",
        "name": "홍길동",
        "email": "hong@example.com",
        "avatar": "https://..."
      }
    }
  ]
}
```

---

## POST /api/studies/[id]/join-requests/[id]

### 설명

가입 요청을 승인하거나 거절합니다.

### 파일 위치

`src/app/api/studies/[id]/join-requests/[id]/route.js`

### 권한

ADMIN 이상

### Request Body

```json
{
  "action": "approve"  // "approve" | "reject"
}
```

### Response

**승인 시**
```json
{
  "success": true,
  "message": "가입 요청이 승인되었습니다."
}
```

**거절 시**
```json
{
  "success": true,
  "message": "가입 요청이 거절되었습니다."
}
```

---

## 에러 코드

| 코드 | 상태 | 메시지 |
|------|------|--------|
| `NOT_A_MEMBER` | 403 | 스터디 멤버가 아닙니다 |
| `PERMISSION_DENIED` | 403 | 권한이 부족합니다 |
| `ALREADY_MEMBER` | 409 | 이미 멤버입니다 |
| `CANNOT_KICK_SELF` | 400 | 자신을 추방할 수 없습니다 |
| `CANNOT_KICK_OWNER` | 400 | 소유자를 추방할 수 없습니다 |
| `USER_NOT_FOUND` | 404 | 사용자를 찾을 수 없습니다 |

---

## 역할 계층

```
MEMBER(0) < ADMIN(1) < OWNER(2)
```

| 권한 | MEMBER | ADMIN | OWNER |
|------|--------|-------|-------|
| 멤버 목록 조회 | ✓ | ✓ | ✓ |
| 멤버 추가 | ✗ | ✓ | ✓ |
| 가입 승인 | ✗ | ✓ | ✓ |
| 일반 멤버 추방 | ✗ | ✓ | ✓ |
| 관리자 추방 | ✗ | ✗ | ✓ |
| 역할 변경 | ✗ | ✗ | ✓ |

---

## 관련 문서

- [CRUD API](./api-crud.md) - 기본 CRUD
- [기능 API](./api-features.md) - 초대, 가입 등
- [멤버 컴포넌트](./components-members.md) - UI 컴포넌트

