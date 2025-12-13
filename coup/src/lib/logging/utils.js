/**
 * Admin Logger - Request/Error Context Utilities
 * 요청 및 에러 컨텍스트 추출 유틸리티
 *
 * @module lib/logging/utils
 */

/**
 * Request 객체에서 컨텍스트 추출
 *
 * @param {Request} request - Next.js Request 객체
 * @returns {Object} 추출된 컨텍스트
 */
export function extractRequestContext(request) {
  if (!request) return {};

  try {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    return {
      method: request.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      userAgent,
      ip,
      referer: request.headers.get('referer') || 'unknown'
    };
  } catch (error) {
    return { error: 'Failed to extract request context' };
  }
}

/**
 * Error 객체에서 컨텍스트 추출
 *
 * @param {Error} error - 에러 객체
 * @returns {Object} 추출된 컨텍스트
 */
export function extractErrorContext(error) {
  if (!error) return {};

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    ...(error.context || {})
  };
}

