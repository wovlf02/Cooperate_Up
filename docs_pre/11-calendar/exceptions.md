# ⚠️ 캘린더 예외 클래스

## 개요

캘린더 일정 관련 예외 처리입니다.

**파일 위치**: `src/lib/exceptions/study/StudyException.js`

---

## 예외 클래스

일정 관련 예외는 `StudyFeatureException`을 사용합니다.

---

## 예외 목록

| 코드 | 메서드 | HTTP | 설명 |
|------|--------|------|------|
| STUDY-109 | eventTitleMissing | 400 | 일정 제목 없음 |
| STUDY-110 | eventStartTimeInPast | 400 | 과거 날짜 일정 |
| STUDY-111 | eventEndTimeBeforeStartTime | 400 | 종료가 시작 이전 |
| STUDY-112 | eventDescriptionTooLong | 400 | 설명 길이 초과 |
| STUDY-113 | eventTimeConflict | 409 | 일정 시간 충돌 |
| STUDY-114 | eventNotFound | 404 | 일정 없음 |
| STUDY-115 | eventAttendeeLimitExceeded | 400 | 참석 인원 초과 |

---

## 상세 설명

### STUDY-109: 일정 제목 없음

```javascript
StudyFeatureException.eventTitleMissing = function(context = {}) {
  return new StudyFeatureException(
    'STUDY-109',
    '일정 제목이 필요합니다',
    {
      userMessage: '일정 제목을 입력해주세요',
      devMessage: 'Event title is required',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
    }
  );
};
```

### STUDY-110: 과거 날짜 일정

```javascript
StudyFeatureException.eventStartTimeInPast = function(startTime, context = {}) {
  return new StudyFeatureException(
    'STUDY-110',
    '과거 날짜에 일정을 생성할 수 없습니다',
    {
      userMessage: '일정은 오늘 이후 날짜만 선택할 수 있습니다',
      devMessage: `Event start time ${startTime} is in the past`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { startTime, ...context },
    }
  );
};
```

### STUDY-111: 종료가 시작 이전

```javascript
StudyFeatureException.eventEndTimeBeforeStartTime = function(startTime, endTime, context = {}) {
  return new StudyFeatureException(
    'STUDY-111',
    '종료 시간이 시작 시간보다 빠릅니다',
    {
      userMessage: '종료 시간은 시작 시간 이후여야 합니다',
      devMessage: `Event end time ${endTime} is before start time ${startTime}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { startTime, endTime, ...context },
    }
  );
};
```

### STUDY-112: 설명 길이 초과

```javascript
StudyFeatureException.eventDescriptionTooLong = function(description, maxLength = 1000, context = {}) {
  return new StudyFeatureException(
    'STUDY-112',
    '일정 설명이 너무 깁니다',
    {
      userMessage: `일정 설명은 최대 ${maxLength}자까지 입력할 수 있습니다`,
      devMessage: `Event description too long: ${description?.length} > ${maxLength}`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { length: description?.length, maxLength, ...context },
    }
  );
};
```

### STUDY-113: 일정 시간 충돌

```javascript
StudyFeatureException.eventTimeConflict = function(startTime, endTime, conflictingEventId, context = {}) {
  return new StudyFeatureException(
    'STUDY-113',
    '같은 시간에 다른 일정이 있습니다',
    {
      userMessage: '해당 시간에 이미 다른 일정이 있습니다',
      devMessage: `Event time conflict: ${startTime}-${endTime} conflicts with event ${conflictingEventId}`,
      statusCode: 409,
      retryable: false,
      severity: 'medium',
      context: { startTime, endTime, conflictingEventId, ...context },
    }
  );
};
```

### STUDY-114: 일정 없음

```javascript
StudyFeatureException.eventNotFound = function(eventId, context = {}) {
  return new StudyFeatureException(
    'STUDY-114',
    '일정을 찾을 수 없습니다',
    {
      userMessage: '존재하지 않는 일정입니다',
      devMessage: `Event ${eventId} not found`,
      statusCode: 404,
      retryable: false,
      severity: 'medium',
      context: { eventId, ...context },
    }
  );
};
```

### STUDY-115: 참석 인원 초과

```javascript
StudyFeatureException.eventAttendeeLimitExceeded = function(eventId, currentAttendees, maxAttendees, context = {}) {
  return new StudyFeatureException(
    'STUDY-115',
    '일정 참석 인원이 초과되었습니다',
    {
      userMessage: `이 일정은 최대 ${maxAttendees}명까지 참석할 수 있습니다`,
      devMessage: `Event ${eventId} attendee limit exceeded: ${currentAttendees}/${maxAttendees}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { eventId, currentAttendees, maxAttendees, ...context },
    }
  );
};
```

---

## 검증 예외

검증 관련 예외는 `StudyValidationException`을 사용합니다.

### 날짜/시간 형식 오류

```javascript
StudyValidationException.invalidSearchQueryFormat('Invalid date format', { 
  studyId, 
  date 
});

StudyValidationException.invalidSearchQueryFormat('Invalid time format (use HH:MM)', {
  studyId,
  startTime,
  endTime
});

StudyValidationException.invalidSearchQueryFormat('Invalid month format (use YYYY-MM)', { 
  studyId 
});

StudyValidationException.invalidSearchQueryFormat('Invalid color format (use #RRGGBB)', {
  studyId,
  color
});
```

---

## 권한 예외

권한 관련 예외는 `StudyPermissionException`을 사용합니다.

### 일정 생성 권한 없음

```javascript
StudyPermissionException.cannotCreateEvent(userId, 'ADMIN', { studyId });
```

### 일정 수정/삭제 권한 없음

```javascript
StudyPermissionException.cannotModifyStudy(userId, 'ADMIN_OR_CREATOR', { 
  studyId, 
  eventId 
});
```

---

## 사용 예시

### 일정 생성

```javascript
import { 
  StudyFeatureException, 
  StudyValidationException,
  StudyPermissionException 
} from '@/lib/exceptions/study';

// 권한 확인
if (!['OWNER', 'ADMIN'].includes(member.role)) {
  throw StudyPermissionException.cannotCreateEvent(session.user.id, 'ADMIN', { studyId });
}

// 제목 검증
if (!title || !title.trim()) {
  throw StudyFeatureException.eventTitleMissing({ studyId });
}

// 날짜 형식 검증
const dateObj = new Date(date);
if (isNaN(dateObj.getTime())) {
  throw StudyValidationException.invalidSearchQueryFormat('Invalid date format', { studyId, date });
}

// 과거 날짜 검증
if (eventDate < today) {
  throw StudyFeatureException.eventStartTimeInPast(date, { studyId });
}

// 시간 형식 검증
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
  throw StudyValidationException.invalidSearchQueryFormat('Invalid time format', { studyId });
}

// 종료 > 시작 검증
if (startMinutes >= endMinutes) {
  throw StudyFeatureException.eventEndTimeBeforeStartTime(startTime, endTime, { studyId });
}
```

### 일정 수정

```javascript
// 일정 존재 확인
if (!event) {
  throw StudyFeatureException.eventNotFound(eventId, { studyId });
}

// 수정 권한 확인
const canEdit = event.createdById === session.user.id || 
                ['OWNER', 'ADMIN'].includes(member.role);

if (!canEdit) {
  throw StudyPermissionException.cannotModifyStudy(session.user.id, 'ADMIN_OR_CREATOR', { 
    studyId, 
    eventId 
  });
}
```

---

## 에러 응답 형식

```json
{
  "success": false,
  "error": {
    "code": "STUDY-110",
    "message": "과거 날짜에 일정을 생성할 수 없습니다",
    "userMessage": "일정은 오늘 이후 날짜만 선택할 수 있습니다",
    "context": {
      "startTime": "2024-12-01",
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

