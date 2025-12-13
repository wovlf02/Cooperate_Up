/**
 * study-utils.js
 *
 * Study 도메인 유틸리티 함수 모음
 * 에러 핸들링, 응답 포맷팅, 재시도 로직 등
 *
 * @module lib/utils/study-utils
 * @author CoUp Team
 * @created 2025-12-01
 */

import { NextResponse } from 'next/server';
import { StudyException } from '@/lib/exceptions/study';
import { StudyLogger, extractRequestContext, extractErrorContext } from '@/lib/logging/studyLogger';

// ============================================
// 에러 핸들러
// ============================================

/**
 * Study API 에러 핸들러
 *
 * @param {Error} error - 에러 객체
 * @param {Request} [request] - Next.js Request 객체
 * @param {Object} [context] - 추가 컨텍스트
 * @returns {NextResponse} 에러 응답
 *
 * @example
 * try {
 *   // ... study API logic
 * } catch (error) {
 *   return handleStudyError(error, request, { studyId, userId });
 * }
 */
export function handleStudyError(error, request = null, context = {}) {
  // StudyException 처리
  if (error instanceof StudyException) {
    const requestContext = request ? extractRequestContext(request) : {};

    StudyLogger.logError(error, {
      ...requestContext,
      ...context
    });

    return NextResponse.json(
      error.toResponse(),
      { status: error.statusCode }
    );
  }

  // 일반 에러 처리
  StudyLogger.error('Unexpected error in study API', {
    error: error.message,
    stack: error.stack,
    ...context,
    ...(request && extractRequestContext(request))
  });

  return NextResponse.json(
    {
      success: false,
      code: 'STUDY-999',
      message: '예기치 않은 오류가 발생했습니다',
      userMessage: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
      retryable: true
    },
    { status: 500 }
  );
}

/**
 * Async 에러 핸들러 래퍼
 *
 * @param {Function} handler - API 핸들러 함수
 * @returns {Function} 래핑된 핸들러
 *
 * @example
 * export const GET = withStudyErrorHandler(async (request, context) => {
 *   // ... API logic
 * });
 */
export function withStudyErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleStudyError(error, request, context?.params);
    }
  };
}

// ============================================
// 응답 포맷터
// ============================================

/**
 * 성공 응답 생성
 *
 * @param {any} data - 응답 데이터
 * @param {string} [message] - 성공 메시지
 * @param {number} [status=200] - HTTP 상태 코드
 * @returns {NextResponse}
 *
 * @example
 * return createSuccessResponse(study, '스터디가 생성되었습니다', 201);
 */
export function createSuccessResponse(data, message = null, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message })
    },
    { status }
  );
}

/**
 * 에러 응답 생성
 *
 * @param {string} code - 에러 코드
 * @param {string} message - 에러 메시지
 * @param {number} [status=400] - HTTP 상태 코드
 * @param {Object} [additionalData] - 추가 데이터
 * @returns {NextResponse}
 *
 * @example
 * return createErrorResponse('STUDY-001', '스터디를 찾을 수 없습니다', 404);
 */
export function createErrorResponse(code, message, status = 400, additionalData = {}) {
  return NextResponse.json(
    {
      success: false,
      code,
      message,
      ...additionalData
    },
    { status }
  );
}

/**
 * 페이지네이션 응답 생성
 *
 * @param {Array} data - 데이터 배열
 * @param {number|Object} totalOrOptions - 전체 항목 수 또는 옵션 객체
 * @param {number} [page] - 현재 페이지
 * @param {number} [limit] - 페이지당 항목 수
 * @returns {NextResponse}
 *
 * @example
 * // 방법 1: 개별 매개변수
 * return createPaginatedResponse(studies, total, page, limit);
 *
 * // 방법 2: 객체로 전달
 * return createPaginatedResponse(studies, { page, limit, total });
 */
export function createPaginatedResponse(data, totalOrOptions, page, limit) {
  // 두 가지 호출 방식 지원
  let total, actualPage, actualLimit;

  if (typeof totalOrOptions === 'object') {
    // 방법 2: createPaginatedResponse(data, { page, limit, total })
    ({ total, page: actualPage, limit: actualLimit } = totalOrOptions);
  } else {
    // 방법 1: createPaginatedResponse(data, total, page, limit)
    total = totalOrOptions;
    actualPage = page;
    actualLimit = limit;
  }

  const totalPages = Math.ceil(total / actualLimit);

  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page: actualPage,
      limit: actualLimit,
      total,
      totalPages,
      hasNext: actualPage < totalPages,
      hasPrev: actualPage > 1
    }
  });
}

// ============================================
// 재시도 로직
// ============================================

/**
 * 재시도 가능한 작업 실행
 *
 * @param {Function} operation - 실행할 작업
 * @param {Object} options - 재시도 옵션
 * @param {number} [options.maxRetries=3] - 최대 재시도 횟수
 * @param {number} [options.delay=1000] - 재시도 지연 시간 (ms)
 * @param {Function} [options.shouldRetry] - 재시도 여부 판단 함수
 * @returns {Promise<any>} 작업 결과
 *
 * @example
 * const result = await withRetry(
 *   async () => await prisma.study.update(...),
 *   { maxRetries: 3, delay: 1000 }
 * );
 */
export async function withRetry(operation, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    shouldRetry = (error) => error.retryable !== false
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const isRetryable = shouldRetry(error);
      const hasRetriesLeft = attempt <= maxRetries;

      if (!isRetryable || !hasRetriesLeft) {
        throw error;
      }

      StudyLogger.warn(`Operation failed, retrying (${attempt}/${maxRetries})`, {
        error: extractErrorContext(error),
        attempt,
        maxRetries
      });

      // 지수 백오프
      await sleep(delay * Math.pow(2, attempt - 1));
    }
  }

  throw lastError;
}

/**
 * Sleep 유틸리티
 *
 * @param {number} ms - 대기 시간 (ms)
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// 컨텍스트 추출기
// ============================================

/**
 * URL 파라미터 추출
 *
 * @param {Request} request - Next.js Request 객체
 * @param {Object} context - Next.js context 객체
 * @returns {Object} 파라미터 객체
 *
 * @example
 * const { studyId } = extractParams(request, context);
 */
export function extractParams(request, context) {
  return context?.params || {};
}

/**
 * 쿼리 파라미터 추출
 *
 * @param {Request} request - Next.js Request 객체
 * @returns {Object} 쿼리 파라미터 객체
 *
 * @example
 * const { page, limit } = extractQuery(request);
 */
export function extractQuery(request) {
  const { searchParams } = new URL(request.url);
  return Object.fromEntries(searchParams.entries());
}

/**
 * 요청 본문 추출 및 검증
 *
 * @param {Request} request - Next.js Request 객체
 * @returns {Promise<Object>} 본문 객체
 * @throws {StudyValidationException}
 *
 * @example
 * const body = await extractBody(request);
 */
export async function extractBody(request) {
  try {
    const body = await request.json();
    return body;
  } catch (error) {
    StudyLogger.warn('Failed to parse request body', {
      error: error.message
    });

    throw new StudyException(
      'STUDY-998',
      '요청 본문을 파싱할 수 없습니다',
      {
        userMessage: '잘못된 요청 형식입니다',
        devMessage: `JSON parse error: ${error.message}`,
        statusCode: 400,
        category: 'validation'
      }
    );
  }
}

/**
 * 세션에서 사용자 ID 추출
 *
 * @param {Request} request - Next.js Request 객체
 * @returns {Promise<string|null>} 사용자 ID
 *
 * @example
 * const userId = await extractUserId(request);
 * if (!userId) {
 *   throw StudyPermissionException.notAuthenticated();
 * }
 */
export async function extractUserId(request) {
  // Next-Auth 세션에서 사용자 ID 추출
  // 실제 구현은 프로젝트의 인증 방식에 따라 다름

  // TODO: 실제 세션 추출 로직 구현
  // const session = await getServerSession(authOptions);
  // return session?.user?.id || null;

  // 임시: 헤더에서 추출
  return request.headers.get('x-user-id') || null;
}

/**
 * Study 컨텍스트 추출
 *
 * @param {Request} request - Next.js Request 객체
 * @param {Object} context - Next.js context 객체
 * @returns {Promise<Object>} Study 컨텍스트
 *
 * @example
 * const { studyId, userId, query, body } = await extractStudyContext(request, context);
 */
export async function extractStudyContext(request, context) {
  const params = extractParams(request, context);
  const query = extractQuery(request);
  const userId = await extractUserId(request);

  let body = null;
  if (request.method !== 'GET' && request.method !== 'DELETE') {
    body = await extractBody(request);
  }

  return {
    studyId: params.studyId || params.id,
    userId,
    params,
    query,
    body,
    method: request.method
  };
}

// ============================================
// 검증 유틸리티
// ============================================

/**
 * UUID 검증
 *
 * @param {string} id - 검증할 ID
 * @returns {boolean} UUID 여부
 *
 * @example
 * if (!isValidUUID(studyId)) {
 *   throw StudyValidationException.invalidStudyId(studyId);
 * }
 */
export function isValidUUID(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * 필수 필드 검증
 *
 * @param {Object} data - 검증할 데이터 객체
 * @param {string[]} requiredFields - 필수 필드 배열
 * @throws {StudyValidationException}
 *
 * @example
 * validateRequiredFields(body, ['name', 'description', 'category']);
 */
export function validateRequiredFields(data, requiredFields) {
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    throw new StudyException(
      'STUDY-997',
      `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`,
      {
        userMessage: '필수 입력 항목을 확인해주세요',
        devMessage: `Missing required fields: ${missingFields.join(', ')}`,
        statusCode: 400,
        category: 'validation',
        context: { missingFields }
      }
    );
  }
}

// ============================================
// 데이터 변환 유틸리티
// ============================================

/**
 * 스터디 데이터 직렬화
 *
 * @param {Object} study - 스터디 객체
 * @returns {Object} 직렬화된 스터디 데이터
 *
 * @example
 * const serialized = serializeStudy(study);
 */
export function serializeStudy(study) {
  if (!study) return null;

  return {
    id: study.id,
    name: study.name,
    description: study.description,
    category: study.category,
    imageUrl: study.imageUrl,
    maxMembers: study.maxMembers,
    currentMembers: study.currentMembers || study._count?.members || 0,
    isRecruiting: study.isRecruiting,
    autoApprove: study.autoApprove,
    startDate: study.startDate?.toISOString() || null,
    endDate: study.endDate?.toISOString() || null,
    createdAt: study.createdAt.toISOString(),
    updatedAt: study.updatedAt.toISOString(),
    owner: study.owner ? serializeUser(study.owner) : null
  };
}

/**
 * 멤버 데이터 직렬화
 *
 * @param {Object} member - 멤버 객체
 * @returns {Object} 직렬화된 멤버 데이터
 *
 * @example
 * const serialized = serializeMember(member);
 */
export function serializeMember(member) {
  if (!member) return null;

  return {
    id: member.id,
    userId: member.userId,
    studyId: member.studyId,
    role: member.role,
    status: member.status,
    joinedAt: member.joinedAt?.toISOString() || null,
    createdAt: member.createdAt.toISOString(),
    user: member.user ? serializeUser(member.user) : null
  };
}

/**
 * 사용자 데이터 직렬화
 *
 * @param {Object} user - 사용자 객체
 * @returns {Object} 직렬화된 사용자 데이터
 *
 * @example
 * const serialized = serializeUser(user);
 */
export function serializeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image
  };
}

/**
 * 여러 스터디 직렬화
 *
 * @param {Array} studies - 스터디 배열
 * @returns {Array} 직렬화된 스터디 배열
 *
 * @example
 * const serialized = serializeStudies(studies);
 */
export function serializeStudies(studies) {
  return studies.map(serializeStudy);
}

/**
 * 여러 멤버 직렬화
 *
 * @param {Array} members - 멤버 배열
 * @returns {Array} 직렬화된 멤버 배열
 *
 * @example
 * const serialized = serializeMembers(members);
 */
export function serializeMembers(members) {
  return members.map(serializeMember);
}

// ============================================
// 캐시 유틸리티 (선택)
// ============================================

/**
 * 스터디 캐시 키 생성
 *
 * @param {string} studyId - 스터디 ID
 * @param {string} [suffix] - 키 접미사
 * @returns {string} 캐시 키
 *
 * @example
 * const cacheKey = getStudyCacheKey(studyId, 'detail');
 */
export function getStudyCacheKey(studyId, suffix = '') {
  return `study:${studyId}${suffix ? ':' + suffix : ''}`;
}

/**
 * 멤버 캐시 키 생성
 *
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 사용자 ID
 * @param {string} [suffix] - 키 접미사
 * @returns {string} 캐시 키
 *
 * @example
 * const cacheKey = getMemberCacheKey(studyId, userId);
 */
export function getMemberCacheKey(studyId, userId, suffix = '') {
  return `member:${studyId}:${userId}${suffix ? ':' + suffix : ''}`;
}

// ============================================
// 디버깅 유틸리티
// ============================================

/**
 * 개발 환경 전용 로깅
 *
 * @param {string} message - 로그 메시지
 * @param {any} data - 로그 데이터
 *
 * @example
 * debugLog('Study created', { studyId, userId });
 */
export function debugLog(message, data) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[STUDY DEBUG] ${message}`, data);
  }
}

/**
 * 성능 측정 래퍼
 *
 * @param {string} operationName - 작업 이름
 * @param {Function} operation - 실행할 작업
 * @returns {Promise<any>} 작업 결과
 *
 * @example
 * const result = await measurePerformance('fetchStudies', async () => {
 *   return await prisma.study.findMany();
 * });
 */
export async function measurePerformance(operationName, operation) {
  const startTimer = StudyLogger.startTimer(operationName);

  try {
    const result = await operation();
    startTimer({ success: true });
    return result;
  } catch (error) {
    startTimer({ success: false, error: error.message });
    throw error;
  }
}

// Export all utilities
export default {
  // Error handling
  handleStudyError,
  withStudyErrorHandler,

  // Response formatting
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,

  // Retry logic
  withRetry,

  // Context extraction
  extractParams,
  extractQuery,
  extractBody,
  extractUserId,
  extractStudyContext,

  // Validation
  isValidUUID,
  validateRequiredFields,

  // Serialization
  serializeStudy,
  serializeMember,
  serializeUser,
  serializeStudies,
  serializeMembers,

  // Cache
  getStudyCacheKey,
  getMemberCacheKey,

  // Debug
  debugLog,
  measurePerformance
};

