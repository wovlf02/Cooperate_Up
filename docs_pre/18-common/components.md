# 🎨 UI 컴포넌트

## 개요

재사용 가능한 UI 컴포넌트들입니다.

---

## 파일 구조

```
coup/src/components/
├── common/                  # 공통 컴포넌트
│   └── RestrictionBanner.jsx    # 활동 제한 배너
├── ui/                      # UI 컴포넌트
│   ├── ConnectionBanner.js      # 연결 상태 배너
│   ├── EmptyState.js            # 빈 상태 표시
│   ├── ErrorToast.js            # 에러 토스트
│   ├── LoadingSpinner.js        # 로딩 스피너
│   ├── MessageError.js          # 메시지 에러
│   └── index.js                 # UI 컴포넌트 Export
└── layout/                  # 레이아웃 컴포넌트
    ├── ConditionalLayout.jsx    # 조건부 레이아웃
    ├── Header.jsx               # 상단 헤더
    ├── MainLayout.jsx           # 메인 레이아웃
    └── Sidebar.jsx              # 사이드바
```

---

## LoadingSpinner

로딩 상태 표시 컴포넌트입니다.

### Props

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 스피너 크기 |
| message | `string` | - | 로딩 메시지 |
| fullScreen | `boolean` | `false` | 전체 화면 오버레이 |

### 사용 예시

```jsx
import { LoadingSpinner, InlineSpinner } from '@/components/ui/LoadingSpinner'

// 기본 사용
<LoadingSpinner />

// 크기 지정 (sm, md, lg)
<LoadingSpinner size="lg" />

// 메시지 포함
<LoadingSpinner message="데이터 로딩 중..." />

// 전체 화면 오버레이
<LoadingSpinner fullScreen />

// 인라인 스피너 (버튼 내부용)
<button disabled={loading}>
  {loading && <InlineSpinner />}
  저장
</button>
```

---

## EmptyState

빈 상태 표시 컴포넌트입니다.

### Props

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| type | `'messages' \| 'error' \| 'search' \| 'empty'` | `'empty'` | 타입 |
| title | `string` | - | 커스텀 제목 |
| message | `string` | - | 커스텀 메시지 |
| action | `ReactNode` | - | 액션 버튼 |

### 타입별 기본값

| Type | 기본 제목 | 아이콘 |
|------|----------|--------|
| messages | 메시지가 없습니다 | MessageSquare |
| error | 오류가 발생했습니다 | AlertCircle |
| search | 검색 결과가 없습니다 | Search |
| empty | 내용이 없습니다 | Inbox |

### 사용 예시

```jsx
import { EmptyState } from '@/components/ui/EmptyState'

// 타입별 사용
<EmptyState type="messages" />
<EmptyState type="search" />
<EmptyState type="error" />

// 커스텀 메시지
<EmptyState
  type="empty"
  title="스터디가 없습니다"
  message="새로운 스터디를 만들어보세요"
  action={<button>스터디 만들기</button>}
/>
```

---

## RestrictionBanner

활동 제한 배너 컴포넌트입니다. 제재된 사용자에게 자동으로 표시됩니다.

### 사용 예시

```jsx
import RestrictionBanner from '@/components/common/RestrictionBanner'

// 제재된 사용자에게 자동으로 표시
<RestrictionBanner />
```

### 표시 내용

- 현재 제한된 활동 목록 (스터디 생성, 가입, 메시지 등)
- 제한 해제 예정 시간
- 경고 아이콘과 함께 노란색 배너로 표시

---

## ConnectionBanner

네트워크 연결 상태 배너입니다.

### Props

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| isOnline | `boolean` | - | 온라인 상태 |

### 사용 예시

```jsx
import ConnectionBanner from '@/components/ui/ConnectionBanner'

<ConnectionBanner isOnline={isOnline} />
```

---

## ErrorToast

에러 토스트 컴포넌트입니다.

### Props

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| message | `string` | - | 에러 메시지 |
| onClose | `function` | - | 닫기 콜백 |

### 사용 예시

```jsx
import ErrorToast from '@/components/ui/ErrorToast'

<ErrorToast
  message="오류가 발생했습니다"
  onClose={() => setShowError(false)}
/>
```

---

## Header

상단 헤더 컴포넌트입니다.

### 크기

- Desktop: 64px
- Mobile: 56px

### Props

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| onMenuToggle | `function` | - | 모바일 메뉴 토글 |

### 기능

| 기능 | 설명 |
|------|------|
| 로고 | 홈으로 이동 |
| 글로벌 검색 | 스터디, 사용자, 태그 검색 |
| 알림 | 실시간 알림 드롭다운 |
| 프로필 | 사용자 메뉴 드롭다운 |

### 사용 예시

```jsx
import Header from '@/components/layout/Header'

<Header onMenuToggle={toggleSidebar} />
```

---

## Sidebar

좌측 네비게이션 사이드바입니다.

### 크기

- Desktop: 15%
- Tablet: 12%
- Mobile: 햄버거 메뉴 (슬라이드)

### Props

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| isAdmin | `boolean` | `false` | 관리자 모드 |
| isOpen | `boolean` | `false` | 모바일 오픈 상태 |
| onClose | `function` | - | 닫기 콜백 |

### 메뉴 구성

| 일반 사용자 | 관리자 |
|------------|--------|
| 대시보드 | 대시보드 |
| 스터디 탐색 | 사용자 관리 |
| 내 스터디 | 스터디 관리 |
| 할 일 | 신고 관리 |
| 알림 | 통계 분석 |
| 마이페이지 | 시스템 설정 |

### 사용 예시

```jsx
import Sidebar from '@/components/layout/Sidebar'

// 일반 사용자
<Sidebar isOpen={isOpen} onClose={closeSidebar} />

// 관리자
<Sidebar isAdmin={true} isOpen={isOpen} onClose={closeSidebar} />
```

---

## 관련 문서

- [Context Providers](./contexts.md)
- [Custom Hooks](./hooks.md)
- [README](./README.md)

