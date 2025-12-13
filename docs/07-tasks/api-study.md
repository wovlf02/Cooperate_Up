# 📡 스터디 할일 API

## 개요

스터디 내 공동 할일 관리 API입니다.  
담당자 할당, 상태 전환 규칙 등 스터디 협업에 특화된 기능을 제공합니다.

---

## API 엔드포인트 목록

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/studies/[id]/tasks` | 할일 목록 조회 | 멤버 |
| POST | `/api/studies/[id]/tasks` | 할일 생성 | ADMIN 이상 |
| GET | `/api/studies/[id]/tasks/[taskId]` | 할일 상세 조회 | 멤버 |
| PATCH | `/api/studies/[id]/tasks/[taskId]` | 할일 수정 | 담당자/ADMIN |
| DELETE | `/api/studies/[id]/tasks/[taskId]` | 할일 삭제 | 담당자/ADMIN |
| PATCH | `/api/studies/[id]/tasks/[taskId]/status` | 상태 변경 | 담당자/ADMIN |

---

## GET /api/studies/[id]/tasks

스터디 할일 목록을 조회합니다.

### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| status | string | - | 상태 필터 |
| assignee | string | - | 담당자 필터 (userId) |
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 항목 (최대 100) |

### status 옵션

- `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`, `CANCELLED`, `all`

### 응답 예시

```json
{
  "success": true,
  "data": [
    {
      "id": "task-uuid-1",
      "title": "알고리즘 문제 풀이",
      "description": "백준 1000번 문제 풀기",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2025-01-15T23:59:59Z",
      "createdAt": "2025-01-01T00:00:00Z",
      "createdBy": {
        "id": "user-uuid-1",
        "name": "홍길동",
        "avatar": null
      },
      "assignees": [
        {
          "id": "user-uuid-2",
          "name": "김철수",
          "avatar": null
        },
        {
          "id": "user-uuid-3",
          "name": "이영희",
          "avatar": null
        }
      ]
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

### 정렬

기본 정렬 순서:
1. 상태 (TODO → IN_PROGRESS → REVIEW → DONE)
2. 우선순위 (URGENT → HIGH → MEDIUM → LOW)
3. 마감일 (가까운 순)
4. 생성일 (최신 순)

---

## POST /api/studies/[id]/tasks

새 스터디 할일을 생성합니다.

### 권한

- ADMIN 이상 권한 필요

### Request Body

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| title | string | ✓ | - | 제목 (2~100자) |
| description | string | X | - | 설명 (최대 1000자) |
| status | string | X | TODO | 상태 |
| priority | string | X | MEDIUM | 우선순위 |
| dueDate | string | X | - | 마감일 (미래 날짜만) |
| assigneeIds | string[] | X | [] | 담당자 ID 배열 |

### 요청 예시

```json
{
  "title": "알고리즘 문제 풀이",
  "description": "백준 1000번 문제 풀기",
  "priority": "HIGH",
  "dueDate": "2025-01-15T23:59:59Z",
  "assigneeIds": ["user-uuid-2", "user-uuid-3"]
}
```

### 검증 규칙

- **제목**: 필수, 2~100자
- **설명**: 선택, 최대 1000자
- **상태**: TODO, IN_PROGRESS, REVIEW, DONE, CANCELLED
- **우선순위**: LOW, MEDIUM, HIGH, URGENT
- **마감일**: 미래 날짜만 가능
- **담당자**: 스터디 활성 멤버만 지정 가능

### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "STUDY-ASSIGNEE-NOT-MEMBER",
    "message": "담당자가 스터디 멤버가 아닙니다."
  }
}
```

---

## GET /api/studies/[id]/tasks/[taskId]

할일 상세 정보를 조회합니다.

### 응답 예시

```json
{
  "success": true,
  "data": {
    "id": "task-uuid-1",
    "title": "알고리즘 문제 풀이",
    "description": "백준 1000번 문제 풀기",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2025-01-15T23:59:59Z",
    "completedAt": null,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-10T00:00:00Z",
    "createdBy": {
      "id": "user-uuid-1",
      "name": "홍길동",
      "avatar": null
    },
    "assignees": [
      {
        "id": "user-uuid-2",
        "name": "김철수",
        "avatar": null
      }
    ]
  }
}
```

---

## PATCH /api/studies/[id]/tasks/[taskId]

할일을 수정합니다.

### 권한

- 작성자, 담당자, 또는 ADMIN/OWNER

### Request Body

| 필드 | 타입 | 설명 |
|------|------|------|
| title | string | 제목 |
| description | string | 설명 |
| status | string | 상태 |
| priority | string | 우선순위 |
| dueDate | string | 마감일 |
| assigneeIds | string[] | 담당자 배열 |

### 상태 전환 규칙

```javascript
const validTransitions = {
  TODO: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['REVIEW', 'DONE', 'TODO', 'CANCELLED'],
  REVIEW: ['DONE', 'IN_PROGRESS', 'TODO'],
  DONE: ['TODO'],       // 재오픈
  CANCELLED: ['TODO'],  // 재활성화
}
```

### 에러 응답 (잘못된 상태 전환)

```json
{
  "success": false,
  "error": {
    "code": "STUDY-INVALID-STATE-TRANSITION",
    "message": "TODO에서 DONE으로 직접 전환할 수 없습니다."
  }
}
```

---

## DELETE /api/studies/[id]/tasks/[taskId]

할일을 삭제합니다.

### 권한

- 작성자, 담당자, 또는 ADMIN/OWNER

### 응답 예시

```json
{
  "success": true,
  "message": "할일이 삭제되었습니다."
}
```

---

## PATCH /api/studies/[id]/tasks/[taskId]/status

할일 상태만 변경합니다.

### 권한

- 담당자, 작성자, 또는 ADMIN/OWNER

### Request Body

```json
{
  "status": "IN_PROGRESS"
}
```

### 처리 로직

1. 멤버 권한 확인
2. 할일 존재 확인
3. 상태 유효성 검증
4. 상태 전환 규칙 검증
5. 권한 확인 (담당자/작성자/ADMIN)
6. 상태 업데이트
   - DONE으로 변경 시 completedAt 기록
   - DONE에서 다른 상태로 변경 시 completedAt 제거

### 응답 예시

```json
{
  "success": true,
  "data": {
    "id": "task-uuid-1",
    "status": "DONE",
    "completedAt": "2025-01-10T12:00:00Z"
  },
  "message": "상태가 변경되었습니다."
}
```

---

## 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| STUDY-TASK-TITLE-MISSING | 400 | 제목 누락 |
| STUDY-TASK-DEADLINE-IN-PAST | 400 | 과거 마감일 |
| STUDY-ASSIGNEE-NOT-MEMBER | 400 | 담당자가 멤버 아님 |
| STUDY-INVALID-STATE-TRANSITION | 400 | 잘못된 상태 전환 |
| STUDY-ADMIN-PERMISSION-REQUIRED | 403 | ADMIN 권한 필요 |
| STUDY-CANNOT-MODIFY-STUDY | 403 | 수정 권한 없음 |
| STUDY-EVENT-NOT-FOUND | 404 | 할일 없음 |

---

## 담당자 관리

### 담당자 조건

- 스터디의 ACTIVE 멤버만 지정 가능
- 여러 명 지정 가능 (배열)

### 담당자 검증

```javascript
const members = await prisma.studyMember.findMany({
  where: {
    studyId,
    userId: { in: assigneeIds },
    status: 'ACTIVE',
  },
})

if (members.length !== assigneeIds.length) {
  // 일부 담당자가 멤버가 아님
  throw StudyFeatureException.assigneeNotMember(...)
}
```

---

## 관련 코드

```
src/app/api/studies/[id]/tasks/
├── route.js                    # GET, POST
└── [taskId]/
    ├── route.js                # GET, PATCH, DELETE
    └── status/
        └── route.js            # PATCH (상태 변경)
```

