# 📚 스터디 관리 화면

## 개요

스터디 관리 화면에서는 플랫폼의 모든 스터디를 조회하고 관리 작업(숨김, 종료, 삭제)을 수행할 수 있습니다.

- **경로**: `/admin/studies`, `/admin/studies/[studyId]`
- **타입**: Client Component
- **필요 권한**: `STUDY_VIEW` 이상

---

## 파일 구조

```
app/admin/studies/
├── page.jsx                      # 스터디 목록 페이지
├── page.module.css
├── [studyId]/
│   ├── page.jsx                 # 스터디 상세 페이지
│   ├── page.module.css
│   └── _components/
│       ├── StudyActions.jsx     # 스터디 액션 버튼
│       └── StudyActions.module.css
└── _components/
    ├── StudyList.jsx            # 스터디 목록 컴포넌트
    ├── StudyList.module.css
    ├── StudyFilters.jsx         # 필터 컴포넌트
    ├── StudyFilters.module.css
    ├── StudyColumns.jsx         # 테이블 컬럼 정의
    ├── StudyBulkActions.jsx     # 대량 작업 바
    ├── StudyEmptyState.jsx      # 빈 상태 표시
    └── StudyError.jsx           # 에러 표시
```

---

## 스터디 목록 페이지

### `page.jsx`

```jsx
import StudyList from './_components/StudyList'

export default function AdminStudiesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>스터디 관리</h1>
        <p>플랫폼의 모든 스터디를 조회하고 관리합니다</p>
      </div>

      <StudyList />
    </div>
  )
}
```

---

## 스터디 필터 컴포넌트

### `_components/StudyFilters.jsx`

```jsx
export default function StudyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [isPublic, setIsPublic] = useState(searchParams.get('isPublic') || 'all')
  const [isRecruiting, setIsRecruiting] = useState(searchParams.get('isRecruiting') || 'all')

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category !== 'all') params.set('category', category)
    if (isPublic !== 'all') params.set('isPublic', isPublic)
    if (isRecruiting !== 'all') params.set('isRecruiting', isRecruiting)
    router.push(`/admin/studies?${params.toString()}`)
  }

  // ...
}
```

### 필터 옵션

| 필터 | 옵션 | 설명 |
|------|------|------|
| 검색 | 텍스트 | 스터디 이름, 설명 검색 |
| 카테고리 | `all`, `개발/프로그래밍`, `디자인`, `외국어`, `자격증`, `취업/이직`, `기타` | 카테고리 필터 |
| 공개 여부 | `all`, `true`, `false` | 공개/비공개 |
| 모집 여부 | `all`, `true`, `false` | 모집중/모집마감 |

---

## 스터디 목록 컴포넌트

### `_components/StudyList.jsx`

```jsx
export default function StudyList() {
  const { status } = useSession()
  const router = useRouter()
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [pagination, setPagination] = useState(null)

  const fetchStudies = useCallback(async () => {
    const result = await api.get('/api/admin/studies')
    if (result.success) {
      setStudies(result.data)
      setPagination(result.pagination)
    }
  }, [])

  return (
    <div className={styles.container}>
      <StudyBulkActions selectedRows={selectedRows} />
      <Card>
        <Table
          columns={getStudyColumns()}
          data={studies}
          sortable
          selectable
          selectedRows={selectedRows}
          onSelectRows={setSelectedRows}
          loading={loading}
          stickyHeader
          emptyState={<StudyEmptyState />}
        />
      </Card>
    </div>
  )
}
```

---

## 테이블 컬럼 정의

### `_components/StudyColumns.jsx`

```jsx
export function getStudyColumns() {
  return [
    {
      key: 'name',
      label: '스터디명',
      sortable: true,
      width: '300px',
      render: (name, study) => (
        <div className={styles.studyCell}>
          {study.thumbnail ? (
            <Image src={study.thumbnail} alt={name} width={56} height={56} />
          ) : (
            <div className={styles.thumbnailPlaceholder}>
              <span>{study.emoji || '📚'}</span>
            </div>
          )}
          <div>
            <div className={styles.studyTitle}>{name || '제목 없음'}</div>
            <div className={styles.studyOwner}>{study.owner?.name || '알 수 없음'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: '카테고리',
      sortable: true,
      width: '120px',
      render: (category) => (
        <Badge variant="default" style={getCategoryColor(category)}>
          {category || '미분류'}
        </Badge>
      ),
    },
    {
      key: 'isRecruiting',
      label: '상태',
      sortable: true,
      width: '100px',
      render: (isRecruiting, study) => {
        if (study.settings?.isClosed) {
          return <Badge variant="danger">종료</Badge>
        }
        return isRecruiting
          ? <Badge variant="primary">모집중</Badge>
          : <Badge variant="default">진행중</Badge>
      },
    },
    {
      key: 'members',
      label: '인원',
      sortable: true,
      width: '100px',
      render: (_, study) => (
        <span>
          {study.stats?.memberCount || 0}/{study.settings?.maxMembers || 20}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: '생성일',
      sortable: true,
      width: '120px',
      render: (date) => new Date(date).toLocaleDateString('ko-KR'),
    },
    {
      key: 'actions',
      label: '액션',
      width: '120px',
      render: (_, study) => (
        <Link href={`/admin/studies/${study.id}`}>
          <Button size="sm" variant="outline">상세보기</Button>
        </Link>
      ),
    },
  ]
}
```

### 카테고리 색상

```javascript
export function getCategoryColor(category) {
  const colors = {
    '프로그래밍': { bg: 'var(--primary-50)', fg: 'var(--primary-700)' },
    '디자인': { bg: 'var(--danger-50)', fg: 'var(--danger-700)' },
    '어학': { bg: 'var(--success-50)', fg: 'var(--success-700)' },
    '자격증': { bg: 'var(--warning-50)', fg: 'var(--warning-700)' },
    '취업': { bg: 'var(--info-50)', fg: 'var(--info-700)' },
    '독서': { bg: 'var(--gray-100)', fg: 'var(--gray-700)' },
    '취미': { bg: 'var(--secondary-50)', fg: 'var(--secondary-700)' },
  }
  return colors[category] || { bg: 'var(--gray-100)', fg: 'var(--gray-600)' }
}
```

---

## 스터디 상세 페이지

### `/admin/studies/[studyId]/page.jsx`

```jsx
export default function StudyDetailPage({ params }) {
  const { studyId } = use(params)
  const [study, setStudy] = useState(null)

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <Link href="/admin/studies">← 스터디 목록</Link>
        <div className={styles.titleRow}>
          <span className={styles.emoji}>{study.emoji || '📚'}</span>
          <h1>{study.name}</h1>
          <StudyActions studyId={studyId} study={study} onUpdate={fetchStudyDetail} />
        </div>
        <p>{study.description}</p>
      </div>

      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        <StatCard label="멤버" value={`${study.memberStats?.active}/${study.settings?.maxMembers}`} />
        <StatCard label="메시지" value={study.activityStats?.messages} />
        <StatCard label="파일" value={study.activityStats?.files} />
        <StatCard label="평점" value={study.rating?.toFixed(1)} />
      </div>

      <div className={styles.contentGrid}>
        {/* 기본 정보 */}
        <Card>
          <CardHeader><h2>기본 정보</h2></CardHeader>
          <CardContent>
            <InfoRow label="카테고리" value={study.category} />
            <InfoRow label="태그" value={study.tags?.join(', ')} />
            <InfoRow label="초대 코드" value={study.inviteCode} />
            <InfoRow label="생성일" value={formatDate(study.createdAt)} />
            <InfoRow label="최근 활동" value={formatDate(study.activityStats?.lastActivityAt)} />
          </CardContent>
        </Card>

        {/* 설정 */}
        <Card>
          <CardHeader><h2>설정</h2></CardHeader>
          <CardContent>
            <SettingRow label="공개 여부" value={study.settings?.isPublic} />
            <SettingRow label="모집 상태" value={study.settings?.isRecruiting} />
            <SettingRow label="자동 승인" value={study.settings?.autoApprove} />
          </CardContent>
        </Card>

        {/* 스터디장 정보 */}
        <Card>
          <CardHeader><h2>스터디장</h2></CardHeader>
          <CardContent>
            <OwnerInfo owner={study.owner} />
            <Link href={`/admin/users/${study.owner.id}`}>
              사용자 상세보기 →
            </Link>
          </CardContent>
        </Card>

        {/* 멤버 목록 */}
        <Card>
          <CardHeader><h2>멤버 목록</h2></CardHeader>
          <CardContent>
            <MemberList members={study.members} />
          </CardContent>
        </Card>

        {/* 활동 통계 */}
        <Card>
          <CardHeader><h2>활동 통계</h2></CardHeader>
          <CardContent>
            <ActivityStats stats={study.activityStats} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## 스터디 액션 컴포넌트

### `_components/StudyActions.jsx`

```jsx
export default function StudyActions({ studyId, study }) {
  const router = useRouter()
  const [showHideModal, setShowHideModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [reason, setReason] = useState('')
  const [notifyOwner, setNotifyOwner] = useState(true)
  const [notifyMembers, setNotifyMembers] = useState(false)

  // 스터디 숨김
  const handleHide = async () => {
    if (reason.trim().length < 10) {
      alert('숨김 사유는 최소 10자 이상 입력해주세요')
      return
    }

    await api.post(`/api/admin/studies/${studyId}/hide`, {
      reason: reason.trim(),
      notifyOwner,
      notifyMembers,
    })
  }

  // 스터디 숨김 해제
  const handleUnhide = async () => {
    await api.delete(`/api/admin/studies/${studyId}/hide`)
  }

  // 스터디 종료
  const handleClose = async () => {
    await api.post(`/api/admin/studies/${studyId}/close`, {
      reason: reason.trim(),
      notifyOwner,
      notifyMembers,
    })
  }

  // 스터디 재개
  const handleReopen = async () => {
    await api.delete(`/api/admin/studies/${studyId}/close`)
  }

  // 스터디 삭제
  const handleDelete = async () => {
    const confirmText = prompt('삭제하려면 "DELETE"를 입력하세요:')
    if (confirmText !== 'DELETE') return

    await api.delete(`/api/admin/studies/${studyId}/delete`, { reason })
    router.push('/admin/studies')
  }

  return (
    <div className={styles.actions}>
      {/* 숨김/숨김 해제 */}
      {isHidden ? (
        <Button variant="success" onClick={handleUnhide}>숨김 해제</Button>
      ) : (
        <Button variant="warning" onClick={() => setShowHideModal(true)}>숨김</Button>
      )}

      {/* 종료/재개 */}
      {study.settings?.isClosed ? (
        <Button variant="success" onClick={handleReopen}>재개</Button>
      ) : (
        <Button variant="warning" onClick={() => setShowCloseModal(true)}>종료</Button>
      )}

      {/* 삭제 */}
      <Button variant="danger" onClick={() => setShowDeleteModal(true)}>삭제</Button>

      {/* 모달들 */}
      {/* ... */}
    </div>
  )
}
```

---

## 스터디 관리 액션

| 액션 | 설명 | 권한 | API |
|------|------|------|-----|
| 숨김 | 스터디를 검색/목록에서 숨김 | `STUDY_HIDE` | `POST /hide` |
| 숨김 해제 | 숨긴 스터디 복원 | `STUDY_HIDE` | `DELETE /hide` |
| 종료 | 스터디 활동 종료 | `STUDY_CLOSE` | `POST /close` |
| 재개 | 종료된 스터디 재개 | `STUDY_CLOSE` | `DELETE /close` |
| 삭제 | 스터디 영구 삭제 | `STUDY_DELETE` | `DELETE /delete` |

---

## API 엔드포인트

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/studies` | 스터디 목록 조회 | `STUDY_VIEW` |
| GET | `/api/admin/studies/[studyId]` | 스터디 상세 조회 | `STUDY_VIEW` |
| POST | `/api/admin/studies/[studyId]/hide` | 스터디 숨김 | `STUDY_HIDE` |
| DELETE | `/api/admin/studies/[studyId]/hide` | 숨김 해제 | `STUDY_HIDE` |
| POST | `/api/admin/studies/[studyId]/close` | 스터디 종료 | `STUDY_CLOSE` |
| DELETE | `/api/admin/studies/[studyId]/close` | 스터디 재개 | `STUDY_CLOSE` |
| DELETE | `/api/admin/studies/[studyId]/delete` | 스터디 삭제 | `STUDY_DELETE` |

---

## 데이터 구조

### 스터디 목록 응답

```json
{
  "success": true,
  "data": [
    {
      "id": "study-123",
      "name": "React 스터디",
      "emoji": "⚛️",
      "description": "React를 함께 공부합니다",
      "category": "프로그래밍",
      "owner": {
        "id": "user-123",
        "name": "홍길동",
        "email": "hong@example.com"
      },
      "settings": {
        "maxMembers": 20,
        "isPublic": true,
        "isRecruiting": true
      },
      "stats": {
        "memberCount": 15,
        "messageCount": 500
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### 스터디 상세 응답

```json
{
  "success": true,
  "data": {
    "id": "study-123",
    "name": "React 스터디",
    "emoji": "⚛️",
    "description": "React를 함께 공부합니다",
    "category": "프로그래밍",
    "subCategory": "프론트엔드",
    "tags": ["React", "JavaScript", "웹개발"],
    "inviteCode": "ABC123",
    "owner": { ... },
    "settings": { ... },
    "memberStats": {
      "active": 15,
      "pending": 3,
      "left": 2,
      "total": 20
    },
    "activityStats": {
      "messages": 500,
      "files": 25,
      "notices": 10,
      "events": 8,
      "avgMessagesPerDay": 16.5,
      "lastActivityAt": "2024-12-14T10:00:00Z"
    },
    "members": [ ... ],
    "rating": 4.5,
    "reviewCount": 12,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

