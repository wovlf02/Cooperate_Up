# 📚 내 스터디 API

> 사용자가 가입한 스터디 관리 API

---

## 📋 개요

내 스터디 API는 현재 로그인한 사용자가 가입한 스터디들을 관리하는 기능을 제공합니다. 모든 API는 인증이 필요합니다.

---

## 📚 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/my-studies` | GET | 내 스터디 목록 조회 |
| `/api/my-studies/[studyId]` | GET | 스터디 상세 조회 |
| `/api/my-studies/[studyId]/announcements` | GET, POST | 공지사항 |

---

## 📖 내 스터디 목록 조회

### 요청

```http
GET /api/my-studies?filter=all&page=1&limit=10
```

### 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `filter` | string | all | 필터 (all, owner, admin, member, pending) |
| `page` | number | 1 | 페이지 번호 |
| `limit` | number | 전체 | 페이지당 항목 수 (생략 시 전체 조회) |

### 필터 옵션

| 필터 | 설명 |
|------|------|
| `all` | 모든 스터디 |
| `owner` | 내가 만든 스터디 (OWNER) |
| `admin` | 관리자로 참여 중인 스터디 (ADMIN) |
| `member` | 일반 멤버로 참여 중인 스터디 (MEMBER) |
| `pending` | 가입 승인 대기 중인 스터디 (PENDING) |

### 성공 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "studies": [
      {
        "membershipId": "membership-uuid",
        "role": "OWNER",
        "status": "ACTIVE",
        "joinedAt": "2026-01-10T09:00:00.000Z",
        "approvedAt": "2026-01-10T09:00:00.000Z",
        "study": {
          "id": "study-uuid-123",
          "name": "React 심화 스터디",
          "emoji": "⚛️",
          "description": "React 고급 기능을 학습합니다",
          "category": "PROGRAMMING",
          "subCategory": null,
          "maxMembers": 10,
          "currentMembers": 7,
          "isPublic": true,
          "isRecruiting": true,
          "tags": ["react", "javascript"],
          "createdAt": "2026-01-10T09:00:00.000Z",
          "newMessages": 5,
          "newNotices": 1
        }
      }
    ],
    "count": 5,
    "filter": "all"
  },
  "meta": {
    "duration": 45,
    "timestamp": "2026-01-30T10:00:00.000Z"
  }
}
```

### 응답 필드 설명

| 필드 | 설명 |
|------|------|
| `membershipId` | 멤버십 ID |
| `role` | 사용자 역할 (OWNER, ADMIN, MEMBER) |
| `status` | 멤버십 상태 (ACTIVE, PENDING) |
| `joinedAt` | 가입 신청일 |
| `approvedAt` | 승인일 |
| `study.currentMembers` | 현재 활성 멤버 수 |
| `study.newMessages` | 최근 24시간 내 새 메시지 수 |
| `study.newNotices` | 최근 7일 내 새 공지 수 |

### 에러 응답

| 에러 코드 | HTTP 상태 | 설명 |
|-----------|-----------|------|
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `INVALID_FILTER` | 400 | 잘못된 필터 값 |
| `INVALID_REQUEST` | 400 | 잘못된 페이지네이션 |
| `TIMEOUT` | 408 | 요청 시간 초과 |
| `STUDIES_LOAD_FAILED` | 500 | 로드 실패 |

---

## 📊 멤버십 상태

| 상태 | 설명 | 표시 여부 |
|------|------|-----------|
| `ACTIVE` | 활성 멤버 | ✅ |
| `PENDING` | 승인 대기 중 | ✅ |
| `LEFT` | 자발적 탈퇴 | ❌ |
| `KICKED` | 강퇴됨 | ❌ |

> 내 스터디 API에서는 `ACTIVE`와 `PENDING` 상태만 조회됩니다.

---

## 📊 멤버 역할

| 역할 | 설명 |
|------|------|
| `OWNER` | 스터디 생성자 (모든 권한) |
| `ADMIN` | 관리자 (멤버 관리 권한) |
| `MEMBER` | 일반 멤버 |

---

## 🔄 데이터 갱신

### 새 메시지/공지 계산

| 항목 | 기간 |
|------|------|
| `newMessages` | 최근 24시간 |
| `newNotices` | 최근 7일 |

### 정렬 순서

1. 상태: PENDING → ACTIVE
2. 가입일: 최신순

---

## 💡 사용 예시

### React Query 사용

```javascript
import { useQuery } from '@tanstack/react-query';

function useMyStudies(filter = 'all') {
  return useQuery({
    queryKey: ['myStudies', filter],
    queryFn: async () => {
      const res = await fetch(`/api/my-studies?filter=${filter}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    staleTime: 1000 * 60, // 1분
  });
}
```

### 컴포넌트에서 사용

```jsx
function MyStudiesPage() {
  const [filter, setFilter] = useState('all');
  const { data, isLoading } = useMyStudies(filter);

  if (isLoading) return <Loading />;

  return (
    <div>
      <FilterTabs value={filter} onChange={setFilter} />
      <StudyList studies={data.data.studies} />
      <Badge>{data.data.count} 스터디</Badge>
    </div>
  );
}
```

---

## 🔗 관련 문서

- [스터디 API](../studies/README.md)
- [StudyMember 모델](../../03_database/models/study-member.md)
- [내 스터디 페이지](../../05_pages/my-studies/README.md)
