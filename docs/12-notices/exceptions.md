# ⚠️ 공지사항 예외 클래스

## 개요

공지사항 관련 예외 처리를 위한 클래스입니다.

**파일 위치**: `src/lib/exceptions/study/StudyException.js`

---

## StudyNoticeException

`StudyException`을 상속받은 공지사항 전용 예외 클래스입니다.

```javascript
export class StudyNoticeException extends StudyException {
  constructor(code, message, options = {}) {
    super(code, message, {
      ...options,
      category: 'notice',
    });
    this.name = 'StudyNoticeException';
  }
}
```

---

## 예외 목록

| 코드 | 메서드 | HTTP | 설명 |
|------|--------|------|------|
| STUDY-116 | titleRequired | 400 | 제목 필수 |
| STUDY-117 | titleTooLong | 400 | 제목 길이 초과 |
| STUDY-118 | contentRequired | 400 | 내용 필수 |
| STUDY-119 | noticeNotFound | 404 | 공지 없음 |
| STUDY-120 | noticeAccessDenied | 403 | 수정/삭제 권한 없음 |
| STUDY-121 | pinnedNoticeLimitExceeded | 400 | 고정 공지 제한 초과 |

---

## 상세 설명

### STUDY-116: 제목 필수

```javascript
StudyNoticeException.titleRequired = function(context = {}) {
  return new StudyNoticeException(
    'STUDY-116',
    '공지사항 제목이 필요합니다',
    {
      userMessage: '공지사항 제목을 입력해주세요',
      devMessage: 'Notice title is required',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
    }
  );
};
```

### STUDY-117: 제목 길이 초과

```javascript
StudyNoticeException.titleTooLong = function(length, maxLength = 100, context = {}) {
  return new StudyNoticeException(
    'STUDY-117',
    '공지사항 제목이 너무 깁니다',
    {
      userMessage: `공지사항 제목은 최대 ${maxLength}자까지 입력할 수 있습니다`,
      devMessage: `Notice title too long: ${length} > ${maxLength}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { length, maxLength, ...context },
    }
  );
};
```

### STUDY-118: 내용 필수

```javascript
StudyNoticeException.contentRequired = function(context = {}) {
  return new StudyNoticeException(
    'STUDY-118',
    '공지사항 내용이 필요합니다',
    {
      userMessage: '공지사항 내용을 입력해주세요',
      devMessage: 'Notice content is required',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
    }
  );
};
```

### STUDY-119: 공지 없음

```javascript
StudyNoticeException.noticeNotFound = function(noticeId, context = {}) {
  return new StudyNoticeException(
    'STUDY-119',
    '공지사항을 찾을 수 없습니다',
    {
      userMessage: '존재하지 않는 공지사항입니다',
      devMessage: `Notice ${noticeId} not found`,
      statusCode: 404,
      retryable: false,
      severity: 'medium',
      context: { noticeId, ...context },
    }
  );
};
```

### STUDY-120: 수정/삭제 권한 없음

```javascript
StudyNoticeException.noticeAccessDenied = function(userId, noticeId, context = {}) {
  return new StudyNoticeException(
    'STUDY-120',
    '공지사항을 수정할 권한이 없습니다',
    {
      userMessage: '작성자 또는 리더만 공지사항을 수정할 수 있습니다',
      devMessage: `User ${userId} cannot access notice ${noticeId}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, noticeId, ...context },
    }
  );
};
```

### STUDY-121: 고정 공지 제한 초과

```javascript
StudyNoticeException.pinnedNoticeLimitExceeded = function(currentCount, maxCount = 5, context = {}) {
  return new StudyNoticeException(
    'STUDY-121',
    '고정 공지사항 개수를 초과했습니다',
    {
      userMessage: `최대 ${maxCount}개의 공지사항만 고정할 수 있습니다`,
      devMessage: `Pinned notice limit exceeded: ${currentCount}/${maxCount}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { currentCount, maxCount, ...context },
    }
  );
};
```

---

## 사용 예시

### 공지사항 생성

```javascript
import { StudyNoticeException } from '@/lib/exceptions/study';

// 제목 검증
if (!title || !title.trim()) {
  throw StudyNoticeException.titleRequired({ studyId });
}

if (title.length < 2 || title.length > 100) {
  throw StudyNoticeException.titleTooLong(title.length, 100);
}

// 내용 검증
if (!content || !content.trim()) {
  throw StudyNoticeException.contentRequired({ studyId });
}

if (content.length > 10000) {
  throw StudyNoticeException.contentRequired({
    studyId,
    userMessage: '공지사항 내용은 10000자 이하로 입력해주세요'
  });
}

// 고정 공지 개수 확인
if (isPinned) {
  const pinnedCount = await prisma.notice.count({
    where: { studyId, isPinned: true }
  });

  if (pinnedCount >= 3) {
    throw StudyNoticeException.pinnedNoticeLimitExceeded(pinnedCount, 3, { studyId });
  }
}
```

### 공지사항 수정/삭제

```javascript
// 공지 존재 확인
if (!notice) {
  throw StudyNoticeException.noticeNotFound(noticeId, { studyId });
}

// 권한 확인
if (notice.authorId !== session.user.id && member.role === 'MEMBER') {
  throw StudyNoticeException.noticeAccessDenied(session.user.id, noticeId, {
    action: 'update_notice'
  });
}
```

---

## 보안 위협 처리

```javascript
import { validateSecurityThreats, logSecurityEvent } from "@/lib/utils/xss-sanitizer";

// 제목 보안 검증
const titleThreats = validateSecurityThreats(title);
if (!titleThreats.safe) {
  logSecurityEvent('XSS_ATTEMPT_DETECTED', {
    userId: session.user.id,
    studyId,
    field: 'notice_title',
    threats: titleThreats.threats,
  });
  throw StudyNoticeException.titleRequired({
    userMessage: '제목에 허용되지 않는 콘텐츠가 포함되어 있습니다'
  });
}

// 내용 보안 검증
const contentThreats = validateSecurityThreats(content);
if (!contentThreats.safe) {
  logSecurityEvent('XSS_ATTEMPT_DETECTED', {
    userId: session.user.id,
    studyId,
    field: 'notice_content',
    threats: contentThreats.threats,
  });
  throw StudyNoticeException.contentRequired({
    userMessage: '내용에 허용되지 않는 콘텐츠가 포함되어 있습니다'
  });
}
```

---

## 에러 응답 형식

```json
{
  "success": false,
  "error": {
    "code": "STUDY-121",
    "message": "고정 공지사항 개수를 초과했습니다",
    "userMessage": "최대 3개의 공지사항만 고정할 수 있습니다",
    "context": {
      "currentCount": 3,
      "maxCount": 3,
      "studyId": "study_123"
    }
  }
}
```

---

## 관련 문서

- [README](./README.md)
- [API](./api.md)
- [화면](./screens.md)

