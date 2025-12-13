// src/mocks/reports.js
// 관리자 페이지 신고 Mock 데이터

export const mockReports = [
  {
    id: 'mock-report-1',
    type: 'SPAM',
    targetType: 'MESSAGE',
    targetId: 'msg-123',
    targetName: '스팸성 홍보 메시지',
    reason: '반복적인 광고성 메시지를 계속 전송합니다.',
    priority: 'HIGH',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reporter: {
      id: 'mock-user-1',
      name: '홍길동',
      email: 'hong@example.com',
      avatar: null
    },
    reported: {
      id: 'mock-user-4',
      name: '박민수',
      email: 'park@example.com'
    }
  },
  {
    id: 'mock-report-2',
    type: 'HARASSMENT',
    targetType: 'MESSAGE',
    targetId: 'msg-456',
    targetName: '부적절한 언어 사용',
    reason: '욕설과 비방이 포함된 메시지입니다.',
    priority: 'URGENT',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    reporter: {
      id: 'mock-user-2',
      name: '김철수',
      email: 'kim@example.com',
      avatar: null
    },
    reported: {
      id: 'mock-user-4',
      name: '박민수',
      email: 'park@example.com'
    }
  },
  {
    id: 'mock-report-3',
    type: 'INAPPROPRIATE',
    targetType: 'STUDY',
    targetId: 'study-789',
    targetName: '부적절한 스터디 내용',
    reason: '스터디 설명에 부적절한 내용이 포함되어 있습니다.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    reporter: {
      id: 'mock-user-3',
      name: '이영희',
      email: 'lee@example.com',
      avatar: null
    },
    reported: {
      id: 'mock-user-4',
      name: '박민수',
      email: 'park@example.com'
    }
  },
  {
    id: 'mock-report-4',
    type: 'COPYRIGHT',
    targetType: 'FILE',
    targetId: 'file-101',
    targetName: '저작권 침해 파일',
    reason: '저작권이 있는 자료를 무단으로 공유하고 있습니다.',
    priority: 'HIGH',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    reporter: {
      id: 'mock-user-5',
      name: '정수진',
      email: 'jung@example.com',
      avatar: null
    },
    reported: {
      id: 'mock-user-4',
      name: '박민수',
      email: 'park@example.com'
    }
  },
  {
    id: 'mock-report-5',
    type: 'SPAM',
    targetType: 'USER',
    targetId: 'mock-user-4',
    targetName: '스팸 계정',
    reason: '여러 스터디에서 반복적으로 스팸 활동을 하고 있습니다.',
    priority: 'URGENT',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
    reporter: {
      id: 'mock-user-1',
      name: '홍길동',
      email: 'hong@example.com',
      avatar: null
    },
    reported: {
      id: 'mock-user-4',
      name: '박민수',
      email: 'park@example.com'
    }
  },
  {
    id: 'mock-report-6',
    type: 'INAPPROPRIATE',
    targetType: 'MESSAGE',
    targetId: 'msg-789',
    targetName: '부적절한 이미지',
    reason: '부적절한 이미지를 공유했습니다.',
    priority: 'LOW',
    status: 'REJECTED',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    reporter: {
      id: 'mock-user-2',
      name: '김철수',
      email: 'kim@example.com',
      avatar: null
    },
    reported: {
      id: 'mock-user-3',
      name: '이영희',
      email: 'lee@example.com'
    }
  }
]

export function getMockReports() {
  return mockReports
}

export function getMockReportById(id) {
  return mockReports.find(report => report.id === id)
}

export function getMockReportsByStatus(status) {
  return mockReports.filter(report => report.status === status)
}

export function getMockReportsByPriority(priority) {
  return mockReports.filter(report => report.priority === priority)
}

