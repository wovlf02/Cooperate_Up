# 설정 메인 화면 (SettingsScreen) - Production Ready v2.0

## 개요

앱 설정 메뉴를 보여주는 화면입니다.
설정 항목을 그룹별로 정리하여 직관적인 탐색이 가능하도록 합니다.
토스, 카카오 등의 설정 UX를 참고하여 세련된 디자인을 제공합니다.

---

## 🎨 디자인 원칙

### UX 목표

- **명확한 그룹화**: 관련 설정 항목을 시각적으로 그룹화
- **프로필 강조**: 상단에 프로필 카드로 사용자 정보 표시
- **접근성 우선**: 큰 터치 타겟, 명확한 레이블
- **부드러운 전환**: 화면 간 자연스러운 전환 애니메이션

---

## 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│ StatusBar (dark-content)                                  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Header                                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │               설정                                   │ │
│  │               titleLarge, fontWeight: 700            │ │
│  │               textAlign: center                      │ │
│  │               height: 56px                           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ScrollView                                               │
│  paddingHorizontal: screenPadding                         │
│  paddingTop: space4                                       │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  프로필 카드                                        │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  ┌────────────┐                             │    │  │
│  │  │  │            │   홍길동                    │    │  │
│  │  │  │     👤     │   titleLarge, fontWeight:600│    │  │
│  │  │  │            │                             │    │  │
│  │  │  │ size: 72px │   example@email.com         │    │  │
│  │  │  │ circle     │   bodySmall, textSecondary  │    │  │
│  │  │  └────────────┘                             │    │  │
│  │  │                                             │    │  │
│  │  │                   ┌─────────┐               │    │  │
│  │  │                   │👔 관리자│               │    │  │
│  │  │                   └─────────┘               │    │  │
│  │  │                   backgroundColor: brand50  │    │  │
│  │  │                   color: brand600           │    │  │
│  │  │                   borderRadius: 6px         │    │  │
│  │  │                   paddingH: 8px             │    │  │
│  │  │                   paddingV: 4px             │    │  │
│  │  │                   captionLarge              │    │  │
│  │  │                   marginTop: space2         │    │  │
│  │  │                                             │    │  │
│  │  │  ─────────────────────────────────────────  │    │  │
│  │  │  1px, neutral100                            │    │  │
│  │  │  marginVertical: space4                     │    │  │
│  │  │                                             │    │  │
│  │  │  ┌─────────────────────────────────────┐    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  │            프로필 수정              │    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  │  SecondaryButton                    │    │    │  │
│  │  │  │  height: 44px                       │    │    │  │
│  │  │  │  borderRadius: 10px                 │    │    │  │
│  │  │  │  borderWidth: 1                     │    │    │  │
│  │  │  │  borderColor: neutral200            │    │    │  │
│  │  │  │  backgroundColor: white             │    │    │  │
│  │  │  │  titleSmall, textPrimary            │    │    │  │
│  │  │  │  ⚡ Press scale animation            │    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  └─────────────────────────────────────┘    │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  backgroundColor: white                             │  │
│  │  borderRadius: 16px                                 │  │
│  │  padding: space5                                    │  │
│  │  ⚡ Shadow sm                                        │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space6                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  🔔 알림                                            │  │
│  │  labelMedium, textTertiary                          │  │
│  │  marginBottom: space2                               │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  ┌─────────────────────────────────────┐    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  │  🔔  알림 설정                   >  │    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  │  height: 56px                       │    │    │  │
│  │  │  │  paddingHorizontal: space4          │    │    │  │
│  │  │  │  backgroundColor: white             │    │    │  │
│  │  │  │  borderRadius: 12px (top)           │    │    │  │
│  │  │  │  titleSmall, textPrimary            │    │    │  │
│  │  │  │  chevronColor: neutral400           │    │    │  │
│  │  │  │  ⚡ Highlight on press               │    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  └─────────────────────────────────────┘    │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space6                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  👤 계정                                            │  │
│  │  labelMedium, textTertiary                          │  │
│  │  marginBottom: space2                               │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  ┌─────────────────────────────────────┐    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  │  🔐  비밀번호 변경               >  │    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  └─────────────────────────────────────┘    │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  (관리자 전용) marginTop: space6                          │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  ⚙️ 관리자 설정                                     │  │
│  │  labelMedium, textTertiary                          │  │
│  │  marginBottom: space2                               │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  ┌─────────────────────────────────────┐    │    │  │
│  │  │  │  👥  근무자 관리                 >  │    │    │  │
│  │  │  └─────────────────────────────────────┘    │    │  │
│  │  │  ─────────────────────────────────────────  │    │  │
│  │  │  ┌─────────────────────────────────────┐    │    │  │
│  │  │  │  ✅  승인 요청 관리               >  │    │    │  │
│  │  │  │      (신규: 3건)                    │    │    │  │
│  │  │  │      badge: error, count            │    │    │  │
│  │  │  └─────────────────────────────────────┘    │    │  │
│  │  │  ─────────────────────────────────────────  │    │  │
│  │  │  ┌─────────────────────────────────────┐    │    │  │
│  │  │  │  💰  급여 관리                   >  │    │    │  │
│  │  │  └─────────────────────────────────────┘    │    │  │
│  │  │  ─────────────────────────────────────────  │    │  │
│  │  │  ┌─────────────────────────────────────┐    │    │  │
│  │  │  │  📍  매장 위치 설정               >  │    │    │  │
│  │  │  └─────────────────────────────────────┘    │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space6                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  ℹ️ 앱 정보                                         │  │
│  │  labelMedium, textTertiary                          │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  ┌─────────────────────────────────────┐    │    │  │
│  │  │  │  📄  이용약관                    >  │    │    │  │
│  │  │  └─────────────────────────────────────┘    │    │  │
│  │  │  ─────────────────────────────────────────  │    │  │
│  │  │  ┌─────────────────────────────────────┐    │    │  │
│  │  │  │  🔒  개인정보처리방침             >  │    │    │  │
│  │  │  └─────────────────────────────────────┘    │    │  │
│  │  │  ─────────────────────────────────────────  │    │  │
│  │  │  ┌─────────────────────────────────────┐    │    │  │
│  │  │  │  📱  앱 버전               v1.0.0   │    │    │  │
│  │  │  │      (최신 버전)                    │    │    │  │
│  │  │  │      color: success                 │    │    │  │
│  │  │  └─────────────────────────────────────┘    │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space8                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │                  로그아웃                   │    │  │
│  │  │                                             │    │  │
│  │  │  height: 56px                               │    │  │
│  │  │  backgroundColor: error + opacity(0.1)      │    │  │
│  │  │  borderRadius: 12px                         │    │  │
│  │  │  titleMedium, error                         │    │  │
│  │  │  ⚡ Press highlight animation                │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  paddingBottom: tabBarHeight + safeArea + space4          │
│                                                           │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│                                                           │
│  Bottom Tab Bar                                           │
│  height: tabBarHeight                                     │
│  backgroundColor: white                                   │
│  borderTopWidth: 1, borderTopColor: neutral100            │
│  ⚡ Shadow (subtle)                                        │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 상세

### 1. Profile Card

```typescript
const profileCardStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    ...shadows.sm,
  },
  
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(36),
    backgroundColor: colors.neutral100,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.sm,
  },
  
  avatarPlaceholder: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(36),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarIcon: {
    size: ms(32),
    color: colors.neutral400,
  },
  
  textSection: {
    flex: 1,
    marginLeft: spacing.space4,
  },
  
  name: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  email: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.space1,
  },
  
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand50,
    paddingHorizontal: spacing.space2,
    paddingVertical: spacing.space1,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.space2,
  },
  
  roleIcon: {
    fontSize: ms(12),
    marginRight: spacing.space1,
  },
  
  roleText: {
    ...typography.captionLarge,
    color: colors.brand600,
    fontWeight: '600',
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: spacing.space4,
  },
  
  editButton: {
    height: ms(44),
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral200,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  editButtonText: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
};
```

### 2. Settings Group

```typescript
const settingsGroupStyles = {
  container: {
    marginTop: spacing.space6,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
    paddingHorizontal: spacing.space1,
  },
  
  headerIcon: {
    fontSize: ms(14),
    marginRight: spacing.space2,
  },
  
  headerTitle: {
    ...typography.labelMedium,
    color: colors.textTertiary,
  },
  
  itemsContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
};
```

### 3. Settings Item

```typescript
const settingsItemStyles = {
  // 기본 네비게이션 항목
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(56),
    paddingHorizontal: spacing.space4,
    backgroundColor: colors.white,
  },
  
  navigationItemPressed: {
    backgroundColor: colors.neutral50,
  },
  
  icon: {
    fontSize: ms(20),
    marginRight: spacing.space3,
  },
  
  label: {
    flex: 1,
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  
  chevron: {
    size: ms(20),
    color: colors.neutral400,
  },
  
  // 값 표시 항목
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(56),
    paddingHorizontal: spacing.space4,
    backgroundColor: colors.white,
  },
  
  value: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginRight: spacing.space2,
  },
  
  // 배지 표시 항목
  badge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.space2,
    paddingVertical: spacing.space0_5,
    borderRadius: borderRadius.full,
    marginLeft: 'auto',
    marginRight: spacing.space2,
  },
  
  badgeText: {
    ...typography.captionMedium,
    color: colors.white,
    fontWeight: '600',
  },
  
  // 구분선
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginLeft: ms(52), // icon width + margin
  },
  
  // 토글 항목
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ms(56),
    paddingHorizontal: spacing.space4,
    backgroundColor: colors.white,
  },
  
  toggle: {
    trackColor: {
      false: colors.neutral300,
      true: colors.brand500,
    },
    thumbColor: colors.white,
  },
};
```

### 4. Logout Button

```typescript
const logoutButtonStyles = {
  container: {
    marginTop: spacing.space8,
  },
  
  button: {
    height: ms(56),
    backgroundColor: `${colors.error}15`, // 10% opacity
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  buttonPressed: {
    backgroundColor: `${colors.error}25`,
  },
  
  buttonText: {
    ...typography.titleMedium,
    color: colors.error,
    fontWeight: '600',
  },
};
```

---

## 애니메이션

### 항목 프레스

```typescript
const itemPressAnimation = {
  backgroundColor: {
    from: colors.white,
    to: colors.neutral50,
    duration: 100,
  },
  
  scale: {
    to: 0.98,
    duration: 100,
    spring: { damping: 20, stiffness: 300 },
  },
};
```

### 로그아웃 버튼

```typescript
const logoutButtonAnimation = {
  press: {
    scale: { to: 0.97 },
    duration: 100,
  },
  
  backgroundColor: {
    from: `${colors.error}15`,
    to: `${colors.error}25`,
    duration: 100,
  },
};
```

### 스크롤 진입

```typescript
const scrollEntranceAnimation = {
  profileCard: {
    entering: FadeInDown.delay(100).duration(300),
  },
  
  groups: {
    stagger: 50,
    entering: FadeInDown.duration(300),
  },
};
```

---

## 로그아웃 확인 모달

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
│     │                  │   🚪   │                   │     │
│     │                  │        │                   │     │
│     │                  └────────┘                   │     │
│     │                  width: 64px                  │     │
│     │                  height: 64px                 │     │
│     │                  backgroundColor: error + 10% │     │
│     │                  borderRadius: 32px           │     │
│     │                                               │     │
│     │               로그아웃                         │     │
│     │               titleLarge, textPrimary         │     │
│     │               fontWeight: 600                 │     │
│     │               marginTop: space4               │     │
│     │                                               │     │
│     │          정말 로그아웃 하시겠습니까?           │     │
│     │          bodyMedium, textSecondary            │     │
│     │          marginTop: space2                    │     │
│     │                                               │     │
│     │                                               │     │
│     │     ┌─────────────────┐ ┌─────────────────┐   │     │
│     │     │                 │ │                 │   │     │
│     │     │     취소        │ │    로그아웃     │   │     │
│     │     │                 │ │                 │   │     │
│     │     │  SecondaryBtn   │ │  ErrorBtn       │   │     │
│     │     │  height: 48px   │ │  height: 48px   │   │     │
│     │     │                 │ │  bg: error      │   │     │
│     │     │                 │ │  color: white   │   │     │
│     │     └─────────────────┘ └─────────────────┘   │     │
│     │                                               │     │
│     │     gap: space3                               │     │
│     │     marginTop: space6                         │     │
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
```

---

## 접근성

```typescript
const accessibility = {
  profileCard: {
    accessibilityRole: 'button',
    accessibilityLabel: '프로필 수정',
    accessibilityHint: '두 번 탭하여 프로필을 수정하세요',
  },
  
  settingsItem: {
    accessibilityRole: 'button',
    accessibilityLabel: (label, value) => 
      value ? `${label}, 현재 값: ${value}` : label,
    accessibilityHint: '두 번 탭하여 이동',
  },
  
  settingsToggle: {
    accessibilityRole: 'switch',
    accessibilityLabel: (label) => label,
    accessibilityState: { checked: value },
  },
  
  badge: {
    accessibilityLabel: (count) => `${count}건의 새 알림`,
  },
  
  logoutButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '로그아웃',
    accessibilityHint: '두 번 탭하여 로그아웃',
  },
};
```

---

## 상태 관리

```typescript
interface SettingsState {
  // 사용자 정보
  user: {
    name: string;
    email: string;
    profileImage: string | null;
    role: 'admin' | 'worker';
  };
  
  // 알림 관련
  pendingApprovals: number;  // 관리자 전용
  
  // 앱 정보
  appVersion: string;
  isLatestVersion: boolean;
  
  // UI 상태
  showLogoutModal: boolean;
  isLoggingOut: boolean;
}
```

---

## 전체 코드 예시

```typescript
// screens/Settings/SettingsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';

import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { colors, typography, shadows, borderRadius, spacing, layout } from '@/styles/theme';
import { hp, wp, ms, fs } from '@/utils/responsive';

const SettingsItem = ({ icon, label, value, badge, onPress, destructive }) => (
  <TouchableOpacity
    style={styles.settingsItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.itemIcon}>{icon}</Text>
    <Text style={[styles.itemLabel, destructive && styles.itemLabelDestructive]}>
      {label}
    </Text>
    {badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    {value && <Text style={styles.itemValue}>{value}</Text>}
    {!destructive && <Icon name="chevron-right" size={ms(20)} color={colors.neutral400} />}
  </TouchableOpacity>
);

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, pendingApprovals } = useUser();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Header title="설정" />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: layout.tabBarHeight + insets.bottom + spacing.space4 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View
          style={styles.profileCard}
          entering={FadeInDown.delay(100).duration(300)}
        >
          <View style={styles.profileInfo}>
            {user.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="user" size={ms(32)} color={colors.neutral400} />
              </View>
            )}
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleIcon}>
                  {user.role === 'admin' ? '👔' : '👷'}
                </Text>
                <Text style={styles.roleText}>
                  {user.role === 'admin' ? '관리자' : '근무자'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigate('Profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>프로필 수정</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Notification Settings */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(300)}
        >
          <View style={styles.groupHeader}>
            <Text style={styles.groupIcon}>🔔</Text>
            <Text style={styles.groupTitle}>알림</Text>
          </View>
          <View style={styles.groupContainer}>
            <SettingsItem
              icon="🔔"
              label="알림 설정"
              onPress={() => navigate('NotificationSettings')}
            />
          </View>
        </Animated.View>
        
        {/* Account Settings */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(300)}
        >
          <View style={styles.groupHeader}>
            <Text style={styles.groupIcon}>👤</Text>
            <Text style={styles.groupTitle}>계정</Text>
          </View>
          <View style={styles.groupContainer}>
            <SettingsItem
              icon="🔐"
              label="비밀번호 변경"
              onPress={() => navigate('ChangePassword')}
            />
          </View>
        </Animated.View>
        
        {/* Admin Settings */}
        {user.role === 'admin' && (
          <Animated.View
            entering={FadeInDown.delay(250).duration(300)}
          >
            <View style={styles.groupHeader}>
              <Text style={styles.groupIcon}>⚙️</Text>
              <Text style={styles.groupTitle}>관리자 설정</Text>
            </View>
            <View style={styles.groupContainer}>
              <SettingsItem
                icon="👥"
                label="근무자 관리"
                onPress={() => navigate('WorkerManagement')}
              />
              <View style={styles.itemDivider} />
              <SettingsItem
                icon="✅"
                label="승인 요청 관리"
                badge={pendingApprovals > 0 ? pendingApprovals : null}
                onPress={() => navigate('ApprovalManagement')}
              />
              <View style={styles.itemDivider} />
              <SettingsItem
                icon="💰"
                label="급여 관리"
                onPress={() => navigate('PayrollManagement')}
              />
              <View style={styles.itemDivider} />
              <SettingsItem
                icon="📍"
                label="매장 위치 설정"
                onPress={() => navigate('LocationSettings')}
              />
            </View>
          </Animated.View>
        )}
        
        {/* App Info */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(300)}
        >
          <View style={styles.groupHeader}>
            <Text style={styles.groupIcon}>ℹ️</Text>
            <Text style={styles.groupTitle}>앱 정보</Text>
          </View>
          <View style={styles.groupContainer}>
            <SettingsItem
              icon="📄"
              label="이용약관"
              onPress={() => navigate('Terms')}
            />
            <View style={styles.itemDivider} />
            <SettingsItem
              icon="🔒"
              label="개인정보처리방침"
              onPress={() => navigate('Privacy')}
            />
            <View style={styles.itemDivider} />
            <View style={styles.settingsItem}>
              <Text style={styles.itemIcon}>📱</Text>
              <Text style={styles.itemLabel}>앱 버전</Text>
              <Text style={styles.itemValue}>v1.0.0</Text>
              <Text style={styles.versionStatus}>(최신 버전)</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Logout Button */}
        <Animated.View
          style={styles.logoutContainer}
          entering={FadeInDown.delay(350).duration(300)}
        >
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      
      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        icon="log-out"
        iconColor={colors.error}
        actions={[
          { label: '취소', onPress: () => setShowLogoutModal(false), type: 'secondary' },
          { label: '로그아웃', onPress: handleLogout, type: 'destructive', loading: isLoggingOut },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.space4,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    ...shadows.sm,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(36),
  },
  avatarPlaceholder: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(36),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    flex: 1,
    marginLeft: spacing.space4,
  },
  profileName: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  profileEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.space1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand50,
    paddingHorizontal: spacing.space2,
    paddingVertical: spacing.space1,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.space2,
  },
  roleIcon: {
    fontSize: ms(12),
    marginRight: spacing.space1,
  },
  roleText: {
    ...typography.captionLarge,
    color: colors.brand600,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: spacing.space4,
  },
  editButton: {
    height: ms(44),
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.neutral200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.space6,
    marginBottom: spacing.space2,
    paddingHorizontal: spacing.space1,
  },
  groupIcon: {
    fontSize: ms(14),
    marginRight: spacing.space2,
  },
  groupTitle: {
    ...typography.labelMedium,
    color: colors.textTertiary,
  },
  groupContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(56),
    paddingHorizontal: spacing.space4,
  },
  itemIcon: {
    fontSize: ms(20),
    marginRight: spacing.space3,
  },
  itemLabel: {
    flex: 1,
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  itemLabelDestructive: {
    color: colors.error,
  },
  itemValue: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginRight: spacing.space2,
  },
  versionStatus: {
    ...typography.captionMedium,
    color: colors.success,
  },
  badge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.space2,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginRight: spacing.space2,
  },
  badgeText: {
    ...typography.captionMedium,
    color: colors.white,
    fontWeight: '600',
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginLeft: ms(52),
  },
  logoutContainer: {
    marginTop: spacing.space8,
  },
  logoutButton: {
    height: ms(56),
    backgroundColor: `${colors.error}15`,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    ...typography.titleMedium,
    color: colors.error,
    fontWeight: '600',
  },
});
```
