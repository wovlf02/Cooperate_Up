# 🔧 스터디 헬퍼

## 파일 목록

| 파일 | 경로 | 설명 |
|------|------|------|
| study-helpers.js | `src/lib/` | 스터디 관련 헬퍼 |
| study-utils.js | `src/lib/utils/` | 스터디 유틸리티 |

---

## study-helpers.js

### 경로

`src/lib/study-helpers.js`

### 함수 목록

#### getStudyRole

사용자의 스터디 내 역할을 반환합니다.

```javascript
async function getStudyRole(studyId, userId) {
  const member = await prisma.studyMember.findUnique({
    where: { studyId_userId: { studyId, userId } }
  })
  return member?.role || null
}
```

#### checkStudyPermission

특정 권한이 있는지 확인합니다.

```javascript
function checkStudyPermission(userRole, requiredRole) {
  const roleHierarchy = { MEMBER: 0, ADMIN: 1, OWNER: 2 }
  return (roleHierarchy[userRole] ?? -1) >= (roleHierarchy[requiredRole] ?? 0)
}
```

#### canJoinStudy

스터디에 가입 가능한지 확인합니다.

```javascript
async function canJoinStudy(studyId, userId) {
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    include: { _count: { select: { members: { where: { status: 'ACTIVE' } } } } }
  })
  
  if (!study.isRecruiting) return { canJoin: false, reason: 'NOT_RECRUITING' }
  if (study._count.members >= study.maxMembers) return { canJoin: false, reason: 'FULL' }
  
  const existing = await prisma.studyMember.findUnique({
    where: { studyId_userId: { studyId, userId } }
  })
  if (existing) return { canJoin: false, reason: 'ALREADY_MEMBER' }
  
  return { canJoin: true }
}
```

---

## study-utils.js

### 경로

`src/lib/utils/study-utils.js`

### 에러 핸들러

```javascript
export function withStudyErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      if (error instanceof StudyException) {
        return NextResponse.json(
          { error: error.code, message: error.message },
          { status: error.statusCode }
        )
      }
      // 기타 에러 처리
    }
  }
}
```

### 응답 헬퍼

```javascript
export function createSuccessResponse(data, message) {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}

export function createPaginatedResponse(data, total, page, limit) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
}
```

---

## 관련 문서

- [CRUD API](./api-crud.md) - 스터디 API
- [예외 처리](./exceptions.md) - 예외 정의

