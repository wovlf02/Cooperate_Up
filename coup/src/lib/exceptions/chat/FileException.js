import ChatException from './ChatException.js';

/**
 * Chat 파일 예외 클래스
 *
 * @description
 * 파일 업로드/다운로드 관련 예외를 처리
 * - 업로드 실패
 * - 크기/형식 제한
 * - 다운로드 실패
 * - 미리보기 오류
 *
 * @extends ChatException
 */
export class ChatFileException extends ChatException {
  constructor(code, message, details = {}) {
    super(code, message, {
      ...details,
      category: 'file'
    });
    this.name = 'ChatFileException';
  }

  /**
   * 파일 업로드 실패
   */
  static uploadFailed(fileName, context = {}) {
    return new ChatFileException(
      'CHAT-FILE-001',
      'File upload failed',
      {
        userMessage: '파일 업로드에 실패했습니다',
        devMessage: `Failed to upload file: ${fileName}`,
        retryable: true,
        context: { ...context, fileName }
      }
    );
  }

  /**
   * 파일 크기 초과
   */
  static sizeLimitExceeded(fileSize, maxSize, context = {}) {
    return new ChatFileException(
      'CHAT-FILE-002',
      `File size exceeds limit (${fileSize} > ${maxSize})`,
      {
        userMessage: `파일 크기는 ${Math.round(maxSize / 1024 / 1024)}MB 이하여야 합니다`,
        devMessage: `File size ${fileSize} bytes exceeds maximum ${maxSize} bytes`,
        retryable: false,
        context: { ...context, fileSize, maxSize }
      }
    );
  }

  /**
   * 파일 형식 불가
   */
  static unsupportedType(fileType, allowedTypes, context = {}) {
    return new ChatFileException(
      'CHAT-FILE-003',
      `Unsupported file type: ${fileType}`,
      {
        userMessage: '지원하지 않는 파일 형식입니다',
        devMessage: `File type ${fileType} is not in allowed types: ${allowedTypes.join(', ')}`,
        retryable: false,
        context: { ...context, fileType, allowedTypes }
      }
    );
  }

  /**
   * 파일 다운로드 실패
   */
  static downloadFailed(fileName, context = {}) {
    return new ChatFileException(
      'CHAT-FILE-004',
      'File download failed',
      {
        userMessage: '파일을 다운로드할 수 없습니다',
        devMessage: `Failed to download file: ${fileName}`,
        retryable: true,
        context: { ...context, fileName }
      }
    );
  }

  /**
   * 파일 미리보기 실패
   */
  static previewFailed(fileName, context = {}) {
    return new ChatFileException(
      'CHAT-FILE-005',
      'File preview failed',
      {
        userMessage: '파일 미리보기를 불러올 수 없습니다',
        devMessage: `Failed to generate preview for file: ${fileName}`,
        retryable: true,
        context: { ...context, fileName }
      }
    );
  }

  /**
   * 파일을 찾을 수 없음
   */
  static notFound(fileId, context = {}) {
    return new ChatFileException(
      'CHAT-FILE-006',
      'File not found',
      {
        userMessage: '파일을 찾을 수 없습니다',
        devMessage: `File with ID ${fileId} not found`,
        retryable: false,
        context: { ...context, fileId }
      }
    );
  }
}

