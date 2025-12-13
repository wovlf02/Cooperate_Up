/**
 * study-errors.js
 *
 * 스터디 관련 통일된 에러 처리
 *
 * 사용 예시:
 * ```js
 * import { STUDY_ERRORS, createStudyErrorResponse, logStudyError } from '@/lib/exceptions/study-errors'
 *
 * // 에러 응답 생성
 * return NextResponse.json(
 *   createStudyErrorResponse('STUDY_NOT_FOUND'),
 *   { status: 404 }
 * )
 *
 * // 에러 로깅
 * logStudyError('스터디 생성', error, { userId, studyData })
 * ```
 *
 * @module lib/exceptions/study-errors
 */

/**
 * 스터디 관련 에러 코드 정의
 *
 * 각 에러는 다음 속성을 포함:
 * - code: 고유 에러 코드
 * - message: 사용자 친화적 메시지
 * - statusCode: HTTP 상태 코드
 */
export const STUDY_ERRORS = {
  // ============================================
  // 스터디 CRUD
  // ============================================

  STUDY_NOT_FOUND: {
    code: 'STUDY_NOT_FOUND',
    message: '스터디를 찾을 수 없습니다',
    statusCode: 404
  },

  INVALID_STUDY_NAME: {
    code: 'INVALID_STUDY_NAME',
    message: '스터디 이름은 2자 이상 50자 이하여야 합니다',
    statusCode: 400
  },

  INVALID_DESCRIPTION: {
    code: 'INVALID_DESCRIPTION',
    message: '스터디 설명은 10자 이상 500자 이하여야 합니다',
    statusCode: 400
  },

  INVALID_MAX_MEMBERS: {
    code: 'INVALID_MAX_MEMBERS',
    message: '최대 인원은 2명에서 100명 사이여야 합니다',
    statusCode: 400
  },

  INVALID_CATEGORY: {
    code: 'INVALID_CATEGORY',
    message: '유효하지 않은 카테고리입니다',
    statusCode: 400
  },

  DUPLICATE_STUDY_NAME: {
    code: 'DUPLICATE_STUDY_NAME',
    message: '이미 존재하는 스터디 이름입니다',
    statusCode: 409
  },

  STUDY_CREATE_FAILED: {
    code: 'STUDY_CREATE_FAILED',
    message: '스터디 생성에 실패했습니다',
    statusCode: 500
  },

  STUDY_UPDATE_FAILED: {
    code: 'STUDY_UPDATE_FAILED',
    message: '스터디 수정에 실패했습니다',
    statusCode: 500
  },

  STUDY_DELETE_FAILED: {
    code: 'STUDY_DELETE_FAILED',
    message: '스터디 삭제에 실패했습니다',
    statusCode: 500
  },

  // ============================================
  // 권한 관리
  // ============================================

  NOT_STUDY_MEMBER: {
    code: 'NOT_STUDY_MEMBER',
    message: '스터디 멤버가 아닙니다',
    statusCode: 403
  },

  INSUFFICIENT_PERMISSION: {
    code: 'INSUFFICIENT_PERMISSION',
    message: '권한이 부족합니다',
    statusCode: 403
  },

  NOT_STUDY_OWNER: {
    code: 'NOT_STUDY_OWNER',
    message: '스터디 소유자만 수행할 수 있습니다',
    statusCode: 403
  },

  NOT_STUDY_ADMIN: {
    code: 'NOT_STUDY_ADMIN',
    message: '스터디 관리자 권한이 필요합니다',
    statusCode: 403
  },

  // ============================================
  // 스터디 가입/탈퇴
  // ============================================

  STUDY_NOT_RECRUITING: {
    code: 'STUDY_NOT_RECRUITING',
    message: '현재 모집 중이 아닙니다',
    statusCode: 400
  },

  STUDY_FULL: {
    code: 'STUDY_FULL',
    message: '정원이 마감되었습니다',
    statusCode: 400
  },

  ALREADY_MEMBER: {
    code: 'ALREADY_MEMBER',
    message: '이미 가입된 스터디입니다',
    statusCode: 400
  },

  PENDING_APPROVAL: {
    code: 'PENDING_APPROVAL',
    message: '가입 승인 대기 중입니다',
    statusCode: 400
  },

  KICKED_MEMBER: {
    code: 'KICKED_MEMBER',
    message: '강퇴된 스터디입니다. 스터디장에게 문의하세요',
    statusCode: 403
  },

  LEFT_MEMBER_REJOIN: {
    code: 'LEFT_MEMBER_REJOIN',
    message: '이전에 탈퇴한 스터디입니다. 재가입하시겠습니까?',
    statusCode: 409
  },

  OWNER_CANNOT_LEAVE: {
    code: 'OWNER_CANNOT_LEAVE',
    message: '스터디장은 탈퇴할 수 없습니다. 스터디를 삭제하거나 소유권을 이전하세요',
    statusCode: 400
  },

  JOIN_REQUEST_FAILED: {
    code: 'JOIN_REQUEST_FAILED',
    message: '가입 신청에 실패했습니다',
    statusCode: 500
  },

  LEAVE_FAILED: {
    code: 'LEAVE_FAILED',
    message: '탈퇴 처리에 실패했습니다',
    statusCode: 500
  },

  // ============================================
  // 멤버 관리
  // ============================================

  MEMBER_NOT_FOUND: {
    code: 'MEMBER_NOT_FOUND',
    message: '멤버를 찾을 수 없습니다',
    statusCode: 404
  },

  CANNOT_KICK_SELF: {
    code: 'CANNOT_KICK_SELF',
    message: '자기 자신을 강퇴할 수 없습니다',
    statusCode: 400
  },

  CANNOT_KICK_OWNER: {
    code: 'CANNOT_KICK_OWNER',
    message: '스터디장을 강퇴할 수 없습니다',
    statusCode: 400
  },

  CANNOT_KICK_ADMIN: {
    code: 'CANNOT_KICK_ADMIN',
    message: '관리자는 다른 관리자를 강퇴할 수 없습니다',
    statusCode: 403
  },

  INVALID_ROLE: {
    code: 'INVALID_ROLE',
    message: '유효하지 않은 역할입니다',
    statusCode: 400
  },

  CANNOT_CHANGE_OWNER_ROLE: {
    code: 'CANNOT_CHANGE_OWNER_ROLE',
    message: '스터디장의 역할은 변경할 수 없습니다',
    statusCode: 400
  },

  ROLE_HIERARCHY_VIOLATION: {
    code: 'ROLE_HIERARCHY_VIOLATION',
    message: '자신보다 높거나 같은 권한의 멤버는 수정할 수 없습니다',
    statusCode: 403
  },

  MEMBER_UPDATE_FAILED: {
    code: 'MEMBER_UPDATE_FAILED',
    message: '멤버 정보 수정에 실패했습니다',
    statusCode: 500
  },

  MEMBER_KICK_FAILED: {
    code: 'MEMBER_KICK_FAILED',
    message: '멤버 강퇴에 실패했습니다',
    statusCode: 500
  },

  // ============================================
  // 가입 요청 관리
  // ============================================

  JOIN_REQUEST_NOT_FOUND: {
    code: 'JOIN_REQUEST_NOT_FOUND',
    message: '가입 요청을 찾을 수 없습니다',
    statusCode: 404
  },

  JOIN_REQUEST_ALREADY_PROCESSED: {
    code: 'JOIN_REQUEST_ALREADY_PROCESSED',
    message: '이미 처리된 가입 요청입니다',
    statusCode: 400
  },

  APPROVAL_FAILED: {
    code: 'APPROVAL_FAILED',
    message: '가입 승인에 실패했습니다',
    statusCode: 500
  },

  REJECTION_FAILED: {
    code: 'REJECTION_FAILED',
    message: '가입 거절에 실패했습니다',
    statusCode: 500
  },

  STUDY_FULL_ON_APPROVAL: {
    code: 'STUDY_FULL_ON_APPROVAL',
    message: '승인 처리 중 정원이 마감되었습니다',
    statusCode: 409
  },

  // ============================================
  // 파일 관리
  // ============================================

  FILE_NOT_PROVIDED: {
    code: 'FILE_NOT_PROVIDED',
    message: '파일을 선택해주세요',
    statusCode: 400
  },

  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    message: '파일 크기는 50MB를 초과할 수 없습니다',
    statusCode: 400
  },

  INVALID_FILE_TYPE: {
    code: 'INVALID_FILE_TYPE',
    message: '허용되지 않은 파일 형식입니다',
    statusCode: 400
  },

  MALICIOUS_FILE_DETECTED: {
    code: 'MALICIOUS_FILE_DETECTED',
    message: '악성 파일이 감지되었습니다',
    statusCode: 400
  },

  STORAGE_QUOTA_EXCEEDED: {
    code: 'STORAGE_QUOTA_EXCEEDED',
    message: '저장 공간이 부족합니다',
    statusCode: 507
  },

  FILE_UPLOAD_FAILED: {
    code: 'FILE_UPLOAD_FAILED',
    message: '파일 업로드에 실패했습니다',
    statusCode: 500
  },

  FILE_NOT_FOUND: {
    code: 'FILE_NOT_FOUND',
    message: '파일을 찾을 수 없습니다',
    statusCode: 404
  },

  FILE_DELETE_FAILED: {
    code: 'FILE_DELETE_FAILED',
    message: '파일 삭제에 실패했습니다',
    statusCode: 500
  },

  // ============================================
  // 공지 관리
  // ============================================

  NOTICE_NOT_FOUND: {
    code: 'NOTICE_NOT_FOUND',
    message: '공지를 찾을 수 없습니다',
    statusCode: 404
  },

  INVALID_NOTICE_TITLE: {
    code: 'INVALID_NOTICE_TITLE',
    message: '공지 제목은 2자 이상 100자 이하여야 합니다',
    statusCode: 400
  },

  INVALID_NOTICE_CONTENT: {
    code: 'INVALID_NOTICE_CONTENT',
    message: '공지 내용은 10자 이상 5000자 이하여야 합니다',
    statusCode: 400
  },

  NOTICE_PIN_LIMIT_EXCEEDED: {
    code: 'NOTICE_PIN_LIMIT_EXCEEDED',
    message: '고정 공지는 최대 3개까지만 가능합니다',
    statusCode: 400
  },

  // ============================================
  // 할일 관리
  // ============================================

  TASK_NOT_FOUND: {
    code: 'TASK_NOT_FOUND',
    message: '할일을 찾을 수 없습니다',
    statusCode: 404
  },

  INVALID_TASK_TITLE: {
    code: 'INVALID_TASK_TITLE',
    message: '할일 제목은 2자 이상 100자 이하여야 합니다',
    statusCode: 400
  },

  INVALID_DUE_DATE: {
    code: 'INVALID_DUE_DATE',
    message: '마감일은 현재보다 미래여야 합니다',
    statusCode: 400
  },

  ASSIGNEE_NOT_MEMBER: {
    code: 'ASSIGNEE_NOT_MEMBER',
    message: '담당자는 스터디 멤버여야 합니다',
    statusCode: 400
  },

  // ============================================
  // 채팅 관리
  // ============================================

  MESSAGE_NOT_FOUND: {
    code: 'MESSAGE_NOT_FOUND',
    message: '메시지를 찾을 수 없습니다',
    statusCode: 404
  },

  INVALID_MESSAGE_CONTENT: {
    code: 'INVALID_MESSAGE_CONTENT',
    message: '메시지는 1자 이상 2000자 이하여야 합니다',
    statusCode: 400
  },

  CANNOT_DELETE_OTHERS_MESSAGE: {
    code: 'CANNOT_DELETE_OTHERS_MESSAGE',
    message: '다른 사람의 메시지는 삭제할 수 없습니다',
    statusCode: 403
  },

  // ============================================
  // 일정 관리
  // ============================================

  EVENT_NOT_FOUND: {
    code: 'EVENT_NOT_FOUND',
    message: '일정을 찾을 수 없습니다',
    statusCode: 404
  },

  INVALID_EVENT_TITLE: {
    code: 'INVALID_EVENT_TITLE',
    message: '일정 제목은 2자 이상 100자 이하여야 합니다',
    statusCode: 400
  },

  INVALID_DATE_FORMAT: {
    code: 'INVALID_DATE_FORMAT',
    message: '날짜 형식이 올바르지 않습니다',
    statusCode: 400
  },

  INVALID_DATE_RANGE: {
    code: 'INVALID_DATE_RANGE',
    message: '종료 시간은 시작 시간보다 늦어야 합니다',
    statusCode: 400
  },

  // ============================================
  // 초대 관리
  // ============================================

  INVALID_INVITE_CODE: {
    code: 'INVALID_INVITE_CODE',
    message: '유효하지 않은 초대 코드입니다',
    statusCode: 400
  },

  INVITE_CODE_EXPIRED: {
    code: 'INVITE_CODE_EXPIRED',
    message: '만료된 초대 코드입니다',
    statusCode: 410
  },

  INVITE_CODE_GENERATION_FAILED: {
    code: 'INVITE_CODE_GENERATION_FAILED',
    message: '초대 코드 생성에 실패했습니다',
    statusCode: 500
  },

  // ============================================
  // 일반 에러
  // ============================================

  INVALID_REQUEST: {
    code: 'INVALID_REQUEST',
    message: '잘못된 요청입니다',
    statusCode: 400
  },

  MISSING_REQUIRED_FIELD: {
    code: 'MISSING_REQUIRED_FIELD',
    message: '필수 입력 항목이 누락되었습니다',
    statusCode: 400
  },

  DB_ERROR: {
    code: 'DB_ERROR',
    message: '데이터베이스 오류가 발생했습니다',
    statusCode: 500
  },

  TRANSACTION_FAILED: {
    code: 'TRANSACTION_FAILED',
    message: '트랜잭션 처리에 실패했습니다',
    statusCode: 500
  },

  NOTIFICATION_FAILED: {
    code: 'NOTIFICATION_FAILED',
    message: '알림 전송에 실패했습니다',
    statusCode: 500
  },

  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: '알 수 없는 오류가 발생했습니다',
    statusCode: 500
  }
}

/**
 * 스터디 에러 응답 객체 생성
 *
 * @param {string} errorKey - STUDY_ERRORS의 키
 * @param {string} [customMessage] - 사용자 정의 메시지 (선택)
 * @param {Object} [additionalData] - 추가 데이터 (선택)
 * @returns {Object} 에러 응답 객체
 *
 * @example
 * // 기본 사용
 * createStudyErrorResponse('STUDY_NOT_FOUND')
 * // => { code: 'STUDY_NOT_FOUND', message: '스터디를 찾을 수 없습니다', statusCode: 404 }
 *
 * @example
 * // 커스텀 메시지
 * createStudyErrorResponse('INVALID_CATEGORY', '허용된 카테고리: IT, 언어, 자격증')
 *
 * @example
 * // 추가 데이터
 * createStudyErrorResponse('STUDY_FULL', null, { currentMembers: 50, maxMembers: 50 })
 */
export function createStudyErrorResponse(errorKey, customMessage = null, additionalData = {}) {
  const error = STUDY_ERRORS[errorKey] || STUDY_ERRORS.UNKNOWN_ERROR

  return {
    success: false,
    error: {
      code: error.code,
      message: customMessage || error.message,
      ...additionalData
    },
    statusCode: error.statusCode
  }
}

/**
 * 스터디 에러 로깅 (구조화된 로그)
 *
 * @param {string} context - 에러 발생 컨텍스트 (예: '스터디 생성', '멤버 강퇴')
 * @param {Error} error - 에러 객체
 * @param {Object} [metadata] - 추가 메타데이터 (선택)
 *
 * @example
 * logStudyError('스터디 생성', error, {
 *   userId: session.user.id,
 *   studyName: name,
 *   category: category
 * })
 */
export function logStudyError(context, error, metadata = {}) {
  const logData = {
    level: 'ERROR',
    context: `[STUDY] ${context}`,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...metadata
  }

  // 프로덕션 환경에서는 외부 로깅 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // TODO: Sentry, DataDog, CloudWatch 등으로 전송
    console.error(JSON.stringify(logData))
  } else {
    // 개발 환경에서는 콘솔에 상세 출력
    console.error(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.error(`🔴 ${logData.context}`)
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.error(`📅 Time: ${logData.timestamp}`)
    console.error(`💬 Message: ${logData.message}`)

    if (Object.keys(metadata).length > 0) {
      console.error(`📊 Metadata:`, JSON.stringify(metadata, null, 2))
    }

    console.error(`📚 Stack:`, error.stack)
    console.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
  }
}

/**
 * Prisma 에러를 스터디 에러로 변환
 *
 * @param {Error} error - Prisma 에러 객체
 * @returns {Object} 변환된 에러 응답
 *
 * @example
 * try {
 *   await prisma.study.create({ data })
 * } catch (error) {
 *   const studyError = handlePrismaError(error)
 *   return NextResponse.json(studyError, { status: studyError.statusCode })
 * }
 */
export function handlePrismaError(error) {
  // Prisma 고유 제약 조건 위반 (P2002)
  if (error.code === 'P2002') {
    const target = error.meta?.target

    if (target?.includes('name')) {
      return createStudyErrorResponse('DUPLICATE_STUDY_NAME')
    }

    return createStudyErrorResponse('DB_ERROR', '중복된 데이터가 존재합니다')
  }

  // Prisma 레코드를 찾을 수 없음 (P2025)
  if (error.code === 'P2025') {
    return createStudyErrorResponse('STUDY_NOT_FOUND')
  }

  // Prisma 외래 키 제약 조건 위반 (P2003)
  if (error.code === 'P2003') {
    return createStudyErrorResponse('DB_ERROR', '참조 무결성 오류가 발생했습니다')
  }

  // Prisma 트랜잭션 실패 (P2034)
  if (error.code === 'P2034') {
    return createStudyErrorResponse('TRANSACTION_FAILED')
  }

  // 기타 Prisma 에러
  if (error.code?.startsWith('P')) {
    logStudyError('Prisma 에러', error, { prismaCode: error.code })
    return createStudyErrorResponse('DB_ERROR')
  }

  // 일반 에러
  return createStudyErrorResponse('UNKNOWN_ERROR')
}

/**
 * 에러 객체를 NextResponse로 변환
 *
 * @param {Object} errorResponse - createStudyErrorResponse 반환값
 * @returns {NextResponse} Next.js Response 객체
 *
 * @example
 * const error = createStudyErrorResponse('STUDY_NOT_FOUND')
 * return toNextResponse(error)
 */
export function toNextResponse(errorResponse) {
  const { NextResponse } = require('next/server')

  return NextResponse.json(
    {
      success: errorResponse.success,
      error: errorResponse.error
    },
    { status: errorResponse.statusCode }
  )
}

/**
 * 유효한 스터디 역할 목록
 */
export const VALID_ROLES = ['OWNER', 'ADMIN', 'MEMBER']

/**
 * 유효한 스터디 카테고리 목록
 */
export const VALID_CATEGORIES = [
  'IT',
  '언어',
  '자격증',
  '취업',
  '취미',
  '운동',
  '기타'
]

/**
 * 유효한 멤버 상태 목록
 */
export const VALID_MEMBER_STATUS = ['PENDING', 'ACTIVE', 'LEFT', 'KICKED']

