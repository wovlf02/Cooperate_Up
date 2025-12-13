/**
 * admin-utils.js
 *
 * Admin 도메인 유틸리티 함수 모음
 * 에러 핸들링, 응답 포맷팅, 검증, 보안 헬퍼 등
 *
 * @module lib/utils/admin-utils
 * @author CoUp Team
 * @created 2025-12-02
 */

import { NextResponse } from 'next/server';
import { AdminException, AdminValidationException } from '@/lib/exceptions/admin';
import { AdminLogger, extractRequestContext } from '@/lib/logging/adminLogger';

// ============================================
// 에러 핸들러
// ============================================

/**
 * Admin API 에러 핸들러
 *
 * @param {Error} error - 에러 객체
 * @param {Request} [request] - Next.js Request 객체
 * @param {Object} [context] - 추가 컨텍스트
 * @returns {NextResponse} 에러 응답
 *
 * @example
 * try {
 *   // ... admin API logic
 * } catch (error) {
 *   return handleAdminError(error, request, { adminId, action });
 * }
 */
export function handleAdminError(error, request = null, context = {}) {
  // AdminException 처리
  if (error instanceof AdminException) {
    const requestContext = request ? extractRequestContext(request) : {};

    AdminLogger.logError(error, {
      ...requestContext,
      ...context
    });

    return NextResponse.json(
      error.toResponse(),
      { status: error.statusCode }
    );
  }

  // Prisma 에러 처리
  if (error.name === 'PrismaClientKnownRequestError') {
    return handlePrismaError(error, request, context);
  }

  // 일반 에러 처리
  AdminLogger.error('Unexpected error in admin API', {
    error: error.message,
    stack: error.stack,
    ...context,
    ...(request && extractRequestContext(request))
  });

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'ADMIN-100',
        message: '예기치 않은 오류가 발생했습니다',
        retryable: true,
        timestamp: new Date().toISOString()
      }
    },
    { status: 500 }
  );
}

/**
 * Prisma 에러 핸들러
 *
 * @param {Error} error - Prisma 에러
 * @param {Request} request - Request 객체
 * @param {Object} context - 컨텍스트
 * @returns {NextResponse}
 */
function handlePrismaError(error, request, context) {
  AdminLogger.logDatabaseError('Prisma operation', error, context);

  // P2002: Unique constraint violation
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field';
    const exception = AdminException.duplicateEntry(field, 'value', context);
    return NextResponse.json(exception.toResponse(), { status: exception.statusCode });
  }

  // P2025: Record not found
  if (error.code === 'P2025') {
    const exception = AdminException.unknownError(error, context);
    return NextResponse.json(exception.toResponse(), { status: 404 });
  }

  // 일반 DB 에러
  const exception = AdminException.connectionFailed(error.message, context);
  return NextResponse.json(exception.toResponse(), { status: exception.statusCode });
}

/**
 * Async 에러 핸들러 래퍼
 *
 * @param {Function} handler - API 핸들러 함수
 * @returns {Function} 래핑된 핸들러
 *
 * @example
 * export const GET = withAdminErrorHandler(async (request, context) => {
 *   // ... API logic
 * });
 */
export function withAdminErrorHandler(handler) {
  return async (request, context) => {
    const startTime = Date.now();
    const url = new URL(request.url);

    try {
      // 요청 로깅
      AdminLogger.logApiRequest(url.pathname, request.method, {
        query: Object.fromEntries(url.searchParams),
        ...(context?.params || {})
      });

      const response = await handler(request, context);

      // 응답 로깅
      const duration = Date.now() - startTime;
      AdminLogger.logApiResponse(url.pathname, response.status, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      AdminLogger.logApiResponse(url.pathname, 500, duration, {
        error: error.message
      });

      return handleAdminError(error, request, context?.params);
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
 * return createSuccessResponse(users, '사용자 목록 조회 성공', 200);
 */
export function createSuccessResponse(data, message = null, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
      timestamp: new Date().toISOString()
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
 * return createErrorResponse('ADMIN-021', '사용자를 찾을 수 없습니다', 404);
 */
export function createErrorResponse(code, message, status = 400, additionalData = {}) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...additionalData,
        timestamp: new Date().toISOString()
      }
    },
    { status }
  );
}

/**
 * 페이지네이션 응답 생성
 *
 * @param {Array} data - 데이터 배열
 * @param {number} total - 전체 항목 수
 * @param {number} page - 현재 페이지
 * @param {number} limit - 페이지당 항목 수
 * @param {Object} [meta] - 추가 메타데이터
 * @returns {NextResponse}
 *
 * @example
 * return createPaginatedResponse(users, 150, 1, 20);
 */
export function createPaginatedResponse(data, total, page, limit, meta = {}) {
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    ...meta,
    timestamp: new Date().toISOString()
  });
}

// ============================================
// 검증 헬퍼
// ============================================

/**
 * 페이지네이션 파라미터 검증 및 파싱
 *
 * @param {URLSearchParams} searchParams - URL 검색 파라미터
 * @param {Object} [options] - 옵션
 * @returns {Object} 검증된 페이지네이션 파라미터
 *
 * @example
 * const { page, limit, skip } = validatePagination(searchParams);
 */
export function validatePagination(searchParams, options = {}) {
  const defaultLimit = options.defaultLimit || 20;
  const maxLimit = options.maxLimit || 100;

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(maxLimit, Math.max(1, parseInt(searchParams.get('limit') || String(defaultLimit))));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * 정렬 파라미터 검증
 *
 * @param {URLSearchParams} searchParams - URL 검색 파라미터
 * @param {Array<string>} validFields - 허용된 필드 목록
 * @param {string} [defaultField='createdAt'] - 기본 정렬 필드
 * @returns {Object} 검증된 정렬 파라미터
 *
 * @example
 * const { sortBy, sortOrder } = validateSorting(
 *   searchParams,
 *   ['name', 'email', 'createdAt']
 * );
 */
export function validateSorting(searchParams, validFields, defaultField = 'createdAt') {
  const sortBy = searchParams.get('sortBy') || defaultField;
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

  if (!validFields.includes(sortBy)) {
    throw AdminValidationException.invalidSorting(sortBy, validFields);
  }

  return { sortBy, sortOrder };
}

/**
 * 날짜 범위 검증
 *
 * @param {string} startDate - 시작 날짜
 * @param {string} endDate - 종료 날짜
 * @returns {Object} 검증된 날짜 범위
 *
 * @example
 * const { start, end } = validateDateRange(createdFrom, createdTo);
 */
export function validateDateRange(startDate, endDate) {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && end && start > end) {
    throw AdminValidationException.invalidDateRange(startDate, endDate);
  }

  if (start && isNaN(start.getTime())) {
    throw AdminValidationException.invalidDateRange(startDate, endDate, {
      reason: 'Invalid start date'
    });
  }

  if (end && isNaN(end.getTime())) {
    throw AdminValidationException.invalidDateRange(startDate, endDate, {
      reason: 'Invalid end date'
    });
  }

  return { start, end };
}

/**
 * 필수 필드 검증
 *
 * @param {Object} data - 검증할 데이터
 * @param {Array<string>} requiredFields - 필수 필드 목록
 * @throws {AdminValidationException}
 *
 * @example
 * validateRequiredFields(body, ['name', 'email', 'role']);
 */
export function validateRequiredFields(data, requiredFields) {
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    throw AdminValidationException.invalidSearchCriteria(
      { missingFields },
      { message: `Missing required fields: ${missingFields.join(', ')}` }
    );
  }
}

/**
 * 열거형 값 검증
 *
 * @param {string} value - 검증할 값
 * @param {Array<string>} validValues - 허용된 값 목록
 * @param {string} fieldName - 필드 이름
 * @throws {AdminValidationException}
 *
 * @example
 * validateEnum(status, ['ACTIVE', 'SUSPENDED', 'DELETED'], 'status');
 */
export function validateEnum(value, validValues, fieldName = 'value') {
  if (!validValues.includes(value)) {
    throw AdminValidationException.invalidSearchCriteria(
      { [fieldName]: value, validValues },
      { message: `Invalid ${fieldName}: must be one of ${validValues.join(', ')}` }
    );
  }
}

// ============================================
// 데이터 변환 헬퍼
// ============================================

/**
 * 사용자 데이터 변환 (민감 정보 제거)
 *
 * @param {Object} user - 원본 사용자 데이터
 * @returns {Object} 변환된 사용자 데이터
 */
export function sanitizeUserData(user) {
  if (!user) return null;

  const { password, sessionToken, resetToken, ...safeData } = user;
  return safeData;
}

/**
 * 관리자 데이터 변환 (민감 정보 제거)
 *
 * @param {Object} admin - 원본 관리자 데이터
 * @returns {Object} 변환된 관리자 데이터
 */
export function sanitizeAdminData(admin) {
  if (!admin) return null;

  const { password, sessionToken, twoFactorSecret, ...safeData } = admin;
  return safeData;
}

/**
 * Where 조건 빌더
 *
 * @param {URLSearchParams} searchParams - URL 검색 파라미터
 * @param {Object} fieldMapping - 필드 매핑 설정
 * @returns {Object} Prisma where 조건
 *
 * @example
 * const where = buildWhereClause(searchParams, {
 *   search: { fields: ['name', 'email'], mode: 'insensitive' },
 *   status: { type: 'enum' },
 *   createdAt: { type: 'dateRange', from: 'createdFrom', to: 'createdTo' }
 * });
 */
export function buildWhereClause(searchParams, fieldMapping) {
  const where = {};

  Object.entries(fieldMapping).forEach(([key, config]) => {
    if (config.type === 'search') {
      const searchValue = searchParams.get(key);
      if (searchValue && config.fields) {
        where.OR = config.fields.map(field => ({
          [field]: { contains: searchValue, mode: config.mode || 'insensitive' }
        }));
      }
    } else if (config.type === 'enum') {
      const value = searchParams.get(key);
      if (value && value !== 'all') {
        where[key] = value;
      }
    } else if (config.type === 'dateRange') {
      const from = searchParams.get(config.from);
      const to = searchParams.get(config.to);
      if (from || to) {
        where[key] = {};
        if (from) where[key].gte = new Date(from);
        if (to) where[key].lte = new Date(to);
      }
    } else if (config.type === 'boolean') {
      const value = searchParams.get(key);
      if (value === 'true' || value === 'false') {
        where[key] = value === 'true';
      }
    }
  });

  return where;
}

// ============================================
// 보안 헬퍼
// ============================================

/**
 * IP 주소 추출
 *
 * @param {Request} request - Request 객체
 * @returns {string} IP 주소
 */
export function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * User Agent 추출
 *
 * @param {Request} request - Request 객체
 * @returns {string} User Agent
 */
export function getUserAgent(request) {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * 감사 로그 컨텍스트 생성
 *
 * @param {Request} request - Request 객체
 * @param {string} adminId - 관리자 ID
 * @param {string} action - 수행한 작업
 * @param {Object} [details] - 작업 상세 정보
 * @returns {Object} 감사 로그 컨텍스트
 */
export function createAuditContext(request, adminId, action, details = {}) {
  return {
    adminId,
    action,
    ip: getClientIp(request),
    userAgent: getUserAgent(request),
    timestamp: new Date().toISOString(),
    ...details
  };
}

// ============================================
// 성능 헬퍼
// ============================================

/**
 * 재시도 로직 래퍼
 *
 * @param {Function} fn - 실행할 함수
 * @param {Object} [options] - 재시도 옵션
 * @returns {Promise<*>} 함수 실행 결과
 *
 * @example
 * const result = await withRetry(() => fetchExternalApi(), {
 *   maxRetries: 3,
 *   delayMs: 1000
 * });
 */
export async function withRetry(fn, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const delayMs = options.delayMs || 1000;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries && error.retryable !== false) {
        AdminLogger.warn(`Retry attempt ${attempt}/${maxRetries}`, {
          error: error.message,
          attempt
        });
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      } else {
        break;
      }
    }
  }

  throw lastError;
}

/**
 * 배치 처리 헬퍼
 *
 * @param {Array} items - 처리할 항목 배열
 * @param {Function} processor - 각 항목을 처리하는 함수
 * @param {Object} [options] - 배치 옵션
 * @returns {Promise<Array>} 처리 결과 배열
 *
 * @example
 * const results = await processBatch(userIds, async (userId) => {
 *   return await suspendUser(userId);
 * }, { batchSize: 10, delayMs: 100 });
 */
export async function processBatch(items, processor, options = {}) {
  const batchSize = options.batchSize || 10;
  const delayMs = options.delayMs || 0;
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);

    if (delayMs > 0 && i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

// ============================================
// EXPORTS
// ============================================

export default {
  handleAdminError,
  withAdminErrorHandler,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  validatePagination,
  validateSorting,
  validateDateRange,
  validateRequiredFields,
  validateEnum,
  sanitizeUserData,
  sanitizeAdminData,
  buildWhereClause,
  getClientIp,
  getUserAgent,
  createAuditContext,
  withRetry,
  processBatch
};

