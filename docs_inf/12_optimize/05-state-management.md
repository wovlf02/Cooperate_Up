# 상태 관리 최적화

## 1. Redux Toolkit 최적화

### 1.1 정규화된 상태 구조

```typescript
// ❌ Bad: 중첩 구조
interface BadState {
  workplaces: {
    id: string;
    name: string;
    employees: {
      id: string;
      name: string;
      attendance: {
        id: string;
        date: string;
        status: string;
      }[];
    }[];
  }[];
}

// ✅ Good: 정규화된 구조
interface NormalizedState {
  workplaces: {
    byId: Record<string, Workplace>;
    allIds: string[];
  };
  employees: {
    byId: Record<string, Employee>;
    allIds: string[];
    byWorkplace: Record<string, string[]>;
  };
  attendance: {
    byId: Record<string, AttendanceRecord>;
    byEmployee: Record<string, string[]>;
    byDate: Record<string, string[]>;
  };
}
```

### 1.2 createEntityAdapter 사용

```typescript
import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';

interface Employee {
  id: string;
  name: string;
  email: string;
  workplaceId: string;
  departmentId: string;
  position: string;
  createdAt: string;
}

// EntityAdapter 생성
const employeesAdapter = createEntityAdapter<Employee>({
  selectId: (employee) => employee.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

// 초기 상태
const initialState = employeesAdapter.getInitialState({
  loading: false,
  error: null as string | null,
  selectedId: null as string | null,
});

// Slice 생성
const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    // 단일 추가
    addEmployee: employeesAdapter.addOne,
    // 다중 추가
    addEmployees: employeesAdapter.addMany,
    // 업데이트
    updateEmployee: employeesAdapter.updateOne,
    // 삭제
    removeEmployee: employeesAdapter.removeOne,
    // 전체 교체
    setEmployees: employeesAdapter.setAll,
    // 선택
    selectEmployee: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        employeesAdapter.setAll(state, action.payload);
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch';
      });
  },
});

export const {
  addEmployee,
  addEmployees,
  updateEmployee,
  removeEmployee,
  setEmployees,
  selectEmployee,
} = employeesSlice.actions;

export default employeesSlice.reducer;
```

### 1.3 메모이제이션된 셀렉터

```typescript
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// 기본 셀렉터
const selectEmployeesState = (state: RootState) => state.employees;

// EntityAdapter 셀렉터
export const {
  selectAll: selectAllEmployees,
  selectById: selectEmployeeById,
  selectIds: selectEmployeeIds,
  selectEntities: selectEmployeeEntities,
  selectTotal: selectEmployeesTotal,
} = employeesAdapter.getSelectors(selectEmployeesState);

// 파생 셀렉터 (메모이제이션)
export const selectEmployeesByWorkplace = createSelector(
  [selectAllEmployees, (_: RootState, workplaceId: string) => workplaceId],
  (employees, workplaceId) =>
    employees.filter((emp) => emp.workplaceId === workplaceId)
);

export const selectEmployeesByDepartment = createSelector(
  [selectAllEmployees, (_: RootState, departmentId: string) => departmentId],
  (employees, departmentId) =>
    employees.filter((emp) => emp.departmentId === departmentId)
);

// 복잡한 계산을 메모이제이션
export const selectEmployeeStats = createSelector(
  [selectAllEmployees],
  (employees) => {
    const byDepartment = employees.reduce<Record<string, number>>(
      (acc, emp) => {
        acc[emp.departmentId] = (acc[emp.departmentId] || 0) + 1;
        return acc;
      },
      {}
    );

    const byPosition = employees.reduce<Record<string, number>>(
      (acc, emp) => {
        acc[emp.position] = (acc[emp.position] || 0) + 1;
        return acc;
      },
      {}
    );

    return {
      total: employees.length,
      byDepartment,
      byPosition,
    };
  }
);

// 선택된 직원
export const selectSelectedEmployee = createSelector(
  [selectEmployeesState, selectEmployeeEntities],
  (state, entities) =>
    state.selectedId ? entities[state.selectedId] ?? null : null
);
```

### 1.4 컴포넌트에서 사용

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';

export const EmployeeList: React.FC<{ workplaceId: string }> = ({
  workplaceId,
}) => {
  const dispatch = useDispatch();
  
  // ✅ 메모이제이션된 셀렉터 사용
  const employees = useSelector((state: RootState) =>
    selectEmployeesByWorkplace(state, workplaceId)
  );
  
  const selectedId = useSelector(
    (state: RootState) => state.employees.selectedId
  );

  const handleSelect = useCallback(
    (id: string) => {
      dispatch(selectEmployee(id));
    },
    [dispatch]
  );

  return (
    <FlatList
      data={employees}
      keyExtractor={(item) => item.id}
      extraData={selectedId}  // 선택 상태 변경 시 리렌더링
      renderItem={({ item }) => (
        <EmployeeItem
          employee={item}
          isSelected={item.id === selectedId}
          onSelect={handleSelect}
        />
      )}
    />
  );
};
```

---

## 2. React Query 최적화

### 2.1 캐시 설정

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 데이터 신선도 (이 시간 내에는 refetch 안함)
      staleTime: 5 * 60 * 1000,  // 5분
      
      // 캐시 유지 시간 (비활성 쿼리)
      gcTime: 30 * 60 * 1000,  // 30분 (구 cacheTime)
      
      // 자동 refetch 설정
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      
      // 재시도 설정
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // 네트워크 모드
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
    },
  },
});

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppNavigator />
  </QueryClientProvider>
);
```

### 2.2 쿼리별 최적화

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 자주 변경되지 않는 데이터 (긴 staleTime)
export const useWorkplaces = () => {
  return useQuery({
    queryKey: ['workplaces'],
    queryFn: fetchWorkplaces,
    staleTime: 30 * 60 * 1000,  // 30분
    gcTime: 60 * 60 * 1000,     // 1시간
  });
};

// 자주 변경되는 데이터 (짧은 staleTime)
export const useAttendanceToday = () => {
  return useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: fetchTodayAttendance,
    staleTime: 30 * 1000,       // 30초
    refetchInterval: 60 * 1000, // 1분마다 자동 refetch
  });
};

// 무효화와 함께 mutation
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: (updatedEmployee) => {
      // 특정 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['employees', updatedEmployee.id],
      });
      
      // 목록 쿼리도 무효화
      queryClient.invalidateQueries({
        queryKey: ['employees'],
        exact: false,
      });
    },
  });
};
```

### 2.3 낙관적 업데이트

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CheckInData {
  employeeId: string;
  timestamp: string;
  location: { lat: number; lng: number };
}

export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckInData) => api.post('/attendance/check-in', data),
    
    // 낙관적 업데이트: API 응답 전에 UI 먼저 업데이트
    onMutate: async (newCheckIn) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({
        queryKey: ['attendance', 'today'],
      });

      // 이전 데이터 스냅샷
      const previousAttendance = queryClient.getQueryData(['attendance', 'today']);

      // 낙관적으로 캐시 업데이트
      queryClient.setQueryData(['attendance', 'today'], (old: Attendance) => ({
        ...old,
        checkInTime: newCheckIn.timestamp,
        status: 'checked-in',
      }));

      // 롤백용 컨텍스트 반환
      return { previousAttendance };
    },
    
    // 에러 시 롤백
    onError: (err, variables, context) => {
      if (context?.previousAttendance) {
        queryClient.setQueryData(
          ['attendance', 'today'],
          context.previousAttendance
        );
      }
    },
    
    // 성공/실패 관계없이 실행
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', 'today'],
      });
    },
  });
};
```

### 2.4 Prefetching

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export const useEmployeeListPrefetch = () => {
  const queryClient = useQueryClient();

  // 직원 상세 미리 로드
  const prefetchEmployeeDetail = useCallback(
    (employeeId: string) => {
      queryClient.prefetchQuery({
        queryKey: ['employee', employeeId],
        queryFn: () => fetchEmployee(employeeId),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  return { prefetchEmployeeDetail };
};

// 사용 예시: 리스트 아이템에 hover/press 시 prefetch
const EmployeeListItem: React.FC<{ employee: Employee }> = ({ employee }) => {
  const { prefetchEmployeeDetail } = useEmployeeListPrefetch();
  const navigation = useNavigation();

  const handlePressIn = () => {
    // 터치 시작 시 미리 로드
    prefetchEmployeeDetail(employee.id);
  };

  const handlePress = () => {
    navigation.navigate('EmployeeDetail', { id: employee.id });
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPress={handlePress}
    >
      <Text>{employee.name}</Text>
    </TouchableOpacity>
  );
};
```

---

## 3. 로컬 상태 최적화

### 3.1 상태 위치 최적화

```typescript
// ❌ Bad: 전역 상태로 관리할 필요 없는 것
const modalSlice = createSlice({
  name: 'modal',
  initialState: { isOpen: false },
  reducers: { ... },
});

// ✅ Good: 컴포넌트 로컬 상태
const ModalContainer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // ...
};
```

### 3.2 상태 분리

```typescript
// ❌ Bad: 하나의 큰 상태 객체
const [formState, setFormState] = useState({
  name: '',
  email: '',
  phone: '',
  address: '',
  isSubmitting: false,
  errors: {},
});

// ✅ Good: 관련 상태끼리 그룹화
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  address: '',
});
const [isSubmitting, setIsSubmitting] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});
```

### 3.3 useReducer 사용

```typescript
import { useReducer, useCallback } from 'react';

interface FormState {
  data: {
    name: string;
    email: string;
    phone: string;
  };
  touched: Record<string, boolean>;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

type FormAction =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_TOUCHED'; field: string }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_END' }
  | { type: 'RESET' };

const initialState: FormState = {
  data: { name: '', email: '', phone: '' },
  touched: {},
  errors: {},
  isSubmitting: false,
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        data: { ...state.data, [action.field]: action.value },
      };
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, [action.field]: true },
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true };
    case 'SUBMIT_END':
      return { ...state, isSubmitting: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

export const useFormState = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setField = useCallback((field: string, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const setTouched = useCallback((field: string) => {
    dispatch({ type: 'SET_TOUCHED', field });
  }, []);

  const setError = useCallback((field: string, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);

  const submit = useCallback(async (onSubmit: () => Promise<void>) => {
    dispatch({ type: 'SUBMIT_START' });
    try {
      await onSubmit();
    } finally {
      dispatch({ type: 'SUBMIT_END' });
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    setField,
    setTouched,
    setError,
    submit,
    reset,
  };
};
```

---

## 4. Context 최적화

### 4.1 Context 분리

```typescript
// ❌ Bad: 하나의 큰 Context
const AppContext = createContext<{
  user: User;
  theme: Theme;
  settings: Settings;
  notifications: Notification[];
}>(null);

// ✅ Good: 도메인별 Context 분리
const UserContext = createContext<User | null>(null);
const ThemeContext = createContext<Theme>(defaultTheme);
const SettingsContext = createContext<Settings>(defaultSettings);
const NotificationsContext = createContext<Notification[]>([]);
```

### 4.2 값과 업데이트 함수 분리

```typescript
import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

// 값 Context
const UserContext = createContext<User | null>(null);

// 업데이트 함수 Context
const UserUpdateContext = createContext<{
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
} | null>(null);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // 업데이트 함수 메모이제이션
  const updateContextValue = useMemo(
    () => ({ setUser, updateUser }),
    [updateUser]
  );

  return (
    <UserContext.Provider value={user}>
      <UserUpdateContext.Provider value={updateContextValue}>
        {children}
      </UserUpdateContext.Provider>
    </UserContext.Provider>
  );
};

// 커스텀 훅
export const useUser = () => useContext(UserContext);

export const useUserUpdate = () => {
  const context = useContext(UserUpdateContext);
  if (!context) {
    throw new Error('useUserUpdate must be used within UserProvider');
  }
  return context;
};

// 사용 예시
const UserProfile: React.FC = () => {
  // 값만 구독 - 업데이트 함수 변경에 영향 없음
  const user = useUser();
  return <Text>{user?.name}</Text>;
};

const UserEditButton: React.FC = () => {
  // 업데이트 함수만 구독 - 값 변경에 영향 없음
  const { updateUser } = useUserUpdate();
  return <Button onPress={() => updateUser({ name: 'New Name' })} />;
};
```

---

## 5. 상태 관리 체크리스트

### 5.1 Redux Toolkit

- [ ] createEntityAdapter 사용
- [ ] 정규화된 상태 구조
- [ ] createSelector로 메모이제이션
- [ ] 불필요한 액션 디스패치 방지
- [ ] Immer 활용 (불변성 관리)

### 5.2 React Query

- [ ] 적절한 staleTime/gcTime 설정
- [ ] 낙관적 업데이트 구현
- [ ] Prefetching 활용
- [ ] 쿼리 키 정규화
- [ ] 에러/로딩 상태 처리

### 5.3 로컬 상태

- [ ] 상태 위치 최적화 (로컬 vs 전역)
- [ ] 관련 상태 그룹화
- [ ] useReducer 활용 (복잡한 상태)
- [ ] Context 분리

