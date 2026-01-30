# ⚠️ 채팅 예외 클래스

## 개요

채팅 도메인의 예외 처리를 위한 클래스 계층 구조입니다.

**파일 위치**: `src/lib/exceptions/chat/`

---

## 클래스 목록

| 클래스 | 파일 | 설명 |
|--------|------|------|
| ChatException | `ChatException.js` | 기본 예외 |
| MessageException | `MessageException.js` | 메시지 예외 |
| ChatValidationException | `ChatValidationException.js` | 검증 예외 |
| ChatPermissionException | `ChatPermissionException.js` | 권한 예외 |
| ChatBusinessException | `ChatBusinessException.js` | 비즈니스 예외 |
| ConnectionException | `ConnectionException.js` | 연결 예외 |
| FileException | `FileException.js` | 파일 예외 |
| SyncException | `SyncException.js` | 동기화 예외 |
| UIException | `UIException.js` | UI 예외 |

---

## ChatMessageException

메시지 관련 예외입니다. 가장 많이 사용됩니다.

### 주요 메서드

| 메서드 | 설명 |
|--------|------|
| `emptyContent(context)` | 내용 없음 |
| `contentTooLong(length, max, context)` | 내용 너무 김 |
| `notFound(messageId, context)` | 메시지 없음 |
| `unauthorizedEdit(context)` | 수정 권한 없음 |
| `unauthorizedDelete(context)` | 삭제 권한 없음 |
| `xssDetected(threats, context)` | XSS 감지 |
| `spamDetected(count, timeWindow, context)` | 스팸 감지 |

### 사용 예시

```javascript
import { ChatMessageException } from '@/lib/exceptions/chat';

// 내용 없음
if (!content && !fileId) {
  throw ChatMessageException.emptyContent({ studyId, userId });
}

// 내용 너무 김
if (content.length > 2000) {
  throw ChatMessageException.contentTooLong(content.length, 2000, { studyId });
}

// XSS 감지
if (!threats.safe) {
  throw ChatMessageException.xssDetected(threats.threats, { studyId });
}

// 스팸 감지
if (recentMessages >= maxMessages) {
  throw ChatMessageException.spamDetected(recentMessages, timeWindow, context);
}
```

---

## ChatValidationException

입력 검증 관련 예외입니다.

### 주요 메서드

| 메서드 | 설명 |
|--------|------|
| `invalidContent()` | 유효하지 않은 내용 |
| `invalidMessageId(id)` | 유효하지 않은 메시지 ID |
| `invalidLimit(limit)` | 유효하지 않은 limit |
| `invalidCursor(cursor)` | 유효하지 않은 커서 |
| `invalidDateRange()` | 유효하지 않은 날짜 범위 |

---

## ChatPermissionException

권한 관련 예외입니다.

### 주요 메서드

| 메서드 | 설명 |
|--------|------|
| `notMember()` | 멤버가 아님 |
| `cannotEdit()` | 수정 권한 없음 |
| `cannotDelete()` | 삭제 권한 없음 |

---

## ConnectionException

Socket.IO 연결 관련 예외입니다.

### 주요 메서드

| 메서드 | 설명 |
|--------|------|
| `connectionFailed(reason)` | 연결 실패 |
| `disconnected(reason)` | 연결 끊김 |
| `timeout()` | 연결 타임아웃 |
| `reconnectFailed(attempts)` | 재연결 실패 |

---

## FileException

파일 첨부 관련 예외입니다.

### 주요 메서드

| 메서드 | 설명 |
|--------|------|
| `invalidFile(fileId)` | 유효하지 않은 파일 |
| `fileNotFound(fileId)` | 파일 없음 |
| `uploadFailed(reason)` | 업로드 실패 |
| `fileTooLarge(size, max)` | 파일 너무 큼 |
| `invalidFileType(type)` | 유효하지 않은 파일 타입 |

---

## SyncException

실시간 동기화 관련 예외입니다.

### 주요 메서드

| 메서드 | 설명 |
|--------|------|
| `syncFailed(reason)` | 동기화 실패 |
| `outOfSync()` | 동기화 불일치 |
| `conflictDetected()` | 충돌 감지 |

---

## API 에러 처리 패턴

```javascript
try {
  // 비즈니스 로직
} catch (error) {
  const { id: studyId, messageId } = await params;
  logChatError(error, { studyId, messageId, action: 'action_name' });

  // ChatMessageException인 경우
  if (error instanceof ChatMessageException) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.userMessage
        }
      },
      { status: error.statusCode || 500 }
    );
  }

  // 일반 에러
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'ACTION_FAILED',
        message: '작업 중 오류가 발생했습니다'
      }
    },
    { status: 500 }
  );
}
```

---

## 에러 로깅

```javascript
import { logChatError, logChatInfo, logChatWarning } from '@/lib/utils/chat/errorLogger';

// 정보 로그
logChatInfo('Message created', { studyId, messageId, userId });

// 경고 로그
logChatWarning('Unauthorized access attempt', { studyId });

// 에러 로그
logChatError(error, { studyId, action: 'send_message' });
```

---

## 에러 코드 매핑

| 코드 | 클래스 | HTTP | 설명 |
|------|--------|------|------|
| EMPTY_CONTENT | MessageException | 400 | 내용 없음 |
| CONTENT_TOO_LONG | MessageException | 400 | 2000자 초과 |
| XSS_DETECTED | MessageException | 400 | 보안 위협 |
| SPAM_DETECTED | MessageException | 429 | 스팸 감지 |
| MESSAGE_NOT_FOUND | MessageException | 404 | 메시지 없음 |
| UNAUTHORIZED_EDIT | PermissionException | 403 | 수정 권한 없음 |
| UNAUTHORIZED_DELETE | PermissionException | 403 | 삭제 권한 없음 |
| INVALID_LIMIT | ValidationException | 400 | 잘못된 limit |
| INVALID_FILE | FileException | 400 | 잘못된 파일 |
| CONNECTION_FAILED | ConnectionException | 503 | 연결 실패 |

---

## 관련 문서

- [API](./api.md)
- [화면](./screens.md)
- [README](./README.md)

