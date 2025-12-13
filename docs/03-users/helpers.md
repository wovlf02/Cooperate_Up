# 🔧 사용자 헬퍼

## 개요

사용자 관련 유틸리티 함수들을 설명합니다.

---

## 파일 목록

| 파일 | 경로 | 설명 |
|------|------|------|
| `useApi.js` (hooks) | `src/lib/hooks/` | 사용자 관련 API 훅 |
| `format.js` | `src/utils/` | 포맷팅 함수 |

---

## API 훅 (useApi.js)

### 경로

`src/lib/hooks/useApi.js`

### useMe

현재 로그인한 사용자 정보를 조회합니다.

```javascript
import { useQuery } from '@tanstack/react-query'

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me')
      if (!response.ok) throw new Error('Failed to fetch user')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5분
  })
}
```

**사용 예시:**

```javascript
const { data, isLoading, error } = useMe()
const user = data?.user
```

### useUserStats

사용자 활동 통계를 조회합니다.

```javascript
export function useUserStats() {
  return useQuery({
    queryKey: ['user', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/user/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2분
  })
}
```

**사용 예시:**

```javascript
const { data } = useUserStats()
const stats = data?.stats
```

### useMyStudies

현재 사용자의 참여 스터디 목록을 조회합니다.

```javascript
export function useMyStudies(options = {}) {
  const { limit = 10 } = options
  
  return useQuery({
    queryKey: ['my-studies', { limit }],
    queryFn: async () => {
      const response = await fetch(`/api/my-studies?limit=${limit}`)
      if (!response.ok) throw new Error('Failed to fetch studies')
      return response.json()
    },
  })
}
```

**사용 예시:**

```javascript
const { data } = useMyStudies({ limit: 20 })
const studies = data?.data?.studies || []
```

---

## 포맷팅 함수 (format.js)

### 경로

`src/utils/format.js`

### formatDate

날짜를 한국어 형식으로 포맷합니다.

```javascript
export function formatDate(date, format = 'full') {
  const d = new Date(date)
  
  const options = {
    full: { year: 'numeric', month: 'long', day: 'numeric' },
    short: { month: 'short', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
  }
  
  return d.toLocaleDateString('ko-KR', options[format] || options.full)
}
```

**사용 예시:**

```javascript
formatDate('2025-12-13')  // "2025년 12월 13일"
formatDate('2025-12-13', 'short')  // "12월 13일"
```

### formatRelativeTime

상대적 시간을 표시합니다.

```javascript
export function formatRelativeTime(date) {
  const now = new Date()
  const d = new Date(date)
  const diff = now - d
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}일 전`
  if (hours > 0) return `${hours}시간 전`
  if (minutes > 0) return `${minutes}분 전`
  return '방금 전'
}
```

**사용 예시:**

```javascript
formatRelativeTime(new Date(Date.now() - 3600000))  // "1시간 전"
```

### formatNumber

숫자를 포맷합니다.

```javascript
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
```

**사용 예시:**

```javascript
formatNumber(1500)  // "1.5K"
formatNumber(42)    // "42"
```

---

## 검증 함수

### validateName

```javascript
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: '이름을 입력해주세요' }
  }
  if (name.length < 2) {
    return { valid: false, error: '이름은 2자 이상이어야 합니다' }
  }
  if (name.length > 50) {
    return { valid: false, error: '이름은 50자 이하여야 합니다' }
  }
  return { valid: true }
}
```

### validateBio

```javascript
export function validateBio(bio) {
  if (bio && bio.length > 200) {
    return { valid: false, error: '자기소개는 200자 이하여야 합니다' }
  }
  return { valid: true }
}
```

---

## 아바타 처리

### getAvatarUrl

사용자 아바타 URL을 반환합니다.

```javascript
const DEFAULT_AVATAR = '/default-avatar.png'

export function getAvatarUrl(user) {
  if (!user?.avatar) return DEFAULT_AVATAR
  
  // base64 데이터는 지원하지 않음
  if (user.avatar.startsWith('data:')) return DEFAULT_AVATAR
  
  return user.avatar
}
```

### generateInitials

이름에서 이니셜을 생성합니다.

```javascript
export function generateInitials(name) {
  if (!name) return '?'
  
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}
```

**사용 예시:**

```javascript
generateInitials('홍길동')  // "홍길"
generateInitials('John Doe')  // "JD"
```

---

## 캐시 관리

### 캐시 무효화

```javascript
import { useQueryClient } from '@tanstack/react-query'

function useInvalidateUserData() {
  const queryClient = useQueryClient()
  
  return {
    invalidateMe: () => queryClient.invalidateQueries(['me']),
    invalidateStats: () => queryClient.invalidateQueries(['user', 'stats']),
    invalidateAll: () => {
      queryClient.invalidateQueries(['me'])
      queryClient.invalidateQueries(['user', 'stats'])
      queryClient.invalidateQueries(['my-studies'])
    }
  }
}
```

**사용 예시:**

```javascript
const { invalidateMe } = useInvalidateUserData()

// 프로필 수정 후
await updateProfile(data)
invalidateMe()
```

---

## 관련 문서

- [사용자 API](./api.md) - API 엔드포인트
- [마이페이지 화면](./screens-my-page.md) - 화면 구조
- [공통 유틸](../18-common/utils.md) - 공통 유틸리티

