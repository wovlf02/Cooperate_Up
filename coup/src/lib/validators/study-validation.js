/**
 * study-validation.js
 *
 * 스터디 관련 유효성 검증 함수 모음
 * Zod를 사용하지 않고 순수 JavaScript로 구현
 *
 * 사용 예시:
 * ```js
 * import { validateStudyCreate, validateStudyUpdate } from '@/lib/validators/study-validation'
 *
 * const validation = validateStudyCreate(requestData)
 * if (!validation.success) {
 *   return NextResponse.json({ error: validation.error }, { status: 400 })
 * }
 * ```
 *
 * @module lib/validators/study-validation
 */

import { VALID_CATEGORIES, VALID_ROLES, VALID_MEMBER_STATUS } from '@/lib/exceptions/study-errors'

// ============================================
// 기본 검증 헬퍼 함수
// ============================================

/**
 * 문자열 길이 검증
 */
function validateStringLength(value, min, max, fieldName) {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName}은(는) 문자열이어야 합니다` }
  }

  const trimmed = value.trim()

  if (trimmed.length < min) {
    return { valid: false, error: `${fieldName}은(는) 최소 ${min}자 이상이어야 합니다` }
  }

  if (trimmed.length > max) {
    return { valid: false, error: `${fieldName}은(는) 최대 ${max}자 이하여야 합니다` }
  }

  return { valid: true, value: trimmed }
}

/**
 * 숫자 범위 검증
 */
function validateNumberRange(value, min, max, fieldName) {
  const num = Number(value)

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName}은(는) 숫자여야 합니다` }
  }

  if (num < min || num > max) {
    return { valid: false, error: `${fieldName}은(는) ${min}에서 ${max} 사이여야 합니다` }
  }

  return { valid: true, value: num }
}

/**
 * 열거형 검증
 */
function validateEnum(value, allowedValues, fieldName) {
  if (!allowedValues.includes(value)) {
    return {
      valid: false,
      error: `${fieldName}은(는) 다음 중 하나여야 합니다: ${allowedValues.join(', ')}`
    }
  }

  return { valid: true, value }
}

/**
 * 날짜 검증
 */
function validateDate(value, fieldName) {
  const date = new Date(value)

  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName}의 날짜 형식이 올바르지 않습니다` }
  }

  return { valid: true, value: date }
}

/**
 * URL 검증
 */
function validateUrl(value, fieldName) {
  try {
    new URL(value)
    return { valid: true, value }
  } catch {
    return { valid: false, error: `${fieldName}의 URL 형식이 올바르지 않습니다` }
  }
}

/**
 * 이메일 검증
 */
function validateEmail(value, fieldName) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(value)) {
    return { valid: false, error: `${fieldName}의 이메일 형식이 올바르지 않습니다` }
  }

  return { valid: true, value }
}

// ============================================
// 스터디 CRUD 검증
// ============================================

/**
 * 스터디 생성 데이터 검증
 *
 * @param {Object} data - 스터디 생성 데이터
 * @returns {Object} { success: boolean, data?: Object, errors?: Array }
 *
 * @example
 * const result = validateStudyCreate({
 *   name: '알고리즘 스터디',
 *   description: '코딩테스트 준비 스터디',
 *   maxMembers: 10,
 *   category: 'IT'
 * })
 */
export function validateStudyCreate(data) {
  const errors = []
  const validatedData = {}

  // 1. 이름 검증 (필수, 2-50자)
  if (!data.name) {
    errors.push({ field: 'name', message: '스터디 이름은 필수입니다' })
  } else {
    const nameValidation = validateStringLength(data.name, 2, 50, '스터디 이름')
    if (!nameValidation.valid) {
      errors.push({ field: 'name', message: nameValidation.error })
    } else {
      validatedData.name = nameValidation.value
    }
  }

  // 2. 설명 검증 (필수, 10-500자)
  if (!data.description) {
    errors.push({ field: 'description', message: '스터디 설명은 필수입니다' })
  } else {
    const descValidation = validateStringLength(data.description, 10, 500, '스터디 설명')
    if (!descValidation.valid) {
      errors.push({ field: 'description', message: descValidation.error })
    } else {
      validatedData.description = descValidation.value
    }
  }

  // 3. 최대 인원 검증 (선택, 2-100명, 기본값: 10)
  const maxMembers = data.maxMembers ?? 10
  const maxMembersValidation = validateNumberRange(maxMembers, 2, 100, '최대 인원')
  if (!maxMembersValidation.valid) {
    errors.push({ field: 'maxMembers', message: maxMembersValidation.error })
  } else {
    validatedData.maxMembers = maxMembersValidation.value
  }

  // 4. 카테고리 검증 (필수)
  if (!data.category) {
    errors.push({ field: 'category', message: '카테고리는 필수입니다' })
  } else {
    const categoryValidation = validateEnum(data.category, VALID_CATEGORIES, '카테고리')
    if (!categoryValidation.valid) {
      errors.push({ field: 'category', message: categoryValidation.error })
    } else {
      validatedData.category = categoryValidation.value
    }
  }

  // 5. 모집 상태 검증 (선택, 기본값: true)
  validatedData.isRecruiting = data.isRecruiting !== false

  // 6. 자동 승인 검증 (선택, 기본값: false)
  validatedData.autoApprove = data.autoApprove === true

  // 7. 이미지 URL 검증 (선택)
  if (data.imageUrl) {
    const urlValidation = validateUrl(data.imageUrl, '이미지 URL')
    if (!urlValidation.valid) {
      errors.push({ field: 'imageUrl', message: urlValidation.error })
    } else {
      validatedData.imageUrl = urlValidation.value
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: validatedData }
}

/**
 * 스터디 수정 데이터 검증
 *
 * @param {Object} data - 스터디 수정 데이터
 * @returns {Object} { success: boolean, data?: Object, errors?: Array }
 */
export function validateStudyUpdate(data) {
  const errors = []
  const validatedData = {}

  // 수정 시에는 모든 필드가 선택적

  // 1. 이름 검증 (선택, 2-50자)
  if (data.name !== undefined) {
    if (data.name === null || data.name === '') {
      errors.push({ field: 'name', message: '스터디 이름은 비워둘 수 없습니다' })
    } else {
      const nameValidation = validateStringLength(data.name, 2, 50, '스터디 이름')
      if (!nameValidation.valid) {
        errors.push({ field: 'name', message: nameValidation.error })
      } else {
        validatedData.name = nameValidation.value
      }
    }
  }

  // 2. 설명 검증 (선택, 10-500자)
  if (data.description !== undefined) {
    if (data.description === null || data.description === '') {
      errors.push({ field: 'description', message: '스터디 설명은 비워둘 수 없습니다' })
    } else {
      const descValidation = validateStringLength(data.description, 10, 500, '스터디 설명')
      if (!descValidation.valid) {
        errors.push({ field: 'description', message: descValidation.error })
      } else {
        validatedData.description = descValidation.value
      }
    }
  }

  // 3. 최대 인원 검증 (선택, 2-100명)
  if (data.maxMembers !== undefined) {
    const maxMembersValidation = validateNumberRange(data.maxMembers, 2, 100, '최대 인원')
    if (!maxMembersValidation.valid) {
      errors.push({ field: 'maxMembers', message: maxMembersValidation.error })
    } else {
      validatedData.maxMembers = maxMembersValidation.value
    }
  }

  // 4. 카테고리 검증 (선택)
  if (data.category !== undefined) {
    if (data.category === null || data.category === '') {
      errors.push({ field: 'category', message: '카테고리는 비워둘 수 없습니다' })
    } else {
      const categoryValidation = validateEnum(data.category, VALID_CATEGORIES, '카테고리')
      if (!categoryValidation.valid) {
        errors.push({ field: 'category', message: categoryValidation.error })
      } else {
        validatedData.category = categoryValidation.value
      }
    }
  }

  // 5. 모집 상태 검증 (선택)
  if (data.isRecruiting !== undefined) {
    validatedData.isRecruiting = Boolean(data.isRecruiting)
  }

  // 6. 자동 승인 검증 (선택)
  if (data.autoApprove !== undefined) {
    validatedData.autoApprove = Boolean(data.autoApprove)
  }

  // 7. 이미지 URL 검증 (선택)
  if (data.imageUrl !== undefined && data.imageUrl !== null && data.imageUrl !== '') {
    const urlValidation = validateUrl(data.imageUrl, '이미지 URL')
    if (!urlValidation.valid) {
      errors.push({ field: 'imageUrl', message: urlValidation.error })
    } else {
      validatedData.imageUrl = urlValidation.value
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  // 수정할 필드가 없는 경우
  if (Object.keys(validatedData).length === 0) {
    return { success: false, errors: [{ field: '_general', message: '수정할 내용이 없습니다' }] }
  }

  return { success: true, data: validatedData }
}

// ============================================
// 멤버 관리 검증
// ============================================

/**
 * 역할 변경 데이터 검증
 */
export function validateRoleChange(data) {
  const errors = []

  if (!data.role) {
    errors.push({ field: 'role', message: '역할은 필수입니다' })
  } else {
    const roleValidation = validateEnum(data.role, VALID_ROLES, '역할')
    if (!roleValidation.valid) {
      errors.push({ field: 'role', message: roleValidation.error })
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: { role: data.role } }
}

/**
 * 멤버 강퇴 데이터 검증
 */
export function validateMemberKick(data) {
  const errors = []
  const validatedData = {}

  // 강퇴 사유 (선택, 최대 200자)
  if (data.reason) {
    const reasonValidation = validateStringLength(data.reason, 1, 200, '강퇴 사유')
    if (!reasonValidation.valid) {
      errors.push({ field: 'reason', message: reasonValidation.error })
    } else {
      validatedData.reason = reasonValidation.value
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: validatedData }
}

// ============================================
// 가입 요청 검증
// ============================================

/**
 * 가입 거절 데이터 검증
 */
export function validateJoinReject(data) {
  const errors = []
  const validatedData = {}

  // 거절 사유 (선택, 최대 200자)
  if (data.reason) {
    const reasonValidation = validateStringLength(data.reason, 1, 200, '거절 사유')
    if (!reasonValidation.valid) {
      errors.push({ field: 'reason', message: reasonValidation.error })
    } else {
      validatedData.reason = reasonValidation.value
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: validatedData }
}

// ============================================
// 공지 검증
// ============================================

/**
 * 공지 생성/수정 데이터 검증
 */
export function validateNotice(data, isUpdate = false) {
  const errors = []
  const validatedData = {}

  // 1. 제목 검증 (필수 또는 선택, 2-100자)
  if (!isUpdate || data.title !== undefined) {
    if (!data.title && !isUpdate) {
      errors.push({ field: 'title', message: '공지 제목은 필수입니다' })
    } else if (data.title) {
      const titleValidation = validateStringLength(data.title, 2, 100, '공지 제목')
      if (!titleValidation.valid) {
        errors.push({ field: 'title', message: titleValidation.error })
      } else {
        validatedData.title = titleValidation.value
      }
    }
  }

  // 2. 내용 검증 (필수 또는 선택, 10-5000자)
  if (!isUpdate || data.content !== undefined) {
    if (!data.content && !isUpdate) {
      errors.push({ field: 'content', message: '공지 내용은 필수입니다' })
    } else if (data.content) {
      const contentValidation = validateStringLength(data.content, 10, 5000, '공지 내용')
      if (!contentValidation.valid) {
        errors.push({ field: 'content', message: contentValidation.error })
      } else {
        validatedData.content = contentValidation.value
      }
    }
  }

  // 3. 고정 여부 검증 (선택)
  if (data.isPinned !== undefined) {
    validatedData.isPinned = Boolean(data.isPinned)
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: validatedData }
}

// ============================================
// 파일 검증
// ============================================

/**
 * 파일 메타데이터 검증
 */
export function validateFile(file) {
  const errors = []

  // 1. 파일 존재 확인
  if (!file) {
    errors.push({ field: 'file', message: '파일을 선택해주세요' })
    return { success: false, errors }
  }

  // 2. 파일 크기 확인 (최대 50MB)
  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  if (file.size > MAX_FILE_SIZE) {
    errors.push({
      field: 'file',
      message: `파일 크기는 50MB를 초과할 수 없습니다 (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
    })
  }

  // 3. 파일 이름 길이 확인 (최대 255자)
  if (file.name && file.name.length > 255) {
    errors.push({ field: 'file', message: '파일 이름은 255자를 초과할 수 없습니다' })
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return {
    success: true,
    data: {
      name: file.name,
      size: file.size,
      type: file.type
    }
  }
}

/**
 * 파일 타입 검증
 */
export function validateFileType(filename, allowedExtensions) {
  const ext = filename.split('.').pop()?.toLowerCase()

  if (!ext || !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `허용되지 않은 파일 형식입니다. 허용: ${allowedExtensions.join(', ')}`
    }
  }

  return { valid: true, extension: ext }
}

/**
 * 일반 파일 타입 허용 목록
 */
export const ALLOWED_FILE_TYPES = {
  documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'hwp'],
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  archives: ['zip', 'rar', '7z'],
  code: ['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json']
}

/**
 * 모든 허용된 파일 타입
 */
export const ALL_ALLOWED_FILE_TYPES = [
  ...ALLOWED_FILE_TYPES.documents,
  ...ALLOWED_FILE_TYPES.images,
  ...ALLOWED_FILE_TYPES.archives,
  ...ALLOWED_FILE_TYPES.code
]

// ============================================
// 할일 검증
// ============================================

/**
 * 할일 생성/수정 데이터 검증
 */
export function validateTask(data, isUpdate = false) {
  const errors = []
  const validatedData = {}

  // 1. 제목 검증 (필수 또는 선택, 2-100자)
  if (!isUpdate || data.title !== undefined) {
    if (!data.title && !isUpdate) {
      errors.push({ field: 'title', message: '할일 제목은 필수입니다' })
    } else if (data.title) {
      const titleValidation = validateStringLength(data.title, 2, 100, '할일 제목')
      if (!titleValidation.valid) {
        errors.push({ field: 'title', message: titleValidation.error })
      } else {
        validatedData.title = titleValidation.value
      }
    }
  }

  // 2. 설명 검증 (선택, 최대 1000자)
  if (data.description !== undefined && data.description !== null && data.description !== '') {
    const descValidation = validateStringLength(data.description, 0, 1000, '할일 설명')
    if (!descValidation.valid) {
      errors.push({ field: 'description', message: descValidation.error })
    } else {
      validatedData.description = descValidation.value
    }
  }

  // 3. 마감일 검증 (선택, 미래 날짜)
  if (data.dueDate !== undefined && data.dueDate !== null) {
    const dateValidation = validateDate(data.dueDate, '마감일')
    if (!dateValidation.valid) {
      errors.push({ field: 'dueDate', message: dateValidation.error })
    } else {
      // 과거 날짜 확인
      const now = new Date()
      if (dateValidation.value < now) {
        errors.push({ field: 'dueDate', message: '마감일은 현재보다 미래여야 합니다' })
      } else {
        validatedData.dueDate = dateValidation.value
      }
    }
  }

  // 4. 우선순위 검증 (선택, LOW/MEDIUM/HIGH)
  if (data.priority !== undefined) {
    const priorityValidation = validateEnum(
      data.priority,
      ['LOW', 'MEDIUM', 'HIGH'],
      '우선순위'
    )
    if (!priorityValidation.valid) {
      errors.push({ field: 'priority', message: priorityValidation.error })
    } else {
      validatedData.priority = priorityValidation.value
    }
  }

  // 5. 상태 검증 (선택, TODO/IN_PROGRESS/DONE)
  if (data.status !== undefined) {
    const statusValidation = validateEnum(
      data.status,
      ['TODO', 'IN_PROGRESS', 'DONE'],
      '상태'
    )
    if (!statusValidation.valid) {
      errors.push({ field: 'status', message: statusValidation.error })
    } else {
      validatedData.status = statusValidation.value
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: validatedData }
}

// ============================================
// 채팅 검증
// ============================================

/**
 * 메시지 전송 데이터 검증
 */
export function validateMessage(data) {
  const errors = []
  const validatedData = {}

  // 1. 내용 또는 파일 중 하나는 필수
  if (!data.content && !data.fileUrl) {
    errors.push({
      field: '_general',
      message: '메시지 내용 또는 파일 중 하나는 필수입니다'
    })
  }

  // 2. 내용 검증 (선택, 1-2000자)
  if (data.content) {
    const contentValidation = validateStringLength(data.content, 1, 2000, '메시지 내용')
    if (!contentValidation.valid) {
      errors.push({ field: 'content', message: contentValidation.error })
    } else {
      validatedData.content = contentValidation.value
    }
  }

  // 3. 파일 URL 검증 (선택)
  if (data.fileUrl) {
    validatedData.fileUrl = data.fileUrl
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: validatedData }
}

// ============================================
// 일정 검증
// ============================================

/**
 * 일정 생성/수정 데이터 검증
 */
export function validateEvent(data, isUpdate = false) {
  const errors = []
  const validatedData = {}

  // 1. 제목 검증 (필수 또는 선택, 2-100자)
  if (!isUpdate || data.title !== undefined) {
    if (!data.title && !isUpdate) {
      errors.push({ field: 'title', message: '일정 제목은 필수입니다' })
    } else if (data.title) {
      const titleValidation = validateStringLength(data.title, 2, 100, '일정 제목')
      if (!titleValidation.valid) {
        errors.push({ field: 'title', message: titleValidation.error })
      } else {
        validatedData.title = titleValidation.value
      }
    }
  }

  // 2. 설명 검증 (선택, 최대 500자)
  if (data.description !== undefined && data.description !== null && data.description !== '') {
    const descValidation = validateStringLength(data.description, 0, 500, '일정 설명')
    if (!descValidation.valid) {
      errors.push({ field: 'description', message: descValidation.error })
    } else {
      validatedData.description = descValidation.value
    }
  }

  // 3. 시작 시간 검증 (필수 또는 선택)
  if (!isUpdate || data.startTime !== undefined) {
    if (!data.startTime && !isUpdate) {
      errors.push({ field: 'startTime', message: '시작 시간은 필수입니다' })
    } else if (data.startTime) {
      const startValidation = validateDate(data.startTime, '시작 시간')
      if (!startValidation.valid) {
        errors.push({ field: 'startTime', message: startValidation.error })
      } else {
        validatedData.startTime = startValidation.value
      }
    }
  }

  // 4. 종료 시간 검증 (필수 또는 선택)
  if (!isUpdate || data.endTime !== undefined) {
    if (!data.endTime && !isUpdate) {
      errors.push({ field: 'endTime', message: '종료 시간은 필수입니다' })
    } else if (data.endTime) {
      const endValidation = validateDate(data.endTime, '종료 시간')
      if (!endValidation.valid) {
        errors.push({ field: 'endTime', message: endValidation.error })
      } else {
        validatedData.endTime = endValidation.value
      }
    }
  }

  // 5. 시간 순서 검증 (시작 < 종료)
  if (validatedData.startTime && validatedData.endTime) {
    if (validatedData.startTime >= validatedData.endTime) {
      errors.push({
        field: 'endTime',
        message: '종료 시간은 시작 시간보다 늦어야 합니다'
      })
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: validatedData }
}

// ============================================
// 페이지네이션 검증
// ============================================

/**
 * 페이지네이션 파라미터 검증
 */
export function validatePagination(params) {
  const errors = []
  const validatedData = {
    page: 1,
    limit: 20
  }

  // 페이지 번호 검증 (최소 1)
  if (params.page !== undefined) {
    const pageValidation = validateNumberRange(params.page, 1, 1000, '페이지')
    if (!pageValidation.valid) {
      errors.push({ field: 'page', message: pageValidation.error })
    } else {
      validatedData.page = pageValidation.value
    }
  }

  // 페이지 크기 검증 (1-100)
  if (params.limit !== undefined) {
    const limitValidation = validateNumberRange(params.limit, 1, 100, '페이지 크기')
    if (!limitValidation.valid) {
      errors.push({ field: 'limit', message: limitValidation.error })
    } else {
      validatedData.limit = limitValidation.value
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: validatedData }
}

/**
 * 정렬 파라미터 검증
 */
export function validateSort(params, allowedFields) {
  const errors = []
  const validatedData = {}

  // 정렬 필드 검증
  if (params.sortBy !== undefined) {
    if (!allowedFields.includes(params.sortBy)) {
      errors.push({
        field: 'sortBy',
        message: `정렬 필드는 다음 중 하나여야 합니다: ${allowedFields.join(', ')}`
      })
    } else {
      validatedData.sortBy = params.sortBy
    }
  }

  // 정렬 방향 검증
  if (params.sortOrder !== undefined) {
    const orderValidation = validateEnum(params.sortOrder, ['asc', 'desc'], '정렬 방향')
    if (!orderValidation.valid) {
      errors.push({ field: 'sortOrder', message: orderValidation.error })
    } else {
      validatedData.sortOrder = orderValidation.value
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true, data: validatedData }
}

