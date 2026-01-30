# 메모리 관리 최적화

## 1. 메모리 누수 방지

### 1.1 컴포넌트 언마운트 시 정리

```typescript
import { useEffect, useRef, useCallback } from 'react';

// ✅ 비동기 작업 취소
export const useAsyncEffect = (
  asyncFn: (isMounted: () => boolean) => Promise<void>,
  deps: React.DependencyList
) => {
  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;
    
    asyncFn(isMounted);
    
    return () => {
      mounted = false;
    };
  }, deps);
};

// 사용 예시
const DataFetcher: React.FC<{ id: string }> = ({ id }) => {
  const [data, setData] = useState(null);

  useAsyncEffect(async (isMounted) => {
    const result = await fetchData(id);
    
    // 컴포넌트가 언마운트되었으면 상태 업데이트 스킵
    if (isMounted()) {
      setData(result);
    }
  }, [id]);

  return <Text>{data?.name}</Text>;
};
```

### 1.2 이벤트 리스너 정리

```typescript
import { useEffect } from 'react';
import { AppState, AppStateStatus, Keyboard, EmitterSubscription } from 'react-native';

export const useAppStateListener = (
  callback: (state: AppStateStatus) => void
) => {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', callback);
    
    return () => {
      subscription.remove();
    };
  }, [callback]);
};

export const useKeyboardListener = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardHeight;
};
```

### 1.3 타이머 정리

```typescript
import { useEffect, useRef, useCallback } from 'react';

// ✅ 안전한 setTimeout
export const useSafeTimeout = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setSafeTimeout = useCallback((callback: () => void, delay: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(callback, delay);
  }, []);

  const clearSafeTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { setSafeTimeout, clearSafeTimeout };
};

// ✅ 안전한 setInterval
export const useSafeInterval = (
  callback: () => void,
  delay: number | null
) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};
```

### 1.4 WebSocket/Socket.IO 정리

```typescript
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (url: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(url, {
      transports: ['websocket'],
      autoConnect: true,
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [url]);

  return socketRef.current;
};
```

---

## 2. 대용량 데이터 처리

### 2.1 청크 처리

```typescript
// 대용량 배열을 청크로 분할 처리
export const processInChunks = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  chunkSize = 100,
  onProgress?: (processed: number, total: number) => void
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
    
    onProgress?.(Math.min(i + chunkSize, items.length), items.length);
    
    // UI 스레드 양보
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
};

// 사용 예시
const processAttendanceRecords = async (records: AttendanceRecord[]) => {
  const results = await processInChunks(
    records,
    async (record) => {
      // 무거운 처리
      return transformRecord(record);
    },
    50,
    (processed, total) => {
      console.log(`Progress: ${processed}/${total}`);
    }
  );
  return results;
};
```

### 2.2 가비지 컬렉션 최적화

```typescript
// 대용량 객체 참조 해제
const processLargeData = async (data: LargeData[]) => {
  const results = [];
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const result = await process(item);
    results.push(result);
    
    // 처리 완료된 원본 데이터 참조 해제
    data[i] = null as any;
  }
  
  // 원본 배열 정리
  data.length = 0;
  
  return results;
};

// WeakMap으로 메모리 효율적인 캐시
const cache = new WeakMap<object, ProcessedData>();

const getCachedOrProcess = (obj: object): ProcessedData => {
  if (cache.has(obj)) {
    return cache.get(obj)!;
  }
  
  const processed = expensiveProcess(obj);
  cache.set(obj, processed);
  return processed;
};
```

### 2.3 스트리밍 처리

```typescript
// 대용량 파일 스트리밍 업로드
import RNFS from 'react-native-fs';

export const uploadLargeFile = async (
  filePath: string,
  uploadUrl: string,
  onProgress: (progress: number) => void
): Promise<void> => {
  const fileSize = (await RNFS.stat(filePath)).size;
  const chunkSize = 1024 * 1024; // 1MB chunks
  let uploaded = 0;

  for (let offset = 0; offset < fileSize; offset += chunkSize) {
    const chunk = await RNFS.read(
      filePath,
      chunkSize,
      offset,
      'base64'
    );

    await apiClient.post(uploadUrl, {
      chunk,
      offset,
      totalSize: fileSize,
    });

    uploaded += chunkSize;
    onProgress(Math.min(uploaded / fileSize, 1));
  }
};
```

---

## 3. 이미지 메모리 관리

### 3.1 이미지 캐시 크기 제한

```typescript
import FastImage from 'react-native-fast-image';

// 앱 시작 시 캐시 정리 정책
export const setupImageCache = async () => {
  // 메모리 캐시 크기 제한 (FastImage 내부 관리)
  // 디스크 캐시 주기적 정리
  const lastClear = await AsyncStorage.getItem('last_image_cache_clear');
  const daysSinceClear = lastClear
    ? (Date.now() - parseInt(lastClear)) / (1000 * 60 * 60 * 24)
    : Infinity;

  if (daysSinceClear > 7) {
    await FastImage.clearDiskCache();
    await AsyncStorage.setItem('last_image_cache_clear', Date.now().toString());
  }
};

// 메모리 부족 시 캐시 정리
import { AppState } from 'react-native';

AppState.addEventListener('memoryWarning', () => {
  FastImage.clearMemoryCache();
  console.warn('Memory warning: cleared image cache');
});
```

### 3.2 이미지 크기 제한

```typescript
import { Image, PixelRatio } from 'react-native';

// 디바이스에 맞는 최적 이미지 크기 계산
export const getOptimalImageSize = (
  displayWidth: number,
  displayHeight: number
): { width: number; height: number } => {
  const pixelRatio = Math.min(PixelRatio.get(), 3); // 최대 3x로 제한
  
  return {
    width: Math.round(displayWidth * pixelRatio),
    height: Math.round(displayHeight * pixelRatio),
  };
};

// 이미지 다운샘플링
export const shouldDownsample = (
  imageWidth: number,
  imageHeight: number,
  maxPixels = 4096 * 4096
): boolean => {
  return imageWidth * imageHeight > maxPixels;
};
```

---

## 4. 리스트 메모리 최적화

### 4.1 windowSize 조정

```typescript
import { FlatList, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 80;
const ITEMS_PER_SCREEN = Math.ceil(SCREEN_HEIGHT / ITEM_HEIGHT);

export const MemoryEfficientList: React.FC<{ data: Item[] }> = ({ data }) => {
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      // 메모리 최적화 설정
      windowSize={3}  // 화면 높이의 3배만 렌더링
      maxToRenderPerBatch={ITEMS_PER_SCREEN}
      updateCellsBatchingPeriod={50}
      initialNumToRender={ITEMS_PER_SCREEN}
      removeClippedSubviews={true}
    />
  );
};
```

### 4.2 아이템 재활용 (FlashList)

```typescript
import { FlashList } from '@shopify/flash-list';

// FlashList는 자동으로 아이템을 재활용
export const RecyclingList: React.FC<{ data: Item[] }> = ({ data }) => {
  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={80}
      // 드로우 거리 제한 (더 적은 오버드로우)
      drawDistance={200}
    />
  );
};
```

---

## 5. 메모리 모니터링

### 5.1 메모리 사용량 추적

```typescript
import { NativeModules, Platform } from 'react-native';

// 네이티브 메모리 정보 (네이티브 모듈 필요)
export const getMemoryUsage = async (): Promise<{
  usedMemory: number;
  totalMemory: number;
}> => {
  if (Platform.OS === 'ios') {
    // iOS 네이티브 모듈 필요
    return NativeModules.MemoryModule?.getMemoryUsage() ?? {
      usedMemory: 0,
      totalMemory: 0,
    };
  } else {
    // Android 네이티브 모듈 필요
    return NativeModules.MemoryModule?.getMemoryUsage() ?? {
      usedMemory: 0,
      totalMemory: 0,
    };
  }
};

// 개발 환경에서 메모리 모니터링
export const useMemoryMonitor = (intervalMs = 5000) => {
  useEffect(() => {
    if (!__DEV__) return;

    const id = setInterval(async () => {
      const usage = await getMemoryUsage();
      const usedMB = (usage.usedMemory / 1024 / 1024).toFixed(2);
      const totalMB = (usage.totalMemory / 1024 / 1024).toFixed(2);
      
      console.log(`[Memory] ${usedMB}MB / ${totalMB}MB`);
      
      // 메모리 경고 임계값
      if (usage.usedMemory / usage.totalMemory > 0.8) {
        console.warn('[Memory] High memory usage detected!');
      }
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);
};
```

### 5.2 메모리 누수 탐지

```typescript
// 개발 환경에서 컴포넌트 인스턴스 추적
const componentInstances = new Map<string, Set<number>>();
let instanceCounter = 0;

export const useTrackInstance = (componentName: string) => {
  useEffect(() => {
    if (!__DEV__) return;

    const instanceId = ++instanceCounter;
    
    if (!componentInstances.has(componentName)) {
      componentInstances.set(componentName, new Set());
    }
    componentInstances.get(componentName)!.add(instanceId);
    
    console.log(
      `[Instance] ${componentName} mounted. Total: ${
        componentInstances.get(componentName)!.size
      }`
    );

    return () => {
      componentInstances.get(componentName)!.delete(instanceId);
      console.log(
        `[Instance] ${componentName} unmounted. Total: ${
          componentInstances.get(componentName)!.size
        }`
      );
    };
  }, [componentName]);
};

// 주기적으로 인스턴스 수 확인
export const logComponentInstances = () => {
  if (!__DEV__) return;
  
  console.log('[Component Instances]');
  componentInstances.forEach((instances, name) => {
    if (instances.size > 0) {
      console.log(`  ${name}: ${instances.size}`);
    }
  });
};
```

---

## 6. 네이티브 메모리 관리

### 6.1 iOS 메모리 경고 처리

```typescript
// iOS에서 메모리 경고 수신
import { NativeEventEmitter, NativeModules } from 'react-native';

const setupMemoryWarningHandler = () => {
  if (Platform.OS !== 'ios') return;

  const eventEmitter = new NativeEventEmitter(NativeModules.MemoryWarning);
  
  const subscription = eventEmitter.addListener('memoryWarning', () => {
    console.warn('iOS memory warning received');
    
    // 캐시 정리
    FastImage.clearMemoryCache();
    
    // React Query 캐시 정리
    queryClient.clear();
    
    // 기타 정리 작업
  });

  return () => subscription.remove();
};
```

### 6.2 Android 메모리 관리

```typescript
// Android Low Memory Killer 대응
import { AppState, Platform } from 'react-native';

const setupAndroidMemoryHandler = () => {
  if (Platform.OS !== 'android') return;

  // 백그라운드로 전환 시 메모리 정리
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'background') {
      // 불필요한 캐시 정리
      FastImage.clearMemoryCache();
      
      // 무거운 데이터 해제
      releaseHeavyData();
    }
  });

  return () => subscription.remove();
};
```

---

## 7. 메모리 최적화 체크리스트

### 7.1 메모리 누수 방지

- [ ] useEffect cleanup 함수 구현
- [ ] 이벤트 리스너 제거
- [ ] 타이머/인터벌 정리
- [ ] WebSocket 연결 해제
- [ ] 비동기 작업 취소

### 7.2 대용량 데이터

- [ ] 청크 처리 적용
- [ ] 스트리밍 업로드/다운로드
- [ ] WeakMap/WeakRef 사용
- [ ] 불필요한 참조 해제

### 7.3 리스트

- [ ] FlatList/FlashList 사용
- [ ] windowSize 최적화
- [ ] removeClippedSubviews 활성화
- [ ] getItemLayout 제공

### 7.4 이미지

- [ ] 캐시 크기 제한
- [ ] 메모리 경고 시 캐시 정리
- [ ] 최적 이미지 크기 사용

### 7.5 모니터링

- [ ] 메모리 사용량 추적
- [ ] 컴포넌트 인스턴스 추적
- [ ] 메모리 경고 처리

