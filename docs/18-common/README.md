# 🧩 공통 컴포넌트 및 유틸리티

## 개요

애플리케이션 전체에서 공유되는 공통 컴포넌트, 유틸리티, 훅 등입니다.

---

## 파일 구조

```
coup/src/
├── components/
│   ├── common/                  # 공통 컴포넌트
│   │   ├── RestrictionBanner.jsx
│   │   └── ...
│   ├── ui/                      # UI 컴포넌트
│   │   ├── ConnectionBanner.js
│   │   ├── EmptyState.js
│   │   ├── ErrorToast.js
│   │   ├── LoadingSpinner.js
│   │   └── MessageError.js
│   ├── layout/                  # 레이아웃 컴포넌트
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   └── Providers.js             # Context Providers
├── lib/
│   ├── api.js                   # API 클라이언트
│   ├── auth.js                  # NextAuth 설정
│   ├── auth-helpers.js          # 인증 헬퍼
│   ├── prisma.js                # Prisma 클라이언트
│   ├── redis.js                 # Redis 클라이언트
│   ├── hooks/                   # Custom Hooks
│   │   └── useApi.js
│   ├── utils/                   # 유틸리티
│   │   ├── study-utils.js
│   │   ├── admin-utils.js
│   │   ├── input-sanitizer.js
│   │   └── xss-sanitizer.js
│   ├── helpers/                 # 헬퍼 함수
│   │   ├── dashboard-helpers.js
│   │   └── ...
│   ├── validators/              # 검증 함수
│   │   ├── study-validators.js
│   │   ├── admin-validators.js
│   │   └── dashboard-validators.js
│   ├── exceptions/              # 예외 클래스
│   │   ├── study/
│   │   ├── admin/
│   │   └── dashboard/
│   └── logging/                 # 로깅
│       ├── studyLogger.js
│       └── adminLogger.js
├── contexts/                    # React Contexts
├── hooks/                       # Custom Hooks
├── utils/                       # 유틸리티
└── styles/                      # 글로벌 스타일
```

---

## UI 컴포넌트

### LoadingSpinner

로딩 상태 표시 컴포넌트입니다.

```jsx
import LoadingSpinner from '@/components/ui/LoadingSpinner';

<LoadingSpinner />
<LoadingSpinner size="small" />
<LoadingSpinner size="large" />
```

### EmptyState

빈 상태 표시 컴포넌트입니다.

```jsx
import EmptyState from '@/components/ui/EmptyState';

<EmptyState
  icon="📚"
  title="데이터가 없습니다"
  description="새로운 항목을 추가해보세요"
  actionText="추가하기"
  actionHref="/add"
/>
```

### ErrorToast

에러 토스트 컴포넌트입니다.

```jsx
import ErrorToast from '@/components/ui/ErrorToast';

<ErrorToast
  message="오류가 발생했습니다"
  onClose={() => setShowError(false)}
/>
```

### ConnectionBanner

연결 상태 배너 컴포넌트입니다.

```jsx
import ConnectionBanner from '@/components/ui/ConnectionBanner';

<ConnectionBanner isOnline={isOnline} />
```

---

## API 클라이언트

### api.js

```javascript
const api = {
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${url}?${queryString}`);
    return response.json();
  },

  async post(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async patch(url, data) {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async delete(url) {
    const response = await fetch(url, { method: 'DELETE' });
    return response.json();
  }
};

export default api;
```

---

## Custom Hooks

### useApi.js

React Query 기반 API 훅입니다.

```javascript
// 대시보드
export function useDashboard() {...}

// 스터디
export function useStudies(params) {...}
export function useStudy(studyId) {...}
export function useMyStudies() {...}

// 공지사항
export function useNotices(studyId) {...}
export function useCreateNotice() {...}

// 일정
export function useEvents(studyId, params) {...}
export function useCreateEvent() {...}

// 파일
export function useFiles(studyId) {...}
export function useUploadFile() {...}

// 채팅
export function useMessages(studyId, params) {...}
export function useSendMessage() {...}
```

---

## 유틸리티

### study-utils.js

스터디 관련 유틸리티입니다.

```javascript
export function withStudyErrorHandler(handler) {...}
export function createSuccessResponse(data, message, status) {...}
export function createPaginatedResponse(data, total, page, limit) {...}
```

### input-sanitizer.js

입력값 정제 유틸리티입니다.

```javascript
export function validateAndSanitize(input, type) {...}
export function sanitizeString(str) {...}
export function sanitizeHtml(html) {...}
```

### xss-sanitizer.js

XSS 방지 유틸리티입니다.

```javascript
export function validateSecurityThreats(input) {...}
export function logSecurityEvent(type, context) {...}
```

---

## 로깅

### studyLogger.js

스터디 관련 로깅입니다.

```javascript
StudyLogger.logEventCreate(eventId, studyId, userId, data);
StudyLogger.logEventUpdate(eventId, studyId, userId, data);
StudyLogger.logEventDelete(eventId, studyId, userId);
StudyLogger.logNoticeCreate(noticeId, studyId, userId);
StudyLogger.logFileUpload(fileId, studyId, userId, fileName);
```

### adminLogger.js

관리자 로깅입니다.

```javascript
AdminLogger.info(message, context);
AdminLogger.warn(message, context);
AdminLogger.error(message, error, context);
```

---

## Providers

### Providers.js

```jsx
export default function Providers({ children }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
```

---

## 관련 문서

- [API 클라이언트](./api.md)
- [훅](./hooks.md)
- [유틸리티](./utils.md)

