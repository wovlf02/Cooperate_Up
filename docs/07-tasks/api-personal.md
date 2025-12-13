# 📡 개인 할일 API

## 개요

개인 사용자의 할일 CRUD 및 통계 API입니다.

---

## API 엔드포인트 목록

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/tasks` | 할일 목록 조회 |
| POST | `/api/tasks` | 할일 생성 |
| GET | `/api/tasks/[id]` | 할일 상세 조회 |
| PATCH | `/api/tasks/[id]` | 할일 수정 (부분) |
| PUT | `/api/tasks/[id]` | 할일 수정 (전체) |
| DELETE | `/api/tasks/[id]` | 할일 삭제 |
| PATCH | `/api/tasks/[id]/toggle` | 완료 토글 |
| GET | `/api/tasks/stats` | 통계 조회 |

---

## GET /api/tasks

할일 목록을 조회합니다.

### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| studyId | string | - | 스터디 필터 |
| status | string | - | 상태 필터 |
| completed | boolean | - | 완료 여부 |
| sortBy | string | deadline | 정렬 기준 |
| page | number | 1 | 페이지 |
| limit | number | 20 | 페이지당 항목 |

### status 옵션

| 값 | 설명 |
|-----|------|
| `TODO` | 할 일 |
| `IN_PROGRESS` | 진행 중 |
| `REVIEW` | 검토 중 |
| `DONE` | 완료 |
| `all` | 전체 |
| `incomplete` | 미완료만 (completed=false로 변환) |
| `completed` | 완료만 (completed=true로 변환) |

### sortBy 옵션

| 값 | 설명 |
|-----|------|
| `deadline` | 마감일순 (기본) |
| `priority` | 우선순위순 |
| `createdAt` | 생성일순 |

### 응답 예시

```json
{
  "success": true,
  "data": [
    {
      "id": "task-uuid-1",
      "title": "API 문서 작성",
      "description": "REST API 문서화",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2025-01-15T23:59:59Z",
      "completed": false,
      "completedAt": null,
      "createdAt": "2025-01-01T00:00:00Z",
      "study": {
        "id": "study-uuid-1",
        "name": "개발 스터디",
        "emoji": "💻"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

## POST /api/tasks

새 할일을 생성합니다.

### Request Body

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| title | string | ✓ | - | 제목 |
| description | string | X | - | 설명 |
| studyId | string | X | null | 스터디 ID |
| status | string | X | TODO | 상태 |
| priority | string | X | MEDIUM | 우선순위 |
| dueDate | string | X | null | 마감일 (ISO 형식) |

### 요청 예시

```json
{
  "title": "API 문서 작성",
  "description": "REST API 문서화 작업",
  "studyId": "study-uuid-1",
  "priority": "HIGH",
  "dueDate": "2025-01-15T23:59:59Z"
}
```

### 응답 예시

```json
{
  "success": true,
  "message": "할일이 생성되었습니다",
  "data": {
    "id": "task-uuid-1",
    "title": "API 문서 작성",
    "...": "..."
  }
}
```

### 처리 로직

1. 인증 확인
2. 제목 필수 검증
3. studyId 있으면 스터디 멤버 확인
4. 할일 생성
5. 응답 반환

---

## GET /api/tasks/[id]

할일 상세 정보를 조회합니다.

### 응답 예시

```json
{
  "success": true,
  "data": {
    "id": "task-uuid-1",
    "title": "API 문서 작성",
    "description": "REST API 문서화 작업",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2025-01-15T23:59:59Z",
    "completed": false,
    "completedAt": null,
    "study": {
      "id": "study-uuid-1",
      "name": "개발 스터디",
      "emoji": "💻"
    }
  }
}
```

### 권한

- 본인 할일만 조회 가능

---

## PATCH /api/tasks/[id]

할일을 부분 수정합니다.

### Request Body

| 필드 | 타입 | 설명 |
|------|------|------|
| title | string | 제목 |
| description | string | 설명 |
| status | string | 상태 |
| priority | string | 우선순위 |
| dueDate | string | 마감일 |

### 응답 예시

```json
{
  "success": true,
  "message": "할일이 수정되었습니다",
  "data": {
    "...": "..."
  }
}
```

---

## PUT /api/tasks/[id]

할일을 전체 수정합니다.

### Request Body

| 필드 | 타입 | 설명 |
|------|------|------|
| title | string | 제목 |
| description | string | 설명 |
| studyId | string | 스터디 ID |
| priority | string | 우선순위 |
| dueDate | string | 마감일 |

---

## DELETE /api/tasks/[id]

할일을 삭제합니다.

### 응답 예시

```json
{
  "success": true,
  "message": "할일이 삭제되었습니다"
}
```

---

## PATCH /api/tasks/[id]/toggle

할일 완료 상태를 토글합니다.

### 처리 로직

```javascript
{
  completed: !task.completed,
  completedAt: !task.completed ? new Date() : null,
  status: !task.completed ? 'DONE' : 'TODO'
}
```

### 응답 예시

```json
{
  "success": true,
  "message": "할일을 완료했습니다",
  "data": {
    "id": "task-uuid-1",
    "completed": true,
    "completedAt": "2025-01-10T12:00:00Z",
    "status": "DONE"
  }
}
```

---

## GET /api/tasks/stats

할일 통계를 조회합니다.

### 응답 예시

```json
{
  "success": true,
  "data": {
    "totalTasks": 50,
    "completedTasks": 30,
    "pendingTasks": 20,
    "todayTasks": 3,
    "thisWeekTasks": 10,
    "thisMonthTasks": 25,
    "overdueTasks": 2,
    "completionRate": 60,
    "byPriority": {
      "URGENT": 2,
      "HIGH": 5,
      "MEDIUM": 10,
      "LOW": 3
    },
    "byStatus": {
      "TODO": 10,
      "IN_PROGRESS": 5,
      "REVIEW": 3,
      "DONE": 30,
      "CANCELLED": 2
    },
    "recentCompleted": [
      {
        "id": "task-uuid-1",
        "title": "API 문서 작성",
        "completedAt": "2025-01-10T12:00:00Z",
        "priority": "HIGH"
      }
    ]
  }
}
```

### 통계 항목

| 항목 | 설명 |
|------|------|
| totalTasks | 전체 할일 수 |
| completedTasks | 완료된 할일 수 |
| pendingTasks | 미완료 할일 수 |
| todayTasks | 오늘 마감 할일 |
| thisWeekTasks | 이번 주 마감 할일 |
| thisMonthTasks | 이번 달 마감 할일 |
| overdueTasks | 기한 지난 할일 |
| completionRate | 완료율 (%) |
| byPriority | 우선순위별 통계 |
| byStatus | 상태별 통계 |
| recentCompleted | 최근 완료 할일 (5개) |

---

## 에러 응답

| HTTP | 메시지 |
|------|--------|
| 400 | 제목을 입력해주세요 |
| 403 | 스터디 멤버가 아닙니다 |
| 404 | 할일을 찾을 수 없습니다 |
| 500 | 할일 처리 중 오류가 발생했습니다 |

---

## 관련 코드

```
src/app/api/tasks/
├── route.js           # GET, POST
├── stats/
│   └── route.js       # GET (통계)
└── [id]/
    ├── route.js       # GET, PATCH, PUT, DELETE
    └── toggle/
        └── route.js   # PATCH (완료 토글)
```

