# 관리자 - 시스템 설정 API

> 시스템 전역 설정을 조회하고 수정하는 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **기본 엔드포인트** | `/api/admin/settings` |
| **필요 권한** | `SETTINGS_VIEW`, `SETTINGS_UPDATE` |

---

## 📚 엔드포인트 목록

| 엔드포인트 | 메서드 | 권한 | 설명 |
|------------|--------|------|------|
| `/api/admin/settings` | GET | SETTINGS_VIEW | 설정 조회 |
| `/api/admin/settings` | PUT | SETTINGS_UPDATE | 설정 업데이트 |
| `/api/admin/settings/cache` | DELETE | SETTINGS_UPDATE | 캐시 초기화 |
| `/api/admin/settings/history` | GET | SETTINGS_VIEW | 변경 이력 조회 |

---

## 📖 설정 조회

### 요청

```http
GET /api/admin/settings
GET /api/admin/settings?cache=false  # 캐시 무시
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `cache` | boolean | true | 캐시 사용 여부 |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "general": {
      "siteName": {
        "value": "CoUp",
        "type": "string",
        "description": "사이트 이름",
        "updatedAt": "2026-01-15T00:00:00.000Z",
        "updatedBy": "admin-id"
      },
      "siteDescription": {
        "value": "스터디 협업 플랫폼",
        "type": "string",
        "description": "사이트 설명",
        "updatedAt": "2026-01-15T00:00:00.000Z",
        "updatedBy": "admin-id"
      }
    },
    "study": {
      "maxMembersDefault": {
        "value": 20,
        "type": "number",
        "description": "스터디 기본 최대 인원",
        "updatedAt": "2026-01-15T00:00:00.000Z",
        "updatedBy": "admin-id"
      },
      "allowPrivateStudies": {
        "value": true,
        "type": "boolean",
        "description": "비공개 스터디 허용",
        "updatedAt": "2026-01-15T00:00:00.000Z",
        "updatedBy": "admin-id"
      }
    },
    "moderation": {
      "autoSuspendWarnings": {
        "value": 3,
        "type": "number",
        "description": "자동 정지 경고 횟수",
        "updatedAt": "2026-01-15T00:00:00.000Z",
        "updatedBy": "admin-id"
      },
      "reportAutoEscalate": {
        "value": true,
        "type": "boolean",
        "description": "신고 자동 에스컬레이션",
        "updatedAt": "2026-01-15T00:00:00.000Z",
        "updatedBy": "admin-id"
      }
    }
  },
  "cached": true
}
```

---

## ✏️ 설정 업데이트

### 요청

```http
PUT /api/admin/settings
Content-Type: application/json

{
  "settings": [
    {
      "category": "study",
      "key": "maxMembersDefault",
      "value": "30"
    },
    {
      "category": "moderation",
      "key": "autoSuspendWarnings",
      "value": "5"
    }
  ]
}
```

### 요청 본문

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `settings` | array | ✅ | 설정 배열 |
| `settings[].category` | string | ✅ | 설정 카테고리 |
| `settings[].key` | string | ✅ | 설정 키 |
| `settings[].value` | string | ✅ | 설정 값 (문자열) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "설정이 업데이트되었습니다",
  "data": {
    "updated": [
      {
        "category": "study",
        "key": "maxMembersDefault",
        "oldValue": "20",
        "newValue": "30"
      },
      {
        "category": "moderation",
        "key": "autoSuspendWarnings",
        "oldValue": "3",
        "newValue": "5"
      }
    ]
  }
}
```

---

## 🗑️ 캐시 초기화

### 요청

```http
DELETE /api/admin/settings/cache
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "설정 캐시가 초기화되었습니다"
}
```

---

## 📜 변경 이력 조회

### 요청

```http
GET /api/admin/settings/history?page=1&limit=20
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 20 | 페이지당 항목 수 |
| `category` | string | - | 카테고리 필터 |
| `key` | string | - | 키 필터 |
| `adminId` | string | - | 관리자 필터 |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "history-uuid",
        "category": "study",
        "key": "maxMembersDefault",
        "oldValue": "20",
        "newValue": "30",
        "changedBy": {
          "id": "admin-id",
          "name": "관리자",
          "email": "admin@example.com"
        },
        "changedAt": "2026-01-30T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "hasMore": true
    }
  }
}
```

---

## 📊 설정 카테고리

### general (일반)

| 키 | 타입 | 설명 |
|-----|------|------|
| `siteName` | string | 사이트 이름 |
| `siteDescription` | string | 사이트 설명 |
| `maintenanceMode` | boolean | 유지보수 모드 |
| `registrationEnabled` | boolean | 회원가입 허용 |

### study (스터디)

| 키 | 타입 | 설명 |
|-----|------|------|
| `maxMembersDefault` | number | 기본 최대 멤버 수 |
| `maxMembersLimit` | number | 최대 멤버 수 제한 |
| `allowPrivateStudies` | boolean | 비공개 스터디 허용 |
| `allowPasswordProtection` | boolean | 비밀번호 보호 허용 |

### moderation (관리)

| 키 | 타입 | 설명 |
|-----|------|------|
| `autoSuspendWarnings` | number | 자동 정지 경고 횟수 |
| `suspensionDurationDays` | number | 기본 정지 기간 (일) |
| `reportAutoEscalate` | boolean | 신고 자동 에스컬레이션 |
| `urgentReportThreshold` | number | 긴급 신고 임계값 |

### notification (알림)

| 키 | 타입 | 설명 |
|-----|------|------|
| `emailNotifications` | boolean | 이메일 알림 활성화 |
| `pushNotifications` | boolean | 푸시 알림 활성화 |

---

## 🔄 캐싱 전략

- **캐시 TTL**: 5분
- **캐시 무효화**: 설정 업데이트 시 자동 무효화
- **수동 캐시 초기화**: `/api/admin/settings/cache` DELETE 호출

---

## 🔗 관련 문서

- [SystemSettings 모델](../../03_database/models/settings.md)
- [관리자 설정 페이지](../../05_pages/admin/settings.md)
