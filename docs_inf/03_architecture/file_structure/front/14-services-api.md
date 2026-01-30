// filepath: c:\Project\Biz_One\docs\03_architecture\file_structure\front\14-services-api.md
# API 서비스 파일 구조 (Services - API)

> **규칙**: 50줄 권장 / 200줄 제한 / 인라인 스타일 금지 / TypeScript 표준 문법 (최신 버전)
> **관련 문서**: [API 명세](../../13_api/README.md)

## 개요

백엔드 API와 통신하는 서비스 레이어입니다.
- **Axios 기반**: HTTP 클라이언트
- **인터셉터**: 토큰 자동 주입, 401 시 자동 갱신
- **타입 안전성**: 요청/응답 타입 정의

---

## 디렉토리 구조

```
src/services/
├── index.ts                            # 전체 export (~15 lines)
│
├── api/
│   ├── index.ts                        # API 모듈 export (~20 lines)
│   │
│   ├── client/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── axiosClient.ts              # Axios 인스턴스 (~50 lines)
│   │   ├── interceptors.ts             # 요청/응답 인터셉터 (~60 lines)
│   │   └── tokenManager.ts             # 토큰 관리 (~45 lines)
│   │
│   ├── auth/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── authApi.ts                  # 인증 API (~80 lines)
│   │   └── authApi.types.ts            # 인증 타입 (~50 lines)
│   │
│   ├── user/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── userApi.ts                  # 사용자 API (~45 lines)
│   │   └── userApi.types.ts            # 사용자 타입 (~35 lines)
│   │
│   ├── workplace/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── workplaceApi.ts             # 사업장 API (~70 lines)
│   │   └── workplaceApi.types.ts       # 사업장 타입 (~50 lines)
│   │
│   ├── invitation/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── invitationApi.ts            # 초대 API (~40 lines)
│   │   └── invitationApi.types.ts      # 초대 타입 (~30 lines)
│   │
│   ├── attendance/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── attendanceApi.ts            # 출퇴근 API (~65 lines)
│   │   └── attendanceApi.types.ts      # 출퇴근 타입 (~55 lines)
│   │
│   ├── approval/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── approvalApi.ts              # 승인 요청 API (~50 lines)
│   │   └── approvalApi.types.ts        # 승인 타입 (~40 lines)
│   │
│   ├── calendar/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── calendarApi.ts              # 캘린더 API (~45 lines)
│   │   └── calendarApi.types.ts        # 캘린더 타입 (~45 lines)
│   │
│   ├── checklist/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── checklistApi.ts             # 체크리스트 API (~55 lines)
│   │   └── checklistApi.types.ts       # 체크리스트 타입 (~45 lines)
│   │
│   ├── task/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── taskApi.ts                  # 업무 수행 API (~50 lines)
│   │   └── taskApi.types.ts            # 업무 타입 (~40 lines)
│   │
│   ├── announcement/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── announcementApi.ts          # 공지사항 API (~70 lines)
│   │   └── announcementApi.types.ts    # 공지사항 타입 (~50 lines)
│   │
│   ├── chat/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── chatApi.ts                  # 채팅 API (~55 lines)
│   │   └── chatApi.types.ts            # 채팅 타입 (~50 lines)
│   │
│   ├── contract/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── contractApi.ts              # 근로계약서 API (~60 lines)
│   │   └── contractApi.types.ts        # 계약서 타입 (~55 lines)
│   │
│   ├── payroll/
│   │   ├── index.ts                    # (~5 lines)
│   │   ├── payrollApi.ts               # 급여 API (~55 lines)
│   │   └── payrollApi.types.ts         # 급여 타입 (~60 lines)
│   │
│   └── notification/
│       ├── index.ts                    # (~5 lines)
│       ├── notificationApi.ts          # 알림 API (~50 lines)
│       └── notificationApi.types.ts    # 알림 타입 (~40 lines)
│
└── storage/
    ├── index.ts                        # (~5 lines)
    ├── secureStorage.ts                # 보안 저장소 (토큰) (~40 lines)
    └── asyncStorage.ts                 # 일반 저장소 (~35 lines)
```

---

## 핵심 파일 상세

### axiosClient.ts (~50 lines)

```typescript
import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@config/api.config';
import { setupInterceptors } from './interceptors';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  setupInterceptors(client);
  return client;
};

export const apiClient = createApiClient();
export default apiClient;
```

### interceptors.ts (~60 lines)

```typescript
import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from './tokenManager';
import { authApi } from '../auth';
import { navigate } from '@navigation/navigationRef';

export const setupInterceptors = (client: AxiosInstance): void => {
  // 요청 인터셉터: 토큰 자동 주입
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const accessToken = await tokenManager.getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터: 401 시 토큰 갱신
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = await tokenManager.getRefreshToken();
          if (!refreshToken) throw new Error('No refresh token');
          
          const { accessToken, refreshToken: newRefresh } = await authApi.refresh(refreshToken);
          await tokenManager.setTokens(accessToken, newRefresh);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          await tokenManager.clearTokens();
          navigate('Login');
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};
```

### authApi.ts (~80 lines)

```typescript
import apiClient from '../client/axiosClient';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  AdminSignupRequest,
  UserResponse,
  RefreshResponse,
  CheckUsernameResponse,
  EmailCodeRequest,
  VerifyCodeRequest,
  PasswordResetRequest,
  BusinessVerifyRequest,
} from './authApi.types';

const BASE_PATH = '/auth';

export const authApi = {
  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      `${BASE_PATH}/login`,
      data
    );
    return response.data.data;
  },

  // 직원 회원가입
  signup: async (data: SignupRequest): Promise<UserResponse> => {
    const response = await apiClient.post<ApiResponse<UserResponse>>(
      `${BASE_PATH}/signup`,
      data
    );
    return response.data.data;
  },

  // 사업주 회원가입
  signupAdmin: async (data: AdminSignupRequest): Promise<UserResponse> => {
    const response = await apiClient.post<ApiResponse<UserResponse>>(
      `${BASE_PATH}/signup/admin`,
      data
    );
    return response.data.data;
  },

  // 토큰 갱신
  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await apiClient.post<ApiResponse<RefreshResponse>>(
      `${BASE_PATH}/refresh`,
      { refreshToken }
    );
    return response.data.data;
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    await apiClient.post(`${BASE_PATH}/logout`);
  },

  // 아이디 중복 확인
  checkUsername: async (username: string): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<boolean>>(
      `${BASE_PATH}/username/check`,
      { params: { username } }
    );
    return response.data.data;
  },

  // 이메일 인증번호 발송
  sendEmailCode: async (data: EmailCodeRequest): Promise<void> => {
    await apiClient.post(`${BASE_PATH}/email/send-code`, data);
  },

  // 이메일 인증번호 확인
  verifyEmailCode: async (data: VerifyCodeRequest): Promise<void> => {
    await apiClient.post(`${BASE_PATH}/email/verify-code`, data);
  },

  // 비밀번호 재설정 요청
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post(`${BASE_PATH}/password/reset`, { email });
  },

  // 비밀번호 재설정 확인
  confirmPasswordReset: async (data: PasswordResetRequest): Promise<void> => {
    await apiClient.post(`${BASE_PATH}/password/reset/confirm`, data);
  },

  // 사업자등록번호 검증
  verifyBusiness: async (data: BusinessVerifyRequest): Promise<boolean> => {
    const response = await apiClient.post<ApiResponse<boolean>>(
      `${BASE_PATH}/business/verify`,
      data
    );
    return response.data.data;
  },
};
```

### authApi.types.ts (~50 lines)

```typescript
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface SignupRequest {
  username: string;
  password: string;
  email: string;
  name: string;
  phone?: string;
}

export interface AdminSignupRequest extends SignupRequest {
  businessNumber: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'ADMIN' | 'EMPLOYEE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface EmailCodeRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface PasswordResetRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface BusinessVerifyRequest {
  businessNumber: string;
}
```

---

## 도메인별 API 요약

| 도메인 | API 파일 | 타입 파일 | 주요 엔드포인트 |
|--------|---------|----------|----------------|
| auth | 80 lines | 50 lines | login, signup, refresh, logout |
| user | 45 lines | 35 lines | getMe, updateProfile, changePassword |
| workplace | 70 lines | 50 lines | create, list, detail, update, invite, members |
| invitation | 40 lines | 30 lines | list, accept, reject |
| attendance | 65 lines | 55 lines | clockIn, clockOut, today, records |
| approval | 50 lines | 40 lines | list, pendingCount, approve, reject |
| calendar | 45 lines | 45 lines | monthly, daily, summary |
| checklist | 55 lines | 45 lines | create, list, detail, update, delete |
| task | 50 lines | 40 lines | todayTasks, complete, skip |
| announcement | 70 lines | 50 lines | create, list, detail, read, comments |
| chat | 55 lines | 50 lines | createRoom, rooms, messages, read |
| contract | 60 lines | 55 lines | create, list, validate, send, sign |
| payroll | 55 lines | 60 lines | list, detail, calculate, generate, confirm |
| notification | 50 lines | 40 lines | list, read, readAll, settings |

---

## 공통 타입 정의

### src/types/api.types.ts (~40 lines)

```typescript
// 공통 응답 형식
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// 에러 응답 형식
export interface ApiError {
  success: false;
  message: string;
  code?: string;
  timestamp: string;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

// 페이징 응답
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 페이징 요청
export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}
```

---

## 관련 문서

- [공통 API 규격](../../13_api/00-common.md)
- [인증 API](../../13_api/01-auth.md)
- [사용자 API](../../13_api/02-user.md)
- [사업장 API](../../13_api/03-workplace.md)
- [출퇴근 API](../../13_api/05-attendance.md)

