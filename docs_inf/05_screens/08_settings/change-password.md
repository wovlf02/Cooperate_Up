# 비밀번호 변경 화면 (ChangePasswordScreen) - Production Ready v2.0

## 개요

현재 비밀번호를 새 비밀번호로 변경하는 화면입니다.
화면 전체를 사용하지 않는 폼 형태이므로 중앙 정렬 레이아웃을 적용합니다.
토스, 카카오 등의 보안 설정 UX를 참고하여 직관적이고 세련된 디자인을 제공합니다.

---

## 🎨 디자인 원칙

### UX 목표

- **중앙 집중 레이아웃**: 폼 콘텐츠를 화면 중앙에 배치하여 집중도 향상
- **실시간 피드백**: 비밀번호 강도와 일치 여부를 즉시 시각적으로 표시
- **명확한 안내**: 비밀번호 요구사항을 체크리스트로 표시
- **부드러운 전환**: 성공/에러 상태에 자연스러운 애니메이션

---

## 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│ StatusBar (dark-content)                                  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Header (투명, 백 버튼만)                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ←                                                   │ │
│  │  size: 44x44                                         │ │
│  │  paddingHorizontal: screenPadding                    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  KeyboardAvoidingView                                     │
│  behavior: 'padding' (iOS) / 'height' (Android)           │
│                                                           │
│  ScrollView                                               │
│  contentContainerStyle:                                   │
│    flexGrow: 1                                            │
│    justifyContent: center  ← 중앙 정렬                    │
│    paddingHorizontal: screenPadding                       │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │                    ┌────────┐                       │  │
│  │                    │        │                       │  │
│  │                    │   🔐   │                       │  │
│  │                    │        │                       │  │
│  │                    └────────┘                       │  │
│  │                    width: 80px                      │  │
│  │                    height: 80px                     │  │
│  │                    backgroundColor: brand100        │  │
│  │                    borderRadius: 24px               │  │
│  │                    iconSize: 40px                   │  │
│  │                    iconColor: brand500              │  │
│  │                                                     │  │
│  │              비밀번호 변경                           │  │
│  │              displaySmall (24px), textPrimary       │  │
│  │              fontWeight: 700                        │  │
│  │              marginTop: space5                      │  │
│  │                                                     │  │
│  │          보안을 위해 주기적으로 변경해주세요          │  │
│  │              bodyMedium (15px), textSecondary       │  │
│  │              textAlign: center                      │  │
│  │              marginTop: space2                      │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space8                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  현재 비밀번호                                       │  │
│  │  labelMedium, textSecondary                         │  │
│  │  marginBottom: space2                               │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  🔒   ••••••••                       👁️   │    │  │
│  │  │                                             │    │  │
│  │  │  height: 56px                               │    │  │
│  │  │  backgroundColor: neutral100                │    │  │
│  │  │  borderRadius: 12px                         │    │  │
│  │  │  (focused) borderWidth: 2                   │    │  │
│  │  │            borderColor: brand500            │    │  │
│  │  │            backgroundColor: white           │    │  │
│  │  │            ⚡ Brand shadow                   │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  marginTop: space4                                  │  │
│  │                                                     │  │
│  │  새 비밀번호                                        │  │
│  │  labelMedium, textSecondary                         │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  🔒   ••••••••                       👁️   │    │  │
│  │  │                                             │    │  │
│  │  │  height: 56px                               │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  비밀번호 강도: ████████░░ 보통              │    │  │
│  │  │                                             │    │  │
│  │  │  height: 6px, borderRadius: 3px             │    │  │
│  │  │  backgroundColor: neutral200                │    │  │
│  │  │  fillColor: warning (보통) / success (강함) │    │  │
│  │  │  ⚡ Animated width                          │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │  marginTop: space2                                  │  │
│  │                                                     │  │
│  │  marginTop: space4                                  │  │
│  │                                                     │  │
│  │  새 비밀번호 확인                                   │  │
│  │  labelMedium, textSecondary                         │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  🔒   ••••••••                       👁️   │    │  │
│  │  │                                             │    │  │
│  │  │  height: 56px                               │    │  │
│  │  │                                             │    │  │
│  │  │  (일치 시) borderColor: success             │    │  │
│  │  │  (불일치 시) borderColor: error             │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  ✓ 비밀번호가 일치합니다                            │  │
│  │  captionLarge, success                              │  │
│  │  marginTop: space2                                  │  │
│  │  ⚡ FadeIn animation                                 │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space5                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  비밀번호 요구사항 체크리스트                        │  │
│  │                                                     │  │
│  │  backgroundColor: neutral50                         │  │
│  │  borderRadius: 12px                                 │  │
│  │  padding: 16px                                      │  │
│  │                                                     │  │
│  │  ✓ 8자 이상               (완료: success)          │  │
│  │  ✓ 영문 포함              (완료: success)          │  │
│  │  ○ 숫자 포함              (미완료: neutral400)     │  │
│  │  ○ 특수문자 포함 (선택)   (선택: neutral400)       │  │
│  │  ✓ 현재 비밀번호와 다름    (완료: success)          │  │
│  │                                                     │  │
│  │  captionLarge, gap: space2                          │  │
│  │  ⚡ 체크 시 아이콘 pop animation                     │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space6                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │              비밀번호 변경                          │  │
│  │                                                     │  │
│  │  PrimaryButton                                      │  │
│  │  height: 56px                                       │  │
│  │  borderRadius: 12px                                 │  │
│  │  backgroundColor: brand500                          │  │
│  │  ⚡ Brand shadow                                    │  │
│  │                                                     │  │
│  │  disabled: !isFormValid                             │  │
│  │  loading: isSubmitting                              │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  paddingBottom: safeAreaBottom + space6                   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 상세

### 1. Hero Section (아이콘 + 제목)

```typescript
const heroSectionStyles = {
  container: {
    alignItems: 'center',
    marginBottom: spacing.space8,
  },
  
  iconContainer: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(24),
    backgroundColor: colors.brand100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  icon: {
    size: ms(40),
    color: colors.brand500,
  },
  
  title: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    marginTop: spacing.space5,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.space2,
    textAlign: 'center',
  },
};
```

### 2. Password Input Fields

```typescript
const passwordInputStyles = {
  inputWrapper: {
    marginBottom: spacing.space4,
  },
  
  label: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(56),
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.space4,
    borderWidth: 0,
  },
  
  inputContainerFocused: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.brand500,
    ...shadows.brand,
  },
  
  inputContainerSuccess: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  
  inputContainerError: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  
  icon: {
    size: ms(20),
    color: colors.neutral400,
    marginRight: spacing.space3,
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
};
```

### 3. Password Strength Indicator

```typescript
const strengthIndicatorStyles = {
  container: {
    marginTop: spacing.space2,
  },
  
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2,
  },
  
  barBackground: {
    flex: 1,
    height: ms(6),
    backgroundColor: colors.neutral200,
    borderRadius: ms(3),
    overflow: 'hidden',
  },
  
  barFill: {
    height: '100%',
    borderRadius: ms(3),
    // Animated width based on strength
  },
  
  barColors: {
    weak: colors.error,      // 0-30%
    medium: colors.warning,  // 30-70%
    strong: colors.success,  // 70-100%
  },
  
  strengthLabel: {
    ...typography.captionLarge,
    fontWeight: '600',
    minWidth: ms(40),
  },
  
  strengthLabels: {
    weak: { text: '약함', color: colors.error },
    medium: { text: '보통', color: colors.warning },
    strong: { text: '강함', color: colors.success },
  },
};
```

### 4. Password Match Indicator

```typescript
const matchIndicatorStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.space2,
    gap: spacing.space1,
  },
  
  icon: {
    size: ms(16),
  },
  
  text: {
    ...typography.captionLarge,
  },
  
  states: {
    match: {
      iconColor: colors.success,
      textColor: colors.success,
      text: '비밀번호가 일치합니다',
      icon: 'check-circle',
    },
    notMatch: {
      iconColor: colors.error,
      textColor: colors.error,
      text: '비밀번호가 일치하지 않습니다',
      icon: 'x-circle',
    },
  },
};
```

### 5. Requirements Checklist

```typescript
const checklistStyles = {
  container: {
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.md,
    padding: spacing.space4,
    marginTop: spacing.space5,
  },
  
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2,
    paddingVertical: spacing.space1,
  },
  
  icon: {
    size: ms(18),
  },
  
  iconCompleted: {
    color: colors.success,
  },
  
  iconPending: {
    color: colors.neutral400,
  },
  
  text: {
    ...typography.captionLarge,
  },
  
  textCompleted: {
    color: colors.textPrimary,
  },
  
  textPending: {
    color: colors.textTertiary,
  },
  
  requirements: [
    { key: 'length', text: '8자 이상', check: (pw) => pw.length >= 8 },
    { key: 'letter', text: '영문 포함', check: (pw) => /[a-zA-Z]/.test(pw) },
    { key: 'number', text: '숫자 포함', check: (pw) => /[0-9]/.test(pw) },
    { key: 'special', text: '특수문자 포함 (선택)', check: (pw) => /[!@#$%^&*]/.test(pw), optional: true },
    { key: 'different', text: '현재 비밀번호와 다름', check: (pw, current) => pw !== current && pw.length > 0 },
  ],
};
```

---

## 애니메이션

### 입력 필드 포커스

```typescript
const inputFocusAnimation = {
  borderColor: {
    from: colors.transparent,
    to: colors.brand500,
    duration: 150,
    easing: 'easeOut',
  },
  
  backgroundColor: {
    from: colors.neutral100,
    to: colors.white,
    duration: 150,
  },
  
  shadow: {
    from: 0,
    to: shadows.brand.shadowOpacity,
    duration: 200,
  },
};
```

### 비밀번호 강도 바

```typescript
const strengthBarAnimation = {
  // 너비 변화
  width: {
    type: 'spring',
    damping: 15,
    stiffness: 150,
  },
  
  // 색상 전환
  color: {
    duration: 200,
    easing: 'easeOut',
  },
};
```

### 체크리스트 아이콘

```typescript
const checklistAnimation = {
  // 완료 시 팝 효과
  complete: {
    scale: {
      from: 0.5,
      to: 1,
      overshoot: 1.2,
      duration: 300,
    },
    opacity: {
      from: 0,
      to: 1,
      duration: 200,
    },
  },
};
```

### 성공 버튼

```typescript
const buttonSuccessAnimation = {
  press: {
    scale: { to: 0.97 },
    duration: 100,
  },
  
  success: {
    scale: [1, 1.05, 1],
    duration: 300,
    haptic: 'success',
  },
  
  error: {
    translateX: [0, -8, 8, -8, 8, 0],
    duration: 400,
    haptic: 'error',
  },
};
```

---

## 유효성 검사

```typescript
const validation = {
  currentPassword: {
    required: {
      message: '현재 비밀번호를 입력해주세요',
    },
  },
  
  newPassword: {
    required: {
      message: '새 비밀번호를 입력해주세요',
    },
    minLength: {
      value: 8,
      message: '비밀번호는 8자 이상이어야 합니다',
    },
    hasLetter: {
      pattern: /[a-zA-Z]/,
      message: '영문을 포함해야 합니다',
    },
    hasNumber: {
      pattern: /[0-9]/,
      message: '숫자를 포함해야 합니다',
    },
    notSameAsCurrent: {
      check: (newPw, currentPw) => newPw !== currentPw,
      message: '현재 비밀번호와 다른 비밀번호를 입력해주세요',
    },
  },
  
  confirmPassword: {
    required: {
      message: '비밀번호 확인을 입력해주세요',
    },
    match: {
      check: (confirm, newPw) => confirm === newPw,
      message: '비밀번호가 일치하지 않습니다',
    },
  },
};
```

---

## 변경 버튼 활성화 조건

```typescript
const isChangeEnabled = 
  currentPassword.length > 0 &&
  newPassword.length >= 8 &&
  /[a-zA-Z]/.test(newPassword) &&
  /[0-9]/.test(newPassword) &&
  newPassword !== currentPassword &&
  newPassword === confirmPassword;
```

---

## 에러 처리

```typescript
const errorHandling = {
  // 현재 비밀번호 틀림
  wrongPassword: {
    display: 'inline',
    message: '현재 비밀번호가 일치하지 않습니다',
    field: 'currentPassword',
    animation: 'shake',
    haptic: 'error',
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
};
```

---

## 변경 완료 모달

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  (배경 어둡게 처리)                                        │
│                                                           │
│     ┌───────────────────────────────────────────────┐     │
│     │                                               │     │
│     │                                               │     │
│     │                  ┌────────┐                   │     │
│     │                  │        │                   │     │
│     │                  │   ✓    │                   │     │
│     │                  │        │                   │     │
│     │                  └────────┘                   │     │
│     │                  width: 80px                  │     │
│     │                  height: 80px                 │     │
│     │                  backgroundColor: success100  │     │
│     │                  borderRadius: 40px           │     │
│     │                  iconColor: success           │     │
│     │                  iconSize: 40px               │     │
│     │                  ⚡ Pop-in + checkmark anim    │     │
│     │                                               │     │
│     │            비밀번호가 변경되었습니다           │     │
│     │            titleLarge, textPrimary            │     │
│     │            fontWeight: 600                    │     │
│     │            marginTop: space5                  │     │
│     │                                               │     │
│     │         보안을 위해 다시 로그인해주세요        │     │
│     │            bodyMedium, textSecondary          │     │
│     │            marginTop: space2                  │     │
│     │                                               │     │
│     │                                               │     │
│     │     ┌───────────────────────────────────┐     │     │
│     │     │                                   │     │     │
│     │     │              확인                 │     │     │
│     │     │                                   │     │     │
│     │     │  PrimaryButton, full width        │     │     │
│     │     │  marginTop: space6                │     │     │
│     │     │                                   │     │     │
│     │     └───────────────────────────────────┘     │     │
│     │                                               │     │
│     │  paddingHorizontal: space6                    │     │
│     │  paddingVertical: space8                      │     │
│     │  borderRadius: 24px                           │     │
│     │  backgroundColor: white                       │     │
│     │  marginHorizontal: space5                     │     │
│     │                                               │     │
│     └───────────────────────────────────────────────┘     │
│                                                           │
└───────────────────────────────────────────────────────────┘

→ 확인 탭 → 로그아웃 → 로그인 화면으로 이동
```

---

## 접근성

```typescript
const accessibility = {
  currentPasswordInput: {
    accessibilityLabel: '현재 비밀번호 입력',
    accessibilityHint: '현재 사용 중인 비밀번호를 입력하세요',
    textContentType: 'password',
  },
  
  newPasswordInput: {
    accessibilityLabel: '새 비밀번호 입력',
    accessibilityHint: '새로운 비밀번호를 입력하세요. 8자 이상, 영문과 숫자를 포함해야 합니다.',
    textContentType: 'newPassword',
  },
  
  confirmPasswordInput: {
    accessibilityLabel: '새 비밀번호 확인',
    accessibilityHint: '새 비밀번호를 다시 한번 입력하세요',
    textContentType: 'newPassword',
  },
  
  visibilityToggle: {
    accessibilityRole: 'button',
    accessibilityLabel: (visible) => 
      visible ? '비밀번호 숨기기' : '비밀번호 보기',
    accessibilityHint: '두 번 탭하여 비밀번호 표시 전환',
  },
  
  strengthIndicator: {
    accessibilityRole: 'progressbar',
    accessibilityLabel: (strength) => 
      `비밀번호 강도: ${strength}`,
  },
  
  changeButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '비밀번호 변경',
    accessibilityState: {
      disabled: !isFormValid,
      busy: isSubmitting,
    },
  },
};
```

---

## 상태 관리

```typescript
interface ChangePasswordState {
  // 입력 값
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  
  // 표시 상태
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  
  // 유효성 검사
  passwordStrength: 'weak' | 'medium' | 'strong';
  requirements: {
    length: boolean;
    letter: boolean;
    number: boolean;
    special: boolean;
    different: boolean;
  };
  passwordsMatch: boolean;
  
  // UI 상태
  isLoading: boolean;
  errors: Record<string, string>;
  showSuccessModal: boolean;
}
```

---

## 키보드 동작

```typescript
const keyboardBehavior = {
  keyboardAvoidingView: {
    behavior: Platform.OS === 'ios' ? 'padding' : 'height',
    keyboardVerticalOffset: Platform.OS === 'ios' ? 0 : 20,
  },
  
  fields: {
    currentPassword: {
      returnKeyType: 'next',
      onSubmitEditing: () => newPasswordRef.current?.focus(),
    },
    newPassword: {
      returnKeyType: 'next',
      onSubmitEditing: () => confirmPasswordRef.current?.focus(),
    },
    confirmPassword: {
      returnKeyType: 'done',
      onSubmitEditing: handleChangePassword,
    },
  },
  
  dismissOnTap: true,
};
```

---

## 전체 코드 예시

```typescript
// screens/Settings/ChangePasswordScreen.tsx

import React, { useState, useRef, useMemo } from 'react';
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
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TextInput } from '@/components/Input';
import { PrimaryButton } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Header } from '@/components/Header';

import { useAuth } from '@/hooks/useAuth';
import { colors, typography, shadows, borderRadius, spacing, layout } from '@/styles/theme';
import { hp, wp, ms, fs } from '@/utils/responsive';

export const ChangePasswordScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { changePassword, logout } = useAuth();
  
  // State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');
  
  // Refs
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  
  // Password requirements check
  const requirements = useMemo(() => ({
    length: newPassword.length >= 8,
    letter: /[a-zA-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*]/.test(newPassword),
    different: newPassword !== currentPassword && newPassword.length > 0,
  }), [newPassword, currentPassword]);
  
  // Password strength
  const strength = useMemo(() => {
    const score = [
      requirements.length,
      requirements.letter,
      requirements.number,
      requirements.special,
    ].filter(Boolean).length;
    
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  }, [requirements]);
  
  // Form validation
  const isFormValid = 
    currentPassword.length > 0 &&
    requirements.length &&
    requirements.letter &&
    requirements.number &&
    requirements.different &&
    newPassword === confirmPassword;
  
  // Handlers
  const handleChangePassword = async () => {
    if (!isFormValid) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await changePassword(currentPassword, newPassword);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || '비밀번호 변경에 실패했습니다');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirm = async () => {
    await logout();
    // Navigate to login
  };
  
  return (
    <View style={styles.container}>
      <Header title="" showBackButton />
      
      <KeyboardAvoidingView
        style={styles.flex}
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
            {/* Hero Section */}
            <Animated.View
              style={styles.heroSection}
              entering={FadeIn.delay(100).duration(400)}
            >
              <View style={styles.iconContainer}>
                <Icon name="lock" size={ms(40)} color={colors.brand500} />
              </View>
              <Text style={styles.title}>비밀번호 변경</Text>
              <Text style={styles.subtitle}>
                보안을 위해 주기적으로 변경해주세요
              </Text>
            </Animated.View>
            
            {/* Form Section */}
            <Animated.View
              style={styles.formSection}
              entering={FadeInDown.delay(200).duration(400)}
            >
              {/* Current Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>현재 비밀번호</Text>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="현재 비밀번호"
                  leftIcon="lock"
                  secureTextEntry={!showCurrent}
                  rightIcon={showCurrent ? 'eye-off' : 'eye'}
                  onRightIconPress={() => setShowCurrent(!showCurrent)}
                  returnKeyType="next"
                  onSubmitEditing={() => newPasswordRef.current?.focus()}
                  error={error}
                />
              </View>
              
              {/* New Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>새 비밀번호</Text>
                <TextInput
                  ref={newPasswordRef}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="새 비밀번호"
                  leftIcon="lock"
                  secureTextEntry={!showNew}
                  rightIcon={showNew ? 'eye-off' : 'eye'}
                  onRightIconPress={() => setShowNew(!showNew)}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                />
                {newPassword.length > 0 && (
                  <StrengthIndicator strength={strength} />
                )}
              </View>
              
              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>새 비밀번호 확인</Text>
                <TextInput
                  ref={confirmPasswordRef}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="새 비밀번호 확인"
                  leftIcon="lock"
                  secureTextEntry={!showConfirm}
                  rightIcon={showConfirm ? 'eye-off' : 'eye'}
                  onRightIconPress={() => setShowConfirm(!showConfirm)}
                  returnKeyType="done"
                  onSubmitEditing={handleChangePassword}
                  success={confirmPassword.length > 0 && confirmPassword === newPassword}
                  error={confirmPassword.length > 0 && confirmPassword !== newPassword ? '비밀번호가 일치하지 않습니다' : ''}
                />
                {confirmPassword.length > 0 && confirmPassword === newPassword && (
                  <MatchIndicator />
                )}
              </View>
              
              {/* Requirements Checklist */}
              <RequirementsChecklist requirements={requirements} />
            </Animated.View>
            
            {/* Change Button */}
            <Animated.View
              style={styles.buttonSection}
              entering={FadeInDown.delay(300).duration(400)}
            >
              <PrimaryButton
                title="비밀번호 변경"
                onPress={handleChangePassword}
                disabled={!isFormValid}
                loading={isLoading}
              />
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      
      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onConfirm={handleConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.space8,
  },
  iconContainer: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(24),
    backgroundColor: colors.brand100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    marginTop: spacing.space5,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.space2,
    textAlign: 'center',
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
});
````
