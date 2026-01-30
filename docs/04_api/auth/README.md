# 🔐 인증 API

> 사용자 인증 및 세션 관리를 위한 API 명세

---

## 📋 개요

CoUp은 **NextAuth.js v4** 기반의 인증 시스템을 사용합니다. 이메일/비밀번호 기반의 Credentials 인증을 지원하며, JWT 세션 전략을 채택하고 있습니다.

---

## 📚 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 | 문서 |
|------------|--------|------|------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth 인증 핸들러 | [nextauth.md](./nextauth.md) |
| `/api/auth/signup` | POST | 회원가입 | [signup.md](./signup.md) |
| `/api/auth/me` | GET | 현재 사용자 정보 조회 | [me.md](./me.md) |
| `/api/auth/validate-session` | GET | 세션 유효성 검증 | [validate-session.md](./validate-session.md) |
| `/api/auth/verify` | POST | 사용자 인증 (시그널링 서버용) | [verify.md](./verify.md) |

---

## 🔒 인증 방식

### 세션 기반 인증

CoUp은 JWT 세션 전략을 사용합니다:

```
[클라이언트] → 로그인 요청 → [NextAuth] → JWT 토큰 생성 → 쿠키에 저장
                                                            ↓
[클라이언트] ← API 요청 시 쿠키 자동 전송 ← 세션 검증 ← [서버]
```

### 세션 쿠키

| 쿠키명 | 설명 |
|--------|------|
| `next-auth.session-token` | JWT 세션 토큰 (브라우저 세션 쿠키) |

### 세션 설정

| 설정 | 값 | 설명 |
|------|-----|------|
| 전략 | JWT | JSON Web Token 기반 |
| 만료 시간 | 24시간 | 세션 최대 유효 시간 |
| 갱신 주기 | 비활성화 | 자동 갱신 없음 |

---

## 👥 사용자 역할

### 기본 역할 (User.role)

| 역할 | 설명 |
|------|------|
| `USER` | 일반 사용자 |

### 관리자 역할 (AdminRole.role)

| 역할 | 설명 |
|------|------|
| `SUPER_ADMIN` | 최고 관리자 |
| `ADMIN` | 일반 관리자 |

---

## 📊 계정 상태 (User.status)

| 상태 | 설명 | 로그인 가능 |
|------|------|-------------|
| `ACTIVE` | 정상 활성화 | ✅ |
| `SUSPENDED` | 일시 정지 | ❌ (정지 기간 만료 시 자동 해제) |
| `DELETED` | 삭제됨 | ❌ |

---

## ⚠️ 공통 에러 코드

| 에러 코드 | HTTP 상태 | 설명 |
|-----------|-----------|------|
| `MISSING_CREDENTIALS` | 400 | 이메일 또는 비밀번호 누락 |
| `INVALID_EMAIL_FORMAT` | 400 | 잘못된 이메일 형식 |
| `INVALID_CREDENTIALS` | 401 | 이메일 또는 비밀번호 불일치 |
| `EMAIL_ALREADY_EXISTS` | 409 | 이미 가입된 이메일 |
| `PASSWORD_TOO_SHORT` | 400 | 비밀번호 8자 미만 |
| `SOCIAL_ACCOUNT` | 400 | 소셜 로그인 계정 |
| `ACCOUNT_SUSPENDED` | 403 | 정지된 계정 |
| `ACCOUNT_DELETED` | 403 | 삭제된 계정 |
| `NO_SESSION` | 401 | 세션 없음 |
| `INVALID_SESSION` | 401 | 유효하지 않은 세션 |
| `DB_CONNECTION_ERROR` | 500 | 데이터베이스 연결 오류 |
| `DB_QUERY_ERROR` | 500 | 데이터베이스 쿼리 오류 |

---

## 🔗 관련 문서

- [인증 흐름 아키텍처](../../02_architecture/authentication-flow.md)
- [User 모델](../../03_database/models/user.md)
- [AdminRole 모델](../../03_database/models/admin.md)
