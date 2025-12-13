/**
 * Chat 예외 클래스 통합 Export
 *
 * @description
 * 모든 Chat 예외 클래스를 한 곳에서 import할 수 있도록 통합
 *
 * 에러 코드 체계:
 * - CHAT-001 ~ CHAT-040: Base ChatException
 * - CHAT-VAL-001 ~ CHAT-VAL-015: ChatValidationException (유효성 검증)
 * - CHAT-PERM-001 ~ CHAT-PERM-014: ChatPermissionException (권한)
 * - CHAT-BIZ-001 ~ CHAT-BIZ-023: ChatBusinessException (비즈니스 로직)
 *
 * @example
 * import {
 *   ChatException,
 *   ChatValidationException,
 *   ChatPermissionException,
 *   ChatBusinessException
 * } from '@/lib/exceptions/chat';
 *
 * @author CoUp Team
 * @created 2025-12-04
 */

// Base Exception
export { default as ChatException } from './ChatException.js';

// Sub-class Exceptions (새 패턴)
export { default as ChatValidationException } from './ChatValidationException.js';
export { default as ChatPermissionException } from './ChatPermissionException.js';
export { default as ChatBusinessException } from './ChatBusinessException.js';

// Legacy Exceptions (하위 호환성 유지)
export { ChatException as LegacyChatException } from './ChatException.js';
export { ChatConnectionException } from './ConnectionException.js';
export { ChatMessageException } from './MessageException.js';
export { ChatSyncException } from './SyncException.js';
export { ChatFileException } from './FileException.js';
export { ChatUIException } from './UIException.js';


