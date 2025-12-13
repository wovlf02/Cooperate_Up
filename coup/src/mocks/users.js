// src/mocks/users.js
// 관리자 페이지 사용자 Mock 데이터

export const mockUsers = [
  {
    id: 'mock-user-1',
    name: '홍길동',
    email: 'hong@example.com',
    avatar: null,
    provider: 'EMAIL',
    status: 'ACTIVE',
    role: 'USER',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    _count: { 
      studies: 3,
      tasks: 12,
      notifications: 5
    }
  },
  {
    id: 'mock-user-2',
    name: '김철수',
    email: 'kim@example.com',
    avatar: null,
    provider: 'GOOGLE',
    status: 'ACTIVE',
    role: 'USER',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    _count: { 
      studies: 5,
      tasks: 23,
      notifications: 8
    }
  },
  {
    id: 'mock-user-3',
    name: '이영희',
    email: 'lee@example.com',
    avatar: null,
    provider: 'GITHUB',
    status: 'ACTIVE',
    role: 'USER',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
    _count: { 
      studies: 2,
      tasks: 8,
      notifications: 3
    }
  },
  {
    id: 'mock-user-4',
    name: '박민수',
    email: 'park@example.com',
    avatar: null,
    provider: 'EMAIL',
    status: 'SUSPENDED',
    role: 'USER',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    lastLoginAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    _count: { 
      studies: 1,
      tasks: 4,
      notifications: 2
    }
  },
  {
    id: 'mock-user-5',
    name: '정수진',
    email: 'jung@example.com',
    avatar: null,
    provider: 'GOOGLE',
    status: 'ACTIVE',
    role: 'USER',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    lastLoginAt: new Date(Date.now() - 1800000).toISOString(),
    _count: { 
      studies: 4,
      tasks: 18,
      notifications: 6
    }
  }
]

export function getMockUsers() {
  return mockUsers
}

export function getMockUserById(id) {
  return mockUsers.find(user => user.id === id)
}
