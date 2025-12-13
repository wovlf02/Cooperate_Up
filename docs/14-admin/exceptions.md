# ⚠️ 관리자 예외 클래스

## 개요

관리자 도메인 관련 예외 처리를 위한 클래스입니다. 100개의 에러 코드 (ADMIN-001 ~ ADMIN-100)를 제공합니다.

**파일 위치**: `src/lib/exceptions/admin/AdminException.js`

---

## 예외 클래스 구조

```
AdminException (Base)
├── AdminValidationException    # 입력 검증 에러
├── AdminPermissionException    # 권한/인증 에러
├── AdminBusinessException      # 비즈니스 로직 에러
├── AdminDatabaseException      # 데이터베이스 에러
├── AdminUserException          # 사용자 관리 에러
├── AdminReportException        # 신고 처리 에러
└── AdminSettingsException      # 설정 관련 에러
```

---

## AdminException (Base)

```javascript
export class AdminException extends Error {
  constructor(code, message, details = {}) {
    super(message);

    this.name = 'AdminException';
    this.code = code;
    this.message = message;
    this.userMessage = details.userMessage || message;
    this.devMessage = details.devMessage || message;
    this.statusCode = details.statusCode || 400;
    this.retryable = details.retryable ?? false;
    this.severity = details.severity || 'medium';
    this.timestamp = new Date().toISOString();
    this.context = details.context || {};
    this.category = details.category || 'general';
    this.securityLevel = details.securityLevel || 'normal';
  }

  toJSON() { ... }
  toResponse() { ... }
}
```

---

## 서브 클래스

### AdminValidationException

입력값 검증, 데이터 형식 에러

```javascript
export class AdminValidationException extends AdminException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'validation',
      severity: details.severity || 'low',
      statusCode: details.statusCode || 400
    });
    this.name = 'AdminValidationException';
  }
}
```

### AdminPermissionException

인증, 인가, 권한 부족 에러

```javascript
export class AdminPermissionException extends AdminException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'permission',
      severity: details.severity || 'high',
      statusCode: details.statusCode || 403,
      securityLevel: details.securityLevel || 'high'
    });
    this.name = 'AdminPermissionException';
  }
}
```

### AdminBusinessException

처리 규칙, 상태 변경, 워크플로우 에러

```javascript
export class AdminBusinessException extends AdminException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'business_logic',
      severity: details.severity || 'medium',
      statusCode: details.statusCode || 400
    });
    this.name = 'AdminBusinessException';
  }
}
```

### AdminDatabaseException

DB 쿼리, 트랜잭션, 제약조건 에러

```javascript
export class AdminDatabaseException extends AdminException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'database',
      severity: details.severity || 'critical',
      statusCode: details.statusCode || 500
    });
    this.name = 'AdminDatabaseException';
  }
}
```

---

## 에러 코드 목록

### 권한 & 인증 (ADMIN-001 ~ ADMIN-020)

| 코드 | 설명 |
|------|------|
| ADMIN-001 | 관리자 인증 실패 |
| ADMIN-002 | 세션 만료 |
| ADMIN-003 | 권한 부족 |
| ADMIN-004 | 관리자 역할 없음 |
| ADMIN-005 | 역할 만료됨 |

### 사용자 관리 (ADMIN-021 ~ ADMIN-040)

| 코드 | 설명 |
|------|------|
| ADMIN-021 | 사용자 없음 |
| ADMIN-022 | 사용자 이미 정지됨 |
| ADMIN-023 | 사용자 정지 불가 |
| ADMIN-024 | 자기 자신 정지 불가 |
| ADMIN-025 | 상위 관리자 정지 불가 |

### 스터디 관리 (ADMIN-041 ~ ADMIN-060)

| 코드 | 설명 |
|------|------|
| ADMIN-041 | 스터디 없음 |
| ADMIN-042 | 스터디 이미 숨김 |
| ADMIN-043 | 스터디 이미 종료 |

### 신고 처리 (ADMIN-061 ~ ADMIN-080)

| 코드 | 설명 |
|------|------|
| ADMIN-061 | 신고 없음 |
| ADMIN-062 | 신고 이미 처리됨 |
| ADMIN-063 | 신고 할당 불가 |

### 검증 (ADMIN-081 ~ ADMIN-100)

| 코드 | 설명 |
|------|------|
| ADMIN-081 | 잘못된 페이지네이션 |
| ADMIN-082 | 잘못된 정렬 필드 |
| ADMIN-083 | 잘못된 필터 값 |

---

## 사용 예시

### 권한 확인

```javascript
import { AdminPermissionException } from '@/lib/exceptions/admin';

const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW);
if (auth instanceof NextResponse) {
  throw AdminPermissionException.insufficientPermission(
    PERMISSIONS.USER_VIEW, 
    'unknown'
  );
}
```

### 사용자 관리

```javascript
import { AdminUserException } from '@/lib/exceptions/admin';

const user = await prisma.user.findUnique({ where: { id } });
if (!user) {
  throw AdminUserException.userNotFound(id);
}

if (user.status === 'SUSPENDED') {
  throw AdminUserException.alreadySuspended(id);
}
```

### 검증

```javascript
import { AdminValidationException } from '@/lib/exceptions/admin';

const validSortFields = ['createdAt', 'email', 'name'];
if (!validSortFields.includes(sortBy)) {
  throw AdminValidationException.invalidSorting(sortBy, validSortFields);
}
```

---

## 에러 응답 형식

### toJSON()

```json
{
  "name": "AdminPermissionException",
  "code": "ADMIN-003",
  "message": "해당 작업을 수행할 권한이 없습니다",
  "userMessage": "해당 작업을 수행할 권한이 없습니다",
  "devMessage": "User lacks user:suspend permission",
  "statusCode": 403,
  "retryable": false,
  "severity": "high",
  "securityLevel": "high",
  "timestamp": "2024-12-10T00:00:00.000Z",
  "context": {
    "requiredPermission": "user:suspend",
    "adminId": "admin_123"
  },
  "category": "permission"
}
```

### toResponse()

```json
{
  "success": false,
  "error": {
    "code": "ADMIN-003",
    "message": "해당 작업을 수행할 권한이 없습니다",
    "retryable": false,
    "timestamp": "2024-12-10T00:00:00.000Z"
  }
}
```

---

## 관련 문서

- [README](./README.md)
- [API](./api.md)
- [화면](./screens.md)
- [권한](./permissions.md)

