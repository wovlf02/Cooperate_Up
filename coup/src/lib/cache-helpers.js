/**
 * 간단한 메모리 기반 캐싱 시스템
 *
 * 주의: 프로덕션 환경에서는 Redis 등을 사용하는 것이 권장됩니다.
 * 현재는 단일 서버 환경을 가정한 메모리 캐싱입니다.
 */

const noticeCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5분

/**
 * 캐시된 공지 목록 조회
 * @param {string} studyId - 스터디 ID
 * @returns {Array|null} 캐시된 데이터 또는 null
 */
export function getCachedNotices(studyId) {
  const cached = noticeCache.get(studyId)

  if (!cached) {
    return null
  }

  // TTL 확인
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    // 만료된 캐시 제거
    noticeCache.delete(studyId)
    return null
  }

  return cached.data
}

/**
 * 공지 목록 캐싱
 * @param {string} studyId - 스터디 ID
 * @param {Array} data - 캐싱할 데이터
 */
export function setCachedNotices(studyId, data) {
  noticeCache.set(studyId, {
    data,
    timestamp: Date.now()
  })
}

/**
 * 특정 스터디의 공지 캐시 무효화
 * @param {string} studyId - 스터디 ID
 */
export function invalidateNoticesCache(studyId) {
  console.log(`[Cache] Invalidating cache for studyId: ${studyId}`)
  console.log(`[Cache] Current cache keys: ${Array.from(noticeCache.keys()).join(', ')}`)

  // studyId로 시작하는 모든 캐시 키 삭제 (페이지네이션 등)
  const keysToDelete = Array.from(noticeCache.keys()).filter(key => {
    // 정확히 일치하거나 studyId_로 시작하는 키
    const shouldDelete = key === studyId || key.startsWith(`${studyId}_`)
    if (shouldDelete) {
      console.log(`[Cache] Will delete key: ${key}`)
    }
    return shouldDelete
  })

  keysToDelete.forEach(key => {
    noticeCache.delete(key)
  })

  console.log(`[Cache] Deleted ${keysToDelete.length} entries. Remaining: ${noticeCache.size}`)
}

/**
 * 모든 공지 캐시 무효화
 */
export function invalidateAllNoticesCache() {
  noticeCache.clear()
}

/**
 * 캐시 통계 조회
 * @returns {Object} 캐시 통계
 */
export function getCacheStats() {
  return {
    size: noticeCache.size,
    ttl: CACHE_TTL,
    cacheType: 'memory'
  }
}

/**
 * 만료된 캐시 정리 (주기적 실행 권장)
 */
export function cleanupExpiredCache() {
  const now = Date.now()
  let cleaned = 0

  for (const [studyId, cached] of noticeCache.entries()) {
    if (now - cached.timestamp > CACHE_TTL) {
      noticeCache.delete(studyId)
      cleaned++
    }
  }

  return cleaned
}

