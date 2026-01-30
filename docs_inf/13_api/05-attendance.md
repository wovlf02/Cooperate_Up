# 출퇴근 API (Attendance API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/attendance`

## 개요

GPS 기반 출퇴근 체크 및 근태 관리 API입니다.

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|:----:|
| POST | `/attendance/clock-in` | 출근 | ✅ |
| POST | `/attendance/clock-out` | 퇴근 | ✅ |
| GET | `/attendance/today` | 오늘 출퇴근 조회 | ✅ |
| GET | `/attendance/records` | 출퇴근 기록 목록 | ✅ |
| POST | `/attendance/manual` | 수동 출퇴근 입력 | ✅ |
| POST | `/attendance/{id}/edit-request` | 출퇴근 수정 요청 | ✅ |

---

## 1. 출근

GPS 기반 출근 체크를 합니다.

### Request

```http
POST /attendance/clock-in
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| latitude | decimal | ✅ | 현재 위도 |
| longitude | decimal | ✅ | 현재 경도 |

```json
{
  "workplaceId": 1,
  "latitude": 37.5012,
  "longitude": 127.0396
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
    "userId": 5,
    "userName": "박직원",
    "workDate": "2024-12-27",
    "clockIn": "2024-12-27T08:45:00",
    "clockOut": null,
    "effectiveClockIn": "2024-12-27T09:00:00",
    "effectiveClockOut": null,
    "clockInLat": 37.5012,
    "clockInLng": 127.0396,
    "clockOutLat": null,
    "clockOutLng": null,
    "workMinutes": null,
    "hourlyWage": 9860,
    "dailyWage": null,
    "status": "WORKING",
    "isManualInput": false,
    "isEarlyClockIn": true,
    "checklistCompleted": false,
    "note": null,
    "createdAt": "2024-12-27T08:45:00"
  },
  "message": "출근이 완료되었습니다.",
  "timestamp": "2024-12-27T08:45:00"
}
```

#### 실패 - 이미 출근 (409 Conflict)

```json
{
  "success": false,
  "message": "이미 출근 처리되었습니다",
  "code": "AT001",
  "timestamp": "2024-12-27T09:00:00"
}
```

#### 실패 - 범위 이탈 (400 Bad Request)

```json
{
  "success": false,
  "message": "사업장 범위를 벗어난 위치입니다",
  "code": "AT006",
  "timestamp": "2024-12-27T08:45:00"
}
```

### 프론트엔드 연동

- 출근 버튼 클릭 시 현재 위치 조회
- 위치가 사업장 반경 내인지 사전 확인
- 조기 출근 시 안내 메시지 표시 (급여는 시업 시간부터 계산)

---

## 2. 퇴근

GPS 기반 퇴근 체크를 합니다.

### Request

```http
POST /attendance/clock-out
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| latitude | decimal | ✅ | 현재 위도 |
| longitude | decimal | ✅ | 현재 경도 |

```json
{
  "workplaceId": 1,
  "latitude": 37.5012,
  "longitude": 127.0396
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
    "userId": 5,
    "userName": "박직원",
    "workDate": "2024-12-27",
    "clockIn": "2024-12-27T08:45:00",
    "clockOut": "2024-12-27T18:05:00",
    "effectiveClockIn": "2024-12-27T09:00:00",
    "effectiveClockOut": "2024-12-27T18:05:00",
    "clockInLat": 37.5012,
    "clockInLng": 127.0396,
    "clockOutLat": 37.5012,
    "clockOutLng": 127.0396,
    "workMinutes": 545,
    "hourlyWage": 9860,
    "dailyWage": 89584,
    "status": "COMPLETED",
    "isManualInput": false,
    "isEarlyClockIn": true,
    "checklistCompleted": true,
    "note": null,
    "createdAt": "2024-12-27T08:45:00"
  },
  "message": "퇴근이 완료되었습니다.",
  "timestamp": "2024-12-27T18:05:00"
}
```

#### 실패 - 체크리스트 미완료 (400 Bad Request)

```json
{
  "success": false,
  "message": "체크리스트를 완료해야 퇴근할 수 있습니다",
  "code": "AT007",
  "timestamp": "2024-12-27T18:00:00"
}
```

### 프론트엔드 연동

- 체크리스트 완료 여부 확인 후 퇴근 버튼 활성화
- 미완료 체크리스트가 있으면 안내 후 체크리스트 화면으로 이동

---

## 3. 오늘 출퇴근 조회

현재 사용자의 오늘 출퇴근 기록을 조회합니다.

### Request

```http
GET /attendance/today?workplaceId=1
Authorization: Bearer {accessToken}
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |

### Response

#### 성공 - 기록 있음 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "userId": 5,
    "userName": "박직원",
    "workDate": "2024-12-27",
    "clockIn": "2024-12-27T08:45:00",
    "clockOut": null,
    "effectiveClockIn": "2024-12-27T09:00:00",
    "effectiveClockOut": null,
    "clockInLat": 37.5012,
    "clockInLng": 127.0396,
    "clockOutLat": null,
    "clockOutLng": null,
    "workMinutes": null,
    "hourlyWage": 9860,
    "dailyWage": null,
    "status": "WORKING",
    "isManualInput": false,
    "isEarlyClockIn": true,
    "checklistCompleted": false,
    "note": null,
    "createdAt": "2024-12-27T08:45:00"
  },
  "timestamp": "2024-12-27T10:00:00"
}
```

#### 성공 - 기록 없음 (200 OK)

```json
{
  "success": true,
  "data": null,
  "timestamp": "2024-12-27T08:00:00"
}
```

### 프론트엔드 연동

- 홈 화면 및 출퇴근 화면에서 현재 상태 표시
- 출근/퇴근/근무 완료 상태에 따른 UI 분기

---

## 4. 출퇴근 기록 목록

기간별 출퇴근 기록을 조회합니다.

### Request

```http
GET /attendance/records?workplaceId=1&startDate=2024-12-01&endDate=2024-12-31
Authorization: Bearer {accessToken}
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| startDate | date | ✅ | 시작 날짜 (yyyy-MM-dd) |
| endDate | date | ✅ | 종료 날짜 (yyyy-MM-dd) |

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
      "userId": 5,
      "userName": "박직원",
      "workDate": "2024-12-27",
      "clockIn": "2024-12-27T08:45:00",
      "clockOut": "2024-12-27T18:05:00",
      "effectiveClockIn": "2024-12-27T09:00:00",
      "effectiveClockOut": "2024-12-27T18:05:00",
      "clockInLat": 37.5012,
      "clockInLng": 127.0396,
      "clockOutLat": 37.5012,
      "clockOutLng": 127.0396,
      "workMinutes": 545,
      "hourlyWage": 9860,
      "dailyWage": 89584,
      "status": "COMPLETED",
      "isManualInput": false,
      "isEarlyClockIn": true,
      "checklistCompleted": true,
      "note": null,
      "createdAt": "2024-12-27T08:45:00"
    },
    {
      "id": 2,
      "workplaceId": 1,
      "workplaceName": "카페 BizOne 강남점",
      "userId": 5,
      "userName": "박직원",
      "workDate": "2024-12-26",
      "clockIn": "2024-12-26T09:00:00",
      "clockOut": "2024-12-26T18:00:00",
      "effectiveClockIn": "2024-12-26T09:00:00",
      "effectiveClockOut": "2024-12-26T18:00:00",
      "clockInLat": 37.5012,
      "clockInLng": 127.0396,
      "clockOutLat": 37.5012,
      "clockOutLng": 127.0396,
      "workMinutes": 540,
      "hourlyWage": 9860,
      "dailyWage": 88740,
      "status": "COMPLETED",
      "isManualInput": false,
      "isEarlyClockIn": false,
      "checklistCompleted": true,
      "note": null,
      "createdAt": "2024-12-26T09:00:00"
    }
  ],
  "timestamp": "2024-12-27T12:00:00"
}
```

### 프론트엔드 연동

- 캘린더 화면에서 월별 기록 표시
- 날짜별 출퇴근 시간 및 일급 표시

---

## 5. 수동 출퇴근 입력

수동으로 출퇴근 기록 입력을 요청합니다 (승인 필요).

### Request

```http
POST /attendance/manual
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| workDate | date | ✅ | 근무 날짜 |
| clockIn | datetime | ✅ | 출근 시간 |
| clockOut | datetime | ✅ | 퇴근 시간 |
| reason | string | ✅ | 사유 |

```json
{
  "workplaceId": 1,
  "workDate": "2024-12-25",
  "clockIn": "2024-12-25T09:00:00",
  "clockOut": "2024-12-25T18:00:00",
  "reason": "GPS 오류로 인한 수동 입력"
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
    "requesterId": 5,
    "requesterName": "박직원",
    "workDate": "2024-12-25",
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
  "message": "수동 입력 요청이 생성되었습니다.",
  "timestamp": "2024-12-27T10:00:00"
}
```

### 프론트엔드 연동

- 수동 입력 폼 제공
- 사유 입력 필수 (최소 3자)
- 요청 후 승인 대기 상태 안내

---

## 6. 출퇴근 수정 요청

기존 출퇴근 기록 수정을 요청합니다 (승인 필요).

### Request

```http
POST /attendance/{id}/edit-request
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| id | long | ✅ | 출퇴근 기록 ID |

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| clockIn | datetime | ❌ | 수정할 출근 시간 |
| clockOut | datetime | ❌ | 수정할 퇴근 시간 |
| reason | string | ✅ | 수정 사유 |

```json
{
  "clockOut": "2024-12-25T19:00:00",
  "reason": "야근 시간 미반영"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 2,
    "type": "EDIT",
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "attendanceId": 1,
    "requesterId": 5,
    "requesterName": "박직원",
    "workDate": "2024-12-25",
    "originalClockIn": "2024-12-25T09:00:00",
    "originalClockOut": "2024-12-25T18:00:00",
    "requestedClockIn": "2024-12-25T09:00:00",
    "requestedClockOut": "2024-12-25T19:00:00",
    "reason": "야근 시간 미반영",
    "status": "PENDING",
    "processorId": null,
    "processorName": null,
    "processedAt": null,
    "rejectReason": null,
    "createdAt": "2024-12-27T10:30:00"
  },
  "message": "수정 요청이 생성되었습니다.",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 기존 출퇴근 기록에서 수정 요청 버튼 제공
- 원본 시간과 수정 시간 비교 표시
- 사유 입력 필수

---

## 타입 정의

### AttendanceResponse

```typescript
interface AttendanceResponse {
  id: number;
  workplaceId: number;
  workplaceName: string;
  userId: number;
  userName: string;
  workDate: string;
  clockIn: string | null;
  clockOut: string | null;
  effectiveClockIn: string | null;
  effectiveClockOut: string | null;
  clockInLat: number | null;
  clockInLng: number | null;
  clockOutLat: number | null;
  clockOutLng: number | null;
  workMinutes: number | null;
  hourlyWage: number;
  dailyWage: number | null;
  status: 'WORKING' | 'COMPLETED' | 'ABSENT';
  isManualInput: boolean;
  isEarlyClockIn: boolean;
  checklistCompleted: boolean;
  note: string | null;
  createdAt: string;
}
```

### ApprovalRequestResponse

```typescript
interface ApprovalRequestResponse {
  id: number;
  type: 'MANUAL_INPUT' | 'EDIT';
  workplaceId: number;
  workplaceName: string;
  attendanceId?: number;
  requesterId: number;
  requesterName: string;
  workDate: string;
  originalClockIn?: string;
  originalClockOut?: string;
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
```

---

## 비즈니스 로직

### 조기 출근 처리

- 시업 시간 전 출근 시 `isEarlyClockIn = true`
- 급여 계산은 시업 시간(`effectiveClockIn`)부터 적용
- 프론트엔드에서 조기 출근 안내 메시지 표시

### 퇴근 제한

- 체크리스트 미완료 시 퇴근 불가 (`AT007` 에러)
- 모든 업무 완료 또는 건너뛰기 처리 필요

### 위치 검증

- 사업장 반경(`radius`) 내에서만 출퇴근 가능
- 거리 계산: Haversine formula

---

## 관련 문서

- [공통 규격](./00-common.md)
- [승인 요청 API](./06-approval.md)
- [체크리스트 API](./08-checklist.md)
- [화면 설계 - 출퇴근](../05_screens/03_attendance/README.md)

