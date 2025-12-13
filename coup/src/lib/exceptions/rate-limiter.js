/**
 * Rate Limiting 헬퍼
 * 간단한 메모리 기반 Rate Limiter
 * @module lib/exceptions/rate-limiter
 */

class RateLimiter {
  constructor() {
    // IP별 로그인 시도 기록: Map<ip, { count: number, resetAt: Date }>
    this.loginAttempts = new Map();

    // 설정
    this.maxAttempts = 5;
    this.windowMs = 15 * 60 * 1000; // 15분

    // 주기적으로 오래된 기록 삭제 (메모리 관리)
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // 5분마다
  }

  /**
   * 로그인 시도 기록
   * @param {string} identifier - IP 또는 이메일
   * @returns {Object} { allowed: boolean, remaining: number, resetAt: Date }
   */
  recordLoginAttempt(identifier) {
    const now = Date.now();
    const record = this.loginAttempts.get(identifier);

    // 기록이 없거나 만료됨
    if (!record || now > record.resetAt) {
      this.loginAttempts.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs
      });

      return {
        allowed: true,
        remaining: this.maxAttempts - 1,
        resetAt: new Date(now + this.windowMs)
      };
    }

    // 기록 업데이트
    record.count += 1;
    this.loginAttempts.set(identifier, record);

    const remaining = Math.max(0, this.maxAttempts - record.count);
    const allowed = record.count <= this.maxAttempts;

    return {
      allowed,
      remaining,
      resetAt: new Date(record.resetAt),
      attemptsUsed: record.count
    };
  }

  /**
   * 로그인 성공 시 기록 초기화
   * @param {string} identifier - IP 또는 이메일
   */
  resetLoginAttempts(identifier) {
    this.loginAttempts.delete(identifier);
  }

  /**
   * 현재 시도 횟수 조회
   * @param {string} identifier - IP 또는 이메일
   * @returns {Object} { count: number, remaining: number, resetAt: Date|null }
   */
  getLoginAttempts(identifier) {
    const now = Date.now();
    const record = this.loginAttempts.get(identifier);

    if (!record || now > record.resetAt) {
      return {
        count: 0,
        remaining: this.maxAttempts,
        resetAt: null
      };
    }

    return {
      count: record.count,
      remaining: Math.max(0, this.maxAttempts - record.count),
      resetAt: new Date(record.resetAt)
    };
  }

  /**
   * 차단 여부 확인
   * @param {string} identifier - IP 또는 이메일
   * @returns {boolean}
   */
  isBlocked(identifier) {
    const now = Date.now();
    const record = this.loginAttempts.get(identifier);

    if (!record || now > record.resetAt) {
      return false;
    }

    return record.count > this.maxAttempts;
  }

  /**
   * 오래된 기록 삭제
   */
  cleanup() {
    const now = Date.now();
    for (const [identifier, record] of this.loginAttempts.entries()) {
      if (now > record.resetAt) {
        this.loginAttempts.delete(identifier);
      }
    }
  }

  /**
   * 모든 기록 삭제
   */
  clear() {
    this.loginAttempts.clear();
  }

  /**
   * 정리 interval 중지
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// 싱글톤 인스턴스
let rateLimiterInstance = null;

/**
 * Rate Limiter 인스턴스 가져오기
 */
export function getRateLimiter() {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

/**
 * Request에서 IP 주소 추출
 */
export function getClientIp(request) {
  // Vercel, Netlify 등 프록시 환경
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  // Cloudflare
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // 기타
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // 로컬 개발 환경
  return 'local-dev';
}

/**
 * Rate Limit 체크 미들웨어
 */
export async function checkRateLimit(request, identifier = null) {
  const limiter = getRateLimiter();
  const ip = identifier || getClientIp(request);

  const result = limiter.recordLoginAttempt(ip);

  if (!result.allowed) {
    const resetIn = Math.ceil((result.resetAt - Date.now()) / 1000 / 60);
    return {
      allowed: false,
      error: {
        code: 'AUTH_010',
        message: `로그인 시도 횟수가 초과되었습니다. ${resetIn}분 후 다시 시도해주세요`,
        statusCode: 429,
        retryAfter: result.resetAt
      }
    };
  }

  return {
    allowed: true,
    remaining: result.remaining,
    resetAt: result.resetAt
  };
}

/**
 * Rate Limit 초기화 (로그인 성공 시)
 */
export function resetRateLimit(request, identifier = null) {
  const limiter = getRateLimiter();
  const ip = identifier || getClientIp(request);
  limiter.resetLoginAttempts(ip);
}

export default RateLimiter;

