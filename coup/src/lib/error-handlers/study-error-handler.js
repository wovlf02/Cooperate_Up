/**
 * Study 도메인 에러 핸들러
 *
 * API 에러를 사용자 친화적인 메시지로 변환
 */

/**
 * Study 에러 메시지 매핑
 * 백엔드 에러 코드를 사용자 친화적 메시지로 변환
 */
export const STUDY_ERROR_MESSAGES = {
  // === Creation & Validation Errors ===
  'STUDY_NAME_REQUIRED': '스터디 이름을 입력해주세요',
  'STUDY_NAME_TOO_SHORT': '스터디 이름은 최소 2자 이상이어야 합니다',
  'STUDY_NAME_TOO_LONG': '스터디 이름은 최대 50자까지 가능합니다',
  'STUDY_NAME_INVALID_CHARS': '스터디 이름에 특수문자는 사용할 수 없습니다',
  'STUDY_NAME_DUPLICATE': '이미 사용 중인 스터디 이름입니다',

  'INVALID_CATEGORY': '올바른 카테고리를 선택해주세요',
  'CATEGORY_REQUIRED': '카테고리를 선택해주세요',
  'SUBCATEGORY_REQUIRED': '하위 카테고리를 선택해주세요',
  'SUBCATEGORY_NOT_IN_CATEGORY': '선택한 하위 카테고리가 카테고리에 속하지 않습니다',

  'DESCRIPTION_TOO_SHORT': '스터디 설명은 최소 10자 이상 입력해주세요',
  'DESCRIPTION_TOO_LONG': '스터디 설명은 최대 2000자까지 가능합니다',
  'DESCRIPTION_REQUIRED': '스터디 설명을 입력해주세요',

  'MAX_MEMBERS_TOO_SMALL': '최소 2명 이상으로 설정해주세요',
  'MAX_MEMBERS_TOO_LARGE': '최대 100명까지 설정할 수 있습니다',
  'MAX_MEMBERS_INVALID': '정원은 숫자로 입력해주세요',

  'TAGS_TOO_MANY': '태그는 최대 10개까지 추가할 수 있습니다',
  'TAG_TOO_LONG': '태그는 최대 20자까지 가능합니다',
  'TAG_INVALID_CHARS': '태그에 특수문자는 사용할 수 없습니다',

  'START_DATE_IN_PAST': '시작일은 현재 날짜 이후로 설정해주세요',
  'END_DATE_BEFORE_START': '종료일은 시작일 이후로 설정해주세요',
  'INVALID_DATE_FORMAT': '올바른 날짜 형식으로 입력해주세요',

  'EMOJI_REQUIRED': '이모지를 선택해주세요',
  'INVALID_EMOJI': '올바른 이모지를 선택해주세요',

  // === Member Management Errors ===
  'ADMIN_PERMISSION_REQUIRED': '이 작업은 관리자 권한이 필요합니다',
  'OWNER_PERMISSION_REQUIRED': '이 작업은 스터디장만 수행할 수 있습니다',
  'INSUFFICIENT_PERMISSION': '이 작업을 수행할 권한이 없습니다',
  'CANNOT_MODIFY_SELF_ROLE': '본인의 역할은 변경할 수 없습니다',
  'CANNOT_REMOVE_SELF': '본인은 제거할 수 없습니다',
  'CANNOT_DEMOTE_HIGHER_ROLE': '본인보다 높은 역할의 멤버는 변경할 수 없습니다',
  'CANNOT_PROMOTE_ABOVE_SELF': '본인의 역할보다 높게 승격할 수 없습니다',

  'MEMBER_NOT_FOUND': '멤버를 찾을 수 없습니다',
  'ALREADY_MEMBER': '이미 스터디 멤버입니다',
  'NOT_MEMBER': '스터디 멤버가 아닙니다',
  'USER_ALREADY_LEFT': '이미 탈퇴한 멤버입니다',
  'USER_BANNED': '강퇴된 사용자는 다시 가입할 수 없습니다',
  'USER_SUSPENDED': '정지된 사용자는 스터디에 참여할 수 없습니다',

  'INVALID_ROLE': '올바른 역할을 선택해주세요',
  'ROLE_REQUIRED': '역할을 선택해주세요',
  'ONLY_ONE_OWNER_ALLOWED': '스터디장은 1명만 지정할 수 있습니다',
  'OWNER_MUST_TRANSFER': '스터디장은 역할을 이전한 후 변경할 수 있습니다',

  'CANNOT_REMOVE_OWNER': '스터디장은 제거할 수 없습니다',
  'CANNOT_REMOVE_LAST_ADMIN': '최소 1명의 관리자가 필요합니다',
  'MEMBER_HAS_PENDING_TASKS': '진행 중인 할일이 있는 멤버는 제거할 수 없습니다',
  'MEMBER_IS_TASK_ASSIGNEE': '할일 담당자는 제거할 수 없습니다',

  // === Application & Join Errors ===
  'STUDY_FULL': '스터디 정원이 가득 찼습니다',
  'STUDY_NOT_RECRUITING': '현재 모집을 진행하지 않는 스터디입니다',
  'STUDY_ENDED': '이미 종료된 스터디입니다',
  'STUDY_NOT_PUBLIC': '비공개 스터디는 초대를 통해서만 가입할 수 있습니다',

  'APPLICATION_ALREADY_EXISTS': '이미 가입 신청을 하셨습니다',
  'APPLICATION_NOT_FOUND': '가입 신청을 찾을 수 없습니다',
  'APPLICATION_ALREADY_PROCESSED': '이미 처리된 가입 신청입니다',
  'APPLICATION_ALREADY_APPROVED': '이미 승인된 가입 신청입니다',
  'APPLICATION_ALREADY_REJECTED': '이미 거절된 가입 신청입니다',
  'APPLICATION_EXPIRED': '만료된 가입 신청입니다',

  'CANNOT_APPLY_TWICE': '이미 가입 신청을 하셨습니다',
  'CANNOT_APPLY_AS_MEMBER': '이미 스터디 멤버입니다',
  'CANNOT_APPLY_AFTER_BAN': '강퇴된 스터디에는 다시 신청할 수 없습니다',
  'MUST_WAIT_BEFORE_REAPPLY': '일정 시간이 지난 후 다시 신청해주세요',

  'MESSAGE_TOO_SHORT': '가입 메시지는 최소 10자 이상 입력해주세요',
  'MESSAGE_TOO_LONG': '가입 메시지는 최대 500자까지 가능합니다',
  'MESSAGE_REQUIRED': '가입 메시지를 입력해주세요 (자동 승인 스터디 제외)',

  // === Business Logic Errors ===
  'STUDY_NOT_FOUND': '스터디를 찾을 수 없습니다',
  'STUDY_DELETED': '삭제된 스터디입니다',
  'STUDY_ARCHIVED': '보관된 스터디입니다',
  'STUDY_SUSPENDED': '정지된 스터디입니다',

  'CANNOT_DELETE_WITH_ACTIVE_MEMBERS': '활동 중인 멤버가 있는 스터디는 삭제할 수 없습니다',
  'CANNOT_DELETE_WITH_PENDING_TASKS': '진행 중인 할일이 있는 스터디는 삭제할 수 없습니다',
  'CANNOT_EDIT_ENDED_STUDY': '종료된 스터디는 수정할 수 없습니다',
  'CANNOT_REDUCE_MAX_MEMBERS': '현재 멤버 수보다 적게 정원을 설정할 수 없습니다',
  'CANNOT_CHANGE_CATEGORY_WITH_TASKS': '진행 중인 할일이 있을 때는 카테고리를 변경할 수 없습니다',

  'MUST_BE_MEMBER_TO_LEAVE': '멤버만 탈퇴할 수 있습니다',
  'OWNER_CANNOT_LEAVE': '스터디장은 탈퇴할 수 없습니다. 먼저 역할을 이전해주세요',
  'CANNOT_LEAVE_WITH_PENDING_TASKS': '진행 중인 할일이 있으면 탈퇴할 수 없습니다',
  'CANNOT_LEAVE_AS_TASK_ASSIGNEE': '할일 담당자는 탈퇴할 수 없습니다',

  // === File Management Errors ===
  'FILE_TOO_LARGE': '파일 크기는 최대 10MB까지 가능합니다',
  'INVALID_FILE_TYPE': '지원하지 않는 파일 형식입니다',
  'FILE_UPLOAD_FAILED': '파일 업로드에 실패했습니다',
  'FILE_NOT_FOUND': '파일을 찾을 수 없습니다',
  'FILE_ALREADY_EXISTS': '같은 이름의 파일이 이미 존재합니다',
  'STORAGE_QUOTA_EXCEEDED': '스터디 저장 공간이 부족합니다',
  'TOO_MANY_FILES': '파일 개수 제한을 초과했습니다',
  'CANNOT_DELETE_REFERENCED_FILE': '다른 곳에서 참조 중인 파일은 삭제할 수 없습니다',

  // === Notice Errors ===
  'NOTICE_NOT_FOUND': '공지사항을 찾을 수 없습니다',
  'NOTICE_TITLE_REQUIRED': '공지사항 제목을 입력해주세요',
  'NOTICE_TITLE_TOO_LONG': '제목은 최대 100자까지 가능합니다',
  'NOTICE_CONTENT_REQUIRED': '공지사항 내용을 입력해주세요',
  'NOTICE_CONTENT_TOO_LONG': '내용은 최대 5000자까지 가능합니다',

  // === Task Errors ===
  'TASK_NOT_FOUND': '할일을 찾을 수 없습니다',
  'TASK_TITLE_REQUIRED': '할일 제목을 입력해주세요',
  'TASK_TITLE_TOO_LONG': '제목은 최대 100자까지 가능합니다',
  'TASK_ALREADY_COMPLETED': '이미 완료된 할일입니다',
  'INVALID_ASSIGNEE': '존재하지 않는 담당자입니다',
  'ASSIGNEE_NOT_MEMBER': '스터디 멤버만 할일 담당자로 지정할 수 있습니다',

  // === Generic Errors ===
  'INVALID_INPUT': '입력값이 올바르지 않습니다',
  'MISSING_REQUIRED_FIELD': '필수 입력값이 누락되었습니다',
  'VALIDATION_ERROR': '입력값 검증에 실패했습니다',
  'DATABASE_ERROR': '데이터베이스 오류가 발생했습니다',
  'INTERNAL_SERVER_ERROR': '서버 오류가 발생했습니다',
  'UNAUTHORIZED': '로그인이 필요합니다',
  'FORBIDDEN': '접근 권한이 없습니다',
};

/**
 * Study 도메인 에러 핸들러
 * @param {Error} error - API 에러 객체
 * @returns {Object} - { message, field, type, action }
 */
export function handleStudyError(error) {
  // Axios 에러인 경우
  if (error.response) {
    const response = error.response.data || {};
    const errorCode = response.errorCode || response.error || 'UNKNOWN_ERROR';
    const field = response.field || response.details?.field;

    return {
      message: STUDY_ERROR_MESSAGES[errorCode] || response.message || '오류가 발생했습니다',
      field: field,
      type: errorCode,
      action: getErrorAction(errorCode),
      originalError: error,
    };
  }

  // fetch 에러인 경우
  if (error.message) {
    return {
      message: error.message,
      type: 'CLIENT_ERROR',
      action: null,
      originalError: error,
    };
  }

  // 기타 에러
  return {
    message: '알 수 없는 오류가 발생했습니다',
    type: 'UNKNOWN_ERROR',
    action: null,
    originalError: error,
  };
}

/**
 * 에러 타입에 따른 권장 액션 반환
 * @param {string} errorCode - 에러 코드
 * @returns {Object|null} - { label, action }
 */
function getErrorAction(errorCode) {
  const actions = {
    'STUDY_FULL': { label: '대기 목록 등록', action: 'waitlist' },
    'STUDY_NOT_RECRUITING': { label: '알림 설정', action: 'notify' },
    'ADMIN_PERMISSION_REQUIRED': { label: '관리자에게 문의', action: 'contact' },
    'USER_BANNED': { label: '관리자에게 문의', action: 'contact' },
    'APPLICATION_ALREADY_EXISTS': { label: '신청 현황 보기', action: 'viewApplication' },
    'ALREADY_MEMBER': { label: '스터디로 이동', action: 'goToStudy' },
    'OWNER_CANNOT_LEAVE': { label: '역할 이전하기', action: 'transferRole' },
    'CANNOT_DELETE_WITH_ACTIVE_MEMBERS': { label: '멤버 관리', action: 'manageMembers' },
  };

  return actions[errorCode] || null;
}

/**
 * 에러 심각도 반환
 * @param {string} errorCode - 에러 코드
 * @returns {string} - 'error' | 'warning' | 'info'
 */
export function getErrorSeverity(errorCode) {
  const errorSeverities = [
    'DATABASE_ERROR',
    'INTERNAL_SERVER_ERROR',
    'FILE_UPLOAD_FAILED',
  ];

  const warningSeverities = [
    'STUDY_FULL',
    'STUDY_NOT_RECRUITING',
    'APPLICATION_ALREADY_EXISTS',
  ];

  if (errorSeverities.includes(errorCode)) return 'error';
  if (warningSeverities.includes(errorCode)) return 'warning';
  return 'info';
}

/**
 * 필드 에러를 폼 에러 객체로 변환
 * @param {Array} errors - 에러 배열
 * @returns {Object} - { field: errorMessage }
 */
export function mapFieldErrors(errors) {
  if (!Array.isArray(errors)) return {};

  return errors.reduce((acc, error) => {
    if (error.field) {
      acc[error.field] = error.message || '입력값이 올바르지 않습니다';
    }
    return acc;
  }, {});
}

/**
 * 에러가 특정 타입인지 확인
 * @param {Error} error - 에러 객체
 * @param {string} errorCode - 확인할 에러 코드
 * @returns {boolean}
 */
export function isErrorType(error, errorCode) {
  const handled = handleStudyError(error);
  return handled.type === errorCode;
}

/**
 * 재시도 가능한 에러인지 확인
 * @param {string} errorCode - 에러 코드
 * @returns {boolean}
 */
export function isRetryableError(errorCode) {
  const retryableErrors = [
    'DATABASE_ERROR',
    'INTERNAL_SERVER_ERROR',
    'FILE_UPLOAD_FAILED',
  ];

  return retryableErrors.includes(errorCode);
}

/**
 * 사용자 입력 에러인지 확인
 * @param {string} errorCode - 에러 코드
 * @returns {boolean}
 */
export function isUserInputError(errorCode) {
  return errorCode.includes('REQUIRED') ||
         errorCode.includes('TOO_SHORT') ||
         errorCode.includes('TOO_LONG') ||
         errorCode.includes('INVALID') ||
         errorCode.includes('TOO_MANY') ||
         errorCode.includes('TOO_LARGE');
}

export default {
  handleStudyError,
  getErrorSeverity,
  getErrorAction,
  mapFieldErrors,
  isErrorType,
  isRetryableError,
  isUserInputError,
  STUDY_ERROR_MESSAGES,
};

