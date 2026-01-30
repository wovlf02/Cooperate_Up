# 👤 그룹 멤버 API

## 개요

그룹의 멤버 관리(조회, 추가, 제거), 가입/탈퇴, 초대 기능 API입니다.

---

## API 엔드포인트 목록

### 멤버 관리

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/groups/[id]/members` | 멤버 목록 조회 | 멤버 |
| POST | `/api/groups/[id]/members` | 멤버 추가 | ADMIN 이상 |
| DELETE | `/api/groups/[id]/members` | 멤버 제거/강퇴 | ADMIN 이상 |

### 가입/탈퇴

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| POST | `/api/groups/[id]/join` | 그룹 가입 | 인증 필요 |
| POST | `/api/groups/[id]/leave` | 그룹 탈퇴 | 멤버 |

### 초대

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/groups/[id]/invites` | 초대 목록 조회 | 멤버 |
| POST | `/api/groups/[id]/invites` | 초대 생성 | ADMIN 이상 |
| DELETE | `/api/groups/[id]/invites` | 초대 취소 | ADMIN 이상 |

---

## GET /api/groups/[id]/members

멤버 목록을 조회합니다.

### Query Parameters

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| status | string | X | - | 상태 필터 (ACTIVE, PENDING, LEFT, KICKED) |
| role | string | X | - | 역할 필터 (OWNER, ADMIN, MEMBER) |
| page | number | X | 1 | 페이지 번호 |
| limit | number | X | 20 | 페이지당 항목 수 (최대 100) |

### 응답 예시

```json
{
  "success": true,
  "data": [
    {
      "id": "member-uuid-1",
      "role": "OWNER",
      "status": "ACTIVE",
      "createdAt": "2025-01-01T00:00:00Z",
      "user": {
        "id": "user-uuid-1",
        "name": "홍길동",
        "email": "hong@example.com",
        "avatarUrl": null
      }
    },
    {
      "id": "member-uuid-2",
      "role": "ADMIN",
      "status": "ACTIVE",
      "createdAt": "2025-01-02T00:00:00Z",
      "user": {
        "id": "user-uuid-2",
        "name": "김철수",
        "email": "kim@example.com",
        "avatarUrl": null
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

### 정렬

- 역할 순서: OWNER > ADMIN > MEMBER
- 동일 역할 내에서는 가입 날짜순

---

## POST /api/groups/[id]/members

멤버를 직접 추가합니다.

### 권한

- ADMIN 이상 권한 필요

### Request Body

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| userId | string | ✓ | - | 추가할 사용자 ID |
| role | string | X | MEMBER | 역할 (ADMIN, MEMBER) |

### 요청 예시

```json
{
  "userId": "user-uuid-3",
  "role": "MEMBER"
}
```

### 응답 예시

```json
{
  "success": true,
  "data": {
    "id": "member-uuid-3",
    "role": "MEMBER",
    "status": "ACTIVE",
    "user": {
      "id": "user-uuid-3",
      "name": "이영희",
      "email": "lee@example.com"
    }
  },
  "message": "멤버가 성공적으로 추가되었습니다."
}
```

### 처리 로직

1. ADMIN 권한 확인
2. 사용자 존재 확인
3. 강퇴 이력 확인 (KICKED 상태인 경우 재가입 불가)
4. 기존 멤버 확인
   - ACTIVE/PENDING: 이미 멤버 에러
   - LEFT: 재가입 처리
5. 정원 확인
6. 새 멤버 추가

---

## DELETE /api/groups/[id]/members

멤버를 제거하거나 강퇴합니다.

### 권한

- ADMIN 이상 권한 필요

### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| userId | string | ✓ | 제거할 사용자 ID |
| kick | boolean | X | true: 강퇴(KICKED), false: 제거(LEFT) |

### 제약 조건

- OWNER는 제거 불가
- 자기 자신 제거 불가
- 역할 계층 준수 (ADMIN은 ADMIN 이상 제거 불가)

### 응답 예시

```json
{
  "success": true,
  "message": "멤버가 강퇴되었습니다."
}
```

### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "GROUP-CANNOT-MODIFY-OWNER",
    "message": "OWNER를 제거할 수 없습니다."
  }
}
```

---

## POST /api/groups/[id]/join

그룹에 가입합니다.

### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| inviteCode | string | X | 초대 코드 |

### 가입 로직

```
1. 그룹 존재 확인
2. 모집 상태 확인 (isRecruiting)
3. 강퇴 이력 확인
4. 기존 멤버 확인
   - ACTIVE: 이미 멤버 에러
   - PENDING: 이미 대기 중 에러
   - LEFT: 재가입 처리
5. 정원 확인
6. 가입 상태 결정
   - 초대 코드 있음: ACTIVE
   - 공개 그룹: ACTIVE
   - 비공개 그룹: PENDING
7. 멤버 생성
```

### 응답 예시 (공개 그룹)

```json
{
  "success": true,
  "data": {
    "memberId": "member-uuid-1",
    "status": "ACTIVE"
  },
  "message": "그룹에 성공적으로 가입되었습니다."
}
```

### 응답 예시 (비공개 그룹)

```json
{
  "success": true,
  "data": {
    "memberId": "member-uuid-1",
    "status": "PENDING"
  },
  "message": "가입 요청이 전송되었습니다. 승인을 기다려주세요."
}
```

---

## POST /api/groups/[id]/leave

그룹에서 탈퇴합니다.

### 탈퇴 로직

1. 그룹 존재 확인
2. 멤버 확인 (ACTIVE 상태만 탈퇴 가능)
3. OWNER인 경우 다른 ADMIN 존재 확인
4. 멤버 상태를 LEFT로 변경

### 응답 예시

```json
{
  "success": true,
  "message": "그룹에서 성공적으로 탈퇴했습니다."
}
```

### 에러 응답 (OWNER인 경우)

```json
{
  "success": false,
  "error": {
    "code": "GROUP-OWNER-CANNOT-LEAVE",
    "message": "다른 ADMIN이 없어 탈퇴할 수 없습니다. 먼저 다른 멤버를 ADMIN으로 지정해주세요."
  }
}
```

---

## GET /api/groups/[id]/invites

초대 목록을 조회합니다.

### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| status | string | - | 상태 필터 (PENDING, ACCEPTED, EXPIRED) |
| page | number | 1 | 페이지 번호 |
| limit | number | 20 | 페이지당 항목 수 |

### 응답 예시

```json
{
  "success": true,
  "data": [
    {
      "id": "invite-uuid-1",
      "code": "ABC123",
      "status": "PENDING",
      "expiresAt": "2025-01-08T00:00:00Z",
      "createdAt": "2025-01-01T00:00:00Z",
      "invitedBy": {
        "id": "user-uuid-1",
        "name": "홍길동"
      },
      "invitedUser": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## POST /api/groups/[id]/invites

초대를 생성합니다.

### 권한

- ADMIN 이상 권한 필요

### Request Body

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| userId | string | X | - | 초대할 사용자 ID |
| email | string | X | - | 초대할 이메일 |
| expiresInDays | number | X | 7 | 만료 기간 (일) |

### 응답 예시

```json
{
  "success": true,
  "data": {
    "id": "invite-uuid-1",
    "code": "ABC123XYZ",
    "expiresAt": "2025-01-08T00:00:00Z"
  },
  "message": "초대가 생성되었습니다."
}
```

---

## 역할 계층

```javascript
const ROLE_HIERARCHY = {
  OWNER: 3,  // 최상위
  ADMIN: 2,
  MEMBER: 1
};
```

### 관리 권한 규칙

- OWNER: 모든 멤버 관리 가능
- ADMIN: MEMBER만 관리 가능
- MEMBER: 관리 권한 없음

---

## 멤버 상태 전환

```
[가입]
  ├─ 공개 그룹/초대코드 → ACTIVE
  └─ 비공개 그룹 → PENDING → (승인) → ACTIVE

[탈퇴]
  ACTIVE → LEFT (재가입 가능)

[강퇴]
  ACTIVE → KICKED (재가입 불가)

[재가입]
  LEFT → ACTIVE/PENDING
```

---

## 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| GROUP-MEMBER-NOT-FOUND | 404 | 멤버 없음 |
| GROUP-ALREADY-MEMBER | 409 | 이미 멤버 |
| GROUP-ALREADY-PENDING | 409 | 이미 대기 중 |
| GROUP-KICKED-MEMBER | 403 | 강퇴된 멤버 |
| GROUP-CANNOT-MODIFY-OWNER | 403 | OWNER 수정 불가 |
| GROUP-CANNOT-MODIFY-SELF | 403 | 자기 자신 수정 불가 |
| GROUP-OWNER-CANNOT-LEAVE | 403 | OWNER 탈퇴 불가 |
| GROUP-CAPACITY-FULL | 400 | 정원 초과 |
| GROUP-INVITE-INVALID | 400 | 유효하지 않은 초대 |
| GROUP-INVITE-EXPIRED | 400 | 만료된 초대 |

---

## 관련 코드

```
src/app/api/groups/[id]/
├── members/
│   └── route.js     # GET, POST, DELETE
├── join/
│   └── route.js     # POST
├── leave/
│   └── route.js     # POST
└── invites/
    └── route.js     # GET, POST, DELETE
```

