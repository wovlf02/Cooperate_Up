/**
 * dashboard-errors.js
 *
 * 대시보드 관련 통일된 예외 처리
 *
 * 사용 예시:
 * ```js
 * import { DASHBOARD_ERRORS, createDashboardErrorResponse, logDashboardError } from '@/lib/exceptions/dashboard-errors'
 *
 * // 에러 응답 생성
 * return NextResponse.json(
 *   createDashboardErrorResponse('PRISMA_CONNECTION'),
 *   { status: 500 }
 * )
 *
 * // 에러 로깅
 * logDashboardError('대시보드 데이터 로드', error, { userId, context: 'API' })
 * ```
 *
 * @module lib/exceptions/dashboard-errors
 */

/**
 * 대시보드 관련 에러 코드 정의
 *
 * 각 에러는 다음 속성을 포함:
 * - code: 고유 에러 코드 (DASH-XXX 형식)
 * - message: 사용자 친화적 메시지
 * - statusCode: HTTP 상태 코드
 * - category: 에러 카테고리 (API, DATA, WIDGET, SECURITY, NETWORK)
 */
export const DASHBOARD_ERRORS = {
  // ============================================
  // API 에러 (DASH-001 ~ DASH-009)
  // ============================================

  PRISMA_CONNECTION: {
    code: 'DASH-001',
    message: '데이터베이스 연결에 실패했습니다',
    statusCode: 500,
    category: 'API'
  },

  PARTIAL_QUERY_FAIL: {
    code: 'DASH-002',
    message: '일부 데이터를 불러오지 못했습니다',
    statusCode: 207, // Multi-Status
    category: 'API'
  },

  TIMEOUT: {
    code: 'DASH-003',
    message: '요청 시간이 초과되었습니다',
    statusCode: 504,
    category: 'NETWORK'
  },

  QUERY_TIMEOUT: {
    code: 'DASH-004',
    message: '데이터베이스 쿼리 시간이 초과되었습니다',
    statusCode: 504,
    category: 'API'
  },

  TRANSACTION_FAILED: {
    code: 'DASH-005',
    message: '트랜잭션 처리에 실패했습니다',
    statusCode: 500,
    category: 'API'
  },

  RATE_LIMIT_EXCEEDED: {
    code: 'DASH-006',
    message: '요청 횟수 제한을 초과했습니다',
    statusCode: 429,
    category: 'API'
  },

  SESSION_EXPIRED: {
    code: 'DASH-007',
    message: '세션이 만료되었습니다',
    statusCode: 401,
    category: 'API'
  },

  UNAUTHORIZED: {
    code: 'DASH-008',
    message: '인증이 필요합니다',
    statusCode: 401,
    category: 'API'
  },

  API_ERROR: {
    code: 'DASH-009',
    message: 'API 요청 중 오류가 발생했습니다',
    statusCode: 500,
    category: 'API'
  },

  // ============================================
  // 데이터 검증 (DASH-010 ~ DASH-019)
  // ============================================

  NULL_DATA: {
    code: 'DASH-010',
    message: '데이터가 존재하지 않습니다',
    statusCode: 404,
    category: 'DATA'
  },

  INVALID_DATE: {
    code: 'DASH-011',
    message: '잘못된 날짜 형식입니다',
    statusCode: 400,
    category: 'DATA'
  },

  INVALID_DATE_RANGE: {
    code: 'DASH-012',
    message: '시작일은 종료일보다 이전이어야 합니다',
    statusCode: 400,
    category: 'DATA'
  },

  INVALID_NUMBER: {
    code: 'DASH-013',
    message: '숫자 형식이 올바르지 않습니다',
    statusCode: 400,
    category: 'DATA'
  },

  NEGATIVE_VALUE: {
    code: 'DASH-014',
    message: '음수 값은 허용되지 않습니다',
    statusCode: 400,
    category: 'DATA'
  },

  DATA_INCONSISTENCY: {
    code: 'DASH-015',
    message: '데이터 불일치가 감지되었습니다',
    statusCode: 500,
    category: 'DATA'
  },

  MISSING_REQUIRED_FIELD: {
    code: 'DASH-016',
    message: '필수 필드가 누락되었습니다',
    statusCode: 400,
    category: 'DATA'
  },

  INVALID_DATA_FORMAT: {
    code: 'DASH-017',
    message: '데이터 형식이 올바르지 않습니다',
    statusCode: 400,
    category: 'DATA'
  },

  DATA_OVERFLOW: {
    code: 'DASH-018',
    message: '데이터 크기가 제한을 초과했습니다',
    statusCode: 413,
    category: 'DATA'
  },

  DUPLICATE_DATA: {
    code: 'DASH-019',
    message: '중복된 데이터입니다',
    statusCode: 409,
    category: 'DATA'
  },

  // ============================================
  // 위젯 에러 (DASH-020 ~ DASH-029)
  // ============================================

  WIDGET_DATA_MISSING: {
    code: 'DASH-020',
    message: '위젯 데이터를 찾을 수 없습니다',
    statusCode: 404,
    category: 'WIDGET'
  },

  CALCULATION_ERROR: {
    code: 'DASH-021',
    message: '통계 계산 중 오류가 발생했습니다',
    statusCode: 500,
    category: 'WIDGET'
  },

  WIDGET_RENDER_ERROR: {
    code: 'DASH-022',
    message: '위젯 렌더링에 실패했습니다',
    statusCode: 500,
    category: 'WIDGET'
  },

  CHART_DATA_ERROR: {
    code: 'DASH-023',
    message: '차트 데이터가 올바르지 않습니다',
    statusCode: 400,
    category: 'WIDGET'
  },

  WIDGET_CONFIG_ERROR: {
    code: 'DASH-024',
    message: '위젯 설정이 잘못되었습니다',
    statusCode: 500,
    category: 'WIDGET'
  },

  EMPTY_WIDGET_DATA: {
    code: 'DASH-025',
    message: '표시할 데이터가 없습니다',
    statusCode: 200, // 정상이지만 데이터 없음
    category: 'WIDGET'
  },

  WIDGET_LOAD_TIMEOUT: {
    code: 'DASH-026',
    message: '위젯 로딩 시간이 초과되었습니다',
    statusCode: 504,
    category: 'WIDGET'
  },

  WIDGET_UPDATE_FAILED: {
    code: 'DASH-027',
    message: '위젯 업데이트에 실패했습니다',
    statusCode: 500,
    category: 'WIDGET'
  },

  // ============================================
  // 보안 (DASH-030 ~ DASH-039)
  // ============================================

  XSS_DETECTED: {
    code: 'DASH-030',
    message: 'XSS 공격이 감지되었습니다',
    statusCode: 400,
    category: 'SECURITY'
  },

  SENSITIVE_DATA: {
    code: 'DASH-031',
    message: '민감한 정보 노출이 감지되었습니다',
    statusCode: 500,
    category: 'SECURITY'
  },

  SQL_INJECTION_DETECTED: {
    code: 'DASH-032',
    message: 'SQL Injection 시도가 감지되었습니다',
    statusCode: 400,
    category: 'SECURITY'
  },

  UNAUTHORIZED_ACCESS: {
    code: 'DASH-033',
    message: '권한이 없습니다',
    statusCode: 403,
    category: 'SECURITY'
  },

  INVALID_TOKEN: {
    code: 'DASH-034',
    message: '유효하지 않은 토큰입니다',
    statusCode: 401,
    category: 'SECURITY'
  },

  CSRF_DETECTED: {
    code: 'DASH-035',
    message: 'CSRF 공격이 감지되었습니다',
    statusCode: 403,
    category: 'SECURITY'
  },

  // ============================================
  // 네트워크 (DASH-040 ~ DASH-049)
  // ============================================

  NETWORK_ERROR: {
    code: 'DASH-040',
    message: '네트워크 연결에 실패했습니다',
    statusCode: 503,
    category: 'NETWORK'
  },

  CONNECTION_LOST: {
    code: 'DASH-041',
    message: '서버와의 연결이 끊어졌습니다',
    statusCode: 503,
    category: 'NETWORK'
  },

  FETCH_ABORT: {
    code: 'DASH-042',
    message: '요청이 취소되었습니다',
    statusCode: 499,
    category: 'NETWORK'
  },

  SLOW_NETWORK: {
    code: 'DASH-043',
    message: '네트워크 속도가 느립니다',
    statusCode: 200, // 경고
    category: 'NETWORK'
  },

  // ============================================
  // 캐싱 (DASH-050 ~ DASH-059)
  // ============================================

  CACHE_MISS: {
    code: 'DASH-050',
    message: '캐시된 데이터를 찾을 수 없습니다',
    statusCode: 404,
    category: 'CACHE'
  },

  CACHE_EXPIRED: {
    code: 'DASH-051',
    message: '캐시가 만료되었습니다',
    statusCode: 410,
    category: 'CACHE'
  },

  CACHE_WRITE_FAILED: {
    code: 'DASH-052',
    message: '캐시 저장에 실패했습니다',
    statusCode: 500,
    category: 'CACHE'
  },

  STALE_DATA: {
    code: 'DASH-053',
    message: '오래된 데이터입니다',
    statusCode: 200, // 경고
    category: 'CACHE'
  },

  // ============================================
  // 일반 에러 (DASH-090 ~ DASH-099)
  // ============================================

  INVALID_REQUEST: {
    code: 'DASH-090',
    message: '잘못된 요청입니다',
    statusCode: 400,
    category: 'GENERAL'
  },

  METHOD_NOT_ALLOWED: {
    code: 'DASH-091',
    message: '허용되지 않은 메서드입니다',
    statusCode: 405,
    category: 'GENERAL'
  },

  NOT_FOUND: {
    code: 'DASH-092',
    message: '요청한 리소스를 찾을 수 없습니다',
    statusCode: 404,
    category: 'GENERAL'
  },

  INTERNAL_ERROR: {
    code: 'DASH-093',
    message: '내부 서버 오류가 발생했습니다',
    statusCode: 500,
    category: 'GENERAL'
  },

  SERVICE_UNAVAILABLE: {
    code: 'DASH-094',
    message: '서비스를 일시적으로 사용할 수 없습니다',
    statusCode: 503,
    category: 'GENERAL'
  },

  UNKNOWN_ERROR: {
    code: 'DASH-099',
    message: '알 수 없는 오류가 발생했습니다',
    statusCode: 500,
    category: 'GENERAL'
  }
}

/**
 * 대시보드 에러 응답 객체 생성
 *
 * @param {string} errorKey - DASHBOARD_ERRORS의 키
 * @param {string} [customMessage] - 사용자 정의 메시지 (선택)
 * @param {Object} [additionalData] - 추가 데이터 (선택)
 * @returns {Object} 에러 응답 객체
 *
 * @example
 * // 기본 사용
 * createDashboardErrorResponse('NULL_DATA')
 * // => { success: false, error: { code: 'DASH-010', message: '데이터가 존재하지 않습니다', category: 'DATA' }, statusCode: 404 }
 *
 * @example
 * // 커스텀 메시지
 * createDashboardErrorResponse('INVALID_DATE', '날짜는 YYYY-MM-DD 형식이어야 합니다')
 *
 * @example
 * // 추가 데이터
 * createDashboardErrorResponse('PARTIAL_QUERY_FAIL', null, {
 *   loaded: ['studies', 'activities'],
 *   failed: ['events', 'tasks']
 * })
 */
export function createDashboardErrorResponse(errorKey, customMessage = null, additionalData = {}) {
  const error = DASHBOARD_ERRORS[errorKey] || DASHBOARD_ERRORS.UNKNOWN_ERROR

  return {
    success: false,
    error: {
      code: error.code,
      message: customMessage || error.message,
      category: error.category,
      timestamp: new Date().toISOString(),
      ...additionalData
    },
    statusCode: error.statusCode
  }
}

/**
 * 대시보드 에러 로깅 (구조화된 로그)
 *
 * @param {string} context - 에러 발생 컨텍스트 (예: '대시보드 데이터 로드', '위젯 렌더링')
 * @param {Error} error - 에러 객체
 * @param {Object} [metadata] - 추가 메타데이터 (선택)
 *
 * @example
 * logDashboardError('대시보드 데이터 로드', error, {
 *   userId: session.user.id,
 *   endpoint: '/api/dashboard',
 *   duration: 1250
 * })
 */
export function logDashboardError(context, error, metadata = {}) {
  const logData = {
    level: 'ERROR',
    context: `[DASHBOARD] ${context}`,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...metadata
  }

  // 프로덕션 환경에서는 외부 로깅 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // TODO: Sentry, DataDog, CloudWatch 등으로 전송
    console.error(JSON.stringify(logData))
  } else {
    // 개발 환경에서는 콘솔에 상세 출력
    console.error(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.error(`🔴 ${logData.context}`)
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.error(`📅 Time: ${logData.timestamp}`)
    console.error(`💬 Message: ${logData.message}`)

    if (Object.keys(metadata).length > 0) {
      console.error(`📊 Metadata:`, JSON.stringify(metadata, null, 2))
    }

    console.error(`📚 Stack:`, error.stack)
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
  }
}

/**
 * 대시보드 경고 로깅 (Warning Level)
 *
 * @param {string} context - 경고 발생 컨텍스트
 * @param {string} message - 경고 메시지
 * @param {Object} [metadata] - 추가 메타데이터
 *
 * @example
 * logDashboardWarning('데이터 로드', '일부 데이터를 불러오지 못했습니다', {
 *   failed: ['events'],
 *   loaded: ['studies', 'activities']
 * })
 */
export function logDashboardWarning(context, message, metadata = {}) {
  const logData = {
    level: 'WARNING',
    context: `[DASHBOARD] ${context}`,
    message,
    timestamp: new Date().toISOString(),
    ...metadata
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn(JSON.stringify(logData))
  } else {
    console.warn(`\n⚠️  [DASHBOARD] ${context}`)
    console.warn(`📅 Time: ${logData.timestamp}`)
    console.warn(`💬 Message: ${message}`)
    if (Object.keys(metadata).length > 0) {
      console.warn(`📊 Metadata:`, JSON.stringify(metadata, null, 2))
    }
    console.warn('')
  }
}

/**
 * Prisma 에러를 대시보드 에러로 변환
 *
 * @param {Error} error - Prisma 에러 객체
 * @returns {Object} 변환된 에러 응답
 *
 * @example
 * try {
 *   await prisma.studyMember.count({ where: ... })
 * } catch (error) {
 *   const dashError = handlePrismaError(error)
 *   return NextResponse.json(dashError, { status: dashError.statusCode })
 * }
 */
export function handlePrismaError(error) {
  // Prisma 연결 실패 (P1001, P1002, P1008)
  if (['P1001', 'P1002', 'P1008'].includes(error.code)) {
    return createDashboardErrorResponse('PRISMA_CONNECTION', null, {
      prismaCode: error.code,
      details: error.message
    })
  }

  // Prisma 쿼리 타임아웃 (P2024)
  if (error.code === 'P2024') {
    return createDashboardErrorResponse('QUERY_TIMEOUT', null, {
      prismaCode: error.code
    })
  }

  // Prisma 레코드를 찾을 수 없음 (P2025)
  if (error.code === 'P2025') {
    return createDashboardErrorResponse('NULL_DATA', null, {
      prismaCode: error.code
    })
  }

  // Prisma 트랜잭션 실패 (P2034)
  if (error.code === 'P2034') {
    return createDashboardErrorResponse('TRANSACTION_FAILED', null, {
      prismaCode: error.code
    })
  }

  // 기타 Prisma 에러
  if (error.code?.startsWith('P')) {
    logDashboardError('Prisma 에러', error, { prismaCode: error.code })
    return createDashboardErrorResponse('INTERNAL_ERROR', '데이터베이스 오류가 발생했습니다', {
      prismaCode: error.code
    })
  }

  // 일반 에러
  return createDashboardErrorResponse('UNKNOWN_ERROR')
}

/**
 * React Query 에러를 대시보드 에러로 변환
 *
 * @param {Error} error - React Query 에러 객체
 * @returns {Object} 변환된 에러 응답
 *
 * @example
 * const { data, error } = useDashboard()
 * if (error) {
 *   const dashError = handleReactQueryError(error)
 *   // UI에 에러 표시
 * }
 */
export function handleReactQueryError(error) {
  // Fetch 에러
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return createDashboardErrorResponse('NETWORK_ERROR', null, {
      originalError: error.message
    })
  }

  // 타임아웃 에러
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return createDashboardErrorResponse('TIMEOUT', null, {
      originalError: error.message
    })
  }

  // HTTP 에러
  if (error.response) {
    const status = error.response.status

    if (status === 401) {
      return createDashboardErrorResponse('UNAUTHORIZED')
    }

    if (status === 403) {
      return createDashboardErrorResponse('UNAUTHORIZED_ACCESS')
    }

    if (status === 404) {
      return createDashboardErrorResponse('NOT_FOUND')
    }

    if (status === 429) {
      return createDashboardErrorResponse('RATE_LIMIT_EXCEEDED')
    }

    if (status >= 500) {
      return createDashboardErrorResponse('SERVICE_UNAVAILABLE')
    }
  }

  return createDashboardErrorResponse('UNKNOWN_ERROR')
}

/**
 * 에러 객체를 NextResponse로 변환
 *
 * @param {Object} errorResponse - createDashboardErrorResponse 반환값
 * @returns {NextResponse} Next.js Response 객체
 *
 * @example
 * const error = createDashboardErrorResponse('NULL_DATA')
 * return toNextResponse(error)
 */
export function toNextResponse(errorResponse) {
  const { NextResponse } = require('next/server')

  return NextResponse.json(
    {
      success: errorResponse.success,
      error: errorResponse.error
    },
    { status: errorResponse.statusCode }
  )
}

/**
 * 부분 실패 응답 생성 (일부 데이터는 성공, 일부는 실패)
 *
 * @param {Object} successData - 성공적으로 로드된 데이터
 * @param {Array<string>} failedQueries - 실패한 쿼리 목록
 * @returns {Object} 부분 성공 응답
 *
 * @example
 * const response = createPartialSuccessResponse(
 *   { studies: [...], activities: [...] },
 *   ['events', 'tasks']
 * )
 */
export function createPartialSuccessResponse(successData, failedQueries = []) {
  return {
    success: true,
    partial: true,
    data: successData,
    warnings: {
      code: 'DASH-002',
      message: '일부 데이터를 불러오지 못했습니다',
      failedQueries,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 에러 심각도 판단
 *
 * @param {string} errorCode - DASHBOARD_ERRORS의 코드
 * @returns {string} 심각도 ('critical', 'high', 'medium', 'low')
 *
 * @example
 * const severity = getErrorSeverity('DASH-001') // 'critical'
 */
export function getErrorSeverity(errorCode) {
  const error = Object.values(DASHBOARD_ERRORS).find(e => e.code === errorCode)

  if (!error) return 'low'

  // Critical: 보안, DB 연결 실패
  if (error.category === 'SECURITY' || errorCode === 'DASH-001') {
    return 'critical'
  }

  // High: API 에러, 트랜잭션 실패
  if (error.category === 'API' && error.statusCode >= 500) {
    return 'high'
  }

  // Medium: 데이터 검증, 위젯 에러
  if (['DATA', 'WIDGET'].includes(error.category)) {
    return 'medium'
  }

  // Low: 캐시, 경고
  return 'low'
}

/**
 * 사용자 친화적 에러 메시지 생성
 *
 * @param {string} errorCode - DASHBOARD_ERRORS의 코드
 * @param {Object} [context] - 추가 컨텍스트
 * @returns {Object} UI 표시용 에러 정보
 *
 * @example
 * const uiError = getUserFriendlyError('DASH-001')
 * // => {
 * //   title: '연결 실패',
 * //   message: '데이터베이스 연결에 실패했습니다',
 * //   action: '잠시 후 다시 시도해주세요',
 * //   icon: '🔴'
 * // }
 */
export function getUserFriendlyError(errorCode, context = {}) {
  const error = Object.values(DASHBOARD_ERRORS).find(e => e.code === errorCode)

  if (!error) {
    return {
      title: '오류 발생',
      message: '알 수 없는 오류가 발생했습니다',
      action: '페이지를 새로고침해주세요',
      icon: '⚠️'
    }
  }

  // 카테고리별 UI 정보
  const categoryInfo = {
    API: { icon: '🔴', action: '잠시 후 다시 시도해주세요' },
    DATA: { icon: '📊', action: '입력 내용을 확인해주세요' },
    WIDGET: { icon: '📦', action: '페이지를 새로고침해주세요' },
    SECURITY: { icon: '🔒', action: '관리자에게 문의해주세요' },
    NETWORK: { icon: '🌐', action: '인터넷 연결을 확인해주세요' },
    CACHE: { icon: '💾', action: '페이지를 새로고침해주세요' },
    GENERAL: { icon: '⚠️', action: '잠시 후 다시 시도해주세요' }
  }

  const info = categoryInfo[error.category] || categoryInfo.GENERAL

  return {
    title: error.category === 'API' ? '연결 실패' :
           error.category === 'DATA' ? '데이터 오류' :
           error.category === 'WIDGET' ? '위젯 오류' :
           error.category === 'SECURITY' ? '보안 오류' :
           error.category === 'NETWORK' ? '네트워크 오류' : '오류 발생',
    message: error.message,
    action: context.action || info.action,
    icon: info.icon,
    code: error.code
  }
}

