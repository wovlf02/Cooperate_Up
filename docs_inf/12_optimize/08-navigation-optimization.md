# 네비게이션 최적화

## 1. React Navigation 최적화

### 1.1 네비게이터 구조 최적화

```typescript
// ✅ Good: 네비게이터 계층 최소화
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 탭 네비게이터
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      lazy: true,  // 첫 방문 시에만 렌더링
      unmountOnBlur: false,  // 탭 전환 시 유지
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Attendance" component={AttendanceScreen} />
    <Tab.Screen name="Calendar" component={CalendarScreen} />
    <Tab.Screen name="Chat" component={ChatScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

// 루트 네비게이터
const RootNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} />
    <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
    {/* 모달 */}
    <Stack.Group screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen name="CheckInModal" component={CheckInModal} />
      <Stack.Screen name="FilterModal" component={FilterModal} />
    </Stack.Group>
  </Stack.Navigator>
);
```

### 1.2 화면 지연 로딩

```typescript
import React, { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

// 지연 로딩할 스크린
const PayrollScreen = lazy(() => import('./screens/PayrollScreen'));
const ContractScreen = lazy(() => import('./screens/ContractScreen'));
const AdminScreen = lazy(() => import('./screens/AdminScreen'));

// 로딩 컴포넌트
const ScreenLoading = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

// 지연 로딩 래퍼
const withLazyLoading = <P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>
) => {
  return (props: P) => (
    <Suspense fallback={<ScreenLoading />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// 사용
const LazyPayrollScreen = withLazyLoading(PayrollScreen);
const LazyContractScreen = withLazyLoading(ContractScreen);
const LazyAdminScreen = withLazyLoading(AdminScreen);
```

### 1.3 Native Stack Navigator 사용

```bash
npm install @react-navigation/native-stack
```

```typescript
// ✅ Native Stack (성능 우수)
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

// ❌ JS Stack (느림, 특수한 경우에만 사용)
import { createStackNavigator } from '@react-navigation/stack';

const JSStack = createStackNavigator();
```

---

## 2. 화면 전환 최적화

### 2.1 화면 전환 애니메이션

```typescript
import { TransitionPresets } from '@react-navigation/stack';

const Stack = createNativeStackNavigator();

// 플랫폼별 최적 애니메이션
const screenOptions: NativeStackNavigationOptions = {
  // iOS: 네이티브 푸시 애니메이션
  // Android: 슬라이드 애니메이션
  animation: 'slide_from_right',
  
  // 제스처 설정
  gestureEnabled: true,
  fullScreenGestureEnabled: true,  // iOS 전체 화면 제스처
  
  // 헤더 최적화
  headerBackTitleVisible: false,
};

// 무거운 화면에는 fade 사용
const heavyScreenOptions: NativeStackNavigationOptions = {
  animation: 'fade',  // 슬라이드보다 가벼움
};
```

### 2.2 InteractionManager 활용

```typescript
import { InteractionManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export const HeavyScreen: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // 화면 전환 애니메이션 완료 후 무거운 작업 실행
      const task = InteractionManager.runAfterInteractions(() => {
        setIsReady(true);
        loadHeavyData();
      });

      return () => task.cancel();
    }, [])
  );

  if (!isReady) {
    return <SkeletonLoader />;
  }

  return <HeavyContent />;
};
```

### 2.3 화면 프리로딩

```typescript
import { useNavigation } from '@react-navigation/native';

export const useScreenPreload = () => {
  const navigation = useNavigation();

  // 특정 화면 데이터 미리 로드
  const preloadScreen = useCallback(
    (screenName: string, params?: object) => {
      // React Query prefetch
      switch (screenName) {
        case 'EmployeeDetail':
          queryClient.prefetchQuery({
            queryKey: ['employee', params?.id],
            queryFn: () => fetchEmployee(params?.id),
          });
          break;
        case 'AttendanceHistory':
          queryClient.prefetchQuery({
            queryKey: ['attendance', 'history', params?.employeeId],
            queryFn: () => fetchAttendanceHistory(params?.employeeId),
          });
          break;
      }
    },
    []
  );

  return { preloadScreen };
};

// 사용 예시: 리스트 아이템에서 미리 로드
const EmployeeListItem: React.FC<{ employee: Employee }> = ({ employee }) => {
  const navigation = useNavigation();
  const { preloadScreen } = useScreenPreload();

  const handlePressIn = () => {
    // 터치 시작 시 미리 로드
    preloadScreen('EmployeeDetail', { id: employee.id });
  };

  const handlePress = () => {
    navigation.navigate('EmployeeDetail', { id: employee.id });
  };

  return (
    <TouchableOpacity onPressIn={handlePressIn} onPress={handlePress}>
      <Text>{employee.name}</Text>
    </TouchableOpacity>
  );
};
```

---

## 3. 탭 네비게이션 최적화

### 3.1 탭 화면 상태 유지

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      // 탭 화면 지연 로딩
      lazy: true,
      
      // 탭 전환 시 화면 유지 (unmount 방지)
      unmountOnBlur: false,
      
      // 탭 바 스타일
      tabBarStyle: {
        height: 60,
        paddingBottom: 8,
      },
    }}
    // 탭 변경 리스너
    screenListeners={{
      tabPress: (e) => {
        // 같은 탭 다시 누르면 최상단 스크롤
        // 또는 스택 초기화
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="home" color={color} size={size} />
        ),
      }}
    />
    {/* ... */}
  </Tab.Navigator>
);
```

### 3.2 탭 화면 포커스 최적화

```typescript
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

export const AttendanceTab: React.FC = () => {
  const isFocused = useIsFocused();
  const [data, setData] = useState(null);

  // 탭 포커스 시에만 데이터 갱신
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const result = await fetchTodayAttendance();
        setData(result);
      };
      
      fetchData();
      
      // 1분마다 자동 갱신 (포커스 상태에서만)
      const interval = setInterval(fetchData, 60000);
      
      return () => clearInterval(interval);
    }, [])
  );

  // 비포커스 상태에서는 무거운 렌더링 스킵
  if (!isFocused) {
    return <CachedView data={data} />;
  }

  return <AttendanceContent data={data} />;
};
```

---

## 4. 딥 링킹 최적화

### 4.1 딥 링킹 설정

```typescript
import { LinkingOptions } from '@react-navigation/native';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['bizone://', 'https://bizone.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Attendance: 'attendance',
          Calendar: 'calendar',
        },
      },
      EmployeeDetail: 'employee/:id',
      AttendanceHistory: 'attendance/history/:employeeId',
    },
  },
  // 초기 URL 비동기 처리
  async getInitialURL() {
    // 앱이 종료된 상태에서 열렸을 때
    const url = await Linking.getInitialURL();
    return url;
  },
  // URL 변경 구독
  subscribe(listener) {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });
    return () => subscription.remove();
  },
};

export const App = () => (
  <NavigationContainer linking={linking} fallback={<SplashScreen />}>
    <RootNavigator />
  </NavigationContainer>
);
```

### 4.2 딥 링킹 성능 최적화

```typescript
import { useLinkTo, useNavigation } from '@react-navigation/native';

// 딥 링크 처리 최적화
export const useOptimizedDeepLink = () => {
  const linkTo = useLinkTo();
  const navigation = useNavigation();

  const handleDeepLink = useCallback(
    async (url: string) => {
      // URL 파싱
      const parsed = parseDeepLink(url);
      
      if (!parsed) return;

      // 필요한 데이터 미리 로드
      await preloadDataForScreen(parsed.screen, parsed.params);
      
      // 네비게이션 실행
      linkTo(url);
    },
    [linkTo]
  );

  return { handleDeepLink };
};

// 화면별 데이터 프리로드
const preloadDataForScreen = async (
  screen: string,
  params: Record<string, string>
) => {
  switch (screen) {
    case 'EmployeeDetail':
      await queryClient.prefetchQuery({
        queryKey: ['employee', params.id],
        queryFn: () => fetchEmployee(params.id),
      });
      break;
    // ...
  }
};
```

---

## 5. 화면 상태 보존

### 5.1 스크롤 위치 보존

```typescript
import { useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, ScrollView } from 'react-native';

// 스크롤 위치 저장 훅
export const useScrollPersistence = (key: string) => {
  const scrollPositionRef = useRef(0);
  const scrollViewRef = useRef<ScrollView | FlatList>(null);

  // 스크롤 위치 저장
  const handleScroll = useCallback((event: NativeScrollEvent) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  // 화면 포커스 시 스크롤 위치 복원
  useFocusEffect(
    useCallback(() => {
      if (scrollPositionRef.current > 0) {
        scrollViewRef.current?.scrollToOffset?.({
          offset: scrollPositionRef.current,
          animated: false,
        });
      }
    }, [])
  );

  return {
    scrollViewRef,
    handleScroll,
  };
};

// 사용
const ListScreen: React.FC = () => {
  const { scrollViewRef, handleScroll } = useScrollPersistence('list-screen');

  return (
    <FlatList
      ref={scrollViewRef}
      onScroll={({ nativeEvent }) => handleScroll({ nativeEvent })}
      scrollEventThrottle={16}
      data={data}
      renderItem={renderItem}
    />
  );
};
```

### 5.2 폼 상태 보존

```typescript
import { useNavigation, useRoute } from '@react-navigation/native';

// 폼 상태를 navigation params로 보존
export const useFormPersistence = <T extends object>(
  initialValues: T
) => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // route params에서 저장된 폼 데이터 복원
  const savedData = route.params?.formData as T | undefined;
  const [formData, setFormData] = useState<T>(savedData || initialValues);

  // 다른 화면으로 이동 전 폼 데이터 저장
  const navigateWithSave = useCallback(
    (screenName: string, params?: object) => {
      navigation.navigate(screenName, {
        ...params,
        returnRoute: route.name,
        formData,
      });
    },
    [navigation, route.name, formData]
  );

  return {
    formData,
    setFormData,
    navigateWithSave,
  };
};
```

---

## 6. 메모리 관리

### 6.1 화면 언마운트 시 정리

```typescript
import { useFocusEffect } from '@react-navigation/native';

export const HeavyScreen: React.FC = () => {
  const [heavyData, setHeavyData] = useState<HeavyData | null>(null);

  useFocusEffect(
    useCallback(() => {
      // 화면 포커스 시 데이터 로드
      loadHeavyData().then(setHeavyData);

      return () => {
        // 화면 떠날 때 데이터 해제
        setHeavyData(null);
      };
    }, [])
  );

  return <Content data={heavyData} />;
};
```

### 6.2 네비게이션 스택 관리

```typescript
import { CommonActions, useNavigation } from '@react-navigation/native';

export const useStackManagement = () => {
  const navigation = useNavigation();

  // 스택 초기화 후 특정 화면으로 이동
  const resetToScreen = useCallback(
    (screenName: string, params?: object) => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: screenName, params }],
        })
      );
    },
    [navigation]
  );

  // 특정 화면까지 팝
  const popToScreen = useCallback(
    (screenName: string) => {
      const state = navigation.getState();
      const targetIndex = state.routes.findIndex(
        (route) => route.name === screenName
      );
      
      if (targetIndex >= 0) {
        navigation.dispatch(
          CommonActions.pop(state.index - targetIndex)
        );
      }
    },
    [navigation]
  );

  return { resetToScreen, popToScreen };
};

// 로그아웃 시 스택 초기화
const handleLogout = async () => {
  await clearTokens();
  resetToScreen('Login');
};
```

---

## 7. 네비게이션 성능 측정

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { useRef } from 'react';

export const App = () => {
  const navigationRef = useRef(null);
  const routeNameRef = useRef<string>();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={async () => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

        if (previousRouteName !== currentRouteName && __DEV__) {
          console.log(
            `[Navigation] ${previousRouteName} → ${currentRouteName}`
          );
          
          // 화면 전환 시간 측정
          const transitionTime = performance.now();
          InteractionManager.runAfterInteractions(() => {
            console.log(
              `[Navigation] Transition complete: ${
                (performance.now() - transitionTime).toFixed(2)
              }ms`
            );
          });
        }

        routeNameRef.current = currentRouteName;
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
};
```

---

## 8. 네비게이션 최적화 체크리스트

- [ ] Native Stack Navigator 사용
- [ ] 화면 지연 로딩 적용
- [ ] InteractionManager 활용
- [ ] 탭 화면 lazy loading
- [ ] 화면 프리로딩
- [ ] 스크롤 위치 보존
- [ ] 네비게이션 스택 관리
- [ ] 딥 링킹 최적화
- [ ] 화면 전환 애니메이션 최적화

