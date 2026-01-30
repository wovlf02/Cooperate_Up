# ⚙️ Jest 설정

## 개요

Jest 테스트 환경 설정입니다.

---

## jest.config.js

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',  // Next.js 앱 경로
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx}',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

---

## jest.setup.js

```javascript
import '@testing-library/jest-dom'

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    study: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    studyMember: {
      findMany: jest.fn(),
    },
    report: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    systemSettings: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    adminRole: {
      findUnique: jest.fn(),
    },
  },
}))

// Mock PrismaClient constructor
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    // 모든 모델 Mock
  })),
}))
```

---

## 테스트 명령어

```bash
# 모든 테스트 실행
npm test

# 감시 모드 (파일 변경 시 자동 실행)
npm test -- --watch

# 특정 파일 테스트
npm test -- path/to/test.js

# 특정 패턴 테스트
npm test -- --testPathPattern="api"
npm test -- --testPathPattern="study"

# 커버리지 리포트 생성
npm test -- --coverage

# 상세 출력
npm test -- --verbose

# 단일 실행 (CI 환경)
npm test -- --ci --runInBand
```

---

## 커버리지 기준

| 항목 | 기준 |
|------|------|
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |
| Statements | 70% |

### 커버리지 리포트 확인

```bash
# 커버리지 리포트 생성
npm test -- --coverage

# HTML 리포트 열기
open coverage/lcov-report/index.html
```

---

## 관련 문서

- [테스트 구조](./structure.md)
- [테스트 패턴](./patterns.md)
- [README](./README.md)

