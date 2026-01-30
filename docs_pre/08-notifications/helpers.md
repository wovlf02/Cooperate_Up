# 🛠️ 알림 헬퍼 함수

## 개요

알림 도메인의 핵심 비즈니스 로직을 담당하는 헬퍼 함수 모음입니다.

**파일 위치**: `src/lib/helpers/notification-helpers.js`

---

## 함수 분류

| 분류 | 함수 개수 | 설명 |
|------|----------|------|
| 응답 포맷팅 | 4개 | 클라이언트 응답 형식 변환 |
| 존재 확인 | 2개 | 알림 존재, 소유권 확인 |
| 읽음 처리 | 2개 | 단일/전체 읽음 |
| 알림 생성 | 2개 | 단일/대량 생성 |
| 알림 삭제 | 2개 | 단일/대량 삭제 |
| 조회 | 2개 | 목록, 미읽 개수 |

---

## 1. 응답 포맷팅

### formatNotificationResponse

알림 정보를 클라이언트 응답 형식으로 변환합니다.

```javascript
function formatNotificationResponse(notification) {
  if (!notification) return null;

  return {
    id: notification.id,
    type: notification.type,
    message: notification.message,
    studyId: notification.studyId,
    studyName: notification.studyName,
    studyEmoji: notification.studyEmoji,
    data: notification.data,
    isRead: notification.isRead,
    createdAt: notification.createdAt
  };
}
```

### formatNotificationsListResponse

알림 배열을 변환합니다.

```javascript
function formatNotificationsListResponse(notifications) {
  if (!notifications || !Array.isArray(notifications)) return [];
  return notifications.map(formatNotificationResponse);
}
```

### createPaginatedResponse

페이지네이션 응답을 생성합니다.

```javascript
function createPaginatedResponse(data, page, limit, total) {
  const totalPages = Math.ceil(total / limit);

  return {
    data: formatNotificationsListResponse(data),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}
```

### createSuccessResponse

성공 응답을 생성합니다.

```javascript
function createSuccessResponse(data, message = '성공') {
  return {
    success: true,
    message,
    ...data
  };
}
```

### createErrorResponse

에러 응답을 생성합니다.

```javascript
function createErrorResponse(error) {
  if (error.code && error.statusCode) {
    return {
      success: false,
      error: error.userMessage || error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }

  return {
    success: false,
    error: error.message || '알 수 없는 오류가 발생했습니다.',
    statusCode: 500
  };
}
```

---

## 2. 존재 확인

### checkNotificationExists

알림 존재 여부를 확인합니다.

```javascript
async function checkNotificationExists(notificationId, prisma)

// 성공: notification 객체 반환
// 실패: NotificationBusinessException.notificationNotFound()
```

### checkNotificationOwnership

알림 소유권을 확인합니다.

```javascript
async function checkNotificationOwnership(notificationId, userId, prisma)

// 성공: notification 객체 반환
// 실패: NotificationPermissionException.notificationNotOwned()
```

---

## 3. 읽음 처리

### markNotificationAsRead

단일 알림을 읽음 처리합니다.

```javascript
async function markNotificationAsRead(notificationId, userId, prisma)

// 멱등성 보장: 이미 읽은 알림은 현재 상태 반환
// 실패: NotificationBusinessException.markAsReadFailed()
```

### markAllNotificationsAsRead

모든 알림을 읽음 처리합니다.

```javascript
async function markAllNotificationsAsRead(userId, prisma)

// 반환: { count: number, success: boolean }
// 실패: NotificationBusinessException.markAllAsReadFailed()
```

---

## 4. 알림 생성

### createNotificationWithException

단일 알림을 생성합니다.

```javascript
async function createNotificationWithException(data, prisma)

// data: { userId, type, message, studyId?, studyName?, studyEmoji?, data? }
// 실패: NotificationBusinessException.creationFailed()
```

**사용 예시**:
```javascript
const notification = await createNotificationWithException({
  userId: 'user-123',
  type: 'JOIN_APPROVED',
  message: '가입이 승인되었습니다.',
  studyId: 'study-456',
  studyName: '알고리즘 스터디',
  studyEmoji: '📚'
}, prisma);
```

### createBulkNotificationsWithException

대량 알림을 생성합니다.

```javascript
async function createBulkNotificationsWithException(userIds, notificationData, prisma)

// 반환: { success: number, failed: number, total: number }
// 실패: NotificationBusinessException.bulkCreationFailed()
```

**사용 예시**:
```javascript
const result = await createBulkNotificationsWithException(
  ['user1', 'user2', 'user3'],
  {
    type: 'NOTICE',
    message: '새 공지가 등록되었습니다.',
    studyId: 'study-456'
  },
  prisma
);
```

---

## 5. 알림 삭제

### deleteNotificationWithException

단일 알림을 삭제합니다.

```javascript
async function deleteNotificationWithException(notificationId, userId, prisma)

// 실패: NotificationBusinessException.deletionFailed()
```

### deleteBulkNotificationsWithException

여러 알림을 삭제합니다.

```javascript
async function deleteBulkNotificationsWithException(notificationIds, userId, prisma)

// 반환: { success: number, failed: number, total: number }
```

---

## 6. 조회

### getUserNotificationsWithException

사용자 알림 목록을 조회합니다.

```javascript
async function getUserNotificationsWithException(userId, params, prisma)

// params: { page, limit, isRead, type }
// 반환: createPaginatedResponse 형식
```

### getUnreadNotificationCount

읽지 않은 알림 수를 조회합니다.

```javascript
async function getUnreadNotificationCount(userId, prisma)

// 반환: number
```

---

## 에러 처리 패턴

```javascript
async function someHelper(params, prisma) {
  try {
    // 비즈니스 로직
  } catch (error) {
    if (error.code?.startsWith('NOTI-')) {
      throw error;
    }
    throw NotificationBusinessException.someError(error.message);
  }
}
```

---

## 관련 문서

- [API](./api.md)
- [예외 클래스](./exceptions.md)
- [컴포넌트](./components.md)

