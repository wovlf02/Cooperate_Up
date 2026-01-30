# 📈 분석 화면

## 개요

분석 화면에서는 플랫폼의 주요 지표와 트렌드를 차트와 그래프로 시각화하여 확인할 수 있습니다.

- **경로**: `/admin/analytics`
- **타입**: Client Component
- **필요 권한**: `ANALYTICS_VIEW` 이상
- **차트 라이브러리**: Recharts

---

## 파일 구조

```
app/admin/analytics/
├── page.jsx                        # 분석 메인 페이지
├── page.module.css
└── _components/
    ├── OverviewCharts.jsx          # 전체 통계 차트
    ├── OverviewCharts.module.css
    ├── UserAnalytics.jsx           # 사용자 분석
    ├── UserAnalytics.module.css
    ├── StudyAnalytics.jsx          # 스터디 분석
    └── StudyAnalytics.module.css
```

---

## 분석 페이지

### `page.jsx`

```jsx
import OverviewCharts from './_components/OverviewCharts'
import UserAnalytics from './_components/UserAnalytics'
import StudyAnalytics from './_components/StudyAnalytics'

export default function AnalyticsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>통계 분석</h1>
        <p>플랫폼의 주요 지표와 트렌드를 확인하세요</p>
      </header>

      {/* 전체 통계 개요 */}
      <section className={styles.section}>
        <OverviewCharts />
      </section>

      {/* 사용자 분석 */}
      <section className={styles.section}>
        <UserAnalytics />
      </section>

      {/* 스터디 분석 */}
      <section className={styles.section}>
        <StudyAnalytics />
      </section>
    </div>
  )
}
```

---

## 전체 통계 개요

### `_components/OverviewCharts.jsx`

```jsx
export default function OverviewCharts() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverview()
  }, [])

  const fetchOverview = async () => {
    const result = await api.get('/api/admin/analytics/overview')
    setData(result.data)
  }

  const { summary, trends } = data

  return (
    <div className={styles.container}>
      <h2>전체 통계 개요</h2>

      {/* 요약 카드 */}
      <div className={styles.cards}>
        <SummaryCard
          title="사용자"
          total={summary.users.total}
          active={summary.users.active}
          growth={summary.users.growth}
        />
        <SummaryCard
          title="스터디"
          total={summary.studies.total}
          recruiting={summary.studies.recruiting}
          growth={summary.studies.growth}
        />
        <SummaryCard
          title="신고"
          total={summary.reports.total}
          pending={summary.reports.pending}
          resolutionRate={summary.reports.resolution_rate}
        />
      </div>

      {/* 추이 차트 */}
      <div className={styles.charts}>
        <LineChartCard
          title="일일 가입자 수 (최근 30일)"
          data={trends.dailySignups}
          dataKey="count"
          color="#6366f1"
        />
        <LineChartCard
          title="일일 스터디 생성 수 (최근 30일)"
          data={trends.dailyStudies}
          dataKey="count"
          color="#10b981"
        />
        <LineChartCard
          title="일일 신고 접수 수 (최근 30일)"
          data={trends.dailyReports}
          dataKey="count"
          color="#f59e0b"
        />
      </div>
    </div>
  )
}
```

### 요약 카드 데이터

| 지표 | 필드 | 설명 |
|------|------|------|
| 사용자 전체 | `summary.users.total` | 전체 사용자 수 |
| 사용자 활성 | `summary.users.active` | 활성 사용자 수 |
| 사용자 정지 | `summary.users.suspended` | 정지된 사용자 수 |
| 사용자 성장률 | `summary.users.growth` | 전월 대비 % |
| 스터디 전체 | `summary.studies.total` | 전체 스터디 수 |
| 스터디 공개 | `summary.studies.public` | 공개 스터디 수 |
| 스터디 모집중 | `summary.studies.recruiting` | 모집 중 스터디 |
| 신고 전체 | `summary.reports.total` | 전체 신고 건수 |
| 신고 대기 | `summary.reports.pending` | 대기 중 신고 |
| 신고 처리율 | `summary.reports.resolution_rate` | 해결 비율 % |

---

## 사용자 분석

### `_components/UserAnalytics.jsx`

```jsx
export default function UserAnalytics() {
  const [data, setData] = useState(null)
  const [period, setPeriod] = useState('daily')  // daily, weekly, monthly
  const [range, setRange] = useState(30)         // 7, 30, 90

  const fetchUserAnalytics = useCallback(async () => {
    const result = await api.get('/api/admin/analytics/users', { period, range })
    setData(result.data)
  }, [period, range])

  const {
    signupTrend,
    providerDistribution,
    activityMetrics,
    sanctions,
    statusDistribution
  } = data

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>사용자 분석</h2>
        <div className={styles.controls}>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="daily">일별</option>
            <option value="weekly">주별</option>
            <option value="monthly">월별</option>
          </select>
          <select value={range} onChange={(e) => setRange(Number(e.target.value))}>
            <option value={7}>최근 7일</option>
            <option value={30}>최근 30일</option>
            <option value={90}>최근 90일</option>
          </select>
        </div>
      </div>

      {/* 활동 메트릭 카드 */}
      <div className={styles.metricsCards}>
        <MetricCard label="DAU" value={activityMetrics.dau} desc="일간 활성 사용자" />
        <MetricCard label="WAU" value={activityMetrics.wau} desc="주간 활성 사용자" />
        <MetricCard label="MAU" value={activityMetrics.mau} desc="월간 활성 사용자" />
      </div>

      {/* 차트 그리드 */}
      <div className={styles.chartsGrid}>
        {/* 가입 추이 */}
        <LineChart data={signupTrend} title="가입 추이" />

        {/* 가입 방식 분포 */}
        <PieChart data={providerDistribution} title="가입 방식 분포" />

        {/* 제재 현황 */}
        <BarChart data={sanctions} title="제재 현황" />

        {/* 상태별 분포 */}
        <BarChart data={statusDistribution} title="사용자 상태 분포" />
      </div>
    </div>
  )
}
```

### 사용자 분석 차트

| 차트 | 유형 | 데이터 |
|------|------|--------|
| 가입 추이 | Line | 기간별 가입자 수 |
| 가입 방식 분포 | Pie | `CREDENTIALS`, `GOOGLE`, `GITHUB` 비율 |
| 제재 현황 | Bar | 경고, 일시정지, 영구정지 사용자 수 |
| 상태별 분포 | Bar | `ACTIVE`, `SUSPENDED`, `DELETED` 분포 |

---

## 스터디 분석

### `_components/StudyAnalytics.jsx`

```jsx
export default function StudyAnalytics() {
  const [data, setData] = useState(null)
  const [period, setPeriod] = useState('daily')
  const [range, setRange] = useState(30)

  const {
    creationTrend,
    categoryDistribution,
    membershipStats,
    activeRatio,
    visibilityDistribution,
    recruitmentStatus
  } = data

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>스터디 분석</h2>
        {/* 기간 선택 컨트롤 */}
      </div>

      {/* 멤버십 통계 카드 */}
      <div className={styles.statsCards}>
        <StatCard label="평균 멤버 수" value={membershipStats.avg} />
        <StatCard label="최소 멤버 수" value={membershipStats.min} />
        <StatCard label="최대 멤버 수" value={membershipStats.max} />
        <StatCard label="전체 멤버 수" value={membershipStats.total} />
      </div>

      {/* 활성 비율 */}
      <div className={styles.activeRatioSection}>
        <h3>활성 스터디 비율</h3>
        <ProgressBar value={activeRatio.ratio} />
        <div>
          활성: {activeRatio.active} | 비활성: {activeRatio.inactive}
        </div>
      </div>

      {/* 차트 그리드 */}
      <div className={styles.chartsGrid}>
        {/* 생성 추이 */}
        <LineChart data={creationTrend} title="스터디 생성 추이" />

        {/* 카테고리별 분포 */}
        <BarChart data={categoryDistribution} title="카테고리별 분포" />

        {/* 공개/비공개 분포 */}
        <PieChart data={visibilityDistribution} title="공개 여부 분포" />

        {/* 모집 현황 */}
        <PieChart data={recruitmentStatus} title="모집 현황" />
      </div>
    </div>
  )
}
```

### 스터디 분석 차트

| 차트 | 유형 | 데이터 |
|------|------|--------|
| 생성 추이 | Line | 기간별 스터디 생성 수 |
| 카테고리별 분포 | Bar | 프로그래밍, 디자인, 어학 등 |
| 공개 여부 분포 | Pie | 공개/비공개 비율 |
| 모집 현황 | Pie | 모집중/모집마감 비율 |

---

## Recharts 사용법

### LineChart 예시

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={signupTrend}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
    <XAxis
      dataKey="period"
      tick={{ fontSize: 12 }}
      tickFormatter={(value) => {
        const date = new Date(value)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }}
    />
    <YAxis tick={{ fontSize: 12 }} />
    <Tooltip
      contentStyle={{
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}
    />
    <Legend />
    <Line
      type="monotone"
      dataKey="count"
      stroke="#6366f1"
      strokeWidth={2}
      name="가입자 수"
      dot={{ r: 3 }}
      activeDot={{ r: 5 }}
    />
  </LineChart>
</ResponsiveContainer>
```

### PieChart 예시

```jsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={providerDistribution}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
      outerRadius={80}
      dataKey="count"
    >
      {providerDistribution.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

---

## API 엔드포인트

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/analytics/overview` | 전체 통계 개요 | `ANALYTICS_VIEW` |
| GET | `/api/admin/analytics/users` | 사용자 분석 | `ANALYTICS_VIEW` |
| GET | `/api/admin/analytics/studies` | 스터디 분석 | `ANALYTICS_VIEW` |

### 쿼리 파라미터

| 파라미터 | 설명 | 기본값 |
|----------|------|--------|
| `period` | 집계 단위 (`daily`, `weekly`, `monthly`) | `daily` |
| `range` | 기간 (일 수) | `30` |

---

## 데이터 구조

### 전체 통계 응답

```json
{
  "success": true,
  "data": {
    "summary": {
      "users": { "total": 1234, "active": 1100, "suspended": 34, "growth": 5.2 },
      "studies": { "total": 456, "public": 380, "recruiting": 120, "growth": 8.5 },
      "reports": { "total": 89, "pending": 12, "in_progress": 5, "resolution_rate": 85 }
    },
    "trends": {
      "dailySignups": [{ "date": "2024-12-01", "count": 15 }, ...],
      "dailyStudies": [{ "date": "2024-12-01", "count": 8 }, ...],
      "dailyReports": [{ "date": "2024-12-01", "count": 3 }, ...]
    }
  }
}
```

### 사용자 분석 응답

```json
{
  "success": true,
  "data": {
    "signupTrend": [{ "period": "2024-12-01", "count": 15 }, ...],
    "providerDistribution": [
      { "provider": "CREDENTIALS", "name": "이메일", "count": 800 },
      { "provider": "GOOGLE", "name": "Google", "count": 350 },
      { "provider": "GITHUB", "name": "GitHub", "count": 84 }
    ],
    "activityMetrics": { "dau": 450, "wau": 890, "mau": 1100 },
    "sanctions": { "warnings": 45, "suspensions": 12, "bans": 3 },
    "statusDistribution": [
      { "status": "ACTIVE", "name": "활성", "count": 1100 },
      { "status": "SUSPENDED", "name": "정지", "count": 34 },
      { "status": "DELETED", "name": "삭제", "count": 100 }
    ]
  }
}
```

