# 📋 감사 로그 화면

## 개요

감사 로그 화면에서는 관리자들의 모든 활동 기록을 조회하고 필터링할 수 있습니다.

- **경로**: `/admin/audit-logs`
- **타입**: Client Component
- **필요 권한**: `AUDIT_VIEW` (ADMIN+)

---

## 파일 구조

```
app/admin/audit-logs/
├── page.jsx                  # 감사 로그 페이지
├── page.module.css
└── _components/
    ├── LogFilters.jsx        # 필터 컴포넌트
    ├── LogFilters.module.css
    ├── LogTable.jsx          # 로그 테이블
    └── LogTable.module.css
```

---

## 감사 로그 페이지

### `page.jsx`

```jsx
import LogFilters from './_components/LogFilters'
import LogTable from './_components/LogTable'

export default function AuditLogsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📋 감사 로그</h1>
        <p>관리자의 모든 활동이 기록됩니다.</p>
      </div>

      <div className={styles.content}>
        <LogFilters />
        <LogTable />
      </div>
    </div>
  )
}
```

---

## 로그 필터 컴포넌트

### `_components/LogFilters.jsx`

```jsx
export default function LogFilters({ onFilterChange }) {
  const [admins, setAdmins] = useState([])
  const [filters, setFilters] = useState({
    adminId: '',
    action: '',
    targetType: '',
    startDate: '',
    endDate: ''
  })
  const [exporting, setExporting] = useState(false)

  // 필터 옵션
  const actionGroups = [
    { value: '', label: '전체' },
    { value: 'USER_*', label: '사용자 관리' },
    { value: 'STUDY_*', label: '스터디 관리' },
    { value: 'REPORT_*', label: '신고 처리' },
    { value: 'SETTINGS_*', label: '설정 관리' },
    { value: 'AUDIT_*', label: '감사 로그' }
  ]

  const targetTypes = [
    { value: '', label: '전체' },
    { value: 'User', label: '사용자' },
    { value: 'Study', label: '스터디' },
    { value: 'Report', label: '신고' }
  ]

  // CSV 내보내기
  const handleExport = async () => {
    setExporting(true)
    const params = new URLSearchParams(filters)
    const url = `/api/admin/audit-logs/export?${params}`
    // 다운로드 처리
  }

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <FilterField label="관리자">
          <select value={filters.adminId} onChange={...}>
            <option value="">전체</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.id}>
                {admin.name} ({admin.email})
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="액션 타입">
          <select value={filters.action}>
            {actionGroups.map(group => (
              <option key={group.value} value={group.value}>{group.label}</option>
            ))}
          </select>
        </FilterField>

        <FilterField label="대상 타입">
          <select value={filters.targetType}>
            {targetTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </FilterField>

        <FilterField label="시작 날짜">
          <input type="date" value={filters.startDate} />
        </FilterField>

        <FilterField label="종료 날짜">
          <input type="date" value={filters.endDate} />
        </FilterField>
      </div>

      <div className={styles.actions}>
        <Button variant="outline" onClick={handleReset}>초기화</Button>
        <Button variant="primary" onClick={handleExport} loading={exporting}>
          📥 CSV 내보내기
        </Button>
      </div>
    </div>
  )
}
```

---

## 로그 테이블 컴포넌트

### `_components/LogTable.jsx`

```jsx
export default function LogTable() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)

  const fetchLogs = useCallback(async () => {
    const data = await api.get('/api/admin/audit-logs', { page, limit: 20 })
    if (data.success) {
      setLogs(data.data.logs)
      setPagination(data.data.pagination)
    }
  }, [page])

  return (
    <>
      <div className={styles.container}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>일시</th>
              <th>관리자</th>
              <th>액션</th>
              <th>대상</th>
              <th>IP 주소</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{formatDateTime(log.createdAt)}</td>
                <td>
                  <AdminCell admin={log.admin} />
                </td>
                <td>
                  <Badge variant={actionColors[log.action]}>
                    {actionLabels[log.action]}
                  </Badge>
                </td>
                <td>
                  <TargetCell targetType={log.targetType} targetId={log.targetId} />
                </td>
                <td>{log.ipAddress || '-'}</td>
                <td>
                  <button onClick={() => setSelectedLog(log)}>
                    상세보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          page={page}
          total={pagination?.total}
          totalPages={pagination?.totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* 상세 모달 */}
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </>
  )
}
```

---

## 액션 라벨 및 색상

### 액션 라벨

```javascript
const actionLabels = {
  // 사용자 관리
  USER_VIEW: '사용자 조회',
  USER_SEARCH: '사용자 검색',
  USER_WARN: '경고 부여',
  USER_SUSPEND: '사용자 정지',
  USER_UNSUSPEND: '정지 해제',
  USER_DELETE: '사용자 삭제',

  // 스터디 관리
  STUDY_VIEW: '스터디 조회',
  STUDY_HIDE: '스터디 숨김',
  STUDY_CLOSE: '스터디 종료',
  STUDY_DELETE: '스터디 삭제',

  // 신고 처리
  REPORT_VIEW: '신고 조회',
  REPORT_ASSIGN: '담당자 배정',
  REPORT_RESOLVE: '신고 해결',
  REPORT_REJECT: '신고 거부',

  // 설정 관리
  SETTINGS_VIEW: '설정 조회',
  SETTINGS_UPDATE: '설정 업데이트',
  SETTINGS_CACHE_CLEAR: '캐시 초기화',

  // 감사 로그
  AUDIT_VIEW: '로그 조회',
  AUDIT_EXPORT: '로그 내보내기'
}
```

### 액션 색상

```javascript
const actionColors = {
  USER_VIEW: 'blue',
  USER_WARN: 'warning',
  USER_SUSPEND: 'danger',
  USER_UNSUSPEND: 'success',
  USER_DELETE: 'danger',
  STUDY_HIDE: 'warning',
  STUDY_CLOSE: 'warning',
  STUDY_DELETE: 'danger',
  REPORT_RESOLVE: 'success',
  REPORT_REJECT: 'secondary',
  SETTINGS_UPDATE: 'primary',
  SETTINGS_CACHE_CLEAR: 'secondary'
}
```

---

## 로그 상세 모달

### 상세 정보 구조

```jsx
<Modal title="로그 상세 정보">
  {/* 기본 정보 */}
  <Section title="기본 정보">
    <InfoItem label="일시" value={formatDateTime(log.createdAt)} />
    <InfoItem label="관리자" value={`${log.admin.name} (${log.admin.email})`} />
    <InfoItem label="액션" value={actionLabels[log.action]} />
    <InfoItem label="IP 주소" value={log.ipAddress} />
  </Section>

  {/* 대상 정보 */}
  {log.targetType && (
    <Section title="대상 정보">
      <InfoItem label="타입" value={log.targetType} />
      <InfoItem label="ID" value={log.targetId} />
    </Section>
  )}

  {/* 사유 */}
  {log.reason && (
    <Section title="사유">
      <div className={styles.reasonBox}>{log.reason}</div>
    </Section>
  )}

  {/* 변경 내역 */}
  {(log.before || log.after) && (
    <Section title="변경 내역">
      {log.before && (
        <div>
          <strong>이전:</strong>
          <pre>{JSON.stringify(log.before, null, 2)}</pre>
        </div>
      )}
      {log.after && (
        <div>
          <strong>이후:</strong>
          <pre>{JSON.stringify(log.after, null, 2)}</pre>
        </div>
      )}
    </Section>
  )}

  {/* User Agent */}
  {log.userAgent && (
    <Section title="User Agent">
      <div className={styles.userAgentBox}>{log.userAgent}</div>
    </Section>
  )}
</Modal>
```

---

## API 엔드포인트

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/audit-logs` | 로그 목록 조회 | `AUDIT_VIEW` |
| GET | `/api/admin/audit-logs/export` | CSV 내보내기 | `AUDIT_EXPORT` |

### 쿼리 파라미터

| 파라미터 | 설명 |
|----------|------|
| `page` | 페이지 번호 |
| `limit` | 페이지당 항목 수 |
| `adminId` | 관리자 ID 필터 |
| `action` | 액션 타입 필터 |
| `targetType` | 대상 타입 필터 |
| `startDate` | 시작 날짜 |
| `endDate` | 종료 날짜 |

---

## 데이터 구조

### 로그 목록 응답

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-123",
        "adminId": "admin-456",
        "action": "USER_SUSPEND",
        "targetType": "User",
        "targetId": "user-789",
        "before": { "status": "ACTIVE" },
        "after": { "status": "SUSPENDED" },
        "reason": "커뮤니티 가이드라인 위반",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2024-12-14T10:00:00Z",
        "admin": {
          "id": "admin-456",
          "name": "관리자",
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasMore": true
    },
    "admins": [
      { "id": "admin-1", "name": "관리자1", "email": "admin1@example.com" },
      { "id": "admin-2", "name": "관리자2", "email": "admin2@example.com" }
    ]
  }
}
```

---

## CSV 내보내기

### 내보내기 형식

```csv
일시,관리자,이메일,액션,대상타입,대상ID,사유,IP주소
2024-12-14 10:00:00,관리자1,admin1@example.com,USER_SUSPEND,User,user-123,규정 위반,192.168.1.1
2024-12-14 09:30:00,관리자2,admin2@example.com,REPORT_RESOLVE,Report,report-456,처리 완료,192.168.1.2
```

### 내보내기 구현

```jsx
const handleExport = async () => {
  const params = new URLSearchParams()
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key])
  })

  const url = `/api/admin/audit-logs/export?${params}`
  const link = document.createElement('a')
  link.href = url
  link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}
```

