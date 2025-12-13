# 🧩 공통 컴포넌트 및 유틸리티

## 개요

애플리케이션 전체에서 공유되는 공통 컴포넌트, 유틸리티, 훅, Context 등입니다.

---

## 문서 목록

| 문서 | 설명 |
|------|------|
| [contexts.md](./contexts.md) | Context Providers (Socket, Settings) |
| [components.md](./components.md) | UI 컴포넌트 (LoadingSpinner, EmptyState, Layout 등) |
| [hooks.md](./hooks.md) | Custom Hooks (useApi, useRestriction 등) |
| [api-client.md](./api-client.md) | API 클라이언트 (api.js) |
| [utilities.md](./utilities.md) | 유틸리티 함수 (format, time, sanitizer 등) |

---

## 파일 구조

```
coup/src/
├── components/
│   ├── common/              # 공통 컴포넌트
│   ├── ui/                  # UI 컴포넌트
│   ├── layout/              # 레이아웃 컴포넌트
│   └── Providers.js         # Context Providers 통합
├── contexts/                # React Contexts
├── hooks/                   # Custom Hooks
├── utils/                   # 클라이언트 유틸리티
├── lib/
│   ├── api.js               # API 클라이언트
│   ├── hooks/               # 서버/공용 Hooks
│   ├── utils/               # 서버 유틸리티
│   ├── helpers/             # 헬퍼 함수
│   ├── validators/          # 검증 함수
│   ├── exceptions/          # 예외 클래스
│   └── logging/             # 로깅 시스템
└── mocks/                   # Mock 데이터
```

---

## 주요 기능

### Context Providers

```jsx
// src/components/Providers.js
<AuthSessionProvider>
  <QueryClientProvider>
    <SettingsProvider>
      <SocketProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </SocketProvider>
    </SettingsProvider>
  </QueryClientProvider>
</AuthSessionProvider>
```

→ [상세 문서](./contexts.md)

### UI 컴포넌트

```jsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
```

→ [상세 문서](./components.md)

### Custom Hooks

```javascript
import { useMe, useDashboard, useStudies } from '@/lib/hooks/useApi'
import { useRestriction } from '@/hooks/useRestriction'
```

→ [상세 문서](./hooks.md)

### API 클라이언트

```javascript
import api from '@/lib/api'

await api.get('/api/studies', { page: 1 })
await api.post('/api/studies', { name: '스터디' })
```

→ [상세 문서](./api-client.md)

### 유틸리티

```javascript
import { formatDate, getRelativeTime } from '@/utils/time'
import { sanitizeHTML } from '@/lib/utils/xss-sanitizer'
```

→ [상세 문서](./utilities.md)

---

## 관련 문서

- [인프라스트럭처](../19-infrastructure/README.md)
- [테스트](../20-testing/README.md)
- [데이터베이스](../01-database/README.md)
- [인증](../02-auth/README.md)
