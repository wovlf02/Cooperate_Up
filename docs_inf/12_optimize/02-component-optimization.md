# 컴포넌트 최적화 전략

## 1. React.memo 활용

### 1.1 기본 사용법

```typescript
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UserCardProps {
  name: string;
  email: string;
  role: string;
}

// ✅ Pure Component로 만들어 props 변경 시에만 리렌더링
export const UserCard = memo<UserCardProps>(({ name, email, role }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.role}>{role}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 8 },
  name: { fontSize: 16, fontWeight: 'bold' },
  email: { fontSize: 14, color: '#666' },
  role: { fontSize: 12, color: '#999' },
});
```

### 1.2 커스텀 비교 함수

```typescript
import React, { memo } from 'react';

interface ListItemProps {
  id: string;
  title: string;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

// 커스텀 비교 함수로 불필요한 리렌더링 방지
const arePropsEqual = (
  prevProps: ListItemProps,
  nextProps: ListItemProps
): boolean => {
  // id와 title만 비교 (metadata 변경은 무시)
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.updatedAt.getTime() === nextProps.updatedAt.getTime()
  );
};

export const ListItem = memo<ListItemProps>(({ id, title, updatedAt }) => {
  return (
    <View>
      <Text>{title}</Text>
      <Text>{updatedAt.toLocaleDateString()}</Text>
    </View>
  );
}, arePropsEqual);
```

---

## 2. useMemo / useCallback

### 2.1 useMemo - 계산된 값 캐싱

```typescript
import React, { useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';

interface AttendanceData {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  workHours: number;
}

interface MonthlyReportProps {
  data: AttendanceData[];
  selectedMonth: string;
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({
  data,
  selectedMonth,
}) => {
  // ✅ 필터링/계산 결과를 메모이제이션
  const filteredData = useMemo(() => {
    return data.filter(item => item.date.startsWith(selectedMonth));
  }, [data, selectedMonth]);

  const statistics = useMemo(() => {
    const present = filteredData.filter(d => d.status === 'present').length;
    const absent = filteredData.filter(d => d.status === 'absent').length;
    const late = filteredData.filter(d => d.status === 'late').length;
    const totalHours = filteredData.reduce((sum, d) => sum + d.workHours, 0);
    
    return { present, absent, late, totalHours };
  }, [filteredData]);

  // ✅ 스타일 객체 메모이제이션
  const containerStyle = useMemo(() => ({
    padding: 16,
    backgroundColor: filteredData.length > 0 ? '#fff' : '#f5f5f5',
  }), [filteredData.length]);

  return (
    <View style={containerStyle}>
      <Text>출근: {statistics.present}일</Text>
      <Text>결근: {statistics.absent}일</Text>
      <Text>지각: {statistics.late}일</Text>
      <Text>총 근무시간: {statistics.totalHours}시간</Text>
    </View>
  );
};
```

### 2.2 useCallback - 함수 참조 안정성

```typescript
import React, { useCallback, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';

interface FormData {
  name: string;
  email: string;
  phone: string;
}

export const UserForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ 함수 참조를 안정적으로 유지
  const handleNameChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, name: text }));
  }, []);

  const handleEmailChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, email: text }));
  }, []);

  const handlePhoneChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, phone: text }));
  }, []);

  // 의존성이 있는 콜백
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await submitForm(formData);
      Alert.alert('성공', '저장되었습니다.');
    } catch (error) {
      Alert.alert('오류', '저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting]);

  return (
    <View>
      <MemoizedInput
        label="이름"
        value={formData.name}
        onChangeText={handleNameChange}
      />
      <MemoizedInput
        label="이메일"
        value={formData.email}
        onChangeText={handleEmailChange}
      />
      <MemoizedInput
        label="전화번호"
        value={formData.phone}
        onChangeText={handlePhoneChange}
      />
      <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
        <Text>{isSubmitting ? '저장 중...' : '저장'}</Text>
      </TouchableOpacity>
    </View>
  );
};

// 메모이제이션된 입력 컴포넌트
interface MemoizedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

const MemoizedInput = memo<MemoizedInputProps>(({ label, value, onChangeText }) => {
  return (
    <View>
      <Text>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} />
    </View>
  );
});
```

---

## 3. 컴포넌트 분할 전략

### 3.1 상태 끌어올리기 vs 내리기

```typescript
// ❌ Bad: 전체 리렌더링 유발
const ParentComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // searchQuery 변경 시 전체 리렌더링
  return (
    <View>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <ItemList selectedItem={selectedItem} onSelect={setSelectedItem} />
      <ItemDetail item={selectedItem} />
    </View>
  );
};

// ✅ Good: 상태를 사용하는 컴포넌트에 가깝게 배치
const ParentComponent = () => {
  return (
    <View>
      <SearchSection />
      <ItemSection />
    </View>
  );
};

const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  return <SearchBar value={searchQuery} onChange={setSearchQuery} />;
};

const ItemSection = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  return (
    <>
      <ItemList selectedItem={selectedItem} onSelect={setSelectedItem} />
      <ItemDetail item={selectedItem} />
    </>
  );
};
```

### 3.2 컴포넌트 구성 패턴

```typescript
// Compound Components 패턴으로 유연한 구성
interface CardContextType {
  expanded: boolean;
  toggleExpand: () => void;
}

const CardContext = createContext<CardContextType | null>(null);

const useCardContext = () => {
  const context = useContext(CardContext);
  if (!context) throw new Error('Card 컨텍스트 내에서 사용해야 합니다.');
  return context;
};

// 메인 Card 컴포넌트
export const Card: React.FC<{ children: ReactNode }> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
} = ({ children }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = useCallback(() => setExpanded(prev => !prev), []);
  
  const contextValue = useMemo(
    () => ({ expanded, toggleExpand }),
    [expanded, toggleExpand]
  );
  
  return (
    <CardContext.Provider value={contextValue}>
      <View style={styles.card}>{children}</View>
    </CardContext.Provider>
  );
};

// 서브 컴포넌트들 (독립적으로 메모이제이션)
const CardHeader = memo<{ title: string }>(({ title }) => {
  const { toggleExpand } = useCardContext();
  return (
    <TouchableOpacity onPress={toggleExpand}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
});

const CardBody = memo<{ children: ReactNode }>(({ children }) => {
  const { expanded } = useCardContext();
  if (!expanded) return null;
  return <View style={styles.body}>{children}</View>;
});

const CardFooter = memo<{ children: ReactNode }>(({ children }) => {
  return <View style={styles.footer}>{children}</View>;
});

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// 사용 예시
const AttendanceCard = () => (
  <Card>
    <Card.Header title="출근 기록" />
    <Card.Body>
      <Text>상세 내용...</Text>
    </Card.Body>
    <Card.Footer>
      <Button title="수정" />
    </Card.Footer>
  </Card>
);
```

---

## 4. 불필요한 리렌더링 방지

### 4.1 Context 분리

```typescript
// ❌ Bad: 하나의 큰 Context
interface AppState {
  user: User;
  theme: Theme;
  notifications: Notification[];
  settings: Settings;
}

const AppContext = createContext<AppState>(null);

// 어느 값이 변경되어도 모든 Consumer 리렌더링

// ✅ Good: 관련 상태별로 Context 분리
const UserContext = createContext<User>(null);
const ThemeContext = createContext<Theme>(null);
const NotificationContext = createContext<Notification[]>(null);

// 각 Context의 변경은 해당 Consumer만 리렌더링
```

### 4.2 셀렉터 패턴 (Redux Toolkit)

```typescript
import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

// ✅ 메모이제이션된 셀렉터로 불필요한 리렌더링 방지
const selectAttendanceState = (state: RootState) => state.attendance;

export const selectTodayAttendance = createSelector(
  [selectAttendanceState],
  (attendance) => attendance.today
);

export const selectMonthlyStats = createSelector(
  [selectAttendanceState],
  (attendance) => ({
    totalDays: attendance.records.length,
    presentDays: attendance.records.filter(r => r.status === 'present').length,
    workHours: attendance.records.reduce((sum, r) => sum + r.hours, 0),
  })
);

// 컴포넌트에서 사용
const AttendanceSummary = () => {
  // 월간 통계만 구독 - 다른 attendance 상태 변경에 영향 없음
  const stats = useSelector(selectMonthlyStats);
  
  return (
    <View>
      <Text>출근일: {stats.presentDays}/{stats.totalDays}</Text>
      <Text>총 근무시간: {stats.workHours}h</Text>
    </View>
  );
};
```

---

## 5. 조건부 렌더링 최적화

### 5.1 Early Return 패턴

```typescript
interface ConditionalContentProps {
  isLoading: boolean;
  error: Error | null;
  data: Data | null;
}

// ✅ 조건별 Early Return으로 불필요한 렌더링 로직 회피
export const ConditionalContent: React.FC<ConditionalContentProps> = ({
  isLoading,
  error,
  data,
}) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!data) {
    return <EmptyState message="데이터�� 없습니다." />;
  }

  return <DataContent data={data} />;
};
```

### 5.2 Lazy Loading

```typescript
import React, { Suspense, lazy } from 'react';
import { ActivityIndicator } from 'react-native';

// ✅ 동적 임포트로 초기 로딩 시간 단축
const HeavyChart = lazy(() => import('./HeavyChart'));
const DetailedReport = lazy(() => import('./DetailedReport'));

export const Dashboard: React.FC = () => {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <View>
      <Summary />
      
      <TouchableOpacity onPress={() => setShowChart(true)}>
        <Text>차트 보기</Text>
      </TouchableOpacity>
      
      {showChart && (
        <Suspense fallback={<ActivityIndicator size="large" />}>
          <HeavyChart />
        </Suspense>
      )}
    </View>
  );
};
```

---

## 6. 성능 디버깅

### 6.1 리렌더링 추적 HOC

```typescript
import React, { useRef, useEffect } from 'react';

// 개발 환경에서만 리렌더링 추적
export const withRenderTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  if (__DEV__) {
    return function TrackedComponent(props: P) {
      const renderCount = useRef(0);
      const prevPropsRef = useRef<P>();

      renderCount.current++;

      useEffect(() => {
        if (prevPropsRef.current) {
          const changedProps = Object.entries(props).filter(
            ([key, value]) => prevPropsRef.current![key as keyof P] !== value
          );
          
          if (changedProps.length > 0) {
            console.log(
              `[${componentName}] 리렌더링 #${renderCount.current}`,
              '\n변경된 props:',
              changedProps.map(([key]) => key)
            );
          }
        }
        prevPropsRef.current = props;
      });

      return <WrappedComponent {...props} />;
    };
  }
  
  return WrappedComponent;
};

// 사용 예시
const TrackedUserCard = withRenderTracking(UserCard, 'UserCard');
```

### 6.2 렌더링 시간 측정 Hook

```typescript
export const useRenderPerformance = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const totalRenderTime = useRef<number>(0);

  // 렌더 시작 시 호출
  renderStartTime.current = performance.now();
  renderCount.current++;

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    totalRenderTime.current += renderTime;

    if (__DEV__ && renderTime > 16) {
      console.warn(
        `[Performance] ${componentName}`,
        `\n현재 렌더링: ${renderTime.toFixed(2)}ms`,
        `\n평균 렌더링: ${(totalRenderTime.current / renderCount.current).toFixed(2)}ms`,
        `\n총 렌더링 횟수: ${renderCount.current}`
      );
    }
  });
};
```

