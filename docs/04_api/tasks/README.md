# ✅ 태스크 API

> 할 일(태스크) 관리 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **기본 엔드포인트** | `/api/tasks` |
| **인증 필요** | ✅ |

---

## 📚 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/tasks` | GET | 내 할 일 목록 조회 |
| `/api/tasks` | POST | 할 일 생성 |
| `/api/tasks/[id]` | GET | 할 일 상세 조회 |
| `/api/tasks/[id]` | PATCH | 할 일 수정 |
| `/api/tasks/[id]` | DELETE | 할 일 삭제 |
| `/api/tasks/stats` | GET | 할 일 통계 |

---

## 📖 할 일 목록 조회

### 요청

```http
GET /api/tasks?studyId=xxx&status=TODO&sortBy=deadline&page=1&limit=20
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `studyId` | string | - | 특정 스터디의 할 일만 조회 |
| `status` | string | all | 상태 필터 |
| `completed` | string | - | 완료 여부 ('true', 'false') |
| `sortBy` | string | deadline | 정렬 기준 |
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 20 | 페이지당 항목 수 |

### 상태 필터

| 값 | 설명 |
|-----|------|
| `all` | 전체 |
| `TODO` | 할 일 |
| `IN_PROGRESS` | 진행 중 |
| `REVIEW` | 검토 중 |
| `DONE` | 완료 |
| `incomplete` | 미완료 (completed = false) |
| `completed` | 완료됨 (completed = true) |

### 정렬 기준

| 값 | 설명 |
|-----|------|
| `deadline` | 마감일순 (오름차순) |
| `priority` | 우선순위순 (내림차순) |
| `createdAt` | 생성일순 (내림차순) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "task-uuid-123",
      "title": "React 공부하기",
      "description": "React 기초 개념 학습",
      "status": "TODO",
      "priority": "HIGH",
      "completed": false,
      "dueDate": "2026-02-01T23:59:59.000Z",
      "createdAt": "2026-01-25T10:00:00.000Z",
      "updatedAt": "2026-01-25T10:00:00.000Z",
      "userId": "user-uuid",
      "studyId": "study-uuid",
      "study": {
        "id": "study-uuid",
        "name": "React 스터디",
        "emoji": "⚛️"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

## ➕ 할 일 생성

### 요청

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "React 공부하기",
  "description": "React 기초 개념 학습",
  "priority": "HIGH",
  "dueDate": "2026-02-01T23:59:59.000Z",
  "studyId": "study-uuid"
}
```

### 요청 본문

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `title` | string | ✅ | 할 일 제목 |
| `description` | string | ❌ | 상세 설명 |
| `priority` | string | ❌ | 우선순위 (LOW, MEDIUM, HIGH) |
| `dueDate` | string | ❌ | 마감일 (ISO 8601) |
| `studyId` | string | ❌ | 연결할 스터디 ID |

### 성공 응답 (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "task-uuid-123",
    "title": "React 공부하기",
    "status": "TODO",
    "completed": false,
    "createdAt": "2026-01-30T10:00:00.000Z"
  }
}
```

---

## ✏️ 할 일 수정

### 요청

```http
PATCH /api/tasks/task-uuid-123
Content-Type: application/json

{
  "title": "수정된 제목",
  "status": "IN_PROGRESS",
  "completed": false
}
```

### 수정 가능 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `title` | string | 제목 |
| `description` | string | 설명 |
| `status` | string | 상태 |
| `priority` | string | 우선순위 |
| `dueDate` | string | 마감일 |
| `completed` | boolean | 완료 여부 |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "task-uuid-123",
    "title": "수정된 제목",
    "status": "IN_PROGRESS"
  }
}
```

---

## 🗑️ 할 일 삭제

### 요청

```http
DELETE /api/tasks/task-uuid-123
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "할 일이 삭제되었습니다"
}
```

---

## 📊 우선순위

| 값 | 표시 | 설명 |
|-----|------|------|
| `LOW` | 🟢 | 낮음 |
| `MEDIUM` | 🟡 | 보통 |
| `HIGH` | 🔴 | 높음 |

---

## 🔗 관련 문서

- [Task 모델](../../03_database/models/task.md)
- [태스크 페이지](../../05_pages/tasks/README.md)
- [대시보드 API](../dashboard/README.md)
