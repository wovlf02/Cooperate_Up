/**
 * dashboard-helpers.test.js
 *
 * Dashboard 헬퍼 함수 유닛 테스트
 * Jest 프레임워크 사용
 *
 * @module lib/helpers/__tests__/dashboard-helpers.test
 */

import {
  // 통계 계산
  calculatePercentage,
  safeCalculate,
  calculateAverage,
  calculateChangeRate,

  // 날짜/시간
  calculateDday,
  formatDday,
  formatRelativeTime,
  formatDateRange,

  // 데이터 변환
  withDefault,
  ensureArray,
  ensureObject,
  mergePartialData,

  // 데이터 정렬/필터링
  getRecentItems,
  getUpcomingEvents,
  getUrgentTasks,

  // 포맷팅
  formatNumber,
  formatPercentage,
  formatDuration,
  formatStatValue,

  // 에러 메시지
  getHttpErrorMessage,
  getErrorMessage,

  // 캐시/성능
  isDataFresh,
  debounce
} from '../dashboard-helpers'

// ============================================
// 통계 계산 함수 테스트
// ============================================

describe('통계 계산 함수', () => {
  describe('calculatePercentage', () => {
    it('정상적인 백분율 계산', () => {
      expect(calculatePercentage(75, 100)).toBe(75.0)
      expect(calculatePercentage(1, 3)).toBe(33.3)
      expect(calculatePercentage(2, 3)).toBe(66.7)
    })

    it('0으로 나누기 방지', () => {
      expect(calculatePercentage(10, 0)).toBe(0)
      expect(calculatePercentage(0, 0)).toBe(0)
    })

    it('100% 초과 시 100으로 제한', () => {
      expect(calculatePercentage(150, 100)).toBe(100.0)
      expect(calculatePercentage(200, 100)).toBe(100.0)
    })

    it('음수 처리 (0으로 제한)', () => {
      expect(calculatePercentage(-10, 100)).toBe(0)
      expect(calculatePercentage(10, -100)).toBe(0)
    })

    it('null/undefined 처리', () => {
      expect(calculatePercentage(null, 100)).toBe(0)
      expect(calculatePercentage(100, null)).toBe(0)
      expect(calculatePercentage(undefined, undefined)).toBe(0)
    })

    it('소수점 자릿수 옵션', () => {
      expect(calculatePercentage(1, 3, { decimals: 0 })).toBe(33)
      expect(calculatePercentage(1, 3, { decimals: 2 })).toBe(33.33)
    })

    it('최소/최대값 옵션', () => {
      expect(calculatePercentage(50, 100, { min: 60 })).toBe(60)
      expect(calculatePercentage(90, 100, { max: 80 })).toBe(80)
    })
  })

  describe('safeCalculate', () => {
    it('정상 계산 실행', () => {
      expect(safeCalculate(() => 10 + 20, 0)).toBe(30)
      expect(safeCalculate(() => 100 / 5, 0)).toBe(20)
    })

    it('에러 발생 시 기본값 반환', () => {
      expect(safeCalculate(() => { throw new Error('test') }, 0)).toBe(0)
      expect(safeCalculate(() => JSON.parse('invalid'), [])).toEqual([])
    })

    it('NaN 발생 시 기본값 반환', () => {
      expect(safeCalculate(() => 0 / 0, 0)).toBe(0)
      expect(safeCalculate(() => Math.sqrt(-1), 1)).toBe(1)
    })

    it('Infinity 발생 시 기본값 반환', () => {
      expect(safeCalculate(() => 1 / 0, 0)).toBe(0)
      expect(safeCalculate(() => -1 / 0, 0)).toBe(0)
    })
  })

  describe('calculateAverage', () => {
    it('정상 평균 계산', () => {
      expect(calculateAverage([80, 90, 85])).toBe(85.0)
      expect(calculateAverage([10, 20, 30])).toBe(20.0)
    })

    it('빈 배열은 0 반환', () => {
      expect(calculateAverage([])).toBe(0)
    })

    it('null/undefined 처리', () => {
      expect(calculateAverage(null)).toBe(0)
      expect(calculateAverage(undefined)).toBe(0)
    })

    it('숫자가 아닌 값 무시', () => {
      expect(calculateAverage([10, null, 20, undefined, 30])).toBe(20.0)
      expect(calculateAverage([10, 'string', 20])).toBe(15.0)
    })

    it('소수점 자릿수 옵션', () => {
      expect(calculateAverage([10, 15, 20], 0)).toBe(15)
      expect(calculateAverage([10, 15, 20], 2)).toBe(15.00)
    })
  })

  describe('calculateChangeRate', () => {
    it('증가율 계산', () => {
      const result = calculateChangeRate(120, 100)
      expect(result.value).toBe(20.0)
      expect(result.isIncrease).toBe(true)
      expect(result.isDecrease).toBe(false)
      expect(result.isStable).toBe(false)
    })

    it('감소율 계산', () => {
      const result = calculateChangeRate(80, 100)
      expect(result.value).toBe(-20.0)
      expect(result.isIncrease).toBe(false)
      expect(result.isDecrease).toBe(true)
      expect(result.isStable).toBe(false)
    })

    it('변화 없음', () => {
      const result = calculateChangeRate(100, 100)
      expect(result.value).toBe(0)
      expect(result.isStable).toBe(true)
    })

    it('이전 값이 0일 때', () => {
      const result = calculateChangeRate(100, 0)
      expect(result.value).toBe(0)
      expect(result.isStable).toBe(true)
    })
  })
})

// ============================================
// 날짜/시간 계산 함수 테스트
// ============================================

describe('날짜/시간 계산 함수', () => {
  describe('calculateDday', () => {
    it('미래 날짜 D-day 계산', () => {
      const future = new Date()
      future.setDate(future.getDate() + 5)
      expect(calculateDday(future.toISOString())).toBe(5)
    })

    it('과거 날짜는 음수 반환', () => {
      const past = new Date()
      past.setDate(past.getDate() - 3)
      expect(calculateDday(past.toISOString())).toBe(-3)
    })

    it('오늘은 0 반환', () => {
      const today = new Date()
      expect(calculateDday(today.toISOString())).toBe(0)
    })

    it('Invalid Date는 null 반환', () => {
      expect(calculateDday('invalid-date')).toBe(null)
      expect(calculateDday('2025-13-45')).toBe(null)
    })

    it('null/undefined는 null 반환', () => {
      expect(calculateDday(null)).toBe(null)
      expect(calculateDday(undefined)).toBe(null)
    })
  })

  describe('formatDday', () => {
    it('미래 날짜 포맷팅', () => {
      const future = new Date()
      future.setDate(future.getDate() + 5)
      expect(formatDday(future.toISOString())).toBe('D-5')
    })

    it('과거 날짜 포맷팅', () => {
      const past = new Date()
      past.setDate(past.getDate() - 3)
      expect(formatDday(past.toISOString())).toBe('D+3')
    })

    it('오늘은 "D-Day"', () => {
      const today = new Date()
      expect(formatDday(today.toISOString())).toBe('D-Day')
    })

    it('Invalid Date는 "날짜 없음"', () => {
      expect(formatDday('invalid')).toBe('날짜 없음')
      expect(formatDday(null)).toBe('날짜 없음')
    })
  })

  describe('formatRelativeTime', () => {
    it('방금 전 (1분 미만)', () => {
      const now = new Date()
      expect(formatRelativeTime(now)).toBe('방금 전')
    })

    it('N분 전', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000)
      expect(formatRelativeTime(date)).toBe('5분 전')
    })

    it('N시간 전', () => {
      const date = new Date(Date.now() - 2 * 60 * 60 * 1000)
      expect(formatRelativeTime(date)).toBe('2시간 전')
    })

    it('N일 전', () => {
      const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(date)).toBe('3일 전')
    })

    it('N주 전', () => {
      const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(date)).toBe('1주 전')
    })

    it('30일 이상은 날짜 표시', () => {
      const date = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(date)
      expect(result).toMatch(/\d{4}\. \d{1,2}\. \d{1,2}\.?/)
    })

    it('Invalid Date는 "알 수 없음"', () => {
      expect(formatRelativeTime('invalid')).toBe('알 수 없음')
      expect(formatRelativeTime(null)).toBe('알 수 없음')
    })
  })

  describe('formatDateRange', () => {
    it('정상적인 날짜 범위 포맷팅', () => {
      const result = formatDateRange('2025-12-01', '2025-12-31')
      expect(result).toContain('2025')
      expect(result).toContain('12')
      expect(result).toContain('~')
    })

    it('null/undefined 처리', () => {
      expect(formatDateRange(null, '2025-12-31')).toBe('날짜 없음')
      expect(formatDateRange('2025-12-01', null)).toBe('날짜 없음')
    })

    it('Invalid Date 처리', () => {
      expect(formatDateRange('invalid', '2025-12-31')).toBe('날짜 오류')
      expect(formatDateRange('2025-12-01', 'invalid')).toBe('날짜 오류')
    })
  })
})

// ============================================
// 데이터 변환 함수 테스트
// ============================================

describe('데이터 변환 함수', () => {
  describe('withDefault', () => {
    it('값이 있으면 그 값 반환', () => {
      expect(withDefault(10, 0)).toBe(10)
      expect(withDefault('test', 'default')).toBe('test')
      expect(withDefault(false, true)).toBe(false)
      expect(withDefault(0, 100)).toBe(0)
    })

    it('값이 없으면 기본값 반환', () => {
      expect(withDefault(null, 0)).toBe(0)
      expect(withDefault(undefined, 'default')).toBe('default')
    })
  })

  describe('ensureArray', () => {
    it('배열은 그대로 반환', () => {
      expect(ensureArray([1, 2, 3])).toEqual([1, 2, 3])
      expect(ensureArray([])).toEqual([])
    })

    it('배열이 아니면 빈 배열 반환', () => {
      expect(ensureArray(null)).toEqual([])
      expect(ensureArray(undefined)).toEqual([])
      expect(ensureArray('string')).toEqual([])
      expect(ensureArray(123)).toEqual([])
      expect(ensureArray({})).toEqual([])
    })
  })

  describe('ensureObject', () => {
    it('객체는 그대로 반환', () => {
      expect(ensureObject({ a: 1 })).toEqual({ a: 1 })
      expect(ensureObject({})).toEqual({})
    })

    it('객체가 아니면 빈 객체 반환', () => {
      expect(ensureObject(null)).toEqual({})
      expect(ensureObject(undefined)).toEqual({})
      expect(ensureObject('string')).toEqual({})
      expect(ensureObject(123)).toEqual({})
      expect(ensureObject([])).toEqual({})
    })
  })

  describe('mergePartialData', () => {
    it('정상 병합', () => {
      const full = { a: [], b: [], c: [] }
      const partial = { a: [1, 2], b: [3, 4] }
      const result = mergePartialData(full, partial, ['c'])

      expect(result).toEqual({
        a: [1, 2],
        b: [3, 4],
        c: []
      })
    })

    it('실패한 키는 기본값 유지', () => {
      const full = { studies: [], tasks: [], events: [] }
      const partial = { studies: [1, 2] }
      const result = mergePartialData(full, partial, ['tasks', 'events'])

      expect(result).toEqual({
        studies: [1, 2],
        tasks: [],
        events: []
      })
    })
  })
})

// ============================================
// 데이터 정렬/필터링 함수 테스트
// ============================================

describe('데이터 정렬/필터링 함수', () => {
  describe('getRecentItems', () => {
    it('최근 N개 항목 추출', () => {
      const items = [
        { id: 1, createdAt: '2025-12-01T10:00:00Z' },
        { id: 2, createdAt: '2025-12-01T11:00:00Z' },
        { id: 3, createdAt: '2025-12-01T09:00:00Z' }
      ]

      const result = getRecentItems(items, 2)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(2) // 가장 최근
      expect(result[1].id).toBe(1)
    })

    it('배열이 아니면 빈 배열 반환', () => {
      expect(getRecentItems(null, 5)).toEqual([])
      expect(getRecentItems(undefined, 5)).toEqual([])
    })

    it('커스텀 날짜 필드 사용', () => {
      const items = [
        { id: 1, updatedAt: '2025-12-01T10:00:00Z' },
        { id: 2, updatedAt: '2025-12-01T11:00:00Z' }
      ]

      const result = getRecentItems(items, 1, 'updatedAt')
      expect(result[0].id).toBe(2)
    })
  })

  describe('getUpcomingEvents', () => {
    it('미래 일정만 필터링', () => {
      const future = new Date()
      future.setDate(future.getDate() + 5)

      const past = new Date()
      past.setDate(past.getDate() - 1)

      const events = [
        { id: 1, startTime: future.toISOString() },
        { id: 2, startTime: past.toISOString() }
      ]

      const result = getUpcomingEvents(events)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('가까운 일정 순으로 정렬', () => {
      const soon = new Date()
      soon.setDate(soon.getDate() + 1)

      const later = new Date()
      later.setDate(later.getDate() + 10)

      const events = [
        { id: 1, startTime: later.toISOString() },
        { id: 2, startTime: soon.toISOString() }
      ]

      const result = getUpcomingEvents(events)
      expect(result[0].id).toBe(2) // 가까운 것 먼저
    })

    it('배열이 아니면 빈 배열 반환', () => {
      expect(getUpcomingEvents(null)).toEqual([])
    })
  })

  describe('getUrgentTasks', () => {
    it('긴급 할일 필터링', () => {
      const urgent = new Date()
      urgent.setDate(urgent.getDate() + 2)

      const notUrgent = new Date()
      notUrgent.setDate(notUrgent.getDate() + 10)

      const tasks = [
        { id: 1, dueDate: urgent.toISOString(), completed: false },
        { id: 2, dueDate: notUrgent.toISOString(), completed: false }
      ]

      const result = getUrgentTasks(tasks, 3)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('완료된 할일 제외', () => {
      const urgent = new Date()
      urgent.setDate(urgent.getDate() + 2)

      const tasks = [
        { id: 1, dueDate: urgent.toISOString(), completed: true }
      ]

      const result = getUrgentTasks(tasks, 3)
      expect(result).toHaveLength(0)
    })

    it('마감일 없으면 제외', () => {
      const tasks = [
        { id: 1, dueDate: null, completed: false }
      ]

      const result = getUrgentTasks(tasks, 3)
      expect(result).toHaveLength(0)
    })

    it('과거 마감일 제외', () => {
      const past = new Date()
      past.setDate(past.getDate() - 1)

      const tasks = [
        { id: 1, dueDate: past.toISOString(), completed: false }
      ]

      const result = getUrgentTasks(tasks, 3)
      expect(result).toHaveLength(0)
    })
  })
})

// ============================================
// 포맷팅 함수 테스트
// ============================================

describe('포맷팅 함수', () => {
  describe('formatNumber', () => {
    it('천 단위 콤마', () => {
      expect(formatNumber(1234567)).toBe('1,234,567')
      expect(formatNumber(1000)).toBe('1,000')
    })

    it('0 처리', () => {
      expect(formatNumber(0)).toBe('0')
    })

    it('NaN 처리', () => {
      expect(formatNumber('invalid')).toBe('0')
      expect(formatNumber(null)).toBe('0')
    })
  })

  describe('formatPercentage', () => {
    it('백분율 포맷팅', () => {
      expect(formatPercentage(75.5678)).toBe('75.6%')
      expect(formatPercentage(100)).toBe('100.0%')
    })

    it('소수점 자릿수 옵션', () => {
      expect(formatPercentage(75.5678, 0)).toBe('76%')
      expect(formatPercentage(75.5678, 2)).toBe('75.57%')
    })

    it('NaN 처리', () => {
      expect(formatPercentage('invalid')).toBe('0.0%')
    })
  })

  describe('formatDuration', () => {
    it('시간/분 포맷팅', () => {
      expect(formatDuration(90)).toBe('1시간 30분')
      expect(formatDuration(60)).toBe('1시간')
      expect(formatDuration(45)).toBe('45분')
    })

    it('0분 처리', () => {
      expect(formatDuration(0)).toBe('0분')
    })

    it('음수 처리', () => {
      expect(formatDuration(-10)).toBe('0분')
    })

    it('NaN 처리', () => {
      expect(formatDuration('invalid')).toBe('0분')
    })
  })

  describe('formatStatValue', () => {
    it('타입별 포맷팅', () => {
      expect(formatStatValue(1234, 'number')).toBe('1,234')
      expect(formatStatValue(75.5, 'percentage')).toContain('%')
      expect(formatStatValue(90, 'duration')).toContain('시간')
    })

    it('기본값은 number', () => {
      expect(formatStatValue(1234)).toBe('1,234')
    })
  })
})

// ============================================
// 에러 메시지 변환 함수 테스트
// ============================================

describe('에러 메시지 변환 함수', () => {
  describe('getHttpErrorMessage', () => {
    it('HTTP 상태 코드 메시지', () => {
      expect(getHttpErrorMessage(400)).toBe('잘못된 요청입니다')
      expect(getHttpErrorMessage(401)).toBe('로그인이 필요합니다')
      expect(getHttpErrorMessage(404)).toBe('데이터를 찾을 수 없습니다')
      expect(getHttpErrorMessage(500)).toBe('서버 오류가 발생했습니다')
    })

    it('알 수 없는 코드', () => {
      expect(getHttpErrorMessage(999)).toBe('알 수 없는 오류가 발생했습니다')
    })
  })

  describe('getErrorMessage', () => {
    it('API 에러 응답', () => {
      const error = {
        response: {
          data: {
            error: {
              message: 'Custom error'
            }
          }
        }
      }
      expect(getErrorMessage(error)).toBe('Custom error')
    })

    it('HTTP 상태 코드', () => {
      const error = {
        response: {
          status: 404
        }
      }
      expect(getErrorMessage(error)).toBe('데이터를 찾을 수 없습니다')
    })

    it('네트워크 에러', () => {
      const error = {
        message: 'Network Error'
      }
      expect(getErrorMessage(error)).toBe('네트워크 연결을 확인해주세요')
    })

    it('타임아웃 에러', () => {
      const error = {
        message: 'timeout of 5000ms exceeded'
      }
      expect(getErrorMessage(error)).toBe('요청 시간이 초과되었습니다')
    })

    it('null 에러', () => {
      expect(getErrorMessage(null)).toBe('알 수 없는 오류가 발생했습니다')
    })
  })
})

// ============================================
// 캐시/성능 관련 함수 테스트
// ============================================

describe('캐시/성능 관련 함수', () => {
  describe('isDataFresh', () => {
    it('신선한 데이터 (5분 이내)', () => {
      const fresh = new Date(Date.now() - 2 * 60 * 1000)
      expect(isDataFresh(fresh, 5 * 60 * 1000)).toBe(true)
    })

    it('오래된 데이터 (5분 초과)', () => {
      const stale = new Date(Date.now() - 10 * 60 * 1000)
      expect(isDataFresh(stale, 5 * 60 * 1000)).toBe(false)
    })

    it('null/undefined는 false', () => {
      expect(isDataFresh(null)).toBe(false)
      expect(isDataFresh(undefined)).toBe(false)
    })

    it('Invalid Date는 false', () => {
      expect(isDataFresh('invalid')).toBe(false)
    })
  })

  describe('debounce', () => {
    jest.useFakeTimers()

    it('디바운스 동작', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 300)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(300)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('대기 시간 커스터마이징', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 500)

      debouncedFn()

      jest.advanceTimersByTime(300)
      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(200)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    afterEach(() => {
      jest.clearAllTimers()
    })
  })
})

