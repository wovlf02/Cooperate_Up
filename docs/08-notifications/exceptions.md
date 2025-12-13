# ⚠️ 알림 예외 클래스

## 개요

알림 도메인의 예외 처리를 위한 클래스 계층 구조입니다.

**파일 위치**: `src/lib/exceptions/notification/`

---

## 클래스 계층

```
NotificationException (Base)
├── NotificationValidationException   # 검증 (NOTI-001 ~ NOTI-015)
├── NotificationPermissionException   # 권한 (NOTI-016 ~ NOTI-025)
└── NotificationBusinessException     # 비즈니스 (NOTI-026 ~ NOTI-040)
```

---

## NotificationException (Base)

모든 알림 예외의 기본 클래스입니다.

### 생성자

```javascript
constructor(
  message,                    // 기본 메시지
  code,                       // 에러 코드 (NOTI-XXX)
  statusCode = 400,           // HTTP 상태 코드
  securityLevel = 'medium',   // 보안 수준
  context = {}                // 추가 컨텍스트
)
```

### 속성

| 속성 | 타입 | 설명 |
|------|------|------|
| name | string | 예외 클래스 이름 |
| code | string | 에러 코드 |
| message | string | 에러 메시지 |
| userMessage | string | 사용자용 메시지 |
| statusCode | number | HTTP 상태 코드 |
| securityLevel | string | 보안 수준 |
| domain | string | 도메인 ('NOTIFICATION') |
| retryable | boolean | 재시도 가능 여부 |
| timestamp | string | 발생 시간 |
| context | object | 추가 컨텍스트 |

### toJSON()

```javascript
{
  name: "NotificationException",
  code: "NOTI-001",
  message: "알림 타입을 입력해주세요.",
  userMessage: "알림 타입을 입력해주세요.",
  statusCode: 400,
  securityLevel: "medium",
  domain: "NOTIFICATION",
  retryable: false,
  timestamp: "2025-01-01T00:00:00.000Z",
  context: { field: "type", type: "required" }
}
```

---

## NotificationValidationException

입력 검증 실패 시 발생하는 예외입니다.

### 에러 코드 (NOTI-001 ~ NOTI-015)

| 코드 | 메서드 | 설명 |
|------|--------|------|
| NOTI-001 | `typeRequired()` | 타입 필수 |
| NOTI-002 | `invalidType(type)` | 유효하지 않은 타입 |
| NOTI-003 | `typeNotSupported(type)` | 지원하지 않는 타입 |
| NOTI-004 | `invalidTypeFormat(type)` | 타입 형식 오류 |
| NOTI-005 | `messageRequired()` | 메시지 필수 |
| NOTI-006 | `messageTooLong(max)` | 메시지 너무 김 |
| NOTI-007 | `userIdRequired()` | 사용자 ID 필수 |
| NOTI-008 | `invalidUserId(userId)` | 유효하지 않은 사용자 ID |
| NOTI-009 | `invalidNotificationId(id)` | 유효하지 않은 알림 ID |
| NOTI-010 | `invalidPageNumber(page)` | 유효하지 않은 페이지 |
| NOTI-011 | `invalidPageSize(size)` | 유효하지 않은 페이지 크기 |
| NOTI-012 | `invalidDateRange()` | 유효하지 않은 날짜 범위 |
| NOTI-013 | `invalidIdArray()` | 유효하지 않은 ID 배열 |
| NOTI-014 | `invalidDataFormat()` | 유효하지 않은 데이터 형식 |
| NOTI-015 | `invalidStudyId(studyId)` | 유효하지 않은 스터디 ID |

### 사용 예시

```javascript
import { NotificationValidationException } from '@/lib/exceptions/notification';

if (!type) {
  throw NotificationValidationException.typeRequired();
}

if (!VALID_TYPES.includes(type)) {
  throw NotificationValidationException.invalidType(type);
}
```

---

## NotificationPermissionException

권한 부족 시 발생하는 예외입니다.

### 에러 코드 (NOTI-016 ~ NOTI-025)

| 코드 | 메서드 | 설명 |
|------|--------|------|
| NOTI-016 | `authenticationRequired()` | 인증 필요 |
| NOTI-017 | `notificationNotOwned(id)` | 소유권 없음 |
| NOTI-018 | `cannotDeleteOthersNotification()` | 타인 알림 삭제 불가 |
| NOTI-019 | `cannotMarkOthersAsRead()` | 타인 알림 읽음 불가 |
| NOTI-020 | `adminPermissionRequired()` | 관리자 권한 필요 |
| NOTI-021 | `systemNotificationOnly()` | 시스템 알림만 가능 |

### 사용 예시

```javascript
import { NotificationPermissionException } from '@/lib/exceptions/notification';

if (notification.userId !== userId) {
  throw NotificationPermissionException.notificationNotOwned(notificationId);
}
```

---

## NotificationBusinessException

비즈니스 로직 관련 예외입니다.

### 에러 코드 (NOTI-026 ~ NOTI-040)

| 코드 | 메서드 | 설명 |
|------|--------|------|
| NOTI-026 | `notificationNotFound(id)` | 알림 없음 |
| NOTI-027 | `alreadyRead(id)` | 이미 읽음 |
| NOTI-028 | `creationFailed(reason)` | 생성 실패 |
| NOTI-029 | `deletionFailed(id, reason)` | 삭제 실패 |
| NOTI-030 | `markAsReadFailed(id, reason)` | 읽음 처리 실패 |
| NOTI-031 | `markAllAsReadFailed(reason)` | 전체 읽음 실패 |
| NOTI-032 | `bulkCreationFailed(success, total)` | 대량 생성 실패 |
| NOTI-033 | `bulkDeletionFailed(success, total)` | 대량 삭제 실패 |
| NOTI-034 | `userNotFound(userId)` | 사용자 없음 |
| NOTI-035 | `studyNotFound(studyId)` | 스터디 없음 |
| NOTI-036 | `databaseError(operation, details)` | DB 오류 |
| NOTI-037 | `invalidInput(message)` | 잘못된 입력 |
| NOTI-038 | `rateLimitExceeded()` | 요청 제한 초과 |

### 사용 예시

```javascript
import { NotificationBusinessException } from '@/lib/exceptions/notification';

const notification = await prisma.notification.findUnique({ where: { id } });
if (!notification) {
  throw NotificationBusinessException.notificationNotFound(id);
}
```

---

## API 에러 응답 패턴

```javascript
try {
  // 비즈니스 로직
} catch (error) {
  console.error('[NOTIFICATION ERROR]', error);

  const response = createErrorResponse(error);
  return NextResponse.json(
    { error: response.error, code: response.code },
    { status: response.statusCode }
  );
}
```

---

## 관련 문서

- [API](./api.md)
- [헬퍼 함수](./helpers.md)
- [컴포넌트](./components.md)

