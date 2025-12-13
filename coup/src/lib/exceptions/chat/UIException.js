import ChatException from './ChatException.js';

/**
 * Chat UI 예외 클래스
 *
 * @description
 * UI 관련 예외를 처리
 * - 자동 스크롤 실패
 * - 무한 스크롤 실패
 * - 타이핑 인디케이터 오류
 * - 입력 상태 오류
 *
 * @extends ChatException
 */
export class ChatUIException extends ChatException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'ui'
    });
    this.name = 'ChatUIException';
  }

  /**
   * 자동 스크롤 실패
   */
  static autoScrollFailed(context = {}) {
    return new ChatUIException(
      'CHAT-UI-001',
      'Auto-scroll failed',
      {
        userMessage: '', // 내부 처리, 사용자에게 표시 안 함
        devMessage: 'Failed to scroll to bottom automatically',
        retryable: true,
        context
      }
    );
  }

  /**
   * 무한 스크롤 실패
   */
  static infiniteScrollFailed(context = {}) {
    return new ChatUIException(
      'CHAT-UI-002',
      'Infinite scroll failed',
      {
        userMessage: '메시지를 더 불러올 수 없습니다',
        devMessage: 'Failed to load more messages on scroll',
        retryable: true,
        context
      }
    );
  }

  /**
   * 타이핑 인디케이터 오류
   */
  static typingIndicatorError(context = {}) {
    return new ChatUIException(
      'CHAT-UI-003',
      'Typing indicator error',
      {
        userMessage: '', // 내부 처리, 사용자에게 표시 안 함
        devMessage: 'Error in typing indicator state management',
        retryable: false,
        context
      }
    );
  }

  /**
   * 입력 상태 오류
   */
  static inputStateError(context = {}) {
    return new ChatUIException(
      'CHAT-UI-004',
      'Input state error',
      {
        userMessage: '', // 내부 처리, 사용자에게 표시 안 함
        devMessage: 'Error in input field state management',
        retryable: false,
        context
      }
    );
  }

  /**
   * 읽음 표시 오류
   */
  static readReceiptError(context = {}) {
    return new ChatUIException(
      'CHAT-UI-005',
      'Read receipt error',
      {
        userMessage: '', // 내부 처리, 사용자에게 표시 안 함
        devMessage: 'Error in read receipt display',
        retryable: false,
        context
      }
    );
  }
}

