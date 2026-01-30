# 초대 API (Invitation API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/invitations`

## 개요

사업장 초대 관리 API입니다. 받은 초대 조회 및 수락/거부 처리를 합니다.

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|:----:|
| GET | `/invitations` | 받은 초대 목록 | ✅ |
| POST | `/invitations/{id}/accept` | 초대 수락 | ✅ |
| POST | `/invitations/{id}/reject` | 초대 거부 | ✅ |

---

## 1. 받은 초대 목록

내가 받은 대기 중인 초대 목록을 조회합니다.

### Request

```http
GET /invitations
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "workplaceId": 1,
      "workplaceName": "카페 BizOne 강남점",
      "invitedUserId": 5,
      "invitedUsername": "employee1",
      "invitedUserName": "박직원",
      "status": "PENDING",
      "expiresAt": "2025-01-03T10:30:00",
      "createdAt": "2024-12-27T10:30:00"
    },
    {
      "id": 2,
      "workplaceId": 2,
      "workplaceName": "카페 BizOne 홍대점",
      "invitedUserId": 5,
      "invitedUsername": "employee1",
      "invitedUserName": "박직원",
      "status": "PENDING",
      "expiresAt": "2025-01-04T09:00:00",
      "createdAt": "2024-12-28T09:00:00"
    }
  ],
  "timestamp": "2024-12-27T11:00:00"
}
```

### 프론트엔드 연동

- 로그인 후 초대 목록 확인
- 대기 중인 초대가 있을 경우 알림 표시
- 사업장 선택 화면에서 초대 목록 섹션 표시

---

## 2. 초대 수락

초대를 수락하고 사업장 멤버가 됩니다.

### Request

```http
POST /invitations/{id}/accept
Authorization: Bearer {accessToken}
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| id | long | ✅ | 초대 ID |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "초대를 수락했습니다",
  "timestamp": "2024-12-27T11:30:00"
}
```

#### 실패 - 만료된 초대 (400 Bad Request)

```json
{
  "success": false,
  "message": "만료된 초대입니다",
  "code": "I002",
  "timestamp": "2024-12-27T11:30:00"
}
```

#### 실패 - 이미 멤버 (409 Conflict)

```json
{
  "success": false,
  "message": "이미 사업장 멤버입니다",
  "code": "I003",
  "timestamp": "2024-12-27T11:30:00"
}
```

### 프론트엔드 연동

- 수락 후 사업장 목록 새로고침
- 해당 사업장으로 자동 이동 또는 선택 유도

---

## 3. 초대 거부

초대를 거부합니다.

### Request

```http
POST /invitations/{id}/reject
Authorization: Bearer {accessToken}
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| id | long | ✅ | 초대 ID |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "초대를 거부했습니다",
  "timestamp": "2024-12-27T11:30:00"
}
```

### 프론트엔드 연동

- 거부 후 초대 목록에서 제거
- 거부 확인 다이얼로그 표시

---

## 타입 정의

### InvitationResponse

```typescript
interface InvitationResponse {
  id: number;
  workplaceId: number;
  workplaceName: string;
  invitedUserId: number;
  invitedUsername: string;
  invitedUserName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
}
```

---

## 비즈니스 로직

### 초대 만료

- 초대 유효 기간: 7일
- 만료된 초대는 수락/거부 불가
- 만료된 초대는 목록에서 필터링

### 중복 초대 방지

- 동일 사업장에 대해 대기 중인 초대가 있으면 재초대 불가
- 이미 멤버인 경우 초대 불가

---

## 관련 문서

- [공통 규격](./00-common.md)
- [사업장 API](./03-workplace.md)
- [화면 설계 - 사업장](../05_screens/12_workplace/README.md)

