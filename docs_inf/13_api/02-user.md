# 사용자 API (User API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/users`

## 개요

사용자 프로필 조회 및 수정 관련 API입니다.

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|:----:|
| GET | `/users/me` | 내 정보 조회 | ✅ |
| PUT | `/users/me` | 프로필 수정 | ✅ |
| PUT | `/users/me/password` | 비밀번호 변경 | ✅ |

---

## 1. 내 정보 조회

로그인한 사용자의 정보를 조회합니다.

### Request

```http
GET /users/me
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "name": "홍길동",
    "phone": "01012345678",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "profileImageUrl": "https://s3.bizone.kr/profiles/1.jpg",
    "createdAt": "2024-12-20T10:00:00",
    "updatedAt": "2024-12-25T15:30:00"
  },
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 앱 시작 시 사용자 정보 조회
- 설정 화면에서 프로필 정보 표시
- 역할(role)에 따른 UI 분기 처리

---

## 2. 프로필 수정

프로필 정보를 수정합니다.

### Request

```http
PUT /users/me
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 | 검증 |
|------|------|:----:|------|------|
| name | string | ❌ | 이름 | 2~20자 |
| phone | string | ❌ | 휴대폰 번호 | 01X로 시작, 10~11자리 |
| profileImageUrl | string | ❌ | 프로필 이미지 URL | URL 형식 |

```json
{
  "name": "홍길동",
  "phone": "01098765432",
  "profileImageUrl": "https://s3.bizone.kr/profiles/1-new.jpg"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "name": "홍길동",
    "phone": "01098765432",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "profileImageUrl": "https://s3.bizone.kr/profiles/1-new.jpg",
    "createdAt": "2024-12-20T10:00:00",
    "updatedAt": "2024-12-27T10:30:00"
  },
  "message": "프로필이 수정되었습니다",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 프로필 이미지 변경 시 파일 업로드 API 호출 후 URL 전송
- 변경된 정보만 전송 가능 (PATCH 동작)
- 수정 성공 시 로컬 상태 업데이트

---

## 3. 비밀번호 변경

비밀번호를 변경합니다.

### Request

```http
PUT /users/me/password
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 | 검증 |
|------|------|:----:|------|------|
| currentPassword | string | ✅ | 현재 비밀번호 | - |
| newPassword | string | ✅ | 새 비밀번호 | 8자 이상, 영문+숫자+특수문자 |

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "비밀번호가 변경되었습니다",
  "timestamp": "2024-12-27T10:30:00"
}
```

#### 실패 (400 Bad Request)

```json
{
  "success": false,
  "message": "비밀번호가 일치하지 않습니다",
  "code": "U004",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 현재 비밀번호 확인 필수
- 새 비밀번호 강도 표시
- 새 비밀번호 확인 입력 필드 (프론트엔드 검증)
- 변경 성공 시 성공 메시지 표시

---

## 타입 정의

### UserProfileResponse

```typescript
interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'ADMIN' | 'EMPLOYEE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### UpdateProfileRequest

```typescript
interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  profileImageUrl?: string;
}
```

### ChangePasswordRequest

```typescript
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

---

## 추가 필요 API (설계)

프론트엔드 요구사항에 따라 다음 API 추가가 필요할 수 있습니다:

### 프로필 이미지 업로드

```http
POST /users/me/profile-image
Content-Type: multipart/form-data

Request:
- file: 이미지 파일 (jpg, png, 최대 5MB)

Response:
{
  "success": true,
  "data": {
    "url": "https://s3.bizone.kr/profiles/1-new.jpg"
  },
  "message": "이미지가 업로드되었습니다"
}
```

### 계정 탈퇴

```http
DELETE /users/me
Authorization: Bearer {accessToken}

Request Body:
{
  "password": "Password123!",
  "reason": "개인 사유"
}

Response:
{
  "success": true,
  "message": "계정이 삭제되었습니다"
}
```

### FCM 토큰 등록 (푸시 알림)

```http
PUT /users/me/fcm-token
Authorization: Bearer {accessToken}

Request Body:
{
  "fcmToken": "fcm-token-here",
  "deviceType": "ANDROID" // ANDROID | IOS
}

Response:
{
  "success": true,
  "message": "FCM 토큰이 등록되었습니다"
}
```

---

## 관련 문서

- [공통 규격](./00-common.md)
- [인증 API](./01-auth.md)
- [화면 설계 - 설정](../05_screens/08_settings/README.md)

