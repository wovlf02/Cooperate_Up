# 근로계약서 API (Contract API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/contracts`

## 개요

근로계약서 관리 및 전자서명 API입니다.

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 | 권한 |
|--------|-----------|------|:----:|------|
| POST | `/contracts` | 계약서 작성 | ✅ | 사업주 |
| GET | `/contracts` | 계약서 목록 | ✅ | - |
| GET | `/contracts/{id}` | 계약서 상세 | ✅ | - |
| PUT | `/contracts/{id}` | 계약서 수정 | ✅ | 사업주 |
| POST | `/contracts/{id}/validate` | 법규 검증 | ✅ | 사업주 |
| POST | `/contracts/{id}/send` | 계약서 발송 | ✅ | 사업주 |
| POST | `/contracts/{id}/sign` | 전자서명 | ✅ | 직원 |

---

## 1. 계약서 작성

새로운 근로계약서를 작성합니다.

### Request

```http
POST /contracts
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| employeeId | long | ✅ | 직원 ID |
| contractType | string | ✅ | 계약 유형 |
| startDate | date | ✅ | 계약 시작일 |
| endDate | date | ❌ | 계약 종료일 (무기계약은 null) |
| workStartTime | string | ✅ | 근무 시작 시간 |
| workEndTime | string | ✅ | 근무 종료 시간 |
| workDays | array | ✅ | 근무 요일 |
| hourlyWage | integer | ✅ | 시급 |
| paymentDate | integer | ✅ | 급여 지급일 (1-28) |
| breakMinutes | integer | ❌ | 휴게 시간 (분) |
| duties | string | ❌ | 업무 내용 |
| specialTerms | string | ❌ | 특약 사항 |

```json
{
  "workplaceId": 1,
  "employeeId": 5,
  "contractType": "PART_TIME",
  "startDate": "2024-12-01",
  "endDate": "2025-02-28",
  "workStartTime": "09:00",
  "workEndTime": "18:00",
  "workDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  "hourlyWage": 9860,
  "paymentDate": 10,
  "breakMinutes": 60,
  "duties": "매장 관리 및 고객 응대",
  "specialTerms": "수습 기간 1개월"
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
    "employerId": 3,
    "employerName": "이사업",
    "employeeId": 5,
    "employeeName": "박직원",
    "contractType": "PART_TIME",
    "startDate": "2024-12-01",
    "endDate": "2025-02-28",
    "workStartTime": "09:00",
    "workEndTime": "18:00",
    "workDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
    "hourlyWage": 9860,
    "paymentDate": 10,
    "breakMinutes": 60,
    "duties": "매장 관리 및 고객 응대",
    "specialTerms": "수습 기간 1개월",
    "status": "DRAFT",
    "validationPassed": null,
    "validationErrors": null,
    "employerSignature": null,
    "employerSignedAt": null,
    "employeeSignature": null,
    "employeeSignedAt": null,
    "pdfUrl": null,
    "createdAt": "2024-12-27T10:00:00",
    "updatedAt": "2024-12-27T10:00:00"
  },
  "message": "계약서가 작성되었습니다",
  "timestamp": "2024-12-27T10:00:00"
}
```

### 프론트엔드 연동

- 단계별 계약서 작성 폼
- 직원 선택 드롭다운
- 요일 다중 선택 UI

---

## 2. 계약서 목록

계약서 목록을 조회합니다.

### Request

```http
GET /contracts?workplaceId=1
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
      "employerId": 3,
      "employerName": "이사업",
      "employeeId": 5,
      "employeeName": "박직원",
      "contractType": "PART_TIME",
      "startDate": "2024-12-01",
      "endDate": "2025-02-28",
      "hourlyWage": 9860,
      "status": "SIGNED",
      "employerSignedAt": "2024-12-01T10:00:00",
      "employeeSignedAt": "2024-12-01T11:00:00",
      "pdfUrl": "https://s3.bizone.kr/contracts/1.pdf",
      "createdAt": "2024-12-01T09:00:00",
      "updatedAt": "2024-12-01T11:00:00"
    },
    {
      "id": 2,
      "workplaceId": 1,
      "workplaceName": "카페 BizOne 강남점",
      "employerId": 3,
      "employerName": "이사업",
      "employeeId": 6,
      "employeeName": "김직원",
      "contractType": "PART_TIME",
      "startDate": "2024-12-15",
      "endDate": null,
      "hourlyWage": 10000,
      "status": "SENT",
      "employerSignedAt": "2024-12-15T10:00:00",
      "employeeSignedAt": null,
      "pdfUrl": null,
      "createdAt": "2024-12-15T09:00:00",
      "updatedAt": "2024-12-15T10:00:00"
    }
  ],
  "timestamp": "2024-12-27T11:00:00"
}
```

### 프론트엔드 연동

- 사업주: 전체 계약서 목록
- 직원: 본인 계약서만 표시
- 상태별 필터링 (초안, 발송됨, 서명완료)

---

## 3. 계약서 상세 조회

계약서 상세 정보를 조회합니다.

### Request

```http
GET /contracts/{id}?workplaceId=1
Authorization: Bearer {accessToken}
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
    "workplaceAddress": "서울특별시 강남구 테헤란로 123",
    "workplaceBusinessNumber": "1234567890",
    "employerId": 3,
    "employerName": "이사업",
    "employeeId": 5,
    "employeeName": "박직원",
    "employeePhone": "01055556666",
    "contractType": "PART_TIME",
    "contractTypeName": "단시간근로자",
    "startDate": "2024-12-01",
    "endDate": "2025-02-28",
    "workStartTime": "09:00",
    "workEndTime": "18:00",
    "workDays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
    "workDaysFormatted": "월, 화, 수, 목, 금",
    "hourlyWage": 9860,
    "hourlyWageFormatted": "9,860원",
    "paymentDate": 10,
    "breakMinutes": 60,
    "duties": "매장 관리 및 고객 응대",
    "specialTerms": "수습 기간 1개월",
    "status": "SIGNED",
    "validationPassed": true,
    "validationErrors": null,
    "employerSignature": "data:image/png;base64,...",
    "employerSignedAt": "2024-12-01T10:00:00",
    "employeeSignature": "data:image/png;base64,...",
    "employeeSignedAt": "2024-12-01T11:00:00",
    "pdfUrl": "https://s3.bizone.kr/contracts/1.pdf",
    "createdAt": "2024-12-01T09:00:00",
    "updatedAt": "2024-12-01T11:00:00"
  },
  "timestamp": "2024-12-27T11:00:00"
}
```

### 프론트엔드 연동

- 계약서 내용 표시 (읽기 전용)
- 서명 이미지 표시
- PDF 다운로드 버튼

---

## 4. 계약서 수정

계약서를 수정합니다 (초안 상태만).

### Request

```http
PUT /contracts/{id}?workplaceId=1
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

초안 상태의 계약서만 수정 가능합니다.

```json
{
  "hourlyWage": 10000,
  "specialTerms": "수습 기간 없음"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "hourlyWage": 10000,
    "specialTerms": "수습 기간 없음",
    "status": "DRAFT",
    "updatedAt": "2024-12-27T12:00:00"
  },
  "message": "계약서가 수정되었습니다",
  "timestamp": "2024-12-27T12:00:00"
}
```

#### 실패 - 서명된 계약서 (409 Conflict)

```json
{
  "success": false,
  "message": "이미 서명된 계약서입니다",
  "code": "CT002",
  "timestamp": "2024-12-27T12:00:00"
}
```

---

## 5. 법규 검증

계약서의 근로기준법 준수 여부를 검증합니다.

### Request

```http
POST /contracts/{id}/validate?workplaceId=1
Authorization: Bearer {accessToken}
```

### Response

#### 검증 통과 (200 OK)

```json
{
  "success": true,
  "data": {
    "passed": true,
    "errors": [],
    "warnings": [
      {
        "code": "W001",
        "message": "1년 미만 계약으로 연차휴가 비례 적용",
        "field": "endDate"
      }
    ]
  },
  "message": "법규 검증을 통과했습니다",
  "timestamp": "2024-12-27T12:00:00"
}
```

#### 검증 실패 (200 OK)

```json
{
  "success": true,
  "data": {
    "passed": false,
    "errors": [
      {
        "code": "E001",
        "message": "최저임금 미달 (2024년 최저시급: 9,860원)",
        "field": "hourlyWage",
        "currentValue": 9000,
        "requiredValue": 9860
      },
      {
        "code": "E002",
        "message": "4시간 이상 근무 시 30분 이상 휴게시간 필수",
        "field": "breakMinutes",
        "currentValue": 0,
        "requiredValue": 30
      }
    ],
    "warnings": []
  },
  "message": "법규 검증에 실패했습니다",
  "timestamp": "2024-12-27T12:00:00"
}
```

### 프론트엔드 연동

- 발송 전 필수 검증
- 에러/경고 항목 표시
- 에러가 있으면 발송 불가

---

## 6. 계약서 발송

직원에게 계약서를 발송합니다.

### Request

```http
POST /contracts/{id}/send?workplaceId=1
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "SENT",
    "employerSignature": "data:image/png;base64,...",
    "employerSignedAt": "2024-12-27T12:00:00",
    "updatedAt": "2024-12-27T12:00:00"
  },
  "message": "계약서가 발송되었습니다",
  "timestamp": "2024-12-27T12:00:00"
}
```

### 프론트엔드 연동

- 발송 전 법규 검증 필수
- 사업주 서명 입력 (전자서명 패드)
- 발송 시 직원에게 푸시 알림

---

## 7. 전자서명

계약서에 전자서명합니다.

### Request

```http
POST /contracts/{id}/sign?workplaceId=1
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| signature | string | ✅ | 서명 이미지 (Base64) |

```json
{
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "SIGNED",
    "employeeSignature": "data:image/png;base64,...",
    "employeeSignedAt": "2024-12-27T13:00:00",
    "pdfUrl": "https://s3.bizone.kr/contracts/1.pdf",
    "updatedAt": "2024-12-27T13:00:00"
  },
  "message": "서명이 완료되었습니다",
  "timestamp": "2024-12-27T13:00:00"
}
```

### 프론트엔드 연동

- 직원용 서명 화면
- 전자서명 패드 컴포넌트
- 서명 완료 후 PDF 다운로드 안내

---

## 타입 정의

### ContractResponse

```typescript
interface ContractResponse {
  id: number;
  workplaceId: number;
  workplaceName: string;
  workplaceAddress?: string;
  workplaceBusinessNumber?: string;
  employerId: number;
  employerName: string;
  employeeId: number;
  employeeName: string;
  employeePhone?: string;
  contractType: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY';
  contractTypeName?: string;
  startDate: string;
  endDate: string | null;
  workStartTime: string;
  workEndTime: string;
  workDays: string[];
  workDaysFormatted?: string;
  hourlyWage: number;
  hourlyWageFormatted?: string;
  paymentDate: number;
  breakMinutes: number;
  duties: string | null;
  specialTerms: string | null;
  status: 'DRAFT' | 'SENT' | 'SIGNED' | 'EXPIRED';
  validationPassed: boolean | null;
  validationErrors: ValidationError[] | null;
  employerSignature: string | null;
  employerSignedAt: string | null;
  employeeSignature: string | null;
  employeeSignedAt: string | null;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContractValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  code: string;
  message: string;
  field: string;
  currentValue?: any;
  requiredValue?: any;
}

interface ValidationWarning {
  code: string;
  message: string;
  field: string;
}
```

---

## 비즈니스 로직

### 계약 유형

| 값 | 설명 |
|----|------|
| FULL_TIME | 정규직 |
| PART_TIME | 단시간근로자 |
| TEMPORARY | 일용직 |

### 법규 검증 항목

1. **최저임금**: 현행 최저시급 이상
2. **휴게시간**: 4시간당 30분, 8시간당 1시간
3. **주휴수당**: 주 15시간 이상 근무 시 지급 의무
4. **근로시간**: 1주 최대 40시간 (연장근로 12시간 추가 가능)
5. **연소자**: 15-18세 근로자 특별 규정

### 계약서 상태 흐름

```
DRAFT → SENT → SIGNED
  ↓
EXPIRED (만료)
```

---

## 관련 문서

- [공통 규격](./00-common.md)
- [화면 설계 - 근로계약서](../05_screens/10_contract/README.md)

