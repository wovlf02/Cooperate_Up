/**
 * my-studies-helpers.js
 *
 * my-studies 영역 공통 유틸리티 함수
 *
 * 사용 예시:
 * ```js
 * import { checkStudyAccess, getRoleBadge, getFilteredStudies } from '@/lib/my-studies-helpers'
 *
 * const hasAccess = checkStudyAccess(study, userId)
 * const badge = getRoleBadge(member.role)
 * const filtered = getFilteredStudies(studies, 'active')
 * ```
 *
 * @module lib/my-studies-helpers
 */

/**
 * 스터디 접근 권한 확인
 *
 * @param {Object} study - 스터디 객체
 * @param {number} userId - 사용자 ID
 * @returns {Object} 접근 권한 정보
 *
 * @example
 * const access = checkStudyAccess(study, userId)
 * if (!access.allowed) {
 *   console.error(access.reason)
 * }
 */
export function checkStudyAccess(study, userId) {
  // 스터디가 없음
  if (!study) {
    return {
      allowed: false,
      reason: 'STUDY_NOT_FOUND',
      message: '스터디를 찾을 수 없습니다'
    }
  }

  // 삭제된 스터디
  if (study.deletedAt) {
    return {
      allowed: false,
      reason: 'STUDY_DELETED',
      message: '삭제된 스터디입니다'
    }
  }

  // 사용자 ID가 없음
  if (!userId) {
    return {
      allowed: false,
      reason: 'UNAUTHORIZED',
      message: '로그인이 필요합니다'
    }
  }

  // myRole이 없음 (멤버가 아님)
  if (!study.myRole) {
    return {
      allowed: false,
      reason: 'NOT_MEMBER',
      message: '이 스터디의 멤버가 아닙니다'
    }
  }

  // PENDING 상태 (승인 대기)
  if (study.myRole === 'PENDING') {
    return {
      allowed: false,
      reason: 'PENDING_APPROVAL',
      message: '가입 승인 대기 중입니다',
      isPending: true
    }
  }

  // 접근 허용
  return {
    allowed: true,
    role: study.myRole
  }
}

/**
 * 탭 접근 권한 확인
 *
 * @param {string} tab - 탭 이름
 * @param {string} role - 사용자 역할 (OWNER, ADMIN, MEMBER, PENDING)
 * @returns {Object} 탭 접근 권한 정보
 *
 * @example
 * const tabAccess = checkTabPermission('settings', 'MEMBER')
 * if (!tabAccess.allowed) {
 *   console.error(tabAccess.message)
 * }
 */
export function checkTabPermission(tab, role) {
  // 탭별 최소 권한 요구사항
  const tabPermissions = {
    overview: ['OWNER', 'ADMIN', 'MEMBER'],      // 개요: 모든 멤버
    chat: ['OWNER', 'ADMIN', 'MEMBER'],          // 채팅: 모든 멤버
    notices: ['OWNER', 'ADMIN', 'MEMBER'],       // 공지: 모든 멤버
    files: ['OWNER', 'ADMIN', 'MEMBER'],         // 파일: 모든 멤버
    calendar: ['OWNER', 'ADMIN', 'MEMBER'],      // 캘린더: 모든 멤버
    tasks: ['OWNER', 'ADMIN', 'MEMBER'],         // 할일: 모든 멤버
    'video-call': ['OWNER', 'ADMIN', 'MEMBER'],  // 화상: 모든 멤버
    members: ['OWNER', 'ADMIN'],                 // 멤버: 관리자 이상
    settings: ['OWNER']                          // 설정: 소유자만
  }

  // 유효하지 않은 탭
  if (!tabPermissions[tab]) {
    return {
      allowed: false,
      reason: 'INVALID_TAB',
      message: '유효하지 않은 탭입니다'
    }
  }

  // PENDING 상태는 모든 탭 접근 불가
  if (role === 'PENDING') {
    return {
      allowed: false,
      reason: 'PENDING_APPROVAL',
      message: '가입 승인 후 이용 가능합니다'
    }
  }

  // 권한 확인
  const allowedRoles = tabPermissions[tab]
  if (!allowedRoles.includes(role)) {
    return {
      allowed: false,
      reason: 'INSUFFICIENT_PERMISSION',
      message: `이 탭은 ${allowedRoles.join(', ')} 권한이 필요합니다`,
      requiredRoles: allowedRoles,
      currentRole: role
    }
  }

  return {
    allowed: true,
    role
  }
}

/**
 * 스터디 목록 필터링 (안전)
 *
 * @param {Array} studies - 스터디 목록
 * @param {string} filter - 필터 옵션 ('all', 'active', 'admin', 'pending')
 * @returns {Array} 필터링된 스터디 목록
 *
 * @example
 * const activeStudies = getFilteredStudies(studies, 'active')
 * // OWNER, ADMIN, MEMBER만 포함
 */
export function getFilteredStudies(studies, filter = 'all') {
  if (!Array.isArray(studies)) {
    console.warn('[my-studies-helpers] studies가 배열이 아닙니다:', typeof studies)
    return []
  }

  if (studies.length === 0) {
    return []
  }

  try {
    switch (filter) {
      case 'all':
        // 모든 스터디 (삭제된 것 제외)
        return studies.filter(study =>
          study &&
          study.study &&
          !study.study.deletedAt
        )

      case 'active':
        // 참여중인 스터디 (OWNER, ADMIN, MEMBER)
        return studies.filter(study =>
          study &&
          study.study &&
          !study.study.deletedAt &&
          ['OWNER', 'ADMIN', 'MEMBER'].includes(study.role)
        )

      case 'admin':
        // 관리중인 스터디 (OWNER, ADMIN)
        return studies.filter(study =>
          study &&
          study.study &&
          !study.study.deletedAt &&
          ['OWNER', 'ADMIN'].includes(study.role)
        )

      case 'pending':
        // 대기중인 스터디 (PENDING)
        return studies.filter(study =>
          study &&
          study.study &&
          !study.study.deletedAt &&
          study.role === 'PENDING'
        )

      default:
        console.warn('[my-studies-helpers] 알 수 없는 필터:', filter)
        return studies.filter(study =>
          study &&
          study.study &&
          !study.study.deletedAt
        )
    }
  } catch (error) {
    console.error('[my-studies-helpers] 필터링 중 오류:', error)
    return []
  }
}

/**
 * 역할 배지 정보 생성 (에러 처리 포함)
 *
 * @param {string} role - 역할 (OWNER, ADMIN, MEMBER, PENDING)
 * @returns {Object} 배지 정보 (label, color, bgColor)
 *
 * @example
 * const badge = getRoleBadge('OWNER')
 * // { label: '소유자', color: '#fff', bgColor: '#8b5cf6' }
 */
export function getRoleBadge(role) {
  const badges = {
    OWNER: {
      label: '소유자',
      color: '#ffffff',
      bgColor: '#8b5cf6', // purple-500
      icon: '👑'
    },
    ADMIN: {
      label: '관리자',
      color: '#ffffff',
      bgColor: '#3b82f6', // blue-500
      icon: '⭐'
    },
    MEMBER: {
      label: '멤버',
      color: '#ffffff',
      bgColor: '#10b981', // green-500
      icon: '✓'
    },
    PENDING: {
      label: '대기중',
      color: '#ffffff',
      bgColor: '#f59e0b', // amber-500
      icon: '⏳'
    }
  }

  // 유효하지 않은 역할
  if (!role || !badges[role]) {
    console.warn('[my-studies-helpers] 알 수 없는 역할:', role)
    return {
      label: '알 수 없음',
      color: '#ffffff',
      bgColor: '#6b7280', // gray-500
      icon: '?'
    }
  }

  return badges[role]
}

/**
 * 스터디 통계 포맷팅 (안전)
 *
 * @param {Object} stats - 통계 객체
 * @returns {Object} 포맷팅된 통계
 *
 * @example
 * const formatted = formatStudyStats({
 *   attendance: 0.75,
 *   taskCompletion: 0.8,
 *   messages: 42,
 *   notices: 5,
 *   files: 10
 * })
 */
export function formatStudyStats(stats) {
  if (!stats || typeof stats !== 'object') {
    return {
      attendance: '0%',
      taskCompletion: '0%',
      messages: 0,
      notices: 0,
      files: 0
    }
  }

  try {
    return {
      // 출석률 (0~1 → 0%~100%)
      attendance: typeof stats.attendance === 'number'
        ? `${Math.round(stats.attendance * 100)}%`
        : '0%',

      // 할일 완료율 (0~1 → 0%~100%)
      taskCompletion: typeof stats.taskCompletion === 'number'
        ? `${Math.round(stats.taskCompletion * 100)}%`
        : '0%',

      // 메시지 수
      messages: Number.isInteger(stats.messages) && stats.messages >= 0
        ? stats.messages
        : 0,

      // 공지 수
      notices: Number.isInteger(stats.notices) && stats.notices >= 0
        ? stats.notices
        : 0,

      // 파일 수
      files: Number.isInteger(stats.files) && stats.files >= 0
        ? stats.files
        : 0
    }
  } catch (error) {
    console.error('[my-studies-helpers] 통계 포맷팅 오류:', error)
    return {
      attendance: '0%',
      taskCompletion: '0%',
      messages: 0,
      notices: 0,
      files: 0
    }
  }
}

/**
 * 스터디 카드 데이터 안전하게 추출
 *
 * @param {Object} studyMember - StudyMember 객체
 * @returns {Object} 카드 렌더링용 데이터
 *
 * @example
 * const cardData = getSafeStudyCardData(studyMember)
 * // { id, name, emoji, memberCount, myRole, category, ... }
 */
export function getSafeStudyCardData(studyMember) {
  if (!studyMember || !studyMember.study) {
    return null
  }

  const study = studyMember.study

  return {
    id: study.id || null,
    name: study.name || '이름 없음',
    emoji: study.emoji || '📚',
    description: study.description || '',
    memberCount: study.memberCount || study._count?.members || 0,
    myRole: studyMember.role || 'MEMBER',
    category: study.category || null,
    tags: Array.isArray(study.tags) ? study.tags : [],
    maxMembers: study.maxMembers || null,
    isPublic: study.isPublic ?? true,
    createdAt: study.createdAt || null,
    joinedAt: studyMember.joinedAt || null
  }
}

/**
 * 필터별 카운트 계산
 *
 * @param {Array} studies - 스터디 목록
 * @returns {Object} 필터별 개수
 *
 * @example
 * const counts = getStudyCounts(studies)
 * // { all: 10, active: 8, admin: 2, pending: 1 }
 */
export function getStudyCounts(studies) {
  if (!Array.isArray(studies)) {
    return { all: 0, active: 0, admin: 0, pending: 0 }
  }

  try {
    const validStudies = studies.filter(s => s && s.study && !s.study.deletedAt)

    return {
      all: validStudies.length,
      active: validStudies.filter(s => ['OWNER', 'ADMIN', 'MEMBER'].includes(s.role)).length,
      admin: validStudies.filter(s => ['OWNER', 'ADMIN'].includes(s.role)).length,
      pending: validStudies.filter(s => s.role === 'PENDING').length
    }
  } catch (error) {
    console.error('[my-studies-helpers] 카운트 계산 오류:', error)
    return { all: 0, active: 0, admin: 0, pending: 0 }
  }
}

/**
 * 빠른 액션 버튼 생성 (탭 권한 확인 포함)
 *
 * @param {string} role - 사용자 역할
 * @param {number} studyId - 스터디 ID
 * @returns {Array} 사용 가능한 액션 목록
 *
 * @example
 * const actions = getQuickActions('MEMBER', 123)
 * // [{ label: '채팅', icon: '💬', href: '/my-studies/123/chat' }, ...]
 */
export function getQuickActions(role, studyId) {
  const allActions = [
    {
      label: '채팅',
      icon: '💬',
      tab: 'chat',
      href: `/my-studies/${studyId}/chat`
    },
    {
      label: '공지',
      icon: '📢',
      tab: 'notices',
      href: `/my-studies/${studyId}/notices`
    },
    {
      label: '파일',
      icon: '📎',
      tab: 'files',
      href: `/my-studies/${studyId}/files`
    },
    {
      label: '캘린더',
      icon: '📅',
      tab: 'calendar',
      href: `/my-studies/${studyId}/calendar`
    },
    {
      label: '할일',
      icon: '✅',
      tab: 'tasks',
      href: `/my-studies/${studyId}/tasks`
    },
    {
      label: '멤버',
      icon: '👥',
      tab: 'members',
      href: `/my-studies/${studyId}/members`,
      adminOnly: true
    },
    {
      label: '설정',
      icon: '⚙️',
      tab: 'settings',
      href: `/my-studies/${studyId}/settings`,
      ownerOnly: true
    }
  ]

  // 권한에 따라 필터링
  return allActions.filter(action => {
    if (action.ownerOnly && role !== 'OWNER') {
      return false
    }
    if (action.adminOnly && !['OWNER', 'ADMIN'].includes(role)) {
      return false
    }
    return true
  })
}

/**
 * 날짜 범위 검증 (이번 주, 이번 달 등)
 *
 * @param {Date|string} date - 확인할 날짜
 * @param {string} range - 범위 ('week', 'month', 'year')
 * @returns {boolean} 범위 내 포함 여부
 *
 * @example
 * isDateInRange(new Date(), 'week') // true
 */
export function isDateInRange(date, range = 'week') {
  try {
    const targetDate = new Date(date)
    if (isNaN(targetDate.getTime())) {
      return false
    }

    const now = new Date()
    const diff = now - targetDate

    switch (range) {
      case 'week':
        return diff <= 7 * 24 * 60 * 60 * 1000
      case 'month':
        return diff <= 30 * 24 * 60 * 60 * 1000
      case 'year':
        return diff <= 365 * 24 * 60 * 60 * 1000
      default:
        return false
    }
  } catch (error) {
    console.error('[my-studies-helpers] 날짜 범위 검증 오류:', error)
    return false
  }
}

/**
 * 스터디 정렬 (정렬 옵션에 따라)
 *
 * @param {Array} studies - 스터디 목록
 * @param {string} sortBy - 정렬 기준 ('recent', 'name', 'members')
 * @param {string} order - 정렬 순서 ('asc', 'desc')
 * @returns {Array} 정렬된 스터디 목록
 *
 * @example
 * const sorted = sortStudies(studies, 'recent', 'desc')
 */
export function sortStudies(studies, sortBy = 'recent', order = 'desc') {
  if (!Array.isArray(studies) || studies.length === 0) {
    return []
  }

  try {
    const sorted = [...studies].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          // 최근 가입순
          const dateA = new Date(a.joinedAt || 0)
          const dateB = new Date(b.joinedAt || 0)
          return order === 'asc' ? dateA - dateB : dateB - dateA

        case 'name':
          // 이름순
          const nameA = a.study?.name || ''
          const nameB = b.study?.name || ''
          return order === 'asc'
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA)

        case 'members':
          // 멤버 수순
          const countA = a.study?.memberCount || 0
          const countB = b.study?.memberCount || 0
          return order === 'asc' ? countA - countB : countB - countA

        default:
          return 0
      }
    })

    return sorted
  } catch (error) {
    console.error('[my-studies-helpers] 정렬 오류:', error)
    return studies
  }
}

/**
 * 스터디 검색 (이름, 설명, 태그)
 *
 * @param {Array} studies - 스터디 목록
 * @param {string} query - 검색어
 * @returns {Array} 검색 결과
 *
 * @example
 * const results = searchStudies(studies, '알고리즘')
 */
export function searchStudies(studies, query) {
  if (!Array.isArray(studies) || !query || query.trim().length === 0) {
    return studies
  }

  const searchTerm = query.trim().toLowerCase()

  try {
    return studies.filter(studyMember => {
      const study = studyMember.study
      if (!study) return false

      // 이름 검색
      const name = (study.name || '').toLowerCase()
      if (name.includes(searchTerm)) return true

      // 설명 검색
      const description = (study.description || '').toLowerCase()
      if (description.includes(searchTerm)) return true

      // 태그 검색
      if (Array.isArray(study.tags)) {
        const tagsMatch = study.tags.some(tag =>
          tag.toLowerCase().includes(searchTerm)
        )
        if (tagsMatch) return true
      }

      // 카테고리 검색
      const category = (study.category || '').toLowerCase()
      if (category.includes(searchTerm)) return true

      return false
    })
  } catch (error) {
    console.error('[my-studies-helpers] 검색 오류:', error)
    return studies
  }
}

/**
 * 페이지네이션 계산
 *
 * @param {Array} items - 전체 항목
 * @param {number} page - 현재 페이지 (1부터 시작)
 * @param {number} limit - 페이지당 항목 수
 * @returns {Object} 페이지네이션 정보
 *
 * @example
 * const pagination = getPaginationData(studies, 1, 5)
 * // { items: [...], page: 1, totalPages: 3, hasNext: true, hasPrev: false }
 */
export function getPaginationData(items, page = 1, limit = 10) {
  if (!Array.isArray(items)) {
    return {
      items: [],
      page: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
      total: 0
    }
  }

  const total = items.length
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.max(1, Math.min(page, totalPages || 1))
  const startIndex = (currentPage - 1) * limit
  const endIndex = startIndex + limit
  const paginatedItems = items.slice(startIndex, endIndex)

  return {
    items: paginatedItems,
    page: currentPage,
    limit,
    total,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, total)
  }
}

