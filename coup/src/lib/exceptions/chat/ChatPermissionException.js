/**
 * Chat Permission Exception
 *
 * @description
 * 채팅/메시지 권한 관련 예외 클래스
 * 14개 에러 코드 (CHAT-PERM-001 ~ CHAT-PERM-014)
 *
 * @category Exception
 * @author CoUp Team
 * @created 2025-12-04
 */

import ChatException from './ChatException.js';

export default class ChatPermissionException extends ChatException {
  constructor(message, code, statusCode = 403, context = {}) {
    super(message, code, statusCode, 'critical', { ...context, type: 'permission' });
    this.name = 'ChatPermissionException';
  }

  // ========================================
  // 인증 관련 (3개)
  // ========================================

  static authenticationRequired() {
    return new ChatPermissionException(
      '로그인이 필요합니다.',
      'CHAT-PERM-001',
      401,
      { subtype: 'authentication_required' }
    );
  }

  static sessionExpired() {
    return new ChatPermissionException(
      '세션이 만료되었습니다. 다시 로그인해주세요.',
      'CHAT-PERM-002',
      401,
      { subtype: 'session_expired' }
    );
  }

  static invalidToken() {
    return new ChatPermissionException(
      '유효하지 않은 인증 토큰입니다.',
      'CHAT-PERM-003',
      401,
      { subtype: 'invalid_token' }
    );
  }

  // ========================================
  // 스터디 멤버십 관련 (4개)
  // ========================================

  static notStudyMember(studyId) {
    return new ChatPermissionException(
      '스터디 멤버만 채팅에 참여할 수 있습니다.',
      'CHAT-PERM-004',
      403,
      { subtype: 'not_study_member', studyId }
    );
  }

  static membershipPending(studyId) {
    return new ChatPermissionException(
      '스터디 가입이 승인되지 않았습니다.',
      'CHAT-PERM-005',
      403,
      { subtype: 'membership_pending', studyId }
    );
  }

  static membershipKicked(studyId) {
    return new ChatPermissionException(
      '스터디에서 추방되어 채팅에 참여할 수 없습니다.',
      'CHAT-PERM-006',
      403,
      { subtype: 'membership_kicked', studyId }
    );
  }

  static studyInactive(studyId) {
    return new ChatPermissionException(
      '비활성화된 스터디의 채팅입니다.',
      'CHAT-PERM-007',
      403,
      { subtype: 'study_inactive', studyId }
    );
  }

  // ========================================
  // 메시지 권한 관련 (4개)
  // ========================================

  static messageNotOwned(messageId) {
    return new ChatPermissionException(
      '본인의 메시지만 수정/삭제할 수 있습니다.',
      'CHAT-PERM-008',
      403,
      { subtype: 'message_not_owned', messageId }
    );
  }

  static cannotSendMessage(reason) {
    return new ChatPermissionException(
      `메시지를 전송할 수 없습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-PERM-009',
      403,
      { subtype: 'cannot_send', reason }
    );
  }

  static cannotDeleteMessage(reason) {
    return new ChatPermissionException(
      `메시지를 삭제할 수 없습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-PERM-010',
      403,
      { subtype: 'cannot_delete', reason }
    );
  }

  static cannotEditMessage(reason) {
    return new ChatPermissionException(
      `메시지를 수정할 수 없습니다.${reason ? ` (${reason})` : ''}`,
      'CHAT-PERM-011',
      403,
      { subtype: 'cannot_edit', reason }
    );
  }

  // ========================================
  // 제재 관련 (3개)
  // ========================================

  static chatBanned(reason, expiresAt) {
    return new ChatPermissionException(
      `채팅이 금지된 상태입니다.${reason ? ` 사유: ${reason}` : ''}${expiresAt ? ` (해제: ${expiresAt})` : ''}`,
      'CHAT-PERM-012',
      403,
      { subtype: 'chat_banned', reason, expiresAt }
    );
  }

  static accountSuspended(reason) {
    return new ChatPermissionException(
      `계정이 정지되어 채팅을 사용할 수 없습니다.${reason ? ` 사유: ${reason}` : ''}`,
      'CHAT-PERM-013',
      403,
      { subtype: 'account_suspended', reason }
    );
  }

  static adminPermissionRequired() {
    return new ChatPermissionException(
      '관리자 권한이 필요합니다.',
      'CHAT-PERM-014',
      403,
      { subtype: 'admin_required' }
    );
  }
}
