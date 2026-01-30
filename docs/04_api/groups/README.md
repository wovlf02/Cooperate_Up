# 👥 그룹 API

> 스터디 내 소그룹 관리 API

---

## 📋 개요

| 항목 | 값 |
|------|-----|
| **기본 엔드포인트** | `/api/groups` |
| **인증 필요** | ✅ |

그룹은 스터디 내에서 더 작은 단위로 팀을 구성할 수 있는 기능입니다.

---

## 📚 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/groups` | GET | 그룹 목록 조회 |
| `/api/groups` | POST | 그룹 생성 |
| `/api/groups/[id]` | GET | 그룹 상세 조회 |
| `/api/groups/[id]` | PATCH | 그룹 정보 수정 |
| `/api/groups/[id]` | DELETE | 그룹 삭제 |
| `/api/groups/search` | GET | 그룹 검색 |

---

## 📖 그룹 목록 조회

### 요청

```http
GET /api/groups?page=1&limit=20&category=STUDY&isRecruiting=true&sort=latest
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 20 | 페이지당 항목 수 (최대 100) |
| `category` | string | - | 카테고리 필터 |
| `isPublic` | boolean | - | 공개 여부 |
| `isRecruiting` | boolean | - | 모집 중 여부 |
| `search` | string | - | 이름/설명 검색 |
| `sort` | string | latest | 정렬 (latest, popular) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "group-uuid-123",
      "name": "프론트엔드 팀",
      "description": "프론트엔드 개발 담당 팀",
      "category": "DEVELOPMENT",
      "isPublic": true,
      "isRecruiting": true,
      "maxMembers": 5,
      "currentMembers": 3,
      "createdAt": "2026-01-20T10:00:00.000Z",
      "myRole": "MEMBER",
      "myStatus": "ACTIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

## ➕ 그룹 생성

### 요청

```http
POST /api/groups
Content-Type: application/json

{
  "name": "프론트엔드 팀",
  "description": "프론트엔드 개발 담당 팀",
  "category": "DEVELOPMENT",
  "studyId": "study-uuid",
  "isPublic": true,
  "isRecruiting": true,
  "maxMembers": 5
}
```

### 요청 본문

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `name` | string | ✅ | 그룹 이름 (2~50자) |
| `description` | string | ❌ | 그룹 설명 |
| `category` | string | ❌ | 카테고리 |
| `studyId` | string | ✅ | 소속 스터디 ID |
| `isPublic` | boolean | ❌ | 공개 여부 (기본: true) |
| `isRecruiting` | boolean | ❌ | 모집 여부 (기본: true) |
| `maxMembers` | number | ❌ | 최대 멤버 수 |

### 성공 응답 (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "group-uuid-123",
    "name": "프론트엔드 팀",
    "createdAt": "2026-01-30T10:00:00.000Z"
  }
}
```

---

## 📖 그룹 상세 조회

### 요청

```http
GET /api/groups/group-uuid-123
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "group-uuid-123",
    "name": "프론트엔드 팀",
    "description": "프론트엔드 개발 담당 팀",
    "category": "DEVELOPMENT",
    "isPublic": true,
    "isRecruiting": true,
    "maxMembers": 5,
    "currentMembers": 3,
    "createdAt": "2026-01-20T10:00:00.000Z",
    "updatedAt": "2026-01-28T15:00:00.000Z",
    "members": [
      {
        "id": "member-uuid",
        "userId": "user-uuid",
        "role": "OWNER",
        "status": "ACTIVE",
        "joinedAt": "2026-01-20T10:00:00.000Z",
        "user": {
          "id": "user-uuid",
          "name": "홍길동",
          "avatar": "https://..."
        }
      }
    ]
  }
}
```

---

## ✏️ 그룹 정보 수정

### 요청

```http
PATCH /api/groups/group-uuid-123
Content-Type: application/json

{
  "name": "수정된 그룹명",
  "isRecruiting": false
}
```

### 권한

- **OWNER** 또는 **ADMIN**만 수정 가능

---

## 🗑️ 그룹 삭제

### 요청

```http
DELETE /api/groups/group-uuid-123
```

### 권한

- **OWNER**만 삭제 가능

---

## 👥 멤버 역할

| 역할 | 권한 |
|------|------|
| `OWNER` | 모든 권한 |
| `ADMIN` | 멤버 관리 |
| `MEMBER` | 기본 참여 |

---

## 🔗 관련 문서

- [Group 모델](../../03_database/models/group.md)
- [스터디 API](../studies/README.md)
