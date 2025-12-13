# 📝 로깅 시스템

## 개요

구조화된 로깅 시스템입니다.

---

## 로그 레벨

| 레벨 | 우선순위 | 설명 |
|------|---------|------|
| DEBUG | 0 | 개발 디버깅 |
| INFO | 1 | 일반 정보 |
| WARN | 2 | 경고 |
| ERROR | 3 | 에러 |
| CRITICAL | 4 | 심각한 에러 |
| SECURITY | 5 | 보안 이벤트 (Admin 전용) |

---

## 환경별 로그 레벨

```javascript
// lib/logging/constants.js
export const MIN_LOG_LEVEL = 
  process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG'
```

| 환경 | 최소 레벨 |
|------|----------|
| development | DEBUG |
| production | INFO |

---

## 로거 클래스

### 기본 로깅

```javascript
import { AdminLogger } from '@/lib/logging/adminLogger'
import { StudyLogger } from '@/lib/logging/studyLogger'

// 레벨별 로깅
AdminLogger.debug('디버그 메시지', { data: '...' })
AdminLogger.info('정보 메시지', { userId: '123' })
AdminLogger.warn('경고 메시지', { action: '...' })
AdminLogger.error('에러 발생', { error: err })
AdminLogger.critical('심각한 에러', { service: '...' })
AdminLogger.security('보안 이벤트', { action: 'failed_login' })
```

### 도메인별 로깅

```javascript
// 관리자 로깅
AdminLogger.logAdminLogin(adminId, { ip: '...' })
AdminLogger.logUserSuspension(adminId, userId, reason)
AdminLogger.logSettingsChange(adminId, settingKey, oldValue, newValue)

// 스터디 로깅
StudyLogger.logStudyCreate(userId, studyId, studyName)
StudyLogger.logStudyJoin(userId, studyId)
StudyLogger.logStudyLeave(userId, studyId)
```

---

## 민감 정보 필터링

자동으로 민감 정보를 마스킹합니다.

```javascript
// 자동으로 민감 정보 마스킹
const sanitized = sanitizeSensitiveData({
  email: 'user@example.com',
  password: 'secret123',      // → '[REDACTED]'
  token: 'jwt-token-here',    // → '[REDACTED]'
  apiKey: 'api-key-here'      // → '[REDACTED]'
})
```

### 필터링 대상

- `password`
- `token`
- `secret`
- `apiKey`
- `sessionId`
- `creditCard`

---

## 로그 출력 형식

### 개발 환경

```
🔑 [2024-12-14T10:30:00.000Z] [INFO] [ADMIN] 사용자 로그인 { userId: '123' }
```

### 프로덕션 환경

```json
{
  "level": "INFO",
  "message": "사용자 로그인",
  "timestamp": "2024-12-14T10:30:00.000Z",
  "domain": "admin",
  "environment": "production",
  "userId": "123"
}
```

---

## 로그 디렉토리

```
coup/logs/
├── app.log              # 애플리케이션 로그
├── error.log            # 에러 로그
├── admin.log            # 관리자 활동 로그
└── security.log         # 보안 로그
```

---

## 로깅 모듈 구조

```
coup/src/lib/logging/
├── index.js             # Export
├── constants.js         # 상수 정의
├── coreLogger.js        # 코어 로거
├── formatters.js        # 포맷터
├── utils.js             # 유틸리티
├── adminLogger.js       # 관리자 로거 (통합)
├── studyLogger.js       # 스터디 로거
├── adminActions.js      # 관리자 액션 로거
├── userLoggers.js       # 사용자 로거
├── studyLoggers.js      # 스터디 로거
├── reportLoggers.js     # 신고 로거
├── settingsLoggers.js   # 설정 로거
├── analyticsLoggers.js  # 분석 로거
├── apiLoggers.js        # API 로거
└── dataLoggers.js       # 데이터 로거
```

---

## 관련 문서

- [스크립트](./scripts.md)
- [README](./README.md)

