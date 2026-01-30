# 승인 요청 API (Approval Request API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/approval-requests`

## 개요

수동 출퇴근 입력 및 기록 수정 요청에 대한 승인 관리 API입니다 (관리자용).

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 | 권한 |
|--------|-----------|------|:----:|------|
| GET | `/approval-requests` | 승인 요청 목록 | ✅ | 사업주 |
| GET | `/approval-requests/pending-count` | 대기 중인 요청 수 | ✅ | 사업주 |
| POST | `/approval-requests/{id}/approve` | 승인 처리 | ✅ | 사업주 |
| POST | `/approval-requests/{id}/reject` | 거부 처리 | ✅ | 사업주 |

---

## 1. 승인 요청 목록

사업장의 승인 요청 목록을 조회합니다.

### Request

```http
GET /approval-requests?workplaceId=1&status=PENDING&page=0&size=20&sort=createdAt,desc
Authorization: Bearer {accessToken}
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| status | string | ❌ | 상태 필터 (PENDING, APPROVED, REJECTED) |
| page | int | ❌ | 페이지 번호 (기본값: 0) |
| size | int | ❌ | 페이지 크기 (기본값: 20) |
| sort | string | ❌ | 정렬 (기본값: createdAt,desc) |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "type": "MANUAL_INPUT",
        "workplaceId": 1,
        "workplaceName": "카페 BizOne 강남점",
        "attendanceId": null,
        "requesterId": 5,
        "requesterName": "박직원",
        "workDate": "2024-12-25",
        "originalClockIn": null,
        "originalClockOut": null,
        "requestedClockIn": "2024-12-25T09:00:00",
        "requestedClockOut": "2024-12-25T18:00:00",
        "reason": "GPS 오류로 인한 수동 입력",
        "status": "PENDING",
        "processorId": null,
        "processorName": null,
        "processedAt": null,
        "rejectReason": null,
        "createdAt": "2024-12-27T10:00:00"
      },
      {
        "id": 2,
        "type": "EDIT",
        "workplaceId": 1,
        "workplaceName": "카페 BizOne 강남점",
        "attendanceId": 10,
        "requesterId": 6,
        "requesterName": "김직원",
        "workDate": "2024-12-24",
        "originalClockIn": "2024-12-24T09:00:00",
        "originalClockOut": "2024-12-24T18:00:00",
        "requestedClockIn": "2024-12-24T09:00:00",
        "requestedClockOut": "2024-12-24T20:00:00",
        "reason": "야근 2시간 미반영",
        "status": "PENDING",
        "processorId": null,
        "processorName": null,
        "processedAt": null,
        "rejectReason": null,
        "createdAt": "2024-12-27T09:30:00"
      }
    ],
    "totalElements": 2,
    "totalPages": 1,
    "size": 20,
    "number": 0,
    "first": true,
    "last": true,
    "empty": false
  },
  "timestamp": "2024-12-27T11:00:00"
}
```

### 프론트엔드 연동

- 관리자 화면에서 승인 대기 목록 표시
- 상태별 필터링 탭 (전체, 대기, 승인, 거부)
- 페이징 처리 및 무한 스크롤

---

## 2. 대기 중인 요청 수

대기 중인 승인 요청 수를 조회합니다.

### Request

```http
GET /approval-requests/pending-count?workplaceId=1
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
  "data": 3,
  "timestamp": "2024-12-27T11:00:00"
}
```

### 프론트엔드 연동

- 홈 화면 및 관리자 메뉴에서 뱃지 표시
- 실시간 갱신 필요 시 주기적 폴링

---

## 3. 승인 처리

승인 요청을 승인합니다.

### Request

```http
POST /approval-requests/{id}/approve
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| id | long | ✅ | 승인 요청 ID |

#### Request Body (선택)

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| comment | string | ❌ | 처리 코멘트 |

```json
{
  "comment": "확인했습니다."
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "MANUAL_INPUT",
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "attendanceId": 15,
    "requesterId": 5,
    "requesterName": "박직원",
    "workDate": "2024-12-25",
    "originalClockIn": null,
    "originalClockOut": null,
    "requestedClockIn": "2024-12-25T09:00:00",
    "requestedClockOut": "2024-12-25T18:00:00",
    "reason": "GPS 오류로 인한 수동 입력",
    "status": "APPROVED",
    "processorId": 3,
    "processorName": "이사업",
    "processedAt": "2024-12-27T11:30:00",
    "rejectReason": null,
    "createdAt": "2024-12-27T10:00:00"
  },
  "message": "승인되었습니다.",
  "timestamp": "2024-12-27T11:30:00"
}
```

#### 실패 - 이미 처리됨 (409 Conflict)

```json
{
  "success": false,
  "message": "이미 처리된 요청입니다",
  "code": "AT009",
  "timestamp": "2024-12-27T11:30:00"
}
```

### 프론트엔드 연동

- 승인 후 목록 새로고침
- 승인 시 요청자에게 푸시 알림 전송

---

## 4. 거부 처리

승인 요청을 거부합니다.

### Request

```http
POST /approval-requests/{id}/reject
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| id | long | ✅ | 승인 요청 ID |

#### Request Body (선택)

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| reason | string | ❌ | 거부 사유 |

```json
{
  "reason": "증빙 자료가 부족합니다."
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "MANUAL_INPUT",
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "attendanceId": null,
    "requesterId": 5,
    "requesterName": "박직원",
    "workDate": "2024-12-25",
    "originalClockIn": null,
    "originalClockOut": null,
    "requestedClockIn": "2024-12-25T09:00:00",
    "requestedClockOut": "2024-12-25T18:00:00",
    "reason": "GPS 오류로 인한 수동 입력",
    "status": "REJECTED",
    "processorId": 3,
    "processorName": "이사업",
    "processedAt": "2024-12-27T11:30:00",
    "rejectReason": "증빙 자료가 부족합니다.",
    "createdAt": "2024-12-27T10:00:00"
  },
  "message": "거부되었습니다.",
  "timestamp": "2024-12-27T11:30:00"
}
```

### 프론트엔드 연동

- 거부 사유 입력 모달 표시 (선택)
- 거부 후 목록 새로고침
- 거부 시 요청자에게 푸시 알림 전송

---

## 타입 정의

### ApprovalRequestResponse

```typescript
interface ApprovalRequestResponse {
  id: number;
  type: 'MANUAL_INPUT' | 'EDIT';
  workplaceId: number;
  workplaceName: string;
  attendanceId: number | null;
  requesterId: number;
  requesterName: string;
  workDate: string;
  originalClockIn: string | null;
  originalClockOut: string | null;
  requestedClockIn: string;
  requestedClockOut: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  processorId: number | null;
  processorName: string | null;
  processedAt: string | null;
  rejectReason: string | null;
  createdAt: string;
}

interface ProcessApprovalRequest {
  comment?: string;
  reason?: string;
}
```

---

## 비즈니스 로직

### 승인 처리 시 동작

1. **수동 입력 (MANUAL_INPUT)**
   - 새로운 출퇴근 기록 생성
   - `isManualInput = true` 설정

2. **수정 요청 (EDIT)**
   - 기존 출퇴근 기록 업데이트
   - 변경 이력 저장

### 알림 발송

- 승인/거부 시 요청자에게 푸시 알림 전송
- 알림 내용에 처리 결과 및 사유 포함

---

## 추가 필요 API (설계)

### 내 승인 요청 목록

직원이 본인의 승인 요청 목록을 조회합니다.

```http
GET /attendance/my-requests?workplaceId=1&page=0&size=20
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "type": "MANUAL_INPUT",
        "workDate": "2024-12-25",
        "requestedClockIn": "2024-12-25T09:00:00",
        "requestedClockOut": "2024-12-25T18:00:00",
        "reason": "GPS 오류",
        "status": "PENDING",
        "processedAt": null,
        "rejectReason": null,
        "createdAt": "2024-12-27T10:00:00"
      }
    ],
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

## 관련 문서

- [공통 규격](./00-common.md)
- [출퇴근 API](./05-attendance.md)
- [화면 설계 - 관리자](../05_screens/09_admin/README.md)

