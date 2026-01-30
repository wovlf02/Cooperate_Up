# 🖥️ 관리자 화면 문서

## 개요

관리자 화면별 상세 문서입니다.

각 화면에 대한 자세한 내용은 아래 개별 문서를 참조하세요.

---

## 화면별 문서

| 경로 | 문서 | 설명 |
|------|------|------|
| `/admin` | [screens-dashboard.md](./screens-dashboard.md) | 대시보드 |
| `/admin/users` | [screens-users.md](./screens-users.md) | 사용자 관리 |
| `/admin/studies` | [screens-studies.md](./screens-studies.md) | 스터디 관리 |
| `/admin/reports` | [screens-reports.md](./screens-reports.md) | 신고 관리 |
| `/admin/analytics` | [screens-analytics.md](./screens-analytics.md) | 분석 |
| `/admin/audit-logs` | [screens-audit-logs.md](./screens-audit-logs.md) | 감사 로그 |
| `/admin/settings` | [screens-settings.md](./screens-settings.md) | 설정 |

---

## 파일 구조

```
app/admin/
├── layout.jsx           # 관리자 레이아웃
├── page.jsx             # 대시보드
├── _components/         # 대시보드 컴포넌트
├── users/               # 사용자 관리
│   ├── page.jsx
│   ├── [id]/page.jsx
│   └── _components/
├── studies/             # 스터디 관리
│   ├── page.jsx
│   ├── [studyId]/page.jsx
│   └── _components/
├── reports/             # 신고 관리
│   ├── page.jsx
│   ├── [reportId]/page.jsx
│   └── _components/
├── analytics/           # 분석
│   ├── page.jsx
│   └── _components/
├── audit-logs/          # 감사 로그
│   ├── page.jsx
│   └── _components/
└── settings/            # 설정
    ├── page.jsx
    └── _components/
```

---

## 레이아웃 구조

### AdminLayout

```jsx
<AdminLayout>
  ├── <AdminNavbar />        // 상단 네비게이션
  │   ├── Logo
  │   ├── Desktop Menu
  │   ├── Notifications
  │   └── Profile
  ├── <Breadcrumb />         // 빵부스러기
  └── <main>
      {children}
  </main>
</AdminLayout>
```

---

## 공통 컴포넌트

공통 컴포넌트에 대한 자세한 내용은 [components.md](./components.md)를 참조하세요.

### 레이아웃 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| AdminNavbar | 상단 네비게이션 |
| Breadcrumb | 브레드크럼 |
| FilterPanel | 필터 패널 |
| SearchBar | 검색 바 |

### UI 컴포넌트

| 컴포넌트 | 설명 |
|----------|------|
| Badge | 배지 |
| Button | 버튼 |
| Card | 카드 |
| Modal | 모달 |
| Table | 테이블 |
| StatCard | 통계 카드 |
| Toast | 토스트 알림 |
