# 버튼 컴포넌트 (Button Components) - Production Ready v2.0

## 개요

프로덕션급 UX를 위한 버튼 컴포넌트입니다.
마이크로 인터랙션, 햅틱 피드백, 로딩 상태 등 세련된 사용자 경험을 제공합니다.

---

## 🎨 디자인 원칙

### 버튼 계층 구조

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Primary    ████████████  가장 중요한 액션 (페이지당 1개)    │
│                                                             │
│  Secondary  ▓▓▓▓▓▓▓▓▓▓▓▓  보조 액션                         │
│                                                             │
│  Outline    ░░░░░░░░░░░░  대안 액션                         │
│                                                             │
│  Ghost      ............  미묘한 액션                       │
│                                                             │
│  Danger     ████████████  파괴적 액션                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 인터랙션 원칙

- **즉각적인 피드백**: 터치 시 100ms 이내 시각적 반응
- **자연스러운 전환**: 모든 상태 변화에 부드러운 애니메이션
- **햅틱 피드백**: 중요한 액션에 진동 피드백 제공
- **명확한 상태**: 활성/비활성/로딩 상태 명확히 구분

---

## 1. Primary Button

가장 중요한 액션에 사용되는 기본 버튼입니다.

### 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │           💎  시작하기                              │  │
│  │                                                     │  │
│  │  height: hp(6.5)                                    │  │
│  │  minHeight: 52px                                    │  │
│  │  borderRadius: borderRadius.md (12px)               │  │
│  │  paddingHorizontal: space6 (24px)                   │  │
│  │                                                     │  │
│  │  backgroundColor: brand500 (#0EA5E9)                │  │
│  │  color: white                                       │  │
│  │                                                     │  │
│  │  ⚡ Animated Shadow (브랜드 컬러)                    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 스타일 스펙

| 속성 | 값 | 비고 |
|------|-----|------|
| height | `hp(6.5)` | 약 56px @852 |
| minHeight | `ms(52)` | 최소 높이 보장 |
| borderRadius | `ms(12)` | 부드러운 모서리 |
| paddingHorizontal | `ms(24)` | 좌우 패딩 |
| paddingVertical | `ms(16)` | 상하 패딩 |
| fontSize | `fs(17)` | titleLarge |
| fontWeight | `600` | Semi-bold |
| letterSpacing | `0.1` | 약간의 자간 |
| iconSize | `ms(20)` | 아이콘 크기 |
| iconGap | `ms(8)` | 아이콘-텍스트 간격 |

### 상태별 스타일

```typescript
const primaryButtonStates = {
  // 기본 상태
  default: {
    backgroundColor: colors.brand500,
    color: colors.white,
    ...shadows.brand,
  },
  
  // 눌림 상태 (100ms transition)
  pressed: {
    backgroundColor: colors.brand600,
    transform: [{ scale: 0.97 }],
    shadowOpacity: 0.4,
  },
  
  // 비활성 상태
  disabled: {
    backgroundColor: colors.neutral300,
    color: colors.neutral500,
    shadowOpacity: 0,
  },
  
  // 로딩 상태
  loading: {
    backgroundColor: colors.brand400,
    // 스피너 표시
  },
  
  // 포커스 상태 (접근성)
  focused: {
    borderWidth: 3,
    borderColor: colors.brand700,
    borderOffset: 2,
  },
};
```

### 애니메이션

```typescript
// 프레스 애니메이션 (Reanimated)
const pressAnimation = {
  transform: {
    from: { scale: 1 },
    to: { scale: 0.97 },
    duration: 100,
    easing: Easing.out(Easing.quad),
  },
  shadow: {
    from: { shadowOpacity: 0.3 },
    to: { shadowOpacity: 0.4 },
    duration: 100,
  },
};

// 릴리즈 애니메이션 (스프링)
const releaseAnimation = {
  type: 'spring',
  damping: 15,
  stiffness: 200,
  mass: 0.8,
};

// 로딩 스피너 애니메이션
const spinnerAnimation = {
  rotate: {
    from: 0,
    to: 360,
    duration: 800,
    repeat: -1,
    easing: Easing.linear,
  },
};
```

### Props Interface

```typescript
interface PrimaryButtonProps {
  // 필수
  title: string;
  onPress: () => void | Promise<void>;
  
  // 상태
  disabled?: boolean;
  loading?: boolean;
  
  // 아이콘
  leftIcon?: IconName;
  rightIcon?: IconName;
  iconOnly?: boolean;
  
  // 크기
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  
  // 스타일
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // 피드백
  hapticFeedback?: boolean; // 기본값: true
  
  // 접근성
  accessibilityLabel?: string;
  testID?: string;
}
```

---

## 2. Secondary Button

보조 액션에 사용되는 부드러운 버튼입니다.

### 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │               자세히 보기                           │  │
│  │                                                     │  │
│  │  backgroundColor: brand100 (#E0F2FE)                │  │
│  │  color: brand700 (#0369A1)                          │  │
│  │  borderWidth: 0                                     │  │
│  │                                                     │  │
│  │  No shadow (평평한 느낌)                            │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 스타일 스펙

| 속성 | 기본값 |
|------|--------|
| backgroundColor | `brand100` (#E0F2FE) |
| color | `brand700` (#0369A1) |
| height | `hp(6.5)` |
| borderRadius | `ms(12)` |
| borderWidth | 0 |
| shadow | none |

### 상태별 스타일

```typescript
const secondaryButtonStates = {
  default: {
    backgroundColor: colors.brand100,
    color: colors.brand700,
  },
  
  pressed: {
    backgroundColor: colors.brand200,
    transform: [{ scale: 0.98 }],
  },
  
  disabled: {
    backgroundColor: colors.neutral100,
    color: colors.neutral400,
  },
};
```

---

## 3. Outline Button

대안 액션에 사용되는 테두리 버튼입니다.

### 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │                                                     │  │
│  │               취소하기                              │  │
│  │                                                     │  │
│  │  backgroundColor: transparent                       │  │
│  │  borderColor: brand500 (#0EA5E9)                    │  │
│  │  borderWidth: 1.5px                                 │  │
│  │  color: brand500                                    │  │
│  │                                                     │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 스타일 스펙

| 속성 | 기본값 |
|------|--------|
| backgroundColor | `transparent` |
| borderColor | `brand500` |
| borderWidth | `ms(1.5)` |
| color | `brand500` |

### 상태별 스타일

```typescript
const outlineButtonStates = {
  default: {
    backgroundColor: 'transparent',
    borderColor: colors.brand500,
    borderWidth: ms(1.5),
    color: colors.brand500,
  },
  
  pressed: {
    backgroundColor: colors.brand50,
    borderColor: colors.brand600,
    transform: [{ scale: 0.98 }],
  },
  
  disabled: {
    borderColor: colors.neutral300,
    color: colors.neutral400,
  },
};
```

---

## 4. Ghost Button

미묘한 액션에 사용되는 투명 버튼입니다.

### 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│               더보기 →                                    │
│                                                           │
│  backgroundColor: transparent                             │
│  color: brand500                                          │
│  underline: optional                                      │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 스타일 스펙

| 속성 | 기본값 |
|------|--------|
| backgroundColor | `transparent` |
| color | `brand500` |
| height | `hp(5.5)` (작음) |
| paddingHorizontal | `ms(12)` |

### 상태별 스타일

```typescript
const ghostButtonStates = {
  default: {
    backgroundColor: 'transparent',
    color: colors.brand500,
  },
  
  pressed: {
    backgroundColor: colors.brand50,
    transform: [{ scale: 0.98 }],
  },
  
  disabled: {
    color: colors.neutral400,
  },
};
```

---

## 5. Danger Button

삭제, 로그아웃 등 파괴적 액션에 사용됩니다.

### 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │            🗑️  삭제하기                             │  │
│  │                                                     │  │
│  │  backgroundColor: error (#EF4444)                   │  │
│  │  color: white                                       │  │
│  │  ⚡ Error Color Shadow                               │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 변형

```typescript
// Solid Danger (강한)
const dangerSolid = {
  backgroundColor: colors.error,
  color: colors.white,
  ...shadows.error,
};

// Soft Danger (부드러운)
const dangerSoft = {
  backgroundColor: colors.errorLight,
  color: colors.errorDark,
};

// Outline Danger
const dangerOutline = {
  backgroundColor: 'transparent',
  borderColor: colors.error,
  color: colors.error,
};
```

---

## 6. Icon Button

아이콘만 있는 버튼입니다.

### 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐              │
│  │          │   │          │   │          │              │
│  │    🔔    │   │    ⚙️    │   │    ✏️    │              │
│  │          │   │          │   │          │              │
│  └──────────┘   └──────────┘   └──────────┘              │
│                                                           │
│  Size: 48x48 (터치 타겟)                                  │
│  Icon: 24px (중앙 정렬)                                   │
│  borderRadius: full (원형)                                │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 크기 변형

| Size | 터치 영역 | 아이콘 크기 | 용도 |
|------|----------|------------|------|
| small | 36x36 | 16px | 인라인, 밀집된 UI |
| medium | 44x44 | 20px | 기본 |
| large | 52x52 | 24px | 강조, 헤더 |

### 변형

```typescript
// Standard (투명 배경)
const iconButtonStandard = {
  backgroundColor: 'transparent',
  borderRadius: borderRadius.full,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
};

// Filled (배경 있음)
const iconButtonFilled = {
  backgroundColor: colors.neutral100,
  borderRadius: borderRadius.full,
};

// Tonal (브랜드 톤)
const iconButtonTonal = {
  backgroundColor: colors.brand100,
  iconColor: colors.brand700,
};
```

### 뱃지

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌──────────┐                                             │
│  │    🔔    │                                             │
│  │      ┌──┐│   Badge                                     │
│  │      │12││   - minWidth: 18px                          │
│  │      └──┘│   - height: 18px                            │
│  └──────────┘   - position: absolute                      │
│                 - top: -4px, right: -4px                  │
│                 - backgroundColor: error                  │
│                 - borderWidth: 2px (white)                │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Props Interface

```typescript
interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  
  // 스타일
  variant?: 'standard' | 'filled' | 'tonal';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  
  // 뱃지
  badge?: number;
  badgeColor?: string;
  showBadgeDot?: boolean;
  
  // 상태
  disabled?: boolean;
  loading?: boolean;
  
  // 피드백
  hapticFeedback?: boolean;
  
  // 접근성
  accessibilityLabel: string; // 필수!
}
```

---

## 7. Floating Action Button (FAB)

화면 우하단에 고정되는 플로팅 버튼입니다.

### 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│                                        ┌────────────────┐ │
│                                        │                │ │
│                                        │      ➕        │ │
│                                        │                │ │
│                                        │                │ │
│                                        └────────────────┘ │
│                                                           │
│  position: absolute                                       │
│  bottom: hp(10) + safeAreaBottom + tabBarHeight           │
│  right: wp(5)                                             │
│                                                           │
│  size: 56x56                                              │
│  borderRadius: 28 (원형)                                  │
│  iconSize: 28px                                           │
│                                                           │
│  ⚡ 큰 브랜드 그림자                                       │
│  ⚡ 살짝 떠있는 느낌                                       │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 스타일 스펙

```typescript
const fabStyles = {
  // 컨테이너
  container: {
    position: 'absolute',
    bottom: hp(10) + safeAreaBottom + layout.tabBarHeight,
    right: layout.screenPadding,
    zIndex: 100,
  },
  
  // 버튼
  button: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: colors.brand500,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    shadowColor: colors.brand500,
    shadowOpacity: 0.4,
  },
  
  // 아이콘
  icon: {
    color: colors.white,
    size: ms(28),
  },
};
```

### 확장 FAB

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│                           ┌─────────────────────────────┐ │
│                           │                             │ │
│                           │   ➕  새 글 작성            │ │
│                           │                             │ │
│                           └─────────────────────────────┘ │
│                                                           │
│  Extended FAB                                             │
│  - 라벨 포함                                              │
│  - height: 56px                                           │
│  - paddingHorizontal: 20px                                │
│  - borderRadius: 28px (pill shape)                        │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### FAB 애니메이션

```typescript
// 스크롤에 따른 숨김/표시
const fabScrollAnimation = {
  show: {
    translateY: 0,
    opacity: 1,
    scale: 1,
    duration: 200,
    easing: 'easeOut',
  },
  hide: {
    translateY: 100,
    opacity: 0,
    scale: 0.8,
    duration: 150,
    easing: 'easeIn',
  },
};

// 프레스 애니메이션
const fabPressAnimation = {
  pressed: {
    scale: 0.92,
    shadowRadius: ms(4),
  },
  released: {
    type: 'spring',
    damping: 12,
    stiffness: 200,
  },
};
```

---

## 8. Button Group

여러 버튼을 그룹으로 묶는 컴포넌트입니다.

### 수평 그룹 (2개 버튼)

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌───────────────────┐  ┌───────────────────┐            │
│  │                   │  │                   │            │
│  │      취소         │  │      확인         │            │
│  │   (Secondary)     │  │   (Primary)       │            │
│  │                   │  │                   │            │
│  └───────────────────┘  └───────────────────┘            │
│                                                           │
│  flexDirection: row                                       │
│  gap: 12px                                                │
│  각 버튼 flex: 1                                          │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 수직 그룹

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                    확인                              │  │
│  │                  (Primary)                           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                    취소                              │  │
│  │                  (Ghost)                             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  flexDirection: column                                    │
│  gap: 12px                                                │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Props Interface

```typescript
interface ButtonGroupProps {
  buttons: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    leftIcon?: IconName;
    disabled?: boolean;
    loading?: boolean;
  }[];
  
  direction?: 'row' | 'column';
  gap?: number;
  equalWidth?: boolean;
}
```

---

## 9. 크기 시스템

### 버튼 크기

| Size | Height | FontSize | Padding | 용도 |
|------|--------|----------|---------|------|
| small | `hp(4.5)` ≈ 38px | `fs(14)` | 12px | 카드 내, 밀집 UI |
| medium | `hp(5.5)` ≈ 47px | `fs(15)` | 16px | 일반 |
| large | `hp(6.5)` ≈ 56px | `fs(17)` | 24px | CTA, 폼 제출 |

```typescript
const buttonSizes = {
  small: {
    height: hp(4.5),
    paddingHorizontal: ms(12),
    fontSize: fs(14),
    fontWeight: '500',
    iconSize: ms(16),
    borderRadius: ms(8),
  },
  medium: {
    height: hp(5.5),
    paddingHorizontal: ms(16),
    fontSize: fs(15),
    fontWeight: '600',
    iconSize: ms(18),
    borderRadius: ms(10),
  },
  large: {
    height: hp(6.5),
    paddingHorizontal: ms(24),
    fontSize: fs(17),
    fontWeight: '600',
    iconSize: ms(20),
    borderRadius: ms(12),
  },
};
```

---

## 10. 로딩 상태

### 스피너 스타일

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │              ◐  처리 중...                          │  │
│  │                                                     │  │
│  │  - 텍스트 옆에 스피너                               │  │
│  │  - 스피너 색상: 버튼 텍스트 색상                    │  │
│  │  - 스피너 크기: 아이콘 크기와 동일                  │  │
│  │  - 버튼 약간 투명해짐 (opacity: 0.8)                │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 로딩 중 동작

```typescript
const loadingBehavior = {
  // 버튼 비활성화
  pointerEvents: 'none',
  
  // 스피너 표시
  showSpinner: true,
  spinnerPosition: 'left', // 'left' | 'right' | 'replace'
  
  // 텍스트 변경 (선택적)
  loadingText: '처리 중...',
  
  // 스타일 변경
  opacity: 0.8,
};
```

---

## 11. 햅틱 피드백

### 피드백 유형

```typescript
import * as Haptics from 'expo-haptics';

const buttonHaptics = {
  // Primary/CTA 버튼
  primary: {
    onPressIn: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  },
  
  // Secondary/Ghost 버튼
  secondary: {
    onPressIn: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  },
  
  // Danger 버튼
  danger: {
    onPressIn: () => Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning
    ),
  },
  
  // 성공 완료
  success: {
    onComplete: () => Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    ),
  },
};
```

---

## 12. 접근성

### 요구사항

```typescript
const accessibilityRequirements = {
  // 최소 터치 영역
  minTouchTarget: 44, // pt
  
  // 라벨 (스크린 리더)
  accessibilityLabel: '필수', // 버튼 목적 설명
  accessibilityHint: '선택적', // 결과 설명
  
  // 역할
  accessibilityRole: 'button',
  
  // 상태
  accessibilityState: {
    disabled: boolean,
    busy: boolean, // 로딩 중
  },
};
```

### 포커스 스타일

```typescript
const focusStyles = {
  // iOS
  ios: {
    borderWidth: 3,
    borderColor: colors.brand700,
  },
  
  // Android
  android: {
    // Ripple 효과 자동
  },
};
```

---

## 13. 전체 코드 예시

```typescript
// components/Button/PrimaryButton.tsx

import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, shadows, borderRadius } from '@/styles/theme';
import { hp, ms, fs } from '@/utils/responsive';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  hapticFeedback?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  leftIcon,
  size = 'large',
  fullWidth = true,
  hapticFeedback = true,
}) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <AnimatedPressable
      style={[
        styles.container,
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.text, styles[`${size}Text`]]}>
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand500,
    borderRadius: borderRadius.md,
    gap: ms(8),
    ...shadows.brand,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    backgroundColor: colors.neutral300,
    shadowOpacity: 0,
  },
  
  // Sizes
  small: {
    height: hp(4.5),
    paddingHorizontal: ms(12),
  },
  medium: {
    height: hp(5.5),
    paddingHorizontal: ms(16),
  },
  large: {
    height: hp(6.5),
    paddingHorizontal: ms(24),
  },
  
  // Text
  text: {
    color: colors.white,
    fontWeight: '600',
  },
  smallText: {
    fontSize: fs(14),
  },
  mediumText: {
    fontSize: fs(15),
  },
  largeText: {
    fontSize: fs(17),
  },
});
```
