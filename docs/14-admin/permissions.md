# 🔐 권한 시스템 (RBAC)

## 개요

CoUp 관리자 시스템은 **RBAC (Role-Based Access Control)** 모델을 사용합니다. 역할(Role)에 따라 권한(Permission)이 부여되며, 각 API와 UI는 필요한 권한을 검사합니다.

---

## 역할 정의

### 역할 계층

```
SUPER_ADMIN (Level 4)
    ↑
  ADMIN (Level 3)
    ↑
MODERATOR (Level 2)
    ↑
  VIEWER (Level 1)
```

### 역할 상세

| 역할 | 레벨 | 설명 | 색상 |
|------|------|------|------|
| `VIEWER` | 1 | 데이터 조회만 가능 | #6B7280 (Gray) |
| `MODERATOR` | 2 | 콘텐츠 관리 및 신고 처리 | #3B82F6 (Blue) |
| `ADMIN` | 3 | 사용자 및 스터디 관리 | #8B5CF6 (Purple) |
| `SUPER_ADMIN` | 4 | 모든 권한 및 시스템 설정 | #EF4444 (Red) |

---

## 권한 정의

### `/lib/admin/permissions.js`

```javascript
export const PERMISSIONS = {
  // 사용자 관리
  USER_VIEW: 'user:view',
  USER_SEARCH: 'user:search',
  USER_WARN: 'user:warn',
  USER_SUSPEND: 'user:suspend',
  USER_UNSUSPEND: 'user:unsuspend',
  USER_DELETE: 'user:delete',
  USER_RESTORE: 'user:restore',
  USER_UPDATE: 'user:update',

  // 스터디 관리
  STUDY_VIEW: 'study:view',
  STUDY_HIDE: 'study:hide',
  STUDY_CLOSE: 'study:close',
  STUDY_DELETE: 'study:delete',
  STUDY_RECOMMEND: 'study:recommend',
  STUDY_UPDATE: 'study:update',

  // 신고 처리
  REPORT_VIEW: 'report:view',
  REPORT_ASSIGN: 'report:assign',
  REPORT_PROCESS: 'report:process',
  REPORT_RESOLVE: 'report:resolve',
  REPORT_REJECT: 'report:reject',

  // 콘텐츠 관리
  CONTENT_VIEW: 'content:view',
  CONTENT_DELETE: 'content:delete',
  CONTENT_RESTORE: 'content:restore',

  // 통계 및 분석
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',

  // 시스템 설정
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',

  // 감사 로그
  AUDIT_VIEW: 'audit:view',
  AUDIT_EXPORT: 'audit:export',

  // 관리자 관리 (SUPER_ADMIN만)
  ADMIN_MANAGE: 'admin:manage',
  ADMIN_GRANT_ROLE: 'admin:grant_role',
}
```

---

## 역할별 권한 매핑

### VIEWER

```javascript
[
  'user:view',
  'user:search',
  'study:view',
  'report:view',
  'content:view',
  'analytics:view',
]
```

### MODERATOR

VIEWER 권한 + 추가 권한:

```javascript
[
  // 모든 :view, :search 권한
  'user:warn',
  'report:assign',
  'report:process',
  'report:resolve',
  'report:reject',
  'content:delete',
  'study:hide',
]
```

### ADMIN

MODERATOR 권한 + 추가 권한:

```javascript
[
  // 대부분의 권한 (admin:*, settings:update 제외)
  'user:suspend',
  'user:unsuspend',
  'user:update',
  'study:close',
  'study:delete',
  'study:recommend',
  'audit:view',
]
```

### SUPER_ADMIN

```javascript
// 모든 권한
Object.values(PERMISSIONS)
```

---

## 권한 검사 함수

### `hasPermission(role, permission)`

특정 역할이 권한을 가지고 있는지 확인합니다.

```javascript
import { hasPermission, PERMISSIONS } from '@/lib/admin/permissions'

// 사용 예
if (hasPermission('ADMIN', PERMISSIONS.USER_SUSPEND)) {
  // 권한 있음
}
```

### `hasAllPermissions(role, permissions[])`

여러 권한을 모두 가지고 있는지 확인합니다.

```javascript
const canFullyManageUser = hasAllPermissions('ADMIN', [
  PERMISSIONS.USER_SUSPEND,
  PERMISSIONS.USER_DELETE,
])
```

### `hasAnyPermission(role, permissions[])`

권한 중 하나라도 가지고 있는지 확인합니다.

```javascript
const canModerateReport = hasAnyPermission('MODERATOR', [
  PERMISSIONS.REPORT_RESOLVE,
  PERMISSIONS.REPORT_REJECT,
])
```

---

## API 권한 검사

### `requireAdmin(request, permission)`

API 라우트에서 권한을 검사합니다.

```javascript
// /api/admin/users/route.js
import { requireAdmin } from '@/lib/admin/auth'
import { PERMISSIONS } from '@/lib/admin/permissions'

export async function GET(request) {
  // 권한 확인 - USER_VIEW 권한 필요
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
  
  // 권한 없으면 NextResponse 반환 (401/403)
  if (auth instanceof NextResponse) return auth
  
  // 권한 있으면 { user, adminRole } 반환
  const { adminRole } = auth
  
  // 이후 로직...
}
```

### 복수 권한 검사

```javascript
// 배열로 전달하면 모든 권한 필요
const auth = await requireAdmin(request, [
  PERMISSIONS.USER_VIEW,
  PERMISSIONS.USER_SUSPEND,
])
```

---

## 역할 관리 함수

### `/lib/admin/roles.js`

#### `updateAdminRole(userId, newRole, updatedBy, reason)`

관리자 역할을 업데이트합니다.

```javascript
await updateAdminRole(
  'user-123',
  'ADMIN',
  'super-admin-id',
  '승진: 모더레이터 → 관리자'
)
```

#### `setRoleExpiration(userId, expiresAt, updatedBy)`

역할 만료일을 설정합니다.

```javascript
// 30일 후 만료
await setRoleExpiration(
  'user-123',
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  'super-admin-id'
)
```

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

## 역할 비교

### `compareRoles(fromRole, toRole)`

역할 변경 방향을 확인합니다.

```javascript
compareRoles('VIEWER', 'ADMIN')      // 'upgrade'
compareRoles('ADMIN', 'MODERATOR')   // 'downgrade'
compareRoles('ADMIN', 'ADMIN')       // 'same'
```

---

## UI에서의 권한 사용

### 네비게이션 메뉴 필터링

```jsx
// AdminNavbar.jsx
const menuItems = [
  { label: '대시보드', href: '/admin', exact: true },
  { label: '사용자', href: '/admin/users' },
  { label: '스터디', href: '/admin/studies' },
  { label: '신고', href: '/admin/reports' },
  { label: '분석', href: '/admin/analytics' },
  { label: '설정', href: '/admin/settings', superAdminOnly: true },
  { label: '감사 로그', href: '/admin/audit-logs', superAdminOnly: true }
]

const isSuperAdmin = adminRole.role === 'SUPER_ADMIN'
const filteredMenuItems = menuItems.filter(item =>
  !item.superAdminOnly || isSuperAdmin
)
```

### 조건부 버튼 렌더링

```jsx
{hasPermission(adminRole.role, PERMISSIONS.USER_SUSPEND) && (
  <Button variant="warning" onClick={handleSuspend}>
    정지
  </Button>
)}
```

---

## 데이터베이스 스키마

### AdminRole 테이블

```prisma
model AdminRole {
  id          String    @id @default(cuid())
  userId      String    @unique
  role        String    // VIEWER, MODERATOR, ADMIN, SUPER_ADMIN
  permissions Json?     // 커스텀 권한 (선택적)
  grantedBy   String?   // 권한 부여자 ID
  grantedAt   DateTime  @default(now())
  expiresAt   DateTime? // 만료 시간 (없으면 무기한)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  user        User      @relation(fields: [userId], references: [id])
}
```

### AdminLog 테이블

```prisma
model AdminLog {
  id         String   @id @default(cuid())
  adminId    String
  action     String
  targetType String?
  targetId   String?
  before     Json?
  after      Json?
  reason     String?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())
  
  admin      User     @relation(fields: [adminId], references: [id])
}
```

---

## 보안 고려사항

1. **역할 만료**: `expiresAt` 필드로 임시 권한 부여 가능
2. **권한 로깅**: 모든 권한 변경은 AdminLog에 기록
3. **최소 권한 원칙**: 필요한 최소 권한만 부여
4. **계층적 제한**: 하위 역할은 상위 역할 권한 부여 불가
5. **자기 권한 변경 금지**: 자신의 역할은 직접 변경 불가

