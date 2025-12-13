/**
 * Chat 에러 메시지 정의
 *
 * @description
 * 모든 Chat 에러에 대한 메시지를 중앙에서 관리
 * 사용자 메시지와 개발자 메시지를 분리
 */

export const ERROR_MESSAGES = {
  // 연결 에러 (CHAT-CONN-xxx)
  'CHAT-CONN-001': {
    user: '채팅 서버에 연결할 수 없습니다',
    dev: 'Connection refused to socket server'
  },
  'CHAT-CONN-002': {
    user: '서버 응답이 없습니다. 잠시 후 다시 시도해주세요',
    dev: 'Socket connection timeout'
  },
  'CHAT-CONN-003': {
    user: '인증에 실패했습니다. 다시 로그인해주세요',
    dev: 'Socket authentication failed'
  },
  'CHAT-CONN-004': {
    user: '연결이 끊어졌습니다. 다시 연결 중입니다',
    dev: 'Reconnection failed after N attempts'
  },
  'CHAT-CONN-005': {
    user: '실시간 채팅을 사용할 수 없습니다',
    dev: 'WebSocket upgrade failed'
  },
  'CHAT-CONN-006': {
    user: '인터넷 연결을 확인해주세요',
    dev: 'Network offline detected'
  },

  // 메시지 에러 (CHAT-MSG-xxx)
  'CHAT-MSG-001': {
    user: '메시지 전송에 실패했습니다. 다시 시도해주세요',
    dev: 'Message send failed: network error'
  },
  'CHAT-MSG-002': {
    user: '메시지를 전송할 수 없습니다. 잠시 후 다시 시도해주세요',
    dev: 'Message send failed: server error'
  },
  'CHAT-MSG-003': {
    user: '메시지 내용을 입력해주세요',
    dev: 'Empty message content'
  },
  'CHAT-MSG-004': {
    user: '메시지는 2000자 이하여야 합니다',
    dev: 'Message too long (>2000 chars)'
  },
  'CHAT-MSG-005': {
    user: '메시지를 너무 빠르게 전송하고 있습니다',
    dev: 'Spam detected: 5+ messages in 10s'
  },
  'CHAT-MSG-006': {
    user: '메시지에 허용되지 않는 내용이 포함되어 있습니다',
    dev: 'XSS attempt detected'
  },
  'CHAT-MSG-007': {
    user: '메시지를 불러올 수 없습니다',
    dev: 'Failed to fetch messages'
  },
  'CHAT-MSG-008': {
    user: '메시지를 수정할 권한이 없습니다',
    dev: 'Unauthorized message edit'
  },
  'CHAT-MSG-009': {
    user: '메시지를 삭제할 권한이 없습니다',
    dev: 'Unauthorized message delete'
  },
  'CHAT-MSG-010': {
    user: '메시지를 찾을 수 없습니다',
    dev: 'Message not found'
  },
  'CHAT-MSG-011': {
    user: '',
    dev: 'Duplicate message ignored'
  },
  'CHAT-MSG-012': {
    user: '',
    dev: 'Message order inconsistency'
  },

  // 동기화 에러 (CHAT-SYNC-xxx)
  'CHAT-SYNC-001': {
    user: '메시지 전송에 실패했습니다',
    dev: 'Optimistic update rollback'
  },
  'CHAT-SYNC-002': {
    user: '',
    dev: 'Message order mismatch detected'
  },
  'CHAT-SYNC-003': {
    user: '읽음 처리에 실패했습니다',
    dev: 'Mark as read failed'
  },
  'CHAT-SYNC-004': {
    user: '',
    dev: 'Typing state sync failed'
  },
  'CHAT-SYNC-005': {
    user: '메시지를 동기화하는 중 오류가 발생했습니다',
    dev: 'Reconnect sync failed'
  },
  'CHAT-SYNC-006': {
    user: '',
    dev: 'Socket event lost'
  },

  // 파일 에러 (CHAT-FILE-xxx)
  'CHAT-FILE-001': {
    user: '파일 업로드에 실패했습니다',
    dev: 'File upload failed'
  },
  'CHAT-FILE-002': {
    user: '파일 크기는 10MB 이하여야 합니다',
    dev: 'File size exceeds limit'
  },
  'CHAT-FILE-003': {
    user: '지원하지 않는 파일 형식입니다',
    dev: 'Unsupported file type'
  },
  'CHAT-FILE-004': {
    user: '파일을 다운로드할 수 없습니다',
    dev: 'File download failed'
  },
  'CHAT-FILE-005': {
    user: '파일 미리보기를 불러올 수 없습니다',
    dev: 'File preview failed'
  },
  'CHAT-FILE-006': {
    user: '파일을 찾을 수 없습니다',
    dev: 'File not found'
  },

  // UI 에러 (CHAT-UI-xxx)
  'CHAT-UI-001': {
    user: '',
    dev: 'Auto-scroll failed'
  },
  'CHAT-UI-002': {
    user: '메시지를 더 불러올 수 없습니다',
    dev: 'Infinite scroll failed'
  },
  'CHAT-UI-003': {
    user: '',
    dev: 'Typing indicator error'
  },
  'CHAT-UI-004': {
    user: '',
    dev: 'Input state error'
  },
  'CHAT-UI-005': {
    user: '',
    dev: 'Read receipt error'
  }
};

/**
 * 에러 코드로 사용자 메시지 가져오기
 */
export function getUserMessage(code) {
  return ERROR_MESSAGES[code]?.user || '알 수 없는 오류가 발생했습니다';
}

/**
 * 에러 코드로 개발자 메시지 가져오기
 */
export function getDeveloperMessage(code) {
  return ERROR_MESSAGES[code]?.dev || 'Unknown error';
}

/**
 * 재시도 가능한 에러인지 확인
 */
export function isRetryable(code) {
  // 연결 에러는 대부분 재시도 가능 (인증 실패 제외)
  if (code.startsWith('CHAT-CONN-') && code !== 'CHAT-CONN-003' && code !== 'CHAT-CONN-005') {
    return true;
  }

  // 메시지 에러 중 네트워크/서버 에러만 재시도 가능
  if (code === 'CHAT-MSG-001' || code === 'CHAT-MSG-002' || code === 'CHAT-MSG-005' || code === 'CHAT-MSG-007') {
    return true;
  }

  // 동기화 에러는 대부분 재시도 가능
  if (code.startsWith('CHAT-SYNC-')) {
    return true;
  }

  // 파일 에러 중 일부만 재시도 가능
  if (code === 'CHAT-FILE-001' || code === 'CHAT-FILE-004' || code === 'CHAT-FILE-005') {
    return true;
  }

  // UI 에러 중 일부만 재시도 가능
  if (code === 'CHAT-UI-001' || code === 'CHAT-UI-002') {
    return true;
  }

  return false;
}

