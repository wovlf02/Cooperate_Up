# 📡 캘린더 API

## 개요

스터디 일정 관리를 위한 REST API입니다.

---

## 엔드포인트 목록

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/studies/[id]/calendar` | 일정 목록 조회 | MEMBER |
| POST | `/api/studies/[id]/calendar` | 일정 생성 | ADMIN+ |
| GET | `/api/studies/[id]/calendar/[eventId]` | 일정 상세 조회 | MEMBER |
| PATCH | `/api/studies/[id]/calendar/[eventId]` | 일정 수정 | 작성자/ADMIN+ |
| DELETE | `/api/studies/[id]/calendar/[eventId]` | 일정 삭제 | 작성자/ADMIN+ |

---

## GET /api/studies/[id]/calendar

일정 목록을 조회합니다.

### 요청

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| startDate | string | ❌ | 시작 날짜 (ISO 형식) |
| endDate | string | ❌ | 종료 날짜 (ISO 형식) |
| month | string | ❌ | 월 조회 (YYYY-MM 형식) |

> `startDate/endDate` 또는 `month` 중 하나 사용

### 응답

```json
{
  "success": true,
  "data": [
    {
      "id": "event_123",
      "title": "스터디 모임",
      "date": "2024-12-15T00:00:00.000Z",
      "startTime": "14:00",
      "endTime": "16:00",
      "location": "서울 강남역 카페",
      "color": "#6366F1",
      "createdAt": "2024-12-01T00:00:00.000Z",
      "createdBy": {
        "id": "user_123",
        "name": "홍길동",
        "avatar": "/avatars/user_123.jpg"
      }
    }
  ]
}
```

### 처리 흐름

```
1. 멤버 권한 확인 (requireStudyMember)
2. 쿼리 파라미터 파싱
3. 날짜 범위 검증
   - startDate/endDate 또는 month 처리
4. 일정 목록 조회 (날짜 오름차순)
5. 로깅 (StudyLogger.logEventList)
6. 응답 반환
```

---

## POST /api/studies/[id]/calendar

일정을 생성합니다.

### 요청

```json
{
  "title": "스터디 모임",
  "date": "2024-12-15",
  "startTime": "14:00",
  "endTime": "16:00",
  "location": "서울 강남역 카페",
  "color": "#6366F1"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | string | ✅ | 일정 제목 (2-100자) |
| date | string | ✅ | 날짜 (YYYY-MM-DD) |
| startTime | string | ✅ | 시작 시간 (HH:MM) |
| endTime | string | ✅ | 종료 시간 (HH:MM) |
| location | string | ❌ | 장소 (최대 200자) |
| color | string | ❌ | 색상 (#RRGGBB, 기본: #6366F1) |

### 응답

```json
{
  "success": true,
  "data": {
    "id": "event_456",
    "title": "스터디 모임",
    "date": "2024-12-15T00:00:00.000Z",
    "startTime": "14:00",
    "endTime": "16:00",
    "location": "서울 강남역 카페",
    "color": "#6366F1",
    "warning": "같은 시간대에 다른 일정이 있습니다: 기존 일정",
    "createdBy": {
      "id": "user_123",
      "name": "홍길동"
    }
  },
  "message": "일정이 생성되었습니다"
}
```

### 처리 흐름

```
1. 멤버 권한 확인 (requireStudyMember)
2. ADMIN 이상 권한 확인
3. 입력 검증
   - 제목: 2-100자
   - 날짜: 오늘 이후
   - 시간: HH:MM 형식
   - 종료 > 시작
   - 위치: 최대 200자
   - 색상: #RRGGBB 형식
4. 일정 중복 확인 (경고만, 에러 아님)
5. 일정 생성
6. 멤버들에게 알림 전송
7. 로깅 (StudyLogger.logEventCreate)
8. 응답 반환
```

### 검증 규칙

**제목**
```javascript
if (title.length < 2 || title.length > 100) {
  throw StudyFeatureException.invalidNoticeTitleLength(title, { min: 2, max: 100 });
}
```

**날짜 (오늘 이후)**
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

if (eventDate < today) {
  throw StudyFeatureException.eventStartTimeInPast(date);
}
```

**시간 형식**
```javascript
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
  throw StudyValidationException.invalidSearchQueryFormat('Invalid time format');
}
```

**종료 > 시작**
```javascript
if (startMinutes >= endMinutes) {
  throw StudyFeatureException.eventEndTimeBeforeStartTime(startTime, endTime);
}
```

---

## GET /api/studies/[id]/calendar/[eventId]

일정 상세 정보를 조회합니다.

### 응답

```json
{
  "success": true,
  "data": {
    "id": "event_123",
    "title": "스터디 모임",
    "date": "2024-12-15T00:00:00.000Z",
    "startTime": "14:00",
    "endTime": "16:00",
    "location": "서울 강남역 카페",
    "description": "정기 모임입니다.",
    "color": "#6366F1",
    "createdAt": "2024-12-01T00:00:00.000Z",
    "updatedAt": "2024-12-10T00:00:00.000Z",
    "createdBy": {
      "id": "user_123",
      "name": "홍길동",
      "avatar": "/avatars/user_123.jpg"
    }
  }
}
```

---

## PATCH /api/studies/[id]/calendar/[eventId]

일정을 수정합니다.

### 요청

```json
{
  "title": "수정된 스터디 모임",
  "date": "2024-12-16",
  "startTime": "15:00",
  "endTime": "17:00",
  "location": "서울 홍대 카페",
  "description": "장소가 변경되었습니다.",
  "color": "#EF4444"
}
```

> 모든 필드 선택적

### 응답

```json
{
  "success": true,
  "data": {
    "id": "event_123",
    "title": "수정된 스터디 모임",
    "date": "2024-12-16T00:00:00.000Z",
    "startTime": "15:00",
    "endTime": "17:00",
    "location": "서울 홍대 카페",
    "description": "장소가 변경되었습니다.",
    "color": "#EF4444",
    "createdBy": {...}
  },
  "message": "일정이 수정되었습니다"
}
```

### 처리 흐름

```
1. 멤버 권한 확인 (requireStudyMember)
2. 일정 존재 확인
3. 스터디 일치 확인
4. 입력 검증 (제공된 필드만)
5. 수정 권한 확인 (작성자 또는 ADMIN/OWNER)
6. 일정 수정
7. 로깅 (StudyLogger.logEventUpdate)
8. 응답 반환
```

---

## DELETE /api/studies/[id]/calendar/[eventId]

일정을 삭제합니다.

### 응답

```json
{
  "success": true,
  "data": null,
  "message": "일정이 삭제되었습니다"
}
```

### 처리 흐름

```
1. 멤버 권한 확인 (requireStudyMember)
2. 일정 존재 확인
3. 스터디 일치 확인
4. 삭제 권한 확인 (작성자 또는 ADMIN/OWNER)
5. 일정 삭제
6. 로깅 (StudyLogger.logEventDelete)
7. 응답 반환
```

---

## React Query Hooks

### useEvents

```javascript
export function useEvents(studyId, params = {}) {
  return useQuery({
    queryKey: ['studies', studyId, 'calendar', params],
    queryFn: () => api.get(`/api/studies/${studyId}/calendar`, params),
    enabled: !!studyId,
  });
}
```

### useCreateEvent

```javascript
export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studyId, data }) => 
      api.post(`/api/studies/${studyId}/calendar`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'calendar']);
    },
  });
}
```

### useUpdateEvent

```javascript
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studyId, eventId, data }) => 
      api.patch(`/api/studies/${studyId}/calendar/${eventId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'calendar']);
    },
  });
}
```

### useDeleteEvent

```javascript
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studyId, eventId }) => 
      api.delete(`/api/studies/${studyId}/calendar/${eventId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['studies', variables.studyId, 'calendar']);
    },
  });
}
```

---

## 에러 코드

| HTTP | 코드 | 설명 |
|------|------|------|
| 400 | INVALID_DATE_FORMAT | 잘못된 날짜 형식 |
| 400 | INVALID_TIME_FORMAT | 잘못된 시간 형식 |
| 400 | EVENT_TITLE_MISSING | 일정 제목 없음 |
| 400 | INVALID_TITLE_LENGTH | 제목 길이 초과 |
| 400 | EVENT_END_BEFORE_START | 종료 시간이 시작 시간 이전 |
| 400 | EVENT_START_IN_PAST | 과거 날짜 일정 |
| 403 | CANNOT_CREATE_EVENT | 생성 권한 없음 |
| 403 | CANNOT_MODIFY_STUDY | 수정/삭제 권한 없음 |
| 404 | EVENT_NOT_FOUND | 일정 없음 |

---

## 관련 문서

- [README](./README.md)
- [화면](./screens.md)
- [예외](./exceptions.md)

