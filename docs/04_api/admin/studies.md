# 관리자 - 스터디 관리 API

> 스터디 목록 조회, 상세 정보 확인, 관리 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **기본 엔드포인트** | `/api/admin/studies` |
| **필요 권한** | `STUDY_VIEW`, `STUDY_MANAGE` |

---

## 📚 엔드포인트 목록

| 엔드포인트 | 메서드 | 권한 | 설명 |
|------------|--------|------|------|
| `/api/admin/studies` | GET | STUDY_VIEW | 스터디 목록 조회 |
| `/api/admin/studies/[studyId]` | GET | STUDY_VIEW | 스터디 상세 조회 |
| `/api/admin/studies/[studyId]` | PATCH | STUDY_MANAGE | 스터디 정보 수정 |
| `/api/admin/studies/[studyId]` | DELETE | STUDY_MANAGE | 스터디 삭제 |

---

## 📖 스터디 목록 조회

### 요청

```http
GET /api/admin/studies?page=1&limit=20&search=React&category=PROGRAMMING
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 20 | 페이지당 항목 수 |
| `search` | string | - | 이름, 설명, ID 검색 |
| `category` | string | all | 카테고리 필터 |
| `isPublic` | string | all | 공개 여부 (true, false, all) |
| `isRecruiting` | string | all | 모집 중 여부 (true, false, all) |
| `minMembers` | number | - | 최소 멤버 수 |
| `maxMembers` | number | - | 최대 멤버 수 |
| `createdFrom` | string | - | 생성일 시작 (ISO 8601) |
| `createdTo` | string | - | 생성일 종료 (ISO 8601) |
| `sortBy` | string | createdAt | 정렬 기준 (createdAt, updatedAt, name, memberCount, rating) |
| `sortOrder` | string | desc | 정렬 순서 (asc, desc) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "studies": [
      {
        "id": "study-uuid-123",
        "name": "React 심화 스터디",
        "description": "React 고급 기능을 학습합니다",
        "category": "PROGRAMMING",
        "isPublic": true,
        "isRecruiting": true,
        "maxMembers": 10,
        "createdAt": "2026-01-10T09:00:00.000Z",
        "updatedAt": "2026-01-28T15:30:00.000Z",
        "owner": {
          "id": "user-uuid-456",
          "name": "홍길동",
          "email": "hong@example.com",
          "avatar": "https://...",
          "status": "ACTIVE"
        },
        "_count": {
          "members": 7,
          "messages": 250,
          "files": 15,
          "notices": 5
        }
      }
    ],
    "pagination": {
      "total": 340,
      "page": 1,
      "limit": 20,
      "totalPages": 17,
      "hasMore": true
    }
  }
}
```

---

## 📖 스터디 상세 조회

### 요청

```http
GET /api/admin/studies/study-uuid-123
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "study": {
      "id": "study-uuid-123",
      "name": "React 심화 스터디",
      "description": "React 고급 기능을 학습합니다",
      "category": "PROGRAMMING",
      "isPublic": true,
      "isRecruiting": true,
      "maxMembers": 10,
      "password": null,
      "createdAt": "2026-01-10T09:00:00.000Z",
      "updatedAt": "2026-01-28T15:30:00.000Z"
    },
    "owner": {
      "id": "user-uuid-456",
      "name": "홍길동",
      "email": "hong@example.com",
      "avatar": "https://...",
      "status": "ACTIVE"
    },
    "members": [
      {
        "id": "member-uuid",
        "userId": "user-uuid-789",
        "role": "MEMBER",
        "status": "ACTIVE",
        "joinedAt": "2026-01-15T10:00:00.000Z",
        "user": {
          "id": "user-uuid-789",
          "name": "김철수",
          "email": "kim@example.com"
        }
      }
    ],
    "statistics": {
      "totalMembers": 7,
      "activeMembers": 7,
      "totalMessages": 250,
      "totalTasks": 30,
      "completedTasks": 25,
      "totalFiles": 15
    },
    "recentActivity": [
      {
        "type": "MESSAGE",
        "description": "새 메시지 작성",
        "user": "김철수",
        "createdAt": "2026-01-30T14:00:00.000Z"
      }
    ]
  }
}
```

---

## ✏️ 스터디 정보 수정

### 요청

```http
PATCH /api/admin/studies/study-uuid-123
Content-Type: application/json

{
  "name": "수정된 스터디 이름",
  "isRecruiting": false,
  "maxMembers": 15
}
```

### 수정 가능 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `name` | string | 스터디 이름 |
| `description` | string | 스터디 설명 |
| `category` | string | 카테고리 |
| `isPublic` | boolean | 공개 여부 |
| `isRecruiting` | boolean | 모집 여부 |
| `maxMembers` | number | 최대 멤버 수 |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "스터디 정보가 수정되었습니다",
  "data": {
    "id": "study-uuid-123",
    "name": "수정된 스터디 이름",
    "isRecruiting": false,
    "maxMembers": 15
  }
}
```

---

## 🗑️ 스터디 삭제

### 요청

```http
DELETE /api/admin/studies/study-uuid-123
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "스터디가 삭제되었습니다"
}
```

### 주의사항

- 스터디 삭제 시 연관 데이터 처리:
  - 멤버십 정보 삭제 (cascade)
  - 메시지는 유지 (orphan)
  - 파일은 유지 (orphan)
  - 태스크 삭제 (cascade)
- 복구 불가능하므로 신중히 사용

---

## 📊 카테고리 목록

| 카테고리 | 설명 |
|----------|------|
| `PROGRAMMING` | 프로그래밍 |
| `LANGUAGE` | 어학 |
| `CERTIFICATE` | 자격증 |
| `EMPLOYMENT` | 취업 |
| `HOBBY` | 취미 |
| `ACADEMIC` | 학술 |
| `OTHER` | 기타 |

---

## 🔗 관련 문서

- [Study 모델](../../03_database/models/study.md)
- [StudyMember 모델](../../03_database/models/study-member.md)
- [스터디 API (일반)](../studies/README.md)
