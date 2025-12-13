/**
 * 관리자 권한 시스템
 *
 * RBAC (Role-Based Access Control) 구현
 * - VIEWER: 조회만 가능
 * - MODERATOR: 콘텐츠 모더레이션
 * - ADMIN: 사용자/스터디 관리
 * - SUPER_ADMIN: 모든 권한
 */

// 권한 정의
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

// 역할별 권한 매핑
export const ROLE_PERMISSIONS = {
  VIEWER: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_SEARCH,
    PERMISSIONS.STUDY_VIEW,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
  ],

  MODERATOR: [
    // VIEWER 권한 포함
    ...Object.values(PERMISSIONS).filter(p => p.endsWith(':view') || p.endsWith(':search')),

    // 추가 권한
    PERMISSIONS.USER_WARN,
    PERMISSIONS.REPORT_ASSIGN,
    PERMISSIONS.REPORT_PROCESS,
    PERMISSIONS.REPORT_RESOLVE,
    PERMISSIONS.REPORT_REJECT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.STUDY_HIDE,
  ],

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
  ],

  SUPER_ADMIN: Object.values(PERMISSIONS), // 모든 권한
}

/**
 * 역할에 특정 권한이 있는지 확인
 * @param {string} role - 관리자 역할
 * @param {string} permission - 확인할 권한
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) {
    return false
  }

  if (role === 'SUPER_ADMIN') {
    return true
  }

  return ROLE_PERMISSIONS[role].includes(permission)
}

/**
 * 역할에 여러 권한이 모두 있는지 확인
 * @param {string} role - 관리자 역할
 * @param {string[]} permissions - 확인할 권한 배열
 * @returns {boolean}
 */
export function hasAllPermissions(role, permissions) {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * 역할에 권한 중 하나라도 있는지 확인
 * @param {string} role - 관리자 역할
 * @param {string[]} permissions - 확인할 권한 배열
 * @returns {boolean}
 */
export function hasAnyPermission(role, permissions) {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * 세부 권한 JSON 검증
 * @param {Object} permissions - 권한 JSON
 * @returns {boolean}
 */
export function validatePermissions(permissions) {
  if (!permissions || typeof permissions !== 'object') {
    return false
  }

  // "all": true인 경우 (SUPER_ADMIN)
  if (permissions.all === true) {
    return true
  }

  // 각 권한이 유효한지 확인
  const validPermissions = Object.values(PERMISSIONS)
  const userPermissions = Object.values(permissions)

  return userPermissions.every(p => validPermissions.includes(p))
}

/**
 * 역할로부터 기본 권한 JSON 생성
 * @param {string} role - 관리자 역할
 * @returns {Object}
 */
export function getDefaultPermissions(role) {
  if (role === 'SUPER_ADMIN') {
    return { all: true }
  }

  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.reduce((acc, permission) => {
    acc[permission] = true
    return acc
  }, {})
}

/**
 * 권한 비교 (업그레이드/다운그레이드 확인)
 * @param {string} fromRole - 기존 역할
 * @param {string} toRole - 새 역할
 * @returns {'upgrade'|'downgrade'|'same'}
 */
export function compareRoles(fromRole, toRole) {
  const roleHierarchy = {
    VIEWER: 1,
    MODERATOR: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  }

  const fromLevel = roleHierarchy[fromRole] || 0
  const toLevel = roleHierarchy[toRole] || 0

  if (fromLevel === toLevel) return 'same'
  return toLevel > fromLevel ? 'upgrade' : 'downgrade'
}

/**
 * 리소스별 권한 체크 (세부 권한)
 * @param {Object} adminRole - 관리자 역할 정보
 * @param {string} resource - 리소스 타입 (user, study, report 등)
 * @param {string} action - 액션 (view, edit, delete 등)
 * @returns {boolean}
 */
export function canAccessResource(adminRole, resource, action) {
  if (!adminRole || !adminRole.permissions) {
    return false
  }

  // SUPER_ADMIN은 모든 접근 허용
  if (adminRole.permissions.all === true) {
    return true
  }

  // 권한 키 생성 (예: "user:view", "study:delete")
  const permissionKey = `${resource}:${action}`

  return adminRole.permissions[permissionKey] === true
}

/**
 * 권한 요약 정보 생성 (UI 표시용)
 * @param {string} role - 관리자 역할
 * @returns {Object}
 */
export function getPermissionSummary(role) {
  if (!ROLE_PERMISSIONS[role]) {
    return { role, permissions: [], count: 0 }
  }

  const permissions = ROLE_PERMISSIONS[role]
  const categories = {
    user: permissions.filter(p => p.startsWith('user:')).length,
    study: permissions.filter(p => p.startsWith('study:')).length,
    report: permissions.filter(p => p.startsWith('report:')).length,
    content: permissions.filter(p => p.startsWith('content:')).length,
    analytics: permissions.filter(p => p.startsWith('analytics:')).length,
    settings: permissions.filter(p => p.startsWith('settings:')).length,
    audit: permissions.filter(p => p.startsWith('audit:')).length,
    admin: permissions.filter(p => p.startsWith('admin:')).length,
  }

  return {
    role,
    permissions,
    count: permissions.length,
    categories,
    isFullAccess: role === 'SUPER_ADMIN',
  }
}

