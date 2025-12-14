# ⚙️ 설정 화면

## 개요

설정 화면에서는 시스템 전반의 설정을 관리하고, 설정 변경 이력을 확인할 수 있습니다.

- **경로**: `/admin/settings`
- **타입**: Client Component
- **필요 권한**: `SETTINGS_VIEW` (조회), `SETTINGS_UPDATE` (수정) - SUPER_ADMIN

---

## 파일 구조

```
app/admin/settings/
├── page.jsx                    # 설정 페이지
├── page.module.css
└── _components/
    ├── SettingsForm.jsx        # 설정 폼
    ├── SettingsForm.module.css
    ├── SettingsHistory.jsx     # 변경 이력
    └── SettingsHistory.module.css
```

---

## 설정 페이지

### `page.jsx`

```jsx
import SettingsForm from './_components/SettingsForm'
import SettingsHistory from './_components/SettingsHistory'

export default function SettingsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>⚙️ 시스템 설정</h1>
        <p>시스템 전반의 설정을 관리할 수 있습니다.</p>
      </div>

      <div className={styles.content}>
        <SettingsForm />
        <SettingsHistory />
      </div>
    </div>
  )
}
```

---

## 설정 폼 컴포넌트

### `_components/SettingsForm.jsx`

```jsx
export default function SettingsForm() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({})
  const [originalSettings, setOriginalSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clearingCache, setClearingCache] = useState(false)
  const [message, setMessage] = useState(null)

  // 설정 불러오기
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const data = await api.get('/api/admin/settings')
    if (data.success) {
      setSettings(data.data)
      setOriginalSettings(JSON.parse(JSON.stringify(data.data)))
    }
  }

  // 설정 값 변경
  const handleChange = (category, key, value, type) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: {
          ...prev[category][key],
          value: type === 'boolean' ? value === 'true' : value
        }
      }
    }))
  }

  // 설정 저장
  const handleSave = async () => {
    setSaving(true)
    
    // 변경된 설정만 추출
    const changedSettings = []
    Object.keys(settings).forEach(category => {
      Object.keys(settings[category]).forEach(key => {
        if (settings[category][key].value !== originalSettings[category][key].value) {
          changedSettings.push({ key, value: settings[category][key].value })
        }
      })
    })

    if (changedSettings.length === 0) {
      setMessage({ type: 'info', text: '변경된 설정이 없습니다.' })
      return
    }

    const data = await api.put('/api/admin/settings', { settings: changedSettings })
    if (data.success) {
      setMessage({ type: 'success', text: `${data.updated}개의 설정이 업데이트되었습니다.` })
      setOriginalSettings(JSON.parse(JSON.stringify(settings)))
    }
    
    setSaving(false)
  }

  // 캐시 초기화
  const handleClearCache = async () => {
    if (!confirm('캐시를 초기화하시겠습니까?')) return
    
    setClearingCache(true)
    const data = await api.post('/api/admin/settings/cache/clear')
    if (data.success) {
      setMessage({ type: 'success', text: '캐시가 초기화되었습니다.' })
      fetchSettings()
    }
    setClearingCache(false)
  }

  return (
    <div className={styles.container}>
      {/* 탭 헤더 */}
      <div className={styles.header}>
        <div className={styles.tabs}>
          {Object.keys(categoryNames).map(category => (
            <button
              key={category}
              className={`${styles.tab} ${activeTab === category ? styles.active : ''}`}
              onClick={() => setActiveTab(category)}
            >
              {categoryNames[category]}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <Button onClick={handleClearCache} loading={clearingCache}>
            🔄 캐시 초기화
          </Button>
        </div>
      </div>

      {/* 메시지 */}
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* 설정 폼 */}
      <div className={styles.form}>
        {Object.keys(currentSettings).map(key => {
          const setting = currentSettings[key]
          return (
            <SettingField
              key={key}
              settingKey={key}
              setting={setting}
              onChange={(value) => handleChange(activeTab, key, value, setting.type)}
            />
          )
        })}
      </div>

      {/* 푸터 */}
      <div className={styles.footer}>
        <Button variant="outline" onClick={handleReset}>취소</Button>
        <Button variant="primary" onClick={handleSave} loading={saving}>저장</Button>
      </div>
    </div>
  )
}
```

---

## 설정 카테고리

### 카테고리 구조

```javascript
const categoryNames = {
  general: '일반 설정',
  security: '보안 설정',
  notification: '알림 설정',
  feature: '기능 설정'
}
```

### 일반 설정

| 키 | 설명 | 타입 | 기본값 |
|-----|------|------|--------|
| `site_name` | 사이트 이름 | string | "CoUp" |
| `site_description` | 사이트 설명 | string | "..." |
| `maintenance_mode` | 점검 모드 | boolean | false |
| `max_file_size` | 최대 파일 크기 (MB) | number | 50 |

### 보안 설정

| 키 | 설명 | 타입 | 기본값 |
|-----|------|------|--------|
| `password_min_length` | 최소 비밀번호 길이 | number | 8 |
| `session_timeout` | 세션 타임아웃 (분) | number | 60 |
| `max_login_attempts` | 최대 로그인 시도 | number | 5 |
| `two_factor_enabled` | 2FA 활성화 | boolean | false |

### 알림 설정

| 키 | 설명 | 타입 | 기본값 |
|-----|------|------|--------|
| `email_notifications` | 이메일 알림 | boolean | true |
| `push_notifications` | 푸시 알림 | boolean | true |
| `admin_alert_email` | 관리자 알림 이메일 | string | "" |

### 기능 설정

| 키 | 설명 | 타입 | 기본값 |
|-----|------|------|--------|
| `registration_enabled` | 회원가입 허용 | boolean | true |
| `social_login_enabled` | 소셜 로그인 허용 | boolean | true |
| `study_creation_enabled` | 스터디 생성 허용 | boolean | true |
| `auto_moderation` | 자동 모더레이션 | boolean | false |

---

## 설정 필드 컴포넌트

### 타입별 렌더링

```jsx
function SettingField({ settingKey, setting, onChange }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {setting.description || settingKey}
      </label>

      {setting.type === 'boolean' ? (
        <select
          value={String(setting.value)}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="true">사용</option>
          <option value="false">사용 안함</option>
        </select>
      ) : setting.type === 'number' ? (
        <input
          type="number"
          value={setting.value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          value={setting.value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      <div className={styles.meta}>
        키: {settingKey} | 타입: {setting.type}
      </div>
    </div>
  )
}
```

---

## 변경 이력 컴포넌트

### `_components/SettingsHistory.jsx`

```jsx
export default function SettingsHistory() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  const fetchHistory = useCallback(async () => {
    const data = await api.get('/api/admin/settings/history', { page, limit: 10 })
    if (data.success) {
      setLogs(data.data.logs)
      setPagination(data.data.pagination)
    }
  }, [page])

  return (
    <div className={styles.container}>
      <h2>📜 변경 이력</h2>

      <div className={styles.timeline}>
        {logs.map(log => (
          <div key={log.id} className={styles.item}>
            <div className={styles.dot} />
            
            <div className={styles.content}>
              <div className={styles.header}>
                <AdminAvatar admin={log.admin} />
                <div className={styles.date}>
                  {formatDateTime(log.createdAt)}
                </div>
              </div>

              <div className={styles.changes}>
                <div className={styles.reason}>{log.reason}</div>

                {log.settings?.map((setting, idx) => (
                  <div key={idx} className={styles.settingItem}>
                    <span className={styles.key}>{setting.key}</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.value}>{String(setting.value)}</span>
                  </div>
                ))}
              </div>

              {log.ipAddress && (
                <div className={styles.meta}>IP: {log.ipAddress}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} pagination={pagination} onPageChange={setPage} />
    </div>
  )
}
```

---

## API 엔드포인트

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/settings` | 설정 조회 | `SETTINGS_VIEW` |
| PUT | `/api/admin/settings` | 설정 업데이트 | `SETTINGS_UPDATE` |
| POST | `/api/admin/settings/cache/clear` | 캐시 초기화 | `SETTINGS_UPDATE` |
| GET | `/api/admin/settings/history` | 변경 이력 | `SETTINGS_VIEW` |

---

## 데이터 구조

### 설정 조회 응답

```json
{
  "success": true,
  "data": {
    "general": {
      "site_name": {
        "value": "CoUp",
        "type": "string",
        "description": "사이트 이름"
      },
      "maintenance_mode": {
        "value": false,
        "type": "boolean",
        "description": "점검 모드"
      }
    },
    "security": {
      "password_min_length": {
        "value": 8,
        "type": "number",
        "description": "최소 비밀번호 길이"
      }
    }
  }
}
```

### 설정 업데이트 요청

```json
{
  "settings": [
    { "key": "site_name", "value": "CoUp 스터디" },
    { "key": "maintenance_mode", "value": true }
  ]
}
```

### 설정 업데이트 응답

```json
{
  "success": true,
  "updated": 2,
  "message": "2개의 설정이 업데이트되었습니다."
}
```

### 변경 이력 응답

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-123",
        "admin": {
          "id": "admin-456",
          "name": "슈퍼관리자",
          "email": "super@example.com"
        },
        "reason": "설정 업데이트",
        "settings": [
          { "key": "maintenance_mode", "value": true }
        ],
        "ipAddress": "192.168.1.1",
        "createdAt": "2024-12-14T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasMore": true
    }
  }
}
```

---

## 캐시 관리

### 캐시 초기화

설정 변경 후 캐시를 초기화하여 새 설정이 즉시 적용되도록 합니다.

```jsx
const handleClearCache = async () => {
  const data = await api.post('/api/admin/settings/cache/clear')
  // 성공 시 설정 재조회
  await fetchSettings()
}
```

### 캐시 초기화 API

```javascript
// POST /api/admin/settings/cache/clear
export async function POST(request) {
  const auth = await requireAdmin(request, PERMISSIONS.SETTINGS_UPDATE)
  
  // 캐시 초기화 로직
  // (예: Redis, in-memory cache 등)
  
  // 로그 기록
  await logAdminAction({
    adminId: auth.adminRole.userId,
    action: 'SETTINGS_CACHE_CLEAR',
    reason: 'Cache cleared',
    request
  })

  return NextResponse.json({ success: true })
}
```

