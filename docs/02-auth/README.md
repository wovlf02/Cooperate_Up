# 🔐 인증 시스템 개요

## 개요

CoUp은 **NextAuth.js**를 사용하여 인증/인가를 처리합니다. 이메일/비밀번호 인증과 OAuth(Google, GitHub)를 지원합니다.

---

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| **NextAuth.js** | 4 | 인증 프레임워크 |
| **@auth/prisma-adapter** | 2 | Prisma 연동 |
| **bcryptjs** | 3 | 비밀번호 해싱 |
| **Zod** | 4 | 입력 검증 |

---

## 인증 방식

### 지원 Provider

| Provider | 상태 | 설명 |
|----------|------|------|
| **Credentials** | ✅ | 이메일/비밀번호 |
| **Google OAuth** | ✅ | Google 계정 |
| **GitHub OAuth** | ✅ | GitHub 계정 |

### 세션 전략

| 항목 | 설정 |
|------|------|
| **Strategy** | JWT |
| **Max Age** | 24시간 |
| **Cookie** | 브라우저 세션 (닫으면 삭제) |

---

## 인증 흐름

### 로그인 흐름

```
1. 사용자 → 로그인 폼 제출
2. NextAuth → authorize() 호출
3. authorize() → 입력 검증
4. authorize() → DB에서 사용자 조회
5. authorize() → 비밀번호 검증 (bcrypt)
6. authorize() → 계정 상태 확인
7. NextAuth → JWT 토큰 생성
8. NextAuth → 세션 쿠키 설정
9. 클라이언트 → 대시보드로 리다이렉트
```

### 회원가입 흐름

```
1. 사용자 → 회원가입 폼 제출
2. API Route → 입력 검증 (Zod)
3. API Route → 이메일 중복 확인
4. API Route → 비밀번호 해싱 (bcrypt)
5. API Route → User 생성
6. 클라이언트 → 로그인 페이지로 이동
```

---

## 관련 파일

### 핵심 설정

| 파일 | 경로 | 설명 |
|------|------|------|
| `auth.js` | `src/lib/` | NextAuth 설정 |
| `auth-helpers.js` | `src/lib/` | 인증 헬퍼 함수 |
| `middleware.js` | `coup/` | 라우트 보호 |

### API 엔드포인트

| 파일 | 경로 | 설명 |
|------|------|------|
| `[...nextauth]/route.js` | `src/app/api/auth/` | NextAuth 핸들러 |
| `signup/route.js` | `src/app/api/auth/` | 회원가입 API |
| `verify/route.js` | `src/app/api/auth/` | 이메일 인증 |

### 화면

| 파일 | 경로 | 설명 |
|------|------|------|
| `sign-in/page.jsx` | `src/app/(auth)/` | 로그인 화면 |
| `sign-up/page.jsx` | `src/app/(auth)/` | 회원가입 화면 |
| `layout.jsx` | `src/app/(auth)/` | 인증 레이아웃 |

---

## 보안 기능

### 비밀번호 정책

| 항목 | 요구사항 |
|------|----------|
| 최소 길이 | 8자 이상 |
| 해싱 | bcrypt (salt rounds: 10) |

### 계정 상태

| 상태 | 로그인 | 설명 |
|------|--------|------|
| `ACTIVE` | ✅ | 정상 |
| `SUSPENDED` | ❌ | 일시 정지 (기간 만료 시 자동 해제) |
| `DELETED` | ❌ | 삭제됨 |

### 보호 기능

| 기능 | 설명 |
|------|------|
| **입력 정제** | XSS 방지 |
| **에러 메시지 통일** | 사용자 존재 여부 숨김 |
| **정지 기간 자동 해제** | 로그인 시 확인 |
| **활동 제한 자동 해제** | 로그인 시 확인 |

---

## 관련 문서

- [NextAuth 설정](./api-nextauth.md) - 상세 설정
- [인증 API](./api-endpoints.md) - API 엔드포인트
- [로그인 화면](./screens-sign-in.md) - 화면 레이아웃
- [회원가입 화면](./screens-sign-up.md) - 화면 레이아웃
- [컴포넌트](./components.md) - 인증 컴포넌트
- [헬퍼](./helpers.md) - 헬퍼 함수
- [미들웨어](./middleware.md) - 라우트 보호

