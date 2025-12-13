# 📡 관리자 API

## 개요

관리자 기능을 위한 REST API입니다. 모든 API는 관리자 인증과 권한 확인이 필요합니다.

---

## 엔드포인트 목록

### 통계 & 대시보드

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/stats` | 대시보드 통계 | `analytics:view` |

### 사용자 관리

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/users` | 사용자 목록 | `user:view` |
| GET | `/api/admin/users/[id]` | 사용자 상세 | `user:view` |
| PATCH | `/api/admin/users/[id]` | 사용자 수정 | `user:update` |
| POST | `/api/admin/users/[id]/warn` | 경고 발송 | `user:warn` |
| POST | `/api/admin/users/[id]/suspend` | 계정 정지 | `user:suspend` |
| POST | `/api/admin/users/[id]/unsuspend` | 정지 해제 | `user:unsuspend` |
| DELETE | `/api/admin/users/[id]` | 계정 삭제 | `user:delete` |

### 스터디 관리

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/studies` | 스터디 목록 | `study:view` |
| GET | `/api/admin/studies/[id]` | 스터디 상세 | `study:view` |
| POST | `/api/admin/studies/[id]/hide` | 스터디 숨김 | `study:hide` |
| POST | `/api/admin/studies/[id]/close` | 스터디 종료 | `study:close` |
| DELETE | `/api/admin/studies/[id]` | 스터디 삭제 | `study:delete` |

### 신고 관리

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/reports` | 신고 목록 | `report:view` |
| GET | `/api/admin/reports/[id]` | 신고 상세 | `report:view` |
| POST | `/api/admin/reports/[id]/assign` | 신고 할당 | `report:assign` |
| POST | `/api/admin/reports/[id]/process` | 신고 처리 | `report:process` |
| POST | `/api/admin/reports/[id]/resolve` | 신고 해결 | `report:resolve` |

### 분석 & 감사

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/analytics` | 분석 데이터 | `analytics:view` |
| GET | `/api/admin/audit-logs` | 감사 로그 | `audit:view` |

### 설정

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/settings` | 설정 조회 | `settings:view` |
| PATCH | `/api/admin/settings` | 설정 수정 | `settings:update` |

---

## GET /api/admin/stats

대시보드 통계를 조회합니다.

### 응답

```json
{
  "success": true,
  "data": {
    "summary": {
      "users": {
        "total": 1000,
        "active": 950,
        "suspended": 20,
        "newToday": 15,
        "newThisWeek": 85
      },
      "studies": {
        "total": 300,
        "active": 250,
        "newToday": 5,
        "newThisWeek": 25
      },
      "reports": {
        "total": 50,
        "pending": 10,
        "urgent": 2,
        "newToday": 3
      },
      "warnings": {
        "total": 100,
        "today": 5
      },
      "sanctions": {
        "active": 15
      }
    },
    "recentActivity": {
      "users": [...],
      "reports": [...],
      "warnings": [...]
    },
    "charts": {
      "userGrowth": [...],
      "reportTrends": [...]
    }
  }
}
```

---

## GET /api/admin/users

사용자 목록을 조회합니다.

### 요청

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| page | number | 페이지 번호 |
| limit | number | 페이지 크기 |
| search | string | 이름/이메일/ID 검색 |
| status | string | 상태 필터 (ACTIVE, SUSPENDED, DELETED) |
| provider | string | 가입 방식 필터 |
| hasWarnings | boolean | 경고 있는 사용자만 |
| isSuspended | boolean | 정지된 사용자만 |
| sortBy | string | 정렬 필드 |
| sortOrder | string | 정렬 방향 (asc, desc) |

### 응답

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "name": "홍길동",
        "email": "hong@example.com",
        "avatar": "/avatars/user_123.jpg",
        "status": "ACTIVE",
        "provider": "GOOGLE",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastLoginAt": "2024-12-10T00:00:00.000Z",
        "_count": {
          "ownedStudies": 2,
          "studyMembers": 5,
          "messages": 150,
          "receivedWarnings": 0,
          "sanctions": 0
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1000,
      "totalPages": 50
    }
  }
}
```

---

## 인증 미들웨어

### requireAdmin

```javascript
import { requireAdmin } from '@/lib/admin/auth';
import { PERMISSIONS } from '@/lib/admin/permissions';

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.USER_VIEW);
  if (auth instanceof NextResponse) return auth;

  const { user, adminRole } = auth;
  // ...
}
```

### 처리 흐름

```
1. 세션 확인 (getServerSession)
2. AdminRole 조회
3. 역할 만료 확인
4. 필요 권한 확인 (hasPermission)
5. 성공: { user, adminRole } 반환
   실패: NextResponse 에러 반환
```

---

## 에러 응답

| HTTP | 설명 |
|------|------|
| 401 | 로그인 필요 |
| 403 | 관리자 권한 없음 / 권한 부족 |
| 404 | 리소스 없음 |
| 500 | 서버 에러 |

```json
{
  "success": false,
  "error": "관리자 권한이 없습니다."
}
```

---

## 관련 문서

- [README](./README.md)
- [화면](./screens.md)
- [권한](./permissions.md)
- [예외](./exceptions.md)

