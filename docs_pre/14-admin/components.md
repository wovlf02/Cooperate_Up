# 🧩 관리자 공통 컴포넌트

## 개요

관리자 페이지에서 사용되는 공통 컴포넌트들입니다. UI 컴포넌트와 레이아웃 컴포넌트로 구분됩니다.

---

## 파일 구조

```
components/admin/
├── common/                      # 레이아웃 컴포넌트
│   ├── AdminNavbar.jsx         # 네비게이션 바
│   ├── AdminNavbar.module.css
│   ├── Breadcrumb.jsx          # 빵부스러기
│   ├── Breadcrumb.module.css
│   ├── FilterPanel.jsx         # 필터 패널
│   ├── SearchBar.jsx           # 검색 바
│   ├── Sidebar.jsx             # 사이드바 (미사용)
│   └── navbar/                 # 네비바 하위 컴포넌트
│       ├── DesktopMenu.jsx
│       ├── MobileMenu.jsx
│       ├── NotificationDropdown.jsx
│       └── ProfileDropdown.jsx
└── ui/                         # UI 컴포넌트
    ├── Badge.jsx               # 배지
    ├── Button/                 # 버튼
    ├── Card/                   # 카드
    ├── Input/                  # 입력 필드
    ├── Modal/                  # 모달
    ├── Select/                 # 선택 필드
    ├── Stats/                  # 통계 카드
    ├── Table/                  # 테이블
    └── Toast/                  # 토스트 알림
```

---

## AdminNavbar

### 용도

관리자 페이지 상단 네비게이션 바

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `user` | object | 현재 로그인 사용자 정보 |
| `adminRole` | object | 관리자 역할 정보 |

### 구조

```jsx
<nav className={styles.navbar}>
  <div className={styles.container}>
    {/* 왼쪽: 로고 + 메뉴 */}
    <div className={styles.left}>
      <Link href="/admin"><Logo /></Link>
      <DesktopMenu menuItems={filteredMenuItems} />
    </div>

    {/* 오른쪽: 알림, 홈버튼, 프로필 */}
    <div className={styles.right}>
      <NotificationDropdown />
      <HomeButton />
      <ProfileDropdown user={user} adminRole={adminRole} />
      <MobileMenuButton />
    </div>
  </div>

  <MobileMenu />
</nav>
```

### 메뉴 아이템

```javascript
const menuItems = [
  { label: '대시보드', href: '/admin', exact: true },
  { label: '사용자', href: '/admin/users' },
  { label: '스터디', href: '/admin/studies' },
  { label: '신고', href: '/admin/reports' },
  { label: '분석', href: '/admin/analytics' },
  { label: '설정', href: '/admin/settings', superAdminOnly: true },
  { label: '감사 로그', href: '/admin/audit-logs', superAdminOnly: true }
]
```

---

## Breadcrumb

### 용도

현재 페이지 경로 표시

### 경로 매핑

```javascript
const pathNames = {
  '/admin': '대시보드',
  '/admin/users': '사용자 관리',
  '/admin/studies': '스터디 관리',
  '/admin/reports': '신고 처리',
  '/admin/analytics': '분석',
  '/admin/settings': '시스템 설정',
  '/admin/audit-logs': '감사 로그',
}
```

### 기능

- 현재 경로를 파싱하여 빵부스러기 생성
- 5개 이상일 경우 중간 항목을 드롭다운으로 축소
- 대시보드만 있을 경우 숨김

---

## Badge

### 용도

상태, 카테고리 등 라벨 표시

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `variant` | string | 색상 테마 |
| `size` | string | 크기 (`sm`, `md`, `lg`) |
| `style` | object | 커스텀 스타일 |

### Variants

```jsx
<Badge variant="default">기본</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">성공</Badge>
<Badge variant="warning">경고</Badge>
<Badge variant="danger">위험</Badge>
<Badge variant="info">정보</Badge>
<Badge variant="secondary">보조</Badge>
```

---

## Button

### 용도

클릭 가능한 버튼

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `variant` | string | 스타일 테마 |
| `size` | string | 크기 (`sm`, `md`, `lg`) |
| `loading` | boolean | 로딩 상태 |
| `disabled` | boolean | 비활성화 |
| `fullWidth` | boolean | 전체 너비 |
| `onClick` | function | 클릭 핸들러 |

### Variants

```jsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="warning">Warning</Button>
<Button variant="success">Success</Button>
```

### 로딩 상태

```jsx
<Button loading>저장 중...</Button>
```

---

## Card

### 용도

콘텐츠 컨테이너

### 구성 요소

```jsx
import { Card, CardHeader, CardContent } from '@/components/admin/ui/Card'

<Card variant="outlined">
  <CardHeader>
    <h3>제목</h3>
  </CardHeader>
  <CardContent>
    내용
  </CardContent>
</Card>
```

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `variant` | string | `default`, `outlined`, `elevated` |
| `className` | string | 추가 클래스 |

---

## Modal

### 용도

오버레이 모달 대화상자

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `isOpen` | boolean | 열림 상태 |
| `onClose` | function | 닫기 핸들러 |
| `title` | string | 모달 제목 |
| `size` | string | `small`, `medium`, `large` |
| `children` | node | 내용 |

### 사용 예시

```jsx
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="사용자 편집"
  size="medium"
>
  <form>
    {/* 폼 내용 */}
  </form>
</Modal>
```

### ConfirmModal

확인 대화상자용 특수 모달:

```jsx
<ConfirmModal
  isOpen={isConfirmOpen}
  onClose={() => setIsConfirmOpen(false)}
  onConfirm={handleConfirm}
  title="삭제 확인"
  message="정말 삭제하시겠습니까?"
  confirmText="삭제"
  cancelText="취소"
  variant="danger"
/>
```

---

## Table

### 용도

데이터 테이블

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `columns` | array | 컬럼 정의 |
| `data` | array | 데이터 배열 |
| `sortable` | boolean | 정렬 가능 |
| `selectable` | boolean | 행 선택 가능 |
| `selectedRows` | array | 선택된 행 |
| `onSelectRows` | function | 선택 핸들러 |
| `loading` | boolean | 로딩 상태 |
| `stickyHeader` | boolean | 헤더 고정 |
| `emptyState` | node | 빈 상태 컴포넌트 |

### 컬럼 정의

```javascript
const columns = [
  {
    key: 'name',           // 데이터 필드 키
    label: '이름',          // 헤더 라벨
    sortable: true,        // 정렬 가능 여부
    width: '200px',        // 컬럼 너비
    render: (value, row) => (  // 커스텀 렌더링
      <span>{value}</span>
    )
  }
]
```

### 사용 예시

```jsx
<Table
  columns={[
    { key: 'name', label: '이름', sortable: true },
    { key: 'status', label: '상태', render: (v) => <Badge>{v}</Badge> },
    { key: 'actions', label: '액션', render: (_, row) => <Button>편집</Button> }
  ]}
  data={users}
  sortable
  selectable
  selectedRows={selected}
  onSelectRows={setSelected}
  stickyHeader
  emptyState={<p>데이터가 없습니다</p>}
/>
```

---

## StatCard (Stats)

### 용도

통계 수치 표시 카드

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `title` | string | 제목 |
| `value` | number | 값 |
| `unit` | string | 단위 (명, 개, 건) |
| `icon` | node | 아이콘 |
| `iconColor` | string | 아이콘 색상 테마 |
| `countUp` | boolean | 카운트업 애니메이션 |
| `loading` | boolean | 로딩 상태 |
| `onClick` | function | 클릭 핸들러 |

### 사용 예시

```jsx
<StatCard
  title="총 사용자"
  value={1234}
  unit="명"
  icon={<UsersIcon />}
  iconColor="primary"
  countUp
  onClick={() => router.push('/admin/users')}
/>
```

---

## Toast

### 용도

임시 알림 메시지

### 사용 예시

```javascript
import { toast } from '@/components/admin/ui/Toast'

// 성공 메시지
toast.success('저장되었습니다')

// 에러 메시지
toast.error('저장에 실패했습니다')

// 경고 메시지
toast.warning('주의가 필요합니다')

// 정보 메시지
toast.info('새로운 업데이트가 있습니다')
```

---

## Input

### 용도

텍스트 입력 필드

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `label` | string | 라벨 |
| `type` | string | 입력 타입 |
| `value` | string | 값 |
| `onChange` | function | 변경 핸들러 |
| `error` | string | 에러 메시지 |
| `helperText` | string | 도움말 텍스트 |
| `required` | boolean | 필수 여부 |
| `disabled` | boolean | 비활성화 |

---

## Select

### 용도

드롭다운 선택 필드

### Props

| Prop | 타입 | 설명 |
|------|------|------|
| `label` | string | 라벨 |
| `value` | string | 선택된 값 |
| `onChange` | function | 변경 핸들러 |
| `options` | array | 옵션 배열 `[{ value, label }]` |
| `error` | string | 에러 메시지 |
| `required` | boolean | 필수 여부 |
| `disabled` | boolean | 비활성화 |

---

## 스타일 가이드

### CSS 변수

```css
/* 색상 */
--primary-500: #6366f1;
--success-500: #10b981;
--warning-500: #f59e0b;
--danger-500: #ef4444;
--info-500: #3b82f6;

/* 간격 */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* 폰트 */
--font-size-sm: 0.875rem;
--font-size-md: 1rem;
--font-size-lg: 1.125rem;

/* 그림자 */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

/* 라운드 */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
```

### 반응형 브레이크포인트

```css
/* 태블릿 */
@media (max-width: 1024px) { }

/* 모바일 */
@media (max-width: 768px) { }

/* 작은 모바일 */
@media (max-width: 480px) { }
```

