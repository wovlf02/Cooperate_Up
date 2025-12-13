/**
 * dashboard-helpers.js
 *
 * 대시보드 관련 헬퍼 함수 모음
 * 데이터 변환, 계산, 포맷팅 등의 유틸리티 함수
 * DashboardException과 통합된 에러 처리
 *
 * 사용 예시:
 * ```js
 * import { calculatePercentage, formatDday, safeCalculate } from '@/lib/helpers/dashboard-helpers'
 *
 * const rate = calculatePercentage(completed, total) // "75.5%"
 * const dday = formatDday(eventDate) // "D-3"
 * ```
 *
 * @module lib/helpers/dashboard-helpers
 * @author CoUp Team
 * @updated 2025-12-04
 */

import {
  DashboardBusinessException,
  DashboardPermissionException
} from '@/lib/exceptions/dashboard';

// ============================================
// 통계 계산 함수
// ============================================

/**
 * 안전한 백분율 계산
 *
 * @param {number} numerator - 분자
 * @param {number} denominator - 분모
 * @param {Object} options - { decimals?, min?, max? }
 * @returns {number} 계산된 백분율 (0-100)
 *
 * @example
 * calculatePercentage(75, 100) // 75
 * calculatePercentage(0, 0) // 0 (나누기 0 방지)
 * calculatePercentage(150, 100) // 100 (최대값 제한)
 */
export function calculatePercentage(numerator, denominator, options = {}) {
  const {
    decimals = 1,
    min = 0,
    max = 100
  } = options

  // null/undefined 처리
  const num = Number(numerator) || 0
  const den = Number(denominator) || 0

  // 분모가 0이면 0 반환
  if (den === 0) return 0

  // 계산
  let result = (num / den) * 100

  // 범위 제한
  result = Math.min(Math.max(result, min), max)

  // 소수점 처리
  return Number(result.toFixed(decimals))
}

/**
 * 안전한 수학 계산
 *
 * @param {Function} calculation - 계산 함수
 * @param {any} fallbackValue - 에러 시 반환할 기본값
 * @returns {any} 계산 결과 또는 기본값
 *
 * @example
 * safeCalculate(() => totalStudies / activeDays, 0)
 * safeCalculate(() => attendanceData.reduce((sum, a) => sum + a.count, 0), 0)
 */
export function safeCalculate(calculation, fallbackValue = 0) {
  try {
    const result = calculation()

    // NaN, Infinity 체크
    if (typeof result === 'number') {
      if (isNaN(result) || !Number.isFinite(result)) {
        return fallbackValue
      }
    }

    return result
  } catch (error) {
    console.warn('[Dashboard] 계산 오류:', error.message)
    return fallbackValue
  }
}

/**
 * 평균 계산
 *
 * @param {Array<number>} numbers - 숫자 배열
 * @param {number} decimals - 소수점 자릿수
 * @returns {number} 평균값
 *
 * @example
 * calculateAverage([80, 90, 85]) // 85
 * calculateAverage([]) // 0
 */
export function calculateAverage(numbers, decimals = 1) {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0

  // 유효한 숫자만 필터링
  const validNumbers = numbers.filter(num => typeof num === 'number' && !isNaN(num))
  if (validNumbers.length === 0) return 0

  const sum = validNumbers.reduce((acc, num) => acc + num, 0)
  const avg = sum / validNumbers.length

  return Number(avg.toFixed(decimals))
}

/**
 * 증감률 계산
 *
 * @param {number} current - 현재 값
 * @param {number} previous - 이전 값
 * @returns {Object} { value: number, isIncrease: boolean, isDecrease: boolean, isStable: boolean }
 *
 * @example
 * calculateChangeRate(120, 100) // { value: 20, isIncrease: true, ... }
 * calculateChangeRate(80, 100) // { value: -20, isDecrease: true, ... }
 */
export function calculateChangeRate(current, previous) {
  const curr = Number(current) || 0
  const prev = Number(previous) || 0

  if (prev === 0) {
    return {
      value: 0,
      isIncrease: false,
      isDecrease: false,
      isStable: true
    }
  }

  const change = ((curr - prev) / prev) * 100
  const rounded = Number(change.toFixed(1))

  return {
    value: rounded,
    isIncrease: rounded > 0,
    isDecrease: rounded < 0,
    isStable: rounded === 0
  }
}

// ============================================
// 날짜/시간 계산 함수
// ============================================

/**
 * D-day 계산
 *
 * @param {string|Date} targetDate - 목표 날짜
 * @returns {number|null} D-day 값 (null이면 날짜 오류)
 *
 * @example
 * calculateDday('2025-12-25') // 24 (오늘이 12월 1일이라면)
 * calculateDday(null) // null
 */
export function calculateDday(targetDate) {
  if (!targetDate) return null

  try {
    const target = new Date(targetDate)
    const now = new Date()

    // Invalid Date 체크
    if (isNaN(target.getTime())) return null

    // 시간 부분 제거 (날짜만 비교)
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate())
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // 일수 차이 계산
    const diffMs = targetDay - nowDay
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    return diffDays
  } catch (error) {
    console.warn('[Dashboard] D-day 계산 오류:', error.message)
    return null
  }
}

/**
 * D-day 포맷팅
 *
 * @param {string|Date} targetDate - 목표 날짜
 * @returns {string} 포맷된 D-day 문자열
 *
 * @example
 * formatDday('2025-12-25') // "D-24"
 * formatDday(null) // "날짜 없음"
 */
export function formatDday(targetDate) {
  const dday = calculateDday(targetDate)

  if (dday === null) return '날짜 없음'
  if (dday === 0) return 'D-Day'
  if (dday > 0) return `D-${dday}`
  if (dday < 0) return `D+${Math.abs(dday)}`

  return '날짜 없음'
}

/**
 * 상대 시간 표시 (몇 분 전, 몇 시간 전 등)
 *
 * @param {string|Date} date - 날짜
 * @returns {string} 상대 시간 문자열
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000)) // "5분 전"
 * formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)) // "2시간 전"
 */
export function formatRelativeTime(date) {
  if (!date) return '알 수 없음'

  try {
    const target = new Date(date)
    const now = new Date()

    if (isNaN(target.getTime())) return '알 수 없음'

    const diffMs = now - target
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return '방금 전'
    if (diffMinutes < 60) return `${diffMinutes}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`

    return target.toLocaleDateString('ko-KR')
  } catch (error) {
    console.warn('[Dashboard] 상대 시간 계산 오류:', error.message)
    return '알 수 없음'
  }
}

/**
 * 날짜 범위 포맷팅
 *
 * @param {string|Date} startDate - 시작 날짜
 * @param {string|Date} endDate - 종료 날짜
 * @returns {string} 포맷된 날짜 범위
 *
 * @example
 * formatDateRange('2025-12-01', '2025-12-31') // "2025.12.01 ~ 12.31"
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '날짜 없음'

  try {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '날짜 오류'

    const startStr = start.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace('.', '')

    const endStr = end.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace('.', '')

    return `${startStr} ~ ${endStr}`
  } catch (error) {
    return '날짜 오류'
  }
}

// ============================================
// 데이터 변환 함수
// ============================================

/**
 * 빈 데이터 기본값 설정
 *
 * @param {any} data - 원본 데이터
 * @param {any} defaultValue - 기본값
 * @returns {any} data 또는 defaultValue
 *
 * @example
 * withDefault(null, []) // []
 * withDefault(undefined, 0) // 0
 * withDefault(5, 0) // 5
 */
export function withDefault(data, defaultValue) {
  if (data === null || data === undefined) return defaultValue
  return data
}

/**
 * 안전한 배열 반환
 *
 * @param {any} data - 원본 데이터
 * @returns {Array} 배열 또는 빈 배열
 *
 * @example
 * ensureArray(null) // []
 * ensureArray([1, 2, 3]) // [1, 2, 3]
 * ensureArray('string') // []
 */
export function ensureArray(data) {
  if (Array.isArray(data)) return data
  return []
}

/**
 * 안전한 객체 반환
 *
 * @param {any} data - 원본 데이터
 * @returns {Object} 객체 또는 빈 객체
 *
 * @example
 * ensureObject(null) // {}
 * ensureObject({ a: 1 }) // { a: 1 }
 * ensureObject('string') // {}
 */
export function ensureObject(data) {
  if (data && typeof data === 'object' && !Array.isArray(data)) return data
  return {}
}

/**
 * 부분 데이터 병합
 *
 * @param {Object} fullData - 전체 데이터 구조
 * @param {Object} partialData - 부분 데이터
 * @param {Array<string>} failedKeys - 실패한 키 목록
 * @returns {Object} 병합된 데이터
 *
 * @example
 * mergePartialData(
 *   { studies: [], activities: [], events: [] },
 *   { studies: [...], activities: [...] },
 *   ['events']
 * )
 * // => { studies: [...], activities: [...], events: [] }
 */
export function mergePartialData(fullData, partialData, failedKeys = []) {
  const merged = { ...fullData }

  for (const key in partialData) {
    if (!failedKeys.includes(key)) {
      merged[key] = partialData[key]
    }
  }

  return merged
}

// ============================================
// 데이터 정렬/필터링 함수
// ============================================

/**
 * 최근 N개 항목 추출
 *
 * @param {Array} items - 원본 배열
 * @param {number} count - 추출할 개수
 * @param {string} dateField - 날짜 필드명 (기본값: 'createdAt')
 * @returns {Array} 최근 N개 항목
 *
 * @example
 * getRecentItems(activities, 5) // 최근 5개 활동
 */
export function getRecentItems(items, count = 5, dateField = 'createdAt') {
  if (!Array.isArray(items)) return []

  return items
    .sort((a, b) => {
      const dateA = new Date(a[dateField])
      const dateB = new Date(b[dateField])
      return dateB - dateA // 최신순
    })
    .slice(0, count)
}

/**
 * 다가오는 일정 필터링 및 정렬
 *
 * @param {Array} events - 일정 배열
 * @param {number} limit - 최대 개수
 * @returns {Array} 다가오는 일정 (가까운 순)
 *
 * @example
 * getUpcomingEvents(events, 5) // 다가오는 5개 일정
 */
export function getUpcomingEvents(events, limit = 10) {
  if (!Array.isArray(events)) return []

  const now = new Date()

  return events
    .filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate >= now // 현재 이후 일정만
    })
    .sort((a, b) => {
      const dateA = new Date(a.startTime)
      const dateB = new Date(b.startTime)
      return dateA - dateB // 가까운 순
    })
    .slice(0, limit)
}

/**
 * 긴급 할일 필터링
 *
 * @param {Array} tasks - 할일 배열
 * @param {number} urgencyDays - 긴급 기준 일수 (기본값: 3일)
 * @returns {Array} 긴급 할일
 *
 * @example
 * getUrgentTasks(tasks, 3) // 3일 이내 마감 할일
 */
export function getUrgentTasks(tasks, urgencyDays = 3) {
  if (!Array.isArray(tasks)) return []

  const now = new Date()
  const urgencyMs = urgencyDays * 24 * 60 * 60 * 1000

  return tasks
    .filter(task => {
      // 완료되지 않은 것만
      if (task.completed) return false

      // 마감일이 있고, urgencyDays 이내인 것만
      if (!task.dueDate) return false

      const dueDate = new Date(task.dueDate)
      const diffMs = dueDate - now

      return diffMs >= 0 && diffMs <= urgencyMs
    })
    .sort((a, b) => {
      const dateA = new Date(a.dueDate)
      const dateB = new Date(b.dueDate)
      return dateA - dateB // 마감일 가까운 순
    })
}

// ============================================
// 포맷팅 함수
// ============================================

/**
 * 숫자 포맷팅 (천 단위 콤마)
 *
 * @param {number} num - 숫자
 * @returns {string} 포맷된 문자열
 *
 * @example
 * formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(num) {
  const number = Number(num)
  if (isNaN(number)) return '0'

  return number.toLocaleString('ko-KR')
}

/**
 * 백분율 포맷팅
 *
 * @param {number} value - 백분율 값
 * @param {number} decimals - 소수점 자릿수
 * @returns {string} 포맷된 백분율 문자열
 *
 * @example
 * formatPercentage(75.5678) // "75.6%"
 * formatPercentage(100) // "100.0%"
 */
export function formatPercentage(value, decimals = 1) {
  const num = Number(value)
  if (isNaN(num)) return '0.0%'

  return `${num.toFixed(decimals)}%`
}

/**
 * 통계 카드용 값 포맷팅
 *
 * @param {number} value - 값
 * @param {string} type - 타입 ('number', 'percentage', 'duration')
 * @returns {string} 포맷된 문자열
 *
 * @example
 * formatStatValue(1234, 'number') // "1,234"
 * formatStatValue(75.5, 'percentage') // "75.5%"
 */
export function formatStatValue(value, type = 'number') {
  switch (type) {
    case 'percentage':
      return formatPercentage(value)
    case 'duration':
      return formatDuration(value)
    default:
      return formatNumber(value)
  }
}

/**
 * 기간 포맷팅 (분 → 시간/분)
 *
 * @param {number} minutes - 분 단위 시간
 * @returns {string} 포맷된 문자열
 *
 * @example
 * formatDuration(90) // "1시간 30분"
 * formatDuration(45) // "45분"
 */
export function formatDuration(minutes) {
  const mins = Number(minutes)
  if (isNaN(mins) || mins < 0) return '0분'

  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60

  if (hours === 0) return `${remainingMins}분`
  if (remainingMins === 0) return `${hours}시간`

  return `${hours}시간 ${remainingMins}분`
}

// ============================================
// 에러 메시지 변환 함수
// ============================================

/**
 * HTTP 상태 코드를 사용자 친화적 메시지로 변환
 *
 * @param {number} statusCode - HTTP 상태 코드
 * @returns {string} 사용자 친화적 메시지
 *
 * @example
 * getHttpErrorMessage(404) // "데이터를 찾을 수 없습니다"
 * getHttpErrorMessage(500) // "서버 오류가 발생했습니다"
 */
export function getHttpErrorMessage(statusCode) {
  const messages = {
    400: '잘못된 요청입니다',
    401: '로그인이 필요합니다',
    403: '권한이 없습니다',
    404: '데이터를 찾을 수 없습니다',
    408: '요청 시간이 초과되었습니다',
    429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요',
    500: '서버 오류가 발생했습니다',
    502: '서버에 연결할 수 없습니다',
    503: '서비스를 일시적으로 사용할 수 없습니다',
    504: '서버 응답 시간이 초과되었습니다'
  }

  return messages[statusCode] || '알 수 없는 오류가 발생했습니다'
}

/**
 * React Query 에러를 사용자 친화적 메시지로 변환
 *
 * @param {Error} error - React Query 에러 객체
 * @returns {string} 사용자 친화적 메시지
 *
 * @example
 * getErrorMessage(error) // "네트워크 연결을 확인해주세요"
 */
export function getErrorMessage(error) {
  if (!error) return '알 수 없는 오류가 발생했습니다'

  // API 에러 응답
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message
  }

  // HTTP 상태 코드
  if (error.response?.status) {
    return getHttpErrorMessage(error.response.status)
  }

  // 네트워크 에러
  if (error.message?.includes('Network') || error.message?.includes('fetch')) {
    return '네트워크 연결을 확인해주세요'
  }

  // 타임아웃
  if (error.message?.includes('timeout')) {
    return '요청 시간이 초과되었습니다'
  }

  // 기타
  return error.message || '알 수 없는 오류가 발생했습니다'
}

// ============================================
// 캐시/성능 관련 함수
// ============================================

/**
 * 데이터 신선도 체크
 *
 * @param {string|Date} lastUpdated - 마지막 업데이트 시간
 * @param {number} maxAgeMs - 최대 유효 시간 (밀리초)
 * @returns {boolean} true면 신선함, false면 오래됨
 *
 * @example
 * isDataFresh(lastUpdated, 5 * 60 * 1000) // 5분 이내면 true
 */
export function isDataFresh(lastUpdated, maxAgeMs = 5 * 60 * 1000) {
  if (!lastUpdated) return false

  try {
    const updated = new Date(lastUpdated)
    const now = new Date()

    return (now - updated) < maxAgeMs
  } catch {
    return false
  }
}

/**
 * 디바운스 함수 (검색 입력 등에 사용)
 *
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (밀리초)
 * @returns {Function} 디바운스된 함수
 *
 * @example
 * const debouncedSearch = debounce(handleSearch, 300)
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// ============================================
// 서버사이드 헬퍼 함수 (API용)
// ============================================

/**
 * 대시보드 응답 포맷팅
 *
 * @param {Object} data - 대시보드 데이터
 * @returns {Object} 포맷된 데이터
 *
 * @example
 * const formatted = formatDashboardResponse(dashboardData);
 */
export function formatDashboardResponse(data) {
  if (!data) return null;

  return {
    summary: data.summary || {},
    studyStats: data.studyStats || {},
    taskStats: data.taskStats || {},
    recentActivities: data.recentActivities || [],
    upcomingSchedules: data.upcomingSchedules || [],
    notificationCount: data.notificationCount || 0,
    widgets: data.widgets || []
  };
}

/**
 * 통계 응답 포맷팅
 *
 * @param {Object} stats - 통계 데이터
 * @param {string} type - 통계 타입
 * @returns {Object} 포맷된 통계 데이터
 *
 * @example
 * const formatted = formatStatisticsResponse(stats, 'STUDY');
 */
export function formatStatisticsResponse(stats, type) {
  if (!stats) return null;

  return {
    type,
    data: stats.data || [],
    summary: stats.summary || {},
    period: stats.period || {},
    generatedAt: new Date().toISOString()
  };
}

/**
 * 위젯 응답 포맷팅
 *
 * @param {Object} widget - 위젯 객체
 * @returns {Object} 포맷된 위젯
 *
 * @example
 * const formatted = formatWidgetResponse(widget);
 */
export function formatWidgetResponse(widget) {
  if (!widget) return null;

  return {
    id: widget.id,
    type: widget.type,
    config: widget.config || {},
    position: widget.position || 0,
    visible: widget.visible !== false,
    createdAt: widget.createdAt,
    updatedAt: widget.updatedAt
  };
}

/**
 * 위젯 목록 응답 포맷팅
 *
 * @param {Array} widgets - 위젯 배열
 * @returns {Array} 포맷된 위젯 배열
 *
 * @example
 * const formatted = formatWidgetsListResponse(widgets);
 */
export function formatWidgetsListResponse(widgets) {
  if (!widgets || !Array.isArray(widgets)) return [];

  return widgets.map(formatWidgetResponse);
}

/**
 * 페이지네이션 응답 생성
 *
 * @param {Array} data - 데이터 배열
 * @param {number} page - 현재 페이지
 * @param {number} limit - 페이지당 항목 수
 * @param {number} total - 전체 항목 수
 * @returns {Object} 페이지네이션 응답
 *
 * @example
 * const response = createPaginatedResponse(activities, 1, 20, 100);
 */
export function createPaginatedResponse(data, page, limit, total) {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * 성공 응답 생성
 *
 * @param {Object} data - 응답 데이터
 * @param {string} message - 성공 메시지
 * @returns {Object} 성공 응답
 *
 * @example
 * const response = createSuccessResponse({ dashboard }, '대시보드 조회 성공');
 */
export function createSuccessResponse(data, message = '성공') {
  return {
    success: true,
    message,
    ...data
  };
}

/**
 * 에러 응답 생성 (Exception 통합)
 *
 * @param {Error} error - 에러 객체
 * @returns {Object} 에러 응답
 *
 * @example
 * const response = createErrorResponse(error);
 */
export function createErrorResponse(error) {
  if (error.code && error.statusCode) {
    // DashboardException 계열
    return {
      success: false,
      error: error.userMessage || error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }

  // 일반 에러
  return {
    success: false,
    error: error.message || '알 수 없는 오류가 발생했습니다.',
    statusCode: 500
  };
}

// ============================================
// 서버사이드 데이터 조회 함수
// ============================================

/**
 * 대시보드 메인 데이터 조회
 *
 * @param {string} userId - 사용자 ID
 * @param {Object} options - 조회 옵션
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 대시보드 데이터
 * @throws {DashboardBusinessException}
 *
 * @example
 * const dashboard = await getDashboardData('user-123', { period: 'THIS_WEEK' }, prisma);
 */
export async function getDashboardData(userId, options, prisma) {
  try {
    const { startDate, endDate } = options;

    const [
      studyStats,
      taskStats,
      recentActivities,
      upcomingSchedules,
      notificationCount
    ] = await Promise.all([
      getStudyStatistics(userId, options, prisma),
      getTaskStatistics(userId, options, prisma),
      getRecentActivities(userId, { limit: 10 }, prisma),
      getUpcomingSchedules(userId, { limit: 5, days: 7 }, prisma),
      getUnreadNotificationCount(userId, prisma)
    ]);

    const summary = {
      totalStudies: studyStats.totalStudies || 0,
      activeStudies: studyStats.activeStudies || 0,
      totalTasks: taskStats.totalTasks || 0,
      completedTasks: taskStats.completedTasks || 0,
      taskCompletionRate: taskStats.completionRate || 0,
      unreadNotifications: notificationCount,
      period: { startDate, endDate }
    };

    return {
      summary,
      studyStats,
      taskStats,
      recentActivities,
      upcomingSchedules,
      notificationCount
    };
  } catch (error) {
    if (error.code?.startsWith('DASH-')) {
      throw error;
    }
    throw DashboardBusinessException.dashboardDataNotFound(userId);
  }
}

/**
 * 스터디 통계 조회
 *
 * @param {string} userId - 사용자 ID
 * @param {Object} options - 조회 옵션
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 스터디 통계
 * @throws {DashboardBusinessException}
 *
 * @example
 * const stats = await getStudyStatistics('user-123', {}, prisma);
 */
export async function getStudyStatistics(userId, options, prisma) {
  try {
    // 사용자가 참여중인 스터디 조회
    const studyMembers = await prisma.studyMember.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        study: {
          select: {
            id: true,
            name: true,
            emoji: true,
            category: true,
            isRecruiting: true,
            createdAt: true
          }
        }
      }
    });

    // 소유한 스터디 조회
    const ownedStudies = await prisma.study.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
        emoji: true,
        category: true,
        isRecruiting: true,
        _count: {
          select: { members: true }
        }
      }
    });

    const totalStudies = studyMembers.length;
    const activeStudies = studyMembers.filter(m => m.study.isRecruiting).length;
    const categoryCount = {};

    studyMembers.forEach(m => {
      const category = m.study.category || 'etc';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return {
      totalStudies,
      activeStudies,
      ownedStudies: ownedStudies.length,
      categoryBreakdown: categoryCount,
      studies: studyMembers.map(m => ({
        id: m.study.id,
        name: m.study.name,
        emoji: m.study.emoji,
        category: m.study.category,
        role: m.role,
        joinedAt: m.joinedAt
      }))
    };
  } catch (error) {
    if (error.code?.startsWith('DASH-')) {
      throw error;
    }
    throw DashboardBusinessException.studyStatisticsNotFound(userId);
  }
}

/**
 * 할일 통계 조회
 *
 * @param {string} userId - 사용자 ID
 * @param {Object} options - 조회 옵션
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 할일 통계
 * @throws {DashboardBusinessException}
 *
 * @example
 * const stats = await getTaskStatistics('user-123', {}, prisma);
 */
export async function getTaskStatistics(userId, options, prisma) {
  try {
    const { startDate, endDate } = options;

    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    } : {};

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        ...dateFilter
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        completed: true,
        completedAt: true,
        dueDate: true,
        createdAt: true
      }
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 상태별 분류
    const statusCount = {
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      DONE: 0
    };

    // 우선순위별 분류
    const priorityCount = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0
    };

    tasks.forEach(task => {
      statusCount[task.status] = (statusCount[task.status] || 0) + 1;
      priorityCount[task.priority] = (priorityCount[task.priority] || 0) + 1;
    });

    // 마감 임박 할일
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const upcomingTasks = tasks
      .filter(t => !t.completed && t.dueDate && new Date(t.dueDate) <= threeDaysLater)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // 지난 할일
    const overdueTasks = tasks.filter(t => 
      !t.completed && t.dueDate && new Date(t.dueDate) < now
    ).length;

    return {
      totalTasks,
      completedTasks,
      completionRate,
      statusBreakdown: statusCount,
      priorityBreakdown: priorityCount,
      upcomingTasks: upcomingTasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate
      })),
      overdueTasks
    };
  } catch (error) {
    if (error.code?.startsWith('DASH-')) {
      throw error;
    }
    throw DashboardBusinessException.taskStatisticsNotFound(userId);
  }
}

/**
 * 최근 활동 조회
 *
 * @param {string} userId - 사용자 ID
 * @param {Object} options - 조회 옵션
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Array>} 최근 활동 목록
 * @throws {DashboardBusinessException}
 *
 * @example
 * const activities = await getRecentActivities('user-123', { limit: 10 }, prisma);
 */
export async function getRecentActivities(userId, options, prisma) {
  try {
    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;

    // 알림을 활동 내역으로 사용
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        type: true,
        message: true,
        studyId: true,
        studyName: true,
        studyEmoji: true,
        isRead: true,
        createdAt: true
      }
    });

    return notifications.map(n => ({
      id: n.id,
      type: n.type,
      message: n.message,
      study: n.studyId ? {
        id: n.studyId,
        name: n.studyName,
        emoji: n.studyEmoji
      } : null,
      isRead: n.isRead,
      createdAt: n.createdAt
    }));
  } catch (error) {
    if (error.code?.startsWith('DASH-')) {
      throw error;
    }
    throw DashboardBusinessException.noRecentActivities();
  }
}

/**
 * 예정 일정 조회
 *
 * @param {string} userId - 사용자 ID
 * @param {Object} options - 조회 옵션
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Array>} 예정 일정 목록
 * @throws {DashboardBusinessException}
 *
 * @example
 * const schedules = await getUpcomingSchedules('user-123', { limit: 5, days: 7 }, prisma);
 */
export async function getUpcomingSchedules(userId, options, prisma) {
  try {
    const { limit = 5, days = 7 } = options;

    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // 사용자가 참여중인 스터디의 일정 조회
    const studyMembers = await prisma.studyMember.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      },
      select: { studyId: true }
    });

    const studyIds = studyMembers.map(m => m.studyId);

    if (studyIds.length === 0) {
      return [];
    }

    const events = await prisma.event.findMany({
      where: {
        studyId: { in: studyIds },
        date: {
          gte: now,
          lte: futureDate
        }
      },
      include: {
        study: {
          select: {
            id: true,
            name: true,
            emoji: true
          }
        }
      },
      orderBy: { date: 'asc' },
      take: limit
    });

    return events.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      color: e.color,
      study: {
        id: e.study.id,
        name: e.study.name,
        emoji: e.study.emoji
      }
    }));
  } catch (error) {
    if (error.code?.startsWith('DASH-')) {
      throw error;
    }
    throw DashboardBusinessException.noUpcomingSchedules();
  }
}

/**
 * 읽지 않은 알림 수 조회
 *
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<number>} 읽지 않은 알림 수
 *
 * @example
 * const count = await getUnreadNotificationCount('user-123', prisma);
 */
export async function getUnreadNotificationCount(userId, prisma) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    return count;
  } catch (error) {
    return 0;
  }
}

/**
 * 대시보드 요약 데이터 조회
 *
 * @param {string} userId - 사용자 ID
 * @param {Object} options - 조회 옵션
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 요약 데이터
 * @throws {DashboardBusinessException}
 *
 * @example
 * const summary = await getDashboardSummary('user-123', {}, prisma);
 */
export async function getDashboardSummary(userId, options, prisma) {
  try {
    const [studyCount, taskCount, unreadCount] = await Promise.all([
      prisma.studyMember.count({
        where: { userId, status: 'ACTIVE' }
      }),
      prisma.task.count({
        where: { userId, completed: false }
      }),
      prisma.notification.count({
        where: { userId, isRead: false }
      })
    ]);

    // 완료한 할일 수
    const completedTasks = await prisma.task.count({
      where: { userId, completed: true }
    });

    const totalTasks = taskCount + completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      studies: {
        active: studyCount,
        total: studyCount
      },
      tasks: {
        pending: taskCount,
        completed: completedTasks,
        total: totalTasks,
        completionRate
      },
      notifications: {
        unread: unreadCount
      }
    };
  } catch (error) {
    if (error.code?.startsWith('DASH-')) {
      throw error;
    }
    throw DashboardBusinessException.dashboardDataNotFound(userId);
  }
}

// ============================================
// 사용자/권한 확인 함수
// ============================================

/**
 * 사용자 존재 확인
 *
 * @param {string} userId - 사용자 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<Object>} 사용자 정보
 * @throws {DashboardBusinessException}
 *
 * @example
 * const user = await checkUserExists('user-123', prisma);
 */
export async function checkUserExists(userId, prisma) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    });

    if (!user) {
      throw DashboardBusinessException.userNotFound(userId);
    }

    return user;
  } catch (error) {
    if (error.code?.startsWith('DASH-')) {
      throw error;
    }
    throw DashboardBusinessException.databaseError('checkUserExists', error.message);
  }
}

/**
 * 스터디 멤버십 확인
 *
 * @param {string} userId - 사용자 ID
 * @param {string} studyId - 스터디 ID
 * @param {PrismaClient} prisma - Prisma 클라이언트
 * @returns {Promise<boolean>} 멤버 여부
 *
 * @example
 * const isMember = await checkStudyMembership('user-123', 'study-456', prisma);
 */
export async function checkStudyMembership(userId, studyId, prisma) {
  try {
    const member = await prisma.studyMember.findUnique({
      where: {
        studyId_userId: { studyId, userId }
      }
    });

    return member?.status === 'ACTIVE';
  } catch (error) {
    return false;
  }
}

/**
 * 대시보드 접근 권한 확인
 *
 * @param {string} requestUserId - 요청 사용자 ID
 * @param {string} targetUserId - 대상 사용자 ID
 * @returns {boolean} 접근 가능 여부
 * @throws {DashboardPermissionException}
 *
 * @example
 * checkDashboardAccess('user-123', 'user-123'); // true
 */
export function checkDashboardAccess(requestUserId, targetUserId) {
  if (requestUserId !== targetUserId) {
    throw DashboardPermissionException.otherUserDataAccessDenied(targetUserId);
  }

  return true;
}

// ============================================
// 에러 핸들링
// ============================================

/**
 * Dashboard 에러 핸들러 래퍼
 *
 * @param {Function} handler - 핸들러 함수
 * @returns {Function} 래핑된 핸들러
 *
 * @example
 * export const GET = withDashboardErrorHandler(async (request) => { ... });
 */
export function withDashboardErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('[DASHBOARD ERROR]', error);

      const response = createErrorResponse(error);

      return new Response(JSON.stringify(response), {
        status: response.statusCode || 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

// ============================================
// 상수 Export
// ============================================

export const DASHBOARD_HELPER_VERSION = '1.0.0';
