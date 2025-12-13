# ⚠️ 그룹 예외 클래스

## 개요

그룹 도메인의 예외 처리를 위한 클래스 계층 구조입니다.

**파일 위치**: `src/lib/exceptions/group/`

---

## 클래스 계층

```
GroupException (Base)
├── GroupValidationException    # 입력 검증 (GROUP-001 ~ GROUP-020)
├── GroupPermissionException    # 권한 (GROUP-021 ~ GROUP-026)
├── GroupMemberException        # 멤버 (GROUP-027 ~ GROUP-040)
├── GroupInviteException        # 초대 (GROUP-042 ~ GROUP-057)
└── GroupBusinessException      # 비즈니스 (GROUP-058 ~ GROUP-076)
```

---

## GroupException (Base)

모든 그룹 예외의 기본 클래스입니다.

### 생성자

```javascript
constructor(
  message,                    // 기본 메시지
  code,                       // 에러 코드 (GROUP-XXX)
  statusCode = 400,           // HTTP 상태 코드
  securityLevel = 'medium',   // 보안 수준
  context = {}                // 추가 컨텍스트
)
```

### 속성

| 속성 | 타입 | 설명 |
|------|------|------|
| name | string | 예외 클래스 이름 |
| code | string | 에러 코드 |
| message | string | 에러 메시지 |
| userMessage | string | 사용자용 메시지 |
| devMessage | string | 개발자용 메시지 |
| statusCode | number | HTTP 상태 코드 |
| securityLevel | string | 보안 수준 (critical/high/medium/low) |
| domain | string | 도메인 ('GROUP') |
| retryable | boolean | 재시도 가능 여부 |
| timestamp | string | 발생 시간 |
| context | object | 추가 컨텍스트 |
| category | string | 카테고리 |

### toJSON()

예외를 JSON 형식으로 변환합니다.

```javascript
{
  name: "GroupException",
  code: "GROUP-001",
  message: "그룹 이름을 입력해주세요.",
  userMessage: "그룹 이름을 입력해주세요.",
  devMessage: "그룹 이름을 입력해주세요.",
  statusCode: 400,
  securityLevel: "medium",
  domain: "GROUP",
  retryable: false,
  timestamp: "2025-01-01T00:00:00.000Z",
  context: { field: "name", type: "required" },
  category: "validation"
}
```

---

## GroupValidationException

입력 검증 실패 시 발생하는 예외입니다.

### 에러 코드 (GROUP-001 ~ GROUP-020)

| 코드 | 메서드 | 설명 |
|------|--------|------|
| GROUP-001 | `nameRequired()` | 이름 필수 |
| GROUP-002 | `nameTooShort(min)` | 이름 너무 짧음 |
| GROUP-003 | `nameTooLong(max)` | 이름 너무 김 |
| GROUP-004 | `nameDuplicate(name)` | 이름 중복 |
| GROUP-005 | `nameInvalidCharacters()` | 이름 특수문자 |
| GROUP-006 | `descriptionRequired()` | 설명 필수 |
| GROUP-007 | `descriptionTooShort(min)` | 설명 너무 짧음 |
| GROUP-008 | `descriptionTooLong(max)` | 설명 너무 김 |
| GROUP-009 | `categoryRequired()` | 카테고리 필수 |
| GROUP-010 | `categoryInvalid(category)` | 유효하지 않은 카테고리 |
| GROUP-011 | `categoryNotFound(category)` | 카테고리 없음 |
| GROUP-012 | `capacityRequired()` | 정원 필수 |
| GROUP-013 | `capacityTooSmall(min)` | 정원 너무 작음 |
| GROUP-014 | `capacityTooLarge(max)` | 정원 너무 큼 |
| GROUP-015 | `capacityBelowCurrentMembers()` | 현재 멤버보다 작음 |
| GROUP-016 | `visibilityRequired()` | 공개 설정 필수 |
| GROUP-017 | `tooManyTags(max)` | 태그 너무 많음 |
| GROUP-018 | `tagTooLong(tag, max)` | 태그 너무 김 |
| GROUP-019 | `invalidImageFormat(format)` | 이미지 형식 오류 |
| GROUP-020 | `imageTooLarge(size, max)` | 이미지 너무 큼 |

### 사용 예시

```javascript
import { GroupValidationException } from '@/lib/exceptions/group';

// 그룹 이름 검증
if (!name) {
  throw GroupValidationException.nameRequired();
}

if (name.length < 2) {
  throw GroupValidationException.nameTooShort(2);
}
```

---

## GroupPermissionException

권한 부족 시 발생하는 예외입니다.

### 에러 코드 (GROUP-021 ~ GROUP-026, 기타)

| 코드 | 메서드 | 설명 |
|------|--------|------|
| GROUP-021 | `ownerPermissionRequired()` | OWNER 권한 필요 |
| GROUP-022 | `adminPermissionRequired()` | ADMIN 권한 필요 |
| GROUP-023 | `insufficientPermission(message)` | 권한 부족 |
| GROUP-027 | `notActiveMember()` | 활성 멤버 아님 |
| GROUP-041 | `cannotChangeOwnerRole()` | OWNER 역할 변경 불가 |
| GROUP-060 | `cannotModifyOwner()` | OWNER 수정 불가 |
| GROUP-061 | `cannotModifySelf()` | 자기 자신 수정 불가 |
| GROUP-065 | `ownerCannotLeave()` | OWNER 탈퇴 불가 |

### 사용 예시

```javascript
import { GroupPermissionException } from '@/lib/exceptions/group';

// ADMIN 권한 확인
if (member.role === 'MEMBER') {
  throw GroupPermissionException.adminPermissionRequired(userId, 'MEMBER');
}

// OWNER 제거 시도
if (targetMember.role === 'OWNER') {
  throw GroupPermissionException.cannotModifyOwner();
}
```

---

## GroupMemberException

멤버 관리 관련 예외입니다.

### 에러 코드 (GROUP-027 ~ GROUP-040)

| 코드 | 메서드 | 설명 |
|------|--------|------|
| GROUP-027 | `memberNotActive(userId, status)` | 활성 멤버 아님 |
| GROUP-028 | `memberNotFound(userId)` | 멤버 없음 |
| GROUP-029 | `alreadyMember(userId)` | 이미 멤버 |
| GROUP-030 | `memberKicked(userId)` | 강퇴된 멤버 |
| GROUP-031 | `alreadyLeft(userId)` | 이미 탈퇴 |
| GROUP-032 | `suspendedUserCannotJoin()` | 정지 사용자 |
| GROUP-033 | `memberCapacityExceeded(capacity)` | 정원 초과 |
| GROUP-034 | `invalidRole(role)` | 유효하지 않은 역할 |
| GROUP-035 | `onlyOneOwnerAllowed()` | OWNER 1명만 |
| GROUP-036 | `atLeastOneAdminRequired()` | 최소 ADMIN 1명 |
| GROUP-037 | `targetMemberNotFound(userId)` | 대상 멤버 없음 |
| GROUP-038 | `cannotRemoveSelf()` | 자기 제거 불가 |
| GROUP-039 | `cannotRemoveOwner()` | OWNER 제거 불가 |
| GROUP-040 | `memberHasActiveTasks(count)` | 활성 태스크 있음 |

### 사용 예시

```javascript
import { GroupMemberException } from '@/lib/exceptions/group';

// 이미 멤버인 경우
if (existingMember?.status === 'ACTIVE') {
  throw GroupMemberException.alreadyMember(userId);
}

// 강퇴된 멤버 재가입 시도
if (existingMember?.status === 'KICKED') {
  throw GroupMemberException.memberKicked(userId);
}
```

---

## GroupInviteException

초대 관련 예외입니다.

### 에러 코드 (GROUP-042 ~ GROUP-057)

| 코드 | 메서드 | 설명 |
|------|--------|------|
| GROUP-042 | `inviteCodeGenerationFailed()` | 코드 생성 실패 |
| GROUP-043 | `invalidInviteCode(code)` | 유효하지 않은 코드 |
| GROUP-044 | `inviteCodeExpired(code)` | 만료된 코드 |
| GROUP-045 | `inviteCodeAlreadyUsed(code)` | 이미 사용된 코드 |
| GROUP-046 | `inviteUsageLimitExceeded(limit)` | 사용 횟수 초과 |
| GROUP-047 | `cannotInviteExistingMember(userId)` | 기존 멤버 초대 |
| GROUP-048 | `cannotInviteKickedUser(userId)` | 강퇴 멤버 초대 |
| GROUP-049 | `inviteTargetUserNotFound(email)` | 초대 대상 없음 |
| GROUP-050 | `invalidEmailFormat(email)` | 이메일 형식 오류 |
| GROUP-051 | `emailSendFailed(email, reason)` | 이메일 발송 실패 |
| GROUP-052 | `inviteNotFound(inviteId)` | 초대 없음 |
| GROUP-053 | `inviteCreationFailed(reason)` | 초대 생성 실패 |
| GROUP-054 | `inviteActionFailed(action, reason)` | 초대 액션 실패 |
| GROUP-055 | `inviteAlreadyProcessed(id, status)` | 이미 처리된 초대 |
| GROUP-056 | `cannotProcessOthersInvite(id)` | 타인 초대 처리 불가 |

### 사용 예시

```javascript
import { GroupInviteException } from '@/lib/exceptions/group';

// 초대 코드 검증
if (!invite) {
  throw GroupInviteException.invalidInviteCode(code);
}

// 만료 확인
if (invite.expiresAt < new Date()) {
  throw GroupInviteException.inviteCodeExpired(code);
}
```

---

## GroupBusinessException

비즈니스 로직 관련 예외입니다.

### 에러 코드 (GROUP-058 ~ GROUP-076)

| 코드 | 메서드 | 설명 |
|------|--------|------|
| GROUP-058 | `groupNotFound(groupId)` | 그룹 없음 |
| GROUP-059 | `groupDeleted(groupId)` | 삭제된 그룹 |
| GROUP-060 | `privateGroupAccessDenied(groupId)` | 비공개 그룹 접근 거부 |
| GROUP-061 | `insufficientPermissionToDelete()` | 삭제 권한 없음 |
| GROUP-062 | `cannotDeleteWithActiveMembers(count)` | 활성 멤버로 삭제 불가 |
| GROUP-063 | `groupDeletionFailed(reason)` | 삭제 실패 |
| GROUP-064 | `capacityFull(current, max)` | 정원 가득 참 |
| GROUP-065 | `recruitmentClosed(groupId)` | 모집 종료 |
| GROUP-066 | `inviteOnlyGroup()` | 초대만 가능 |
| GROUP-067 | `duplicateJoinRequest()` | 중복 가입 요청 |
| GROUP-068 | `joinRequestPending()` | 가입 대기 중 |
| GROUP-069 | `cannotLeaveWithActiveTasks(count)` | 활성 태스크로 탈퇴 불가 |
| GROUP-070 | `leaveFailed(reason)` | 탈퇴 실패 |
| GROUP-071 | `alreadyLeftGroup()` | 이미 탈퇴함 |
| GROUP-072 | `groupSuspended(groupId, reason)` | 그룹 정지됨 |
| GROUP-073 | `databaseError(operation, details)` | DB 오류 |
| GROUP-074 | `noUpdateData()` | 수정 데이터 없음 |

### 사용 예시

```javascript
import { GroupBusinessException } from '@/lib/exceptions/group';

// 그룹 존재 확인
if (!group) {
  throw GroupBusinessException.groupNotFound(groupId);
}

// 정원 확인
if (currentMembers >= maxMembers) {
  throw GroupBusinessException.capacityFull(currentMembers, maxMembers);
}
```

---

## API 에러 응답 패턴

```javascript
try {
  // 비즈니스 로직
} catch (error) {
  // GroupException 계열인 경우
  if (error.code?.startsWith('GROUP-')) {
    return NextResponse.json(
      { success: false, error: error.toJSON() },
      { status: error.statusCode }
    );
  }

  // 일반 에러
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'GROUP-INTERNAL-ERROR',
        message: '서버 오류가 발생했습니다.'
      }
    },
    { status: 500 }
  );
}
```

---

## 관련 문서

- [헬퍼 함수](./helpers.md)
- [검증 함수](./validators.md)
- [API 문서](./api.md)

