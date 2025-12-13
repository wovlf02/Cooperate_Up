// src/lib/middleware/requestLogger.js
import { log } from '../utils/logger'

export function withRequestLogging(handler) {
  return async (request, context) => {
    const startTime = Date.now()
    const { method, url } = request

    try {
      // 요청 로깅
      log.info(`${method} ${url}`, {
        method,
        url,
        headers: {
          'user-agent': request.headers.get('user-agent'),
          'content-type': request.headers.get('content-type')
        }
      })

      // 핸들러 실행
      const response = await handler(request, context)

      // 응답 로깅
      const duration = Date.now() - startTime
      log.info(`${method} ${url} - ${response.status}`, {
        method,
        url,
        status: response.status,
        duration: `${duration}ms`
      })

      return response

    } catch (error) {
      // 에러 로깅
      const duration = Date.now() - startTime
      log.error(`${method} ${url} - Error`, error, {
        method,
        url,
        duration: `${duration}ms`
      })

      throw error
    }
  }
}

