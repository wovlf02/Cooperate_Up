# 공통 규격 (Common Specifications)

> **최종 업데이트**: 2024-12-27
> **API 버전**: v1

## 1. 기본 정보

### 1.1 Base URL

| 환경 | URL |
|------|-----|
| 로컬 개발 | `http://localhost:8080/api/v1` |
| 개발 서버 | `https://dev-api.bizone.kr/api/v1` |
| 프로덕션 | `https://api.bizone.kr/api/v1` |

### 1.2 HTTP 메서드

| 메서드 | 용도 |
|--------|------|
| GET | 리소스 조회 |
| POST | 리소스 생성, 액션 수행 |
| PUT | 리소스 전체 수정 |
| PATCH | 리소스 부분 수정 |
| DELETE | 리소스 삭제 |

### 1.3 Content-Type

```
Content-Type: application/json
Accept: application/json
```

---

## 2. 인증 (Authentication)

### 2.1 JWT 토큰 구조

| 토큰 | 유효기간 | 용도 |
|------|----------|------|
| Access Token | 30분 | API 요청 인증 |
| Refresh Token | 7일 | Access Token 갱신 |

### 2.2 토큰 전달 방식

```http
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiYXV0aCI6...
```

### 2.3 토큰 페이로드 구조

```json
{
  "sub": "1",           // 사용자 ID
  "auth": "ADMIN",      // 권한 (ADMIN / EMPLOYEE)
  "iat": 1703635200,    // 발급 시간
  "exp": 1703637000     // 만료 시간
}
```

### 2.4 인증이 필요 없는 엔드포인트

| 엔드포인트 | 설명 |
|-----------|------|
| `POST /auth/login` | 로그인 |
| `POST /auth/signup` | 직원 회원가입 |
| `POST /auth/signup/admin` | 사업주 회원가입 |
| `POST /auth/refresh` | 토큰 갱신 |
| `GET /auth/username/check` | 아이디 중복 확인 |
| `POST /auth/email/send-code` | 이메일 인증번호 발송 |
| `POST /auth/email/verify-code` | 이메일 인증번호 확인 |
| `POST /auth/email/verify` | 이메일 인증 |
| `POST /auth/password/reset` | 비밀번호 재설정 요청 |
| `POST /auth/password/reset/confirm` | 비밀번호 재설정 확인 |
| `POST /auth/business/verify` | 사업자등록번호 검증 |

---

## 3. 공통 응답 형식

### 3.1 성공 응답

```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지 (선택)",
  "timestamp": "2024-12-27T10:30:00"
}
```

### 3.2 에러 응답

```json
{
  "success": false,
  "message": "에러 메시지",
  "timestamp": "2024-12-27T10:30:00",
  "code": "E001",
  "errors": [
    {
      "field": "username",
      "message": "아이디를 입력해주세요"
    }
  ]
}
```

### 3.3 페이징 응답

```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "totalElements": 100,
    "totalPages": 10,
    "size": 10,
    "number": 0,
    "first": true,
    "last": false,
    "empty": false
  },
  "timestamp": "2024-12-27T10:30:00"
}
```

---

## 4. 에러 코드

### 4.1 공통 에러 (C)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| C001 | 500 | 서버 내부 오류가 발생했습니다 |
| C002 | 400 | 잘못된 입력값입니다 |
| C003 | 405 | 허용되지 않은 메소드입니다 |
| C004 | 404 | 리소스를 찾을 수 없습니다 |

### 4.2 인증 에러 (A)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| A001 | 401 | 인증이 필요합니다 |
| A002 | 403 | 접근 권한이 없습니다 |
| A003 | 401 | 유효하지 않은 토큰입니다 |
| A004 | 401 | 만료된 토큰입니다 |
| A005 | 403 | 접근이 거부되었습니다 |

### 4.3 사용자 에러 (U)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| U001 | 404 | 사용자를 찾을 수 없습니다 |
| U002 | 409 | 이미 사용 중인 아이디입니다 |
| U003 | 409 | 이미 사용 중인 이메일입니다 |
| U004 | 400 | 비밀번호가 일치하지 않습니다 |

### 4.4 사업장 에러 (W)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| W001 | 404 | 사업장을 찾을 수 없습니다 |
| W002 | 403 | 사업장 멤버가 아닙니다 |
| W003 | 403 | 사업장 소유자 권한이 필요합니다 |
| W004 | 400 | 유효하지 않은 사업자등록번호입니다 |

### 4.5 초대 에러 (I)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| I001 | 404 | 초대를 찾을 수 없습니다 |
| I002 | 400 | 만료된 초대입니다 |
| I003 | 409 | 이미 사업장 멤버입니다 |

### 4.6 출퇴근 에러 (AT)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| AT001 | 409 | 이미 출근 처리되었습니다 |
| AT002 | 400 | 출근 기록이 없습니다 |
| AT003 | 400 | 출퇴근 가능 범위를 벗어났습니다 |
| AT004 | 404 | 출퇴근 기록을 찾을 수 없습니다 |
| AT005 | 409 | 해당 날짜에 이미 출퇴근 기록이 존재합니다 |
| AT006 | 400 | 사업장 범위를 벗어난 위치입니다 |
| AT007 | 400 | 체크리스트를 완료해야 퇴근할 수 있습니다 |
| AT008 | 404 | 승인 요청을 찾을 수 없습니다 |
| AT009 | 409 | 이미 처리된 요청입니다 |

### 4.7 체크리스트 에러 (CL)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| CL001 | 404 | 체크리스트를 찾을 수 없습니다 |
| CL002 | 404 | 업무를 찾을 수 없습니다 |

### 4.8 급여 에러 (P)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| P001 | 404 | 급여 정보를 찾을 수 없습니다 |

### 4.9 계약서 에러 (CT)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| CT001 | 404 | 계약서를 찾을 수 없습니다 |
| CT002 | 409 | 이미 서명된 계약서입니다 |

### 4.10 이메일 에러 (E)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| E001 | 500 | 이메일 발송에 실패했습니다 |
| E002 | 400 | 잘못된 인증번호입니다 |
| E003 | 400 | 만료된 인증번호입니다 |
| E004 | 409 | 이미 인증된 이메일입니다 |

### 4.11 공지사항 에러 (AN)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| AN001 | 404 | 공지사항을 찾을 수 없습니다 |
| AN002 | 403 | 공지사항 작성자가 아닙니다 |

### 4.12 채팅 에러 (CH)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| CH001 | 404 | 채팅방을 찾을 수 없습니다 |
| CH002 | 403 | 채팅방 멤버가 아닙니다 |
| CH003 | 404 | 메시지를 찾을 수 없습니다 |

### 4.13 캘린더 에러 (CA)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| CA001 | 404 | 일정을 찾을 수 없습니다 |
| CA002 | 400 | 잘못된 일정 날짜입니다 |

### 4.14 파일 에러 (F)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| F001 | 500 | 파일 업로드에 실패했습니다 |
| F002 | 404 | 파일을 찾을 수 없습니다 |
| F003 | 400 | 지원하지 않는 파일 형식입니다 |
| F004 | 400 | 파일 크기가 초과되었습니다 |

### 4.15 데이터 무결성 에러 (D)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| D001 | 409 | 데이터 무결성 제약 조건 위반입니다 |
| D002 | 409 | 다른 사용자가 데이터를 수정했습니다. 다시 시도해주세요 |

### 4.16 외부 서비스 에러 (EX)

| 코드 | HTTP 상태 | 메시지 |
|------|-----------|--------|
| EX001 | 503 | 외부 서비스 연동 오류입니다 |
| EX002 | 503 | 사업자등록번호 조회 서비스 오류입니다 |

---

## 5. 공통 타입 정의

### 5.1 사용자 역할 (UserRole)

| 값 | 설명 |
|----|------|
| `ADMIN` | 사업주 |
| `EMPLOYEE` | 직원 |

### 5.2 사용자 상태 (UserStatus)

| 값 | 설명 |
|----|------|
| `ACTIVE` | 활성 |
| `INACTIVE` | 비활성 |
| `SUSPENDED` | 정지 |

### 5.3 출퇴근 상태 (AttendanceStatus)

| 값 | 설명 |
|----|------|
| `WORKING` | 근무 중 |
| `COMPLETED` | 퇴근 완료 |
| `ABSENT` | 결근 |

### 5.4 승인 상태 (ApprovalStatus)

| 값 | 설명 |
|----|------|
| `PENDING` | 대기 |
| `APPROVED` | 승인 |
| `REJECTED` | 거부 |

### 5.5 급여 상태 (PayrollStatus)

| 값 | 설명 |
|----|------|
| `DRAFT` | 초안 |
| `CONFIRMED` | 확정 |
| `PAID` | 지급 완료 |

### 5.6 계약서 상태 (ContractStatus)

| 값 | 설명 |
|----|------|
| `DRAFT` | 초안 |
| `SENT` | 발송됨 |
| `SIGNED` | 서명 완료 |
| `EXPIRED` | 만료 |

---

## 6. 페이징 파라미터

| 파라미터 | 기본값 | 설명 |
|----------|--------|------|
| `page` | 0 | 페이지 번호 (0부터 시작) |
| `size` | 20 | 페이지 크기 |
| `sort` | - | 정렬 기준 (예: `createdAt,desc`) |

### 6.1 사용 예시

```http
GET /announcements?workplaceId=1&page=0&size=20&sort=createdAt,desc
```

---

## 7. 날짜/시간 형식

| 형식 | 예시 | 용도 |
|------|------|------|
| ISO 8601 DateTime | `2024-12-27T10:30:00` | 일반 날짜시간 |
| ISO 8601 Date | `2024-12-27` | 날짜만 |
| 연월 | `2024-12` | 년월 지정 |

---

## 8. 프론트엔드 연동 가이드

### 8.1 Axios 인터셉터 설정 예시

```typescript
// apiClient.ts
import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenStorage';

const apiClient = axios.create({
  baseURL: 'https://api.bizone.kr/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getRefreshToken();
        const { data } = await axios.post('/auth/refresh', { refreshToken });
        
        setTokens(data.data.accessToken, data.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearTokens();
        // 로그인 페이지로 리다이렉트
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 8.2 API 호출 예시

```typescript
// authService.ts
import apiClient from './apiClient';
import { LoginRequest, LoginResponse, ApiResponse } from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    return response.data.data;
  },
  
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
  
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },
};
```

---

## 9. 관련 문서

- [인증 API](./01-auth.md)
- [사용자 API](./02-user.md)
- [에러 코드 상세](../03_architecture/file_structure/back/16-global.md)

