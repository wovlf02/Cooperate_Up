# 성능 모니터링

## 1. 개발 환경 모니터링

### 1.1 React Native Performance Monitor

```typescript
// 개발 메뉴에서 "Perf Monitor" 활성화
// 또는 프로그래밍 방식으로 활성화

import { NativeModules } from 'react-native';

if (__DEV__) {
  // Performance Monitor 자동 활성화
  NativeModules.DevSettings?.setIsDebuggingRemotely?.(false);
}
```

### 1.2 Flipper 연동

```typescript
// 개발 환경에서 Flipper 플러그인 활용
// - React DevTools: 컴포넌트 트리, Props 확인
// - Network: API 요청/응답 모니터링
// - Layout: 레이아웃 인스펙터
// - Databases: AsyncStorage 확인
// - Shared Preferences: 설정 확인

// Flipper 설정 (android/app/src/debug/java/.../ReactNativeFlipper.java)
// 기본 설정으로 React Native에서 지원
```

### 1.3 React DevTools Profiler

```typescript
// Profiler 컴포넌트로 렌더링 성능 측정
import React, { Profiler, ProfilerOnRenderCallback } from 'react';

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  if (__DEV__) {
    console.log(`[Profiler] ${id}`);
    console.log(`  Phase: ${phase}`);
    console.log(`  Actual duration: ${actualDuration.toFixed(2)}ms`);
    console.log(`  Base duration: ${baseDuration.toFixed(2)}ms`);
  }
};

export const ProfiledComponent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Profiler id="MyComponent" onRender={onRenderCallback}>
    {children}
  </Profiler>
);
```

---

## 2. 커스텀 성능 측정

### 2.1 앱 시작 시간 측정

```typescript
// src/utils/performance.ts
import { InteractionManager, NativeModules, Platform } from 'react-native';

class PerformanceTracker {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();
  private appStartTime: number;

  constructor() {
    this.appStartTime = Date.now();
  }

  // 시작점 마킹
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  // 측정
  measure(name: string, startMark: string, endMark?: string): number {
    const startTime = this.marks.get(startMark);
    const endTime = endMark ? this.marks.get(endMark) : performance.now();
    
    if (!startTime) {
      console.warn(`Start mark '${startMark}' not found`);
      return 0;
    }
    
    const duration = (endTime || performance.now()) - startTime;
    this.measures.set(name, duration);
    
    return duration;
  }

  // 앱 시작 시간
  getAppStartTime(): number {
    return Date.now() - this.appStartTime;
  }

  // TTI (Time to Interactive) 측정
  async measureTTI(): Promise<number> {
    const startTime = performance.now();
    
    await new Promise<void>((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        resolve();
      });
    });
    
    return performance.now() - startTime;
  }

  // 모든 측정값 가져오기
  getAllMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures);
  }

  // 로그 출력
  logAll(): void {
    console.log('=== Performance Measures ===');
    this.measures.forEach((duration, name) => {
      console.log(`${name}: ${duration.toFixed(2)}ms`);
    });
  }
}

export const performanceTracker = new PerformanceTracker();

// 사용 예시
// index.js
performanceTracker.mark('app_start');

// App.tsx
const App = () => {
  useEffect(() => {
    performanceTracker.mark('app_mounted');
    performanceTracker.measure('startup_time', 'app_start', 'app_mounted');
    
    InteractionManager.runAfterInteractions(() => {
      performanceTracker.mark('app_interactive');
      performanceTracker.measure('tti', 'app_start', 'app_interactive');
      performanceTracker.logAll();
    });
  }, []);
  
  return <AppContent />;
};
```

### 2.2 화면 렌더링 시간 측정

```typescript
// src/hooks/useScreenPerformance.ts
import { useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { InteractionManager } from 'react-native';

interface ScreenPerformance {
  screenName: string;
  mountTime: number;
  renderTime: number;
  interactiveTime: number;
}

export const useScreenPerformance = (screenName: string) => {
  const startTime = useRef(performance.now());
  const mountTime = useRef(0);
  const renderTime = useRef(0);

  useEffect(() => {
    mountTime.current = performance.now() - startTime.current;
    
    // 다음 프레임까지 대기
    requestAnimationFrame(() => {
      renderTime.current = performance.now() - startTime.current;
    });
  }, []);

  useFocusEffect(() => {
    const startFocusTime = performance.now();
    
    InteractionManager.runAfterInteractions(() => {
      const interactiveTime = performance.now() - startFocusTime;
      
      const metrics: ScreenPerformance = {
        screenName,
        mountTime: mountTime.current,
        renderTime: renderTime.current,
        interactiveTime,
      };
      
      if (__DEV__) {
        console.log(`[Screen Performance] ${screenName}`);
        console.log(`  Mount: ${metrics.mountTime.toFixed(2)}ms`);
        console.log(`  Render: ${metrics.renderTime.toFixed(2)}ms`);
        console.log(`  Interactive: ${metrics.interactiveTime.toFixed(2)}ms`);
      }
      
      // 프로덕션에서는 분석 서비스로 전송
      sendToAnalytics('screen_performance', metrics);
    });
  });
};

// 사용 예시
const HomeScreen: React.FC = () => {
  useScreenPerformance('HomeScreen');
  
  return <HomeContent />;
};
```

### 2.3 FPS 모니터링

```typescript
// src/hooks/useFPSMonitor.ts
import { useEffect, useRef, useState } from 'react';

export const useFPSMonitor = () => {
  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    if (!__DEV__) return;

    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime.current;

      if (elapsed >= 1000) {
        const currentFPS = Math.round((frameCount.current * 1000) / elapsed);
        setFps(currentFPS);
        
        if (currentFPS < 50) {
          console.warn(`[FPS] Low FPS detected: ${currentFPS}`);
        }
        
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    const frameId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return fps;
};

// FPS 오버레이 컴포넌트
export const FPSOverlay: React.FC = () => {
  const fps = useFPSMonitor();
  
  if (!__DEV__) return null;
  
  const color = fps >= 50 ? 'green' : fps >= 30 ? 'orange' : 'red';
  
  return (
    <View style={styles.overlay}>
      <Text style={[styles.text, { color }]}>{fps} FPS</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
```

---

## 3. 프로덕션 모니터링

### 3.1 Firebase Performance

```bash
# 설치
npm install @react-native-firebase/app @react-native-firebase/perf
cd ios && pod install
```

```typescript
// src/services/performanceMonitoring.ts
import perf, { FirebasePerformanceTypes } from '@react-native-firebase/perf';

// 커스텀 트레이스
export const traceScreenLoad = async (
  screenName: string,
  loadFn: () => Promise<void>
) => {
  const trace = await perf().startTrace(`screen_load_${screenName}`);
  
  try {
    await loadFn();
    trace.putMetric('success', 1);
  } catch (error) {
    trace.putMetric('error', 1);
    throw error;
  } finally {
    await trace.stop();
  }
};

// HTTP 메트릭 (자동 수집)
// react-native-firebase가 자동으로 네트워크 요청 추적

// 커스텀 메트릭
export const trackCustomMetric = async (
  name: string,
  value: number,
  attributes?: Record<string, string>
) => {
  const trace = await perf().startTrace(name);
  trace.putMetric('value', value);
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      trace.putAttribute(key, val);
    });
  }
  
  await trace.stop();
};

// 사용 예시
const HomeScreen: React.FC = () => {
  useEffect(() => {
    traceScreenLoad('Home', async () => {
      await fetchHomeData();
    });
  }, []);
  
  return <HomeContent />;
};
```

### 3.2 Sentry Performance

```bash
npm install @sentry/react-native
```

```typescript
// src/services/sentry.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  tracesSampleRate: 0.2,  // 20% 샘플링
  profilesSampleRate: 0.1, // 프로파일링 10% 샘플링
  integrations: [
    new Sentry.ReactNativeTracing({
      tracingOrigins: ['localhost', 'api.bizone.com'],
      routingInstrumentation: Sentry.reactNavigationIntegration,
    }),
  ],
});

// 네비게이션 연동
export const SentryNavigationContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigation = useNavigationContainerRef();
  
  return (
    <NavigationContainer
      ref={navigation}
      onReady={() => {
        Sentry.reactNavigationIntegration.registerNavigationContainer(navigation);
      }}
    >
      {children}
    </NavigationContainer>
  );
};

// 커스텀 트랜잭션
export const measureOperation = async <T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> => {
  const transaction = Sentry.startTransaction({
    name: operationName,
    op: 'task',
  });
  
  try {
    const result = await operation();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    Sentry.captureException(error);
    throw error;
  } finally {
    transaction.finish();
  }
};
```

### 3.3 커스텀 분석 서비스

```typescript
// src/services/analytics.ts
interface PerformanceEvent {
  eventName: string;
  screenName?: string;
  duration?: number;
  metrics?: Record<string, number>;
  attributes?: Record<string, string>;
  timestamp: string;
}

class PerformanceAnalytics {
  private events: PerformanceEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    // 30초마다 이벤트 전송
    this.flushInterval = setInterval(() => this.flush(), 30000);
  }

  track(event: Omit<PerformanceEvent, 'timestamp'>) {
    this.events.push({
      ...event,
      timestamp: new Date().toISOString(),
    });

    // 배치 크기 초과 시 즉시 전송
    if (this.events.length >= 50) {
      this.flush();
    }
  }

  private async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await api.post('/analytics/performance', { events: eventsToSend });
    } catch (error) {
      // 실패 시 이벤트 복구
      this.events = [...eventsToSend, ...this.events];
      console.error('Failed to send performance events:', error);
    }
  }

  // 앱 종료 시 정리
  cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const performanceAnalytics = new PerformanceAnalytics();

// 앱 종료 시 정리
import { AppState } from 'react-native';

AppState.addEventListener('change', (state) => {
  if (state === 'background' || state === 'inactive') {
    performanceAnalytics.cleanup();
  }
});
```

---

## 4. 알림 및 대시보드

### 4.1 성능 임계값 알림

```typescript
// src/services/performanceAlerts.ts
interface PerformanceThreshold {
  metric: string;
  warningThreshold: number;
  criticalThreshold: number;
}

const thresholds: PerformanceThreshold[] = [
  { metric: 'screen_load', warningThreshold: 1000, criticalThreshold: 3000 },
  { metric: 'api_response', warningThreshold: 500, criticalThreshold: 2000 },
  { metric: 'fps', warningThreshold: 50, criticalThreshold: 30 },
  { metric: 'memory_usage', warningThreshold: 200, criticalThreshold: 300 },
];

export const checkPerformanceThreshold = (
  metric: string,
  value: number,
  isLowerBetter = true
) => {
  const threshold = thresholds.find((t) => t.metric === metric);
  if (!threshold) return 'normal';

  if (isLowerBetter) {
    if (value >= threshold.criticalThreshold) return 'critical';
    if (value >= threshold.warningThreshold) return 'warning';
  } else {
    if (value <= threshold.criticalThreshold) return 'critical';
    if (value <= threshold.warningThreshold) return 'warning';
  }

  return 'normal';
};

// 사용 예시
const trackScreenLoad = (screenName: string, duration: number) => {
  const status = checkPerformanceThreshold('screen_load', duration);
  
  performanceAnalytics.track({
    eventName: 'screen_load',
    screenName,
    duration,
    attributes: { status },
  });

  if (status === 'critical') {
    Sentry.captureMessage(`Critical: Slow screen load for ${screenName}`, {
      level: 'warning',
      extra: { duration },
    });
  }
};
```

### 4.2 디버그 대시보드

```typescript
// src/components/DebugDashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';

interface DebugMetrics {
  fps: number;
  memoryUsage: number;
  bundleSize: number;
  activeScreens: string[];
  recentApiCalls: number;
  errorCount: number;
}

export const DebugDashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<DebugMetrics>({
    fps: 60,
    memoryUsage: 0,
    bundleSize: 0,
    activeScreens: [],
    recentApiCalls: 0,
    errorCount: 0,
  });

  useEffect(() => {
    if (!__DEV__ || !isVisible) return;

    const interval = setInterval(() => {
      // 메트릭 수집
      setMetrics({
        fps: useFPSMonitor(),
        memoryUsage: getMemoryUsage(),
        bundleSize: getBundleSize(),
        activeScreens: getActiveScreens(),
        recentApiCalls: getRecentApiCallCount(),
        errorCount: getErrorCount(),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <View style={styles.toggle}>
        <Text>Debug Dashboard</Text>
        <Switch value={isVisible} onValueChange={setIsVisible} />
      </View>
      
      {isVisible && (
        <ScrollView style={styles.dashboard}>
          <MetricRow label="FPS" value={metrics.fps} unit="" />
          <MetricRow label="Memory" value={metrics.memoryUsage} unit="MB" />
          <MetricRow label="API Calls (1min)" value={metrics.recentApiCalls} unit="" />
          <MetricRow label="Errors" value={metrics.errorCount} unit="" />
          
          <Text style={styles.sectionTitle}>Active Screens</Text>
          {metrics.activeScreens.map((screen) => (
            <Text key={screen} style={styles.screenName}>{screen}</Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const MetricRow: React.FC<{
  label: string;
  value: number;
  unit: string;
}> = ({ label, value, unit }) => (
  <View style={styles.metricRow}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>
      {value.toFixed(1)} {unit}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  dashboard: {
    maxHeight: 300,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  metricLabel: {
    color: '#aaa',
  },
  metricValue: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  screenName: {
    color: '#aaa',
    paddingLeft: 8,
  },
});
```

---

## 5. 성능 테스트

### 5.1 자동화된 성능 테스트

```typescript
// __tests__/performance/screenLoad.test.ts
import { render, waitFor } from '@testing-library/react-native';
import { performance } from 'perf_hooks';

describe('Screen Load Performance', () => {
  const THRESHOLD_MS = 1000;

  it('HomeScreen should load within threshold', async () => {
    const startTime = performance.now();
    
    const { findByTestId } = render(<HomeScreen />);
    
    await findByTestId('home-content');
    
    const loadTime = performance.now() - startTime;
    
    expect(loadTime).toBeLessThan(THRESHOLD_MS);
  });

  it('AttendanceScreen should load within threshold', async () => {
    const startTime = performance.now();
    
    const { findByTestId } = render(<AttendanceScreen />);
    
    await findByTestId('attendance-content');
    
    const loadTime = performance.now() - startTime;
    
    expect(loadTime).toBeLessThan(THRESHOLD_MS);
  });
});
```

### 5.2 렌더링 성능 테스트

```typescript
// __tests__/performance/rendering.test.ts
import { render } from '@testing-library/react-native';

describe('Component Rendering Performance', () => {
  it('EmployeeList should render 100 items efficiently', () => {
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      id: `emp-${i}`,
      name: `Employee ${i}`,
      department: 'Engineering',
    }));

    const startTime = performance.now();
    
    render(<EmployeeList data={mockData} />);
    
    const renderTime = performance.now() - startTime;
    
    // 100개 아이템 렌더링은 500ms 이내
    expect(renderTime).toBeLessThan(500);
  });

  it('EmployeeList should not re-render unnecessarily', () => {
    const renderSpy = jest.fn();
    const TestComponent = () => {
      renderSpy();
      return <EmployeeItem employee={mockEmployee} />;
    };

    const { rerender } = render(<TestComponent />);
    
    // 동일한 props로 리렌더링
    rerender(<TestComponent />);
    
    // React.memo로 인해 1번만 렌더링되어야 함
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
```

---

## 6. 모니터링 체크리스트

### 6.1 개발 환경

- [ ] React Native Performance Monitor 활성화
- [ ] Flipper 연동 확인
- [ ] React DevTools Profiler 사용
- [ ] FPS 모니터링 구현
- [ ] 디버그 대시보드 구현

### 6.2 프로덕션

- [ ] Firebase Performance 또는 Sentry Performance 설정
- [ ] 커스텀 성능 이벤트 추적
- [ ] 성능 임계값 알림 설정
- [ ] 대시보드 구성

### 6.3 테스트

- [ ] 화면 로드 시간 테스트
- [ ] 렌더링 성능 테스트
- [ ] 메모리 누수 테스트
- [ ] CI/CD 성능 테스트 통합

