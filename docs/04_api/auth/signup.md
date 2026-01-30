# 회원가입 API

> 새 사용자 계정을 생성하는 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **엔드포인트** | `/api/auth/signup` |
| **메서드** | `POST` |
| **인증 필요** | ❌ |
| **Content-Type** | `application/json` |

---

## 📥 요청

### 헤더

```http
Content-Type: application/json
```

### 본문 (Body)

| 필드 | 타입 | 필수 | 설명 | 제약조건 |
|------|------|------|------|----------|
| `email` | string | ✅ | 이메일 주소 | 유효한 이메일 형식 |
| `password` | string | ✅ | 비밀번호 | 최소 8자 이상 |
| `name` | string | ✅ | 사용자 이름 | 최소 2자 이상 |
| `avatar` | string | ❌ | 프로필 이미지 URL | 유효한 URL 형식 |

### 요청 예시

```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "김철수",
  "avatar": "https://example.com/avatar.jpg"
}
```

---

## 📤 응답

### 성공 (201 Created)

```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다",
  "user": {
    "id": "clm1234567890abcdef",
    "email": "newuser@example.com",
    "name": "김철수"
  }
}
```

### 에러 응답

#### 유효성 검사 실패 (400 Bad Request)

```json
{
  "error": "INVALID_EMAIL_FORMAT",
  "message": "올바른 이메일 형식이 아닙니다"
}
```

```json
{
  "error": "PASSWORD_TOO_SHORT",
  "message": "비밀번호는 최소 8자 이상이어야 합니다"
}
```

```json
{
  "error": "VALIDATION_ERROR",
  "message": "이름은 최소 2자 이상이어야 합니다",
  "field": "name"
}
```

#### 이메일 중복 (409 Conflict)

```json
{
  "error": "EMAIL_ALREADY_EXISTS",
  "message": "이미 사용 중인 이메일입니다"
}
```

#### 서버 오류 (500 Internal Server Error)

```json
{
  "error": "DB_CONNECTION_ERROR",
  "message": "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
}
```

---

## 🔄 처리 흐름

```
1. 요청 본문 JSON 파싱
   ↓
2. 입력값 정제 (sanitize)
   - 이메일 소문자 변환 및 공백 제거
   - 이름 앞뒤 공백 제거
   ↓
3. Zod 스키마 유효성 검사
   - 이메일 형식 검증
   - 비밀번호 길이 검증 (8자 이상)
   - 이름 길이 검증 (2자 이상)
   - avatar URL 형식 검증 (선택)
   ↓
4. 커스텀 유효성 검사
   - 추가 보안 검사
   ↓
5. 이메일 중복 확인
   - DB에서 기존 사용자 조회
   ↓
6. 비밀번호 해싱
   - bcrypt (salt rounds: 10)
   ↓
7. 사용자 생성
   - DB에 새 User 레코드 생성
   - role: USER
   - status: ACTIVE
   - provider: CREDENTIALS
   ↓
8. 성공 응답 반환
```

---

## 🛡️ 보안 처리

### 입력값 정제

| 필드 | 처리 |
|------|------|
| `email` | 소문자 변환, 앞뒤 공백 제거 |
| `name` | HTML 태그 제거, 앞뒤 공백 제거 |

### 비밀번호 정책

| 규칙 | 설명 |
|------|------|
| 최소 길이 | 8자 이상 |
| 해싱 | bcrypt (salt rounds: 10) |
| 저장 | 해시값만 저장 (원본 비밀번호 저장 안함) |

### 이메일 중복 처리

- 이미 가입된 이메일인지 확인
- 삭제된 계정(`DELETED`)도 동일하게 "이미 사용 중" 메시지 반환
- **보안**: 계정 존재 여부나 상태를 노출하지 않음

---

## 📊 생성되는 사용자 데이터

| 필드 | 값 |
|------|-----|
| `id` | 자동 생성 (CUID) |
| `email` | 입력값 (정제됨) |
| `password` | bcrypt 해시 |
| `name` | 입력값 (정제됨) |
| `avatar` | 입력값 또는 null |
| `role` | `USER` |
| `status` | `ACTIVE` |
| `provider` | `CREDENTIALS` |
| `createdAt` | 현재 시간 |

---

## ⏭️ 다음 단계

회원가입 성공 후 클라이언트는:

1. 성공 메시지 표시
2. `signIn()` 함수를 호출하여 자동 로그인 처리
3. 대시보드로 리다이렉트

---

## 🔗 관련 문서

- [NextAuth 인증](./nextauth.md)
- [로그인 페이지](../../05_pages/auth/register.md)
- [User 모델](../../03_database/models/user.md)
