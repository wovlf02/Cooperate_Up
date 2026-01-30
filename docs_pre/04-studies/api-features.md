# 🔌 스터디 기능 API

## 엔드포인트 목록

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/studies/[id]/join` | 스터디 가입 신청 | ✓ |
| POST | `/api/studies/[id]/leave` | 스터디 탈퇴 | ✓ (MEMBER) |
| GET | `/api/studies/[id]/invite` | 초대 코드 조회 | ✓ (ADMIN) |
| POST | `/api/studies/[id]/invite/regenerate` | 초대 코드 재생성 | ✓ (ADMIN) |
| POST | `/api/studies/[id]/transfer-ownership` | 소유권 이전 | ✓ (OWNER) |
| GET | `/api/studies/[id]/check-member` | 멤버 여부 확인 | ✓ |

---

## POST /api/studies/[id]/join

### 설명

스터디에 가입을 신청합니다.

### 파일 위치

`src/app/api/studies/[id]/join/route.js`

### Request Body

```json
{
  "introduction": "안녕하세요, 가입 신청합니다.",
  "motivation": "JavaScript를 깊이 배우고 싶습니다.",
  "level": "중급"
}
```

### 처리 흐름

1. 이미 멤버인지 확인
2. 모집 중인지 확인 (`isRecruiting`)
3. 정원 초과 확인
4. `autoApprove` 여부에 따라:
   - `true`: 바로 ACTIVE로 추가
   - `false`: PENDING으로 추가 (승인 대기)
5. 알림 전송

### Response

**자동 승인 시**
```json
{
  "success": true,
  "message": "스터디에 가입되었습니다.",
  "data": {
    "status": "ACTIVE"
  }
}
```

**승인 대기 시**
```json
{
  "success": true,
  "message": "가입 신청이 완료되었습니다. 관리자의 승인을 기다려주세요.",
  "data": {
    "status": "PENDING"
  }
}
```

### 에러 케이스

| 상태 | 메시지 |
|------|--------|
| 409 | 이미 멤버입니다 |
| 400 | 모집이 마감되었습니다 |
| 400 | 정원이 가득 찼습니다 |

---

## POST /api/studies/[id]/leave

### 설명

스터디에서 탈퇴합니다.

### 파일 위치

`src/app/api/studies/[id]/leave/route.js`

### 제약사항

- OWNER는 탈퇴 불가 (소유권 이전 후 탈퇴)
- 멤버십 상태가 LEFT로 변경됨

### Response

```json
{
  "success": true,
  "message": "스터디에서 탈퇴했습니다."
}
```

### 에러 케이스

| 상태 | 메시지 |
|------|--------|
| 400 | 소유자는 탈퇴할 수 없습니다 |
| 403 | 스터디 멤버가 아닙니다 |

---

## GET /api/studies/[id]/invite

### 설명

스터디 초대 코드를 조회합니다.

### 파일 위치

`src/app/api/studies/[id]/invite/route.js`

### 권한

ADMIN 이상

### Response

```json
{
  "success": true,
  "data": {
    "inviteCode": "abc123xyz",
    "inviteUrl": "https://coup.app/studies/join/abc123xyz"
  }
}
```

---

## POST /api/studies/[id]/invite/regenerate

### 설명

초대 코드를 새로 생성합니다. 기존 코드는 무효화됩니다.

### 파일 위치

`src/app/api/studies/[id]/invite/route.js`

### 권한

ADMIN 이상

### Response

```json
{
  "success": true,
  "data": {
    "inviteCode": "new123code",
    "inviteUrl": "https://coup.app/studies/join/new123code"
  },
  "message": "초대 코드가 재생성되었습니다."
}
```

---

## POST /api/studies/[id]/transfer-ownership

### 설명

스터디 소유권을 다른 멤버에게 이전합니다.

### 파일 위치

`src/app/api/studies/[id]/transfer-ownership/route.js`

### 권한

OWNER만

### Request Body

```json
{
  "newOwnerId": "user456"
}
```

### 처리 흐름

1. 현재 사용자가 OWNER인지 확인
2. 대상이 ACTIVE 멤버인지 확인
3. 기존 OWNER → ADMIN으로 변경
4. 새 멤버 → OWNER로 변경
5. Study.ownerId 업데이트
6. 알림 전송

### Response

```json
{
  "success": true,
  "message": "소유권이 이전되었습니다."
}
```

### 에러 케이스

| 상태 | 메시지 |
|------|--------|
| 400 | 자신에게 이전할 수 없습니다 |
| 404 | 해당 멤버를 찾을 수 없습니다 |
| 400 | 활성 멤버에게만 이전할 수 있습니다 |

---

## GET /api/studies/[id]/check-member

### 설명

현재 사용자가 스터디 멤버인지 확인합니다.

### 파일 위치

`src/app/api/studies/[id]/check-member/route.js`

### Response

**멤버인 경우**
```json
{
  "isMember": true,
  "role": "MEMBER",
  "status": "ACTIVE",
  "joinedAt": "2025-01-01T00:00:00Z"
}
```

**멤버가 아닌 경우**
```json
{
  "isMember": false
}
```

**승인 대기 중**
```json
{
  "isMember": false,
  "status": "PENDING"
}
```

---

## 초대 코드로 가입

### GET /api/studies/join/[code]

초대 코드로 스터디 정보를 조회합니다.

### Response

```json
{
  "success": true,
  "data": {
    "id": "study123",
    "name": "JavaScript 스터디",
    "emoji": "💻",
    "description": "...",
    "memberCount": 5,
    "maxMembers": 10,
    "isRecruiting": true
  }
}
```

### POST /api/studies/join/[code]

초대 코드로 스터디에 가입합니다.

---

## 에러 코드 요약

| 코드 | 상태 | 설명 |
|------|------|------|
| `ALREADY_MEMBER` | 409 | 이미 멤버 |
| `NOT_RECRUITING` | 400 | 모집 마감 |
| `STUDY_FULL` | 400 | 정원 초과 |
| `CANNOT_LEAVE_AS_OWNER` | 400 | 소유자 탈퇴 불가 |
| `INVALID_INVITE_CODE` | 404 | 잘못된 초대 코드 |
| `TARGET_NOT_MEMBER` | 404 | 대상이 멤버가 아님 |

---

## 관련 문서

- [CRUD API](./api-crud.md) - 기본 CRUD
- [멤버 API](./api-members.md) - 멤버 관리
- [가입 화면](./screens-join.md) - 가입 UI

