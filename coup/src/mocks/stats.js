// src/mocks/stats.js
// 관리자 대시보드 통계 Mock 데이터

export const mockStats = {
  users: {
    total: 1247,
    active: 1180,
    suspended: 45,
    deleted: 22,
    newToday: 8,
    newThisWeek: 52
  },
  studies: {
    total: 356,
    active: 298,
    inactive: 42,
    archived: 16,
    newToday: 3,
    newThisWeek: 18,
    byCategory: [
      { category: 'ALGORITHM', count: 78 },
      { category: 'WEB_DEVELOPMENT', count: 65 },
      { category: 'LANGUAGE', count: 52 },
      { category: 'COMPUTER_SCIENCE', count: 45 },
      { category: 'CERTIFICATION', count: 38 },
      { category: 'ETC', count: 78 }
    ]
  },
  tasks: {
    total: 4523,
    completed: 3127,
    pending: 1396,
    newThisWeek: 234
  },
  reports: {
    total: 67,
    pending: 15,
    inProgress: 8,
    resolved: 38,
    rejected: 6,
    urgent: 3
  },
  notifications: {
    total: 8934,
    unread: 2341
  }
}

export function getMockStats() {
  return mockStats
}

// 사용자 증가 데이터 생성
export function generateUserGrowthData(days = 30) {
  const data = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // 랜덤하지만 증가 추세를 가진 데이터
    const baseCount = 10 + Math.floor((days - i) * 0.5)
    const randomVariation = Math.floor(Math.random() * 10) - 5
    const count = Math.max(5, baseCount + randomVariation)

    data.push({
      date: date.toISOString().split('T')[0],
      users: count,
      label: `${date.getMonth() + 1}/${date.getDate()}`
    })
  }

  return data
}

// 기간별 사용자 증가 데이터 생성
export function generateUserGrowthByPeriod(period = 'weekly') {
  const data = []
  const today = new Date()

  if (period === 'weekly') {
    // 주간: 최근 7일
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const baseTotal = 1000 + (6 - i) * 50 + Math.floor(Math.random() * 30)
      const baseActive = Math.floor(baseTotal * 0.85) + Math.floor(Math.random() * 20)
      const baseNew = 5 + Math.floor(Math.random() * 15)

      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        total: baseTotal,
        active: baseActive,
        new: baseNew
      })
    }
  } else if (period === 'monthly') {
    // 월간: 최근 30일 (5일 단위로 표시)
    for (let i = 29; i >= 0; i -= 5) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const baseTotal = 800 + (29 - i) * 20 + Math.floor(Math.random() * 50)
      const baseActive = Math.floor(baseTotal * 0.82) + Math.floor(Math.random() * 30)
      const baseNew = 10 + Math.floor(Math.random() * 25)

      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        total: baseTotal,
        active: baseActive,
        new: baseNew
      })
    }
  } else if (period === 'yearly') {
    // 연간: 최근 12개월
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today)
      date.setMonth(date.getMonth() - i)

      const baseTotal = 500 + (11 - i) * 100 + Math.floor(Math.random() * 80)
      const baseActive = Math.floor(baseTotal * 0.80) + Math.floor(Math.random() * 50)
      const baseNew = 50 + Math.floor(Math.random() * 100)

      data.push({
        date: `${date.getMonth() + 1}월`,
        total: baseTotal,
        active: baseActive,
        new: baseNew
      })
    }
  }

  return data
}

// 스터디 활동 데이터 생성
export function generateStudyActivityData(period = 'weekly') {
  if (period === 'weekly') {
    // 주간: 최근 7일
    const days = ['월', '화', '수', '목', '금', '토', '일']
    return days.map((day, index) => ({
      category: day,
      count: Math.floor(Math.random() * 30) + 20 + (index < 5 ? 10 : -5), // 주중이 더 활발
      label: day
    }))
  } else if (period === 'monthly') {
    // 월간: 최근 30일을 5일 단위로
    const data = []
    const today = new Date()
    for (let i = 25; i >= 0; i -= 5) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      data.push({
        category: `${date.getMonth() + 1}/${date.getDate()}`,
        count: Math.floor(Math.random() * 80) + 60,
        label: `${date.getMonth() + 1}/${date.getDate()}`
      })
    }
    return data
  } else if (period === 'yearly') {
    // 연간: 최근 12개월
    const data = []
    const today = new Date()
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today)
      date.setMonth(date.getMonth() - i)
      const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
      data.push({
        category: monthNames[date.getMonth()],
        count: Math.floor(Math.random() * 200) + 150,
        label: monthNames[date.getMonth()]
      })
    }
    return data
  }

  // 기본값: 주간
  const days = ['월', '화', '수', '목', '금', '토', '일']
  return days.map((day, index) => ({
    category: day,
    count: Math.floor(Math.random() * 30) + 20 + (index < 5 ? 10 : -5),
    label: day
  }))
}

// 시스템 상태 데이터
export function generateSystemStatus() {
  return {
    cpu: Math.floor(Math.random() * 30) + 30, // 30-60%
    memory: Math.floor(Math.random() * 20) + 50, // 50-70%
    disk: Math.floor(Math.random() * 20) + 30, // 30-50%
    network: Math.floor(Math.random() * 40) + 20 // 20-60%
  }
}

// 참여율 트렌드 데이터
export function generateEngagementTrend() {
  const days = ['월', '화', '수', '목', '금', '토', '일']

  return days.map(day => ({
    day,
    rate: Math.floor(Math.random() * 20) + 70 // 70-90%
  }))
}

// 전환 퍼널 데이터
export function generateConversionFunnel() {
  return [
    { stage: 'visit', label: '방문', count: 1000, conversionRate: 100 },
    { stage: 'signup', label: '가입', count: 800, conversionRate: 80 },
    { stage: 'create', label: '스터디 생성', count: 450, conversionRate: 56 },
    { stage: 'active', label: '활성 사용자', count: 360, conversionRate: 45 }
  ]
}

// 디바이스 분포 데이터
export function generateDeviceDistribution() {
  return [
    { device: 'desktop', label: 'PC', count: 720, percentage: 60 },
    { device: 'mobile', label: '모바일', count: 360, percentage: 30 },
    { device: 'tablet', label: '태블릿', count: 120, percentage: 10 }
  ]
}

// 인기 기능 데이터
export function generatePopularFeatures() {
  return [
    { feature: 'chat', label: '채팅', count: 8500, trend: 12 },
    { feature: 'files', label: '파일 공유', count: 5200, trend: 8 },
    { feature: 'calendar', label: '캘린더', count: 4800, trend: -3 },
    { feature: 'tasks', label: '할일 관리', count: 4200, trend: 15 },
    { feature: 'notices', label: '공지사항', count: 3600, trend: 5 }
  ]
}

