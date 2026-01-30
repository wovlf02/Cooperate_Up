# 사업장 API (Workplace API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/workplaces`

## 개요

사업장 관리 및 멤버 관리 관련 API입니다.

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 | 권한 |
|--------|-----------|------|:----:|------|
| POST | `/workplaces` | 사업장 생성 | ✅ | 사업주 |
| GET | `/workplaces` | 내 사업장 목록 | ✅ | - |
| GET | `/workplaces/{id}` | 사업장 상세 조회 | ✅ | 멤버 |
| PUT | `/workplaces/{id}` | 사업장 수정 | ✅ | 소유자 |
| DELETE | `/workplaces/{id}` | 사업장 삭제 | ✅ | 소유자 |
| POST | `/workplaces/{id}/invite` | 직원 초대 | ✅ | 소유자 |
| GET | `/workplaces/{id}/members` | 멤버 목록 | ✅ | 멤버 |
| PUT | `/workplaces/{id}/members/{memberId}` | 멤버 정보 수정 | ✅ | 소유자 |
| DELETE | `/workplaces/{id}/members/{memberId}` | 멤버 제거 | ✅ | 소유자 |

---

## 1. 사업장 생성

새로운 사업장을 생성합니다.

### Request

```http
POST /workplaces
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 | 검증 |
|------|------|:----:|------|------|
| name | string | ✅ | 사업장 이름 | 최대 100자 |
| businessNumber | string | ✅ | 사업자등록번호 | 10자리 숫자 |
| address | string | ✅ | 주소 | 최대 200자 |
| addressDetail | string | ❌ | 상세주소 | 최대 100자 |
| latitude | decimal | ✅ | 위도 | -90 ~ 90 |
| longitude | decimal | ✅ | 경도 | -180 ~ 180 |
| radius | integer | ❌ | 출퇴근 반경 (m) | 50 ~ 500, 기본값 100 |
| phone | string | ❌ | 전화번호 | XXX-XXXX-XXXX 형식 |

```json
{
  "name": "카페 BizOne 강남점",
  "businessNumber": "1234567890",
  "address": "서울특별시 강남구 테헤란로 123",
  "addressDetail": "1층",
  "latitude": 37.5012,
  "longitude": 127.0396,
  "radius": 100,
  "phone": "02-1234-5678"
}
```

### Response

#### 성공 (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "카페 BizOne 강남점",
    "businessNumber": "1234567890",
    "address": "서울특별시 강남구 테헤란로 123",
    "addressDetail": "1층",
    "latitude": 37.5012,
    "longitude": 127.0396,
    "radius": 100,
    "phone": "02-1234-5678",
    "ownerId": 3,
    "ownerName": "이사업",
    "memberCount": 1,
    "isActive": true,
    "createdAt": "2024-12-27T10:30:00",
    "updatedAt": "2024-12-27T10:30:00"
  },
  "message": "사업장이 생성되었습니다",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 주소 입력 시 Geocoding API로 좌표 자동 변환
- 지도에서 위치 확인 및 반경 표시
- 생성 후 사업장 선택 화면으로 이동

---

## 2. 내 사업장 목록

접근 가능한 사업장 목록을 조회합니다.

### Request

```http
GET /workplaces
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
      "name": "카페 BizOne 강남점",
      "businessNumber": "1234567890",
      "address": "서울특별시 강남구 테헤란로 123",
      "addressDetail": "1층",
      "latitude": 37.5012,
      "longitude": 127.0396,
      "radius": 100,
      "phone": "02-1234-5678",
      "ownerId": 3,
      "ownerName": "이사업",
      "memberCount": 5,
      "isActive": true,
      "createdAt": "2024-12-27T10:30:00",
      "updatedAt": "2024-12-27T10:30:00"
    },
    {
      "id": 2,
      "name": "카페 BizOne 홍대점",
      "businessNumber": "0987654321",
      "address": "서울특별시 마포구 와우산로 45",
      "addressDetail": null,
      "latitude": 37.5563,
      "longitude": 126.9239,
      "radius": 150,
      "phone": null,
      "ownerId": 3,
      "ownerName": "이사업",
      "memberCount": 3,
      "isActive": true,
      "createdAt": "2024-12-26T09:00:00",
      "updatedAt": "2024-12-26T09:00:00"
    }
  ],
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 로그인 후 사업장 선택 화면에서 사용
- 다중 사업장 지원
- 사업장 선택 시 현재 사업장 컨텍스트 저장

---

## 3. 사업장 상세 조회

특정 사업장의 상세 정보를 조회합니다.

### Request

```http
GET /workplaces/{id}
Authorization: Bearer {accessToken}
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| id | long | ✅ | 사업장 ID |

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "카페 BizOne 강남점",
    "businessNumber": "1234567890",
    "address": "서울특별시 강남구 테헤란로 123",
    "addressDetail": "1층",
    "latitude": 37.5012,
    "longitude": 127.0396,
    "radius": 100,
    "phone": "02-1234-5678",
    "ownerId": 3,
    "ownerName": "이사업",
    "memberCount": 5,
    "isActive": true,
    "createdAt": "2024-12-27T10:30:00",
    "updatedAt": "2024-12-27T10:30:00"
  },
  "timestamp": "2024-12-27T10:30:00"
}
```

---

## 4. 사업장 수정

사업장 정보를 수정합니다.

### Request

```http
PUT /workplaces/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| id | long | ✅ | 사업장 ID |

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| name | string | ❌ | 사업장 이름 |
| address | string | ❌ | 주소 |
| addressDetail | string | ❌ | 상세주소 |
| latitude | decimal | ❌ | 위도 |
| longitude | decimal | ❌ | 경도 |
| radius | integer | ❌ | 출퇴근 반경 |
| phone | string | ❌ | 전화번호 |

```json
{
  "name": "카페 BizOne 강남본점",
  "radius": 150
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "카페 BizOne 강남본점",
    "businessNumber": "1234567890",
    "address": "서울특별시 강남구 테헤란로 123",
    "addressDetail": "1층",
    "latitude": 37.5012,
    "longitude": 127.0396,
    "radius": 150,
    "phone": "02-1234-5678",
    "ownerId": 3,
    "ownerName": "이사업",
    "memberCount": 5,
    "isActive": true,
    "createdAt": "2024-12-27T10:30:00",
    "updatedAt": "2024-12-27T11:00:00"
  },
  "message": "사업장이 수정되었습니다",
  "timestamp": "2024-12-27T11:00:00"
}
```

---

## 5. 사업장 삭제

사업장을 비활성화합니다.

### Request

```http
DELETE /workplaces/{id}
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "사업장이 삭제되었습니다",
  "timestamp": "2024-12-27T11:00:00"
}
```

---

## 6. 직원 초대

사용자 아이디로 직원을 초대합니다.

### Request

```http
POST /workplaces/{id}/invite
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| username | string | ✅ | 초대할 사용자 아이디 |
| hourlyWage | integer | ❌ | 시급 (원) |

```json
{
  "username": "employee1",
  "hourlyWage": 9860
}
```

### Response

#### 성공 (201 Created)

```json
{
  "success": true,
  "data": {
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
  "message": "초대장이 발송되었습니다",
  "timestamp": "2024-12-27T10:30:00"
}
```

#### 실패 (409 Conflict)

```json
{
  "success": false,
  "message": "이미 사업장 멤버입니다",
  "code": "I003",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 프론트엔드 연동

- 아이디로 사용자 검색 후 초대
- 초대 발송 시 푸시 알림 전송 (수신자)

---

## 7. 사업장 멤버 목록

사업장의 멤버 목록을 조회합니다.

### Request

```http
GET /workplaces/{id}/members
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
      "userId": 3,
      "username": "bizowner",
      "name": "이사업",
      "phone": "01012341234",
      "profileImageUrl": null,
      "role": "ADMIN",
      "hourlyWage": 0,
      "joinedAt": "2024-12-27T10:30:00",
      "isOwner": true
    },
    {
      "id": 2,
      "userId": 5,
      "username": "employee1",
      "name": "박직원",
      "phone": "01055556666",
      "profileImageUrl": "https://s3.bizone.kr/profiles/5.jpg",
      "role": "EMPLOYEE",
      "hourlyWage": 9860,
      "joinedAt": "2024-12-27T11:00:00",
      "isOwner": false
    }
  ],
  "timestamp": "2024-12-27T11:30:00"
}
```

### 프론트엔드 연동

- 관리자 화면에서 직원 목록 표시
- 직원 정보 카드로 표시 (시급, 연락처 등)

---

## 8. 멤버 정보 수정

사업장 멤버의 역할 또는 시급을 수정합니다.

### Request

```http
PUT /workplaces/{id}/members/{memberId}
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Path Parameters

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| id | long | ✅ | 사업장 ID |
| memberId | long | ✅ | 멤버십 ID |

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| role | string | ❌ | 역할 (ADMIN, EMPLOYEE) |
| hourlyWage | integer | ❌ | 시급 (원) |

```json
{
  "hourlyWage": 10000
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 2,
    "userId": 5,
    "username": "employee1",
    "name": "박직원",
    "phone": "01055556666",
    "profileImageUrl": "https://s3.bizone.kr/profiles/5.jpg",
    "role": "EMPLOYEE",
    "hourlyWage": 10000,
    "joinedAt": "2024-12-27T11:00:00",
    "isOwner": false
  },
  "message": "멤버 정보가 수정되었습니다",
  "timestamp": "2024-12-27T12:00:00"
}
```

---

## 9. 멤버 제거

사업장에서 멤버를 제거합니다.

### Request

```http
DELETE /workplaces/{id}/members/{memberId}
Authorization: Bearer {accessToken}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "message": "멤버가 제거되었습니다",
  "timestamp": "2024-12-27T12:00:00"
}
```

---

## 타입 정의

### WorkplaceResponse

```typescript
interface WorkplaceResponse {
  id: number;
  name: string;
  businessNumber: string;
  address: string;
  addressDetail: string | null;
  latitude: number;
  longitude: number;
  radius: number;
  phone: string | null;
  ownerId: number;
  ownerName: string;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### WorkplaceMemberResponse

```typescript
interface WorkplaceMemberResponse {
  id: number;
  userId: number;
  username: string;
  name: string;
  phone: string | null;
  profileImageUrl: string | null;
  role: 'ADMIN' | 'EMPLOYEE';
  hourlyWage: number;
  joinedAt: string;
  isOwner: boolean;
}
```

---

## 추가 필요 API (설계)

### 사업장 설정 조회

```http
GET /workplaces/{id}/settings
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "workplaceId": 1,
    "workStartTime": "09:00",
    "workEndTime": "18:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00",
    "earlyCheckInAllowed": true,
    "earlyCheckInMinutes": 30,
    "lateCheckOutAllowed": true,
    "lateCheckOutMinutes": 60,
    "weeklyHolidayEnabled": true,
    "minimumWage": 9860,
    "createdAt": "2024-12-27T10:30:00",
    "updatedAt": "2024-12-27T10:30:00"
  }
}
```

### 사업장 설정 수정

```http
PUT /workplaces/{id}/settings
Authorization: Bearer {accessToken}

Request Body:
{
  "workStartTime": "09:00",
  "workEndTime": "18:00",
  "breakStartTime": "12:00",
  "breakEndTime": "13:00",
  "earlyCheckInAllowed": true,
  "earlyCheckInMinutes": 30,
  "lateCheckOutAllowed": true,
  "lateCheckOutMinutes": 60,
  "weeklyHolidayEnabled": true,
  "minimumWage": 9860
}

Response:
{
  "success": true,
  "message": "설정이 저장되었습니다"
}
```

---

## 관련 문서

- [공통 규격](./00-common.md)
- [초대 API](./04-invitation.md)
- [화면 설계 - 사업장](../05_screens/12_workplace/README.md)

