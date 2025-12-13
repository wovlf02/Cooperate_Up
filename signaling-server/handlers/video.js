import { logger } from '../utils/logger.js';

// 각 방의 참여자 정보를 메모리에 저장
const videoRooms = new Map();

/**
 * 화상 통화 이벤트 핸들러
 */
export function handleVideoEvents(socket, io) {
  logger.info(`[Video] Registering video events for ${socket.user?.name} (${socket.id})`);

  /**
   * 화상 통화 방 입장
   */
  socket.on('video:join-room', async ({ studyId, roomId }) => {
    try {
      logger.info(`[Video] ✅ RECEIVED video:join-room event from ${socket.user?.name} - studyId: ${studyId}, roomId: ${roomId}`);
      logger.info(`[Video] ${socket.user.name} joining room ${roomId}`);

      // 스터디 멤버십 확인 (개발 모드에서는 선택적)
      const NEXTJS_URL = process.env.NEXTJS_URL || 'http://localhost:3000';

      if (process.env.NODE_ENV === 'production') {
        try {
          const response = await fetch(`${NEXTJS_URL}/api/studies/${studyId}/check-member`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: socket.userId })
          });

          if (!response.ok) {
            logger.warn(`[Video] Member check failed for ${socket.user.name}: ${response.status}`);
            socket.emit('error', { message: '접근 권한이 없습니다.' });
            return;
          }
        } catch (error) {
          logger.error(`[Video] Failed to check membership:`, error);
          socket.emit('error', { message: '멤버십 확인에 실패했습니다.' });
          return;
        }
      } else {
        logger.info(`[Video] Development mode: Skipping membership check for ${socket.user.name}`);
      }

      // 방 입장
      socket.join(`video:${roomId}`);
      socket.currentVideoRoom = roomId;

      // 방 정보 초기화
      if (!videoRooms.has(roomId)) {
        videoRooms.set(roomId, new Map());
      }

      const roomParticipants = videoRooms.get(roomId);

      logger.info(`[Video] Setting participant info - socketId: ${socket.id}, userId: ${socket.userId}, user:`, socket.user);

      roomParticipants.set(socket.id, {
        socketId: socket.id,
        userId: socket.userId,
        user: socket.user,
        isMuted: false,
        isVideoOff: false,
        isSharingScreen: false,
        joinedAt: new Date()
      });

      // 기존 참여자 목록 전송
      const participants = Array.from(roomParticipants.values())
        .filter(p => p.socketId !== socket.id);

      logger.info(`[Video] Sending room state to ${socket.user?.name}, participants:`, participants.map(p => ({ socketId: p.socketId, user: p.user })));
      socket.emit('video:room-state', { participants });

      // 다른 참여자들에게 알림
      logger.info(`[Video] Broadcasting user-joined - socketId: ${socket.id}, user:`, socket.user);
      socket.to(`video:${roomId}`).emit('video:user-joined', {
        socketId: socket.id,
        userId: socket.userId,
        user: socket.user
      });

      logger.info(`[Video] ${socket.user?.name} joined ${roomId}, total participants: ${roomParticipants.size}`);
    } catch (error) {
      logger.error(`[Video] Error joining room:`, error);
      socket.emit('error', { message: '방 입장에 실패했습니다.' });
    }
  });

  /**
   * WebRTC Offer 전달
   */
  socket.on('video:offer', ({ to, offer }) => {
    logger.debug(`[Video] Relaying offer from ${socket.id} to ${to}`);
    io.to(to).emit('video:offer', {
      from: socket.id,
      offer
    });
  });

  /**
   * WebRTC Answer 전달
   */
  socket.on('video:answer', ({ to, answer }) => {
    logger.debug(`[Video] Relaying answer from ${socket.id} to ${to}`);
    io.to(to).emit('video:answer', {
      from: socket.id,
      answer
    });
  });

  /**
   * ICE Candidate 전달
   */
  socket.on('video:ice-candidate', ({ to, candidate }) => {
    logger.debug(`[Video] Relaying ICE candidate from ${socket.id} to ${to}`);
    io.to(to).emit('video:ice-candidate', {
      from: socket.id,
      candidate
    });
  });

  /**
   * 오디오 상태 변경
   */
  socket.on('video:toggle-audio', ({ roomId, isMuted }) => {
    logger.info(`[Video] ${socket.user.name} ${isMuted ? 'muted' : 'unmuted'} audio`);

    const roomParticipants = videoRooms.get(roomId);
    if (roomParticipants && roomParticipants.has(socket.id)) {
      roomParticipants.get(socket.id).isMuted = isMuted;
    }

    socket.to(`video:${roomId}`).emit('video:peer-audio-changed', {
      socketId: socket.id,
      userId: socket.userId,
      isMuted
    });
  });

  /**
   * 비디오 상태 변경
   */
  socket.on('video:toggle-video', ({ roomId, isVideoOff }) => {
    logger.info(`[Video] ${socket.user.name} turned video ${isVideoOff ? 'off' : 'on'}`);

    const roomParticipants = videoRooms.get(roomId);
    if (roomParticipants && roomParticipants.has(socket.id)) {
      roomParticipants.get(socket.id).isVideoOff = isVideoOff;
    }

    socket.to(`video:${roomId}`).emit('video:peer-video-changed', {
      socketId: socket.id,
      userId: socket.userId,
      isVideoOff
    });
  });

  /**
   * 화면 공유 시작
   */
  socket.on('video:screen-share-start', ({ roomId }) => {
    logger.info(`[Video] ${socket.user.name} started screen sharing`);

    const roomParticipants = videoRooms.get(roomId);
    if (roomParticipants && roomParticipants.has(socket.id)) {
      roomParticipants.get(socket.id).isSharingScreen = true;
    }

    socket.to(`video:${roomId}`).emit('video:peer-screen-share', {
      socketId: socket.id,
      userId: socket.userId,
      isSharing: true
    });
  });

  /**
   * 화면 공유 종료
   */
  socket.on('video:screen-share-stop', ({ roomId }) => {
    logger.info(`[Video] ${socket.user.name} stopped screen sharing`);

    const roomParticipants = videoRooms.get(roomId);
    if (roomParticipants && roomParticipants.has(socket.id)) {
      roomParticipants.get(socket.id).isSharingScreen = false;
    }

    socket.to(`video:${roomId}`).emit('video:peer-screen-share', {
      socketId: socket.id,
      userId: socket.userId,
      isSharing: false
    });
  });

  /**
   * 방 퇴장
   */
  socket.on('video:leave-room', ({ roomId }) => {
    leaveVideoRoom(socket, io, roomId);
  });

  /**
   * 연결 끊김 시 정리
   */
  socket.on('disconnect', () => {
    if (socket.currentVideoRoom) {
      leaveVideoRoom(socket, io, socket.currentVideoRoom);
    }
  });
}

/**
 * 화상 통화 방에서 나가기 (정리 작업)
 */
function leaveVideoRoom(socket, io, roomId) {
  try {
    logger.info(`[Video] ${socket.user?.name || socket.id} leaving room ${roomId}`);

    const roomParticipants = videoRooms.get(roomId);
    if (roomParticipants) {
      roomParticipants.delete(socket.id);

      // 참여자가 없으면 방 삭제
      if (roomParticipants.size === 0) {
        videoRooms.delete(roomId);
        logger.info(`[Video] Room ${roomId} is now empty, removed`);
      }
    }

    socket.leave(`video:${roomId}`);
    socket.to(`video:${roomId}`).emit('video:user-left', {
      socketId: socket.id,
      userId: socket.userId
    });

    delete socket.currentVideoRoom;
  } catch (error) {
    logger.error(`[Video] Error leaving room:`, error);
  }
}

/**
 * 현재 참여자 수 조회 (외부에서 사용)
 */
export function getVideoRoomParticipants(roomId) {
  const roomParticipants = videoRooms.get(roomId);
  return roomParticipants ? Array.from(roomParticipants.values()) : [];
}

