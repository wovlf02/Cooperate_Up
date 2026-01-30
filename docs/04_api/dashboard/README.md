# 📊 대시보드 API

> 사용자 대시보드 데이터 조회 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **기본 엔드포인트** | `/api/dashboard` |
| **인증 필요** | ✅ |

---

## 📚 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/dashboard` | GET | 대시보드 메인 데이터 |
| `/api/dashboard/summary` | GET | 요약 통계 |
| `/api/dashboard/statistics` | GET | 상세 통계 |
| `/api/dashboard/recent-activities` | GET | 최근 활동 |
| `/api/dashboard/upcoming-schedules` | GET | 예정 일정 |
| `/api/dashboard/widgets` | GET | 위젯 데이터 |

---

## 📖 대시보드 메인 데이터

### 요청

```http
GET /api/dashboard?period=7d
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `period` | string | 7d | 기간 (7d, 30d, 90d) |
| `startDate` | string | - | 시작일 (ISO 8601) |
| `endDate` | string | - | 종료일 (ISO 8601) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "statistics": {
      "activeStudies": 5,
      "pendingTasks": 12,
      "unreadNotifications": 3,
      "completedTasks": 45
    },
    "recentStudies": [
      {
        "id": "study-uuid",
        "name": "React 스터디",
        "emoji": "⚛️",
        "lastActivity": "2026-01-30T10:00:00.000Z",
        "newMessages": 5
      }
    ],
    "upcomingTasks": [
      {
        "id": "task-uuid",
        "title": "React 공부하기",
        "dueDate": "2026-02-01T23:59:59.000Z",
        "priority": "HIGH",
        "study": {
          "name": "React 스터디",
          "emoji": "⚛️"
        }
      }
    ],
    "upcomingEvents": [
      {
        "id": "event-uuid",
        "title": "스터디 정기 모임",
        "startTime": "2026-02-01T19:00:00.000Z",
        "endTime": "2026-02-01T21:00:00.000Z",
        "study": {
          "name": "React 스터디",
          "emoji": "⚛️"
        }
      }
    ],
    "recentNotifications": [
      {
        "id": "notification-uuid",
        "type": "TASK_DUE_SOON",
        "message": "마감이 임박한 할 일이 있습니다",
        "isRead": false,
        "createdAt": "2026-01-30T09:00:00.000Z"
      }
    ]
  },
  "meta": {
    "duration": 120,
    "timestamp": "2026-01-30T10:00:00.000Z"
  }
}
```

---

## 📊 통계 카드 필드

| 필드 | 설명 |
|------|------|
| `activeStudies` | 활성 스터디 수 (ACTIVE 상태인 멤버십) |
| `pendingTasks` | 미완료 할 일 수 |
| `unreadNotifications` | 읽지 않은 알림 수 |
| `completedTasks` | 완료한 할 일 수 |

---

## 📊 요약 통계

### 요청

```http
GET /api/dashboard/summary
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "studies": {
      "total": 5,
      "asOwner": 2,
      "asAdmin": 1,
      "asMember": 2
    },
    "tasks": {
      "total": 50,
      "pending": 12,
      "completed": 38,
      "overdue": 2
    },
    "activity": {
      "messagesSent": 150,
      "eventsAttended": 10,
      "filesUploaded": 25
    }
  }
}
```

---

## 📜 최근 활동

### 요청

```http
GET /api/dashboard/recent-activities?limit=10
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `limit` | number | 10 | 조회할 활동 수 |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "activity-uuid",
      "type": "MESSAGE_SENT",
      "description": "React 스터디에서 메시지를 보냈습니다",
      "studyId": "study-uuid",
      "studyName": "React 스터디",
      "studyEmoji": "⚛️",
      "createdAt": "2026-01-30T09:30:00.000Z"
    },
    {
      "id": "activity-uuid-2",
      "type": "TASK_COMPLETED",
      "description": "할 일을 완료했습니다: React 공부하기",
      "createdAt": "2026-01-30T08:00:00.000Z"
    }
  ]
}
```

---

## 📅 예정 일정

### 요청

```http
GET /api/dashboard/upcoming-schedules?limit=5
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "event-uuid",
      "title": "스터디 정기 모임",
      "startTime": "2026-02-01T19:00:00.000Z",
      "endTime": "2026-02-01T21:00:00.000Z",
      "isAllDay": false,
      "study": {
        "id": "study-uuid",
        "name": "React 스터디",
        "emoji": "⚛️"
      }
    }
  ]
}
```

---

## 🔄 부분 실패 처리

대시보드 API는 부분 실패를 허용합니다. 일부 데이터 로드에 실패해도 성공한 데이터는 반환됩니다.

```json
{
  "success": true,
  "data": {
    "statistics": { ... },
    "recentStudies": null,
    "upcomingTasks": [ ... ]
  },
  "warnings": [
    "최근 스터디 데이터를 불러오는 데 실패했습니다"
  ]
}
```

---

## 🔗 관련 문서

- [대시보드 페이지](../../05_pages/dashboard/README.md)
- [대시보드 컴포넌트](../../06_components/dashboard/README.md)
