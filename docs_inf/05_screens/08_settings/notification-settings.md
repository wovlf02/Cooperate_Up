# 알림 설정 화면 (NotificationSettingsScreen) - Production Ready v2.0

## 개요

푸시 알림 설정을 관리하는 화면입니다.
전체 알림 토글과 개별 알림 설정을 직관적으로 구분하여 제공합니다.
토스, 카카오 등의 알림 설정 UX를 참고하여 세련된 디자인을 제공합니다.

---

## 🎨 디자인 원칙

### UX 목표

- **계층적 구조**: 전체 알림 → 개별 알림의 명확한 계층
- **즉각적 피드백**: 토글 변경 시 즉시 시각적 피드백
- **상태 동기화**: 전체 알림 OFF 시 개별 알림도 비활성화 표시
- **권한 안내**: 시스템 알림 권한 상태 명확히 표시

---

## 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│ StatusBar (dark-content)                                  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Header                                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ←            알림 설정                              │ │
│  │               titleMedium, fontWeight: 600           │ │
│  │               height: 56px                           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ScrollView                                               │
│  paddingHorizontal: screenPadding                         │
│  paddingTop: space4                                       │
│                                                           │
│  (알림 권한이 없을 때)                                     │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  ⚠️ 알림 권한 필요                                  │  │
│  │                                                     │  │
│  │  알림을 받으려면 시스템 설정에서                     │  │
│  │  알림 권한을 허용해주세요.                           │  │
│  │                                                     │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │                                               │  │  │
│  │  │              설정으로 이동                    │  │  │
│  │  │                                               │  │  │
│  │  │  PrimaryButton, height: 44px                  │  │  │
│  │  │  marginTop: space4                            │  │  │
│  │  │                                               │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  backgroundColor: warning + 10%                     │  │
│  │  borderRadius: 16px                                 │  │
│  │  padding: space5                                    │  │
│  │  borderWidth: 1                                     │  │
│  │  borderColor: warning + 20%                         │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space4 (권한 있을 때만)                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  전체 알림                                          │  │
│  │  labelMedium, textTertiary                          │  │
│  │  marginBottom: space2                               │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  ┌───────────────────────────────────────┐  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  🔔  전체 알림                   🔘   │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  height: 72px                         │  │    │  │
│  │  │  │  titleMedium, textPrimary             │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  모든 알림을 켜거나 끕니다            │  │    │  │
│  │  │  │  bodySmall, textSecondary             │  │    │  │
│  │  │  │  marginTop: space1                    │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  Switch:                              │  │    │  │
│  │  │  │    trackColor(off): neutral300        │  │    │  │
│  │  │  │    trackColor(on): brand500           │  │    │  │
│  │  │  │    thumbColor: white                  │  │    │  │
│  │  │  │    ⚡ Spring animation                 │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  └───────────────────────────────────────┘  │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  backgroundColor: white                             │  │
│  │  borderRadius: 16px                                 │  │
│  │  ⚡ Shadow sm                                        │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space6                                        │
│  (전체 알림 ON일 때만 표시)                                │
│  ⚡ FadeIn + SlideDown animation                           │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  개별 알림 설정                                     │  │
│  │  labelMedium, textTertiary                          │  │
│  │  marginBottom: space2                               │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  ┌───────────────────────────────────────┐  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  💬  채팅 알림                   🔘   │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  height: 72px                         │  │    │  │
│  │  │  │  titleSmall, textPrimary              │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  새 메시지를 받으면 알림               │  │    │  │
│  │  │  │  bodySmall, textSecondary             │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  └───────────────────────────────────────┘  │    │  │
│  │  │                                             │    │  │
│  │  │  ─────────────────────────────────────────  │    │  │
│  │  │  1px, neutral100, marginLeft: 52px          │    │  │
│  │  │                                             │    │  │
│  │  │  ┌───────────────────────────────────────┐  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  📢  공지사항 알림               🔘   │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  새 공지사항이 등록되면 알림          │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  └───────────────────────────────────────┘  │    │  │
│  │  │                                             │    │  │
│  │  │  ─────────────────────────────────────────  │    │  │
│  │  │                                             │    │  │
│  │  │  ┌───────────────────────────────────────┐  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  ✅  승인 결과 알림              🔘   │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  근태 승인/거부 결과 알림             │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  └───────────────────────────────────────┘  │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  │  backgroundColor: white                             │  │
│  │  borderRadius: 16px                                 │  │
│  │  ⚡ Shadow sm                                        │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  (관리자 전용) marginTop: space4                          │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  관리자 알림                                        │  │
│  │  labelMedium, textTertiary                          │  │
│  │  marginBottom: space2                               │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  ┌───────────────────────────────────────┐  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  📝  새 요청 알림                🔘   │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  │  근무자의 새 요청이 있으면 알림       │  │    │  │
│  │  │  │                                       │  │    │  │
│  │  │  └───────────────────────────────────────┘  │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space8                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  💡 알림 팁                                         │  │
│  │                                                     │  │
│  │  • 알림을 받으면 홈 화면에서 바로 확인할 수 있어요    │  │
│  │  • 방해 금지 시간을 설정하려면 시스템 설정을 이용하세요│  │
│  │                                                     │  │
│  │  backgroundColor: info + 10%                        │  │
│  │  borderRadius: 12px                                 │  │
│  │  padding: space4                                    │  │
│  │  bodySmall, textSecondary                           │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  paddingBottom: safeArea + space6                         │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 상세

### 1. Permission Warning Card

```typescript
const permissionWarningStyles = {
  container: {
    backgroundColor: `${colors.warning}15`,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    borderWidth: 1,
    borderColor: `${colors.warning}30`,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  
  icon: {
    fontSize: ms(20),
    marginRight: spacing.space2,
  },
  
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: ms(22),
  },
  
  button: {
    marginTop: spacing.space4,
    height: ms(44),
    borderRadius: borderRadius.sm,
    backgroundColor: colors.brand500,
  },
};
```

### 2. Master Toggle Card

```typescript
const masterToggleStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space4,
    ...shadows.sm,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  icon: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(12),
    backgroundColor: colors.brand100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space3,
  },
  
  iconEmoji: {
    fontSize: ms(24),
  },
  
  textSection: {
    flex: 1,
  },
  
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.space1,
  },
  
  switch: {
    trackColor: {
      false: colors.neutral300,
      true: colors.brand500,
    },
    thumbColor: colors.white,
  },
};
```

### 3. Notification Toggle Item

```typescript
const notificationItemStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(72),
    paddingHorizontal: spacing.space4,
  },
  
  icon: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(10),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space3,
  },
  
  iconEmoji: {
    fontSize: ms(20),
  },
  
  textSection: {
    flex: 1,
  },
  
  title: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.space0_5,
  },
  
  switch: {
    trackColor: {
      false: colors.neutral300,
      true: colors.brand500,
    },
    thumbColor: colors.white,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginLeft: ms(52), // icon width + margin
  },
};
```

### 4. Tips Card

```typescript
const tipsCardStyles = {
  container: {
    backgroundColor: `${colors.info}10`,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
    marginTop: spacing.space8,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  
  icon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  
  title: {
    ...typography.labelMedium,
    color: colors.info,
    fontWeight: '600',
  },
  
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.space1,
  },
  
  bullet: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginRight: spacing.space2,
  },
  
  text: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: ms(20),
  },
};
```

---

## 애니메이션

### 스위치 토글

```typescript
const switchAnimation = {
  // 트랙 색상 변화
  trackColor: {
    duration: 200,
    easing: 'easeOut',
  },
  
  // 썸 이동
  thumb: {
    type: 'spring',
    damping: 15,
    stiffness: 180,
  },
  
  // 햅틱 피드백
  haptic: 'light',
};
```

### 개별 알림 섹션 표시/숨김

```typescript
const sectionAnimation = {
  // 나타날 때
  enter: {
    opacity: { from: 0, to: 1 },
    translateY: { from: -20, to: 0 },
    height: { from: 0, to: 'auto' },
    duration: 300,
    easing: 'easeOut',
  },
  
  // 사라질 때
  exit: {
    opacity: { to: 0 },
    translateY: { to: -20 },
    height: { to: 0 },
    duration: 200,
    easing: 'easeIn',
  },
  
  // 스태거 효과 (각 아이템)
  stagger: 50,
};
```

### 토글 상태 변경

```typescript
const toggleStateAnimation = {
  // ON → OFF
  disable: {
    opacity: { to: 0.5 },
    duration: 200,
  },
  
  // OFF → ON
  enable: {
    opacity: { to: 1 },
    duration: 200,
  },
};
```

---

## 알림 타입

### 공통 알림

| 알림 | 아이콘 | 설명 | 기본값 |
|------|--------|------|--------|
| 채팅 알림 | 💬 | 새 메시지를 받으면 알림 | ON |
| 공지사항 알림 | 📢 | 새 공지사항이 등록되면 알림 | ON |
| 승인 결과 알림 | ✅ | 근태 승인/거부 결과 알림 | ON |

### 관리자 전용 알림

| 알림 | 아이콘 | 설명 | 기본값 |
|------|--------|------|--------|
| 새 요청 알림 | 📝 | 근무자의 새 요청이 있으면 알림 | ON |

---

## 전체 알림 OFF 시 동작

```typescript
const masterOffBehavior = {
  // 개별 알림 섹션
  section: {
    display: 'hidden', // 또는 'disabled'
    animation: 'slideUp',
    duration: 200,
  },
  
  // 개별 토글 상태 유지
  preserveIndividualStates: true,
  
  // 서버 동기화
  syncToServer: true,
};
```

---

## 접근성

```typescript
const accessibility = {
  masterToggle: {
    accessibilityRole: 'switch',
    accessibilityLabel: '전체 알림',
    accessibilityHint: '모든 알림을 켜거나 끕니다',
    accessibilityState: { checked: isAllEnabled },
  },
  
  notificationToggle: {
    accessibilityRole: 'switch',
    accessibilityLabel: (label) => `${label} 알림`,
    accessibilityHint: (description) => description,
    accessibilityState: { 
      checked: isEnabled,
      disabled: !isAllEnabled,
    },
  },
  
  permissionButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '알림 권한 설정으로 이동',
    accessibilityHint: '시스템 설정에서 알림 권한을 허용할 수 있습니다',
  },
};
```

---

## 상태 관리

```typescript
interface NotificationSettingsState {
  // 권한 상태
  hasPermission: boolean;
  
  // 토글 상태
  isAllEnabled: boolean;
  settings: {
    chat: boolean;
    announcement: boolean;
    approvalResult: boolean;
    newRequest: boolean;  // 관리자 전용
  };
  
  // UI 상태
  isLoading: boolean;
  isSaving: boolean;
}
```

---

## 전체 코드 예시

```typescript
// screens/Settings/NotificationSettingsScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/Header';
import { PrimaryButton } from '@/components/Button';

import { useUser } from '@/hooks/useUser';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { colors, typography, shadows, borderRadius, spacing, layout } from '@/styles/theme';
import { hp, wp, ms, fs } from '@/utils/responsive';

const NotificationItem = ({ icon, label, description, value, onValueChange, disabled }) => (
  <View style={[styles.notificationItem, disabled && styles.notificationItemDisabled]}>
    <View style={styles.notificationIcon}>
      <Text style={styles.notificationIconEmoji}>{icon}</Text>
    </View>
    <View style={styles.notificationText}>
      <Text style={styles.notificationLabel}>{label}</Text>
      <Text style={styles.notificationDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={(val) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onValueChange(val);
      }}
      disabled={disabled}
      trackColor={{ false: colors.neutral300, true: colors.brand500 }}
      thumbColor={colors.white}
    />
  </View>
);

export const NotificationSettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const {
    hasPermission,
    isAllEnabled,
    settings,
    updateAllEnabled,
    updateSetting,
    checkPermission,
  } = useNotificationSettings();
  
  useEffect(() => {
    checkPermission();
  }, []);
  
  const handleOpenSettings = () => {
    Linking.openSettings();
  };
  
  return (
    <View style={styles.container}>
      <Header title="알림 설정" showBackButton />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.space6 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Permission Warning */}
        {!hasPermission && (
          <Animated.View
            style={styles.permissionCard}
            entering={FadeIn.duration(300)}
          >
            <View style={styles.permissionHeader}>
              <Text style={styles.permissionIcon}>⚠️</Text>
              <Text style={styles.permissionTitle}>알림 권한 필요</Text>
            </View>
            <Text style={styles.permissionMessage}>
              알림을 받으려면 시스템 설정에서 알림 권한을 허용해주세요.
            </Text>
            <PrimaryButton
              title="설정으로 이동"
              onPress={handleOpenSettings}
              style={styles.permissionButton}
            />
          </Animated.View>
        )}
        
        {/* Master Toggle */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(300)}
        >
          <Text style={styles.sectionTitle}>전체 알림</Text>
          <View style={styles.masterCard}>
            <View style={styles.masterContent}>
              <View style={styles.masterIcon}>
                <Text style={styles.masterIconEmoji}>🔔</Text>
              </View>
              <View style={styles.masterText}>
                <Text style={styles.masterTitle}>전체 알림</Text>
                <Text style={styles.masterDescription}>
                  모든 알림을 켜거나 끕니다
                </Text>
              </View>
              <Switch
                value={isAllEnabled}
                onValueChange={(val) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  updateAllEnabled(val);
                }}
                trackColor={{ false: colors.neutral300, true: colors.brand500 }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </Animated.View>
        
        {/* Individual Settings */}
        {isAllEnabled && (
          <Animated.View
            entering={FadeInDown.delay(150).duration(300)}
            exiting={FadeOut.duration(200)}
            layout={Layout.springify()}
          >
            <Text style={styles.sectionTitle}>개별 알림 설정</Text>
            <View style={styles.settingsCard}>
              <NotificationItem
                icon="💬"
                label="채팅 알림"
                description="새 메시지를 받으면 알림"
                value={settings.chat}
                onValueChange={(val) => updateSetting('chat', val)}
              />
              <View style={styles.itemDivider} />
              <NotificationItem
                icon="📢"
                label="공지사항 알림"
                description="새 공지사항이 등록되면 알림"
                value={settings.announcement}
                onValueChange={(val) => updateSetting('announcement', val)}
              />
              <View style={styles.itemDivider} />
              <NotificationItem
                icon="✅"
                label="승인 결과 알림"
                description="근태 승인/거부 결과 알림"
                value={settings.approvalResult}
                onValueChange={(val) => updateSetting('approvalResult', val)}
              />
            </View>
            
            {/* Admin Only */}
            {user.role === 'admin' && (
              <>
                <Text style={styles.sectionTitle}>관리자 알림</Text>
                <View style={styles.settingsCard}>
                  <NotificationItem
                    icon="📝"
                    label="새 요청 알림"
                    description="근무자의 새 요청이 있으면 알림"
                    value={settings.newRequest}
                    onValueChange={(val) => updateSetting('newRequest', val)}
                  />
                </View>
              </>
            )}
          </Animated.View>
        )}
        
        {/* Tips */}
        <Animated.View
          style={styles.tipsCard}
          entering={FadeInDown.delay(200).duration(300)}
        >
          <View style={styles.tipsHeader}>
            <Text style={styles.tipsIcon}>💡</Text>
            <Text style={styles.tipsTitle}>알림 팁</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              알림을 받으면 홈 화면에서 바로 확인할 수 있어요
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              방해 금지 시간을 설정하려면 시스템 설정을 이용하세요
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
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
  permissionCard: {
    backgroundColor: `${colors.warning}15`,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    borderWidth: 1,
    borderColor: `${colors.warning}30`,
    marginBottom: spacing.space4,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  permissionIcon: {
    fontSize: ms(20),
    marginRight: spacing.space2,
  },
  permissionTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  permissionMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: ms(22),
  },
  permissionButton: {
    marginTop: spacing.space4,
    height: ms(44),
  },
  sectionTitle: {
    ...typography.labelMedium,
    color: colors.textTertiary,
    marginBottom: spacing.space2,
    marginTop: spacing.space6,
    paddingHorizontal: spacing.space1,
  },
  masterCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space4,
    ...shadows.sm,
  },
  masterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterIcon: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(12),
    backgroundColor: colors.brand100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space3,
  },
  masterIconEmoji: {
    fontSize: ms(24),
  },
  masterText: {
    flex: 1,
  },
  masterTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  masterDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.space1,
  },
  settingsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ms(72),
    paddingHorizontal: spacing.space4,
  },
  notificationItemDisabled: {
    opacity: 0.5,
  },
  notificationIcon: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(10),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space3,
  },
  notificationIconEmoji: {
    fontSize: ms(20),
  },
  notificationText: {
    flex: 1,
  },
  notificationLabel: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  notificationDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginLeft: ms(68),
  },
  tipsCard: {
    backgroundColor: `${colors.info}10`,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
    marginTop: spacing.space8,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  tipsIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  tipsTitle: {
    ...typography.labelMedium,
    color: colors.info,
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.space1,
  },
  tipBullet: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginRight: spacing.space2,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: ms(20),
  },
});
```
