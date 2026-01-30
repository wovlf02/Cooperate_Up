# 렌더링 최적화 개요

## 1. 최적화 필요성

### 1.1 대규모 트래픽 시나리오

| 시나리오 | 예상 부하 | 영향 |
|----------|----------|------|
| 출퇴근 피크 시간 | 동시 접속 1만+ | 메인 API 부하 |
| 공지사항 일괄 발송 | 순간 트래픽 급증 | 푸시/리스트 갱신 |
| 월말 급여 조회 | 대용량 데이터 렌더링 | 메모리 사용량 증가 |
| 실시간 채팅 | 고빈도 리렌더링 | FPS 저하 |

### 1.2 React Native 성능 특성

```
[JavaScript Thread] ←→ [Bridge] ←→ [Native Thread]
        ↓                              ↓
   비즈니스 로직               UI 렌더링
   상태 관리                   네이티브 모듈
```

- **Bridge 병목**: JS-Native 간 통신이 성능 저하의 주요 원인
- **JavaScript 단일 스레드**: 무거운 연산 시 UI 블로킹
- **메모리 관리**: JavaScript GC와 Native 메모리 분리

---

## 2. 핵심 최적화 원칙

### 2.1 리렌더링 최소화

```typescript
// ❌ Bad: 매 렌더링마다 새 객체/함수 생성
const Component = () => {
  return (
    <ChildComponent
      style={{ padding: 10 }}  // 새 객체
      onPress={() => doSomething()}  // 새 함수
    />
  );
};

// ✅ Good: 메모이제이션 활용
const Component = () => {
  const style = useMemo(() => ({ padding: 10 }), []);
  const handlePress = useCallback(() => doSomething(), []);
  
  return (
    <ChildComponent
      style={style}
      onPress={handlePress}
    />
  );
};
```

### 2.2 Bridge 통신 최소화

```typescript
// ❌ Bad: 빈번한 Native 호출
items.forEach(item => {
  NativeModule.process(item);  // N번의 Bridge 통신
});

// ✅ Good: 배치 처리
NativeModule.processBatch(items);  // 1번의 Bridge 통신
```

### 2.3 메모리 효율적 사용

```typescript
// ❌ Bad: 전체 데이터 로드
const [allItems, setAllItems] = useState<Item[]>([]);
useEffect(() => {
  fetchAllItems().then(setAllItems);  // 10만 건 한번에 로드
}, []);

// ✅ Good: 페이지네이션
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['items'],
  queryFn: fetchItems,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

---

## 3. 성능 측정 도구

### 3.1 개발 환경

| 도구 | 용도 | 설정 |
|------|------|------|
| **React DevTools Profiler** | 리렌더링 분석 | Flipper 연동 |
| **Flipper** | 성능/네트워크/메모리 | RN 기본 지원 |
| **Hermes Profiler** | JS 실행 시간 분석 | Hermes 엔진 필요 |
| **Xcode Instruments** | iOS 성능 분석 | iOS 빌드 필요 |
| **Android Profiler** | Android 성능 분석 | Android Studio |

### 3.2 프로덕션 모니터링

| 서비스 | 용도 |
|--------|------|
| **Firebase Performance** | 앱 성능 메트릭 |
| **Sentry** | 에러 추적, 성능 트랜잭션 |
| **CloudWatch** | 서버 사이드 모니터링 |

### 3.3 성능 측정 코드

```typescript
// 컴포넌트 렌더링 시간 측정
import { useEffect, useRef } from 'react';

export const useRenderTime = (componentName: string) => {
  const startTime = useRef(performance.now());
  
  useEffect(() => {
    const renderTime = performance.now() - startTime.current;
    if (renderTime > 16) {  // 60fps 기준 16ms
      console.warn(`[Performance] ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  });
};

// FPS 모니터링
export const useFPSMonitor = () => {
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        console.log(`FPS: ${frameCount}`);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    const frameId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(frameId);
  }, []);
};
```

---

## 4. 최적화 체크리스트

### 4.1 컴포넌트

- [ ] React.memo 적절히 사용
- [ ] useMemo/useCallback으로 참조 안정성 확보
- [ ] Props 최소화 (필요한 데이터만 전달)
- [ ] 컴포넌트 분할 (큰 컴포넌트 → 작은 컴포넌트)

### 4.2 리스트

- [ ] FlatList/FlashList 사용 (ScrollView 지양)
- [ ] keyExtractor 올바르게 구현
- [ ] getItemLayout 제공 (고정 높이)
- [ ] windowSize/initialNumToRender 조정

### 4.3 이미지

- [ ] 적절한 이미지 사이즈 사용
- [ ] 캐싱 라이브러리 사용 (react-native-fast-image)
- [ ] 로딩 상태 표시 (placeholder)
- [ ] 레이지 로딩 구현

### 4.4 상태 관리

- [ ] 전역 상태 최소화
- [ ] 셀렉터로 필요한 상태만 구독
- [ ] 정규화된 상태 구조
- [ ] 불변성 유지

### 4.5 네트워크

- [ ] React Query 캐싱 활용
- [ ] 요청 중복 제거
- [ ] 적절한 staleTime/cacheTime 설정
- [ ] 낙관적 업데이트 구현

---

## 5. 참고 자료

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Shopify FlashList](https://shopify.github.io/flash-list/)
- [React Query Docs](https://tanstack.com/query/latest)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

