# 관리자 대시보드 통계 API

> 관리자 대시보드에 표시되는 주요 통계 데이터를 조회하는 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **엔드포인트** | `/api/admin/stats` |
| **메서드** | `GET` |
| **필요 권한** | `ANALYTICS_VIEW` |

---

## 📥 요청

```http
GET /api/admin/stats
Cookie: next-auth.session-token=...
```

별도의 쿼리 파라미터 없이 호출합니다.

---

## 📤 응답

### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "active": 1180,
      "suspended": 25,
      "newToday": 15,
      "newThisWeek": 85
    },
    "studies": {
      "total": 340,
      "active": 280,
      "newToday": 5,
      "newThisWeek": 32
    },
    "reports": {
      "total": 150,
      "pending": 12,
      "urgent": 3,
      "newToday": 2
    },
    "moderation": {
      "totalWarnings": 45,
      "warningsToday": 1,
      "activeSanctions": 8
    },
    "recentActivity": {
      "users": [...],
      "reports": [...]
    }
  }
}
```

---

## 📊 응답 필드 상세

### users (사용자 통계)

| 필드 | 타입 | 설명 |
|------|------|------|
| `total` | number | 전체 사용자 수 |
| `active` | number | 활성 사용자 수 (status=ACTIVE) |
| `suspended` | number | 정지된 사용자 수 |
| `newToday` | number | 오늘 가입한 사용자 수 |
| `newThisWeek` | number | 이번 주 가입한 사용자 수 |

### studies (스터디 통계)

| 필드 | 타입 | 설명 |
|------|------|------|
| `total` | number | 전체 스터디 수 |
| `active` | number | 모집 중인 스터디 수 |
| `newToday` | number | 오늘 생성된 스터디 수 |
| `newThisWeek` | number | 이번 주 생성된 스터디 수 |

### reports (신고 통계)

| 필드 | 타입 | 설명 |
|------|------|------|
| `total` | number | 전체 신고 수 |
| `pending` | number | 대기 중인 신고 수 |
| `urgent` | number | 긴급 대기 중인 신고 수 |
| `newToday` | number | 오늘 접수된 신고 수 |

### moderation (제재 통계)

| 필드 | 타입 | 설명 |
|------|------|------|
| `totalWarnings` | number | 전체 경고 수 |
| `warningsToday` | number | 오늘 발송된 경고 수 |
| `activeSanctions` | number | 활성 제재 수 |

### recentActivity (최근 활동)

| 필드 | 타입 | 설명 |
|------|------|------|
| `users` | array | 최근 가입 사용자 5명 |
| `reports` | array | 최근 신고 5건 |

---

## 🔄 데이터 계산 기준

### 시간 범위

| 범위 | 계산 기준 |
|------|-----------|
| 오늘 | 오늘 00:00:00 ~ 현재 |
| 이번 주 | 7일 전 ~ 현재 |
| 이번 달 | 30일 전 ~ 현재 |

### 사용자 상태

| 상태 | 설명 |
|------|------|
| `ACTIVE` | 정상 활동 가능 |
| `SUSPENDED` | 일시 정지됨 |
| `DELETED` | 삭제됨 (카운트 제외) |

---

## 💡 사용 예시

### 대시보드 위젯에서 사용

```jsx
function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => fetch('/api/admin/stats').then(res => res.json()),
    refetchInterval: 60000, // 1분마다 갱신
  });

  if (isLoading) return <Loading />;

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title="전체 사용자"
        value={data.data.users.total}
        subtext={`+${data.data.users.newToday} 오늘`}
      />
      <StatCard
        title="스터디"
        value={data.data.studies.total}
        subtext={`${data.data.studies.active} 모집 중`}
      />
      <StatCard
        title="대기 중인 신고"
        value={data.data.reports.pending}
        alert={data.data.reports.urgent > 0}
      />
      <StatCard
        title="활성 제재"
        value={data.data.moderation.activeSanctions}
      />
    </div>
  );
}
```

---

## ⚠️ 주의사항

1. **권한 필요**: `ANALYTICS_VIEW` 권한이 없으면 403 에러 반환
2. **성능**: 다수의 COUNT 쿼리를 병렬로 실행하므로 DB 부하 고려
3. **캐싱**: 실시간 데이터가 필요한 경우 적절한 갱신 주기 설정 권장

---

## 🔗 관련 문서

- [관리자 분석 API](./analytics.md)
- [관리자 대시보드 페이지](../../05_pages/admin/dashboard.md)
