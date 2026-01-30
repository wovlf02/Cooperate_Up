# 🧪 테스트

## 개요

Jest 및 Testing Library 기반 테스트 환경입니다.

---

## 문서 목록

| 문서 | 설명 |
|------|------|
| [jest-config.md](./jest-config.md) | Jest 설정 및 명령어 |
| [structure.md](./structure.md) | 테스트 디렉토리 구조 |
| [patterns.md](./patterns.md) | 테스트 작성 패턴 및 예시 |

---

## 빠른 시작

### 테스트 실행

```bash
# 모든 테스트
npm test

# 감시 모드
npm test -- --watch

# 커버리지
npm test -- --coverage
```

### 특정 테스트 실행

```bash
# 파일별
npm test -- path/to/test.js

# 패턴별
npm test -- --testPathPattern="api"
npm test -- --testPathPattern="study"
```

→ [Jest 설정 상세](./jest-config.md)

---

## 테스트 구조

```
coup/src/__tests__/
├── api/                # API 라우트 테스트
├── components/         # 컴포넌트 테스트
├── exceptions/         # 예외 클래스 테스트
├── helpers/            # 헬퍼 함수 테스트
├── integration/        # 통합 테스트
├── validators/         # 검증 함수 테스트
└── __mocks__/          # Mock 모듈
```

→ [테스트 구조 상세](./structure.md)

---

## 테스트 패턴 예시

### API 테스트

```javascript
describe('GET /api/studies', () => {
  it('스터디 목록을 반환해야 한다', async () => {
    const response = await GET(request, {})
    expect(response.status).toBe(200)
  })
})
```

### 예외 테스트

```javascript
describe('ChatException', () => {
  it('contentRequired 에러 생성', () => {
    const error = ChatException.contentRequired()
    expect(error.code).toBe('CHAT-001')
  })
})
```

→ [테스트 패턴 상세](./patterns.md)

---

## 커버리지 기준

| 항목 | 기준 |
|------|------|
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |
| Statements | 70% |

---

## 관련 문서

- [공통 컴포넌트](../18-common/README.md)
- [인프라스트럭처](../19-infrastructure/README.md)
- [기술 스택](../00-overview/tech-stack.md)
