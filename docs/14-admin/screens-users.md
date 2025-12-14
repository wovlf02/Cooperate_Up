# 👥 사용자 관리 화면

## 개요

사용자 관리 화면에서는 플랫폼의 모든 사용자를 조회, 검색, 필터링하고 제재 조치를 수행할 수 있습니다.

- **경로**: `/admin/users`, `/admin/users/[id]`
- **타입**: Client Component
- **필요 권한**: `USER_VIEW` 이상

---

## 파일 구조

```
app/admin/users/
├── page.jsx                    # 사용자 목록 페이지
├── page.module.css
├── [id]/
│   ├── page.jsx               # 사용자 상세 페이지
│   └── page.module.css
└── _components/
    ├── UserList.jsx           # 사용자 목록 컴포넌트
    ├── UserList.module.css
    ├── UserFilters.jsx        # 필터 컴포넌트
    ├── UserFilters.module.css
    ├── UserColumns.jsx        # 테이블 컬럼 정의
    ├── UserBulkActions.jsx    # 대량 작업 바
    ├── UserEmptyState.jsx     # 빈 상태 표시
    └── UserError.jsx          # 에러 표시
```

---

## 사용자 목록 페이지

### `page.jsx`

```jsx
'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import UserList from './_components/UserList'
import UserFilters from './_components/UserFilters'

export default function UsersPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>사용자 관리</h1>
        <p>모든 사용자를 관리하고 모니터링하세요</p>
      </div>

      <Suspense fallback={null}>
        <UserFilters />
      </Suspense>

      <Suspense fallback={<UserListSkeleton />}>
        <UserListWrapper />
      </Suspense>
    </div>
  )
}
```

---

## 사용자 필터 컴포넌트

### `_components/UserFilters.jsx`

```jsx
export default function UserFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [provider, setProvider] = useState(searchParams.get('provider') || 'all')

  const updateFilters = useCallback((filters) => {
    const params = new URLSearchParams()
    if (filters.search?.trim()) params.set('search', filters.search.trim())
    if (filters.status !== 'all') params.set('status', filters.status)
    if (filters.provider !== 'all') params.set('provider', filters.provider)
    router.push(`/admin/users?${params.toString()}`)
  }, [router])

  // ...
}
```

### 필터 옵션

| 필터 | 옵션 | 설명 |
|------|------|------|
| 검색 | 텍스트 | 이메일, 이름으로 검색 |
| 상태 | `all`, `ACTIVE`, `SUSPENDED`, `DELETED` | 계정 상태 |
| 가입방식 | `all`, `CREDENTIALS`, `GOOGLE`, `GITHUB` | 인증 제공자 |

---

## 사용자 목록 컴포넌트

### `_components/UserList.jsx`

```jsx
export default function UserList({ searchParams }) {
  const { status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [pagination, setPagination] = useState(null)

  const fetchUsers = useCallback(async () => {
    const params = {}
    if (searchParams?.page) params.page = searchParams.page
    if (searchParams?.search) params.search = searchParams.search
    if (searchParams?.status) params.status = searchParams.status
    if (searchParams?.provider) params.provider = searchParams.provider

    const result = await api.get('/api/admin/users', params)
    // ...
  }, [searchParams])

  return (
    <div className={styles.container}>
      <UserBulkActions
        selectedRows={selectedRows}
        onClearSelection={() => setSelectedRows([])}
      />

      <Card>
        <Table
          columns={getUserColumns()}
          data={users}
          sortable
          selectable
          selectedRows={selectedRows}
          onSelectRows={setSelectedRows}
          loading={loading}
          stickyHeader
          emptyState={<UserEmptyState />}
        />
      </Card>

      {pagination && (
        <div className={styles.pagination}>
          <span>총 {pagination.total}명</span>
        </div>
      )}
    </div>
  )
}
```

---

## 테이블 컬럼 정의

### `_components/UserColumns.jsx`

```jsx
export function getUserColumns() {
  return [
    {
      key: 'user',
      label: '사용자',
      sortable: true,
      width: '300px',
      render: (_, user) => (
        <div className={styles.userCell}>
          <Avatar src={user.avatar} name={user.name || user.email} />
          <div>
            <div className={styles.userName}>{user.name || '이름 없음'}</div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      width: '120px',
      render: (status) => (
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      ),
    },
    {
      key: 'provider',
      label: '가입방식',
      sortable: true,
      width: '100px',
      render: (provider) => (
        <Badge variant="default">{getProviderLabel(provider)}</Badge>
      ),
    },
    {
      key: 'createdAt',
      label: '가입일',
      sortable: true,
      width: '140px',
      render: (date) => new Date(date).toLocaleDateString('ko-KR'),
    },
    {
      key: 'stats',
      label: '활동',
      width: '150px',
      render: (stats) => (
        <div className={styles.statsCell}>
          <span>스터디 {(stats?.studiesOwned || 0) + (stats?.studiesJoined || 0)}</span>
          <span>메시지 {stats?.messagesCount || 0}</span>
        </div>
      ),
    },
    {
      key: 'warnings',
      label: '경고',
      sortable: true,
      width: '100px',
      render: (_, user) => (
        user.stats?.warningsCount > 0 ? (
          <Badge variant="warning">{user.stats.warningsCount}회</Badge>
        ) : (
          <span className={styles.noWarning}>없음</span>
        )
      ),
    },
    {
      key: 'actions',
      label: '액션',
      width: '120px',
      render: (_, user) => (
        <Link href={`/admin/users/${user.id}`}>
          <Button size="sm" variant="outline">상세보기</Button>
        </Link>
      ),
    },
  ]
}
```

### 헬퍼 함수

```javascript
// 상태 배지 색상
export function getStatusVariant(status) {
  const variants = {
    ACTIVE: 'success',
    SUSPENDED: 'danger',
    DELETED: 'default',
    PENDING: 'warning',
  }
  return variants[status] || 'default'
}

// 상태 라벨
export function getStatusLabel(status) {
  const labels = {
    ACTIVE: '활성',
    SUSPENDED: '정지',
    DELETED: '삭제됨',
    PENDING: '대기',
  }
  return labels[status] || status
}

// 가입 방식 라벨
export function getProviderLabel(provider) {
  const labels = {
    CREDENTIALS: '이메일',
    GOOGLE: 'Google',
    GITHUB: 'GitHub',
  }
  return labels[provider] || provider
}
```

---

## 대량 작업 바

### `_components/UserBulkActions.jsx`

```jsx
export default function UserBulkActions({ selectedRows, onClearSelection }) {
  if (selectedRows.length === 0) return null

  return (
    <div className={styles.bulkActions}>
      <span>{selectedRows.length}명 선택됨</span>
      <Button size="sm" variant="outline" onClick={onClearSelection}>
        선택 해제
      </Button>
      <Button size="sm" variant="danger">일괄 정지</Button>
    </div>
  )
}
```

---

## 사용자 상세 페이지

### `/admin/users/[id]/page.jsx`

```jsx
export default function UserDetailPage() {
  const params = useParams()
  const [user, setUser] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // 사용자 조회, 정지, 활성화, 삭제 핸들러...

  return (
    <div className={styles.container}>
      {/* 헤더 - 뒤로가기, 편집, 정지/활성화, 삭제 버튼 */}
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => router.push('/admin/users')}>
          ← 목록으로
        </Button>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            편집
          </Button>
          {user.status === 'ACTIVE' ? (
            <Button variant="warning" onClick={handleSuspend}>정지</Button>
          ) : (
            <Button variant="success" onClick={handleActivate}>활성화</Button>
          )}
          <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
            삭제
          </Button>
        </div>
      </div>

      {/* 프로필 카드 */}
      <Card className={styles.profileCard}>
        <Avatar src={user.avatar} size={120} />
        <h1>{user.name || '이름 없음'}</h1>
        <p>{user.email}</p>
        <Badge variant={getStatusVariant(user.status)}>
          {getStatusLabel(user.status)}
        </Badge>
      </Card>

      {/* 기본 정보 */}
      <Card>
        <CardHeader><h3>기본 정보</h3></CardHeader>
        <CardContent>
          <InfoGrid>
            <InfoItem label="사용자 ID" value={user.id} />
            <InfoItem label="이메일" value={user.email} />
            <InfoItem label="가입일" value={formatDate(user.createdAt)} />
            <InfoItem label="최근 로그인" value={formatDate(user.lastLoginAt)} />
            <InfoItem label="인증 제공자" value={user.provider} />
          </InfoGrid>
        </CardContent>
      </Card>

      {/* 활동 통계 */}
      <Card>
        <CardHeader><h3>활동 통계</h3></CardHeader>
        <CardContent>
          <StatGrid>
            <StatItem label="참여 스터디" value={user._count?.studyMembers} />
            <StatItem label="개설 스터디" value={user._count?.ownedStudies} />
            <StatItem label="메시지" value={user._count?.messages} />
            <StatItem label="신고 수신" value={user._count?.reports} />
          </StatGrid>
        </CardContent>
      </Card>

      {/* 제재 및 경고 내역 */}
      {(user.sanctions?.length > 0 || user.receivedWarnings?.length > 0) && (
        <>
          {user.sanctions?.length > 0 && (
            <Card>
              <CardHeader><h3>제재 내역</h3></CardHeader>
              <CardContent>
                <HistoryList items={user.sanctions} type="sanction" />
              </CardContent>
            </Card>
          )}
          {user.receivedWarnings?.length > 0 && (
            <Card>
              <CardHeader><h3>경고 내역</h3></CardHeader>
              <CardContent>
                <HistoryList items={user.receivedWarnings} type="warning" />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* 모달 */}
      <Modal isOpen={isEditModalOpen} title="사용자 편집">
        {/* 편집 폼 */}
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="사용자 삭제"
        message={`정말 "${user.name}"을(를) 삭제하시겠습니까?`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
```

---

## 사용자 관리 액션

### 사용자 정지

```jsx
async function handleSuspend() {
  await api.post(`/api/admin/users/${userId}/suspend`, {
    reason: '관리자에 의한 정지',
    duration: null, // 영구 정지
  })
  fetchUser() // 새로고침
}
```

### 사용자 활성화

```jsx
async function handleActivate() {
  await api.post(`/api/admin/users/${userId}/activate`)
  fetchUser()
}
```

### 사용자 삭제

```jsx
async function handleDelete() {
  await api.delete(`/api/admin/users/${userId}`)
  router.push('/admin/users')
}
```

---

## API 엔드포인트

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/users` | 사용자 목록 조회 | `USER_VIEW` |
| GET | `/api/admin/users/[id]` | 사용자 상세 조회 | `USER_VIEW` |
| POST | `/api/admin/users/[id]/suspend` | 사용자 정지 | `USER_SUSPEND` |
| POST | `/api/admin/users/[id]/activate` | 사용자 활성화 | `USER_UNSUSPEND` |
| DELETE | `/api/admin/users/[id]` | 사용자 삭제 | `USER_DELETE` |

---

## 데이터 구조

### 사용자 목록 응답

```json
{
  "success": true,
  "data": [
    {
      "id": "user-123",
      "email": "user@example.com",
      "name": "홍길동",
      "avatar": "/uploads/avatar.jpg",
      "status": "ACTIVE",
      "provider": "CREDENTIALS",
      "createdAt": "2024-01-01T00:00:00Z",
      "stats": {
        "studiesOwned": 2,
        "studiesJoined": 5,
        "messagesCount": 150,
        "warningsCount": 0,
        "activeSanctions": 0
      },
      "lastWarning": null,
      "activeSanction": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  }
}
```

### 사용자 상세 응답

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "/uploads/avatar.jpg",
    "status": "ACTIVE",
    "provider": "CREDENTIALS",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-12-14T10:00:00Z",
    "_count": {
      "studyMembers": 5,
      "ownedStudies": 2,
      "messages": 150,
      "reports": 0
    },
    "sanctions": [],
    "receivedWarnings": []
  }
}
```

