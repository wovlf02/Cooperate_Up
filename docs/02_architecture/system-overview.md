# 🏗️ 시스템 개요

## 📋 개요

CoUp은 Next.js 16 기반의 풀스택 웹 애플리케이션으로, 클라이언트와 서버가 하나의 프로젝트에 통합되어 있습니다. App Router를 사용하여 페이지와 API를 구성하고, Socket.io를 통해 실시간 통신을 지원합니다.

---

## 🏛️ 전체 시스템 아키텍처

```mermaid
graph TB
    subgraph "클라이언트 (Browser)"
        Browser[웹 브라우저]
        React[React 19 + Next.js]
        TQ[TanStack Query]
        Socket_C[Socket.io Client]
        Context[React Context]
    end
    
    subgraph "서버 (Node.js)"
        Next[Next.js 16 Server]
        API[API Routes]
        SSR[Server Components]
        Middleware[Middleware]
        Socket_S[Socket.io Server]
        NextAuth[NextAuth.js]
    end
    
    subgraph "데이터 계층"
        Prisma[Prisma ORM]
        PG[(PostgreSQL)]
        Redis[(Redis)]
    end
    
    Browser --> React
    React --> TQ
    React --> Socket_C
    React --> Context
    
    TQ --> API
    Socket_C -.WebSocket.-> Socket_S
    
    Next --> API
    Next --> SSR
    API --> Middleware
    API --> NextAuth
    API --> Prisma
    
    Socket_S --> Redis
    Prisma --> PG
    NextAuth --> Prisma
```

---

## 🔧 핵심 컴포넌트

### 1. Next.js 서버

| 역할 | 설명 |
|------|------|
| **페이지 렌더링** | 서버/클라이언트 컴포넌트 렌더링 |
| **API 처리** | `/api/*` 경로의 RESTful API |
| **미들웨어** | 인증 체크, 라우팅 제어 |
| **정적 파일** | 이미지, CSS 등 정적 자산 제공 |

### 2. 커스텀 HTTP 서버 (server.mjs)

```javascript
// Next.js + Socket.io 통합 서버
import { createServer } from 'http'
import next from 'next'
import { initSocketServer } from './src/lib/socket/server.js'

const httpServer = createServer(...)
await initSocketServer(httpServer) // Socket.io 초기화
```

| 역할 | 설명 |
|------|------|
| **HTTP 서버** | Node.js HTTP 서버 |
| **Next.js 핸들러** | 페이지/API 요청 처리 |
| **Socket.io 서버** | 실시간 WebSocket 통신 |

### 3. 데이터베이스 (PostgreSQL + Prisma)

| 역할 | 설명 |
|------|------|
| **데이터 저장** | 모든 영구 데이터 저장 |
| **ORM** | Prisma로 타입 안전한 쿼리 |
| **마이그레이션** | 스키마 버전 관리 |

### 4. Redis

| 역할 | 설명 |
|------|------|
| **세션 스토어** | 사용자 세션 저장 |
| **Socket.io 어댑터** | 다중 서버 간 이벤트 동기화 |
| **캐싱** | 자주 조회되는 데이터 캐시 |

---

## 📁 계층 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (React Components, Pages, Layouts)                     │
├─────────────────────────────────────────────────────────┤
│                    Application Layer                     │
│  (API Routes, Server Actions, Middleware)               │
├─────────────────────────────────────────────────────────┤
│                    Domain Layer                          │
│  (Validators, Helpers, Business Logic)                  │
├─────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                  │
│  (Prisma, Redis, Socket.io, NextAuth)                   │
├─────────────────────────────────────────────────────────┤
│                    Database Layer                        │
│  (PostgreSQL)                                           │
└─────────────────────────────────────────────────────────┘
```

### Presentation Layer
- React 컴포넌트 (`src/components/`)
- 페이지 (`src/app/*/page.js`)
- 레이아웃 (`src/app/*/layout.js`)
- 스타일 (`src/styles/`, `*.module.css`)

### Application Layer
- API Routes (`src/app/api/`)
- Middleware (`middleware.js`)
- Providers (`src/app/providers.js`)

### Domain Layer
- Validators (`src/lib/validators/`)
- Helpers (`src/lib/*-helpers.js`)
- Utilities (`src/utils/`)

### Infrastructure Layer
- Prisma Client (`src/lib/prisma.js`)
- Redis Client (`src/lib/redis.js`)
- Socket.io (`src/lib/socket/`)
- NextAuth (`src/lib/auth.js`)

---

## 🔄 요청 흐름

### 페이지 요청 흐름

```mermaid
sequenceDiagram
    participant B as Browser
    participant M as Middleware
    participant P as Page Component
    participant API as API Route
    participant DB as Database
    
    B->>M: 페이지 요청
    M->>M: 인증 체크
    alt 인증 필요 & 미로그인
        M->>B: 로그인 페이지로 리다이렉트
    else 인증됨 또는 공개 페이지
        M->>P: 요청 전달
        P->>P: 서버 컴포넌트 렌더링
        P->>DB: 데이터 조회 (필요시)
        P->>B: HTML 응답
        B->>B: Hydration
    end
```

### API 요청 흐름

```mermaid
sequenceDiagram
    participant C as Client
    participant TQ as TanStack Query
    participant API as API Route
    participant Auth as NextAuth
    participant V as Validator
    participant DB as Prisma/DB
    
    C->>TQ: 데이터 요청
    TQ->>TQ: 캐시 확인
    alt 캐시 히트
        TQ->>C: 캐시된 데이터 반환
    else 캐시 미스
        TQ->>API: HTTP 요청
        API->>Auth: 세션 확인
        Auth->>API: 사용자 정보
        API->>V: 입력 검증
        V->>API: 검증 결과
        API->>DB: 쿼리 실행
        DB->>API: 결과
        API->>TQ: JSON 응답
        TQ->>TQ: 캐시 저장
        TQ->>C: 데이터 반환
    end
```

---

## 🖥️ 서버 컴포넌트 vs 클라이언트 컴포넌트

### 서버 컴포넌트 (기본값)

| 특징 | 설명 |
|------|------|
| **렌더링** | 서버에서만 렌더링 |
| **데이터 페칭** | 직접 DB 조회 가능 |
| **번들 크기** | 클라이언트에 포함 안 됨 |
| **사용 사례** | 페이지 레이아웃, 정적 콘텐츠 |

```javascript
// 서버 컴포넌트 (기본)
export default async function StudyPage({ params }) {
  const study = await prisma.study.findUnique({
    where: { id: params.id }
  });
  
  return <div>{study.name}</div>;
}
```

### 클라이언트 컴포넌트 ('use client')

| 특징 | 설명 |
|------|------|
| **렌더링** | 클라이언트에서 렌더링 |
| **인터랙션** | 이벤트 핸들러, 상태 사용 가능 |
| **훅 사용** | useState, useEffect 등 |
| **사용 사례** | 폼, 채팅, 실시간 UI |

```javascript
'use client'

import { useState } from 'react';

export default function ChatInput() {
  const [message, setMessage] = useState('');
  
  return (
    <input 
      value={message} 
      onChange={(e) => setMessage(e.target.value)} 
    />
  );
}
```

### 하이브리드 패턴

```javascript
// 페이지 (서버 컴포넌트)
export default async function StudyPage({ params }) {
  const study = await getStudy(params.id); // 서버에서 데이터 로드
  
  return (
    <div>
      <StudyHeader study={study} />      {/* 서버 컴포넌트 */}
      <ChatSection studyId={study.id} /> {/* 클라이언트 컴포넌트 */}
    </div>
  );
}
```

---

## 🔌 외부 서비스 연동

| 서비스 | 용도 | 설정 |
|--------|------|------|
| **PostgreSQL** | 데이터 저장 | `DATABASE_URL` 환경변수 |
| **Redis** | 캐싱, Socket.io | `REDIS_URL` 환경변수 |
| **Signaling Server** | WebRTC 시그널링 | 별도 서버 (`signaling-server/`) |

---

## 🔗 관련 문서

- [데이터 흐름](./data-flow.md)
- [인증 흐름](./authentication-flow.md)
- [실시간 통신](./realtime-communication.md)
- [기술 스택](../01_overview/tech-stack.md)
