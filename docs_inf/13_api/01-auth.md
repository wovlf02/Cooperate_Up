# 인증 API (Auth API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/auth`

## 개요

사용자 인증 관련 API입니다. 로그인, 회원가입, 토큰 갱신, 비밀번호 재설정 등을 처리합니다.

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|:----:|
| POST | `/auth/login` | 로그인 | ❌ |
| POST | `/auth/signup` | 직원 회원가입 | ❌ |
| POST | `/auth/signup/admin` | 사업주 회원가입 | ❌ |
| POST | `/auth/refresh` | 토큰 갱신 | ❌ |
| POST | `/auth/logout` | 로그아웃 | ✅ |
| GET | `/auth/username/check` | 아이디 중복 확인 | ❌ |
| POST | `/auth/email/send-code` | 이메일 인증번호 발송 | ❌ |
| POST | `/auth/email/verify-code` | 이메일 인증번호 확인 | ❌ |
| POST | `/auth/email/verify` | 이메일 인증 | ❌ |
| POST | `/auth/password/reset` | 비밀번호 재설정 요청 | ❌ |
| POST | `/auth/password/reset/confirm` | 비밀번호 재설정 확인 | ❌ |
| POST | `/auth/business/verify` | 사업자등록번호 검증 | ❌ |

---

## 1. 로그인

아이디와 비밀번호로 로그인합니다.

### Request

```http
POST /auth/login
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 | 검증 |
|------|------|:----:|------|------|
| username | string | ✅ | 아이디 | 4~20자 |
| password | string | ✅ | 비밀번호 | - |

```json
{
  "username": "testuser",
  "password": "Password123!"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "name": "홍길동",
      "phone": "01012345678",
      "role": "EMPLOYEE",
      "status": "ACTIVE",
      "profileImageUrl": null,
      "createdAt": "2024-12-20T10:00:00",
      "updatedAt": "2024-12-20T10:00:00"
    }
  },
  "message": "로그인 성공",
  "timestamp": "2024-12-27T10:30:00"
}
```

#### 실패 (401 Unauthorized)

```json
{
  "success": false,
  "message": "아이디 또는 비밀번호가 올바르지 않습니다",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 로그인 성공 시 토큰 저장 (SecureStorage)
- 자동 로그인 체크 시 토큰 저장 기간 연장
- 로그인 후 사업장 선택 화면 또는 홈 화면으로 이동

---

## 2. 직원 회원가입

직원 계정을 생성합니다.

### Request

```http
POST /auth/signup
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 | 검증 |
|------|------|:----:|------|------|
| username | string | ✅ | 아이디 | 4~20자, 영문/숫자만 |
| password | string | ✅ | 비밀번호 | 8자 이상, 영문+숫자+특수문자 |
| email | string | ✅ | 이메일 | 이메일 형식 |
| name | string | ✅ | 이름 | 2~20자 |
| phone | string | ❌ | 휴대폰 번호 | 01X로 시작, 10~11자리 |

```json
{
  "username": "newuser",
  "password": "Password123!",
  "email": "newuser@example.com",
  "name": "김철수",
  "phone": "01098765432"
}
```

### Response

#### 성공 (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "name": "김철수",
    "phone": "01098765432",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "profileImageUrl": null,
    "createdAt": "2024-12-27T10:30:00",
    "updatedAt": "2024-12-27T10:30:00"
  },
  "message": "회원가입 성공",
  "timestamp": "2024-12-27T10:30:00"
}
```

#### 실패 (409 Conflict)

```json
{
  "success": false,
  "message": "이미 사용 중인 아이디입니다",
  "code": "U002",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 회원가입 전 아이디 중복 확인 필수
- 이메일 인증 완료 후 회원가입 진행
- 비밀번호 강도 표시기 사용

---

## 3. 사업주 회원가입

사업주 계정을 생성합니다.

### Request

```http
POST /auth/signup/admin
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 | 검증 |
|------|------|:----:|------|------|
| username | string | ✅ | 아이디 | 4~20자, 영문/숫자만 |
| password | string | ✅ | 비밀번호 | 8자 이상, 영문+숫자+특수문자 |
| email | string | ✅ | 이메일 | 이메일 형식 |
| name | string | ✅ | 이름 | 2~20자 |
| phone | string | ❌ | 휴대폰 번호 | 01X로 시작, 10~11자리 |
| businessNumber | string | ✅ | 사업자등록번호 | 10자리 숫자 |

```json
{
  "username": "bizowner",
  "password": "Password123!",
  "email": "bizowner@example.com",
  "name": "이사업",
  "phone": "01012341234",
  "businessNumber": "1234567890"
}
```

### Response

#### 성공 (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 3,
    "username": "bizowner",
    "email": "bizowner@example.com",
    "name": "이사업",
    "phone": "01012341234",
    "role": "ADMIN",
    "status": "ACTIVE",
    "profileImageUrl": null,
    "createdAt": "2024-12-27T10:30:00",
    "updatedAt": "2024-12-27T10:30:00"
  },
  "message": "사업주 회원가입 성공",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 사업자등록번호 검증 API 호출 후 진행
- 검증 통과한 사업자등록번호만 사용 가능

---

## 4. 토큰 갱신

Refresh Token으로 새로운 Access Token을 발급합니다.

### Request

```http
POST /auth/refresh
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| refreshToken | string | ✅ | Refresh Token |

```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
  },
  "message": "토큰 갱신 성공",
  "timestamp": "2024-12-27T10:30:00"
}
```

#### 실패 (401 Unauthorized)

```json
{
  "success": false,
  "message": "만료된 토큰입니다",
  "code": "A004",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- API 인터셉터에서 401 에러 시 자동 토큰 갱신
- Refresh Token 만료 시 로그인 페이지로 리다이렉트

---

## 5. 로그아웃

현재 사용자를 로그아웃합니다.

### Request

```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "로그아웃 성공",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 저장된 토큰 삭제
- 로그인 페이지로 이동

---

## 6. 아이디 중복 확인

아이디 사용 가능 여부를 확인합니다.

### Request

```http
GET /auth/username/check?username=testuser
```

#### Query Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| username | string | ✅ | 확인할 아이디 |

### Response

#### 사용 가능 (200 OK)

```json
{
  "success": true,
  "data": true,
  "message": "사용 가능한 아이디입니다",
  "timestamp": "2024-12-27T10:30:00"
}
```

#### 사용 불가 (200 OK)

```json
{
  "success": true,
  "data": false,
  "message": "이미 사용 중인 아이디입니다",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 아이디 입력 후 blur 이벤트 또는 버튼 클릭 시 호출
- 결과에 따라 UI 피드백 표시 (체크 아이콘 등)

---

## 7. 이메일 인증번호 발송

입력한 이메일로 6자리 인증번호를 발송합니다.

### Request

```http
POST /auth/email/send-code
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| email | string | ✅ | 이메일 주소 |

```json
{
  "email": "user@example.com"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "인증번호가 발송되었습니다",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 발송 후 재발송 타이머 표시 (예: 3분)
- 타이머 종료 전 재발송 버튼 비활성화

---

## 8. 이메일 인증번호 확인

발송된 인증번호를 확인합니다.

### Request

```http
POST /auth/email/verify-code
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| email | string | ✅ | 이메일 주소 |
| code | string | ✅ | 6자리 인증번호 |

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": true,
  "message": "이메일 인증이 완료되었습니다",
  "timestamp": "2024-12-27T10:30:00"
}
```

#### 실패 (400 Bad Request)

```json
{
  "success": false,
  "message": "잘못된 인증번호입니다",
  "code": "E002",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 6자리 입력 완료 시 자동 확인 또는 확인 버튼 클릭
- 인증 성공 시 다음 단계로 진행
- 인증 실패 시 에러 메시지 표시

---

## 9. 비밀번호 재설정 요청

이메일로 비밀번호 재설정 링크를 발송합니다.

### Request

```http
POST /auth/password/reset
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| email | string | ✅ | 가입 시 사용한 이메일 |

```json
{
  "email": "user@example.com"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "비밀번호 재설정 이메일이 발송되었습니다",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 현재는 이메일 인증번호 방식으로 구현
- 이메일 발송 후 인증번호 입력 화면으로 이동

---

## 10. 비밀번호 재설정 확인

토큰과 새 비밀번호로 비밀번호를 재설정합니다.

### Request

```http
POST /auth/password/reset/confirm
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| token | string | ✅ | 재설정 토큰 |
| newPassword | string | ✅ | 새 비밀번호 |

```json
{
  "token": "reset-token-here",
  "newPassword": "NewPassword123!"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "비밀번호가 재설정되었습니다",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 비밀번호 강도 검증
- 비밀번호 확인 입력 필드 추가 (프론트엔드 검증)
- 성공 시 로그인 페이지로 이동

---

## 11. 이메일 인증

이메일 인증 토큰을 확인합니다.

### Request

```http
POST /auth/email/verify
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| token | string | ✅ | 이메일 인증 토큰 |

```json
{
  "token": "email-verify-token"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "이메일 인증이 완료되었습니다",
  "timestamp": "2024-12-27T10:30:00"
}
```

---

## 12. 사업자등록번호 검증

사업자등록번호의 유효성을 검증합니다.

### Request

```http
POST /auth/business/verify
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| businessNumber | string | ✅ | 사업자등록번호 (10자리) |

```json
{
  "businessNumber": "1234567890"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "valid": true,
    "businessNumber": "1234567890",
    "companyName": "주식회사 예시",
    "representativeName": "홍길동",
    "businessType": "서비스업",
    "businessItem": "소프트웨어 개발"
  },
  "timestamp": "2024-12-27T10:30:00"
}
```

#### 실패 (400 Bad Request)

```json
{
  "success": false,
  "data": {
    "valid": false,
    "businessNumber": "1234567890"
  },
  "message": "유효하지 않은 사업자등록번호입니다",
  "code": "W004",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 사업주 회원가입 시 필수 검증
- 검증 성공 시 사업자 정보 표시
- 검증 실패 시 다음 단계 진행 불가

---

## 관련 문서

- [공통 규격](./00-common.md)
- [사용자 API](./02-user.md)
- [화면 설계 - 인증](../05_screens/01_auth/README.md)

