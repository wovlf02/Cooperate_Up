# 체크리스트 API (Checklist API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/checklists`

## 개요

체크리스트 템플릿 관리 API입니다 (주로 관리자용).

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 | 권한 |
|--------|-----------|------|:----:|------|
| POST | `/checklists` | 체크리스트 생성 | ✅ | 사업주 |
| GET | `/checklists` | 체크리스트 목록 | ✅ | 멤버 |
| GET | `/checklists/{id}` | 체크리스트 상세 | ✅ | 멤버 |
| PUT | `/checklists/{id}` | 체크리스트 수정 | ✅ | 사업주 |
| DELETE | `/checklists/{id}` | 체크리스트 삭제 | ✅ | 사업주 |

---

## 1. 체크리스트 생성

새로운 체크리스트 템플릿을 생성합니다.

### Request

```http
POST /checklists
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| name | string | ✅ | 체크리스트 이름 |
| description | string | ❌ | 설명 |
| frequency | string | ✅ | 반복 주기 (DAILY, WEEKLY, MONTHLY) |
| daysOfWeek | array | ❌ | 적용 요일 (WEEKLY일 때) |
| items | array | ✅ | 체크리스트 항목 목록 |

```json
{
  "workplaceId": 1,
  "name": "오픈 체크리스트",
  "description": "매장 오픈 전 확인 사항",
  "frequency": "DAILY",
  "daysOfWeek": null,
  "items": [
    {
      "title": "조명 켜기",
      "description": "모든 조명 확인",
      "order": 1,
      "isRequired": true
    },
    {
      "title": "에어컨/난방 가동",
      "description": null,
      "order": 2,
      "isRequired": true
    },
    {
      "title": "청소 상태 확인",
      "description": "바닥, 테이블, 화장실",
      "order": 3,
      "isRequired": true
    },
    {
      "title": "재고 확인",
      "description": "원두, 우유, 시럽 등",
      "order": 4,
      "isRequired": false
    }
  ]
}
```

### Response

#### 성공 (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "name": "오픈 체크리스트",
    "description": "매장 오픈 전 확인 사항",
    "frequency": "DAILY",
    "daysOfWeek": null,
    "isActive": true,
    "items": [
      {
        "id": 1,
        "title": "조명 켜기",
        "description": "모든 조명 확인",
        "order": 1,
        "isRequired": true
      },
      {
        "id": 2,
        "title": "에어컨/난방 가동",
        "description": null,
        "order": 2,
        "isRequired": true
      },
      {
        "id": 3,
        "title": "청소 상태 확인",
        "description": "바닥, 테이블, 화장실",
        "order": 3,
        "isRequired": true
      },
      {
        "id": 4,
        "title": "재고 확인",
        "description": "원두, 우유, 시럽 등",
        "order": 4,
        "isRequired": false
      }
    ],
    "createdAt": "2024-12-27T10:00:00",
    "updatedAt": "2024-12-27T10:00:00"
  },
  "message": "체크리스트가 생성되었습니다",
  "timestamp": "2024-12-27T10:00:00"
}
```

### 프론트엔드 연동

- 체크리스트 편집 화면에서 항목 추가/삭제
- 드래그앤드롭으로 순서 변경
- 반복 주기 선택 UI

---

## 2. 체크리스트 목록

사업장의 체크리스트 목록을 조회합니다.

### Request

```http
GET /checklists?workplaceId=1
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
      "workplaceId": 1,
      "workplaceName": "카페 BizOne 강남점",
      "name": "오픈 체크리스트",
      "description": "매장 오픈 전 확인 사항",
      "frequency": "DAILY",
      "daysOfWeek": null,
      "isActive": true,
      "itemCount": 4,
      "createdAt": "2024-12-27T10:00:00",
      "updatedAt": "2024-12-27T10:00:00"
    },
    {
      "id": 2,
      "workplaceId": 1,
      "workplaceName": "카페 BizOne 강남점",
      "name": "마감 체크리스트",
      "description": "매장 마감 시 확인 사항",
      "frequency": "DAILY",
      "daysOfWeek": null,
      "isActive": true,
      "itemCount": 6,
      "createdAt": "2024-12-27T10:30:00",
      "updatedAt": "2024-12-27T10:30:00"
    }
  ],
  "timestamp": "2024-12-27T11:00:00"
}
```

---

## 3. 체크리스트 상세

체크리스트 상세 정보를 조회합니다.

### Request

```http
GET /checklists/{id}
Authorization: Bearer {accessToken}
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| id | long | ✅ | 체크리스트 ID |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "name": "오픈 체크리스트",
    "description": "매장 오픈 전 확인 사항",
    "frequency": "DAILY",
    "daysOfWeek": null,
    "isActive": true,
    "items": [
      {
        "id": 1,
        "title": "조명 켜기",
        "description": "모든 조명 확인",
        "order": 1,
        "isRequired": true
      },
      {
        "id": 2,
        "title": "에어컨/난방 가동",
        "description": null,
        "order": 2,
        "isRequired": true
      }
    ],
    "createdAt": "2024-12-27T10:00:00",
    "updatedAt": "2024-12-27T10:00:00"
  },
  "timestamp": "2024-12-27T11:00:00"
}
```

---

## 4. 체크리스트 수정

체크리스트 템플릿을 수정합니다.

### Request

```http
PUT /checklists/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| name | string | ❌ | 체크리스트 이름 |
| description | string | ❌ | 설명 |
| frequency | string | ❌ | 반복 주기 |
| daysOfWeek | array | ❌ | 적용 요일 |
| items | array | ❌ | 체크리스트 항목 (전체 교체) |

```json
{
  "name": "오픈 체크리스트 (수정)",
  "items": [
    {
      "id": 1,
      "title": "조명 켜기",
      "description": "전체 조명 확인",
      "order": 1,
      "isRequired": true
    },
    {
      "title": "새로운 항목",
      "description": null,
      "order": 5,
      "isRequired": false
    }
  ]
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "name": "오픈 체크리스트 (수정)",
    "description": "매장 오픈 전 확인 사항",
    "frequency": "DAILY",
    "daysOfWeek": null,
    "isActive": true,
    "items": [
      {
        "id": 1,
        "title": "조명 켜기",
        "description": "전체 조명 확인",
        "order": 1,
        "isRequired": true
      },
      {
        "id": 5,
        "title": "새로운 항목",
        "description": null,
        "order": 5,
        "isRequired": false
      }
    ],
    "createdAt": "2024-12-27T10:00:00",
    "updatedAt": "2024-12-27T12:00:00"
  },
  "message": "체크리스트가 수정되었습니다",
  "timestamp": "2024-12-27T12:00:00"
}
```

---

## 5. 체크리스트 삭제

체크리스트 템플릿을 삭제(비활성화)합니다.

### Request

```http
DELETE /checklists/{id}
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "체크리스트가 삭제되었습니다",
  "timestamp": "2024-12-27T12:00:00"
}
```

---

## 타입 정의

### ChecklistResponse

```typescript
interface ChecklistResponse {
  id: number;
  workplaceId: number;
  workplaceName: string;
  name: string;
  description: string | null;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  daysOfWeek: string[] | null; // ['MONDAY', 'WEDNESDAY', 'FRIDAY']
  isActive: boolean;
  items?: ChecklistItemResponse[];
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface ChecklistItemResponse {
  id: number;
  title: string;
  description: string | null;
  order: number;
  isRequired: boolean;
}
```

### CreateChecklistRequest

```typescript
interface CreateChecklistRequest {
  workplaceId: number;
  name: string;
  description?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  daysOfWeek?: string[];
  items: CreateChecklistItemRequest[];
}

interface CreateChecklistItemRequest {
  title: string;
  description?: string;
  order: number;
  isRequired: boolean;
}
```

---

## 비즈니스 로직

### 반복 주기

| 주기 | 설명 |
|------|------|
| DAILY | 매일 |
| WEEKLY | 주간 (특정 요일) |
| MONTHLY | 월간 (특정 일자) |

### 필수 항목

- `isRequired = true` 항목은 반드시 완료 또는 건너뛰기 처리 필요
- 미완료 필수 항목이 있으면 퇴근 불가

---

## 관련 문서

- [공통 규격](./00-common.md)
- [업무(Task) API](./09-task.md)
- [화면 설계 - 체크리스트](../05_screens/05_checklist/README.md)

