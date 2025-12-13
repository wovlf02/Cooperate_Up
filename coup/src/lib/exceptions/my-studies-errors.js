/**
 * my-studies-errors.js
 *
 * my-studies 영역 관련 통일된 예외 처리
 *
 * 사용 예시:
 * ```js
 * import { MY_STUDIES_ERRORS, createMyStudiesError, logMyStudiesError } from '@/lib/exceptions/my-studies-errors'
 *
 * // 에러 응답 생성
 * return NextResponse.json(
 *   createMyStudiesError('STUDIES_NOT_FOUND'),
 *   { status: 404 }
 * )
 *
 * // 에러 로깅
 * logMyStudiesError('스터디 목록 로드', error, { userId, filter: 'all' })
 * ```
 *
 * @module lib/exceptions/my-studies-errors
 */

/**
 * my-studies 관련 에러 코드 정의
 *
 * 각 에러는 다음 속성을 포함:
 * - code: 고유 에러 코드 (MYS-XXX 형식)
 * - message: 사용자 친화적 메시지
 * - statusCode: HTTP 상태 코드
 * - category: 에러 카테고리
 * - userMessage: UI 표시용 메시지
 */
export const MY_STUDIES_ERRORS = {
  // ============================================
  // 목록 관련 (MYS-001 ~ MYS-009)
  // ============================================

  STUDIES_NOT_FOUND: {
    code: 'MYS-001',
    message: '참여 중인 스터디가 없습니다',
    statusCode: 404,
    category: 'LIST',
    userMessage: '아직 참여 중인 스터디가 없어요. 지금 바로 관심있는 스터디를 찾아보세요!'
  },

  STUDY_DELETED: {
    code: 'MYS-002',
    message: '삭제된 스터디입니다',
    statusCode: 404,
    category: 'LIST',
    userMessage: '이 스터디는 삭제되었습니다'
  },

  STUDIES_LOAD_FAILED: {
    code: 'MYS-003',
    message: '스터디 목록을 불러오는데 실패했습니다',
    statusCode: 500,
    category: 'LIST',
    userMessage: '스터디 목록을 불러올 수 없어요. 잠시 후 다시 시도해주세요.'
  },

  INVALID_FILTER: {
    code: 'MYS-004',
    message: '잘못된 필터 옵션입니다',
    statusCode: 400,
    category: 'LIST',
    userMessage: '올바른 필터를 선택해주세요'
  },

  FILTER_TIMEOUT: {
    code: 'MYS-005',
    message: '필터링 작업이 시간 초과되었습니다',
    statusCode: 504,
    category: 'LIST',
    userMessage: '스터디가 너무 많아 시간이 초과되었어요. 필터를 조정해주세요.'
  },

  // ============================================
  // 스터디 상세 (MYS-010 ~ MYS-019)
  // ============================================

  STUDY_NOT_FOUND: {
    code: 'MYS-010',
    message: '스터디를 찾을 수 없습니다',
    statusCode: 404,
    category: 'DETAIL',
    userMessage: '존재하지 않는 스터디입니다'
  },

  STUDY_ACCESS_DENIED: {
    code: 'MYS-011',
    message: '이 스터디에 접근 권한이 없습니다',
    statusCode: 403,
    category: 'DETAIL',
    userMessage: '이 스터디에 참여하지 않았거나 권한이 없습니다'
  },

  STUDY_PENDING_APPROVAL: {
    code: 'MYS-012',
    message: '가입 승인 대기 중입니다',
    statusCode: 403,
    category: 'DETAIL',
    userMessage: '스터디 가입 승인을 기다리는 중입니다. 잠시만 기다려주세요!'
  },

  STUDY_MEMBERSHIP_REMOVED: {
    code: 'MYS-013',
    message: '스터디에서 탈퇴하셨거나 강퇴되었습니다',
    statusCode: 403,
    category: 'DETAIL',
    userMessage: '더 이상 이 스터디에 참여하고 있지 않습니다'
  },

  STUDY_LOAD_FAILED: {
    code: 'MYS-014',
    message: '스터디 정보를 불러오는데 실패했습니다',
    statusCode: 500,
    category: 'DETAIL',
    userMessage: '스터디를 불러올 수 없어요. 잠시 후 다시 시도해주세요.'
  },

  STUDY_DATA_CORRUPTED: {
    code: 'MYS-015',
    message: '스터디 데이터가 손상되었습니다',
    statusCode: 500,
    category: 'DETAIL',
    userMessage: '스터디 데이터에 문제가 있어요. 관리자에게 문의해주세요.'
  },

  // ============================================
  // 권한 (MYS-020 ~ MYS-029)
  // ============================================

  NO_PERMISSION: {
    code: 'MYS-020',
    message: '권한이 없습니다',
    statusCode: 403,
    category: 'PERMISSION',
    userMessage: '이 작업을 수행할 권한이 없습니다'
  },

  OWNER_REQUIRED: {
    code: 'MYS-021',
    message: '스터디 소유자만 가능합니다',
    statusCode: 403,
    category: 'PERMISSION',
    userMessage: '스터디 소유자만 이 작업을 할 수 있어요'
  },

  ADMIN_REQUIRED: {
    code: 'MYS-022',
    message: '관리자 권한이 필요합니다',
    statusCode: 403,
    category: 'PERMISSION',
    userMessage: '관리자만 이 작업을 할 수 있어요'
  },

  MEMBER_ONLY: {
    code: 'MYS-023',
    message: '정회원만 가능합니다',
    statusCode: 403,
    category: 'PERMISSION',
    userMessage: '정회원 승인 후 이용 가능합니다'
  },

  ROLE_INVALID: {
    code: 'MYS-024',
    message: '잘못된 역할입니다',
    statusCode: 400,
    category: 'PERMISSION',
    userMessage: '올바른 역할이 아니에요'
  },

  // ============================================
  // 탭 (MYS-030 ~ MYS-039)
  // ============================================

  INVALID_TAB: {
    code: 'MYS-030',
    message: '유효하지 않은 탭입니다',
    statusCode: 400,
    category: 'TAB',
    userMessage: '올바른 탭을 선택해주세요'
  },

  TAB_ACCESS_DENIED: {
    code: 'MYS-031',
    message: '이 탭에 접근 권한이 없습니다',
    statusCode: 403,
    category: 'TAB',
    userMessage: '이 탭은 특정 권한이 필요해요'
  },

  TAB_LOAD_FAILED: {
    code: 'MYS-032',
    message: '탭 데이터를 불러오는데 실패했습니다',
    statusCode: 500,
    category: 'TAB',
    userMessage: '탭을 불러올 수 없어요. 다시 시도해주세요.'
  },

  TAB_NOT_AVAILABLE: {
    code: 'MYS-033',
    message: '이 탭은 현재 사용할 수 없습니다',
    statusCode: 503,
    category: 'TAB',
    userMessage: '이 기능은 준비 중이에요'
  },

  // ============================================
  // 위젯 (MYS-040 ~ MYS-049)
  // ============================================

  WIDGET_DATA_MISSING: {
    code: 'MYS-040',
    message: '위젯 데이터를 찾을 수 없습니다',
    statusCode: 404,
    category: 'WIDGET',
    userMessage: '위젯 데이터가 없어요'
  },

  WIDGET_LOAD_FAILED: {
    code: 'MYS-041',
    message: '위젯을 불러오는데 실패했습니다',
    statusCode: 500,
    category: 'WIDGET',
    userMessage: '위젯을 불러올 수 없어요. 새로고침해주세요.'
  },

  STATS_CALCULATION_FAILED: {
    code: 'MYS-042',
    message: '통계 계산에 실패했습니다',
    statusCode: 500,
    category: 'WIDGET',
    userMessage: '통계를 계산할 수 없어요'
  },

  WIDGET_RENDER_ERROR: {
    code: 'MYS-043',
    message: '위젯 렌더링에 실패했습니다',
    statusCode: 500,
    category: 'WIDGET',
    userMessage: '위젯을 표시할 수 없어요'
  },

  WIDGET_TIMEOUT: {
    code: 'MYS-044',
    message: '위젯 로딩 시간이 초과되었습니다',
    statusCode: 504,
    category: 'WIDGET',
    userMessage: '위젯 로딩이 너무 오래 걸려요. 새로고침해주세요.'
  },

  // ============================================
  // 공지사항 (MYS-050 ~ MYS-059)
  // ============================================

  NOTICE_NOT_FOUND: {
    code: 'MYS-050',
    message: '공지사항을 찾을 수 없습니다',
    statusCode: 404,
    category: 'NOTICE',
    userMessage: '공지사항이 삭제되었거나 존재하지 않아요'
  },

  NOTICE_CREATE_FAILED: {
    code: 'MYS-051',
    message: '공지사항 작성에 실패했습니다',
    statusCode: 500,
    category: 'NOTICE',
    userMessage: '공지사항을 작성할 수 없어요. 다시 시도해주세요.'
  },

  NOTICE_UPDATE_FAILED: {
    code: 'MYS-052',
    message: '공지사항 수정에 실패했습니다',
    statusCode: 500,
    category: 'NOTICE',
    userMessage: '공지사항을 수정할 수 없어요'
  },

  NOTICE_DELETE_FAILED: {
    code: 'MYS-053',
    message: '공지사항 삭제에 실패했습니다',
    statusCode: 500,
    category: 'NOTICE',
    userMessage: '공지사항을 삭제할 수 없어요'
  },

  NOTICE_VALIDATION_FAILED: {
    code: 'MYS-054',
    message: '공지사항 입력값이 올바르지 않습니다',
    statusCode: 400,
    category: 'NOTICE',
    userMessage: '제목과 내용을 확인해주세요'
  },

  // ============================================
  // 할일 (MYS-060 ~ MYS-069)
  // ============================================

  TASK_NOT_FOUND: {
    code: 'MYS-060',
    message: '할일을 찾을 수 없습니다',
    statusCode: 404,
    category: 'TASK',
    userMessage: '할일이 삭제되었거나 존재하지 않아요'
  },

  TASK_CREATE_FAILED: {
    code: 'MYS-061',
    message: '할일 생성에 실패했습니다',
    statusCode: 500,
    category: 'TASK',
    userMessage: '할일을 만들 수 없어요. 다시 시도해주세요.'
  },

  TASK_UPDATE_FAILED: {
    code: 'MYS-062',
    message: '할일 수정에 실패했습니다',
    statusCode: 500,
    category: 'TASK',
    userMessage: '할일을 수정할 수 없어요'
  },

  TASK_DELETE_FAILED: {
    code: 'MYS-063',
    message: '할일 삭제에 실패했습니다',
    statusCode: 500,
    category: 'TASK',
    userMessage: '할일을 삭제할 수 없어요'
  },

  TASK_VALIDATION_FAILED: {
    code: 'MYS-064',
    message: '할일 입력값이 올바르지 않습니다',
    statusCode: 400,
    category: 'TASK',
    userMessage: '제목과 마감일을 확인해주세요'
  },

  // ============================================
  // 파일 (MYS-070 ~ MYS-079)
  // ============================================

  FILE_NOT_FOUND: {
    code: 'MYS-070',
    message: '파일을 찾을 수 없습니다',
    statusCode: 404,
    category: 'FILE',
    userMessage: '파일이 삭제되었거나 존재하지 않아요'
  },

  FILE_UPLOAD_FAILED: {
    code: 'MYS-071',
    message: '파일 업로드에 실패했습니다',
    statusCode: 500,
    category: 'FILE',
    userMessage: '파일을 업로드할 수 없어요. 다시 시도해주세요.'
  },

  FILE_SIZE_EXCEEDED: {
    code: 'MYS-072',
    message: '파일 크기가 제한을 초과했습니다',
    statusCode: 413,
    category: 'FILE',
    userMessage: '파일은 최대 10MB까지 업로드 가능해요'
  },

  FILE_TYPE_INVALID: {
    code: 'MYS-073',
    message: '지원하지 않는 파일 형식입니다',
    statusCode: 400,
    category: 'FILE',
    userMessage: '이 파일 형식은 업로드할 수 없어요'
  },

  FILE_DELETE_FAILED: {
    code: 'MYS-074',
    message: '파일 삭제에 실패했습니다',
    statusCode: 500,
    category: 'FILE',
    userMessage: '파일을 삭제할 수 없어요'
  },

  FILE_DOWNLOAD_FAILED: {
    code: 'MYS-075',
    message: '파일 다운로드에 실패했습니다',
    statusCode: 500,
    category: 'FILE',
    userMessage: '파일을 다운로드할 수 없어요'
  },

  // ============================================
  // 캘린더 (MYS-080 ~ MYS-089)
  // ============================================

  EVENT_NOT_FOUND: {
    code: 'MYS-080',
    message: '일정을 찾을 수 없습니다',
    statusCode: 404,
    category: 'CALENDAR',
    userMessage: '일정이 삭제되었거나 존재하지 않아요'
  },

  EVENT_CREATE_FAILED: {
    code: 'MYS-081',
    message: '일정 생성에 실패했습니다',
    statusCode: 500,
    category: 'CALENDAR',
    userMessage: '일정을 만들 수 없어요. 다시 시도해주세요.'
  },

  EVENT_UPDATE_FAILED: {
    code: 'MYS-082',
    message: '일정 수정에 실패했습니다',
    statusCode: 500,
    category: 'CALENDAR',
    userMessage: '일정을 수정할 수 없어요'
  },

  EVENT_DELETE_FAILED: {
    code: 'MYS-083',
    message: '일정 삭제에 실패했습니다',
    statusCode: 500,
    category: 'CALENDAR',
    userMessage: '일정을 삭제할 수 없어요'
  },

  EVENT_VALIDATION_FAILED: {
    code: 'MYS-084',
    message: '일정 입력값이 올바르지 않습니다',
    statusCode: 400,
    category: 'CALENDAR',
    userMessage: '제목과 날짜를 확인해주세요'
  },

  EVENT_TIME_CONFLICT: {
    code: 'MYS-085',
    message: '일정이 겹칩니다',
    statusCode: 409,
    category: 'CALENDAR',
    userMessage: '이미 다른 일정이 있는 시간이에요'
  },

  // ============================================
  // 채팅 (MYS-090 ~ MYS-099)
  // ============================================

  CHAT_LOAD_FAILED: {
    code: 'MYS-090',
    message: '채팅을 불러오는데 실패했습니다',
    statusCode: 500,
    category: 'CHAT',
    userMessage: '채팅을 불러올 수 없어요. 다시 시도해주세요.'
  },

  MESSAGE_SEND_FAILED: {
    code: 'MYS-091',
    message: '메시지 전송에 실패했습니다',
    statusCode: 500,
    category: 'CHAT',
    userMessage: '메시지를 보낼 수 없어요'
  },

  MESSAGE_TOO_LONG: {
    code: 'MYS-092',
    message: '메시지가 너무 깁니다',
    statusCode: 400,
    category: 'CHAT',
    userMessage: '메시지는 최대 2000자까지 입력 가능해요'
  },

  MESSAGE_EMPTY: {
    code: 'MYS-093',
    message: '메시지가 비어있습니다',
    statusCode: 400,
    category: 'CHAT',
    userMessage: '메시지를 입력해주세요'
  },

  WEBSOCKET_CONNECTION_FAILED: {
    code: 'MYS-094',
    message: '실시간 연결에 실패했습니다',
    statusCode: 503,
    category: 'CHAT',
    userMessage: '실시간 채팅에 연결할 수 없어요'
  },

  MESSAGE_DELETE_FAILED: {
    code: 'MYS-095',
    message: '메시지 삭제에 실패했습니다',
    statusCode: 500,
    category: 'CHAT',
    userMessage: '메시지를 삭제할 수 없어요'
  },

  // ============================================
  // 일반 에러 (MYS-100 ~ MYS-109)
  // ============================================

  UNAUTHORIZED: {
    code: 'MYS-100',
    message: '인증이 필요합니다',
    statusCode: 401,
    category: 'GENERAL',
    userMessage: '로그인이 필요해요'
  },

  SESSION_EXPIRED: {
    code: 'MYS-101',
    message: '세션이 만료되었습니다',
    statusCode: 401,
    category: 'GENERAL',
    userMessage: '세션이 만료되었어요. 다시 로그인해주세요.'
  },

  NETWORK_ERROR: {
    code: 'MYS-102',
    message: '네트워크 오류가 발생했습니다',
    statusCode: 503,
    category: 'GENERAL',
    userMessage: '인터넷 연결을 확인해주세요'
  },

  TIMEOUT: {
    code: 'MYS-103',
    message: '요청 시간이 초과되었습니다',
    statusCode: 504,
    category: 'GENERAL',
    userMessage: '시간이 너무 오래 걸려요. 다시 시도해주세요.'
  },

  INTERNAL_ERROR: {
    code: 'MYS-104',
    message: '내부 서버 오류가 발생했습니다',
    statusCode: 500,
    category: 'GENERAL',
    userMessage: '문제가 발생했어요. 잠시 후 다시 시도해주세요.'
  },

  INVALID_REQUEST: {
    code: 'MYS-105',
    message: '잘못된 요청입니다',
    statusCode: 400,
    category: 'GENERAL',
    userMessage: '요청이 올바르지 않아요'
  },

  RATE_LIMIT_EXCEEDED: {
    code: 'MYS-106',
    message: '요청 횟수 제한을 초과했습니다',
    statusCode: 429,
    category: 'GENERAL',
    userMessage: '너무 많은 요청을 보냈어요. 잠시 후 다시 시도해주세요.'
  },

  DATABASE_ERROR: {
    code: 'MYS-107',
    message: '데이터베이스 오류가 발생했습니다',
    statusCode: 500,
    category: 'GENERAL',
    userMessage: '데이터를 처리할 수 없어요'
  },

  UNKNOWN_ERROR: {
    code: 'MYS-109',
    message: '알 수 없는 오류가 발생했습니다',
    statusCode: 500,
    category: 'GENERAL',
    userMessage: '알 수 없는 문제가 발생했어요. 관리자에게 문의해주세요.'
  }
}

/**
 * my-studies 에러 응답 객체 생성
 *
 * @param {string} errorKey - MY_STUDIES_ERRORS의 키
 * @param {string} [customMessage] - 사용자 정의 메시지 (선택)
 * @param {Object} [additionalData] - 추가 데이터 (선택)
 * @returns {Object} 에러 응답 객체
 *
 * @example
 * // 기본 사용
 * createMyStudiesError('STUDIES_NOT_FOUND')
 * // => { success: false, error: { code: 'MYS-001', message: '참여 중인 스터디가 없습니다', ... }, statusCode: 404 }
 *
 * @example
 * // 커스텀 메시지
 * createMyStudiesError('INVALID_FILTER', '올바른 필터를 선택하세요: all, active, admin, pending')
 *
 * @example
 * // 추가 데이터
 * createMyStudiesError('STUDY_ACCESS_DENIED', null, {
 *   studyId: 123,
 *   userId: 456,
 *   requiredRole: 'MEMBER'
 * })
 */
export function createMyStudiesError(errorKey, customMessage = null, additionalData = {}) {
  const error = MY_STUDIES_ERRORS[errorKey] || MY_STUDIES_ERRORS.UNKNOWN_ERROR

  return {
    success: false,
    error: {
      code: error.code,
      message: customMessage || error.message,
      userMessage: error.userMessage,
      category: error.category,
      timestamp: new Date().toISOString(),
      ...additionalData
    },
    statusCode: error.statusCode
  }
}

/**
 * my-studies 에러 로깅 (구조화된 로그)
 *
 * @param {string} context - 에러 발생 컨텍스트 (예: '스터디 목록 로드', '공지사항 작성')
 * @param {Error} error - 에러 객체
 * @param {Object} [metadata] - 추가 메타데이터 (선택)
 *
 * @example
 * logMyStudiesError('스터디 목록 로드', error, {
 *   userId: session.user.id,
 *   filter: 'active',
 *   endpoint: '/api/my-studies'
 * })
 */
export function logMyStudiesError(context, error, metadata = {}) {
  const logData = {
    level: 'ERROR',
    context: `[MY-STUDIES] ${context}`,
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
 * my-studies 경고 로깅 (Warning Level)
 *
 * @param {string} context - 경고 발생 컨텍스트
 * @param {string} message - 경고 메시지
 * @param {Object} [metadata] - 추가 메타데이터
 *
 * @example
 * logMyStudiesWarning('스터디 필터링', '일부 스터디를 필터링할 수 없습니다', {
 *   total: 10,
 *   filtered: 8,
 *   skipped: 2
 * })
 */
export function logMyStudiesWarning(context, message, metadata = {}) {
  const logData = {
    level: 'WARNING',
    context: `[MY-STUDIES] ${context}`,
    message,
    timestamp: new Date().toISOString(),
    ...metadata
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn(JSON.stringify(logData))
  } else {
    console.warn(`\n⚠️  [MY-STUDIES] ${context}`)
    console.warn(`📅 Time: ${logData.timestamp}`)
    console.warn(`💬 Message: ${message}`)
    if (Object.keys(metadata).length > 0) {
      console.warn(`📊 Metadata:`, JSON.stringify(metadata, null, 2))
    }
    console.warn('')
  }
}

/**
 * my-studies 정보 로깅 (Info Level)
 *
 * @param {string} context - 정보 로깅 컨텍스트
 * @param {Object} [metadata] - 추가 메타데이터
 *
 * @example
 * logMyStudiesInfo('스터디 목록 로드 성공', {
 *   userId: 123,
 *   filter: 'all',
 *   count: 5,
 *   duration: '45ms'
 * })
 */
export function logMyStudiesInfo(context, metadata = {}) {
  const logData = {
    level: 'INFO',
    context: `[MY-STUDIES] ${context}`,
    timestamp: new Date().toISOString(),
    ...metadata
  }

  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(logData))
  } else {
    console.log(`\n✅ [MY-STUDIES] ${context}`)
    console.log(`📅 Time: ${logData.timestamp}`)
    if (Object.keys(metadata).length > 0) {
      console.log(`📊 Metadata:`, JSON.stringify(metadata, null, 2))
    }
    console.log('')
  }
}

/**
 * Prisma 에러를 my-studies 에러로 변환
 *
 * @param {Error} error - Prisma 에러 객체
 * @returns {Object} 변환된 에러 응답
 *
 * @example
 * try {
 *   await prisma.studyMember.findMany({ where: ... })
 * } catch (error) {
 *   const myStudiesError = handlePrismaError(error)
 *   return NextResponse.json(myStudiesError, { status: myStudiesError.statusCode })
 * }
 */
export function handlePrismaError(error) {
  // Prisma 연결 실패 (P1001, P1002, P1008)
  if (['P1001', 'P1002', 'P1008'].includes(error.code)) {
    return createMyStudiesError('DATABASE_ERROR', '데이터베이스 연결에 실패했습니다', {
      prismaCode: error.code,
      details: error.message
    })
  }

  // Prisma 쿼리 타임아웃 (P2024)
  if (error.code === 'P2024') {
    return createMyStudiesError('TIMEOUT', null, {
      prismaCode: error.code
    })
  }

  // Prisma 레코드를 찾을 수 없음 (P2025)
  if (error.code === 'P2025') {
    return createMyStudiesError('STUDY_NOT_FOUND', null, {
      prismaCode: error.code
    })
  }

  // Prisma 트랜잭션 실패 (P2034)
  if (error.code === 'P2034') {
    return createMyStudiesError('DATABASE_ERROR', '트랜잭션 처리에 실패했습니다', {
      prismaCode: error.code
    })
  }

  // 기타 Prisma 에러
  if (error.code?.startsWith('P')) {
    logMyStudiesError('Prisma 에러', error, { prismaCode: error.code })
    return createMyStudiesError('INTERNAL_ERROR', '데이터베이스 오류가 발생했습니다', {
      prismaCode: error.code
    })
  }

  // 일반 에러
  return createMyStudiesError('UNKNOWN_ERROR')
}

/**
 * React Query 에러를 my-studies 에러로 변환
 *
 * @param {Error} error - React Query 에러 객체
 * @returns {Object} 변환된 에러 응답
 *
 * @example
 * const { data, error } = useMyStudies()
 * if (error) {
 *   const myStudiesError = handleReactQueryError(error)
 *   // UI에 에러 표시
 * }
 */
/**
 * React Query 에러 처리 헬퍼 (콜백 지원)
 *
 * @param {Error} error - React Query 에러 객체
 * @param {Object} [callbacks] - 에러 타입별 콜백
 * @param {Function} [callbacks.onNetworkError] - 네트워크 에러 콜백
 * @param {Function} [callbacks.onAuthError] - 인증 에러 콜백
 * @param {Function} [callbacks.onServerError] - 서버 에러 콜백
 * @param {Function} [callbacks.onTimeoutError] - 타임아웃 에러 콜백
 * @returns {Object} 처리된 에러 정보
 *
 * @example
 * handleReactQueryError(error, {
 *   onNetworkError: () => showToast('네트워크 에러'),
 *   onAuthError: () => router.push('/login')
 * })
 */
export function handleReactQueryError(error, callbacks = {}) {
  const {
    onNetworkError,
    onAuthError,
    onServerError,
    onTimeoutError
  } = callbacks

  // 1. 네트워크 에러
  if (!window.navigator?.onLine || error.message?.includes('Network') || error.name === 'TypeError' && error.message.includes('fetch')) {
    onNetworkError?.()
    return createMyStudiesError('NETWORK_ERROR', null, {
      originalError: error.message,
      category: 'NETWORK',
      shouldRetry: true
    })
  }

  // 2. 타임아웃
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    onTimeoutError?.()
    return createMyStudiesError('TIMEOUT', null, {
      originalError: error.message,
      category: 'TIMEOUT',
      shouldRetry: true
    })
  }

  // 3. HTTP 에러
  if (error.response) {
    const status = error.response.status

    // 인증 에러
    if (status === 401 || status === 403) {
      onAuthError?.()
      return createMyStudiesError(status === 401 ? 'UNAUTHORIZED' : 'NO_PERMISSION', null, {
        category: 'AUTH',
        shouldRetry: false
      })
    }

    // 서버 에러
    if (status >= 500) {
      onServerError?.()
      return createMyStudiesError('INTERNAL_ERROR', null, {
        category: 'SERVER',
        shouldRetry: true,
        statusCode: status
      })
    }

    // 404
    if (status === 404) {
      return createMyStudiesError('STUDY_NOT_FOUND')
    }

    // Rate Limit
    if (status === 429) {
      return createMyStudiesError('RATE_LIMIT_EXCEEDED')
    }
  }

  // 4. 일반 에러
  return createMyStudiesError('UNKNOWN_ERROR', null, {
    category: 'GENERAL',
    shouldRetry: true,
    originalError: error.message
  })
}

/**
 * 에러 객체를 NextResponse로 변환
 *
 * @param {Object} errorResponse - createMyStudiesError 반환값
 * @returns {NextResponse} Next.js Response 객체
 *
 * @example
 * const error = createMyStudiesError('STUDIES_NOT_FOUND')
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
 * 사용자 친화적 에러 메시지 생성
 *
 * @param {string} errorCode - MY_STUDIES_ERRORS의 코드
 * @param {Object} [context] - 추가 컨텍스트
 * @returns {Object} UI 표시용 에러 정보
 *
 * @example
 * const uiError = getUserFriendlyError('MYS-001')
 * // => {
 * //   title: '스터디 없음',
 * //   message: '참여 중인 스터디가 없습니다',
 * //   userMessage: '아직 참여 중인 스터디가 없어요...',
 * //   action: '스터디 찾기',
 * //   icon: '📚'
 * // }
 */
export function getUserFriendlyError(errorCode, context = {}) {
  const error = Object.values(MY_STUDIES_ERRORS).find(e => e.code === errorCode)

  if (!error) {
    return {
      title: '오류 발생',
      message: '알 수 없는 오류가 발생했습니다',
      userMessage: '알 수 없는 문제가 발생했어요',
      action: '새로고침',
      icon: '⚠️'
    }
  }

  // 카테고리별 UI 정보
  const categoryInfo = {
    LIST: { icon: '📚', action: '새로고침', title: '목록 오류' },
    DETAIL: { icon: '📖', action: '목록으로', title: '스터디 오류' },
    PERMISSION: { icon: '🔒', action: '확인', title: '권한 없음' },
    TAB: { icon: '📑', action: '다시 시도', title: '탭 오류' },
    WIDGET: { icon: '📊', action: '새로고침', title: '위젯 오류' },
    NOTICE: { icon: '📢', action: '다시 시도', title: '공지 오류' },
    TASK: { icon: '✅', action: '다시 시도', title: '할일 오류' },
    FILE: { icon: '📎', action: '다시 시도', title: '파일 오류' },
    CALENDAR: { icon: '📅', action: '다시 시도', title: '일정 오류' },
    CHAT: { icon: '💬', action: '다시 시도', title: '채팅 오류' },
    GENERAL: { icon: '⚠️', action: '다시 시도', title: '오류 발생' }
  }

  const info = categoryInfo[error.category] || categoryInfo.GENERAL

  return {
    title: info.title,
    message: error.message,
    userMessage: error.userMessage,
    action: context.action || info.action,
    icon: info.icon,
    code: error.code
  }
}

/**
 * 에러 심각도 판단
 *
 * @param {string} errorCode - MY_STUDIES_ERRORS의 코드
 * @returns {string} 심각도 ('critical', 'high', 'medium', 'low')
 *
 * @example
 * const severity = getErrorSeverity('MYS-100') // 'high' (인증 오류)
 */
export function getErrorSeverity(errorCode) {
  const error = Object.values(MY_STUDIES_ERRORS).find(e => e.code === errorCode)

  if (!error) return 'low'

  // Critical: 데이터베이스 오류, 보안
  if (['MYS-107', 'MYS-100', 'MYS-101'].includes(errorCode)) {
    return 'critical'
  }

  // High: 권한, 접근 거부
  if (error.category === 'PERMISSION' || error.statusCode === 403) {
    return 'high'
  }

  // Medium: 데이터 로딩 실패, CRUD 실패
  if (error.statusCode >= 500) {
    return 'medium'
  }

  // Low: 유효성 검사, 빈 상태
  return 'low'
}

/**
 * 부분 성공 응답 생성 (일부 데이터는 성공, 일부는 실패)
 *
 * @param {Object} successData - 성공적으로 로드된 데이터
 * @param {Array<string>} failedItems - 실패한 항목 목록
 * @returns {Object} 부분 성공 응답
 *
 * @example
 * const response = createPartialSuccessResponse(
 *   { studies: [...], count: 5 },
 *   ['study-123', 'study-456']
 * )
 */
export function createPartialSuccessResponse(successData, failedItems = []) {
  return {
    success: true,
    partial: true,
    data: successData,
    warnings: {
      code: 'MYS-PARTIAL',
      message: '일부 항목을 불러오지 못했습니다',
      failedItems,
      timestamp: new Date().toISOString()
    }
  }
}

