# 🔄 Context Providers

## 개요

React Context API를 사용한 전역 상태 관리입니다.

---

## Providers.js

모든 Context Provider를 통합하여 제공합니다.

```jsx
// src/components/Providers.js
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SocketProvider } from '@/contexts/SocketContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ToastProvider } from '@/components/admin/ui/Toast'
import AuthSessionProvider from '@/lib/session-provider'
import { useState } from 'react'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,      // 1분
        cacheTime: 5 * 60 * 1000,  // 5분
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <AuthSessionProvider>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <SocketProvider>
            <ToastProvider position="top-right">
              {children}
            </ToastProvider>
          </SocketProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </AuthSessionProvider>
  )
}
```

### Provider 계층 구조

```
AuthSessionProvider          # NextAuth 세션
  └── QueryClientProvider    # React Query
       └── SettingsProvider  # 전역 설정
            └── SocketProvider   # Socket.io
                 └── ToastProvider   # 토스트 알림
                      └── {children}
```

---

## SocketContext

Socket.io 연결 상태를 관리합니다.

### 연결 상태

```jsx
// src/contexts/SocketContext.js
export const ConnectionState = {
  DISCONNECTED: 'disconnected',  // 연결 안 됨
  CONNECTING: 'connecting',      // 연결 시도 중
  CONNECTED: 'connected',        // 연결됨
  RECONNECTING: 'reconnecting',  // 재연결 시도 중
  FAILED: 'failed',              // 연결 실패
  OFFLINE: 'offline'             // 네트워크 오프라인
}
```

### 기능

| 기능 | 설명 |
|------|------|
| 자동 연결 | 로그인 시 자동으로 Socket 연결 |
| 재연결 로직 | 최대 5회 재시도, 지수 백오프 |
| 연결 타임아웃 | 30초 연결 타임아웃 |
| 오프라인 감지 | 네트워크 상태 감지 |

### 사용법

```jsx
import { useContext } from 'react'
import { SocketContext, ConnectionState } from '@/contexts/SocketContext'

function ChatComponent() {
  const { socket, connectionState, connectionError } = useContext(SocketContext)

  if (connectionState === ConnectionState.CONNECTING) {
    return <div>연결 중...</div>
  }

  if (connectionState === ConnectionState.FAILED) {
    return <div>연결 실패: {connectionError?.message}</div>
  }

  // 메시지 전송
  const sendMessage = (content) => {
    socket?.emit('message', { content })
  }

  return <div>채팅 컴포넌트</div>
}
```

---

## SettingsContext

전역 설정을 관리합니다.

### 기본 설정 구조

```jsx
const defaultSettings = {
  // 언어 및 지역
  language: 'ko',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  timezone: 'Asia/Seoul',
  fontSize: 100,

  // 접근성
  accessibility: {
    keyboardNav: true,
    focusIndicator: true,
    shortcuts: true,
    screenReader: true,
    ariaLabels: true,
    highContrast: false,
    reduceMotion: false,
    colorBlind: false,
    autoplayVideos: true,
    reduceFlash: false,
  },

  // 알림
  notifications: {
    push: true,
    email: true,
    studyUpdates: true,
    taskReminders: true,
    chatMessages: true,
    announcements: true,
    weeklyDigest: false,
    marketingEmails: false,
  },

  // 개인정보 보호
  privacy: {
    publicProfile: true,
    publicActivity: false,
    searchable: true,
    showOnlineStatus: true,
    analytics: true,
    errorReports: true,
    performanceData: false,
    cookiePolicy: 'functional',
    twoFactor: false,
  },

  // 고급 설정
  advanced: {
    devMode: false,
    consoleLogs: false,
    networkLogs: false,
    betaFeatures: false,
    newUI: false,
    experimentalAPI: false,
  }
}
```

### 사용법

```jsx
import { useContext } from 'react'
import { SettingsContext } from '@/contexts/SettingsContext'

function SettingsComponent() {
  const { settings, updateSettings, resetSettings } = useContext(SettingsContext)

  // 설정 읽기
  const { language, fontSize } = settings

  // 설정 업데이트
  const changeLanguage = (lang) => {
    updateSettings({ language: lang })
  }

  // 설정 초기화
  const reset = () => {
    resetSettings()
  }

  return <div>설정 컴포넌트</div>
}
```

### 로컬 스토리지 연동

- 설정은 `localStorage`에 `systemSettings` 키로 저장됩니다.
- 페이지 로드 시 저장된 설정을 자동으로 불러옵니다.
- 설정 변경 시 자동으로 저장됩니다.

---

## 관련 문서

- [UI 컴포넌트](./components.md)
- [Custom Hooks](./hooks.md)
- [README](./README.md)

