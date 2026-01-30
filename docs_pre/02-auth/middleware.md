# 🛡️ 인증 미들웨어

## 개요

Next.js 미들웨어를 사용하여 라우트를 보호하고 인증 상태를 확인합니다.

**파일 위치:** `coup/middleware.js`

---

## 기술 스택

| 기술 | 용도 |
|------|------|
| `next-auth/middleware` | `withAuth` HOC 제공 |
| `next/server` | `NextResponse` 객체 |

---

## 미들웨어 구조

```javascript
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // 미들웨어 로직
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // 인증 확인 로직
      }
    },
    pages: {
      signIn: '/sign-in',
    }
  }
)

export const config = {
  matcher: [...]
}
```

---

## 공개 경로

인증 없이 접근 가능한 경로입니다.

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 페이지 |
| `/sign-in` | 로그인 |
| `/sign-up` | 회원가입 |
| `/privacy` | 개인정보처리방침 |
| `/terms` | 이용약관 |

---

## 보호 로직

### 1. API 경로 처리

```javascript
if (pathname.startsWith('/api/')) {
  return NextResponse.next()
}
```

API 경로는 미들웨어에서 처리하지 않고, 각 Route Handler에서 직접 인증을 확인합니다.

### 2. 공개 경로 허용

```javascript
const publicPaths = ['/', '/sign-in', '/sign-up', '/privacy', '/terms']

if (publicPaths.includes(pathname)) {
  return NextResponse.next()
}
```

### 3. 관리자 페이지 보호

```javascript
if (pathname.startsWith('/admin')) {
  if (!token) {
    return NextResponse.redirect(
      new URL('/sign-in?callbackUrl=' + encodeURIComponent(pathname), req.url)
    )
  }
}
```

### 4. 계정 상태 확인

```javascript
if (token?.status === 'DELETED') {
  return NextResponse.redirect(new URL('/sign-in?error=account-deleted', req.url))
}

if (token?.status === 'SUSPENDED') {
  return NextResponse.redirect(new URL('/sign-in?error=account-suspended', req.url))
}
```

---

## authorized 콜백

인증 여부를 결정하는 콜백 함수입니다.

```javascript
callbacks: {
  authorized: ({ req, token }) => {
    const { pathname } = req.nextUrl
    
    // 공개 경로: 토큰 없이도 허용
    const publicPaths = ['/', '/sign-in', '/sign-up', '/privacy', '/terms']
    if (publicPaths.includes(pathname)) {
      return true
    }

    // API 경로: 항상 허용 (각 API에서 처리)
    if (pathname.startsWith('/api/')) {
      return true
    }

    // 나머지: 토큰 필요
    return !!token
  }
}
```

| 반환값 | 동작 |
|--------|------|
| `true` | 요청 허용 |
| `false` | 로그인 페이지로 리다이렉트 |

---

## Matcher 설정

미들웨어가 적용되는 경로를 정의합니다.

```javascript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
}
```

### 제외 경로

| 패턴 | 설명 |
|------|------|
| `_next/static` | 정적 파일 |
| `_next/image` | 이미지 최적화 |
| `favicon.ico` | 파비콘 |
| `*.svg, *.png, ...` | 이미지 파일 |

---

## 처리 흐름

```
요청 → Matcher 확인
        ↓
    제외 경로? → 미들웨어 건너뜀
        ↓
    authorized 콜백
        ↓
    false → /sign-in 리다이렉트
        ↓
    true → 미들웨어 함수 실행
        ↓
    API 경로? → next()
        ↓
    공개 경로? → next()
        ↓
    /admin? → 토큰 확인
        ↓
    계정 상태 확인
        ↓
    next() 또는 리다이렉트
```

---

## 리다이렉트 케이스

| 조건 | 리다이렉트 대상 | 파라미터 |
|------|----------------|----------|
| 미인증 + 보호 경로 | `/sign-in` | `callbackUrl` |
| 삭제된 계정 | `/sign-in` | `error=account-deleted` |
| 정지된 계정 | `/sign-in` | `error=account-suspended` |
| 미인증 + 관리자 페이지 | `/sign-in` | `callbackUrl` |

---

## 토큰 정보

`req.nextauth.token`에서 접근 가능한 정보:

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 사용자 ID |
| `email` | string | 이메일 |
| `name` | string | 이름 |
| `role` | string | 역할 (USER, ADMIN) |
| `status` | string | 상태 (ACTIVE, SUSPENDED, DELETED) |
| `isAdmin` | boolean | 관리자 여부 |
| `adminRole` | string | 관리자 역할 |

---

## 디버깅

### 로그 출력

```javascript
console.log('🔐 [MIDDLEWARE] 관리자 페이지 접근 시도:', {
  pathname,
  userId: token?.id,
  email: token?.email,
  hasToken: !!token
})
```

### 로그 예시

```
🔐 [MIDDLEWARE] 관리자 페이지 접근 시도: {
  pathname: '/admin/users',
  userId: 'clx1234...',
  email: 'admin@example.com',
  hasToken: true
}
✅ [MIDDLEWARE] 관리자 페이지 접근 허용
```

---

## 주의사항

1. **API 경로 인증**: API 경로는 미들웨어에서 처리하지 않으므로, 각 Route Handler에서 `requireAuth()` 등을 사용해야 합니다.

2. **관리자 권한**: 미들웨어에서는 토큰 존재 여부만 확인합니다. 실제 관리자 권한은 각 페이지/API에서 검증합니다.

3. **정적 파일**: matcher 설정으로 정적 파일은 미들웨어를 거치지 않습니다.

---

## 관련 문서

- [NextAuth 설정](./api-nextauth.md) - 인증 설정
- [헬퍼 함수](./helpers.md) - 인증 헬퍼
- [관리자 권한](../14-admin/permissions.md) - 관리자 권한 시스템

