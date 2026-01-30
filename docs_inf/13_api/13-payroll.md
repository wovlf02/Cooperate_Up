# 급여 API (Payroll API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/payrolls`

## 개요

급여 관리 및 정산 API입니다.

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 | 권한 |
|--------|-----------|------|:----:|------|
| GET | `/payrolls` | 급여 목록 | ✅ | - |
| GET | `/payrolls/{id}` | 급여 상세 | ✅ | - |
| POST | `/payrolls/calculate` | 급여 미리보기 | ✅ | 사업주 |
| POST | `/payrolls/generate` | 월별 급여 생성 | ✅ | 사업주 |
| POST | `/payrolls/{id}/confirm` | 급여 확정 | ✅ | 사업주 |
| POST | `/payrolls/{id}/paid` | 지급 완료 처리 | ✅ | 사업주 |

---

## 1. 급여 목록

사업장의 급여 목록을 조회합니다.

### Request

```http
GET /payrolls?workplaceId=1&year=2024&month=12
Authorization: Bearer {accessToken}
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| year | int | ❌ | 연도 필터 |
| month | int | ❌ | 월 필터 |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "workplaceId": 1,
      "userId": 5,
      "userName": "박직원",
      "username": "employee1",
      "payYear": 2024,
      "payMonth": 12,
      "totalWorkDays": 20,
      "totalWorkMinutes": 9600,
      "totalWorkTimeFormatted": "160시간 0분",
      "hourlyWage": 9860,
      "basePay": 1577600,
      "weeklyHolidayPay": 197200,
      "overtimePay": 0,
      "nightPay": 0,
      "holidayPay": 0,
      "totalEarnings": 1774800,
      "earningsDetail": "기본급 1,577,600원 + 주휴수당 197,200원",
      "nationalPension": 79912,
      "healthInsurance": 62083,
      "longTermCare": 8046,
      "employmentInsurance": 15973,
      "incomeTax": 35000,
      "localIncomeTax": 3500,
      "totalDeductions": 204514,
      "deductionsDetail": "4대보험 166,014원 + 소득세 38,500원",
      "netPay": 1570286,
      "status": "CONFIRMED",
      "isPaid": false,
      "paidAt": null,
      "pdfUrl": null,
      "createdAt": "2024-12-27T10:00:00",
      "updatedAt": "2024-12-27T10:00:00"
    },
    {
      "id": 2,
      "workplaceId": 1,
      "userId": 6,
      "userName": "김직원",
      "username": "employee2",
      "payYear": 2024,
      "payMonth": 12,
      "totalWorkDays": 15,
      "totalWorkMinutes": 7200,
      "totalWorkTimeFormatted": "120시간 0분",
      "hourlyWage": 10000,
      "basePay": 1200000,
      "weeklyHolidayPay": 150000,
      "overtimePay": 0,
      "nightPay": 0,
      "holidayPay": 0,
      "totalEarnings": 1350000,
      "earningsDetail": "기본급 1,200,000원 + 주휴수당 150,000원",
      "nationalPension": 60750,
      "healthInsurance": 47196,
      "longTermCare": 6117,
      "employmentInsurance": 12150,
      "incomeTax": 25000,
      "localIncomeTax": 2500,
      "totalDeductions": 153713,
      "deductionsDetail": "4대보험 126,213원 + 소득세 27,500원",
      "netPay": 1196287,
      "status": "DRAFT",
      "isPaid": false,
      "paidAt": null,
      "pdfUrl": null,
      "createdAt": "2024-12-27T10:00:00",
      "updatedAt": "2024-12-27T10:00:00"
    }
  ],
  "timestamp": "2024-12-27T11:00:00"
}
```

### 프론트엔드 연동

- 사업주: 전체 직원 급여 목록
- 직원: 본인 급여만 표시
- 연월 필터 선택 UI
- 상태별 색상 구분

---

## 2. 급여 상세 조회

급여 상세 정보를 조회합니다.

### Request

```http
GET /payrolls/{id}?workplaceId=1
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
    "userId": 5,
    "userName": "박직원",
    "username": "employee1",
    "payYear": 2024,
    "payMonth": 12,
    "totalWorkDays": 20,
    "totalWorkMinutes": 9600,
    "totalWorkTimeFormatted": "160시간 0분",
    "hourlyWage": 9860,
    "basePay": 1577600,
    "weeklyHolidayPay": 197200,
    "overtimePay": 0,
    "nightPay": 0,
    "holidayPay": 0,
    "totalEarnings": 1774800,
    "earningsDetail": "기본급 1,577,600원 + 주휴수당 197,200원",
    "nationalPension": 79912,
    "healthInsurance": 62083,
    "longTermCare": 8046,
    "employmentInsurance": 15973,
    "incomeTax": 35000,
    "localIncomeTax": 3500,
    "totalDeductions": 204514,
    "deductionsDetail": "4대보험 166,014원 + 소득세 38,500원",
    "netPay": 1570286,
    "status": "CONFIRMED",
    "isPaid": false,
    "paidAt": null,
    "pdfUrl": "https://s3.bizone.kr/payrolls/1.pdf",
    "createdAt": "2024-12-27T10:00:00",
    "updatedAt": "2024-12-27T10:00:00"
  },
  "timestamp": "2024-12-27T11:00:00"
}
```

### 프론트엔드 연동

- 급여 명세서 상세 표시
- 지급/공제 항목 상세 표시
- PDF 다운로드 버튼

---

## 3. 급여 계산 (미리보기)

급여를 미리 계산합니다.

### Request

```http
POST /payrolls/calculate
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| userId | long | ✅ | 직원 ID |
| year | int | ✅ | 연도 |
| month | int | ✅ | 월 |

```json
{
  "workplaceId": 1,
  "userId": 5,
  "year": 2024,
  "month": 12
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": null,
    "workplaceId": 1,
    "userId": 5,
    "userName": "박직원",
    "username": "employee1",
    "payYear": 2024,
    "payMonth": 12,
    "totalWorkDays": 20,
    "totalWorkMinutes": 9600,
    "totalWorkTimeFormatted": "160시간 0분",
    "hourlyWage": 9860,
    "basePay": 1577600,
    "weeklyHolidayPay": 197200,
    "overtimePay": 0,
    "nightPay": 0,
    "holidayPay": 0,
    "totalEarnings": 1774800,
    "earningsDetail": "기본급 1,577,600원 + 주휴수당 197,200원",
    "nationalPension": 79912,
    "healthInsurance": 62083,
    "longTermCare": 8046,
    "employmentInsurance": 15973,
    "incomeTax": 35000,
    "localIncomeTax": 3500,
    "totalDeductions": 204514,
    "deductionsDetail": "4대보험 166,014원 + 소득세 38,500원",
    "netPay": 1570286,
    "status": null,
    "isPaid": null,
    "paidAt": null,
    "pdfUrl": null,
    "createdAt": null,
    "updatedAt": null
  },
  "timestamp": "2024-12-27T11:00:00"
}
```

### 프론트엔드 연동

- 급여 생성 전 미리보기
- 출퇴근 기록 기반 자동 계산
- 확정 전 검토용

---

## 4. 월별 급여 일괄 생성

해당 월의 급여를 일괄 생성합니다.

### Request

```http
POST /payrolls/generate?workplaceId=1&year=2024&month=12
Authorization: Bearer {accessToken}
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| year | int | ✅ | 연도 |
| month | int | ✅ | 월 |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 5,
      "userName": "박직원",
      "netPay": 1570286,
      "status": "DRAFT"
    },
    {
      "id": 2,
      "userId": 6,
      "userName": "김직원",
      "netPay": 1196287,
      "status": "DRAFT"
    }
  ],
  "message": "급여가 생성되었습니다",
  "timestamp": "2024-12-27T11:00:00"
}
```

### 프론트엔드 연동

- 월말 급여 일괄 생성 버튼
- 생성 결과 목록 표시
- 생성 후 목록 새로고침

---

## 5. 급여 확정

급여를 확정 처리합니다.

### Request

```http
POST /payrolls/{id}/confirm?workplaceId=1
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "CONFIRMED",
    "pdfUrl": "https://s3.bizone.kr/payrolls/1.pdf",
    "updatedAt": "2024-12-27T12:00:00"
  },
  "message": "급여가 확정되었습니다",
  "timestamp": "2024-12-27T12:00:00"
}
```

### 프론트엔드 연동

- 확정 전 내역 검토
- 확정 시 PDF 생성
- 확정 후 수정 불가 안내

---

## 6. 지급 완료 처리

급여를 지급 완료 처리합니다.

### Request

```http
POST /payrolls/{id}/paid?workplaceId=1
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "PAID",
    "isPaid": true,
    "paidAt": "2024-12-27T12:30:00",
    "updatedAt": "2024-12-27T12:30:00"
  },
  "message": "지급 완료 처리되었습니다",
  "timestamp": "2024-12-27T12:30:00"
}
```

### 프론트엔드 연동

- 확정된 급여만 지급 처리 가능
- 지급 완료 시 직원에게 알림

---

## 타입 정의

### PayrollResponse

```typescript
interface PayrollResponse {
  id: number;
  workplaceId: number;
  userId: number;
  userName: string;
  username: string;
  payYear: number;
  payMonth: number;
  
  // 근무 집계
  totalWorkDays: number;
  totalWorkMinutes: number;
  totalWorkTimeFormatted: string;
  hourlyWage: number;
  
  // 지급 내역
  basePay: number;
  weeklyHolidayPay: number;
  overtimePay: number;
  nightPay: number;
  holidayPay: number;
  totalEarnings: number;
  earningsDetail: string;
  
  // 공제 내역
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  incomeTax: number;
  localIncomeTax: number;
  totalDeductions: number;
  deductionsDetail: string;
  
  // 실수령액
  netPay: number;
  
  // 상태
  status: 'DRAFT' | 'CONFIRMED' | 'PAID';
  isPaid: boolean;
  paidAt: string | null;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CalculatePayrollRequest {
  workplaceId: number;
  userId: number;
  year: number;
  month: number;
}
```

---

## 비즈니스 로직

### 급여 계산 공식

```
[지급 내역]
기본급 = 시급 × 총 근무시간
주휴수당 = 시급 × 8시간 × (주당 근무일수 ÷ 5)
연장수당 = 시급 × 1.5 × 연장근무시간 (1일 8시간 초과)
야간수당 = 시급 × 0.5 × 야간근무시간 (22:00~06:00)
휴일수당 = 시급 × 1.5 × 휴일근무시간

[공제 내역]
국민연금 = 총급여 × 4.5%
건강보험 = 총급여 × 3.545%
장기요양 = 건강보험료 × 12.95%
고용보험 = 총급여 × 0.9%
소득세 = 간이세액표 기준
지방소득세 = 소득세 × 10%

실수령액 = 총지급액 - 총공제액
```

### 급여 상태 흐름

```
DRAFT → CONFIRMED → PAID
(초안)    (확정)     (지급완료)
```

### 4대보험 요율 (2024년 기준)

| 항목 | 근로자 | 사업주 |
|------|--------|--------|
| 국민연금 | 4.5% | 4.5% |
| 건강보험 | 3.545% | 3.545% |
| 장기요양 | 12.95% (건강보험료 기준) | 12.95% |
| 고용보험 | 0.9% | 0.9~1.65% |

---

## 추가 필요 API (설계)

### 급여 명세서 PDF 다운로드

```http
GET /payrolls/{id}/pdf?workplaceId=1
Authorization: Bearer {accessToken}

Response: PDF 파일 (Content-Type: application/pdf)
```

### 급여 일괄 확정

```http
POST /payrolls/confirm-all?workplaceId=1&year=2024&month=12
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "confirmedCount": 5,
    "failedCount": 0
  },
  "message": "5건의 급여가 확정되었습니다"
}
```

### 급여 일괄 지급 처리

```http
POST /payrolls/paid-all?workplaceId=1&year=2024&month=12
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "paidCount": 5,
    "failedCount": 0
  },
  "message": "5건의 급여가 지급 완료 처리되었습니다"
}
```

### 급여 통계 (관리자)

```http
GET /payrolls/statistics?workplaceId=1&year=2024
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "year": 2024,
    "monthlyStats": [
      {
        "month": 1,
        "totalEmployees": 5,
        "totalEarnings": 8500000,
        "totalDeductions": 1200000,
        "totalNetPay": 7300000,
        "confirmedCount": 5,
        "paidCount": 5
      },
      ...
    ],
    "yearTotal": {
      "totalEarnings": 102000000,
      "totalDeductions": 14400000,
      "totalNetPay": 87600000
    }
  }
}
```

---

## 관련 문서

- [공통 규격](./00-common.md)
- [캘린더 API](./07-calendar.md)
- [출퇴근 API](./05-attendance.md)
- [화면 설계 - 급여](../05_screens/11_payroll/README.md)

