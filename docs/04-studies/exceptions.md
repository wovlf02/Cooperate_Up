# ⚠️ 스터디 예외 처리

## 파일 위치

`src/lib/exceptions/study.js`

---

## 예외 클래스

### StudyException (기본)

```javascript
export class StudyException extends Error {
  constructor(code, message, statusCode = 400) {
    super(message)
    this.name = 'StudyException'
    this.code = code
    this.statusCode = statusCode
  }
}
```

### StudyNotFoundException

```javascript
export class StudyNotFoundException extends StudyException {
  constructor(studyId) {
    super(
      'STUDY_NOT_FOUND',
      '스터디를 찾을 수 없습니다',
      404
    )
    this.studyId = studyId
  }
}
```

### StudyPermissionException

```javascript
export class StudyPermissionException extends StudyException {
  constructor(requiredRole, userRole) {
    super(
      'PERMISSION_DENIED',
      '권한이 부족합니다',
      403
    )
    this.requiredRole = requiredRole
    this.userRole = userRole
  }
}
```

### StudyMemberException

```javascript
export class StudyMemberException extends StudyException {
  constructor(code, message) {
    super(code, message, 400)
  }
}
```

### StudyValidationException

```javascript
export class StudyValidationException extends StudyException {
  constructor(errors) {
    super(
      'VALIDATION_ERROR',
      '입력값이 올바르지 않습니다',
      400
    )
    this.errors = errors
  }
}
```

---

## 에러 코드 목록

| 코드 | 상태 | 설명 |
|------|------|------|
| `STUDY_NOT_FOUND` | 404 | 스터디를 찾을 수 없음 |
| `PERMISSION_DENIED` | 403 | 권한 부족 |
| `NOT_A_MEMBER` | 403 | 멤버가 아님 |
| `ALREADY_MEMBER` | 409 | 이미 멤버 |
| `NOT_RECRUITING` | 400 | 모집 마감 |
| `STUDY_FULL` | 400 | 정원 초과 |
| `CANNOT_LEAVE_AS_OWNER` | 400 | 소유자 탈퇴 불가 |
| `CANNOT_KICK_SELF` | 400 | 자기 추방 불가 |
| `CANNOT_KICK_OWNER` | 400 | 소유자 추방 불가 |
| `VALIDATION_ERROR` | 400 | 입력값 오류 |

---

## 사용 예시

```javascript
import { 
  StudyNotFoundException, 
  StudyPermissionException 
} from '@/lib/exceptions/study'

// 스터디 조회
const study = await prisma.study.findUnique({ where: { id } })
if (!study) {
  throw new StudyNotFoundException(id)
}

// 권한 확인
if (member.role !== 'OWNER') {
  throw new StudyPermissionException('OWNER', member.role)
}
```

---

## 관련 문서

- [헬퍼](./helpers.md) - 에러 핸들러
- [CRUD API](./api-crud.md) - API 에러 처리

