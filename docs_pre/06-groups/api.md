# 📡 그룹 API

## 개요

그룹의 CRUD(생성, 조회, 수정, 삭제) 및 검색 API를 제공합니다.

---

## API 엔드포인트 목록

| 메서드 | 경로 | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/groups` | 그룹 목록 조회 | 인증 필요 |
| POST | `/api/groups` | 그룹 생성 | 인증 필요 |
| GET | `/api/groups/[id]` | 그룹 상세 조회 | 인증 필요 |
| PATCH | `/api/groups/[id]` | 그룹 수정 | ADMIN 이상 |
| DELETE | `/api/groups/[id]` | 그룹 삭제 | OWNER만 |
| GET | `/api/groups/search` | 고급 검색 | 인증 필요 |

---

## GET /api/groups

그룹 목록을 조회합니다.

### Query Parameters

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| page | number | X | 1 | 페이지 번호 |
| limit | number | X | 20 | 페이지당 항목 수 (최대 100) |
| category | string | X | - | 카테고리 필터 |
| isPublic | boolean | X | - | 공개 여부 필터 |
| isRecruiting | boolean | X | - | 모집 중 필터 |
| search | string | X | - | 검색어 (이름, 설명) |
| sort | string | X | latest | 정렬 (latest, popular) |

### 응답 예시

```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "group-uuid-1",
        "name": "알고리즘 스터디",
        "description": "매주 알고리즘 문제를 풉니다",
        "category": "study",
        "isPublic": true,
        "isRecruiting": true,
        "maxMembers": 50,
        "imageUrl": null,
        "createdAt": "2025-01-01T00:00:00Z",
        "currentMembers": 15,
        "isMember": true,
        "myRole": "MEMBER",
        "myStatus": "ACTIVE"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## POST /api/groups

새 그룹을 생성합니다.

### Request Body

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| name | string | ✓ | - | 그룹 이름 (2~50자) |
| description | string | X | - | 그룹 설명 (최대 1000자) |
| category | string | ✓ | - | 카테고리 |
| isPublic | boolean | X | true | 공개 여부 |
| maxMembers | number | X | 50 | 최대 멤버 수 (2~200) |
| imageUrl | string | X | null | 이미지 URL |

### 요청 예시

```json
{
  "name": "알고리즘 스터디",
  "description": "매주 알고리즘 문제를 풉니다",
  "category": "study",
  "isPublic": true,
  "maxMembers": 30
}
```

### 응답 예시

```json
{
  "success": true,
  "data": {
    "id": "group-uuid-1",
    "name": "알고리즘 스터디",
    "description": "매주 알고리즘 문제를 풉니다",
    "category": "study",
    "isPublic": true,
    "isRecruiting": true,
    "maxMembers": 30,
    "imageUrl": null,
    "createdBy": "user-uuid",
    "createdAt": "2025-01-01T00:00:00Z"
  },
  "message": "그룹이 성공적으로 생성되었습니다."
}
```

### 처리 로직

1. 세션 검증 (인증 필요)
2. 입력 데이터 검증 (`validateGroupData`)
3. 그룹 이름 중복 확인 (`checkDuplicateGroupName`)
4. 트랜잭션으로 그룹 생성 + OWNER 멤버 추가
5. 로깅 및 응답 반환

---

## GET /api/groups/[id]

그룹 상세 정보를 조회합니다.

### 응답 예시

```json
{
  "success": true,
  "data": {
    "id": "group-uuid-1",
    "name": "알고리즘 스터디",
    "description": "매주 알고리즘 문제를 풉니다",
    "category": "study",
    "isPublic": true,
    "isRecruiting": true,
    "maxMembers": 30,
    "imageUrl": null,
    "createdBy": "user-uuid",
    "createdAt": "2025-01-01T00:00:00Z",
    "currentMembers": 15,
    "myRole": "MEMBER"
  }
}
```

### 접근 제어

- 공개 그룹: 모든 인증 사용자 접근 가능
- 비공개 그룹: 멤버만 접근 가능

---

## PATCH /api/groups/[id]

그룹 정보를 수정합니다.

### 권한

- ADMIN 이상 권한 필요

### Request Body

| 필드 | 타입 | 설명 |
|------|------|------|
| name | string | 그룹 이름 |
| description | string | 그룹 설명 |
| category | string | 카테고리 |
| isPublic | boolean | 공개 여부 |
| maxMembers | number | 최대 멤버 수 |
| isRecruiting | boolean | 모집 상태 |
| imageUrl | string | 이미지 URL |

### 응답 예시

```json
{
  "success": true,
  "data": {
    "id": "group-uuid-1",
    "name": "알고리즘 고급 스터디",
    "...": "..."
  },
  "message": "그룹이 성공적으로 수정되었습니다."
}
```

### 제약 조건

- `maxMembers`는 현재 멤버 수보다 작게 설정 불가
- 이름 변경 시 중복 확인 수행

---

## DELETE /api/groups/[id]

그룹을 삭제합니다 (소프트 삭제).

### 권한

- OWNER만 삭제 가능

### 제약 조건

- OWNER 외에 활성 멤버가 있으면 삭제 불가

### 응답 예시

```json
{
  "success": true,
  "message": "그룹이 성공적으로 삭제되었습니다."
}
```

### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "GROUP-HAS-ACTIVE-MEMBERS",
    "message": "그룹에 15명의 활성 멤버가 있어 삭제할 수 없습니다."
  }
}
```

---

## GET /api/groups/search

고급 검색 API입니다.

### Query Parameters

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| q | string | - | 검색어 |
| category | string | - | 카테고리 필터 |
| isPublic | boolean | - | 공개 여부 |
| isRecruiting | boolean | - | 모집 상태 |
| minMembers | number | 0 | 최소 멤버 수 |
| maxMembers | number | 999 | 최대 멤버 수 |
| sort | string | relevance | 정렬 옵션 |
| page | number | 1 | 페이지 |
| limit | number | 20 | 페이지당 항목 |

### 정렬 옵션

| 값 | 설명 |
|-----|------|
| relevance | 관련도순 |
| popular | 인기순 |
| newest | 최신순 |
| oldest | 오래된순 |

### 응답 예시

```json
{
  "success": true,
  "data": {
    "groups": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalFiltered": 45,
      "totalPages": 3
    },
    "filters": {
      "query": "알고리즘",
      "category": "study",
      "sort": "relevance"
    }
  }
}
```

---

## 공통 에러 응답

| 코드 | HTTP | 설명 |
|------|------|------|
| GROUP-AUTH-REQUIRED | 401 | 인증 필요 |
| GROUP-NOT-FOUND | 404 | 그룹 없음 |
| GROUP-PERMISSION-DENIED | 403 | 권한 없음 |
| GROUP-NAME-DUPLICATE | 409 | 이름 중복 |
| GROUP-INTERNAL-ERROR | 500 | 서버 오류 |

---

## 관련 코드

```
src/app/api/groups/
├── route.js              # GET, POST /api/groups
├── search/
│   └── route.js          # GET /api/groups/search
└── [id]/
    └── route.js          # GET, PATCH, DELETE /api/groups/[id]
```

