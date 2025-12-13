/**
 * 파일 보안 검증 유틸리티
 *
 * 파일 업로드 시 보안 위협을 검증하고 차단합니다.
 *
 * @module file-security-validator
 * @created 2025-12-01
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

// ============================================
// 1. 파일 타입 설정
// ============================================

/**
 * 허용된 파일 타입 및 MIME 타입
 * @constant
 */
export const ALLOWED_FILE_TYPES = {
  // 이미지
  IMAGE: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.tif', '.heic', '.heif'],
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/tiff',
      'image/heic',
      'image/heif',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },

  // 문서
  DOCUMENT: {
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/markdown',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },

  // 압축 파일
  ARCHIVE: {
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    mimeTypes: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
  },

  // 비디오
  VIDEO: {
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
    mimeTypes: [
      'video/mp4',
      'video/x-msvideo',
      'video/quicktime',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/webm',
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
  },

  // 오디오
  AUDIO: {
    extensions: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
    mimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/mp4',
      'audio/flac',
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
  },

  // 코드
  CODE: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.html', '.css', '.json', '.xml'],
    mimeTypes: [
      'text/javascript',
      'application/javascript',
      'text/html',
      'text/css',
      'application/json',
      'application/xml',
      'text/xml',
    ],
    maxSize: 2 * 1024 * 1024, // 2MB
  },
};

/**
 * 위험한 파일 타입 (차단)
 * @constant
 */
export const BLOCKED_FILE_TYPES = {
  extensions: [
    '.exe', '.bat', '.cmd', '.com', '.scr', '.pif',
    '.msi', '.dll', '.sys', '.drv',
    '.sh', '.bash', '.csh',
    '.vbs', '.js', '.jse', '.wsf',
    '.ps1', '.psm1',
  ],
  mimeTypes: [
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/x-executable',
    'application/x-sh',
    'application/x-shellscript',
  ],
};

// ============================================
// 2. 파일 타입 검증
// ============================================

/**
 * 파일 확장자 검증
 *
 * @param {string} filename - 파일명
 * @param {Array<string>} allowedExtensions - 허용된 확장자 목록
 * @returns {object} 검증 결과
 *
 * @example
 * validateFileExtension('image.jpg', ['.jpg', '.png']);
 * // Returns: { valid: true, extension: '.jpg' }
 */
export function validateFileExtension(filename, allowedExtensions = []) {
  if (!filename || typeof filename !== 'string') {
    return {
      valid: false,
      extension: null,
      reason: 'INVALID_FILENAME',
    };
  }

  const ext = path.extname(filename).toLowerCase();

  // 차단 목록 확인
  if (BLOCKED_FILE_TYPES.extensions.includes(ext)) {
    return {
      valid: false,
      extension: ext,
      reason: 'BLOCKED_FILE_TYPE',
    };
  }

  // 허용 목록 확인
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      extension: ext,
      reason: 'EXTENSION_NOT_ALLOWED',
    };
  }

  return {
    valid: true,
    extension: ext,
  };
}

/**
 * MIME 타입 검증
 *
 * @param {string} mimeType - MIME 타입
 * @param {Array<string>} allowedMimeTypes - 허용된 MIME 타입 목록
 * @returns {object} 검증 결과
 *
 * @example
 * validateMimeType('image/jpeg', ['image/jpeg', 'image/png']);
 * // Returns: { valid: true, mimeType: 'image/jpeg' }
 */
export function validateMimeType(mimeType, allowedMimeTypes = []) {
  if (!mimeType || typeof mimeType !== 'string') {
    return {
      valid: false,
      mimeType: null,
      reason: 'INVALID_MIME_TYPE',
    };
  }

  const mime = mimeType.toLowerCase();

  // 차단 목록 확인
  if (BLOCKED_FILE_TYPES.mimeTypes.includes(mime)) {
    return {
      valid: false,
      mimeType: mime,
      reason: 'BLOCKED_MIME_TYPE',
    };
  }

  // 허용 목록 확인
  if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(mime)) {
    return {
      valid: false,
      mimeType: mime,
      reason: 'MIME_TYPE_NOT_ALLOWED',
    };
  }

  return {
    valid: true,
    mimeType: mime,
  };
}

/**
 * 파일 크기 검증
 *
 * @param {number} fileSize - 파일 크기 (바이트)
 * @param {number} maxSize - 최대 크기 (바이트)
 * @returns {object} 검증 결과
 *
 * @example
 * validateFileSize(1024 * 1024, 5 * 1024 * 1024);
 * // Returns: { valid: true, size: 1048576, maxSize: 5242880 }
 */
export function validateFileSize(fileSize, maxSize) {
  if (typeof fileSize !== 'number' || fileSize < 0) {
    return {
      valid: false,
      size: fileSize,
      maxSize,
      reason: 'INVALID_FILE_SIZE',
    };
  }

  if (fileSize > maxSize) {
    return {
      valid: false,
      size: fileSize,
      maxSize,
      reason: 'FILE_TOO_LARGE',
      sizeInMB: (fileSize / (1024 * 1024)).toFixed(2),
      maxSizeInMB: (maxSize / (1024 * 1024)).toFixed(2),
    };
  }

  return {
    valid: true,
    size: fileSize,
    maxSize,
  };
}

// ============================================
// 3. 파일 내용 검증
// ============================================

/**
 * 파일 매직 넘버 검증 (파일 시그니처)
 *
 * @param {Buffer} buffer - 파일 버퍼
 * @returns {object} 검증 결과
 *
 * @example
 * const buffer = fs.readFileSync('image.jpg');
 * validateFileMagicNumber(buffer);
 * // Returns: { valid: true, type: 'image/jpeg', signature: 'FFD8FF' }
 */
export function validateFileMagicNumber(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
    return {
      valid: false,
      reason: 'INVALID_BUFFER',
    };
  }

  // 파일 시그니처 매핑
  const signatures = {
    // 이미지
    'FFD8FF': { type: 'image/jpeg', extension: '.jpg' },
    '89504E47': { type: 'image/png', extension: '.png' },
    '47494638': { type: 'image/gif', extension: '.gif' },
    '52494646': { type: 'image/webp', extension: '.webp' }, // RIFF
    '3C3F786D6C': { type: 'image/svg+xml', extension: '.svg' }, // <?xml

    // 문서
    '25504446': { type: 'application/pdf', extension: '.pdf' },
    'D0CF11E0': { type: 'application/msword', extension: '.doc' }, // MS Office
    '504B0304': { type: 'application/zip', extension: '.zip' }, // ZIP (also docx, xlsx, pptx)

    // 압축
    '52617221': { type: 'application/x-rar-compressed', extension: '.rar' },
    '377ABCAF': { type: 'application/x-7z-compressed', extension: '.7z' },
    '1F8B': { type: 'application/gzip', extension: '.gz' },

    // 비디오/오디오
    '000001BA': { type: 'video/mpeg', extension: '.mpg' },
    '000001B3': { type: 'video/mpeg', extension: '.mpg' },
    '494433': { type: 'audio/mpeg', extension: '.mp3' }, // ID3
    'FFFB': { type: 'audio/mpeg', extension: '.mp3' },
  };

  // 첫 8바이트로 시그니처 확인
  const hex = buffer.slice(0, 8).toString('hex').toUpperCase();

  // 정확한 매칭 시도
  for (const [sig, info] of Object.entries(signatures)) {
    if (hex.startsWith(sig)) {
      return {
        valid: true,
        type: info.type,
        extension: info.extension,
        signature: sig,
      };
    }
  }

  // 텍스트 파일 확인 (UTF-8, ASCII)
  const isText = buffer.slice(0, 100).every(byte =>
    (byte >= 0x20 && byte <= 0x7E) || byte === 0x09 || byte === 0x0A || byte === 0x0D
  );

  if (isText) {
    return {
      valid: true,
      type: 'text/plain',
      extension: '.txt',
      signature: 'TEXT',
    };
  }

  return {
    valid: false,
    reason: 'UNKNOWN_FILE_SIGNATURE',
    signature: hex,
  };
}

/**
 * 악성 코드 패턴 검증 (간단한 휴리스틱)
 *
 * @param {Buffer} buffer - 파일 버퍼
 * @param {string} filename - 파일명
 * @returns {object} 검증 결과
 *
 * @example
 * detectMaliciousPatterns(buffer, 'file.exe');
 * // Returns: { safe: false, threats: ['executable_file'], confidence: 'high' }
 */
export function detectMaliciousPatterns(buffer, filename) {
  const threats = [];

  // 1. 실행 파일 시그니처 확인
  const executableSignatures = [
    '4D5A', // MZ (Windows PE)
    '7F454C46', // ELF (Linux)
    'CAFEBABE', // Java class
  ];

  const hex = buffer.slice(0, 4).toString('hex').toUpperCase();
  if (executableSignatures.some(sig => hex.startsWith(sig))) {
    threats.push('executable_file');
  }

  // 2. 스크립트 패턴 확인
  const text = buffer.toString('utf8', 0, Math.min(buffer.length, 1000));
  const scriptPatterns = [
    /<script/i,
    /eval\s*\(/i,
    /document\.write/i,
    /window\.location/i,
    /\.innerHTML\s*=/i,
  ];

  if (scriptPatterns.some(pattern => pattern.test(text))) {
    threats.push('script_injection');
  }

  // 3. Shell 명령어 패턴
  const shellPatterns = [
    /rm\s+-rf/i,
    /chmod\s+777/i,
    /sudo\s+/i,
    /\/bin\/(sh|bash)/i,
  ];

  if (shellPatterns.some(pattern => pattern.test(text))) {
    threats.push('shell_command');
  }

  // 4. SQL Injection 패턴
  const sqlPatterns = [
    /DROP\s+TABLE/i,
    /DELETE\s+FROM/i,
    /UNION\s+SELECT/i,
  ];

  if (sqlPatterns.some(pattern => pattern.test(text))) {
    threats.push('sql_injection');
  }

  // 5. 의심스러운 파일명
  const suspiciousNames = [
    /\.exe\./i,
    /\.(bat|cmd|scr|pif)$/i,
    /^\.ht/i, // .htaccess
  ];

  if (suspiciousNames.some(pattern => pattern.test(filename))) {
    threats.push('suspicious_filename');
  }

  return {
    safe: threats.length === 0,
    threats,
    confidence: threats.length > 2 ? 'high' : threats.length > 0 ? 'medium' : 'low',
  };
}

// ============================================
// 4. 통합 검증 함수
// ============================================

/**
 * 파일 전체 보안 검증 (통합)
 *
 * @param {object} file - 파일 객체
 * @param {string} file.filename - 파일명
 * @param {string} file.mimeType - MIME 타입
 * @param {number} file.size - 파일 크기
 * @param {Buffer} file.buffer - 파일 버퍼
 * @param {string} category - 파일 카테고리 (IMAGE, DOCUMENT, etc.)
 * @returns {Promise<object>} 검증 결과
 *
 * @example
 * const result = await validateFileSecurity({
 *   filename: 'image.jpg',
 *   mimeType: 'image/jpeg',
 *   size: 1024 * 1024,
 *   buffer: fileBuffer
 * }, 'IMAGE');
 */
export async function validateFileSecurity(file, category = 'DOCUMENT') {
  const errors = [];
  const warnings = [];

  try {
    // 1. 파일 카테고리 설정 가져오기
    const categoryConfig = ALLOWED_FILE_TYPES[category];
    if (!categoryConfig) {
      errors.push({
        code: 'INVALID_CATEGORY',
        message: `유효하지 않은 파일 카테고리: ${category}`,
      });
      return { valid: false, errors, warnings };
    }

    // 2. 확장자 검증
    const extValidation = validateFileExtension(
      file.filename,
      categoryConfig.extensions
    );
    if (!extValidation.valid) {
      errors.push({
        code: extValidation.reason,
        message: `파일 확장자가 허용되지 않습니다: ${extValidation.extension}`,
      });
    }

    // 3. MIME 타입 검증
    const mimeValidation = validateMimeType(
      file.mimeType,
      categoryConfig.mimeTypes
    );
    if (!mimeValidation.valid) {
      errors.push({
        code: mimeValidation.reason,
        message: `MIME 타입이 허용되지 않습니다: ${mimeValidation.mimeType}`,
      });
    }

    // 4. 파일 크기 검증
    const sizeValidation = validateFileSize(file.size, categoryConfig.maxSize);
    if (!sizeValidation.valid) {
      errors.push({
        code: sizeValidation.reason,
        message: `파일 크기가 너무 큽니다: ${sizeValidation.sizeInMB}MB (최대: ${sizeValidation.maxSizeInMB}MB)`,
      });
    }

    // 5. 파일 버퍼가 있으면 추가 검증
    if (file.buffer) {
      // 5-1. 매직 넘버 검증
      const magicValidation = validateFileMagicNumber(file.buffer);
      if (!magicValidation.valid) {
        warnings.push({
          code: magicValidation.reason,
          message: '파일 시그니처를 확인할 수 없습니다.',
        });
      } else if (magicValidation.type !== file.mimeType) {
        warnings.push({
          code: 'MIME_TYPE_MISMATCH',
          message: `MIME 타입 불일치: 선언(${file.mimeType}) vs 실제(${magicValidation.type})`,
        });
      }

      // 5-2. 악성 코드 패턴 검증
      const malwareValidation = detectMaliciousPatterns(file.buffer, file.filename);
      if (!malwareValidation.safe) {
        errors.push({
          code: 'MALICIOUS_CONTENT_DETECTED',
          message: `악성 콘텐츠가 감지되었습니다: ${malwareValidation.threats.join(', ')}`,
          threats: malwareValidation.threats,
          confidence: malwareValidation.confidence,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        category,
      },
    };
  } catch (error) {
    console.error('[File Security] Validation error:', error);
    return {
      valid: false,
      errors: [{
        code: 'VALIDATION_ERROR',
        message: '파일 검증 중 오류가 발생했습니다.',
      }],
      warnings: [],
    };
  }
}

// ============================================
// 5. 저장 공간 관리
// ============================================

/**
 * 사용자 저장 공간 확인
 *
 * @param {string} userId - 사용자 ID
 * @param {number} fileSize - 업로드할 파일 크기
 * @param {number} userQuota - 사용자 할당량 (바이트)
 * @param {number} userUsed - 사용자 사용량 (바이트)
 * @returns {object} 검증 결과
 */
export function checkStorageQuota(userId, fileSize, userQuota, userUsed) {
  const available = userQuota - userUsed;
  const afterUpload = userUsed + fileSize;

  if (afterUpload > userQuota) {
    return {
      allowed: false,
      reason: 'QUOTA_EXCEEDED',
      quota: userQuota,
      used: userUsed,
      available,
      requested: fileSize,
      quotaInMB: (userQuota / (1024 * 1024)).toFixed(2),
      usedInMB: (userUsed / (1024 * 1024)).toFixed(2),
      availableInMB: (available / (1024 * 1024)).toFixed(2),
      requestedInMB: (fileSize / (1024 * 1024)).toFixed(2),
    };
  }

  return {
    allowed: true,
    quota: userQuota,
    used: userUsed,
    available,
    afterUpload,
    usagePercentage: ((afterUpload / userQuota) * 100).toFixed(2),
  };
}

/**
 * 스터디 저장 공간 확인
 *
 * @param {string} studyId - 스터디 ID
 * @param {number} fileSize - 업로드할 파일 크기
 * @param {number} studyQuota - 스터디 할당량 (바이트)
 * @param {number} studyUsed - 스터디 사용량 (바이트)
 * @returns {object} 검증 결과
 */
export function checkStudyStorageQuota(studyId, fileSize, studyQuota, studyUsed) {
  return checkStorageQuota(studyId, fileSize, studyQuota, studyUsed);
}

// ============================================
// 6. 유틸리티 함수
// ============================================

/**
 * 파일 크기 포맷팅
 *
 * @param {number} bytes - 바이트 크기
 * @returns {string} 포맷팅된 크기
 *
 * @example
 * formatFileSize(1536);
 * // Returns: '1.50 KB'
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

/**
 * 안전한 파일명 생성
 *
 * @param {string} originalFilename - 원본 파일명
 * @param {string} userId - 사용자 ID
 * @returns {string} 안전한 파일명
 *
 * @example
 * generateSafeFilename('my file.jpg', 'user123');
 * // Returns: 'user123_1701388800000_my-file.jpg'
 */
export function generateSafeFilename(originalFilename, userId) {
  const ext = path.extname(originalFilename);
  const nameWithoutExt = path.basename(originalFilename, ext);

  const safeName = nameWithoutExt
    .replace(/[^a-zA-Z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  const timestamp = Date.now();
  return `${userId}_${timestamp}_${safeName}${ext}`;
}

// ============================================
// 7. Export
// ============================================

export default {
  // 설정
  ALLOWED_FILE_TYPES,
  BLOCKED_FILE_TYPES,

  // 검증
  validateFileExtension,
  validateMimeType,
  validateFileSize,
  validateFileMagicNumber,
  detectMaliciousPatterns,
  validateFileSecurity,

  // 저장 공간
  checkStorageQuota,
  checkStudyStorageQuota,

  // 유틸리티
  formatFileSize,
  generateSafeFilename,
};

