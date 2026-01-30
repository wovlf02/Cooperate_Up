# 로그인 화면 (LoginScreen) - Production Ready v2.0

## 개요

기존 사용자의 앱 접근을 위한 로그인 화면입니다.
토스, 카카오 등의 로그인 UX를 참고하여 직관적이고 세련된 디자인을 제공합니다.

- **로그인 방식**: 아이디 + 비밀번호
- **자동 로그인**: 한 번 로그인하면 앱을 완전히 종료하더라도 다시 켰을 때 자동으로 로그인된 상태로 메인 페이지가 표시됩니다.

---

## 🎨 디자인 원칙

### UX 목표

- **빠른 로그인**: 최소한의 입력으로 로그인 완료
- **명확한 피드백**: 모든 상태(입력, 에러, 로딩)를 시각적으로 표시
- **키보드 친화적**: 키보드 내비게이션 최적화
- **접근성 우선**: 스크린 리더, 대형 터치 타겟 지원

---

## 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│ StatusBar (dark-content)                                  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  KeyboardAvoidingView                                     │
│  behavior: 'padding' (iOS) / 'height' (Android)           │
│                                                           │
│  ScrollView                                               │
│  contentContainerStyle: flexGrow: 1                       │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │                                                     │  │
│  │                     ┌────────┐                      │  │
│  │                     │        │                      │  │
│  │                     │  LOGO  │                      │  │
│  │                     │        │                      │  │
│  │                     └────────┘                      │  │
│  │                     width: 80px                     │  │
│  │                     height: 80px                    │  │
│  │                     borderRadius: 20px              │  │
│  │                     ⚡ Subtle shadow                 │  │
│  │                                                     │  │
│  │               Fantastic Management                  │  │
│  │               displaySmall (24px), brand500         │  │
│  │               fontWeight: 700                       │  │
│  │                                                     │  │
│  │            근무 관리의 새로운 방법                   │  │
│  │            bodyMedium (15px), neutral500            │  │
│  │            marginTop: 8px                           │  │
│  │                                                     │  │
│  │                                                     │  │
│  │  marginTop: hp(8)                                   │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  아이디                                             │  │
│  │  labelMedium, textSecondary                         │  │
│  │  marginBottom: 8px                                  │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  👤  아이디를 입력하세요                    │    │  │
│  │  │                                             │    │  │
│  │  │  height: 56px                               │    │  │
│  │  │  backgroundColor: neutral100                │    │  │
│  │  │  borderRadius: 12px                         │    │  │
│  │  │  borderWidth: 0 (default)                   │    │  │
│  │  │  borderWidth: 2, borderColor: brand500      │    │  │
│  │  │  (focused)                                  │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  marginTop: 16px                                    │  │
│  │                                                     │  │
│  │  비밀번호                                           │  │
│  │  labelMedium, textSecondary                         │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  🔒  ••••••••                        👁️    │    │  │
│  │  │                                             │    │  │
│  │  │  height: 56px                               │    │  │
│  │  │  secureTextEntry: true                      │    │  │
│  │  │  toggle visibility button                   │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  ┌────┐                                             │  │
│  │  │ ✓ │ 로그인 상태 유지                            │  │
│  │  └────┘ bodySmall, textSecondary                    │  │
│  │                                                     │  │
│  │  marginTop: 12px                                    │  │
│  │  checkboxSize: 24px                                 │  │
│  │  gap: 8px                                           │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: 24px                                          │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │                   로그인                            │  │
│  │                                                     │  │
│  │  PrimaryButton                                      │  │
│  │  height: 56px                                       │  │
│  │  borderRadius: 12px                                 │  │
│  │  backgroundColor: brand500                          │  │
│  │  ⚡ Brand shadow                                    │  │
│  │                                                     │  │
│  │  disabled: !email || !password                      │  │
│  │  loading: isSubmitting                              │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│          비밀번호를 잊으셨나요?                           │
│          labelMedium, brand500                            │
│          underline: true                                  │
│          marginTop: 20px                                  │
│          touchable                                        │
│                                                           │
│  ─────────────────────────────────────────────────────── │
│  marginVertical: 32px                                     │
│  1px, neutral200                                          │
│                                                           │
│        계정이 없으신가요?    회원가입                     │
│        bodySmall, neutral600   titleSmall, brand500       │
│                                fontWeight: 600            │
│                                                           │
│  paddingBottom: safeAreaBottom + 24px                     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 상세

### 1. Logo Section

```typescript
const logoSectionStyles = {
  container: {
    alignItems: 'center',
    marginTop: hp(8),
    marginBottom: hp(6),
  },
  
  logoContainer: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(20),
    backgroundColor: colors.brand500,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    // 또는 그라데이션
  },
  
  logoGradient: {
    colors: [colors.brand400, colors.brand600],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  logoIcon: {
    size: ms(40),
    color: colors.white,
  },
  
  appName: {
    ...typography.displaySmall,
    color: colors.brand500,
    marginTop: space4,
    fontWeight: '700',
  },
  
  tagline: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: space2,
  },
};
```

### 2. Input Fields

```typescript
const inputFieldStyles = {
  container: {
    paddingHorizontal: layout.screenPadding,
  },
  
  inputWrapper: {
    marginBottom: space4,
  },
  
  label: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: space2,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(56),
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.md,
    paddingHorizontal: space4,
    borderWidth: 0,
  },
  
  inputContainerFocused: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.brand500,
    ...shadows.brand,
  },
  
  inputContainerError: {
    borderWidth: 2,
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  
  icon: {
    size: ms(20),
    color: colors.neutral400,
    marginRight: space3,
  },
  
  iconFocused: {
    color: colors.brand500,
  },
  
  input: {
    flex: 1,
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  
  visibilityButton: {
    width: ms(44),
    height: ms(44),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(-8),
  },
  
  visibilityIcon: {
    size: ms(20),
    color: colors.neutral400,
  },
  
  errorText: {
    ...typography.captionLarge,
    color: colors.error,
    marginTop: space2,
  },
};
```

### 3. Remember Me Checkbox

```typescript
const checkboxStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space3,
    paddingHorizontal: layout.screenPadding,
  },
  
  checkbox: {
    width: ms(24),
    height: ms(24),
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.neutral300,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: space2,
  },
  
  checkboxChecked: {
    backgroundColor: colors.brand500,
    borderColor: colors.brand500,
  },
  
  checkIcon: {
    size: ms(16),
    color: colors.white,
  },
  
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  
  // 터치 영역 확장
  touchArea: {
    paddingVertical: space2,
    paddingRight: space4,
  },
};
```

### 4. Login Button

```typescript
const loginButtonStyles = {
  container: {
    paddingHorizontal: layout.screenPadding,
    marginTop: space6,
  },
  
  button: {
    height: ms(56),
    borderRadius: borderRadius.md,
    backgroundColor: colors.brand500,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.brand,
  },
  
  buttonDisabled: {
    backgroundColor: colors.neutral300,
    shadowOpacity: 0,
  },
  
  buttonLoading: {
    backgroundColor: colors.brand400,
  },
  
  buttonText: {
    ...typography.titleLarge,
    color: colors.white,
    fontWeight: '600',
  },
  
  spinner: {
    color: colors.white,
    size: 'small',
  },
};
```

### 5. Footer Links

```typescript
const footerStyles = {
  container: {
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: safeAreaBottom + space6,
  },
  
  forgotPassword: {
    marginTop: space5,
  },
  
  forgotPasswordText: {
    ...typography.labelMedium,
    color: colors.brand500,
    textDecorationLine: 'underline',
  },
  
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: space8,
  },
  
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space2,
  },
  
  signupText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  
  signupLink: {
    ...typography.titleSmall,
    color: colors.brand500,
    fontWeight: '600',
  },
};
```

---

## 애니메이션

### 입력 필드 포커스

```typescript
const inputFocusAnimation = {
  // 테두리 색상 변화
  borderColor: {
    from: colors.transparent,
    to: colors.brand500,
    duration: 150,
    easing: 'easeOut',
  },
  
  // 배경색 변화
  backgroundColor: {
    from: colors.neutral100,
    to: colors.white,
    duration: 150,
  },
  
  // 아이콘 색상
  iconColor: {
    from: colors.neutral400,
    to: colors.brand500,
    duration: 150,
  },
  
  // 미묘한 그림자
  shadow: {
    from: 0,
    to: shadows.brand.shadowOpacity,
    duration: 200,
  },
};
```

### 로그인 버튼

```typescript
const loginButtonAnimation = {
  // 프레스
  press: {
    scale: { to: 0.97 },
    duration: 100,
  },
  
  // 릴리즈 (스프링)
  release: {
    type: 'spring',
    damping: 15,
    stiffness: 200,
  },
  
  // 로딩 시작
  loadingStart: {
    opacity: { to: 0.8 },
    duration: 100,
  },
  
  // 성공 피드백
  success: {
    scale: {
      to: 1.05,
      return: 1,
      duration: 200,
    },
    haptic: 'success',
  },
  
  // 에러 쉐이크
  error: {
    translateX: [0, -10, 10, -10, 10, 0],
    duration: 400,
    haptic: 'error',
  },
};
```

### 로고 진입

```typescript
const logoEntranceAnimation = {
  // 스케일 + 페이드
  logo: {
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 400,
    delay: 100,
    easing: 'easeOut',
  },
  
  // 슬라이드 업 + 페이드
  text: {
    from: { translateY: 20, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: 400,
    delay: 200,
    easing: 'easeOut',
  },
  
  // 폼 필드 순차 등장
  formFields: {
    stagger: 50, // 각 필드 50ms 간격
    from: { translateY: 20, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    duration: 300,
    delay: 300,
  },
};
```

---

## 자동 로그인 동작

| 상태 | 동작 |
|-----|-----|
| 로그인 상태 유지 체크 O (기본값) | 앱 완전 종료 후 재실행 시에도 자동으로 로그인된 상태로 메인 페이지 표시 |
| 로그인 상태 유지 체크 X | 앱 종료 후 재실행 시 로그인 화면 표시 |

### 앱 시작 플로우

```typescript
const appStartFlow = {
  // 1. 스플래시 화면 표시
  splash: {
    duration: 1000,
    fadeOut: 300,
  },
  
  // 2. 토큰 확인
  checkToken: async () => {
    const token = await SecureStorage.get('authToken');
    const rememberMe = await AsyncStorage.get('rememberMe');
    
    if (!token || !rememberMe) {
      return { redirect: 'Login' };
    }
    
    // 3. 토큰 유효성 검증
    try {
      const isValid = await validateToken(token);
      if (isValid) {
        return { redirect: 'Home' };
      }
    } catch (error) {
      // 토큰 만료 시 리프레시 시도
      try {
        const newToken = await refreshToken();
        await SecureStorage.set('authToken', newToken);
        return { redirect: 'Home' };
      } catch {
        return { redirect: 'Login' };
      }
    }
    
    return { redirect: 'Login' };
  },
};
```

### 저장 방식

```typescript
const storage = {
  // 자동 로그인 설정
  rememberMe: {
    key: 'rememberMe',
    storage: AsyncStorage,
    type: 'boolean',
  },
  
  // 인증 토큰 (암호화)
  authToken: {
    key: 'authToken',
    storage: SecureStorage,
    encrypted: true,
  },
  
  // 리프레시 토큰 (암호화)
  refreshToken: {
    key: 'refreshToken',
    storage: SecureStorage,
    encrypted: true,
  },
  
  // 사용자 기본 정보 (캐싱)
  userInfo: {
    key: 'userInfo',
    storage: AsyncStorage,
    type: 'object',
  },
};
```

---

## 유효성 검사

```typescript
const validation = {
  email: {
    required: {
      message: '아이디를 입력해주세요',
    },
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: '올바른 이메일 형식을 입력해주세요',
    },
  },
  
  password: {
    required: {
      message: '비밀번호를 입력해주세요',
    },
    minLength: {
      value: 6,
      message: '비밀번호는 6자 이상이어야 합니다',
    },
  },
};
```

---

## 에러 처리

```typescript
const errorHandling = {
  // 필드 에러 (인라인)
  fieldError: {
    display: 'inline',
    animation: 'fadeIn',
    color: colors.error,
    style: 'captionLarge',
  },
  
  // 인증 실패
  authFailure: {
    display: 'toast',
    message: '아이디 또는 비밀번호가 일치하지 않습니다',
    type: 'error',
    duration: 3000,
    action: null,
  },
  
  // 계정 비활성
  accountDisabled: {
    display: 'alert',
    title: '비활성화된 계정',
    message: '비활성화된 계정입니다.\n관리자에게 문의하세요.',
    actions: [
      { text: '확인', onPress: dismiss },
    ],
  },
  
  // 네트워크 오류
  networkError: {
    display: 'toast',
    message: '네트워크 오류가 발생했습니다.\n인터넷 연결을 확인해주세요',
    type: 'error',
    duration: 4000,
    action: {
      label: '다시 시도',
      onPress: retry,
    },
  },
  
  // 서버 오류
  serverError: {
    display: 'toast',
    message: '서버에 문제가 발생했습니다.\n잠시 후 다시 시도해주세요',
    type: 'error',
    duration: 4000,
  },
  
  // 에러 시 쉐이크 애니메이션
  shakeAnimation: {
    translateX: [0, -8, 8, -8, 8, -4, 4, 0],
    duration: 400,
    easing: 'easeOut',
  },
};
```

---

## 인터랙션

### 키보드 동작

```typescript
const keyboardBehavior = {
  // 키보드 회피
  keyboardAvoidingView: {
    behavior: Platform.OS === 'ios' ? 'padding' : 'height',
    keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 20,
  },
  
  // 필드 간 이동
  fields: {
    email: {
      returnKeyType: 'next',
      onSubmitEditing: () => passwordRef.current?.focus(),
    },
    password: {
      returnKeyType: 'done',
      onSubmitEditing: handleLogin,
    },
  },
  
  // 키보드 외부 탭 시 닫기
  dismissOnTap: true,
};
```

### 버튼 상태

```typescript
const buttonStates = {
  // 비활성
  disabled: {
    condition: !email || !password,
    style: {
      backgroundColor: colors.neutral300,
      shadowOpacity: 0,
    },
  },
  
  // 활성
  enabled: {
    condition: email && password,
    style: {
      backgroundColor: colors.brand500,
      ...shadows.brand,
    },
  },
  
  // 로딩
  loading: {
    condition: isSubmitting,
    style: {
      backgroundColor: colors.brand400,
      opacity: 0.8,
    },
    content: <ActivityIndicator color={colors.white} />,
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  // 로고
  logo: {
    accessibilityRole: 'image',
    accessibilityLabel: 'Fantastic Management 로고',
  },
  
  // 입력 필드
  emailInput: {
    accessibilityLabel: '아이디 입력',
    accessibilityHint: '이메일 형식으로 입력하세요',
    textContentType: 'emailAddress',
    autoComplete: 'email',
  },
  
  passwordInput: {
    accessibilityLabel: '비밀번호 입력',
    accessibilityHint: '비밀번호를 입력하세요',
    textContentType: 'password',
    autoComplete: 'password',
  },
  
  visibilityButton: {
    accessibilityRole: 'button',
    accessibilityLabel: (visible) => 
      visible ? '비밀번호 숨기기' : '비밀번호 보기',
    accessibilityHint: '두 번 탭하여 비밀번호 표시 전환',
  },
  
  rememberMe: {
    accessibilityRole: 'checkbox',
    accessibilityLabel: '로그인 상태 유지',
    accessibilityState: { checked: rememberMe },
    accessibilityHint: '두 번 탭하여 전환',
  },
  
  loginButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '로그인',
    accessibilityState: {
      disabled: !email || !password,
      busy: isSubmitting,
    },
  },
};
```

---

## 전체 코드 예시

```typescript
// screens/Auth/LoginScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import { TextInput } from '@/components/Input';
import { PrimaryButton } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';

import { useAuth } from '@/hooks/useAuth';
import { colors, typography, shadows, borderRadius, spacing, layout } from '@/styles/theme';
import { hp, wp, ms, fs } from '@/utils/responsive';

export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { login, isLoading, error } = useAuth();
  
  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Refs
  const passwordRef = useRef<TextInput>(null);
  
  // Animations
  const buttonScale = useSharedValue(1);
  const buttonShake = useSharedValue(0);
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: buttonScale.value },
      { translateX: buttonShake.value },
    ],
  }));
  
  // Handlers
  const handleLogin = async () => {
    // Validate
    if (!email) {
      setEmailError('아이디를 입력해주세요');
      return;
    }
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요');
      return;
    }
    
    try {
      await login({ email, password, rememberMe });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      // Shake animation
      buttonShake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  const handlePressIn = () => {
    buttonScale.value = withTiming(0.97, { duration: 100 });
  };
  
  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };
  
  const isButtonDisabled = !email || !password;
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.space6 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <Animated.View
            style={styles.logoSection}
            entering={FadeIn.delay(100).duration(400)}
          >
            <LinearGradient
              colors={[colors.brand400, colors.brand600]}
              style={styles.logoContainer}
            >
              <Icon name="briefcase" size={ms(40)} color={colors.white} />
            </LinearGradient>
            <Text style={styles.appName}>Fantastic Management</Text>
            <Text style={styles.tagline}>근무 관리의 새로운 방법</Text>
          </Animated.View>
          
          {/* Form Section */}
          <Animated.View
            style={styles.formSection}
            entering={FadeInDown.delay(200).duration(400)}
          >
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>아이디</Text>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                }}
                placeholder="아이디를 입력하세요"
                leftIcon="user"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={emailError}
              />
            </View>
            
            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                placeholder="비밀번호를 입력하세요"
                leftIcon="lock"
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                error={passwordError}
              />
            </View>
            
            {/* Remember Me */}
            <Checkbox
              checked={rememberMe}
              onToggle={() => setRememberMe(!rememberMe)}
              label="로그인 상태 유지"
            />
          </Animated.View>
          
          {/* Login Button */}
          <Animated.View
            style={[styles.buttonSection, buttonAnimatedStyle]}
            entering={FadeInDown.delay(300).duration(400)}
          >
            <PrimaryButton
              title={isLoading ? '' : '로그인'}
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isButtonDisabled}
              loading={isLoading}
            />
          </Animated.View>
          
          {/* Footer */}
          <Animated.View
            style={styles.footer}
            entering={FadeInDown.delay(400).duration(400)}
          >
            <TouchableOpacity
              onPress={() => navigate('ForgotPassword')}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                비밀번호를 잊으셨나요?
              </Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>계정이 없으신가요?</Text>
              <TouchableOpacity onPress={() => navigate('Register')}>
                <Text style={styles.signupLink}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: hp(8),
    marginBottom: hp(6),
  },
  logoContainer: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(20),
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  appName: {
    ...typography.displaySmall,
    color: colors.brand500,
    marginTop: spacing.space4,
    fontWeight: '700',
  },
  tagline: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.space2,
  },
  formSection: {
    marginTop: spacing.space4,
  },
  inputWrapper: {
    marginBottom: spacing.space4,
  },
  label: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  buttonSection: {
    marginTop: spacing.space6,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.space6,
  },
  forgotPassword: {
    paddingVertical: spacing.space2,
  },
  forgotPasswordText: {
    ...typography.labelMedium,
    color: colors.brand500,
    textDecorationLine: 'underline',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.space8,
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2,
  },
  signupText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  signupLink: {
    ...typography.titleSmall,
    color: colors.brand500,
    fontWeight: '600',
  },
});
```
