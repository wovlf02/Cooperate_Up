# 알림 API (Notification API) - 설계

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/notifications`
> **상태**: 설계 단계 (미구현)

## 개요

푸시 알림 관리 API입니다. 현재 구현되어 있지 않으며, 프론트엔드 요구사항에 따라 구현이 필요합니다.

---

## API 목록 (설계)

| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|:----:|
| GET | `/notifications` | 알림 목록 조회 | ✅ |
| POST | `/notifications/{id}/read` | 알림 읽음 처리 | ✅ |
| POST | `/notifications/read-all` | 전체 읽음 처리 | ✅ |
| DELETE | `/notifications/{id}` | 알림 삭제 | ✅ |
| GET | `/notifications/unread-count` | 읽지 않은 알림 수 | ✅ |
| PUT | `/notifications/settings` | 알림 설정 수정 | ✅ |
| GET | `/notifications/settings` | 알림 설정 조회 | ✅ |

---

## 1. 알림 목록 조회

사용자의 알림 목록을 조회합니다.

### Request (설계)

```http
GET /notifications?page=0&size=20&sort=createdAt,desc
Authorization: Bearer {accessToken}
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| page | int | ❌ | 페이지 번호 |
| size | int | ❌ | 페이지 크기 (기본값: 20) |
| sort | string | ❌ | 정렬 |

### Response (설계)

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "type": "APPROVAL_REQUEST",
        "title": "수동 출퇴근 요청",
        "body": "박직원님이 12월 25일 수동 출퇴근 입력을 요청했습니다.",
        "data": {
          "requestId": 10,
          "workplaceId": 1
        },
        "isRead": false,
        "createdAt": "2024-12-27T10:00:00"
      },
      {
        "id": 2,
        "type": "ANNOUNCEMENT",
        "title": "새 공지사항",
        "body": "12월 급여일 안내 공지가 등록되었습니다.",
        "data": {
          "announcementId": 5,
          "workplaceId": 1
        },
        "isRead": true,
        "createdAt": "2024-12-27T09:00:00"
      },
      {
        "id": 3,
        "type": "CHAT_MESSAGE",
        "title": "새 메시지",
        "body": "이사업: 내일 오전 미팅 가능하신가요?",
        "data": {
          "roomId": 2,
          "messageId": 100
        },
        "isRead": false,
        "createdAt": "2024-12-27T08:30:00"
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "size": 20,
    "number": 0,
    "first": true,
    "last": false,
    "empty": false
  },
  "timestamp": "2024-12-27T11:00:00"
}
```

---

## 2. 알림 읽음 처리

알림을 읽음 처리합니다.

### Request (설계)

```http
POST /notifications/{id}/read
Authorization: Bearer {accessToken}
```

### Response (설계)

```json
{
  "success": true,
  "message": "읽음 처리되었습니다",
  "timestamp": "2024-12-27T11:00:00"
}
```

---

## 3. 전체 읽음 처리

모든 알림을 읽음 처리합니다.

### Request (설계)

```http
POST /notifications/read-all
Authorization: Bearer {accessToken}
```

### Response (설계)

```json
{
  "success": true,
  "message": "모든 알림이 읽음 처리되었습니다",
  "timestamp": "2024-12-27T11:00:00"
}
```

---

## 4. 알림 삭제

알림을 삭제합니다.

### Request (설계)

```http
DELETE /notifications/{id}
Authorization: Bearer {accessToken}
```

### Response (설계)

```json
{
  "success": true,
  "message": "알림이 삭제되었습니다",
  "timestamp": "2024-12-27T11:00:00"
}
```

---

## 5. 읽지 않은 알림 수

읽지 않은 알림 수를 조회합니다.

### Request (설계)

```http
GET /notifications/unread-count
Authorization: Bearer {accessToken}
```

### Response (설계)

```json
{
  "success": true,
  "data": 5,
  "timestamp": "2024-12-27T11:00:00"
}
```

---

## 6. 알림 설정 조회

사용자의 알림 설정을 조회합니다.

### Request (설계)

```http
GET /notifications/settings
Authorization: Bearer {accessToken}
```

### Response (설계)

```json
{
  "success": true,
  "data": {
    "pushEnabled": true,
    "attendanceNotification": true,
    "approvalNotification": true,
    "announcementNotification": true,
    "chatNotification": true,
    "payrollNotification": true,
    "contractNotification": true,
    "quietHoursEnabled": false,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00"
  },
  "timestamp": "2024-12-27T11:00:00"
}
```

---

## 7. 알림 설정 수정

사용자의 알림 설정을 수정합니다.

### Request (설계)

```http
PUT /notifications/settings
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body (설계)

```json
{
  "pushEnabled": true,
  "attendanceNotification": true,
  "approvalNotification": true,
  "announcementNotification": true,
  "chatNotification": false,
  "payrollNotification": true,
  "contractNotification": true,
  "quietHoursEnabled": true,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00"
}
```

### Response (설계)

```json
{
  "success": true,
  "message": "알림 설정이 저장되었습니다",
  "timestamp": "2024-12-27T11:00:00"
}
```

---

## 타입 정의 (설계)

### NotificationResponse

```typescript
interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

type NotificationType =
  | 'ATTENDANCE'
  | 'APPROVAL_REQUEST'
  | 'APPROVAL_RESULT'
  | 'ANNOUNCEMENT'
  | 'CHAT_MESSAGE'
  | 'INVITATION'
  | 'PAYROLL'
  | 'CONTRACT'
  | 'CHECKLIST';
```

### NotificationSettingsResponse

```typescript
interface NotificationSettingsResponse {
  pushEnabled: boolean;
  attendanceNotification: boolean;
  approvalNotification: boolean;
  announcementNotification: boolean;
  chatNotification: boolean;
  payrollNotification: boolean;
  contractNotification: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}
```

---

## 알림 유형

| 유형 | 설명 | 수신자 |
|------|------|--------|
| ATTENDANCE | 출퇴근 알림 | 본인 |
| APPROVAL_REQUEST | 승인 요청 알림 | 사업주 |
| APPROVAL_RESULT | 승인/거부 결과 | 요청자 |
| ANNOUNCEMENT | 새 공지사항 | 사업장 멤버 |
| CHAT_MESSAGE | 새 채팅 메시지 | 채팅방 멤버 |
| INVITATION | 사업장 초대 | 초대받은 사용자 |
| PAYROLL | 급여 확정/지급 | 직원 |
| CONTRACT | 계약서 발송/서명 | 관련 사용자 |
| CHECKLIST | 체크리스트 알림 | 직원 |

---

## FCM 토큰 관리 (설계)

### FCM 토큰 등록

```http
PUT /users/me/fcm-token
Authorization: Bearer {accessToken}

Request Body:
{
  "fcmToken": "fcm-token-here",
  "deviceType": "ANDROID" // ANDROID | IOS
}

Response:
{
  "success": true,
  "message": "FCM 토큰이 등록되었습니다"
}
```

### FCM 토큰 삭제 (로그아웃 시)

```http
DELETE /users/me/fcm-token
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "FCM 토큰이 삭제되었습니다"
}
```

---

## 푸시 알림 페이로드 구조 (설계)

```json
{
  "notification": {
    "title": "새 공지사항",
    "body": "12월 급여일 안내 공지가 등록되었습니다."
  },
  "data": {
    "type": "ANNOUNCEMENT",
    "announcementId": "5",
    "workplaceId": "1",
    "click_action": "OPEN_ANNOUNCEMENT"
  }
}
```

---

## 구현 우선순위

1. **필수 구현**
   - 알림 목록 조회
   - 읽지 않은 알림 수
   - 알림 읽음 처리
   - FCM 토큰 등록

2. **권장 구현**
   - 알림 설정 조회/수정
   - 전체 읽음 처리
   - 알림 삭제

3. **선택 구현**
   - 방해 금지 모드
   - 알림 유형별 필터링

---

## 관련 문서

- [공통 규격](./00-common.md)
- [사용자 API](./02-user.md) - FCM 토큰 관리
- [화면 설계 - 설정](../05_screens/08_settings/README.md)
- [AWS Push Notification](../10_aws/07-push-notification.md)

