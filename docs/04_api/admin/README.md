# 👑 관리자 API

> 관리자 전용 API 명세 - 시스템 관리, 사용자 관리, 신고 처리 등

---

## 📋 개요

관리자 API는 **ADMIN** 또는 **SUPER_ADMIN** 권한을 가진 사용자만 접근할 수 있습니다. 모든 API 호출은 감사 로그에 기록됩니다.

---

## 🔒 권한 시스템

### 관리자 역할

| 역할 | 설명 | 권한 수준 |
|------|------|-----------|
| `SUPER_ADMIN` | 최고 관리자 | 모든 권한 |
| `ADMIN` | 일반 관리자 | 제한된 권한 |

### 필요 권한 (Permissions)

| 권한 | 설명 |
|------|------|
| `USER_VIEW` | 사용자 목록 조회 |
| `USER_MANAGE` | 사용자 관리 (정지, 경고 등) |
| `STUDY_VIEW` | 스터디 목록 조회 |
| `STUDY_MANAGE` | 스터디 관리 |
| `REPORT_VIEW` | 신고 목록 조회 |
| `REPORT_MANAGE` | 신고 처리 |
| `SETTINGS_VIEW` | 시스템 설정 조회 |
| `SETTINGS_UPDATE` | 시스템 설정 변경 |
| `ANALYTICS_VIEW` | 분석 데이터 조회 |
| `AUDIT_VIEW` | 감사 로그 조회 |

---

## 📚 API 카테고리

| 카테고리 | 설명 | 문서 |
|----------|------|------|
| 📊 **통계** | 대시보드 통계 | [stats.md](./stats.md) |
| 👥 **사용자 관리** | 사용자 CRUD | [users.md](./users.md) |
| 📖 **스터디 관리** | 스터디 CRUD | [studies.md](./studies.md) |
| 🚨 **신고 관리** | 신고 처리 | [reports.md](./reports.md) |
| ⚙️ **시스템 설정** | 설정 관리 | [settings.md](./settings.md) |
| 📈 **분석** | 상세 분석 데이터 | [analytics.md](./analytics.md) |
| 📋 **감사 로그** | 관리자 활동 로그 | [audit-logs.md](./audit-logs.md) |

---

## 🌐 엔드포인트 요약

### 통계 (Stats)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/admin/stats` | GET | 대시보드 통계 조회 |

### 사용자 관리 (Users)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/admin/users` | GET | 사용자 목록 조회 |
| `/api/admin/users/[id]` | GET | 사용자 상세 조회 |
| `/api/admin/users/[id]` | PATCH | 사용자 정보 수정 |
| `/api/admin/users/[id]` | DELETE | 사용자 삭제 |
| `/api/admin/users/[id]/suspend` | POST | 사용자 정지 |
| `/api/admin/users/[id]/unsuspend` | POST | 사용자 정지 해제 |
| `/api/admin/users/[id]/warn` | POST | 경고 발송 |

### 스터디 관리 (Studies)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/admin/studies` | GET | 스터디 목록 조회 |
| `/api/admin/studies/[studyId]` | GET | 스터디 상세 조회 |
| `/api/admin/studies/[studyId]` | PATCH | 스터디 정보 수정 |
| `/api/admin/studies/[studyId]` | DELETE | 스터디 삭제 |

### 신고 관리 (Reports)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/admin/reports` | GET | 신고 목록 조회 |
| `/api/admin/reports/[reportId]` | GET | 신고 상세 조회 |
| `/api/admin/reports/[reportId]` | PATCH | 신고 처리 |

### 시스템 설정 (Settings)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/admin/settings` | GET | 설정 조회 |
| `/api/admin/settings` | PUT | 설정 업데이트 |
| `/api/admin/settings/cache` | DELETE | 캐시 초기화 |
| `/api/admin/settings/history` | GET | 설정 변경 이력 |

### 분석 (Analytics)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/admin/analytics/overview` | GET | 전체 통계 개요 |
| `/api/admin/analytics/users` | GET | 사용자 분석 |
| `/api/admin/analytics/studies` | GET | 스터디 분석 |

### 감사 로그 (Audit Logs)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/admin/audit-logs` | GET | 감사 로그 목록 |
| `/api/admin/audit-logs/export` | GET | 감사 로그 내보내기 |

---

## 🔐 인증 및 권한 확인

모든 관리자 API는 `requireAdmin` 헬퍼를 통해 권한을 확인합니다:

```javascript
const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW)
if (auth instanceof NextResponse) return auth

const { adminRole } = auth
const adminId = adminRole.userId
```

---

## ⚠️ 공통 에러 응답

### 권한 없음 (403 Forbidden)

```json
{
  "success": false,
  "error": "INSUFFICIENT_PERMISSION",
  "message": "이 작업을 수행할 권한이 없습니다"
}
```

### 잘못된 요청 (400 Bad Request)

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "유효하지 않은 정렬 필드입니다"
}
```

### 서버 오류 (500 Internal Server Error)

```json
{
  "success": false,
  "error": "DATABASE_ERROR",
  "message": "데이터베이스 쿼리 중 오류가 발생했습니다"
}
```

---

## 📊 페이지네이션

### 요청 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 20 | 페이지당 항목 수 |

### 응답 형식

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasMore": true
  }
}
```

---

## 📝 감사 로그

모든 관리자 작업은 `AdminLog` 테이블에 기록됩니다:

| 필드 | 설명 |
|------|------|
| `adminId` | 작업 수행 관리자 |
| `action` | 수행된 작업 유형 |
| `targetType` | 대상 유형 (USER, STUDY, REPORT 등) |
| `targetId` | 대상 ID |
| `details` | 상세 정보 (JSON) |
| `createdAt` | 작업 시간 |

---

## 🔗 관련 문서

- [인증 흐름](../../02_architecture/authentication-flow.md)
- [관리자 페이지](../../05_pages/admin/README.md)
- [AdminRole 모델](../../03_database/models/admin.md)
