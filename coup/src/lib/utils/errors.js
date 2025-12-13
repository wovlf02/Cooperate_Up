// src/lib/utils/errors.js

// 커스텀 에러 클래스
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends AppError {
  constructor(message = '인증이 필요합니다') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message = '권한이 없습니다') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource = '리소스') {
    super(`${resource}를 찾을 수 없습니다`, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT_ERROR')
  }
}

// 에러 핸들러 헬퍼
export function handleError(error, defaultMessage = '오류가 발생했습니다') {
  console.error('Error:', error)

  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    }
  }

  if (error.name === 'ZodError') {
    return {
      message: error.errors[0].message,
      code: 'VALIDATION_ERROR',
      statusCode: 400
    }
  }

  if (error.code === 'P2002') {
    // Prisma unique constraint violation
    return {
      message: '이미 존재하는 데이터입니다',
      code: 'DUPLICATE_ERROR',
      statusCode: 409
    }
  }

  if (error.code === 'P2025') {
    // Prisma record not found
    return {
      message: '데이터를 찾을 수 없습니다',
      code: 'NOT_FOUND',
      statusCode: 404
    }
  }

  // 알 수 없는 에러
  return {
    message: process.env.NODE_ENV === 'production'
      ? defaultMessage
      : error.message,
    code: 'INTERNAL_ERROR',
    statusCode: 500
  }
}

