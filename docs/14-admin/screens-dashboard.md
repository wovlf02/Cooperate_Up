# 📊 대시보드 화면

## 개요

관리자 대시보드는 플랫폼의 전반적인 현황을 한눈에 파악할 수 있는 화면입니다.

- **경로**: `/admin`
- **파일**: `app/admin/page.jsx`
- **타입**: Client Component

---

## 화면 구성

```
┌─────────────────────────────────────────────────────────┐
│  대시보드                                               │
│  플랫폼 현황을 한눈에 확인하세요                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ 총 사용자 │ │ 활성    │ │ 처리 대기 │ │ 신규 가입│       │
│  │  1,234명 │ │ 스터디   │ │  12건    │ │  56명   │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
├───────────────────────────────┬─────────────────────────┤
│    최근 활동                   │    빠른 작업             │
│    ┌───────────────────┐     │    ┌─────────────────┐  │
│    │ 새로운 사용자 가입  │     │    │ 사용자 추가     │  │
│    │ 새로운 신고 접수    │     │    │ 스터디 생성     │  │
│    │ 경고 부여          │     │    │ 신고 처리       │  │
│    └───────────────────┘     │    │ 데이터 내보내기  │  │
│                              │    │ 설정            │  │
│                              │    │ 통계 보기       │  │
│                              │    └─────────────────┘  │
└───────────────────────────────┴─────────────────────────┘
```

---

## 주요 파일

| 파일 | 설명 |
|------|------|
| `page.jsx` | 대시보드 메인 페이지 |
| `page.module.css` | 스타일시트 |
| `_components/StatsCards.jsx` | 통계 카드 (대체용) |
| `_components/RecentActivity.jsx` | 최근 활동 타임라인 |
| `_components/QuickActions.jsx` | 빠른 작업 버튼 |

---

## 메인 컴포넌트

### `page.jsx`

```jsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import StatCard from '@/components/admin/ui/Stats'
import RecentActivity from './_components/RecentActivity'
import QuickActions from './_components/QuickActions'
import api from '@/lib/api'

export default function AdminDashboardPage() {
  const { status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  async function fetchStats() {
    const result = await api.get('/api/admin/stats')
    setStats(result.success ? result.data : null)
  }

  // 로딩, 에러, 데이터 렌더링...
}
```

**주요 기능:**
- 세션 상태에 따른 데이터 로딩
- 통계 API 호출 및 상태 관리
- 로딩/에러 상태 UI 표시

---

## 통계 카드

### StatCard 컴포넌트

```jsx
<StatCard
  title="총 사용자"
  value={totalUsers}
  unit="명"
  icon={<UserIcon />}
  iconColor="primary"
  countUp              // 숫자 애니메이션
  onClick={() => router.push('/admin/users')}
/>
```

**Props:**

| Prop | 타입 | 설명 |
|------|------|------|
| `title` | string | 카드 제목 |
| `value` | number | 표시할 값 |
| `unit` | string | 단위 (명, 개, 건) |
| `icon` | ReactNode | 아이콘 SVG |
| `iconColor` | string | 아이콘 색상 테마 |
| `countUp` | boolean | 카운트업 애니메이션 |
| `loading` | boolean | 로딩 상태 |
| `onClick` | function | 클릭 핸들러 |

### 표시 통계

| 카드 | 데이터 경로 | 설명 |
|------|------------|------|
| 총 사용자 | `summary.users.total` | 전체 사용자 수 |
| 활성 스터디 | `summary.studies.active` | 모집 중인 스터디 수 |
| 처리 대기 | `summary.reports.pending` | 대기 중인 신고 건수 |
| 신규 가입 | `summary.users.newThisWeek` | 이번 주 신규 가입자 |

---

## 최근 활동 컴포넌트

### `_components/RecentActivity.jsx`

```jsx
export default function RecentActivity({ activity }) {
  const activityList = buildActivityList(activity)
  
  return (
    <Card variant="outlined">
      <CardHeader>
        <h3>최근 활동</h3>
        <Link href="/admin/audit-logs">
          <Button size="sm" variant="ghost">전체보기</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className={styles.timeline}>
          {activityList.map((item) => (
            <TimelineItem key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 활동 타입

| 타입 | 아이콘 | 설명 |
|------|--------|------|
| `USER_CREATED` | 👤 | 새로운 사용자 가입 |
| `STUDY_CREATED` | 📚 | 새로운 스터디 생성 |
| `REPORT_CREATED` | ⚠️ | 새로운 신고 접수 |
| `WARNING` | 🔔 | 경고 부여 |
| `PAYMENT` | 💳 | 결제 (미사용) |

### 활동 데이터 구조

```javascript
{
  id: 'user-123',
  type: 'USER_CREATED',
  title: '새로운 사용자 가입',
  description: 'user@example.com',
  createdAt: '2024-12-14T10:00:00Z',
  user: {
    name: '홍길동',
    avatar: '/avatar.jpg',
    email: 'user@example.com'
  },
  badge: {
    variant: 'success',
    label: '정상'
  }
}
```

---

## 빠른 작업 컴포넌트

### `_components/QuickActions.jsx`

```jsx
export default function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      icon: <UserAddIcon />,
      label: '사용자 추가',
      description: '새 사용자 등록',
      color: { bg: 'var(--pastel-purple-100)', fg: 'var(--pastel-purple-600)' },
      onClick: () => router.push('/admin/users/new'),
    },
    // ...
  ]

  return (
    <Card variant="outlined">
      <CardHeader><h3>빠른 작업</h3></CardHeader>
      <CardContent>
        <div className={styles.actions}>
          {actions.map((action, index) => (
            <ActionButton key={index} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 빠른 작업 목록

| 작업 | 설명 | 이동 경로 |
|------|------|----------|
| 사용자 추가 | 새 사용자 등록 | `/admin/users/new` |
| 스터디 생성 | 새 스터디 개설 | `/admin/studies/new` |
| 신고 처리 | 대기중인 신고 확인 | `/admin/reports` |
| 데이터 내보내기 | CSV 파일 생성 | 준비 중 |
| 설정 | 시스템 설정 관리 | `/admin/settings` |
| 통계 보기 | 상세 분석 데이터 | `/admin/analytics` |

---

## API 호출

### `/api/admin/stats`

**요청:**
```
GET /api/admin/stats
```

**응답:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "users": {
        "total": 1234,
        "active": 1100,
        "suspended": 34,
        "newToday": 12,
        "newThisWeek": 56
      },
      "studies": {
        "total": 456,
        "active": 320,
        "newToday": 5,
        "newThisWeek": 23
      },
      "reports": {
        "total": 89,
        "pending": 12,
        "urgent": 2,
        "newToday": 3
      },
      "moderation": {
        "totalWarnings": 45,
        "warningsToday": 2,
        "activeSanctions": 8
      }
    },
    "recentActivity": {
      "users": [...],
      "reports": [...],
      "warnings": [...]
    },
    "trends": {
      "userGrowth": [...],
      "reportTrends": [...]
    }
  }
}
```

---

## 스타일링

### CSS 변수 활용

```css
.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-lg);
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 에러 처리

### 로딩 상태

```jsx
if (status === 'loading' || loading) {
  return (
    <div className={styles.statsGrid}>
      {[1, 2, 3, 4].map((i) => (
        <StatCard key={i} title="로딩 중..." value={0} loading />
      ))}
    </div>
  )
}
```

### 에러 상태

```jsx
if (error) {
  return (
    <Card variant="outlined">
      <CardContent>
        <div className={styles.error}>
          <ErrorIcon />
          <h3>통계를 불러올 수 없습니다</h3>
          <p>{error}</p>
          <Button onClick={fetchStats} variant="primary">
            다시 시도
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

