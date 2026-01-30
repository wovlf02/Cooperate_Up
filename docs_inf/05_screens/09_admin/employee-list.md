# 근무자 목록 화면 (EmployeeListScreen)

> **Production Ready v2.0** - 프로덕션 수준의 UX/UI 명세

## 개요

관리자가 전체 근무자를 관리하는 화면입니다.

### 🎯 UX 목표
- **한눈에 파악**: 전체 인원과 현재 출근 현황을 즉시 확인
- **빠른 접근**: 근무자 카드 탭으로 상세 정보에 빠르게 접근
- **실시간 상태**: 근무자별 실시간 근무 상태 시각화

---

## 레이아웃

```
┌─────────────────────────────────────────┐
│ StatusBar                               │
├─────────────────────────────────────────┤
│ Header                                  │
│ ┌─────────────────────────────────────┐ │
│ │ ←   근무자 관리               [+]  │ │
│ │                            초대버튼 │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                                         │
│  Summary Card (요약 카드)               │
│ ┌─────────────────────────────────────┐ │
│ │  ┌──────────────┬──────────────┐    │ │
│ │  │    전체      │   현재 출근   │    │ │
│ │  │    👥 5명    │    🟢 3명    │    │ │
│ │  │   neutral    │   success    │    │ │
│ │  └──────────────┴──────────────┘    │ │
│ │                                     │ │
│ │  backgroundColor: white             │ │
│ │  borderRadius: borderRadius.xl      │ │
│ │  shadows.md                         │ │
│ └─────────────────────────────────────┘ │
│  marginBottom: spacing.space5          │
│                                         │
│  근무자 목록 (FlatList)                 │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ┌────┐ 김철수          🟢  │    │ │
│ │  │ │ 👤 │ ₩10,500/시간        │    │ │
│ │  │ │    │ 근무중 09:00~       │    │ │
│ │  │ └────┘                   > │    │ │
│ │  │ shadows.sm                  │    │ │
│ │  └─────────────────────────────┘    │ │
│ │  gap: spacing.space3                │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ┌────┐ 박영희          🟢  │    │ │
│ │  │ │ 👤 │ ₩10,030/시간        │    │ │
│ │  │ │    │ 근무중 08:30~       │    │ │
│ │  │ └────┘                   > │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ │  ┌─────────────────────────────┐    │ │
│ │  │ ┌────┐ 이민수          ⚪  │    │ │
│ │  │ │ 👤 │ ₩10,030/시간        │    │ │
│ │  │ │    │ 미출근              │    │ │
│ │  │ └────┘                   > │    │ │
│ │  └─────────────────────────────┘    │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ BottomTabBar                            │
└─────────────────────────────────────────┘
```

---

## 컴포넌트 스타일

### 1. Summary Card

```typescript
const summaryCardStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.space4,
    marginBottom: spacing.space5,
    ...shadows.md,
  },
  
  statsRow: {
    flexDirection: 'row',
    gap: spacing.space3,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space4,
    borderRadius: borderRadius.lg,
  },
  
  statItemTotal: {
    backgroundColor: colors.neutral50,
  },
  
  statItemActive: {
    backgroundColor: colors.success50,
  },
  
  statLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2,
  },
  
  statIcon: {
    fontSize: ms(20),
  },
  
  statValue: {
    ...typography.displaySmall,
    fontWeight: '700',
  },
  
  statValueTotal: {
    color: colors.textPrimary,
  },
  
  statValueActive: {
    color: colors.success,
  },
};
```

### 2. Employee List Item

```typescript
const employeeItemStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space4,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: layout.screenPadding,
    ...shadows.sm,
  },
  
  avatarContainer: {
    width: ms(52),
    height: ms(52),
    borderRadius: ms(26),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space4,
    overflow: 'hidden',
  },
  
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  
  avatarPlaceholder: {
    fontSize: ms(24),
  },
  
  infoContainer: {
    flex: 1,
  },
  
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space1,
  },
  
  name: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  wageText: {
    ...typography.bodyMedium,
    color: colors.brand500,
    fontWeight: '500',
    marginBottom: spacing.space1,
  },
  
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2,
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
  
  statusDotCheckedOut: {
    backgroundColor: colors.info,
  },
  
  statusText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  
  chevron: {
    color: colors.neutral300,
    marginLeft: spacing.space2,
  },
};
```

### 3. 빈 상태

```typescript
const emptyStateStyles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.space10,
  },
  
  icon: {
    fontSize: ms(64),
    marginBottom: spacing.space4,
  },
  
  title: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space2,
    textAlign: 'center',
  },
  
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.space6,
  },
  
  button: {
    minWidth: wp(60),
  },
};
```

---

## 상태 표시

| 상태 | 아이콘 | 색상 | 텍스트 |
|------|--------|------|--------|
| 근무중 | 🟢 | success | 근무중 (HH:mm~) |
| 미출근 | ⚪ | neutral400 | 미출근 |
| 퇴근완료 | 🔵 | info | 퇴근 (HH:mm~HH:mm) |

---

## 애니메이션

### 화면 진입

```typescript
const screenAnimations = {
  summaryCard: {
    entering: FadeInDown.delay(100).duration(400).springify(),
  },
  
  listItem: (index: number) => ({
    entering: FadeInUp.delay(200 + index * 50).duration(400).springify(),
  }),
};
```

### 카드 상호작용

```typescript
const cardAnimations = {
  press: {
    scale: withSpring(0.98, { damping: 15, stiffness: 200 }),
    backgroundColor: colors.neutral50,
  },
  
  release: {
    scale: withSpring(1, { damping: 10, stiffness: 150 }),
    backgroundColor: colors.white,
  },
};
```

### Pull to Refresh

```typescript
const refreshAnimations = {
  pull: {
    rotate: withSpring('360deg', { damping: 15 }),
  },
  
  release: {
    opacity: withTiming(0, { duration: 200 }),
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  header: {
    accessibilityRole: 'header',
    accessibilityLabel: '근무자 관리',
  },
  
  summaryCard: {
    accessibilityRole: 'summary',
    accessibilityLabel: (total, active) => 
      `전체 ${total}명 중 ${active}명이 현재 출근 중입니다`,
  },
  
  employeeCard: {
    accessibilityRole: 'button',
    accessibilityLabel: (name, status, wage) => 
      `${name}, ${status}, 시급 ${wage}원`,
    accessibilityHint: '두 번 탭하여 상세 정보 보기',
  },
  
  inviteButton: {
    accessibilityRole: 'button',
    accessibilityLabel: '직원 초대하기',
  },
  
  emptyState: {
    accessibilityRole: 'text',
    accessibilityLabel: '등록된 근무자가 없습니다. 직원 초대 버튼을 눌러 초대해보세요',
  },
};
```

---

## 상태 관리

```typescript
interface EmployeeListState {
  // 요약
  summary: {
    total: number;
    checkedIn: number;
  };
  
  // 근무자 목록
  employees: {
    id: string;
    name: string;
    profileImage: string | null;
    hourlyWage: number;
    status: 'working' | 'not_checked_in' | 'checked_out';
    checkInTime: Date | null;
    checkOutTime: Date | null;
  }[];
  
  // UI 상태
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}
```

---

## 전체 코드 예시

```typescript
// screens/Admin/EmployeeListScreen.tsx

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/Button';

import { useEmployees } from '@/hooks/useEmployees';
import { colors, typography, shadows, borderRadius, spacing, layout } from '@/styles/theme';
import { hp, wp, ms, fs } from '@/utils/responsive';
import { formatTime } from '@/utils/date';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const EmployeeListScreen: React.FC = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { 
    employees, 
    summary, 
    isLoading, 
    isRefreshing,
    refresh,
  } = useEmployees();

  // 상세 화면 이동
  const handleEmployeePress = useCallback((employeeId: string) => {
    navigation.navigate('EmployeeDetail', { employeeId });
  }, [navigation]);

  // 초대 화면 이동
  const handleInvitePress = useCallback(() => {
    navigation.navigate('EmployeeInvite');
  }, [navigation]);

  // 상태 텍스트
  const getStatusText = (employee) => {
    switch (employee.status) {
      case 'working':
        return `근무중 ${formatTime(employee.checkInTime)}~`;
      case 'checked_out':
        return `퇴근 ${formatTime(employee.checkInTime)}~${formatTime(employee.checkOutTime)}`;
      default:
        return '미출근';
    }
  };

  // 상태 스타일
  const getStatusStyle = (status) => {
    switch (status) {
      case 'working':
        return styles.statusDotWorking;
      case 'checked_out':
        return styles.statusDotCheckedOut;
      default:
        return styles.statusDotNotWorking;
    }
  };

  // 근무자 카드 렌더링
  const renderEmployeeItem = useCallback(({ item, index }) => (
    <Animated.View
      entering={FadeInUp.delay(200 + index * 50).duration(400).springify()}
    >
      <TouchableOpacity
        style={styles.employeeCard}
        onPress={() => handleEmployeePress(item.id)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${getStatusText(item)}, 시급 ${item.hourlyWage.toLocaleString()}원`}
        accessibilityHint="두 번 탭하여 상세 정보 보기"
      >
        <View style={styles.avatarContainer}>
          {item.profileImage ? (
            <Image source={{ uri: item.profileImage }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarPlaceholder}>👤</Text>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.wageText}>
            ₩{item.hourlyWage.toLocaleString()}/시간
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, getStatusStyle(item.status)]} />
            <Text style={styles.statusText}>{getStatusText(item)}</Text>
          </View>
        </View>
        
        <Icon name="chevron-right" size={ms(20)} style={styles.chevron} />
      </TouchableOpacity>
    </Animated.View>
  ), [handleEmployeePress]);

  // 빈 상태
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>등록된 근무자가 없습니다</Text>
      <Text style={styles.emptyMessage}>
        직원을 초대하여 근무 관리를{'\n'}시작해보세요
      </Text>
      <PrimaryButton
        label="직원 초대하기"
        onPress={handleInvitePress}
        style={styles.emptyButton}
      />
    </View>
  );

  // 요약 카드
  const renderHeader = () => (
    <Animated.View
      style={styles.summaryCard}
      entering={FadeInDown.delay(100).duration(400).springify()}
    >
      <View style={styles.statsRow}>
        <View style={[styles.statItem, styles.statItemTotal]}>
          <Text style={styles.statLabel}>전체</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={[styles.statValue, styles.statValueTotal]}>
              {summary.total}명
            </Text>
          </View>
        </View>
        
        <View style={[styles.statItem, styles.statItemActive]}>
          <Text style={styles.statLabel}>현재 출근</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statIcon}>🟢</Text>
            <Text style={[styles.statValue, styles.statValueActive]}>
              {summary.checkedIn}명
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="근무자 관리" 
        showBack
        rightIcon="plus"
        onRightPress={handleInvitePress}
      />
      
      <FlatList
        data={employees}
        renderItem={renderEmployeeItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading && renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + hp(4) }
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.brand500}
            colors={[colors.brand500]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  listContent: {
    paddingBottom: spacing.space4,
  },
  separator: {
    height: spacing.space3,
  },
  
  // Summary Card
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space5,
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.space4,
    marginBottom: spacing.space5,
    ...shadows.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.space3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.space4,
    borderRadius: borderRadius.lg,
  },
  statItemTotal: {
    backgroundColor: colors.neutral50,
  },
  statItemActive: {
    backgroundColor: colors.success50,
  },
  statLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.space2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2,
  },
  statIcon: {
    fontSize: ms(20),
  },
  statValue: {
    ...typography.displaySmall,
    fontWeight: '700',
  },
  statValueTotal: {
    color: colors.textPrimary,
  },
  statValueActive: {
    color: colors.success,
  },
  
  // Employee Card
  employeeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space4,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: layout.screenPadding,
    ...shadows.sm,
  },
  avatarContainer: {
    width: ms(52),
    height: ms(52),
    borderRadius: ms(26),
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    fontSize: ms(24),
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space1,
  },
  wageText: {
    ...typography.bodyMedium,
    color: colors.brand500,
    fontWeight: '500',
    marginBottom: spacing.space1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2,
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
  statusDotCheckedOut: {
    backgroundColor: colors.info,
  },
  statusText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  chevron: {
    color: colors.neutral300,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.space10,
  },
  emptyIcon: {
    fontSize: ms(64),
    marginBottom: spacing.space4,
  },
  emptyTitle: {
    ...typography.titleLarge,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.space2,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.space6,
  },
  emptyButton: {
    minWidth: wp(60),
  },
});
```

---

## 에러 처리

```typescript
const errorHandling = {
  // 데이터 로딩 실패
  loadError: {
    title: '근무자 목록을 불러올 수 없습니다',
    message: '네트워크 연결을 확인해주세요',
    action: 'retry',
  },
  
  // 새로고침 실패
  refreshError: {
    type: 'toast',
    message: '새로고침에 실패했습니다',
  },
};
```

---

## 성능 최적화

```typescript
const performanceOptimizations = {
  // FlatList 최적화
  flatListConfig: {
    initialNumToRender: 10,
    maxToRenderPerBatch: 5,
    windowSize: 5,
    removeClippedSubviews: true,
    getItemLayout: (data, index) => ({
      length: ms(80),
      offset: ms(80) * index,
      index,
    }),
  },
  
  // 메모이제이션
  memoizedComponents: [
    'EmployeeCard',
    'SummaryCard',
  ],
  
  // 이미지 최적화
  imageOptimization: {
    avatarSize: { width: 104, height: 104 },
    caching: 'disk',
    placeholder: 'shimmer',
  },
};
```
