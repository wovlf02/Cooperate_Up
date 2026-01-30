# 🏗️ 관리자 시스템 개요

## 아키텍처

관리자 시스템은 **Next.js App Router** 기반으로 구현되어 있으며, 서버 컴포넌트와 클라이언트 컴포넌트를 적절히 분리하여 사용합니다.

```
┌─────────────────────────────────────────────────────────┐
│                    관리자 레이아웃                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │              AdminNavbar (Client)               │    │
│  │  - 메뉴 네비게이션                               │    │
│  │  - 알림 드롭다운                                 │    │
│  │  - 프로필 드롭다운                               │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Breadcrumb (Client)                │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │                 Page Content                    │    │
│  │  - 각 도메인별 페이지 컴포넌트                    │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 레이아웃 구조

### `/admin/layout.jsx` (Server Component)

```jsx
// 세션 및 권한 확인
const session = await getServerSession(authOptions)
const adminRole = await getAdminRole(session.user.id)

// 미인증 사용자 리다이렉트
if (!session?.user) redirect('/sign-in?callbackUrl=/admin')
if (!adminRole) redirect('/unauthorized')
```

**기능:**
- 서버 사이드 인증 확인
- 관리자 권한 검증
- 권한 없는 사용자 리다이렉트
- 공통 레이아웃 (Navbar, Breadcrumb) 렌더링

---

## 인증 플로우

```
사용자 요청
    ↓
┌─────────────────────┐
│   세션 확인         │
│ (getServerSession)  │
└─────────────────────┘
    ↓
세션 없음 → /sign-in 리다이렉트
    ↓
┌─────────────────────┐
│  관리자 역할 조회    │
│  (getAdminRole)     │
└─────────────────────┘
    ↓
역할 없음 → /unauthorized 리다이렉트
    ↓
┌─────────────────────┐
│   역할 만료 확인     │
│   (expiresAt)       │
└─────────────────────┘
    ↓
만료됨 → /unauthorized 리다이렉트
    ↓
┌─────────────────────┐
│   권한 확인         │
│  (hasPermission)    │
└─────────────────────┘
    ↓
권한 없음 → 403 에러
    ↓
✅ 접근 허용
```

---

## 데이터 흐름

### 클라이언트 → 서버 → DB

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Client Page    │────▶│   API Route      │────▶│     Prisma       │
│   (React)        │     │  (/api/admin/*)  │     │   (Database)     │
└──────────────────┘     └──────────────────┘     └──────────────────┘
         │                       │                        │
         │ api.get/post          │ requireAdmin()        │ SQL Query
         │                       │ + logAdminAction()    │
         ▼                       ▼                        ▼
    UI 업데이트            권한 검증 + 로그             데이터 조회/수정
```

### API 응답 형식

```javascript
// 성공
{
  success: true,
  data: { ... },
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5,
    hasMore: true
  }
}

// 실패
{
  success: false,
  error: "에러 메시지",
  code: "ERROR_CODE"
}
```

---

## 상태 관리

관리자 페이지는 **React Hooks**를 사용한 로컬 상태 관리를 기본으로 합니다.

### 일반적인 상태 패턴

```jsx
export default function AdminPage() {
  const { status } = useSession()
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [pagination, setPagination] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.get('/api/admin/...')
      if (result.success) {
        setData(result.data)
        setPagination(result.pagination)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [dependencies])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, fetchData])

  // 로딩/에러/데이터 렌더링
}
```

---

## 에러 처리

### 클라이언트 에러 처리

```jsx
// app/admin/error.jsx
'use client'

export default function AdminError({ error, reset }) {
  return (
    <div className={styles.error}>
      <h2>오류가 발생했습니다</h2>
      <p>{error.message}</p>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  )
}
```

### API 에러 처리

```javascript
// withAdminErrorHandler 래퍼
export const GET = withAdminErrorHandler(async (request) => {
  // 권한 확인 → 에러 시 자동으로 적절한 응답
  // DB 쿼리 → 에러 시 AdminDatabaseException
  // 검증 → 에러 시 AdminValidationException
})
```

---

## 로깅 시스템

모든 관리자 활동은 `AdminLog` 테이블에 기록됩니다.

### 로그 기록 정보

| 필드 | 설명 |
|------|------|
| `adminId` | 수행한 관리자 ID |
| `action` | 수행한 작업 (USER_SUSPEND, STUDY_DELETE 등) |
| `targetType` | 대상 타입 (User, Study, Report) |
| `targetId` | 대상 ID |
| `before` | 변경 전 데이터 (JSON) |
| `after` | 변경 후 데이터 (JSON) |
| `reason` | 작업 사유 |
| `ipAddress` | 요청 IP |
| `userAgent` | 브라우저 정보 |
| `createdAt` | 수행 시각 |

### 로그 기록 예시

```javascript
await logAdminAction({
  adminId: adminRole.userId,
  action: 'USER_SUSPEND',
  targetType: 'User',
  targetId: userId,
  before: { status: 'ACTIVE' },
  after: { status: 'SUSPENDED' },
  reason: '커뮤니티 가이드라인 위반',
  request,
})
```

---

## 성능 최적화

### 1. 데이터 페칭 최적화

```javascript
// 병렬 쿼리
const [users, total] = await Promise.all([
  prisma.user.findMany({ ... }),
  prisma.user.count({ where })
])
```

### 2. 컴포넌트 최적화

```jsx
// useCallback으로 함수 메모이제이션
const fetchData = useCallback(async () => { ... }, [deps])

// Suspense로 로딩 상태 처리
<Suspense fallback={<Skeleton />}>
  <DataComponent />
</Suspense>
```

### 3. 이미지 최적화

```jsx
// Next.js Image 컴포넌트 사용
<Image
  src={user.avatar}
  alt={user.name}
  width={40}
  height={40}
  className={styles.avatar}
/>
```

---

## 보안 고려사항

1. **세션 기반 인증**: 모든 요청에 대해 세션 유효성 검증
2. **권한 기반 접근 제어**: 역할별 세분화된 권한 관리
3. **감사 로그**: 모든 관리 활동 기록
4. **입력 검증**: API 파라미터 유효성 검사
5. **민감 정보 필터링**: 응답에서 비밀번호 등 제외
6. **IP/User-Agent 기록**: 의심스러운 활동 추적 가능

