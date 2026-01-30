# 체크리스트 화면 (Worker - ChecklistScreen) - Production Ready v2.0

## 개요

근무자가 본인에게 할당된 시간대별 업무를 체크하는 화면입니다.
관리자가 할당한 체크리스트만 표시되며, 본인의 진행률을 실시간으로 확인할 수 있습니다.

토스, 리멤버 등의 할 일 목록 UX를 참고하여 직관적이고 세련된 디자인을 제공합니다.

---

## 🎨 디자인 원칙

### UX 목표

- **한눈에 파악**: 전체 진행률과 남은 업무를 즉시 인지
- **원탭 체크**: 체크박스를 한 번의 터치로 완료
- **시각적 피드백**: 완료 시 만족스러운 애니메이션과 햅틱
- **시간대별 분류**: 현재 시간대 업무 강조

---

## 레이아웃

```
┌───────────────────────────────────────────────────────────┐
│ StatusBar (dark-content)                                  │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Header                                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ←             체크리스트                            │ │
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
│  │  Progress Card (Hero)                               │  │
│  │                                                     │  │
│  │     ┌───────────────────────────────────────────┐   │  │
│  │     │                                           │   │  │
│  │     │          🎯 오늘의 진행률                 │   │  │
│  │     │                                           │   │  │
│  │     │              68%                          │   │  │
│  │     │          displayLarge (48px)              │   │  │
│  │     │          brand500, fontWeight: 700        │   │  │
│  │     │          ⚡ Animated count up               │   │  │
│  │     │                                           │   │  │
│  │     │      ┌─────────────────────────────┐      │   │  │
│  │     │      │█████████████████░░░░░░░░░░░│      │   │  │
│  │     │      │ progressBar, height: 8px   │      │   │  │
│  │     │      │ borderRadius: 4px          │      │   │  │
│  │     │      │ ⚡ Animated progress         │      │   │  │
│  │     │      └─────────────────────────────┘      │   │  │
│  │     │                                           │   │  │
│  │     │          15 / 22 항목 완료                │   │  │
│  │     │          bodyMedium, textSecondary        │   │  │
│  │     │                                           │   │  │
│  │     └───────────────────────────────────────────┘   │  │
│  │                                                     │  │
│  │  backgroundColor: white                             │  │
│  │  borderRadius: xl                                   │  │
│  │  padding: space6                                    │  │
│  │  ⚡ Shadow md                                        │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space4                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  Time Slot Tabs (Horizontal Scroll)                 │  │
│  │                                                     │  │
│  │  ← 20시  21시  [22시]  23시  00시  01시  02시 →     │  │
│  │                 현재                                │  │
│  │                                                     │  │
│  │  완료된 슬롯: success100 bg, ✓ 아이콘              │  │
│  │  현재 슬롯: brand500 bg, white text                │  │
│  │  미래 슬롯: neutral100 bg                          │  │
│  │                                                     │  │
│  │  snapToInterval: 슬롯 너비 + gap                   │  │
│  │  showsHorizontalScrollIndicator: false             │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  marginTop: space4                                        │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  Time Slot Header                                   │  │
│  │                                                     │  │
│  │  🕐 22시 업무                           3/4 완료   │  │
│  │     titleMedium, fontWeight: 600       success      │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  Checklist Item (Completed)                         │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  ☑️  매장 내부 청소                        │    │  │
│  │  │      titleSmall, strikethrough, textTertiary│    │  │
│  │  │                                             │    │  │
│  │  │      ✓ 22:15 완료                          │    │  │
│  │  │        captionMedium, success               │    │  │
│  │  │                                             │    │  │
│  │  │  height: 72px                               │    │  │
│  │  │  backgroundColor: success50                 │    │  │
│  │  │  borderRadius: lg                           │    │  │
│  │  │  borderLeftWidth: 4, borderLeftColor: success│   │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                                                     │  │
│  │  Checklist Item (Incomplete)                        │  │
│  │                                                     │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │                                             │    │  │
│  │  │  ⬜  음료 재료 보충                        │    │  │
│  │  │      titleSmall, textPrimary                │    │  │
│  │  │                                             │    │  │
│  │  │      미완료                                 │    │  │
│  │  │      captionMedium, textTertiary            │    │  │
│  │  │                                             │    │  │
│  │  │  height: 72px                               │    │  │
│  │  │  backgroundColor: white                     │    │  │
│  │  │  borderRadius: lg                           │    │  │
│  │  │  borderWidth: 1, borderColor: neutral200   │    │  │
│  │  │  ⚡ Press scale animation                    │    │  │
│  │  │                                             │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
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

### 1. Progress Card

```typescript
const progressCardStyles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space6,
    alignItems: 'center',
    ...shadows.md,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space4,
  },
  
  headerIcon: {
    fontSize: ms(20),
    marginRight: spacing.space2,
  },
  
  headerTitle: {
    ...typography.titleMedium,
    color: colors.textSecondary,
  },
  
  percentage: {
    fontSize: fs(48),
    fontWeight: '700',
    color: colors.brand500,
    marginBottom: spacing.space4,
  },
  
  progressBar: {
    width: '100%',
    height: ms(8),
    backgroundColor: colors.neutral200,
    borderRadius: ms(4),
    overflow: 'hidden',
    marginBottom: spacing.space3,
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand500,
    borderRadius: ms(4),
  },
  
  // 진행률별 색상
  progressColors: {
    low: colors.warning, // < 50%
    medium: colors.brand500, // 50-89%
    high: colors.success, // >= 90%
  },
  
  countText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  
  countHighlight: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
};
```

### 2. Time Slot Tabs

```typescript
const timeSlotTabsStyles = {
  container: {
    marginTop: spacing.space4,
  },
  
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.space2,
  },
  
  tab: {
    paddingHorizontal: spacing.space4,
    paddingVertical: spacing.space3,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: ms(72),
  },
  
  // 상태별 스타일
  tabCurrent: {
    backgroundColor: colors.brand500,
  },
  
  tabCompleted: {
    backgroundColor: colors.success100,
  },
  
  tabIncomplete: {
    backgroundColor: colors.neutral100,
  },
  
  tabFuture: {
    backgroundColor: colors.neutral50,
  },
  
  tabText: {
    ...typography.labelMedium,
    fontWeight: '600',
  },
  
  tabTextCurrent: {
    color: colors.white,
  },
  
  tabTextCompleted: {
    color: colors.success,
  },
  
  tabTextIncomplete: {
    color: colors.textPrimary,
  },
  
  tabTextFuture: {
    color: colors.neutral400,
  },
  
  // 완료 체크 아이콘
  completedIcon: {
    size: ms(14),
    color: colors.success,
    marginRight: spacing.space1,
  },
  
  // 현재 시간대로 자동 스크롤
  autoScroll: {
    animated: true,
    offset: -layout.screenPadding,
  },
};
```

### 3. Checklist Item

```typescript
const checklistItemStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.space4,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.space2,
    minHeight: ms(72),
  },
  
  // 미완료
  containerIncomplete: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  
  // 완료
  containerCompleted: {
    backgroundColor: colors.success50,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  
  // 체크박스
  checkbox: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space3,
  },
  
  checkboxIncomplete: {
    borderWidth: 2,
    borderColor: colors.neutral300,
    backgroundColor: colors.white,
  },
  
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderWidth: 0,
  },
  
  checkIcon: {
    size: ms(16),
    color: colors.white,
  },
  
  // 텍스트
  content: {
    flex: 1,
  },
  
  title: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  
  titleCompleted: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  
  subtitle: {
    ...typography.captionMedium,
    color: colors.textTertiary,
    marginTop: spacing.space1,
  },
  
  completedTime: {
    color: colors.success,
  },
  
  // 프레스 애니메이션
  pressAnimation: {
    scale: { to: 0.98 },
    duration: 100,
  },
};
```

### 4. Time Slot Header

```typescript
const timeSlotHeaderStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.space4,
    marginBottom: spacing.space3,
    paddingHorizontal: spacing.space1,
  },
  
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  icon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  
  title: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  count: {
    ...typography.labelMedium,
    color: colors.success,
    fontWeight: '600',
  },
  
  countIncomplete: {
    color: colors.warning,
  },
};
```

---

## 애니메이션

### 체크 애니메이션

```typescript
const checkAnimation = {
  // 체크박스 체크
  checkbox: {
    scale: {
      from: 1,
      to: 1.2,
      to: 1,
      duration: 200,
      spring: { damping: 10, stiffness: 200 },
    },
    backgroundColor: {
      duration: 150,
    },
  },
  
  // 체크 아이콘
  checkIcon: {
    scale: { from: 0, to: 1 },
    opacity: { from: 0, to: 1 },
    duration: 200,
    delay: 50,
  },
  
  // 텍스트 취소선
  strikethrough: {
    width: { from: '0%', to: '100%' },
    duration: 300,
  },
  
  // 햅틱
  haptic: 'medium',
};
```

### 진행률 카운트업

```typescript
const progressAnimation = {
  countUp: {
    from: 0,
    to: percentage,
    duration: 1000,
    easing: 'easeOut',
  },
  
  progressBar: {
    width: { from: '0%', to: `${percentage}%` },
    duration: 800,
    delay: 200,
    easing: 'easeOut',
  },
  
  // 색상 전환
  colorChange: {
    duration: 300,
  },
};
```

### 아이템 완료

```typescript
const itemCompletionAnimation = {
  // 배경색 전환
  background: {
    backgroundColor: {
      from: colors.white,
      to: colors.success50,
      duration: 300,
    },
  },
  
  // 아이템 순서 변경 (완료 항목 아래로)
  reorder: {
    translateY: { duration: 300 },
    opacity: { from: 0.5, to: 1, duration: 200 },
  },
};
```

---

## 접근성

```typescript
const accessibility = {
  progressCard: {
    accessibilityRole: 'progressbar',
    accessibilityLabel: (percent, completed, total) =>
      `오늘의 진행률 ${percent}%, ${total}개 중 ${completed}개 완료`,
    accessibilityValue: {
      min: 0,
      max: 100,
      now: percentage,
    },
  },
  
  timeSlotTab: {
    accessibilityRole: 'tab',
    accessibilityLabel: (time, status) =>
      `${time} 업무, ${status}`,
    accessibilityState: {
      selected: isCurrent,
    },
  },
  
  checklistItem: {
    accessibilityRole: 'checkbox',
    accessibilityLabel: (title, completed) =>
      `${title}, ${completed ? '완료됨' : '미완료'}`,
    accessibilityHint: '두 번 탭하여 상태 변경',
    accessibilityState: {
      checked: isCompleted,
    },
  },
  
  timeSlotHeader: {
    accessibilityRole: 'header',
    accessibilityLabel: (time, completed, total) =>
      `${time} 업무, ${total}개 중 ${completed}개 완료`,
  },
};
```

---

## 상태 관리

```typescript
interface ChecklistState {
  // 시간대별 체크리스트
  timeSlots: Map<string, TimeSlot>; // key: 'HH:00'
  
  // 현재 선택된 시간대
  selectedTimeSlot: string;
  
  // 전체 진행률
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  
  // UI 상태
  isLoading: boolean;
  isChecking: string | null; // 현재 체크 중인 항목 ID
}

interface TimeSlot {
  time: string;
  items: ChecklistItem[];
  completed: number;
  total: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isFuture: boolean;
}

interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt: Date | null;
  order: number;
}
```

---

## 전체 코드 예시

```typescript
// screens/Checklist/ChecklistScreen.tsx

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/Header';
import { Icon } from '@/components/Icon';

import { useChecklist } from '@/hooks/useChecklist';
import { colors, typography, shadows, borderRadius, spacing, layout } from '@/styles/theme';
import { hp, wp, ms, fs } from '@/utils/responsive';

export const ChecklistScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const {
    timeSlots,
    selectedTimeSlot,
    setSelectedTimeSlot,
    progress,
    toggleItem,
    isLoading,
  } = useChecklist();
  
  // 진행률 애니메이션
  const progressAnim = useSharedValue(0);
  
  useEffect(() => {
    progressAnim.value = withTiming(progress.percentage, { duration: 800 });
  }, [progress.percentage]);
  
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }));
  
  const handleTimeSlotPress = (time: string) => {
    setSelectedTimeSlot(time);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handleItemToggle = async (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleItem(itemId);
  };
  
  const getProgressColor = () => {
    if (progress.percentage >= 90) return colors.success;
    if (progress.percentage >= 50) return colors.brand500;
    return colors.warning;
  };
  
  const currentSlot = timeSlots.get(selectedTimeSlot);
  
  return (
    <View style={styles.container}>
      <Header title="체크리스트" showBack />
      
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + hp(10) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Card */}
        <Animated.View
          style={styles.progressCard}
          entering={FadeInDown.delay(100).duration(400).springify()}
        >
          <View style={styles.progressHeader}>
            <Text style={styles.progressHeaderIcon}>🎯</Text>
            <Text style={styles.progressHeaderTitle}>오늘의 진행률</Text>
          </View>
          
          <Text style={[styles.progressPercentage, { color: getProgressColor() }]}>
            {Math.round(progress.percentage)}%
          </Text>
          
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: getProgressColor() },
                progressBarStyle,
              ]}
            />
          </View>
          
          <Text style={styles.progressCount}>
            <Text style={styles.progressCountHighlight}>{progress.completed}</Text>
            {' / '}
            {progress.total} 항목 완료
          </Text>
        </Animated.View>
        
        {/* Time Slot Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeSlotsContainer}
          style={styles.timeSlotsScroll}
        >
          {Array.from(timeSlots.entries()).map(([time, slot]) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlotTab,
                slot.isCurrent && styles.timeSlotTabCurrent,
                slot.isCompleted && !slot.isCurrent && styles.timeSlotTabCompleted,
                !slot.isCompleted && !slot.isCurrent && !slot.isFuture && styles.timeSlotTabIncomplete,
                slot.isFuture && styles.timeSlotTabFuture,
                selectedTimeSlot === time && !slot.isCurrent && styles.timeSlotTabSelected,
              ]}
              onPress={() => handleTimeSlotPress(time)}
            >
              {slot.isCompleted && (
                <Icon name="check" size={ms(14)} color={colors.success} style={styles.completedIcon} />
              )}
              <Text style={[
                styles.timeSlotText,
                slot.isCurrent && styles.timeSlotTextCurrent,
                slot.isCompleted && !slot.isCurrent && styles.timeSlotTextCompleted,
                !slot.isCompleted && !slot.isCurrent && !slot.isFuture && styles.timeSlotTextIncomplete,
                slot.isFuture && styles.timeSlotTextFuture,
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Time Slot Header */}
        {currentSlot && (
          <View style={styles.timeSlotHeader}>
            <View style={styles.timeSlotHeaderLeft}>
              <Text style={styles.timeSlotHeaderIcon}>🕐</Text>
              <Text style={styles.timeSlotHeaderTitle}>{selectedTimeSlot} 업무</Text>
            </View>
            <Text style={[
              styles.timeSlotHeaderCount,
              currentSlot.completed < currentSlot.total && styles.timeSlotHeaderCountIncomplete,
            ]}>
              {currentSlot.completed}/{currentSlot.total} 완료
            </Text>
          </View>
        )}
        
        {/* Checklist Items */}
        {currentSlot?.items.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(index * 50).duration(300)}
          >
            <TouchableOpacity
              style={[
                styles.checklistItem,
                item.isCompleted ? styles.checklistItemCompleted : styles.checklistItemIncomplete,
              ]}
              onPress={() => handleItemToggle(item.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                item.isCompleted ? styles.checkboxCompleted : styles.checkboxIncomplete,
              ]}>
                {item.isCompleted && (
                  <Icon name="check" size={ms(16)} color={colors.white} />
                )}
              </View>
              
              <View style={styles.checklistContent}>
                <Text style={[
                  styles.checklistTitle,
                  item.isCompleted && styles.checklistTitleCompleted,
                ]}>
                  {item.title}
                </Text>
                <Text style={[
                  styles.checklistSubtitle,
                  item.isCompleted && styles.checklistSubtitleCompleted,
                ]}>
                  {item.isCompleted && item.completedAt
                    ? `✓ ${formatTime(item.completedAt)} 완료`
                    : '미완료'
                  }
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
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
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.space6,
    alignItems: 'center',
    ...shadows.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.space4,
  },
  progressHeaderIcon: {
    fontSize: ms(20),
    marginRight: spacing.space2,
  },
  progressHeaderTitle: {
    ...typography.titleMedium,
    color: colors.textSecondary,
  },
  progressPercentage: {
    fontSize: fs(48),
    fontWeight: '700',
    marginBottom: spacing.space4,
  },
  progressBar: {
    width: '100%',
    height: ms(8),
    backgroundColor: colors.neutral200,
    borderRadius: ms(4),
    overflow: 'hidden',
    marginBottom: spacing.space3,
  },
  progressFill: {
    height: '100%',
    borderRadius: ms(4),
  },
  progressCount: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  progressCountHighlight: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timeSlotsScroll: {
    marginTop: spacing.space4,
  },
  timeSlotsContainer: {
    paddingHorizontal: 0,
    gap: spacing.space2,
  },
  timeSlotTab: {
    flexDirection: 'row',
    paddingHorizontal: spacing.space4,
    paddingVertical: spacing.space3,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: ms(72),
  },
  timeSlotTabCurrent: {
    backgroundColor: colors.brand500,
  },
  timeSlotTabCompleted: {
    backgroundColor: colors.success100,
  },
  timeSlotTabIncomplete: {
    backgroundColor: colors.neutral100,
  },
  timeSlotTabFuture: {
    backgroundColor: colors.neutral50,
  },
  timeSlotTabSelected: {
    borderWidth: 2,
    borderColor: colors.brand500,
  },
  timeSlotText: {
    ...typography.labelMedium,
    fontWeight: '600',
  },
  timeSlotTextCurrent: {
    color: colors.white,
  },
  timeSlotTextCompleted: {
    color: colors.success,
  },
  timeSlotTextIncomplete: {
    color: colors.textPrimary,
  },
  timeSlotTextFuture: {
    color: colors.neutral400,
  },
  completedIcon: {
    marginRight: spacing.space1,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.space4,
    marginBottom: spacing.space3,
    paddingHorizontal: spacing.space1,
  },
  timeSlotHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotHeaderIcon: {
    fontSize: ms(16),
    marginRight: spacing.space2,
  },
  timeSlotHeaderTitle: {
    ...typography.titleMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  timeSlotHeaderCount: {
    ...typography.labelMedium,
    color: colors.success,
    fontWeight: '600',
  },
  timeSlotHeaderCountIncomplete: {
    color: colors.warning,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.space4,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.space2,
    minHeight: ms(72),
  },
  checklistItemIncomplete: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  checklistItemCompleted: {
    backgroundColor: colors.success50,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  checkbox: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.space3,
  },
  checkboxIncomplete: {
    borderWidth: 2,
    borderColor: colors.neutral300,
    backgroundColor: colors.white,
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderWidth: 0,
  },
  checklistContent: {
    flex: 1,
  },
  checklistTitle: {
    ...typography.titleSmall,
    color: colors.textPrimary,
  },
  checklistTitleCompleted: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  checklistSubtitle: {
    ...typography.captionMedium,
    color: colors.textTertiary,
    marginTop: spacing.space1,
  },
  checklistSubtitleCompleted: {
    color: colors.success,
  },
});
```

---

## 에러 처리

```typescript
const errorHandling = {
  // 체크 실패
  toggleError: {
    message: '체크 상태를 변경할 수 없습니다',
    action: 'retry',
  },
  
  // 데이터 로딩 실패
  loadError: {
    message: '체크리스트를 불러올 수 없습니다',
    action: 'retry',
  },
  
  // 빈 상태
  emptyStates: {
    noItems: {
      icon: '✅',
      title: '오늘 할당된 업무가 없습니다',
      subtitle: '관리자에게 문의해주세요',
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
    'ProgressCard',
    'TimeSlotTab',
    'ChecklistItem',
  ],
  
  // 배치 업데이트
  batchUpdates: {
    enabled: true,
    debounceMs: 100,
  },
  
  // 애니메이션 최적화
  animation: {
    useNativeDriver: true,
    skipOnLowMemory: true,
  },
  
  // 실시간 동기화
  realTimeSync: {
    enabled: true,
    optimisticUpdate: true, // 즉시 UI 업데이트 후 서버 동기화
  },
};
```
