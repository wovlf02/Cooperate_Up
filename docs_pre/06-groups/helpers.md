# 🛠️ 그룹 헬퍼 함수

## 개요

그룹 도메인의 핵심 비즈니스 로직을 담당하는 헬퍼 함수 모음입니다.

**파일 위치**: `src/lib/helpers/group-helpers.js`

---

## 함수 분류

| 분류 | 함수 개수 | 설명 |
|------|----------|------|
| 응답 포맷팅 | 3개 | 클라이언트 응답 형식 변환 |
| 역할 계층 관리 | 2개 | 역할 비교 및 계층 처리 |
| 그룹 상태 관리 | 5개 | 그룹 존재, 접근, 정원 확인 |
| 멤버 역할 관리 | 5개 | 멤버 조회, 역할 변경 |
| 초대 코드 관리 | 5개 | 초대 코드 생성/검증 |
| 권한 검증 | 4개 | 권한 확인 및 검증 |

---

## 1. 응답 포맷팅

### formatGroupResponse

그룹 정보를 클라이언트 응답 형식으로 변환합니다.

```javascript
function formatGroupResponse(group) {
  if (!group) return null;

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    category: group.category,
    isPublic: group.isPublic,
    isRecruiting: group.isRecruiting,
    maxMembers: group.maxMembers,
    imageUrl: group.imageUrl,
    createdBy: group.createdBy,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    memberCount: group._count?.members || 0
  };
}
```

### formatMemberResponse

멤버 정보를 클라이언트 응답 형식으로 변환합니다.

```javascript
function formatMemberResponse(member) {
  if (!member) return null;

  return {
    id: member.id,
    role: member.role,
    status: member.status,
    joinedAt: member.joinedAt,
    user: member.user ? {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatar: member.user.avatar
    } : null
  };
}
```

### formatInviteResponse

초대 정보를 클라이언트 응답 형식으로 변환합니다.

```javascript
function formatInviteResponse(invite) {
  if (!invite) return null;

  return {
    id: invite.id,
    code: invite.code,
    status: invite.status,
    expiresAt: invite.expiresAt,
    maxUses: invite.maxUses,
    usedCount: invite.usedCount,
    createdBy: invite.createdBy,
    createdAt: invite.createdAt
  };
}
```

---

## 2. 역할 계층 관리

### ROLE_HIERARCHY

역할 계층 정의입니다.

```javascript
const ROLE_HIERARCHY = {
  OWNER: 3,   // 최상위
  ADMIN: 2,
  MEMBER: 1
};
```

### getRoleHierarchy

역할의 계층 순위를 반환합니다.

```javascript
function getRoleHierarchy(role) {
  return ROLE_HIERARCHY[role] || 0;
}

// 사용 예시
getRoleHierarchy('OWNER'); // 3
getRoleHierarchy('ADMIN'); // 2
getRoleHierarchy('MEMBER'); // 1
```

### compareRoles

두 역할을 비교합니다.

```javascript
function compareRoles(role1, role2) {
  return getRoleHierarchy(role1) - getRoleHierarchy(role2);
}

// 사용 예시
compareRoles('OWNER', 'ADMIN'); // 1 (role1이 높음)
compareRoles('ADMIN', 'OWNER'); // -1 (role2가 높음)
compareRoles('ADMIN', 'ADMIN'); // 0 (같음)
```

---

## 3. 그룹 상태 관리

### checkGroupExists

그룹 존재 여부를 확인합니다.

```javascript
async function checkGroupExists(groupId, prisma)

// 성공: 그룹 객체 반환
// 실패: GroupBusinessException.groupNotFound() 또는 groupDeleted()
```

**사용 예시**:
```javascript
const group = await checkGroupExists('group-123', prisma);
```

### checkGroupAccessible

그룹 접근 가능 여부를 확인합니다.

```javascript
async function checkGroupAccessible(groupId, userId, prisma)

// 공개 그룹: 모든 사용자 접근 가능
// 비공개 그룹: 멤버만 접근 가능
// 실패: GroupBusinessException.privateGroupAccessDenied()
```

### checkGroupRecruiting

그룹 모집 중인지 확인합니다.

```javascript
async function checkGroupRecruiting(groupId, prisma)

// 실패: GroupBusinessException.recruitmentClosed()
```

### checkGroupCapacity

그룹 정원을 확인합니다.

```javascript
async function checkGroupCapacity(groupId, prisma)

// 반환: { hasCapacity: boolean, current: number, max: number }
// 정원 초과 시: GroupBusinessException.capacityFull()
```

### getGroupWithMembers

멤버를 포함한 그룹 정보를 조회합니다.

```javascript
async function getGroupWithMembers(groupId, prisma)

// 반환: Group + active members
```

---

## 4. 멤버 역할 관리

### getMemberRole

멤버의 역할을 조회합니다.

```javascript
async function getMemberRole(groupId, userId, prisma)

// 반환: 'OWNER' | 'ADMIN' | 'MEMBER'
// 실패: GroupMemberException.memberNotFound() 또는 memberNotActive()
```

### checkMemberExists

멤버 존재 여부를 확인합니다.

```javascript
async function checkMemberExists(groupId, userId, prisma)

// 반환: member 객체
// 실패: GroupMemberException.memberNotFound()
```

### checkMemberKicked

강퇴된 멤버인지 확인합니다.

```javascript
async function checkMemberKicked(groupId, userId, prisma)

// 반환: false (강퇴 아님)
// 실패: GroupMemberException.memberKicked()
```

**별칭**: `checkKickedHistory`

### checkMemberCapacity

멤버 추가 시 정원을 확인합니다.

```javascript
async function checkMemberCapacity(groupId, newMemberCount, prisma)

// 실패: GroupBusinessException.capacityFull()
```

### updateMemberRole

멤버 역할을 변경합니다.

```javascript
async function updateMemberRole(groupId, userId, newRole, prisma)

// OWNER 역할은 변경 불가
// 실패: GroupPermissionException.cannotChangeOwnerRole()
```

---

## 5. 초대 코드 관리

### generateInviteCode

12자리 영숫자 초대 코드를 생성합니다.

```javascript
function generateInviteCode()

// 반환: 'ABC123DEF456' (12자리)
```

**구현**:
```javascript
export function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}
```

### validateInviteCodeExists

초대 코드 존재 여부를 확인합니다.

```javascript
async function validateInviteCodeExists(code, prisma)

// 반환: invite 객체
// 실패: GroupInviteException.invalidInviteCode()
```

### checkInviteCodeExpired

초대 코드 만료 여부를 확인합니다.

```javascript
async function checkInviteCodeExpired(inviteId, prisma)

// 실패: GroupInviteException.inviteExpired()
```

### checkInviteCodeUsed

초대 코드 사용 여부를 확인합니다.

```javascript
async function checkInviteCodeUsed(inviteId, prisma)

// 실패: GroupInviteException.inviteAlreadyUsed()
```

---

## 6. 권한 검증

### checkGroupMembership

그룹 멤버인지 확인합니다.

```javascript
async function checkGroupMembership(groupId, userId, prisma)

// 반환: member 객체
// 실패: GroupPermissionException.notAMember()
```

### checkGroupPermission

특정 권한이 있는지 확인합니다.

```javascript
async function checkGroupPermission(groupId, userId, requiredRole, prisma)

// requiredRole: 'OWNER' | 'ADMIN' | 'MEMBER'
// 성공: member 객체 반환
// 실패: GroupPermissionException.insufficientPermission()
```

### checkGroupAccess

그룹 접근 권한을 확인합니다.

```javascript
async function checkGroupAccess(groupId, userId, prisma)

// 공개 그룹: 항상 접근 가능
// 비공개 그룹: 멤버만 접근 가능
```

### canManageMember

대상 멤버를 관리할 수 있는지 확인합니다.

```javascript
function canManageMember(myRole, targetRole)

// OWNER: 모든 역할 관리 가능
// ADMIN: MEMBER만 관리 가능
// MEMBER: 관리 불가
```

**구현**:
```javascript
export function canManageMember(myRole, targetRole) {
  if (myRole === 'OWNER') return true;
  if (myRole === 'ADMIN' && targetRole === 'MEMBER') return true;
  return false;
}
```

---

## 에러 처리 패턴

모든 헬퍼 함수는 다음 패턴으로 에러를 처리합니다:

```javascript
async function someHelper(params, prisma) {
  try {
    // 비즈니스 로직
  } catch (error) {
    // 이미 GroupException인 경우 그대로 전파
    if (error.code?.startsWith('GROUP-')) {
      throw error;
    }
    
    // 일반 에러는 로깅 후 DB 에러로 변환
    GroupLogger.error('Failed to ...', { error: error.message });
    throw GroupBusinessException.databaseError('functionName', error.message);
  }
}
```

---

## 관련 문서

- [예외 클래스](./exceptions.md)
- [검증 함수](./validators.md)
- [API 문서](./api.md)

