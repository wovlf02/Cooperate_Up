# 🛠️ 기술 스택

## 개요

CoUp은 최신 웹 기술 스택을 사용하여 구축되었습니다. Next.js 16과 React 19를 기반으로, 실시간 통신과 확장성을 고려한 아키텍처를 채택하고 있습니다.

---

## Frontend

### 핵심 프레임워크

| 기술 | 버전 | 설명 |
|------|------|------|
| **Next.js** | 16 | App Router, SSR/CSR 하이브리드 렌더링 |
| **React** | 19 | React Compiler를 통한 자동 최적화 |
| **JavaScript** | ES6+ | 런타임 타입 검증은 Zod로 보완 |

### 스타일링

| 기술 | 버전 | 설명 |
|------|------|------|
| **Tailwind CSS** | 4 | 유틸리티 기반 CSS 프레임워크 |
| **CSS Modules** | - | 컴포넌트 스코프 스타일링 |
| **PostCSS** | - | CSS 후처리 |

### 상태 관리 & 데이터 페칭

| 기술 | 버전 | 설명 |
|------|------|------|
| **TanStack Query** | 5 | 서버 상태 관리, 캐싱, 동기화 |
| **React Context** | - | 전역 상태 (Settings, Socket) |

### 실시간 통신

| 기술 | 버전 | 설명 |
|------|------|------|
| **Socket.IO Client** | 4 | WebSocket 기반 실시간 통신 |
| **WebRTC** | - | P2P 화상통화 |

### UI 컴포넌트 & 유틸리티

| 기술 | 버전 | 용도 |
|------|------|------|
| **Recharts** | 3 | 차트/그래프 시각화 |
| **React Toastify** | 11 | 토스트 알림 |
| **React Markdown** | 10 | 마크다운 렌더링 |
| **remark-gfm** | 4 | GitHub 스타일 마크다운 |
| **sanitize-html** | 2 | HTML 살균 (XSS 방지) |

---

## Backend

### 서버 프레임워크

| 기술 | 버전 | 설명 |
|------|------|------|
| **Next.js API Routes** | 16 | RESTful API 서버 |
| **Express.js** | 4 | Signaling Server용 |
| **Node.js** | 18+ | JavaScript 런타임 |

### 인증 & 보안

| 기술 | 버전 | 용도 |
|------|------|------|
| **NextAuth.js** | 4 | 인증/인가 프레임워크 |
| **bcryptjs** | 3 | 비밀번호 해싱 |
| **jsonwebtoken** | 9 | JWT 토큰 생성/검증 |
| **Zod** | 4 | 런타임 데이터 검증 |

### ORM & 데이터베이스

| 기술 | 버전 | 용도 |
|------|------|------|
| **Prisma** | 6 | ORM, 마이그레이션, 타입 생성 |
| **@prisma/client** | 6 | 데이터베이스 클라이언트 |
| **@auth/prisma-adapter** | 2 | NextAuth Prisma 어댑터 |

### 실시간 & 메시징

| 기술 | 버전 | 용도 |
|------|------|------|
| **Socket.IO** | 4 | WebSocket 서버 |
| **@socket.io/redis-adapter** | 8 | 멀티서버 지원 |

### 로깅

| 기술 | 버전 | 용도 |
|------|------|------|
| **Winston** | 3 | 구조화된 로깅 |

### 유틸리티

| 기술 | 버전 | 용도 |
|------|------|------|
| **nanoid** | 5 | 고유 ID 생성 |
| **dotenv** | 17 | 환경 변수 관리 |

---

## Database & Infrastructure

### 데이터 스토어

| 기술 | 버전 | 용도 |
|------|------|------|
| **PostgreSQL** | 15 | 관계형 데이터베이스 |
| **Redis** | 7 | 캐시, Pub/Sub, 세션 |

### 컨테이너

| 기술 | 버전 | 용도 |
|------|------|------|
| **Docker** | Latest | 컨테이너화 |
| **Docker Compose** | 3.8 | 멀티 컨테이너 오케스트레이션 |

---

## Signaling Server

화상통화와 실시간 기능을 위한 별도 마이크로서비스입니다.

| 기술 | 버전 | 용도 |
|------|------|------|
| **Express.js** | 4 | HTTP 서버 |
| **Socket.IO** | 4 | WebSocket 서버 |
| **Redis Adapter** | 8 | 멀티서버 지원 |
| **CORS** | 2 | 크로스 오리진 설정 |

---

## Development Tools

### 코드 품질

| 도구 | 용도 |
|------|------|
| **ESLint** | 코드 린팅 (eslint-config-next) |
| **babel-plugin-react-compiler** | React 19 컴파일러 |

### 테스트

| 도구 | 버전 | 용도 |
|------|------|------|
| **Jest** | 30 | 테스트 프레임워크 |
| **@testing-library/react** | 16 | React 컴포넌트 테스트 |
| **@testing-library/jest-dom** | 6 | DOM 매처 확장 |
| **@testing-library/user-event** | 14 | 사용자 이벤트 시뮬레이션 |
| **jest-environment-jsdom** | 30 | 브라우저 환경 에뮬레이션 |

### 데이터베이스 도구

| 도구 | 용도 |
|------|------|
| **Prisma Studio** | 데이터베이스 GUI |
| **Prisma Migrate** | 스키마 마이그레이션 |

---

## 버전 호환성

### Node.js 요구사항

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 주요 의존성 버전

```json
{
  "dependencies": {
    "next": "16.0.1",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "prisma": "^6.19.0",
    "@prisma/client": "^6.19.0",
    "next-auth": "^4.24.13",
    "socket.io": "^4.8.1",
    "socket.io-client": "^4.8.1",
    "zod": "^4.1.12",
    "winston": "^3.18.3"
  }
}
```

---

## 기술 선택 이유

### Next.js 16 + React 19

| 이유 | 설명 |
|------|------|
| **App Router** | 파일 시스템 기반 라우팅, 레이아웃 중첩 |
| **Server Components** | 서버에서 데이터 페칭, 번들 크기 감소 |
| **React Compiler** | 자동 메모이제이션, 성능 최적화 |
| **Streaming** | 점진적 렌더링으로 UX 개선 |

### TanStack Query (React Query)

| 이유 | 설명 |
|------|------|
| **캐싱** | 자동 캐싱 및 백그라운드 동기화 |
| **상태 관리** | 서버 상태 전용, 보일러플레이트 감소 |
| **DevTools** | 디버깅 도구 내장 |
| **Optimistic Updates** | 낙관적 업데이트로 UX 개선 |

### Prisma ORM

| 이유 | 설명 |
|------|------|
| **타입 안정성** | 자동 생성 TypeScript 타입 |
| **마이그레이션** | 스키마 기반 마이그레이션 |
| **직관적 API** | 체이닝 가능한 쿼리 빌더 |
| **Prisma Studio** | 시각적 데이터베이스 관리 |

### Socket.IO + Redis

| 이유 | 설명 |
|------|------|
| **실시간** | 양방향 실시간 통신 |
| **확장성** | Redis Adapter로 수평 확장 |
| **폴백** | WebSocket 미지원 시 polling 폴백 |
| **룸 지원** | 내장 룸(Room) 기능 |

### Zod 검증

| 이유 | 설명 |
|------|------|
| **런타임 검증** | JavaScript에서도 타입 안정성 |
| **스키마 정의** | 선언적 스키마 정의 |
| **에러 메시지** | 상세한 에러 메시지 |
| **타입 추론** | TypeScript 타입 자동 추론 |

---

## 관련 문서

- [아키텍처](./architecture.md) - 시스템 구조
- [폴더 구조](./folder-structure.md) - 디렉터리 구성
- [배포](./deployment.md) - 환경 설정

