# ⚠️ 대시보드 예외 클래스

## 개요

대시보드 관련 예외 처리를 위한 클래스입니다. 40개의 에러 코드 (DASH-001 ~ DASH-040)를 제공합니다.

**파일 위치**: `src/lib/exceptions/dashboard/`

---

## 예외 클래스 구조

```
DashboardException (Base)
├── DashboardPermissionException
├── DashboardBusinessException
└── DashboardValidationException
```

---

## DashboardException (Base)

```javascript
export default class DashboardException extends Error {
  constructor(message, code, statusCode = 400, securityLevel = 'medium', context = {}) {
    super(message);

    this.name = 'DashboardException';
    this.code = code;
    this.message = message;
    this.userMessage = message;
    this.devMessage = message;
    this.statusCode = statusCode;
    this.securityLevel = securityLevel;  // critical, high, medium, low
    this.domain = 'DASHBOARD';
    this.retryable = false;
    this.timestamp = new Date().toISOString();
    this.context = context;
    this.category = context.type || 'general';
  }
}
```

---

## 에러 코드 목록

### A. 인증 관련 (DASH-001 ~ DASH-004)

| 코드 | 메서드 | HTTP | 설명 |
|------|--------|------|------|
| DASH-001 | authenticationRequired | 401 | 로그인 필요 |
| DASH-002 | sessionExpired | 401 | 세션 만료 |
| DASH-003 | invalidSession | 401 | 유효하지 않은 세션 |
| DASH-004 | tokenExpired | 401 | 토큰 만료 |

```javascript
DashboardException.authenticationRequired();
DashboardException.sessionExpired();
DashboardException.invalidSession();
DashboardException.tokenExpired();
```

### B. 사용자 관련 (DASH-005 ~ DASH-008)

| 코드 | 메서드 | HTTP | 설명 |
|------|--------|------|------|
| DASH-005 | userIdRequired | 400 | 사용자 ID 필요 |
| DASH-006 | invalidUserId | 400 | 유효하지 않은 사용자 ID |
| DASH-007 | userNotFound | 404 | 사용자 없음 |
| DASH-008 | userSuspended | 403 | 정지된 계정 |

```javascript
DashboardException.userIdRequired();
DashboardException.invalidUserId(userId);
DashboardException.userNotFound(userId);
DashboardException.userSuspended(userId);
```

### C. 날짜 범위 관련 (DASH-009 ~ DASH-014)

| 코드 | 메서드 | HTTP | 설명 |
|------|--------|------|------|
| DASH-009 | dateRangeRequired | 400 | 날짜 범위 필요 |
| DASH-010 | invalidDateRange | 400 | 잘못된 날짜 범위 |
| DASH-011 | invalidDateFormat | 400 | 날짜 형식 오류 |
| DASH-012 | dateRangeTooLarge | 400 | 날짜 범위 초과 |
| DASH-013 | startDateRequired | 400 | 시작 날짜 필요 |
| DASH-014 | endDateRequired | 400 | 종료 날짜 필요 |

```javascript
DashboardException.dateRangeRequired();
DashboardException.invalidDateRange(startDate, endDate);
DashboardException.invalidDateFormat(date);
DashboardException.dateRangeTooLarge(365);
```

---

## 사용 예시

### 세션 검증

```javascript
import DashboardException from '@/lib/exceptions/dashboard/DashboardException';

export function validateSession(session) {
  if (!session) {
    throw DashboardException.authenticationRequired();
  }

  if (!session.user?.id) {
    throw DashboardException.invalidSession();
  }

  return session.user;
}
```

### 날짜 파라미터 검증

```javascript
export function validateDashboardQueryParams(params) {
  const { startDate, endDate, period } = params;

  if (startDate && !isValidDate(startDate)) {
    throw DashboardException.invalidDateFormat(startDate);
  }

  if (endDate && !isValidDate(endDate)) {
    throw DashboardException.invalidDateFormat(endDate);
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw DashboardException.invalidDateRange(startDate, endDate);
  }

  return { startDate, endDate, period };
}
```

### API 에러 핸들러

```javascript
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const user = validateSession(session);
    
    // 대시보드 데이터 조회...
    
  } catch (error) {
    if (error instanceof DashboardException) {
      return NextResponse.json(error.toJSON(), { 
        status: error.statusCode 
      });
    }
    
    // 일반 에러
    return NextResponse.json({
      code: 'DASH-999',
      message: '알 수 없는 오류가 발생했습니다',
    }, { status: 500 });
  }
}
```

---

## 에러 응답 형식

```json
{
  "name": "DashboardException",
  "code": "DASH-002",
  "message": "세션이 만료되었습니다. 다시 로그인해주세요.",
  "userMessage": "세션이 만료되었습니다. 다시 로그인해주세요.",
  "devMessage": "세션이 만료되었습니다. 다시 로그인해주세요.",
  "statusCode": 401,
  "securityLevel": "critical",
  "domain": "DASHBOARD",
  "retryable": false,
  "timestamp": "2024-12-10T00:00:00.000Z",
  "context": {
    "type": "authentication",
    "subtype": "expired"
  },
  "category": "authentication"
}
```

---

## 에러 로깅

```javascript
import { logDashboardError, logDashboardWarning } from "@/lib/exceptions/dashboard-errors";

// 에러 로깅
logDashboardError('활성 스터디 수 조회', error, { userId });

// 경고 로깅
logDashboardWarning('통계 쿼리 부분 실패', '일부 통계 데이터를 불러오지 못했습니다', {
  userId,
  failedQueries: ['activeStudies', 'pendingTasks']
});
```

---

## 부분 성공 응답

```javascript
import { createPartialSuccessResponse } from "@/lib/exceptions/dashboard-errors";

// 일부 쿼리 실패 시
if (failedQueries.length > 0) {
  return NextResponse.json(
    createPartialSuccessResponse(responseData, failedQueries),
    { status: 207 }  // Multi-Status
  );
}
```

---

## 관련 문서

- [README](./README.md)
- [API](./api.md)
- [화면](./screens.md)
- [위젯](./widgets.md)

