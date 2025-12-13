# 🧪 테스트

## 개요

Jest 기반 테스트 환경입니다.

---

## 테스트 구성

### Jest 설정

```javascript
// jest.config.js
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
};
```

---

## 테스트 구조

```
coup/src/__tests__/
├── api/                    # API 테스트
│   ├── dashboard/
│   ├── study/
│   ├── admin/
│   └── ...
├── components/             # 컴포넌트 테스트
├── exceptions/             # 예외 클래스 테스트
├── helpers/                # 헬퍼 함수 테스트
├── integration/            # 통합 테스트
├── lib/                    # 라이브러리 테스트
├── logging/                # 로깅 테스트
├── utils/                  # 유틸리티 테스트
├── validators/             # 검증 함수 테스트
├── setup/                  # 테스트 설정
└── __mocks__/              # 목 데이터
```

---

## 테스트 명령어

```bash
# 모든 테스트 실행
npm test

# 감시 모드
npm test -- --watch

# 특정 파일 테스트
npm test -- path/to/test.js

# 커버리지 포함
npm test -- --coverage

# 특정 패턴 테스트
npm test -- --testPathPattern="api"
```

---

## 테스트 작성 패턴

### API 테스트

```javascript
// __tests__/api/study/study-notices.test.js
import { GET, POST } from '@/app/api/studies/[id]/notices/route';

describe('Study Notices API', () => {
  describe('GET /api/studies/[id]/notices', () => {
    it('should return notices list', async () => {
      const request = new Request('http://localhost/api/studies/123/notices');
      const context = { params: { id: '123' } };
      
      const response = await GET(request, context);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('POST /api/studies/[id]/notices', () => {
    it('should create a notice', async () => {
      const request = new Request('http://localhost/api/studies/123/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Notice',
          content: 'Test Content'
        })
      });
      
      const response = await POST(request, { params: { id: '123' } });
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Test Notice');
    });
  });
});
```

### 예외 테스트

```javascript
// __tests__/exceptions/study-exception.test.js
import { StudyNoticeException } from '@/lib/exceptions/study';

describe('StudyNoticeException', () => {
  describe('titleRequired', () => {
    it('should create exception with correct code', () => {
      const exception = StudyNoticeException.titleRequired();
      
      expect(exception.code).toBe('STUDY-116');
      expect(exception.statusCode).toBe(400);
      expect(exception.message).toContain('제목');
    });
  });

  describe('pinnedNoticeLimitExceeded', () => {
    it('should include limit in message', () => {
      const exception = StudyNoticeException.pinnedNoticeLimitExceeded(3, 3);
      
      expect(exception.code).toBe('STUDY-121');
      expect(exception.userMessage).toContain('3');
    });
  });
});
```

### 컴포넌트 테스트

```javascript
// __tests__/components/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 목 (Mock)

### Prisma 목

```javascript
// __mocks__/prisma.js
export const prisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  study: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  // ...
};
```

### NextAuth 목

```javascript
// __mocks__/next-auth.js
export const getServerSession = jest.fn().mockResolvedValue({
  user: {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com'
  }
});
```

---

## 설정 파일

### jest.setup.js

```javascript
import '@testing-library/jest-dom';

// 전역 목 설정
jest.mock('@/lib/prisma', () => ({
  prisma: require('./__mocks__/prisma').prisma
}));

// 환경 변수
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test';
```

---

## 커버리지

### 커버리지 임계값

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### 커버리지 리포트

```bash
npm test -- --coverage

# 출력 예시
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   75.5  |   72.3   |   78.2  |   75.8  |
 lib/exceptions/    |   90.2  |   85.5   |   92.1  |   90.5  |
 lib/utils/         |   82.3  |   78.9   |   85.6  |   82.8  |
 ...                |   ...   |   ...    |   ...   |   ...   |
--------------------|---------|----------|---------|---------|
```

---

## 관련 문서

- [Jest 공식 문서](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)

