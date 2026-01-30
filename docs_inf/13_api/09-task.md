# 업무(Task) API (Task API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/tasks`

## 개요

오늘 할당된 업무 조회 및 완료 체크 API입니다.

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 | 권한 |
|--------|-----------|------|:----:|------|
| GET | `/tasks/today` | 오늘 할당된 업무 | ✅ | - |
| POST | `/tasks/{id}/complete` | 업무 완료 체크 | ✅ | - |
| POST | `/tasks/{id}/skip` | 업무 건너뛰기 | ✅ | - |
| GET | `/tasks/monitor` | 업무 모니터링 | ✅ | 사업주 |

---

## 1. 오늘 할당된 업무 조회

오늘 해당하는 업무 목록을 조회합니다.

### Request

```http
GET /tasks/today?workplaceId=1
Authorization: Bearer {accessToken}
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "checklistId": 1,
      "checklistName": "오픈 체크리스트",
      "itemId": 1,
      "title": "조명 켜기",
      "description": "모든 조명 확인",
      "order": 1,
      "isRequired": true,
      "status": "COMPLETED",
      "completedAt": "2024-12-27T09:05:00",
      "completedBy": "박직원",
      "note": null,
      "skipReason": null
    },
    {
      "id": 2,
      "checklistId": 1,
      "checklistName": "오픈 체크리스트",
      "itemId": 2,
      "title": "에어컨/난방 가동",
      "description": null,
      "order": 2,
      "isRequired": true,
      "status": "COMPLETED",
      "completedAt": "2024-12-27T09:07:00",
      "completedBy": "박직원",
      "note": "난방 약하게 가동",
      "skipReason": null
    },
    {
      "id": 3,
      "checklistId": 1,
      "checklistName": "오픈 체크리스트",
      "itemId": 3,
      "title": "청소 상태 확인",
      "description": "바닥, 테이블, 화장실",
      "order": 3,
      "isRequired": true,
      "status": "PENDING",
      "completedAt": null,
      "completedBy": null,
      "note": null,
      "skipReason": null
    },
    {
      "id": 4,
      "checklistId": 1,
      "checklistName": "오픈 체크리스트",
      "itemId": 4,
      "title": "재고 확인",
      "description": "원두, 우유, 시럽 등",
      "order": 4,
      "isRequired": false,
      "status": "SKIPPED",
      "completedAt": null,
      "completedBy": "박직원",
      "note": null,
      "skipReason": "발주 담당자 부재"
    }
  ],
  "timestamp": "2024-12-27T10:00:00"
}
```

### 프론트엔드 연동

- 체크리스트 화면에서 오늘 업무 표시
- 상태별 색상/아이콘 구분
- 완료/건너뛰기 버튼 제공

---

## 2. 업무 완료 체크

업무를 완료 처리합니다.

### Request

```http
POST /tasks/{id}/complete?workplaceId=1
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| id | long | ✅ | 업무 ID |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |

#### Request Body (선택)

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| note | string | ❌ | 메모 |

```json
{
  "note": "난방 약하게 가동"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 3,
    "checklistId": 1,
    "checklistName": "오픈 체크리스트",
    "itemId": 3,
    "title": "청소 상태 확인",
    "description": "바닥, 테이블, 화장실",
    "order": 3,
    "isRequired": true,
    "status": "COMPLETED",
    "completedAt": "2024-12-27T10:15:00",
    "completedBy": "박직원",
    "note": null,
    "skipReason": null
  },
  "message": "업무가 완료되었습니다",
  "timestamp": "2024-12-27T10:15:00"
}
```

### 프론트엔드 연동

- 체크박스 또는 완료 버튼 클릭
- 완료 시 시각적 피드백 (체크 애니메이션)
- 선택적으로 메모 입력 모달

---

## 3. 업무 건너뛰기

업무를 건너뜁니다 (미수행 사유 입력 필수).

### Request

```http
POST /tasks/{id}/skip?workplaceId=1
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| id | long | ✅ | 업무 ID |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |

#### Request Body

| 필드 | 타입 | 필수 | 설명 | 검증 |
|------|------|:----:|------|------|
| reason | string | ✅ | 미수행 사유 | 최소 3자 |

```json
{
  "reason": "발주 담당자 부재로 인해 재고 확인 불가"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 4,
    "checklistId": 1,
    "checklistName": "오픈 체크리스트",
    "itemId": 4,
    "title": "재고 확인",
    "description": "원두, 우유, 시럽 등",
    "order": 4,
    "isRequired": false,
    "status": "SKIPPED",
    "completedAt": null,
    "completedBy": "박직원",
    "note": null,
    "skipReason": "발주 담당자 부재로 인해 재고 확인 불가"
  },
  "message": "업무가 건너뛰기 처리되었습니다",
  "timestamp": "2024-12-27T10:20:00"
}
```

### 프론트엔드 연동

- 건너뛰기 버튼 클릭 시 사유 입력 모달
- 사유는 최소 3자 입력 필수
- 필수 항목도 건너뛰기 가능 (퇴근 가능)

---

## 4. 전체 진행 현황 모니터링

사업장 전체 업무 진행 현황을 조회합니다 (관리자용).

### Request

```http
GET /tasks/monitor?workplaceId=1&date=2024-12-27
Authorization: Bearer {accessToken}
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| date | date | ❌ | 조회 날짜 (기본값: 오늘) |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "date": "2024-12-27",
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "summary": {
      "totalTasks": 10,
      "completedTasks": 7,
      "skippedTasks": 1,
      "pendingTasks": 2,
      "completionRate": 80
    },
    "checklists": [
      {
        "id": 1,
        "name": "오픈 체크리스트",
        "totalTasks": 4,
        "completedTasks": 3,
        "skippedTasks": 1,
        "pendingTasks": 0,
        "completionRate": 100
      },
      {
        "id": 2,
        "name": "마감 체크리스트",
        "totalTasks": 6,
        "completedTasks": 4,
        "skippedTasks": 0,
        "pendingTasks": 2,
        "completionRate": 67
      }
    ],
    "employees": [
      {
        "userId": 5,
        "userName": "박직원",
        "completedTasks": 5,
        "skippedTasks": 1,
        "lastActivity": "2024-12-27T17:30:00"
      },
      {
        "userId": 6,
        "userName": "김직원",
        "completedTasks": 2,
        "skippedTasks": 0,
        "lastActivity": "2024-12-27T16:45:00"
      }
    ],
    "pendingItems": [
      {
        "id": 8,
        "checklistName": "마감 체크리스트",
        "title": "정산 확인",
        "isRequired": true
      },
      {
        "id": 9,
        "checklistName": "마감 체크리스트",
        "title": "재고 정리",
        "isRequired": false
      }
    ]
  },
  "timestamp": "2024-12-27T18:00:00"
}
```

### 프론트엔드 연동

- 관리자 대시보드에서 현황 표시
- 완료율 프로그레스 바
- 미완료 항목 하이라이트
- 직원별 활동 내역

---

## 타입 정의

### TodayTaskResponse

```typescript
interface TodayTaskResponse {
  id: number;
  checklistId: number;
  checklistName: string;
  itemId: number;
  title: string;
  description: string | null;
  order: number;
  isRequired: boolean;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  completedAt: string | null;
  completedBy: string | null;
  note: string | null;
  skipReason: string | null;
}
```

### TaskCompletionResponse

```typescript
interface TaskCompletionResponse {
  id: number;
  checklistId: number;
  checklistName: string;
  itemId: number;
  title: string;
  description: string | null;
  order: number;
  isRequired: boolean;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  completedAt: string | null;
  completedBy: string | null;
  note: string | null;
  skipReason: string | null;
}
```

### TaskMonitorResponse

```typescript
interface TaskMonitorResponse {
  date: string;
  workplaceId: number;
  workplaceName: string;
  summary: TaskSummary;
  checklists: ChecklistSummary[];
  employees: EmployeeTaskSummary[];
  pendingItems: PendingItem[];
}

interface TaskSummary {
  totalTasks: number;
  completedTasks: number;
  skippedTasks: number;
  pendingTasks: number;
  completionRate: number;
}

interface ChecklistSummary {
  id: number;
  name: string;
  totalTasks: number;
  completedTasks: number;
  skippedTasks: number;
  pendingTasks: number;
  completionRate: number;
}

interface EmployeeTaskSummary {
  userId: number;
  userName: string;
  completedTasks: number;
  skippedTasks: number;
  lastActivity: string;
}

interface PendingItem {
  id: number;
  checklistName: string;
  title: string;
  isRequired: boolean;
}
```

---

## 비즈니스 로직

### 업무 상태

| 상태 | 설명 |
|------|------|
| PENDING | 대기 중 (미완료) |
| COMPLETED | 완료 |
| SKIPPED | 건너뛰기 |

### 퇴근 조건

- 모든 업무가 COMPLETED 또는 SKIPPED 상태여야 퇴근 가능
- 필수 항목(`isRequired = true`)도 건너뛰기 가능하나 사유 필수

### 업무 완료 주체

- 동일 사업장의 모든 멤버가 업무 완료 가능
- 완료한 사람 정보 기록 (`completedBy`)

---

## 관련 문서

- [공통 규격](./00-common.md)
- [체크리스트 API](./08-checklist.md)
- [출퇴근 API](./05-attendance.md)
- [화면 설계 - 체크리스트](../05_screens/05_checklist/README.md)

