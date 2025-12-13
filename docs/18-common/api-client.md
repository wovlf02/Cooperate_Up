# 🌐 API 클라이언트

## 개요

중앙화된 API 클라이언트입니다.

---

## api.js

### 기능

| 기능 | 설명 |
|------|------|
| 자동 인증 | 쿠키 자동 포함 (credentials: 'include') |
| 에러 핸들링 | ApiError 클래스로 통합 |
| 요청 로깅 | 콘솔에 요청/응답 로깅 |
| FormData 지원 | Content-Type 자동 설정 |
| Query Params | 자동 URL 파라미터 변환 |

### 기본 사용법

```javascript
import api from '@/lib/api'

// GET 요청 (쿼리 파라미터 자동 처리)
const users = await api.get('/api/admin/users', { page: 1, limit: 20 })

// POST 요청
await api.post('/api/studies', { title: '스터디', description: '설명' })

// PUT 요청 (전체 업데이트)
await api.put('/api/user/profile', { name: 'New Name' })

// PATCH 요청 (부분 업데이트)
await api.patch('/api/admin/users/123', { status: 'SUSPENDED' })

// DELETE 요청
await api.delete('/api/admin/users/123')
```

### FormData 업로드

```javascript
// FormData 업로드 (Content-Type 자동 설정)
const formData = new FormData()
formData.append('file', file)
formData.append('name', 'filename.pdf')

await api.post('/api/files/upload', formData)
```

### 에러 핸들링

```javascript
try {
  const data = await api.get('/api/users')
} catch (error) {
  if (error instanceof ApiError) {
    console.log('상태 코드:', error.status)
    console.log('에러 메시지:', error.message)
    console.log('응답 데이터:', error.data)
  }
}
```

---

## ApiError 클래스

### 구조

```javascript
class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status   // HTTP 상태 코드
    this.data = data       // 응답 데이터
  }
}
```

### 속성

| 속성 | Type | 설명 |
|------|------|------|
| message | `string` | 에러 메시지 |
| status | `number` | HTTP 상태 코드 (0 = 네트워크 에러) |
| data | `any` | 서버 응답 데이터 |

### 상태 코드별 처리

```javascript
try {
  await api.post('/api/studies', data)
} catch (error) {
  switch (error.status) {
    case 400:
      // 잘못된 요청
      showError('입력값을 확인해주세요')
      break
    case 401:
      // 인증 필요
      router.push('/auth/signin')
      break
    case 403:
      // 권한 없음
      showError('권한이 없습니다')
      break
    case 404:
      // 리소스 없음
      showError('존재하지 않는 항목입니다')
      break
    case 500:
      // 서버 에러
      showError('서버 오류가 발생했습니다')
      break
    case 0:
      // 네트워크 에러
      showError('네트워크 연결을 확인해주세요')
      break
  }
}
```

---

## 요청 로깅

개발 환경에서 모든 요청/응답이 콘솔에 로깅됩니다.

```
🌐 [API] GET /api/studies?page=1
✅ [API] GET /api/studies?page=1 - Success

🌐 [API] POST /api/studies
❌ [API] POST /api/studies - 400: 제목은 필수입니다
```

---

## 고급 사용법

### 커스텀 헤더

```javascript
await api.post('/api/webhook', data, {
  headers: {
    'X-Custom-Header': 'value'
  }
})
```

### 타임아웃 설정

```javascript
await api.get('/api/slow-endpoint', null, {
  signal: AbortSignal.timeout(5000)  // 5초 타임아웃
})
```

### 재시도 로직

```javascript
import { withRetry } from '@/lib/helpers/api-retry'

const data = await withRetry(
  () => api.get('/api/unstable'),
  { maxRetries: 3, delay: 1000 }
)
```

---

## 관련 문서

- [Custom Hooks](./hooks.md)
- [유틸리티](./utilities.md)
- [README](./README.md)

