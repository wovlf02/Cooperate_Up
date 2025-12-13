/**
 * dashboard-validation.js
 *
 * 대시보드 관련 유효성 검증 함수 모음
 * 순수 JavaScript로 구현
 *
 * 사용 예시:
 * ```js
 * import { validateDateRange, validateDashboardData } from '@/lib/validators/dashboard-validation'
 *
 * const validation = validateDateRange(startDate, endDate)
 * if (!validation.valid) {
 *   return NextResponse.json({ error: validation.error }, { status: 400 })
 * }
 * ```
 *
 * @module lib/validators/dashboard-validation
 */

// ============================================
// 기본 검증 헬퍼 함수
// ============================================

/**
 * 날짜 형식 검증
 *
 * @param {string|Date} value - 검증할 날짜
 * @param {string} fieldName - 필드명
 * @returns {Object} { valid: boolean, value?: Date, error?: string }
 */
export function validateDate(value, fieldName = '날짜') {
  if (!value) {
    return { valid: false, error: `${fieldName}은(는) 필수입니다` }
  }

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName}의 형식이 올바르지 않습니다 (ISO 8601 형식 필요)` }
  }

  return { valid: true, value: date }
}

/**
 * 날짜 범위 검증
 *
 * @param {string|Date} startDate - 시작 날짜
 * @param {string|Date} endDate - 종료 날짜
 * @returns {Object} { valid: boolean, data?: Object, error?: string }
 */
export function validateDateRange(startDate, endDate) {
  const startValidation = validateDate(startDate, '시작 날짜')
  if (!startValidation.valid) {
    return startValidation
  }

  const endValidation = validateDate(endDate, '종료 날짜')
  if (!endValidation.valid) {
    return endValidation
  }

  const start = startValidation.value
  const end = endValidation.value

  if (start > end) {
    return { valid: false, error: '시작 날짜는 종료 날짜보다 이전이어야 합니다' }
  }

  // 최대 범위 검증 (1년)
  const maxRangeMs = 365 * 24 * 60 * 60 * 1000
  if (end - start > maxRangeMs) {
    return { valid: false, error: '날짜 범위는 최대 1년까지 가능합니다' }
  }

  return {
    valid: true,
    data: { startDate: start, endDate: end }
  }
}

/**
 * 숫자 검증
 *
 * @param {any} value - 검증할 값
 * @param {string} fieldName - 필드명
 * @param {Object} options - { min?, max?, allowZero?, allowNegative? }
 * @returns {Object} { valid: boolean, value?: number, error?: string }
 */
export function validateNumber(value, fieldName = '숫자', options = {}) {
  const {
    min = null,
    max = null,
    allowZero = true,
    allowNegative = true
  } = options

  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName}은(는) 필수입니다` }
  }

  const num = Number(value)

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName}은(는) 숫자여야 합니다` }
  }

  if (!Number.isFinite(num)) {
    return { valid: false, error: `${fieldName}은(는) 유한한 숫자여야 합니다` }
  }

  if (!allowZero && num === 0) {
    return { valid: false, error: `${fieldName}은(는) 0이 될 수 없습니다` }
  }

  if (!allowNegative && num < 0) {
    return { valid: false, error: `${fieldName}은(는) 음수가 될 수 없습니다` }
  }

  if (min !== null && num < min) {
    return { valid: false, error: `${fieldName}은(는) ${min} 이상이어야 합니다` }
  }

  if (max !== null && num > max) {
    return { valid: false, error: `${fieldName}은(는) ${max} 이하여야 합니다` }
  }

  return { valid: true, value: num }
}

/**
 * 배열 검증
 *
 * @param {any} value - 검증할 값
 * @param {string} fieldName - 필드명
 * @param {Object} options - { minLength?, maxLength?, allowEmpty? }
 * @returns {Object} { valid: boolean, value?: Array, error?: string }
 */
export function validateArray(value, fieldName = '배열', options = {}) {
  const {
    minLength = 0,
    maxLength = null,
    allowEmpty = true
  } = options

  if (!Array.isArray(value)) {
    return { valid: false, error: `${fieldName}은(는) 배열이어야 합니다` }
  }

  if (!allowEmpty && value.length === 0) {
    return { valid: false, error: `${fieldName}은(는) 비어있을 수 없습니다` }
  }

  if (value.length < minLength) {
    return { valid: false, error: `${fieldName}은(는) 최소 ${minLength}개 이상이어야 합니다` }
  }

  if (maxLength !== null && value.length > maxLength) {
    return { valid: false, error: `${fieldName}은(는) 최대 ${maxLength}개까지 가능합니다` }
  }

  return { valid: true, value }
}

/**
 * 객체 검증
 *
 * @param {any} value - 검증할 값
 * @param {string} fieldName - 필드명
 * @param {Array<string>} requiredKeys - 필수 키 목록
 * @returns {Object} { valid: boolean, value?: Object, error?: string }
 */
export function validateObject(value, fieldName = '객체', requiredKeys = []) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { valid: false, error: `${fieldName}은(는) 객체여야 합니다` }
  }

  // 필수 키 검증
  for (const key of requiredKeys) {
    if (!(key in value)) {
      return { valid: false, error: `${fieldName}에 필수 필드 '${key}'가 누락되었습니다` }
    }
  }

  return { valid: true, value }
}

// ============================================
// 대시보드 데이터 검증
// ============================================

/**
 * 대시보드 응답 데이터 검증
 *
 * @param {Object} data - API 응답 데이터
 * @returns {Object} { valid: boolean, data?: Object, errors?: Array }
 */
export function validateDashboardData(data) {
  const errors = []

  // 1. 기본 구조 검증
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: [{ field: '_data', message: '데이터가 올바른 형식이 아닙니다' }]
    }
  }

  // 2. 필수 섹션 검증
  const requiredSections = ['stats', 'myStudies', 'recentActivities', 'upcomingEvents']

  for (const section of requiredSections) {
    if (!(section in data)) {
      errors.push({
        field: section,
        message: `필수 섹션 '${section}'이(가) 누락되었습니다`,
        severity: 'critical'
      })
    }
  }

  // 3. stats 섹션 검증
  if (data.stats) {
    const statsValidation = validateStatsData(data.stats)
    if (!statsValidation.valid) {
      errors.push(...statsValidation.errors.map(e => ({ ...e, section: 'stats' })))
    }
  }

  // 4. myStudies 섹션 검증
  if (data.myStudies) {
    const studiesValidation = validateArray(data.myStudies, '내 스터디')
    if (!studiesValidation.valid) {
      errors.push({ field: 'myStudies', message: studiesValidation.error })
    } else {
      // 각 스터디 검증
      data.myStudies.forEach((study, index) => {
        const studyValidation = validateStudyItem(study)
        if (!studyValidation.valid) {
          errors.push({
            field: `myStudies[${index}]`,
            message: studyValidation.error,
            severity: 'medium'
          })
        }
      })
    }
  }

  // 5. recentActivities 섹션 검증
  if (data.recentActivities) {
    const activitiesValidation = validateArray(data.recentActivities, '최근 활동')
    if (!activitiesValidation.valid) {
      errors.push({ field: 'recentActivities', message: activitiesValidation.error })
    }
  }

  // 6. upcomingEvents 섹션 검증
  if (data.upcomingEvents) {
    const eventsValidation = validateArray(data.upcomingEvents, '다가오는 일정')
    if (!eventsValidation.valid) {
      errors.push({ field: 'upcomingEvents', message: eventsValidation.error })
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true, data }
}

/**
 * 통계 데이터 검증
 *
 * @param {Object} stats - 통계 데이터
 * @returns {Object} { valid: boolean, errors?: Array }
 */
export function validateStatsData(stats) {
  const errors = []

  // 필수 통계 필드
  const requiredStats = [
    'totalStudies',
    'activeStudies',
    'totalMembers',
    'todayActivities'
  ]

  for (const field of requiredStats) {
    if (!(field in stats)) {
      errors.push({
        field,
        message: `통계 필드 '${field}'가 누락되었습니다`,
        severity: 'high'
      })
      continue
    }

    // 숫자 검증
    const numValidation = validateNumber(stats[field], field, {
      min: 0,
      allowNegative: false
    })

    if (!numValidation.valid) {
      errors.push({
        field,
        message: numValidation.error,
        severity: 'high'
      })
    }
  }

  // 데이터 일관성 검증
  if (stats.activeStudies > stats.totalStudies) {
    errors.push({
      field: 'activeStudies',
      message: '활성 스터디 수가 전체 스터디 수보다 클 수 없습니다',
      severity: 'critical'
    })
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}

/**
 * 스터디 아이템 검증
 *
 * @param {Object} study - 스터디 객체
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateStudyItem(study) {
  if (!study || typeof study !== 'object') {
    return { valid: false, error: '스터디 데이터가 올바르지 않습니다' }
  }

  // 필수 필드
  const requiredFields = ['id', 'name']

  for (const field of requiredFields) {
    if (!(field in study)) {
      return { valid: false, error: `필수 필드 '${field}'가 누락되었습니다` }
    }
  }

  // ID 검증
  if (typeof study.id !== 'string' && typeof study.id !== 'number') {
    return { valid: false, error: 'ID는 문자열 또는 숫자여야 합니다' }
  }

  // 이름 검증
  if (typeof study.name !== 'string' || study.name.trim().length === 0) {
    return { valid: false, error: '스터디 이름은 비어있을 수 없습니다' }
  }

  return { valid: true }
}

/**
 * 활동 아이템 검증
 *
 * @param {Object} activity - 활동 객체
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateActivityItem(activity) {
  if (!activity || typeof activity !== 'object') {
    return { valid: false, error: '활동 데이터가 올바르지 않습니다' }
  }

  // 필수 필드
  const requiredFields = ['id', 'type', 'createdAt']

  for (const field of requiredFields) {
    if (!(field in activity)) {
      return { valid: false, error: `필수 필드 '${field}'가 누락되었습니다` }
    }
  }

  // 날짜 검증
  const dateValidation = validateDate(activity.createdAt, '생성 날짜')
  if (!dateValidation.valid) {
    return dateValidation
  }

  return { valid: true }
}

/**
 * 이벤트 아이템 검증
 *
 * @param {Object} event - 이벤트 객체
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateEventItem(event) {
  if (!event || typeof event !== 'object') {
    return { valid: false, error: '이벤트 데이터가 올바르지 않습니다' }
  }

  // 필수 필드
  const requiredFields = ['id', 'title', 'startTime']

  for (const field of requiredFields) {
    if (!(field in event)) {
      return { valid: false, error: `필수 필드 '${field}'가 누락되었습니다` }
    }
  }

  // 시작 시간 검증
  const startValidation = validateDate(event.startTime, '시작 시간')
  if (!startValidation.valid) {
    return startValidation
  }

  // 종료 시간 검증 (있는 경우)
  if (event.endTime) {
    const endValidation = validateDate(event.endTime, '종료 시간')
    if (!endValidation.valid) {
      return endValidation
    }

    // 시간 순서 검증
    if (new Date(event.startTime) > new Date(event.endTime)) {
      return { valid: false, error: '시작 시간은 종료 시간보다 이전이어야 합니다' }
    }
  }

  return { valid: true }
}

// ============================================
// 위젯 데이터 검증
// ============================================

/**
 * 차트 데이터 검증
 *
 * @param {Array} chartData - 차트 데이터 배열
 * @param {Object} options - { requireLabel?, requireValue? }
 * @returns {Object} { valid: boolean, data?: Array, error?: string }
 */
export function validateChartData(chartData, options = {}) {
  const { requireLabel = true, requireValue = true } = options

  const arrayValidation = validateArray(chartData, '차트 데이터', { allowEmpty: false })
  if (!arrayValidation.valid) {
    return arrayValidation
  }

  // 각 데이터 포인트 검증
  for (let i = 0; i < chartData.length; i++) {
    const item = chartData[i]

    if (typeof item !== 'object' || item === null) {
      return {
        valid: false,
        error: `차트 데이터[${i}]는 객체여야 합니다`
      }
    }

    if (requireLabel && !('label' in item)) {
      return {
        valid: false,
        error: `차트 데이터[${i}]에 'label'이 누락되었습니다`
      }
    }

    if (requireValue && !('value' in item)) {
      return {
        valid: false,
        error: `차트 데이터[${i}]에 'value'가 누락되었습니다`
      }
    }

    if (requireValue) {
      const valueValidation = validateNumber(item.value, `차트 데이터[${i}].value`, {
        allowNegative: false
      })
      if (!valueValidation.valid) {
        return { valid: false, error: valueValidation.error }
      }
    }
  }

  return { valid: true, data: chartData }
}

/**
 * 통계 계산 결과 검증
 *
 * @param {number} result - 계산 결과
 * @param {string} fieldName - 필드명
 * @returns {Object} { valid: boolean, value?: number, error?: string }
 */
export function validateCalculationResult(result, fieldName = '계산 결과') {
  if (result === null || result === undefined) {
    return { valid: false, error: `${fieldName}이(가) null입니다` }
  }

  if (typeof result !== 'number') {
    return { valid: false, error: `${fieldName}은(는) 숫자여야 합니다` }
  }

  if (isNaN(result)) {
    return { valid: false, error: `${fieldName}이(가) NaN입니다` }
  }

  if (!Number.isFinite(result)) {
    return { valid: false, error: `${fieldName}이(가) Infinity입니다` }
  }

  return { valid: true, value: result }
}

// ============================================
// XSS 및 보안 검증
// ============================================

/**
 * XSS 공격 패턴 감지
 *
 * @param {string} input - 검증할 문자열
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateXSS(input) {
  if (typeof input !== 'string') {
    return { valid: true } // 문자열이 아니면 XSS 위험 없음
  }

  // 위험한 패턴들
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onerror 등
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return {
        valid: false,
        error: 'XSS 공격 패턴이 감지되었습니다'
      }
    }
  }

  return { valid: true }
}

/**
 * SQL Injection 패턴 감지
 *
 * @param {string} input - 검증할 문자열
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateSQLInjection(input) {
  if (typeof input !== 'string') {
    return { valid: true }
  }

  // 위험한 SQL 패턴들
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(UNION\s+SELECT)/gi,
    /('|\"|;|--|\*|\/\*|\*\/)/g
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return {
        valid: false,
        error: 'SQL Injection 패턴이 감지되었습니다'
      }
    }
  }

  return { valid: true }
}

/**
 * 민감 정보 노출 감지
 *
 * @param {Object} data - 검증할 데이터
 * @returns {Object} { valid: boolean, sensitiveFields?: Array, error?: string }
 */
export function validateSensitiveData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: true }
  }

  const sensitiveFields = []
  const sensitiveKeywords = [
    'password',
    'token',
    'secret',
    'apiKey',
    'privateKey',
    'ssn', // Social Security Number
    'creditCard',
    'cvv'
  ]

  function checkObject(obj, path = '') {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key
      const lowerKey = key.toLowerCase()

      // 키 이름 검사
      if (sensitiveKeywords.some(keyword => lowerKey.includes(keyword.toLowerCase()))) {
        sensitiveFields.push(currentPath)
      }

      // 재귀적으로 중첩 객체 검사
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        checkObject(obj[key], currentPath)
      }
    }
  }

  checkObject(data)

  if (sensitiveFields.length > 0) {
    return {
      valid: false,
      sensitiveFields,
      error: `민감한 정보가 포함되어 있습니다: ${sensitiveFields.join(', ')}`
    }
  }

  return { valid: true }
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * null/undefined 안전 처리
 *
 * @param {any} value - 검증할 값
 * @param {any} defaultValue - 기본값
 * @returns {any} value 또는 defaultValue
 */
export function sanitizeNull(value, defaultValue = null) {
  return value !== null && value !== undefined ? value : defaultValue
}

/**
 * 숫자 배열 통계 계산 검증
 *
 * @param {Array<number>} numbers - 숫자 배열
 * @returns {Object} { valid: boolean, stats?: Object, error?: string }
 */
export function validateAndCalculateStats(numbers) {
  const arrayValidation = validateArray(numbers, '숫자 배열', { allowEmpty: false })
  if (!arrayValidation.valid) {
    return arrayValidation
  }

  // 모든 요소가 숫자인지 검증
  for (let i = 0; i < numbers.length; i++) {
    const numValidation = validateNumber(numbers[i], `숫자[${i}]`)
    if (!numValidation.valid) {
      return { valid: false, error: numValidation.error }
    }
  }

  // 통계 계산
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  const avg = sum / numbers.length
  const min = Math.min(...numbers)
  const max = Math.max(...numbers)

  return {
    valid: true,
    stats: { sum, avg, min, max, count: numbers.length }
  }
}

