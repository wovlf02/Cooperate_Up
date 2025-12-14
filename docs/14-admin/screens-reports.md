# 🚨 신고 관리 화면

## 개요

신고 관리 화면에서는 사용자들이 접수한 신고를 조회하고 처리할 수 있습니다. 담당자 배정, 처리 결정, 연계 제재 조치 등을 수행합니다.

- **경로**: `/admin/reports`, `/admin/reports/[reportId]`
- **타입**: Client Component
- **필요 권한**: `REPORT_VIEW` 이상

---

## 파일 구조

```
app/admin/reports/
├── page.jsx                      # 신고 목록 페이지
├── page.module.css
├── [reportId]/
│   ├── page.jsx                 # 신고 상세 페이지
│   ├── page.module.css
│   └── _components/
│       ├── ReportActions.jsx    # 신고 처리 액션
│       ├── ReportActions.module.css
│       ├── ReportProcessModal.jsx  # 처리 모달
│       └── ReportProcessModal.module.css
└── _components/
    ├── ReportList.jsx           # 신고 목록 컴포넌트
    ├── ReportList.module.css
    ├── ReportFilters.jsx        # 필터 컴포넌트
    ├── ReportFilters.module.css
    ├── ReportColumns.jsx        # 테이블 컬럼 정의
    ├── ReportBulkActions.jsx    # 대량 작업 바
    ├── ReportEmptyState.jsx     # 빈 상태 표시
    └── ReportError.jsx          # 에러 표시
```

---

## 신고 목록 페이지

### `page.jsx`

```jsx
import { Suspense } from 'react'
import ReportList from './_components/ReportList'
import ReportFilters from './_components/ReportFilters'

export default function ReportsPage({ searchParams }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>신고 관리</h1>
        <p>신고 접수, 처리 및 모니터링</p>
      </div>

      <ReportFilters />

      <Suspense fallback={<ReportListSkeleton />}>
        <ReportList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
```

---

## 신고 필터 컴포넌트

### `_components/ReportFilters.jsx`

```jsx
export default function ReportFilters() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [priority, setPriority] = useState('all')
  const [targetType, setTargetType] = useState('all')
  const [assignedTo, setAssignedTo] = useState('all')

  return (
    <div className={styles.container}>
      {/* 빠른 필터 */}
      <div className={styles.quickFilters}>
        <button onClick={() => handleQuickFilter({ assignedTo: 'me' })}>
          📋 나한테 배정됨
        </button>
        <button onClick={() => handleQuickFilter({ priority: 'URGENT' })}>
          🚨 긴급
        </button>
        <button onClick={() => handleQuickFilter({ status: 'PENDING' })}>
          ⏰ 대기중
        </button>
      </div>

      {/* 상세 필터 */}
      <div className={styles.filterGrid}>
        <FilterSelect label="상태" value={status} options={STATUS_OPTIONS} />
        <FilterSelect label="신고 유형" value={type} options={TYPE_OPTIONS} />
        <FilterSelect label="우선순위" value={priority} options={PRIORITY_OPTIONS} />
        <FilterSelect label="대상 유형" value={targetType} options={TARGET_TYPE_OPTIONS} />
        <FilterSelect label="담당자" value={assignedTo} options={ASSIGNED_OPTIONS} />
      </div>
    </div>
  )
}
```

### 필터 옵션

| 필터 | 옵션 |
|------|------|
| 상태 | `all`, `PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED` |
| 신고 유형 | `all`, `SPAM`, `HARASSMENT`, `INAPPROPRIATE`, `COPYRIGHT`, `OTHER` |
| 우선순위 | `all`, `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| 대상 유형 | `all`, `USER`, `STUDY`, `MESSAGE` |
| 담당자 | `all`, `me`, `unassigned` |

---

## 테이블 컬럼 정의

### `_components/ReportColumns.jsx`

```jsx
export function getReportColumns() {
  return [
    {
      key: 'type',
      label: '유형',
      sortable: true,
      width: '120px',
      render: (type) => (
        <Badge variant="default" style={getTypeColor(type)}>
          {getTypeLabel(type)}
        </Badge>
      ),
    },
    {
      key: 'targetName',
      label: '대상',
      sortable: true,
      width: '200px',
      render: (targetName, report) => (
        <div>
          <div>{targetName || report.targetId}</div>
          <div>{getTargetTypeLabel(report.targetType)}</div>
        </div>
      ),
    },
    {
      key: 'reporter',
      label: '신고자',
      sortable: true,
      width: '150px',
      render: (_, report) => report.reporter?.name || '알 수 없음',
    },
    {
      key: 'reason',
      label: '사유',
      width: '250px',
      render: (reason) => reason?.substring(0, 50) + '...',
    },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      width: '100px',
      render: (status) => (
        <Badge variant={getStatusVariant(status)}>
          {getStatusLabel(status)}
        </Badge>
      ),
    },
    {
      key: 'priority',
      label: '우선순위',
      sortable: true,
      width: '100px',
      render: (priority) => (
        <Badge variant={getPriorityVariant(priority)}>
          {getPriorityLabel(priority)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: '신고일',
      sortable: true,
      width: '120px',
      render: (date) => new Date(date).toLocaleDateString('ko-KR'),
    },
    {
      key: 'actions',
      label: '액션',
      width: '120px',
      render: (_, report) => (
        <Link href={`/admin/reports/${report.id}`}>
          <Button size="sm" variant="outline">처리하기</Button>
        </Link>
      ),
    },
  ]
}
```

### 헬퍼 함수

```javascript
// 상태 색상
export function getStatusVariant(status) {
  const variants = {
    PENDING: 'warning',
    IN_PROGRESS: 'primary',
    RESOLVED: 'success',
    REJECTED: 'danger',
  }
  return variants[status] || 'default'
}

// 신고 유형 라벨
export function getTypeLabel(type) {
  const labels = {
    SPAM: '스팸',
    HARASSMENT: '괴롭힘',
    INAPPROPRIATE: '부적절',
    COPYRIGHT: '저작권',
    OTHER: '기타',
  }
  return labels[type] || type
}

// 우선순위 색상
export function getPriorityVariant(priority) {
  const variants = {
    LOW: 'default',
    MEDIUM: 'info',
    HIGH: 'warning',
    URGENT: 'danger',
  }
  return variants[priority] || 'default'
}
```

---

## 신고 상세 페이지

### `/admin/reports/[reportId]/page.jsx`

```jsx
export default function ReportDetailPage({ params }) {
  const { reportId } = use(params)
  const [report, setReport] = useState(null)
  const [relatedReports, setRelatedReports] = useState([])

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <Link href="/admin/reports">← 신고 목록</Link>
        <div className={styles.headerContent}>
          <h1>신고 상세</h1>
          <div className={styles.badges}>
            <Badge variant={STATUS_COLORS[report.status]}>
              {getStatusLabel(report.status)}
            </Badge>
            <Badge variant={PRIORITY_COLORS[report.priority]}>
              {getPriorityLabel(report.priority)}
            </Badge>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        {/* 왼쪽: 신고 정보 */}
        <div className={styles.mainContent}>
          {/* 신고 기본 정보 */}
          <Section title="신고 정보">
            <InfoGrid>
              <InfoItem label="신고 유형" value={getTypeLabel(report.type)} />
              <InfoItem label="접수 일시" value={formatDateTime(report.createdAt)} />
              <InfoItem label="대상 유형" value={getTargetTypeLabel(report.targetType)} />
              <InfoItem label="대상" value={report.targetName} />
            </InfoGrid>
          </Section>

          {/* 신고 사유 */}
          <Section title="신고 사유">
            <div className={styles.reasonBox}>{report.reason}</div>
          </Section>

          {/* 증거 자료 */}
          {report.evidence && (
            <Section title="증거 자료">
              <pre>{JSON.stringify(report.evidence, null, 2)}</pre>
            </Section>
          )}

          {/* 신고자 정보 */}
          <Section title="신고자 정보">
            <UserCard user={report.reporter} />
          </Section>

          {/* 신고 대상 정보 */}
          <Section title="신고 대상">
            {report.targetType === 'USER' && <UserCard user={report.target} />}
            {report.targetType === 'STUDY' && <StudyCard study={report.target} />}
            {report.targetType === 'MESSAGE' && <MessageCard message={report.target} />}
          </Section>

          {/* 처리 정보 */}
          {report.processedBy && (
            <Section title="처리 정보">
              <InfoItem label="처리자" value={report.processedAdmin?.name} />
              <InfoItem label="처리 일시" value={formatDateTime(report.processedAt)} />
              {report.resolution && (
                <div className={styles.resolutionBox}>{report.resolution}</div>
              )}
            </Section>
          )}

          {/* 관련 신고 */}
          {relatedReports.length > 0 && (
            <Section title={`동일 대상 관련 신고 (${relatedReports.length}건)`}>
              <RelatedReportList reports={relatedReports} />
            </Section>
          )}
        </div>

        {/* 오른쪽: 액션 패널 */}
        <div className={styles.sidebar}>
          <ReportActions report={report} onUpdate={fetchReportDetail} />
        </div>
      </div>
    </div>
  )
}
```

---

## 신고 처리 액션

### `_components/ReportActions.jsx`

```jsx
export default function ReportActions({ report, onUpdate }) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)

  const canProcess = report.status === 'PENDING' || report.status === 'IN_PROGRESS'

  // 담당자 배정
  const handleAssign = async () => {
    await api.post(`/api/admin/reports/${report.id}/assign`, {
      autoAssign: false, // 자신에게 배정
    })
    onUpdate?.()
  }

  return (
    <div className={styles.container}>
      {/* 처리 상태 */}
      <Section title="처리 상태">
        <StatusBadge status={report.status} />
      </Section>

      {/* 담당자 */}
      <Section title="담당자">
        {report.processedBy ? (
          <AssigneeInfo admin={report.processedAdmin} />
        ) : (
          <Button onClick={() => setIsAssignModalOpen(true)}>
            담당자 배정
          </Button>
        )}
      </Section>

      {/* 처리 버튼 */}
      <Section title="처리">
        {canProcess ? (
          <Button variant="primary" onClick={() => setIsProcessModalOpen(true)}>
            🛡️ 신고 처리하기
          </Button>
        ) : (
          <div>{report.status === 'RESOLVED' ? '✅ 승인됨' : '❌ 거부됨'}</div>
        )}
      </Section>

      {/* 처리 사유 */}
      {report.resolution && (
        <Section title="처리 사유">
          <div>{report.resolution}</div>
        </Section>
      )}

      {/* 모달 */}
      <ReportProcessModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        report={report}
        onSuccess={onUpdate}
      />
    </div>
  )
}
```

---

## 신고 처리 모달

### `_components/ReportProcessModal.jsx`

3단계 마법사 형태의 신고 처리 모달:

```jsx
export default function ReportProcessModal({ isOpen, onClose, report, onSuccess }) {
  const [step, setStep] = useState(1) // 1: 처리 선택, 2: 제재 설정, 3: 확인
  const [action, setAction] = useState(null) // 'approve', 'reject', 'hold'
  const [resolution, setResolution] = useState('')
  const [linkedAction, setLinkedAction] = useState('none')
  const [linkedActionDetails, setLinkedActionDetails] = useState({
    severity: 'NORMAL',
    duration: '7d',
  })

  const handleSubmit = async () => {
    await api.post(`/api/admin/reports/${report.id}/process`, {
      action,
      resolution,
      linkedAction,
      linkedActionDetails: linkedAction !== 'none' ? linkedActionDetails : null,
    })
    onSuccess?.()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} title="신고 처리" size="large">
      {/* 진행 표시기 */}
      <Stepper currentStep={step} steps={['처리 선택', '제재 설정', '최종 확인']} />

      {/* 신고 요약 */}
      <ReportSummary report={report} />

      {/* Step 1: 처리 방법 선택 */}
      {step === 1 && (
        <ActionSelection onSelect={(action) => {
          setAction(action)
          setStep(action === 'approve' ? 2 : 3)
        }} />
      )}

      {/* Step 2: 제재 설정 (승인 시에만) */}
      {step === 2 && (
        <LinkedActionSelection
          targetType={report.targetType}
          onSelect={(linkedAction) => {
            setLinkedAction(linkedAction)
            setStep(3)
          }}
        />
      )}

      {/* Step 3: 최종 확인 */}
      {step === 3 && (
        <Confirmation
          action={action}
          linkedAction={linkedAction}
          resolution={resolution}
          onResolutionChange={setResolution}
          onSubmit={handleSubmit}
        />
      )}
    </Modal>
  )
}
```

### 처리 옵션

| 처리 | 설명 |
|------|------|
| **승인** | 신고를 승인하고 제재 조치 부과 |
| **거부** | 허위/부당한 신고로 거부 |
| **보류** | 추가 검토 필요로 보류 |

### 연계 제재 옵션 (사용자 대상)

| 제재 | 설명 |
|------|------|
| 조치 없음 | 신고만 승인 |
| 경고 부여 | 경고 누적 시 자동 제재 |
| 활동 제한 | 특정 기능 제한 |
| 계정 정지 | 로그인 및 모든 활동 차단 |

---

## API 엔드포인트

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/reports` | 신고 목록 조회 | `REPORT_VIEW` |
| GET | `/api/admin/reports/[id]` | 신고 상세 조회 | `REPORT_VIEW` |
| POST | `/api/admin/reports/[id]/assign` | 담당자 배정 | `REPORT_ASSIGN` |
| POST | `/api/admin/reports/[id]/process` | 신고 처리 | `REPORT_PROCESS` |

---

## 데이터 구조

### 신고 상세 응답

```json
{
  "success": true,
  "data": {
    "report": {
      "id": "report-123",
      "type": "HARASSMENT",
      "targetType": "USER",
      "targetId": "user-456",
      "targetName": "문제 사용자",
      "reason": "다른 사용자에게 욕설과 비방을 지속적으로 보냄",
      "evidence": { ... },
      "priority": "HIGH",
      "status": "PENDING",
      "reporter": {
        "id": "user-789",
        "name": "신고자",
        "email": "reporter@example.com"
      },
      "target": {
        "id": "user-456",
        "name": "대상자",
        "email": "target@example.com",
        "status": "ACTIVE"
      },
      "processedBy": null,
      "processedAt": null,
      "resolution": null,
      "createdAt": "2024-12-14T10:00:00Z"
    },
    "relatedReports": [ ... ],
    "reporterHistory": {
      "totalReports": 3
    },
    "targetReportCount": 5
  }
}
```

