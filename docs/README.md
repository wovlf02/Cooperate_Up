# 📚 CoUp 프로젝트 문서

> Next.js 16 기반 스터디 협업 플랫폼 완전 문서화

---

## 📋 문서 구조

```
docs/
├── 01_overview/           # 프로젝트 개요
│   ├── project-introduction.md
│   ├── tech-stack.md
│   ├── folder-structure.md
│   └── glossary.md
├── 02_architecture/       # 시스템 아키텍처
│   ├── system-overview.md
│   ├── data-flow.md
│   ├── authentication-flow.md
│   └── realtime-communication.md
├── 03_database/           # 데이터베이스 설계
│   ├── erd-diagram.md
│   ├── models/
│   ├── relationships.md
│   └── indexes-optimization.md
├── 04_api/                # API 명세
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
├── 05_pages/              # 페이지 라우트
│   ├── auth/
│   ├── admin/
│   ├── dashboard/
│   ├── studies/
│   ├── my-studies/
│   ├── tasks/
│   ├── notifications/
│   ├── settings/
│   └── user/
├── 06_components/         # UI 컴포넌트
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
├── 07_state_management/   # 상태 관리
│   ├── contexts/
│   ├── hooks/
│   └── tanstack-query.md
├── 08_utilities/          # 유틸리티 & 헬퍼
│   ├── lib/
│   ├── validators/
│   └── utils/
├── 09_testing/            # 테스팅
├── 10_scripts/            # 유틸리티 스크립트
├── 11_configuration/      # 설정
└── 12_deployment/         # 배포
```

---

## 🎯 프로젝트 요약

| 항목 | 내용 |
|------|------|
| **프로젝트명** | CoUp (Cooperate Up) |
| **설명** | 스터디 그룹 협업 플랫폼 |
| **대상** | 스터디 참여자, 스터디 운영자, 관리자 |
| **프레임워크** | Next.js 16 (App Router) |
| **언어** | JavaScript (React 19) |
| **데이터베이스** | PostgreSQL + Prisma 6 |
| **실시간** | Socket.io 4.8 |
| **인증** | NextAuth 4 |
| **스타일링** | TailwindCSS 4 |

---

## 🚀 핵심 기능

| 기능 | 설명 |
|------|------|
| **스터디 관리** | 스터디 생성, 검색, 가입, 멤버 관리 |
| **실시간 채팅** | Socket.io 기반 스터디 그룹 채팅 |
| **태스크 관리** | 할 일 생성, 담당자 지정, 진행 상황 추적 |
| **그룹 관리** | 스터디 내 소그룹 생성 및 관리 |
| **캘린더** | 스터디 일정 및 이벤트 관리 |
| **알림** | 실시간 알림 및 알림 설정 |
| **대시보드** | 개인별 스터디 현황 한눈에 보기 |
| **관리자** | 사용자, 스터디, 신고 관리 시스템 |
| **화상 통화** | 스터디 멤버 간 화상 미팅 |

---

## 📖 문서 읽는 순서

### 🔰 입문자 (프로젝트 처음 접하는 분)
1. [프로젝트 소개](./01_overview/project-introduction.md)
2. [용어집](./01_overview/glossary.md)
3. [기술 스택](./01_overview/tech-stack.md)
4. [폴더 구조](./01_overview/folder-structure.md)

### 🏗️ 아키텍처 이해
1. [시스템 개요](./02_architecture/system-overview.md)
2. [데이터 흐름](./02_architecture/data-flow.md)
3. [인증 흐름](./02_architecture/authentication-flow.md)
4. [실시간 통신](./02_architecture/realtime-communication.md)

### 💾 데이터베이스 이해
1. [ERD 다이어그램](./03_database/erd-diagram.md)
2. [모델별 상세](./03_database/models/)
3. [테이블 관계](./03_database/relationships.md)

### 🔌 API 개발자
1. [API 개요](./04_api/README.md)
2. 각 도메인별 API 문서

### 🎨 프론트엔드 개발자
1. [페이지 라우트](./05_pages/README.md)
2. [컴포넌트 구조](./06_components/README.md)
3. [상태 관리](./07_state_management/README.md)

### 🔧 운영자/DevOps
1. [설정 파일](./11_configuration/README.md)
2. [배포 가이드](./12_deployment/README.md)

---

## 🔗 빠른 링크

| 카테고리 | 문서 |
|----------|------|
| 📋 개요 | [프로젝트 소개](./01_overview/project-introduction.md) ・ [기술 스택](./01_overview/tech-stack.md) ・ [용어집](./01_overview/glossary.md) |
| 🏗️ 아키텍처 | [시스템 개요](./02_architecture/system-overview.md) ・ [인증 흐름](./02_architecture/authentication-flow.md) |
| 💾 DB | [ERD](./03_database/erd-diagram.md) ・ [모델](./03_database/models/) |
| 🔌 API | [인증](./04_api/auth/) ・ [스터디](./04_api/studies/) ・ [태스크](./04_api/tasks/) |
| 🎨 UI | [컴포넌트](./06_components/) ・ [페이지](./05_pages/) |
| ⚙️ 설정 | [환경변수](./11_configuration/environment-variables.md) ・ [배포](./12_deployment/) |

---

**최종 업데이트**: 2026-01-31
**문서 버전**: 1.0.0
**문서화 진행률**: 0% (147개 문서 중 0개 완료)
