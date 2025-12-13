import ChatException from './ChatException.js';

/**
 * Chat 동기화 예외 클래스
 *
 * @description
 * 실시간 동기화 관련 예외를 처리
 * - 낙관적 업데이트 실패
 * - 메시지 순서 문제
 * - 읽음 처리 실패
 * - 이벤트 손실
 *
 * @extends ChatException
 */
export class ChatSyncException extends ChatException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'sync'
    });
    this.name = 'ChatSyncException';
  }

  /**
   * 낙관적 업데이트 실패 (롤백 필요)
   */
  static optimisticUpdateFailed(tempId, context = {}) {
    return new ChatSyncException(
      'CHAT-SYNC-001',
      'Optimistic update rollback',
      {
        userMessage: '메시지 전송에 실패했습니다',
        devMessage: `Optimistic update failed for temp message ${tempId}, rolling back`,
        retryable: true,
        context: { ...context, tempId }
      }
    );
  }

  /**
   * 메시지 순서 불일치
   */
  static orderMismatch(context = {}) {
    return new ChatSyncException(
      'CHAT-SYNC-002',
      'Message order mismatch detected',
      {
        userMessage: '', // 내부 처리, 사용자에게 표시 안 함
        devMessage: 'Message order mismatch detected, reordering required',
        retryable: false,
        context
      }
    );
  }

  /**
   * 읽음 처리 실패
   */
  static markAsReadFailed(messageId, context = {}) {
    return new ChatSyncException(
      'CHAT-SYNC-003',
      'Mark as read failed',
      {
        userMessage: '읽음 처리에 실패했습니다',
        devMessage: `Failed to mark message ${messageId} as read`,
        retryable: true,
        context: { ...context, messageId }
      }
    );
  }

  /**
   * 타이핑 상태 동기화 실패
   */
  static typingSyncFailed(context = {}) {
    return new ChatSyncException(
      'CHAT-SYNC-004',
      'Typing state sync failed',
      {
        userMessage: '', // 내부 처리, 사용자에게 표시 안 함
        devMessage: 'Failed to sync typing state',
        retryable: true,
        context
      }
    );
  }

  /**
   * 재연결 후 동기화 실패
   */
  static reconnectSyncFailed(context = {}) {
    return new ChatSyncException(
      'CHAT-SYNC-005',
      'Reconnect sync failed',
      {
        userMessage: '메시지를 동기화하는 중 오류가 발생했습니다',
        devMessage: 'Failed to sync messages after reconnection',
        retryable: true,
        context
      }
    );
  }

  /**
   * Socket 이벤트 손실
   */
  static eventLost(eventType, context = {}) {
    return new ChatSyncException(
      'CHAT-SYNC-006',
      'Socket event lost',
      {
        userMessage: '', // 내부 처리, 사용자에게 표시 안 함
        devMessage: `Socket event ${eventType} was lost`,
        retryable: true,
        context: { ...context, eventType }
      }
    );
  }
}

