# 📖 스터디 API

> 스터디 조회, 생성, 수정, 가입 등 스터디 관련 API

---

## 📋 개요

스터디 API는 공개 스터디 탐색, 스터디 생성, 가입 신청 등의 기능을 제공합니다.

---

## 📚 엔드포인트 목록

### 기본 CRUD

| 엔드포인트 | 메서드 | 인증 | 설명 |
|------------|--------|------|------|
| `/api/studies` | GET | ❌ | 공개 스터디 목록 조회 |
| `/api/studies` | POST | ✅ | 스터디 생성 |
| `/api/studies/[id]` | GET | ❌ | 스터디 상세 조회 |
| `/api/studies/[id]` | PATCH | ✅ | 스터디 정보 수정 (소유자만) |
| `/api/studies/[id]` | DELETE | ✅ | 스터디 삭제 (소유자만) |

### 가입/탈퇴

| 엔드포인트 | 메서드 | 인증 | 설명 |
|------------|--------|------|------|
| `/api/studies/[id]/join` | POST | ✅ | 가입 신청 |
| `/api/studies/[id]/leave` | POST | ✅ | 탈퇴 |
| `/api/studies/[id]/join-requests` | GET | ✅ | 가입 신청 목록 (관리자만) |
| `/api/studies/[id]/join-requests` | PATCH | ✅ | 가입 신청 처리 |

### 멤버 관리

| 엔드포인트 | 메서드 | 인증 | 설명 |
|------------|--------|------|------|
| `/api/studies/[id]/members` | GET | ✅ | 멤버 목록 조회 |
| `/api/studies/[id]/members` | PATCH | ✅ | 멤버 역할 변경 |
| `/api/studies/[id]/members` | DELETE | ✅ | 멤버 강퇴 |
| `/api/studies/[id]/check-member` | GET | ✅ | 멤버십 확인 |
| `/api/studies/[id]/transfer-ownership` | POST | ✅ | 소유권 이전 |

### 기타

| 엔드포인트 | 메서드 | 인증 | 설명 |
|------------|--------|------|------|
| `/api/studies/[id]/invite` | POST | ✅ | 초대 링크 생성 |
| `/api/studies/[id]/chat` | GET, POST | ✅ | 채팅 메시지 |
| `/api/studies/[id]/calendar` | GET, POST | ✅ | 캘린더 이벤트 |
| `/api/studies/[id]/files` | GET, POST | ✅ | 파일 관리 |
| `/api/studies/[id]/notices` | GET, POST | ✅ | 공지사항 |
| `/api/studies/[id]/tasks` | GET, POST | ✅ | 태스크 관리 |

---

## 📖 스터디 목록 조회

### 요청

```http
GET /api/studies?page=1&limit=10&category=PROGRAMMING&recruiting=recruiting
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 10 | 페이지당 항목 수 |
| `category` | string | - | 카테고리 필터 |
| `search` | string | - | 이름, 설명, 태그 검색 |
| `recruiting` | string | all | 모집 상태 (all, recruiting, closed) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "study-uuid-123",
      "name": "React 심화 스터디",
      "description": "React 고급 기능을 학습합니다",
      "category": "PROGRAMMING",
      "emoji": "⚛️",
      "tags": ["react", "javascript", "frontend"],
      "isPublic": true,
      "isRecruiting": true,
      "maxMembers": 10,
      "currentMembers": 7,
      "createdAt": "2026-01-10T09:00:00.000Z",
      "owner": {
        "id": "user-uuid",
        "name": "홍길동",
        "avatar": "https://..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

## ➕ 스터디 생성

### 요청

```http
POST /api/studies
Content-Type: application/json

{
  "name": "React 스터디",
  "description": "React를 함께 공부합니다",
  "category": "PROGRAMMING",
  "emoji": "⚛️",
  "tags": ["react", "javascript"],
  "maxMembers": 10,
  "isPublic": true,
  "isRecruiting": true,
  "autoApprove": false
}
```

### 요청 본문

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `name` | string | ✅ | 스터디 이름 (2~50자) |
| `description` | string | ❌ | 스터디 설명 |
| `category` | string | ✅ | 카테고리 |
| `emoji` | string | ✅ | 스터디 아이콘 이모지 |
| `tags` | string[] | ❌ | 태그 목록 |
| `maxMembers` | number | ❌ | 최대 멤버 수 (기본: 10) |
| `isPublic` | boolean | ❌ | 공개 여부 (기본: true) |
| `isRecruiting` | boolean | ❌ | 모집 여부 (기본: true) |
| `autoApprove` | boolean | ❌ | 자동 승인 (기본: false) |
| `password` | string | ❌ | 비밀번호 (비공개 스터디) |

### 성공 응답 (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "study-uuid-123",
    "name": "React 스터디",
    "description": "React를 함께 공부합니다",
    "category": "PROGRAMMING",
    "emoji": "⚛️",
    "tags": ["react", "javascript"],
    "maxMembers": 10,
    "isPublic": true,
    "isRecruiting": true,
    "ownerId": "user-uuid",
    "createdAt": "2026-01-30T10:00:00.000Z"
  }
}
```

### 참고사항

- 스터디 생성 시 생성자는 자동으로 **OWNER** 역할로 멤버에 추가됩니다.

---

## 📖 스터디 상세 조회

### 요청

```http
GET /api/studies/study-uuid-123
```

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "study-uuid-123",
    "name": "React 심화 스터디",
    "description": "React 고급 기능을 학습합니다",
    "category": "PROGRAMMING",
    "emoji": "⚛️",
    "tags": ["react", "javascript"],
    "isPublic": true,
    "isRecruiting": true,
    "maxMembers": 10,
    "currentMembers": 7,
    "autoApprove": false,
    "createdAt": "2026-01-10T09:00:00.000Z",
    "updatedAt": "2026-01-28T15:30:00.000Z",
    "members": [
      {
        "id": "member-uuid",
        "userId": "user-uuid-1",
        "role": "OWNER",
        "status": "ACTIVE",
        "joinedAt": "2026-01-10T09:00:00.000Z",
        "user": {
          "id": "user-uuid-1",
          "name": "홍길동",
          "email": "hong@example.com",
          "avatar": "https://..."
        }
      }
    ],
    "myRole": "MEMBER",
    "myJoinedAt": "2026-01-15T10:00:00.000Z",
    "myMembershipStatus": "ACTIVE"
  }
}
```

### 응답 필드 설명

| 필드 | 설명 |
|------|------|
| `myRole` | 현재 로그인한 사용자의 역할 (null이면 비멤버) |
| `myJoinedAt` | 현재 사용자의 가입일 |
| `myMembershipStatus` | 현재 사용자의 멤버십 상태 |

---

## ✏️ 스터디 정보 수정

### 요청

```http
PATCH /api/studies/study-uuid-123
Content-Type: application/json

{
  "name": "수정된 스터디 이름",
  "description": "수정된 설명",
  "isRecruiting": false
}
```

### 권한

- **OWNER**만 수정 가능

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "study-uuid-123",
    "name": "수정된 스터디 이름",
    ...
  }
}
```

---

## 🗑️ 스터디 삭제

### 요청

```http
DELETE /api/studies/study-uuid-123
```

### 권한

- **OWNER**만 삭제 가능

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "message": "Study deleted successfully"
}
```

---

## 🤝 가입 신청

### 요청

```http
POST /api/studies/study-uuid-123/join
Content-Type: application/json

{
  "introduction": "안녕하세요, React 공부하고 싶습니다",
  "purpose": "취업 준비",
  "level": "중급"
}
```

### 요청 본문 (선택)

| 필드 | 타입 | 설명 |
|------|------|------|
| `introduction` | string | 자기소개 |
| `purpose` | string | 가입 목적 |
| `level` | string | 본인 수준 |

### 성공 응답

#### 자동 승인 스터디 (200 OK)

```json
{
  "success": true,
  "message": "스터디에 가입되었습니다",
  "type": "AUTO_APPROVED",
  "member": {
    "id": "member-uuid",
    "role": "MEMBER",
    "status": "ACTIVE"
  }
}
```

#### 승인 필요 스터디 (200 OK)

```json
{
  "success": true,
  "message": "가입 신청이 완료되었습니다",
  "type": "PENDING",
  "joinRequest": {
    "id": "member-uuid",
    "status": "PENDING"
  }
}
```

### 에러 응답

| 에러 타입 | 설명 |
|-----------|------|
| `UNAUTHORIZED` | 로그인 필요 |
| `NOT_FOUND` | 스터디 없음 |
| `ALREADY_MEMBER` | 이미 멤버 |
| `KICKED_MEMBER` | 강퇴된 사용자 |
| `APPLICATION_ALREADY_EXISTS` | 이미 신청 중 |
| `STUDY_FULL` | 정원 초과 |
| `NOT_RECRUITING` | 모집 마감 |

---

## 📊 카테고리 목록

| 값 | 표시명 |
|-----|--------|
| `PROGRAMMING` | 프로그래밍 |
| `LANGUAGE` | 어학 |
| `CERTIFICATE` | 자격증 |
| `EMPLOYMENT` | 취업 |
| `HOBBY` | 취미 |
| `ACADEMIC` | 학술 |
| `OTHER` | 기타 |

---

## 👥 멤버 역할

| 역할 | 권한 |
|------|------|
| `OWNER` | 모든 권한 (수정, 삭제, 멤버 관리 등) |
| `ADMIN` | 멤버 관리, 가입 승인 |
| `MEMBER` | 기본 참여 권한 |

---

## 🔗 관련 문서

- [Study 모델](../../03_database/models/study.md)
- [StudyMember 모델](../../03_database/models/study-member.md)
- [내 스터디 API](../my-studies/README.md)
- [스터디 페이지](../../05_pages/studies/README.md)
