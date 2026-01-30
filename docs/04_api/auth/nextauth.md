# NextAuth 인증 핸들러

> NextAuth.js가 제공하는 통합 인증 엔드포인트

---

## 📋 개요

`/api/auth/[...nextauth]`는 NextAuth.js가 자동으로 처리하는 모든 인증 관련 엔드포인트를 포함합니다.

---

## 🔗 제공 엔드포인트

### 로그인 관련

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/auth/signin` | GET | 로그인 페이지 (리다이렉트) |
| `/api/auth/signin/:provider` | POST | 특정 프로바이더로 로그인 |
| `/api/auth/callback/:provider` | GET, POST | 인증 콜백 처리 |

### 세션 관련

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/auth/session` | GET | 현재 세션 정보 조회 |
| `/api/auth/signout` | POST | 로그아웃 |

### 기타

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/auth/csrf` | GET | CSRF 토큰 조회 |
| `/api/auth/providers` | GET | 사용 가능한 인증 프로바이더 목록 |

---

## 🔐 Credentials 로그인

### 요청

```http
POST /api/auth/callback/credentials
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### 인증 흐름

```
1. 요청 수신
   ↓
2. 이메일/비밀번호 검증
   ↓
3. 사용자 DB 조회
   ↓
4. 비밀번호 bcrypt 비교
   ↓
5. 계정 상태 확인 (ACTIVE/SUSPENDED/DELETED)
   ↓
6. 관리자 권한 확인 (AdminRole 테이블)
   ↓
7. JWT 토큰 생성 → 쿠키 저장
   ↓
8. 리다이렉트 (관리자→/admin, 일반→/dashboard)
```

### 성공 응답

로그인 성공 시 자동으로 리다이렉트됩니다:

| 사용자 유형 | 리다이렉트 경로 |
|-------------|-----------------|
| 관리자 (ADMIN, SUPER_ADMIN) | `/admin` |
| 일반 사용자 | `/dashboard` |

### 에러 응답

| 상황 | 에러 메시지 |
|------|-------------|
| 이메일/비밀번호 누락 | "이메일과 비밀번호를 입력해주세요" |
| 잘못된 이메일 형식 | "올바른 이메일 형식이 아닙니다" |
| 사용자 없음/비밀번호 불일치 | "이메일 또는 비밀번호가 올바르지 않습니다" |
| 소셜 계정 | "소셜 로그인으로 가입된 계정입니다" |
| 삭제된 계정 | "삭제된 계정입니다" |
| 정지된 계정 | "계정이 정지되었습니다. (날짜까지)" |

---

## 📊 세션 조회

### 요청

```http
GET /api/auth/session
```

### 응답 (로그인 상태)

```json
{
  "user": {
    "id": "user-uuid-123",
    "email": "user@example.com",
    "name": "홍길동",
    "image": "https://...",
    "role": "USER",
    "status": "ACTIVE",
    "provider": "CREDENTIALS",
    "isAdmin": false,
    "adminRole": null,
    "restrictedActions": [],
    "restrictedUntil": null
  },
  "expires": "2026-02-01T12:00:00.000Z"
}
```

### 응답 (비로그인 상태)

```json
{}
```

---

## 🚪 로그아웃

### 요청

```http
POST /api/auth/signout
Content-Type: application/json
```

```json
{
  "csrfToken": "csrf-token-from-cookie"
}
```

### 동작

1. JWT 세션 토큰 쿠키 삭제
2. 로그인 페이지로 리다이렉트

---

## ⚙️ 설정 요약

| 설정 항목 | 값 |
|-----------|-----|
| 세션 전략 | JWT |
| 세션 만료 | 24시간 |
| 쿠키 유형 | 브라우저 세션 (브라우저 종료 시 삭제) |
| 로그인 페이지 | `/sign-in` |
| 에러 페이지 | `/sign-in` |

---

## 🔗 관련 문서

- [회원가입 API](./signup.md)
- [인증 흐름 아키텍처](../../02_architecture/authentication-flow.md)
