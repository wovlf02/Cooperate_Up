/**
 * study-validators.js
 *
 * Study 도메인의 통합 검증 시스템
 * StudyException 클래스를 활용한 체계적인 검증
 *
 * @module lib/validators/study-validators
 * @author CoUp Team
 * @created 2025-12-01
 */

import {
  StudyValidationException,
  StudyPermissionException,
  StudyMemberException,
  StudyApplicationException,
  StudyBusinessException,
  StudyFileException,
  StudyFeatureException
} from '@/lib/exceptions/study';

// ============================================
// 상수 정의
// ============================================

const VALID_CATEGORIES = ['programming', 'language', 'design', 'business', 'hobby', 'etc'];
const VALID_ROLES = ['OWNER', 'ADMIN', 'MEMBER'];
const VALID_MEMBER_STATUS = ['PENDING', 'ACTIVE', 'LEFT', 'KICKED'];
const VALID_APPLICATION_STATUS = ['PENDING', 'APPROVED', 'REJECTED'];
const VALID_TASK_STATUS = ['TODO', 'IN_PROGRESS', 'DONE'];
const VALID_EVENT_TYPES = ['MEETING', 'DEADLINE', 'MILESTONE', 'OTHER'];

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const VALID_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  ...VALID_IMAGE_TYPES
];

// ============================================
// 1. 스터디 생성 검증
// ============================================

/**
 * 스터디 생성 데이터 검증
 *
 * @param {Object} data - 스터디 생성 데이터
 * @param {string} userId - 생성자 ID
 * @returns {Object} 검증된 데이터
 * @throws {StudyValidationException}
 *
 * @example
 * const validated = validateStudyCreate({
 *   name: '알고리즘 스터디',
 *   description: '매주 알고리즘 문제를 풀어보는 스터디입니다',
 *   category: 'programming',
 *   maxMembers: 10
 * }, userId);
 */
export function validateStudyCreate(data, userId) {
  // 사용자 ID 검증
  if (!userId) {
    throw StudyValidationException.userIdMissing();
  }

  // 스터디 이름 검증
  if (!data.name) {
    throw StudyValidationException.studyNameMissing();
  }

  const trimmedName = data.name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 50) {
    throw StudyValidationException.invalidStudyNameLength(trimmedName, { min: 2, max: 50 });
  }

  // 설명 검증
  if (!data.description) {
    throw StudyValidationException.studyDescriptionMissing();
  }

  const trimmedDescription = data.description.trim();
  if (trimmedDescription.length < 10 || trimmedDescription.length > 500) {
    throw StudyValidationException.invalidDescriptionLength(trimmedDescription, { min: 10, max: 500 });
  }

  // 카테고리 검증
  if (!data.category) {
    throw StudyValidationException.categoryMissing();
  }

  if (!VALID_CATEGORIES.includes(data.category)) {
    throw StudyValidationException.invalidCategory(data.category, VALID_CATEGORIES);
  }

  // 최대 인원 검증
  const maxMembers = data.maxMembers ?? 10;
  if (typeof maxMembers !== 'number' || maxMembers < 2 || maxMembers > 100) {
    throw StudyValidationException.invalidMaxMembers(maxMembers, { min: 2, max: 100 });
  }

  // 이미지 URL 검증 (선택)
  if (data.imageUrl) {
    try {
      new URL(data.imageUrl);
    } catch {
      throw StudyValidationException.invalidImageUrl(data.imageUrl);
    }
  }

  // 시작일/종료일 검증 (선택)
  if (data.startDate) {
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      throw StudyValidationException.invalidDateFormat(data.startDate, 'startDate');
    }
    if (startDate < new Date()) {
      throw StudyValidationException.invalidStartDate(data.startDate);
    }
  }

  if (data.endDate) {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      throw StudyValidationException.invalidDateFormat(data.endDate, 'endDate');
    }

    if (data.startDate) {
      const startDate = new Date(data.startDate);
      if (endDate <= startDate) {
        throw StudyValidationException.endDateBeforeStartDate(data.startDate, data.endDate);
      }
    }
  }

  return {
    name: trimmedName,
    description: trimmedDescription,
    category: data.category,
    maxMembers,
    isRecruiting: data.isRecruiting !== false,
    autoApprove: data.autoApprove === true,
    imageUrl: data.imageUrl || null,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null
  };
}

// ============================================
// 2. 스터디 수정 검증
// ============================================

/**
 * 스터디 수정 데이터 검증
 *
 * @param {Object} data - 스터디 수정 데이터
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 수정자 ID
 * @returns {Object} 검증된 데이터
 * @throws {StudyValidationException}
 *
 * @example
 * const validated = validateStudyUpdate({
 *   name: '개선된 알고리즘 스터디',
 *   maxMembers: 15
 * }, studyId, userId);
 */
export function validateStudyUpdate(data, studyId, userId) {
  // ID 검증
  if (!studyId) {
    throw StudyValidationException.studyIdMissing();
  }

  if (!userId) {
    throw StudyValidationException.userIdMissing();
  }

  const validatedData = {};

  // 수정할 필드가 없는 경우
  if (Object.keys(data).length === 0) {
    throw StudyValidationException.noFieldsToUpdate();
  }

  // 이름 검증 (선택)
  if (data.name !== undefined) {
    if (!data.name || data.name.trim() === '') {
      throw StudyValidationException.studyNameMissing();
    }

    const trimmedName = data.name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      throw StudyValidationException.invalidStudyNameLength(trimmedName, { min: 2, max: 50 });
    }
    validatedData.name = trimmedName;
  }

  // 설명 검증 (선택)
  if (data.description !== undefined) {
    if (!data.description || data.description.trim() === '') {
      throw StudyValidationException.studyDescriptionMissing();
    }

    const trimmedDescription = data.description.trim();
    if (trimmedDescription.length < 10 || trimmedDescription.length > 500) {
      throw StudyValidationException.invalidDescriptionLength(trimmedDescription, { min: 10, max: 500 });
    }
    validatedData.description = trimmedDescription;
  }

  // 카테고리 검증 (선택)
  if (data.category !== undefined) {
    if (!VALID_CATEGORIES.includes(data.category)) {
      throw StudyValidationException.invalidCategory(data.category, VALID_CATEGORIES);
    }
    validatedData.category = data.category;
  }

  // 최대 인원 검증 (선택)
  if (data.maxMembers !== undefined) {
    if (typeof data.maxMembers !== 'number' || data.maxMembers < 2 || data.maxMembers > 100) {
      throw StudyValidationException.invalidMaxMembers(data.maxMembers, { min: 2, max: 100 });
    }
    validatedData.maxMembers = data.maxMembers;
  }

  // 모집 상태 검증 (선택)
  if (data.isRecruiting !== undefined) {
    validatedData.isRecruiting = Boolean(data.isRecruiting);
  }

  // 자동 승인 검증 (선택)
  if (data.autoApprove !== undefined) {
    validatedData.autoApprove = Boolean(data.autoApprove);
  }

  // 이미지 URL 검증 (선택)
  if (data.imageUrl !== undefined) {
    if (data.imageUrl) {
      try {
        new URL(data.imageUrl);
        validatedData.imageUrl = data.imageUrl;
      } catch {
        throw StudyValidationException.invalidImageUrl(data.imageUrl);
      }
    } else {
      validatedData.imageUrl = null;
    }
  }

  return validatedData;
}

// ============================================
// 3. 멤버 액션 검증
// ============================================

/**
 * 멤버 액션 검증 (강퇴, 역할 변경 등)
 *
 * @param {Object} params - 검증 파라미터
 * @param {string} params.studyId - 스터디 ID
 * @param {string} params.actorId - 액션 실행자 ID
 * @param {string} params.targetId - 대상 멤버 ID
 * @param {string} params.action - 액션 타입 (kick, changeRole, leave 등)
 * @param {string} [params.newRole] - 새 역할 (changeRole 시)
 * @throws {StudyValidationException|StudyPermissionException}
 *
 * @example
 * validateMemberAction({
 *   studyId,
 *   actorId: userId,
 *   targetId: memberId,
 *   action: 'kick'
 * });
 */
export function validateMemberAction({ studyId, actorId, targetId, action, newRole }) {
  // 필수 필드 검증
  if (!studyId) {
    throw StudyValidationException.studyIdMissing();
  }

  if (!actorId) {
    throw StudyValidationException.userIdMissing();
  }

  if (!targetId) {
    throw StudyMemberException.memberIdMissing(studyId);
  }

  // 자기 자신에 대한 액션 검증
  if (action === 'kick' && actorId === targetId) {
    throw StudyMemberException.cannotKickSelf(actorId, studyId);
  }

  // 역할 변경 시 새 역할 검증
  if (action === 'changeRole') {
    if (!newRole) {
      throw StudyValidationException.roleMissing();
    }

    if (!VALID_ROLES.includes(newRole)) {
      throw StudyValidationException.invalidRole(newRole, VALID_ROLES);
    }

    // OWNER로 변경 불가
    if (newRole === 'OWNER') {
      throw StudyPermissionException.cannotAssignOwnerRole(actorId);
    }
  }

  // 유효한 액션 검증
  const validActions = ['kick', 'changeRole', 'leave'];
  if (!validActions.includes(action)) {
    throw StudyValidationException.invalidMemberAction(action, validActions);
  }

  return true;
}

// ============================================
// 4. 가입 신청 검증
// ============================================

/**
 * 가입 신청 검증
 *
 * @param {Object} params - 검증 파라미터
 * @param {string} params.studyId - 스터디 ID
 * @param {string} params.userId - 사용자 ID
 * @param {string} [params.message] - 신청 메시지
 * @throws {StudyValidationException|StudyApplicationException}
 *
 * @example
 * validateApplicationAction({
 *   studyId,
 *   userId,
 *   message: '열심히 참여하겠습니다!'
 * });
 */
export function validateApplicationAction({ studyId, userId, message, action, applicationId }) {
  // 필수 필드 검증
  if (!studyId) {
    throw StudyValidationException.studyIdMissing();
  }

  if (!userId) {
    throw StudyValidationException.userIdMissing();
  }

  // 신청 메시지 검증 (선택)
  if (message !== undefined && message !== null) {
    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 200) {
      throw StudyValidationException.applicationMessageTooLong(message, 200);
    }
  }

  // 신청 처리 액션 검증
  if (action) {
    const validActions = ['approve', 'reject', 'cancel'];
    if (!validActions.includes(action)) {
      throw StudyValidationException.invalidApplicationAction(action, validActions);
    }

    // 신청 ID 필수
    if (!applicationId) {
      throw StudyApplicationException.applicationIdMissing(studyId, userId);
    }
  }

  return true;
}

// ============================================
// 5. 파일 업로드 검증
// ============================================

// ============================================
// 6. 공지사항 검증
// ============================================

/**
 * 공지사항 생성/수정 검증
 *
 * @param {Object} data - 공지사항 데이터
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 작성자 ID
 * @throws {StudyValidationException}
 *
 * @example
 * validateNotice({
 *   title: '첫 모임 안내',
 *   content: '다음 주 토요일에 첫 모임이 있습니다.'
 * }, studyId, userId);
 */
export function validateNotice(data, studyId, userId) {
  // ID 검증
  if (!studyId) {
    throw StudyValidationException.studyIdMissing();
  }

  if (!userId) {
    throw StudyValidationException.userIdMissing();
  }

  // 제목 검증
  if (!data.title) {
    throw StudyFeatureException.noticeTitleMissing(studyId);
  }

  const trimmedTitle = data.title.trim();
  if (trimmedTitle.length < 2 || trimmedTitle.length > 100) {
    throw StudyFeatureException.invalidNoticeTitleLength(trimmedTitle, { min: 2, max: 100 });
  }

  // 내용 검증
  if (!data.content) {
    throw StudyFeatureException.noticeContentMissing(studyId);
  }

  const trimmedContent = data.content.trim();
  if (trimmedContent.length < 10 || trimmedContent.length > 2000) {
    throw StudyFeatureException.invalidNoticeContentLength(trimmedContent, { min: 10, max: 2000 });
  }

  return {
    title: trimmedTitle,
    content: trimmedContent,
    isPinned: data.isPinned === true
  };
}

// ============================================
// 7. 할일 검증
// ============================================

/**
 * 할일 생성/수정 검증
 *
 * @param {Object} data - 할일 데이터
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 작성자 ID
 * @throws {StudyValidationException}
 *
 * @example
 * validateTask({
 *   title: '1주차 과제',
 *   description: '알고리즘 5문제 풀기',
 *   dueDate: '2025-12-08',
 *   status: 'TODO'
 * }, studyId, userId);
 */
export function validateTask(data, studyId, userId) {
  // ID 검증
  if (!studyId) {
    throw StudyValidationException.studyIdMissing();
  }

  if (!userId) {
    throw StudyValidationException.userIdMissing();
  }

  // 제목 검증
  if (!data.title) {
    throw StudyFeatureException.taskTitleMissing(studyId);
  }

  const trimmedTitle = data.title.trim();
  if (trimmedTitle.length < 2 || trimmedTitle.length > 100) {
    throw StudyFeatureException.invalidTaskTitleLength(trimmedTitle, { min: 2, max: 100 });
  }

  const validatedData = {
    title: trimmedTitle
  };

  // 설명 검증 (선택)
  if (data.description) {
    const trimmedDescription = data.description.trim();
    if (trimmedDescription.length > 1000) {
      throw StudyFeatureException.taskDescriptionTooLong(trimmedDescription, 1000);
    }
    validatedData.description = trimmedDescription;
  }

  // 마감일 검증 (선택)
  if (data.dueDate) {
    const dueDate = new Date(data.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw StudyValidationException.invalidDateFormat(data.dueDate, 'dueDate');
    }
    validatedData.dueDate = dueDate;
  }

  // 상태 검증 (선택)
  if (data.status) {
    if (!VALID_TASK_STATUS.includes(data.status)) {
      throw StudyFeatureException.invalidTaskStatus(data.status, VALID_TASK_STATUS);
    }
    validatedData.status = data.status;
  }

  return validatedData;
}

// ============================================
// 8. 메시지 검증
// ============================================

/**
 * 메시지 생성 검증
 *
 * @param {Object} data - 메시지 데이터
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 작성자 ID
 * @throws {StudyValidationException}
 *
 * @example
 * validateMessage({
 *   content: '안녕하세요! 스터디 잘 부탁드립니다.'
 * }, studyId, userId);
 */
export function validateMessage(data, studyId, userId) {
  // ID 검증
  if (!studyId) {
    throw StudyValidationException.studyIdMissing();
  }

  if (!userId) {
    throw StudyValidationException.userIdMissing();
  }

  // 내용 검증
  if (!data.content) {
    throw StudyFeatureException.messageContentMissing(studyId, userId);
  }

  const trimmedContent = data.content.trim();
  if (trimmedContent.length === 0) {
    throw StudyFeatureException.messageContentMissing(studyId, userId);
  }

  if (trimmedContent.length > 1000) {
    throw StudyFeatureException.messageContentTooLong(trimmedContent, 1000);
  }

  return {
    content: trimmedContent
  };
}

// ============================================
// 9. 일정 검증
// ============================================

/**
 * 일정 생성/수정 검증
 *
 * @param {Object} data - 일정 데이터
 * @param {string} studyId - 스터디 ID
 * @param {string} userId - 작성자 ID
 * @throws {StudyValidationException}
 *
 * @example
 * validateEvent({
 *   title: '주간 모임',
 *   description: '이번 주 진행 상황 공유',
 *   startDate: '2025-12-08T14:00:00',
 *   endDate: '2025-12-08T16:00:00',
 *   eventType: 'MEETING'
 * }, studyId, userId);
 */
export function validateEvent(data, studyId, userId) {
  // ID 검증
  if (!studyId) {
    throw StudyValidationException.studyIdMissing();
  }

  if (!userId) {
    throw StudyValidationException.userIdMissing();
  }

  // 제목 검증
  if (!data.title) {
    throw StudyFeatureException.eventTitleMissing(studyId);
  }

  const trimmedTitle = data.title.trim();
  if (trimmedTitle.length < 2 || trimmedTitle.length > 100) {
    throw StudyFeatureException.invalidEventTitleLength(trimmedTitle, { min: 2, max: 100 });
  }

  // 시작일 검증
  if (!data.startDate) {
    throw StudyFeatureException.eventStartDateMissing(studyId);
  }

  const startDate = new Date(data.startDate);
  if (isNaN(startDate.getTime())) {
    throw StudyValidationException.invalidDateFormat(data.startDate, 'startDate');
  }

  // 종료일 검증 (선택)
  let endDate = null;
  if (data.endDate) {
    endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      throw StudyValidationException.invalidDateFormat(data.endDate, 'endDate');
    }

    if (endDate <= startDate) {
      throw StudyValidationException.endDateBeforeStartDate(data.startDate, data.endDate);
    }
  }

  const validatedData = {
    title: trimmedTitle,
    startDate
  };

  if (endDate) {
    validatedData.endDate = endDate;
  }

  // 설명 검증 (선택)
  if (data.description) {
    const trimmedDescription = data.description.trim();
    if (trimmedDescription.length > 1000) {
      throw StudyFeatureException.eventDescriptionTooLong(trimmedDescription, 1000);
    }
    validatedData.description = trimmedDescription;
  }

  // 일정 타입 검증 (선택)
  if (data.eventType) {
    if (!VALID_EVENT_TYPES.includes(data.eventType)) {
      throw StudyFeatureException.invalidEventType(data.eventType, VALID_EVENT_TYPES);
    }
    validatedData.eventType = data.eventType;
  }

  // 장소 검증 (선택)
  if (data.location) {
    const trimmedLocation = data.location.trim();
    if (trimmedLocation.length > 200) {
      throw StudyFeatureException.eventLocationTooLong(trimmedLocation, 200);
    }
    validatedData.location = trimmedLocation;
  }

  return validatedData;
}

// ============================================
// 유틸리티 검증 함수
// ============================================

/**
 * 페이지네이션 검증
 *
 * @param {Object} params - 페이지네이션 파라미터
 * @param {number} [params.page=1] - 페이지 번호
 * @param {number} [params.limit=10] - 페이지당 항목 수
 * @returns {Object} 검증된 페이지네이션 파라미터
 * @throws {StudyValidationException}
 */
export function validatePagination({ page = 1, limit = 10 } = {}) {
  const pageNum = Number(page);
  const limitNum = Number(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    throw StudyValidationException.invalidPageNumber(page);
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw StudyValidationException.invalidPageLimit(limit, { min: 1, max: 100 });
  }

  return {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum,
    take: limitNum
  };
}

/**
 * 정렬 옵션 검증
 *
 * @param {Object} params - 정렬 파라미터
 * @param {string} [params.sortBy='createdAt'] - 정렬 기준 필드
 * @param {string} [params.order='desc'] - 정렬 순서 (asc, desc)
 * @param {string[]} validFields - 유효한 정렬 필드 목록
 * @returns {Object} 검증된 정렬 옵션
 * @throws {StudyValidationException}
 */
export function validateSortOptions({ sortBy = 'createdAt', order = 'desc' } = {}, validFields = []) {
  // 정렬 필드 검증
  if (validFields.length > 0 && !validFields.includes(sortBy)) {
    throw StudyValidationException.invalidSortField(sortBy, validFields);
  }

  // 정렬 순서 검증
  const validOrders = ['asc', 'desc'];
  if (!validOrders.includes(order.toLowerCase())) {
    throw StudyValidationException.invalidSortOrder(order, validOrders);
  }

  return {
    sortBy,
    order: order.toLowerCase()
  };
}

/**
 * 검색 및 필터 파라미터 검증
 *
 * @param {Object} query - 쿼리 파라미터 객체
 * @returns {Object} 검증된 필터 파라미터
 * @throws {StudyValidationException}
 */
export function validateSearchQuery(query = {}) {
  const result = {
    category: query.category || null,
    search: null,
    isRecruiting: query.isRecruiting === 'true',
    sortBy: query.sortBy || 'latest',
    isPublic: query.isPublic !== 'false'
  };

  // 검색어 검증 (선택사항)
  if (query.search) {
    const trimmedQuery = query.search.trim();

    if (trimmedQuery.length < 2) {
      throw StudyValidationException.searchQueryTooShort(trimmedQuery, 2);
    }

    if (trimmedQuery.length > 100) {
      throw StudyValidationException.searchQueryTooLong(trimmedQuery, 100);
    }

    result.search = trimmedQuery;
  }

  // 카테고리 검증 (선택사항)
  if (result.category && result.category !== 'all' && !VALID_CATEGORIES.includes(result.category)) {
    throw StudyValidationException.invalidCategory(result.category, VALID_CATEGORIES);
  }

  return result;
}

/**
 * 가입 신청 데이터 검증
 *
 * @param {Object} data - 가입 신청 데이터
 * @param {string} data.message - 신청 메시지
 * @returns {Object} 검증된 데이터
 * @throws {StudyApplicationException}
 */
export function validateApplicationData(data) {
  if (!data.message || typeof data.message !== 'string') {
    throw StudyApplicationException.applicationMessageMissing();
  }

  const trimmedMessage = data.message.trim();

  if (trimmedMessage.length < 10) {
    throw StudyApplicationException.applicationMessageTooShort(trimmedMessage, 10);
  }

  if (trimmedMessage.length > 500) {
    throw StudyApplicationException.applicationMessageTooLong(trimmedMessage, 500);
  }

  return {
    message: trimmedMessage
  };
}

/**
 * 공지사항 데이터 검증
 *
 * @param {Object} data - 공지사항 데이터
 * @param {string} data.title - 제목
 * @param {string} data.content - 내용
 * @returns {Object} 검증된 데이터
 * @throws {StudyNoticeException}
 */
export function validateNoticeData(data) {
  if (!data.title || typeof data.title !== 'string') {
    throw StudyNoticeException.titleRequired();
  }

  const trimmedTitle = data.title.trim();
  if (trimmedTitle.length === 0) {
    throw StudyNoticeException.titleRequired();
  }

  if (trimmedTitle.length > 100) {
    throw StudyNoticeException.titleTooLong(trimmedTitle.length, 100);
  }

  if (!data.content || typeof data.content !== 'string') {
    throw StudyNoticeException.contentRequired();
  }

  const trimmedContent = data.content.trim();
  if (trimmedContent.length === 0) {
    throw StudyNoticeException.contentRequired();
  }

  return {
    title: trimmedTitle,
    content: trimmedContent,
    isPinned: data.isPinned || false
  };
}

/**
 * 파일 업로드 데이터 검증
 *
 * @param {Object} file - 파일 객체
 * @param {number} file.size - 파일 크기
 * @param {string} file.type - 파일 타입
 * @param {string} file.name - 파일명
 * @returns {Object} 검증된 데이터
 * @throws {StudyFileException}
 */
export function validateFileUpload(file) {
  if (!file) {
    throw StudyFileException.fileRequired();
  }

  if (!file.name) {
    throw StudyFileException.fileRequired();
  }

  if (file.size > FILE_SIZE_LIMIT) {
    throw StudyFileException.fileSizeTooLarge(file.size, FILE_SIZE_LIMIT);
  }

  if (file.type && !VALID_FILE_TYPES.includes(file.type)) {
    throw StudyFileException.invalidFileType(file.type, VALID_FILE_TYPES);
  }

  return {
    name: file.name,
    size: file.size,
    type: file.type
  };
}

// Export 상수
export {
  VALID_CATEGORIES,
  VALID_ROLES,
  VALID_MEMBER_STATUS,
  VALID_APPLICATION_STATUS,
  VALID_TASK_STATUS,
  VALID_EVENT_TYPES,
  FILE_SIZE_LIMIT,
  VALID_IMAGE_TYPES,
  VALID_FILE_TYPES
};

// Export function aliases for backward compatibility
// validateNoticeData는 파일 중간에 이미 export된 함수 사용
// validateApplicationData는 파일 중간에 이미 export된 함수 사용

