# 캘린더 API (Calendar API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/calendar`

## 개요

월별 출퇴근 현황 및 일별 상세 정보 조회 API입니다.

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|:----:|
| GET | `/calendar/monthly` | 월별 캘린더 조회 | ✅ |
| GET | `/calendar/daily/{date}` | 일별 상세 조회 | ✅ |
| GET | `/calendar/summary/{yearMonth}` | 월별 요약 조회 | ✅ |

---

## 1. 월별 캘린더 조회

월별 출퇴근 현황을 조회합니다.

### Request

```http
GET /calendar/monthly?workplaceId=1&year=2024&month=12
Authorization: Bearer {accessToken}
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |
| year | int | ✅ | 연도 |
| month | int | ✅ | 월 (1-12) |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 12,
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "days": [
      {
        "date": "2024-12-01",
        "dayOfWeek": "SUNDAY",
        "isHoliday": false,
        "hasAttendance": false,
        "status": null,
        "clockIn": null,
        "clockOut": null,
        "workMinutes": null,
        "dailyWage": null
      },
      {
        "date": "2024-12-02",
        "dayOfWeek": "MONDAY",
        "isHoliday": false,
        "hasAttendance": true,
        "status": "COMPLETED",
        "clockIn": "09:00",
        "clockOut": "18:00",
        "workMinutes": 540,
        "dailyWage": 88740
      },
      {
        "date": "2024-12-25",
        "dayOfWeek": "WEDNESDAY",
        "isHoliday": true,
        "holidayName": "크리스마스",
        "hasAttendance": true,
        "status": "COMPLETED",
        "clockIn": "10:00",
        "clockOut": "15:00",
        "workMinutes": 300,
        "dailyWage": 74100
      }
    ],
    "summary": {
      "totalWorkDays": 20,
      "totalWorkMinutes": 9600,
      "totalWorkHours": 160,
      "estimatedPay": 1577600
    }
  },
  "timestamp": "2024-12-27T10:00:00"
}
```

### 프론트엔드 연동

- 캘린더 UI에서 날짜별 출퇴근 상태 표시
- 상태별 색상 구분 (정상 출근, 지각, 결근 등)
- 날짜 클릭 시 일별 상세 조회

---

## 2. 일별 상세 조회

특정 날짜의 출퇴근 상세 정보를 조회합니다.

### Request

```http
GET /calendar/daily/2024-12-27?workplaceId=1
Authorization: Bearer {accessToken}
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| date | date | ✅ | 날짜 (yyyy-MM-dd) |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "date": "2024-12-27",
    "dayOfWeek": "FRIDAY",
    "isHoliday": false,
    "holidayName": null,
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "attendance": {
      "id": 1,
      "clockIn": "2024-12-27T08:45:00",
      "clockOut": "2024-12-27T18:05:00",
      "effectiveClockIn": "2024-12-27T09:00:00",
      "effectiveClockOut": "2024-12-27T18:05:00",
      "workMinutes": 545,
      "breakMinutes": 60,
      "netWorkMinutes": 485,
      "status": "COMPLETED",
      "isEarlyClockIn": true,
      "isManualInput": false
    },
    "wage": {
      "hourlyWage": 9860,
      "basePay": 79727,
      "overtimePay": 0,
      "nightPay": 0,
      "holidayPay": 0,
      "totalPay": 79727,
      "calculation": "기본급: 9860원 × 8시간 5분 = 79,727원"
    },
    "checklist": {
      "totalTasks": 5,
      "completedTasks": 5,
      "skippedTasks": 0
    }
  },
  "timestamp": "2024-12-27T18:30:00"
}
```

### 프론트엔드 연동

- 날짜 클릭 시 모달 또는 상세 화면 표시
- 급여 산출식 표시
- 체크리스트 완료 현황 표시

---

## 3. 월별 요약 조회

월별 근무 시간 및 예상 급여 요약을 조회합니다.

### Request

```http
GET /calendar/summary/2024-12?workplaceId=1
Authorization: Bearer {accessToken}
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| yearMonth | string | ✅ | 연월 (yyyy-MM) |

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| workplaceId | long | ✅ | 사업장 ID |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 12,
    "workplaceId": 1,
    "workplaceName": "카페 BizOne 강남점",
    "totalWorkDays": 20,
    "totalWorkMinutes": 9600,
    "totalWorkHours": 160,
    "totalWorkHoursFormatted": "160시간 0분",
    "hourlyWage": 9860,
    "basePay": 1577600,
    "weeklyHolidayPay": 197200,
    "overtimePay": 0,
    "nightPay": 0,
    "holidayPay": 74100,
    "totalEarnings": 1848900,
    "nationalPension": 83200,
    "healthInsurance": 64711,
    "longTermCare": 8389,
    "employmentInsurance": 16640,
    "totalDeductions": 172940,
    "estimatedNetPay": 1675960,
    "paymentDate": "2025-01-10"
  },
  "timestamp": "2024-12-27T10:00:00"
}
```

### 프론트엔드 연동

- 월별 요약 카드로 표시
- 지급/공제 항목 상세 표시
- 급여일 표시

---

## 타입 정의

### MonthlyCalendarResponse

```typescript
interface MonthlyCalendarResponse {
  year: number;
  month: number;
  workplaceId: number;
  workplaceName: string;
  days: DayInfo[];
  summary: MonthlySummary;
}

interface DayInfo {
  date: string;
  dayOfWeek: string;
  isHoliday: boolean;
  holidayName?: string;
  hasAttendance: boolean;
  status: 'WORKING' | 'COMPLETED' | 'ABSENT' | null;
  clockIn: string | null;
  clockOut: string | null;
  workMinutes: number | null;
  dailyWage: number | null;
}

interface MonthlySummary {
  totalWorkDays: number;
  totalWorkMinutes: number;
  totalWorkHours: number;
  estimatedPay: number;
}
```

### DailyDetailResponse

```typescript
interface DailyDetailResponse {
  date: string;
  dayOfWeek: string;
  isHoliday: boolean;
  holidayName: string | null;
  workplaceId: number;
  workplaceName: string;
  attendance: AttendanceDetail | null;
  wage: WageDetail | null;
  checklist: ChecklistSummary | null;
}

interface AttendanceDetail {
  id: number;
  clockIn: string;
  clockOut: string;
  effectiveClockIn: string;
  effectiveClockOut: string;
  workMinutes: number;
  breakMinutes: number;
  netWorkMinutes: number;
  status: string;
  isEarlyClockIn: boolean;
  isManualInput: boolean;
}

interface WageDetail {
  hourlyWage: number;
  basePay: number;
  overtimePay: number;
  nightPay: number;
  holidayPay: number;
  totalPay: number;
  calculation: string;
}

interface ChecklistSummary {
  totalTasks: number;
  completedTasks: number;
  skippedTasks: number;
}
```

### MonthlySummaryResponse

```typescript
interface MonthlySummaryResponse {
  year: number;
  month: number;
  workplaceId: number;
  workplaceName: string;
  totalWorkDays: number;
  totalWorkMinutes: number;
  totalWorkHours: number;
  totalWorkHoursFormatted: string;
  hourlyWage: number;
  basePay: number;
  weeklyHolidayPay: number;
  overtimePay: number;
  nightPay: number;
  holidayPay: number;
  totalEarnings: number;
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  totalDeductions: number;
  estimatedNetPay: number;
  paymentDate: string;
}
```

---

## 비즈니스 로직

### 공휴일 처리

- 공휴일 목록은 한국 법정 공휴일 기준
- 공휴일 근무 시 휴일 수당 계산 (통상임금 × 1.5)

### 급여 계산

- **기본급**: 시급 × 근무시간
- **주휴수당**: 1주 15시간 이상 근무 시 지급
- **야간수당**: 22:00~06:00 근무 시 통상임금 × 0.5 추가
- **연장수당**: 1일 8시간 초과 시 통상임금 × 0.5 추가
- **휴일수당**: 휴일 근무 시 통상임금 × 0.5 추가

---

## 추가 필요 API (설계)

### 관리자용 - 전체 직원 캘린더

```http
GET /calendar/admin/monthly?workplaceId=1&year=2024&month=12
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 12,
    "workplaceId": 1,
    "employees": [
      {
        "userId": 5,
        "userName": "박직원",
        "totalWorkDays": 20,
        "totalWorkHours": 160,
        "estimatedPay": 1577600,
        "attendanceStatus": [
          { "date": "2024-12-02", "status": "COMPLETED" },
          { "date": "2024-12-03", "status": "ABSENT" }
        ]
      }
    ]
  }
}
```

---

## 관련 문서

- [공통 규격](./00-common.md)
- [출퇴근 API](./05-attendance.md)
- [급여 API](./13-payroll.md)
- [화면 설계 - 캘린더](../05_screens/04_calendar/README.md)

