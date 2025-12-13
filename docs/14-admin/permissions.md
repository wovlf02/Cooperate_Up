# 🔐 관리자 권한 시스템

## 개요

RBAC (Role-Based Access Control) 기반 관리자 권한 시스템입니다.

**파일 위치**: `src/lib/admin/permissions.js`

---

## 역할 (Roles)

| 역할 | 설명 | 권한 수준 |
|------|------|-----------|
| VIEWER | 조회 전용 | 최소 |
| MODERATOR | 콘텐츠 모더레이션 | 중간 |
| ADMIN | 사용자/스터디 관리 | 높음 |
| SUPER_ADMIN | 모든 권한 | 최고 |

---

## 권한 정의

### PERMISSIONS 상수

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
};
```

---

## 역할별 권한 매핑

### VIEWER

조회 전용 권한입니다.

```javascript
VIEWER: [
  PERMISSIONS.USER_VIEW,
  PERMISSIONS.USER_SEARCH,
  PERMISSIONS.STUDY_VIEW,
  PERMISSIONS.REPORT_VIEW,
  PERMISSIONS.CONTENT_VIEW,
  PERMISSIONS.ANALYTICS_VIEW,
]
```

### MODERATOR

콘텐츠 모더레이션 권한입니다.

```javascript
MODERATOR: [
  // VIEWER 권한 포함
  ...Object.values(PERMISSIONS).filter(p => 
    p.endsWith(':view') || p.endsWith(':search')
  ),

  // 추가 권한
  PERMISSIONS.USER_WARN,
  PERMISSIONS.REPORT_ASSIGN,
  PERMISSIONS.REPORT_PROCESS,
  PERMISSIONS.REPORT_RESOLVE,
  PERMISSIONS.REPORT_REJECT,
  PERMISSIONS.CONTENT_DELETE,
  PERMISSIONS.STUDY_HIDE,
]
```

### ADMIN

사용자/스터디 관리 권한입니다.

```javascript
ADMIN: [
  // MODERATOR 권한 포함
  ...Object.values(PERMISSIONS).filter(p =>
    !p.startsWith('admin:') && !p.includes('SETTINGS_UPDATE')
  ),

  // 추가 권한
  PERMISSIONS.USER_SUSPEND,
  PERMISSIONS.USER_UNSUSPEND,
  PERMISSIONS.USER_UPDATE,
  PERMISSIONS.STUDY_CLOSE,
  PERMISSIONS.STUDY_DELETE,
  PERMISSIONS.STUDY_RECOMMEND,
  PERMISSIONS.AUDIT_VIEW,
]
```

### SUPER_ADMIN

모든 권한입니다.

```javascript
SUPER_ADMIN: Object.values(PERMISSIONS) // 모든 권한
```

---

## 권한 확인 함수

### hasPermission

```javascript
/**
 * 역할이 특정 권한을 가지고 있는지 확인
 * @param {string} role - 관리자 역할
 * @param {string} permission - 확인할 권한
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) return false;
  return rolePermissions.includes(permission);
}
```

### getDefaultPermissions

```javascript
/**
 * 역할의 기본 권한 목록 조회
 * @param {string} role - 관리자 역할
 * @returns {string[]}
 */
export function getDefaultPermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}
```

---

## 권한 확인 미들웨어

### requireAdmin

```javascript
import { requireAdmin } from '@/lib/admin/auth';
import { PERMISSIONS } from '@/lib/admin/permissions';

export async function GET(request) {
  // 단일 권한 확인
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW);
  if (auth instanceof NextResponse) return auth;

  const { user, adminRole } = auth;
  // ...
}

export async function POST(request) {
  // 다중 권한 확인
  const auth = await requireAdmin(request, [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_SUSPEND
  ]);
  if (auth instanceof NextResponse) return auth;
  // ...
}
```

---

## 처리 흐름

```
1. 세션 확인 (getServerSession)
   └── 실패: 401 "로그인이 필요합니다"

2. AdminRole 조회 (prisma.adminRole.findUnique)
   └── 없음: 403 "관리자 권한이 없습니다"

3. 역할 만료 확인 (expiresAt)
   └── 만료: 403 "관리자 권한이 만료되었습니다"

4. 필요 권한 확인 (hasPermission)
   └── 권한 없음: 403 "해당 작업을 수행할 권한이 없습니다"

5. 성공: { user, adminRole } 반환
```

---

## 권한 계층 구조

```
SUPER_ADMIN
    │
    └── ADMIN
           │
           └── MODERATOR
                   │
                   └── VIEWER
```

각 상위 역할은 하위 역할의 모든 권한을 포함합니다.

---

## 커스텀 권한

AdminRole 모델의 `permissions` 필드를 통해 개별 사용자에게 커스텀 권한을 부여할 수 있습니다.

```javascript
// 커스텀 권한이 있는 경우
const adminRole = {
  role: 'MODERATOR',
  permissions: ['user:suspend']  // 추가 권한
};

// 권한 확인 시 기본 권한 + 커스텀 권한 모두 확인
```

---

## 관련 문서

- [README](./README.md)
- [API](./api.md)
- [화면](./screens.md)
- [예외](./exceptions.md)

