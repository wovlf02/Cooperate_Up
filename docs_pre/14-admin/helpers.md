# 🔧 헬퍼 함수 및 유틸리티

## 개요

관리자 시스템에서 사용되는 헬퍼 함수와 유틸리티들입니다.

---

## 파일 구조

```
lib/
├── admin/
│   ├── auth.js           # 인증 미들웨어
│   ├── permissions.js    # 권한 시스템
│   └── roles.js          # 역할 관리
├── utils/
│   └── admin-utils.js    # 관리자 유틸리티
├── exceptions/
│   └── admin.js          # 관리자 예외 클래스
└── logging/
    └── adminLogger.js    # 관리자 로깅
```

---

## 인증 함수

### `/lib/admin/auth.js`

#### `requireAdmin(request, permissions)`

API 라우트에서 관리자 권한을 확인합니다.

```javascript
import { requireAdmin } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  
  // 권한 없음 → NextResponse 반환
  if (auth instanceof NextResponse) return auth
  
  // 권한 있음 → { user, adminRole } 반환
  const { user, adminRole } = auth
  
  // 이후 로직...
}
```

**파라미터:**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `request` | Request | HTTP 요청 객체 |
| `permissions` | string \| string[] | 필요한 권한 |

**반환값:**
- 성공: `{ user, adminRole }` 객체
- 실패: `NextResponse` (401, 403 에러)

---

#### `getAdminRole(userId)`

사용자의 관리자 역할을 조회합니다. (서버 컴포넌트용)

```javascript
import { getAdminRole } from '@/lib/admin/auth'

const adminRole = await getAdminRole(userId)
if (!adminRole) {
  // 관리자 아님
}
```

---

#### `isAdmin(userId)`

사용자가 관리자인지 확인합니다.

```javascript
const isUserAdmin = await isAdmin(userId)
```

---

#### `isSuperAdmin(userId)`

사용자가 슈퍼 관리자인지 확인합니다.

```javascript
const isSuperAdminUser = await isSuperAdmin(userId)
```

---

#### `logAdminAction(params)`

관리자 활동을 로그에 기록합니다.

```javascript
await logAdminAction({
  adminId: 'admin-123',
  action: 'USER_SUSPEND',
  targetType: 'User',
  targetId: 'user-456',
  before: { status: 'ACTIVE' },
  after: { status: 'SUSPENDED' },
  reason: '규정 위반',
  request,
})
```

**파라미터:**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `adminId` | string | ✓ | 수행한 관리자 ID |
| `action` | string | ✓ | 액션 코드 |
| `targetType` | string | | 대상 타입 |
| `targetId` | string | | 대상 ID |
| `before` | object | | 변경 전 상태 |
| `after` | object | | 변경 후 상태 |
| `reason` | string | | 작업 사유 |
| `request` | Request | | 요청 객체 (IP/UA 추출용) |

---

## 권한 함수

### `/lib/admin/permissions.js`

#### `hasPermission(role, permission)`

역할에 특정 권한이 있는지 확인합니다.

```javascript
import { hasPermission, PERMISSIONS } from '@/lib/admin/permissions'

if (hasPermission('ADMIN', PERMISSIONS.USER_SUSPEND)) {
  // 권한 있음
}
```

---

#### `hasAllPermissions(role, permissions[])`

여러 권한을 모두 가지고 있는지 확인합니다.

```javascript
const canManage = hasAllPermissions('ADMIN', [
  PERMISSIONS.USER_VIEW,
  PERMISSIONS.USER_SUSPEND,
  PERMISSIONS.USER_DELETE,
])
```

---

#### `hasAnyPermission(role, permissions[])`

권한 중 하나라도 가지고 있는지 확인합니다.

```javascript
const canProcessReport = hasAnyPermission('MODERATOR', [
  PERMISSIONS.REPORT_RESOLVE,
  PERMISSIONS.REPORT_REJECT,
])
```

---

#### `getDefaultPermissions(role)`

역할에 대한 기본 권한 객체를 생성합니다.

```javascript
const permissions = getDefaultPermissions('ADMIN')
// { 'user:view': true, 'user:suspend': true, ... }
```

---

#### `compareRoles(fromRole, toRole)`

역할 변경 방향을 확인합니다.

```javascript
compareRoles('VIEWER', 'ADMIN')      // 'upgrade'
compareRoles('ADMIN', 'MODERATOR')   // 'downgrade'
compareRoles('ADMIN', 'ADMIN')       // 'same'
```

---

## 역할 관리 함수

### `/lib/admin/roles.js`

#### `updateAdminRole(userId, newRole, updatedBy, reason)`

관리자 역할을 업데이트합니다.

```javascript
await updateAdminRole(
  'user-123',        // 대상 사용자
  'ADMIN',           // 새 역할
  'super-admin-id',  // 변경 수행자
  '승진 처리'         // 사유
)
```

---

#### `setRoleExpiration(userId, expiresAt, updatedBy)`

역할 만료일을 설정합니다.

```javascript
// 30일 후 만료
await setRoleExpiration(
  'user-123',
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  'super-admin-id'
)

// 만료 제거 (무기한)
await setRoleExpiration('user-123', null, 'super-admin-id')
```

---

#### `updateCustomPermissions(userId, permissions, updatedBy)`

커스텀 권한을 설정합니다.

```javascript
await updateCustomPermissions(
  'user-123',
  { 'user:view': true, 'user:warn': true },
  'super-admin-id'
)
```

---

#### `getRoleStatistics()`

역할별 통계를 조회합니다.

```javascript
const stats = await getRoleStatistics()
// {
//   byRole: [{ role: 'ADMIN', _count: 5 }, ...],
//   expiringSoon: 2
// }
```

---

## 유틸리티 함수

### `/lib/utils/admin-utils.js`

#### `validatePagination(searchParams)`

페이지네이션 파라미터를 검증합니다.

```javascript
const { page, limit, skip } = validatePagination(searchParams)
// page: 1, limit: 20, skip: 0
```

---

#### `createPaginatedResponse(data, total, page, limit, extra)`

페이지네이션된 응답을 생성합니다.

```javascript
return createPaginatedResponse(
  users,           // 데이터 배열
  total,           // 전체 개수
  page,            // 현재 페이지
  limit,           // 페이지당 개수
  { stats: {...} } // 추가 데이터
)

// 반환:
// {
//   success: true,
//   data: [...],
//   pagination: { page, limit, total, totalPages, hasMore },
//   stats: {...}
// }
```

---

#### `sanitizeUserData(user)`

사용자 데이터에서 민감 정보를 제거합니다.

```javascript
const safeUser = sanitizeUserData(user)
// password, hashedPassword 등 제거됨
```

---

#### `withAdminErrorHandler(handler)`

API 핸들러에 에러 처리를 래핑합니다.

```javascript
async function getUsersHandler(request) {
  // 에러 발생 시 자동으로 적절한 응답 생성
}

export const GET = withAdminErrorHandler(getUsersHandler)
```

---

## 로깅 유틸리티

### `/lib/logging/adminLogger.js`

#### `AdminLogger.info(message, context)`

정보 로그를 기록합니다.

```javascript
AdminLogger.info('Admin users list request', { adminId })
```

---

#### `AdminLogger.error(message, context)`

에러 로그를 기록합니다.

```javascript
AdminLogger.error('Database query failed', { adminId, error: error.message })
```

---

#### `AdminLogger.logAdminAction(adminId, action, details)`

관리자 액션 로그를 기록합니다.

```javascript
AdminLogger.logAdminAction(adminId, 'USER_LIST_VIEW', {
  search,
  status,
  resultCount: users.length
})
```

---

#### `AdminLogger.logPerformance(operation, duration, context)`

성능 메트릭을 기록합니다.

```javascript
const startTime = Date.now()
// ... 작업 수행 ...
const duration = Date.now() - startTime

AdminLogger.logPerformance('getUsersList', duration, {
  adminId,
  userCount: users.length
})
```

---

#### `AdminLogger.logDatabaseError(operation, error, context)`

데이터베이스 에러를 기록합니다.

```javascript
AdminLogger.logDatabaseError('user query', error, { adminId, where })
```

---

## 날짜/시간 포맷

### 날짜 포맷 함수

```javascript
// 날짜만
function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR')
}

// 날짜 + 시간
function formatDateTime(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 상대 시간 (N분 전, N시간 전)
function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  return formatDate(dateString)
}
```

---

## 숫자 포맷

```javascript
// 천 단위 콤마
function formatNumber(num) {
  return num?.toLocaleString() ?? '0'
}

// 퍼센트
function formatPercent(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`
}

// 파일 크기
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
```

---

## 텍스트 유틸리티

```javascript
// 말줄임표
function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

// 첫 글자 대문자
function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ID 축약 (UUID 앞 8자리)
function shortId(id) {
  if (!id) return '-'
  return id.substring(0, 8) + '...'
}
```

