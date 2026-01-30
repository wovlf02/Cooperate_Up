# ⚠️ 파일 예외 클래스

## 개요

파일 관련 예외 처리를 위한 클래스입니다.

**파일 위치**: `src/lib/exceptions/study/StudyException.js`

---

## StudyFileException

`StudyException`을 상속받은 파일 전용 예외 클래스입니다.

```javascript
export class StudyFileException extends StudyException {
  constructor(code, message, options = {}) {
    super(code, message, {
      ...options,
      category: 'file',
    });
    this.name = 'StudyFileException';
  }
}
```

---

## 예외 목록

| 코드 | 메서드 | HTTP | 설명 |
|------|--------|------|------|
| STUDY-086 | noFileSelected | 400 | 파일 미선택 |
| STUDY-087 | fileSizeExceeded | 413 | 파일 크기 초과 |
| STUDY-088 | invalidFileType | 400 | 허용되지 않은 파일 형식 |
| STUDY-089 | maliciousFileDetected | 403 | 악성 파일 감지 |
| STUDY-090 | storageQuotaExceeded | 507 | 저장 공간 부족 |
| STUDY-091 | fileNameTooLong | 400 | 파일명 너무 김 |
| STUDY-092 | fileUploadFailed | 500 | 파일 업로드 실패 |
| STUDY-093 | fileNotFound | 404 | 파일 없음 |
| STUDY-094 | cannotDeleteFile | 403 | 삭제 권한 없음 |
| STUDY-095 | cannotDownloadFile | 403 | 다운로드 권한 없음 |

---

## 상세 설명

### STUDY-086: 파일 미선택

```javascript
StudyFileException.noFileSelected = function(context = {}) {
  return new StudyFileException(
    'STUDY-086',
    '파일이 선택되지 않았습니다',
    {
      userMessage: '업로드할 파일을 선택해주세요',
      devMessage: 'No file selected for upload',
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context,
    }
  );
};
```

### STUDY-087: 파일 크기 초과

```javascript
StudyFileException.fileSizeExceeded = function(fileSize, maxSize = 50 * 1024 * 1024, context = {}) {
  return new StudyFileException(
    'STUDY-087',
    '파일 크기가 초과되었습니다',
    {
      userMessage: `파일 크기는 최대 ${Math.round(maxSize / 1024 / 1024)}MB까지 업로드할 수 있습니다`,
      devMessage: `File size ${fileSize} exceeds maximum ${maxSize}`,
      statusCode: 413,
      retryable: false,
      severity: 'medium',
      context: { fileSize, maxSize, ...context },
    }
  );
};
```

### STUDY-088: 허용되지 않은 파일 형식

```javascript
StudyFileException.invalidFileType = function(fileType, allowedTypes = [], context = {}) {
  return new StudyFileException(
    'STUDY-088',
    '허용되지 않은 파일 형식입니다',
    {
      userMessage: `허용된 파일 형식: ${allowedTypes.join(', ')}`,
      devMessage: `Invalid file type: ${fileType}. Allowed: ${allowedTypes.join(', ')}`,
      statusCode: 400,
      retryable: false,
      severity: 'medium',
      context: { fileType, allowedTypes, ...context },
    }
  );
};
```

### STUDY-089: 악성 파일 감지

```javascript
StudyFileException.maliciousFileDetected = function(fileName, reason, context = {}) {
  return new StudyFileException(
    'STUDY-089',
    '악성 파일이 감지되었습니다',
    {
      userMessage: '보안상 위험한 파일입니다. 업로드할 수 없습니다',
      devMessage: `Malicious file detected: ${fileName}. Reason: ${reason}`,
      statusCode: 403,
      retryable: false,
      severity: 'high',
      context: { fileName, reason, ...context },
    }
  );
};
```

### STUDY-090: 저장 공간 부족

```javascript
StudyFileException.storageQuotaExceeded = function(requiredSize, availableSize, context = {}) {
  return new StudyFileException(
    'STUDY-090',
    '저장 공간이 부족합니다',
    {
      userMessage: '스터디 저장 공간이 부족합니다. 불필요한 파일을 삭제해주세요',
      devMessage: `Storage quota exceeded: required=${requiredSize}, available=${availableSize}`,
      statusCode: 507,
      retryable: false,
      severity: 'high',
      context: { requiredSize, availableSize, ...context },
    }
  );
};
```

### STUDY-091: 파일명 너무 김

```javascript
StudyFileException.fileNameTooLong = function(fileName, maxLength = 255, context = {}) {
  return new StudyFileException(
    'STUDY-091',
    '파일명이 너무 깁니다',
    {
      userMessage: `파일명은 최대 ${maxLength}자까지 가능합니다`,
      devMessage: `File name too long: ${fileName?.length} chars (max: ${maxLength})`,
      statusCode: 400,
      retryable: false,
      severity: 'low',
      context: { fileName, maxLength, actualLength: fileName?.length, ...context },
    }
  );
};
```

### STUDY-092: 파일 업로드 실패

```javascript
StudyFileException.fileUploadFailed = function(fileName, reason, context = {}) {
  return new StudyFileException(
    'STUDY-092',
    '파일 업로드에 실패했습니다',
    {
      userMessage: '파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요',
      devMessage: `File upload failed for ${fileName}: ${reason}`,
      statusCode: 500,
      retryable: true,
      severity: 'high',
      context: { fileName, reason, ...context },
    }
  );
};
```

### STUDY-093: 파일 없음

```javascript
StudyFileException.fileNotFound = function(fileId, context = {}) {
  return new StudyFileException(
    'STUDY-093',
    '파일을 찾을 수 없습니다',
    {
      userMessage: '존재하지 않는 파일입니다',
      devMessage: `File ${fileId} not found`,
      statusCode: 404,
      retryable: false,
      severity: 'medium',
      context: { fileId, ...context },
    }
  );
};
```

### STUDY-094: 삭제 권한 없음

```javascript
StudyFileException.cannotDeleteFile = function(userId, fileId, uploaderId, context = {}) {
  return new StudyFileException(
    'STUDY-094',
    '파일 삭제 권한이 없습니다',
    {
      userMessage: '자신이 업로드한 파일만 삭제할 수 있습니다',
      devMessage: `User ${userId} cannot delete file ${fileId} uploaded by ${uploaderId}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, fileId, uploaderId, ...context },
    }
  );
};
```

### STUDY-095: 다운로드 권한 없음

```javascript
StudyFileException.cannotDownloadFile = function(userId, fileId, context = {}) {
  return new StudyFileException(
    'STUDY-095',
    '파일 다운로드 권한이 없습니다',
    {
      userMessage: '스터디 멤버만 파일을 다운로드할 수 있습니다',
      devMessage: `User ${userId} lacks permission to download file ${fileId}`,
      statusCode: 403,
      retryable: false,
      severity: 'medium',
      context: { userId, fileId, ...context },
    }
  );
};
```

---

## 사용 예시

### 파일 업로드 API

```javascript
import { StudyFileException } from '@/lib/exceptions/study';

// 파일 미선택
if (!file) {
  throw StudyFileException.fileRequired({ studyId });
}

// 파일 크기 초과
if (file.size > maxFileSize) {
  throw StudyFileException.fileSizeTooLarge(file.size, maxFileSize, { studyId });
}

// 보안 검증 실패
if (!securityValidation.valid) {
  throw StudyFileException.invalidFileType(file.type, allowedTypes, {
    studyId,
    errors: securityValidation.errors,
  });
}

// 저장 공간 부족
if (!quotaCheck.allowed) {
  throw StudyFileException.storageQuotaExceeded(file.size, available, {
    studyId,
    quota: quotaCheck.quotaInMB,
    used: quotaCheck.usedInMB,
  });
}
```

### 파일 삭제 API

```javascript
// 파일 없음
if (!file) {
  throw StudyFileException.fileNotFound(fileId, { studyId });
}

// 삭제 권한 없음
if (file.uploaderId !== userId && !['OWNER', 'ADMIN'].includes(member.role)) {
  throw StudyFileException.cannotDeleteFile(userId, fileId, file.uploaderId, {
    studyId,
    userRole: member.role,
  });
}
```

---

## 에러 응답 형식

```json
{
  "success": false,
  "error": {
    "code": "STUDY-087",
    "message": "파일 크기가 초과되었습니다",
    "userMessage": "파일 크기는 최대 10MB까지 업로드할 수 있습니다",
    "context": {
      "fileSize": 15728640,
      "maxSize": 10485760,
      "studyId": "study_123"
    }
  }
}
```

---

## 관련 문서

- [README](./README.md)
- [API](./api.md)
- [화면](./screens.md)
- [보안](./security.md)

