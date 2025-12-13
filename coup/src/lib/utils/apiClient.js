// src/lib/utils/apiClient.js

class ApiClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'API 요청 실패')
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint

    return this.request(url, {
      method: 'GET',
    })
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    })
  }

  async upload(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // FormData는 Content-Type을 자동으로 설정
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '업로드 실패')
      }

      return data
    } catch (error) {
      console.error('Upload Error:', error)
      throw error
    }
  }
}

export const api = new ApiClient('/api')
export default api

