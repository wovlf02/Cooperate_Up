# 📡 대시보드 API

## 개요

사용자 대시보드 데이터를 제공하는 API입니다.

---

## 엔드포인트 목록

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/dashboard` | 메인 대시보드 데이터 |
| GET | `/api/dashboard/statistics` | 통계 데이터 |
| GET | `/api/dashboard/summary` | 요약 데이터 |
| GET | `/api/dashboard/recent-activities` | 최근 활동 |
| GET | `/api/dashboard/upcoming-schedules` | 다가오는 일정 |
| GET | `/api/dashboard/widgets` | 위젯 데이터 |

---

## GET /api/dashboard

메인 대시보드 데이터를 조회합니다.

### 요청

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| period | string | ❌ | 기간 (week, month, year) |
| startDate | string | ❌ | 시작 날짜 |
| endDate | string | ❌ | 종료 날짜 |

### 응답

```json
{
  "success": true,
  "data": {
    "stats": {
      "activeStudies": 3,
      "pendingTasks": 5,
      "unreadNotifications": 2,
      "completedThisMonth": 12
    },
    "myStudies": [...],
    "recentActivities": [...],
    "upcomingEvents": [...],
    "widgetData": {...}
  },
  "metadata": {
    "duration": 150,
    "timestamp": "2024-12-10T00:00:00.000Z"
  }
}
```

### 처리 흐름

```
1. 세션 검증 (validateSession)
2. 쿼리 파라미터 검증 (validateDashboardQueryParams)
3. 통계 쿼리 (Promise.allSettled - 부분 실패 허용)
   - 활성 스터디 수
   - 할일 수
   - 읽지 않은 알림 수
   - 이번 달 완료 수
4. 추가 데이터 조회
   - 내 스터디 (최대 6개)
   - 최근 활동 (최대 5개)
   - 다가오는 일정 (3일 이내, 최대 3개)
5. 데이터 검증 (validateDashboardData)
6. 응답 반환
   - 부분 실패 시: HTTP 207 Multi-Status
   - 정상: HTTP 200
```

### 통계 쿼리

```javascript
// 활성 스터디 수
await prisma.studyMember.count({
  where: { userId, status: 'ACTIVE' }
});

// 할일 수
await prisma.task.count({
  where: { userId, completed: false }
});

// 읽지 않은 알림 수
await prisma.notification.count({
  where: { userId, isRead: false }
});

// 이번 달 완료 할일 수
await prisma.task.count({
  where: {
    userId,
    completed: true,
    completedAt: {
      gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    }
  }
});
```

### 내 스터디 쿼리

```javascript
await prisma.studyMember.findMany({
  where: { userId, status: 'ACTIVE' },
  take: 6,
  orderBy: { joinedAt: 'desc' },
  include: {
    study: {
      select: {
        id: true,
        name: true,
        emoji: true,
        category: true,
        _count: {
          select: {
            members: { where: { status: 'ACTIVE' } }
          }
        }
      }
    }
  }
});
```

### 다가오는 일정 쿼리

```javascript
await prisma.event.findMany({
  where: {
    study: {
      members: {
        some: { userId, status: 'ACTIVE' }
      }
    },
    date: {
      gte: new Date(),
      lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3일 이내
    }
  },
  take: 3,
  orderBy: { date: 'asc' },
  include: {
    study: {
      select: { name: true, emoji: true }
    }
  }
});
```

---

## 부분 실패 응답

일부 쿼리 실패 시 HTTP 207 Multi-Status로 응답합니다.

```json
{
  "success": true,
  "partial": true,
  "data": {...},
  "failedQueries": ["activeStudies", "pendingTasks"],
  "warnings": [
    {
      "code": "PARTIAL_DATA",
      "message": "일부 데이터를 불러오지 못했습니다"
    }
  ]
}
```

---

## React Query Hook

### useDashboard

```javascript
export function useDashboard(options = {}) {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard'),

    // 실시간 업데이트 설정
    refetchInterval: 30000,              // 30초마다 갱신
    refetchIntervalInBackground: false,  // 백그라운드에서는 갱신 안함
    refetchOnWindowFocus: true,          // 창 포커스 시 갱신
    refetchOnReconnect: true,            // 재연결 시 갱신

    // 캐시 설정
    staleTime: 20000,                    // 20초 동안 신선
    gcTime: 5 * 60 * 1000,               // 5분 동안 캐시 유지

    // 에러 처리
    retry: 3,                            // 3회 재시도
    retryDelay: (attemptIndex) => 
      Math.min(1000 * 2 ** attemptIndex, 30000),

    ...options
  });
}
```

---

## 에러 코드

| HTTP | 코드 | 설명 |
|------|------|------|
| 401 | DASH-001 | 인증 필요 |
| 401 | DASH-002 | 세션 만료 |
| 401 | DASH-003 | 유효하지 않은 세션 |
| 207 | PARTIAL_DATA | 부분 데이터 로드 |
| 500 | DASH-XXX | 서버 에러 |

---

## 관련 문서

- [README](./README.md)
- [화면](./screens.md)
- [위젯](./widgets.md)
- [예외](./exceptions.md)

