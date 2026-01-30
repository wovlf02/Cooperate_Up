# 현재 사용자 정보 조회 API

> 로그인한 사용자의 상세 정보를 조회하는 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **엔드포인트** | `/api/auth/me` |
| **메서드** | `GET` |
| **인증 필요** | ✅ |

---

## 📥 요청

### 헤더

별도 헤더 없이 세션 쿠키가 자동으로 전송됩니다.

```http
GET /api/auth/me
Cookie: next-auth.session-token=...
```

---

## 📤 응답

### 성공 (200 OK)

```json
{
  "user": {
    "id": "user-uuid-123",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "https://example.com/avatar.jpg",
    "role": "USER",
    "bio": "안녕하세요!",
    "status": "ACTIVE",
    "createdAt": "2026-01-15T09:30:00.000Z"
  },
  "adminRole": null
}
```

### 관리자 사용자 응답

```json
{
  "user": {
    "id": "admin-uuid-456",
    "email": "admin@example.com",
    "name": "관리자",
    "avatar": null,
    "role": "USER",
    "bio": "",
    "status": "ACTIVE",
    "createdAt": "2025-12-01T00:00:00.000Z"
  },
  "adminRole": {
    "role": "SUPER_ADMIN",
    "expiresAt": null,
    "isExpired": false
  }
}
```

### 에러 응답

#### 인증 필요 (401 Unauthorized)

```json
{
  "error": "인증이 필요합니다."
}
```

#### 서버 오류 (500 Internal Server Error)

```json
{
  "error": "서버 오류가 발생했습니다."
}
```

---

## 📊 응답 필드 설명

### user 객체

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 사용자 고유 ID |
| `email` | string | 이메일 주소 |
| `name` | string | 사용자 이름 |
| `avatar` | string \| null | 프로필 이미지 URL |
| `role` | string | 기본 역할 (`USER`) |
| `bio` | string | 자기소개 |
| `status` | string | 계정 상태 (`ACTIVE`, `SUSPENDED`, `DELETED`) |
| `createdAt` | string | 가입일 (ISO 8601) |

### adminRole 객체 (관리자인 경우)

| 필드 | 타입 | 설명 |
|------|------|------|
| `role` | string | 관리자 역할 (`ADMIN`, `SUPER_ADMIN`) |
| `expiresAt` | string \| null | 권한 만료일 (ISO 8601) |
| `isExpired` | boolean | 만료 여부 |

---

## 🔄 처리 흐름

```
1. 세션 검증
   - getServerSession(authOptions) 호출
   ↓
2. 사용자 존재 확인
   - session.user.id가 없으면 401 반환
   ↓
3. DB에서 사용자 상세 정보 조회
   - User 테이블에서 id, email, name, avatar, role, bio, status, createdAt 조회
   ↓
4. 관리자 권한 조회
   - AdminRole 테이블에서 userId로 조회
   - role, expiresAt 정보 확인
   ↓
5. 응답 반환
   - user 정보와 adminRole 정보 반환
```

---

## 💡 사용 예시

### React Query 사용

```javascript
import { useQuery } from '@tanstack/react-query';

function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
}
```

### 사용 예시

```jsx
function ProfilePage() {
  const { data, isLoading } = useCurrentUser();

  if (isLoading) return <Loading />;

  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>{data.user.email}</p>
      {data.adminRole && (
        <Badge>{data.adminRole.role}</Badge>
      )}
    </div>
  );
}
```

---

## ⚠️ 주의사항

1. **세션과 DB 불일치**: 세션은 존재하지만 DB에 사용자가 없는 경우, 세션 데이터로 기본 응답을 반환합니다.
2. **avatar 처리**: Base64 형식의 아바타는 지원하지 않으며, URL 형식만 반환됩니다.
3. **캐싱**: 클라이언트에서 적절한 캐싱 전략을 사용하여 불필요한 요청을 줄이세요.

---

## 🔗 관련 문서

- [세션 유효성 검증 API](./validate-session.md)
- [사용자 프로필 API](../users/profile.md)
- [User 모델](../../03_database/models/user.md)
