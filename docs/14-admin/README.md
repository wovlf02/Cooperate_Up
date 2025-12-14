# 👨‍💼 관리자 도메인

## 개요

CoUp 플랫폼의 관리자 기능을 담당하는 도메인입니다. RBAC(Role-Based Access Control) 기반의 권한 시스템을 사용하여 관리자별로 차등 권한을 부여합니다.

---

## 📚 문서 구조

| 문서 | 설명 |
|------|------|
| [overview.md](./overview.md) | 관리자 시스템 개요 및 아키텍처 |
| [permissions.md](./permissions.md) | 권한 시스템 및 RBAC 상세 |
| [screens-dashboard.md](./screens-dashboard.md) | 대시보드 화면 |
| [screens-users.md](./screens-users.md) | 사용자 관리 화면 |
| [screens-studies.md](./screens-studies.md) | 스터디 관리 화면 |
| [screens-reports.md](./screens-reports.md) | 신고 관리 화면 |
| [screens-analytics.md](./screens-analytics.md) | 분석 화면 |
| [screens-audit-logs.md](./screens-audit-logs.md) | 감사 로그 화면 |
| [screens-settings.md](./screens-settings.md) | 설정 화면 |
| [api-users.md](./api-users.md) | 사용자 관리 API |
| [api-studies.md](./api-studies.md) | 스터디 관리 API |
| [api-reports.md](./api-reports.md) | 신고 관리 API |
| [api-analytics.md](./api-analytics.md) | 분석 API |
| [api-settings.md](./api-settings.md) | 설정 및 감사로그 API |
| [components.md](./components.md) | 관리자 공통 컴포넌트 |
| [helpers.md](./helpers.md) | 헬퍼 함수 및 유틸리티 |
| [exceptions.md](./exceptions.md) | 예외 처리 시스템 |

---

## 주요 기능

| 기능 | 설명 | 권한 레벨 |
|------|------|-----------|
| 대시보드 | 플랫폼 현황, 통계, 빠른 작업 | VIEWER+ |
| 사용자 관리 | 조회, 검색, 경고, 정지, 삭제 | VIEWER~ADMIN |
| 스터디 관리 | 조회, 숨김, 종료, 삭제 | VIEWER~ADMIN |
| 신고 관리 | 조회, 할당, 처리, 해결/거부 | VIEWER~MODERATOR |
| 분석 | 통계, 차트, 트렌드 | VIEWER+ |
| 감사 로그 | 관리자 활동 기록 조회 | ADMIN+ |
| 시스템 설정 | 설정 관리, 캐시 초기화 | SUPER_ADMIN |

---

## 관리자 역할 (RBAC)

| 역할 | 설명 | 권한 수준 |
|------|------|-----------|
| `VIEWER` | 조회 전용 관리자 | 최소 |
| `MODERATOR` | 콘텐츠 모더레이션 담당 | 중간 |
| `ADMIN` | 사용자/스터디 관리 담당 | 높음 |
| `SUPER_ADMIN` | 모든 권한 보유 | 최고 |

---

## 파일 구조

```
coup/src/
├── app/
│   ├── admin/
│   │   ├── layout.jsx           # 관리자 레이아웃
│   │   ├── page.jsx             # 대시보드
│   │   ├── _components/         # 대시보드 컴포넌트
│   │   ├── users/               # 사용자 관리
│   │   ├── studies/             # 스터디 관리
│   │   ├── reports/             # 신고 관리
│   │   ├── analytics/           # 분석
│   │   ├── audit-logs/          # 감사 로그
│   │   └── settings/            # 설정
│   └── api/admin/
│       ├── stats/               # 통계 API
│       ├── users/               # 사용자 API
│       ├── studies/             # 스터디 API
│       ├── reports/             # 신고 API
│       ├── analytics/           # 분석 API
│       ├── audit-logs/          # 감사 로그 API
│       └── settings/            # 설정 API
├── components/admin/
│   ├── common/                  # 공통 컴포넌트
│   └── ui/                      # UI 컴포넌트
└── lib/admin/
    ├── auth.js                  # 인증 미들웨어
    ├── permissions.js           # 권한 시스템
    └── roles.js                 # 역할 관리
```

---

## 기술 스택

- **Frontend**: Next.js 15 (App Router), React 19
- **Styling**: CSS Modules
- **Charts**: Recharts
- **State**: React Hooks (useState, useEffect, useCallback)
- **API**: Next.js Route Handlers
- **Auth**: NextAuth.js + Custom RBAC
- **DB**: PostgreSQL + Prisma ORM

---

## 접근 제어

모든 관리자 페이지와 API는 다음 단계로 접근을 제어합니다:

1. **세션 확인**: NextAuth.js 세션 유효성 검증
2. **관리자 역할 확인**: `AdminRole` 테이블에서 역할 조회
3. **만료 확인**: 역할 만료 시간 검증
4. **권한 확인**: 요청된 작업에 필요한 권한 검증

---

## 시작하기

### 관리자 계정 생성

```bash
cd coup
npm run create-admin
# 또는
node scripts/create-super-admin.js
```

### 개발 서버 실행

```bash
npm run dev
```

### 관리자 페이지 접속

```
http://localhost:3000/admin
```

