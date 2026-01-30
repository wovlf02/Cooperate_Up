# 세션 유효성 검증 API

> 현재 세션이 유효한지 검증하는 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **엔드포인트** | `/api/auth/validate-session` |
| **메서드** | `GET` |
| **인증 필요** | ❌ (세션 존재 여부 확인용) |

---

## 🎯 목적

클라이언트에서 세션이 실제로 유효한지 확인할 때 사용합니다:

- 앱 초기 로드 시 세션 상태 확인
- 주기적인 세션 유효성 체크
- 계정 상태 변경 감지 (정지, 삭제 등)

---

## 📥 요청

```http
GET /api/auth/validate-session
Cookie: next-auth.session-token=...
```

---

## 📤 응답

### 유효한 세션 (200 OK)

```json
{
  "valid": true,
  "user": {
    "id": "user-uuid-123",
    "email": "user@example.com",
    "name": "홍길동",
    "status": "ACTIVE",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### 세션 없음 (200 OK)

```json
{
  "valid": false,
  "error": "NO_SESSION",
  "message": "세션이 없습니다",
  "shouldLogout": false
}
```

### 삭제된 계정 (200 OK)

```json
{
  "valid": false,
  "error": "ACCOUNT_DELETED",
  "message": "삭제된 계정입니다",
  "shouldLogout": true
}
```

### 정지된 계정 (200 OK)

```json
{
  "valid": false,
  "error": "ACCOUNT_SUSPENDED",
  "message": "계정이 정지되었습니다",
  "shouldLogout": true
}
```

### 비활성 계정 (200 OK)

```json
{
  "valid": false,
  "error": "INACTIVE_ACCOUNT",
  "message": "계정 상태: [상태값]",
  "shouldLogout": true
}
```

### 서버 오류 (500 Internal Server Error)

```json
{
  "valid": false,
  "error": "UNKNOWN_ERROR",
  "message": "알 수 없는 오류가 발생했습니다"
}
```

---

## 📊 응답 필드 설명

| 필드 | 타입 | 설명 |
|------|------|------|
| `valid` | boolean | 세션 유효 여부 |
| `user` | object | 사용자 정보 (유효한 경우만) |
| `error` | string | 에러 코드 (무효한 경우) |
| `message` | string | 에러 메시지 (무효한 경우) |
| `shouldLogout` | boolean | 클라이언트에서 로그아웃 처리 필요 여부 |

---

## 🔄 처리 흐름

```
1. 세션 조회
   - getServerSession(authOptions)
   ↓
2. 세션 존재 확인
   - 없으면: valid=false, shouldLogout=false
   ↓
3. DB에서 사용자 조회
   - id, email, name, status, avatar
   ↓
4. 사용자 존재 확인
   - 없으면: valid=false, shouldLogout=true (ACCOUNT_DELETED)
   ↓
5. 계정 상태 확인
   - DELETED: valid=false, shouldLogout=true
   - SUSPENDED: valid=false, shouldLogout=true
   - ACTIVE 외: valid=false, shouldLogout=true
   ↓
6. 유효한 세션
   - valid=true, user 정보 반환
```

---

## 💡 사용 예시

### 클라이언트에서 세션 검증

```javascript
async function validateSession() {
  const res = await fetch('/api/auth/validate-session');
  const data = await res.json();

  if (!data.valid) {
    if (data.shouldLogout) {
      // 강제 로그아웃 처리
      await signOut({ redirect: false });
      alert(data.message);
      router.push('/sign-in');
    }
    return null;
  }

  return data.user;
}
```

### 주기적 세션 체크 Hook

```javascript
function useSessionValidation() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/auth/validate-session');
      const data = await res.json();

      if (data.shouldLogout) {
        await signOut({ redirect: false });
        window.location.href = '/sign-in';
      }
    }, 5 * 60 * 1000); // 5분마다 체크

    return () => clearInterval(interval);
  }, []);
}
```

---

## ⚠️ 주의사항

### shouldLogout 플래그

| shouldLogout | 의미 | 클라이언트 동작 |
|--------------|------|-----------------|
| `false` | 단순히 세션이 없음 | 로그인 유도 |
| `true` | 계정 문제 발생 | 강제 로그아웃 및 안내 |

### HTTP 상태 코드

- 세션 관련 응답은 대부분 **200 OK**를 반환합니다.
- `valid` 필드로 실제 유효성을 판단해야 합니다.
- 서버 오류만 500을 반환합니다.

---

## 🔗 관련 문서

- [현재 사용자 정보 조회 API](./me.md)
- [NextAuth 인증](./nextauth.md)
- [인증 흐름 아키텍처](../../02_architecture/authentication-flow.md)
