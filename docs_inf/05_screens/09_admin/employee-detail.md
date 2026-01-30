# 근무자 상세 화면 (EmployeeDetailScreen)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

근무자의 상세 정보를 보고 시급을 설정하는 화면입니다.

### 🎯 UX 목표
- **명확한 정보 구조**: 프로필, 급여, 근무현황을 시각적으로 구분
- **즉각적 피드백**: 시급 저장 시 성공/실패 피드백
- **법적 준수**: 최저시급 미만 경고로 법적 리스크 방지

---

## 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←   김철수                          │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  ScrollView                             │
│  paddingHorizontal: layout.screenPadding│
│                                         │
│  Profile Card (프로필 카드)             │
│ ┌─────────────────────────────────────┐ │
│ │         ┌────────────┐              │ │
│ │         │    👤      │              │ │
│ │         │  ms(80)    │              │ │
│ │         └────────────┘              │ │
│ │                                     │ │
│ │         김철수                       │ │
│ │         typography.displaySmall     │ │
│ │                                     │ │
│ │      ┌────────────────┐             │ │
│ │      │ 🟢 근무중      │             │ │
│ │      │ backgroundColor: success50   │ │
│ │      │ borderRadius: full          │ │
│ │      └────────────────┘             │ │
│ │                                     │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.md                         │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space5          │
│                                         │
│  Contact Info Section (연락처 정보)     │
│ ┌─────────────────────────────────────┐ │
│ │  📱 연락처 정보                     │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 이메일                       │    │ │
│ │  │ example@email.com    [복사] │    │ │
│ │  ├─────────────────────────────┤    │ │
│ │  │ 연락처                       │    │ │
│ │  │ 010-1234-5678        [전화] │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.sm                         │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space5          │
│                                         │
│  Wage Section (급여 설정)               │
│ ┌─────────────────────────────────────┐ │
│ │  💰 급여 설정                       │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  시급                               │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ₩ 10,500                   │    │ │
│ │  │ keyboardType: numeric      │    │ │
│ │  │ borderRadius: borderRadius.lg   ││ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  ⚠️ 2025년 최저시급: ₩10,030       │ │
│ │  color: colors.warning              │ │
│ │  (최저시급 미만 시에만 표시)        │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │         시급 저장            │    │ │
│ │  │    PrimaryButton             │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.sm                         │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space5          │
│                                         │
│  Work Summary Section (근무 현황)       │
│ ┌─────────────────────────────────────┐ │
│ │  📊 12월 근무 현황                  │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  ┌───────────┬───────────┐          │ │
│ │  │  근무일   │ 총 근무시간│          │ │
│ │  │   18일    │  153시간  │          │ │
│ │  │ brand500  │ brand500  │          │ │
│ │  └───────────┴───────────┘          │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ 💵 예상 급여                │    │ │
│ │  │    ₩1,606,500               │    │ │
│ │  │    displaySmall, brand500   │    │ │
│ │  │    backgroundColor: brand50 │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │   📋 상세 근무 기록 보기  > │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.sm                         │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space5          │
│                                         │
│  Account Section (계정 관리)            │
│ ┌─────────────────────────────────────┐ │
│ │  ⚙️ 계정 관리                       │ │
│ │  ─────────────────────────          │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │   🚫 계정 비활성화           │    │ │
│ │  │   color: colors.error        │    │ │
│ │  │   borderColor: colors.error100  ││ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.sm                         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  paddingBottom: hp(4) + safeArea        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 컴포넌트 스타일

### 1. Profile Card

```typescript
const profileCardStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space6,
    alignItems: 'center',
    ...shadows.md,
  },
  
  avatarContainer: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(40),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.space4,
    overflow: 'hidden',
  },
  
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  
  avatarPlaceholder: {
    fontSize: ms(36),
  },
  
  name: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.space3,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.space4,
    paddingVertical: spacing.space2,
    borderRadius: borderRadius.full,
    gap: spacing.space2,
  },
  
  statusBadgeWorking: {
    backgroundColor: colors.success50,
  },
  
  statusBadgeNotWorking: {
    backgroundColor: colors.neutral100,
  },
  
  statusDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
  },
  
  statusDotWorking: {
    backgroundColor: colors.success,
  },
  
  statusDotNotWorking: {
    backgroundColor: colors.neutral400,
  },
  
  statusText: {
    ...typography.labelMedium,
    fontWeight: '600',
  },
  
  statusTextWorking: {
    color: colors.success,
  },
  
  statusTextNotWorking: {
    color: colors.textSecondary,
  },
};
```

### 2. Section Card

```typescript
const sectionCardStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginBottom: spacing.space5,
    ...shadows.sm,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space4,
    paddingBottom: spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  
  headerIcon: {
    fontSize: ms(20),
    marginRight: spacing.space2,
  },
  
  headerTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
};
```

### 3. Contact Info Row

```typescript
const contactRowStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral50,
  },
  
  containerLast: {
    borderBottomWidth: 0,
  },
  
  labelContainer: {
    flex: 1,
  },
  
  label: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.space1,
  },
  
  value: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  
  actionButton: {
    width: ms(40),
    height: ms(40),
    borderRadius: borderRadius.md,
    backgroundColor: colors.brand50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  actionIcon: {
    color: colors.brand500,
  },
};
```

### 4. Wage Input

```typescript
const wageInputStyles = {
  container: {
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
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral200,
    paddingHorizontal: spacing.space4,
    height: ms(52),
  },
  
  inputContainerFocused: {
    borderColor: colors.brand500,
    backgroundColor: colors.white,
  },
  
  inputContainerError: {
    borderColor: colors.error,
    backgroundColor: colors.error50,
  },
  
  prefix: {
    ...typography.titleMedium,
    color: colors.textSecondary,
    marginRight: spacing.space1,
  },
  
  input: {
    flex: 1,
    ...typography.titleMedium,
    color: colors.textPrimary,
    padding: 0,
  },
  
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.space2,
    padding: spacing.space3,
    backgroundColor: colors.warning50,
    borderRadius: borderRadius.md,
  },
  
  warningIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  
  warningText: {
    ...typography.bodySmall,
    color: colors.warning700,
  },
};
```

### 5. Work Summary

```typescript
const workSummaryStyles = {
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.space4,
    marginBottom: spacing.space4,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space4,
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
  },
  
  statLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.space2,
  },
  
  statValue: {
    ...typography.titleLarge,
    color: colors.brand500,
    fontWeight: '700',
  },
  
  salaryCard: {
    backgroundColor: colors.brand50,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
    alignItems: 'center',
    marginBottom: spacing.space4,
  },
  
  salaryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  
  salaryLabelIcon: {
    fontSize: ms(16),
    marginRight: spacing.space1,
  },
  
  salaryLabelText: {
    ...typography.labelMedium,
    color: colors.brand600,
  },
  
  salaryValue: {
    ...typography.displaySmall,
    color: colors.brand600,
    fontWeight: '700',
  },
  
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.space3,
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.md,
  },
  
  detailButtonIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  
  detailButtonText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  
  detailButtonChevron: {
    marginLeft: spacing.space1,
  },
};
```

### 6. Danger Button

```typescript
const dangerButtonStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.space4,
    backgroundColor: colors.error50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error100,
  },
  
  icon: {
    fontSize: ms(18),
    marginRight: spacing.space2,
  },
  
  text: {
    ...typography.titleSmall,
    color: colors.error,
    fontWeight: '600',
  },
};
```

---

## 시급 설정

### 입력 필드

```
┌───────────────────────────────────────┐
│                                       │
│  시급                                 │
│  typography.labelMedium               │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ ₩ 10,500                       │  │
│  │                                 │  │
│  │ prefix: "₩ "                    │  │
│  │ keyboardType: numeric           │  │
│  │ 천 단위 콤마 자동 포맷          │  │
│  │ borderRadius.lg                 │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ ⚠️ 2025년 최저시급: ₩10,030    │  │
│  │ backgroundColor: warning50     │  │
│  └─────────────────────────────────┘  │
│  (입력값 < 10030 일 때만 표시)       │
│                                       │
└───────────────────────────────────────┘
```

### 최저시급 경고

```typescript
const MIN_WAGE_2025 = 10030;

const showMinWageWarning = hourlyWage > 0 && hourlyWage < MIN_WAGE_2025;
```

---

## 계정 비활성화 확인 모달

```
┌─────────────────────────────────────┐
│                                     │
│           🚫                        │
│                                     │
│     계정 비활성화                   │
│     typography.titleLarge           │
│                                     │
│   김철수 님의 계정을                │
│   비활성화하시겠습니까?             │
│   typography.bodyMedium             │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  ⚠️ 비활성화된 계정은        │   │
│   │     로그인할 수 없습니다.    │   │
│   │  backgroundColor: warning50 │   │
│   └─────────────────────────────┘   │
│                                     │
│  ┌───────────┐  ┌───────────┐       │
│  │   취소    │  │  비활성화  │       │
│  │  neutral  │  │   error   │       │
│  └───────────┘  └───────────┘       │
│                                     │
│  borderRadius: borderRadius.xl      │
│  padding: spacing.space6            │
│                                     │
└─────────────────────────────────────┘
```

---

## 애니메이션

### 화면 진입

```typescript
const screenAnimations = {
  profileCard: {
    entering: FadeInDown.delay(100).duration(400).springify(),
  },
  
  contactSection: {
    entering: FadeInDown.delay(200).duration(400).springify(),
  },
  
  wageSection: {
    entering: FadeInDown.delay(300).duration(400).springify(),
  },
  
  summarySection: {
    entering: FadeInDown.delay(400).duration(400).springify(),
  },
  
  accountSection: {
    entering: FadeInDown.delay(500).duration(400).springify(),
  },
};
```

### 버튼 상호작용

```typescript
const buttonAnimations = {
  press: {
    scale: withSpring(0.98, { damping: 15, stiffness: 200 }),
  },
  
  release: {
    scale: withSpring(1, { damping: 10, stiffness: 150 }),
  },
  
  saveSuccess: {
    scale: withSequence(
      withTiming(1.05, { duration: 100 }),
      withTiming(1, { duration: 150 })
    ),
  },
};
```

### 저장 피드백

```typescript
const saveFeedbackAnimation = {
  success: {
    opacity: { from: 0, to: 1 },
    scale: { from: 0.8, to: 1 },
    duration: 300,
    haptic: 'success',
  },
  
  error: {
    shakeX: [-10, 10, -10, 10, 0],
    duration: 400,
    haptic: 'error',
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  profileImage: {
    accessibilityRole: 'image',
    accessibilityLabel: (name) => `${name}님의 프로필 사진`,
  },
  
  statusBadge: {
    accessibilityRole: 'text',
    accessibilityLabel: (status) => 
      status === 'working' ? '현재 근무중' : '미출근 상태',
  },
  
  contactRow: {
    accessibilityRole: 'button',
    accessibilityLabel: (type, value) => `${type}: ${value}`,
    accessibilityHint: (type) => 
      type === 'email' ? '두 번 탭하여 복사' : '두 번 탭하여 전화',
  },
  
  wageInput: {
    accessibilityRole: 'spinbutton',
    accessibilityLabel: '시급 입력',
    accessibilityHint: '시급을 원 단위로 입력하세요',
    accessibilityValue: (wage) => `${wage.toLocaleString()}원`,
  },
  
  minWageWarning: {
    accessibilityRole: 'alert',
    accessibilityLabel: '최저시급 미달 경고',
  },
  
  saveButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '시급 저장',
    accessibilityState: { disabled: !hasChanges },
  },
  
  deactivateButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '계정 비활성화',
    accessibilityHint: '두 번 탭하여 계정 비활성화 확인창 열기',
  },
};
```

---

## 상태 관리

```typescript
interface EmployeeDetailState {
  // 직원 정보
  employee: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profileImage: string | null;
    hourlyWage: number;
    status: 'working' | 'not_checked_in' | 'checked_out';
    isActive: boolean;
    checkInTime: Date | null;
  };
  
  // 월간 요약
  monthlySummary: {
    workDays: number;
    totalHours: number;
    totalMinutes: number;
    expectedSalary: number;
  };
  
  // 시급 편집
  newHourlyWage: string;
  hasWageChanges: boolean;
  showMinWageWarning: boolean;
  
  // UI 상태
  isLoading: boolean;
  isSaving: boolean;
  showDeactivateModal: boolean;
  
  // 에러
  error: string | null;
}
```

---

## 전체 코드 예시

```typescript
// screens/Admin/EmployeeDetailScreen.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Linking,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/Header';
import { PrimaryButton } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Toast } from '@/components/Toast';

import { useEmployee } from '@/hooks/useEmployee';
import { colors, typography, shadows, borderRadius, spacing, layout } from '@/styles/theme';
import { hp, wp, ms, fs } from '@/utils/responsive';
import { formatCurrency, parseCurrency } from '@/utils/format';

const MIN_WAGE_2025 = 10030;

export const EmployeeDetailScreen: React.FC = ({ route }) => {
  const { employeeId } = route.params;
  const insets = useSafeAreaInsets();
  
  const { 
    employee, 
    monthlySummary, 
    updateHourlyWage,
    deactivateAccount,
    isLoading,
  } = useEmployee(employeeId);
  
  const [newHourlyWage, setNewHourlyWage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  
  // 초기값 설정
  useEffect(() => {
    if (employee) {
      setNewHourlyWage(employee.hourlyWage.toString());
    }
  }, [employee]);
  
  // 최저시급 경고
  const showMinWageWarning = useMemo(() => {
    const wage = parseCurrency(newHourlyWage);
    return wage > 0 && wage < MIN_WAGE_2025;
  }, [newHourlyWage]);
  
  // 변경사항 확인
  const hasChanges = useMemo(() => {
    const wage = parseCurrency(newHourlyWage);
    return employee && wage !== employee.hourlyWage && wage > 0;
  }, [newHourlyWage, employee]);
  
  // 시급 저장
  const handleSaveWage = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      await updateHourlyWage(parseCurrency(newHourlyWage));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: 'success', message: '시급이 저장되었습니다' });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({ type: 'error', message: '저장에 실패했습니다' });
    } finally {
      setIsSaving(false);
    }
  };
  
  // 이메일 복사
  const handleCopyEmail = async () => {
    await Clipboard.setStringAsync(employee.email);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Toast.show({ type: 'success', message: '이메일이 복사되었습니다' });
  };
  
  // 전화 걸기
  const handleCall = () => {
    Linking.openURL(`tel:${employee.phone}`);
  };
  
  // 계정 비활성화
  const handleDeactivate = async () => {
    try {
      await deactivateAccount();
      setShowDeactivateModal(false);
      navigation.goBack();
      Toast.show({ type: 'success', message: '계정이 비활성화되었습니다' });
    } catch (error) {
      Toast.show({ type: 'error', message: '비활성화에 실패했습니다' });
    }
  };
  
  // 상태 배지 스타일
  const getStatusStyle = () => {
    const isWorking = employee?.status === 'working';
    return {
      badge: isWorking ? styles.statusBadgeWorking : styles.statusBadgeNotWorking,
      dot: isWorking ? styles.statusDotWorking : styles.statusDotNotWorking,
      text: isWorking ? styles.statusTextWorking : styles.statusTextNotWorking,
      label: isWorking ? '근무중' : '미출근',
    };
  };
  
  const statusStyle = getStatusStyle();
  
  return (
    <View style={styles.container}>
      <Header title={employee?.name || '근무자 상세'} showBack />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + hp(4) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View
          style={styles.profileCard}
          entering={FadeInDown.delay(100).duration(400).springify()}
        >
          <View style={styles.avatarContainer}>
            {employee?.profileImage ? (
              <Image 
                source={{ uri: employee.profileImage }} 
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarPlaceholder}>👤</Text>
            )}
          </View>
          
          <Text style={styles.name}>{employee?.name}</Text>
          
          <View style={[styles.statusBadge, statusStyle.badge]}>
            <View style={[styles.statusDot, statusStyle.dot]} />
            <Text style={[styles.statusText, statusStyle.text]}>
              {statusStyle.label}
            </Text>
          </View>
        </Animated.View>
        
        {/* Contact Info */}
        <Animated.View
          style={styles.sectionCard}
          entering={FadeInDown.delay(200).duration(400).springify()}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderIcon}>📱</Text>
            <Text style={styles.sectionHeaderTitle}>연락처 정보</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.contactRow}
            onPress={handleCopyEmail}
          >
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>이메일</Text>
              <Text style={styles.contactValue}>{employee?.email}</Text>
            </View>
            <View style={styles.contactAction}>
              <Text>📋</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.contactRow, styles.contactRowLast]}
            onPress={handleCall}
          >
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>연락처</Text>
              <Text style={styles.contactValue}>{employee?.phone}</Text>
            </View>
            <View style={styles.contactAction}>
              <Text>📞</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Wage Section */}
        <Animated.View
          style={styles.sectionCard}
          entering={FadeInDown.delay(300).duration(400).springify()}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderIcon}>💰</Text>
            <Text style={styles.sectionHeaderTitle}>급여 설정</Text>
          </View>
          
          <View style={styles.wageInputContainer}>
            <Text style={styles.wageLabel}>시급</Text>
            <View style={styles.wageInputWrapper}>
              <Text style={styles.wagePrefix}>₩</Text>
              <TextInput
                style={styles.wageInput}
                value={formatCurrency(newHourlyWage)}
                onChangeText={(text) => setNewHourlyWage(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="시급을 입력하세요"
              />
            </View>
            
            {showMinWageWarning && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>
                  2025년 최저시급: ₩{MIN_WAGE_2025.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
          
          <PrimaryButton
            label="시급 저장"
            onPress={handleSaveWage}
            disabled={!hasChanges || isSaving}
            loading={isSaving}
          />
        </Animated.View>
        
        {/* Work Summary */}
        <Animated.View
          style={styles.sectionCard}
          entering={FadeInDown.delay(400).duration(400).springify()}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderIcon}>📊</Text>
            <Text style={styles.sectionHeaderTitle}>
              {new Date().getMonth() + 1}월 근무 현황
            </Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>근무일</Text>
              <Text style={styles.statValue}>{monthlySummary?.workDays}일</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>총 근무시간</Text>
              <Text style={styles.statValue}>{monthlySummary?.totalHours}시간</Text>
            </View>
          </View>
          
          <View style={styles.salaryCard}>
            <View style={styles.salaryLabel}>
              <Text style={styles.salaryLabelIcon}>💵</Text>
              <Text style={styles.salaryLabelText}>예상 급여</Text>
            </View>
            <Text style={styles.salaryValue}>
              ₩{monthlySummary?.expectedSalary.toLocaleString()}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.detailButtonIcon}>📋</Text>
            <Text style={styles.detailButtonText}>상세 근무 기록 보기</Text>
            <Icon name="chevron-right" size={ms(16)} color={colors.textTertiary} />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Account Management */}
        <Animated.View
          style={styles.sectionCard}
          entering={FadeInDown.delay(500).duration(400).springify()}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderIcon}>⚙️</Text>
            <Text style={styles.sectionHeaderTitle}>계정 관리</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={() => setShowDeactivateModal(true)}
          >
            <Text style={styles.dangerButtonIcon}>🚫</Text>
            <Text style={styles.dangerButtonText}>계정 비활성화</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      
      {/* Deactivate Modal */}
      <Modal
        visible={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalIcon}>🚫</Text>
          <Text style={styles.modalTitle}>계정 비활성화</Text>
          <Text style={styles.modalMessage}>
            {employee?.name} 님의 계정을{'\n'}비활성화하시겠습니까?
          </Text>
          
          <View style={styles.modalWarning}>
            <Text style={styles.modalWarningText}>
              ⚠️ 비활성화된 계정은 로그인할 수 없습니다.
            </Text>
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalButtonCancel}
              onPress={() => setShowDeactivateModal(false)}
            >
              <Text style={styles.modalButtonCancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalButtonConfirm}
              onPress={handleDeactivate}
            >
              <Text style={styles.modalButtonConfirmText}>비활성화</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  
  // Profile Card
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space6,
    alignItems: 'center',
    marginBottom: spacing.space5,
    ...shadows.md,
  },
  avatarContainer: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(40),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.space4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    fontSize: ms(36),
  },
  name: {
    ...typography.displaySmall,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.space3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.space4,
    paddingVertical: spacing.space2,
    borderRadius: borderRadius.full,
    gap: spacing.space2,
  },
  statusBadgeWorking: {
    backgroundColor: colors.success50,
  },
  statusBadgeNotWorking: {
    backgroundColor: colors.neutral100,
  },
  statusDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
  },
  statusDotWorking: {
    backgroundColor: colors.success,
  },
  statusDotNotWorking: {
    backgroundColor: colors.neutral400,
  },
  statusText: {
    ...typography.labelMedium,
    fontWeight: '600',
  },
  statusTextWorking: {
    color: colors.success,
  },
  statusTextNotWorking: {
    color: colors.textSecondary,
  },
  
  // Section Card
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginBottom: spacing.space5,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space4,
    paddingBottom: spacing.space3,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  sectionHeaderIcon: {
    fontSize: ms(20),
    marginRight: spacing.space2,
  },
  sectionHeaderTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  // Contact
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral50,
  },
  contactRowLast: {
    borderBottomWidth: 0,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.space1,
  },
  contactValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  contactAction: {
    width: ms(40),
    height: ms(40),
    borderRadius: borderRadius.md,
    backgroundColor: colors.brand50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Wage
  wageInputContainer: {
    marginBottom: spacing.space4,
  },
  wageLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  wageInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral200,
    paddingHorizontal: spacing.space4,
    height: ms(52),
  },
  wagePrefix: {
    ...typography.titleMedium,
    color: colors.textSecondary,
    marginRight: spacing.space1,
  },
  wageInput: {
    flex: 1,
    ...typography.titleMedium,
    color: colors.textPrimary,
    padding: 0,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.space2,
    padding: spacing.space3,
    backgroundColor: colors.warning50,
    borderRadius: borderRadius.md,
  },
  warningIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning700,
  },
  
  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.space4,
    marginBottom: spacing.space4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space4,
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.lg,
  },
  statLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.space2,
  },
  statValue: {
    ...typography.titleLarge,
    color: colors.brand500,
    fontWeight: '700',
  },
  salaryCard: {
    backgroundColor: colors.brand50,
    borderRadius: borderRadius.lg,
    padding: spacing.space4,
    alignItems: 'center',
    marginBottom: spacing.space4,
  },
  salaryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space2,
  },
  salaryLabelIcon: {
    fontSize: ms(16),
    marginRight: spacing.space1,
  },
  salaryLabelText: {
    ...typography.labelMedium,
    color: colors.brand600,
  },
  salaryValue: {
    ...typography.displaySmall,
    color: colors.brand600,
    fontWeight: '700',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.space3,
    backgroundColor: colors.neutral50,
    borderRadius: borderRadius.md,
  },
  detailButtonIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  detailButtonText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  
  // Danger
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.space4,
    backgroundColor: colors.error50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error100,
  },
  dangerButtonIcon: {
    fontSize: ms(18),
    marginRight: spacing.space2,
  },
  dangerButtonText: {
    ...typography.titleSmall,
    color: colors.error,
    fontWeight: '600',
  },
  
  // Modal
  modalContent: {
    alignItems: 'center',
    padding: spacing.space6,
  },
  modalIcon: {
    fontSize: ms(48),
    marginBottom: spacing.space4,
  },
  modalTitle: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.space3,
  },
  modalMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.space4,
  },
  modalWarning: {
    backgroundColor: colors.warning50,
    borderRadius: borderRadius.md,
    padding: spacing.space3,
    marginBottom: spacing.space5,
    width: '100%',
  },
  modalWarningText: {
    ...typography.bodySmall,
    color: colors.warning700,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.space3,
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: spacing.space4,
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    ...typography.titleSmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: spacing.space4,
    backgroundColor: colors.error,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    ...typography.titleSmall,
    color: colors.white,
    fontWeight: '600',
  },
});
```

---

## 에러 처리

```typescript
const errorHandling = {
  // 데이터 로딩 실패
  loadError: {
    title: '직원 정보를 불러올 수 없습니다',
    message: '네트워크 연결을 확인해주세요',
    action: 'retry',
  },
  
  // 시급 저장 실패
  saveError: {
    title: '저장에 실패했습니다',
    message: '잠시 후 다시 시도해주세요',
    action: 'retry',
  },
  
  // 계정 비활성화 실패
  deactivateError: {
    title: '비활성화에 실패했습니다',
    message: '잠시 후 다시 시도해주세요',
    action: 'retry',
  },
  
  // 유효성 검사
  validation: {
    invalidWage: {
      message: '올바른 시급을 입력해주세요',
    },
    minWage: {
      message: '최저시급 이상으로 입력해주세요',
    },
  },
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  // 메모이제이션
  memoizedComponents: [
    'ProfileCard',
    'ContactRow',
    'StatItem',
  ],
  
  // 계산 최적화
  useMemo: [
    'showMinWageWarning',
    'hasChanges',
    'statusStyle',
    'formattedSalary',
  ],
  
  // 이미지 최적화
  imageOptimization: {
    avatarSize: { width: 160, height: 160 }, // 2x for retina
    caching: 'disk',
    placeholder: 'shimmer',
  },
  
  // 입력 디바운스
  inputDebounce: {
    wageInput: 300, // 300ms
  },
};
```
