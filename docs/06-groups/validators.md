# ✅ 그룹 검증 함수

## 개요

그룹 도메인의 입력 데이터 검증 함수 모음입니다.

**파일 위치**: `src/lib/validators/group-validators.js`

---

## 상수 정의

```javascript
const VALID_CATEGORIES = ['study', 'project', 'hobby', 'network', 'social', 'etc'];
const VALID_ROLES = ['OWNER', 'ADMIN', 'MEMBER'];
const VALID_MEMBER_STATUS = ['PENDING', 'ACTIVE', 'LEFT', 'KICKED'];
const VALID_VISIBILITIES = ['PUBLIC', 'PRIVATE'];
const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
```

---

## 1. 그룹 필드 검증

### validateGroupName

그룹 이름을 검증합니다.

```javascript
function validateGroupName(name)
```

| 규칙 | 예외 |
|------|------|
| 필수 | `GroupValidationException.nameRequired()` |
| 최소 2자 | `GroupValidationException.nameTooShort(2)` |
| 최대 50자 | `GroupValidationException.nameTooLong(50)` |
| 특수문자 금지 | `GroupValidationException.nameInvalidCharacters()` |

**금지 특수문자**: `<>{}[]\\/`

**사용 예시**:
```javascript
validateGroupName('알고리즘 스터디'); // true
validateGroupName(''); // Error: nameRequired
validateGroupName('A'); // Error: nameTooShort
```

---

### validateDescription

그룹 설명을 검증합니다.

```javascript
function validateDescription(description)
```

| 규칙 | 예외 |
|------|------|
| 선택적 (빈 값 허용) | - |
| 최대 1000자 | `GroupValidationException.descriptionTooLong(1000)` |

---

### validateCategory

카테고리를 검증합니다.

```javascript
function validateCategory(category)
```

| 규칙 | 예외 |
|------|------|
| 필수 | `GroupValidationException.categoryRequired()` |
| 유효 값만 | `GroupValidationException.invalidCategory(category)` |

**유효 카테고리**: `study`, `project`, `hobby`, `network`, `social`, `etc`

---

### validateCapacity

정원을 검증합니다.

```javascript
function validateCapacity(capacity, currentMembers = 0)
```

| 규칙 | 예외 |
|------|------|
| 필수 | `GroupValidationException.capacityRequired()` |
| 숫자 타입 | `GroupValidationException.capacityInvalidType()` |
| 최소 2명 | `GroupValidationException.capacityTooSmall(2)` |
| 최대 200명 | `GroupValidationException.capacityTooLarge(200)` |
| 현재 멤버 이상 | `GroupValidationException.capacityBelowCurrentMembers()` |

---

### validateTags

태그를 검증합니다.

```javascript
function validateTags(tags)
```

| 규칙 | 예외 |
|------|------|
| 선택적 | - |
| 최대 10개 | `GroupValidationException.tooManyTags(10)` |
| 각 태그 최대 20자 | `GroupValidationException.tagTooLong(20)` |
| 유효한 문자열 | `GroupValidationException.invalidTagFormat(tag)` |

---

### validateImage

이미지를 검증합니다.

```javascript
function validateImage(file)
```

| 규칙 | 예외 |
|------|------|
| 선택적 | - |
| 최대 5MB | `GroupValidationException.imageTooLarge(5MB)` |
| 형식: JPEG, PNG, GIF, WEBP | `GroupValidationException.invalidImageFormat(type)` |

---

### validateVisibility

공개 설정을 검증합니다.

```javascript
function validateVisibility(isPublic)
```

| 규칙 | 예외 |
|------|------|
| 필수 | `GroupValidationException.visibilityRequired()` |
| Boolean 타입 | `GroupValidationException.visibilityInvalidType()` |

---

### validateGroupData

그룹 생성/수정 데이터를 통합 검증합니다.

```javascript
function validateGroupData(data, isUpdate = false)
```

**생성 모드 (isUpdate = false)**:
- `name`: 필수, 검증 후 trim
- `description`: 선택, 검증 후 trim
- `category`: 필수
- `maxMembers`: 기본값 50, 검증
- `isPublic`: 기본값 true, 검증

**수정 모드 (isUpdate = true)**:
- 제공된 필드만 검증

**반환값**: 검증된 데이터 객체

**사용 예시**:
```javascript
const validated = validateGroupData({
  name: '알고리즘 스터디',
  description: '매주 알고리즘 문제를 풉니다',
  category: 'study',
  maxMembers: 30,
  isPublic: true
});

// 수정 모드
const updated = validateGroupData({
  name: '알고리즘 고급 스터디'
}, true);
```

---

## 2. 멤버 검증

### validateRole

역할을 검증합니다.

```javascript
function validateRole(role)
```

| 규칙 | 예외 |
|------|------|
| 필수 | `GroupValidationException.roleRequired()` |
| 유효 값만 | `GroupValidationException.invalidRole(role)` |

**유효 역할**: `OWNER`, `ADMIN`, `MEMBER`

---

### validateMemberStatus

멤버 상태를 검증합니다.

```javascript
function validateMemberStatus(status)
```

| 규칙 | 예외 |
|------|------|
| 필수 | `GroupValidationException.statusRequired()` |
| 유효 값만 | `GroupValidationException.invalidStatus(status)` |

**유효 상태**: `PENDING`, `ACTIVE`, `LEFT`, `KICKED`

---

### validateMemberAction

멤버 액션 권한을 검증합니다.

```javascript
function validateMemberAction(action, member, requestUser)
```

| 액션 | 필요 권한 | 제약 조건 |
|------|----------|----------|
| `add` | ADMIN 이상 | - |
| `remove` | ADMIN 이상 | ADMIN은 OWNER 제거 불가 |
| `update` | OWNER만 | OWNER 역할 변경 불가 |

---

## 3. 초대 검증

### validateInviteCode

초대 코드를 검증합니다.

```javascript
function validateInviteCode(code)
```

| 규칙 | 예외 |
|------|------|
| 필수 | `GroupValidationException.inviteCodeRequired()` |
| 12자리 영숫자 | `GroupValidationException.invalidInviteCodeFormat(code)` |

---

### validateEmailFormat

이메일 형식을 검증합니다.

```javascript
function validateEmailFormat(email)
```

**반환값**: `boolean`

**구현**:
```javascript
export function validateEmailFormat(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}
```

---

## 사용 패턴

### API 라우트에서 사용

```javascript
import { validateGroupData } from '@/lib/validators/group-validators';

export async function POST(request) {
  try {
    const body = await request.json();
    const validated = validateGroupData(body);
    
    // validated 데이터로 그룹 생성
    const group = await prisma.group.create({
      data: validated
    });
  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return NextResponse.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }
    // 기타 에러 처리
  }
}
```

### 개별 필드 검증

```javascript
import {
  validateGroupName,
  validateCategory,
  validateCapacity
} from '@/lib/validators/group-validators';

// 개별 검증
validateGroupName(data.name);
validateCategory(data.category);
validateCapacity(data.maxMembers, currentMemberCount);
```

---

## 검증 규칙 요약

| 필드 | 필수 | 최소 | 최대 | 비고 |
|------|------|------|------|------|
| name | ✓ | 2자 | 50자 | 특수문자 금지 |
| description | ✗ | - | 1000자 | - |
| category | ✓ | - | - | 지정된 값만 |
| maxMembers | ✗ | 2 | 200 | 기본값 50 |
| isPublic | ✗ | - | - | 기본값 true |
| tags | ✗ | - | 10개 | 각 20자 이내 |
| image | ✗ | - | 5MB | JPEG/PNG/GIF/WEBP |

---

## 관련 문서

- [예외 클래스](./exceptions.md)
- [헬퍼 함수](./helpers.md)
- [API 문서](./api.md)

