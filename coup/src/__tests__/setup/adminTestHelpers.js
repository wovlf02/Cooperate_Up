/**
 * Admin 테스트 헬퍼 함수
 *
 * @module __tests__/setup/adminTestHelpers
 */

import { getServerSession } from 'next-auth';

/**
 * 관리자 세션 Mock
 */
export const mockAdminSession = (adminData = {}) => {
  const defaultAdmin = {
    id: 'admin-test-id',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: 'ADMIN',
    ...adminData
  };

  getServerSession.mockResolvedValue({
    user: defaultAdmin
  });

  return defaultAdmin;
};

/**
 * Super Admin 세션 Mock
 */
export const mockSuperAdminSession = (adminData = {}) => {
  return mockAdminSession({
    role: 'SUPERADMIN',
    ...adminData
  });
};

/**
 * 일반 사용자 세션 Mock (관리자 아님)
 */
export const mockUserSession = (userData = {}) => {
  const defaultUser = {
    id: 'user-test-id',
    email: 'user@test.com',
    name: 'Test User',
    role: 'USER',
    ...userData
  };

  getServerSession.mockResolvedValue({
    user: defaultUser
  });

  return defaultUser;
};

/**
 * 인증되지 않은 세션 Mock
 */
export const mockUnauthenticatedSession = () => {
  getServerSession.mockResolvedValue(null);
};

/**
 * Mock 사용자 데이터 생성
 */
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'testuser@test.com',
  name: 'Test User',
  avatar: null,
  bio: 'Test bio',
  status: 'ACTIVE',
  provider: 'credentials',
  emailVerified: new Date(),
  createdAt: new Date('2024-01-01'),
  lastLoginAt: new Date('2024-12-01'),
  loginCount: 10,
  _count: {
    ownedStudies: 2,
    studyMembers: 5,
    messages: 20,
    receivedWarnings: 0,
    sanctions: 0,
  },
  receivedWarnings: [],
  sanctions: [],
  ...overrides
});

/**
 * Mock 스터디 데이터 생성
 */
export const createMockStudy = (overrides = {}) => ({
  id: 'study-1',
  title: 'Test Study',
  description: 'Test study description',
  status: 'ACTIVE',
  visibility: 'PUBLIC',
  category: 'DEV',
  maxMembers: 10,
  ownerId: 'user-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-12-01'),
  _count: {
    members: 5,
    applications: 3,
    notices: 10,
    tasks: 8,
  },
  owner: {
    id: 'user-1',
    name: 'Study Owner',
    email: 'owner@test.com',
  },
  ...overrides
});

/**
 * Mock 신고 데이터 생성
 */
export const createMockReport = (overrides = {}) => ({
  id: 'report-1',
  type: 'STUDY',
  targetId: 'study-1',
  targetType: 'STUDY',
  reason: 'SPAM',
  description: 'Test report description',
  status: 'PENDING',
  priority: 'MEDIUM',
  createdAt: new Date('2024-12-01'),
  reporter: {
    id: 'user-1',
    name: 'Reporter',
    email: 'reporter@test.com',
  },
  ...overrides
});

/**
 * Mock AdminRole 데이터 생성
 */
export const createMockAdminRole = (overrides = {}) => ({
  id: 'admin-role-1',
  userId: 'admin-test-id',
  role: 'ADMIN',
  permissions: ['USER_VIEW', 'USER_EDIT', 'STUDY_VIEW'],
  createdAt: new Date('2024-01-01'),
  user: {
    id: 'admin-test-id',
    email: 'admin@test.com',
    name: 'Test Admin',
  },
  ...overrides
});

/**
 * Mock 설정 데이터 생성
 */
export const createMockSettings = (overrides = {}) => ({
  id: 'settings-1',
  key: 'maintenance_mode',
  value: 'false',
  type: 'BOOLEAN',
  category: 'SYSTEM',
  description: 'Maintenance mode setting',
  isPublic: false,
  updatedBy: 'admin-test-id',
  updatedAt: new Date('2024-12-01'),
  ...overrides
});

/**
 * 페이지네이션 응답 검증
 */
export const expectPaginatedResponse = (data, expectedStructure = {}) => {
  expect(data).toHaveProperty('success', true);
  expect(data).toHaveProperty('data');
  expect(data).toHaveProperty('pagination');
  expect(data.pagination).toHaveProperty('page');
  expect(data.pagination).toHaveProperty('limit');
  expect(data.pagination).toHaveProperty('total');
  expect(data.pagination).toHaveProperty('totalPages');

  if (expectedStructure.minTotal !== undefined) {
    expect(data.pagination.total).toBeGreaterThanOrEqual(expectedStructure.minTotal);
  }

  if (expectedStructure.dataLength !== undefined) {
    expect(data.data.length).toBe(expectedStructure.dataLength);
  }
};

/**
 * 에러 응답 검증
 */
export const expectErrorResponse = (data, expectedError = {}) => {
  expect(data).toHaveProperty('success', false);
  expect(data).toHaveProperty('error');

  if (expectedError.code) {
    expect(data.error.code).toBe(expectedError.code);
  }

  if (expectedError.message) {
    expect(data.error.message).toContain(expectedError.message);
  }
};

/**
 * 관리자 권한 검증 헬퍼
 */
export const expectPermissionDenied = (data) => {
  expect(data.success).toBe(false);
  expect(data.error.code).toMatch(/ADMIN-00[1-5]/); // Permission error codes
};

/**
 * Request Mock 생성
 */
export const createMockRequest = (options = {}) => {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/admin/test',
    searchParams = {},
    body = null,
    headers = {}
  } = options;

  const searchParamsObj = new URLSearchParams(searchParams);
  const fullUrl = `${url}?${searchParamsObj.toString()}`;

  return {
    method,
    url: fullUrl,
    headers: new Headers(headers),
    json: body ? async () => body : undefined,
  };
};

/**
 * 시간 관련 헬퍼
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const subtractDays = (date, days) => {
  return addDays(date, -days);
};

/**
 * 테스트 데이터 정리
 */
export const clearAllMocks = () => {
  jest.clearAllMocks();
};

/**
 * Prisma Mock 리셋
 */
export const resetPrismaMocks = (prisma) => {
  Object.keys(prisma).forEach(model => {
    if (typeof prisma[model] === 'object') {
      Object.keys(prisma[model]).forEach(method => {
        if (typeof prisma[model][method]?.mockReset === 'function') {
          prisma[model][method].mockReset();
        }
      });
    }
  });
};

