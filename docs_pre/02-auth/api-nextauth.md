# ⚙️ NextAuth 설정

## 개요

NextAuth.js 설정 파일의 구조와 각 옵션을 상세히 설명합니다.

**파일 위치:** `src/lib/auth.js`

---

## 기본 구조

```javascript
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [...],
  session: {...},
  cookies: {...},
  pages: {...},
  callbacks: {...}
}

export const authOptions = authConfig
```

---

## Adapter 설정

```javascript
adapter: PrismaAdapter(prisma)
```

Prisma를 사용하여 세션, 사용자, 계정 데이터를 관리합니다.

---

## Providers 설정

### Credentials Provider

```javascript
CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
    // 1. 입력 검증
    // 2. 사용자 조회
    // 3. 비밀번호 검증
    // 4. 계정 상태 확인
    // 5. 관리자 권한 확인
    // 6. 사용자 정보 반환
  }
})
```

### authorize 함수 상세

| 단계 | 동작 | 실패 시 |
|------|------|---------|
| 1 | 이메일/비밀번호 존재 확인 | `MISSING_CREDENTIALS` |
| 2 | 이메일 형식 검증 | `INVALID_EMAIL_FORMAT` |
| 3 | 비밀번호 형식 검증 | `INVALID_CREDENTIALS` |
| 4 | DB에서 사용자 조회 | `INVALID_CREDENTIALS` |
| 5 | 소셜 계정 여부 확인 | `SOCIAL_ACCOUNT` |
| 6 | bcrypt 비밀번호 비교 | `INVALID_CREDENTIALS` |
| 7 | 계정 상태 확인 | `ACCOUNT_DELETED/SUSPENDED` |
| 8 | 정지 기간 자동 해제 | - |
| 9 | 활동 제한 자동 해제 | - |
| 10 | 관리자 권한 조회 | - |
| 11 | lastLoginAt 업데이트 | 로그만 남김 |

### authorize 반환 객체

```javascript
{
  id: user.id,
  email: user.email,
  name: user.name,
  image: avatarUrl,           // base64 제외, URL만
  role: user.role,            // USER | ADMIN
  status: user.status,        // ACTIVE | SUSPENDED | DELETED
  provider: user.provider,    // CREDENTIALS | GOOGLE | GITHUB
  isAdmin: isAdmin,           // AdminRole 존재 여부
  adminRole: adminRole?.role, // VIEWER | MODERATOR | ADMIN | SUPER_ADMIN
  restrictedActions: [],      // 제한된 활동 목록
  restrictedUntil: null,      // 제한 해제 일시
}
```

---

## Session 설정

```javascript
session: {
  strategy: "jwt",
  maxAge: 24 * 60 * 60,  // 24시간
  updateAge: 0,          // 세션 갱신 비활성화
}
```

| 옵션 | 값 | 설명 |
|------|-----|------|
| `strategy` | "jwt" | JWT 기반 세션 |
| `maxAge` | 86400 | 24시간 (초) |
| `updateAge` | 0 | 세션 갱신 안 함 |

---

## Cookies 설정

```javascript
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: undefined,  // 브라우저 닫으면 삭제
    },
  },
}
```

| 옵션 | 값 | 설명 |
|------|-----|------|
| `httpOnly` | true | JS 접근 불가 |
| `sameSite` | 'lax' | CSRF 방지 |
| `secure` | 프로덕션만 | HTTPS만 허용 |
| `maxAge` | undefined | 브라우저 세션 쿠키 |

---

## Pages 설정

```javascript
pages: {
  signIn: "/sign-in",
  signOut: "/sign-out",
  error: "/sign-in",
}
```

| 페이지 | 경로 | 설명 |
|--------|------|------|
| `signIn` | /sign-in | 로그인 페이지 |
| `signOut` | /sign-out | 로그아웃 페이지 |
| `error` | /sign-in | 에러 시 리다이렉트 |

---

## Callbacks 설정

### jwt 콜백

```javascript
async jwt({ token, user, trigger, session }) {
  // 초기 로그인 시 - user 객체에서 토큰 생성
  if (user) {
    token.id = user.id
    token.email = user.email
    token.name = user.name
    token.role = user.role
    token.status = user.status
    token.provider = user.provider
    token.isAdmin = user.isAdmin
    token.adminRole = user.adminRole
    token.restrictedActions = user.restrictedActions
    token.restrictedUntil = user.restrictedUntil
  }

  // 세션 업데이트 시 (update() 호출)
  if (trigger === "update" && session) {
    token.name = session.name || token.name
  }

  return token
}
```

### session 콜백

```javascript
async session({ session, token }) {
  // 기본 사용자 정보
  session.user = {
    id: token.id,
    email: token.email,
    name: token.name,
    image: null,
    isAdmin: false,
    adminRole: null,
  }

  // DB에서 최신 정보 조회
  const [adminRole, user] = await Promise.all([
    prisma.adminRole.findUnique({...}),
    prisma.user.findUnique({...})
  ])

  // 관리자 권한 설정
  // 사용자 정보 설정 (status, avatar 등)
  // 계정 상태 확인

  return session
}
```

### signIn 콜백

```javascript
async signIn({ user, account, profile }) {
  // OAuth 로그인 처리
  if (account?.provider === "google" || account?.provider === "github") {
    return true
  }
  // Credentials는 authorize에서 처리
  return true
}
```

### redirect 콜백

```javascript
async redirect({ url, baseUrl, token }) {
  // 로그인 성공 시 관리자 확인
  if (token?.id) {
    const adminRole = await prisma.adminRole.findUnique({...})
    
    if (isAdmin) {
      return baseUrl + "/admin"      // 관리자 → 관리자 대시보드
    } else {
      return baseUrl + "/dashboard"  // 일반 → 사용자 대시보드
    }
  }

  // 기본 리다이렉트 처리
  return url
}
```

---

## 타입 정의

```javascript
/**
 * @typedef {Object} SessionUser
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} image
 * @property {"USER"} role
 * @property {"ACTIVE" | "SUSPENDED" | "DELETED"} status
 * @property {"CREDENTIALS" | "GOOGLE" | "GITHUB"} provider
 */
```

---

## 사용 예시

### API Route에서 세션 확인

```javascript
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // session.user.id, session.user.email 등 사용
}
```

### 클라이언트에서 세션 확인

```javascript
import { useSession } from "next-auth/react"

function Component() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <Loading />
  if (!session) return <SignIn />
  
  return <div>Welcome, {session.user.name}</div>
}
```

---

## 관련 문서

- [인증 API](./api-endpoints.md) - API 엔드포인트
- [헬퍼](./helpers.md) - 인증 헬퍼 함수
- [미들웨어](./middleware.md) - 라우트 보호

