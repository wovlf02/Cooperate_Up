# 외부 API 연동 (External API)

> **최종 업데이트**: 2024-12-27
> **Base Path**: `/external`

## 개요

외부 API 연동 관련 API입니다 (Geocoding, 사업자등록번호 검증).

---

## API 목록

| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|:----:|
| POST | `/external/geocoding` | 주소 → 좌표 변환 | ✅ |
| POST | `/external/business-verify` | 사업자등록번호 검증 | ✅ |

---

## 1. 주소 → 좌표 변환 (Geocoding)

주소를 위도/경도 좌표로 변환합니다.

### Request

```http
POST /external/geocoding
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| address | string | ✅ | 변환할 주소 |

```json
{
  "address": "서울특별시 강남구 테헤란로 123"
}
```

### Response

#### 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "address": "서울특별시 강남구 테헤란로 123",
    "latitude": 37.5012,
    "longitude": 127.0396,
    "roadAddress": "서울특별시 강남구 테헤란로 123",
    "jibunAddress": "서울특별시 강남구 역삼동 123-45"
  },
  "timestamp": "2024-12-27T10:00:00"
}
```

#### 실패 - 주소를 찾을 수 없음 (400 Bad Request)

```json
{
  "success": false,
  "message": "주소를 찾을 수 없습니다",
  "code": "EX001",
  "timestamp": "2024-12-27T10:00:00"
}
```

### 프론트엔드 연동

- 사업장 생성 시 주소 입력 후 좌표 변환
- 변환된 좌표를 지도에 표시
- 주소 검색 자동완성과 함께 사용

---

## 2. 사업자등록번호 검증

사업자등록번호의 진위를 확인합니다.

### Request

```http
POST /external/business-verify
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| businessNumber | string | ✅ | 사업자등록번호 (10자리) |

```json
{
  "businessNumber": "1234567890"
}
```

### Response

#### 검증 성공 (200 OK)

```json
{
  "success": true,
  "data": {
    "valid": true,
    "businessNumber": "1234567890",
    "companyName": "주식회사 예시",
    "representativeName": "홍길동",
    "businessType": "서비스업",
    "businessItem": "소프트웨어 개발",
    "openDate": "2020-01-01",
    "taxType": "일반과세자"
  },
  "timestamp": "2024-12-27T10:00:00"
}
```

#### 검증 실패 (200 OK)

```json
{
  "success": true,
  "data": {
    "valid": false,
    "businessNumber": "1234567890",
    "companyName": null,
    "representativeName": null,
    "businessType": null,
    "businessItem": null,
    "openDate": null,
    "taxType": null
  },
  "timestamp": "2024-12-27T10:00:00"
}
```

#### 서비스 오류 (503 Service Unavailable)

```json
{
  "success": false,
  "message": "사업자등록번호 조회 서비스 오류입니다",
  "code": "EX002",
  "timestamp": "2024-12-27T10:00:00"
}
```

### 프론트엔드 연동

- 사업주 회원가입 시 사업자등록번호 검증
- 사업장 생성 시 사업자등록번호 검증
- 검증 결과에 따른 UI 피드백

---

## 타입 정의

### GeocodingResponse

```typescript
interface GeocodingResponse {
  address: string;
  latitude: number;
  longitude: number;
  roadAddress: string | null;
  jibunAddress: string | null;
}

interface GeocodingRequest {
  address: string;
}
```

### ExternalBusinessVerifyResponse

```typescript
interface ExternalBusinessVerifyResponse {
  valid: boolean;
  businessNumber: string;
  companyName: string | null;
  representativeName: string | null;
  businessType: string | null;
  businessItem: string | null;
  openDate: string | null;
  taxType: string | null;
}

interface ExternalBusinessVerifyRequest {
  businessNumber: string;
}
```

---

## 외부 서비스 정보

### Geocoding API

- **공급자**: 카카오 로컬 API 또는 네이버 지도 API
- **API 키**: 환경변수로 관리
- **요청 제한**: 분당 300회 (카카오 기준)

### 사업자등록번호 조회 API

- **공급자**: 국세청 사업자등록정보 진위확인 API
- **API 키**: 공공데이터포털 인증키
- **요청 제한**: 일일 10,000회

---

## 관련 문서

- [공통 규격](./00-common.md)
- [인증 API](./01-auth.md) - 사업자등록번호 검증
- [사업장 API](./03-workplace.md) - Geocoding 사용

