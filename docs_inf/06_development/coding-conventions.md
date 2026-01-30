# 코딩 컨벤션

## 1. TypeScript

### 1.1 기본 규칙
```typescript
// strict 모드 사용
// tsconfig.json의 strict: true

// 명시적 타입 선언
const name: string = 'John';
const age: number = 25;

// any 사용 금지, unknown 사용
function parseData(data: unknown): User {
  // 타입 가드 사용
}

// 타입 vs 인터페이스
// - 객체 타입: interface
// - 유니온/인터섹션: type
interface User {
  id: string;
  name: string;
}

type Status = 'pending' | 'approved' | 'rejected';
```

### 1.2 명명 규칙
| 항목 | 규칙 | 예시 |
|------|------|------|
| 변수/함수 | camelCase | `userName`, `getUserData` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 타입/인터페이스 | PascalCase | `UserProfile`, `AttendanceRecord` |
| 컴포넌트 | PascalCase | `LoginScreen`, `Button` |
| 파일 (컴포넌트) | PascalCase | `LoginScreen.tsx` |
| 파일 (유틸) | camelCase | `dateUtils.ts` |
| 폴더 | camelCase 또는 kebab-case | `auth`, `common` |

---

## 2. React Native

### 2.1 컴포넌트 구조
```typescript
// 함수형 컴포넌트 사용 (클래스 컴포넌트 금지)
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './LoginScreen.styles';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  // 1. hooks
  const [email, setEmail] = useState('');
  const dispatch = useAppDispatch();
  
  // 2. derived state
  const isValid = email.length > 0;
  
  // 3. handlers
  const handleSubmit = useCallback(() => {
    onLogin();
  }, [onLogin]);
  
  // 4. effects
  useEffect(() => {
    // side effects
  }, []);
  
  // 5. render
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
    </View>
  );
};
```

### 2.2 스타일 분리 (필수)
```typescript
// ❌ 인라인 스타일 금지
<View style={{ backgroundColor: '#fff', padding: 16 }}>

// ✅ 스타일 파일 분리
// LoginScreen.styles.ts
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
});
```

### 2.3 Import 순서
```typescript
// 1. React / React Native
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// 2. Third-party
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';

// 3. Internal - absolute paths (@/)
import { Button, Input } from '@/components/common';
import { useAuth } from '@/hooks';
import { colors } from '@/styles';

// 4. Internal - relative paths (./)
import { LoginForm } from './components';
import { styles } from './LoginScreen.styles';

// 5. Types
import type { LoginScreenProps } from './types';
```

---

## 3. Redux

### 3.1 Slice 구조
```typescript
// authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
```

### 3.2 Hooks 사용
```typescript
// hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 컴포넌트에서 사용
const user = useAppSelector((state) => state.auth.user);
const dispatch = useAppDispatch();
```

---

## 4. 에러 처리

### 4.1 try-catch 패턴
```typescript
const handleLogin = async () => {
  try {
    setLoading(true);
    setError(null);
    
    await authService.login(email, password);
    
  } catch (error) {
    if (error instanceof FirebaseError) {
      setError(getFirebaseErrorMessage(error.code));
    } else {
      setError('알 수 없는 오류가 발생했습니다.');
    }
  } finally {
    setLoading(false);
  }
};
```

### 4.2 에러 바운더리
```typescript
// ErrorBoundary 컴포넌트 사용
<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

---

## 5. 주석

### 5.1 JSDoc 스타일
```typescript
/**
 * 사용자 로그인 처리
 * @param email - 사용자 이메일
 * @param password - 비밀번호
 * @returns 로그인된 사용자 정보
 * @throws FirebaseError - 인증 실패 시
 */
async function login(email: string, password: string): Promise<User> {
  // ...
}
```

### 5.2 TODO 주석
```typescript
// TODO: 오프라인 캐싱 구현
// FIXME: iOS에서 GPS 정확도 이슈
// NOTE: 2026년부터 시급 변경 필요
```

---

## 6. Git 컨벤션

> 상세한 Git 컨벤션은 [Git 컨벤션 문서](../09_git/git-convention.md)를 참조하세요.

### 6.1 브랜치 전략
```
master                    # 메인 브랜치 (프로덕션)
├── feature/{기능명}      # 기능 개발
├── fix/{버그명}          # 버그 수정
└── release/{버전}        # 릴리스 준비
```

### 6.2 커밋 메시지 형식
```
<타입>(<범위>): <제목>

<본문>

<꼬리말>
```

### 6.3 타입 (한글)
| 타입 | 설명 |
|------|------|
| `기능` | 새로운 기능 추가 |
| `수정` | 버그 수정 |
| `문서` | 문서 변경 |
| `스타일` | 코드 스타일 변경 |
| `리팩터` | 코드 리팩토링 |
| `테스트` | 테스트 코드 |
| `빌드` | 빌드 설정 변경 |
| `설정` | 프로젝트 설정 변경 |

### 6.4 커밋 메시지 예시
```
기능(인증): 로그인 화면 구현

- 이메일/비밀번호 입력 폼 추가
- Firebase Auth 연동
- 로그인 성공 시 홈 화면 이동

관련 이슈: #12
```

---

## 7. 테스트

### 7.1 파일 명명
```
__tests__/
├── components/
│   └── Button.test.tsx
├── hooks/
│   └── useAuth.test.ts
└── utils/
    └── dateUtils.test.ts
```

### 7.2 테스트 구조
```typescript
describe('Button', () => {
  it('should render correctly', () => {
    // Arrange
    const onPress = jest.fn();
    
    // Act
    const { getByText } = render(<Button onPress={onPress}>Click</Button>);
    
    // Assert
    expect(getByText('Click')).toBeTruthy();
  });
});
```

