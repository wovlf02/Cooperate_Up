/**
 * 중앙화된 API 클라이언트
 *
 * 모든 API 호출은 이 파일을 통해 이루어집니다.
 * - 자동 인증 (쿠키 자동 포함)
 * - 에러 핸들링
 * - 요청/응답 로깅
 * - Query Parameters 자동 처리
 *
 * @example
 * import api from '@/lib/api'
 *
 * // GET 요청
 * const users = await api.get('/api/admin/users', { page: 1, limit: 20 })
 *
 * // POST 요청
 * await api.post('/api/admin/users/123/warn', { reason: '경고 사유' })
 *
 * // PUT 요청
 * await api.put('/api/user/profile', { name: 'New Name' })
 *
 * // PATCH 요청
 * await api.patch('/api/admin/users/123', { status: 'SUSPENDED' })
 *
 * // DELETE 요청
 * await api.delete('/api/admin/users/123')
 */

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

class ApiClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL
  }

  /**
   * 기본 HTTP 요청 메서드
   * @private
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      headers = {},
      params,
      ...customConfig
    } = options

    // URL 생성
    let url = `${this.baseURL}${endpoint}`

    // Query parameters 추가
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    // 기본 헤더 설정
    const config = {
      method,
      headers: {
        ...headers,
      },
      credentials: 'include', // 쿠키 자동 포함 (인증)
      ...customConfig,
    }

    // Body 추가 (FormData인 경우 JSON 변환 안함, Content-Type도 자동 설정)
    if (body) {
      if (body instanceof FormData) {
        config.body = body
        // FormData는 브라우저가 Content-Type을 자동으로 설정함 (multipart/form-data)
      } else {
        config.headers['Content-Type'] = 'application/json'
        config.body = JSON.stringify(body)
      }
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    try {
      console.log(`🌐 [API] ${method} ${url}`)

      const response = await fetch(url, config)

      // 응답 타입 확인
      const contentType = response.headers.get('content-type')
      const isJson = contentType?.includes('application/json')

      let data
      if (isJson) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      // 에러 응답 처리
      if (!response.ok) {
        let errorMessage
        if (typeof data === 'object') {
          // data.error가 객체인 경우 (StudyException의 toResponse() 형식)
          if (typeof data.error === 'object' && data.error !== null) {
            errorMessage = data.error.message || data.error.code || `HTTP ${response.status}`
          } else {
            errorMessage = data.error || data.message || `HTTP ${response.status}`
          }
        } else {
          errorMessage = data || `HTTP ${response.status}`
        }

        console.error(`❌ [API] ${method} ${url} - ${response.status}:`, errorMessage)
        throw new ApiError(errorMessage, response.status, data)
      }

      console.log(`✅ [API] ${method} ${url} - Success`)
      return data

    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      console.error(`❌ [API] ${method} ${url} - Network Error:`, error)
      throw new ApiError(
        error.message || '네트워크 오류가 발생했습니다.',
        0,
        null
      )
    }
  }

  /**
   * GET 요청
   * @param {string} endpoint - API 엔드포인트 (예: '/api/users')
   * @param {Object} params - Query parameters (예: { page: 1, limit: 20 })
   * @param {Object} options - 추가 fetch 옵션
   * @returns {Promise<any>}
   *
   * @example
   * const users = await api.get('/api/admin/users', { page: 1, status: 'ACTIVE' })
   */
  get(endpoint, params, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      params,
      ...options,
    })
  }

  /**
   * POST 요청
   * @param {string} endpoint - API 엔드포인트
   * @param {Object} body - 요청 본문
   * @param {Object} options - 추가 fetch 옵션
   * @returns {Promise<any>}
   *
   * @example
   * await api.post('/api/studies', { title: '스터디 제목', description: '설명' })
   */
  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body,
      ...options,
    })
  }

  /**
   * PUT 요청 (전체 업데이트)
   * @param {string} endpoint - API 엔드포인트
   * @param {Object} body - 요청 본문
   * @param {Object} options - 추가 fetch 옵션
   * @returns {Promise<any>}
   *
   * @example
   * await api.put('/api/user/profile', { name: 'New Name', bio: 'New Bio' })
   */
  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body,
      ...options,
    })
  }

  /**
   * PATCH 요청 (부분 업데이트)
   * @param {string} endpoint - API 엔드포인트
   * @param {Object} body - 요청 본문
   * @param {Object} options - 추가 fetch 옵션
   * @returns {Promise<any>}
   *
   * @example
   * await api.patch('/api/admin/users/123', { status: 'SUSPENDED' })
   */
  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body,
      ...options,
    })
  }

  /**
   * DELETE 요청
   * @param {string} endpoint - API 엔드포인트
   * @param {Object} options - 추가 fetch 옵션
   * @returns {Promise<any>}
   *
   * @example
   * await api.delete('/api/admin/users/123')
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    })
  }

  /**
   * HEAD 요청 (헤더만 확인)
   * @param {string} endpoint - API 엔드포인트
   * @param {Object} options - 추가 fetch 옵션
   * @returns {Promise<any>}
   */
  head(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'HEAD',
      ...options,
    })
  }

  /**
   * OPTIONS 요청 (서버가 지원하는 메서드 확인)
   * @param {string} endpoint - API 엔드포인트
   * @param {Object} options - 추가 fetch 옵션
   * @returns {Promise<any>}
   */
  options(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'OPTIONS',
      ...options,
    })
  }
}

// 싱글톤 인스턴스
const api = new ApiClient()


// 기본 export
export default api

// ApiError export
export { ApiError }

