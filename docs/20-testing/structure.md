# 📁 테스트 구조

## 개요

테스트 파일 구조입니다.

---

## 디렉토리 구조

```
coup/src/__tests__/
├── api/                    # API 라우트 테스트
│   ├── admin/                  # 관리자 API
│   │   ├── users.test.js
│   │   ├── studies.test.js
│   │   ├── reports.test.js
│   │   └── settings.test.js
│   ├── chat/                   # 채팅 API
│   ├── dashboard/              # 대시보드 API
│   │   └── dashboard-api.test.js
│   ├── groups/                 # 그룹 API
│   ├── notifications/          # 알림 API
│   ├── study/                  # 스터디 API
│   │   ├── studies.test.js
│   │   ├── study-applications.test.js
│   │   ├── study-files.test.js
│   │   ├── study-integration.test.js
│   │   ├── study-members.test.js
│   │   ├── study-notices.test.js
│   │   └── study-tasks.test.js
│   └── users/                  # 사용자 API
├── components/             # 컴포넌트 테스트
├── exceptions/             # 예외 클래스 테스트
│   ├── admin.test.js
│   ├── admin-simplified.test.js
│   ├── chat-exception.test.js
│   └── notification-exception.test.js
├── helpers/                # 헬퍼 함수 테스트
│   ├── chat-helpers.test.js
│   └── notification-helpers.test.js
├── integration/            # 통합 테스트
│   └── group-flow.test.js
├── lib/                    # 라이브러리 테스트
├── logging/                # 로깅 테스트
│   └── adminLogger.test.js
├── utils/                  # 유틸리티 테스트
│   └── study-utils.test.js
├── validators/             # 검증 함수 테스트
│   ├── chat-validators.test.js
│   ├── notification-validators.test.js
│   └── study-validators.test.js
├── setup/                  # 테스트 설정
└── __mocks__/              # Mock 모듈
    └── @auth/              # Auth 관련 Mock
```

---

## 테스트 유형별 분류

### API 테스트 (`api/`)

Route Handler 테스트입니다.

| 폴더 | 테스트 대상 |
|------|------------|
| `admin/` | 관리자 API (사용자, 스터디, 신고, 설정) |
| `chat/` | 채팅 API |
| `dashboard/` | 대시보드 API |
| `groups/` | 그룹 API |
| `notifications/` | 알림 API |
| `study/` | 스터디 API |
| `users/` | 사용자 API |

### 예외 테스트 (`exceptions/`)

Exception 클래스 테스트입니다.

| 파일 | 테스트 대상 |
|------|------------|
| `admin.test.js` | AdminException |
| `chat-exception.test.js` | ChatException |
| `notification-exception.test.js` | NotificationException |

### 헬퍼 테스트 (`helpers/`)

헬퍼 함수 테스트입니다.

| 파일 | 테스트 대상 |
|------|------------|
| `chat-helpers.test.js` | 채팅 헬퍼 |
| `notification-helpers.test.js` | 알림 헬퍼 |

### 검증 테스트 (`validators/`)

Validator 함수 테스트입니다.

| 파일 | 테스트 대상 |
|------|------------|
| `chat-validators.test.js` | 채팅 검증 |
| `notification-validators.test.js` | 알림 검증 |
| `study-validators.test.js` | 스터디 검증 |

### 통합 테스트 (`integration/`)

전체 플로우 테스트입니다.

| 파일 | 테스트 대상 |
|------|------------|
| `group-flow.test.js` | 그룹 생성~멤버 추가 플로우 |

---

## Mock 데이터

### src/mocks 구조

```javascript
// src/mocks/index.js
export * from './users'
export * from './studies'
export * from './reports'
export * from './stats'
export * from './settings'

export function getAllMockData() {
  return {
    users: require('./users').getMockUsers(),
    studies: require('./studies').getMockStudies(),
    reports: require('./reports').getMockReports(),
    stats: require('./stats').getMockStats(),
    settings: require('./settings').getMockSettings()
  }
}
```

| 파일 | Mock 데이터 |
|------|------------|
| `users.js` | 사용자 Mock |
| `studies.js` | 스터디 Mock |
| `reports.js` | 신고 Mock |
| `stats.js` | 통계 Mock |
| `settings.js` | 설정 Mock |

---

## 관련 문서

- [Jest 설정](./jest-config.md)
- [테스트 패턴](./patterns.md)
- [README](./README.md)

