import { logger } from '../utils/logger.js';

/**
 * 사용자 상태(Presence) 이벤트 핸들러
 */
export function handlePresenceEvents(socket, io) {

  /**
   * 스터디 온라인 상태 설정
   */
  socket.on('presence:join-study', async ({ studyId }) => {
    try {
      logger.info(`[Presence] ${socket.user.name} joined study ${studyId}`);

      // 스터디 룸에 입장
      socket.join(`study:${studyId}`);

      // 다른 멤버들에게 온라인 알림
      socket.to(`study:${studyId}`).emit('presence:user-online', {
        userId: socket.userId,
        user: socket.user,
        timestamp: new Date()
      });

      // 현재 온라인 사용자 목록 요청 가능
      const room = io.sockets.adapter.rooms.get(`study:${studyId}`);
      const onlineCount = room ? room.size : 0;

      socket.emit('presence:study-joined', {
        studyId,
        onlineCount
      });

    } catch (error) {
      logger.error(`[Presence] Error joining study:`, error);
    }
  });

  /**
   * 스터디에서 나가기
   */
  socket.on('presence:leave-study', ({ studyId }) => {
    leaveStudyRoom(socket, io, studyId);
  });

  /**
   * 사용자 상태 변경 (away, busy 등)
   */
  socket.on('presence:status-change', ({ status }) => {
    try {
      logger.debug(`[Presence] ${socket.user.name} status changed to ${status}`);

      socket.user.status = status;

      // 모든 스터디 룸에 상태 변경 알림
      const rooms = Array.from(socket.rooms).filter(room => room.startsWith('study:'));
      rooms.forEach(room => {
        socket.to(room).emit('presence:user-status-changed', {
          userId: socket.userId,
          user: socket.user,
          status
        });
      });
    } catch (error) {
      logger.error(`[Presence] Error changing status:`, error);
    }
  });

  /**
   * 연결 끊김 시 정리
   */
  socket.on('disconnect', () => {
    // 모든 스터디 룸에서 오프라인 알림
    const rooms = Array.from(socket.rooms).filter(room => room.startsWith('study:'));
    rooms.forEach(room => {
      socket.to(room).emit('presence:user-offline', {
        userId: socket.userId,
        user: socket.user,
        timestamp: new Date()
      });
    });
  });
}

/**
 * 스터디 룸에서 나가기 (정리 작업)
 */
function leaveStudyRoom(socket, io, studyId) {
  try {
    logger.info(`[Presence] ${socket.user.name} leaving study ${studyId}`);

    socket.leave(`study:${studyId}`);

    socket.to(`study:${studyId}`).emit('presence:user-offline', {
      userId: socket.userId,
      user: socket.user,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error(`[Presence] Error leaving study:`, error);
  }
}

