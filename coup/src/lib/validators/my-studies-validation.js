/**
 * my-studies-validation.js
 *
 * my-studies 영역 데이터 유효성 검사
 *
 * 사용 예시:
 * ```js
 * import { validateNoticeData, validateTaskData } from '@/lib/validators/my-studies-validation'
 *
 * const validation = validateNoticeData(noticeData)
 * if (!validation.valid) {
 *   return { error: validation.error }
 * }
 * ```
 *
 * @module lib/validators/my-studies-validation
 */

/**
 * 역할(role) 유효성 검사
 *
 * @param {string} role - 검사할 역할
 * @returns {Object} 검사 결과
 *
 * @example
 * validateRole('OWNER') // { valid: true }
 * validateRole('INVALID') // { valid: false, error: '유효하지 않은 역할입니다' }
 */
export function validateRole(role) {
  const validRoles = ['OWNER', 'ADMIN', 'MEMBER', 'PENDING']

  if (!role) {
    return {
      valid: false,
      error: '역할이 제공되지 않았습니다'
    }
  }

  if (!validRoles.includes(role)) {
    return {
      valid: false,
      error: `유효하지 않은 역할입니다. 가능한 값: ${validRoles.join(', ')}`
    }
  }

  return { valid: true }
}

/**
 * 필터 옵션 유효성 검사
 *
 * @param {string} filter - 필터 값 ('all', 'active', 'admin', 'pending')
 * @returns {Object} 검사 결과
 *
 * @example
 * validateFilter('all') // { valid: true }
 * validateFilter('invalid') // { valid: false, error: '...' }
 */
export function validateFilter(filter) {
  const validFilters = ['all', 'active', 'admin', 'pending']

  if (!filter) {
    return {
      valid: false,
      error: '필터가 제공되지 않았습니다'
    }
  }

  if (!validFilters.includes(filter)) {
    return {
      valid: false,
      error: `유효하지 않은 필터입니다. 가능한 값: ${validFilters.join(', ')}`
    }
  }

  return { valid: true }
}

/**
 * 탭 이름 유효성 검사
 *
 * @param {string} tab - 탭 이름
 * @returns {Object} 검사 결과
 *
 * @example
 * validateTab('overview') // { valid: true }
 * validateTab('invalid') // { valid: false, error: '...' }
 */
export function validateTab(tab) {
  const validTabs = [
    'overview',    // 개요
    'chat',        // 채팅
    'notices',     // 공지사항
    'files',       // 파일
    'calendar',    // 캘린더
    'tasks',       // 할일
    'video-call',  // 화상회의
    'members',     // 멤버
    'settings'     // 설정
  ]

  if (!tab) {
    return {
      valid: false,
      error: '탭이 제공되지 않았습니다'
    }
  }

  if (!validTabs.includes(tab)) {
    return {
      valid: false,
      error: `유효하지 않은 탭입니다. 가능한 값: ${validTabs.join(', ')}`
    }
  }

  return { valid: true }
}

/**
 * 공지사항 데이터 유효성 검사
 *
 * @param {Object} data - 공지사항 데이터
 * @param {string} data.title - 제목
 * @param {string} data.content - 내용
 * @param {boolean} [data.isPinned] - 고정 여부
 * @returns {Object} 검사 결과
 *
 * @example
 * validateNoticeData({ title: '공지', content: '내용입니다' })
 * // { valid: true }
 */
export function validateNoticeData(data) {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      error: '유효하지 않은 데이터 형식입니다'
    }
  }

  // 제목 검사
  if (!data.title || typeof data.title !== 'string') {
    return {
      valid: false,
      error: '제목이 필요합니다'
    }
  }

  if (data.title.trim().length === 0) {
    return {
      valid: false,
      error: '제목을 입력해주세요'
    }
  }

  if (data.title.length > 200) {
    return {
      valid: false,
      error: '제목은 최대 200자까지 입력 가능합니다'
    }
  }

  // 내용 검사
  if (!data.content || typeof data.content !== 'string') {
    return {
      valid: false,
      error: '내용이 필요합니다'
    }
  }

  if (data.content.trim().length === 0) {
    return {
      valid: false,
      error: '내용을 입력해주세요'
    }
  }

  if (data.content.length > 10000) {
    return {
      valid: false,
      error: '내용은 최대 10,000자까지 입력 가능합니다'
    }
  }

  // XSS 방지: 기본적인 HTML 태그 검사
  const dangerousTags = /<script|<iframe|<object|<embed|onerror=|onload=/i
  if (dangerousTags.test(data.content) || dangerousTags.test(data.title)) {
    return {
      valid: false,
      error: '허용되지 않는 HTML 태그가 포함되어 있습니다'
    }
  }

  // isPinned 검사 (선택적)
  if (data.isPinned !== undefined && typeof data.isPinned !== 'boolean') {
    return {
      valid: false,
      error: 'isPinned는 boolean 타입이어야 합니다'
    }
  }

  return { valid: true }
}

/**
 * 할일 데이터 유효성 검사
 *
 * @param {Object} data - 할일 데이터
 * @param {string} data.title - 제목
 * @param {string} [data.description] - 설명
 * @param {Date|string} [data.dueDate] - 마감일
 * @param {string} [data.priority] - 우선순위 (low, medium, high)
 * @returns {Object} 검사 결과
 *
 * @example
 * validateTaskData({ title: '과제 제출', dueDate: '2025-12-10' })
 * // { valid: true }
 */
export function validateTaskData(data) {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      error: '유효하지 않은 데이터 형식입니다'
    }
  }

  // 제목 검사
  if (!data.title || typeof data.title !== 'string') {
    return {
      valid: false,
      error: '제목이 필요합니다'
    }
  }

  if (data.title.trim().length === 0) {
    return {
      valid: false,
      error: '제목을 입력해주세요'
    }
  }

  if (data.title.length > 200) {
    return {
      valid: false,
      error: '제목은 최대 200자까지 입력 가능합니다'
    }
  }

  // 설명 검사 (선택적)
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      return {
        valid: false,
        error: '설명은 문자열이어야 합니다'
      }
    }

    if (data.description.length > 2000) {
      return {
        valid: false,
        error: '설명은 최대 2,000자까지 입력 가능합니다'
      }
    }
  }

  // 마감일 검사 (선택적)
  if (data.dueDate !== undefined && data.dueDate !== null) {
    const dueDate = new Date(data.dueDate)

    if (isNaN(dueDate.getTime())) {
      return {
        valid: false,
        error: '유효하지 않은 날짜 형식입니다'
      }
    }

    // 과거 날짜 경고 (에러는 아님)
    const now = new Date()
    if (dueDate < now) {
      return {
        valid: true,
        warning: '마감일이 과거입니다'
      }
    }
  }

  // 우선순위 검사 (선택적)
  if (data.priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high']

    if (!validPriorities.includes(data.priority)) {
      return {
        valid: false,
        error: `유효하지 않은 우선순위입니다. 가능한 값: ${validPriorities.join(', ')}`
      }
    }
  }

  return { valid: true }
}

/**
 * 파일 업로드 유효성 검사
 *
 * @param {File} file - 업로드할 파일
 * @param {Object} [options] - 검사 옵션
 * @param {number} [options.maxSize] - 최대 크기 (bytes, 기본: 10MB)
 * @param {string[]} [options.allowedTypes] - 허용 파일 타입
 * @returns {Object} 검사 결과
 *
 * @example
 * validateFileUpload(file, { maxSize: 5 * 1024 * 1024 })
 * // { valid: true }
 */
export function validateFileUpload(file, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = [
      // 이미지
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      // 문서
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // 압축
      'application/zip', 'application/x-zip-compressed',
      'application/x-rar-compressed',
      // 텍스트
      'text/plain', 'text/csv'
    ]
  } = options

  if (!file) {
    return {
      valid: false,
      error: '파일이 제공되지 않았습니다'
    }
  }

  // 파일 크기 검사
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
    return {
      valid: false,
      error: `파일 크기는 최대 ${maxSizeMB}MB까지 업로드 가능합니다`
    }
  }

  // 파일 타입 검사
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '지원하지 않는 파일 형식입니다'
    }
  }

  // 파일 이름 검사
  if (!file.name || file.name.length > 255) {
    return {
      valid: false,
      error: '파일 이름이 너무 깁니다 (최대 255자)'
    }
  }

  // 악성 파일명 검사
  const dangerousChars = /[<>:"|?*\x00-\x1f]/
  if (dangerousChars.test(file.name)) {
    return {
      valid: false,
      error: '파일 이름에 허용되지 않는 문자가 포함되어 있습니다'
    }
  }

  return { valid: true }
}

/**
 * 캘린더 일정 데이터 유효성 검사
 *
 * @param {Object} data - 일정 데이터
 * @param {string} data.title - 제목
 * @param {Date|string} data.startDate - 시작일
 * @param {Date|string} [data.endDate] - 종료일
 * @param {boolean} [data.allDay] - 하루 종일 여부
 * @returns {Object} 검사 결과
 *
 * @example
 * validateCalendarEvent({ title: '스터디 모임', startDate: '2025-12-10', endDate: '2025-12-10' })
 * // { valid: true }
 */
export function validateCalendarEvent(data) {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      error: '유효하지 않은 데이터 형식입니다'
    }
  }

  // 제목 검사
  if (!data.title || typeof data.title !== 'string') {
    return {
      valid: false,
      error: '제목이 필요합니다'
    }
  }

  if (data.title.trim().length === 0) {
    return {
      valid: false,
      error: '제목을 입력해주세요'
    }
  }

  if (data.title.length > 100) {
    return {
      valid: false,
      error: '제목은 최대 100자까지 입력 가능합니다'
    }
  }

  // 시작일 검사
  if (!data.startDate) {
    return {
      valid: false,
      error: '시작일이 필요합니다'
    }
  }

  const startDate = new Date(data.startDate)
  if (isNaN(startDate.getTime())) {
    return {
      valid: false,
      error: '유효하지 않은 시작일 형식입니다'
    }
  }

  // 종료일 검사 (선택적)
  if (data.endDate !== undefined && data.endDate !== null) {
    const endDate = new Date(data.endDate)

    if (isNaN(endDate.getTime())) {
      return {
        valid: false,
        error: '유효하지 않은 종료일 형식입니다'
      }
    }

    // 종료일이 시작일보다 이전인지 검사
    if (endDate < startDate) {
      return {
        valid: false,
        error: '종료일은 시작일보다 이후여야 합니다'
      }
    }

    // 일정 기간이 1년을 초과하는지 검사
    const diffDays = (endDate - startDate) / (1000 * 60 * 60 * 24)
    if (diffDays > 365) {
      return {
        valid: false,
        error: '일정 기간은 최대 1년까지 설정 가능합니다'
      }
    }
  }

  return { valid: true }
}

/**
 * 채팅 메시지 유효성 검사
 *
 * @param {Object} data - 메시지 데이터
 * @param {string} data.message - 메시지 내용
 * @returns {Object} 검사 결과
 *
 * @example
 * validateChatMessage({ message: '안녕하세요!' })
 * // { valid: true }
 */
export function validateChatMessage(data) {
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      error: '유효하지 않은 데이터 형식입니다'
    }
  }

  // 메시지 검사
  if (!data.message || typeof data.message !== 'string') {
    return {
      valid: false,
      error: '메시지가 필요합니다'
    }
  }

  if (data.message.trim().length === 0) {
    return {
      valid: false,
      error: '메시지를 입력해주세요'
    }
  }

  if (data.message.length > 2000) {
    return {
      valid: false,
      error: '메시지는 최대 2,000자까지 입력 가능합니다'
    }
  }

  // XSS 방지
  const dangerousTags = /<script|<iframe|<object|<embed|onerror=|onload=/i
  if (dangerousTags.test(data.message)) {
    return {
      valid: false,
      error: '허용되지 않는 HTML 태그가 포함되어 있습니다'
    }
  }

  return { valid: true }
}

/**
 * 페이지네이션 파라미터 유효성 검사
 *
 * @param {Object} params - 페이지네이션 파라미터
 * @param {number} params.page - 페이지 번호 (1부터 시작)
 * @param {number} params.limit - 페이지당 항목 수
 * @returns {Object} 검사 결과
 *
 * @example
 * validatePagination({ page: 1, limit: 10 })
 * // { valid: true }
 */
export function validatePagination(params) {
  if (!params || typeof params !== 'object') {
    return {
      valid: false,
      error: '유효하지 않은 데이터 형식입니다'
    }
  }

  // page 검사
  if (params.page !== undefined) {
    const page = Number(params.page)

    if (isNaN(page) || !Number.isInteger(page)) {
      return {
        valid: false,
        error: 'page는 정수여야 합니다'
      }
    }

    if (page < 1) {
      return {
        valid: false,
        error: 'page는 1 이상이어야 합니다'
      }
    }

    if (page > 1000) {
      return {
        valid: false,
        error: 'page는 최대 1000까지 가능합니다'
      }
    }
  }

  // limit 검사
  if (params.limit !== undefined) {
    const limit = Number(params.limit)

    if (isNaN(limit) || !Number.isInteger(limit)) {
      return {
        valid: false,
        error: 'limit는 정수여야 합니다'
      }
    }

    if (limit < 1) {
      return {
        valid: false,
        error: 'limit는 1 이상이어야 합니다'
      }
    }

    if (limit > 100) {
      return {
        valid: false,
        error: 'limit는 최대 100까지 가능합니다'
      }
    }
  }

  return { valid: true }
}

/**
 * studyId 유효성 검사
 *
 * @param {string|number} studyId - 스터디 ID
 * @returns {Object} 검사 결과
 *
 * @example
 * validateStudyId('123') // { valid: true, studyId: 123 }
 * validateStudyId('abc') // { valid: false, error: '...' }
 */
export function validateStudyId(studyId) {
  if (!studyId) {
    return {
      valid: false,
      error: 'studyId가 제공되지 않았습니다'
    }
  }

  const id = Number(studyId)

  if (isNaN(id) || !Number.isInteger(id)) {
    return {
      valid: false,
      error: 'studyId는 정수여야 합니다'
    }
  }

  if (id < 1) {
    return {
      valid: false,
      error: 'studyId는 1 이상이어야 합니다'
    }
  }

  return {
    valid: true,
    studyId: id
  }
}

/**
 * 여러 검증을 한 번에 수행
 *
 * @param {Object} validations - 검증 함수와 데이터 쌍
 * @returns {Object} 검사 결과
 *
 * @example
 * const result = validateMultiple({
 *   role: () => validateRole(userRole),
 *   filter: () => validateFilter(filterValue),
 *   notice: () => validateNoticeData(noticeData)
 * })
 *
 * if (!result.valid) {
 *   console.error(result.errors)
 * }
 */
export function validateMultiple(validations) {
  const errors = {}
  let hasError = false

  for (const [key, validationFn] of Object.entries(validations)) {
    const result = validationFn()

    if (!result.valid) {
      errors[key] = result.error
      hasError = true
    }
  }

  return {
    valid: !hasError,
    errors: hasError ? errors : null
  }
}

