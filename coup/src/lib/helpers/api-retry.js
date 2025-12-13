/**
 * api-retry.js
 *
 * API 재시도 로직 (Exponential Backoff)
 *
 * 사용 예시:
 * ```js
 * import { withRetry, retryConfig } from '@/lib/helpers/api-retry'
 *
 * // 기본 재시도
 * const result = await withRetry(() => fetch('/api/dashboard'))
 *
 * // 커스텀 설정
 * const result = await withRetry(
 *   () => fetch('/api/dashboard'),
 *   { maxRetries: 5, baseDelay: 500 }
 * )
 * ```
 *
 * @module lib/helpers/api-retry
 */

import { logDashboardError, logDashboardWarning } from '@/lib/exceptions/dashboard-errors'

/**
 * 기본 재시도 설정
 */
export const retryConfig = {
  // 최대 재시도 횟수
  maxRetries: 3,

  // 기본 지연 시간 (ms)
  baseDelay: 1000,

  // 최대 지연 시간 (ms)
  maxDelay: 10000,

  // Backoff 배수
  backoffMultiplier: 2,

  // 타임아웃 (ms)
  timeout: 30000,

  // 재시도 가능한 HTTP 상태 코드
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],

  // 재시도 가능한 에러 타입
  retryableErrors: [
    'ECONNRESET',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'NETWORK_ERROR'
  ]
}

/**
 * 재시도 상태 추적 클래스
 */
class RetryState {
  constructor() {
    this.attempts = 0
    this.totalDelay = 0
    this.errors = []
    this.startTime = Date.now()
  }

  addAttempt(error, delay) {
    this.attempts++
    this.totalDelay += delay
    this.errors.push({
      error: error.message,
      timestamp: Date.now(),
      delay
    })
  }

  getStats() {
    return {
      attempts: this.attempts,
      totalDelay: this.totalDelay,
      duration: Date.now() - this.startTime,
      errors: this.errors
    }
  }
}

/**
 * Exponential Backoff 계산
 *
 * @param {number} attempt - 현재 시도 횟수 (0부터 시작)
 * @param {Object} config - 재시도 설정
 * @returns {number} 지연 시간 (ms)
 *
 * @example
 * calculateBackoff(0) // 1000ms
 * calculateBackoff(1) // 2000ms
 * calculateBackoff(2) // 4000ms
 * calculateBackoff(3) // 8000ms (최대 10000ms 제한)
 */
export function calculateBackoff(attempt, config = retryConfig) {
  const { baseDelay, maxDelay, backoffMultiplier } = config

  // 지수 백오프 계산
  const exponentialDelay = baseDelay * Math.pow(backoffMultiplier, attempt)

  // 최대 지연 시간 제한
  const delay = Math.min(exponentialDelay, maxDelay)

  // Jitter 추가 (±20% 랜덤)
  const jitter = delay * 0.2 * (Math.random() - 0.5)

  return Math.floor(delay + jitter)
}

/**
 * 지연 실행
 *
 * @param {number} ms - 지연 시간 (ms)
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 에러가 재시도 가능한지 판단
 *
 * @param {Error|Response} error - 에러 또는 Response 객체
 * @param {Object} config - 재시도 설정
 * @returns {boolean} 재시도 가능 여부
 *
 * @example
 * isRetryableError(new Error('ECONNRESET')) // true
 * isRetryableError({ status: 500 }) // true
 * isRetryableError({ status: 404 }) // false
 */
export function isRetryableError(error, config = retryConfig) {
  const { retryableStatusCodes, retryableErrors } = config

  // HTTP Response 객체인 경우
  if (error && typeof error.status === 'number') {
    return retryableStatusCodes.includes(error.status)
  }

  // Error 객체인 경우
  if (error && error.code) {
    return retryableErrors.includes(error.code)
  }

  // 에러 메시지 확인
  if (error && error.message) {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('fetch')
    )
  }

  return false
}

/**
 * 타임아웃 처리
 *
 * @param {Promise} promise - 실행할 Promise
 * @param {number} timeoutMs - 타임아웃 (ms)
 * @returns {Promise} 타임아웃이 적용된 Promise
 *
 * @example
 * await withTimeout(fetch('/api/data'), 5000)
 */
export function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    )
  ])
}

/**
 * 재시도 로직이 적용된 함수 실행
 *
 * @param {Function} fn - 실행할 함수 (Promise 반환)
 * @param {Object} options - 재시도 옵션
 * @param {number} options.maxRetries - 최대 재시도 횟수
 * @param {number} options.baseDelay - 기본 지연 시간
 * @param {number} options.timeout - 타임아웃
 * @param {Function} options.onRetry - 재시도 시 콜백
 * @param {string} options.context - 컨텍스트 (로깅용)
 * @returns {Promise} 함수 실행 결과
 *
 * @example
 * const data = await withRetry(
 *   () => fetch('/api/dashboard').then(r => r.json()),
 *   {
 *     maxRetries: 3,
 *     onRetry: (attempt, error) => console.log(`재시도 ${attempt}:`, error)
 *   }
 * )
 */
export async function withRetry(fn, options = {}) {
  const config = { ...retryConfig, ...options }
  const { maxRetries, timeout, onRetry, context = 'API' } = config
  const state = new RetryState()

  let lastError

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 타임아웃 적용
      const result = timeout
        ? await withTimeout(fn(), timeout)
        : await fn()

      // 성공 시 재시도 통계 로깅
      if (attempt > 0) {
        logDashboardWarning(`재시도 성공: ${context}`, {
          ...state.getStats(),
          finalAttempt: attempt
        })
      }

      return result
    } catch (error) {
      lastError = error

      // 재시도 가능 여부 확인
      const isRetryable = isRetryableError(error, config)
      const hasRetriesLeft = attempt < maxRetries

      // 재시도 불가능하거나 재시도 횟수 초과 시 에러 throw
      if (!isRetryable || !hasRetriesLeft) {
        state.addAttempt(error, 0)

        logDashboardError(`재시도 실패: ${context}`, error, {
          ...state.getStats(),
          isRetryable,
          hasRetriesLeft
        })

        throw error
      }

      // 재시도 지연 계산
      const delayMs = calculateBackoff(attempt, config)
      state.addAttempt(error, delayMs)

      // 재시도 콜백 실행
      if (onRetry) {
        onRetry(attempt + 1, error, delayMs)
      }

      // 재시도 경고 로깅
      logDashboardWarning(`재시도 중: ${context}`, {
        attempt: attempt + 1,
        maxRetries,
        delay: delayMs,
        error: error.message
      })

      // 지연 후 재시도
      await delay(delayMs)
    }
  }

  // 모든 재시도 실패 시
  logDashboardError(`모든 재시도 실패: ${context}`, lastError, state.getStats())
  throw lastError
}

/**
 * Fetch API용 재시도 래퍼
 *
 * @param {string} url - API URL
 * @param {Object} fetchOptions - fetch 옵션
 * @param {Object} retryOptions - 재시도 옵션
 * @returns {Promise<Response>} Fetch Response
 *
 * @example
 * const response = await retryableFetch('/api/dashboard', {
 *   method: 'GET',
 *   headers: { 'Content-Type': 'application/json' }
 * })
 * const data = await response.json()
 */
export async function retryableFetch(url, fetchOptions = {}, retryOptions = {}) {
  return withRetry(
    async () => {
      const response = await fetch(url, fetchOptions)

      // HTTP 에러 체크
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        error.status = response.status
        error.response = response
        throw error
      }

      return response
    },
    {
      ...retryOptions,
      context: `Fetch ${url}`
    }
  )
}

/**
 * React Query용 재시도 설정
 *
 * @param {Object} customConfig - 커스텀 설정
 * @returns {Object} React Query retry 옵션
 *
 * @example
 * useQuery({
 *   queryKey: ['dashboard'],
 *   queryFn: fetchDashboard,
 *   ...getReactQueryRetryConfig()
 * })
 */
export function getReactQueryRetryConfig(customConfig = {}) {
  const config = { ...retryConfig, ...customConfig }

  return {
    retry: config.maxRetries,
    retryDelay: (attemptIndex) => calculateBackoff(attemptIndex, config),
    retryOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  }
}

/**
 * 여러 API 요청을 병렬로 실행 (부분 실패 허용)
 *
 * @param {Array<Function>} requests - 요청 함수 배열
 * @param {Object} options - 옵션
 * @param {boolean} options.throwOnAllFailed - 모두 실패 시 에러 throw 여부
 * @returns {Promise<Object>} { successes, failures }
 *
 * @example
 * const { successes, failures } = await retryableParallel([
 *   () => fetch('/api/stats'),
 *   () => fetch('/api/tasks'),
 *   () => fetch('/api/members')
 * ])
 */
export async function retryableParallel(requests, options = {}) {
  const { throwOnAllFailed = true } = options

  const results = await Promise.allSettled(
    requests.map((fn, index) =>
      withRetry(fn, { ...options, context: `Request ${index + 1}` })
    )
  )

  const successes = []
  const failures = []

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successes.push({ index, data: result.value })
    } else {
      failures.push({ index, error: result.reason })
    }
  })

  // 모두 실패 시 에러
  if (throwOnAllFailed && successes.length === 0) {
    const error = new Error('모든 요청이 실패했습니다')
    error.failures = failures
    throw error
  }

  // 부분 실패 경고
  if (failures.length > 0 && successes.length > 0) {
    logDashboardWarning('부분 요청 실패', {
      total: requests.length,
      successes: successes.length,
      failures: failures.length,
      failedIndices: failures.map(f => f.index)
    })
  }

  return { successes, failures }
}

/**
 * Circuit Breaker 패턴 구현
 *
 * 연속 실패 시 일정 시간 동안 요청 차단
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5
    this.resetTimeout = options.resetTimeout || 60000 // 1분
    this.state = 'CLOSED' // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0
    this.lastFailureTime = null
    this.successCount = 0
  }

  async execute(fn) {
    // OPEN 상태: 차단 중
    if (this.state === 'OPEN') {
      const now = Date.now()
      const timeSinceLastFailure = now - this.lastFailureTime

      // 리셋 타임아웃 경과 시 HALF_OPEN으로 전환
      if (timeSinceLastFailure >= this.resetTimeout) {
        this.state = 'HALF_OPEN'
        this.successCount = 0
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()

      // 성공 시
      if (this.state === 'HALF_OPEN') {
        this.successCount++
        // 연속 성공 시 CLOSED로 전환
        if (this.successCount >= 2) {
          this.state = 'CLOSED'
          this.failureCount = 0
          this.successCount = 0
        }
      } else {
        this.failureCount = 0
      }

      return result
    } catch (error) {
      this.failureCount++
      this.lastFailureTime = Date.now()

      // 실패 임계값 초과 시 OPEN으로 전환
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN'
        logDashboardError('Circuit Breaker OPEN', error, {
          failureCount: this.failureCount,
          threshold: this.failureThreshold
        })
      }

      throw error
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    }
  }

  reset() {
    this.state = 'CLOSED'
    this.failureCount = 0
    this.lastFailureTime = null
    this.successCount = 0
  }
}

/**
 * 전역 Circuit Breaker 인스턴스
 */
export const globalCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000
})

/**
 * Circuit Breaker를 적용한 재시도
 *
 * @param {Function} fn - 실행할 함수
 * @param {Object} options - 옵션
 * @returns {Promise} 실행 결과
 */
export async function withCircuitBreaker(fn, options = {}) {
  const circuitBreaker = options.circuitBreaker || globalCircuitBreaker

  return circuitBreaker.execute(() => withRetry(fn, options))
}

