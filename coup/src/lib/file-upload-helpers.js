/**
 * file-upload-helpers.js
 *
 * 파일 업로드 관련 유틸리티 헬퍼 함수
 * 파일 검증, 저장, 삭제 등의 기능 제공
 *
 * 사용 예시:
 * ```js
 * import { validateFileType, validateFileSize, saveUploadedFile } from '@/lib/file-upload-helpers'
 *
 * const typeCheck = validateFileType(filename, ALLOWED_FILE_TYPES.documents)
 * const sizeCheck = validateFileSize(fileSize)
 * const savedPath = await saveUploadedFile(file, 'studies')
 * ```
 *
 * @module lib/file-upload-helpers
 */

import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

// ============================================
// 상수 정의
// ============================================

/**
 * 파일 크기 제한 (바이트)
 */
export const FILE_SIZE_LIMITS = {
  AVATAR: 5 * 1024 * 1024,        // 5MB - 프로필 이미지
  IMAGE: 10 * 1024 * 1024,         // 10MB - 일반 이미지
  DOCUMENT: 50 * 1024 * 1024,      // 50MB - 문서
  VIDEO: 500 * 1024 * 1024,        // 500MB - 비디오
  DEFAULT: 50 * 1024 * 1024        // 50MB - 기본값
}

/**
 * 허용된 파일 타입 (확장자 기준)
 */
export const ALLOWED_FILE_TYPES = {
  // 이미지
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],

  // 문서
  documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'hwp'],

  // 압축 파일
  archives: ['zip', 'rar', '7z', 'tar', 'gz'],

  // 코드
  code: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rb', 'php', 'html', 'css', 'json', 'xml', 'sql'],

  // 비디오
  videos: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],

  // 오디오
  audios: ['mp3', 'wav', 'ogg', 'flac', 'm4a']
}

/**
 * 모든 허용된 파일 타입 (평탄화)
 */
export const ALL_ALLOWED_FILE_TYPES = Object.values(ALLOWED_FILE_TYPES).flat()

/**
 * MIME 타입 매핑
 */
export const MIME_TYPE_MAP = {
  // 이미지
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',

  // 문서
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'txt': 'text/plain',
  'hwp': 'application/haansofthwp',

  // 압축
  'zip': 'application/zip',
  'rar': 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',

  // 코드
  'js': 'text/javascript',
  'json': 'application/json',
  'html': 'text/html',
  'css': 'text/css',
  'xml': 'application/xml',

  // 비디오
  'mp4': 'video/mp4',
  'webm': 'video/webm',

  // 오디오
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'ogg': 'audio/ogg'
}

/**
 * 위험한 파일 확장자 (실행 가능 파일)
 */
export const DANGEROUS_FILE_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
  'app', 'deb', 'rpm', 'dmg', 'pkg', 'run', 'sh', 'bash'
]

// ============================================
// 파일 검증 함수
// ============================================

/**
 * 파일 타입 검증 (확장자 기반)
 *
 * @param {string} filename - 파일 이름
 * @param {Array<string>} allowedExtensions - 허용된 확장자 목록
 * @returns {Object} { valid: boolean, extension?: string, error?: string }
 *
 * @example
 * validateFileType('document.pdf', ALLOWED_FILE_TYPES.documents)
 */
export function validateFileType(filename, allowedExtensions = ALL_ALLOWED_FILE_TYPES) {
  if (!filename || typeof filename !== 'string') {
    return { valid: false, error: '파일 이름이 올바르지 않습니다' }
  }

  const ext = getFileExtension(filename)

  if (!ext) {
    return { valid: false, error: '파일 확장자를 찾을 수 없습니다' }
  }

  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `허용되지 않은 파일 형식입니다. 허용: ${allowedExtensions.join(', ')}`
    }
  }

  return { valid: true, extension: ext }
}

/**
 * 파일 크기 검증
 *
 * @param {number} fileSize - 파일 크기 (바이트)
 * @param {number} maxSize - 최대 크기 (바이트)
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateFileSize(fileSize, maxSize = FILE_SIZE_LIMITS.DEFAULT) {
  if (typeof fileSize !== 'number' || fileSize < 0) {
    return { valid: false, error: '파일 크기가 올바르지 않습니다' }
  }

  if (fileSize === 0) {
    return { valid: false, error: '빈 파일은 업로드할 수 없습니다' }
  }

  if (fileSize > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2)
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2)

    return {
      valid: false,
      error: `파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다 (현재: ${fileSizeMB}MB)`
    }
  }

  return { valid: true }
}

/**
 * 위험한 파일 검증
 *
 * @param {string} filename - 파일 이름
 * @returns {Object} { safe: boolean, error?: string }
 */
export function validateFileSafety(filename) {
  const ext = getFileExtension(filename)

  if (!ext) {
    return { safe: true }
  }

  // 실행 가능한 파일 확장자 차단
  if (DANGEROUS_FILE_EXTENSIONS.includes(ext)) {
    return {
      safe: false,
      error: '보안상 위험한 파일 형식입니다'
    }
  }

  // 이중 확장자 검사 (예: file.pdf.exe)
  const parts = filename.split('.')
  if (parts.length > 2) {
    const secondExt = parts[parts.length - 2].toLowerCase()
    if (DANGEROUS_FILE_EXTENSIONS.includes(secondExt)) {
      return {
        safe: false,
        error: '이중 확장자가 감지되었습니다'
      }
    }
  }

  return { safe: true }
}

/**
 * 파일 이름 검증 (특수문자, 길이)
 *
 * @param {string} filename - 파일 이름
 * @returns {Object} { valid: boolean, sanitized?: string, error?: string }
 */
export function validateFileName(filename) {
  if (!filename || typeof filename !== 'string') {
    return { valid: false, error: '파일 이름이 올바르지 않습니다' }
  }

  // 길이 검증 (최대 255자)
  if (filename.length > 255) {
    return { valid: false, error: '파일 이름은 255자를 초과할 수 없습니다' }
  }

  // 파일 이름에 경로 구분자가 있는지 검사
  if (filename.includes('/') || filename.includes('\\')) {
    return { valid: false, error: '파일 이름에 경로 구분자를 포함할 수 없습니다' }
  }

  // 위험한 문자 검사
  const dangerousChars = /[<>:"|?*\x00-\x1f]/
  if (dangerousChars.test(filename)) {
    return { valid: false, error: '파일 이름에 허용되지 않은 문자가 포함되어 있습니다' }
  }

  // 안전한 파일 이름으로 정리
  const sanitized = sanitizeFileName(filename)

  return { valid: true, sanitized }
}

/**
 * 종합 파일 검증
 *
 * @param {Object} file - 파일 객체 { name, size, type }
 * @param {Object} options - 검증 옵션
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateFile(file, options = {}) {
  const {
    allowedTypes = ALL_ALLOWED_FILE_TYPES,
    maxSize = FILE_SIZE_LIMITS.DEFAULT,
    checkSafety = true
  } = options

  const errors = []

  // 1. 파일 존재 확인
  if (!file) {
    return { valid: false, errors: [{ field: 'file', message: '파일을 선택해주세요' }] }
  }

  // 2. 파일 이름 검증
  const nameCheck = validateFileName(file.name)
  if (!nameCheck.valid) {
    errors.push({ field: 'file', message: nameCheck.error })
  }

  // 3. 파일 타입 검증
  const typeCheck = validateFileType(file.name, allowedTypes)
  if (!typeCheck.valid) {
    errors.push({ field: 'file', message: typeCheck.error })
  }

  // 4. 파일 크기 검증
  const sizeCheck = validateFileSize(file.size, maxSize)
  if (!sizeCheck.valid) {
    errors.push({ field: 'file', message: sizeCheck.error })
  }

  // 5. 보안 검증
  if (checkSafety) {
    const safetyCheck = validateFileSafety(file.name)
    if (!safetyCheck.safe) {
      errors.push({ field: 'file', message: safetyCheck.error })
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      name: nameCheck.sanitized,
      size: file.size,
      type: file.type,
      extension: typeCheck.extension
    }
  }
}

// ============================================
// 파일 저장/삭제 함수
// ============================================

/**
 * 업로드된 파일 저장
 *
 * @param {File} file - 파일 객체
 * @param {string} category - 카테고리 (예: 'studies', 'avatars')
 * @param {Object} options - 저장 옵션
 * @returns {Promise<Object>} { success: boolean, path?: string, url?: string, error?: string }
 */
export async function saveUploadedFile(file, category = 'uploads', options = {}) {
  const {
    useOriginalName = false,
    subDirectory = null
  } = options

  try {
    // 1. 파일 검증
    const validation = validateFile(file)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors[0].message
      }
    }

    // 2. 저장 디렉토리 설정
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', category)
    const targetDir = subDirectory
      ? path.join(uploadDir, subDirectory)
      : uploadDir

    // 디렉토리 생성
    await fs.mkdir(targetDir, { recursive: true })

    // 3. 파일 이름 생성
    const filename = useOriginalName
      ? validation.data.name
      : generateUniqueFileName(validation.data.name)

    const filePath = path.join(targetDir, filename)

    // 4. 파일 저장
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    // 5. URL 생성
    const urlPath = subDirectory
      ? `/uploads/${category}/${subDirectory}/${filename}`
      : `/uploads/${category}/${filename}`

    return {
      success: true,
      path: filePath,
      url: urlPath,
      filename,
      size: file.size,
      type: file.type
    }

  } catch (error) {
    console.error('파일 저장 실패:', error)
    return {
      success: false,
      error: '파일 저장에 실패했습니다'
    }
  }
}

/**
 * 파일 삭제
 *
 * @param {string} filePath - 파일 경로 (또는 URL)
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function deleteFile(filePath) {
  try {
    // URL을 파일 시스템 경로로 변환
    let fsPath = filePath

    if (filePath.startsWith('/uploads/')) {
      fsPath = path.join(process.cwd(), 'public', filePath)
    } else if (filePath.startsWith('uploads/')) {
      fsPath = path.join(process.cwd(), 'public', filePath)
    }

    // 파일 존재 확인
    try {
      await fs.access(fsPath)
    } catch {
      return { success: true } // 파일이 이미 없으면 성공으로 처리
    }

    // 파일 삭제
    await fs.unlink(fsPath)

    return { success: true }

  } catch (error) {
    console.error('파일 삭제 실패:', error)
    return {
      success: false,
      error: '파일 삭제에 실패했습니다'
    }
  }
}

/**
 * 저장 공간 확인
 *
 * @param {string} directory - 디렉토리 경로
 * @returns {Promise<Object>} { available: boolean, used: number, limit: number }
 */
export async function checkStorageQuota(directory = 'public/uploads') {
  try {
    const targetDir = path.join(process.cwd(), directory)

    // 디렉토리 크기 계산
    const size = await getDirectorySize(targetDir)

    // 저장 공간 제한 (예: 10GB)
    const STORAGE_LIMIT = 10 * 1024 * 1024 * 1024 // 10GB

    return {
      available: size < STORAGE_LIMIT,
      used: size,
      limit: STORAGE_LIMIT,
      usedMB: (size / 1024 / 1024).toFixed(2),
      limitMB: (STORAGE_LIMIT / 1024 / 1024).toFixed(2)
    }

  } catch (error) {
    console.error('저장 공간 확인 실패:', error)
    return {
      available: true, // 오류 시 허용으로 처리
      used: 0,
      limit: 0
    }
  }
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 파일 확장자 추출
 *
 * @param {string} filename - 파일 이름
 * @returns {string|null} 확장자 (소문자)
 */
export function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') {
    return null
  }

  const parts = filename.split('.')

  if (parts.length < 2) {
    return null
  }

  return parts[parts.length - 1].toLowerCase()
}

/**
 * MIME 타입 추출
 *
 * @param {string} filename - 파일 이름
 * @returns {string} MIME 타입
 */
export function getMimeType(filename) {
  const ext = getFileExtension(filename)
  return MIME_TYPE_MAP[ext] || 'application/octet-stream'
}

/**
 * 파일 이름 정리 (안전한 이름으로 변환)
 *
 * @param {string} filename - 원본 파일 이름
 * @returns {string} 정리된 파일 이름
 */
export function sanitizeFileName(filename) {
  // 확장자 분리
  const ext = getFileExtension(filename)
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'))

  // 안전하지 않은 문자 제거/변환
  let sanitized = nameWithoutExt
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // 위험한 문자 제거
    .replace(/\s+/g, '_')                // 공백을 언더스코어로
    .replace(/[^\w\-_.가-힣]/g, '')      // 허용된 문자만 남김
    .substring(0, 200)                   // 길이 제한

  // 확장자 재결합
  return ext ? `${sanitized}.${ext}` : sanitized
}

/**
 * 고유한 파일 이름 생성
 *
 * @param {string} originalName - 원본 파일 이름
 * @returns {string} 고유한 파일 이름
 */
export function generateUniqueFileName(originalName) {
  const ext = getFileExtension(originalName)
  const timestamp = Date.now()
  const randomString = crypto.randomBytes(8).toString('hex')

  return ext
    ? `${timestamp}-${randomString}.${ext}`
    : `${timestamp}-${randomString}`
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 *
 * @param {number} bytes - 바이트 크기
 * @returns {string} 포맷된 문자열
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 디렉토리 크기 계산 (재귀)
 *
 * @param {string} directory - 디렉토리 경로
 * @returns {Promise<number>} 총 크기 (바이트)
 */
export async function getDirectorySize(directory) {
  let totalSize = 0

  try {
    const files = await fs.readdir(directory)

    for (const file of files) {
      const filePath = path.join(directory, file)
      const stats = await fs.stat(filePath)

      if (stats.isDirectory()) {
        totalSize += await getDirectorySize(filePath)
      } else {
        totalSize += stats.size
      }
    }
  } catch (error) {
    // 디렉토리가 없거나 접근 불가한 경우 0 반환
    return 0
  }

  return totalSize
}

/**
 * 파일 타입 카테고리 판별
 *
 * @param {string} filename - 파일 이름
 * @returns {string} 카테고리 ('image', 'document', 'video', 'audio', 'archive', 'code', 'other')
 */
export function getFileCategory(filename) {
  const ext = getFileExtension(filename)

  if (!ext) return 'other'

  for (const [category, extensions] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (extensions.includes(ext)) {
      return category.replace(/s$/, '') // 복수형 제거 (images -> image)
    }
  }

  return 'other'
}

/**
 * 이미지 파일 여부 확인
 *
 * @param {string} filename - 파일 이름
 * @returns {boolean} 이미지 여부
 */
export function isImageFile(filename) {
  const ext = getFileExtension(filename)
  return ALLOWED_FILE_TYPES.images.includes(ext)
}

