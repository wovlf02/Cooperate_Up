# 📡 신고 API

## 개요

신고 관리를 위한 관리자 API입니다.

---

## 엔드포인트 목록

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/admin/reports` | 신고 목록 | `report:view` |
| GET | `/api/admin/reports/[id]` | 신고 상세 | `report:view` |
| POST | `/api/admin/reports/[id]/assign` | 담당자 할당 | `report:assign` |
| POST | `/api/admin/reports/[id]/process` | 신고 처리 | `report:resolve` |

---

## GET /api/admin/reports

신고 목록을 조회합니다.

### 요청

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| page | number | 페이지 번호 |
| limit | number | 페이지 크기 |
| search | string | 신고 사유/대상 이름 검색 |
| status | string | 상태 필터 (PENDING, IN_PROGRESS, RESOLVED, REJECTED) |
| type | string | 유형 필터 (SPAM, HARASSMENT, INAPPROPRIATE, COPYRIGHT, OTHER) |
| priority | string | 우선순위 필터 (LOW, MEDIUM, HIGH, URGENT) |
| targetType | string | 대상 유형 필터 (USER, STUDY, MESSAGE) |
| assignedTo | string | 담당자 필터 (me, unassigned, userId) |
| createdFrom | string | 시작 날짜 |
| createdTo | string | 종료 날짜 |
| sortBy | string | 정렬 필드 (createdAt, priority, status) |
| sortOrder | string | 정렬 방향 (asc, desc) |

### 응답

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report_123",
        "targetType": "USER",
        "targetId": "user_456",
        "targetName": "홍길동",
        "type": "HARASSMENT",
        "reason": "욕설 및 비방",
        "status": "PENDING",
        "priority": "HIGH",
        "createdAt": "2024-12-10T00:00:00.000Z",
        "reporter": {
          "id": "user_789",
          "name": "김철수",
          "email": "kim@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

## GET /api/admin/reports/[id]

신고 상세 정보를 조회합니다.

### 응답

```json
{
  "success": true,
  "data": {
    "id": "report_123",
    "targetType": "USER",
    "targetId": "user_456",
    "targetName": "홍길동",
    "type": "HARASSMENT",
    "reason": "욕설 및 비방",
    "evidence": {
      "screenshots": ["url1", "url2"],
      "messages": ["내용1", "내용2"]
    },
    "status": "PENDING",
    "priority": "HIGH",
    "processedBy": null,
    "processedAt": null,
    "resolution": null,
    "createdAt": "2024-12-10T00:00:00.000Z",
    "reporter": {
      "id": "user_789",
      "name": "김철수",
      "email": "kim@example.com",
      "avatar": "/avatars/user_789.jpg"
    },
    "target": {
      "id": "user_456",
      "name": "홍길동",
      "email": "hong@example.com",
      "status": "ACTIVE",
      "_count": {
        "receivedWarnings": 2,
        "sanctions": 0
      }
    }
  }
}
```

---

## POST /api/admin/reports/[id]/assign

신고에 담당자를 할당합니다.

### 요청

```json
{
  "assigneeId": "admin_123"
}
```

### 응답

```json
{
  "success": true,
  "message": "담당자가 할당되었습니다"
}
```

---

## POST /api/admin/reports/[id]/process

신고를 처리합니다.

### 요청

```json
{
  "action": "approve",
  "resolution": "검토 결과 괴롭힘으로 판단되어 경고 조치합니다",
  "linkedAction": "warn_user",
  "linkedActionDetails": {
    "severity": "MEDIUM",
    "reason": "타 사용자 괴롭힘"
  }
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| action | string | ✅ | 처리 액션 (approve, reject, hold) |
| resolution | string | ✅ | 처리 사유 |
| linkedAction | string | ❌ | 연계 액션 (warn_user, suspend_user, delete_content, none) |
| linkedActionDetails | object | ❌ | 연계 액션 세부 사항 |

### 응답

```json
{
  "success": true,
  "data": {
    "report": {
      "id": "report_123",
      "status": "RESOLVED",
      "processedBy": "admin_123",
      "processedAt": "2024-12-10T12:00:00.000Z",
      "resolution": "검토 결과 괴롭힘으로 판단되어 경고 조치합니다"
    },
    "linkedActionResult": {
      "type": "warn_user",
      "warningId": "warning_456",
      "success": true
    }
  },
  "message": "신고가 처리되었습니다"
}
```

### 처리 흐름

```
1. 권한 확인 (PERMISSIONS.REPORT_RESOLVE)
2. 요청 본문 검증
3. 신고 존재 확인
4. 트랜잭션 시작
   a. 신고 상태 업데이트
   b. 승인 시 연계 액션 실행
      - warn_user: 경고 생성
      - suspend_user: 계정 정지 + 제재 생성
      - delete_content: 콘텐츠 삭제
5. 트랜잭션 커밋
6. 감사 로그 기록
7. 응답 반환
```

---

## 연계 액션 처리

### warn_user (경고)

```javascript
await tx.warning.create({
  data: {
    userId: report.targetId,
    issuedById: adminRole.userId,
    reason: linkedActionDetails.reason,
    severity: linkedActionDetails.severity || 'MEDIUM'
  }
});
```

### suspend_user (정지)

```javascript
await tx.user.update({
  where: { id: report.targetId },
  data: { status: 'SUSPENDED' }
});

await tx.sanction.create({
  data: {
    userId: report.targetId,
    type: 'SUSPEND',
    reason: resolution,
    duration: linkedActionDetails.duration,
    isActive: true
  }
});
```

### delete_content (삭제)

```javascript
if (report.targetType === 'MESSAGE') {
  await tx.message.update({
    where: { id: report.targetId },
    data: { isDeleted: true }
  });
}
```

---

## 에러 응답

| HTTP | 설명 |
|------|------|
| 400 | 잘못된 요청 (액션, 사유 누락) |
| 403 | 권한 없음 |
| 404 | 신고 없음 |
| 500 | 서버 에러 |

---

## 관련 문서

- [README](./README.md)
- [화면](./screens.md)

