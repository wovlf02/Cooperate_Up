# 출퇴근 메인 화면 (AttendanceScreen) - Production Ready v2.0

## 개요

GPS 기반으로 출퇴근을 체크하는 메인 화면입니다.
토스, 리멤버 등의 출퇴근 UX를 참고하여 직관적이고 세련된 디자인을 제공합니다.

### 주요 기능

- **조기 출근 급여 과지급 방지**: 시업 시간 이전 출근 시 급여는 설정된 시업 시간부터 계산
- **퇴근 제한**: 업무 체크리스트 미완료 시 퇴근 버튼 비활성화
- **미수행 업무 사유**: 안 한 업무는 사유 입력 필수 (3자 이상)

### 근무 시간 설정 체계

```
우선순위: 직원별 개별 설정 > 사업장 기본 설정
```

| 설정 레벨 | 설명 | 권한 |
|----------|------|------|
| 사업장 기본 설정 | 사업장 전체에 적용되는 기본 시업/종업 시간 | 관리자 |
| 직원별 개별 설정 | 특정 직원에게 적용되는 개인 시업/종업 시간 | 관리자 |

---

## 🎨 디자인 원칙

### UX 목표

- **한눈에 파악**: 현재 출퇴근 상태를 즉시 인지
- **원탭 액션**: 출퇴근을 한 번의 터치로 완료
- **실시간 피드백**: 위치 상태와 시간을 실시간 업데이트
- **안내 명확**: 조기 출근, 체크리스트 미완료 등 상황별 안내

---

## 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│ StatusBar (dark-content)                                  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Header                                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ←             출퇴근                                │ │
│  │                titleMedium, fontWeight: 600          │ │
│  │                height: 56px                          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ScrollView                                               │
│  paddingHorizontal: screenPadding                         │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  Time Display Card                                  │  │
│  │                                                     │  │
│  │                 20:45:32                            │  │
│  │                 displayLarge (48px)                 │  │
│  │                 fontWeight: 700                     │  │
│  │                 textPrimary                         │  │
│  │                 ⚡ Animated seconds                   │  │
│  │                                                     │  │
│  │             2024년 12월 26일 목요일                  │  │
│  │             bodyMedium, textSecondary               │  │
│  │                                                     │  │
│  │  backgroundColor: white                             │  │
│  │  borderRadius: xl                                   │  │
│  │  paddingVertical: space8                            │  │
│  │  textAlign: center                                  │  │
│  │  ⚡ Shadow sm                                        │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space4                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  Location Status Card                               │  │
│  │                                                     │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │                                               │  │  │
│  │  │  📍 현재 위치                                 │  │  │
│  │  │                                               │  │  │
│  │  │  ✅ 출퇴근 가능 구역입니다                    │  │  │
│  │  │     titleMedium, success, fontWeight: 600     │  │  │
│  │  │                                               │  │  │
│  │  │  매장에서 약 15m 떨어져 있습니다              │  │  │
│  │  │     bodySmall, textSecondary                  │  │  │
│  │  │                                               │  │  │
│  │  │  ⚡ Pulse animation on icon                    │  │  │
│  │  │                                               │  │  │
│  │  │  OR                                           │  │  │
│  │  │                                               │  │  │
│  │  │  ❌ 출퇴근 가능 구역이 아닙니다               │  │  │
│  │  │     titleMedium, error, fontWeight: 600       │  │  │
│  │  │                                               │  │  │
│  │  │  매장에서 약 250m 떨어져 있습니다             │  │  │
│  │  │     bodySmall, textSecondary                  │  │  │
│  │  │                                               │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  backgroundColor: success50 OR error50              │  │
│  │  borderWidth: 1                                     │  │
│  │  borderColor: success200 OR error200                │  │
│  │  borderRadius: xl                                   │  │
│  │  padding: space5                                    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space6                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  Big Attendance Button                              │  │
│  │                                                     │  │
│  │              ┌─────────────────────┐                │  │
│  │              │                     │                │  │
│  │              │         ▶️           │                │  │
│  │              │                     │                │  │
│  │              │      출근하기       │                │  │
│  │              │                     │                │  │
│  │              │  width: 180px       │                │  │
│  │              │  height: 180px      │                │  │
│  │              │  borderRadius: 90px │                │  │
│  │              │  bg: brand500       │                │  │
│  │              │  ⚡ Shadow brand      │                │  │
│  │              │  ⚡ Press scale anim  │                │  │
│  │              │  ⚡ Ripple effect     │                │  │
│  │              │                     │                │  │
│  │              └─────────────────────┘                │  │
│  │                                                     │  │
│  │             버튼을 눌러 출근하세요                   │  │
│  │             bodyMedium, textSecondary               │  │
│  │             marginTop: space4                       │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  (조기 출근 시) marginTop: space4                         │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  ⚠️ 조기 출근 안내                                  │  │
│  │                                                     │  │
│  │  설정된 시업 시간: 20:00                            │  │
│  │  현재 시간이 시업 시간 이전입니다.                  │  │
│  │                                                     │  │
│  │  지금 출근 체크를 하더라도                          │  │
│  │  급여는 20:00부터 계산됩니다.                       │  │
│  │                                                     │  │
│  │  backgroundColor: warning50                         │  │
│  │  borderWidth: 1                                     │  │
│  │  borderColor: warning200                            │  │
│  │  borderRadius: lg                                   │  │
│  │  padding: space4                                    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  (퇴근 시 - 체크리스트 미완료) marginTop: space4          │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  ⚠️ 체크리스트를 완료해주세요                       │  │
│  │                                                     │  │
│  │  미완료 항목: 7개                                   │  │
│  │                                                     │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │           체크리스트 보기                     │  │  │
│  │  │           PrimaryButton                       │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  backgroundColor: warning50                         │  │
│  │  borderRadius: lg                                   │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space6                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  📋 오늘 근무 정보                                  │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │                                                     │  │
│  │     ┌─────────────────┬─────────────────┐          │  │
│  │     │                 │                 │          │  │
│  │     │    출근         │    퇴근         │          │  │
│  │     │    19:45       │    --:--        │          │  │
│  │     │    ● 정상      │    대기중       │          │  │
│  │     │                 │                 │          │  │
│  │     └─────────────────┴─────────────────┘          │  │
│  │                                                     │  │
│  │  💡 급여 기준: 20:00부터 계산                       │  │
│  │     captionMedium, warning                          │  │
│  │                                                     │  │
│  │  backgroundColor: white                             │  │
│  │  borderRadius: xl                                   │  │
│  │  padding: space5                                    │  │
│  │  ⚡ Shadow sm                                        │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space8                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  출퇴근을 깜빡하셨나요?                             │  │
│  │  bodySmall, textSecondary                           │  │
│  │                                                     │  │
│  │  ┌─────────────────┐  ┌─────────────────┐          │  │
│  │  │  수동 입력하기  │  │  수정 요청하기  │          │  │
│  │  │  labelMedium    │  │  labelMedium    │          │  │
│  │  │  brand500       │  │  brand500       │          │  │
│  │  └─────────────────┘  └─────────────────┘          │  │
│  │                                                     │  │
│  │  gap: space4                                        │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  paddingBottom: tabBarHeight + safeArea                   │
│                                                           │
├───────────────────────────────────────────────────────────┤
│ BottomTabBar                                              │
└───────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 상세

### 1. Time Display Card

```typescript
const timeDisplayStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.space8,
    paddingHorizontal: spacing.space6,
    alignItems: 'center',
    ...shadows.sm,
  },
  
  time: {
    fontSize: fs(48),
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'], // 고정폭 숫자
    letterSpacing: 2,
  },
  
  date: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.space2,
  },
  
  // 초 애니메이션
  secondsAnimation: {
    opacity: {
      from: 1,
      to: 0.5,
      duration: 500,
      loop: true,
    },
  },
};
```

### 2. Location Status Card

```typescript
const locationStatusStyles = {
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    borderWidth: 1,
  },
  
  containerAvailable: {
    backgroundColor: colors.success50,
    borderColor: colors.success200,
  },
  
  containerUnavailable: {
    backgroundColor: colors.error50,
    borderColor: colors.error200,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space3,
  },
  
  headerIcon: {
    fontSize: ms(18),
    marginRight: spacing.space2,
  },
  
  headerTitle: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusIcon: {
    fontSize: ms(20),
    marginRight: spacing.space2,
  },
  
  statusText: {
    ...typography.titleMedium,
    fontWeight: '600',
  },
  
  statusTextAvailable: {
    color: colors.success,
  },
  
  statusTextUnavailable: {
    color: colors.error,
  },
  
  distanceText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.space2,
  },
  
  // 위치 아이콘 펄스 애니메이션
  pulseAnimation: {
    scale: {
      from: 1,
      to: 1.2,
      duration: 1000,
      loop: true,
    },
    opacity: {
      from: 1,
      to: 0.6,
      duration: 1000,
      loop: true,
    },
  },
};
```

### 3. Big Attendance Button

```typescript
const bigButtonStyles = {
  container: {
    alignItems: 'center',
    marginTop: spacing.space6,
  },
  
  button: {
    width: ms(180),
    height: ms(180),
    borderRadius: ms(90),
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.brand,
  },
  
  // 상태별 색상
  buttonCheckIn: {
    backgroundColor: colors.brand500,
  },
  
  buttonCheckOut: {
    backgroundColor: colors.error,
  },
  
  buttonDisabled: {
    backgroundColor: colors.neutral300,
    shadowOpacity: 0,
  },
  
  buttonCompleted: {
    backgroundColor: colors.neutral200,
    shadowOpacity: 0,
  },
  
  icon: {
    size: ms(40),
    color: colors.white,
    marginBottom: spacing.space2,
  },
  
  label: {
    ...typography.titleLarge,
    color: colors.white,
    fontWeight: '600',
  },
  
  labelDisabled: {
    color: colors.neutral500,
  },
  
  helpText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.space4,
    textAlign: 'center',
  },
  
  // 프레스 애니메이션
  pressAnimation: {
    scale: { to: 0.95 },
    duration: 100,
    spring: { damping: 15, stiffness: 200 },
  },
  
  // 리플 효과
  ripple: {
    color: 'rgba(255, 255, 255, 0.3)',
    duration: 400,
  },
};
```

**버튼 상태별 스타일:**

| 상태 | 텍스트 | 배경색 | 아이콘 |
|------|--------|--------|--------|
| 미출근 (가능) | 출근하기 | brand500 | ▶️ play |
| 미출근 (불가능) | 출근불가 | neutral300 | 🚫 |
| 근무중 (가능) | 퇴근하기 | error | ⏹️ stop |
| 근무중 (불가능) | 퇴근불가 | neutral300 | 🚫 |
| 퇴근완료 | 퇴근완료 | neutral200 | ✓ check |

### 4. Today Work Info Card

```typescript
const workInfoCardStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginTop: spacing.space6,
    ...shadows.sm,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space4,
  },
  
  headerIcon: {
    fontSize: ms(18),
    marginRight: spacing.space2,
  },
  
  headerTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.space4,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space4,
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
  },
  
  statLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  
  statValue: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  statValuePlaceholder: {
    color: colors.neutral400,
  },
  
  statStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.space1,
  },
  
  statusDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    marginRight: spacing.space1,
  },
  
  statusDotSuccess: {
    backgroundColor: colors.success,
  },
  
  statusDotWarning: {
    backgroundColor: colors.warning,
  },
  
  statusDotNeutral: {
    backgroundColor: colors.neutral400,
  },
  
  statusText: {
    ...typography.captionMedium,
    color: colors.textTertiary,
  },
  
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.space4,
    paddingTop: spacing.space4,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
  },
  
  noteIcon: {
    fontSize: ms(14),
    marginRight: spacing.space2,
  },
  
  noteText: {
    ...typography.captionMedium,
    color: colors.warning,
  },
};
```

### 5. Early Check-in Alert Card

```typescript
const alertCardStyles = {
  container: {
    backgroundColor: colors.warning50,
    borderWidth: 1,
    borderColor: colors.warning200,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
    marginTop: spacing.space4,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  
  headerIcon: {
    fontSize: ms(18),
    marginRight: spacing.space2,
  },
  
  headerTitle: {
    ...typography.titleSmall,
    color: colors.warning700,
    fontWeight: '600',
  },
  
  content: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: ms(20),
  },
  
  highlight: {
    fontWeight: '600',
    color: colors.warning700,
  },
};
```

### 6. Checklist Warning Card

```typescript
const checklistWarningStyles = {
  container: {
    backgroundColor: colors.warning50,
    borderRadius: borderRadius.lg,
    padding: spacing.space5,
    marginTop: spacing.space4,
    alignItems: 'center',
  },
  
  icon: {
    fontSize: ms(32),
    marginBottom: spacing.space3,
  },
  
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space2,
  },
  
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space4,
  },
  
  button: {
    width: '100%',
    height: ms(48),
    backgroundColor: colors.brand500,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  buttonText: {
    ...typography.titleMedium,
    color: colors.white,
    fontWeight: '600',
  },
};
```

### 7. Bottom Links

```typescript
const bottomLinksStyles = {
  container: {
    alignItems: 'center',
    marginTop: spacing.space8,
  },
  
  question: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.space3,
  },
  
  linksRow: {
    flexDirection: 'row',
    gap: spacing.space4,
  },
  
  link: {
    paddingVertical: spacing.space2,
    paddingHorizontal: spacing.space3,
  },
  
  linkText: {
    ...typography.labelMedium,
    color: colors.brand500,
    fontWeight: '500',
  },
};
```

---

## 애니메이션

### 시간 표시

```typescript
const timeAnimation = {
  // 초 단위 깜빡임
  seconds: {
    colon: {
      opacity: {
        from: 1,
        to: 0.3,
        duration: 500,
        loop: true,
      },
    },
  },
  
  // 분 변경 시
  minuteChange: {
    scale: { from: 1, to: 1.05, to: 1 },
    duration: 200,
  },
};
```

### 버튼 프레스

```typescript
const buttonPressAnimation = {
  press: {
    scale: { to: 0.95 },
    duration: 100,
    spring: { damping: 15, stiffness: 200 },
  },
  
  release: {
    scale: { to: 1 },
    duration: 200,
    spring: { damping: 10, stiffness: 150 },
  },
  
  ripple: {
    scale: { from: 0, to: 2.5 },
    opacity: { from: 0.4, to: 0 },
    duration: 400,
  },
  
  haptic: 'medium',
};
```

### 위치 상태

```typescript
const locationAnimation = {
  iconPulse: {
    scale: {
      values: [1, 1.2, 1],
      duration: 2000,
      loop: true,
    },
  },
  
  statusChange: {
    entering: FadeIn.duration(300),
    exiting: FadeOut.duration(200),
  },
};
```

### 출퇴근 성공

```typescript
const successAnimation = {
  checkmark: {
    scale: { from: 0, to: 1 },
    rotation: { from: -30, to: 0 },
    duration: 400,
    spring: { damping: 10, stiffness: 100 },
  },
  
  confetti: {
    // Lottie 애니메이션 사용
    autoPlay: true,
    loop: false,
  },
  
  haptic: 'success',
};
```

---

## 접근성

```typescript
const accessibility = {
  timeDisplay: {
    accessibilityRole: 'timer',
    accessibilityLabel: (time, date) => 
      `현재 시간 ${time}, ${date}`,
    accessibilityLiveRegion: 'polite',
  },
  
  locationStatus: {
    accessibilityRole: 'status',
    accessibilityLabel: (available, distance) =>
      available 
        ? `출퇴근 가능 구역입니다. 매장에서 ${distance}m`
        : `출퇴근 불가능 구역입니다. 매장에서 ${distance}m`,
  },
  
  attendanceButton: {
    accessibilityRole: 'button',
    accessibilityLabel: (action, disabled) =>
      disabled ? `${action} 불가` : action,
    accessibilityHint: '두 번 탭하여 출퇴근 체크',
    accessibilityState: {
      disabled: !isEnabled,
    },
  },
  
  earlyCheckInAlert: {
    accessibilityRole: 'alert',
    accessibilityLabel: '조기 출근 안내',
  },
  
  checklistWarning: {
    accessibilityRole: 'alert',
    accessibilityLabel: (count) => 
      `체크리스트 미완료 ${count}개`,
  },
};
```

---

## 상태 관리

```typescript
interface AttendanceState {
  // 시간
  currentTime: Date;
  
  // 위치
  location: {
    isAvailable: boolean;
    distance: number;
    isLoading: boolean;
    error: string | null;
  };
  
  // 근무 상태
  workStatus: 'not_started' | 'working' | 'completed';
  
  // 오늘 근무 정보
  todayWork: {
    checkInTime: Date | null;
    checkOutTime: Date | null;
    scheduledStartTime: string; // "20:00"
    scheduledEndTime: string;
    isEarlyCheckIn: boolean;
    paymentStartTime: string;
  } | null;
  
  // 체크리스트
  checklist: {
    completed: number;
    total: number;
    isBlocking: boolean;
  };
  
  // UI 상태
  isChecking: boolean;
  showSuccessModal: boolean;
}
```

---

## 전체 코드 예시

```typescript
// screens/Attendance/AttendanceScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/Header';
import { PrimaryButton } from '@/components/Button';

import { useAttendance } from '@/hooks/useAttendance';
import { useLocation } from '@/hooks/useLocation';
import { colors, typography, shadows, borderRadius, spacing, layout } from '@/styles/theme';
import { hp, wp, ms, fs } from '@/utils/responsive';
import { formatTime, formatDate } from '@/utils/format';

export const AttendanceScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { 
    workStatus, 
    todayWork, 
    checklist,
    checkIn,
    checkOut,
  } = useAttendance();
  const { location, isAvailable, distance } = useLocation();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // 버튼 프레스 애니메이션
  const buttonScale = useSharedValue(1);
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  
  // 위치 아이콘 펄스 애니메이션
  const locationPulse = useSharedValue(1);
  
  useEffect(() => {
    locationPulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);
  
  const locationPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: locationPulse.value }],
  }));
  
  const handleButtonPress = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
  };
  
  const handleCheckIn = async () => {
    handleButtonPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await checkIn();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccessModal(true);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  const handleCheckOut = async () => {
    if (checklist.isBlocking) {
      // 체크리스트 미완료 시 경고
      return;
    }
    
    handleButtonPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await checkOut();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccessModal(true);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  const getButtonConfig = () => {
    if (workStatus === 'completed') {
      return { label: '퇴근완료', icon: 'check', style: styles.buttonCompleted, disabled: true };
    }
    if (workStatus === 'working') {
      if (!isAvailable) {
        return { label: '퇴근불가', icon: 'x', style: styles.buttonDisabled, disabled: true };
      }
      if (checklist.isBlocking) {
        return { label: '퇴근불가', icon: 'x', style: styles.buttonDisabled, disabled: true };
      }
      return { label: '퇴근하기', icon: 'stop', style: styles.buttonCheckOut, disabled: false };
    }
    if (!isAvailable) {
      return { label: '출근불가', icon: 'x', style: styles.buttonDisabled, disabled: true };
    }
    return { label: '출근하기', icon: 'play', style: styles.buttonCheckIn, disabled: false };
  };
  
  const buttonConfig = getButtonConfig();
  
  return (
    <View style={styles.container}>
      <Header title="출퇴근" showBack />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + hp(10) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Display */}
        <Animated.View
          style={styles.timeCard}
          entering={FadeInDown.delay(100).duration(400)}
        >
          <Text style={styles.time}>
            {formatTime(currentTime).slice(0, 5)}
            <Text style={styles.seconds}>:{formatTime(currentTime).slice(6)}</Text>
          </Text>
          <Text style={styles.date}>{formatDate(currentTime)}</Text>
        </Animated.View>
        
        {/* Location Status */}
        <Animated.View
          style={[
            styles.locationCard,
            isAvailable ? styles.locationAvailable : styles.locationUnavailable,
          ]}
          entering={FadeInDown.delay(200).duration(400)}
        >
          <View style={styles.locationHeader}>
            <Animated.View style={locationPulseStyle}>
              <Text style={styles.locationIcon}>📍</Text>
            </Animated.View>
            <Text style={styles.locationLabel}>현재 위치</Text>
          </View>
          
          <View style={styles.locationStatus}>
            <Text style={styles.locationStatusIcon}>
              {isAvailable ? '✅' : '❌'}
            </Text>
            <Text style={[
              styles.locationStatusText,
              isAvailable ? styles.statusAvailable : styles.statusUnavailable,
            ]}>
              {isAvailable ? '출퇴근 가능 구역입니다' : '출퇴근 가능 구역이 아닙니다'}
            </Text>
          </View>
          
          <Text style={styles.locationDistance}>
            매장에서 약 {distance}m 떨어져 있습니다
          </Text>
        </Animated.View>
        
        {/* Big Button */}
        <View style={styles.buttonContainer}>
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              style={[styles.bigButton, buttonConfig.style]}
              onPress={workStatus === 'working' ? handleCheckOut : handleCheckIn}
              disabled={buttonConfig.disabled}
              activeOpacity={0.8}
            >
              <Icon
                name={buttonConfig.icon}
                size={ms(40)}
                color={buttonConfig.disabled ? colors.neutral500 : colors.white}
              />
              <Text style={[
                styles.bigButtonText,
                buttonConfig.disabled && styles.bigButtonTextDisabled,
              ]}>
                {buttonConfig.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.helpText}>
            {buttonConfig.disabled
              ? '현재 위치에서 출퇴근이 불가능합니다'
              : `버튼을 눌러 ${workStatus === 'working' ? '퇴근' : '출근'}하세요`
            }
          </Text>
        </View>
        
        {/* Early Check-in Alert */}
        {todayWork?.isEarlyCheckIn && workStatus === 'not_started' && (
          <Animated.View
            style={styles.alertCard}
            entering={FadeInDown.delay(300).duration(400)}
          >
            <View style={styles.alertHeader}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <Text style={styles.alertTitle}>조기 출근 안내</Text>
            </View>
            <Text style={styles.alertContent}>
              설정된 시업 시간: <Text style={styles.alertHighlight}>{todayWork.scheduledStartTime}</Text>
              {'\n'}현재 시간이 시업 시간 이전입니다.
              {'\n\n'}지금 출근 체크를 하더라도{'\n'}
              급여는 <Text style={styles.alertHighlight}>{todayWork.paymentStartTime}</Text>부터 계산됩니다.
            </Text>
          </Animated.View>
        )}
        
        {/* Checklist Warning */}
        {workStatus === 'working' && checklist.isBlocking && (
          <Animated.View
            style={styles.checklistWarning}
            entering={FadeInDown.delay(300).duration(400)}
          >
            <Text style={styles.checklistWarningIcon}>⚠️</Text>
            <Text style={styles.checklistWarningTitle}>체크리스트를 완료해주세요</Text>
            <Text style={styles.checklistWarningSubtitle}>
              미완료 항목: {checklist.total - checklist.completed}개
            </Text>
            <TouchableOpacity 
              style={styles.checklistButton}
              onPress={() => navigation.navigate('Checklist')}
            >
              <Text style={styles.checklistButtonText}>체크리스트 보기</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* Today Work Info */}
        {(workStatus === 'working' || workStatus === 'completed') && (
          <Animated.View
            style={styles.workInfoCard}
            entering={FadeInDown.delay(350).duration(400)}
          >
            <View style={styles.workInfoHeader}>
              <Text style={styles.workInfoIcon}>📋</Text>
              <Text style={styles.workInfoTitle}>오늘 근무 정보</Text>
            </View>
            
            <View style={styles.workInfoGrid}>
              <View style={styles.workInfoItem}>
                <Text style={styles.workInfoLabel}>출근</Text>
                <Text style={styles.workInfoValue}>
                  {todayWork?.checkInTime ? formatTime(todayWork.checkInTime) : '--:--'}
                </Text>
                <View style={styles.workInfoStatus}>
                  <View style={[styles.statusDot, styles.statusDotSuccess]} />
                  <Text style={styles.statusText}>정상</Text>
                </View>
              </View>
              
              <View style={styles.workInfoItem}>
                <Text style={styles.workInfoLabel}>퇴근</Text>
                <Text style={[
                  styles.workInfoValue,
                  !todayWork?.checkOutTime && styles.workInfoValuePlaceholder,
                ]}>
                  {todayWork?.checkOutTime ? formatTime(todayWork.checkOutTime) : '--:--'}
                </Text>
                <View style={styles.workInfoStatus}>
                  <View style={[styles.statusDot, styles.statusDotNeutral]} />
                  <Text style={styles.statusText}>
                    {todayWork?.checkOutTime ? '완료' : '대기중'}
                  </Text>
                </View>
              </View>
            </View>
            
            {todayWork?.isEarlyCheckIn && (
              <View style={styles.paymentNote}>
                <Text style={styles.noteIcon}>💡</Text>
                <Text style={styles.noteText}>
                  급여 기준: {todayWork.paymentStartTime}부터 계산
                </Text>
              </View>
            )}
          </Animated.View>
        )}
        
        {/* Bottom Links */}
        <View style={styles.bottomLinks}>
          <Text style={styles.bottomQuestion}>출퇴근을 깜빡하셨나요?</Text>
          <View style={styles.linksRow}>
            <TouchableOpacity style={styles.link}>
              <Text style={styles.linkText}>수동 입력하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.link}>
              <Text style={styles.linkText}>수정 요청하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          title={workStatus === 'completed' ? '퇴근 완료!' : '출근 완료!'}
          time={formatTime(new Date())}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.space4,
  },
  timeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.space8,
    paddingHorizontal: spacing.space6,
    alignItems: 'center',
    ...shadows.sm,
  },
  time: {
    fontSize: fs(48),
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  seconds: {
    fontSize: fs(32),
    color: colors.textSecondary,
  },
  date: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.space2,
  },
  locationCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    borderWidth: 1,
    marginTop: spacing.space4,
  },
  locationAvailable: {
    backgroundColor: colors.success50,
    borderColor: colors.success200,
  },
  locationUnavailable: {
    backgroundColor: colors.error50,
    borderColor: colors.error200,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space3,
  },
  locationIcon: {
    fontSize: ms(18),
    marginRight: spacing.space2,
  },
  locationLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationStatusIcon: {
    fontSize: ms(20),
    marginRight: spacing.space2,
  },
  locationStatusText: {
    ...typography.titleMedium,
    fontWeight: '600',
  },
  statusAvailable: {
    color: colors.success,
  },
  statusUnavailable: {
    color: colors.error,
  },
  locationDistance: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.space2,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: spacing.space6,
  },
  bigButton: {
    width: ms(180),
    height: ms(180),
    borderRadius: ms(90),
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.brand,
  },
  buttonCheckIn: {
    backgroundColor: colors.brand500,
  },
  buttonCheckOut: {
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    backgroundColor: colors.neutral300,
    shadowOpacity: 0,
  },
  buttonCompleted: {
    backgroundColor: colors.neutral200,
    shadowOpacity: 0,
  },
  bigButtonText: {
    ...typography.titleLarge,
    color: colors.white,
    fontWeight: '600',
    marginTop: spacing.space2,
  },
  bigButtonTextDisabled: {
    color: colors.neutral500,
  },
  helpText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.space4,
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: colors.warning50,
    borderWidth: 1,
    borderColor: colors.warning200,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
    marginTop: spacing.space4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  alertIcon: {
    fontSize: ms(18),
    marginRight: spacing.space2,
  },
  alertTitle: {
    ...typography.titleSmall,
    color: colors.warning700,
    fontWeight: '600',
  },
  alertContent: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: ms(20),
  },
  alertHighlight: {
    fontWeight: '600',
    color: colors.warning700,
  },
  checklistWarning: {
    backgroundColor: colors.warning50,
    borderRadius: borderRadius.lg,
    padding: spacing.space5,
    marginTop: spacing.space4,
    alignItems: 'center',
  },
  checklistWarningIcon: {
    fontSize: ms(32),
    marginBottom: spacing.space3,
  },
  checklistWarningTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space2,
  },
  checklistWarningSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space4,
  },
  checklistButton: {
    width: '100%',
    height: ms(48),
    backgroundColor: colors.brand500,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistButtonText: {
    ...typography.titleMedium,
    color: colors.white,
    fontWeight: '600',
  },
  workInfoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginTop: spacing.space6,
    ...shadows.sm,
  },
  workInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space4,
  },
  workInfoIcon: {
    fontSize: ms(18),
    marginRight: spacing.space2,
  },
  workInfoTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  workInfoGrid: {
    flexDirection: 'row',
    gap: spacing.space4,
  },
  workInfoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space4,
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
  },
  workInfoLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  workInfoValue: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  workInfoValuePlaceholder: {
    color: colors.neutral400,
  },
  workInfoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.space1,
  },
  statusDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    marginRight: spacing.space1,
  },
  statusDotSuccess: {
    backgroundColor: colors.success,
  },
  statusDotWarning: {
    backgroundColor: colors.warning,
  },
  statusDotNeutral: {
    backgroundColor: colors.neutral400,
  },
  statusText: {
    ...typography.captionMedium,
    color: colors.textTertiary,
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.space4,
    paddingTop: spacing.space4,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
  },
  noteIcon: {
    fontSize: ms(14),
    marginRight: spacing.space2,
  },
  noteText: {
    ...typography.captionMedium,
    color: colors.warning,
  },
  bottomLinks: {
    alignItems: 'center',
    marginTop: spacing.space8,
  },
  bottomQuestion: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.space3,
  },
  linksRow: {
    flexDirection: 'row',
    gap: spacing.space4,
  },
  link: {
    paddingVertical: spacing.space2,
    paddingHorizontal: spacing.space3,
  },
  linkText: {
    ...typography.labelMedium,
    color: colors.brand500,
    fontWeight: '500',
  },
});
```

---

## 에러 처리

```typescript
const errorHandling = {
  // 위치 권한 오류
  locationPermission: {
    title: '위치 권한이 필요합니다',
    message: '출퇴근 체크를 위해 위치 권한을 허용해주세요',
    action: '설정으로 이동',
  },
  
  // GPS 오류
  gpsError: {
    title: 'GPS 연결 오류',
    message: '위치 정보를 가져올 수 없습니다. 잠시 후 다시 시도해주세요',
    action: '다시 시도',
  },
  
  // 네트워크 오류
  networkError: {
    title: '네트워크 오류',
    message: '인터넷 연결을 확인해주세요',
    action: '다시 시도',
  },
  
  // 중복 출퇴근
  duplicateCheck: {
    checkIn: {
      title: '이미 출근했습니다',
      message: '오늘 이미 출근 기록이 있습니다',
    },
    checkOut: {
      title: '이미 퇴근했습니다', 
      message: '오늘 이미 퇴근 기록이 있습니다',
    },
  },
  
  // 시간 제한
  timeRestriction: {
    tooEarly: {
      title: '출근 시간 전입니다',
      message: '설정된 시업 시간 이후에 출근해주세요',
    },
    tooLate: {
      title: '퇴근 시간이 지났습니다',
      message: '관리자에게 문의해주세요',
    },
  },
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  // 위치 업데이트 최적화
  location: {
    updateInterval: 5000, // 5초
    distanceFilter: 10, // 10m 이동 시 업데이트
    accuracy: 'high',
  },
  
  // 시간 표시 최적화
  time: {
    updateInterval: 1000, // 1초
    useNativeDriver: true,
  },
  
  // 배터리 최적화
  battery: {
    backgroundMode: false, // 백그라운드에서 위치 업데이트 비활성화
    lowPowerMode: true, // 저전력 모드 시 위치 업데이트 빈도 감소
  },
  
  // 메모이제이션
  memoizedComponents: [
    'TimeDisplay',
    'LocationCard',
    'WorkInfoCard',
  ],
};
```
