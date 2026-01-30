# 네트워크 요청 최적화

## 1. Axios 인터셉터 설정

### 1.1 기본 설정

```typescript
// src/api/client.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, refreshAccessToken, clearTokens } from '../utils/auth';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.bizone.com/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 요청 시작 시간 기록 (성능 측정용)
    config.metadata = { startTime: Date.now() };
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // 응답 시간 로깅
    const duration = Date.now() - response.config.metadata?.startTime;
    if (__DEV__ && duration > 1000) {
      console.warn(`[API] Slow request: ${response.config.url} (${duration}ms)`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // 401 에러 시 토큰 갱신 시도
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        await clearTokens();
        // 로그인 화면으로 이동
        navigationRef.navigate('Login');
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### 1.2 타입 확장

```typescript
// src/types/axios.d.ts
import 'axios';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
    _retry?: boolean;
  }
}
```

---

## 2. 요청 중복 제거

### 2.1 요청 취소 관리

```typescript
// src/api/requestManager.ts
import axios, { CancelTokenSource } from 'axios';

class RequestManager {
  private pendingRequests: Map<string, CancelTokenSource> = new Map();

  // 요청 키 생성
  private generateRequestKey(
    url: string,
    method: string,
    params?: object
  ): string {
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }

  // 이전 요청 취소 후 새 토큰 반환
  public getToken(url: string, method: string, params?: object): CancelTokenSource {
    const key = this.generateRequestKey(url, method, params);
    
    // 이전 요청 취소
    if (this.pendingRequests.has(key)) {
      this.pendingRequests.get(key)?.cancel('Duplicate request cancelled');
    }
    
    // 새 토큰 생성
    const source = axios.CancelToken.source();
    this.pendingRequests.set(key, source);
    
    return source;
  }

  // 요청 완료 시 정리
  public removeRequest(url: string, method: string, params?: object): void {
    const key = this.generateRequestKey(url, method, params);
    this.pendingRequests.delete(key);
  }

  // 모든 요청 취소 (화면 이탈 시)
  public cancelAll(): void {
    this.pendingRequests.forEach((source) => {
      source.cancel('All requests cancelled');
    });
    this.pendingRequests.clear();
  }
}

export const requestManager = new RequestManager();
```

### 2.2 훅에서 사용

```typescript
import { useEffect, useCallback, useRef } from 'react';
import { apiClient } from './client';
import { requestManager } from './requestManager';

export const useApiRequest = <T>(
  url: string,
  method: 'get' | 'post' | 'put' | 'delete' = 'get'
) => {
  const cancelSourceRef = useRef<CancelTokenSource | null>(null);

  const execute = useCallback(
    async (params?: object, data?: object): Promise<T> => {
      // 이전 요청 취소하고 새 토큰 받기
      const source = requestManager.getToken(url, method, params);
      cancelSourceRef.current = source;

      try {
        const response = await apiClient.request<T>({
          url,
          method,
          params,
          data,
          cancelToken: source.token,
        });
        return response.data;
      } finally {
        requestManager.removeRequest(url, method, params);
      }
    },
    [url, method]
  );

  // 컴포넌트 언마운트 시 요청 취소
  useEffect(() => {
    return () => {
      cancelSourceRef.current?.cancel('Component unmounted');
    };
  }, []);

  return { execute };
};
```

---

## 3. 요청 배치 처리

### 3.1 DataLoader 패턴

```typescript
// src/api/dataLoader.ts
type BatchFunction<K, V> = (keys: K[]) => Promise<V[]>;

class DataLoader<K, V> {
  private batch: K[] = [];
  private batchPromise: Promise<Map<K, V>> | null = null;
  private batchFunction: BatchFunction<K, V>;
  private maxBatchSize: number;
  private batchDelayMs: number;

  constructor(
    batchFunction: BatchFunction<K, V>,
    options: { maxBatchSize?: number; batchDelayMs?: number } = {}
  ) {
    this.batchFunction = batchFunction;
    this.maxBatchSize = options.maxBatchSize || 50;
    this.batchDelayMs = options.batchDelayMs || 10;
  }

  async load(key: K): Promise<V> {
    this.batch.push(key);

    if (!this.batchPromise) {
      this.batchPromise = new Promise((resolve) => {
        setTimeout(async () => {
          const currentBatch = [...this.batch];
          this.batch = [];
          this.batchPromise = null;

          const results = await this.batchFunction(currentBatch);
          const resultMap = new Map<K, V>();
          currentBatch.forEach((k, i) => resultMap.set(k, results[i]));
          resolve(resultMap);
        }, this.batchDelayMs);
      });
    }

    const resultMap = await this.batchPromise;
    return resultMap.get(key)!;
  }
}

// 사용 예시: 사용자 프로필 배치 로드
const userLoader = new DataLoader<string, User>(
  async (userIds) => {
    const response = await apiClient.post('/users/batch', { ids: userIds });
    return response.data;
  },
  { maxBatchSize: 100, batchDelayMs: 16 }
);

// 개별 호출이 자동으로 배치됨
const user1 = await userLoader.load('user-1');
const user2 = await userLoader.load('user-2');
```

### 3.2 React Query에서 배치 처리

```typescript
import { useQueries } from '@tanstack/react-query';

// 여러 직원 정보를 병렬로 가져오기
export const useEmployeesData = (employeeIds: string[]) => {
  const queries = useQueries({
    queries: employeeIds.map((id) => ({
      queryKey: ['employee', id],
      queryFn: () => fetchEmployee(id),
      staleTime: 5 * 60 * 1000,
    })),
    combine: (results) => {
      return {
        data: results.map((r) => r.data).filter(Boolean) as Employee[],
        isLoading: results.some((r) => r.isLoading),
        isError: results.some((r) => r.isError),
      };
    },
  });

  return queries;
};
```

---

## 4. 응답 압축 및 최적화

### 4.1 Gzip 압축 처리

```typescript
// 서버에서 gzip 응답 시 자동 처리됨 (axios 기본 지원)
// Accept-Encoding 헤더 자동 설정

// 대용량 요청 시 압축
import pako from 'pako';

export const sendCompressedData = async (url: string, data: object) => {
  const jsonString = JSON.stringify(data);
  const compressed = pako.gzip(jsonString);
  
  return apiClient.post(url, compressed, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip',
    },
  });
};
```

### 4.2 응답 데이터 선택적 요청

```typescript
// GraphQL 스타일의 필드 선택 (서버 지원 필요)
export const fetchEmployeePartial = async (
  id: string,
  fields: (keyof Employee)[]
) => {
  const response = await apiClient.get(`/employees/${id}`, {
    params: {
      fields: fields.join(','),
    },
  });
  return response.data;
};

// 사용 예시
const basicInfo = await fetchEmployeePartial('emp-1', ['name', 'email', 'department']);
```

---

## 5. 오프라인 지원

### 5.1 네트워크 상태 감지

```typescript
// src/hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      });
    });

    return () => unsubscribe();
  }, []);

  return status;
};
```

### 5.2 오프라인 큐

```typescript
// src/api/offlineQueue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  data?: object;
  timestamp: number;
  retryCount: number;
}

const QUEUE_KEY = 'offline_request_queue';

class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;

  async init() {
    const stored = await AsyncStorage.getItem(QUEUE_KEY);
    if (stored) {
      this.queue = JSON.parse(stored);
    }
    
    // 네트워크 복구 시 큐 처리
    NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        this.processQueue();
      }
    });
  }

  async enqueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>) {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    this.queue.push(queuedRequest);
    await this.saveQueue();
    
    // 온라인이면 즉시 처리
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue[0];
      
      try {
        await apiClient.request({
          url: request.url,
          method: request.method,
          data: request.data,
        });
        
        // 성공 시 큐에서 제거
        this.queue.shift();
        await this.saveQueue();
      } catch (error) {
        request.retryCount++;
        
        if (request.retryCount >= 3) {
          // 최대 재시도 횟수 초과
          this.queue.shift();
          console.error('Request failed after 3 retries:', request);
        }
        
        await this.saveQueue();
        break;  // 실패 시 중단
      }
    }
    
    this.isProcessing = false;
  }

  private async saveQueue() {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
  }

  getQueueLength() {
    return this.queue.length;
  }
}

export const offlineQueue = new OfflineQueue();
```

### 5.3 오프라인 우선 전략

```typescript
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkStatus } from './useNetworkStatus';

const CACHE_PREFIX = 'api_cache_';

// 오프라인 캐시 저장
const cacheResponse = async (key: string, data: unknown) => {
  await AsyncStorage.setItem(
    `${CACHE_PREFIX}${key}`,
    JSON.stringify({ data, timestamp: Date.now() })
  );
};

// 오프라인 캐시 조회
const getCachedResponse = async <T>(key: string): Promise<T | null> => {
  const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
  if (cached) {
    const { data } = JSON.parse(cached);
    return data as T;
  }
  return null;
};

// 오프라인 우선 쿼리 훅
export const useOfflineFirstQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>
) => {
  const { isConnected } = useNetworkStatus();
  const cacheKey = queryKey.join('_');

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!isConnected) {
        // 오프라인: 캐시에서 조회
        const cached = await getCachedResponse<T>(cacheKey);
        if (cached) return cached;
        throw new Error('No cached data available');
      }

      // 온라인: API 호출 후 캐싱
      const data = await queryFn();
      await cacheResponse(cacheKey, data);
      return data;
    },
    networkMode: 'offlineFirst',
    staleTime: isConnected ? 5 * 60 * 1000 : Infinity,
  });
};
```

---

## 6. 재시도 전략

### 6.1 지수 백오프

```typescript
// src/api/retryStrategy.ts
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  shouldRetry: (error: AxiosError) => boolean;
}

const defaultConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  shouldRetry: (error) => {
    // 네트워크 에러 또는 5xx 에러만 재시도
    if (!error.response) return true;
    return error.response.status >= 500;
  },
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const { maxRetries, baseDelay, maxDelay, shouldRetry } = {
    ...defaultConfig,
    ...config,
  };

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) break;
      if (!shouldRetry(error as AxiosError)) break;

      // 지수 백오프 + 지터
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );

      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// 사용 예시
const fetchWithRetry = () =>
  withRetry(
    () => apiClient.get('/important-data'),
    { maxRetries: 5, baseDelay: 500 }
  );
```

---

## 7. 성능 모니터링

### 7.1 API 응답 시간 추적

```typescript
// src/api/metrics.ts
interface ApiMetric {
  url: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
}

class ApiMetricsCollector {
  private metrics: ApiMetric[] = [];
  private maxMetrics = 1000;

  record(metric: ApiMetric) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getAverageByEndpoint(): Record<string, number> {
    const grouped = this.metrics.reduce<Record<string, number[]>>((acc, m) => {
      const key = `${m.method}:${m.url}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(m.duration);
      return acc;
    }, {});

    return Object.entries(grouped).reduce<Record<string, number>>(
      (acc, [key, durations]) => {
        acc[key] = durations.reduce((a, b) => a + b, 0) / durations.length;
        return acc;
      },
      {}
    );
  }

  getSlowRequests(threshold = 1000): ApiMetric[] {
    return this.metrics.filter((m) => m.duration > threshold);
  }

  exportMetrics(): ApiMetric[] {
    return [...this.metrics];
  }
}

export const apiMetrics = new ApiMetricsCollector();

// 인터셉터에서 사용
apiClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata?.startTime;
    apiMetrics.record({
      url: response.config.url || '',
      method: response.config.method || 'get',
      duration,
      status: response.status,
      timestamp: Date.now(),
    });
    return response;
  },
  (error) => {
    // 에러도 기록
    if (error.config) {
      const duration = Date.now() - error.config.metadata?.startTime;
      apiMetrics.record({
        url: error.config.url || '',
        method: error.config.method || 'get',
        duration,
        status: error.response?.status || 0,
        timestamp: Date.now(),
      });
    }
    return Promise.reject(error);
  }
);
```

---

## 8. 네트워크 최적화 체크리스트

- [ ] Axios 인터셉터 설정 (토큰, 에러 처리)
- [ ] 요청 취소 관리 (중복 요청 방지)
- [ ] 요청 배치 처리 (DataLoader)
- [ ] 응답 압축 활성화
- [ ] 오프라인 지원 (큐, 캐시)
- [ ] 재시도 전략 (지수 백오프)
- [ ] API 성능 모니터링
- [ ] 네트워크 상태 감지

