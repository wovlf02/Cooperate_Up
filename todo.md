# 📚 CoUp 프로젝트 문서화 TODO

> Next.js 16 기반 스터디 협업 플랫폼 완전 문서화 가이드라인
> 
> **목표**: 코드를 전혀 보지 않고도 프로젝트 전체를 완벽히 이해할 수 있는 문서 작성

---

## 📋 문서 폴더 구조 (생성 대상)

```
docs/
├── README.md                    # 문서 홈 & 네비게이션
├── 01_overview/                 # 프로젝트 개요
│   ├── README.md
│   ├── project-introduction.md
│   ├── tech-stack.md
│   ├── folder-structure.md
│   └── glossary.md
├── 02_architecture/             # 시스템 아키텍처
│   ├── README.md
│   ├── system-overview.md
│   ├── data-flow.md
│   ├── authentication-flow.md
│   └── realtime-communication.md
├── 03_database/                 # 데이터베이스 설계
│   ├── README.md
│   ├── erd-diagram.md
│   ├── models/
│   │   ├── user.md
│   │   ├── study.md
│   │   ├── study-member.md
│   │   ├── message.md
│   │   ├── task.md
│   │   ├── notification.md
│   │   └── ... (각 모델별)
│   ├── relationships.md
│   └── indexes-optimization.md
├── 04_api/                      # API 명세
│   ├── README.md
│   ├── auth/
│   ├── admin/
│   ├── studies/
│   ├── my-studies/
│   ├── tasks/
│   ├── groups/
│   ├── notifications/
│   ├── users/
│   ├── dashboard/
│   └── upload/
├── 05_pages/                    # 페이지 라우트
│   ├── README.md
│   ├── auth/
│   ├── admin/
│   ├── dashboard/
│   ├── studies/
│   ├── my-studies/
│   ├── tasks/
│   ├── notifications/
│   ├── settings/
│   └── user/
├── 06_components/               # UI 컴포넌트
│   ├── README.md
│   ├── admin/
│   ├── chat/
│   ├── common/
│   ├── dashboard/
│   ├── landing/
│   ├── layout/
│   ├── my-page/
│   ├── notifications/
│   ├── studies/
│   ├── study/
│   ├── tasks/
│   ├── ui/
│   └── video-call/
├── 07_state_management/         # 상태 관리
│   ├── README.md
│   ├── contexts/
│   │   ├── settings-context.md
│   │   └── socket-context.md
│   ├── hooks/
│   └── tanstack-query.md
├── 08_utilities/                # 유틸리티 & 헬퍼
│   ├── README.md
│   ├── lib/
│   │   ├── auth-helpers.md
│   │   ├── cache-helpers.md
│   │   ├── notification-helpers.md
│   │   ├── study-helpers.md
│   │   ├── file-upload-helpers.md
│   │   └── transaction-helpers.md
│   ├── validators/
│   └── utils/
├── 09_testing/                  # 테스팅
│   ├── README.md
│   ├── setup.md
│   ├── api-tests.md
│   ├── component-tests.md
│   ├── integration-tests.md
│   └── coverage.md
├── 10_scripts/                  # 유틸리티 스크립트
│   ├── README.md
│   ├── admin-scripts.md
│   ├── database-scripts.md
│   └── utility-scripts.md
├── 11_configuration/            # 설정
│   ├── README.md
│   ├── next-config.md
│   ├── eslint-config.md
│   ├── jest-config.md
│   ├── server-config.md
│   └── environment-variables.md
└── 12_deployment/               # 배포
    ├── README.md
    ├── docker.md
    ├── prisma-migrations.md
    └── production-guide.md
```

---

## ✅ Phase 1: 기반 구조 및 개요 (필수 선행)

### 1.1 문서 폴더 구조 생성
- [x] `docs/` 폴더 생성 (루트 경로)
- [x] 12개 하위 폴더 생성 (`01_overview` ~ `12_deployment`)
- [x] 각 폴더에 `README.md` 기본 템플릿 생성

### 1.2 프로젝트 개요 문서 (01_overview)
- [x] **README.md**: 개요 섹션 소개 및 목차
- [x] **project-introduction.md**: 프로젝트 소개
  - CoUp 서비스 목적 및 대상 사용자
  - 핵심 기능 요약 (스터디 관리, 실시간 채팅, 태스크 관리, 대시보드 등)
  - 서비스 특징 및 차별점
- [x] **tech-stack.md**: 기술 스택 상세
  - Frontend: Next.js 16, React 19, TailwindCSS 4
  - Backend: Next.js API Routes, Prisma 6, PostgreSQL
  - 실시간: Socket.io 4.8
  - 인증: NextAuth 4
  - 상태관리: TanStack Query 5, React Context
  - 검증: Zod 4
  - 테스트: Jest 30, React Testing Library
- [x] **folder-structure.md**: 폴더 구조 맵
  - coup/ 루트 구조 설명
  - src/ 하위 각 폴더 역할 설명
  - 파일 네이밍 컨벤션
- [x] **glossary.md**: 용어집
  - 도메인 용어 (Study, StudyMember, Task, Group 등)
  - 기술 용어 (SSR, CSR, Middleware, API Route 등)

---

## ✅ Phase 2: 데이터베이스 설계 (의존성 없음, 병렬 가능)

### 2.1 스키마 분석 및 문서화 (03_database)
- [x] **README.md**: 데이터베이스 섹션 소개
- [x] **erd-diagram.md**: ERD 다이어그램 (Mermaid 사용)
  - 전체 테이블 관계도
  - 주요 도메인별 부분 ERD
- [x] **models/user.md**: User 모델 상세
  - 필드 정의 및 타입
  - 관계 설명
  - 인덱스 및 제약조건
  - 사용 예시
- [x] **models/study.md**: Study 모델 상세
- [x] **models/study-member.md**: StudyMember 모델 상세
- [x] **models/group.md**: Group 및 GroupMember 모델 상세
- [x] **models/message.md**: Message, DirectMessage 모델 상세
- [x] **models/task.md**: Task, TaskAssignee 모델 상세
- [x] **models/notification.md**: Notification 모델 상세
- [x] **models/calendar.md**: CalendarEvent 모델 상세
- [x] **models/file.md**: File 모델 상세
- [x] **models/settings.md**: UserSettings, SystemSettings 모델 상세
- [x] **models/admin.md**: AdminInvitation, AdminUser 모델 상세
- [ ] **models/session.md**: Session, Account, VerificationToken 모델 상세
- [x] **relationships.md**: 테이블 간 관계 상세
  - 1:N, N:M 관계 설명
  - 외래 키 및 캐스케이드 정책
- [x] **indexes-optimization.md**: 인덱스 전략
  - 현재 적용된 인덱스 목록
  - 쿼리 최적화 전략

---

## ✅ Phase 3: 시스템 아키텍처 (Phase 1, 2 완료 후)

### 3.1 아키텍처 문서화 (02_architecture)
- [x] **README.md**: 아키텍처 섹션 소개
- [x] **system-overview.md**: 시스템 전체 구조
  - 클라이언트-서버 구조
  - Next.js App Router 구조
  - 서버 컴포넌트 vs 클라이언트 컴포넌트 전략
- [x] **data-flow.md**: 데이터 흐름도
  - 페이지 렌더링 흐름 (SSR/CSR)
  - API 요청-응답 흐름
  - TanStack Query 캐싱 전략
- [x] **authentication-flow.md**: 인증 흐름
  - middleware.js 역할 및 로직
  - NextAuth 설정 및 흐름
  - 세션 관리 전략
  - 권한 체계 (MEMBER, ADMIN, SUPER_ADMIN)
- [x] **realtime-communication.md**: 실시간 통신
  - Socket.io 서버 설정 (server.mjs)
  - SocketContext 클라이언트 구현
  - 이벤트 목록 및 핸들러
  - Redis 어댑터 활용

---

## ✅ Phase 4: API 명세 (Phase 2 완료 후)

### 4.1 인증 API (04_api/auth)
- [x] **README.md**: 인증 API 개요
- [x] **nextauth.md**: NextAuth 통합 인증 핸들러
- [x] **signup.md**: POST /api/auth/signup (회원가입)
- [x] **me.md**: GET /api/auth/me (현재 사용자 정보)
- [x] **validate-session.md**: GET /api/auth/validate-session (세션 검증)
- [x] **verify.md**: POST /api/auth/verify (시그널링 서버용)

### 4.2 관리자 API (04_api/admin)
- [x] **README.md**: 관리자 API 개요
- [x] **stats.md**: 관리자 대시보드 통계 API
- [x] **users.md**: 사용자 관리 API
- [x] **studies.md**: 스터디 관리 API
- [x] **settings.md**: 시스템 설정 API
- [x] **reports.md**: 신고 관리 API
- [x] **analytics.md**: 분석 데이터 API
- [x] **audit-logs.md**: 감사 로그 API

### 4.3 스터디 API (04_api/studies)
- [x] **README.md**: 스터디 API 개요 (목록, 생성, 상세, 수정, 삭제, 가입, 멤버 관리 포함)

### 4.4 내 스터디 API (04_api/my-studies)
- [x] **README.md**: 내 스터디 API 개요

### 4.5 태스크 API (04_api/tasks)
- [x] **README.md**: 태스크 API 개요 (목록, 생성, 수정, 삭제 포함)

### 4.6 그룹 API (04_api/groups)
- [x] **README.md**: 그룹 API 개요 (CRUD 작업 포함)

### 4.7 알림 API (04_api/notifications)
- [x] **README.md**: 알림 API 개요 (목록, 읽음 처리, 삭제 포함)

### 4.8 사용자 API (04_api/users)
- [x] **README.md**: 사용자 API 개요 (검색, 프로필, 설정 포함)

### 4.9 대시보드 API (04_api/dashboard)
- [x] **README.md**: 대시보드 API 개요 (메인 데이터, 통계 포함)

### 4.10 업로드 API (04_api/upload)
- [x] **README.md**: 파일 업로드 API 개요

---

## ✅ Phase 5: 페이지 라우트 (Phase 3, 4 완료 후)

### 5.1 인증 페이지 (05_pages/auth)
- [ ] **README.md**: 인증 페이지 개요
- [ ] **login.md**: 로그인 페이지
- [ ] **register.md**: 회원가입 페이지
- [ ] **forgot-password.md**: 비밀번호 찾기

### 5.2 관리자 페이지 (05_pages/admin)
- [ ] **README.md**: 관리자 페이지 개요
- [ ] **dashboard.md**: 관리자 대시보드
- [ ] **users.md**: 사용자 관리
- [ ] **studies.md**: 스터디 관리
- [ ] **reports.md**: 신고 관리
- [ ] **analytics.md**: 분석
- [ ] **settings.md**: 시스템 설정
- [ ] **audit-logs.md**: 감사 로그

### 5.3 대시보드 페이지 (05_pages/dashboard)
- [ ] **README.md**: 대시보드 페이지
- [ ] **overview.md**: 개요 및 위젯 구성

### 5.4 스터디 페이지 (05_pages/studies)
- [ ] **README.md**: 스터디 페이지 개요
- [ ] **list.md**: 스터디 목록
- [ ] **detail.md**: 스터디 상세
- [ ] **create.md**: 스터디 생성
- [ ] **search.md**: 스터디 검색

### 5.5 내 스터디 페이지 (05_pages/my-studies)
- [ ] **README.md**: 내 스터디 페이지 개요
- [ ] **list.md**: 내 스터디 목록
- [ ] **detail.md**: 내 스터디 상세
- [ ] **chat.md**: 채팅
- [ ] **calendar.md**: 캘린더
- [ ] **members.md**: 멤버 관리
- [ ] **tasks.md**: 태스크 관리
- [ ] **groups.md**: 그룹 관리
- [ ] **settings.md**: 스터디 설정

### 5.6 태스크 페이지 (05_pages/tasks)
- [ ] **README.md**: 태스크 페이지

### 5.7 알림 페이지 (05_pages/notifications)
- [ ] **README.md**: 알림 페이지

### 5.8 설정 페이지 (05_pages/settings)
- [ ] **README.md**: 설정 페이지
- [ ] **profile.md**: 프로필 설정
- [ ] **account.md**: 계정 설정
- [ ] **notifications.md**: 알림 설정

### 5.9 사용자 페이지 (05_pages/user)
- [ ] **README.md**: 사용자 프로필 페이지

---

## ✅ Phase 6: UI 컴포넌트 (Phase 5와 병렬 가능)

### 6.1 공통 컴포넌트 (06_components)
- [ ] **README.md**: 컴포넌트 문서 개요 및 컴포넌트 분류 체계

### 6.2 Admin 컴포넌트 (06_components/admin)
- [ ] **README.md**: 관리자 컴포넌트 목록 및 Props 정의

### 6.3 Chat 컴포넌트 (06_components/chat)
- [ ] **README.md**: 채팅 컴포넌트 목록 및 Props 정의

### 6.4 Common 컴포넌트 (06_components/common)
- [ ] **README.md**: 공통 컴포넌트 목록 및 Props 정의

### 6.5 Dashboard 컴포넌트 (06_components/dashboard)
- [ ] **README.md**: 대시보드 컴포넌트 목록 및 Props 정의

### 6.6 Landing 컴포넌트 (06_components/landing)
- [ ] **README.md**: 랜딩 페이지 컴포넌트 목록 및 Props 정의

### 6.7 Layout 컴포넌트 (06_components/layout)
- [ ] **README.md**: 레이아웃 컴포넌트 목록 및 Props 정의

### 6.8 My-page 컴포넌트 (06_components/my-page)
- [ ] **README.md**: 마이페이지 컴포넌트 목록 및 Props 정의

### 6.9 Notifications 컴포넌트 (06_components/notifications)
- [ ] **README.md**: 알림 컴포넌트 목록 및 Props 정의

### 6.10 Studies 컴포넌트 (06_components/studies)
- [ ] **README.md**: 스터디 목록 컴포넌트 목록 및 Props 정의

### 6.11 Study 컴포넌트 (06_components/study)
- [ ] **README.md**: 스터디 상세 컴포넌트 목록 및 Props 정의

### 6.12 Tasks 컴포넌트 (06_components/tasks)
- [ ] **README.md**: 태스크 컴포넌트 목록 및 Props 정의

### 6.13 UI 컴포넌트 (06_components/ui)
- [ ] **README.md**: 기본 UI 컴포넌트 (LoadingSpinner, EmptyState, ErrorToast 등)

### 6.14 Video-call 컴포넌트 (06_components/video-call)
- [ ] **README.md**: 화상 통화 컴포넌트 목록 및 Props 정의

---

## ✅ Phase 7: 상태 관리 (Phase 6과 병렬 가능)

### 7.1 Context 문서화 (07_state_management/contexts)
- [ ] **README.md**: Context API 사용 개요
- [ ] **settings-context.md**: SettingsContext 상세
  - 상태 구조
  - 제공 함수
  - 사용 예시
- [ ] **socket-context.md**: SocketContext 상세
  - 연결 관리
  - 이벤트 구독/발행
  - 사용 예시

### 7.2 Hooks 문서화 (07_state_management/hooks)
- [ ] **README.md**: 커스텀 훅 개요
- [ ] **useRestriction.md**: 접근 제한 훅
- [ ] **useSettingsUtils.md**: 설정 유틸 훅

### 7.3 TanStack Query (07_state_management)
- [ ] **tanstack-query.md**: TanStack Query 사용 패턴
  - Query Keys 구조
  - 캐싱 전략
  - Mutation 패턴
  - 낙관적 업데이트

---

## ✅ Phase 8: 유틸리티 & 헬퍼 (Phase 4와 병렬 가능)

### 8.1 Lib 헬퍼 함수 (08_utilities/lib)
- [ ] **README.md**: 헬퍼 함수 개요
- [ ] **auth-helpers.md**: 인증 헬퍼 함수
- [ ] **cache-helpers.md**: 캐시 헬퍼 함수
- [ ] **notification-helpers.md**: 알림 헬퍼 함수
- [ ] **study-helpers.md**: 스터디 헬퍼 함수
- [ ] **file-upload-helpers.md**: 파일 업로드 헬퍼
- [ ] **transaction-helpers.md**: 트랜잭션 헬퍼
- [ ] **my-studies-helpers.md**: 내 스터디 헬퍼
- [ ] **activity-log-helpers.md**: 활동 로그 헬퍼

### 8.2 Validators (08_utilities/validators)
- [ ] **README.md**: Validator 개요
- [ ] **chat-validators.md**: 채팅 검증
- [ ] **study-validators.md**: 스터디 검증
- [ ] **notification-validators.md**: 알림 검증
- [ ] **group-validators.md**: 그룹 검증
- [ ] **dashboard-validators.md**: 대시보드 검증

### 8.3 Utils (08_utilities/utils)
- [ ] **README.md**: 유틸리티 함수 개요
- [ ] **clsx.md**: 클래스 조합
- [ ] **file.md**: 파일 처리
- [ ] **format.md**: 포맷팅
- [ ] **time.md**: 시간 처리
- [ ] **studyColors.md**: 스터디 색상

---

## ✅ Phase 9: 테스팅 (Phase 8 완료 후)

### 9.1 테스트 설정 (09_testing)
- [ ] **README.md**: 테스팅 개요
- [ ] **setup.md**: Jest 설정 및 환경 구성
  - jest.config.js 설명
  - jest.setup.js 설명
  - 모킹 전략

### 9.2 테스트 유형별 문서화
- [ ] **api-tests.md**: API 테스트 구조 및 작성법
- [ ] **component-tests.md**: 컴포넌트 테스트 구조 및 작성법
- [ ] **integration-tests.md**: 통합 테스트 구조 및 작성법
- [ ] **coverage.md**: 커버리지 현황 및 목표

---

## ✅ Phase 10: 유틸리티 스크립트 (병렬 가능)

### 10.1 스크립트 문서화 (10_scripts)
- [ ] **README.md**: 스크립트 개요 및 분류
- [ ] **admin-scripts.md**: 관리자 관련 스크립트
  - create-super-admin.js
  - create-test-admin.js
  - check-admin.js
  - check-admin-debug.js
  - clean-old-admin-data.js
- [ ] **database-scripts.md**: 데이터베이스 스크립트
  - seed.js (prisma/)
  - seed-settings.js
  - add-more-studies.js
  - fix-study-capacity.js
- [ ] **utility-scripts.md**: 기타 유틸리티 스크립트
  - activate-users.js
  - reset-password.js
  - update-avatar.js
  - check-user-status.js
  - check-user-roles.js
  - test-login.js
  - test-join-request.js
  - test-calendar-create.js

---

## ✅ Phase 11: 설정 파일 (병렬 가능)

### 11.1 설정 문서화 (11_configuration)
- [ ] **README.md**: 설정 파일 개요
- [ ] **next-config.md**: next.config.mjs 상세
- [ ] **eslint-config.md**: eslint.config.mjs 상세
- [ ] **jest-config.md**: jest.config.js 상세
- [ ] **server-config.md**: server.mjs 상세 (Socket.io 설정 포함)
- [ ] **environment-variables.md**: 환경 변수 목록 및 설명

---

## ✅ Phase 12: 배포 (마지막 단계)

### 12.1 배포 문서화 (12_deployment)
- [ ] **README.md**: 배포 개요
- [ ] **docker.md**: Docker 설정 및 docker-compose 사용법
- [ ] **prisma-migrations.md**: Prisma 마이그레이션 전략
- [ ] **production-guide.md**: 프로덕션 배포 체크리스트

---

## ✅ Phase 13: 최종 검토 및 완성

### 13.1 문서 홈 완성 (docs/README.md)
- [ ] 전체 문서 네비게이션 작성
- [ ] 프로젝트 요약 테이블 작성
- [ ] 핵심 기능 목록 작성
- [ ] 문서 읽는 순서 가이드 작성

### 13.2 품질 검토
- [ ] 모든 문서 링크 검증
- [ ] 다이어그램 렌더링 확인
- [ ] 비개발자 관점 리뷰
- [ ] 누락된 정보 보완

---

## 📊 진행률 추적

| Phase | 섹션 | 예상 문서 수 | 완료 | 진행률 |
|-------|------|-------------|------|--------|
| 1 | 기반 구조 및 개요 | 6 | 6 | 100% |
| 2 | 데이터베이스 | 17 | 16 | 94% |
| 3 | 아키텍처 | 5 | 5 | 100% |
| 4 | API 명세 | 17 | 17 | 100% |
| 5 | 페이지 라우트 | 25 | 0 | 0% |
| 6 | UI 컴포넌트 | 14 | 0 | 0% |
| 7 | 상태 관리 | 6 | 0 | 0% |
| 8 | 유틸리티 | 18 | 0 | 0% |
| 9 | 테스팅 | 5 | 0 | 0% |
| 10 | 스크립트 | 4 | 0 | 0% |
| 11 | 설정 | 6 | 0 | 0% |
| 12 | 배포 | 4 | 0 | 0% |
| 13 | 최종 검토 | 2 | 0 | 0% |
| **합계** | | **129** | **44** | **34%** |

---

## 📝 작성 가이드라인

### 문서 작성 원칙
1. **비개발자도 이해 가능**: 기술 용어는 용어집 참조 링크 제공
2. **일관된 구조**: 각 문서는 개요 → 상세 → 예시 순서
3. **다이어그램 활용**: Mermaid로 시각적 설명 제공
4. **코드 예시**: 실제 사용 예시 포함 (필요시)
5. **링크 연결**: 관련 문서 간 상호 참조

### 문서 템플릿
```markdown
# [문서 제목]

## 📋 개요
[한 줄 설명]

## 🎯 목적
[이 문서에서 다루는 내용]

## 📚 상세 내용
[핵심 내용 작성]

## 💡 예시
[사용 예시]

## 🔗 관련 문서
- [링크1]
- [링크2]
```

---

**생성일**: 2026-01-31
**최종 수정일**: 2026-01-31
**상태**: 작성 대기 중
