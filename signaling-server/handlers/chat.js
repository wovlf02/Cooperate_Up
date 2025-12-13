import { logger } from '../utils/logger.js';

/**
 * 채팅 이벤트 핸들러
 */
export function handleChatEvents(socket, io) {

  /**
   * 스터디 채팅 메시지 전송
   */
  socket.on('chat:send-message', async ({ studyId, message, type = 'text' }) => {
    try {
      logger.info(`[Chat] ${socket.user.name} sent message to study ${studyId}`);

      // 메시지 객체 생성
      const chatMessage = {
        id: `msg_${Date.now()}_${socket.id}`,
        studyId,
        userId: socket.userId,
        user: socket.user,
        message,
        type,
        timestamp: new Date(),
        socketId: socket.id
      };

      // 스터디 룸의 모든 참여자에게 전송
      io.to(`study:${studyId}`).emit('chat:message-received', chatMessage);

      // 발신자에게 확인 전송
      socket.emit('chat:message-sent', {
        success: true,
        messageId: chatMessage.id
      });

    } catch (error) {
      logger.error(`[Chat] Error sending message:`, error);
      socket.emit('chat:message-sent', {
        success: false,
        error: '메시지 전송에 실패했습니다.'
      });
    }
  });

  /**
   * 화상 통화 중 채팅 메시지 (비디오 룸 전용)
   */
  socket.on('chat:video-message', ({ roomId, message }) => {
    try {
      logger.info(`[Chat] ${socket.user.name} sent video chat message to ${roomId}`);

      const chatMessage = {
        id: `vmsg_${Date.now()}_${socket.id}`,
        roomId,
        userId: socket.userId,
        user: socket.user,
        message,
        timestamp: new Date(),
        socketId: socket.id
      };

      // 화상 통화 참여자들에게만 전송
      io.to(`video:${roomId}`).emit('chat:video-message-received', chatMessage);

    } catch (error) {
      logger.error(`[Chat] Error sending video message:`, error);
    }
  });

  /**
   * 화상 통화 중 파일 전송 (비디오 룸 전용)
   */
  socket.on('chat:video-file', ({ roomId, file }) => {
    try {
      logger.info(`[Chat] ${socket.user.name} sent file in video chat: ${file.name}`);

      const fileMessage = {
        id: `vfile_${Date.now()}_${socket.id}`,
        roomId,
        userId: socket.userId,
        user: socket.user,
        type: 'file',
        file,
        timestamp: new Date(),
        socketId: socket.id
      };

      // 화상 통화 참여자들에게만 전송
      io.to(`video:${roomId}`).emit('chat:video-file-received', fileMessage);

    } catch (error) {
      logger.error(`[Chat] Error sending video file:`, error);
    }
  });

  /**
   * 타이핑 상태 알림
   */
  socket.on('chat:typing', ({ studyId, isTyping }) => {
    socket.to(`study:${studyId}`).emit('chat:user-typing', {
      userId: socket.userId,
      user: socket.user,
      isTyping
    });
  });

  /**
   * 메시지 읽음 처리
   */
  socket.on('chat:mark-read', ({ messageIds }) => {
    // 읽음 처리 로직 (추후 DB 연동 시 구현)
    logger.debug(`[Chat] ${socket.user.name} marked ${messageIds.length} messages as read`);
  });

  /**
   * 파일 업로드 알림
   */
  socket.on('chat:file-uploaded', ({ studyId, file }) => {
    try {
      logger.info(`[Chat] ${socket.user.name} uploaded file: ${file.name}`);

      const fileMessage = {
        id: `file_${Date.now()}_${socket.id}`,
        studyId,
        userId: socket.userId,
        user: socket.user,
        type: 'file',
        file,
        timestamp: new Date()
      };

      io.to(`study:${studyId}`).emit('chat:message-received', fileMessage);
    } catch (error) {
      logger.error(`[Chat] Error handling file upload:`, error);
    }
  });
}

