# 🔧 인증 헬퍼 함수

## 개요

인증 관련 공통 헬퍼 함수들을 설명합니다.

**파일 위치:** `src/lib/auth-helpers.js`

---

## 함수 목록

| 함수 | 용도 | 반환 |
|------|------|------|
| `getSession()` | 현재 세션 조회 | Session \| null |
| `requireAuth()` | 인증 필수 확인 | User \| NextResponse |
| `requireStudyMember()` | 스터디 멤버 확인 | Member \| NextResponse |
| `getCurrentUser()` | 현재 사용자 상세 정보 | User \| null |
| `requireAdmin()` | 관리자 권한 확인 | Admin \| NextResponse |

---

## getSession

### 설명

현재 세션을 조회합니다. Server Component에서 사용합니다.

### 시그니처

```javascript
async function getSession(): Promise<Session | null>
```

### 사용 예시

```javascript
const session = await getSession()

if (!session) {
  // 로그인되지 않음
}
```

---

## requireAuth

### 설명

API Route에서 인증을 필수로 요구합니다. 인증되지 않았거나 계정 상태에 문제가 있으면 에러 응답을 반환합니다.

### 시그니처

```javascript
async function requireAuth(): Promise<{ user: User } | NextResponse>
```

### 처리 흐름

1. 세션 조회
2. 세션 검증 (user.id 존재)
3. DB에서 사용자 확인
4. 사용자 존재 여부 확인
5. 계정 상태 확인 (DELETED, SUSPENDED)
6. 사용자 정보 반환

### 반환값

**성공 시:**
```javascript
{
  user: {
    id: string,
    email: string,
    name: string,
    image: string,
    role: 'USER' | 'ADMIN',
    status: 'ACTIVE',
    provider: 'CREDENTIALS' | 'GOOGLE' | 'GITHUB'
  }
}
```

**실패 시:** `NextResponse` (에러 응답)

### 사용 예시

```javascript
export async function GET() {
  const result = await requireAuth()
  
  // 에러 응답인 경우 바로 반환
  if (result instanceof NextResponse) {
    return result
  }
  
  // 인증된 사용자 정보 사용
  const { user } = result
  // ... 비즈니스 로직
}
```

---

## requireStudyMember

### 설명

스터디 멤버인지 확인하고, 필요 시 최소 역할을 검증합니다.

### 시그니처

```javascript
async function requireStudyMember(
  studyId: string,
  minRole?: 'MEMBER' | 'ADMIN' | 'OWNER'
): Promise<{ session: AuthResult, member: StudyMember } | NextResponse>
```

### 파라미터

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `studyId` | string | ✓ | - | 스터디 ID |
| `minRole` | string | - | 'MEMBER' | 최소 요구 역할 |

### 역할 계층

```
MEMBER(0) < ADMIN(1) < OWNER(2)
```

### 사용 예시

```javascript
// 멤버 이상
const result = await requireStudyMember(studyId)

// 관리자 이상
const result = await requireStudyMember(studyId, 'ADMIN')

// 소유자만
const result = await requireStudyMember(studyId, 'OWNER')

if (result instanceof NextResponse) {
  return result
}

const { session, member } = result
```

---

## getCurrentUser

### 설명

현재 로그인한 사용자의 상세 정보를 조회합니다.

### 시그니처

```javascript
async function getCurrentUser(): Promise<User | null>
```

### 반환값

```javascript
{
  id: string,
  email: string,
  name: string,
  avatar: string,
  bio: string,
  role: 'USER' | 'ADMIN',
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED',
  provider: 'CREDENTIALS' | 'GOOGLE' | 'GITHUB',
  createdAt: Date,
  lastLoginAt: Date,
  // ... 추가 필드
}
```

### 사용 예시

```javascript
const user = await getCurrentUser()

if (!user) {
  redirect('/sign-in')
}

// 사용자 정보 사용
```

---

## requireAdmin

### 설명

관리자 권한을 확인합니다. AdminRole 테이블에서 권한을 검증합니다.

### 시그니처

```javascript
async function requireAdmin(
  minRole?: 'VIEWER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN'
): Promise<{ user: User, adminRole: AdminRole } | NextResponse>
```

### 역할 계층

```
VIEWER(0) < MODERATOR(1) < ADMIN(2) < SUPER_ADMIN(3)
```

### 사용 예시

```javascript
// 관리자 권한 확인 (기본)
const result = await requireAdmin()

// 특정 역할 이상 확인
const result = await requireAdmin('SUPER_ADMIN')

if (result instanceof NextResponse) {
  return result
}

const { user, adminRole } = result
```

---

## 에러 처리

### 에러 응답 형식

```javascript
{
  error: string,    // 에러 코드
  message: string   // 에러 메시지
}
```

### 에러 코드

| 코드 | 상태 | 설명 |
|------|------|------|
| `NO_SESSION` | 401 | 세션 없음 |
| `INVALID_SESSION` | 401 | 세션 무효 |
| `ACCOUNT_DELETED` | 403 | 삭제된 계정 |
| `ACCOUNT_SUSPENDED` | 403 | 정지된 계정 |
| `INACTIVE_ACCOUNT` | 403 | 비활성 계정 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `DB_QUERY_ERROR` | 500 | DB 오류 |
| `UNKNOWN_ERROR` | 500 | 알 수 없는 오류 |

---

## 전체 사용 패턴

### API Route 기본 패턴

```javascript
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request) {
  // 1. 인증 확인
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) {
    return authResult
  }
  
  const { user } = authResult
  
  // 2. 비즈니스 로직
  try {
    const data = await someOperation(user.id)
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    )
  }
}
```

### 스터디 API 패턴

```javascript
export async function PUT(request, { params }) {
  const { studyId } = params
  
  // 관리자 이상만 수정 가능
  const result = await requireStudyMember(studyId, 'ADMIN')
  if (result instanceof NextResponse) {
    return result
  }
  
  const { session, member } = result
  
  // 비즈니스 로직
}
```

---

## 관련 문서

- [NextAuth 설정](./api-nextauth.md) - 인증 설정
- [인증 API](./api-endpoints.md) - API 엔드포인트
- [미들웨어](./middleware.md) - 라우트 보호

