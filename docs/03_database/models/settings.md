# ⚙️ Settings (설정) 모델

## 📋 개요

`SystemSetting` 모델은 시스템 전역 설정을 저장합니다. 일반 설정, 보안 설정, 알림 설정, 기능 토글 등을 관리합니다.

---

## 📊 스키마 정의

```prisma
model SystemSetting {
  id          String   @id @default(cuid())
  category    String
  key         String   @unique
  value       String   @db.Text
  type        String
  description String?
  updatedAt   DateTime @updatedAt
  updatedBy   String

  @@index([category])
  @@index([key])
}
```

---

## 🏷️ 필드 상세

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| `id` | String | ✅ | cuid() | 고유 식별자 |
| `category` | String | ✅ | - | 설정 카테고리 |
| `key` | String | ✅ | - | 설정 키 (유니크) |
| `value` | String | ✅ | - | 설정 값 (Text) |
| `type` | String | ✅ | - | 값 타입 (string, number, boolean, json) |
| `description` | String | ❌ | null | 설정 설명 |
| `updatedAt` | DateTime | ✅ | 자동 | 수정 일시 |
| `updatedBy` | String | ✅ | - | 수정한 관리자 ID |

---

## 📂 설정 카테고리

### general (일반 설정)

| 키 | 타입 | 설명 | 기본값 |
|----|------|------|--------|
| `site_name` | string | 사이트 이름 | "CoUp" |
| `site_description` | string | 사이트 설명 | "스터디 협업 플랫폼" |
| `max_study_members` | number | 스터디 최대 멤버 수 | 50 |
| `max_file_size` | number | 최대 파일 크기 (MB) | 10 |
| `maintenance_mode` | boolean | 유지보수 모드 | false |

### security (보안 설정)

| 키 | 타입 | 설명 | 기본값 |
|----|------|------|--------|
| `min_password_length` | number | 최소 비밀번호 길이 | 8 |
| `require_email_verification` | boolean | 이메일 인증 필수 | true |
| `max_login_attempts` | number | 최대 로그인 시도 횟수 | 5 |
| `session_timeout` | number | 세션 타임아웃 (분) | 1440 |
| `allow_oauth` | boolean | 소셜 로그인 허용 | true |

### notification (알림 설정)

| 키 | 타입 | 설명 | 기본값 |
|----|------|------|--------|
| `enable_email_notifications` | boolean | 이메일 알림 활성화 | true |
| `enable_push_notifications` | boolean | 푸시 알림 활성화 | true |
| `notification_retention_days` | number | 알림 보관 기간 (일) | 30 |

### feature (기능 토글)

| 키 | 타입 | 설명 | 기본값 |
|----|------|------|--------|
| `enable_video_call` | boolean | 화상 통화 기능 | true |
| `enable_file_upload` | boolean | 파일 업로드 기능 | true |
| `enable_study_creation` | boolean | 스터디 생성 기능 | true |
| `enable_chat` | boolean | 채팅 기능 | true |
| `enable_registration` | boolean | 회원가입 허용 | true |

---

## 🔍 인덱스

| 인덱스 | 필드 | 용도 |
|--------|------|------|
| `@@index([category])` | category | 카테고리별 설정 조회 |
| `@@index([key])` | key | 키로 빠른 조회 |

---

## 💡 사용 예시

### 설정 조회 (단일)
```javascript
const setting = await prisma.systemSetting.findUnique({
  where: { key: 'max_file_size' }
});

const maxFileSize = parseInt(setting.value, 10);
```

### 카테고리별 설정 조회
```javascript
const securitySettings = await prisma.systemSetting.findMany({
  where: { category: 'security' }
});

// 객체로 변환
const settings = securitySettings.reduce((acc, s) => {
  acc[s.key] = parseValue(s.value, s.type);
  return acc;
}, {});

function parseValue(value, type) {
  switch (type) {
    case 'number': return parseInt(value, 10);
    case 'boolean': return value === 'true';
    case 'json': return JSON.parse(value);
    default: return value;
  }
}
```

### 설정 업데이트
```javascript
await prisma.systemSetting.update({
  where: { key: 'maintenance_mode' },
  data: {
    value: 'true',
    updatedBy: adminId
  }
});
```

### 설정 생성/업데이트 (Upsert)
```javascript
await prisma.systemSetting.upsert({
  where: { key: 'new_feature_flag' },
  update: {
    value: 'true',
    updatedBy: adminId
  },
  create: {
    category: 'feature',
    key: 'new_feature_flag',
    value: 'true',
    type: 'boolean',
    description: '새 기능 활성화',
    updatedBy: adminId
  }
});
```

### 설정 캐싱 (Redis)
```javascript
import { redis } from '@/lib/redis';

const CACHE_KEY = 'system_settings';
const CACHE_TTL = 3600; // 1시간

async function getSettings() {
  // 캐시 확인
  const cached = await redis.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  // DB에서 조회
  const settings = await prisma.systemSetting.findMany();
  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = parseValue(s.value, s.type);
    return acc;
  }, {});

  // 캐시 저장
  await redis.set(CACHE_KEY, JSON.stringify(settingsMap), 'EX', CACHE_TTL);

  return settingsMap;
}

// 설정 변경 시 캐시 무효화
async function updateSetting(key, value, adminId) {
  await prisma.systemSetting.update({
    where: { key },
    data: { value: String(value), updatedBy: adminId }
  });

  await redis.del(CACHE_KEY);
}
```

---

## 🔧 설정 시딩 스크립트

```javascript
// scripts/seed-settings.js

const defaultSettings = [
  { category: 'general', key: 'site_name', value: 'CoUp', type: 'string' },
  { category: 'general', key: 'max_study_members', value: '50', type: 'number' },
  { category: 'security', key: 'min_password_length', value: '8', type: 'number' },
  { category: 'feature', key: 'enable_video_call', value: 'true', type: 'boolean' },
  // ...
];

async function seedSettings() {
  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        ...setting,
        updatedBy: 'system'
      }
    });
  }
}
```

---

## 🔗 관련 문서

- [관리자 모델](./admin.md)
- [설정 API](../../04_api/admin/settings.md)
- [환경 변수](../../11_configuration/environment-variables.md)
