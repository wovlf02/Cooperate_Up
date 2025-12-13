// 텍스트 및 숫자 포맷팅 유틸리티 함수

/**
 * 텍스트 자르기 (말줄임표 추가)
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * 숫자를 천 단위로 포맷팅 (예: 1,234)
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0'
  return num.toLocaleString('ko-KR')
}

/**
 * 퍼센트 계산 및 포맷팅
 */
export const calculatePercentage = (completed, total) => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

/**
 * 파일 크기 포맷팅 (예: 1.2 MB)
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 이니셜 추출 (예: 김철수 → 김)
 */
export const getInitials = (name) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

/**
 * 역할 배지 텍스트 변환
 */
export const getRoleText = (role) => {
  const roleMap = {
    OWNER: '방장',
    MEMBER: '멤버',
    PENDING: '대기중'
  }
  return roleMap[role] || role
}

/**
 * 알림 타입 텍스트 변환
 */
export const getNotificationTypeText = (type) => {
  const typeMap = {
    JOIN_APPROVED: '가입승인',
    JOIN_REJECTED: '가입거절',
    NOTICE: '공지',
    FILE: '파일',
    EVENT: '일정',
    TASK: '할일',
    MEMBER: '멤버',
    KICK: '강퇴',
    COMMENT: '댓글',
    MENTION: '멘션'
  }
  return typeMap[type] || type
}

/**
 * 줄바꿈을 <br>로 변환
 */
export const nl2br = (text) => {
  if (!text) return ''
  return text.replace(/\n/g, '<br>')
}

/**
 * 이메일 마스킹 (예: kim***@example.com)
 */
export const maskEmail = (email) => {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (local.length <= 3) return email
  return local.substring(0, 3) + '***@' + domain
}

