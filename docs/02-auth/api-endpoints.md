# 🔌 인증 API 엔드포인트

## 엔드포인트 목록

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/signup` | 회원가입 | ✗ |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth 핸들러 | - |
| GET | `/api/auth/me` | 현재 사용자 정보 | ✓ |
| POST | `/api/auth/verify` | 이메일 인증 | ✗ |
| POST | `/api/auth/validate-session` | 세션 검증 | ✓ |

---

## POST /api/auth/signup

### 설명

새로운 사용자 계정을 생성합니다.

### 파일 위치

`src/app/api/auth/signup/route.js`

### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "avatar": "https://example.com/avatar.jpg"  // optional
}
```

### 유효성 검사

| 필드 | 규칙 |
|------|------|
| `email` | 필수, 이메일 형식 |
| `password` | 필수, 최소 8자 |
| `name` | 필수, 최소 2자 |
| `avatar` | 선택, URL 형식 |

### 처리 흐름

1. JSON 파싱
2. 입력값 정제 (sanitize)
3. Zod 스키마 검증
4. 커스텀 유효성 검사
5. 이메일 중복 확인
6. 비밀번호 해싱 (bcrypt)
7. User 생성

### Response

**성공 (201)**
```json
{
  "success": true,
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "name": "홍길동"
  },
  "message": "회원가입이 완료되었습니다. 로그인해 주세요."
}
```

**실패 - 이메일 중복 (409)**
```json
{
  "error": "EMAIL_EXISTS",
  "message": "이미 사용 중인 이메일입니다"
}
```

**실패 - 검증 오류 (400)**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "올바른 이메일 형식이 아닙니다",
  "field": "email"
}
```

---

## GET/POST /api/auth/[...nextauth]

### 설명

NextAuth.js가 처리하는 모든 인증 관련 엔드포인트입니다.

### 파일 위치

`src/app/api/auth/[...nextauth]/route.js`

### 자동 생성 엔드포인트

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/signin` | 로그인 페이지 (커스텀) |
| POST | `/api/auth/signin/:provider` | 로그인 처리 |
| GET/POST | `/api/auth/signout` | 로그아웃 |
| GET | `/api/auth/session` | 세션 조회 |
| GET | `/api/auth/providers` | 사용 가능한 Provider |
| GET | `/api/auth/csrf` | CSRF 토큰 |
| POST | `/api/auth/callback/:provider` | OAuth 콜백 |

### Credentials 로그인

**POST /api/auth/signin/credentials**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "csrfToken": "..."
}
```

---

## GET /api/auth/me

### 설명

현재 로그인한 사용자의 상세 정보를 반환합니다.

### 파일 위치

`src/app/api/auth/me/route.js`

### 인증

필요 (세션)

### Response

**성공 (200)**
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
    "isAdmin": false,
    "adminRole": null,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

---

## POST /api/auth/validate-session

### 설명

클라이언트에서 세션의 유효성을 검증합니다.

### 파일 위치

`src/app/api/auth/validate-session/route.js`

### 인증

필요 (세션)

### Response

**성공 (200)**
```json
{
  "valid": true,
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "status": "ACTIVE"
  }
}
```

**실패 (401)**
```json
{
  "valid": false,
  "error": "NO_SESSION",
  "message": "로그인이 필요합니다"
}
```

---

## 에러 코드

### 인증 관련

| 코드 | 상태 | 메시지 |
|------|------|--------|
| `MISSING_CREDENTIALS` | 400 | 이메일과 비밀번호를 입력해주세요 |
| `INVALID_EMAIL_FORMAT` | 400 | 올바른 이메일 형식이 아닙니다 |
| `INVALID_CREDENTIALS` | 401 | 이메일 또는 비밀번호가 일치하지 않습니다 |
| `SOCIAL_ACCOUNT` | 400 | 소셜 로그인으로 가입된 계정입니다 |
| `ACCOUNT_DELETED` | 403 | 삭제된 계정입니다 |
| `ACCOUNT_SUSPENDED` | 403 | 정지된 계정입니다 |

### 회원가입 관련

| 코드 | 상태 | 메시지 |
|------|------|--------|
| `EMAIL_EXISTS` | 409 | 이미 사용 중인 이메일입니다 |
| `PASSWORD_TOO_SHORT` | 400 | 비밀번호는 최소 8자 이상이어야 합니다 |
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |

### 세션 관련

| 코드 | 상태 | 메시지 |
|------|------|--------|
| `NO_SESSION` | 401 | 로그인이 필요합니다 |
| `INVALID_SESSION` | 401 | 세션이 만료되었습니다 |
| `DB_QUERY_ERROR` | 500 | 서버 오류가 발생했습니다 |

---

## 환경 변수

```env
# NextAuth 설정
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (선택)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

---

## 사용 예시

### 회원가입 요청

```javascript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: '홍길동'
  })
})

if (response.ok) {
  // 로그인 페이지로 이동
  router.push('/sign-in')
}
```

### 로그인 요청 (NextAuth)

```javascript
import { signIn } from "next-auth/react"

const result = await signIn('credentials', {
  email: 'user@example.com',
  password: 'password123',
  redirect: false  // 직접 리다이렉트 처리
})

if (result.ok) {
  router.push('/dashboard')
} else {
  setError(result.error)
}
```

### 로그아웃 요청

```javascript
import { signOut } from "next-auth/react"

await signOut({ callbackUrl: '/sign-in' })
```

---

## 관련 문서

- [NextAuth 설정](./api-nextauth.md) - 상세 설정
- [헬퍼](./helpers.md) - 인증 헬퍼 함수
- [미들웨어](./middleware.md) - 라우트 보호

