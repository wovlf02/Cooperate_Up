// src/lib/utils/response.js
import { NextResponse } from "next/server"
import { handleError } from "./errors"

/**
 * 성공 응답 헬퍼
 */
export function successResponse(data, message, statusCode = 200) {
  return NextResponse.json({
    success: true,
    ...(message && { message }),
    ...(data && { data })
  }, { status: statusCode })
}

/**
 * 생성 성공 응답
 */
export function createdResponse(data, message = '생성되었습니다') {
  return successResponse(data, message, 201)
}

/**
 * 에러 응답 헬퍼
 */
export function errorResponse(error, defaultMessage) {
  const errorInfo = handleError(error, defaultMessage)

  return NextResponse.json({
    success: false,
    error: errorInfo.message,
    code: errorInfo.code,
    ...(process.env.NODE_ENV === 'development' && error.stack && {
      stack: error.stack
    })
  }, { status: errorInfo.statusCode })
}

/**
 * 페이지네이션 응답
 */
export function paginatedResponse(data, pagination) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1
    }
  })
}

/**
 * 빈 응답 (204 No Content)
 */
export function noContentResponse() {
  return new NextResponse(null, { status: 204 })
}

