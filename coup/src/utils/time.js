// 시간 관련 유틸리티 함수

/**
 * 상대 시간 표시 (예: 2시간 전, 3일 전)
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return '-'
  const now = new Date()
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  return date.toLocaleDateString('ko-KR')
}

/**
 * 날짜 포맷팅 (예: 2024년 11월 9일)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}

/**
 * 날짜 + 시간 포맷팅 (예: 2024년 11월 9일 18:00)
 */
export const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${formatDate(dateString)} ${hours}:${minutes}`
}

/**
 * 한국 시간대(KST)로 날짜 + 시간 포맷팅
 * @param {string|Date} dateString - 날짜 문자열 또는 Date 객체
 * @returns {string} 포맷된 날짜 시간 (예: 2024년 11월 20일 18:30)
 */
export const formatDateTimeKST = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)

  // 한국 시간대로 변환
  const kstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))

  const year = kstDate.getFullYear()
  const month = kstDate.getMonth() + 1
  const day = kstDate.getDate()
  const hours = kstDate.getHours().toString().padStart(2, '0')
  const minutes = kstDate.getMinutes().toString().padStart(2, '0')

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`
}

/**
 * 마감일까지 남은 시간 계산 (한국 시간대 기준)
 */
export const getTimeLeft = (dueDate) => {
  if (!dueDate) return { text: '마감일 없음', urgent: false, expired: false }

  // 현재 시간을 한국 시간대로 변환
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const due = new Date(new Date(dueDate).toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))

  const diffMs = due - now
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffMs < 0) {
    return { text: '마감됨', urgent: true, expired: true }
  }

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return { text: `${diffMins}분 남음`, urgent: true, expired: false }
  }

  if (diffHours < 24) {
    return { text: `${diffHours}시간 남음`, urgent: true, expired: false }
  }

  if (diffDays < 7) {
    return { text: `${diffDays}일 남음`, urgent: false, expired: false }
  }

  return { text: `${diffDays}일 남음`, urgent: false, expired: false }
}

/**
 * 긴급도 계산 (24시간 이내, 7일 이내, 그 이후)
 */
export const getUrgencyLevel = (dueDate) => {
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due - now
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffMs < 0) return 'expired' // 만료됨
  if (diffHours <= 24) return 'urgent' // 긴급 (24시간 이내)
  if (diffDays <= 7) return 'thisWeek' // 이번 주 (7일 이내)
  return 'later' // 나중에
}

/**
 * 오늘인지 확인
 */
export const isToday = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * 이번 주인지 확인
 */
export const isThisWeek = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date - now
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= 7
}

