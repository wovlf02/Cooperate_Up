import ChatException from './ChatException.js';

/**
 * Chat 연결 예외 클래스
 *
 * @description
 * Socket.IO 연결 관련 예외를 처리
 * - 연결 실패
 * - 재연결 실패
 * - 타임아웃
 * - 인증 실패
 *
 * @extends ChatException
 */
export class ChatConnectionException extends ChatException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'connection'
    });
    this.name = 'ChatConnectionException';
  }

  /**
   * Socket 서버 연결 불가
   */
  static serverUnreachable(context = {}) {
    return new ChatConnectionException(
      'CHAT-CONN-001',
      'Connection refused to socket server',
      {
        userMessage: '채팅 서버에 연결할 수 없습니다',
        devMessage: 'Socket server is unreachable or not running',
        retryable: true,
        context
      }
    );
  }

  /**
   * 연결 타임아웃
   */
  static timeout(context = {}) {
    return new ChatConnectionException(
      'CHAT-CONN-002',
      'Socket connection timeout',
      {
        userMessage: '서버 응답이 없습니다. 잠시 후 다시 시도해주세요',
        devMessage: 'Socket connection timed out after 30 seconds',
        retryable: true,
        context
      }
    );
  }

  /**
   * 인증 실패
   */
  static authenticationFailed(context = {}) {
    return new ChatConnectionException(
      'CHAT-CONN-003',
      'Socket authentication failed',
      {
        userMessage: '인증에 실패했습니다. 다시 로그인해주세요',
        devMessage: 'Socket authentication failed - invalid or expired token',
        retryable: false,
        context
      }
    );
  }

  /**
   * 재연결 실패
   */
  static reconnectionFailed(attempts, context = {}) {
    return new ChatConnectionException(
      'CHAT-CONN-004',
      `Reconnection failed after ${attempts} attempts`,
      {
        userMessage: '연결이 끊어졌습니다. 다시 연결 중입니다',
        devMessage: `Failed to reconnect after ${attempts} attempts`,
        retryable: true,
        context: { ...context, attempts }
      }
    );
  }

  /**
   * WebSocket Transport 업그레이드 실패
   */
  static transportUpgradeFailed(context = {}) {
    return new ChatConnectionException(
      'CHAT-CONN-005',
      'WebSocket upgrade failed',
      {
        userMessage: '실시간 채팅을 사용할 수 없습니다',
        devMessage: 'Failed to upgrade to WebSocket transport',
        retryable: false,
        context
      }
    );
  }

  /**
   * 네트워크 오프라인
   */
  static networkOffline(context = {}) {
    return new ChatConnectionException(
      'CHAT-CONN-006',
      'Network offline detected',
      {
        userMessage: '인터넷 연결을 확인해주세요',
        devMessage: 'Network is offline (navigator.onLine = false)',
        retryable: true,
        context
      }
    );
  }
}

