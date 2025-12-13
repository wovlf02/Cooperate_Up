import { logger } from '../utils/logger.js';

/**
 * 소켓 인증 미들웨어
 * Next.js 서버에 인증 요청을 보내 사용자를 확인
 */
export async function authenticateSocket(socket, next) {
  try {
    const userId = socket.handshake.auth.userId;
    const token = socket.handshake.auth.token;

    if (!userId) {
      logger.warn(`Authentication failed: No userId provided (${socket.id})`);
      return next(new Error('Authentication required: userId missing'));
    }

    // Next.js API로 토큰 검증
    const NEXTJS_URL = process.env.NEXTJS_URL || 'http://localhost:3000';

    try {
      const response = await fetch(`${NEXTJS_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        logger.warn(`Authentication failed for userId ${userId}: ${response.status}`);
        return next(new Error('Authentication failed'));
      }

      const data = await response.json();

      if (!data.user || data.user.status !== 'ACTIVE') {
        logger.warn(`User not active: ${userId}`);
        return next(new Error('User not found or inactive'));
      }

      // 사용자 정보를 소켓 객체에 저장
      socket.userId = data.user.id;
      socket.user = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar
      };

      logger.info(`Authentication successful: ${socket.user.name} (${socket.userId})`);
      next();
    } catch (fetchError) {
      logger.error(`Failed to verify with Next.js API:`, fetchError);
      // 개발 환경에서는 userId만 있으면 통과
      if (process.env.NODE_ENV === 'development') {
        logger.warn(`Development mode: Allowing connection with userId ${userId}`);
        socket.userId = userId;
        socket.user = {
          id: userId,
          name: `User ${userId}`,
          email: null,
          avatar: null
        };
        return next();
      }
      return next(new Error('Failed to authenticate with server'));
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    next(new Error('Authentication error'));
  }
}

