# 🛠️ 유틸리티

## 개요

클라이언트 및 서버에서 사용하는 유틸리티 함수들입니다.

---

## 파일 구조

```
coup/src/
├── utils/                       # 클라이언트 유틸리티
│   ├── clsx.js                  # 클래스명 결합
│   ├── file.js                  # 파일 유틸리티
│   ├── format.js                # 포맷팅 유틸리티
│   ├── studyColors.js           # 스터디 색상
│   └── time.js                  # 시간 유틸리티
└── lib/utils/                   # 서버 유틸리티
    ├── admin-utils.js           # 관리자 유틸리티
    ├── errors.js                # 에러 유틸리티
    ├── file-security-validator.js # 파일 보안 검증
    ├── input-sanitizer.js       # 입력값 정제
    ├── response.js              # 응답 유틸리티
    ├── study-utils.js           # 스터디 유틸리티
    └── xss-sanitizer.js         # XSS 방어
```

---

## 클라이언트 유틸리티

### format.js - 포맷팅

```javascript
import { 
  truncateText, 
  formatNumber, 
  formatFileSize, 
  getInitials,
  getRoleText,
  getNotificationTypeText 
} from '@/utils/format'

// 텍스트 자르기
truncateText('긴 텍스트입니다...', 50)  // "긴 텍스트입니다..." (말줄임표)

// 숫자 포맷팅
formatNumber(1234567)  // "1,234,567"

// 파일 크기 포맷팅
formatFileSize(1048576)  // "1 MB"

// 이니셜 추출
getInitials('홍길동')  // "홍"

// 역할 텍스트
getRoleText('OWNER')   // "방장"
getRoleText('MEMBER')  // "멤버"

// 알림 타입 텍스트
getNotificationTypeText('NOTICE')  // "공지"
getNotificationTypeText('TASK')    // "할일"
```

### time.js - 시간

```javascript
import { 
  getRelativeTime, 
  formatDate, 
  formatDateTime, 
  formatDateTimeKST,
  getTimeLeft 
} from '@/utils/time'

// 상대 시간
getRelativeTime(new Date())              // "방금 전"
getRelativeTime(Date.now() - 60000)      // "1분 전"
getRelativeTime(Date.now() - 3600000)    // "1시간 전"
getRelativeTime(Date.now() - 86400000)   // "1일 전"

// 날짜 포맷팅
formatDate('2024-12-14')  // "2024년 12월 14일"

// 날짜+시간 포맷팅
formatDateTime('2024-12-14T18:00:00')  // "2024년 12월 14일 18:00"

// KST 시간대 변환
formatDateTimeKST(new Date())  // "2024년 12월 14일 18:30" (KST)

// 마감일까지 남은 시간
getTimeLeft(dueDate)  // { text: '3일 남음', urgent: false, expired: false }
```

### clsx.js - 클래스명 결합

```javascript
import clsx from '@/utils/clsx'

// 기본 사용
clsx('btn', 'btn-primary')  // "btn btn-primary"

// 조건부 클래스
clsx('btn', isActive && 'active')  // isActive가 true면 "btn active"

// 객체 문법
clsx('btn', { active: isActive, disabled: isDisabled })

// 배열 문법
clsx(['btn', 'btn-lg'])  // "btn btn-lg"

// 혼합 사용
clsx('btn', ['btn-lg'], { active: true })  // "btn btn-lg active"
```

### file.js - 파일

```javascript
import { formatBytes } from '@/utils/file'

formatBytes(0)           // "0 Bytes"
formatBytes(1024)        // "1 KB"
formatBytes(1048576)     // "1 MB"
formatBytes(1073741824)  // "1 GB"
```

---

## 서버 유틸리티

### input-sanitizer.js

입력값 정제 유틸리티입니다.

```javascript
import { sanitizeStudyInput, sanitizeMessageInput } from '@/lib/utils/input-sanitizer'

// 스터디 입력 정제
const sanitized = sanitizeStudyInput({
  name: '<script>XSS</script>스터디',      // XSS 제거
  description: '<b>설명</b>',              // 기본 서식 허용
  category: 'PROGRAMMING',                 // 열거형 검증
  maxMembers: '20',                        // 숫자 변환
  tags: ['tag1', 'tag2', ''],             // 빈 태그 제거
})

// 결과
{
  name: '스터디',
  description: '<b>설명</b>',
  category: 'PROGRAMMING',
  maxMembers: 20,
  tags: ['tag1', 'tag2']
}
```

### xss-sanitizer.js

XSS 방어 유틸리티입니다.

```javascript
import { sanitizeHTML, SANITIZE_PRESETS } from '@/lib/utils/xss-sanitizer'

// 순수 텍스트 (모든 HTML 제거)
sanitizeHTML('<script>alert("XSS")</script>Hello', SANITIZE_PRESETS.PLAIN_TEXT)
// 결과: "Hello"

// 기본 서식 (<b>, <i>, <br> 등 허용)
sanitizeHTML('<b>Bold</b><script>XSS</script>', SANITIZE_PRESETS.BASIC_FORMATTING)
// 결과: "<b>Bold</b>"

// 리치 텍스트 (링크, 목록 등 허용)
sanitizeHTML('<a href="http://example.com">Link</a>', SANITIZE_PRESETS.RICH_TEXT)
// 결과: '<a href="http://example.com" target="_blank" rel="noopener noreferrer">Link</a>'

// 마크다운 (마크다운 변환 후 사용)
sanitizeHTML(convertedMarkdown, SANITIZE_PRESETS.MARKDOWN)
```

#### SANITIZE_PRESETS

| 프리셋 | 허용 태그 |
|--------|----------|
| PLAIN_TEXT | 없음 (순수 텍스트만) |
| BASIC_FORMATTING | `<b>`, `<i>`, `<u>`, `<em>`, `<strong>`, `<br>`, `<p>` |
| RICH_TEXT | 기본 + `<a>`, `<ul>`, `<ol>`, `<li>`, `<h1>`~`<h6>`, `<blockquote>`, `<code>`, `<pre>` |
| MARKDOWN | 마크다운 변환용 전체 태그 |

### file-security-validator.js

파일 보안 검증 유틸리티입니다.

```javascript
import { validateFile, ALLOWED_MIME_TYPES } from '@/lib/utils/file-security-validator'

// 파일 검증
const result = validateFile(file)

if (!result.valid) {
  console.log('에러:', result.error)
  // 예: "허용되지 않는 파일 형식입니다"
}
```

### study-utils.js

스터디 관련 유틸리티입니다.

```javascript
import { withStudyErrorHandler, createSuccessResponse } from '@/lib/utils/study-utils'

// 에러 핸들링 래퍼
export const GET = withStudyErrorHandler(async (req, context) => {
  const data = await fetchStudy(context.params.id)
  return createSuccessResponse(data, '스터디 조회 성공')
})
```

---

## 관련 문서

- [Custom Hooks](./hooks.md)
- [API 클라이언트](./api-client.md)
- [README](./README.md)

