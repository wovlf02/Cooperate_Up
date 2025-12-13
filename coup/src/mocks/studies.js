// src/mocks/studies.js
// 관리자 페이지 스터디 Mock 데이터

export const mockStudies = [
  {
    id: 'mock-study-1',
    name: '알고리즘 스터디',
    description: '코딩테스트 준비를 위한 알고리즘 스터디',
    category: 'ALGORITHM',
    visibility: 'PUBLIC',
    maxMembers: 10,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'mock-user-1',
      name: '홍길동',
      email: 'hong@example.com'
    },
    _count: {
      members: 8,
      tasks: 15,
      files: 23
    }
  },
  {
    id: 'mock-study-2',
    name: 'React 실전 프로젝트',
    description: 'React로 실전 프로젝트를 만들어보는 스터디',
    category: 'WEB_DEVELOPMENT',
    visibility: 'PUBLIC',
    maxMembers: 15,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    owner: {
      id: 'mock-user-2',
      name: '김철수',
      email: 'kim@example.com'
    },
    _count: {
      members: 12,
      tasks: 28,
      files: 45
    }
  },
  {
    id: 'mock-study-3',
    name: '토익 900점 달성',
    description: '3개월 안에 토익 900점 달성하기',
    category: 'LANGUAGE',
    visibility: 'PRIVATE',
    maxMembers: 5,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    owner: {
      id: 'mock-user-3',
      name: '이영희',
      email: 'lee@example.com'
    },
    _count: {
      members: 5,
      tasks: 42,
      files: 18
    }
  },
  {
    id: 'mock-study-4',
    name: '디자인 패턴 스터디',
    description: '객체지향 디자인 패턴 학습',
    category: 'COMPUTER_SCIENCE',
    visibility: 'PUBLIC',
    maxMembers: 8,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    owner: {
      id: 'mock-user-5',
      name: '정수진',
      email: 'jung@example.com'
    },
    _count: {
      members: 6,
      tasks: 19,
      files: 31
    }
  },
  {
    id: 'mock-study-5',
    name: 'AWS 자격증 준비',
    description: 'AWS Solutions Architect 자격증 취득',
    category: 'CERTIFICATION',
    visibility: 'PUBLIC',
    maxMembers: 12,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 21).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
    owner: {
      id: 'mock-user-1',
      name: '홍길동',
      email: 'hong@example.com'
    },
    _count: {
      members: 9,
      tasks: 35,
      files: 52
    }
  }
]

export function getMockStudies() {
  return mockStudies
}

export function getMockStudyById(id) {
  return mockStudies.find(study => study.id === id)
}

