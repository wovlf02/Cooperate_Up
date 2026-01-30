# 관리자 - 분석 API

> 상세 분석 데이터 및 통계 조회 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **기본 엔드포인트** | `/api/admin/analytics` |
| **필요 권한** | `ANALYTICS_VIEW` |

---

## 📚 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/admin/analytics/overview` | GET | 전체 통계 개요 |
| `/api/admin/analytics/users` | GET | 사용자 분석 |
| `/api/admin/analytics/studies` | GET | 스터디 분석 |

---

## 📊 전체 통계 개요

### 요청

```http
GET /api/admin/analytics/overview
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "active": 1180,
      "suspended": 25
    },
    "studies": {
      "total": 340,
      "public": 280,
      "recruiting": 150
    },
    "reports": {
      "total": 150,
      "pending": 12,
      "inProgress": 5,
      "resolved": 133
    },
    "trends": {
      "dailySignups": [
        { "date": "2026-01-01", "count": 15 },
        { "date": "2026-01-02", "count": 18 },
        ...
      ],
      "dailyStudies": [
        { "date": "2026-01-01", "count": 5 },
        { "date": "2026-01-02", "count": 8 },
        ...
      ],
      "dailyReports": [
        { "date": "2026-01-01", "count": 2 },
        { "date": "2026-01-02", "count": 1 },
        ...
      ]
    }
  }
}
```

---

## 👥 사용자 분석

### 요청

```http
GET /api/admin/analytics/users?period=30d
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `period` | string | 30d | 기간 (7d, 30d, 90d, 1y) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 1250,
      "newInPeriod": 150,
      "growthRate": 12.5,
      "activeRate": 85.2
    },
    "byStatus": {
      "ACTIVE": 1180,
      "SUSPENDED": 25,
      "DELETED": 45
    },
    "byProvider": {
      "CREDENTIALS": 950,
      "GOOGLE": 250,
      "GITHUB": 50
    },
    "signupTrend": [
      { "date": "2026-01-01", "count": 15 },
      { "date": "2026-01-02", "count": 18 },
      ...
    ],
    "loginTrend": [
      { "date": "2026-01-01", "count": 450 },
      { "date": "2026-01-02", "count": 480 },
      ...
    ],
    "retention": {
      "day1": 85.5,
      "day7": 65.3,
      "day30": 45.2
    },
    "topActiveUsers": [
      {
        "id": "user-uuid",
        "name": "홍길동",
        "email": "hong@example.com",
        "activityScore": 950,
        "studyCount": 5,
        "messageCount": 250
      }
    ]
  }
}
```

---

## 📖 스터디 분석

### 요청

```http
GET /api/admin/analytics/studies?period=30d
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `period` | string | 30d | 기간 (7d, 30d, 90d, 1y) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 340,
      "newInPeriod": 45,
      "growthRate": 15.2,
      "averageMembers": 5.8
    },
    "byCategory": {
      "PROGRAMMING": 120,
      "LANGUAGE": 85,
      "CERTIFICATE": 65,
      "EMPLOYMENT": 40,
      "HOBBY": 20,
      "OTHER": 10
    },
    "byVisibility": {
      "public": 280,
      "private": 60
    },
    "byRecruitingStatus": {
      "recruiting": 150,
      "closed": 190
    },
    "creationTrend": [
      { "date": "2026-01-01", "count": 5 },
      { "date": "2026-01-02", "count": 8 },
      ...
    ],
    "membershipTrend": [
      { "date": "2026-01-01", "joins": 25, "leaves": 5 },
      { "date": "2026-01-02", "joins": 30, "leaves": 8 },
      ...
    ],
    "topStudies": [
      {
        "id": "study-uuid",
        "name": "React 스터디",
        "category": "PROGRAMMING",
        "memberCount": 15,
        "messageCount": 1250,
        "activityScore": 95
      }
    ],
    "categoryGrowth": {
      "PROGRAMMING": 18.5,
      "LANGUAGE": 12.3,
      "CERTIFICATE": 8.7
    }
  }
}
```

---

## 📈 분석 지표 설명

### 사용자 지표

| 지표 | 설명 |
|------|------|
| `growthRate` | 전 기간 대비 성장률 (%) |
| `activeRate` | 활성 사용자 비율 (%) |
| `retention.day1` | 1일 후 재방문율 (%) |
| `retention.day7` | 7일 후 재방문율 (%) |
| `retention.day30` | 30일 후 재방문율 (%) |
| `activityScore` | 활동 점수 (메시지, 태스크, 로그인 등 종합) |

### 스터디 지표

| 지표 | 설명 |
|------|------|
| `growthRate` | 전 기간 대비 성장률 (%) |
| `averageMembers` | 평균 멤버 수 |
| `activityScore` | 활동 점수 (메시지, 태스크, 파일 등 종합) |

---

## 🔄 기간 옵션

| 값 | 설명 |
|-----|------|
| `7d` | 최근 7일 |
| `30d` | 최근 30일 |
| `90d` | 최근 90일 |
| `1y` | 최근 1년 |

---

## 🔗 관련 문서

- [관리자 통계 API](./stats.md)
- [관리자 분석 페이지](../../05_pages/admin/analytics.md)
