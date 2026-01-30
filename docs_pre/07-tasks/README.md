# ✅ 할일 도메인 개요

## 개요

스터디 및 개인의 할일(Task) 관리 기능을 제공하는 도메인입니다.  
두 가지 타입의 할일을 지원합니다:

1. **개인 할일** - 사용자 개인 할일 관리
2. **스터디 할일** - 스터디 멤버 공동 할일 관리

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 할일 생성 | 새 할일 생성 (개인/스터디) |
| 할일 조회 | 목록 및 상세 조회, 필터링 |
| 할일 수정 | 내용, 상태, 우선순위 수정 |
| 할일 삭제 | 할일 삭제 |
| 상태 변경 | TODO → IN_PROGRESS → REVIEW → DONE |
| 완료 토글 | 빠른 완료/미완료 전환 |
| 담당자 관리 | 스터디 할일 담당자 할당 |
| 통계 조회 | 할일 완료율 등 통계 |

---

## 할일 타입

### 개인 할일 (Task)

개인 사용자의 할일을 관리합니다.

```prisma
model Task {
  id          String    @id @default(uuid())
  userId      String
  studyId     String?
  title       String
  description String?
  status      String    @default("TODO")
  priority    String    @default("MEDIUM")
  dueDate     DateTime?
  completed   Boolean   @default(false)
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### 스터디 할일 (StudyTask)

스터디 내 공동 할일을 관리합니다.

```prisma
model StudyTask {
  id          String    @id @default(uuid())
  studyId     String
  title       String
  description String?
  status      String    @default("TODO")
  priority    String    @default("MEDIUM")
  dueDate     DateTime?
  createdById String
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  assignees   StudyTaskAssignee[]
}
```

---

## 관련 파일

### API

| 경로 | 설명 |
|------|------|
| `src/app/api/tasks/route.js` | 개인 할일 목록/생성 |
| `src/app/api/tasks/[id]/route.js` | 개인 할일 상세/수정/삭제 |
| `src/app/api/tasks/[id]/toggle/route.js` | 완료 토글 |
| `src/app/api/tasks/stats/route.js` | 통계 조회 |
| `src/app/api/studies/[id]/tasks/route.js` | 스터디 할일 목록/생성 |
| `src/app/api/studies/[id]/tasks/[taskId]/route.js` | 스터디 할일 상세/수정/삭제 |
| `src/app/api/studies/[id]/tasks/[taskId]/status/route.js` | 상태 변경 |

### 페이지

| 경로 | URL | 설명 |
|------|-----|------|
| `src/app/tasks/page.jsx` | `/tasks` | 내 할일 목록 |
| `src/app/my-studies/[studyId]/tasks/page.jsx` | `/my-studies/[id]/tasks` | 스터디 할일 |

### 컴포넌트

| 경로 | 설명 |
|------|------|
| `src/components/tasks/TaskCard.jsx` | 할일 카드 |
| `src/components/tasks/TaskGroup.jsx` | 할일 그룹 |
| `src/components/tasks/TaskFilters.jsx` | 필터 컴포넌트 |
| `src/components/tasks/TaskCreateModal.jsx` | 생성 모달 |
| `src/components/tasks/TaskEditModal.jsx` | 수정 모달 |
| `src/components/tasks/TaskDetailModal.jsx` | 상세 모달 |
| `src/components/tasks/TaskCalendarView.jsx` | 캘린더 뷰 |
| `src/components/tasks/TaskProgressWidget.jsx` | 진행률 위젯 |
| `src/components/tasks/TodayTasksWidget.jsx` | 오늘 할일 위젯 |
| `src/components/tasks/TaskByStudyWidget.jsx` | 스터디별 위젯 |

---

## 상태 정의

### 할일 상태 (Status)

| 상태 | 설명 |
|------|------|
| `TODO` | 할 일 (시작 전) |
| `IN_PROGRESS` | 진행 중 |
| `REVIEW` | 검토 중 |
| `DONE` | 완료 |
| `CANCELLED` | 취소됨 |

### 상태 전환 규칙

```
TODO ─────────────────────────┐
  │                           │
  ├─→ IN_PROGRESS ─→ REVIEW ─→ DONE
  │       │            │        │
  │       └────────────┘        │
  │       ↑                     │
  └───────┼─────────────────────┘
          │
CANCELLED ┘
```

유효한 전환:
- `TODO` → `IN_PROGRESS`, `CANCELLED`
- `IN_PROGRESS` → `REVIEW`, `DONE`, `TODO`, `CANCELLED`
- `REVIEW` → `DONE`, `IN_PROGRESS`, `TODO`
- `DONE` → `TODO` (재오픈)
- `CANCELLED` → `TODO` (재활성화)

### 우선순위 (Priority)

| 우선순위 | 아이콘 | 설명 |
|---------|-------|------|
| `URGENT` | 🔥 | 긴급 |
| `HIGH` | ⚠️ | 높음 |
| `MEDIUM` | 📌 | 보통 (기본값) |
| `LOW` | 📎 | 낮음 |

---

## 뷰 모드

| 모드 | 설명 |
|------|------|
| `list` | 리스트 형태로 표시 |
| `calendar` | 달력 형태로 표시 |

---

## 권한

### 개인 할일

- 본인만 CRUD 가능

### 스터디 할일

| 역할 | 조회 | 생성 | 수정 | 삭제 |
|------|------|------|------|------|
| OWNER | ✓ | ✓ | ✓ | ✓ |
| ADMIN | ✓ | ✓ | ✓ | ✓ |
| MEMBER | ✓ | ✗ | △ | △ |

※ MEMBER는 본인이 담당자인 할일만 수정/삭제 가능

---

## 관련 문서

- [개인 할일 API](./api-personal.md) - 개인 할일 API
- [스터디 할일 API](./api-study.md) - 스터디 할일 API
- [화면](./screens.md) - 할일 화면
- [컴포넌트](./components.md) - 할일 컴포넌트
- [위젯](./widgets.md) - 대시보드 위젯

