# 🔒 파일 보안

## 개요

파일 업로드 시 다양한 보안 위협을 검증하고 차단하는 시스템입니다.

**파일 위치**: `src/lib/utils/file-security-validator.js`

---

## 보안 검증 단계

```
┌─────────────────────────────────────────────────────────┐
│                    파일 업로드                          │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  1. 파일명 정제 (sanitizeFilename)                      │
│     - XSS 패턴 제거                                     │
│     - 특수문자 필터링                                   │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  2. 확장자 검증 (validateFileExtension)                 │
│     - 차단 목록 확인 (.exe, .bat, ...)                  │
│     - 허용 목록 확인                                    │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  3. MIME 타입 검증 (validateMimeType)                   │
│     - 차단 MIME 타입 확인                               │
│     - 허용 MIME 타입 확인                               │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  4. 파일 크기 검증 (validateFileSize)                   │
│     - 카테고리별 최대 크기 확인                         │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  5. 매직 넘버 검증 (validateFileMagicNumber)            │
│     - 파일 시그니처 확인                                │
│     - MIME 타입 일치 확인                               │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  6. 악성 코드 패턴 탐지 (detectMaliciousPatterns)       │
│     - 실행 파일 시그니처                                │
│     - 스크립트 인젝션 패턴                              │
│     - Shell 명령어 패턴                                 │
│     - SQL 인젝션 패턴                                   │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  7. 저장 공간 확인 (checkStudyStorageQuota)             │
│     - 스터디당 1GB 제한                                 │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    업로드 완료 ✅                        │
└─────────────────────────────────────────────────────────┘
```

---

## 차단 파일 타입

### 실행 파일

```javascript
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.scr', '.pif',
  '.msi', '.dll', '.sys', '.drv',
  '.sh', '.bash', '.csh',
  '.vbs', '.js', '.jse', '.wsf',
  '.ps1', '.psm1',
];
```

### 차단 MIME 타입

```javascript
const BLOCKED_MIME_TYPES = [
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-sh',
  'application/x-shellscript',
];
```

---

## 허용 파일 타입

### IMAGE

```javascript
{
  extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.heic'],
  mimeTypes: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'image/svg+xml', 'image/bmp', 'image/x-icon', 'image/tiff',
  ],
  maxSize: 10 * 1024 * 1024, // 10MB
}
```

### DOCUMENT

```javascript
{
  extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md'],
  mimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/markdown',
  ],
  maxSize: 10 * 1024 * 1024, // 10MB
}
```

### ARCHIVE

```javascript
{
  extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
  mimeTypes: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
  ],
  maxSize: 50 * 1024 * 1024, // 50MB
}
```

### VIDEO

```javascript
{
  extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
  mimeTypes: [
    'video/mp4', 'video/x-msvideo', 'video/quicktime',
    'video/x-ms-wmv', 'video/x-flv', 'video/webm',
  ],
  maxSize: 100 * 1024 * 1024, // 100MB
}
```

### AUDIO

```javascript
{
  extensions: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
  mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac'],
  maxSize: 20 * 1024 * 1024, // 20MB
}
```

### CODE

```javascript
{
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.html', '.css', '.json', '.xml'],
  mimeTypes: [
    'text/javascript', 'application/javascript',
    'text/html', 'text/css', 'application/json',
    'application/xml', 'text/xml',
  ],
  maxSize: 2 * 1024 * 1024, // 2MB
}
```

---

## 매직 넘버 검증

파일의 실제 내용을 확인하여 위장된 파일을 탐지합니다.

### 파일 시그니처

```javascript
const signatures = {
  // 이미지
  'FFD8FF': { type: 'image/jpeg', extension: '.jpg' },
  '89504E47': { type: 'image/png', extension: '.png' },
  '47494638': { type: 'image/gif', extension: '.gif' },
  '52494646': { type: 'image/webp', extension: '.webp' },

  // 문서
  '25504446': { type: 'application/pdf', extension: '.pdf' },
  'D0CF11E0': { type: 'application/msword', extension: '.doc' },
  '504B0304': { type: 'application/zip', extension: '.zip' },

  // 압축
  '52617221': { type: 'application/x-rar-compressed', extension: '.rar' },
  '377ABCAF': { type: 'application/x-7z-compressed', extension: '.7z' },
  '1F8B': { type: 'application/gzip', extension: '.gz' },

  // 오디오
  '494433': { type: 'audio/mpeg', extension: '.mp3' }, // ID3
  'FFFB': { type: 'audio/mpeg', extension: '.mp3' },
};
```

### MIME 타입 불일치 경고

```javascript
if (magicValidation.type !== file.mimeType) {
  warnings.push({
    code: 'MIME_TYPE_MISMATCH',
    message: `MIME 타입 불일치: 선언(${file.mimeType}) vs 실제(${magicValidation.type})`,
  });
}
```

---

## 악성 코드 탐지

### 실행 파일 시그니처

```javascript
const executableSignatures = [
  '4D5A',     // MZ (Windows PE)
  '7F454C46', // ELF (Linux)
  'CAFEBABE', // Java class
];
```

### 스크립트 인젝션 패턴

```javascript
const scriptPatterns = [
  /<script/i,
  /eval\s*\(/i,
  /document\.write/i,
  /window\.location/i,
  /\.innerHTML\s*=/i,
];
```

### Shell 명령어 패턴

```javascript
const shellPatterns = [
  /rm\s+-rf/i,
  /chmod\s+777/i,
  /sudo\s+/i,
  /\/bin\/(sh|bash)/i,
];
```

### SQL 인젝션 패턴

```javascript
const sqlPatterns = [
  /DROP\s+TABLE/i,
  /DELETE\s+FROM/i,
  /UNION\s+SELECT/i,
];
```

### 의심스러운 파일명

```javascript
const suspiciousNames = [
  /\.exe\./i,                    // 이중 확장자
  /\.(bat|cmd|scr|pif)$/i,       // 실행 파일
  /^\.ht/i,                      // .htaccess
];
```

---

## 통합 검증 함수

```javascript
export async function validateFileSecurity(file, category = 'DOCUMENT') {
  const errors = [];
  const warnings = [];

  // 1. 카테고리 설정 확인
  const categoryConfig = ALLOWED_FILE_TYPES[category];
  
  // 2. 확장자 검증
  const extValidation = validateFileExtension(file.filename, categoryConfig.extensions);
  
  // 3. MIME 타입 검증
  const mimeValidation = validateMimeType(file.mimeType, categoryConfig.mimeTypes);
  
  // 4. 파일 크기 검증
  const sizeValidation = validateFileSize(file.size, categoryConfig.maxSize);
  
  // 5. 매직 넘버 검증
  const magicValidation = validateFileMagicNumber(file.buffer);
  
  // 6. 악성 코드 패턴 탐지
  const malwareValidation = detectMaliciousPatterns(file.buffer, file.filename);

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
}
```

---

## 저장 공간 관리

### 스터디 할당량

```javascript
const STUDY_QUOTA = 1024 * 1024 * 1024; // 1GB

export function checkStudyStorageQuota(studyId, fileSize, studyQuota, studyUsed) {
  const available = studyQuota - studyUsed;
  const afterUpload = studyUsed + fileSize;

  if (afterUpload > studyQuota) {
    return {
      allowed: false,
      reason: 'QUOTA_EXCEEDED',
      quotaInMB: (studyQuota / (1024 * 1024)).toFixed(2),
      usedInMB: (studyUsed / (1024 * 1024)).toFixed(2),
      availableInMB: (available / (1024 * 1024)).toFixed(2),
    };
  }

  return {
    allowed: true,
    usagePercentage: ((afterUpload / studyQuota) * 100).toFixed(2),
  };
}
```

---

## 안전한 파일명 생성

```javascript
export function generateSafeFilename(originalFilename, userId) {
  const ext = path.extname(originalFilename);
  const nameWithoutExt = path.basename(originalFilename, ext);

  // 안전한 문자만 허용
  const safeName = nameWithoutExt
    .replace(/[^a-zA-Z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  const timestamp = Date.now();
  return `${userId}_${timestamp}_${safeName}${ext}`;
}
```

**예시**

```
원본: "my file (2023).pdf"
결과: "user_123_1701388800000_my-file-2023-.pdf"
```

---

## 보안 로깅

```javascript
// 검증 실패 로깅
console.warn('[File Security] Validation failed:', {
  userId: session.user.id,
  studyId,
  filename: sanitizedFilename,
  errors: securityValidation.errors,
});

// 경고 로깅
console.warn('[File Security] Warnings:', {
  userId: session.user.id,
  studyId,
  filename: sanitizedFilename,
  warnings: securityValidation.warnings,
});

// 보안 위협 로깅
console.error('[SECURITY] File access attempt from different study:', {
  userId: session.user.id,
  fileId,
  fileStudyId: file.studyId,
  requestedStudyId: studyId
});
```

---

## 관련 문서

- [README](./README.md)
- [API](./api.md)
- [화면](./screens.md)
- [예외](./exceptions.md)

