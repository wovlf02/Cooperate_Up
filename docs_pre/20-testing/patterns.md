# 📝 테스트 패턴

## 개요

테스트 작성 패턴 및 예시입니다.

---

## API 테스트 (Route Handler)

```javascript
/**
 * @jest-environment node
 */

import { GET, POST } from '@/app/api/studies/route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Mock 설정
jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    study: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

describe('GET /api/studies - 스터디 목록 조회', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockStudies = [
    {
      id: 'study1',
      name: '알고리즘 스터디',
      category: 'programming',
      owner: { id: 'user1', name: 'Test User' },
      _count: { members: 5 },
    },
  ]

  it('스터디 목록을 성공적으로 반환해야 한다', async () => {
    prisma.study.count.mockResolvedValue(1)
    prisma.study.findMany.mockResolvedValue(mockStudies)

    const request = new Request('http://localhost:3000/api/studies')
    const response = await GET(request, {})
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
  })

  it('카테고리로 필터링해야 한다', async () => {
    prisma.study.count.mockResolvedValue(1)
    prisma.study.findMany.mockResolvedValue(mockStudies)

    const request = new Request('http://localhost:3000/api/studies?category=programming')
    await GET(request, {})

    expect(prisma.study.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: 'programming',
        }),
      })
    )
  })
})
```

---

## 예외 클래스 테스트

```javascript
/**
 * @jest-environment node
 */

import ChatException from '@/lib/exceptions/chat/ChatException'

describe('ChatException', () => {
  describe('constructor', () => {
    it('기본 속성이 올바르게 설정됨', () => {
      const error = new ChatException('에러', 'CHAT-000', 400, 'medium', {})

      expect(error.name).toBe('ChatException')
      expect(error.message).toBe('에러')
      expect(error.code).toBe('CHAT-000')
      expect(error.statusCode).toBe(400)
      expect(error.domain).toBe('CHAT')
    })
  })

  describe('toJSON', () => {
    it('JSON 변환이 올바르게 동작', () => {
      const error = new ChatException('에러', 'CHAT-000', 400, 'medium', {})
      const json = error.toJSON()

      expect(json.code).toBe('CHAT-000')
      expect(json.statusCode).toBe(400)
    })
  })

  describe('static methods', () => {
    it('contentRequired - CHAT-001', () => {
      const error = ChatException.contentRequired()
      expect(error.code).toBe('CHAT-001')
      expect(error.statusCode).toBe(400)
    })

    it('authenticationRequired - CHAT-016', () => {
      const error = ChatException.authenticationRequired()
      expect(error.code).toBe('CHAT-016')
      expect(error.statusCode).toBe(401)
    })
  })
})
```

---

## 검증 함수 테스트

```javascript
/**
 * @jest-environment node
 */

import {
  validateMessageContent,
  validateStudyId,
  validatePagination,
} from '@/lib/validators/chat-validators'

describe('Chat Validators', () => {
  describe('validateMessageContent', () => {
    it('유효한 메시지는 통과해야 한다', () => {
      expect(() => validateMessageContent('안녕하세요')).not.toThrow()
    })

    it('빈 메시지는 에러를 던져야 한다', () => {
      expect(() => validateMessageContent('')).toThrow()
      expect(() => validateMessageContent(null)).toThrow()
    })

    it('너무 긴 메시지는 에러를 던져야 한다', () => {
      const longMessage = 'a'.repeat(5001)
      expect(() => validateMessageContent(longMessage)).toThrow()
    })
  })

  describe('validatePagination', () => {
    it('유효한 페이지네이션은 통과해야 한다', () => {
      const result = validatePagination({ page: 1, limit: 20 })
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
    })

    it('기본값이 적용되어야 한다', () => {
      const result = validatePagination({})
      expect(result.page).toBe(1)
    })
  })
})
```

---

## 컴포넌트 테스트

```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from '@/components/ui/EmptyState'

describe('EmptyState', () => {
  it('기본 타입으로 렌더링되어야 한다', () => {
    render(<EmptyState />)
    expect(screen.getByText('내용이 없습니다')).toBeInTheDocument()
  })

  it('커스텀 제목이 표시되어야 한다', () => {
    render(<EmptyState title="검색 결과 없음" />)
    expect(screen.getByText('검색 결과 없음')).toBeInTheDocument()
  })

  it('액션 버튼 클릭이 동작해야 한다', () => {
    const handleClick = jest.fn()
    render(<EmptyState action={<button onClick={handleClick}>추가</button>} />)

    fireEvent.click(screen.getByText('추가'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['messages', '메시지가 없습니다'],
    ['error', '오류가 발생했습니다'],
    ['search', '검색 결과가 없습니다'],
  ])('type이 %s일 때 %s 표시', (type, expectedTitle) => {
    render(<EmptyState type={type} />)
    expect(screen.getByText(expectedTitle)).toBeInTheDocument()
  })
})
```

---

## 통합 테스트

```javascript
/**
 * @jest-environment node
 */

describe('Group Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('그룹 생성부터 멤버 추가까지 전체 플로우', async () => {
    // 1. 그룹 생성
    const createResponse = await createGroup({
      name: '테스트 그룹',
      studyId: 'study-1',
    })
    expect(createResponse.success).toBe(true)

    // 2. 멤버 추가
    const addMemberResponse = await addGroupMember({
      groupId: createResponse.data.id,
      userId: 'user-2',
    })
    expect(addMemberResponse.success).toBe(true)

    // 3. 그룹 조회
    const getResponse = await getGroup(createResponse.data.id)
    expect(getResponse.data.members).toHaveLength(2)
  })
})
```

---

## 테스트 유틸리티

### 인증된 Request 생성

```javascript
export function createAuthenticatedRequest(url, options = {}) {
  return new Request(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Cookie: 'next-auth.session-token=mock-token',
      ...options.headers,
    },
  })
}
```

### Mock 세션 설정

```javascript
export function mockAuthenticatedSession(user = mockUsers[0]) {
  const { getServerSession } = require('next-auth')
  getServerSession.mockResolvedValue({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  })
}

export function mockUnauthenticatedSession() {
  const { getServerSession } = require('next-auth')
  getServerSession.mockResolvedValue(null)
}
```

---

## 모범 사례

### 1. Arrange-Act-Assert (AAA) 패턴

```javascript
it('스터디를 생성해야 한다', async () => {
  // Arrange - 준비
  const studyData = { name: '테스트 스터디' }

  // Act - 실행
  const result = await createStudy(studyData)

  // Assert - 검증
  expect(result.success).toBe(true)
})
```

### 2. 테스트 독립성

- `beforeEach`에서 Mock 초기화
- 테스트 간 상태 공유 금지

### 3. 명확한 테스트 이름

- `~해야 한다` 형식 권장
- 예: `'빈 메시지는 에러를 던져야 한다'`

### 4. 에지 케이스 테스트

- null, undefined, 빈 값
- 최대/최소 경계값
- 잘못된 타입

---

## 관련 문서

- [Jest 설정](./jest-config.md)
- [테스트 구조](./structure.md)
- [README](./README.md)

